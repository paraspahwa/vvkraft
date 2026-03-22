/**
 * BullMQ worker for processing video generation jobs.
 *
 * This file runs as a standalone Node.js process (separate from the Next.js app).
 * Start it with:  npm run worker  (from apps/web)
 *
 * Flow:
 *   1. Pick up a job from the `video-generation` BullMQ queue
 *   2. Submit the generation request to fal.ai with our webhook URL as callback
 *   3. Mark the Firestore generation as "queued" and store the fal request ID
 *   4. The webhook at /api/webhooks/fal handles the rest (processing → completed/failed)
 */

import { Worker, type Job } from "bullmq";
import { fal } from "@fal-ai/client";
import type { VideoGenerationJobData } from "../lib/queue";
import { QUEUE_NAMES } from "../lib/queue";
import { bullmqConnection } from "../lib/redis";
import { getGenerationById, updateGeneration, addCredits } from "../lib/db";
import { RESOLUTION_DIMENSIONS } from "../lib/fal";

// Fal.ai model-specific input builders
// Each model has slightly different parameter shapes.

interface FalKlingInput {
  prompt: string;
  negative_prompt?: string;
  duration?: number;
  aspect_ratio?: string;
  seed?: number;
  motion_strength?: number;
  image_url?: string;
}

interface FalWanInput {
  prompt: string;
  negative_prompt?: string;
  image_url?: string;
  num_frames?: number;
  fps?: number;
  width?: number;
  height?: number;
  aspect_ratio?: string;
  seed?: number;
  motion_strength?: number;
}

interface FalLongcatInput {
  prompt: string;
  negative_prompt?: string;
  num_frames?: number;
  fps?: number;
  width?: number;
  height?: number;
  seed?: number;
}

function buildFalInput(
  job: VideoGenerationJobData
): FalKlingInput | FalWanInput | FalLongcatInput {
  const dims = RESOLUTION_DIMENSIONS[job.resolution] ?? { width: 854, height: 480 };
  const fps = 24;
  const numFrames = job.durationSeconds * fps;

  switch (job.model) {
    case "fal-ai/kling-video/v3/pro/text-to-video":
    case "fal-ai/kling-video/v2.6/pro/text-to-video": {
      const input: FalKlingInput = {
        prompt: job.prompt,
        // Kling supports 5s or 10s durations
        duration: job.durationSeconds <= 5 ? 5 : 10,
        aspect_ratio: job.aspectRatio,
        seed: job.seed,
        motion_strength: job.motionStrength,
      };
      if (job.negativePrompt) input.negative_prompt = job.negativePrompt;
      if (job.referenceImageUrl) input.image_url = job.referenceImageUrl;
      return input;
    }

    case "fal-ai/wan/v2.2-a14b/image-to-video": {
      const input: FalWanInput = {
        prompt: job.prompt,
        num_frames: numFrames,
        fps,
        width: dims.width,
        height: dims.height,
        aspect_ratio: job.aspectRatio,
        seed: job.seed,
        motion_strength: job.motionStrength,
      };
      if (job.negativePrompt) input.negative_prompt = job.negativePrompt;
      if (job.referenceImageUrl) input.image_url = job.referenceImageUrl;
      return input;
    }

    // Free tier model: longcat
    case "fal-ai/longcat-video/distilled/text-to-video/480p":
    default: {
      const input: FalLongcatInput = {
        prompt: job.prompt,
        num_frames: numFrames,
        fps,
        width: 854,
        height: 480,
        seed: job.seed,
      };
      if (job.negativePrompt) input.negative_prompt = job.negativePrompt;
      return input;
    }
  }
}

async function processVideoGeneration(
  job: Job<VideoGenerationJobData>
): Promise<void> {
  const { generationId, userId, model } = job.data;

  console.log(`[worker] Processing generation ${generationId} — model: ${model}`);

  // Load the generation record from Firestore
  const generation = await getGenerationById(generationId);
  if (!generation) {
    throw new Error(`Generation ${generationId} not found in Firestore`);
  }

  // If already processed (e.g. duplicate job), skip
  if (!["pending", "queued"].includes(generation.status)) {
    console.log(
      `[worker] Generation ${generationId} already in status "${generation.status}", skipping`
    );
    return;
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const webhookSecret = process.env.FAL_WEBHOOK_SECRET;

  if (!webhookSecret) {
    throw new Error("FAL_WEBHOOK_SECRET env variable is not set");
  }

  // Build the webhook URL — fal.ai will POST to this when the job completes.
  const webhookUrl = `${appUrl}/api/webhooks/fal`;

  const falInput = buildFalInput(job.data);

  let falRequestId: string;

  try {
    // Submit the job to fal.ai — returns immediately with a request_id.
    // fal.ai will call our webhook when the job transitions state.
    const submitResult = await fal.queue.submit(model, {
      input: falInput,
      webhookUrl,
    });

    falRequestId = submitResult.request_id;

    console.log(
      `[worker] Submitted ${generationId} to fal.ai — request_id: ${falRequestId}`
    );
  } catch (err) {
    console.error(`[worker] fal.ai submission failed for ${generationId}:`, err);

    // Mark as failed and refund credits
    await updateGeneration(generationId, {
      status: "failed",
      errorMessage:
        err instanceof Error ? err.message : "Failed to submit to fal.ai",
      completedAt: new Date(),
    });

    await addCredits(
      userId,
      generation.creditsCost,
      "refund",
      `Refund for failed generation #${generationId.slice(0, 8)}`
    ).catch((refundErr: unknown) => {
      console.error(`[worker] Failed to refund credits for ${generationId}:`, refundErr);
    });

    throw err;
  }

  // Update the generation to "queued" with the fal request ID.
  // The webhook handler will advance status from here.
  await updateGeneration(generationId, {
    status: "queued",
    falRequestId,
  });

  console.log(`[worker] Generation ${generationId} queued on fal.ai ✓`);
}

/**
 * Create and start the BullMQ worker.
 * Returns the worker instance so callers can gracefully shut it down.
 */
export function createVideoGenerationWorker(): Worker<VideoGenerationJobData> {
  const worker = new Worker<VideoGenerationJobData>(
    QUEUE_NAMES.VIDEO_GENERATION,
    processVideoGeneration,
    {
      connection: bullmqConnection,
      concurrency: 5, // process up to 5 jobs simultaneously
      limiter: {
        // Rate-limit fal.ai submissions: max 10 per second
        max: 10,
        duration: 1000,
      },
    }
  );

  worker.on("completed", (job) => {
    console.log(`[worker] Job ${job.id} completed — generationId: ${job.data.generationId}`);
  });

  worker.on("failed", (job, err) => {
    console.error(
      `[worker] Job ${job?.id} failed (attempt ${job?.attemptsMade ?? "?"}):`,
      err.message
    );
  });

  worker.on("error", (err) => {
    console.error("[worker] Worker error:", err);
  });

  return worker;
}

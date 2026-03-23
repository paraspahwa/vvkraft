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

interface FalBasicInput {
  prompt: string;
  negative_prompt?: string;
  num_frames?: number;
  fps?: number;
  width?: number;
  height?: number;
  seed?: number;
  aspect_ratio?: string;
  motion_strength?: number;
  image_url?: string;
  duration?: number;
}

function buildFalInput(job: VideoGenerationJobData): FalBasicInput {
  const dims = RESOLUTION_DIMENSIONS[job.resolution] ?? { width: 1280, height: 720 };

  const base: FalBasicInput = { prompt: job.prompt };
  if (job.negativePrompt) base.negative_prompt = job.negativePrompt;
  if (job.seed) base.seed = job.seed;

  switch (job.model) {
    // ── Kling family (fixed duration, aspect-ratio based) ───────────────────
    case "fal-ai/kling-video/v3/pro/text-to-video":
    case "fal-ai/kling-video/v3/standard/text-to-video":
    case "fal-ai/kling-video/v2.6/pro/text-to-video":
    case "fal-ai/kling-video/o3/pro/text-to-video":
    case "fal-ai/kling-video/o3/standard/text-to-video":
      return {
        ...base,
        duration: job.durationSeconds <= 5 ? 5 : 10,
        aspect_ratio: job.aspectRatio,
        motion_strength: job.motionStrength,
        ...(job.referenceImageUrl ? { image_url: job.referenceImageUrl } : {}),
      };

    case "fal-ai/kling-video/v2.5-turbo/standard/image-to-video":
      return {
        ...base,
        duration: job.durationSeconds,
        aspect_ratio: job.aspectRatio,
        ...(job.referenceImageUrl ? { image_url: job.referenceImageUrl } : {}),
      };

    // ── WAN / Krea family (frame-based) ─────────────────────────────────────
    case "fal-ai/wan/v2.2-a14b/image-to-video":
    case "fal-ai/wan/v2.2-a14b/text-to-video": {
      const fps = 16;
      return {
        ...base,
        num_frames: job.durationSeconds * fps,
        fps,
        width: dims.width,
        height: dims.height,
        aspect_ratio: job.aspectRatio,
        motion_strength: job.motionStrength,
        ...(job.referenceImageUrl ? { image_url: job.referenceImageUrl } : {}),
      };
    }

    case "fal-ai/wan/v2.2-5b/text-to-video/distill":
    case "fal-ai/wan/v2.2-5b/text-to-video/fast-wan": {
      // Flat-rate, short-form; pass standard frames at 16 fps
      const fps = 16;
      return {
        ...base,
        num_frames: Math.min(job.durationSeconds, 5) * fps,
        fps,
        width: dims.width,
        height: dims.height,
      };
    }

    case "fal-ai/wan-25-preview/text-to-video":
    case "wan/v2.6/text-to-video": {
      const fps = 24;
      return {
        ...base,
        num_frames: job.durationSeconds * fps,
        fps,
        width: dims.width,
        height: dims.height,
      };
    }

    // ── Krea WAN 14B (16 fps) ────────────────────────────────────────────────
    case "fal-ai/krea-wan-14b/text-to-video": {
      const fps = 16;
      return {
        ...base,
        num_frames: job.durationSeconds * fps,
        fps,
        width: dims.width,
        height: dims.height,
      };
    }

    // ── LTXV / LTX family (24 fps) ───────────────────────────────────────────
    case "fal-ai/ltxv-13b-098-distilled":
    case "fal-ai/ltxv-13b-098-distilled/multiconditioning":
    case "fal-ai/ltx-2/text-to-video/fast":
    case "fal-ai/ltx-2.3/text-to-video/fast":
    case "fal-ai/ltx-2-19b/distilled/text-to-video":
    case "fal-ai/ltx-2-19b/distilled/text-to-video/lora": {
      const fps = 24;
      return {
        ...base,
        num_frames: job.durationSeconds * fps,
        fps,
        width: dims.width,
        height: dims.height,
      };
    }

    // ── Longcat family ────────────────────────────────────────────────────────
    case "fal-ai/longcat-video/distilled/text-to-video/720p":
    case "fal-ai/longcat-video/text-to-video/720p": {
      const fps = 30;
      return {
        ...base,
        num_frames: job.durationSeconds * fps,
        fps,
        width: 1280,
        height: 720,
      };
    }

    case "fal-ai/longcat-video/text-to-video/480p":
    case "fal-ai/longcat-video/distilled/text-to-video/480p": {
      const fps = 15;
      return {
        ...base,
        num_frames: job.durationSeconds * fps,
        fps,
        width: 854,
        height: 480,
      };
    }

    // ── Pixverse family (fixed durations: 5/8/10s) ───────────────────────────
    case "fal-ai/pixverse/v5/text-to-video":
    case "fal-ai/pixverse/v5.5/text-to-video":
    case "fal-ai/pixverse/v5.6/text-to-video": {
      const allowedDurations = [5, 8, 10];
      const dur = allowedDurations.reduce((prev, curr) =>
        Math.abs(curr - job.durationSeconds) < Math.abs(prev - job.durationSeconds) ? curr : prev
      );
      return {
        ...base,
        duration: dur,
        width: dims.width,
        height: dims.height,
        aspect_ratio: job.aspectRatio,
      };
    }

    // ── Vidu Q3 Turbo ────────────────────────────────────────────────────────
    case "fal-ai/vidu/q3/text-to-video/turbo": {
      const fps = 24;
      return {
        ...base,
        num_frames: job.durationSeconds * fps,
        fps,
        width: dims.width,
        height: dims.height,
      };
    }

    // ── Cosmos Predict 2.5 (API produces a fixed 5-second clip) ──────────────
    // Cosmos generates exactly 5s regardless of durationSeconds. The credit cost
    // is calculated based on the 5s fixed output, so billing matches actual output.
    case "fal-ai/cosmos-predict-2.5/distilled/text-to-video": {
      const fps = 24;
      return {
        ...base,
        num_frames: 5 * fps, // fixed 5-second output
        fps,
        width: dims.width,
        height: dims.height,
      };
    }

    // ── Hunyuan Video v1.5 ───────────────────────────────────────────────────
    case "fal-ai/hunyuan-video-v1.5/text-to-video": {
      const fps = 24;
      return {
        ...base,
        num_frames: job.durationSeconds * fps,
        fps,
        width: dims.width,
        height: dims.height,
      };
    }

    // ── Kandinsky 5 (API supports only 5s or 10s; nearest duration is chosen) ─
    case "fal-ai/kandinsky5/text-to-video":
    case "fal-ai/kandinsky5/text-to-video/distill":
      return {
        ...base,
        duration: job.durationSeconds <= 5 ? 5 : 10,
        width: 768,
        height: 512,
      };

    // ── MiniMax Hailuo 2.3 (API supports only 6s or 10s; nearest is chosen) ─
    case "fal-ai/minimax/hailuo-2.3/standard/text-to-video":
      return {
        ...base,
        duration: job.durationSeconds <= 6 ? 6 : 10,
        width: dims.width,
        height: dims.height,
      };

    // ── Seedance (token-based, standard frame counts) ─────────────────────────
    case "fal-ai/bytedance/seedance/v1/pro/fast/text-to-video":
    case "fal-ai/bytedance/seedance/v1.5/pro/text-to-video": {
      const fps = 30;
      return {
        ...base,
        num_frames: job.durationSeconds * fps,
        fps,
        width: dims.width,
        height: dims.height,
      };
    }

    // ── HeyGen / Avatar (prompt-driven, optional image) ──────────────────────
    case "fal-ai/heygen/avatar3/digital-twin":
    case "fal-ai/heygen/v2/video-agent":
    case "argil/avatars/text-to-video":
      return {
        ...base,
        duration: job.durationSeconds,
        ...(job.referenceImageUrl ? { image_url: job.referenceImageUrl } : {}),
      };

    // ── xAI Grok Anime (6s at 24 fps) ────────────────────────────────────────
    case "xai/grok-imagine-video/text-to-video":
      return {
        ...base,
        duration: 6,
        width: dims.width,
        height: dims.height,
      };

    // ── VEED Fabric ───────────────────────────────────────────────────────────
    case "veed/fabric-1.0/text": {
      const fps = 24;
      return {
        ...base,
        num_frames: job.durationSeconds * fps,
        fps,
        width: dims.width,
        height: dims.height,
      };
    }

    default: {
      // Safe fallback: 24 fps with provided dimensions
      const fps = 24;
      return {
        ...base,
        num_frames: job.durationSeconds * fps,
        fps,
        width: dims.width,
        height: dims.height,
      };
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

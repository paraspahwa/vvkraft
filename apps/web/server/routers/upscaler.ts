import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { router, protectedProcedure } from "../trpc";
import { videoUpscaleRequestSchema, MAX_UPSCALE_DURATION_SECONDS } from "@videoforge/shared";
import {
  createUpscaleJob,
  getUpscaleJobById,
  getUserUpscaleJobs,
  updateUpscaleJob,
  deductCredits,
  addCredits,
} from "../../lib/db";
import { getPresignedUploadUrl, buildUpscaleInputKey } from "../../lib/r2";
import { fal } from "../../lib/fal";

/**
 * Credit cost for upscaling:
 *  - Standard quality: 10 credits per job
 *  - Real-ESRGAN (paid only): 25 credits per job
 */
const UPSCALE_CREDIT_COST: Record<string, number> = {
  standard: 10,
  "real-esrgan": 25,
};

/** Fal.ai model ID for video upscaling */
const FAL_UPSCALER_MODEL = "fal-ai/video-upscaler";

export const upscalerRouter = router({
  /**
   * Step 1 — generate a presigned URL so the client can upload the video
   * directly to R2 without routing large files through the API server.
   *
   * Returns { uploadUrl, r2Key, publicUrl } — the client PUT-uploads to
   * `uploadUrl` then passes `publicUrl` + `r2Key` when calling `create`.
   */
  getUploadUrl: protectedProcedure
    .input(
      z.object({
        fileName: z.string().min(1).max(255),
        contentType: z.string().regex(/^video\//, "Must be a video MIME type"),
        fileSizeBytes: z.number().int().positive().max(2 * 1024 * 1024 * 1024), // 2 GB limit
      })
    )
    .mutation(async ({ ctx }) => {
      const { userId } = ctx;

      // Use a temporary placeholder job ID for the key; the real job ID is
      // created in the subsequent `create` call.  We embed the userId so that
      // we can later locate the file easily.
      const tempId = `tmp-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      const r2Key = buildUpscaleInputKey(userId, tempId);

      const uploadUrl = await getPresignedUploadUrl(r2Key, "video/mp4", 900); // 15 min TTL

      const publicUrl = `${process.env.R2_PUBLIC_URL ?? ""}/${r2Key}`;

      return { uploadUrl, r2Key, publicUrl };
    }),

  /**
   * Step 2 — create the upscale job and submit it to Fal.ai.
   *
   * The client must have already uploaded the video to R2 via the presigned URL.
   */
  create: protectedProcedure
    .input(videoUpscaleRequestSchema)
    .mutation(async ({ ctx, input }) => {
      const { user, userId } = ctx;

      // Enforce max duration
      if (input.inputDurationSeconds > MAX_UPSCALE_DURATION_SECONDS) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `Video is too long. Maximum allowed duration is ${MAX_UPSCALE_DURATION_SECONDS} seconds.`,
        });
      }

      // Only paid users may choose Real-ESRGAN
      if (input.qualityMode === "real-esrgan" && user.tier === "free") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Real-ESRGAN quality mode is available on paid plans only.",
        });
      }

      const creditsCost = UPSCALE_CREDIT_COST[input.qualityMode] ?? 10;

      if (user.credits < creditsCost) {
        throw new TRPCError({
          code: "PAYMENT_REQUIRED",
          message: `Not enough credits. You need ${creditsCost} credits but have ${user.credits}.`,
        });
      }

      // Create the job record first so we have an ID for the webhook payload
      const job = await createUpscaleJob({
        userId,
        status: "pending",
        inputVideoUrl: input.inputVideoUrl,
        inputDurationSeconds: input.inputDurationSeconds,
        inputR2Key: input.inputR2Key,
        qualityMode: input.qualityMode,
        outputVideoUrl: null,
        outputR2Key: null,
        falRequestId: null,
        creditsCost,
        errorMessage: null,
        processingStartedAt: null,
        completedAt: null,
      });

      // Deduct credits immediately to prevent race conditions
      await deductCredits(
        userId,
        creditsCost,
        job.id,
        `Video upscale (${input.qualityMode}): ${job.id.slice(0, 8)}`
      );

      const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
      // Encode job metadata in the webhook URL so we can identify this job
      // when fal.ai calls back (no custom metadata field in fal.queue.submit).
      const webhookUrl = `${appUrl}/api/webhooks/fal?jobType=upscale&jobId=${job.id}`;

      try {
        // Submit the job to fal.ai
        const submitResult = await fal.queue.submit(FAL_UPSCALER_MODEL, {
          input: {
            video_url: input.inputVideoUrl,
            // upscaling_factor: 4 — fal-ai/video-upscaler default is 4x
            ...(input.qualityMode === "real-esrgan" ? { model_type: "real-esrgan" } : {}),
          },
          webhookUrl,
        });

        await updateUpscaleJob(job.id, {
          status: "queued",
          falRequestId: submitResult.request_id,
        });

        return { ...job, status: "queued" as const, falRequestId: submitResult.request_id };
      } catch (err) {
        // Mark failed and refund credits
        await updateUpscaleJob(job.id, {
          status: "failed",
          errorMessage: err instanceof Error ? err.message : "Failed to submit to fal.ai",
          completedAt: new Date(),
        });

        await addCredits(
          userId,
          creditsCost,
          "refund",
          `Refund for failed upscale job #${job.id.slice(0, 8)}`
        ).catch((refundErr: unknown) => {
          console.error(`[upscaler] Failed to refund credits for job ${job.id}:`, refundErr);
        });

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: err instanceof Error ? err.message : "Failed to start upscale job",
        });
      }
    }),

  /** Get a single upscale job by ID (used for polling) */
  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const job = await getUpscaleJobById(input.id);
      if (!job) throw new TRPCError({ code: "NOT_FOUND" });
      if (job.userId !== ctx.userId) throw new TRPCError({ code: "FORBIDDEN" });
      return job;
    }),

  /** List the current user's upscale jobs (newest first) */
  list: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(50).default(20),
        cursor: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const jobs = await getUserUpscaleJobs(ctx.userId, input.limit, input.cursor);
      return {
        items: jobs,
        nextCursor: jobs.length === input.limit ? jobs[jobs.length - 1]?.id : undefined,
      };
    }),
});

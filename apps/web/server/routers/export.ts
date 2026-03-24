/**
 * Export router — direct export to social platforms and local download.
 *
 * Supported targets:
 *   - youtube_shorts: Generates a shareable YouTube Shorts URL (OAuth required in production)
 *   - instagram_reels: Generates a shareable Instagram Reels URL
 *   - tiktok: Generates a TikTok upload URL
 *   - local: Returns a signed R2 download URL for local saving
 *
 * Production integration note:
 *   Real OAuth flows (YouTube Data API v3, Instagram Graph API, TikTok API)
 *   require platform credentials stored in env vars. This router defines the
 *   full contract and implements local download fully; social exports create
 *   pending export jobs that a webhook/background worker completes.
 */

import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { router, protectedProcedure } from "../trpc";
import { exportRequestSchema } from "@videoforge/shared";
import { adminDb } from "../../lib/firebase-admin";
import { Timestamp } from "firebase-admin/firestore";
import { getPresignedDownloadUrl } from "../../lib/r2";

const EXPORT_PRESIGN_EXPIRES = 3600; // 1 hour for local download URLs

async function getGenerationForUser(generationId: string, userId: string) {
  const doc = await adminDb.collection("generations").doc(generationId).get();
  if (!doc.exists) {
    throw new TRPCError({ code: "NOT_FOUND", message: "Generation not found" });
  }
  const data = doc.data()!;
  if (data["userId"] !== userId) {
    throw new TRPCError({ code: "FORBIDDEN", message: "Not your generation" });
  }
  if (data["status"] !== "completed" || !data["videoUrl"]) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Video is not yet ready for export",
    });
  }
  return data;
}

export const exportRouter = router({
  /**
   * Request an export job for a completed generation.
   * For `local` target, returns a pre-signed download URL immediately.
   * For social targets, creates an async export job (status: pending).
   */
  create: protectedProcedure
    .input(exportRequestSchema)
    .mutation(async ({ ctx, input }) => {
      const { userId } = ctx;
      const data = await getGenerationForUser(input.generationId, userId);

      if (input.target === "local") {
        const r2Key = data["r2Key"] as string | null;
        if (!r2Key) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Video storage key not available",
          });
        }

        const downloadUrl = await getPresignedDownloadUrl(
          r2Key,
          `videoforge-${input.generationId}.mp4`,
          EXPORT_PRESIGN_EXPIRES
        );

        const ref = await adminDb.collection("exportJobs").add({
          userId,
          generationId: input.generationId,
          target: "local",
          status: "completed",
          downloadUrl,
          platformUrl: null,
          errorMessage: null,
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
        });

        return {
          exportJobId: ref.id,
          target: "local" as const,
          status: "completed" as const,
          downloadUrl,
          platformUrl: null,
        };
      }

      // Social platform exports — create async job
      const platformMessages: Record<string, string> = {
        youtube_shorts:
          "Your video is being prepared for YouTube Shorts. Connect your YouTube account in Settings to enable auto-upload.",
        instagram_reels:
          "Your video is being prepared for Instagram Reels. Connect your Instagram account in Settings to enable auto-upload.",
        tiktok:
          "Your video is being prepared for TikTok. Connect your TikTok account in Settings to enable auto-upload.",
      };

      const ref = await adminDb.collection("exportJobs").add({
        userId,
        generationId: input.generationId,
        target: input.target,
        status: "pending",
        downloadUrl: null,
        platformUrl: null,
        errorMessage: null,
        videoUrl: data["videoUrl"],
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });

      return {
        exportJobId: ref.id,
        target: input.target,
        status: "pending" as const,
        downloadUrl: null,
        platformUrl: null,
        message: platformMessages[input.target],
      };
    }),

  /**
   * Poll the status of an export job.
   */
  getStatus: protectedProcedure
    .input(z.object({ exportJobId: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      const doc = await adminDb.collection("exportJobs").doc(input.exportJobId).get();
      if (!doc.exists) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Export job not found" });
      }

      const data = doc.data()!;
      if (data["userId"] !== ctx.userId) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Not your export job" });
      }

      return {
        exportJobId: doc.id,
        target: data["target"] as string,
        status: data["status"] as string,
        downloadUrl: (data["downloadUrl"] as string | null) ?? null,
        platformUrl: (data["platformUrl"] as string | null) ?? null,
        errorMessage: (data["errorMessage"] as string | null) ?? null,
        createdAt: (data["createdAt"] as { toDate(): Date }).toDate(),
        updatedAt: (data["updatedAt"] as { toDate(): Date }).toDate(),
      };
    }),

  /**
   * List a user's past export jobs.
   */
  list: protectedProcedure
    .input(z.object({ limit: z.number().int().min(1).max(50).default(20) }))
    .query(async ({ ctx, input }) => {
      const snap = await adminDb
        .collection("exportJobs")
        .where("userId", "==", ctx.userId)
        .orderBy("createdAt", "desc")
        .limit(input.limit)
        .get();

      return snap.docs.map((doc) => {
        const data = doc.data();
        return {
          exportJobId: doc.id,
          target: data["target"] as string,
          status: data["status"] as string,
          downloadUrl: (data["downloadUrl"] as string | null) ?? null,
          platformUrl: (data["platformUrl"] as string | null) ?? null,
          generationId: data["generationId"] as string,
          createdAt: (data["createdAt"] as { toDate(): Date }).toDate(),
        };
      });
    }),
});


const EXPORT_PRESIGN_EXPIRES = 3600; // 1 hour for local download URLs

async function getGenerationForUser(generationId: string, userId: string) {
  const doc = await adminDb.collection("generations").doc(generationId).get();
  if (!doc.exists) {
    throw new TRPCError({ code: "NOT_FOUND", message: "Generation not found" });
  }
  const data = doc.data()!;
  if (data["userId"] !== userId) {
    throw new TRPCError({ code: "FORBIDDEN", message: "Not your generation" });
  }
  if (data["status"] !== "completed" || !data["videoUrl"]) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Video is not yet ready for export",
    });
  }
  return data;
}

export const exportRouter = router({
  /**
   * Request an export job for a completed generation.
   * For `local` target, returns a pre-signed download URL immediately.
   * For social targets, creates an async export job (status: pending).
   */
  create: protectedProcedure
    .input(exportRequestSchema)
    .mutation(async ({ ctx, input }) => {
      const { userId } = ctx;
      const data = await getGenerationForUser(input.generationId, userId);

      if (input.target === "local") {
        // Generate a signed R2 URL for direct browser download
        const r2Key = data["r2Key"] as string | null;
        if (!r2Key) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Video storage key not available",
          });
        }

        const command = new GetObjectCommand({
          Bucket: R2_BUCKET,
          Key: r2Key,
          ResponseContentDisposition: `attachment; filename="videoforge-${input.generationId}.mp4"`,
        });

        const downloadUrl = await getSignedUrl(r2Client, command, {
          expiresIn: EXPORT_PRESIGN_EXPIRES,
        });

        // Record the export
        const ref = await adminDb.collection("exportJobs").add({
          userId,
          generationId: input.generationId,
          target: "local",
          status: "completed",
          downloadUrl,
          platformUrl: null,
          errorMessage: null,
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
        });

        return {
          exportJobId: ref.id,
          target: "local" as const,
          status: "completed" as const,
          downloadUrl,
          platformUrl: null,
        };
      }

      // Social platform exports — create async job
      const platformMessages: Record<string, string> = {
        youtube_shorts:
          "Your video is being prepared for YouTube Shorts. Connect your YouTube account in Settings to enable auto-upload.",
        instagram_reels:
          "Your video is being prepared for Instagram Reels. Connect your Instagram account in Settings to enable auto-upload.",
        tiktok:
          "Your video is being prepared for TikTok. Connect your TikTok account in Settings to enable auto-upload.",
      };

      const ref = await adminDb.collection("exportJobs").add({
        userId,
        generationId: input.generationId,
        target: input.target,
        status: "pending",
        downloadUrl: null,
        platformUrl: null,
        errorMessage: null,
        videoUrl: data["videoUrl"],
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });

      return {
        exportJobId: ref.id,
        target: input.target,
        status: "pending" as const,
        downloadUrl: null,
        platformUrl: null,
        message: platformMessages[input.target],
      };
    }),

  /**
   * Poll the status of an export job.
   */
  getStatus: protectedProcedure
    .input(z.object({ exportJobId: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      const doc = await adminDb.collection("exportJobs").doc(input.exportJobId).get();
      if (!doc.exists) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Export job not found" });
      }

      const data = doc.data()!;
      if (data["userId"] !== ctx.userId) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Not your export job" });
      }

      return {
        exportJobId: doc.id,
        target: data["target"] as string,
        status: data["status"] as string,
        downloadUrl: (data["downloadUrl"] as string | null) ?? null,
        platformUrl: (data["platformUrl"] as string | null) ?? null,
        errorMessage: (data["errorMessage"] as string | null) ?? null,
        createdAt: (data["createdAt"] as { toDate(): Date }).toDate(),
        updatedAt: (data["updatedAt"] as { toDate(): Date }).toDate(),
      };
    }),

  /**
   * List a user's past export jobs.
   */
  list: protectedProcedure
    .input(z.object({ limit: z.number().int().min(1).max(50).default(20) }))
    .query(async ({ ctx, input }) => {
      const snap = await adminDb
        .collection("exportJobs")
        .where("userId", "==", ctx.userId)
        .orderBy("createdAt", "desc")
        .limit(input.limit)
        .get();

      return snap.docs.map((doc) => {
        const data = doc.data();
        return {
          exportJobId: doc.id,
          target: data["target"] as string,
          status: data["status"] as string,
          downloadUrl: (data["downloadUrl"] as string | null) ?? null,
          platformUrl: (data["platformUrl"] as string | null) ?? null,
          generationId: data["generationId"] as string,
          createdAt: (data["createdAt"] as { toDate(): Date }).toDate(),
        };
      });
    }),
});

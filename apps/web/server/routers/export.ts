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
import { supabase } from "../../lib/supabase";
import { getPresignedDownloadUrl } from "../../lib/r2";

const EXPORT_PRESIGN_EXPIRES = 3600; // 1 hour for local download URLs

async function getGenerationForUser(generationId: string, userId: string) {
  const { data, error } = await supabase
    .from("generations")
    .select("*")
    .eq("id", generationId)
    .single();

  if (error || !data) {
    throw new TRPCError({ code: "NOT_FOUND", message: "Generation not found" });
  }
  if (data["user_id"] !== userId) {
    throw new TRPCError({ code: "FORBIDDEN", message: "Not your generation" });
  }
  if (data["status"] !== "completed" || !data["video_url"]) {
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
        const r2Key = data["r2_key"] as string | null;
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

        const { data: ref, error: insertErr } = await supabase
          .from("export_jobs")
          .insert({
            user_id: userId,
            generation_id: input.generationId,
            target: "local",
            status: "completed",
            download_url: downloadUrl,
            platform_url: null,
            error_message: null,
          })
          .select("id")
          .single();

        if (insertErr) throw new Error(insertErr.message);

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

      const { data: ref, error: insertErr } = await supabase
        .from("export_jobs")
        .insert({
          user_id: userId,
          generation_id: input.generationId,
          target: input.target,
          status: "pending",
          download_url: null,
          platform_url: null,
          error_message: null,
          video_url: data["video_url"],
        })
        .select("id")
        .single();

      if (insertErr) throw new Error(insertErr.message);

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
      const { data: doc, error } = await supabase
        .from("export_jobs")
        .select("*")
        .eq("id", input.exportJobId)
        .single();

      if (error || !doc) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Export job not found" });
      }

      if (doc["user_id"] !== ctx.userId) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Not your export job" });
      }

      return {
        exportJobId: doc["id"] as string,
        target: doc["target"] as string,
        status: doc["status"] as string,
        downloadUrl: (doc["download_url"] as string | null) ?? null,
        platformUrl: (doc["platform_url"] as string | null) ?? null,
        errorMessage: (doc["error_message"] as string | null) ?? null,
        createdAt: new Date(doc["created_at"] as string),
        updatedAt: new Date(doc["updated_at"] as string),
      };
    }),

  /**
   * List a user's past export jobs.
   */
  list: protectedProcedure
    .input(z.object({ limit: z.number().int().min(1).max(50).default(20) }))
    .query(async ({ ctx, input }) => {
      const { data, error } = await supabase
        .from("export_jobs")
        .select("*")
        .eq("user_id", ctx.userId)
        .order("created_at", { ascending: false })
        .limit(input.limit);

      if (error) throw new Error(error.message);

      return (data ?? []).map((row) => ({
        exportJobId: row["id"] as string,
        target: row["target"] as string,
        status: row["status"] as string,
        downloadUrl: (row["download_url"] as string | null) ?? null,
        platformUrl: (row["platform_url"] as string | null) ?? null,
        generationId: row["generation_id"] as string,
        createdAt: new Date(row["created_at"] as string),
      }));
    }),
});

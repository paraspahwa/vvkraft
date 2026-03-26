import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { router, protectedProcedure, publicProcedure } from "../trpc";
import { communityRemixSchema } from "@videoforge/shared";
import { supabase } from "../../lib/supabase";
import { createGeneration, deductCredits } from "../../lib/db";
import { routeModel } from "../../lib/model-router";
import { enqueueVideoGeneration } from "../../lib/queue";

export const communityRouter = router({
  /**
   * List trending community videos, ordered by likes descending.
   */
  trending: publicProcedure
    .input(
      z.object({
        limit: z.number().int().min(1).max(50).default(20),
        cursor: z.string().optional(),
      })
    )
    .query(async ({ input }) => {
      let query = supabase
        .from("community_videos")
        .select("*")
        .order("likes", { ascending: false })
        .limit(input.limit);

      if (input.cursor) {
        const { data: cursorDoc } = await supabase
          .from("community_videos")
          .select("likes")
          .eq("id", input.cursor)
          .single();
        if (cursorDoc) {
          query = query.lt("likes", cursorDoc["likes"]);
        }
      }

      const { data, error } = await query;
      if (error) throw new Error(error.message);

      const videos = (data ?? []).map((row) => ({
        id: row["id"] as string,
        generationId: row["generation_id"] as string,
        userId: row["user_id"] as string,
        displayName: (row["display_name"] as string) ?? "Anonymous",
        videoUrl: row["video_url"] as string,
        thumbnailUrl: (row["thumbnail_url"] as string | null) ?? null,
        prompt: row["prompt"] as string,
        likes: (row["likes"] as number) ?? 0,
        remixCount: (row["remix_count"] as number) ?? 0,
        createdAt: new Date(row["created_at"] as string),
      }));

      const nextCursor =
        videos.length === input.limit
          ? videos[videos.length - 1]!.id
          : undefined;

      return { videos, nextCursor };
    }),

  /**
   * Publish a completed generation to the community feed.
   */
  publish: protectedProcedure
    .input(
      z.object({
        generationId: z.string().min(1),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { userId, user } = ctx;

      const { data: gen, error } = await supabase
        .from("generations")
        .select("*")
        .eq("id", input.generationId)
        .single();

      if (error || !gen) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Generation not found" });
      }

      if (gen["user_id"] !== userId) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Not your generation" });
      }

      if (gen["status"] !== "completed" || !gen["video_url"]) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Only completed videos can be published",
        });
      }

      // Upsert to community_videos table
      await supabase.from("community_videos").upsert({
        id: input.generationId,
        generation_id: input.generationId,
        user_id: userId,
        display_name: user.displayName ?? "Anonymous",
        video_url: gen["video_url"],
        thumbnail_url: gen["thumbnail_url"] ?? null,
        prompt: gen["prompt"],
        likes: 0,
        remix_count: 0,
      });

      // Mark the generation as public
      await supabase.from("generations").update({
        is_public: true,
      }).eq("id", input.generationId);

      return { published: true };
    }),

  /**
   * Like a community video. Idempotent — stores per-user like record.
   */
  like: protectedProcedure
    .input(z.object({ communityVideoId: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const { userId } = ctx;
      const likeId = `${input.communityVideoId}_${userId}`;

      const { data: existing } = await supabase
        .from("community_likes")
        .select("id")
        .eq("id", likeId)
        .single();

      if (existing) {
        // Unlike
        await supabase.from("community_likes").delete().eq("id", likeId);
        // Decrement likes count
        const { data: video } = await supabase
          .from("community_videos")
          .select("likes")
          .eq("id", input.communityVideoId)
          .single();
        if (video) {
          await supabase
            .from("community_videos")
            .update({ likes: Math.max(0, (video["likes"] as number) - 1) })
            .eq("id", input.communityVideoId);
        }
        return { liked: false };
      }

      // Like
      await supabase.from("community_likes").insert({
        id: likeId,
        user_id: userId,
        community_video_id: input.communityVideoId,
      });
      // Increment likes count
      const { data: video } = await supabase
        .from("community_videos")
        .select("likes")
        .eq("id", input.communityVideoId)
        .single();
      if (video) {
        await supabase
          .from("community_videos")
          .update({ likes: ((video["likes"] as number) ?? 0) + 1 })
          .eq("id", input.communityVideoId);
      }

      return { liked: true };
    }),

  /**
   * Remix a community video.
   */
  remix: protectedProcedure
    .input(communityRemixSchema)
    .mutation(async ({ ctx, input }) => {
      const { userId, user } = ctx;

      // Verify source exists
      const { data: sourceData, error } = await supabase
        .from("community_videos")
        .select("*")
        .eq("id", input.sourceGenerationId)
        .single();

      if (error || !sourceData) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Source video not found" });
      }

      const basePrompt = sourceData["prompt"] as string;
      const remixPrompt = `${input.prompt} — inspired by: ${basePrompt.slice(0, 200)}`;

      const routing = routeModel({
        tier: user.tier,
        durationSeconds: input.durationSeconds,
        resolution: "720p",
        hasReferenceImage: false,
        motionStrength: undefined,
        requestedModel: undefined,
      });

      if (user.credits < routing.creditsCost) {
        throw new TRPCError({
          code: "PAYMENT_REQUIRED",
          message: `Not enough credits. Need ${routing.creditsCost}, have ${user.credits}.`,
        });
      }

      const generation = await createGeneration({
        userId,
        status: "pending",
        prompt: remixPrompt,
        negativePrompt: null,
        model: routing.model,
        resolution: routing.effectiveResolution,
        durationSeconds: routing.effectiveDuration,
        aspectRatio: input.aspectRatio,
        seed: null,
        motionStrength: null,
        referenceImageUrl: null,
        characterId: null,
        videoUrl: null,
        thumbnailUrl: null,
        r2Key: null,
        falRequestId: null,
        creditsCost: routing.creditsCost,
        actualCostUsd: null,
        errorMessage: null,
        processingStartedAt: null,
        completedAt: null,
      });

      await deductCredits(
        userId,
        routing.creditsCost,
        generation.id,
        `Remix of community video`
      );

      await enqueueVideoGeneration({
        generationId: generation.id,
        userId,
        model: routing.model,
        prompt: remixPrompt,
        negativePrompt: undefined,
        durationSeconds: routing.effectiveDuration,
        resolution: routing.effectiveResolution,
        aspectRatio: input.aspectRatio,
        seed: undefined,
        motionStrength: undefined,
        referenceImageUrl: undefined,
        characterId: undefined,
      });

      // Increment remix count on source video
      const currentRemixCount = (sourceData["remix_count"] as number) ?? 0;
      await supabase
        .from("community_videos")
        .update({ remix_count: currentRemixCount + 1 })
        .eq("id", input.sourceGenerationId);

      return { generationId: generation.id };
    }),
});

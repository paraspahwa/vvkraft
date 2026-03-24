/**
 * Community Content Loop router.
 *
 * Surfaces trending videos from the platform and supports the remix feature
 * (generate a new video seeded from an existing community post).
 *
 * Community videos are stored in the `communityVideos` Firestore collection.
 * A generation becomes eligible for the community feed when the user opts in
 * (Generation.isPublic = true — currently defaulting false to protect privacy).
 */

import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { router, protectedProcedure, publicProcedure } from "../trpc";
import { communityRemixSchema } from "@videoforge/shared";
import { adminDb } from "../../lib/firebase-admin";
import { Timestamp, FieldValue } from "firebase-admin/firestore";
import { createGeneration, deductCredits } from "../../lib/db";
import { routeModel } from "../../lib/model-router";
import { enqueueVideoGeneration } from "../../lib/queue";

export const communityRouter = router({
  /**
   * List trending community videos, ordered by likes descending.
   * Public endpoint — no auth required to browse.
   */
  trending: publicProcedure
    .input(
      z.object({
        limit: z.number().int().min(1).max(50).default(20),
        cursor: z.string().optional(),
      })
    )
    .query(async ({ input }) => {
      let query = adminDb
        .collection("communityVideos")
        .orderBy("likes", "desc")
        .limit(input.limit);

      if (input.cursor) {
        const cursorDoc = await adminDb
          .collection("communityVideos")
          .doc(input.cursor)
          .get();
        if (cursorDoc.exists) {
          query = query.startAfter(cursorDoc);
        }
      }

      const snap = await query.get();
      const videos = snap.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          generationId: data["generationId"] as string,
          userId: data["userId"] as string,
          displayName: (data["displayName"] as string) ?? "Anonymous",
          videoUrl: data["videoUrl"] as string,
          thumbnailUrl: (data["thumbnailUrl"] as string | null) ?? null,
          prompt: data["prompt"] as string,
          likes: (data["likes"] as number) ?? 0,
          remixCount: (data["remixCount"] as number) ?? 0,
          createdAt: (data["createdAt"] as { toDate(): Date }).toDate(),
        };
      });

      const nextCursor =
        snap.docs.length === input.limit
          ? snap.docs[snap.docs.length - 1]!.id
          : undefined;

      return { videos, nextCursor };
    }),

  /**
   * Publish a completed generation to the community feed.
   * The generation must belong to the authenticated user.
   */
  publish: protectedProcedure
    .input(
      z.object({
        generationId: z.string().min(1),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { userId, user } = ctx;

      const genDoc = await adminDb
        .collection("generations")
        .doc(input.generationId)
        .get();

      if (!genDoc.exists) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Generation not found" });
      }

      const gen = genDoc.data()!;
      if (gen["userId"] !== userId) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Not your generation" });
      }

      if (gen["status"] !== "completed" || !gen["videoUrl"]) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Only completed videos can be published",
        });
      }

      // Upsert to communityVideos collection
      await adminDb.collection("communityVideos").doc(input.generationId).set({
        generationId: input.generationId,
        userId,
        displayName: user.displayName ?? "Anonymous",
        videoUrl: gen["videoUrl"],
        thumbnailUrl: gen["thumbnailUrl"] ?? null,
        prompt: gen["prompt"],
        likes: 0,
        remixCount: 0,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });

      // Mark the generation as public
      await adminDb.collection("generations").doc(input.generationId).update({
        isPublic: true,
      });

      return { published: true };
    }),

  /**
   * Like a community video. Idempotent — stores per-user like record.
   */
  like: protectedProcedure
    .input(z.object({ communityVideoId: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const { userId } = ctx;
      const likeRef = adminDb
        .collection("communityLikes")
        .doc(`${input.communityVideoId}_${userId}`);

      const existing = await likeRef.get();
      if (existing.exists) {
        // Unlike
        await likeRef.delete();
        await adminDb
          .collection("communityVideos")
          .doc(input.communityVideoId)
          .update({ likes: FieldValue.increment(-1) });
        return { liked: false };
      }

      // Like
      await likeRef.set({ userId, communityVideoId: input.communityVideoId, createdAt: Timestamp.now() });
      await adminDb
        .collection("communityVideos")
        .doc(input.communityVideoId)
        .update({ likes: FieldValue.increment(1) });

      return { liked: true };
    }),

  /**
   * Remix a community video — generates a new video using the original
   * prompt as a seed, modified by the user's prompt.
   */
  remix: protectedProcedure
    .input(communityRemixSchema)
    .mutation(async ({ ctx, input }) => {
      const { userId, user } = ctx;

      // Verify source exists
      const sourceDoc = await adminDb
        .collection("communityVideos")
        .doc(input.sourceGenerationId)
        .get();

      if (!sourceDoc.exists) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Source video not found" });
      }

      const sourceData = sourceDoc.data()!;
      const basePrompt = sourceData["prompt"] as string;

      // Combine original prompt with the remix prompt
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
      await sourceDoc.ref.update({ remixCount: FieldValue.increment(1) });

      return { generationId: generation.id };
    }),
});

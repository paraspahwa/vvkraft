import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { router, protectedProcedure } from "../trpc";
import { generationRequestSchema, longVideoRequestSchema, TIER_QUEUE_PRIORITY } from "@videoforge/shared";
import { createGeneration, getGenerationById, getUserGenerations, updateGeneration } from "../../lib/db";
import { routeModel, routeLongVideo } from "../../lib/model-router";
import { enqueueVideoGeneration } from "../../lib/queue";
import { deductCredits } from "../../lib/db";

export const generationRouter = router({
  // Create a new video generation
  create: protectedProcedure
    .input(generationRequestSchema)
    .mutation(async ({ ctx, input }) => {
      const { user, userId } = ctx;

      // Route to appropriate model based on tier
      const routing = routeModel({
        tier: user.tier,
        durationSeconds: input.durationSeconds,
        resolution: input.resolution ?? "480p",
        hasReferenceImage: !!input.referenceImageUrl,
        motionStrength: input.motionStrength,
        requestedModel: input.model,
      });

      // Check credits
      if (user.credits < routing.creditsCost) {
        throw new TRPCError({
          code: "PAYMENT_REQUIRED",
          message: `Not enough credits. You need ${routing.creditsCost} credits but have ${user.credits}.`,
        });
      }

      // Create generation record
      const generation = await createGeneration({
        userId,
        status: "pending",
        prompt: input.prompt,
        negativePrompt: input.negativePrompt ?? null,
        model: routing.model,
        resolution: routing.effectiveResolution,
        durationSeconds: routing.effectiveDuration,
        aspectRatio: input.aspectRatio,
        seed: input.seed ?? null,
        motionStrength: input.motionStrength ?? null,
        referenceImageUrl: input.referenceImageUrl ?? null,
        characterId: input.characterId ?? null,
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

      // Deduct credits immediately to prevent race conditions
      await deductCredits(
        userId,
        routing.creditsCost,
        generation.id,
        `Video generation: ${input.prompt.slice(0, 50)}`
      );

      // Enqueue the job using the shared priority constants (lower = higher priority in BullMQ)
      await enqueueVideoGeneration(
        {
          generationId: generation.id,
          userId,
          model: routing.model,
          prompt: input.prompt,
          negativePrompt: input.negativePrompt,
          durationSeconds: routing.effectiveDuration,
          resolution: routing.effectiveResolution,
          aspectRatio: input.aspectRatio,
          seed: input.seed,
          motionStrength: input.motionStrength,
          referenceImageUrl: input.referenceImageUrl,
        },
        TIER_QUEUE_PRIORITY[user.tier]
      );

      return generation;
    }),

  // Get a single generation by ID
  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const generation = await getGenerationById(input.id);
      if (!generation) throw new TRPCError({ code: "NOT_FOUND" });
      if (generation.userId !== ctx.userId) throw new TRPCError({ code: "FORBIDDEN" });
      return generation;
    }),

  // List user's generations (max 50 per page)
  list: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(50).default(20),
        cursor: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const generations = await getUserGenerations(ctx.userId, input.limit, input.cursor);
      return {
        items: generations,
        nextCursor: generations.length === input.limit ? generations[generations.length - 1]?.id : undefined,
      };
    }),

  // Cancel a pending generation
  cancel: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const generation = await getGenerationById(input.id);
      if (!generation) throw new TRPCError({ code: "NOT_FOUND" });
      if (generation.userId !== ctx.userId) throw new TRPCError({ code: "FORBIDDEN" });
      if (!["pending", "queued"].includes(generation.status)) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Cannot cancel a generation that has started processing" });
      }

      await updateGeneration(input.id, { status: "cancelled" });
      return { success: true };
    }),

  // Get estimated cost without creating
  estimateCost: protectedProcedure
    .input(
      z.object({
        durationSeconds: z.number().min(1).max(15),
        resolution: z.enum(["480p", "720p", "1080p"]).optional(),
        model: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const routing = routeModel({
        tier: ctx.user.tier,
        durationSeconds: input.durationSeconds,
        resolution: input.resolution ?? "480p",
        hasReferenceImage: false,
      });

      return {
        creditsCost: routing.creditsCost,
        model: routing.model,
        effectiveResolution: routing.effectiveResolution,
        effectiveDuration: routing.effectiveDuration,
        hasEnoughCredits: ctx.user.credits >= routing.creditsCost,
      };
    }),

  // Create a long-form video generation (paid users only)
  createLongVideo: protectedProcedure
    .input(longVideoRequestSchema)
    .mutation(async ({ ctx, input }) => {
      const { user, userId } = ctx;

      // Enforce paid-only access
      if (user.tier === "free") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Long video generation is available on paid plans only. Upgrade to Creator or higher.",
        });
      }

      let routing: ReturnType<typeof routeLongVideo>;
      try {
        routing = routeLongVideo({
          tier: user.tier,
          durationSeconds: input.durationSeconds,
          resolution: input.resolution,
          requestedModel: input.model,
        });
      } catch (err) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: err instanceof Error ? err.message : "Long video not available for your plan",
        });
      }

      // Check credits
      if (user.credits < routing.creditsCost) {
        throw new TRPCError({
          code: "PAYMENT_REQUIRED",
          message: `Not enough credits. You need ${routing.creditsCost} credits but have ${user.credits}.`,
        });
      }

      // Create generation record
      const generation = await createGeneration({
        userId,
        status: "pending",
        prompt: input.prompt,
        negativePrompt: input.negativePrompt ?? null,
        model: routing.model,
        resolution: routing.effectiveResolution,
        durationSeconds: routing.effectiveDuration,
        aspectRatio: input.aspectRatio,
        seed: input.seed ?? null,
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

      // Deduct credits immediately to prevent race conditions
      await deductCredits(
        userId,
        routing.creditsCost,
        generation.id,
        `Long video generation (${input.durationSeconds}s): ${input.prompt.slice(0, 50)}`
      );

      // Enqueue the job
      await enqueueVideoGeneration(
        {
          generationId: generation.id,
          userId,
          model: routing.model,
          prompt: input.prompt,
          negativePrompt: input.negativePrompt,
          durationSeconds: routing.effectiveDuration,
          resolution: routing.effectiveResolution,
          aspectRatio: input.aspectRatio,
          seed: input.seed,
          motionStrength: undefined,
          referenceImageUrl: undefined,
        },
        TIER_QUEUE_PRIORITY[user.tier]
      );

      return generation;
    }),

  // Estimate cost for a long video
  estimateLongVideoCost: protectedProcedure
    .input(
      z.object({
        durationSeconds: z.union([z.literal(30), z.literal(60), z.literal(120)]),
        resolution: z.enum(["480p", "720p", "1080p"]).optional(),
        model: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { user } = ctx;

      if (user.tier === "free") {
        return {
          available: false,
          reason: "Long video generation requires a paid plan.",
          creditsCost: 0,
          model: null,
          effectiveResolution: null,
          effectiveDuration: input.durationSeconds,
          hasEnoughCredits: false,
        };
      }

      try {
        const routing = routeLongVideo({
          tier: user.tier,
          durationSeconds: input.durationSeconds,
          resolution: input.resolution,
          requestedModel: input.model as Parameters<typeof routeLongVideo>[0]["requestedModel"],
        });

        return {
          available: true,
          reason: null,
          creditsCost: routing.creditsCost,
          model: routing.model,
          effectiveResolution: routing.effectiveResolution,
          effectiveDuration: routing.effectiveDuration,
          hasEnoughCredits: user.credits >= routing.creditsCost,
        };
      } catch (err) {
        return {
          available: false,
          reason: err instanceof Error ? err.message : "Not available",
          creditsCost: 0,
          model: null,
          effectiveResolution: null,
          effectiveDuration: input.durationSeconds,
          hasEnoughCredits: false,
        };
      }
    }),
});

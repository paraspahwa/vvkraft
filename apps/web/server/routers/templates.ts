import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { router, protectedProcedure, publicProcedure } from "../trpc";
import {
  templateGenerateSchema,
  templateCategorySchema,
  generationRequestSchema,
} from "@videoforge/shared";
import { VIDEO_TEMPLATES, getTemplateById } from "../../lib/templates";
import { TIER_LIMITS } from "@videoforge/shared";
import { createGeneration, deductCredits } from "../../lib/db";
import { routeModel } from "../../lib/model-router";
import { enqueueVideoGeneration } from "../../lib/queue";

export const templatesRouter = router({
  /** List all available templates, optionally filtered by category */
  list: publicProcedure
    .input(
      z
        .object({
          category: templateCategorySchema.optional(),
        })
        .optional()
    )
    .query(({ input }) => {
      let templates = VIDEO_TEMPLATES;
      if (input?.category) {
        templates = templates.filter((t) => t.category === input.category);
      }
      return templates;
    }),

  /** Get a single template by ID */
  getById: publicProcedure
    .input(z.object({ templateId: z.string().min(1) }))
    .query(({ input }) => {
      const template = getTemplateById(input.templateId);
      if (!template) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Template not found" });
      }
      return template;
    }),

  /**
   * Generate a video from a template.
   * Validates tier eligibility, then delegates to the standard generation flow.
   */
  generate: protectedProcedure
    .input(templateGenerateSchema)
    .mutation(async ({ ctx, input }) => {
      const { user, userId } = ctx;

      const template = getTemplateById(input.templateId);
      if (!template) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Template not found" });
      }

      // Enforce tier minimum
      const tierOrder: Record<string, number> = {
        free: 0,
        creator: 1,
        pro: 2,
        studio: 3,
      };
      if (tierOrder[user.tier] < tierOrder[template.minTier]) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: `This template requires the ${template.minTier} plan or above.`,
        });
      }

      const prompt = input.promptOverride
        ? `${template.prompt}. ${input.promptOverride}`
        : template.prompt;

      const aspectRatio = input.aspectRatio ?? template.aspectRatio;

      const routing = routeModel({
        tier: user.tier,
        durationSeconds: template.durationSeconds,
        resolution: "720p",
        hasReferenceImage: false,
        motionStrength: undefined,
        requestedModel: template.suggestedModel,
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
        prompt,
        negativePrompt: template.negativePrompt,
        model: routing.model,
        resolution: routing.effectiveResolution,
        durationSeconds: routing.effectiveDuration,
        aspectRatio,
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
        `Template: ${template.name}`
      );

      await enqueueVideoGeneration({
        generationId: generation.id,
        userId,
        model: routing.model,
        prompt,
        negativePrompt: template.negativePrompt ?? undefined,
        durationSeconds: routing.effectiveDuration,
        resolution: routing.effectiveResolution,
        aspectRatio,
        seed: undefined,
        motionStrength: undefined,
        referenceImageUrl: undefined,
        characterId: undefined,
      });

      return { generationId: generation.id, templateName: template.name };
    }),
});

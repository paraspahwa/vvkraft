import { z } from "zod";
import type { SubscriptionTier, VideoResolution } from "../types";

export const subscriptionTierSchema = z.enum(["free", "creator", "pro", "studio"] as const);

export const videoResolutionSchema = z.enum(["480p", "720p", "1080p"] as const);

export const videoModelSchema = z.enum([
  "fal-ai/longcat-video/distilled/text-to-video/480p",
  "fal-ai/wan/v2.2-a14b/image-to-video",
  "fal-ai/kling-video/v2.6/pro/text-to-video",
  "fal-ai/kling-video/v3/pro/text-to-video",
] as const);

export const aspectRatioSchema = z.enum(["16:9", "9:16", "1:1"]);

export const generationRequestSchema = z.object({
  prompt: z.string().min(3, "Prompt must be at least 3 characters").max(2000, "Prompt too long"),
  negativePrompt: z.string().max(500).optional(),
  durationSeconds: z.number().int().min(1).max(15),
  aspectRatio: aspectRatioSchema.default("16:9"),
  resolution: videoResolutionSchema.optional(),
  seed: z.number().int().positive().optional(),
  motionStrength: z.number().min(0).max(1).optional(),
  referenceImageUrl: z.string().url().optional(),
  characterId: z.string().optional(),
  model: videoModelSchema.optional(),
});

export const userProfileUpdateSchema = z.object({
  displayName: z.string().min(2).max(50).optional(),
  photoURL: z.string().url().optional(),
});

export const characterCreateSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(50),
  description: z.string().max(500).optional(),
  referenceImageUrl: z.string().url("Must be a valid image URL"),
});

export const creditPurchaseSchema = z.object({
  credits: z.number().int().positive().min(10).max(10000),
});

export type GenerationRequestInput = z.infer<typeof generationRequestSchema>;
export type UserProfileUpdateInput = z.infer<typeof userProfileUpdateSchema>;
export type CharacterCreateInput = z.infer<typeof characterCreateSchema>;
export type CreditPurchaseInput = z.infer<typeof creditPurchaseSchema>;

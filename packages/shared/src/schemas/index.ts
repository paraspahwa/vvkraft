import { z } from "zod";
import type { SubscriptionTier, VideoResolution } from "../types";
export * from "./agents";

export const subscriptionTierSchema = z.enum(["free", "creator", "pro", "studio"] as const);

export const videoResolutionSchema = z.enum(["480p", "720p", "1080p"] as const);

export const videoModelSchema = z.enum([
  // Longcat family
  "fal-ai/longcat-video/distilled/text-to-video/480p",
  "fal-ai/longcat-video/distilled/text-to-video/720p",
  "fal-ai/longcat-video/text-to-video/480p",
  "fal-ai/longcat-video/text-to-video/720p",
  // LTXV / LTX family
  "fal-ai/ltxv-13b-098-distilled",
  "fal-ai/ltxv-13b-098-distilled/multiconditioning",
  "fal-ai/ltx-2/text-to-video/fast",
  "fal-ai/ltx-2.3/text-to-video/fast",
  "fal-ai/ltx-2-19b/distilled/text-to-video",
  "fal-ai/ltx-2-19b/distilled/text-to-video/lora",
  // Wan / Krea family
  "fal-ai/krea-wan-14b/text-to-video",
  "fal-ai/wan-25-preview/text-to-video",
  "fal-ai/wan/v2.2-a14b/image-to-video",
  "fal-ai/wan/v2.2-a14b/text-to-video",
  "fal-ai/wan/v2.2-5b/text-to-video/distill",
  "fal-ai/wan/v2.2-5b/text-to-video/fast-wan",
  "wan/v2.6/text-to-video",
  // Kling family
  "fal-ai/kling-video/v2.6/pro/text-to-video",
  "fal-ai/kling-video/v2.5-turbo/standard/image-to-video",
  "fal-ai/kling-video/v3/pro/text-to-video",
  "fal-ai/kling-video/v3/standard/text-to-video",
  "fal-ai/kling-video/o3/pro/text-to-video",
  "fal-ai/kling-video/o3/standard/text-to-video",
  // Pixverse family
  "fal-ai/pixverse/v5/text-to-video",
  "fal-ai/pixverse/v5.5/text-to-video",
  "fal-ai/pixverse/v5.6/text-to-video",
  // ByteDance / Seedance
  "fal-ai/bytedance/seedance/v1/pro/fast/text-to-video",
  "fal-ai/bytedance/seedance/v1.5/pro/text-to-video",
  // HeyGen / Avatar
  "fal-ai/heygen/avatar3/digital-twin",
  "fal-ai/heygen/v2/video-agent",
  "argil/avatars/text-to-video",
  // Other providers
  "fal-ai/cosmos-predict-2.5/distilled/text-to-video",
  "fal-ai/hunyuan-video-v1.5/text-to-video",
  "fal-ai/minimax/hailuo-2.3/standard/text-to-video",
  "fal-ai/kandinsky5/text-to-video",
  "fal-ai/kandinsky5/text-to-video/distill",
  "fal-ai/vidu/q3/text-to-video/turbo",
  "xai/grok-imagine-video/text-to-video",
  "veed/fabric-1.0/text",
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

/** Duration presets available for long-form video generation */
export const longVideoDurationSchema = z.union([
  z.literal(30),
  z.literal(60),
  z.literal(120),
]);

export const longVideoModelSchema = z.enum([
  // Longcat family — designed for continuous long-form generation
  "fal-ai/longcat-video/distilled/text-to-video/480p",
  "fal-ai/longcat-video/distilled/text-to-video/720p",
  "fal-ai/longcat-video/text-to-video/480p",
  "fal-ai/longcat-video/text-to-video/720p",
  // LTXV / LTX family — arbitrary duration via num_frames
  "fal-ai/ltxv-13b-098-distilled",
  "fal-ai/ltxv-13b-098-distilled/multiconditioning",
  "fal-ai/ltx-2/text-to-video/fast",
  "fal-ai/ltx-2.3/text-to-video/fast",
  "fal-ai/ltx-2-19b/distilled/text-to-video",
  "fal-ai/ltx-2-19b/distilled/text-to-video/lora",
  // Wan / Krea family
  "fal-ai/krea-wan-14b/text-to-video",
  "fal-ai/wan-25-preview/text-to-video",
  "fal-ai/wan/v2.2-a14b/text-to-video",
  "wan/v2.6/text-to-video",
  // Cosmos / Hunyuan
  "fal-ai/cosmos-predict-2.5/distilled/text-to-video",
  "fal-ai/hunyuan-video-v1.5/text-to-video",
  // Vidu
  "fal-ai/vidu/q3/text-to-video/turbo",
] as const);

export const longVideoRequestSchema = z.object({
  prompt: z.string().min(3, "Prompt must be at least 3 characters").max(2000, "Prompt too long"),
  negativePrompt: z.string().max(500).optional(),
  durationSeconds: longVideoDurationSchema,
  aspectRatio: aspectRatioSchema.default("16:9"),
  resolution: videoResolutionSchema.optional(),
  seed: z.number().int().positive().optional(),
  model: longVideoModelSchema.optional(),
});

export type GenerationRequestInput = z.infer<typeof generationRequestSchema>;
export type UserProfileUpdateInput = z.infer<typeof userProfileUpdateSchema>;
export type CharacterCreateInput = z.infer<typeof characterCreateSchema>;
export type CreditPurchaseInput = z.infer<typeof creditPurchaseSchema>;
export type LongVideoRequestInput = z.infer<typeof longVideoRequestSchema>;
export type LongVideoModel = z.infer<typeof longVideoModelSchema>;
export type LongVideoDuration = z.infer<typeof longVideoDurationSchema>;

// ── Video Upscaler Schemas ─────────────────────────────────────────────────────

export const upscaleQualityModeSchema = z.enum(["standard", "real-esrgan"] as const);

/**
 * Maximum allowed video duration for upscaling (in seconds).
 * Longer videos are rejected to prevent excessive processing time and cost.
 */
export const MAX_UPSCALE_DURATION_SECONDS = 120;

export const videoUpscaleRequestSchema = z.object({
  /** Pre-uploaded video URL (from the R2 presigned upload) */
  inputVideoUrl: z.string().url("Must be a valid video URL"),
  /** Duration reported by the client (validated ≤ 120s) */
  inputDurationSeconds: z
    .number()
    .positive()
    .max(MAX_UPSCALE_DURATION_SECONDS, `Video must be ≤ ${MAX_UPSCALE_DURATION_SECONDS} seconds`),
  /** R2 key of the uploaded input file */
  inputR2Key: z.string().min(1),
  /** Quality mode — paid users may select real-esrgan */
  qualityMode: upscaleQualityModeSchema.default("standard"),
});

export type VideoUpscaleRequestInput = z.infer<typeof videoUpscaleRequestSchema>;

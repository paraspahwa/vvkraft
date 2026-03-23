// Core domain types for VideoForge
export * from "./agents";

export type SubscriptionTier = "free" | "creator" | "pro" | "studio";
export type GenerationStatus = "pending" | "queued" | "processing" | "completed" | "failed" | "cancelled";
export type VideoResolution = "480p" | "720p" | "1080p";
export type VideoModel =
  // ── Longcat family ─────────────────────────────────────────────────────────
  | "fal-ai/longcat-video/distilled/text-to-video/480p"
  | "fal-ai/longcat-video/distilled/text-to-video/720p"
  | "fal-ai/longcat-video/text-to-video/480p"
  | "fal-ai/longcat-video/text-to-video/720p"
  // ── LTXV / LTX family ──────────────────────────────────────────────────────
  | "fal-ai/ltxv-13b-098-distilled"
  | "fal-ai/ltxv-13b-098-distilled/multiconditioning"
  | "fal-ai/ltx-2/text-to-video/fast"
  | "fal-ai/ltx-2.3/text-to-video/fast"
  | "fal-ai/ltx-2-19b/distilled/text-to-video"
  | "fal-ai/ltx-2-19b/distilled/text-to-video/lora"
  // ── Wan / Krea family ──────────────────────────────────────────────────────
  | "fal-ai/krea-wan-14b/text-to-video"
  | "fal-ai/wan-25-preview/text-to-video"
  | "fal-ai/wan/v2.2-a14b/image-to-video"
  | "fal-ai/wan/v2.2-a14b/text-to-video"
  | "fal-ai/wan/v2.2-5b/text-to-video/distill"
  | "fal-ai/wan/v2.2-5b/text-to-video/fast-wan"
  | "wan/v2.6/text-to-video"
  // ── Kling family ───────────────────────────────────────────────────────────
  | "fal-ai/kling-video/v2.6/pro/text-to-video"
  | "fal-ai/kling-video/v2.5-turbo/standard/image-to-video"
  | "fal-ai/kling-video/v3/pro/text-to-video"
  | "fal-ai/kling-video/v3/standard/text-to-video"
  | "fal-ai/kling-video/o3/pro/text-to-video"
  | "fal-ai/kling-video/o3/standard/text-to-video"
  // ── Pixverse family ────────────────────────────────────────────────────────
  | "fal-ai/pixverse/v5/text-to-video"
  | "fal-ai/pixverse/v5.5/text-to-video"
  | "fal-ai/pixverse/v5.6/text-to-video"
  // ── ByteDance / Seedance ───────────────────────────────────────────────────
  | "fal-ai/bytedance/seedance/v1/pro/fast/text-to-video"
  | "fal-ai/bytedance/seedance/v1.5/pro/text-to-video"
  // ── HeyGen / Avatar ────────────────────────────────────────────────────────
  | "fal-ai/heygen/avatar3/digital-twin"
  | "fal-ai/heygen/v2/video-agent"
  | "argil/avatars/text-to-video"
  // ── Other providers ────────────────────────────────────────────────────────
  | "fal-ai/cosmos-predict-2.5/distilled/text-to-video"
  | "fal-ai/hunyuan-video-v1.5/text-to-video"
  | "fal-ai/minimax/hailuo-2.3/standard/text-to-video"
  | "fal-ai/kandinsky5/text-to-video"
  | "fal-ai/kandinsky5/text-to-video/distill"
  | "fal-ai/vidu/q3/text-to-video/turbo"
  | "xai/grok-imagine-video/text-to-video"
  | "veed/fabric-1.0/text";

export interface User {
  id: string;
  email: string;
  displayName: string | null;
  photoURL: string | null;
  tier: SubscriptionTier;
  credits: number;
  creditsUsedThisMonth: number;
  razorpayCustomerId: string | null;
  razorpaySubscriptionId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface TierLimits {
  tier: SubscriptionTier;
  videosPerDay: number | null;    // null = unlimited
  videosPerMonth: number | null;  // null = unlimited
  maxDurationSeconds: number;
  maxResolution: VideoResolution;
  watermark: boolean;
  motionControl: boolean;
  characterConsistency: boolean;
  priorityQueue: boolean;
  monthlyPriceUsd: number;
  includedCredits: number;
  /** Maximum duration (seconds) allowed for long-form video generation; 0 = not available */
  longVideoMaxDurationSeconds: number;
}

export interface Generation {
  id: string;
  userId: string;
  status: GenerationStatus;
  prompt: string;
  negativePrompt: string | null;
  model: VideoModel;
  resolution: VideoResolution;
  durationSeconds: number;
  aspectRatio: "16:9" | "9:16" | "1:1";
  seed: number | null;
  motionStrength: number | null;
  referenceImageUrl: string | null;
  characterId: string | null;

  // Output
  videoUrl: string | null;
  thumbnailUrl: string | null;
  r2Key: string | null;
  falRequestId: string | null;

  // Cost tracking
  creditsCost: number;
  actualCostUsd: number | null;

  // Metadata
  errorMessage: string | null;
  processingStartedAt: Date | null;
  completedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Character {
  id: string;
  userId: string;
  name: string;
  description: string | null;
  referenceImageUrl: string;
  r2Key: string;
  generationCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreditTransaction {
  id: string;
  userId: string;
  amount: number;          // positive = credit, negative = debit
  balanceAfter: number;
  type: "purchase" | "subscription" | "generation" | "refund" | "bonus";
  description: string;
  generationId: string | null;
  razorpayPaymentId: string | null;
  createdAt: Date;
}

export interface GenerationRequest {
  prompt: string;
  negativePrompt?: string;
  durationSeconds: number;
  aspectRatio: "16:9" | "9:16" | "1:1";
  resolution?: VideoResolution;
  seed?: number;
  motionStrength?: number;
  referenceImageUrl?: string;
  characterId?: string;
  model?: VideoModel;
}

export interface PricingPlan {
  tier: SubscriptionTier;
  name: string;
  monthlyPriceUsd: number;
  yearlyPriceUsd: number;
  razorpayPlanIdMonthly: string | null;
  razorpayPlanIdYearly: string | null;
  features: string[];
  limits: TierLimits;
  highlighted: boolean;
}

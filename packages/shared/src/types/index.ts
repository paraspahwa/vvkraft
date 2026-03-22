// Core domain types for VideoForge
export * from "./agents";

export type SubscriptionTier = "free" | "creator" | "pro" | "studio";
export type GenerationStatus = "pending" | "queued" | "processing" | "completed" | "failed" | "cancelled";
export type VideoResolution = "480p" | "720p" | "1080p";
export type VideoModel = 
  | "fal-ai/longcat-video/distilled/text-to-video/480p"
  | "fal-ai/wan/v2.2-a14b/image-to-video"
  | "fal-ai/kling-video/v2.6/pro/text-to-video"
  | "fal-ai/kling-video/v3/pro/text-to-video";

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

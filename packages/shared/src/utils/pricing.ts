import type { SubscriptionTier, TierLimits, VideoModel, VideoResolution } from "../types";
import type { LongVideoModel } from "../schemas";

// 1 credit = $0.10 USD
export const CREDIT_VALUE_USD = 0.10;

// Cost per second by model (USD)
const MODEL_COST_PER_SECOND: Record<VideoModel, number> = {
  "fal-ai/longcat-video/distilled/text-to-video/480p": 0.005,
  "fal-ai/longcat-video/distilled/text-to-video/720p": 0.01,
  "fal-ai/ltxv-13b-098-distilled": 0.02,
  "fal-ai/krea-wan-14b/text-to-video": 0.025,
  "fal-ai/wan/v2.2-a14b/image-to-video": 0.0025, // $0.0025/sec (e.g. $0.025 for 10s)
  "fal-ai/kling-video/v2.6/pro/text-to-video": 0.07,
  "fal-ai/kling-video/v3/pro/text-to-video": 0.224,
};

export const TIER_LIMITS: Record<SubscriptionTier, TierLimits> = {
  free: {
    tier: "free",
    videosPerDay: 3,
    videosPerMonth: null,
    maxDurationSeconds: 5,
    maxResolution: "480p",
    watermark: true,
    motionControl: false,
    characterConsistency: false,
    priorityQueue: false,
    monthlyPriceUsd: 0,
    includedCredits: 0,
    longVideoMaxDurationSeconds: 0,
  },
  creator: {
    tier: "creator",
    videosPerDay: null,
    videosPerMonth: 50,
    maxDurationSeconds: 10,
    maxResolution: "720p",
    watermark: false,
    motionControl: false,
    characterConsistency: true,
    priorityQueue: false,
    monthlyPriceUsd: 19,
    includedCredits: 190,
    longVideoMaxDurationSeconds: 60,
  },
  pro: {
    tier: "pro",
    videosPerDay: null,
    videosPerMonth: 200,
    maxDurationSeconds: 15,
    maxResolution: "1080p",
    watermark: false,
    motionControl: true,
    characterConsistency: true,
    priorityQueue: true,
    monthlyPriceUsd: 49,
    includedCredits: 490,
    longVideoMaxDurationSeconds: 120,
  },
  studio: {
    tier: "studio",
    videosPerDay: null,
    videosPerMonth: null,
    maxDurationSeconds: 15,
    maxResolution: "1080p",
    watermark: false,
    motionControl: true,
    characterConsistency: true,
    priorityQueue: true,
    monthlyPriceUsd: 149,
    includedCredits: 1490,
    longVideoMaxDurationSeconds: 120,
  },
};

/**
 * Returns the appropriate model for a given tier
 */
export function getModelForTier(tier: SubscriptionTier): VideoModel {
  const tierModelMap: Record<SubscriptionTier, VideoModel> = {
    free: "fal-ai/longcat-video/distilled/text-to-video/480p",
    creator: "fal-ai/wan/v2.2-a14b/image-to-video",
    pro: "fal-ai/kling-video/v2.6/pro/text-to-video",
    studio: "fal-ai/kling-video/v3/pro/text-to-video",
  };
  return tierModelMap[tier];
}

/**
 * Calculate cost in USD for a generation
 */
export function calculateCostUsd(model: VideoModel, durationSeconds: number): number {
  const costPerSecond = MODEL_COST_PER_SECOND[model];
  return costPerSecond * durationSeconds;
}

/**
 * Convert USD cost to credits (rounded up)
 */
export function usdToCredits(usd: number): number {
  return Math.ceil(usd / CREDIT_VALUE_USD);
}

/**
 * Convert credits to USD
 */
export function creditsToUsd(credits: number): number {
  return credits * CREDIT_VALUE_USD;
}

/**
 * Calculate total credits cost for a generation
 */
export function calculateCreditsCost(
  model: VideoModel,
  durationSeconds: number
): number {
  const costUsd = calculateCostUsd(model, durationSeconds);
  return usdToCredits(costUsd);
}

/**
 * Get max duration allowed for a tier
 */
export function getMaxDuration(tier: SubscriptionTier): number {
  return TIER_LIMITS[tier].maxDurationSeconds;
}

/**
 * Get max resolution for a tier
 */
export function getMaxResolution(tier: SubscriptionTier): VideoResolution {
  return TIER_LIMITS[tier].maxResolution;
}

/**
 * Check if user has enough credits for a generation
 */
export function hasEnoughCredits(
  userCredits: number,
  model: VideoModel,
  durationSeconds: number
): boolean {
  const cost = calculateCreditsCost(model, durationSeconds);
  return userCredits >= cost;
}

/**
 * Validate generation params against tier limits
 */
export function validateGenerationForTier(
  tier: SubscriptionTier,
  durationSeconds: number,
  resolution: VideoResolution
): { valid: boolean; error?: string } {
  const limits = TIER_LIMITS[tier];

  if (durationSeconds > limits.maxDurationSeconds) {
    return {
      valid: false,
      error: `Your ${tier} plan supports up to ${limits.maxDurationSeconds}s videos. Upgrade to generate longer videos.`,
    };
  }

  const resolutionOrder: VideoResolution[] = ["480p", "720p", "1080p"];
  const requestedIdx = resolutionOrder.indexOf(resolution);
  const maxIdx = resolutionOrder.indexOf(limits.maxResolution);

  if (requestedIdx > maxIdx) {
    return {
      valid: false,
      error: `Your ${tier} plan supports up to ${limits.maxResolution}. Upgrade for higher resolution.`,
    };
  }

  return { valid: true };
}

/**
 * Queue priority values per tier (lower = higher priority in BullMQ)
 */
export const TIER_QUEUE_PRIORITY: Record<SubscriptionTier, number> = {
  studio: 1,
  pro: 3,
  creator: 5,
  free: 10,
};

/**
 * Returns the best long-video model for a given tier
 */
export function getLongVideoModelForTier(tier: SubscriptionTier): LongVideoModel | null {
  const tierModelMap: Record<SubscriptionTier, LongVideoModel | null> = {
    free: null,
    creator: "fal-ai/longcat-video/distilled/text-to-video/720p",
    pro: "fal-ai/ltxv-13b-098-distilled",
    studio: "fal-ai/krea-wan-14b/text-to-video",
  };
  return tierModelMap[tier];
}

/**
 * Validate long-video generation params against tier limits
 */
export function validateLongVideoForTier(
  tier: SubscriptionTier,
  durationSeconds: number,
): { valid: boolean; error?: string } {
  const limits = TIER_LIMITS[tier];

  if (limits.longVideoMaxDurationSeconds === 0) {
    return {
      valid: false,
      error: "Long video generation is only available on paid plans. Upgrade to Creator or higher.",
    };
  }

  if (durationSeconds > limits.longVideoMaxDurationSeconds) {
    return {
      valid: false,
      error: `Your ${tier} plan supports long videos up to ${limits.longVideoMaxDurationSeconds}s. Upgrade to Pro or Studio for 2-minute videos.`,
    };
  }

  return { valid: true };
}

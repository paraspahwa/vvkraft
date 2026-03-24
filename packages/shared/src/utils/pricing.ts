import type { SubscriptionTier, TierLimits, VideoModel, VideoResolution } from "../types";
import type { LongVideoModel } from "../schemas";

// 1 credit = $0.10 USD (user-facing value)
export const CREDIT_VALUE_USD = 0.10;

// ─── Profitability constants ────────────────────────────────────────────────
// Platform markup applied to API costs before converting to credits.
// At 2.5×, each $0.10 credit covers only $0.04 of fal.ai API cost,
// yielding ~60% gross margin on every generation.
export const PLATFORM_MARGIN_MULTIPLIER = 2.5;

// Audio surcharge — models that generate audio in the output cost 50% more
// credits than audio-off. This covers the higher API cost for audio-enabled
// generation (e.g. Kling audio on = 2× API rate).
export const AUDIO_SURCHARGE_MULTIPLIER = 1.5;

// ─── Representative per-second cost at standard quality (USD) ───────────────
// Variable-cost models (megapixel, token, flat-rate, resolution-dependent)
// use a sensible 720p/standard representative rate. See pricingNote in the
// VIDEO_MODEL_CATALOG for exact pricing details.
const MODEL_COST_PER_SECOND: Record<VideoModel, number> = {
  // Longcat distilled (cheapest, long-video optimised)
  "fal-ai/longcat-video/distilled/text-to-video/480p": 0.005,   // 15 fps
  "fal-ai/longcat-video/distilled/text-to-video/720p": 0.01,    // 30 fps
  // Longcat standard
  "fal-ai/longcat-video/text-to-video/480p": 0.025,             // 15 fps
  "fal-ai/longcat-video/text-to-video/720p": 0.04,              // 30 fps
  // LTXV / LTX
  "fal-ai/ltxv-13b-098-distilled": 0.02,
  "fal-ai/ltxv-13b-098-distilled/multiconditioning": 0.02,
  "fal-ai/ltx-2/text-to-video/fast": 0.04,                      // 1080p rate
  "fal-ai/ltx-2.3/text-to-video/fast": 0.04,
  "fal-ai/ltx-2-19b/distilled/text-to-video": 0.018,            // ≈720p 24fps megapixel
  "fal-ai/ltx-2-19b/distilled/text-to-video/lora": 0.022,       // ≈720p 24fps megapixel
  // Wan / Krea
  "fal-ai/krea-wan-14b/text-to-video": 0.025,                   // 16 fps
  "fal-ai/wan-25-preview/text-to-video": 0.10,                  // 720p rate
  "fal-ai/wan/v2.2-a14b/image-to-video": 0.0025,
  "fal-ai/wan/v2.2-a14b/text-to-video": 0.08,                   // 720p, 16 fps
  "fal-ai/wan/v2.2-5b/text-to-video/distill": 0.016,            // $0.08 flat ÷ 5s
  "fal-ai/wan/v2.2-5b/text-to-video/fast-wan": 0.005,           // $0.025/video ÷ 5s
  "wan/v2.6/text-to-video": 0.10,                               // 720p rate
  // Kling
  "fal-ai/kling-video/v2.6/pro/text-to-video": 0.07,
  "fal-ai/kling-video/v2.5-turbo/standard/image-to-video": 0.042,
  "fal-ai/kling-video/v3/pro/text-to-video": 0.224,
  "fal-ai/kling-video/v3/standard/text-to-video": 0.084,        // audio off
  "fal-ai/kling-video/o3/pro/text-to-video": 0.112,             // audio off
  "fal-ai/kling-video/o3/standard/text-to-video": 0.084,        // audio off
  // Pixverse
  "fal-ai/pixverse/v5/text-to-video": 0.04,                     // 720p rate
  "fal-ai/pixverse/v5.5/text-to-video": 0.04,                   // 720p no-audio rate
  "fal-ai/pixverse/v5.6/text-to-video": 0.09,                   // 720p no-audio rate
  // Seedance / ByteDance
  "fal-ai/bytedance/seedance/v1/pro/fast/text-to-video": 0.049, // 1080p ≈ $0.245/5s
  "fal-ai/bytedance/seedance/v1.5/pro/text-to-video": 0.052,    // 720p audio ≈ $0.26/5s
  // HeyGen / Avatar
  "fal-ai/heygen/avatar3/digital-twin": 0.034,
  "fal-ai/heygen/v2/video-agent": 0.034,
  "argil/avatars/text-to-video": 0.0225,
  // Other
  "fal-ai/cosmos-predict-2.5/distilled/text-to-video": 0.016,   // $0.08/5s
  "fal-ai/hunyuan-video-v1.5/text-to-video": 0.00075,           // 0.075 cents/s
  "fal-ai/minimax/hailuo-2.3/standard/text-to-video": 0.047,    // $0.28/6s
  "fal-ai/kandinsky5/text-to-video": 0.016,                     // $0.08/5s
  "fal-ai/kandinsky5/text-to-video/distill": 0.01,              // $0.05/5s
  "fal-ai/vidu/q3/text-to-video/turbo": 0.077,                  // 720p (0.035×2.2)
  "xai/grok-imagine-video/text-to-video": 0.07,                 // 720p
  "veed/fabric-1.0/text": 0.15,                                 // 720p
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
    monthlyPriceInr: 0,
    includedCredits: 0,
    includedCreditsIndia: 0,
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
    monthlyPriceInr: 199,
    includedCredits: 190,
    includedCreditsIndia: 50,
    longVideoMaxDurationSeconds: 60,
  },
  pro: {
    tier: "pro",
    videosPerDay: null,
    videosPerMonth: 150,
    maxDurationSeconds: 15,
    maxResolution: "1080p",
    watermark: false,
    motionControl: true,
    characterConsistency: true,
    priorityQueue: true,
    monthlyPriceUsd: 49,
    monthlyPriceInr: 499,
    includedCredits: 490,
    includedCreditsIndia: 150,
    longVideoMaxDurationSeconds: 120,
  },
  studio: {
    tier: "studio",
    videosPerDay: null,
    videosPerMonth: 400,
    maxDurationSeconds: 30,
    maxResolution: "1080p",
    watermark: false,
    motionControl: true,
    characterConsistency: true,
    priorityQueue: true,
    monthlyPriceUsd: 149,
    monthlyPriceInr: 999,
    includedCredits: 1490,
    includedCreditsIndia: 400,
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
 * Calculate total credits cost for a generation.
 * Includes the platform margin multiplier so that each credit consumed
 * covers less API cost than its face value, ensuring profitability.
 */
export function calculateCreditsCost(
  model: VideoModel,
  durationSeconds: number
): number {
  const costUsd = calculateCostUsd(model, durationSeconds);
  return Math.ceil((costUsd * PLATFORM_MARGIN_MULTIPLIER) / CREDIT_VALUE_USD);
}

/**
 * Calculate credits cost with audio surcharge for models that support audio.
 * Use this when the user requests audio-on generation.
 * If the model does not support audio, falls back to the base credit cost.
 */
export function calculateCreditsCostWithAudio(
  model: VideoModel,
  durationSeconds: number
): number {
  const baseCost = calculateCreditsCost(model, durationSeconds);
  const modelInfo = getModelInfo(model);
  if (modelInfo?.hasAudio) {
    return Math.ceil(baseCost * AUDIO_SURCHARGE_MULTIPLIER);
  }
  return baseCost;
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
 * Returns the default long-video model for a given tier
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

// ─── Video Model Catalog ─────────────────────────────────────────────────────

export interface VideoModelInfo {
  id: VideoModel;
  displayName: string;
  /** UI grouping label */
  category: string;
  description: string;
  /** Representative per-second cost (USD) at standard/720p settings */
  costPerSecondUsd: number;
  /** Human-readable pricing note shown in the UI */
  pricingNote: string;
  /** Minimum subscription tier required */
  minTier: SubscriptionTier;
  /** Whether this model can generate variable-length videos (30s+) */
  supportsLongVideo: boolean;
  /** Whether this model generates audio in the video */
  hasAudio: boolean;
  /** Whether this is an avatar/UGC model (may require extra inputs) */
  isAvatarModel: boolean;
  /** Whether this model operates on image input (image-to-video) */
  isImageToVideo: boolean;
}

export const VIDEO_MODEL_CATALOG: VideoModelInfo[] = [
  // ── Longcat family ─────────────────────────────────────────────────────────
  {
    id: "fal-ai/longcat-video/distilled/text-to-video/480p",
    displayName: "Longcat 480p (Distilled)",
    category: "Longcat",
    description: "Fastest & most affordable long-form model at 480p. 15 fps.",
    costPerSecondUsd: 0.005,
    pricingNote: "$0.005/s — billed at 15 fps",
    minTier: "free",
    supportsLongVideo: true,
    hasAudio: false,
    isAvatarModel: false,
    isImageToVideo: false,
  },
  {
    id: "fal-ai/longcat-video/distilled/text-to-video/720p",
    displayName: "Longcat 720p (Distilled)",
    category: "Longcat",
    description: "Affordable long-form model at 720p. 30 fps.",
    costPerSecondUsd: 0.01,
    pricingNote: "$0.01/s — billed at 30 fps",
    minTier: "creator",
    supportsLongVideo: true,
    hasAudio: false,
    isAvatarModel: false,
    isImageToVideo: false,
  },
  {
    id: "fal-ai/longcat-video/text-to-video/480p",
    displayName: "Longcat 480p",
    category: "Longcat",
    description: "Standard quality long-form at 480p. 15 fps.",
    costPerSecondUsd: 0.025,
    pricingNote: "$0.025/s — billed at 15 fps",
    minTier: "creator",
    supportsLongVideo: true,
    hasAudio: false,
    isAvatarModel: false,
    isImageToVideo: false,
  },
  {
    id: "fal-ai/longcat-video/text-to-video/720p",
    displayName: "Longcat 720p",
    category: "Longcat",
    description: "Standard quality long-form at 720p. 30 fps.",
    costPerSecondUsd: 0.04,
    pricingNote: "$0.04/s — billed at 30 fps",
    minTier: "creator",
    supportsLongVideo: true,
    hasAudio: false,
    isAvatarModel: false,
    isImageToVideo: false,
  },
  // ── LTXV / LTX family ──────────────────────────────────────────────────────
  {
    id: "fal-ai/ltxv-13b-098-distilled",
    displayName: "LTXV 13B (Distilled)",
    category: "LTXV / LTX",
    description: "High-quality distilled model at 24 fps. Up to 50s per dollar.",
    costPerSecondUsd: 0.02,
    pricingNote: "$0.02/s at 24 fps. Enable detail_pass doubles cost.",
    minTier: "creator",
    supportsLongVideo: true,
    hasAudio: false,
    isAvatarModel: false,
    isImageToVideo: false,
  },
  {
    id: "fal-ai/ltxv-13b-098-distilled/multiconditioning",
    displayName: "LTXV 13B Multiconditioning",
    category: "LTXV / LTX",
    description: "LTXV with multi-image conditioning for precise scene control.",
    costPerSecondUsd: 0.02,
    pricingNote: "$0.02/s at 24 fps. Enable detail_pass doubles cost.",
    minTier: "creator",
    supportsLongVideo: true,
    hasAudio: false,
    isAvatarModel: false,
    isImageToVideo: false,
  },
  {
    id: "fal-ai/ltx-2/text-to-video/fast",
    displayName: "LTX-2 Fast",
    category: "LTXV / LTX",
    description: "Fast generation: $0.04/s at 1080p, $0.08/s at 1440p.",
    costPerSecondUsd: 0.04,
    pricingNote: "$0.04/s (1080p) · $0.08/s (1440p) · $0.16/s (2160p)",
    minTier: "creator",
    supportsLongVideo: true,
    hasAudio: false,
    isAvatarModel: false,
    isImageToVideo: false,
  },
  {
    id: "fal-ai/ltx-2.3/text-to-video/fast",
    displayName: "LTX-2.3 Fast (with Audio)",
    category: "LTXV / LTX",
    description: "Fast generation with audio support. $0.04 per output second.",
    costPerSecondUsd: 0.04,
    pricingNote: "$0.04/s — includes audio",
    minTier: "creator",
    supportsLongVideo: true,
    hasAudio: true,
    isAvatarModel: false,
    isImageToVideo: false,
  },
  {
    id: "fal-ai/ltx-2-19b/distilled/text-to-video",
    displayName: "LTX-2 19B Distilled",
    category: "LTXV / LTX",
    description: "Megapixel-based pricing. Excellent quality-to-cost ratio.",
    costPerSecondUsd: 0.018,
    pricingNote: "$0.0008/megapixel (width × height × frames) — ≈$0.018/s at 720p 24fps",
    minTier: "creator",
    supportsLongVideo: true,
    hasAudio: false,
    isAvatarModel: false,
    isImageToVideo: false,
  },
  {
    id: "fal-ai/ltx-2-19b/distilled/text-to-video/lora",
    displayName: "LTX-2 19B Distilled + LoRA",
    category: "LTXV / LTX",
    description: "Custom style via LoRA adapters. Megapixel-based pricing.",
    costPerSecondUsd: 0.022,
    pricingNote: "$0.001/megapixel (width × height × frames) — ≈$0.022/s at 720p 24fps",
    minTier: "creator",
    supportsLongVideo: true,
    hasAudio: false,
    isAvatarModel: false,
    isImageToVideo: false,
  },
  // ── Wan / Krea family ──────────────────────────────────────────────────────
  {
    id: "fal-ai/krea-wan-14b/text-to-video",
    displayName: "Krea WAN 14B",
    category: "Wan / Krea",
    description: "Studio-grade cinematic quality. 16 fps.",
    costPerSecondUsd: 0.025,
    pricingNote: "$0.025/s at 16 fps",
    minTier: "creator",
    supportsLongVideo: true,
    hasAudio: false,
    isAvatarModel: false,
    isImageToVideo: false,
  },
  {
    id: "fal-ai/wan-25-preview/text-to-video",
    displayName: "WAN 2.5 Preview",
    category: "Wan / Krea",
    description: "Next-gen WAN preview model with resolution-based pricing.",
    costPerSecondUsd: 0.10,
    pricingNote: "$0.05/s (480p) · $0.10/s (720p) · $0.15/s (1080p)",
    minTier: "pro",
    supportsLongVideo: true,
    hasAudio: false,
    isAvatarModel: false,
    isImageToVideo: false,
  },
  {
    id: "fal-ai/wan/v2.2-a14b/image-to-video",
    displayName: "WAN 2.2 A14B (Image-to-Video)",
    category: "Wan / Krea",
    description: "Animate a reference image with WAN 2.2.",
    costPerSecondUsd: 0.0025,
    pricingNote: "~$0.0025/s",
    minTier: "creator",
    supportsLongVideo: false,
    hasAudio: false,
    isAvatarModel: false,
    isImageToVideo: true,
  },
  {
    id: "fal-ai/wan/v2.2-a14b/text-to-video",
    displayName: "WAN 2.2 A14B",
    category: "Wan / Krea",
    description: "High-quality text-to-video at 16 fps.",
    costPerSecondUsd: 0.08,
    pricingNote: "$0.04/s (480p) · $0.06/s (580p) · $0.08/s (720p) — 16 fps",
    minTier: "pro",
    supportsLongVideo: true,
    hasAudio: false,
    isAvatarModel: false,
    isImageToVideo: false,
  },
  {
    id: "fal-ai/wan/v2.2-5b/text-to-video/distill",
    displayName: "WAN 2.2 5B Distill",
    category: "Wan / Krea",
    description: "Flat-rate affordable model. $0.08 per generated video.",
    costPerSecondUsd: 0.016,
    pricingNote: "$0.08 flat per video (≈5s)",
    minTier: "creator",
    supportsLongVideo: false,
    hasAudio: false,
    isAvatarModel: false,
    isImageToVideo: false,
  },
  {
    id: "fal-ai/wan/v2.2-5b/text-to-video/fast-wan",
    displayName: "WAN 2.2 5B Fast",
    category: "Wan / Krea",
    description: "Fastest WAN variant with flat-rate resolution pricing.",
    costPerSecondUsd: 0.005,
    pricingNote: "$0.0125/video (480p) · $0.01875/video (580p) · $0.025/video (720p)",
    minTier: "creator",
    supportsLongVideo: false,
    hasAudio: false,
    isAvatarModel: false,
    isImageToVideo: false,
  },
  {
    id: "wan/v2.6/text-to-video",
    displayName: "WAN 2.6",
    category: "Wan / Krea",
    description: "Latest WAN generation with high-resolution support.",
    costPerSecondUsd: 0.10,
    pricingNote: "$0.10/s (720p) · $0.15/s (1080p)",
    minTier: "pro",
    supportsLongVideo: true,
    hasAudio: false,
    isAvatarModel: false,
    isImageToVideo: false,
  },
  // ── Kling family ───────────────────────────────────────────────────────────
  {
    id: "fal-ai/kling-video/v2.6/pro/text-to-video",
    displayName: "Kling v2.6 Pro",
    category: "Kling",
    description: "Professional quality. Audio on/off pricing.",
    costPerSecondUsd: 0.07,
    pricingNote: "$0.07/s (audio off) · $0.14/s (audio on)",
    minTier: "pro",
    supportsLongVideo: false,
    hasAudio: true,
    isAvatarModel: false,
    isImageToVideo: false,
  },
  {
    id: "fal-ai/kling-video/v2.5-turbo/standard/image-to-video",
    displayName: "Kling v2.5 Turbo (Image-to-Video)",
    category: "Kling",
    description: "Animate images rapidly with Kling turbo.",
    costPerSecondUsd: 0.042,
    pricingNote: "$0.21 for 5s; $0.042/s thereafter",
    minTier: "pro",
    supportsLongVideo: false,
    hasAudio: false,
    isAvatarModel: false,
    isImageToVideo: true,
  },
  {
    id: "fal-ai/kling-video/v3/standard/text-to-video",
    displayName: "Kling v3 Standard",
    category: "Kling",
    description: "High quality standard tier with optional audio & voice control.",
    costPerSecondUsd: 0.084,
    pricingNote: "$0.084/s (audio off) · $0.126/s (audio on) · $0.154/s (voice control)",
    minTier: "pro",
    supportsLongVideo: false,
    hasAudio: true,
    isAvatarModel: false,
    isImageToVideo: false,
  },
  {
    id: "fal-ai/kling-video/v3/pro/text-to-video",
    displayName: "Kling v3 Pro",
    category: "Kling",
    description: "Top-tier Kling model with pro-grade output.",
    costPerSecondUsd: 0.224,
    pricingNote: "~$0.224/s",
    minTier: "studio",
    supportsLongVideo: false,
    hasAudio: true,
    isAvatarModel: false,
    isImageToVideo: false,
  },
  {
    id: "fal-ai/kling-video/o3/standard/text-to-video",
    displayName: "Kling o3 Standard",
    category: "Kling",
    description: "o3-generation standard model with audio support.",
    costPerSecondUsd: 0.084,
    pricingNote: "$0.084/s (audio off) · $0.112/s (audio on)",
    minTier: "pro",
    supportsLongVideo: false,
    hasAudio: true,
    isAvatarModel: false,
    isImageToVideo: false,
  },
  {
    id: "fal-ai/kling-video/o3/pro/text-to-video",
    displayName: "Kling o3 Pro",
    category: "Kling",
    description: "o3-generation pro model — highest Kling quality with audio.",
    costPerSecondUsd: 0.112,
    pricingNote: "$0.112/s (audio off) · $0.14/s (audio on)",
    minTier: "studio",
    supportsLongVideo: false,
    hasAudio: true,
    isAvatarModel: false,
    isImageToVideo: false,
  },
  // ── Pixverse family ────────────────────────────────────────────────────────
  {
    id: "fal-ai/pixverse/v5/text-to-video",
    displayName: "Pixverse v5",
    category: "Pixverse",
    description: "Balanced quality-cost Pixverse model. Up to 10 seconds.",
    costPerSecondUsd: 0.04,
    pricingNote: "$0.15 (5s, 360p/540p) · $0.20 (5s, 720p) · $0.40 (5s, 1080p)",
    minTier: "pro",
    supportsLongVideo: false,
    hasAudio: false,
    isAvatarModel: false,
    isImageToVideo: false,
  },
  {
    id: "fal-ai/pixverse/v5.5/text-to-video",
    displayName: "Pixverse v5.5",
    category: "Pixverse",
    description: "Multi-clip mode and audio support. Up to 10 seconds.",
    costPerSecondUsd: 0.04,
    pricingNote: "$0.20 (5s, 720p, no audio). Audio adds $0.05. Multi-clip adds $0.10.",
    minTier: "pro",
    supportsLongVideo: false,
    hasAudio: true,
    isAvatarModel: false,
    isImageToVideo: false,
  },
  {
    id: "fal-ai/pixverse/v5.6/text-to-video",
    displayName: "Pixverse v5.6",
    category: "Pixverse",
    description: "Latest Pixverse with best quality. Audio support. Up to 10 seconds.",
    costPerSecondUsd: 0.09,
    pricingNote: "$0.45 (5s, 720p, no audio). Audio adds $0.45. 8s=2×, 10s=2.2×.",
    minTier: "studio",
    supportsLongVideo: false,
    hasAudio: true,
    isAvatarModel: false,
    isImageToVideo: false,
  },
  // ── Seedance / ByteDance ───────────────────────────────────────────────────
  {
    id: "fal-ai/bytedance/seedance/v1/pro/fast/text-to-video",
    displayName: "Seedance v1 Pro Fast",
    category: "Seedance",
    description: "Fast ByteDance model. Token-based pricing. 1080p≈$0.245/5s.",
    costPerSecondUsd: 0.049,
    pricingNote: "$1/M tokens (no audio). tokens = (H×W×FPS×dur) / 1024",
    minTier: "pro",
    supportsLongVideo: false,
    hasAudio: false,
    isAvatarModel: false,
    isImageToVideo: false,
  },
  {
    id: "fal-ai/bytedance/seedance/v1.5/pro/text-to-video",
    displayName: "Seedance v1.5 Pro",
    category: "Seedance",
    description: "Latest ByteDance Seedance with audio. 720p≈$0.26/5s.",
    costPerSecondUsd: 0.052,
    pricingNote: "$2.4/M tokens (audio) · $1.2/M tokens (no audio). tokens = (H×W×FPS×dur) / 1024",
    minTier: "studio",
    supportsLongVideo: false,
    hasAudio: true,
    isAvatarModel: false,
    isImageToVideo: false,
  },
  // ── HeyGen / Avatar ────────────────────────────────────────────────────────
  {
    id: "fal-ai/heygen/avatar3/digital-twin",
    displayName: "HeyGen Avatar3 Digital Twin",
    category: "Avatar",
    description: "Create a photorealistic digital twin avatar video.",
    costPerSecondUsd: 0.034,
    pricingNote: "$0.034 per output video second",
    minTier: "studio",
    supportsLongVideo: false,
    hasAudio: true,
    isAvatarModel: true,
    isImageToVideo: false,
  },
  {
    id: "fal-ai/heygen/v2/video-agent",
    displayName: "HeyGen v2 Video Agent",
    category: "Avatar",
    description: "AI-driven video agent with expressive avatar animation.",
    costPerSecondUsd: 0.034,
    pricingNote: "$0.034 per output video second",
    minTier: "studio",
    supportsLongVideo: false,
    hasAudio: true,
    isAvatarModel: true,
    isImageToVideo: false,
  },
  {
    id: "argil/avatars/text-to-video",
    displayName: "Argil Avatars (UGC)",
    category: "Avatar",
    description: "User-generated content avatar model. $0.0225 per input second.",
    costPerSecondUsd: 0.0225,
    pricingNote: "$0.0225 per input second",
    minTier: "pro",
    supportsLongVideo: false,
    hasAudio: true,
    isAvatarModel: true,
    isImageToVideo: false,
  },
  // ── Other providers ────────────────────────────────────────────────────────
  {
    id: "fal-ai/cosmos-predict-2.5/distilled/text-to-video",
    displayName: "Cosmos Predict 2.5 (Distilled)",
    category: "Other",
    description: "NVIDIA Cosmos distilled model. 5-second output. No audio.",
    costPerSecondUsd: 0.016,
    pricingNote: "$0.08 for 5s — no audio",
    minTier: "creator",
    supportsLongVideo: true,
    hasAudio: false,
    isAvatarModel: false,
    isImageToVideo: false,
  },
  {
    id: "fal-ai/hunyuan-video-v1.5/text-to-video",
    displayName: "Hunyuan Video v1.5",
    category: "Other",
    description: "Ultra-affordable Tencent Hunyuan model. Exceptional value.",
    costPerSecondUsd: 0.00075,
    pricingNote: "0.075 cents/s (≈$0.00075/s)",
    minTier: "creator",
    supportsLongVideo: true,
    hasAudio: false,
    isAvatarModel: false,
    isImageToVideo: false,
  },
  {
    id: "fal-ai/minimax/hailuo-2.3/standard/text-to-video",
    displayName: "MiniMax Hailuo 2.3",
    category: "Other",
    description: "Fixed-length generations: 6s or 10s.",
    costPerSecondUsd: 0.047,
    pricingNote: "$0.28 per 6s video · $0.56 per 10s video",
    minTier: "pro",
    supportsLongVideo: false,
    hasAudio: false,
    isAvatarModel: false,
    isImageToVideo: false,
  },
  {
    id: "fal-ai/kandinsky5/text-to-video",
    displayName: "Kandinsky 5",
    category: "Other",
    description: "768×512 output. Fixed 5s or 10s durations.",
    costPerSecondUsd: 0.016,
    pricingNote: "$0.08 (5s) · $0.16 (10s) — 768×512",
    minTier: "creator",
    supportsLongVideo: false,
    hasAudio: false,
    isAvatarModel: false,
    isImageToVideo: false,
  },
  {
    id: "fal-ai/kandinsky5/text-to-video/distill",
    displayName: "Kandinsky 5 Distill",
    category: "Other",
    description: "Faster, cheaper Kandinsky variant. Fixed 5s or 10s.",
    costPerSecondUsd: 0.01,
    pricingNote: "$0.05 (5s) · $0.10 (10s) — 768×512",
    minTier: "creator",
    supportsLongVideo: false,
    hasAudio: false,
    isAvatarModel: false,
    isImageToVideo: false,
  },
  {
    id: "fal-ai/vidu/q3/text-to-video/turbo",
    displayName: "Vidu Q3 Turbo",
    category: "Other",
    description: "Turbo-speed generation. Resolution-based pricing.",
    costPerSecondUsd: 0.077,
    pricingNote: "$0.035/s (360p/540p) · $0.077/s (720p) · $0.154/s (1080p) — 2.2× for HD",
    minTier: "pro",
    supportsLongVideo: true,
    hasAudio: false,
    isAvatarModel: false,
    isImageToVideo: false,
  },
  {
    id: "xai/grok-imagine-video/text-to-video",
    displayName: "xAI Grok Anime Video",
    category: "Other",
    description: "Anime-style video generation by xAI. 6s at 480p or 720p.",
    costPerSecondUsd: 0.07,
    pricingNote: "$0.05/s (480p) · $0.07/s (720p) — anime style",
    minTier: "studio",
    supportsLongVideo: false,
    hasAudio: false,
    isAvatarModel: false,
    isImageToVideo: false,
  },
  {
    id: "veed/fabric-1.0/text",
    displayName: "VEED Fabric 1.0",
    category: "Other",
    description: "VEED.io cinematic text-to-video model.",
    costPerSecondUsd: 0.15,
    pricingNote: "$0.08/s (480p) · $0.15/s (720p)",
    minTier: "studio",
    supportsLongVideo: false,
    hasAudio: false,
    isAvatarModel: false,
    isImageToVideo: false,
  },
];

/**
 * Look up catalog entry for a given model ID.
 */
export function getModelInfo(model: VideoModel): VideoModelInfo | undefined {
  return VIDEO_MODEL_CATALOG.find((m) => m.id === model);
}

/** Canonical tier order from least to most privileged */
export const TIER_ORDER: SubscriptionTier[] = ["free", "creator", "pro", "studio"];

/**
 * Get models accessible to a given tier (includes all lower tiers).
 */
export function getModelsForTier(tier: SubscriptionTier): VideoModelInfo[] {
  const tierIdx = TIER_ORDER.indexOf(tier);
  return VIDEO_MODEL_CATALOG.filter(
    (m) => TIER_ORDER.indexOf(m.minTier) <= tierIdx
  );
}

/**
 * Get long-video-capable models for a given tier.
 */
export function getLongVideoModelsForTier(tier: SubscriptionTier): VideoModelInfo[] {
  return getModelsForTier(tier).filter((m) => m.supportsLongVideo);
}


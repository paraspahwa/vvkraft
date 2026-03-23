import type { SubscriptionTier, VideoModel, VideoResolution } from "@videoforge/shared";
import { getModelForTier, calculateCreditsCost, TIER_LIMITS, getLongVideoModelForTier, validateLongVideoForTier } from "@videoforge/shared";
import type { LongVideoModel } from "@videoforge/shared";
import { RESOLUTION_DIMENSIONS } from "./fal";

export interface ModelRouterInput {
  tier: SubscriptionTier;
  durationSeconds: number;
  resolution: VideoResolution;
  hasReferenceImage: boolean;
  motionStrength?: number;
  requestedModel?: VideoModel;
}

export interface ModelRouterOutput {
  model: VideoModel;
  effectiveResolution: VideoResolution;
  effectiveDuration: number;
  dimensions: { width: number; height: number };
  creditsCost: number;
  addWatermark: boolean;
}

export interface LongVideoRouterInput {
  tier: SubscriptionTier;
  durationSeconds: number;
  resolution?: VideoResolution;
  requestedModel?: LongVideoModel;
}

export interface LongVideoRouterOutput {
  model: LongVideoModel;
  effectiveResolution: VideoResolution;
  effectiveDuration: number;
  dimensions: { width: number; height: number };
  creditsCost: number;
}

/**
 * Route a generation request to the appropriate model and enforce tier limits
 */
export function routeModel(input: ModelRouterInput): ModelRouterOutput {
  const limits = TIER_LIMITS[input.tier];

  // Clamp duration to tier limit
  const effectiveDuration = Math.min(input.durationSeconds, limits.maxDurationSeconds);

  // Clamp resolution to tier limit
  const resolutionOrder: VideoResolution[] = ["480p", "720p", "1080p"];
  const requestedIdx = resolutionOrder.indexOf(input.resolution);
  const maxIdx = resolutionOrder.indexOf(limits.maxResolution);
  const effectiveResolution = resolutionOrder[Math.min(requestedIdx, maxIdx)]!;

  // Determine model: use requested model if tier allows, otherwise use tier default
  let model: VideoModel;
  if (input.requestedModel && isTierAllowedModel(input.tier, input.requestedModel)) {
    model = input.requestedModel;
  } else {
    model = getModelForTier(input.tier);
  }

  const dimensions = RESOLUTION_DIMENSIONS[effectiveResolution] ?? { width: 854, height: 480 };
  const creditsCost = calculateCreditsCost(model, effectiveDuration);

  return {
    model,
    effectiveResolution,
    effectiveDuration,
    dimensions,
    creditsCost,
    addWatermark: limits.watermark,
  };
}

/**
 * Route a long-video generation request; throws if tier does not allow long video
 */
export function routeLongVideo(input: LongVideoRouterInput): LongVideoRouterOutput {
  const validation = validateLongVideoForTier(input.tier, input.durationSeconds);
  if (!validation.valid) {
    throw new Error(validation.error ?? "Long video not available for your plan");
  }

  // Select model: use explicitly requested model if allowed, otherwise tier default
  let model: LongVideoModel;
  if (input.requestedModel && isLongVideoModelAllowedForTier(input.tier, input.requestedModel)) {
    model = input.requestedModel;
  } else {
    const defaultModel = getLongVideoModelForTier(input.tier);
    if (!defaultModel) {
      throw new Error("Long video is not available on the free plan");
    }
    model = defaultModel;
  }

  // Determine resolution based on model capability and tier
  const resolutionOrder: VideoResolution[] = ["480p", "720p", "1080p"];
  const maxResolution = TIER_LIMITS[input.tier].maxResolution;
  const requestedResolution = input.resolution ?? maxResolution;
  const requestedIdx = resolutionOrder.indexOf(requestedResolution);
  const maxIdx = resolutionOrder.indexOf(maxResolution);
  const effectiveResolution = resolutionOrder[Math.min(requestedIdx, maxIdx)]!;

  const dimensions = RESOLUTION_DIMENSIONS[effectiveResolution] ?? { width: 854, height: 480 };
  const creditsCost = calculateCreditsCost(model, input.durationSeconds);

  return {
    model,
    effectiveResolution,
    effectiveDuration: input.durationSeconds,
    dimensions,
    creditsCost,
  };
}

/**
 * Returns which standard models a given tier has access to
 */
function isTierAllowedModel(tier: SubscriptionTier, model: VideoModel): boolean {
  const allowedModels: Record<SubscriptionTier, VideoModel[]> = {
    free: ["fal-ai/longcat-video/distilled/text-to-video/480p"],
    creator: [
      "fal-ai/longcat-video/distilled/text-to-video/480p",
      "fal-ai/wan/v2.2-a14b/image-to-video",
    ],
    pro: [
      "fal-ai/longcat-video/distilled/text-to-video/480p",
      "fal-ai/wan/v2.2-a14b/image-to-video",
      "fal-ai/kling-video/v2.6/pro/text-to-video",
    ],
    studio: [
      "fal-ai/longcat-video/distilled/text-to-video/480p",
      "fal-ai/wan/v2.2-a14b/image-to-video",
      "fal-ai/kling-video/v2.6/pro/text-to-video",
      "fal-ai/kling-video/v3/pro/text-to-video",
    ],
  };
  return allowedModels[tier].includes(model);
}

/**
 * Returns which long-video models a given tier can explicitly request
 */
function isLongVideoModelAllowedForTier(tier: SubscriptionTier, model: LongVideoModel): boolean {
  const allowedModels: Record<SubscriptionTier, LongVideoModel[]> = {
    free: [],
    creator: [
      "fal-ai/longcat-video/distilled/text-to-video/480p",
    ],
    pro: [
      "fal-ai/longcat-video/distilled/text-to-video/480p",
      "fal-ai/longcat-video/distilled/text-to-video/720p",
      "fal-ai/ltxv-13b-098-distilled",
    ],
    studio: [
      "fal-ai/longcat-video/distilled/text-to-video/480p",
      "fal-ai/longcat-video/distilled/text-to-video/720p",
      "fal-ai/ltxv-13b-098-distilled",
      "fal-ai/krea-wan-14b/text-to-video",
    ],
  };
  return allowedModels[tier].includes(model);
}

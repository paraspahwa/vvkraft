import type { SubscriptionTier, VideoModel, VideoResolution } from "@videoforge/shared";
import { getModelForTier, calculateCreditsCost, TIER_LIMITS } from "@videoforge/shared";
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
 * Returns which models a given tier has access to
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

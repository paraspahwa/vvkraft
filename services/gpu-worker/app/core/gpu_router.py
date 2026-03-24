"""GPU routing engine.

Selects the correct GPU tier, queue priority, and endpoint based on the
user's subscription tier and current system load.

GPU Tier hierarchy:
  Free      → RTX 3060  (cheapest, limited quality)
  Creator   → RTX 4090  (Starter plan, ₹199/month)
  Pro       → A100      (Creator plan, ₹499/month)
  Studio    → A100      (Pro plan, ₹999/month, priority queue)
"""

from __future__ import annotations

import logging
from dataclasses import dataclass

from app.models.schemas import GPUTier, SubscriptionTier, VideoResolution

logger = logging.getLogger(__name__)


@dataclass
class GPURoutingResult:
    """Result of the GPU routing decision."""

    gpu_tier: GPUTier
    queue_priority: int  # lower = higher priority
    max_duration_seconds: float
    max_resolution: VideoResolution
    add_watermark: bool
    estimated_cost_per_second_usd: float


# GPU tier map: subscription tier → hardware
# Free users get RTX 3060 (low cost, hidden quality cap).
# Creator (Starter ₹199) gets RTX 4090 for better throughput.
# Pro (Creator ₹499) and Studio (Pro ₹999) get A100 for full quality.
_GPU_MAP: dict[SubscriptionTier, GPUTier] = {
    SubscriptionTier.FREE: GPUTier.RTX_3060,
    SubscriptionTier.CREATOR: GPUTier.RTX_4090,
    SubscriptionTier.PRO: GPUTier.A100,
    SubscriptionTier.STUDIO: GPUTier.A100,
}

# Queue priority (lower number = processed first)
_PRIORITY_MAP: dict[SubscriptionTier, int] = {
    SubscriptionTier.FREE: 10,
    SubscriptionTier.CREATOR: 7,
    SubscriptionTier.PRO: 3,
    SubscriptionTier.STUDIO: 1,
}

# Tier limits
_MAX_DURATION: dict[SubscriptionTier, float] = {
    SubscriptionTier.FREE: 5.0,
    SubscriptionTier.CREATOR: 10.0,
    SubscriptionTier.PRO: 15.0,
    SubscriptionTier.STUDIO: 30.0,
}

_MAX_RESOLUTION: dict[SubscriptionTier, VideoResolution] = {
    SubscriptionTier.FREE: VideoResolution.P480,
    SubscriptionTier.CREATOR: VideoResolution.P720,
    SubscriptionTier.PRO: VideoResolution.P1080,
    SubscriptionTier.STUDIO: VideoResolution.P1080,
}

# Per-second GPU cost (USD) — used for internal cost tracking only.
# These costs are hidden from users; they see only plan video limits.
_COST_PER_SECOND: dict[GPUTier, float] = {
    GPUTier.RTX_3060: 0.00014,  # ~$0.50/hr
    GPUTier.RTX_4090: 0.00036,  # ~$1.30/hr
    GPUTier.A100: 0.00083,      # ~$3.00/hr
}


def route_gpu(tier: SubscriptionTier) -> GPURoutingResult:
    """Determine GPU allocation for the given subscription tier."""
    gpu_tier = _GPU_MAP[tier]

    result = GPURoutingResult(
        gpu_tier=gpu_tier,
        queue_priority=_PRIORITY_MAP[tier],
        max_duration_seconds=_MAX_DURATION[tier],
        max_resolution=_MAX_RESOLUTION[tier],
        add_watermark=(tier == SubscriptionTier.FREE),
        estimated_cost_per_second_usd=_COST_PER_SECOND[gpu_tier],
    )

    logger.info(
        "GPU routing: tier=%s → gpu=%s priority=%d",
        tier.value,
        gpu_tier.value,
        result.queue_priority,
    )
    return result

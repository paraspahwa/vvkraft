"""Cost optimizer and dynamic downgrade engine.

Tracks per-user and per-job costs and automatically applies cost-saving
measures when thresholds are exceeded:

* Queue slowdown
* Lower quality / resolution
* Watermark enforcement
"""

from __future__ import annotations

import logging
from dataclasses import dataclass, field

from app.models.schemas import (
    CostBreakdown,
    GPUTier,
    SubscriptionTier,
    UserMetrics,
    VideoResolution,
)

logger = logging.getLogger(__name__)


@dataclass
class CostPolicy:
    """Cost-control policy derived from current system load and user state."""

    downgrade_resolution: bool = False
    target_resolution: VideoResolution = VideoResolution.P720
    reduce_fps: bool = False
    target_fps: int = 24
    slow_queue: bool = False
    add_watermark: bool = False
    limit_retries: int = 3


# Thresholds (per-user, per billing cycle)
_COST_CEILING: dict[SubscriptionTier, float] = {
    SubscriptionTier.FREE: 0.50,
    SubscriptionTier.CREATOR: 5.00,
    SubscriptionTier.PRO: 25.00,
    SubscriptionTier.STUDIO: 100.00,
}


def evaluate_cost_policy(
    tier: SubscriptionTier,
    user_metrics: UserMetrics,
    system_load: float = 0.0,
) -> CostPolicy:
    """Evaluate which cost-saving measures to apply.

    The dynamic downgrade engine kicks in when:
    1. A user's accumulated cost approaches the ceiling for their tier.
    2. System load is high (> 0.8) and user is on a lower tier.
    """
    policy = CostPolicy()
    ceiling = _COST_CEILING[tier]

    cost_ratio = user_metrics.cost_usd / ceiling if ceiling > 0 else 1.0

    # Approaching cost ceiling → start downgrading
    if cost_ratio > 0.8:
        policy.downgrade_resolution = True
        policy.target_resolution = VideoResolution.P480
        policy.reduce_fps = True
        policy.target_fps = 16
        policy.limit_retries = 1
        logger.warning(
            "User %s near cost ceiling (%.0f%%) – downgrading",
            user_metrics.user_id,
            cost_ratio * 100,
        )

    # System under heavy load → throttle free/creator users
    if system_load > 0.8 and tier in (SubscriptionTier.FREE, SubscriptionTier.CREATOR):
        policy.slow_queue = True
        policy.downgrade_resolution = True
        policy.target_resolution = VideoResolution.P480

    # Free tier always gets watermark
    if tier == SubscriptionTier.FREE:
        policy.add_watermark = True

    return policy


def calculate_cost_breakdown(
    gpu_tier: GPUTier,
    duration_seconds: float,
    num_scenes: int,
    cached: bool = False,
) -> CostBreakdown:
    """Build an itemised cost breakdown for a generation."""
    from app.core.runpod_client import GPU_COST_PER_SECOND

    if cached:
        return CostBreakdown(cached=True)

    render_time = duration_seconds * 3.0  # overhead multiplier
    gpu_cost = GPU_COST_PER_SECOND[gpu_tier] * render_time * num_scenes
    storage_cost = 0.0001 * num_scenes  # ~$0.0001 per scene stored
    processing_cost = 0.0002 * num_scenes  # FFmpeg stitching overhead

    return CostBreakdown(
        gpu_cost_usd=round(gpu_cost, 6),
        storage_cost_usd=round(storage_cost, 6),
        processing_cost_usd=round(processing_cost, 6),
        total_cost_usd=round(gpu_cost + storage_cost + processing_cost, 6),
    )

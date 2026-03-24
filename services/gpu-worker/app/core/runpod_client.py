"""RunPod GPU client for dispatching video generation jobs.

Supports GPU tiering with RTX 3060, RTX 4090, and A100 endpoints.
"""

from __future__ import annotations

import logging
from typing import Any, Optional

import httpx

from app.config import settings
from app.models.schemas import GPUTier, SubscriptionTier

logger = logging.getLogger(__name__)

# GPU tier mapping based on subscription
_TIER_GPU_MAP: dict[SubscriptionTier, GPUTier] = {
    SubscriptionTier.FREE: GPUTier.RTX_3060,
    SubscriptionTier.CREATOR: GPUTier.RTX_4090,
    SubscriptionTier.PRO: GPUTier.A100,
    SubscriptionTier.STUDIO: GPUTier.A100,
}

# Per-second GPU cost estimates (USD)
GPU_COST_PER_SECOND: dict[GPUTier, float] = {
    GPUTier.RTX_3060: 0.00014,  # ~$0.50/hr
    GPUTier.RTX_4090: 0.00036,  # ~$1.30/hr
    GPUTier.A100: 0.00083,      # ~$3.00/hr
}


def get_gpu_tier(tier: SubscriptionTier) -> GPUTier:
    """Return the GPU tier for a given subscription tier."""
    return _TIER_GPU_MAP[tier]


def _endpoint_for_gpu(gpu_tier: GPUTier) -> str:
    """Return the RunPod serverless endpoint URL for the given GPU tier."""
    if gpu_tier == GPUTier.A100:
        return settings.RUNPOD_ENDPOINT_A100
    if gpu_tier == GPUTier.RTX_3060:
        return settings.RUNPOD_ENDPOINT_3060
    return settings.RUNPOD_ENDPOINT_4090


async def submit_job(
    gpu_tier: GPUTier,
    payload: dict[str, Any],
    webhook_url: Optional[str] = None,
) -> dict[str, Any]:
    """Submit an async job to a RunPod serverless endpoint.

    Args:
        gpu_tier: Which GPU pool to target.
        payload: Model-specific input payload.
        webhook_url: Optional callback URL for completion.

    Returns:
        RunPod job metadata including ``id`` and ``status``.
    """
    endpoint = _endpoint_for_gpu(gpu_tier)
    url = f"{endpoint}/run"

    body: dict[str, Any] = {"input": payload}
    if webhook_url:
        body["webhook"] = webhook_url

    headers = {
        "Authorization": f"Bearer {settings.RUNPOD_API_KEY}",
        "Content-Type": "application/json",
    }

    async with httpx.AsyncClient(timeout=30.0) as client:
        response = await client.post(url, json=body, headers=headers)
        response.raise_for_status()
        result = response.json()

    logger.info(
        "RunPod job submitted: id=%s gpu=%s", result.get("id"), gpu_tier.value
    )
    return result


async def get_job_status(
    gpu_tier: GPUTier, job_id: str
) -> dict[str, Any]:
    """Poll RunPod for the status of a running job."""
    endpoint = _endpoint_for_gpu(gpu_tier)
    url = f"{endpoint}/status/{job_id}"

    headers = {"Authorization": f"Bearer {settings.RUNPOD_API_KEY}"}

    async with httpx.AsyncClient(timeout=15.0) as client:
        response = await client.get(url, headers=headers)
        response.raise_for_status()
        return response.json()


async def cancel_job(gpu_tier: GPUTier, job_id: str) -> None:
    """Cancel a running RunPod job."""
    endpoint = _endpoint_for_gpu(gpu_tier)
    url = f"{endpoint}/cancel/{job_id}"

    headers = {"Authorization": f"Bearer {settings.RUNPOD_API_KEY}"}

    async with httpx.AsyncClient(timeout=15.0) as client:
        response = await client.post(url, headers=headers)
        response.raise_for_status()

    logger.info("RunPod job cancelled: id=%s", job_id)


def estimate_gpu_cost(gpu_tier: GPUTier, duration_seconds: float) -> float:
    """Estimate GPU cost in USD for the given render duration.

    Uses a conservative 3x multiplier on raw render time to account for
    model loading and inference overhead.
    """
    render_time = duration_seconds * 3.0
    return GPU_COST_PER_SECOND[gpu_tier] * render_time

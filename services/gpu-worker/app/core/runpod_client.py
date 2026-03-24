"""RunPod GPU client for dispatching video generation jobs.

Supports GPU tiering with RTX 3060, RTX 4090, and A100 endpoints, and
model-based routing to select the correct serverless endpoint per model.
"""

from __future__ import annotations

import logging
from typing import Any, Optional

import httpx

from app.config import settings
from app.models.schemas import GPUTier, SubscriptionTier, VideoModel

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

# Inference-time overhead multiplier per model.
# Heavier models take longer per output second of video.
MODEL_INFERENCE_MULTIPLIER: dict[VideoModel, float] = {
    VideoModel.LTX: 1.5,       # Very fast – suitable for previews
    VideoModel.WAN_1_3B: 3.0,  # MVP model – moderate overhead
    VideoModel.WAN_14B: 5.0,   # Scale model – heavier inference
    VideoModel.HUNYUAN: 6.0,   # Realism model – high quality, slower
    VideoModel.MOCHI: 7.0,     # Cinematic model – highest quality
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


def endpoint_for_model(model: VideoModel) -> str:
    """Return the RunPod serverless endpoint URL for the given video model.

    Each model is deployed as a dedicated RunPod serverless endpoint so that
    GPU memory and container images are optimised per model.  Falls back to
    the generic GPU-tier endpoint when a model-specific one is not configured.
    """
    model_endpoint_map: dict[VideoModel, str] = {
        VideoModel.LTX: settings.RUNPOD_ENDPOINT_LTX,
        VideoModel.WAN_1_3B: settings.RUNPOD_ENDPOINT_WAN_1_3B,
        VideoModel.WAN_14B: settings.RUNPOD_ENDPOINT_WAN_14B,
        VideoModel.HUNYUAN: settings.RUNPOD_ENDPOINT_HUNYUAN,
        VideoModel.MOCHI: settings.RUNPOD_ENDPOINT_MOCHI,
    }
    endpoint = model_endpoint_map.get(model, "")
    if endpoint:
        return endpoint
    # Fallback: route by GPU tier based on model weight class
    fallback_gpu = _model_fallback_gpu(model)
    return _endpoint_for_gpu(fallback_gpu)


def _model_fallback_gpu(model: VideoModel) -> GPUTier:
    """Determine the appropriate GPU tier when no model-specific endpoint exists."""
    if model in (VideoModel.WAN_14B, VideoModel.HUNYUAN, VideoModel.MOCHI):
        return GPUTier.A100
    if model == VideoModel.WAN_1_3B:
        return GPUTier.RTX_4090
    return GPUTier.RTX_3060  # LTX runs fine on 3060


async def submit_job(
    gpu_tier: GPUTier,
    payload: dict[str, Any],
    webhook_url: Optional[str] = None,
    model: Optional[VideoModel] = None,
) -> dict[str, Any]:
    """Submit an async job to a RunPod serverless endpoint.

    Args:
        gpu_tier: Which GPU pool to target (fallback when model endpoint is unavailable).
        payload: Model-specific input payload.
        webhook_url: Optional callback URL for completion.
        model: The video generation model to use.  When provided, routes to
            the model-specific endpoint instead of the generic GPU endpoint.

    Returns:
        RunPod job metadata including ``id`` and ``status``.
    """
    endpoint = endpoint_for_model(model) if model else _endpoint_for_gpu(gpu_tier)
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
        "RunPod job submitted: id=%s gpu=%s model=%s",
        result.get("id"),
        gpu_tier.value,
        model.value if model else "n/a",
    )
    return result


async def get_job_status(
    gpu_tier: GPUTier,
    job_id: str,
    model: Optional[VideoModel] = None,
) -> dict[str, Any]:
    """Poll RunPod for the status of a running job."""
    endpoint = endpoint_for_model(model) if model else _endpoint_for_gpu(gpu_tier)
    url = f"{endpoint}/status/{job_id}"

    headers = {"Authorization": f"Bearer {settings.RUNPOD_API_KEY}"}

    async with httpx.AsyncClient(timeout=15.0) as client:
        response = await client.get(url, headers=headers)
        response.raise_for_status()
        return response.json()


async def cancel_job(
    gpu_tier: GPUTier,
    job_id: str,
    model: Optional[VideoModel] = None,
) -> None:
    """Cancel a running RunPod job."""
    endpoint = endpoint_for_model(model) if model else _endpoint_for_gpu(gpu_tier)
    url = f"{endpoint}/cancel/{job_id}"

    headers = {"Authorization": f"Bearer {settings.RUNPOD_API_KEY}"}

    async with httpx.AsyncClient(timeout=15.0) as client:
        response = await client.post(url, headers=headers)
        response.raise_for_status()

    logger.info("RunPod job cancelled: id=%s", job_id)


def estimate_gpu_cost(
    gpu_tier: GPUTier,
    duration_seconds: float,
    model: Optional[VideoModel] = None,
) -> float:
    """Estimate GPU cost in USD for the given render duration.

    Uses a per-model inference-time multiplier to account for model loading
    and inference overhead.  Heavier models (14B, Hunyuan, Mochi) take longer
    per output second and therefore cost more.
    """
    multiplier = (
        MODEL_INFERENCE_MULTIPLIER.get(model, 3.0) if model else 3.0
    )
    render_time = duration_seconds * multiplier
    return GPU_COST_PER_SECOND[gpu_tier] * render_time

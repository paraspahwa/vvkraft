"""Video generation API routes."""

from __future__ import annotations

import logging

from fastapi import APIRouter, HTTPException

from app.core.cost_optimizer import calculate_cost_breakdown, evaluate_cost_policy
from app.core.gpu_router import route_gpu
from app.core.scene_stitcher import split_into_scenes
from app.models.schemas import (
    DraftPreviewRequest,
    DraftPreviewResponse,
    GenerationRequest,
    GenerationResponse,
    GenerationStatus,
    GenerationStatusResponse,
    UserMetrics,
)
from app.tasks.video_tasks import generate_draft_preview, generate_video

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/generation", tags=["generation"])


@router.post("/create", response_model=GenerationResponse)
async def create_generation(request: GenerationRequest) -> GenerationResponse:
    """Enqueue a new video generation job.

    The request is split into scenes, routed to the correct GPU tier, and
    dispatched via Celery for async processing.
    """
    routing = route_gpu(request.tier)

    # Clamp duration to tier limit
    effective_duration = min(request.duration_seconds, routing.max_duration_seconds)
    request.duration_seconds = effective_duration

    scenes = split_into_scenes(request)
    cost = calculate_cost_breakdown(
        gpu_tier=routing.gpu_tier,
        duration_seconds=effective_duration,
        num_scenes=len(scenes),
    )

    # Evaluate cost policy (may trigger downgrades)
    user_metrics = UserMetrics(user_id=request.user_id)
    policy = evaluate_cost_policy(request.tier, user_metrics)

    # Draft mode: generate low-cost preview first
    if request.draft_mode:
        generate_draft_preview.apply_async(
            kwargs={
                "generation_id": request.generation_id,
                "user_id": request.user_id,
                "prompt": request.prompt,
                "duration_seconds": min(effective_duration, 5.0),
            },
            priority=routing.queue_priority,
        )
        return GenerationResponse(
            generation_id=request.generation_id,
            status=GenerationStatus.DRAFT_PREVIEW,
            total_scenes=len(scenes),
            estimated_cost_usd=cost.total_cost_usd,
            gpu_tier=routing.gpu_tier,
            message="Draft preview queued. Approve to start full render.",
        )

    # Full render
    generate_video.apply_async(
        args=[request.model_dump()],
        priority=routing.queue_priority,
    )

    return GenerationResponse(
        generation_id=request.generation_id,
        status=GenerationStatus.QUEUED,
        total_scenes=len(scenes),
        estimated_cost_usd=cost.total_cost_usd,
        gpu_tier=routing.gpu_tier,
        message=f"Generation queued with {len(scenes)} scene(s) on {routing.gpu_tier.value}.",
    )


@router.post("/{generation_id}/approve", response_model=GenerationResponse)
async def approve_draft(generation_id: str, request: GenerationRequest) -> GenerationResponse:
    """Approve a draft preview and start full rendering."""
    request.draft_mode = False
    routing = route_gpu(request.tier)
    scenes = split_into_scenes(request)
    cost = calculate_cost_breakdown(
        gpu_tier=routing.gpu_tier,
        duration_seconds=request.duration_seconds,
        num_scenes=len(scenes),
    )

    generate_video.apply_async(
        args=[request.model_dump()],
        priority=routing.queue_priority,
    )

    return GenerationResponse(
        generation_id=generation_id,
        status=GenerationStatus.QUEUED,
        total_scenes=len(scenes),
        estimated_cost_usd=cost.total_cost_usd,
        gpu_tier=routing.gpu_tier,
        message=f"Full render approved. {len(scenes)} scene(s) queued.",
    )

"""Celery tasks for video generation, scene rendering, and stitching.

This module implements the core async job pipeline:

1. ``generate_video`` – entry-point that splits into scenes and fans out.
2. ``render_scene`` – renders a single ≤10 s scene on RunPod.
3. ``stitch_scenes`` – combines rendered scenes via FFmpeg.
4. ``generate_draft_preview`` – low-cost LTX preview for draft mode.
"""

from __future__ import annotations

import asyncio
import logging
import tempfile
from pathlib import Path
from typing import Any

from celery import chain, chord, group

from app.config import settings
from app.core.cost_optimizer import calculate_cost_breakdown, evaluate_cost_policy
from app.core.gpu_router import route_gpu
from app.core.runpod_client import estimate_gpu_cost, get_gpu_tier, submit_job
from app.core.scene_stitcher import (
    build_scene_render_payload,
    get_ffmpeg_resolution,
    split_into_scenes,
)
from app.models.schemas import (
    AspectRatio,
    CostBreakdown,
    GenerationRequest,
    GenerationStatus,
    GPUTier,
    SceneResult,
    SubscriptionTier,
    UserMetrics,
    VideoResolution,
)
from app.storage.r2_client import (
    build_draft_key,
    build_scene_key,
    build_thumbnail_key,
    build_video_key,
    upload_file,
)
from app.tasks.celery_app import celery_app

logger = logging.getLogger(__name__)


@celery_app.task(
    bind=True,
    name="app.tasks.video_tasks.generate_video",
    max_retries=2,
    default_retry_delay=10,
)
def generate_video(self, request_data: dict[str, Any]) -> dict[str, Any]:
    """Top-level task: split request into scenes and dispatch rendering.

    For requests ≤10 s this dispatches a single ``render_scene`` task.
    For longer requests it creates a chord: parallel scene renders followed
    by a ``stitch_scenes`` callback.
    """
    request = GenerationRequest(**request_data)
    routing = route_gpu(request.tier)
    scenes = split_into_scenes(request)

    logger.info(
        "generate_video: id=%s scenes=%d gpu=%s",
        request.generation_id,
        len(scenes),
        routing.gpu_tier.value,
    )

    # Build per-scene render tasks
    render_tasks = []
    for scene in scenes:
        payload = build_scene_render_payload(
            scene=scene,
            resolution=routing.max_resolution,
            aspect_ratio=request.aspect_ratio,
            seed=request.seed,
            motion_strength=request.motion_strength,
        )
        render_tasks.append(
            render_scene.s(
                generation_id=request.generation_id,
                user_id=request.user_id,
                scene_index=scene.scene_index,
                gpu_tier=routing.gpu_tier.value,
                payload=payload,
                duration_seconds=scene.duration_seconds,
            )
        )

    # Fan-out / fan-in: render all scenes, then stitch
    callback = stitch_scenes.s(
        generation_id=request.generation_id,
        user_id=request.user_id,
        resolution=routing.max_resolution.value,
        add_watermark=routing.add_watermark,
    )

    workflow = chord(group(render_tasks))(callback)

    cost = calculate_cost_breakdown(
        gpu_tier=routing.gpu_tier,
        duration_seconds=request.duration_seconds,
        num_scenes=len(scenes),
    )

    return {
        "generation_id": request.generation_id,
        "status": GenerationStatus.QUEUED.value,
        "total_scenes": len(scenes),
        "estimated_cost_usd": cost.total_cost_usd,
        "gpu_tier": routing.gpu_tier.value,
    }


@celery_app.task(
    bind=True,
    name="app.tasks.video_tasks.render_scene",
    max_retries=3,
    default_retry_delay=15,
    rate_limit="10/s",
)
def render_scene(
    self,
    *,
    generation_id: str,
    user_id: str,
    scene_index: int,
    gpu_tier: str,
    payload: dict[str, Any],
    duration_seconds: float,
) -> dict[str, Any]:
    """Render a single scene on RunPod and upload the result to R2.

    On failure this task retries up to 3 times (smart retry – only the
    failed scene is re-rendered, not the whole video).
    """
    tier = GPUTier(gpu_tier)
    webhook_url = (
        f"{settings.WEBHOOK_BASE_URL}/api/webhooks/runpod"
        f"?generationId={generation_id}&sceneIndex={scene_index}"
    )

    try:
        result = asyncio.get_event_loop().run_until_complete(
            submit_job(tier, payload, webhook_url=webhook_url)
        )
    except Exception as exc:
        logger.error(
            "Scene %d render failed for %s: %s",
            scene_index,
            generation_id,
            exc,
        )
        raise self.retry(exc=exc)

    cost = estimate_gpu_cost(tier, duration_seconds)

    return {
        "scene_index": scene_index,
        "status": GenerationStatus.PROCESSING.value,
        "runpod_job_id": result.get("id"),
        "cost_usd": cost,
        "duration_seconds": duration_seconds,
    }


@celery_app.task(
    bind=True,
    name="app.tasks.video_tasks.stitch_scenes",
    max_retries=2,
    default_retry_delay=30,
)
def stitch_scenes(
    self,
    scene_results: list[dict[str, Any]],
    *,
    generation_id: str,
    user_id: str,
    resolution: str,
    add_watermark: bool,
) -> dict[str, Any]:
    """Download rendered scenes from R2, stitch via FFmpeg, and upload final.

    This task is the chord callback – it runs after all ``render_scene``
    tasks complete.
    """
    from app.core.ffmpeg_pipeline import (
        add_watermark as apply_watermark,
        extract_thumbnail,
        stitch_scenes as ffmpeg_stitch,
    )

    logger.info(
        "Stitching %d scenes for %s", len(scene_results), generation_id
    )

    with tempfile.TemporaryDirectory() as tmpdir:
        tmp = Path(tmpdir)

        # Collect scene files (already uploaded to R2 by webhook handler)
        scene_paths: list[Path] = []
        for sr in sorted(scene_results, key=lambda s: s["scene_index"]):
            scene_path = tmp / f"scene_{sr['scene_index']}.mp4"
            r2_key = build_scene_key(user_id, generation_id, sr["scene_index"])
            from app.storage.r2_client import download_file

            download_file(r2_key, str(scene_path))
            scene_paths.append(scene_path)

        # Stitch
        stitched_path = tmp / "stitched.mp4"
        res = VideoResolution(resolution)
        ffmpeg_resolution = get_ffmpeg_resolution(res)
        ffmpeg_stitch(scene_paths, stitched_path, target_resolution=ffmpeg_resolution)

        # Watermark (free tier)
        final_path = stitched_path
        if add_watermark:
            watermarked_path = tmp / "watermarked.mp4"
            apply_watermark(stitched_path, watermarked_path)
            final_path = watermarked_path

        # Thumbnail
        thumb_path = tmp / "thumbnail.jpg"
        extract_thumbnail(final_path, thumb_path)

        # Upload final video + thumbnail to R2
        video_key = build_video_key(user_id, generation_id)
        thumb_key = build_thumbnail_key(user_id, generation_id)

        video_url = upload_file(video_key, str(final_path))
        thumbnail_url = upload_file(thumb_key, str(thumb_path), content_type="image/jpeg")

    total_cost = sum(sr.get("cost_usd", 0) for sr in scene_results)

    return {
        "generation_id": generation_id,
        "status": GenerationStatus.COMPLETED.value,
        "video_url": video_url,
        "thumbnail_url": thumbnail_url,
        "total_cost_usd": total_cost,
        "scenes_count": len(scene_results),
    }


@celery_app.task(
    bind=True,
    name="app.tasks.video_tasks.generate_draft_preview",
    max_retries=1,
    default_retry_delay=10,
    rate_limit="10/s",
)
def generate_draft_preview(
    self,
    *,
    generation_id: str,
    user_id: str,
    prompt: str,
    duration_seconds: float = 5.0,
) -> dict[str, Any]:
    """Generate a low-cost draft preview using the LTX model on a 4090.

    Draft mode is mandatory before full render to prevent wasted GPU spend.
    Uses 480p resolution and a fast, cheap model.
    """
    payload = {
        "prompt": prompt,
        "num_frames": int(duration_seconds * 24),
        "fps": 24,
        "width": 854,
        "height": 480,
    }

    webhook_url = (
        f"{settings.WEBHOOK_BASE_URL}/api/webhooks/runpod"
        f"?generationId={generation_id}&draft=true"
    )

    try:
        result = asyncio.get_event_loop().run_until_complete(
            submit_job(GPUTier.RTX_4090, payload, webhook_url=webhook_url)
        )
    except Exception as exc:
        logger.error("Draft preview failed for %s: %s", generation_id, exc)
        raise self.retry(exc=exc)

    cost = estimate_gpu_cost(GPUTier.RTX_4090, duration_seconds)

    return {
        "generation_id": generation_id,
        "status": GenerationStatus.DRAFT_PREVIEW.value,
        "runpod_job_id": result.get("id"),
        "cost_usd": cost,
    }

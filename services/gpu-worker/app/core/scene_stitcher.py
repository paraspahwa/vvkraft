"""Scene stitching engine.

Splits long video requests into individual scenes (≤10 s each), dispatches
them to RunPod for rendering, and stitches the results via FFmpeg.
"""

from __future__ import annotations

import logging
import math
from typing import Optional

from app.models.schemas import (
    AspectRatio,
    GenerationRequest,
    GPUTier,
    Scene,
    SceneResult,
    VideoResolution,
)

logger = logging.getLogger(__name__)

# Maximum duration for a single scene render (seconds)
MAX_SCENE_DURATION = 10.0

# Resolution strings for FFmpeg (width x height)
RESOLUTION_MAP: dict[VideoResolution, str] = {
    VideoResolution.P480: "854:480",
    VideoResolution.P720: "1280:720",
    VideoResolution.P1080: "1920:1080",
}


def split_into_scenes(request: GenerationRequest) -> list[Scene]:
    """Break a generation request into ordered scenes of ≤10 s each.

    Scene-based rendering is cheaper and more resilient than rendering an
    entire long video in one shot:

    * Each scene can be retried independently on failure.
    * Scenes can be processed in parallel.
    * GPU cost is lower because shorter renders fit into serverless windows.

    For requests ≤10 s, a single scene is returned unchanged.
    """
    total = request.duration_seconds
    if total <= MAX_SCENE_DURATION:
        return [
            Scene(
                scene_index=0,
                prompt=request.prompt,
                duration_seconds=total,
                negative_prompt=request.negative_prompt,
                reference_image_url=request.reference_image_url,
            )
        ]

    num_scenes = math.ceil(total / MAX_SCENE_DURATION)
    base_duration = total / num_scenes

    scenes: list[Scene] = []
    for i in range(num_scenes):
        scene_prompt = _build_scene_prompt(request.prompt, i, num_scenes)
        scenes.append(
            Scene(
                scene_index=i,
                prompt=scene_prompt,
                duration_seconds=round(base_duration, 2),
                negative_prompt=request.negative_prompt,
                reference_image_url=request.reference_image_url,
            )
        )

    logger.info(
        "Split generation %s into %d scenes (%.1fs each)",
        request.generation_id,
        num_scenes,
        base_duration,
    )
    return scenes


def get_ffmpeg_resolution(resolution: VideoResolution) -> str:
    """Return an FFmpeg-compatible resolution string."""
    return RESOLUTION_MAP.get(resolution, "1280:720")


def calculate_scene_cost(
    gpu_tier: GPUTier,
    duration_seconds: float,
) -> float:
    """Estimate GPU cost in USD for rendering a single scene."""
    from app.core.runpod_client import GPU_COST_PER_SECOND

    render_time = duration_seconds * 3.0  # 3x overhead estimate
    return GPU_COST_PER_SECOND[gpu_tier] * render_time


def build_scene_render_payload(
    scene: Scene,
    resolution: VideoResolution,
    aspect_ratio: AspectRatio,
    seed: Optional[int] = None,
    motion_strength: Optional[float] = None,
) -> dict:
    """Build the RunPod input payload for rendering a single scene."""
    payload: dict = {
        "prompt": scene.prompt,
        "num_frames": int(scene.duration_seconds * 24),
        "fps": 24,
        "width": _resolution_width(resolution, aspect_ratio),
        "height": _resolution_height(resolution, aspect_ratio),
    }

    if scene.negative_prompt:
        payload["negative_prompt"] = scene.negative_prompt
    if scene.reference_image_url:
        payload["image_url"] = scene.reference_image_url
    if seed is not None:
        payload["seed"] = seed
    if motion_strength is not None:
        payload["motion_strength"] = motion_strength

    return payload


# ── Helpers ────────────────────────────────────────────────────────────────────


def _build_scene_prompt(base_prompt: str, index: int, total: int) -> str:
    """Augment the base prompt with scene continuity hints."""
    if total == 1:
        return base_prompt

    position_map = {0: "opening", total - 1: "closing"}
    position = position_map.get(index, "middle")
    return f"[Scene {index + 1}/{total} – {position}] {base_prompt}"


def _resolution_width(resolution: VideoResolution, aspect: AspectRatio) -> int:
    base = {VideoResolution.P480: 854, VideoResolution.P720: 1280, VideoResolution.P1080: 1920}
    w = base.get(resolution, 1280)
    if aspect == AspectRatio.PORTRAIT:
        return base.get(resolution, 720) // 2 + base.get(resolution, 720) // 2  # keep it at ~720 for portrait
    if aspect == AspectRatio.SQUARE:
        h_map = {VideoResolution.P480: 480, VideoResolution.P720: 720, VideoResolution.P1080: 1080}
        return h_map.get(resolution, 720)
    return w


def _resolution_height(resolution: VideoResolution, aspect: AspectRatio) -> int:
    base = {VideoResolution.P480: 480, VideoResolution.P720: 720, VideoResolution.P1080: 1080}
    h = base.get(resolution, 720)
    if aspect == AspectRatio.PORTRAIT:
        w_map = {VideoResolution.P480: 854, VideoResolution.P720: 1280, VideoResolution.P1080: 1920}
        return w_map.get(resolution, 1280)
    if aspect == AspectRatio.SQUARE:
        return h
    return h

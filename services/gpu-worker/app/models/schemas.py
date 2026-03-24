"""Pydantic models / schemas for the GPU worker service."""

from __future__ import annotations

from enum import Enum
from typing import Optional

from pydantic import BaseModel, Field


# ── Enums ──────────────────────────────────────────────────────────────────────


class SubscriptionTier(str, Enum):
    FREE = "free"
    CREATOR = "creator"
    PRO = "pro"
    STUDIO = "studio"


class GPUTier(str, Enum):
    RTX_4090 = "rtx_4090"
    A100 = "a100"


class GenerationStatus(str, Enum):
    PENDING = "pending"
    DRAFT_PREVIEW = "draft_preview"
    QUEUED = "queued"
    PROCESSING = "processing"
    STITCHING = "stitching"
    COMPLETED = "completed"
    FAILED = "failed"


class VideoResolution(str, Enum):
    P480 = "480p"
    P720 = "720p"
    P1080 = "1080p"


class AspectRatio(str, Enum):
    LANDSCAPE = "16:9"
    PORTRAIT = "9:16"
    SQUARE = "1:1"


# ── Scene models ───────────────────────────────────────────────────────────────


class Scene(BaseModel):
    """A single scene within a video generation request."""

    scene_index: int = Field(ge=0)
    prompt: str
    duration_seconds: float = Field(gt=0, le=10.0)
    negative_prompt: Optional[str] = None
    reference_image_url: Optional[str] = None


class SceneResult(BaseModel):
    """Result of processing a single scene."""

    scene_index: int
    status: GenerationStatus
    video_url: Optional[str] = None
    r2_key: Optional[str] = None
    duration_seconds: float = 0.0
    cost_usd: float = 0.0
    error_message: Optional[str] = None
    retry_count: int = 0


# ── Generation request / response ─────────────────────────────────────────────


class GenerationRequest(BaseModel):
    """Full video generation request from the Next.js frontend."""

    generation_id: str
    user_id: str
    prompt: str
    negative_prompt: Optional[str] = None
    duration_seconds: float = Field(gt=0, le=120.0)
    resolution: VideoResolution = VideoResolution.P720
    aspect_ratio: AspectRatio = AspectRatio.LANDSCAPE
    seed: Optional[int] = None
    motion_strength: Optional[float] = Field(default=None, ge=0.0, le=1.0)
    reference_image_url: Optional[str] = None
    character_id: Optional[str] = None
    tier: SubscriptionTier = SubscriptionTier.FREE
    draft_mode: bool = True


class GenerationResponse(BaseModel):
    """Response returned after enqueueing a generation."""

    generation_id: str
    status: GenerationStatus
    total_scenes: int
    estimated_cost_usd: float
    gpu_tier: GPUTier
    message: str


class GenerationStatusResponse(BaseModel):
    """Status of a generation job."""

    generation_id: str
    status: GenerationStatus
    scenes: list[SceneResult] = []
    final_video_url: Optional[str] = None
    total_cost_usd: float = 0.0
    error_message: Optional[str] = None


# ── Draft preview ──────────────────────────────────────────────────────────────


class DraftPreviewRequest(BaseModel):
    """Request for a low-cost draft preview."""

    generation_id: str
    user_id: str
    prompt: str
    duration_seconds: float = Field(default=5.0, le=10.0)
    resolution: VideoResolution = VideoResolution.P480


class DraftPreviewResponse(BaseModel):
    """Response for a draft preview."""

    generation_id: str
    status: GenerationStatus
    preview_url: Optional[str] = None
    cost_usd: float = 0.0


# ── Cost / metrics ─────────────────────────────────────────────────────────────


class CostBreakdown(BaseModel):
    """Detailed cost breakdown for a generation."""

    gpu_cost_usd: float = 0.0
    storage_cost_usd: float = 0.0
    processing_cost_usd: float = 0.0
    total_cost_usd: float = 0.0
    cached: bool = False


class UserMetrics(BaseModel):
    """Per-user profit/cost tracking."""

    user_id: str
    revenue_usd: float = 0.0
    cost_usd: float = 0.0
    profit_usd: float = 0.0
    videos_generated: int = 0
    retry_rate: float = 0.0
    gpu_usage_seconds: float = 0.0


# ── Webhook ────────────────────────────────────────────────────────────────────


class RunPodWebhookPayload(BaseModel):
    """Payload received from RunPod on job completion."""

    id: str
    status: str
    output: Optional[dict] = None
    error: Optional[str] = None
    execution_time: Optional[float] = None


# ── Health ─────────────────────────────────────────────────────────────────────


class HealthResponse(BaseModel):
    """Health check response."""

    status: str = "ok"
    service: str = "gpu-worker"
    redis_connected: bool = False
    celery_active: bool = False

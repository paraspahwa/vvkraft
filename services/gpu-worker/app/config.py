"""Configuration for the GPU worker service."""

from __future__ import annotations

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    # ── App ────────────────────────────────────────────────────────────────────
    APP_NAME: str = "videoforge-gpu-worker"
    DEBUG: bool = False

    # ── Redis / Celery ─────────────────────────────────────────────────────────
    REDIS_URL: str = "redis://localhost:6379/0"
    CELERY_BROKER_URL: str = "redis://localhost:6379/0"
    CELERY_RESULT_BACKEND: str = "redis://localhost:6379/1"

    # ── RunPod ─────────────────────────────────────────────────────────────────
    RUNPOD_API_KEY: str = ""
    RUNPOD_ENDPOINT_4090: str = ""
    RUNPOD_ENDPOINT_A100: str = ""

    # ── Cloudflare R2 ──────────────────────────────────────────────────────────
    R2_ACCOUNT_ID: str = ""
    R2_ACCESS_KEY_ID: str = ""
    R2_SECRET_ACCESS_KEY: str = ""
    R2_BUCKET_NAME: str = "videoforge"
    R2_PUBLIC_URL: str = ""

    # ── Webhook ────────────────────────────────────────────────────────────────
    WEBHOOK_BASE_URL: str = "http://localhost:3000"
    WEBHOOK_SECRET: str = ""

    # ── Cost thresholds ────────────────────────────────────────────────────────
    MAX_COST_PER_VIDEO_USD: float = 0.10
    COST_ALERT_THRESHOLD_USD: float = 0.05

    model_config = {"env_file": ".env", "env_file_encoding": "utf-8"}


settings = Settings()

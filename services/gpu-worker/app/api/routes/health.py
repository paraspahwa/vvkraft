"""Health and diagnostics routes."""

from __future__ import annotations

import logging

import redis
from fastapi import APIRouter

from app.config import settings
from app.models.schemas import HealthResponse

logger = logging.getLogger(__name__)

router = APIRouter(tags=["health"])


@router.get("/health", response_model=HealthResponse)
async def health_check() -> HealthResponse:
    """Return service health including Redis and Celery connectivity."""
    redis_ok = False
    celery_ok = False

    # Check Redis
    try:
        r = redis.from_url(settings.REDIS_URL, socket_connect_timeout=2)
        r.ping()
        redis_ok = True
    except Exception:
        logger.warning("Redis health check failed")

    # Check Celery (inspect active workers)
    try:
        from app.tasks.celery_app import celery_app

        inspector = celery_app.control.inspect(timeout=2)
        active = inspector.active()
        celery_ok = active is not None
    except Exception:
        logger.warning("Celery health check failed")

    return HealthResponse(
        status="ok" if redis_ok else "degraded",
        redis_connected=redis_ok,
        celery_active=celery_ok,
    )

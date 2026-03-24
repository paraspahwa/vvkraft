"""Celery application configuration.

Uses Redis as both broker and result backend. Task routing sends
video generation jobs to a dedicated ``gpu`` queue.
"""

from __future__ import annotations

from celery import Celery

from app.config import settings

celery_app = Celery(
    "videoforge",
    broker=settings.CELERY_BROKER_URL,
    backend=settings.CELERY_RESULT_BACKEND,
)

celery_app.conf.update(
    # Serialization
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    # Routing
    task_routes={
        "app.tasks.video_tasks.generate_video": {"queue": "gpu"},
        "app.tasks.video_tasks.render_scene": {"queue": "gpu"},
        "app.tasks.video_tasks.stitch_scenes": {"queue": "default"},
        "app.tasks.video_tasks.generate_draft_preview": {"queue": "gpu"},
    },
    # Reliability
    task_acks_late=True,
    worker_prefetch_multiplier=1,
    # Result expiry
    result_expires=3600,
    # Rate limiting (protect RunPod endpoints)
    worker_max_tasks_per_child=100,
)

celery_app.autodiscover_tasks(["app.tasks"])

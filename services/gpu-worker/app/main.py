"""FastAPI application entry point.

CORE SYSTEM (FINAL ARCHITECTURE)
─────────────────────────────────
Frontend  → Next.js  (apps/web)
Backend   → FastAPI  (this service)
Queue     → Redis + Celery
GPU       → RunPod (4090 + A100 mix)
Storage   → Cloudflare R2
Processing→ FFmpeg pipeline
"""

from __future__ import annotations

import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes.generation import router as generation_router
from app.api.routes.health import router as health_router
from app.config import settings

logging.basicConfig(
    level=logging.DEBUG if settings.DEBUG else logging.INFO,
    format="%(asctime)s %(levelname)s [%(name)s] %(message)s",
)

app = FastAPI(
    title="VideoForge GPU Worker",
    description=(
        "FastAPI backend for GPU-accelerated video generation. "
        "Manages RunPod dispatch, Celery task queues, FFmpeg processing, "
        "and Cloudflare R2 storage."
    ),
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routes ─────────────────────────────────────────────────────────────────────

app.include_router(health_router, prefix="/api")
app.include_router(generation_router, prefix="/api")


@app.get("/")
async def root():
    return {
        "service": "videoforge-gpu-worker",
        "architecture": {
            "frontend": "Next.js",
            "backend": "FastAPI",
            "queue": "Redis + Celery",
            "gpu": "RunPod (4090 + A100 mix)",
            "storage": "Cloudflare R2",
            "processing": "FFmpeg pipeline",
        },
    }

"""Tests for the FastAPI endpoints."""

from __future__ import annotations

from unittest.mock import patch

import pytest
from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


class TestRootEndpoint:
    def test_root_returns_architecture(self):
        response = client.get("/")
        assert response.status_code == 200
        data = response.json()
        assert data["service"] == "videoforge-gpu-worker"
        assert data["architecture"]["frontend"] == "Next.js"
        assert data["architecture"]["backend"] == "FastAPI"
        assert data["architecture"]["queue"] == "Redis + Celery"
        assert data["architecture"]["gpu"] == "RunPod (4090 + A100 mix)"
        assert data["architecture"]["storage"] == "Cloudflare R2"
        assert data["architecture"]["processing"] == "FFmpeg pipeline"


class TestHealthEndpoint:
    def test_health_returns_response(self):
        response = client.get("/api/health")
        assert response.status_code == 200
        data = response.json()
        assert data["service"] == "gpu-worker"
        assert "redis_connected" in data
        assert "celery_active" in data


class TestGenerationEndpoint:
    @patch("app.api.routes.generation.generate_draft_preview")
    def test_create_generation_draft_mode(self, mock_task):
        mock_task.apply_async.return_value = None
        payload = {
            "generation_id": "gen-test-001",
            "user_id": "user-001",
            "prompt": "A cat in space",
            "duration_seconds": 5.0,
            "tier": "free",
            "draft_mode": True,
        }
        response = client.post("/api/generation/create", json=payload)
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "draft_preview"
        assert data["generation_id"] == "gen-test-001"
        assert data["gpu_tier"] == "rtx_4090"
        mock_task.apply_async.assert_called_once()

    @patch("app.api.routes.generation.generate_video")
    def test_create_generation_full_render(self, mock_task):
        mock_task.apply_async.return_value = None
        payload = {
            "generation_id": "gen-test-002",
            "user_id": "user-001",
            "prompt": "A sunset over mountains",
            "duration_seconds": 5.0,
            "tier": "pro",
            "draft_mode": False,
        }
        response = client.post("/api/generation/create", json=payload)
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "queued"
        assert data["gpu_tier"] == "a100"
        mock_task.apply_async.assert_called_once()

    def test_invalid_duration_rejected(self):
        payload = {
            "generation_id": "gen-test-003",
            "user_id": "user-001",
            "prompt": "test",
            "duration_seconds": 0,
        }
        response = client.post("/api/generation/create", json=payload)
        assert response.status_code == 422

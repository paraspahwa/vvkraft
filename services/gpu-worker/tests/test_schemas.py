"""Tests for Pydantic schemas."""

from __future__ import annotations

import pytest
from pydantic import ValidationError

from app.models.schemas import (
    AspectRatio,
    GenerationRequest,
    Scene,
    SubscriptionTier,
    VideoResolution,
)


class TestGenerationRequest:
    def test_valid_request(self):
        req = GenerationRequest(
            generation_id="gen-001",
            user_id="user-001",
            prompt="A sunset over the ocean",
            duration_seconds=10.0,
        )
        assert req.generation_id == "gen-001"
        assert req.draft_mode is True  # default

    def test_duration_must_be_positive(self):
        with pytest.raises(ValidationError):
            GenerationRequest(
                generation_id="gen-001",
                user_id="user-001",
                prompt="test",
                duration_seconds=0,
            )

    def test_duration_max_120(self):
        with pytest.raises(ValidationError):
            GenerationRequest(
                generation_id="gen-001",
                user_id="user-001",
                prompt="test",
                duration_seconds=121,
            )

    def test_motion_strength_range(self):
        with pytest.raises(ValidationError):
            GenerationRequest(
                generation_id="gen-001",
                user_id="user-001",
                prompt="test",
                duration_seconds=5,
                motion_strength=1.5,
            )


class TestScene:
    def test_valid_scene(self):
        scene = Scene(scene_index=0, prompt="test", duration_seconds=5.0)
        assert scene.scene_index == 0

    def test_scene_index_non_negative(self):
        with pytest.raises(ValidationError):
            Scene(scene_index=-1, prompt="test", duration_seconds=5.0)

    def test_scene_duration_positive(self):
        with pytest.raises(ValidationError):
            Scene(scene_index=0, prompt="test", duration_seconds=0)

    def test_scene_duration_max_10(self):
        with pytest.raises(ValidationError):
            Scene(scene_index=0, prompt="test", duration_seconds=11.0)

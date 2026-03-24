"""Tests for the scene stitcher engine."""

from __future__ import annotations

import pytest

from app.core.scene_stitcher import (
    split_into_scenes,
    get_ffmpeg_resolution,
    build_scene_render_payload,
    MAX_SCENE_DURATION,
)
from app.models.schemas import (
    AspectRatio,
    GenerationRequest,
    VideoResolution,
)


def _make_request(**overrides) -> GenerationRequest:
    defaults = {
        "generation_id": "test-gen-001",
        "user_id": "user-001",
        "prompt": "A cat walking in a garden",
        "duration_seconds": 5.0,
        "resolution": VideoResolution.P720,
        "aspect_ratio": AspectRatio.LANDSCAPE,
        "tier": "free",
        "draft_mode": False,
    }
    defaults.update(overrides)
    return GenerationRequest(**defaults)


class TestSplitIntoScenes:
    """Tests for split_into_scenes()."""

    def test_short_video_single_scene(self):
        request = _make_request(duration_seconds=5.0)
        scenes = split_into_scenes(request)
        assert len(scenes) == 1
        assert scenes[0].scene_index == 0
        assert scenes[0].duration_seconds == 5.0
        assert scenes[0].prompt == "A cat walking in a garden"

    def test_exactly_max_duration_single_scene(self):
        request = _make_request(duration_seconds=MAX_SCENE_DURATION)
        scenes = split_into_scenes(request)
        assert len(scenes) == 1

    def test_long_video_splits_into_scenes(self):
        request = _make_request(duration_seconds=30.0)
        scenes = split_into_scenes(request)
        assert len(scenes) == 3
        for scene in scenes:
            assert scene.duration_seconds == 10.0

    def test_uneven_duration_splits_evenly(self):
        request = _make_request(duration_seconds=25.0)
        scenes = split_into_scenes(request)
        assert len(scenes) == 3
        total = sum(s.duration_seconds for s in scenes)
        assert abs(total - 25.0) < 0.1

    def test_scene_indices_are_sequential(self):
        request = _make_request(duration_seconds=50.0)
        scenes = split_into_scenes(request)
        indices = [s.scene_index for s in scenes]
        assert indices == list(range(len(scenes)))

    def test_scene_prompts_include_position(self):
        request = _make_request(duration_seconds=30.0)
        scenes = split_into_scenes(request)
        assert "[Scene 1/3 – opening]" in scenes[0].prompt
        assert "[Scene 2/3 – middle]" in scenes[1].prompt
        assert "[Scene 3/3 – closing]" in scenes[2].prompt

    def test_negative_prompt_propagated(self):
        request = _make_request(
            duration_seconds=20.0,
            negative_prompt="blurry, low quality",
        )
        scenes = split_into_scenes(request)
        for scene in scenes:
            assert scene.negative_prompt == "blurry, low quality"

    def test_reference_image_propagated(self):
        request = _make_request(
            duration_seconds=20.0,
            reference_image_url="https://example.com/ref.jpg",
        )
        scenes = split_into_scenes(request)
        for scene in scenes:
            assert scene.reference_image_url == "https://example.com/ref.jpg"


class TestGetFfmpegResolution:
    def test_480p(self):
        assert get_ffmpeg_resolution(VideoResolution.P480) == "854:480"

    def test_720p(self):
        assert get_ffmpeg_resolution(VideoResolution.P720) == "1280:720"

    def test_1080p(self):
        assert get_ffmpeg_resolution(VideoResolution.P1080) == "1920:1080"


class TestBuildSceneRenderPayload:
    def test_basic_payload(self):
        from app.models.schemas import Scene

        scene = Scene(scene_index=0, prompt="test prompt", duration_seconds=5.0)
        payload = build_scene_render_payload(
            scene=scene,
            resolution=VideoResolution.P720,
            aspect_ratio=AspectRatio.LANDSCAPE,
        )
        assert payload["prompt"] == "test prompt"
        assert payload["num_frames"] == 120  # 5s * 24fps
        assert payload["fps"] == 24
        assert "negative_prompt" not in payload

    def test_optional_params_included(self):
        from app.models.schemas import Scene

        scene = Scene(
            scene_index=0,
            prompt="test",
            duration_seconds=5.0,
            negative_prompt="blur",
            reference_image_url="https://example.com/img.jpg",
        )
        payload = build_scene_render_payload(
            scene=scene,
            resolution=VideoResolution.P720,
            aspect_ratio=AspectRatio.LANDSCAPE,
            seed=42,
            motion_strength=0.5,
        )
        assert payload["negative_prompt"] == "blur"
        assert payload["image_url"] == "https://example.com/img.jpg"
        assert payload["seed"] == 42
        assert payload["motion_strength"] == 0.5

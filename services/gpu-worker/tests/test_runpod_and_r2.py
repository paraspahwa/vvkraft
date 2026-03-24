"""Tests for the RunPod client and R2 storage key builders."""

from __future__ import annotations

import pytest

from app.core.runpod_client import estimate_gpu_cost, get_gpu_tier
from app.models.schemas import GPUTier, SubscriptionTier
from app.storage.r2_client import (
    build_draft_key,
    build_scene_key,
    build_thumbnail_key,
    build_video_key,
)


class TestGetGpuTier:
    def test_free_maps_to_3060(self):
        assert get_gpu_tier(SubscriptionTier.FREE) == GPUTier.RTX_3060

    def test_studio_maps_to_a100(self):
        assert get_gpu_tier(SubscriptionTier.STUDIO) == GPUTier.A100


class TestEstimateGpuCost:
    def test_cost_positive(self):
        cost = estimate_gpu_cost(GPUTier.RTX_4090, 10.0)
        assert cost > 0

    def test_a100_more_expensive(self):
        cost_4090 = estimate_gpu_cost(GPUTier.RTX_4090, 10.0)
        cost_a100 = estimate_gpu_cost(GPUTier.A100, 10.0)
        assert cost_a100 > cost_4090

    def test_longer_duration_costs_more(self):
        short = estimate_gpu_cost(GPUTier.RTX_4090, 5.0)
        long = estimate_gpu_cost(GPUTier.RTX_4090, 30.0)
        assert long > short


class TestR2KeyBuilders:
    def test_video_key(self):
        key = build_video_key("u1", "g1")
        assert key == "videos/u1/g1/output.mp4"

    def test_scene_key(self):
        key = build_scene_key("u1", "g1", 2)
        assert key == "videos/u1/g1/scene_2.mp4"

    def test_thumbnail_key(self):
        key = build_thumbnail_key("u1", "g1")
        assert key == "videos/u1/g1/thumbnail.jpg"

    def test_draft_key(self):
        key = build_draft_key("u1", "g1")
        assert key == "videos/u1/g1/draft_preview.mp4"

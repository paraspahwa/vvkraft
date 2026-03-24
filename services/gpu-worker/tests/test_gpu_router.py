"""Tests for the GPU router."""

from __future__ import annotations

import pytest

from app.core.gpu_router import route_gpu
from app.models.schemas import GPUTier, SubscriptionTier, VideoResolution


class TestRouteGpu:
    def test_free_tier_gets_3060(self):
        result = route_gpu(SubscriptionTier.FREE)
        assert result.gpu_tier == GPUTier.RTX_3060

    def test_creator_tier_gets_4090(self):
        result = route_gpu(SubscriptionTier.CREATOR)
        assert result.gpu_tier == GPUTier.RTX_4090

    def test_pro_tier_gets_a100(self):
        result = route_gpu(SubscriptionTier.PRO)
        assert result.gpu_tier == GPUTier.A100

    def test_studio_tier_gets_a100(self):
        result = route_gpu(SubscriptionTier.STUDIO)
        assert result.gpu_tier == GPUTier.A100

    def test_free_tier_has_lowest_priority(self):
        free = route_gpu(SubscriptionTier.FREE)
        studio = route_gpu(SubscriptionTier.STUDIO)
        assert free.queue_priority > studio.queue_priority

    def test_studio_has_highest_priority(self):
        result = route_gpu(SubscriptionTier.STUDIO)
        assert result.queue_priority == 1

    def test_free_tier_max_duration(self):
        result = route_gpu(SubscriptionTier.FREE)
        assert result.max_duration_seconds == 5.0

    def test_pro_tier_max_duration(self):
        result = route_gpu(SubscriptionTier.PRO)
        assert result.max_duration_seconds == 15.0

    def test_free_tier_resolution_limited(self):
        result = route_gpu(SubscriptionTier.FREE)
        assert result.max_resolution == VideoResolution.P480

    def test_pro_tier_resolution(self):
        result = route_gpu(SubscriptionTier.PRO)
        assert result.max_resolution == VideoResolution.P1080

    def test_free_tier_has_watermark(self):
        result = route_gpu(SubscriptionTier.FREE)
        assert result.add_watermark is True

    def test_paid_tier_no_watermark(self):
        for tier in [SubscriptionTier.CREATOR, SubscriptionTier.PRO, SubscriptionTier.STUDIO]:
            result = route_gpu(tier)
            assert result.add_watermark is False

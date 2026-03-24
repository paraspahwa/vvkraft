"""Tests for the cost optimiser."""

from __future__ import annotations

import pytest

from app.core.cost_optimizer import (
    calculate_cost_breakdown,
    evaluate_cost_policy,
)
from app.models.schemas import (
    GPUTier,
    SubscriptionTier,
    UserMetrics,
    VideoResolution,
)


class TestEvaluateCostPolicy:
    def test_free_tier_always_watermarked(self):
        metrics = UserMetrics(user_id="u1")
        policy = evaluate_cost_policy(SubscriptionTier.FREE, metrics)
        assert policy.add_watermark is True

    def test_paid_tier_no_watermark_by_default(self):
        metrics = UserMetrics(user_id="u1")
        policy = evaluate_cost_policy(SubscriptionTier.PRO, metrics)
        assert policy.add_watermark is False

    def test_high_cost_triggers_downgrade(self):
        metrics = UserMetrics(user_id="u1", cost_usd=0.45)
        policy = evaluate_cost_policy(SubscriptionTier.FREE, metrics)
        assert policy.downgrade_resolution is True
        assert policy.target_resolution == VideoResolution.P480

    def test_high_load_throttles_free_users(self):
        metrics = UserMetrics(user_id="u1")
        policy = evaluate_cost_policy(
            SubscriptionTier.FREE, metrics, system_load=0.9
        )
        assert policy.slow_queue is True

    def test_high_load_does_not_throttle_pro(self):
        metrics = UserMetrics(user_id="u1")
        policy = evaluate_cost_policy(
            SubscriptionTier.PRO, metrics, system_load=0.9
        )
        assert policy.slow_queue is False

    def test_near_ceiling_reduces_retries(self):
        metrics = UserMetrics(user_id="u1", cost_usd=4.50)
        policy = evaluate_cost_policy(SubscriptionTier.CREATOR, metrics)
        assert policy.limit_retries == 1


class TestCalculateCostBreakdown:
    def test_cached_returns_zero_cost(self):
        breakdown = calculate_cost_breakdown(
            GPUTier.RTX_4090, 10.0, 1, cached=True
        )
        assert breakdown.total_cost_usd == 0.0
        assert breakdown.cached is True

    def test_basic_cost_positive(self):
        breakdown = calculate_cost_breakdown(GPUTier.RTX_4090, 10.0, 1)
        assert breakdown.total_cost_usd > 0
        assert breakdown.gpu_cost_usd > 0

    def test_a100_more_expensive_than_4090(self):
        cost_4090 = calculate_cost_breakdown(GPUTier.RTX_4090, 10.0, 1)
        cost_a100 = calculate_cost_breakdown(GPUTier.A100, 10.0, 1)
        assert cost_a100.total_cost_usd > cost_4090.total_cost_usd

    def test_more_scenes_increase_cost(self):
        cost_1 = calculate_cost_breakdown(GPUTier.RTX_4090, 10.0, 1)
        cost_3 = calculate_cost_breakdown(GPUTier.RTX_4090, 10.0, 3)
        assert cost_3.total_cost_usd > cost_1.total_cost_usd

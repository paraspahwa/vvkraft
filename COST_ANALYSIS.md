# VideoForge — Complete Cost Analysis & Profitability Plan

> **Source of truth:** All figures are derived directly from the source files listed in each section. Primary references are `packages/shared/src/utils/pricing.ts`, `apps/web/lib/pricing.ts`, and `apps/web/server/routers/billing.ts`.

---

## Table of Contents

1. [Executive Summary — Profitability Strategy](#1-executive-summary--profitability-strategy)
2. [Credit System & Margin Model](#2-credit-system--margin-model)
3. [Subscription Plans — Global (USD)](#3-subscription-plans--global-usd)
4. [Subscription Plans — India (INR)](#4-subscription-plans--india-inr)
5. [Credit Packs (Top-ups) — Global & India](#5-credit-packs-top-ups--global--india)
6. [AI Model Pricing](#6-ai-model-pricing)
7. [Audio-on-Video Feature & Pricing](#7-audio-on-video-feature--pricing)
8. [Feature-Specific Costs](#8-feature-specific-costs)
9. [Tier Limits & Constraints](#9-tier-limits--constraints)
10. [Queue Priority System](#10-queue-priority-system)
11. [Profitability Analysis — Global Plans](#11-profitability-analysis--global-plans)
12. [Profitability Analysis — India Plans](#12-profitability-analysis--india-plans)
13. [Credit Pack Profitability](#13-credit-pack-profitability)
14. [Cost Examples & Calculations](#14-cost-examples--calculations)
15. [Infrastructure & Third-Party Services](#15-infrastructure--third-party-services)
16. [Billing & Payment Flow](#16-billing--payment-flow)
17. [Credit Transaction Tracking](#17-credit-transaction-tracking)
18. [Cost-Per-Use-Case Scenarios](#18-cost-per-use-case-scenarios)
19. [Revenue Projections](#19-revenue-projections)
20. [Environment Variables for Billing](#20-environment-variables-for-billing)
21. [Key Source Files](#21-key-source-files)

---

## 1. Executive Summary — Profitability Strategy

### Problem Identified

The previous pricing model had **zero margin** on API costs:

- 1 credit = $0.10 and credits were calculated at 1:1 with fal.ai API cost
- Included credits equalled subscription price in value ($19 plan → $19 API credits)
- Bulk credit packs gave up to 33% discount → **negative margin** on heavy users

### Solution: Platform Margin Multiplier

A **2.5× platform margin multiplier** is applied to all credit calculations:

```
Credits = ceil(API_COST_USD × 2.5 / $0.10)
```

| Metric | Before (no margin) | After (2.5× markup) |
|---|:---:|:---:|
| API cost burned per credit | $0.10 | **$0.04** |
| Gross margin per credit | 0% | **60%** |
| Worst-case Studio plan margin | 3% | **60%** |
| Bulk credit pack (1500) margin | **−44%** ¹ | **40%** |

> ¹ Previous 1500-credit pack: sold at $100 ($0.067/credit), but each credit burned $0.10 of API cost → total API cost $150 vs $100 revenue = −$50 loss (−44% margin) when users selected expensive models.

### Dual-Region Strategy

| Aspect | Global (USD) | India (INR) |
|---|---|---|
| Pricing | Full USD pricing | PPP-adjusted ~50% lower |
| Included credits | Full allocation | Reduced (proportional to price) |
| Margin target | ~60% | ~58% |
| Payment currency | USD | INR |

### Audio-on-Video

All paid plans now include audio generation. Models that produce audio cost **1.5× credits** (audio surcharge) to cover the higher API rate.

---

## 2. Credit System & Margin Model

> **Source:** `packages/shared/src/utils/pricing.ts` — `CREDIT_VALUE_USD`, `PLATFORM_MARGIN_MULTIPLIER`, `AUDIO_SURCHARGE_MULTIPLIER`

| Constant | Value | Purpose |
|---|---|---|
| `CREDIT_VALUE_USD` | **$0.10** | User-facing value of 1 credit |
| `PLATFORM_MARGIN_MULTIPLIER` | **2.5** | Markup on API cost before converting to credits |
| `AUDIO_SURCHARGE_MULTIPLIER` | **1.5** | Extra cost for audio-enabled generation |

### Credit Calculation Formula

```
Base Credits = ceil(MODEL_COST_PER_SECOND[model] × duration_s × 2.5 / $0.10)
```

With audio enabled:
```
Audio Credits = ceil(Base_Credits × 1.5)
```

### Margin Economics

| Item | Value |
|---|---|
| User pays per credit | $0.10 |
| API cost burned per credit | $0.04 (= $0.10 / 2.5) |
| **Gross margin per credit** | **$0.06 (60%)** |

All credit deductions happen **before** generation starts. On failure the credits are **fully refunded**.

---

## 3. Subscription Plans — Global (USD)

> **Source:** `apps/web/lib/pricing.ts` — `PRICING_PLANS`, `packages/shared/src/utils/pricing.ts` — `TIER_LIMITS`

### Monthly Pricing

| Plan | Monthly Price | Included Credits/Month | Credits API Value | Gross Margin |
|------|:---:|:---:|:---:|:---:|
| **Free** | $0 | 0 | $0 | — |
| **Creator** | $19 | 190 | $7.60 | **$11.40 (60%)** |
| **Pro** | $49 | 490 | $19.60 | **$29.40 (60%)** |
| **Studio** | $149 | 1,490 | $59.60 | **$89.40 (60%)** |

### Yearly Pricing (billed per month, charged annually)

| Plan | Monthly Equivalent | Annual Total | Annual Savings vs Monthly |
|------|:---:|:---:|:---:|
| **Free** | $0 | $0 | — |
| **Creator** | $15/mo | $180/yr | **$48/yr (21% off)** |
| **Pro** | $39/mo | $468/yr | **$120/yr (20% off)** |
| **Studio** | $119/mo | $1,428/yr | **$360/yr (20% off)** |

### Yearly Plan Margins

| Plan | Annual Revenue | Annual API Value | Annual Margin |
|------|:---:|:---:|:---:|
| **Creator** | $180 | $91.20 | **$88.80 (49%)** |
| **Pro** | $468 | $235.20 | **$232.80 (50%)** |
| **Studio** | $1,428 | $715.20 | **$712.80 (50%)** |

Even yearly plans (with 20% user discount) maintain **~50% gross margin**.

---

## 4. Subscription Plans — India (INR)

> Aggressive pricing targeting the Indian market. Real cost is hidden behind plan video limits, not credits, to maximise conversion.

### Monthly Pricing

| Plan | Display Name | Monthly Price (INR) | USD Equivalent | Included Videos | GPU | Gross Margin |
|------|---|:---:|:---:|:---:|:---:|:---:|
| **Free** | Free | ₹0 | $0 | 3/day | RTX 3060 | — |
| **Creator** | **Starter** | ₹399 | ~$4.75 | 50/month | RTX 4090 | **~85%** |
| **Pro** | **Creator** | ₹799 | ~$9.51 | 150/month | A100 | **~78%** |
| **Studio** | **Pro** | ₹1,299 | ~$15.46 | 400/month | A100 (priority) | **~69%** |

### Yearly Pricing (INR, per month billed annually)

| Plan | Display Name | Monthly Equivalent | Annual Total | Annual Savings vs Monthly |
|------|---|:---:|:---:|:---:|
| **Free** | Free | ₹0 | ₹0 | — |
| **Creator** | Starter | ₹319/mo | ₹3,828/yr | **₹960/yr (20% off)** |
| **Pro** | Creator | ₹639/mo | ₹7,668/yr | **₹1,920/yr (20% off)** |
| **Studio** | Pro | ₹1,039/mo | ₹12,468/yr | **₹3,120/yr (20% off)** |

### Hidden Controls Per Plan

| Plan | Display Name | Queue | Quality | Watermark |
|------|---|---|---|:---:|
| Free | Free | Slowest (priority 10) | 480p, RTX 3060 | ✅ |
| Creator | Starter | Slow (priority 7) | 720p, RTX 4090 | ❌ |
| Pro | Creator | Normal (priority 3) | 1080p, A100 | ❌ |
| Studio | Pro | Priority (priority 1) | 1080p, A100 | ❌ |

India users get the same model access per tier — volume limits and hidden quality controls protect margins.

---

## 5. Credit Packs (Top-ups) — Global & India

> **Source:** `apps/web/server/routers/billing.ts` — `CREDIT_PACKS`, `CREDIT_PACKS_INR`

### Global Credit Packs (USD)

| Pack | Price (USD) | Price per Credit | API Cost per Credit | Margin per Credit | Pack Margin |
|------|:---:|:---:|:---:|:---:|:---:|
| 50 credits | $5.00 | $0.100 | $0.040 | $0.060 | **60%** |
| 150 credits | $14.00 | $0.093 | $0.040 | $0.053 | **57%** |
| 500 credits | $40.00 | $0.080 | $0.040 | $0.040 | **50%** |
| 1,500 credits | $100.00 | $0.067 | $0.040 | $0.027 | **40%** |

### India Credit Packs (INR)

| Pack | Price (INR) | USD Equivalent | Price per Credit | Margin per Credit | Pack Margin |
|------|:---:|:---:|:---:|:---:|:---:|
| 50 credits | ₹399 | ~$4.75 | $0.095 | $0.055 | **58%** |
| 150 credits | ₹999 | ~$11.89 | $0.079 | $0.039 | **50%** |
| 500 credits | ₹2,999 | ~$35.70 | $0.071 | $0.031 | **44%** |
| 1,500 credits | ₹7,499 | ~$89.27 | $0.060 | $0.020 | **33%** |

All packs are **profitable** at every tier and region.

---

## 6. AI Model Pricing

> **Source:** `packages/shared/src/utils/pricing.ts` — `MODEL_COST_PER_SECOND`, `VIDEO_MODEL_CATALOG`

All 40+ models are billed via **fal.ai** on a per-second basis. The table below lists the representative rate at standard/720p quality. **User-facing credit costs include the 2.5× platform margin.**

### Longcat Family (Long-Form Optimised)

| Model ID | API Cost/s | Credits (5s) | Credits (60s) | Min Tier | Audio |
|---|:---:|:---:|:---:|:---:|:---:|
| `fal-ai/longcat-video/distilled/text-to-video/480p` | $0.0050 | 1 | 8 | Free | ❌ |
| `fal-ai/longcat-video/distilled/text-to-video/720p` | $0.0100 | 2 | 15 | Creator | ❌ |
| `fal-ai/longcat-video/text-to-video/480p` | $0.0250 | 4 | 38 | Creator | ❌ |
| `fal-ai/longcat-video/text-to-video/720p` | $0.0400 | 5 | 60 | Creator | ❌ |

### LTXV / LTX Family

| Model ID | API Cost/s | Credits (5s) | Credits (60s) | Min Tier | Audio |
|---|:---:|:---:|:---:|:---:|:---:|
| `fal-ai/ltxv-13b-098-distilled` | $0.0200 | 3 | 30 | Creator | ❌ |
| `fal-ai/ltx-2.3/text-to-video/fast` | $0.0400 | 5 | 60 | Creator | ✅ |
| `fal-ai/ltx-2-19b/distilled/text-to-video` | $0.0180 | 3 | 27 | Creator | ❌ |

### Kling Family (Premium)

| Model ID | API Cost/s | Credits (5s) | Credits (15s) | Min Tier | Audio |
|---|:---:|:---:|:---:|:---:|:---:|
| `fal-ai/kling-video/v2.6/pro/text-to-video` | $0.0700 | 9 | 27 | Pro | ✅ |
| `fal-ai/kling-video/v3/standard/text-to-video` | $0.0840 | 11 | 32 | Pro | ✅ |
| `fal-ai/kling-video/v3/pro/text-to-video` | **$0.2240** | 28 | 84 | Studio | ✅ |
| `fal-ai/kling-video/o3/standard/text-to-video` | $0.0840 | 11 | 32 | Pro | ✅ |
| `fal-ai/kling-video/o3/pro/text-to-video` | $0.1120 | 14 | 42 | Studio | ✅ |

### Avatar / UGC Models (with Audio)

| Model ID | API Cost/s | Credits (30s) | Min Tier | Audio |
|---|:---:|:---:|:---:|:---:|
| `fal-ai/heygen/avatar3/digital-twin` | $0.0340 | 26 | Studio | ✅ |
| `fal-ai/heygen/v2/video-agent` | $0.0340 | 26 | Studio | ✅ |
| `argil/avatars/text-to-video` | $0.0225 | 17 | Pro | ✅ |

### Other Models

| Model ID | API Cost/s | Min Tier | Audio |
|---|:---:|:---:|:---:|
| `fal-ai/hunyuan-video-v1.5/text-to-video` | **$0.00075** ⭐ cheapest | Creator | ❌ |
| `fal-ai/pixverse/v5.5/text-to-video` | $0.0400 | Pro | ✅ |
| `fal-ai/pixverse/v5.6/text-to-video` | $0.0900 | Studio | ✅ |
| `fal-ai/bytedance/seedance/v1.5/pro/text-to-video` | $0.0520 | Studio | ✅ |
| `veed/fabric-1.0/text` | $0.1500 | Studio | ❌ |

---

## 7. Audio-on-Video Feature & Pricing

> **Source:** `packages/shared/src/utils/pricing.ts` — `AUDIO_SURCHARGE_MULTIPLIER`, `calculateCreditsCostWithAudio()`

### Audio Surcharge

When a user enables **audio generation** on a supported model, credits cost **1.5× the base rate**.

| Scenario | Formula |
|---|---|
| Video only (no audio) | `ceil(API_COST × 2.5 / $0.10)` |
| Video + Audio | `ceil(ceil(API_COST × 2.5 / $0.10) × 1.5)` |

### Audio Cost Examples

| Model | 5s (no audio) | 5s (with audio) | 15s (no audio) | 15s (with audio) |
|---|:---:|:---:|:---:|:---:|
| Kling v2.6 Pro | 9 credits | 14 credits | 27 credits | 41 credits |
| Kling v3 Standard | 11 credits | 17 credits | 32 credits | 48 credits |
| LTX-2.3 Fast | 5 credits | 8 credits | 15 credits | 23 credits |
| Pixverse v5.5 | 5 credits | 8 credits | 15 credits | 23 credits |
| Seedance v1.5 Pro | 7 credits | 10 credits | 20 credits | 30 credits |

### Models Supporting Audio

| Model | Base API Cost/s | With Audio API Cost/s |
|---|:---:|:---:|
| Kling v2.6 Pro | $0.07 | $0.14 |
| Kling v3 Standard | $0.084 | $0.126–$0.154 |
| Kling v3 Pro | $0.224 | $0.224 (included) |
| Kling o3 Standard | $0.084 | $0.112 |
| Kling o3 Pro | $0.112 | $0.14 |
| LTX-2.3 Fast | $0.04 | $0.04 (included) |
| Pixverse v5.5 | $0.04 | +$0.05/clip |
| Pixverse v5.6 | $0.09 | +$0.45/clip |
| Seedance v1.5 Pro | $0.052 (no audio $0.026) | $0.052 |
| HeyGen Avatar3 | $0.034 | $0.034 (included) |
| HeyGen v2 Agent | $0.034 | $0.034 (included) |
| Argil Avatars | $0.0225 | $0.0225 (included) |

---

## 8. Feature-Specific Costs

> **Source:** `apps/web/server/routers/upscaler.ts` — `UPSCALE_CREDIT_COST`

### Video Upscaling (`/upscale`, `fal-ai/video-upscaler`)

| Quality Mode | Credit Cost | USD Equivalent | API Value | Margin |
|---|:---:|:---:|:---:|:---:|
| Standard | **10 credits** | $1.00 | ~$0.40 | 60% |
| Real-ESRGAN | **25 credits** | $2.50 | ~$1.00 | 60% |

---

## 9. Tier Limits & Constraints

> **Source:** `packages/shared/src/utils/pricing.ts` — `TIER_LIMITS`

### Duration Limits

| Tier | Max Short-Clip Duration | Max Long-Form Duration |
|------|:---:|:---:|
| Free | 5 s | _(disabled)_ |
| Creator | 10 s | 60 s |
| Pro | 15 s | 120 s (2 min) |
| Studio | 15 s | 120 s (2 min) |

### Quality & Feature Limits

| Feature | Free | Creator | Pro | Studio |
|---|:---:|:---:|:---:|:---:|
| Max Resolution | 480p | 720p | 1080p | 1080p |
| Watermark | ✅ Yes | ❌ No | ❌ No | ❌ No |
| Motion Control | ❌ | ❌ | ✅ | ✅ Advanced |
| Character Consistency | ❌ | ✅ | ✅ | ✅ |
| Audio-on-Video | ❌ | ✅ | ✅ | ✅ |
| Priority Queue | ❌ | ❌ | ✅ | ✅ |
| API Access | ❌ | ❌ | ❌ | ✅ |
| Long-Form Video | ❌ | ✅ (60 s) | ✅ (2 min) | ✅ (2 min) |

### Video Generation Limits

| Tier | Videos/Day | Videos/Month |
|------|:---:|:---:|
| Free | 3 | _(no monthly cap)_ |
| Creator | Unlimited | 50 |
| Pro | Unlimited | 200 |
| Studio | Unlimited | Unlimited |

---

## 10. Queue Priority System

> **Source:** `packages/shared/src/utils/pricing.ts` — `TIER_QUEUE_PRIORITY`

VideoForge uses **BullMQ** with **Redis**. Lower priority numbers are processed first.

| Tier | Priority Value | Processing Order |
|------|:---:|---|
| Studio | 1 | Highest — processed first |
| Pro | 3 | High |
| Creator | 5 | Medium |
| Free | 10 | Lowest |

---

## 11. Profitability Analysis — Global Plans

### Per-Subscriber Unit Economics (Monthly)

| Plan | Revenue | Max API Cost | Infra Cost Est. | **Net Margin** |
|------|:---:|:---:|:---:|:---:|
| Creator ($19) | $19.00 | $7.60 | ~$1.00 | **$10.40 (55%)** |
| Pro ($49) | $49.00 | $19.60 | ~$2.00 | **$27.40 (56%)** |
| Studio ($149) | $149.00 | $59.60 | ~$5.00 | **$84.40 (57%)** |

### Worst-Case Scenario (User Exhausts All Credits on Most Expensive Model)

| Plan | Credits | Kling v3 Pro Videos (84cr each) | API Cost | Revenue | Margin |
|------|:---:|:---:|:---:|:---:|:---:|
| Creator | 190 | 2 videos | $6.72 | $19 | **$12.28 (65%)** |
| Pro | 490 | 5 videos | $16.80 | $49 | **$32.20 (66%)** |
| Studio | 1,490 | 17 videos | $57.12 | $149 | **$91.88 (62%)** |

### Best-Case Scenario (User Uses Cheapest Model — Hunyuan v1.5)

| Plan | Credits | Hunyuan Videos (1cr each, 5s) | API Cost | Revenue | Margin |
|------|:---:|:---:|:---:|:---:|:---:|
| Creator | 190 | 190 videos | $0.71 | $19 | **$18.29 (96%)** |
| Pro | 490 | 490 videos | $1.84 | $49 | **$47.16 (96%)** |
| Studio | 1,490 | 1490 videos | $5.59 | $149 | **$143.41 (96%)** |

---

## 12. Profitability Analysis — India Plans

### Per-Subscriber Unit Economics (Monthly)

| Internal Tier | India Display Name | Revenue (INR) | Revenue (USD) | Video Limit | Est. GPU Cost | **Net Margin** |
|------|---|:---:|:---:|:---:|:---:|:---:|
| `creator` (₹399) | **Starter** | ₹399 | ~$4.75 | 50 videos | ~$0.70 | **~$4.05 (85%)** |
| `pro` (₹799) | **Creator** | ₹799 | ~$9.51 | 150 videos | ~$2.10 | **~$7.41 (78%)** |
| `studio` (₹1,299) | **Pro** | ₹1,299 | ~$15.46 | 400 videos | ~$4.76 | **~$10.70 (69%)** |

> GPU cost estimate assumes average 10s WAN 2.2 render per video. Real cost is lower due to scene cache hits and dynamic downgrade triggers.

### India Worst-Case (Kling v3 Pro on A100 — 30s video, 3 scenes)

| Internal Tier | India Display Name | Videos | Est. API Cost | Revenue | Margin |
|------|---|:---:|:---:|:---:|:---:|
| `creator` (₹399) | **Starter** | 50 | ~$1.08 | $4.75 | **$3.67 (77%)** |
| `pro` (₹799) | **Creator** | 150 | ~$3.24 | $9.51 | **$6.27 (66%)** |
| `studio` (₹1,299) | **Pro** | 400 | ~$8.64 | $15.46 | **$6.82 (44%)** |

> Worst case assumes every video uses max duration + most expensive model. Dynamic downgrade engine prevents this in practice.

---

## 13. Credit Pack Profitability

### Global (USD) — All Packs Profitable

| Pack | Revenue | Max API Value Burned | Margin | Margin % |
|------|:---:|:---:|:---:|:---:|
| 50 credits ($5) | $5.00 | $2.00 | $3.00 | **60%** |
| 150 credits ($14) | $14.00 | $6.00 | $8.00 | **57%** |
| 500 credits ($40) | $40.00 | $20.00 | $20.00 | **50%** |
| 1,500 credits ($100) | $100.00 | $60.00 | $40.00 | **40%** |

### India (INR) — All Packs Profitable

| Pack | Revenue (INR) | Revenue (USD) | Max API Value | Margin | Margin % |
|------|:---:|:---:|:---:|:---:|:---:|
| 50 credits (₹399) | ₹399 | ~$4.75 | $2.00 | $2.75 | **58%** |
| 150 credits (₹999) | ₹999 | ~$11.89 | $6.00 | $5.89 | **50%** |
| 500 credits (₹2,999) | ₹2,999 | ~$35.70 | $20.00 | $15.70 | **44%** |
| 1,500 credits (₹7,499) | ₹7,499 | ~$89.27 | $60.00 | $29.27 | **33%** |

---

## 14. Cost Examples & Calculations

### Formula

```
Base Credits = ceil(MODEL_COST_PER_SECOND[model] × duration_s × PLATFORM_MARGIN_MULTIPLIER / CREDIT_VALUE_USD)
Audio Credits = ceil(Base_Credits × AUDIO_SURCHARGE_MULTIPLIER)  // only if audio enabled
```

### Quick Reference: Credits per Video (with 2.5× margin)

| Model | 5 s | 10 s | 15 s | 60 s | 120 s |
|---|:---:|:---:|:---:|:---:|:---:|
| Hunyuan v1.5 (cheapest) | 1 | 1 | 1 | 2 | 3 |
| Longcat Distilled 480p | 1 | 2 | 2 | 8 | 15 |
| Longcat Distilled 720p | 2 | 3 | 4 | 15 | 30 |
| WAN 2.2 image-to-video | 1 | 1 | 1 | 4 | 8 |
| LTXV 13B (Distilled) | 3 | 5 | 8 | 30 | 60 |
| Kling v2.6 Pro | 9 | 18 | 27 | — | — |
| Kling v3 Standard | 11 | 21 | 32 | — | — |
| Kling o3 Pro | 14 | 28 | 42 | — | — |
| Kling v3 Pro (premium) | 28 | 56 | 84 | — | — |
| VEED Fabric 1.0 | 19 | 38 | 57 | — | — |

### Quick Reference: Credits per Video with Audio (1.5× surcharge)

| Model | 5 s | 10 s | 15 s |
|---|:---:|:---:|:---:|
| Kling v2.6 Pro (audio) | 14 | 27 | 41 |
| Kling v3 Standard (audio) | 17 | 32 | 48 |
| LTX-2.3 Fast (audio) | 8 | 15 | 23 |
| Pixverse v5.5 (audio) | 8 | 15 | 23 |
| Seedance v1.5 Pro (audio) | 10 | 20 | 30 |

### Example 1: Creator Tier — Light Usage (Global)

- **Plan:** Creator — $19/month — 190 credits
- **Task:** 20 × 10 s short clips using default model (WAN 2.2 i2v, $0.0025/s)
- **Per video:** ceil(0.0025 × 10 × 2.5 / 0.10) = 1 credit
- **Total:** 20 credits
- **API cost:** $0.50
- **Remaining credits:** 170
- **Margin on this user:** $19 − $0.50 = **$18.50 (97%)**

### Example 2: Pro Tier — Heavy Content Creator with Audio (Global)

- **Plan:** Pro — $49/month — 490 credits
- **Task:** 30 × 15 s clips using Kling v2.6 Pro with audio
- **Per video (audio):** 41 credits
- **Total:** 41 × 30 = 1,230 credits (exceeds 490 → need top-up)
- **Included usage:** 490 / 41 ≈ 11 videos, API cost: 11 × $0.07 × 15 = $11.55
- **Margin on included:** $49 − $11.55 = **$37.45 (76%)**
- **Top-up needed:** 740 credits → buy 500-pack ($40) + 150-pack ($14) = $54

### Example 3: Studio Tier — Production Workflow (Global)

- **Plan:** Studio — $149/month — 1,490 credits
- **Task A:** 10 × 15 s premium videos using Kling v3 Pro ($0.224/s) — 84 credits × 10 = **840 credits**
- **Task B:** 5 × 2-min long-form using Krea WAN 14B ($0.025/s) — ceil(0.025 × 120 × 2.5 / 0.10) = 75 credits × 5 = **375 credits**
- **Task C:** 5 × Real-ESRGAN upscales = 5 × 25 = **125 credits**
- **Total usage:** 840 + 375 + 125 = **1,340 credits** (within plan)
- **Total API cost:** (10 × $3.36) + (5 × $3.00) + (~$5.00) = $53.60
- **Margin:** $149 − $53.60 = **$95.40 (64%)**

### Example 4: India Creator — Social Media Use

- **Plan:** Creator India — ₹799/month — 150 credits
- **Task:** 15 × 10 s clips using WAN 2.2 (1 credit each)
- **Total:** 15 credits, API cost: $0.375
- **Margin:** $9.51 − $0.375 = **$9.14 (96%)**

### Example 5: India Pro — Video Agency

- **Plan:** Pro India — ₹1,299/month — 400 credits
- **Task:** 20 × 10 s clips using LTXV 13B (5 credits each)
- **Total:** 100 credits, API cost: 20 × $0.20 = $4.00
- **Margin:** $15.46 − $4.00 = **$11.46 (74%)**

---

## 15. Infrastructure & Third-Party Services

### AI API

| Service | Purpose | Pricing Model |
|---------|---------|---|
| **fal.ai** | All AI video generation (40+ models) | Per-second usage (see Section 6) |

### Platform Infrastructure

| Service | Purpose | Estimated Monthly Cost |
|---------|---------|---|
| **Firebase Authentication** | User sign-in & session management | Free up to 10k MAU, then $0.0055/MAU |
| **Firestore** | User profiles, jobs, transactions, credit ledger | Free tier: 1 GB, 50k reads/day; then $0.06/GB + $0.06/100k reads |
| **Cloudflare R2** | Video file storage | $0.015/GB stored · $0.01/10k GET · Free egress |
| **Redis / BullMQ** | Job queue | Self-hosted: server cost; Upstash: ~$1/100k commands |
| **Vercel / Hosting** | Next.js deployment | $20–$150/mo depending on scale |

### Estimated Infrastructure Cost per User

| User Count | Est. Monthly Infra Cost | Per-User Cost |
|:---:|:---:|:---:|
| 100 | ~$50 | $0.50 |
| 1,000 | ~$200 | $0.20 |
| 10,000 | ~$1,500 | $0.15 |
| 50,000 | ~$5,000 | $0.10 |

### Payment Processing

| Service | Purpose | Pricing Model |
|---------|---------|---|
| **Razorpay** | Subscription billing & credit purchases | ~2% + ₹3 per txn (India) / ~2.5% (international) |

---

## 16. Billing & Payment Flow

> **Source:** `apps/web/server/routers/billing.ts`, `apps/web/app/api/webhooks/razorpay/route.ts`

### Subscription Lifecycle (supports both USD and INR)

```
User selects plan + region → createSubscriptionCheckout(tier, period, region)
→ Razorpay subscription created (USD or INR plan ID)
→ User pays → verifySubscriptionPayment(region) → HMAC verified
→ Tier updated → Credits added (global or India allocation)
→ Webhook: subscription.charged → Credits added monthly
→ Webhook: subscription.cancelled → subscriptionId cleared
```

### Credit Purchase Lifecycle (region-aware)

```
User selects pack + region → createCreditCheckout(credits, region)
→ Razorpay order created (USD or INR amount)
→ User pays → verifyCreditPayment → HMAC verified
→ Credits added (same credit value regardless of region)
```

### Key Principle

Credits are **currency-neutral** — 1 credit has the same purchasing power regardless of whether it was bought in USD or INR. The platform margin multiplier ensures profitability at both price points.

---

## 17. Credit Transaction Tracking

> **Source:** `apps/web/lib/db.ts`, `apps/web/app/api/webhooks/fal/route.ts`

Every credit movement is recorded in the Firestore `creditTransactions` collection:

| Field | Values |
|---|---|
| `type` | `"generation"` · `"subscription"` · `"purchase"` · `"refund"` |
| `amount` | Credits added (positive) or deducted (negative) |
| `balanceAfter` | User balance after the transaction |
| `description` | Human-readable description (includes region for India) |
| `generationId` | Linked generation ID (if applicable) |
| `razorpayPaymentId` | Razorpay payment ID (if applicable) |
| `createdAt` | Timestamp |

### Refund Policy

| Event | Refund |
|---|---|
| Generation fails before completion | ✅ Full refund |
| Upscale job fails | ✅ Full refund |
| Generation completes successfully | ❌ No refund |
| Subscription cancellation (mid-cycle) | Per Razorpay / 14-day guarantee |

---

## 18. Cost-Per-Use-Case Scenarios

### Scenario A: Solo Content Creator — India (Social Media)

**Profile:** 15–20 short videos/month, 720p, no watermark
**Recommended Plan:** Starter India — **₹399/month** (or ₹319/mo billed annually, ₹3,828/year)

| Item | Monthly Cost | Credits Used |
|---|:---:|:---:|
| Starter India subscription | ₹399 | — |
| 20 × 10 s videos (WAN 2.2, 1 cr each) | 20 credits | 20 of 50 |
| Remaining credits | — | 30 |
| **Total** | **₹399/month** | — |

### Scenario B: Marketing Agency — Global (Product Videos)

**Profile:** 50 videos/month, 1080p, Kling v2.6 Pro with audio, some upscaling
**Recommended Plan:** Pro — **$49/month** ($468/year)

| Item | Monthly Cost | Credits Used |
|---|:---:|:---:|
| Pro subscription | $49.00 | — |
| 30 × 12 s Kling v2.6 Pro (no audio, 22 cr each) | — | 660 credits |
| 10 × 12 s Kling v2.6 Pro (with audio, 33 cr each) | — | 330 credits |
| Total usage: 990 credits (exceeds 490) | — | Need 500 top-up |
| 500-credit pack | $40.00 | — |
| **Total** | **$89/month** | — |

### Scenario C: Production Studio — Global (Premium + Long-Form)

**Profile:** 20 premium clips + 5 long-form/month, audio on premium, API access
**Recommended Plan:** Studio — **$149/month** ($1,428/year)

| Item | Credits Used |
|---|:---:|
| 15 × 15 s Kling v3 Pro (no audio, 84 cr each) | 1,260 |
| 5 × 10 s Kling v3 Standard (with audio, 32 cr each) | 160 |
| Total from included | 1,420 of 1,490 |
| Remaining | 70 credits |
| **Monthly cost** | **$149** |

### Scenario D: Indian Production Team

**Profile:** 30 videos/month, mix of models, audio on some
**Recommended Plan:** Pro India — **₹1,299/month**

| Item | Credits Used |
|---|:---:|
| 20 × 10 s LTXV 13B Distilled (5 cr each) | 100 |
| 5 × 10 s Kling v2.6 Pro no audio (18 cr each) | 90 |
| 5 × 5 s Kling v2.6 Pro with audio (14 cr each) | 70 |
| Total from included (400 credits) | 260 (within plan) |
| **Monthly cost** | **₹1,299** |

---

## 19. Revenue Projections

### Assumptions for Year 1

| Metric | Global | India | Total |
|---|:---:|:---:|:---:|
| Free users | 5,000 | 10,000 | 15,000 |
| Creator subs | 200 | 300 | 500 |
| Pro subs | 100 | 80 | 180 |
| Studio subs | 20 | 5 | 25 |
| Avg credit pack purchases/mo | 50 | 80 | 130 |

### Monthly Revenue Projection

| Source | Global | India | Total |
|---|:---:|:---:|:---:|
| Creator subs | $3,800 | $1,425 (₹119,700) | $5,225 |
| Pro subs | $4,900 | $761 (₹63,920) | $5,661 |
| Studio subs | $2,980 | $77 (₹6,495) | $3,057 |
| Credit pack purchases | $2,000 | $714 (₹59,940) | $2,714 |
| **Monthly total** | **$13,680** | **$2,977** | **$16,657** |
| **Annual total** | **$164,160** | **$35,724** | **$199,884** |

### Monthly Cost Projection

| Cost | Amount |
|---|:---:|
| fal.ai API costs (~40% of credit revenue) | ~$7,800 |
| Infrastructure (Firebase, R2, Redis, Hosting) | ~$2,000 |
| Razorpay fees (~2.5%) | ~$500 |
| **Monthly cost total** | **~$10,300** |
| **Monthly profit** | **~$9,200** |
| **Annual profit** | **~$110,400** |
| **Overall margin** | **~47%** |

---

## 20. Environment Variables for Billing

> **Source:** `.env.example`

```bash
# Razorpay — payment processing
RAZORPAY_KEY_ID=rzp_test_xxxxx
RAZORPAY_KEY_SECRET=xxxxx
RAZORPAY_WEBHOOK_SECRET=xxxxx

# Razorpay Plan IDs — Global (USD)
RAZORPAY_PLAN_CREATOR_MONTHLY=plan_xxxxx
RAZORPAY_PLAN_CREATOR_YEARLY=plan_xxxxx
RAZORPAY_PLAN_PRO_MONTHLY=plan_xxxxx
RAZORPAY_PLAN_PRO_YEARLY=plan_xxxxx
RAZORPAY_PLAN_STUDIO_MONTHLY=plan_xxxxx
RAZORPAY_PLAN_STUDIO_YEARLY=plan_xxxxx

# Razorpay Plan IDs — India (INR)
RAZORPAY_PLAN_CREATOR_MONTHLY_INR=plan_xxxxx
RAZORPAY_PLAN_CREATOR_YEARLY_INR=plan_xxxxx
RAZORPAY_PLAN_PRO_MONTHLY_INR=plan_xxxxx
RAZORPAY_PLAN_PRO_YEARLY_INR=plan_xxxxx
RAZORPAY_PLAN_STUDIO_MONTHLY_INR=plan_xxxxx
RAZORPAY_PLAN_STUDIO_YEARLY_INR=plan_xxxxx

# Fal.ai — AI video generation
FAL_KEY=fal_xxxxx
FAL_WEBHOOK_SECRET=xxxxx

# Firebase — auth + database
FIREBASE_ADMIN_PROJECT_ID=xxxxx
FIREBASE_ADMIN_CLIENT_EMAIL=xxxxx
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----\n..."

# Cloudflare R2 — object storage
R2_ACCOUNT_ID=xxxxx
R2_ACCESS_KEY_ID=xxxxx
R2_SECRET_ACCESS_KEY=xxxxx
R2_BUCKET_NAME=videoforge
R2_PUBLIC_URL=https://pub-xxxx.r2.dev

# Redis — job queue
REDIS_URL=redis://localhost:6379
```

---

## 21. Key Source Files

| File | What it contains |
|---|---|
| `packages/shared/src/utils/pricing.ts` | `PLATFORM_MARGIN_MULTIPLIER`, `AUDIO_SURCHARGE_MULTIPLIER`, `MODEL_COST_PER_SECOND`, `TIER_LIMITS` (with India pricing), `VIDEO_MODEL_CATALOG`, `calculateCreditsCost()`, `calculateCreditsCostWithAudio()` |
| `packages/shared/src/types/index.ts` | `PricingPlan` (with INR fields), `TierLimits` (with `monthlyPriceInr`, `includedCreditsIndia`) |
| `apps/web/lib/pricing.ts` | `PRICING_PLANS` — UI-facing plan definitions with both USD and INR pricing |
| `apps/web/server/routers/billing.ts` | `CREDIT_PACKS` (USD), `CREDIT_PACKS_INR` (India), region-aware subscription and credit checkout |
| `apps/web/server/routers/upscaler.ts` | `UPSCALE_CREDIT_COST` (standard=10, real-esrgan=25) |
| `apps/web/app/api/webhooks/razorpay/route.ts` | Subscription renewal webhook → credits added |
| `apps/web/app/api/webhooks/fal/route.ts` | Generation/upscale webhook → refund on failure |
| `apps/web/lib/db.ts` | `addCredits`, `deductCredits`, `creditTransactions` Firestore collection |
| `apps/web/lib/queue.ts` | BullMQ setup — queue priority by tier |
| `.env.example` | All required environment variables (now includes India plan IDs) |

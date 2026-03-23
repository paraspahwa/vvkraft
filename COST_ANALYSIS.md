# VideoForge — Complete Cost Analysis

> **Source of truth:** All figures are derived directly from the source files listed in each section. Primary references are `packages/shared/src/utils/pricing.ts`, `apps/web/lib/pricing.ts`, and `apps/web/server/routers/billing.ts`.

---

## Table of Contents

1. [Credit System](#1-credit-system)
2. [Subscription Plans](#2-subscription-plans)
3. [Credit Packs (Top-ups)](#3-credit-packs-top-ups)
4. [AI Model Pricing](#4-ai-model-pricing)
5. [Feature-Specific Costs](#5-feature-specific-costs)
6. [Tier Limits & Constraints](#6-tier-limits--constraints)
7. [Queue Priority System](#7-queue-priority-system)
8. [Cost Examples & Calculations](#8-cost-examples--calculations)
9. [Infrastructure & Third-Party Services](#9-infrastructure--third-party-services)
10. [Billing & Payment Flow](#10-billing--payment-flow)
11. [Credit Transaction Tracking](#11-credit-transaction-tracking)
12. [Cost-Per-Use-Case Scenarios](#12-cost-per-use-case-scenarios)
13. [Environment Variables for Billing](#13-environment-variables-for-billing)
14. [Key Source Files](#14-key-source-files)

---

## 1. Credit System

> **Source:** `packages/shared/src/utils/pricing.ts` — `CREDIT_VALUE_USD`

| Constant | Value |
|---|---|
| 1 Credit (USD) | **$0.10** |

**How credits are consumed:**

```
Cost (USD)      = MODEL_COST_PER_SECOND[model] × duration_seconds
Credits charged = ceil(Cost USD / $0.10)
```

All credit deductions happen **before** generation starts. On generation or upscale failure the credits are **fully refunded**.

---

## 2. Subscription Plans

> **Source:** `apps/web/lib/pricing.ts` — `PRICING_PLANS`, `packages/shared/src/utils/pricing.ts` — `TIER_LIMITS`

### Monthly Pricing

| Plan | Monthly Price | Included Credits/Month | Videos/Month | Max Duration | Max Resolution |
|------|:---:|:---:|:---:|:---:|:---:|
| **Free** | $0 | 0 | 3/day limit | 5 s | 480p |
| **Creator** | $19 | 190 | 50 | 10 s (60 s long-form) | 720p |
| **Pro** | $49 | 490 | 200 | 15 s (2 min long-form) | 1080p |
| **Studio** | $149 | 1,490 | Unlimited | 15 s (2 min long-form) | 1080p |

### Yearly Pricing (billed per month, charged annually)

| Plan | Monthly Equivalent | Annual Total | Annual Savings vs Monthly |
|------|:---:|:---:|:---:|
| **Free** | $0 | $0 | — |
| **Creator** | $15/mo | $180/yr | **$48/yr (21% off)** |
| **Pro** | $39/mo | $468/yr | **$120/yr (20% off)** |
| **Studio** | $119/mo | $1,428/yr | **$360/yr (20% off)** |

### Razorpay Subscription Configuration

Monthly plans are configured with `total_count: 120` (indefinite renewal). Yearly plans use `total_count: 10` (charges once per year for 10 years). Plan IDs are injected via environment variables (`RAZORPAY_PLAN_*`).

---

## 3. Credit Packs (Top-ups)

> **Source:** `apps/web/server/routers/billing.ts` — `CREDIT_PACKS`

One-time purchases that **never expire** and stack on top of subscription credits.

| Pack | Price (USD) | Price per Credit | Effective Savings |
|------|:---:|:---:|:---:|
| 50 credits | $5.00 | $0.100 | — (base rate) |
| 150 credits | $14.00 | $0.093 | 7% off |
| 500 credits | $40.00 | $0.080 | 20% off |
| 1,500 credits | $100.00 | $0.067 | 33% off |

---

## 4. AI Model Pricing

> **Source:** `packages/shared/src/utils/pricing.ts` — `MODEL_COST_PER_SECOND`, `VIDEO_MODEL_CATALOG`

All 40+ models are billed via **fal.ai** on a per-second basis. The table below lists the representative rate at standard/720p quality used for credit calculation.

### Longcat Family (Long-Form Optimised)

| Model ID | Cost/Second | Min Tier | Long Video | Audio |
|---|:---:|:---:|:---:|:---:|
| `fal-ai/longcat-video/distilled/text-to-video/480p` | $0.0050 | Free | ✅ | ❌ |
| `fal-ai/longcat-video/distilled/text-to-video/720p` | $0.0100 | Creator | ✅ | ❌ |
| `fal-ai/longcat-video/text-to-video/480p` | $0.0250 | Creator | ✅ | ❌ |
| `fal-ai/longcat-video/text-to-video/720p` | $0.0400 | Creator | ✅ | ❌ |

### LTXV / LTX Family

| Model ID | Cost/Second | Min Tier | Long Video | Audio |
|---|:---:|:---:|:---:|:---:|
| `fal-ai/ltxv-13b-098-distilled` | $0.0200 | Creator | ✅ | ❌ |
| `fal-ai/ltxv-13b-098-distilled/multiconditioning` | $0.0200 | Creator | ✅ | ❌ |
| `fal-ai/ltx-2/text-to-video/fast` | $0.0400 | Creator | ✅ | ❌ |
| `fal-ai/ltx-2.3/text-to-video/fast` | $0.0400 | Creator | ✅ | ❌ |
| `fal-ai/ltx-2-19b/distilled/text-to-video` | $0.0180 | Creator | ✅ | ❌ |
| `fal-ai/ltx-2-19b/distilled/text-to-video/lora` | $0.0220 | Creator | ✅ | ❌ |

### WAN / KREA Family

| Model ID | Cost/Second | Min Tier | Long Video | Audio |
|---|:---:|:---:|:---:|:---:|
| `fal-ai/krea-wan-14b/text-to-video` | $0.0250 | Creator | ✅ | ❌ |
| `fal-ai/wan-25-preview/text-to-video` | $0.1000 | Pro | ✅ | ❌ |
| `fal-ai/wan/v2.2-a14b/image-to-video` | $0.0025 | Creator | ❌ | ❌ |
| `fal-ai/wan/v2.2-a14b/text-to-video` | $0.0800 | Creator | ❌ | ❌ |
| `fal-ai/wan/v2.2-5b/text-to-video/distill` | $0.0160 | Creator | ❌ | ❌ |
| `fal-ai/wan/v2.2-5b/text-to-video/fast-wan` | $0.0050 | Creator | ❌ | ❌ |
| `wan/v2.6/text-to-video` | $0.1000 | Pro | ✅ | ❌ |

### Kling Family (Premium)

| Model ID | Cost/Second | Min Tier | Long Video | Audio |
|---|:---:|:---:|:---:|:---:|
| `fal-ai/kling-video/v2.6/pro/text-to-video` | $0.0700 | Pro | ❌ | ❌ |
| `fal-ai/kling-video/v2.5-turbo/standard/image-to-video` | $0.0420 | Pro | ❌ | ❌ |
| `fal-ai/kling-video/v3/standard/text-to-video` | $0.0840 | Pro | ❌ | ❌ |
| `fal-ai/kling-video/v3/pro/text-to-video` | **$0.2240** | Studio | ❌ | ❌ |
| `fal-ai/kling-video/o3/standard/text-to-video` | $0.0840 | Pro | ❌ | ❌ |
| `fal-ai/kling-video/o3/pro/text-to-video` | $0.1120 | Studio | ❌ | ❌ |

### Pixverse Family

| Model ID | Cost/Second | Min Tier | Long Video | Audio |
|---|:---:|:---:|:---:|:---:|
| `fal-ai/pixverse/v5/text-to-video` | $0.0400 | Pro | ✅ | ❌ |
| `fal-ai/pixverse/v5.5/text-to-video` | $0.0400 | Pro | ✅ | ❌ |
| `fal-ai/pixverse/v5.6/text-to-video` | $0.0900 | Studio | ✅ | ❌ |

### Seedance / ByteDance Family

| Model ID | Cost/Second | Min Tier | Long Video | Audio |
|---|:---:|:---:|:---:|:---:|
| `fal-ai/bytedance/seedance/v1/pro/fast/text-to-video` | $0.0490 | Pro | ❌ | ❌ |
| `fal-ai/bytedance/seedance/v1.5/pro/text-to-video` | $0.0520 | Studio | ❌ | ✅ |

### Avatar / UGC Models

| Model ID | Cost/Second | Min Tier | Long Video | Audio |
|---|:---:|:---:|:---:|:---:|
| `fal-ai/heygen/avatar3/digital-twin` | $0.0340 | Studio | ❌ | ✅ |
| `fal-ai/heygen/v2/video-agent` | $0.0340 | Studio | ❌ | ✅ |
| `argil/avatars/text-to-video` | $0.0225 | Pro | ❌ | ✅ |

### Other Providers

| Model ID | Cost/Second | Min Tier | Long Video | Audio |
|---|:---:|:---:|:---:|:---:|
| `fal-ai/hunyuan-video-v1.5/text-to-video` | **$0.00075** ⭐ cheapest | Creator | ✅ | ❌ |
| `fal-ai/cosmos-predict-2.5/distilled/text-to-video` | $0.0160 | Creator | ✅ | ❌ |
| `fal-ai/minimax/hailuo-2.3/standard/text-to-video` | $0.0470 | Pro | ❌ | ❌ |
| `fal-ai/kandinsky5/text-to-video` | $0.0160 | Creator | ❌ | ❌ |
| `fal-ai/kandinsky5/text-to-video/distill` | $0.0100 | Creator | ❌ | ❌ |
| `fal-ai/vidu/q3/text-to-video/turbo` | $0.0770 | Pro | ✅ | ❌ |
| `xai/grok-imagine-video/text-to-video` | $0.0700 | Studio | ❌ | ❌ |
| `veed/fabric-1.0/text` | $0.1500 | Studio | ❌ | ❌ |

### Default Model Per Tier

> **Source:** `packages/shared/src/utils/pricing.ts` — `getModelForTier()`

| Tier | Default Model | Cost/Second |
|------|---|:---:|
| Free | `fal-ai/longcat-video/distilled/text-to-video/480p` | $0.0050 |
| Creator | `fal-ai/wan/v2.2-a14b/image-to-video` | $0.0025 |
| Pro | `fal-ai/kling-video/v2.6/pro/text-to-video` | $0.0700 |
| Studio | `fal-ai/kling-video/v3/pro/text-to-video` | $0.2240 |

### Default Long-Video Model Per Tier

> **Source:** `packages/shared/src/utils/pricing.ts` — `getLongVideoModelForTier()`

| Tier | Default Long-Video Model |
|------|---|
| Free | _(not available)_ |
| Creator | `fal-ai/longcat-video/distilled/text-to-video/720p` |
| Pro | `fal-ai/ltxv-13b-098-distilled` |
| Studio | `fal-ai/krea-wan-14b/text-to-video` |

---

## 5. Feature-Specific Costs

> **Source:** `apps/web/server/routers/upscaler.ts` — `UPSCALE_CREDIT_COST`

### Video Upscaling (`/upscale`, `fal-ai/video-upscaler`)

| Quality Mode | Credit Cost | USD Equivalent | Availability |
|---|:---:|:---:|:---:|
| Standard | **10 credits** | $1.00 | All paid plans |
| Real-ESRGAN | **25 credits** | $2.50 | Paid plans only (not Free) |

Upscaling credits are deducted before the job is submitted. On failure the full amount is refunded.

---

## 6. Tier Limits & Constraints

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

## 7. Queue Priority System

> **Source:** `packages/shared/src/utils/pricing.ts` — `TIER_QUEUE_PRIORITY`

VideoForge uses **BullMQ** with **Redis**. Lower priority numbers are processed first.

| Tier | Priority Value | Processing Order |
|------|:---:|---|
| Studio | 1 | Highest — processed first |
| Pro | 3 | High |
| Creator | 5 | Medium |
| Free | 10 | Lowest |

---

## 8. Cost Examples & Calculations

### Formula

```
Credits = ceil( MODEL_COST_PER_SECOND[model] × duration_s / 0.10 )
```

### Quick Reference: Credits per Video by Model & Duration

| Model | 5 s | 10 s | 15 s | 60 s | 120 s |
|---|:---:|:---:|:---:|:---:|:---:|
| Hunyuan v1.5 (cheapest) | 1 | 1 | 1 | 1 | 1 |
| Longcat Distilled 480p | 1 | 1 | 1 | 3 | 6 |
| Longcat Distilled 720p | 1 | 1 | 2 | 6 | 12 |
| WAN 2.2 image-to-video | 1 | 1 | 1 | 2 | 3 |
| LTXV 13B (Distilled) | 1 | 2 | 3 | 12 | 24 |
| Kling v2.6 Pro | 4 | 7 | 11 | — | — |
| Kling v3 Standard | 5 | 9 | 13 | — | — |
| Kling o3 Pro | 6 | 12 | 17 | — | — |
| Kling v3 Pro (premium) | 12 | 23 | 34 | — | — |
| VEED Fabric 1.0 | 8 | 15 | 23 | — | — |

_`—` indicates the model does not support that duration or it exceeds the tier's long-video cap._

### Example 1: Free Tier — Maximum Usage

- **Task:** 3 × 5 s videos at 480p (daily limit)
- **Model:** `fal-ai/longcat-video/distilled/text-to-video/480p` ($0.005/s, forced by tier)
- **Cost:** ceil($0.005 × 5 / $0.10) = 1 credit × 3 = **3 credits**
- **Available credits:** 0 (Free tier has no included credits — must purchase a pack)
- **Minimum spend:** $5.00 (50-credit pack)

### Example 2: Creator Tier — Light Monthly Usage

- **Plan:** Creator — $19/month — 190 credits
- **Task:** 20 × 10 s short clips using default model (WAN 2.2)
- **Cost:** ceil($0.0025 × 10 / $0.10) = 1 credit × 20 = **20 credits**
- **Remaining credits:** 170 credits — well within plan

### Example 3: Pro Tier — Heavy Content Creator

- **Plan:** Pro — $49/month — 490 credits
- **Task:** 30 × 15 s clips using Kling v2.6 Pro ($0.07/s)
- **Per video:** ceil($0.07 × 15 / $0.10) = **11 credits**
- **Total:** 11 × 30 = 330 credits
- **Remaining:** 490 − 330 = 160 credits
- **Headroom for extras:** ~14 additional videos or upscaling

### Example 4: Studio Tier — Production Workflow

- **Plan:** Studio — $149/month — 1,490 credits
- **Task A:** 10 × 15 s premium videos using Kling v3 Pro ($0.224/s)
  - Per video: ceil($0.224 × 15 / $0.10) = 34 credits × 10 = **340 credits**
- **Task B:** 5 × 2-min long-form videos using Krea WAN 14B ($0.025/s)
  - Per video: ceil($0.025 × 120 / $0.10) = 30 credits × 5 = **150 credits**
- **Task C:** 5 × Real-ESRGAN upscales = 5 × 25 = **125 credits**
- **Total usage:** 340 + 150 + 125 = **615 credits**
- **Remaining:** 1,490 − 615 = **875 credits**

### Example 5: Yearly Plan Savings

| Plan | Monthly Total | Annual Total | Annual Savings |
|------|:---:|:---:|:---:|
| Creator | $19 × 12 = $228 | $180 | **$48** |
| Pro | $49 × 12 = $588 | $468 | **$120** |
| Studio | $149 × 12 = $1,788 | $1,428 | **$360** |

---

## 9. Infrastructure & Third-Party Services

### AI API

| Service | Purpose | Pricing Model |
|---------|---------|---|
| **fal.ai** | All AI video generation (40+ models) | Per-second usage (see Section 4) |

### Platform Infrastructure

| Service | Purpose | Estimated Pricing |
|---------|---------|---|
| **Firebase Authentication** | User sign-in & session management | Free up to 10k/month then $0.0055/MAU |
| **Firestore** | User profiles, jobs, transactions, credit ledger | Free tier: 1 GB storage, 50k reads/day; then $0.06/GB, $0.06/100k reads |
| **Cloudflare R2** | Video file storage (generated + upscale input/output) | $0.015/GB stored · $0.01/10k GET requests · Free egress |
| **Redis / BullMQ** | Job queue for video generation and upscaling | Self-hosted: server cost only; Upstash: ~$1/100k commands |

### Payment Processing

| Service | Purpose | Pricing Model |
|---------|---------|---|
| **Razorpay** | Subscription billing & one-time credit purchases | ~2% + ₹3 per transaction |

---

## 10. Billing & Payment Flow

> **Source:** `apps/web/server/routers/billing.ts`, `apps/web/app/api/webhooks/razorpay/route.ts`

### Subscription Lifecycle

```
User selects plan → createSubscriptionCheckout → Razorpay subscription created
→ User pays → verifySubscriptionPayment → HMAC signature verified
→ Tier updated in Firestore → Included credits added to balance
→ Webhook: subscription.charged (each renewal) → Credits added monthly/yearly
→ Webhook: subscription.cancelled → subscriptionId cleared in Firestore
→ Webhook: payment.failed → Logged for monitoring
```

### One-Time Credit Purchase Lifecycle

```
User selects pack → createCreditCheckout → Razorpay order created
→ User pays → verifyCreditPayment → HMAC signature verified
→ Credits added to balance (never expire)
```

### Signature Verification

Both flows use **HMAC-SHA256** with `RAZORPAY_KEY_SECRET` to verify payment authenticity before any credits are awarded.

---

## 11. Credit Transaction Tracking

> **Source:** `apps/web/lib/db.ts`, `apps/web/app/api/webhooks/fal/route.ts`

Every credit movement is recorded in the Firestore `creditTransactions` collection:

| Field | Values |
|---|---|
| `type` | `"generation"` · `"subscription"` · `"purchase"` · `"refund"` |
| `amount` | Credits added (positive) or deducted (negative) |
| `balanceAfter` | User balance after the transaction |
| `description` | Human-readable description |
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

## 12. Cost-Per-Use-Case Scenarios

### Scenario A: Solo Content Creator (Social Media)

**Profile:** 15–20 short videos/month, 720p, no watermark  
**Recommended Plan:** Creator — **$19/month** ($180/year)

| Item | Monthly Cost |
|---|:---:|
| Creator subscription | $19.00 |
| 20 × 10 s videos (WAN 2.2 default) | 20 credits = $2.00 effective |
| Occasional extra credit pack | $0–$5 |
| **Total** | **~$19–$24/month** |

### Scenario B: Marketing Agency (Product Videos)

**Profile:** 50 videos/month, 1080p, Kling v2.6, some upscaling  
**Recommended Plan:** Pro — **$49/month** ($468/year)

| Item | Monthly Cost |
|---|:---:|
| Pro subscription | $49.00 |
| 50 × 12 s videos @ 9 credits each | 450 credits (within plan) |
| 10 × Standard upscales @ 10 credits | 100 credits → buy 150-pack at $14 |
| **Total** | **~$63/month** |

### Scenario C: Production Studio (Premium + Long-Form)

**Profile:** 30 premium clips + 5 long-form/month, all models, API access  
**Recommended Plan:** Studio — **$149/month** ($1,428/year)

| Item | Monthly Cost |
|---|:---:|
| Studio subscription | $149.00 |
| 30 × 15 s Kling v3 Pro videos | 1,020 credits (within plan) |
| 5 × 120 s Krea WAN 14B long-form | 150 credits (within plan) |
| 10 × Real-ESRGAN upscales | 250 credits → buy 500-pack at $40 |
| **Total** | **~$189/month** |

### Scenario D: Light Exploration (Hobby / Testing)

**Profile:** Occasional use, no subscription needed  
**Recommended:** No plan + credit pack

| Item | One-Time Cost |
|---|:---:|
| 50-credit pack | $5.00 |
| 10 × 5 s Hunyuan videos | 10 credits = $1.00 effective |
| 5 × standard upscales | 50 credits = $5.00 effective |
| **Total** | **$5.00 (pack)** |

---

## 13. Environment Variables for Billing

> **Source:** `.env.example`

```bash
# Razorpay — payment processing
RAZORPAY_KEY_ID=rzp_test_xxxxx
RAZORPAY_KEY_SECRET=xxxxx
RAZORPAY_WEBHOOK_SECRET=xxxxx

# Razorpay Plan IDs (create in Razorpay dashboard)
RAZORPAY_PLAN_CREATOR_MONTHLY=plan_xxxxx
RAZORPAY_PLAN_CREATOR_YEARLY=plan_xxxxx
RAZORPAY_PLAN_PRO_MONTHLY=plan_xxxxx
RAZORPAY_PLAN_PRO_YEARLY=plan_xxxxx
RAZORPAY_PLAN_STUDIO_MONTHLY=plan_xxxxx
RAZORPAY_PLAN_STUDIO_YEARLY=plan_xxxxx

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

## 14. Key Source Files

| File | What it contains |
|---|---|
| `packages/shared/src/utils/pricing.ts` | `MODEL_COST_PER_SECOND`, `TIER_LIMITS`, `VIDEO_MODEL_CATALOG`, all helper functions |
| `apps/web/lib/pricing.ts` | `PRICING_PLANS` — UI-facing plan definitions with Razorpay plan IDs |
| `apps/web/server/routers/billing.ts` | `CREDIT_PACKS`, subscription and credit-purchase tRPC mutations |
| `apps/web/server/routers/upscaler.ts` | `UPSCALE_CREDIT_COST` (standard=10, real-esrgan=25) |
| `apps/web/app/api/webhooks/razorpay/route.ts` | Subscription renewal webhook → credits added |
| `apps/web/app/api/webhooks/fal/route.ts` | Generation/upscale webhook → refund on failure |
| `apps/web/lib/db.ts` | `addCredits`, `deductCredits`, `creditTransactions` Firestore collection |
| `apps/web/lib/queue.ts` | BullMQ setup — queue priority by tier |
| `.env.example` | All required environment variables for billing and infrastructure |

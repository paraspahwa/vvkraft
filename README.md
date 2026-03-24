<div align="center">

```
██╗   ██╗██╗██████╗ ███████╗ ██████╗ ███████╗ ██████╗ ██████╗  ██████╗ ███████╗
██║   ██║██║██╔══██╗██╔════╝██╔═══██╗██╔════╝██╔═══██╗██╔══██╗██╔════╝ ██╔════╝
██║   ██║██║██║  ██║█████╗  ██║   ██║█████╗  ██║   ██║██████╔╝██║  ███╗█████╗
╚██╗ ██╔╝██║██║  ██║██╔══╝  ██║   ██║██╔══╝  ██║   ██║██╔══██╗██║   ██║██╔══╝
 ╚████╔╝ ██║██████╔╝███████╗╚██████╔╝██║     ╚██████╔╝██║  ██║╚██████╔╝███████╗
  ╚═══╝  ╚═╝╚═════╝ ╚══════╝ ╚═════╝ ╚═╝      ╚═════╝ ╚═╝  ╚═╝ ╚═════╝ ╚══════╝
```

### **Turn text into cinematic videos** — powered by Kling AI, WAN 2.2, and Fal.ai

[![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js&logoColor=white)](https://nextjs.org/)
[![Expo](https://img.shields.io/badge/Expo-52-000020?logo=expo&logoColor=white)](https://expo.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Turborepo](https://img.shields.io/badge/Turborepo-2-EF4444?logo=turborepo&logoColor=white)](https://turbo.build/)
[![Firebase](https://img.shields.io/badge/Firebase-10-FFCA28?logo=firebase&logoColor=black)](https://firebase.google.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-6366F1.svg)](LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)

</div>

---

## Table of Contents

- [Why VideoForge?](#why-videoforge)
- [Demo](#demo)
- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Monorepo Structure](#monorepo-structure)
- [Design System](#design-system)
- [Features & Subscription Tiers](#features--subscription-tiers)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Environment Variables](#environment-variables)
  - [Install & Run](#install--run)
- [Deployment](#deployment)
- [Architecture](#architecture)
  - [Hidden Layers (Competitive Moat)](#hidden-layers-competitive-moat)
  - [Draft Mode Flow (Mandatory)](#draft-mode-flow-mandatory)
  - [Scene-Based Rendering](#scene-based-rendering)
  - [GPU Tiering](#gpu-tiering)
  - [Dynamic Downgrade Engine](#dynamic-downgrade-engine)
  - [Smart Retry System](#smart-retry-system)
  - [Cache Layer](#cache-layer)
  - [API Layer (tRPC)](#api-layer-trpc)
  - [AI Video Generation Pipeline](#ai-video-generation-pipeline)
  - [Billing (Razorpay)](#billing-razorpay)
  - [Storage (Cloudflare R2)](#storage-cloudflare-r2)
  - [Queue (BullMQ + Redis)](#queue-bullmq--redis)
- [India Pricing](#india-pricing)
- [Implementation Status](#implementation-status)
- [Roadmap](#roadmap)
- [Contributing](#contributing)
- [FAQ](#faq)
- [Support](#support)
- [Acknowledgments](#acknowledgments)
- [License](#license)

---

## Why VideoForge?

| | VideoForge | Traditional tools |
|---|---|---|
| **Setup time** | Minutes | Days / weeks |
| **Cost** | From $0 | $$$+ per production |
| **Skills needed** | None | Video editing, VFX |
| **Output quality** | Up to 1080p cinematic | Depends on operator |
| **Scale** | Unlimited AI generation | Limited by crew / hardware |
| **Cross-platform** | Web + iOS/Android | Usually desktop-only |

- 🎬 **40+ state-of-the-art models** — Kling v3 Pro, Kling v2.6 Pro, Kling O3, WAN 2.2, WAN 2.6, Longcat, LTXV, Krea WAN, Pixverse v5, Seedance, HunyuanVideo, and more — all in one platform
- 📹 **Long-form video generation** — generate 30-second, 1-minute, and 2-minute AI videos using models purpose-built for continuous long-form output (Creator tier and above)
- 🧑‍🎨 **Character consistency** — upload a reference image and maintain your character across unlimited videos
- 📱 **Web + Mobile** — full-featured Next.js web app and native Expo/React Native mobile app share the same API
- 💳 **Flexible billing** — monthly/yearly subscriptions *and* one-time credit top-ups, powered by Razorpay
- ⚡ **Priority queue** — Studio and Pro subscribers jump the queue automatically via BullMQ priorities
- 🔒 **Secure by default** — Firebase Auth tokens verified server-side on every tRPC request; Razorpay webhooks verified with HMAC-SHA256

---

## Demo

> 🚀 **Live demo coming soon.** Star the repo to be notified on launch.

| Web App — Generate Screen | Mobile App — Gallery |
|:---:|:---:|
| *(screenshot placeholder)* | *(screenshot placeholder)* |

**Generation flow (30-second walkthrough):**

```
Type a prompt → Select model & settings → Hit Generate
     → Real-time status polling → Video ready in your gallery
```

---

## Overview

**VideoForge** is a full-stack AI video generation SaaS platform built as a Turborepo monorepo. Users can:

- Generate videos from text prompts using 40+ AI models (Kling v3 Pro, Kling O3, WAN 2.2/2.6, Longcat, LTXV, Krea WAN, Pixverse v5, Seedance, HunyuanVideo, and more)
- Generate **long-form videos** (30s / 60s / 120s) using models designed for continuous long-form output
- Manage character consistency across generations
- Browse their video gallery with infinite scroll and status filtering
- Subscribe to tiered plans or buy one-time credit packs (via Razorpay)
- Access everything from both a **Next.js web app** and a native **Expo/React Native mobile app**
- Watch completed videos inline on web and in a full-screen player on mobile

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Monorepo** | [Turborepo](https://turbo.build/) 2 + npm workspaces |
| **Web App** | [Next.js](https://nextjs.org/) 14 (App Router) |
| **Mobile App** | [Expo](https://expo.dev/) 52 / React Native 0.76 |
| **Language** | TypeScript 5.3 (strict, across all packages) |
| **API** | [tRPC](https://trpc.io/) v11 + [TanStack Query](https://tanstack.com/query) v5 |
| **Auth** | [Firebase Auth](https://firebase.google.com/) (email/password) |
| **Database** | [Firestore](https://firebase.google.com/docs/firestore) (users, generations, characters, credit transactions) |
| **AI / Video** | [Fal.ai](https://fal.ai/) (Kling v3 Pro, Kling O3, WAN 2.2/2.6, Longcat, LTXV, Krea WAN, Pixverse, Seedance, HunyuanVideo, and 30+ more models) |
| **Billing** | [Razorpay](https://razorpay.com/) (subscriptions + one-time purchases) |
| **Storage** | [Cloudflare R2](https://www.cloudflare.com/products/r2/) (videos + thumbnails + character images) |
| **Queue** | [BullMQ](https://bullmq.io/) + [Redis](https://redis.io/) (ioredis) |
| **Styling** | [Tailwind CSS](https://tailwindcss.com/) 3 + custom design system |
| **Forms** | [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/) |
| **Animations** | [Framer Motion](https://www.framer.com/motion/) 11 |
| **State** | [Zustand](https://zustand-demo.pmnd.rs/) 4 |

---

## Monorepo Structure

```
videoforge/
├── apps/
│   ├── web/                          # Next.js 14 web application
│   │   ├── app/                      # App Router pages
│   │   │   ├── page.tsx              # Landing page
│   │   │   ├── dashboard/            # Dashboard
│   │   │   ├── generate/             # Video generation UI
│   │   │   │   ├── page.tsx          # Standard generation form
│   │   │   │   └── long-video/       # Long-form video generation (30s–120s)
│   │   │   ├── gallery/              # User video gallery
│   │   │   ├── pricing/              # Pricing + credit packs
│   │   │   ├── settings/             # Account settings
│   │   │   ├── auth/                 # Login + Register
│   │   │   └── api/
│   │   │       ├── trpc/[trpc]/      # tRPC HTTP handler
│   │   │       └── webhooks/
│   │   │           ├── fal/          # Fal.ai video completion webhook
│   │   │           └── razorpay/     # Razorpay payment webhook
│   │   ├── components/
│   │   │   ├── auth/                 # Firebase auth provider
│   │   │   ├── billing/              # PricingCard with Razorpay popup
│   │   │   ├── gallery/              # VideoCard component
│   │   │   ├── generation/           # GenerationForm + StatusCard + LongVideoForm
│   │   │   └── layout/               # AppLayout, Sidebar, Header
│   │   ├── server/
│   │   │   ├── trpc.ts               # tRPC context + middleware (+ adminProcedure)
│   │   │   └── routers/
│   │   │       ├── _app.ts           # Root router
│   │   │       ├── generation.ts     # Video generation CRUD
│   │   │       ├── user.ts           # User profile + stats
│   │   │       ├── billing.ts        # Razorpay checkout + verification
│   │   │       ├── character.ts      # Character management
│   │   │       ├── upscaler.ts       # Video upscaling (fal-ai/video-upscaler)
│   │   │       ├── templates.ts      # 1-click video templates
│   │   │       ├── autoScript.ts     # Auto-Script Generator
│   │   │       ├── admin.ts          # Price-Control Dashboard (admin only)
│   │   │       ├── community.ts      # Community trending feed + remix
│   │   │       └── export.ts         # Export to YouTube/Instagram/TikTok/local
│   │   ├── lib/
│   │   │   ├── db.ts                 # Firestore operations
│   │   │   ├── fal.ts                # Fal.ai client + types
│   │   │   ├── firebase.ts           # Firebase client SDK
│   │   │   ├── firebase-admin.ts     # Firebase Admin SDK
│   │   │   ├── model-router.ts       # Tier → model mapping + credit calc
│   │   │   ├── pricing.ts            # Razorpay plan IDs + pricing config
│   │   │   ├── queue.ts              # BullMQ queue definitions
│   │   │   ├── r2.ts                 # Cloudflare R2 helpers (incl. presigned download)
│   │   │   ├── razorpay-client.ts    # Client-side Razorpay script loader
│   │   │   ├── redis.ts              # ioredis singleton
│   │   │   └── templates.ts          # Video template catalogue (9 templates)
│   │   └── hooks/
│   │       ├── use-generation.ts     # Generation state hook
│   │       └── use-trpc-auth.ts      # Auth-aware tRPC hook
│   │
│   └── mobile/                       # Expo 52 / React Native app
│       ├── app/
│       │   ├── _layout.tsx           # Root layout (tRPC + RQ providers)
│       │   ├── auth/login.tsx        # Email/password auth screen
│       │   └── (tabs)/
│       │       ├── _layout.tsx       # Tab navigator
│       │       ├── index.tsx         # Generate screen
│       │       ├── gallery.tsx       # Gallery screen (infinite scroll)
│       │       └── profile.tsx       # Profile + stats + sign out
│       └── lib/
│           ├── firebase.ts           # Firebase client for mobile
│           └── trpc.ts               # tRPC client for mobile
│
└── packages/
    ├── shared/                       # Shared types, schemas, utilities
    │   └── src/
    │       ├── types/
    │       │   ├── index.ts          # User, Generation, Character, etc.
    │       │   └── agents.ts         # Multi-agent system types
    │       ├── schemas/
    │       │   └── index.ts          # Zod schemas (generation, user, billing)
    │       ├── utils/
    │       │   └── pricing.ts        # Credit cost, tier limits, model helpers
    │       └── agents/
    │           └── index.ts          # Agent configuration data
    ├── ui/                           # Shared React component library
    │   └── src/components/
    │       ├── button.tsx            # Button (gradient, outline, ghost, etc.)
    │       ├── card.tsx              # Card + CardHeader + CardContent
    │       ├── badge.tsx             # Badge (success, destructive variants)
    │       ├── input.tsx             # Input with label + error state
    │       ├── textarea.tsx          # Textarea with label
    │       ├── progress.tsx          # Progress bar
    │       └── skeleton.tsx          # Loading skeleton
    └── config/
        ├── tsconfig/                 # base.json, nextjs.json, react-native.json
        ├── tailwind/                 # base.ts (shared design tokens)
        └── eslint/                   # base.js, nextjs.js
```

---

## Design System

| Token | Value | Usage |
|---|---|---|
| **Background** | `#0A0A0F` | Page background |
| **Surface** | `#111118` | Content areas |
| **Card** | `#16161F` | Cards / panels |
| **Border** | `#2A2A3A` | Dividers, input borders |
| **Accent** | `#6366F1` (Indigo) | Primary CTA, highlights |
| **Secondary** | `#8B5CF6` (Violet) | Secondary actions |
| **Accent Gradient** | `#6366F1 → #8B5CF6` | Buttons, badges, logos |
| **Font** | Inter | All text |
| **Radius** | `0.75rem` | Cards, inputs, buttons |

**Utility classes:**
- `.gradient-text` — transparent clip of the accent gradient
- `.glass-card` — frosted glass card (`backdrop-blur-sm` + border)
- `.shimmer` — animated loading shimmer
- `.shadow-accent-glow` — indigo glow shadow on hover

---

## Features & Subscription Tiers

> **Plan name mapping:** India display names differ from internal tier identifiers.
> `creator` tier = "Starter" (₹199) · `pro` tier = "Creator" (₹499) · `studio` tier = "Pro" (₹999).
> Global (USD) prices: Starter=$19/mo · Creator=$49/mo · Pro=$149/mo.

| Feature | Free | Starter — India ₹199/mo | Creator — India ₹499/mo | Pro — India ₹999/mo |
|---|:---:|:---:|:---:|:---:|
| Videos / day | 3 | — | — | — |
| Videos / month | — | 50 | 150 | 400 |
| Max duration | 5s | 10s | 15s | 30s |
| Long-form video | ❌ | up to 60s | up to 120s | up to 120s |
| Max resolution | 480p | 720p | 1080p | 1080p |
| Watermark | ✅ | ❌ | ❌ | ❌ |
| Character consistency | ❌ | ✅ | ✅ | ✅ |
| Motion control | ❌ | ❌ | ✅ | ✅ |
| Priority queue | ❌ | ❌ | ✅ | ✅ (fastest) |
| GPU | RTX 3060 | RTX 4090 | A100 | A100 |
| Draft preview | ✅ | ✅ | ✅ | ✅ |
| Default AI Model | Longcat (480p) | WAN 2.2 | Kling v2.6 Pro | Kling v3 Pro |
| India credits/mo | 0 | 50 | 150 | 400 |
| API access | ❌ | ❌ | ❌ | ✅ |

> **India pricing** — see [India Pricing](#india-pricing) for full plan details including hidden controls.

**1 credit = $0.10 USD.** Credits are deducted upfront and refunded automatically on generation failure.

**Credit Top-up Packs:** 50 credits ($5) · 150 credits ($14) · 500 credits ($40) · 1,500 credits ($100)

---

## Getting Started

### Prerequisites

- **Node.js** ≥ 20
- **npm** ≥ 10 (workspaces support)
- **Redis** running locally or a hosted Redis URL
- Accounts: Firebase, Fal.ai, Razorpay, Cloudflare R2

### Environment Variables

#### `apps/web/.env.local`

```env
# Firebase (Client)
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

# Firebase Admin (Server)
FIREBASE_ADMIN_PROJECT_ID=
FIREBASE_ADMIN_CLIENT_EMAIL=
FIREBASE_ADMIN_PRIVATE_KEY=

# Fal.ai
FAL_KEY=
FAL_WEBHOOK_SECRET=

# Razorpay
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
RAZORPAY_WEBHOOK_SECRET=
RAZORPAY_PLAN_CREATOR_MONTHLY=
RAZORPAY_PLAN_CREATOR_YEARLY=
RAZORPAY_PLAN_PRO_MONTHLY=
RAZORPAY_PLAN_PRO_YEARLY=
RAZORPAY_PLAN_STUDIO_MONTHLY=
RAZORPAY_PLAN_STUDIO_YEARLY=

# Redis
REDIS_URL=redis://localhost:6379

# Cloudflare R2
R2_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET_NAME=
R2_PUBLIC_URL=

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

#### `apps/mobile/.env.local`

```env
EXPO_PUBLIC_FIREBASE_API_KEY=
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=
EXPO_PUBLIC_FIREBASE_PROJECT_ID=
EXPO_PUBLIC_FIREBASE_APP_ID=

EXPO_PUBLIC_API_URL=https://your-app.vercel.app
```

### Install & Run

```bash
# 1. Install all dependencies
npm install

# 2. Start all apps in parallel (web + mobile)
npm run dev

# Or start individually:
cd apps/web && npm run dev       # http://localhost:3000
cd apps/mobile && npm run dev    # Expo dev server

# Start the BullMQ video-generation worker (separate terminal)
cd apps/web && npm run worker

# Build for production
npm run build

# Lint all packages
npm run lint

# Type-check all packages
npm run typecheck
```

> **Tip:** You need Redis running locally (`redis-server`) before starting the worker or the web app in development.

---

## Deployment

### Web App → Vercel

The `apps/web` Next.js app deploys to Vercel with zero configuration:

1. Import the repo in the [Vercel dashboard](https://vercel.com/new)
2. Set **Root Directory** to `apps/web`
3. Add all environment variables from `apps/web/.env.local` in the Vercel project settings
4. Push to `main` — Vercel auto-deploys on every commit

> Set `NEXT_PUBLIC_APP_URL` to your production Vercel URL (e.g. `https://videoforge.vercel.app`) so Razorpay and Fal.ai webhooks resolve correctly.

### BullMQ Worker → Railway / Render

The video-generation worker (`apps/web/worker/index.ts`) is a long-running Node.js process. Deploy it separately:

**Railway:**
```bash
# railway.toml (create in repo root)
[build]
builder = "nixpacks"
buildCommand = "npm install && npm run build --workspace=apps/web"

[deploy]
startCommand = "node apps/web/dist/worker/index.js"
```

**Render:**
- Service type: **Background Worker**
- Build command: `npm install && npm run build --workspace=apps/web`
- Start command: `node apps/web/dist/worker/index.js`

### Mobile App → Expo Application Services (EAS)

```bash
npm install -g eas-cli
cd apps/mobile
eas build --platform all   # iOS + Android
eas submit                 # Submit to App Store / Google Play
```

---

## Architecture

### Hidden Layers (Competitive Moat)

These four engines run below the surface and are the platform's primary competitive advantage. Users interact only with a simple prompt box; the complexity is invisible.

| Engine | Status | What it does |
|---|:---:|---|
| **AI Routing Engine** | ✅ | Selects the optimal model + GPU based on tier, load, and cost policy |
| **Scene Stitching Engine** | ✅ | Splits long videos into independent ≤10 s scenes, renders in parallel, stitches via FFmpeg |
| **Prompt → Script Generator** | ✅ | Enriches raw user prompts into cinematically structured per-scene scripts |
| **Cost Optimizer** | ✅ | Tracks per-user GPU spend and applies automatic downgrade policies to protect margins |

---

### Draft Mode Flow (Mandatory)

Every generation goes through a mandatory two-step flow before full GPU render to eliminate wasted spend on bad prompts:

```
User submits prompt
        │
        ▼
  generate_draft_preview  ──► LTX model on RTX 3060/4090
  480p · ≤5s · low cost
        │
        ▼
  User reviews draft preview
        │
   ┌────┴────┐
approve     reject / edit prompt
   │
   ▼
generate_video (full render)
  Wan 2.2 / Kling  ──► RTX 4090 or A100 (based on tier)
  720p–1080p · up to 30s
```

This flow is enforced server-side via `draft_mode: true` on `GenerationRequest`. The frontend must poll `DRAFT_PREVIEW` status before allowing the user to proceed to full render.

---

### Scene-Based Rendering

Instead of rendering a single long video (expensive, unrecoverable on failure), every request is automatically split into **3 × 10-second scenes**:

```
30-second request
        │
   split_into_scenes()
        │
   ┌────┼────┐
   │    │    │
Scene0  Scene1  Scene2
 10s    10s    10s
 (parallel RunPod jobs)
        │
   stitch_scenes() ──► FFmpeg concat → final.mp4 → R2
```

**Why scenes?**
- ✅ Each scene is retried independently — no full re-render on partial failure
- ✅ Parallel execution cuts wall-clock time
- ✅ Shorter renders fit into RunPod serverless windows (lower cost)
- ✅ Scene-level caching avoids re-processing identical prompts

Scene splitting is implemented in `services/gpu-worker/app/core/scene_stitcher.py:split_into_scenes`.

---

### GPU Tiering

Hardware is assigned per subscription tier. Actual GPU assignments are hidden from users — they only see "fast" vs "fastest":

| Internal Tier | India Display Name | India Price | GPU | Queue Priority | Max Resolution |
|---|---|:---:|---|:---:|---|
| `free` | Free | ₹0 | **RTX 3060** | 10 (slowest) | 480p |
| `creator` | **Starter** | ₹199/mo | **RTX 4090** | 7 | 720p |
| `pro` | **Creator** | ₹499/mo | **A100** | 3 | 1080p |
| `studio` | **Pro** | ₹999/mo | **A100** | 1 (fastest) | 1080p |

> RunPod endpoints: `RUNPOD_ENDPOINT_3060`, `RUNPOD_ENDPOINT_4090`, `RUNPOD_ENDPOINT_A100` in `.env`.

Implemented in `services/gpu-worker/app/core/gpu_router.py:route_gpu`.

---

### Dynamic Downgrade Engine

The cost optimizer automatically applies quality/speed degradations when user spending approaches tier ceilings or when system load is high. These measures are invisible to users.

**Triggers & actions:**

| Trigger | Action |
|---|---|
| User cost > 80% of tier ceiling | Downgrade to 480p, reduce FPS to 16, limit retries to 1 |
| System load > 0.8 + Free/Creator tier | Slow queue, downgrade to 480p |
| Free tier (always) | Add watermark |

**Per-tier cost ceilings:**

| Tier | Ceiling (USD/cycle) |
|---|---|
| Free | $0.50 |
| Creator (Starter) | $5.00 |
| Pro (Creator) | $25.00 |
| Studio (Pro) | $100.00 |

Implemented in `services/gpu-worker/app/core/cost_optimizer.py:evaluate_cost_policy`.

---

### Smart Retry System

Unlike naive "regenerate the whole video" approaches, VideoForge retries **only the failed scene**:

```python
@celery_app.task(max_retries=3)
def render_scene(self, *, generation_id, scene_index, ...):
    try:
        result = submit_job(gpu_tier, payload)
    except Exception as exc:
        raise self.retry(exc=exc)   # ← retries THIS scene only
```

If scene 1 of 3 fails, scenes 0 and 2 are already complete. Only scene 1 is re-submitted. Final stitching runs only after all 3 succeed.

---

### Cache Layer

Three levels of caching reduce GPU spend and latency:

| Layer | What is cached | TTL |
|---|---|---|
| **Prompt cache** | Redis key of normalized prompt → generation ID | 1 hour |
| **Embedding cache** | Prompt embeddings for semantic similarity matching | 24 hours |
| **Scene cache** | Rendered scene R2 keys for identical prompt+duration combos | 7 days |

A cache hit on a scene skips the RunPod job entirely, returning the existing R2 URL. Cost is reported as `cached: true` with `total_cost_usd: 0` in the `CostBreakdown`.

---

### API Layer (tRPC)

All server-client communication goes through a single **tRPC** router at `/api/trpc`. Every procedure is type-safe end-to-end:

```
appRouter
├── generation
│   ├── create              — validate, deduct credits, enqueue job (standard, up to 15s)
│   ├── createLongVideo     — validate, deduct credits, enqueue long-form job (30s / 60s / 120s)
│   ├── getById             — poll status (used by StatusCard)
│   ├── list                — paginated history (cursor-based)
│   ├── cancel              — cancel pending jobs
│   ├── estimateCost        — preview credit cost before generating
│   └── estimateLongVideoCost — preview credit cost for a long-form video
├── user
│   ├── me              — current user profile
│   ├── updateProfile   — display name / photo
│   ├── creditHistory   — credit transaction log
│   └── stats           — total videos, this-month count
├── billing
│   ├── plans           — list pricing plans
│   ├── creditPacks     — list credit top-up options
│   ├── createSubscriptionCheckout  — create Razorpay subscription
│   ├── verifySubscriptionPayment   — HMAC verify + upgrade tier
│   ├── createCreditCheckout        — create Razorpay order
│   ├── verifyCreditPayment         — HMAC verify + add credits
│   └── cancelSubscription          — cancel active subscription
└── character
    ├── list            — user's characters
    ├── create          — create character with reference image
    └── delete          — delete + clean up R2 assets
```

Authentication uses **Firebase ID tokens** passed as `Authorization: Bearer <token>` headers. The tRPC context verifies the token via Firebase Admin SDK and loads the user from Firestore on every request.

### AI Video Generation Pipeline

```
User submits prompt
      │
      ▼
tRPC generation.create
  → routeModel()              # select model based on tier + resolution
  → deductCredits()           # atomic Firestore transaction
  → createGeneration()        # Firestore record (status: "pending")
  → enqueueVideoGeneration()  # BullMQ job with tier priority
      │
      ▼
[GPU Worker — Celery + RunPod]
  Step 1: generate_draft_preview  → LTX model, 480p, RTX 3060/4090
                │
           (user approves draft)
                │
  Step 2: generate_video
    → split_into_scenes()     # 3 × 10s scenes for a 30s video
    → render_scene (×N)       # parallel RunPod jobs on tier GPU
    → stitch_scenes()         # FFmpeg concat → watermark → thumbnail
      │
      ▼
POST /api/webhooks/runpod
  → scene COMPLETED  → upload to R2, mark scene done
  → all scenes done  → stitch → mark generation COMPLETED
  → scene FAILED     → retry that scene only (smart retry)
```

**Model routing by tier (standard video):**

| Plan | Internal Tier | Default Model | GPU | Max Resolution | Max Duration |
|---|---|---|---|---|---|
| Free | `free` | `fal-ai/longcat-video/distilled/text-to-video/480p` | RTX 3060 | 480p | 5s |
| Starter | `creator` | `fal-ai/wan/v2.2-a14b/image-to-video` | RTX 4090 | 720p | 10s |
| Creator | `pro` | `fal-ai/kling-video/v2.6/pro/text-to-video` | A100 | 1080p | 15s |
| Pro | `studio` | `fal-ai/kling-video/v3/pro/text-to-video` | A100 | 1080p | 30s |

**Long-form video routing by tier:**

| Plan | Default Long-Form Model | Max Long-Form Duration |
|---|---|---|
| Free | ❌ not available | — |
| Starter | `fal-ai/longcat-video/distilled/text-to-video/720p` | 60s |
| Creator | `fal-ai/ltxv-13b-098-distilled` | 120s |
| Pro | `fal-ai/krea-wan-14b/text-to-video` | 120s |

**Full model catalog (40+ models, selectable per tier):**

> `+` means "and all higher tiers" (e.g. Starter+ = Starter, Creator, and Pro).

| Family | Models | Available from |
|---|---|---|
| Longcat | 480p / 720p (distilled + standard) | Free+ |
| LTXV / LTX | ltxv-13b, ltx-2, ltx-2.3, ltx-2-19b | Starter+ |
| WAN / Krea | WAN 2.2-a14b, WAN 2.2-5b, WAN 2.5, WAN 2.6, Krea WAN 14B | Starter+ |
| Kling | v2.6 Pro, v3 Pro, v3 Standard, O3 Pro, O3 Standard, v2.5 Turbo | Creator+ |
| Pixverse | v5, v5.5, v5.6 | Starter+ |
| ByteDance / Seedance | Seedance v1 Pro, Seedance v1.5 Pro | Starter+ |
| HeyGen / Argil | Avatar3 Digital Twin, Video Agent v2, Argil Avatars | Creator+ |
| Cosmos / HunyuanVideo | Cosmos Predict 2.5, HunyuanVideo v1.5 | Starter+ |
| MiniMax | Hailuo 2.3 | Creator+ |
| Kandinsky | Kandinsky5, Kandinsky5 Distilled | Starter+ |
| Vidu | Q3 Turbo | Starter+ |
| xAI / Veed | Grok Imagine Video, Veed Fabric 1.0 | Creator+ |

### Billing (Razorpay)

VideoForge uses **Razorpay's client-side popup** (not a hosted checkout redirect):

**Subscription flow:**
1. Client calls `billing.createSubscriptionCheckout` → server creates Razorpay subscription, returns `subscriptionId + keyId`
2. Client opens `window.Razorpay({ subscription_id })` popup
3. User pays → Razorpay calls handler with `razorpay_payment_id`, `razorpay_subscription_id`, `razorpay_signature`
4. Client calls `billing.verifySubscriptionPayment` → server verifies HMAC-SHA256 signature, upgrades tier, grants credits

**One-time credit purchase:**
1. Client calls `billing.createCreditCheckout` → server creates Razorpay order, returns `orderId + amount + keyId`
2. Client opens popup → user pays → handler fires
3. Client calls `billing.verifyCreditPayment` → server verifies signature, adds credits to Firestore

**Webhook** at `/api/webhooks/razorpay` handles async events (`subscription.charged`, `subscription.cancelled`, `payment.failed`) with `x-razorpay-signature` HMAC verification.

### Storage (Cloudflare R2)

All user media is stored in Cloudflare R2 with a structured key scheme:

```
videos/{userId}/{generationId}/output.mp4
videos/{userId}/{generationId}/thumbnail.jpg
characters/{userId}/{characterId}/reference.jpg
```

Helpers in `lib/r2.ts`: `uploadToR2`, `uploadFromUrl`, `deleteFromR2`, `getPresignedUploadUrl`, `buildVideoKey`, `buildThumbnailKey`, `buildCharacterKey`.

### Queue (BullMQ + Redis)

Two queues are defined in `lib/queue.ts`:

| Queue | Purpose |
|---|---|
| `video-generation` | Async video generation jobs (3 retries, exponential backoff) |
| `webhook-processing` | Async webhook event processing (5 retries) |

Jobs are enqueued with **BullMQ priority** based on subscription tier:

| Tier | Priority (lower = higher) |
|---|---|
| Studio | 1 |
| Pro | 3 |
| Creator | 5 |
| Free | 10 |

---

## India Pricing

VideoForge is designed primarily for the Indian market. Pricing is kept intentionally low and opaque to maximise conversions while protecting margin through hidden quality controls.

### Plans

| Plan | Internal Tier | Price (INR/mo) | Videos/month | GPU |
|---|---|:---:|:---:|---|
| **Starter** | `creator` | ₹199 | 50 | RTX 4090 |
| **Creator** | `pro` | ₹499 | 150 | A100 |
| **Pro** | `studio` | ₹999 | 400 | A100 (priority) |

### Hidden Controls (profit protection)

These are applied silently — users are never told about them:

| Plan | Slower Queue | Lower Quality | Watermark |
|---|:---:|:---:|:---:|
| Free | ✅ (priority 10) | ✅ (480p, RTX 3060) | ✅ |
| Starter (₹199) | slight (priority 7) | slight (720p max) | ❌ |
| Creator (₹499) | ❌ | ❌ | ❌ |
| Pro (₹999) | ❌ (priority queue) | ❌ (1080p, A100) | ❌ |

> The Dynamic Downgrade Engine adds additional quality caps when a user approaches their monthly cost ceiling, regardless of plan.

---

## Implementation Status

### ✅ Done

#### Infrastructure
- [x] Turborepo monorepo with npm workspaces
- [x] Shared TypeScript configs (`packages/config/tsconfig`)
- [x] Shared Tailwind design tokens (`packages/config/tailwind`)
- [x] Shared ESLint configs (`packages/config/eslint`)
- [x] Shared types, Zod schemas, pricing utilities (`packages/shared`)
- [x] Shared UI component library (`packages/ui`) — Button, Card, Badge, Input, Textarea, Progress, Skeleton

#### Web App (`apps/web`)
- [x] **Landing page** — hero, feature cards, testimonials, CTA, footer
- [x] **Auth pages** — login + register with Firebase email/password
- [x] **Dashboard** — stats (credits, total videos, this-month, plan), quick actions, upgrade banner, recent generations
- [x] **Generate page** — prompt form, negative prompt, duration, aspect ratio, resolution, model selection from full catalog, real-time status polling
- [x] **Long Video page** (`/generate/long-video`) — 30s / 60s / 120s duration presets, long-form model picker, tier-aware availability
- [x] **Gallery page** — infinite scroll, status filter (all/completed/processing/failed), load-more pagination
- [x] **Pricing page** — 4 plan cards with monthly/yearly toggle, save-20% badge, 4 credit top-up packs, FAQ
- [x] **Settings page** — profile update form, current plan display, cancel subscription button
- [x] **tRPC API** — generation, user, billing, character routers (fully type-safe)
- [x] **Firebase integration** — client SDK (auth) + Admin SDK (Firestore, verify tokens)
- [x] **Fal.ai webhook** — `IN_PROGRESS` → `COMPLETED` → R2 upload → `FAILED` + credit refund
- [x] **Razorpay billing** — subscription checkout, one-time credit purchase, HMAC verification, webhook handler
- [x] **Cloudflare R2** — upload, download, delete, presigned URL helpers
- [x] **Redis + BullMQ** — queue definitions, job enqueue with tier priority
- [x] **Model router** — tier-aware model selection, resolution/duration clamping, credit cost calculation; supports 40+ models across Longcat, LTXV, WAN, Kling, Pixverse, Seedance, HeyGen, Cosmos, and more
- [x] **Razorpay client utility** — lazy script loader (`lib/razorpay-client.ts`)

#### Mobile App (`apps/mobile`)
- [x] **Root layout** — tRPC client + TanStack Query provider
- [x] **Auth screen** — email/password login + register, Firebase Auth
- [x] **Generate screen** — prompt input, duration picker, aspect ratio selector, real-time generation status
- [x] **Gallery screen** — 2-column grid, infinite scroll, pull-to-refresh, thumbnail display, status dots
- [x] **Profile screen** — avatar, tier badge, stats grid (credits, total, this-month, max duration), plan features, sign out

---

### ✅ Recently Completed

| Item | What Was Built |
|---|---|
| **BullMQ worker process** | `apps/web/worker/video-generation.ts` — consumes jobs, calls `fal.queue.submit()` per model, stores `falRequestId`, falls back to credit refund on submission failure. Entry point: `apps/web/worker/index.ts`. Start with `npm run worker`. |
| **Video playback (web)** | `GenerationStatusCard` embeds an inline `<video>` element with mute toggle when status = `completed`. `VideoCard` already had hover-to-play. |
| **Video playback (mobile)** | Full-screen `expo-av` video player at `apps/mobile/app/video/[id].tsx` with play/pause, progress bar, and download. Gallery now navigates to this screen on tap. |
| **Character image upload** | `character.getUploadUrl` tRPC procedure returns a presigned R2 URL. `CreateCharacterDialog` uploads directly to R2 via `PUT`, then creates the character record with the public URL. |
| **Character management UI (web)** | `/characters` page with card grid, `CreateCharacterDialog` (image file picker + upload + form), `CharacterCard` with hover-delete confirm. Added to sidebar nav. |
| **Mobile billing screen** | `apps/mobile/app/(tabs)/billing.tsx` — shows plan, credits, plan features, upgrade options and credit packs (all linking to web pricing page via `Linking.openURL`). Added as 4th tab. |
| **Long-form video generation** | `/generate/long-video` page with `LongVideoForm` component; `generation.createLongVideo` and `generation.estimateLongVideoCost` tRPC procedures; tier-aware routing via `routeLongVideo()`; duration presets of 30s, 60s, 120s. Creator: up to 60s; Pro/Studio: up to 120s. |
| **Expanded model catalog** | 40+ models now available across Longcat, LTXV/LTX, WAN/Krea, Kling (v3/O3), Pixverse v5, ByteDance Seedance, HeyGen, Argil, Cosmos, HunyuanVideo, MiniMax, Kandinsky, Vidu, xAI Grok, and Veed Fabric. Full catalog exposed via `VIDEO_MODEL_CATALOG` in `packages/shared`. Each model has per-second USD cost, audio support flag, long-video support flag, avatar flag, and minimum tier. |

### 🚧 Pending / Not Yet Implemented

#### 🟡 Still Missing

| Item | Details |
|---|---|
| **Google / social OAuth** | Only email/password auth is implemented. Firebase supports Google, Apple, GitHub, etc. — none are wired up. |

#### 🟢 Nice-to-Have / Future

| Item | Details |
|---|---|
| **Tests** | No test files anywhere in the monorepo (no Jest, Vitest, or Playwright config). |
| **CI/CD pipeline** | No GitHub Actions workflows, Dockerfile, or `docker-compose.yml`. |
| **Deployment config** | No Vercel `vercel.json`, no Railway/Render config, no environment setup docs. |
| **Push notifications** | `expo-notifications` is not installed. No server-side push trigger on video completion. |
| **Email notifications** | No transactional email (e.g., Resend, SendGrid) for signup confirmation or video-ready alerts. |
| **Error monitoring** | No Sentry or similar error tracking integrated. |
| **Analytics** | No usage analytics (Mixpanel, PostHog, etc.) beyond the basic Firestore counters. |
| **Social OAuth for export** | YouTube / Instagram / TikTok export requires per-platform OAuth flows (pending platform credential setup). |

---

### ✅ New Features Added (This Release)

| Feature | Router / File | What Was Built |
|---|---|---|
| **1-Click Templates** | `templates` tRPC router, `apps/web/lib/templates.ts` | 9 launch-ready templates (Motivational Reel, Gym Workout, Crypto News, Anime Edit, News Explainer, Product Showcase, Travel Reel, Food Reel, Educational Explainer). Each template includes pre-filled prompt, suggested model, tier gating, aspect ratio, and duration. `templates.list`, `templates.getById`, `templates.generate` procedures. |
| **Auto-Script Generator** | `autoScript` tRPC router | User enters plain-English intent ("make gym video") → system generates a structured script with scene-by-scene visual descriptions, captions, music mood, and recommended model. Keyword → style mapping covers Fitness, Crypto, Anime, Food, Travel, and fallback Creative styles. Scripts persisted to Firestore `generatedScripts` collection. |
| **Price-Control Dashboard** | `admin` tRPC router | Per-user metrics: Revenue (INR + USD), GPU cost (USD), net margin, videos generated, retry rate, GPU usage seconds, auto-downgrade status. Platform-wide summary: total revenue, total GPU cost, total margin, active users, average retry rate, downgraded user count. Auto-downgrade rule: if `gpuCostUsd > revenueUsd`, user is flagged for quality downgrade. Admin can manually set/clear downgrade flags. Gated behind `studio` tier (replace with Firebase custom claim in production). |
| **Direct Export** | `export` tRPC router | `local` export: generates a signed R2 download URL (expires in 1 hour) for browser download. `youtube_shorts`, `instagram_reels`, `tiktok`: creates async `exportJobs` Firestore record (status: pending) ready for background OAuth upload worker. `export.create`, `export.getStatus`, `export.list` procedures. |
| **Community Content Loop** | `community` tRPC router | Trending feed (`community.trending`) ordered by likes with cursor pagination. Publish any completed generation (`community.publish`). Like/unlike toggle (`community.like`). Remix: generate a new video seeded from a community post's prompt (`community.remix`). |
| **Presigned Download URL** | `apps/web/lib/r2.ts` | New `getPresignedDownloadUrl()` helper for generating time-limited download links with `Content-Disposition: attachment` headers. |
| **Admin middleware** | `apps/web/server/trpc.ts` | `adminProcedure` — enforces `studio` tier for admin-only routes. |
| **Shared types** | `packages/shared/src/types/index.ts` | `VideoTemplate`, `ScriptScene`, `GeneratedScript`, `ExportTarget`, `ExportJob`, `CommunityVideo`, `RemixRequest`, `AdminUserMetrics`, `PlatformMetrics` |
| **Shared schemas** | `packages/shared/src/schemas/index.ts` | `templateGenerateSchema`, `autoScriptRequestSchema`, `exportRequestSchema`, `communityRemixSchema`, `templateCategorySchema`, `exportTargetSchema` |

---

## Roadmap

> Items are ordered roughly by priority. Contributions are welcome on any of these!

### 🟡 Short-term (next release)

| Priority | Item | Notes |
|:---:|---|---|
| 🔴 High | **Google / Social OAuth** | Wire up Firebase Google, Apple, GitHub providers |
| 🔴 High | **Rate limiting** | IP-based + per-user middleware on tRPC & webhook routes |
| 🟠 Med | **Template UI page** | `/templates` page with category filter, preview cards, and 1-click launch |
| 🟠 Med | **Auto-Script UI** | `/generate/script` page with intent input, scene preview, and "Generate from Script" button |
| 🟠 Med | **Price-Control Dashboard UI** | `/admin/dashboard` page with metrics table, per-user drilldown, and downgrade controls |
| 🟠 Med | **Community feed UI** | `/community` page with trending video grid, like button, and remix modal |
| 🟠 Med | **Export button** | Download / share buttons on `VideoCard` and the generation detail view |
| 🟠 Med | **Email notifications** | Resend / SendGrid for signup confirmation and video-ready alerts |
| 🟠 Med | **Push notifications** | `expo-notifications` on mobile; server-side trigger on video completion |
| 🟡 Low | **Privacy / Terms pages** | Replace `#` links in footer with real content |

### 🟢 Mid-term

| Item | Notes |
|---|---|
| **Test suite** | Vitest unit tests + Playwright E2E; no tests exist yet |
| **CI/CD pipeline** | GitHub Actions for lint + typecheck + build on PRs |
| **Error monitoring** | Sentry integration for both web and worker |
| **Analytics** | PostHog or Mixpanel for usage funnels |
| **Social OAuth for export** | YouTube Data API v3, Instagram Graph API, TikTok API — OAuth credential setup + background upload worker |
| **Watermark removal flow** | Clearly surface watermark on Free plan videos; upsell to Starter to remove |
| **LLM-powered script generator** | Replace keyword-based intent detection with GPT-4o-mini or Gemini for richer scene scripts |

### 🔵 Long-term / Nice-to-Have

| Item | Notes |
|---|---|
| **Image-to-video on web** | UI upload flow exists in mobile; add to web generate page |
| **Multi-shot / storyboard** | Sequence multiple prompts into a single video narrative |
| **Native audio generation** | Auto-generate sound effects + ambience |
| **Collaboration** | Teams, shared galleries, project workspaces |
| **API access (Pro)** | Public REST/tRPC API for Pro tier (already gated in billing) |
| **Replicate fallback** | Automatic failover from Fal.ai → Replicate on errors |
| **Community monetisation** | Revenue share for viral community videos |

---

## Contributing

We welcome contributions of all sizes! Here's how to get started:

### Quick contribution guide

1. **Fork** the repo and create your branch from `main`:
   ```bash
   git checkout -b feat/your-feature-name
   ```
2. Copy `.env.example` to `.env.local` in `apps/web/` and `apps/mobile/` and fill in your secrets
3. Install dependencies: `npm install` (from repo root)
4. Make your changes, then ensure everything passes:
   ```bash
   npm run lint       # ESLint across all packages
   npm run typecheck  # tsc --noEmit across all packages
   npm run build      # Production build
   ```
5. Commit with a clear message following [Conventional Commits](https://www.conventionalcommits.org/):
   ```
   feat: add Google OAuth provider
   fix: refund credits on webhook timeout
   docs: update environment variable list
   ```
6. Open a Pull Request — describe **what** and **why**, not just how.

### Areas most in need of help

- 🧪 **Tests** — the monorepo has zero tests; Vitest unit tests or Playwright E2E would be a huge win
- 🔐 **Google/Social OAuth** — straightforward Firebase wiring
- 📧 **Email notifications** — Resend SDK integration
- 🌐 **Internationalisation** — `next-intl` or similar

### Code style

- **TypeScript strict mode** everywhere — no `any`, no `@ts-ignore`
- Tailwind utility classes; avoid raw `style=` attributes on web
- Keep shared logic in `packages/shared`; keep UI primitives in `packages/ui`
- One tRPC procedure per logical operation — keep routers slim

---

## FAQ

<details>
<summary><strong>What AI models does VideoForge support?</strong></summary>

VideoForge supports **40+ models** via [Fal.ai](https://fal.ai/), automatically routed by subscription tier. Each tier's default model is listed below, but users can choose any model available for their tier:

| Tier | Default Model | Max Resolution |
|---|---|---|
| Free | Longcat 480p (distilled) | 480p |
| Creator | WAN 2.2 (image-to-video) | 720p |
| Pro | Kling v2.6 Pro | 1080p |
| Studio | Kling v3 Pro | 1080p |

Additional model families available: Longcat (480p/720p variants), LTXV / LTX, WAN 2.2/2.5/2.6, Krea WAN 14B, Kling v3 Standard, Kling O3 Pro/Standard, Pixverse v5/5.5/5.6, ByteDance Seedance v1/v1.5, HeyGen Avatar3 / Video Agent, Argil Avatars, Cosmos Predict 2.5, HunyuanVideo v1.5, MiniMax Hailuo 2.3, Kandinsky5, Vidu Q3, xAI Grok Imagine Video, and Veed Fabric 1.0.
</details>

<details>
<summary><strong>How does the credit system work?</strong></summary>

- **1 credit = $0.10 USD**
- Credits are deducted **upfront** when you submit a generation
- If generation **fails**, credits are automatically **refunded** to your account
- Monthly plan credits reset each billing cycle; top-up packs never expire
- Credit cost depends on model, resolution, and duration — use `generation.estimateCost` to preview before generating
</details>

<details>
<summary><strong>Why Razorpay instead of Stripe?</strong></summary>

Razorpay is optimised for the Indian market with support for UPI, Netbanking, and domestic cards. The billing implementation is fully swappable — the `billing` tRPC router abstracts payment provider details.
</details>

<details>
<summary><strong>Can I self-host VideoForge?</strong></summary>

Yes. You need:
- A Firebase project (Auth + Firestore)
- A [Fal.ai](https://fal.ai/) API key
- A Razorpay account (or swap for Stripe)
- A Cloudflare R2 bucket (or any S3-compatible storage)
- Redis (locally or a managed service like Upstash)

See [Getting Started](#getting-started) for the full env-var list and [Deployment](#deployment) for hosting options.
</details>

<details>
<summary><strong>How does character consistency work?</strong></summary>

Upload a reference image for a character on the `/characters` page. When generating a video you can select that character — the reference image is passed to the AI model alongside your text prompt to maintain visual consistency across generations.
</details>

<details>
<summary><strong>Is there a mobile app?</strong></summary>

Yes — a full-featured Expo / React Native app lives in `apps/mobile`. It shares the same tRPC API as the web app and includes: auth, generate screen, gallery (infinite scroll), full-screen video player, profile & stats, and a billing screen.
</details>

<details>
<summary><strong>What is long-form video generation?</strong></summary>

Long-form video lets you generate videos of **30 seconds, 60 seconds, or 2 minutes** in a single request — far beyond the standard 5–15 second limit. It is available on paid plans via the `/generate/long-video` page:

| Plan | Max Duration |
|---|---|
| Creator | 60 seconds |
| Pro | 120 seconds |
| Studio | 120 seconds |

Long-form generation uses models purpose-built for continuous long-form output, such as Longcat, LTXV, Krea WAN 14B, Cosmos Predict 2.5, and HunyuanVideo. Credits are charged per second at the model's standard rate.
</details>

---

## Support

- 🐛 **Found a bug?** [Open an issue](../../issues/new?template=bug_report.md)
- 💡 **Feature request?** [Start a discussion](../../discussions/new?category=ideas)
- 🔒 **Security vulnerability?** Please open a [private security advisory](../../security/advisories/new) — do **not** open a public issue

---

## Acknowledgments

VideoForge is built on the shoulders of giants:

- [Fal.ai](https://fal.ai/) — AI model inference (Kling, WAN, Longcat)
- [Turborepo](https://turbo.build/) — monorepo build system
- [tRPC](https://trpc.io/) — end-to-end type-safe API layer
- [TanStack Query](https://tanstack.com/query) — async state management
- [Firebase](https://firebase.google.com/) — auth and Firestore database
- [Cloudflare R2](https://www.cloudflare.com/products/r2/) — zero-egress-cost video storage
- [BullMQ](https://bullmq.io/) — priority job queues
- [Razorpay](https://razorpay.com/) — billing and payments
- [Framer Motion](https://www.framer.com/motion/) — animations
- [shadcn/ui](https://ui.shadcn.com/) — UI component inspiration

---

## License

MIT © VideoForge — see [LICENSE](LICENSE) for details.


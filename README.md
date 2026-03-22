# VideoForge — AI Video Generation Platform

> **Turn text into cinematic videos** powered by Kling AI, WAN 2.2, and Fal.ai — with subscriptions handled by Razorpay.

<div align="center">

![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)
![Expo](https://img.shields.io/badge/Expo-52-blue?logo=expo)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue?logo=typescript)
![Turborepo](https://img.shields.io/badge/Turborepo-2-red?logo=turborepo)
![Firebase](https://img.shields.io/badge/Firebase-10-orange?logo=firebase)

</div>

---

## Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Monorepo Structure](#monorepo-structure)
- [Design System](#design-system)
- [Features & Subscription Tiers](#features--subscription-tiers)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Environment Variables](#environment-variables)
  - [Install & Run](#install--run)
- [Architecture](#architecture)
  - [API Layer (tRPC)](#api-layer-trpc)
  - [AI Video Generation Pipeline](#ai-video-generation-pipeline)
  - [Billing (Razorpay)](#billing-razorpay)
  - [Storage (Cloudflare R2)](#storage-cloudflare-r2)
  - [Queue (BullMQ + Redis)](#queue-bullmq--redis)
- [Implementation Status](#implementation-status)
  - [✅ Done](#-done)
  - [🚧 Pending / Not Yet Implemented](#-pending--not-yet-implemented)

---

## Overview

**VideoForge** is a full-stack AI video generation SaaS platform built as a Turborepo monorepo. Users can:

- Generate videos from text prompts using multiple AI models (Kling v3, Kling v2.6 Pro, WAN 2.2, LongCat)
- Manage character consistency across generations
- Browse their video gallery
- Subscribe to tiered plans or buy one-time credit packs (via Razorpay)
- Access everything from both a **Next.js web app** and a native **Expo/React Native mobile app**

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
| **AI / Video** | [Fal.ai](https://fal.ai/) (Kling v3 Pro, Kling v2.6 Pro, WAN 2.2, LongCat) |
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
│   │   │   ├── generation/           # GenerationForm + StatusCard
│   │   │   └── layout/               # AppLayout, Sidebar, Header
│   │   ├── server/
│   │   │   ├── trpc.ts               # tRPC context + middleware
│   │   │   └── routers/
│   │   │       ├── _app.ts           # Root router
│   │   │       ├── generation.ts     # Video generation CRUD
│   │   │       ├── user.ts           # User profile + stats
│   │   │       ├── billing.ts        # Razorpay checkout + verification
│   │   │       └── character.ts      # Character management
│   │   ├── lib/
│   │   │   ├── db.ts                 # Firestore operations
│   │   │   ├── fal.ts                # Fal.ai client + types
│   │   │   ├── firebase.ts           # Firebase client SDK
│   │   │   ├── firebase-admin.ts     # Firebase Admin SDK
│   │   │   ├── model-router.ts       # Tier → model mapping + credit calc
│   │   │   ├── pricing.ts            # Razorpay plan IDs + pricing config
│   │   │   ├── queue.ts              # BullMQ queue definitions
│   │   │   ├── r2.ts                 # Cloudflare R2 helpers
│   │   │   ├── razorpay-client.ts    # Client-side Razorpay script loader
│   │   │   └── redis.ts              # ioredis singleton
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

| Feature | Free | Creator ($19/mo) | Pro ($49/mo) | Studio ($149/mo) |
|---|:---:|:---:|:---:|:---:|
| Videos / day | 3 | — | — | — |
| Videos / month | — | 50 | 200 | Unlimited |
| Max duration | 5s | 10s | 15s | 15s |
| Max resolution | 480p | 720p | 1080p | 1080p |
| Watermark | ✅ | ❌ | ❌ | ❌ |
| Character consistency | ❌ | ✅ | ✅ | ✅ |
| Motion control | ❌ | ❌ | ✅ | ✅ |
| Priority queue | ❌ | ❌ | ✅ | ✅ |
| AI Model | LongCat (480p) | WAN 2.2 | Kling v2.6 Pro | Kling v3 Pro |
| Included credits/mo | 0 | 190 | 490 | 1,490 |
| API access | ❌ | ❌ | ❌ | ✅ |

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

# Build
npm run build

# Lint
npm run lint

# Type-check
npm run typecheck
```

---

## Architecture

### API Layer (tRPC)

All server-client communication goes through a single **tRPC** router at `/api/trpc`. Every procedure is type-safe end-to-end:

```
appRouter
├── generation
│   ├── create          — validate, deduct credits, enqueue job
│   ├── getById         — poll status (used by StatusCard)
│   ├── list            — paginated history (cursor-based)
│   ├── cancel          — cancel pending jobs
│   └── estimateCost    — preview credit cost before generating
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
      ↓
tRPC generation.create
  → routeModel()       # select model based on tier + resolution
  → deductCredits()    # atomic Firestore transaction
  → createGeneration() # Firestore record (status: "pending")
  → enqueueVideoGeneration() # BullMQ job with tier priority
      ↓
[BullMQ Worker] (⚠ not yet implemented — see Pending)
  → fal.ai API call
  → poll / webhook
      ↓
POST /api/webhooks/fal
  → status: IN_PROGRESS  → update generation (processing)
  → status: COMPLETED    → download from fal.ai → upload to R2 → mark completed
  → status: FAILED       → mark failed + refund credits
```

**Model routing by tier:**

| Tier | Default Model | Max Resolution | Max Duration |
|---|---|---|---|
| Free | `fal-ai/longcat-video/distilled/text-to-video/480p` | 480p | 5s |
| Creator | `fal-ai/wan/v2.2-a14b/image-to-video` | 720p | 10s |
| Pro | `fal-ai/kling-video/v2.6/pro/text-to-video` | 1080p | 15s |
| Studio | `fal-ai/kling-video/v3/pro/text-to-video` | 1080p | 15s |

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
- [x] **Generate page** — prompt form, negative prompt, duration, aspect ratio, resolution, model, real-time status polling
- [x] **Gallery page** — infinite scroll, status filter (all/completed/processing/failed), load-more pagination
- [x] **Pricing page** — 4 plan cards with monthly/yearly toggle, save-20% badge, 4 credit top-up packs, FAQ
- [x] **Settings page** — profile update form, current plan display, cancel subscription button
- [x] **tRPC API** — generation, user, billing, character routers (fully type-safe)
- [x] **Firebase integration** — client SDK (auth) + Admin SDK (Firestore, verify tokens)
- [x] **Fal.ai webhook** — `IN_PROGRESS` → `COMPLETED` → R2 upload → `FAILED` + credit refund
- [x] **Razorpay billing** — subscription checkout, one-time credit purchase, HMAC verification, webhook handler
- [x] **Cloudflare R2** — upload, download, delete, presigned URL helpers
- [x] **Redis + BullMQ** — queue definitions, job enqueue with tier priority
- [x] **Model router** — tier-aware model selection, resolution/duration clamping, credit cost calculation
- [x] **Razorpay client utility** — lazy script loader (`lib/razorpay-client.ts`)

#### Mobile App (`apps/mobile`)
- [x] **Root layout** — tRPC client + TanStack Query provider
- [x] **Auth screen** — email/password login + register, Firebase Auth
- [x] **Generate screen** — prompt input, duration picker, aspect ratio selector, real-time generation status
- [x] **Gallery screen** — 2-column grid, infinite scroll, pull-to-refresh, thumbnail display, status dots
- [x] **Profile screen** — avatar, tier badge, stats grid (credits, total, this-month, max duration), plan features, sign out

---

### 🚧 Pending / Not Yet Implemented

#### 🔴 Critical

| Item | Details |
|---|---|
| **BullMQ worker process** | `lib/queue.ts` defines the queues and `enqueueVideoGeneration()` adds jobs, but there is no worker file that actually **consumes** jobs, calls the Fal.ai API (`fal.subscribe()`), and processes results. Without this, video generation won't work end-to-end. |
| **Video playback** | Web `VideoCard` and mobile gallery display thumbnails/status but have no video `<video>` player or `expo-av` playback. Users can't watch their generated videos in-app. |

#### 🟡 Important

| Item | Details |
|---|---|
| **Reference image / character image upload** | `getPresignedUploadUrl()` in `lib/r2.ts` exists but there is no upload UI — no file picker, no presigned URL flow, no progress indicator. Characters can't be created without a working upload. |
| **Character management UI (web)** | The character tRPC router is complete but there is no web page/component to list, create, or delete characters. |
| **Mobile billing screen** | The Profile screen has placeholder menu items ("Billing & Subscription", "Account Settings") that don't navigate anywhere. No mobile billing flow exists. |
| **Google / social OAuth** | Only email/password auth is implemented. Firebase supports Google, Apple, GitHub, etc. — none are wired up. |

#### 🟢 Nice-to-Have / Future

| Item | Details |
|---|---|
| **Tests** | No test files anywhere in the monorepo (no Jest, Vitest, or Playwright config). |
| **CI/CD pipeline** | No GitHub Actions workflows, Dockerfile, or `docker-compose.yml`. |
| **Deployment config** | No Vercel `vercel.json`, no Railway/Render config, no environment setup docs. |
| **Push notifications** | `expo-notifications` is not installed. No server-side push trigger on video completion. |
| **Email notifications** | No transactional email (e.g., Resend, SendGrid) for signup confirmation or video-ready alerts. |
| **Video download** | No download button on web or mobile. |
| **Admin dashboard** | No internal admin interface for managing users, viewing revenue, or moderating content. |
| **Rate limiting** | No IP-based or per-user request rate limiting middleware on tRPC or webhook routes. |
| **Privacy / Terms / API pages** | Footer links point to `#` — these pages don't exist. |
| **Error monitoring** | No Sentry or similar error tracking integrated. |
| **Analytics** | No usage analytics (Mixpanel, PostHog, etc.) beyond the basic Firestore counters. |

---

## Contributing

1. Clone the repo
2. Copy `.env.example` to `.env.local` in `apps/web/` and `apps/mobile/`
3. Fill in all required secrets
4. Run `npm install` from the repo root
5. Run `npm run dev` to start all apps

Linting and type-checking run across all packages via Turborepo:

```bash
npm run lint       # ESLint across all packages
npm run typecheck  # tsc --noEmit across all packages
npm run build      # Production build (web only currently)
```

---

## License

MIT © VideoForge

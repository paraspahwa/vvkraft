# Product Requirements Document (PRD)

# AI Video Generation Platform - “VideoForge”

```
Version: 1.
Date: March 22, 2026
Author: Product Team
Status: Draft
```
## 1. Executive Summary

```
1.1 Product Vision
```
VideoForge is a unified AI video generation platform that democratizes access to state-of-the-art video
generation models. Built as a cost-effective alternative to Kling AI, it offers text-to-video, image-to-video,
and advanced features like multi-shot storyboarding across web and mobile platforms.

```
1.2 Key Differentiators
```
- **3-Tier Smart Routing** : Automatically selects optimal AI models based on user tier and budget
    ($0.005/sec to $0.336/sec)
- **Unified Codebase** : 70% shared code between web (Next.js) and mobile (Expo React Native)
- **Cost Eﬀiciency** : 40-60% cheaper than competitors through intelligent model selection
- **Full Feature Parity** : Matches Kling AI 3.0 capabilities including native audio, multi-shot, and
    motion control

```
1.3 Success Metrics
```
```
Metric Target
Customer Acquisition Cost (CAC) <$
Lifetime Value (LTV) >$
LTV:CAC Ratio >3:
Gross Margin 60-70%
Monthly Churn <5%
API Cost per $1 Revenue <$0.
```
## 2. Product Objectives

```
2.1 Primary Goals
```
1. **Launch MVP within 8 weeks** with core video generation capabilities
2. **Achieve feature parity with Kling AI 3.0** within 12 weeks
3. **Acquire 1,000 active users** within 3 months of launch
4. **Reach break-even** (100 paid subscribers) within 2 months


**2.2 Secondary Goals**

```
1.Build a developer API ecosystem
2.Establish enterprise/white-label offerings
3.Create a marketplace for custom LoRA models
4.Achieve 10,000 MAU within 6 months
```
## 3. User Personas

**3.1 Primary: Content Creator “Alex”**

- **Demographics** : 25-35 years old, social media influencer, YouTuber, TikTok creator
- **Pain Points** : Expensive video production, time-consuming editing, need for unique content
- **Goals** : Generate 5-10 short videos daily, maintain consistent style, minimize costs
- **Tech Savviness** : High, comfortable with AI tools
- **Budget** : $20-50/month for tools

**3.2 Secondary: Marketing Professional “Sarah”**

- **Demographics** : 30-45 years old, works at SMB or agency
- **Pain Points** : Tight deadlines, limited video production budget, need for rapid iteration
- **Goals** : Create product demos, social ads, explainer videos quickly
- **Tech Savviness** : Medium, prefers intuitive interfaces
- **Budget** : $100-300/month team budget

**3.3 Tertiary: Indie Filmmaker “Marcus”**

- **Demographics** : 28-40 years old, independent creator, pre-visualization needs
- **Pain Points** : Storyboarding is time-consuming, need to visualize scenes before production
- **Goals** : Generate storyboards, concept videos, test camera movements
- **Tech Savviness** : Very High, wants fine-grained control
- **Budget** : $50-150/month, willing to pay for quality

## 4. Functional Requirements

**4.1 Core Video Generation**

**4.1.1 Text-to-Video (T2V) Priority:** P
**Description:** Generate video from natural language prompts

```
Requirement Acceptance Criteria
T2V-001 Support prompts up to 2,000 characters
T2V-002 Generate 5-15 second videos based on tier
T2V-003 Support negative prompts
T2V-004 Real-time generation status updates
T2V-005 Support 16:9, 9:16, 1:1, 21:9 aspect ratios
T2V-006 Queue system for high-demand periods
```

**Models by Tier:**

- Free:fal-ai/longcat-video/distilled/text-to-video/480p($0.005/sec)
- Pro:fal-ai/kling-video/v2.6/pro/text-to-video($0.07-0.14/sec)
- Studio:fal-ai/kling-video/v3/pro/text-to-video($0.224-0.336/sec)

**4.1.2 Image-to-Video (I2V) Priority:** P
**Description:** Animate static images with realistic motion

```
Requirement Acceptance Criteria
I2V-001 Support JPG, PNG, WebP up to 10MB
I2V-002 Drag-and-drop upload (web) / Camera roll
(mobile)
I2V-003 Optional text prompt for motion guidance
I2V-004 First/last frame conditioning
I2V-005 Motion intensity control (subtle/moderate/
dynamic)
```
**Models:**

- Primary:fal-ai/kling-video/v2.5-turbo/standard/image-to-video($0.042/sec)
- Alternative:fal-ai/wan/v2.2-a14b/image-to-video($0.06-0.08/sec)

**4.1.3 Video-to-Video (V2V) Priority:** P
**Description:** Transform and edit existing video content

```
Requirement Acceptance Criteria
V2V-001 Upload videos up to 30 seconds
V2V-002 Style transfer options
V2V-003 Natural language editing commands
V2V-004 Background replacement
V2V-005 Character/object replacement
```
**Models:**

- fal-ai/kling-video/o3/pro/text-to-video(with video input)

**4.2 Advanced Features**

**4.2.1 Multi-Shot Storyboarding Priority:** P
**Description:** Generate multiple camera cuts in single request

```
Requirement Acceptance Criteria
MSB-001 Support 3-6 camera shots per generation
MSB-002 Maintain character consistency across shots
```

```
Table 5 – continued
Requirement Acceptance Criteria
MSB-003 Automatic scene transition handling
MSB-004 Shot type selection (close-up, wide, medium)
MSB-005 Export as individual clips or combined video
```
**Model:** fal-ai/kling-video/v3/standardorfal-ai/kling-video/o3/pro

**4.2.2 Native Audio Generation Priority:** P
**Description:** Synchronized audio generation with video

```
Requirement Acceptance Criteria
NAG-001 Toggle audio on/off per generation
NAG-002 Separate controls for dialogue, SFX, ambience
NAG-003 Voice binding (consistent character voices)
NAG-004 5+ language support (EN, CN, JP, KR, ES)
NAG-005 Audio preview before final generation
```
**Cost Impact:** +100% (e.g., $0.07 → $0.14/sec for Kling 2.6)

**4.2.3 Motion Control Priority:** P
**Description:** Precise camera and object movement control

```
Requirement Acceptance Criteria
MC-001 Camera movement: pan, tilt, dolly, zoom, orbit
MC-002 Motion path drawing (mobile touch, web mouse)
MC-003 Speed control (slow/medium/fast)
MC-004 3D spatial positioning hints
MC-005 Physics-aware motion (cloth, fluid dynamics)
```
**4.2.4 Character Consistency (Multi-Reference) Priority:** P
**Description:** Maintain character appearance across generations

```
Requirement Acceptance Criteria
MRC-001 Upload 1-10 reference images per character
MRC-002 Character name/tagging system
MRC-003 Character library management
MRC-004 Cross-video character persistence
MRC-005 Style consistency (clothing, features)
```
**4.2.5 AI Avatar / Talking Head Priority:** P
**Description:** Generate talking head videos from image + audio


```
Requirement Acceptance Criteria
AVA-001 Upload portrait photo
AVA-002 Upload audio file or text-to-speech
AVA-003 Lip-sync accuracy >90%
AVA-004 Head movement naturalness
AVA-005 Background replacement option
```
**Model:** fal-ai/heygen/avatar3/digital-twin($0.034/sec)

**4.3 User Management & Monetization**

**4.3.1 Authentication**

```
Requirement Implementation
AUTH-001 Email/password registration
AUTH-002 Google OAuth
AUTH-003 Apple Sign-In (mobile)
AUTH-004 Anonymous auth (limited preview)
AUTH-005 JWT token refresh
```
**Tech:** Firebase Authentication

**4.3.2 Credit System**

```
Requirement Details
CRED-001 Credits as platform currency
CRED-002 Different costs per model/resolution
CRED-003 Credit packs (one-time purchase)
CRED-004 Monthly subscription allowances
CRED-005 Credit rollover (max 30 days)
CRED-006 Usage history and analytics
```
**4.3.3 Subscription Tiers**

```
Tier Price Credits Features Models Available
Free $0 15/day (5s 480p) Basic T2V,
watermarked
```
```
LongCat 480p, Wan 2.
```
```
Creator $19/mo 50/mo I2V, 10s, 720p, no
watermark
```
```
+Kling 2.6, LTX
```
```
Pro $49/mo 150/mo Audio, 15s, 1080p,
priority
```
```
+Kling 3.0, multi-shot
```
```
Studio $149/mo 500/mo V2V, team features,
API access
```
```
+Kling O3, HeyGen
```

```
Table 12 – continued
Tier Price Credits Features Models Available
Enterprise Custom Unlimited SLA, custom
models, white-label
```
```
All + fine-tuning
```
**4.4 Web Platform Features**

**4.4.1 Dashboard**

- Generation history with infinite scroll
- Project folders/organization
- Usage analytics and spending tracker
- Credit balance and purchase flow
- Team management (Studio+)

**4.4.2 Generation Interface**

- Split-screen: prompt input + preview
- Real-time prompt enhancement suggestions
- Model selector with cost preview
- Advanced settings accordion (negative prompts, seed, etc.)
- Batch generation queue (up to 10 prompts)

**4.4.3 Gallery & Management**

- Grid/list view toggle
- Filtering by date, model, duration, status
- Bulk operations (download, delete, favorite)
- Shareable links with custom domains (Pro+)
- Embed codes for websites

**4.5 Mobile App Features (Expo React Native)**

**4.5.1 Core Mobile Experience**

```
Feature Implementation
Camera Integration Expo Camera SDK - instant capture-to-video
Photo Library Expo Image Picker - multi-select up to 10 images
Background Upload expo-background-upload [^25 ] - upload while app backgrounded
Video Caching expo-video with LRU cache [^24 ] - offline viewing
Push Notifications Firebase Cloud Messaging - generation complete/failed
Deep Linking Expo Linking - shared video opens in app
```
**4.5.2 Mobile-Specific UI**

- Bottom sheet for generation settings


- Swipe gestures for gallery navigation
- Pull-to-refresh for status updates
- Picture-in-Picture video playback [^24 ]
- Share extension (generate from any app)
- Widget for quick generation (iOS 18+/Android 14+)

**4.5.3 Offline Capabilities**

- Queue generations when offline
- Auto-retry with exponential backoff
- Download videos for offline viewing
- Sync status when connection restored

## 5. Technical Architecture

**5.1 System Architecture**

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ UNIFIED CODEBASE ARCHITECTURE │
├─────────────────────────────────────────────────────────────────────────────┤
│ │
│ WEB (Next.js 14) MOBILE (Expo React Native) │
│ ┌─────────────────┐ ┌─────────────────┐ │
│ │ App Router │ │ Expo SDK 52 │ │
│ │ Tailwind CSS │◄───────────────►│ NativeWind │ 70% SHARED │
│ │ shadcn/ui │ Shared UI │ Tamagui │ COMPONENTS │
│ └─────────────────┘ └─────────────────┘ │
│ │ │ │
│ └──────────┬─────────────────────────┘ │
│ │ │
│ ┌─────────────────▼─────────────────────────────────────────────┐ │
│ │ SHARED BUSINESS LOGIC (TypeScript) │ │
│ │ ┌─────────────┐ ┌─────────────┐ ┌─────────────────────┐ │ │
│ │ │ API Client │ │ Auth Store │ │ Video State Mgmt │ │ │
│ │ │ (TanStack) │ │ (Zustand) │ │ (React Query) │ │ │
│ │ └─────────────┘ └─────────────┘ └─────────────────────┘ │ │
│ └─────────────────────────────────────────────────────────────┘ │
│ │ │
│ ▼ │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ BACKEND (Next.js API Routes + Firebase) │ │
│ │ ┌─────────────┐ ┌─────────────┐ ┌─────────────────────┐ │ │
│ │ │ REST API │ │ Webhooks │ │ Queue Management │ │ │
│ │ │ (tRPC) │ │ (Fal.ai) │ │ (BullMQ/Redis) │ │ │
│ │ └─────────────┘ └─────────────┘ └─────────────────────┘ │ │
│ └─────────────────────────────────────────────────────────────┘ │
│ │ │
│ ▼ │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ AI MODEL ORCHESTRATION LAYER (Smart Router) │ │
```

```
│ │ ┌─────────────┐ ┌─────────────┐ ┌─────────────────────┐ │ │
│ │ │ Budget Tier│ │ Pro Tier │ │ Studio Tier │ │ │
│ │ │ $0.005-0.04│ │ $0.07-0.14 │ │ $0.224-0.336 │ │ │
│ │ └─────────────┘ └─────────────┘ └─────────────────────┘ │ │
│ └─────────────────────────────────────────────────────────────┘ │
│ │ │
│ ▼ │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ STORAGE & CDN │ │
│ │ Cloudflare R2 ($0.015/GB) + Cloudflare Stream (adaptive) │ │
│ └─────────────────────────────────────────────────────────────┘ │
│ │
└─────────────────────────────────────────────────────────────────────────────┘
```
**5.2 Technology Stack**

**5.2.1 Frontend (Web)**

```
Layer Technology Purpose
Framework Next.js 14 (App Router) SSR, API routes, deployment
Styling Tailwind CSS Utility-first CSS
Components shadcn/ui Accessible component library
State Zustand Global state management
Data Fetching TanStack Query Server state, caching
Forms React Hook Form + Zod Validation
```
**5.2.2 Mobile**

```
Layer Technology Purpose
Framework Expo SDK 52 React Native platform
Styling NativeWind Tailwind for RN
UI Kit Tamagui Cross-platform components
Navigation Expo Router File-based routing
Animations React Native Reanimated 3 Smooth 60fps animations
Video expo-video Modern video player
```
**5.2.3 Backend**

```
Layer Technology Purpose
Runtime Node.js 20 Server environment
Framework Next.js API Routes Serverless functions
API Layer tRPC Type-safe APIs
Queue BullMQ + Redis Job processing
Auth Firebase Auth User authentication
Database Cloud Firestore NoSQL document store
Storage Cloudflare R2 Video file storage
```

```
Table 16 – continued
Layer Technology Purpose
CDN Cloudflare Stream Adaptive video streaming
```
**5.2.4 AI/ML Integration**

```
Service Provider Purpose
Primary API Fal.ai Video generation models
Fallback API Replicate Redundancy
Monitoring Langfuse API cost tracking
Caching In-memory + Redis Prompt-to-video hash caching
```
**5.3 Database Schema**

```
// Firestore Collections
```
```
interfaceUser {
uid:string;
email:string;
tier:'free'|'creator'|'pro'|'studio'|'enterprise';
credits:number;
dailyGenerations:number;
lastReset:Timestamp;
subscriptionId?:string;
createdAt:Timestamp;
updatedAt:Timestamp;
}
```
```
interfaceGeneration {
id:string;
userId:string;
status:'pending'|'processing'|'completed'|'failed';
type:'t2v'|'i2v'|'v2v'|'avatar';
```
```
// Input
prompt:string;
negativePrompt?:string;
inputImageUrl?:string;
inputVideoUrl?:string;
audioUrl?:string;
```
```
// Configuration
model:string;
duration:number;
resolution:'480p'|'720p'|'1080p';
aspectRatio:'16:9'|'9:16'|'1:1'|'21:9';
enableAudio:boolean;
motionControl?:MotionControlConfig;
```

```
characterRefs?:string[];// URLs to reference images
```
```
// Output
videoUrl?:string;
thumbnailUrl?:string;
fileSize?:number;
```
```
// Cost tracking
costUsd:number;
creditsCharged:number;
```
```
// Metadata
falRequestId?:string;
completedAt?:Timestamp;
expiresAt:Timestamp;// TTL: 30 days
createdAt:Timestamp;
updatedAt:Timestamp;
}
```
```
interfaceCharacter {
id:string;
userId:string;
name:string;
description?:string;
referenceImages:string[];// Up to 10
tags:string[];
usageCount:number;
createdAt:Timestamp;
}
```
```
interfaceCreditTransaction {
id:string;
userId:string;
type:'purchase'|'usage'|'refund'|'bonus';
amount:number;
balance:number;
description:string;
generationId?:string;
stripePaymentId?:string;
createdAt:Timestamp;
}
```
**5.4 API Integration (Fal.ai)**

**5.4.1 Smart Model Router**

```
// lib/model-router.ts
```
```
interfaceModelConfig {
model:string;
costPerSecond:number;
```

maxDuration:number;
resolution:string;
supportsAudio:boolean;
supportsMultiShot?:boolean;
supportsMotionControl?:boolean;
}

exportfunctionselectModel(request:GenerationRequest): ModelConfig {
const{ userTier, priority, features, duration } = request;

```
// TIER 1: Free/Budget ($0.005-0.04/sec)
if(userTier ==='free') {
if(priority ==='fast') {
return{
model:'fal-ai/wan/v2.2-5b/fast-wan',
costPerSecond:0.0125,
maxDuration: 5 ,
resolution:'480p',
supportsAudio:false,
};
}
return{
model:'fal-ai/longcat-video/distilled/text-to-video/480p',
costPerSecond:0.005,
maxDuration: 5 ,
resolution:'480p',
supportsAudio:false,
};
}
```
```
// TIER 2: Pro ($0.07-0.14/sec)
if(userTier ==='pro') {
if(features.includes('audio')) {
return{
model:'fal-ai/kling-video/v2.6/pro/text-to-video',
costPerSecond:0.14,
maxDuration: 10 ,
resolution:'1080p',
supportsAudio:true,
};
}
return{
model:'fal-ai/kling-video/v2.6/pro/text-to-video',
costPerSecond:0.07,
maxDuration: 15 ,
resolution:'1080p',
supportsAudio:false,
};
}
```
```
// TIER 3: Studio ($0.14-0.336/sec)
```

```
if(features.includes('multi-shot')) {
return{
model:'fal-ai/kling-video/o3/pro/text-to-video',
costPerSecond:features.includes('audio')? 0.14 :0.112,
maxDuration: 15 ,
resolution:'1080p',
supportsAudio:features.includes('audio'),
supportsMultiShot:true,
};
}
```
```
return{
model:'fal-ai/kling-video/v3/pro/text-to-video',
costPerSecond:features.includes('audio')? 0.336 :0.224,
maxDuration: 15 ,
resolution:'1080p',
supportsAudio:features.includes('audio'),
supportsVoiceControl:true,
};
}
```
**5.4.2 Fal.ai Client Implementation**

```
// lib/fal-client.ts
import{ fal }from'@fal-ai/client';
```
```
fal.config({
credentials:process.env.FAL_KEY,
});
```
```
exportasyncfunctionsubmitGeneration(params:GenerationParams) {
constmodelConfig = selectModel(params);
```
```
constresult =awaitfal.subscribe(modelConfig.model, {
input: {
prompt:params.prompt,
negative_prompt:params.negativePrompt,
image_url:params.inputImageUrl,
duration:Math.min(params.duration, modelConfig.maxDuration),
aspect_ratio:params.aspectRatio,
enable_audio:modelConfig.supportsAudio&& params.enableAudio,
// Kling 3.0 specific
multi_shot:modelConfig.supportsMultiShot? params.multiShotConfig :undefined,
voice_control:modelConfig.supportsVoiceControl? params.voiceId :undefined,
},
webhookUrl:`${process.env.NEXT_PUBLIC_API_URL}/webhooks/fal`,
logs:true,
});
```
```
return{
requestId:result.request_id,
```

```
status:result.status,
estimatedCost:modelConfig.costPerSecond* params.duration,
};
}
```
## 6. Non-Functional Requirements

**6.1 Performance**

```
Metric Target Measurement
Time to First Byte (TTFB) <200ms WebPageTest
First Contentful Paint (FCP) <1.5s Lighthouse
Time to Interactive (TTI) <3.5s Lighthouse
API Response Time (p95) <500ms Datadog
Video Generation Start <5s User click to queue
Video Playback Start <2s expo-video metrics
```
**6.2 Scalability**

- Support 10,000 concurrent users
- Handle 1,000 video generations/hour peak
- Auto-scale API workers based on queue depth
- Database: Shard by user ID when exceeding 1M users

**6.3 Reliability**

- 99.9% uptime SLA (Studio+ users)
- Automatic failover to backup AI providers
- Retry logic: 3 attempts with exponential backoff
- Circuit breaker pattern for API failures
- Data backup: Daily Firestore exports to GCS

**6.4 Security**

- HTTPS everywhere
- API key rotation every 90 days
- Rate limiting: 100 req/min per user (free), 1000 req/min (paid)
- Input validation: 10MB max upload, prompt sanitization
- Content moderation: AWS Rekognition for uploaded images
- GDPR/CCPA compliance: Data export/deletion APIs

**6.5 Cost Optimization**

- Smart caching: Don’t regenerate identical prompts (30-day cache)
- Tiered model selection: Free users get cheapest models
- Batch processing: 20% discount for non-urgent jobs
- Storage lifecycle: Auto-delete videos after 30 days (user notified)


- CDN optimization: Cloudflare Argo for faster global delivery

## 7. Development Phases

**Phase 1: MVP (Weeks 1-4) — Budget: $**

**Goal:** Core video generation on web

```
Week Deliverables
1 Project setup, design system, Firebase config
2 Auth, basic T2V with LongCat 480p, credit
system
3 Gallery, history, Stripe integration
4 Landing page, marketing site, launch prep
```
**Models:** LongCat Distilled 480p ($0.005/sec), Wan 2.2 Fast ($0.025/video)

**Phase 2: Mobile & I2V (Weeks 5-8) — Budget: $800/month**

**Goal:** Full mobile app + Image-to-Video

```
Week Deliverables
5 Expo setup, shared components, mobile auth
6 Camera integration, photo library access, I2V
7 Background uploads, push notifications, offline
queue
8 Mobile polish, app store submission prep
```
**New Models:** Kling 2.5 Turbo I2V ($0.042/sec), Kling 2.6 Pro ($0.07-0.14/sec)

**Phase 3: Advanced Features (Weeks 9-12) — Budget: $1,500/month**

**Goal:** Feature parity with Kling AI 3.

```
Week Deliverables
9 Multi-shot storyboarding, first/last frame control
10 Native audio generation, voice binding
11 Motion control UI, character consistency system
12 AI Avatar/HeyGen integration, V2V editing
```
**New Models:** Kling 3.0 ($0.224-0.336/sec), Kling O3 ($0.112-0.14/sec), HeyGen Avatar ($0.034/sec)


**Phase 4: Scale (Months 4-6) — Budget: $3,000/month**

**Goal:** Enterprise readiness, API ecosystem

```
Month Deliverables
4 Developer API, webhooks, documentation
5 Team workspaces, collaboration features
6 Enterprise SSO, custom model fine-tuning, SLA
guarantees
```
## 8. Go-to-Market Strategy

**8.1 Launch Channels**

1. **Product Hunt** — Day 1 launch with video demos
2. **Reddit** — r/MachineLearning, r/VideoEditing, r/Entrepreneur
3. **Twitter/X** — Thread documenting build journey
4. **YouTube** — Tutorial content, comparisons with Kling AI
5. **Indie Hackers** — Transparent revenue/cost sharing

**8.2 Pricing Strategy**

- **Freemium hook:** 3 free videos/day (cost: $0.075/user/day)
- **Credit system:** Pay-as-you-go appeals to sporadic users
- **Annual discount:** 2 months free for yearly subscriptions
- **Referral program:** 10 credits for referrer and referee

**8.3 Key Metrics to Track**

```
Metric Target (Month 3)
Signups 5,
DAU/MAU 30%
Free-to-Paid Conversion 5%
Average Revenue Per User (ARPU) $25/month
Customer Acquisition Cost (CAC) <$
Net Promoter Score (NPS) >
```
## 9. Risk Assessment

```
Risk Probability Impact Mitigation
API cost
explosion
```
```
High Critical Hard limits, daily caps, smart
caching
Fal.ai
downtime
```
```
Medium High Fallback to Replicate, queue
system
```

```
Table 24 – continued
Risk Probability Impact Mitigation
Long
generation
times
```
```
Medium Medium Background processing,
progress notifications
```
```
Mobile
storage issues
```
```
Medium Medium LRU cache, streaming playback,
auto-cleanup
Content
moderation
failures
```
```
Low Critical AWS Rekognition + manual
review queue
```
```
Competitor
price war
```
```
Medium Medium Focus on UX/features, not just
price
Abuse/spam Medium Medium Rate limiting, credit
verification, manual review
```
## 10. Appendix

**10.1 Complete Fal.ai Model Reference**

```
Model ID Type Cost Resolution Audio Best For
fal-ai/longcat-video/
distilled/480p
```
```
T2V $0.005/sec 480p @ 15fps No Free tier, drafts
```
```
fal-ai/longcat-video/
distilled/720p
```
```
T2V $0.01/sec 720p @ 30fps No Budget quality
```
```
fal-ai/wan/v2.2-5b/
fast-wan
```
### T2V $0.0125-

### 0.

```
480p-720p No Fast generation
```
```
fal-ai/ltxv-13b-098-
distilled
```
```
T2V $0.02/sec 24fps No Balanced speed/
quality
fal-ai/kling-video/
v2.5-turbo/
standard/i2v
```
```
I2V $0.042/sec 1080p No Image animation
```
```
fal-ai/kling-video/
v2.6/pro
```
### T2V/I2V $0.07-0.14/

```
sec
```
```
1080p Optional Production quality
```
```
fal-ai/kling-video/
v3/standard
```
### T2V $0.084-

```
0.154/sec
```
```
1080p Yes Voice control
```
```
fal-ai/kling-video/
v3/pro
```
### T2V $0.224-

```
0.336/sec
```
```
1080p Yes Maximum quality
```
```
fal-ai/kling-video/
o3/pro
```
### T2V/V2V $0.112-0.14/

```
sec
```
```
1080p Yes Multi-shot, editing
```
```
fal-ai/heygen/
avatar3/digital-twin
```
```
Avatar $0.034/sec 1080p Yes Talking heads
```
```
fal-ai/
cosmos-predict-2.5/
distilled
```
```
T2V $0.08/5sec 720p No Physics simulation
```

```
Table 25 – continued
Model ID Type Cost Resolution Audio Best For
fal-ai/pixverse/v5.6 T2V $0.35-
0.75/5sec
```
```
360p-1080p Optional Artistic styles
```
```
fal-ai/
hunyuan-video-v1.
```
```
T2V $0.075/sec 720p+ No Open source alt
```
```
fal-ai/seedance/
v1.5/pro
```
```
T2V ~$0.26/5sec 720p Yes ByteDance model
```
**10.2 Glossary**

- **T2V** : Text-to-Video
- **I2V** : Image-to-Video
- **V2V** : Video-to-Video
- **DiT** : Diffusion Transformer (architecture)
- **LoRA** : Low-Rank Adaptation (fine-tuning method)
- **Fal.ai** : Primary AI API provider
- **Expo** : React Native development platform
- **R2** : Cloudflare object storage (S3-compatible)

**10.3 Related Documents**

- Technical Specification (Tech Spec)
- API Documentation (for developers)
- Design System (Figma)
- Security & Compliance Guide
- Operations Runbook

**Document Control:**

- **Version History:**
- v1.0 (2026-03-22): Initial PRD
- **Next Review Date:** 2026-04-
- **Approvers:** [To be filled]

**Contact:** product@videoforge.ai



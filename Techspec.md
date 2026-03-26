# Technical Specification Document

# VideoForge - AI Video Generation Platform

## Version: 1.

## Date: March 22, 2026

## Author: Engineering Team

## Status: Draft

## Related: PRD.md v1.

## 1. Architecture Overview

## 1.1 High-Level System Design

> **Update (web-only direction):** VideoForge is now positioned as a **web-only** platform with a **Next.js frontend and Node.js backend**. Mobile/Expo details in this draft are legacy notes.

#### ┌─────────────────────────────────────────────────────────────────────────────┐

#### │ CLIENT LAYER │

#### │ ┌─────────────────────────┐ ┌─────────────────────────┐ │

```
│ │ Web (Next.js) │ │ Mobile (Expo RN) │ │
│ │ ┌─────────────────┐ │ │ ┌─────────────────┐ │ │
│ │ │ Next.js 14 │ │ │ │ Expo SDK 52 │ │ │
│ │ │ App Router │ │ │ │ React Native │ │ │
│ │ │ Tailwind CSS │ │ │ │ NativeWind │ │ │
│ │ │ shadcn/ui │ │ │ │ Tamagui │ │ │
│ │ └─────────────────┘ │ │ └─────────────────┘ │ │
│ │ ┌─────────────────┐ │ │ ┌─────────────────┐ │ │
│ │ │ Shared Hooks │◄──┼────┼──►│ Shared Hooks │ │ │
│ │ │ Zustand Store │◄──┼────┼──►│ Zustand Store │ │ │
│ │ │ TanStack Query │◄──┼────┼──►│ TanStack Query │ │ │
│ │ └─────────────────┘ │ │ └─────────────────┘ │ │
│ └─────────────────────────┘ └─────────────────────────┘ │
│ │ │ │
│ └──────────────┬───────────────┘ │
│ │ │
│ ▼ │
│ ┌─────────────────────────────────────────────────────────────────────┐ │
│ │ API GATEWAY (Next.js API) │ │
│ │ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ │ │
│ │ │ tRPC │ │ Rate Limit │ │ Auth │ │ Validation │ │ │
│ │ │ Router │ │ Middleware │ │ Middleware │ │ (Zod) │ │ │
│ │ └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘ │ │
│ └─────────────────────────────────────────────────────────────────────┘ │
│ │ │
│ ▼ │
│ ┌─────────────────────────────────────────────────────────────────────┐ │
│ │ SERVICE LAYER │ │
│ │ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ │ │
│ │ │ Generation │ │ Billing │ │ User │ │ Webhook │ │ │
│ │ │ Service │ │ Service │ │ Service │ │ Service │ │ │
│ │ └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘ │ │
```

#### │ └─────────────────────────────────────────────────────────────────────┘ │

#### │ │ │

#### │ ▼ │

#### │ ┌─────────────────────────────────────────────────────────────────────┐ │

```
│ │ QUEUE LAYER (Redis + BullMQ) │ │
│ │ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ │ │
│ │ │ Generation │ │ Email │ │ Analytics │ │ │
│ │ │ Queue │ │ Queue │ │ Queue │ │ │
│ │ │ (Priority) │ │ (Bulk) │ │ (Batch) │ │ │
│ │ └─────────────┘ └─────────────┘ └─────────────┘ │ │
│ └─────────────────────────────────────────────────────────────────────┘ │
│ │ │
│ ▼ │
│ ┌─────────────────────────────────────────────────────────────────────┐ │
│ │ AI ORCHESTRATION LAYER │ │
│ │ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ │ │
│ │ │ Fal.ai │ │ Replicate │ │ Smart │ │ Cost │ │ │
│ │ │ Client │ │ Fallback │ │ Router │ │ Tracker │ │ │
│ │ │ (Primary) │ │ (Backup) │ │ (Model Sel)│ │ (Langfuse) │ │ │
│ │ └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘ │ │
│ └─────────────────────────────────────────────────────────────────────┘ │
│ │ │
│ ▼ │
│ ┌─────────────────────────────────────────────────────────────────────┐ │
│ │ DATA LAYER │ │
│ │ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ │ │
│ │ │ Supabase  │ │ Better   │ │ Backblaze  │ │ Redis │ │ │
│ │ │ PostgreSQL│ │ Auth     │ │ B2 (Video) │ │ (Cache) │ │ │
│ │ │ (Primary) │ │ OAuth    │ │ Object Stor│ │ Sessions │ │ │
│ │ └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘ │ │
│ └─────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────┘
```
### 1.2 Technology Stack Matrix

### Layer Technology Version Purpose

### Web Framework Next.js 16.x App Router, SSR, API

### routes

### Platform

### Web-only (no mobile client)

### Language TypeScript 5.3 Type safety

### Styling (Web) Tailwind CSS 3.4 Utility-first CSS

### Styling (Mobile) NativeWind 4.x Tailwind for RN

### UI Components shadcn/ui + Tamagui Latest Accessible, cross-platform

### State

### Management

### Zustand 4.x Global state

### Server State TanStack Query 5.x Data fetching, caching

### Forms React Hook Form 7.x Form handling

### Validation Zod 3.x Schema validation


### Table 1 – continued

### Layer Technology Version Purpose

### Backend Next.js API Routes 16.x Serverless functions

### API Protocol tRPC 11.x Type-safe APIs

### Queue BullMQ 5.x Job processing

### Cache Redis 7.x Upstash/Redis Cloud

### Database Supabase PostgreSQL - SQL relational database

### Auth Better Auth 1.x Email/password, Google OAuth, cookie sessions

### Storage Backblaze B2 - Video/object storage

### CDN Backblaze B2 Public URL - Video delivery (Cloudflare Stream: future enhancement)

### AI API Fal.ai SDK Latest Video generation

### Monitoring Langfuse - AI cost tracking

### Error Tracking Sentry 7.x Error monitoring

### Analytics PostHog - Product analytics

## 2. Database Schema

### 2.1 Database Tables (Supabase PostgreSQL)

### Table: users

```
interfaceUser {
// Identification
id:string; // Better Auth user ID
email:string;
displayName?:string;
photoURL?:string;
```
```
// Tier & Billing
tier:'free'|'creator'|'pro'|'studio'|'enterprise';
credits:number; // Current balance
subscriptionId?:string; // Stripe subscription ID
subscriptionStatus?:'active'|'canceled'|'past_due'|'unpaid';
```
```
// Usage Tracking
dailyGenerations:number; // Reset daily
lastReset:Timestamp; // Last daily reset
monthlySpend:number; // Current month API costs
totalGenerations:number; // Lifetime count
```
```
// Preferences
preferredAspectRatio:'16:9'|'9:16'|'1:1'|'21:9';
emailNotifications:boolean;
```
```
// Metadata
createdAt:Timestamp;
updatedAt:Timestamp;
lastLoginAt:Timestamp;
```

```
// Indexes
// - tier (for analytics)
// - createdAt (for cohort analysis)
}
```
```
// Security Rules:
// - Users can read/write only their own row
// - Admins can read all (via RLS policy)
```
### Table: generations

```
interfaceGeneration {
// Identification
id:string; // Auto-generated
userId:string; // Foreign key to users
```
```
// Status
status:'pending'|'queued'|'processing'|'completed'|'failed'|'cancelled';
statusMessage?:string; // Human-readable status
```
```
// Input Configuration
type:'t2v'|'i2v'|'v2v'|'avatar'|'multishot';
prompt:string; // Primary input
negativePrompt?:string;
```
```
// Media Inputs
inputImageUrl?:string; // For I2V
inputVideoUrl?:string; // For V2V
inputAudioUrl?:string; // For avatar
characterIds?:string[]; // References to characters table
```
```
// Generation Config
model:string; // Fal.ai model ID
modelVersion?:string; // Specific version
duration:number; // Seconds (5-15)
resolution:'480p'|'720p'|'1080p';
aspectRatio:'16:9'|'9:16'|'1:1'|'21:9';
fps:number; // 24, 30, or 60
```
```
// Features
enableAudio:boolean;
voiceId?:string; // For voice binding
motionControl?: {
type:'pan'|'tilt'|'zoom'|'orbit'|'custom';
intensity:'subtle'|'moderate'|'dynamic';
path?:string; // SVG path or keyframes
};
multiShotConfig?: {
shotCount:number; // 3-
shots:Array<{
```

```
type:'closeup'|'medium'|'wide';
duration:number;
prompt?:string;
}>;
};
```
```
// Output
outputVideoUrl?:string;
outputThumbnailUrl?:string;
outputAudioUrl?:string; // Separate audio file
fileSize?:number; // Bytes
fileFormat?:'mp4'|'webm';
codec?:'h264'|'hevc'|'vp9';
```
```
// Fal.ai Integration
falRequestId?:string;
falLogs?:string[]; // Generation logs
falCost?:number; // Actual cost from Fal.ai
```
```
// Cost Tracking
estimatedCost:number; // USD at request time
actualCost?:number; // USD after completion
creditsCharged:number;
```
```
// Metadata
createdAt:Timestamp;
updatedAt:Timestamp;
startedAt?:Timestamp; // When processing began
completedAt?:Timestamp;
expiresAt:Timestamp; // TTL: 30 days from creation
```
```
// User Feedback
rating?: 1 | 2 | 3 | 4 | 5; // User rating
feedback?:string;
isFavorite:boolean;
isPublic:boolean; // For gallery feature
```
```
// Indexes:
// - userId + createdAt (desc) - for gallery
// - status + createdAt - for queue monitoring
// - expiresAt - for TTL
}
```
```
// TTL Policy: Delete rows 30 days after expiresAt
// Composite Indexes:
// - userId (Ascending) + createdAt (Descending)
// - status (Ascending) + createdAt (Ascending)
```
### Table: characters

```
interfaceCharacter {
```

```
id:string;
userId:string;
```
```
// Profile
name:string;
description?:string; // Physical description
tags:string[]; // Searchable tags
```
```
// References
referenceImages:string[]; // Up to 10 image URLs
referenceVideos?:string[]; // Optional motion references
```
```
// Usage
usageCount:number; // Times used in generations
lastUsedAt?:Timestamp;
```
```
// Fine-tuning (future)
loRaModelUrl?:string; // Custom trained model
```
```
createdAt:Timestamp;
updatedAt:Timestamp;
}
```
### Table: credit_transactions

```
interfaceCreditTransaction {
id:string;
userId:string;
```
```
type:'purchase'|'usage'|'refund'|'bonus'|'adjustment';
amount:number; // Positive for credit, negative for debit
balance:number; // Balance after transaction
```
```
// Context
description:string;
generationId?:string; // Link to generation (if usage)
stripePaymentId?:string; // Link to Stripe (if purchase)
stripeInvoiceId?:string;
```
```
// Metadata
createdAt:Timestamp;
expiresAt?:Timestamp; // For bonus credits
}
```
```
// Indexes:
// - userId + createdAt (desc)
```
### Table: webhook_events

```
interfaceWebhookEvent {
id:string; // Event ID from provider
```

```
provider:'fal'|'stripe'|'replicate';
eventType:string;
```
```
payload:Record<string, any>; // Full webhook payload
processed:boolean;
processedAt?:Timestamp;
error?:string;
```
```
receivedAt:Timestamp;
createdAt:Timestamp;
}
```
```
// TTL: Delete after 7 days
```
### 2.2 Redis Data Structures

```
# Rate Limiting
rate_limit:{userId}:{endpoint} -> count (TTL: 1 minute)
```
```
# Session Management
session:{token} -> userId, tier, expiresAt (TTL: 7 days)
```
```
# Generation Queue
bull:generation:waiting -> List of job IDs
bull:generation:active -> List of active jobs
bull:generation:completed -> List of completed jobs
```
```
# Cache Layer
cache:prompt_hash:{hash} -> generationId (TTL: 30 days)
cache:video:{generationId} -> video metadata (TTL: 1 hour)
```
```
# Real-time Features
presence:{userId} -> online status, lastSeen
notifications:{userId} -> Unread notifications list
```
## 3. API Specifications

### 3.1 tRPC Router Structure

```
// server/routers/_app.ts
import{ router }from'../trpc';
import{ authRouter }from'./auth';
import{ generationRouter }from'./generation';
import{ billingRouter }from'./billing';
import{ userRouter }from'./user';
import{ characterRouter }from'./character';
```
```
exportconstappRouter = router({
auth:authRouter,
generation:generationRouter,
```

```
billing:billingRouter,
user:userRouter,
character:characterRouter,
});
```
```
exporttypeAppRouter =typeofappRouter;
```
### 3.2 Generation Router

```
// server/routers/generation.ts
import{ router, protectedProcedure }from'../trpc';
import{ z }from'zod';
import{ GenerationQueue }from'@/lib/queue';
import{ selectModel }from'@/lib/model-router';
import{ calculateCost }from'@/lib/pricing';
```
```
constgenerationInputSchema = z.object({
prompt:z.string().min(1).max(2000),
negativePrompt:z.string().max(1000).optional(),
type: z.enum(['t2v','i2v','v2v','avatar','multishot']),
```
```
// Media
inputImageUrl:z.string().url().optional(),
inputVideoUrl:z.string().url().optional(),
characterIds:z.array(z.string()).max(10).optional(),
```
```
// Config
duration:z.number().min(5).max(15),
resolution:z.enum(['480p','720p','1080p']),
aspectRatio:z.enum(['16:9','9:16','1:1','21:9']),
enableAudio:z.boolean().default(false),
```
```
// Advanced
motionControl:z.object({
type: z.enum(['pan','tilt','zoom','orbit','custom']),
intensity:z.enum(['subtle','moderate','dynamic']),
path:z.string().optional(),
}).optional(),
```
```
multiShotConfig:z.object({
shotCount:z.number().min(3).max(6),
shots:z.array(z.object({
type: z.enum(['closeup','medium','wide']),
duration:z.number(),
prompt:z.string().optional(),
})),
}).optional(),
```
```
priority:z.enum(['fast','balanced','quality']).default('balanced'),
});
```

exportconstgenerationRouter = router({
// Submit new generation
submit:protectedProcedure
.input(generationInputSchema)
.mutation(async({ ctx, input }) => {
constuserId = ctx.user.uid;
constuserTier = ctx.user.tier;

```
// 1. Rate limiting check
awaitcheckRateLimit(userId,'generation');
```
```
// 2. Select optimal model
constmodelConfig = selectModel({
userTier,
priority:input.priority,
features: [
input.enableAudio &&'audio',
input.multiShotConfig &&'multi-shot',
].filter(Boolean),
duration:input.duration,
});
```
```
// 3. Calculate cost
constestimatedCost = calculateCost(modelConfig, input);
constcreditsNeeded = usdToCredits(estimatedCost);
```
```
// 4. Check credits
constuser =awaitgetUser(userId);
if(user.credits < creditsNeeded) {
thrownewTRPCError({
code:'PRECONDITION_FAILED',
message:'Insufficient credits',
});
}
```
```
// 5. Check daily limits (free tier)
if(userTier ==='free') {
if(user.dailyGenerations >= 3) {
thrownewTRPCError({
code:'PRECONDITION_FAILED',
message:'Daily limit reached. Upgrade to create more.',
});
}
}
```
```
// 6. Create generation record
constgeneration =awaitdb.generations.create({
userId,
status:'pending',
...input,
model:modelConfig.model,
```

```
estimatedCost,
creditsCharged:creditsNeeded,
expiresAt:Timestamp.fromDate(newDate(Date.now() + 30 * 24 * 60 * 60 * 1000)),
});
```
```
// 7. Deduct credits
awaitdeductCredits(userId, creditsNeeded, generation.id);
```
```
// 8. Queue job
awaitGenerationQueue.add('generate', {
generationId:generation.id,
userId,
modelConfig,
input,
}, {
priority:getPriority(userTier),
attempts: 3 ,
backoff: {
type:'exponential',
delay: 5000 ,
},
});
```
```
// 9. Update daily count
awaitincrementDailyGenerations(userId);
```
```
return{
generationId:generation.id,
status:'pending',
estimatedTime:estimateTime(modelConfig, input),
creditsRemaining:user.credits- creditsNeeded,
};
}),
```
// Get generation status
getStatus:protectedProcedure
.input(z.object({ generationId:z.string() }))
.query(async({ ctx, input }) => {
constgeneration =awaitdb.generations.get(input.generationId);

```
if(generation.userId !== ctx.user.uid) {
thrownewTRPCError({ code:'FORBIDDEN'});
}
```
```
return{
status:generation.status,
progress:generation.status==='processing'
?awaitgetProgress(generation.falRequestId)
:null,
videoUrl:generation.status==='completed'
?awaitgetSignedUrl(generation.outputVideoUrl, 3600)
```

```
:null,
thumbnailUrl:generation.outputThumbnailUrl
?awaitgetSignedUrl(generation.outputThumbnailUrl, 3600)
:null,
completedAt:generation.completedAt,
error:generation.status==='failed'? generation.statusMessage :null,
};
}),
```
// List user's generations
list:protectedProcedure
.input(z.object({
cursor:z.string().optional(),
limit:z.number().min(1).max(50).default(20),
status:z.enum(['pending','processing','completed','failed']).optional(),
type: z.enum(['t2v','i2v','v2v','avatar','multishot']).optional(),
}))
.query(async({ ctx, input }) => {
const{ items, nextCursor } =awaitdb.generations.paginate({
userId:ctx.user.uid,
...input,
orderBy:'createdAt',
orderDirection:'desc',
});

```
return{
items:items.map(g => ({
...g,
videoUrl:g.outputVideoUrl
? getSignedUrl(g.outputVideoUrl, 3600)
:null,
})),
nextCursor,
};
}),
```
// Cancel pending generation
cancel:protectedProcedure
.input(z.object({ generationId:z.string() }))
.mutation(async({ ctx, input }) => {
constgeneration =awaitdb.generations.get(input.generationId);

```
if(generation.userId !== ctx.user.uid) {
thrownewTRPCError({ code:'FORBIDDEN'});
}
```
```
if(!['pending','queued'].includes(generation.status)) {
thrownewTRPCError({
code:'BAD_REQUEST',
message:'Cannot cancel generation in current state',
});
```

#### }

```
// Remove from queue
awaitGenerationQueue.remove(input.generationId);
```
```
// Update status
awaitdb.generations.update(input.generationId, {
status:'cancelled',
updatedAt:Timestamp.now(),
});
```
```
// Refund credits
awaitrefundCredits(ctx.user.uid, generation.creditsCharged, input.generationId);
```
```
return{ success:true};
}),
});
```
### 3.3 Webhook Handlers

```
// app/api/webhooks/fal/route.ts
import{ NextResponse }from'next/server';
import{ verifyFalWebhook }from'@/lib/webhooks/fal';
import{ GenerationQueue }from'@/lib/queue';
```
```
exportasyncfunctionPOST(req:Request) {
constpayload =awaitreq.json();
```
```
// 1. Verify webhook signature
constisValid = verifyFalWebhook(payload, req.headers.get('x-fal-signature'));
if(!isValid) {
returnNextResponse.json({ error:'Invalid signature'}, { status: 401 });
}
```
```
// 2. Store webhook event
awaitdb.webhook_events.create({
provider:'fal',
eventType:payload.status,
payload,
processed:false,
});
```
```
// 3. Process based on status
const{ request_id, status, output, error } = payload;
```
```
switch(status) {
case'COMPLETED':
awaithandleGenerationComplete(request_id, output);
break;
```
```
case'FAILED':
```

```
awaithandleGenerationFailed(request_id, error);
break;
```
```
case'IN_PROGRESS':
awaithandleGenerationProgress(request_id, payload.logs);
break;
}
```
returnNextResponse.json({ received:true});
}

asyncfunctionhandleGenerationComplete(requestId:string, output:any) {
constgeneration =awaitdb.generations.findByFalRequestId(requestId);

```
// 1. Download video to R
constvideoBuffer =awaitfetch(output.video.url).then(r => r.arrayBuffer());
constvideoKey =`generations/${generation.userId}/${generation.id}/video.mp4`;
awaitr2.putObject(videoKey, videoBuffer, {
ContentType:'video/mp4',
Metadata: {
generationId:generation.id,
userId:generation.userId,
},
});
```
```
// 2. Generate thumbnail
constthumbnailKey =`generations/${generation.userId}/${generation.id}/thumbnail.jpg`;
awaitgenerateThumbnail(videoBuffer, thumbnailKey);
```
```
// 3. Update generation record
awaitdb.generations.update(generation.id, {
status:'completed',
outputVideoUrl:`r2://${videoKey}`,
outputThumbnailUrl:`r2://${thumbnailKey}`,
fileSize:videoBuffer.byteLength,
completedAt:Timestamp.now(),
falCost:output.cost,
actualCost:output.cost,// Track actual vs estimated
});
```
```
// 4. Send notification
awaitsendPushNotification(generation.userId, {
title:'Video Ready!',
body:'Your AI-generated video is ready to view.',
data: { generationId:generation.id},
});
```
```
// 5. Update analytics
awaitPostHog.capture('generation_completed', {
distinct_id:generation.userId,
properties: {
```

```
model:generation.model,
duration:generation.duration,
cost:output.cost,
generation_time_ms:Date.now() - generation.createdAt.toMillis(),
},
});
}
```
## 4. Queue System Design

### 4.1 BullMQ Configuration

```
// lib/queue.ts
import{ Queue, Worker }from'bullmq';
importRedisfrom'ioredis';
```
```
constredis =newRedis(process.env.REDIS_URL);
```
```
// Generation Queue
exportconstGenerationQueue =newQueue('generation', {
connection:redis,
defaultJobOptions: {
attempts: 3 ,
backoff: {
type:'exponential',
delay: 5000 ,
},
removeOnComplete: 100 ,
removeOnFail: 50 ,
},
});
```
```
// Worker Implementation
exportconstgenerationWorker =newWorker('generation',async(job) => {
const{ generationId, userId, modelConfig, input } = job.data;
```
```
try{
// 1. Update status to processing
awaitdb.generations.update(generationId, {
status:'processing',
startedAt:Timestamp.now(),
});
```
```
// 2. Prepare Fal.ai input
constfalInput = buildFalInput(input, modelConfig);
```
```
// 3. Submit to Fal.ai
constresult =awaitfal.subscribe(modelConfig.model, {
input:falInput,
```

```
webhookUrl:`${process.env.NEXT_PUBLIC_API_URL}/api/webhooks/fal`,
logs:true,
});
```
```
// 4. Store request ID for webhook matching
awaitdb.generations.update(generationId, {
falRequestId:result.request_id,
});
```
```
// 5. Wait for completion (with timeout)
constvideoUrl =awaitwaitForCompletion(result.request_id, 300000);// 5 min timeout
```
```
return{ success:true, videoUrl };
```
```
}catch(error) {
// Update failure status
awaitdb.generations.update(generationId, {
status:'failed',
statusMessage:error.message,
updatedAt:Timestamp.now(),
});
```
```
// Refund credits
awaitrefundCredits(userId, job.data.creditsCharged, generationId);
```
```
throwerror;
}
}, {
connection:redis,
concurrency: 5 ,// Process 5 jobs concurrently
});
```
```
// Priority tiers
functiongetPriority(tier:string):number{
switch(tier) {
case'enterprise':return1;
case'studio':return2;
case'pro':return3;
case'creator':return4;
case'free':return5;
default:return10;
}
}
```
### 4.2 Queue Monitoring

```
// Dashboard endpoint for queue stats
exportasyncfunctiongetQueueStats() {
const[waiting, active, completed, failed] =awaitPromise.all([
GenerationQueue.getWaitingCount(),
GenerationQueue.getActiveCount(),
```

```
GenerationQueue.getCompletedCount(),
GenerationQueue.getFailedCount(),
]);
```
```
return{
waiting,
active,
completed,
failed,
health:failed> waiting * 0.1 ?'degraded':'healthy',
};
}
```
## 5. Security Implementation

### 5.1 Authentication Flow

```
// lib/auth-client.ts
import{ createAuthClient }from'better-auth/client';
import{ googleOAuthClient }from'better-auth/plugins';
```
```
exportconstauthClient = createAuthClient({
baseURL:process.env.NEXT_PUBLIC_APP_URL,
plugins: [googleOAuthClient()],
});
```
```
// Client-side sign-in with Google
exportasyncfunctionsignInWithGoogle() {
awastauthClient.signIn.social({ provider:'google'});
}
```
```
// Server-side auth middleware
exportconstisAuthed = t.middleware(async({ ctx, next }) => {
constsession =awaitgetSession(ctx.req);
```
```
if(!session?.user) {
thrownewTRPCError({ code:'UNAUTHORIZED'});
}
```
```
returnnext({
ctx: {
```

```
...ctx,
user:session.user,
},
});
});
```
### 5.2 Rate Limiting

```
// lib/rate-limit.ts
import{ Redis }from'@upstash/redis';
```
```
constredis =newRedis({
url:process.env.UPSTASH_REDIS_REST_URL,
token:process.env.UPSTASH_REDIS_REST_TOKEN,
});
```
```
exportasyncfunctioncheckRateLimit(
userId:string,
endpoint:string,
limit:number= 100,
windowSeconds:number= 60
) {
constkey =`rate_limit:${userId}:${endpoint}`;
constcurrent =awaitredis.incr(key);
```
```
if(current === 1) {
awaitredis.expire(key, windowSeconds);
}
```
```
if(current > limit) {
constttl =awaitredis.ttl(key);
thrownewTRPCError({
code:'TOO_MANY_REQUESTS',
message:`Rate limit exceeded. Retry in${ttl}seconds.`,
});
}
```
```
return{ remaining:limit- current, resetIn:windowSeconds};
}
```
### 5.3 Input Validation & Sanitization

```
// lib/validation.ts
import{ z }from'zod';
importDOMPurifyfrom'isomorphic-dompurify';
```
```
exportconstsanitizePrompt = (prompt:string):string=> {
// Remove potentially harmful content
returnDOMPurify.sanitize(prompt, {
ALLOWED_TAGS: [],
ALLOWED_ATTR: [],
```

```
}).trim();
};
```
```
exportconstcheckContentPolicy =async(prompt:string): Promise<boolean> => {
// Use AWS Comprehend or OpenAI Moderation API
constresult =awaitopenai.moderations.create({
input:prompt,
});
```
```
return!result.results[0].flagged;
};
```
```
// File upload validation
exportconstvalidateUpload = (file:File):void=> {
constMAX_SIZE = 10 * 1024 * 1024;// 10MB
constALLOWED_TYPES = ['image/jpeg','image/png','image/webp'];
```
```
if(file.size > MAX_SIZE) {
thrownewError('File too large. Max 10MB.');
}
```
```
if(!ALLOWED_TYPES.includes(file.type)) {
thrownewError('Invalid file type. Only JPG, PNG, WebP allowed.');
}
};
```
## 6. Cost Optimization Strategies

### 6.1 Smart Caching Layer

```
// lib/cache.ts
import{ createHash }from'crypto';
```
```
// Generate hash from normalized prompt + config
exportfunctiongeneratePromptHash(prompt:string, config:object):string{
constnormalized = prompt.toLowerCase().trim();
constdata = JSON.stringify({ prompt:normalized, config });
returncreateHash('sha256').update(data).digest('hex');
}
```
```
// Check cache before generation
exportasyncfunctioncheckCache(promptHash:string): Promise<string|null> {
constcached =awaitredis.get(`cache:prompt:${promptHash}`);
returncached;
}
```
```
// Store in cache after generation
exportasyncfunctionsetCache(
promptHash:string,
```

```
generationId:string,
ttlDays:number= 30
): Promise<void> {
awaitredis.setex(
`cache:prompt:${promptHash}`,
ttlDays * 24 * 60 * 60,
generationId
);
}
```
### 6.2 Batch Processing

```
// lib/batch.ts
exportasyncfunctionsubmitBatchGeneration(
userId:string,
prompts:string[],
config:GenerationConfig
) {
// 20% discount for batch processing
constdiscount = 0.8;
```
```
constjobs =awaitPromise.all(
prompts.map(async(prompt, index) => {
// Add delay to spread load
awaitnewPromise(r => setTimeout(r, index * 1000));
```
```
returnGenerationQueue.add('generate', {
userId,
prompt,
config,
discount,
priority: 10 ,// Lower priority
});
})
);
```
```
returnjobs.map(j => j.id);
}
```
### 6.3 Cost Tracking & Alerts

```
// lib/cost-monitor.ts
import{ Langfuse }from'langfuse';
```
```
constlangfuse =newLangfuse({
publicKey:process.env.LANGFUSE_PUBLIC_KEY,
secretKey:process.env.LANGFUSE_SECRET_KEY,
baseUrl:process.env.LANGFUSE_BASE_URL,
});
```
```
exportasyncfunctiontrackGenerationCost(
```

```
generationId:string,
model:string,
input:object,
output:object,
cost:number
) {
consttrace = langfuse.trace({
id:generationId,
name:'video-generation',
metadata: { model, userId:input.userId},
});
```
```
trace.generation({
name:model,
model,
modelParameters:input,
usage: {
input:JSON.stringify(input).length,
output:JSON.stringify(output).length,
total:cost,
unit:'USD',
},
cost: {
input:cost* 0.3,// Estimated split
output:cost* 0.7,
total:cost,
},
});
}
```
```
// Daily cost alerts
exportasyncfunctioncheckDailySpend(userId:string): Promise<void> {
consttoday =newDate().toISOString().split('T')[0];
constspend =awaitgetUserDailySpend(userId, today);
```
```
if(spend > 50) {// $50 threshold
awaitsendAlertEmail(userId,`Daily spend alert:$${spend.toFixed(2)}`);
}
}
```
## 7. Mobile-Specific Implementation

### 7.1 Expo Configuration

```
// apps/mobile/app.json
{
"expo": {
"name":"VideoForge",
"slug":"videoforge",
```

```
"version":"1.0.0",
"orientation":"portrait",
"icon":"./assets/icon.png",
"userInterfaceStyle":"dark",
"splash": {
"image":"./assets/splash.png",
"resizeMode":"contain",
"backgroundColor":"#000000"
},
"assetBundlePatterns": ["**/*"],
"ios": {
"supportsTablet":true,
"bundleIdentifier":"ai.videoforge.app",
"infoPlist": {
"NSCameraUsageDescription":"Camera access needed to capture photos for video generation",
"NSPhotoLibraryUsageDescription":"Photo library access needed to select images",
"NSMicrophoneUsageDescription":"Microphone access needed for avatar audio recording"
}
},
"android": {
"adaptiveIcon": {
"foregroundImage":"./assets/adaptive-icon.png",
"backgroundColor":"#000000"
},
"package":"ai.videoforge.app",
"permissions": [
"CAMERA",
"READ_EXTERNAL_STORAGE",
"WRITE_EXTERNAL_STORAGE",
"INTERNET"
]
},
"plugins": [
"expo-camera",
"expo-image-picker",
"expo-video",
"expo-background-upload",
[
"expo-notifications",
{
"icon":"./assets/notification-icon.png",
"color":"#ffffff"
}
]
]
}
}
```
### 7.2 Mobile Video Player Component

```
// apps/mobile/components/VideoPlayer.tsx
```

import{ useVideoPlayer, VideoView }from'expo-video';
import{ useEvent }from'expo';
import{ View, ActivityIndicator, TouchableOpacity }from'react-native';
import{ useEffect, useState }from'react';
import{ useVideoCache }from'@/hooks/useVideoCache';

interfaceVideoPlayerProps {
videoUri:string;
thumbnailUri?:string;
autoPlay?:boolean;
loop?:boolean;
style?:ViewStyle;
}

exportfunctionVideoPlayer({
videoUri,
thumbnailUri,
autoPlay =false,
loop =true,
style,
}: VideoPlayerProps) {
const[isLoading, setIsLoading] = useState(true);
const[localUri, setLocalUri] = useState<string|null>(null);
const{ cacheVideo, getCachedVideo } = useVideoCache();

```
// Initialize player
constplayer = useVideoPlayer(localUri || videoUri, (player) => {
player.loop = loop;
if(autoPlay) {
player.play();
}
});
```
```
// Monitor status
const{ status, error } = useEvent(
player,
'statusChange',
{ status:player.status}
);
```
```
// Cache video for offline
useEffect(() => {
constloadVideo =async() => {
// Check cache first
constcached =awaitgetCachedVideo(videoUri);
if(cached) {
setLocalUri(cached);
setIsLoading(false);
return;
}
```

```
// Start caching in background
cacheVideo(videoUri).then((localPath) => {
setLocalUri(localPath);
setIsLoading(false);
});
};
```
```
loadVideo();
}, [videoUri]);
```
```
// Handle errors
useEffect(() => {
if(error) {
console.error('Video playback error:', error);
// Fallback to remote URL
setLocalUri(null);
}
}, [error]);
```
```
return(
<View className="relative bg-black rounded-lg overflow-hidden"style={style}>
{isLoading && (
<View className="absolute inset-0 items-center justify-center z-10">
<ActivityIndicator size="large"color="white"/>
</View>
)}
```
```
<VideoView
player={player}
allowsFullscreen
allowsPictureInPicture
nativeControls
contentFit="contain"
className="w-full h-full"
/>
```
{/* Custom overlay controls can be added here */}
</View>
);
}

// Video cache hook
exportfunctionuseVideoCache() {
constcacheDir = FileSystem.cacheDirectory +'videos/';

```
constgetCachedVideo =async(uri:string): Promise<string|null> => {
consthash =awaitCrypto.digestStringAsync(
Crypto.CryptoDigestAlgorithm.SHA256,
uri
);
constpath = cacheDir + hash +'.mp4';
```

```
constinfo =awaitFileSystem.getInfoAsync(path);
if(info.exists) {
returnpath;
}
returnnull;
};
```
```
constcacheVideo =async(uri:string): Promise<string> => {
consthash =awaitCrypto.digestStringAsync(
Crypto.CryptoDigestAlgorithm.SHA256,
uri
);
constpath = cacheDir + hash +'.mp4';
```
```
// Download to cache
awaitFileSystem.makeDirectoryAsync(cacheDir, { intermediates:true});
awaitFileSystem.downloadAsync(uri, path);
```
```
// Clean old cache if > 500MB
awaitcleanOldCache();
```
```
returnpath;
};
```
```
constcleanOldCache =async() => {
constdir =awaitFileSystem.readDirectoryAsync(cacheDir);
// Sort by modification time and delete oldest
// Implementation details...
};
```
```
return{ cacheVideo, getCachedVideo };
}
```
### 7.3 Background Upload

```
// apps/mobile/hooks/useBackgroundUpload.ts
import*asBackgroundUploadfrom'expo-background-upload';
import{ useMutation }from'@tanstack/react-query';
```
```
exportfunctionuseBackgroundUpload() {
returnuseMutation({
mutationFn:async({
uri,
generationId,
}: {
uri:string;
generationId:string;
}) => {
// Get presigned URL from backend
const{ uploadUrl, fields } =awaitfetchPresignedUrl(generationId);
```

```
// Start background upload
constuploadTask =awaitBackgroundUpload.startAsync(
uploadUrl,
uri,
{
uploadType:BackgroundUpload.FileSystemUploadType.MULTIPART,
fieldName:'file',
mimeType:'video/mp4',
parameters:fields,
},
(progress) => {
constpercent = (progress.totalByteSent / progress.totalBytesExpectedToSend) * 100;
console.log(`Upload progress:${percent}%`);
}
);
```
```
returnuploadTask;
},
});
}
```
## 8. Testing Strategy

### 8.1 Testing Pyramid

#### ┌─────────────┐

```
│ E2E Tests │ ← Playwright (web), Detox (mobile)
│ (10%) │
└──────┬──────┘
│
┌─────────────┐
│ Integration │ ← API tests, Queue tests
│ Tests (30%) │
└──────┬──────┘
│
┌─────────────┐
│ Unit Tests│ ← Jest + React Testing Library
│ (60%) │
└─────────────┘
```
### 8.2 Key Test Cases

```
// __tests__/generation.test.ts
describe('Video Generation', () => {
it('should submit generation with valid credits',async() => {
constuser =awaitcreateTestUser({ credits: 100 });
```
```
constresult =awaitcaller.generation.submit({
```

```
prompt:'A cat dancing',
type:'t2v',
duration: 5 ,
resolution:'480p',
aspectRatio:'16:9',
});
```
expect(result.status).toBe('pending');
expect(result.creditsRemaining).toBe(95);// Deducted 5 credits
});

it('should fail with insufficient credits',async() => {
constuser =awaitcreateTestUser({ credits: 0 });

awaitexpect(
caller.generation.submit({
prompt:'A cat dancing',
type:'t2v',
duration: 5 ,
resolution:'480p',
aspectRatio:'16:9',
})
).rejects.toThrow('Insufficient credits');
});

it('should enforce daily limits for free tier',async() => {
constuser =awaitcreateTestUser({ tier:'free', dailyGenerations: 3 });

awaitexpect(
caller.generation.submit({
prompt:'A cat dancing',
type:'t2v',
duration: 5 ,
resolution:'480p',
aspectRatio:'16:9',
})
).rejects.toThrow('Daily limit reached');
});

it('should cache identical prompts',async() => {
constuser =awaitcreateTestUser({ credits: 100 });
constprompt ='Identical prompt';

```
// First generation
constresult1 =awaitcaller.generation.submit({
prompt,
type:'t2v',
duration: 5 ,
resolution:'480p',
aspectRatio:'16:9',
});
```

```
// Second generation (should use cache)
constresult2 =awaitcaller.generation.submit({
prompt,
type:'t2v',
duration: 5 ,
resolution:'480p',
aspectRatio:'16:9',
});
```
```
expect(result2.generationId).toBe(result1.generationId);
expect(result2.creditsRemaining).toBe(95);// Not deducted again
});
});
```
## 9. Deployment & DevOps

### 9.1 CI/CD Pipeline

```
# .github/workflows/ci.yml
name: CI/CD
```
```
on:
push:
branches: [main, develop]
pull_request:
branches: [main]
```
```
jobs:
test:
runs-on: ubuntu-latest
steps:
```
- uses: actions/checkout@v4
- name: Setup Node.js
    uses: actions/setup-node@v4
    with:
       node-version:' 20 '
       cache:'pnpm'
- name: Install dependencies
    run: pnpm install
- name: Lint
    run: pnpm lint
- name: Type check
    run: pnpm type-check


- name: Unit tests
    run: pnpm test:unit
    env:
       DATABASE_URL: ${{ secrets.DATABASE_URL }}
- name: Build
    run: pnpm build
- name: Deploy to Vercel (staging)
    if: github.ref == 'refs/heads/develop'
    run: vercel --token=${{ secrets.VERCEL_TOKEN }} --confirm
- name: Deploy to Vercel (production)
    if: github.ref == 'refs/heads/main'
    run: vercel --token=${{ secrets.VERCEL_TOKEN }} --confirm --prod

### 9.2 Environment Configuration

```
// lib/env.ts
import{ z }from'zod';
```
```
constenvSchema = z.object({
// App
NEXT_PUBLIC_APP_URL:z.string().url(),
NEXT_PUBLIC_API_URL:z.string().url(),
```
```
// Better Auth
BETTER_AUTH_SECRET:z.string(),
BETTER_AUTH_URL:z.string().url(),
GOOGLE_CLIENT_ID:z.string(),
GOOGLE_CLIENT_SECRET:z.string(),
```
```
// AI APIs
FAL_KEY:z.string(),
REPLICATE_API_TOKEN:z.string().optional(),
```
```
// Storage (Backblaze B2)
B2_REGION:z.string(),
B2_APPLICATION_KEY_ID:z.string(),
B2_APPLICATION_KEY:z.string(),
B2_BUCKET_NAME:z.string(),
B2_PUBLIC_URL:z.string().url(),
```
```
// Payments
STRIPE_SECRET_KEY:z.string(),
STRIPE_WEBHOOK_SECRET:z.string(),
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY:z.string(),
```
```
// Monitoring
SENTRY_DSN:z.string().url().optional(),
LANGFUSE_PUBLIC_KEY:z.string().optional(),
```

```
LANGFUSE_SECRET_KEY:z.string().optional(),
```
```
// Redis
UPSTASH_REDIS_REST_URL:z.string().url(),
UPSTASH_REDIS_REST_TOKEN:z.string(),
});
```
```
exportconstenv = envSchema.parse(process.env);
```
### 9.3 Monitoring & Alerting

```
// lib/monitoring.ts
import{ initasinitSentry }from'@sentry/nextjs';
import{ PostHog }from'posthog-node';
```
```
// Error tracking
initSentry({
dsn:process.env.SENTRY_DSN,
tracesSampleRate:0.1,
profilesSampleRate:0.1,
});
```
```
// Product analytics
exportconstposthog =newPostHog(
process.env.NEXT_PUBLIC_POSTHOG_KEY,
{
host:process.env.NEXT_PUBLIC_POSTHOG_HOST,
}
);
```
```
// Custom metrics
exportfunctiontrackMetric(
name:string,
value:number,
tags:Record<string,string> = {}
) {
// Send to Datadog/CloudWatch
console.log(`[METRIC]${name}:${value}`, tags);
}
```
## 10. Appendix

### 10.1 File Structure

```
videoforge/
├── apps/
│ ├── web/ # Next.js 14 web app
│ │ ├── app/ # App router
│ │ ├── components/ # Web-specific components
```

```
│ │ ├── lib/ # Utilities
│ │ └── public/ # Static assets
│ │
│ └── mobile/ # Expo React Native app
│ ├── app/ # Expo router
│ ├── components/ # Mobile-specific components
│ ├── hooks/ # Mobile hooks
│ └── assets/ # Images, fonts
│
├── packages/
│ ├── shared/ # Shared code
│ │ ├── components/ # Tamagui components
│ │ ├── hooks/ # Shared hooks
│ │ ├── types/ # TypeScript types
│ │ └── utils/ # Shared utilities
│ │
│ ├── ui/ # Design system
│ │ ├── src/
│ │ │ ├── components/ # shadcn/ui + Tamagui
│ │ │ ├── theme/ # Colors, typography
│ │ │ └── icons/ # Icon components
│ │ └── package.json
│ │
│ └── config/ # Shared config
│ ├── eslint/
│ ├── typescript/
│ └── tailwind/
│
├── server/ # Backend (if separate)
│ ├── routers/ # tRPC routers
│ ├── services/ # Business logic
│ └── workers/ # Queue workers
│
├── docs/ # Documentation
│ ├── PRD.md
│ ├── TECH_SPEC.md
│ └── API.md
│
├── turbo.json # Turborepo config
└── pnpm-workspace.yaml # PNPM workspace
```
### 10.2 Dependencies

```
// Root package.json
{
"name":"videoforge",
"private":true,
"workspaces": [
"apps/*",
"packages/*"
],
```

```
"scripts": {
"build":"turbo run build",
"dev":"turbo run dev --parallel",
"lint":"turbo run lint",
"test":"turbo run test",
"type-check":"turbo run type-check"
},
"devDependencies": {
"turbo":"^2.0.0",
"typescript":"^5.3.0"
}
}
```
### 10.3 Glossary

### Term Definition

### BullMQ Redis-based queue system for Node.js

### DiT Diffusion Transformer (AI architecture)

### Fal.ai Primary AI API provider for video generation

### I2V Image-to-Video

### LoRA Low-Rank Adaptation (model fine-tuning)

### MVL Multimodal Visual Language

### B2 Backblaze B2 object storage (S3-compatible)

### T2V Text-to-Video

### tRPC TypeScript RPC framework

### TTL Time To Live (data expiration)

### V2V Video-to-Video

### VAE Variational Autoencoder

### Document Control:

- **Version History:**
- v1.0 (2026-03-22): Initial Tech Spec
- **Related Documents:**
- PRD.md v1.0
- DESIGN_SYSTEM.md v1.0
- **Next Review Date:** 2026-04-22

### Contact: engineering@videoforge.ai


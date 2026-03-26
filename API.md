# VideoForge API Reference

This document contains the current API surface for the **web-only VideoForge platform**.

- Frontend: Next.js (App Router)
- Backend: Node.js (Next.js API routes + tRPC)
- Auth: Better Auth session cookie (for protected/admin procedures)
- Base tRPC endpoint: `/api/trpc`

---

## 1) Authentication

Protected and admin procedures require an active Better Auth session (cookie-based):

- Missing/invalid session: unauthorized error
- Admin routes additionally require a studio/admin-capable account (enforced in server middleware)

---

## 2) Transport & API style

### tRPC
- Endpoint: `POST /api/trpc/<router.procedure>` (and batched requests via standard tRPC client)
- Handler file: `/home/runner/work/vvkraft/vvkraft/apps/web/app/api/trpc/[trpc]/route.ts`

### Webhooks
- Fal webhook endpoint: `POST /api/webhooks/fal`
- Razorpay webhook endpoint: `POST /api/webhooks/razorpay`

---

## 3) tRPC routers and procedures

Root router definition:
`/home/runner/work/vvkraft/vvkraft/apps/web/server/routers/_app.ts`

### 3.1 generation router (`generation.*`)
File: `/home/runner/work/vvkraft/vvkraft/apps/web/server/routers/generation.ts`

All procedures are **protected**.

1. `generation.create` (mutation)
   - Input: `generationRequestSchema`
     - includes prompt, optional negative prompt, duration/resolution/aspect ratio, optional model/seed/motion/reference image/character
   - Behavior: routes model by tier, checks credits, creates DB record, deducts credits, enqueues job
   - Returns: created generation record

2. `generation.getById` (query)
   - Input: `{ id: string }`
   - Returns: generation owned by current user

3. `generation.list` (query)
   - Input: `{ limit?: number(1..50), cursor?: string }`
   - Returns: `{ items: Generation[], nextCursor?: string }`

4. `generation.cancel` (mutation)
   - Input: `{ id: string }`
   - Returns: `{ success: true }`

5. `generation.estimateCost` (query)
   - Input: `{ durationSeconds, resolution?, model? }`
   - Returns: cost estimate with effective model/duration/resolution and credit sufficiency

6. `generation.createLongVideo` (mutation)
   - Input: `longVideoRequestSchema`
   - Access: paid tiers only
   - Returns: created generation record

7. `generation.estimateLongVideoCost` (query)
   - Input: `{ durationSeconds: 30|60|120, resolution?, model? }`
   - Returns: availability + estimate metadata

### 3.2 user router (`user.*`)
File: `/home/runner/work/vvkraft/vvkraft/apps/web/server/routers/user.ts`

All procedures are **protected**.

1. `user.me` (query)
   - Input: none
   - Returns: current user profile

2. `user.updateProfile` (mutation)
   - Input: `userProfileUpdateSchema`
   - Returns: updated user profile

3. `user.creditHistory` (query)
   - Input: `{ limit?: number(1..50) }`
   - Returns: latest credit transactions

4. `user.stats` (query)
   - Input: none
   - Returns: aggregate user stats (generations, credits, tier)

### 3.3 billing router (`billing.*`)
File: `/home/runner/work/vvkraft/vvkraft/apps/web/server/routers/billing.ts`

All procedures are **protected**.

1. `billing.plans` (query)
   - Input: none
   - Returns: available subscription plans

2. `billing.creditPacks` (query)
   - Input: none
   - Returns: region-wise credit packs (`usd` and `inr`)

3. `billing.createSubscriptionCheckout` (mutation)
   - Input: `{ tier, billingPeriod, region }`
   - Returns: Razorpay subscription checkout payload

4. `billing.verifySubscriptionPayment` (mutation)
   - Input: `{ razorpayPaymentId, razorpaySubscriptionId, razorpaySignature, tier, region }`
   - Returns: `{ success: true, tier }`

5. `billing.createCreditCheckout` (mutation)
   - Input: `{ credits, region }`
   - Returns: Razorpay order payload for one-time credits

6. `billing.verifyCreditPayment` (mutation)
   - Input: `{ razorpayPaymentId, razorpayOrderId, razorpaySignature, credits }`
   - Returns: `{ success: true, credits }`

7. `billing.cancelSubscription` (mutation)
   - Input: none
   - Returns: `{ success: true }`

### 3.4 character router (`character.*`)
File: `/home/runner/work/vvkraft/vvkraft/apps/web/server/routers/character.ts`

All procedures are **protected**.

1. `character.list` (query)
   - Input: none
   - Returns: user characters

2. `character.getUploadUrl` (mutation)
   - Input: `{ characterId, contentType }` where contentType is image mime type
   - Returns: `{ uploadUrl, publicUrl, key }`

3. `character.create` (mutation)
   - Input: `characterCreateSchema`
   - Notes: free tier limit enforced
   - Returns: created character

4. `character.delete` (mutation)
   - Input: `{ id: string }`
   - Returns: `{ success: true }`

### 3.5 upscaler router (`upscaler.*`)
File: `/home/runner/work/vvkraft/vvkraft/apps/web/server/routers/upscaler.ts`

All procedures are **protected**.

1. `upscaler.getUploadUrl` (mutation)
   - Input: `{ fileName, contentType, fileSizeBytes }`
   - Returns: `{ uploadUrl, r2Key, publicUrl }`

2. `upscaler.create` (mutation)
   - Input: `videoUpscaleRequestSchema`
   - Notes: quality mode impacts credits; premium mode tier-gated
   - Returns: created upscale job

3. `upscaler.getById` (query)
   - Input: `{ id: string }`
   - Returns: upscale job if owned by user

4. `upscaler.list` (query)
   - Input: `{ limit?: number(1..50), cursor?: string }`
   - Returns: `{ items, nextCursor? }`

### 3.6 templates router (`templates.*`)
File: `/home/runner/work/vvkraft/vvkraft/apps/web/server/routers/templates.ts`

1. `templates.list` (query)
   - Auth: **public**
   - Input: `{ category?: string }`
   - Returns: template list

2. `templates.getById` (query)
   - Auth: **public**
   - Input: `{ templateId: string }`
   - Returns: template by id

3. `templates.generate` (mutation)
   - Auth: **protected**
   - Input: `templateGenerateSchema`
   - Returns: `{ generationId, templateName }`

### 3.7 autoScript router (`autoScript.*`)
File: `/home/runner/work/vvkraft/vvkraft/apps/web/server/routers/autoScript.ts`

All procedures are **protected**.

1. `autoScript.generate` (mutation)
   - Input: `autoScriptRequestSchema`
   - Returns: generated scene script payload

2. `autoScript.list` (query)
   - Input: `{ limit?: number(1..20) }`
   - Returns: user scripts

### 3.8 admin router (`admin.*`)
File: `/home/runner/work/vvkraft/vvkraft/apps/web/server/routers/admin.ts`

All procedures are **admin-protected**.

1. `admin.platformMetrics` (query)
   - Input: none
   - Returns: platform KPI aggregates

2. `admin.userMetrics` (query)
   - Input: `{ limit?: number(1..100), onlyDowngraded?: boolean }`
   - Returns: per-user profitability metrics

3. `admin.userMetricById` (query)
   - Input: `{ userId: string }`
   - Returns: metrics for one user

4. `admin.setDowngradeFlag` (mutation)
   - Input: `{ userId, downgraded, reason? }`
   - Returns: `{ success: true }`

### 3.9 community router (`community.*`)
File: `/home/runner/work/vvkraft/vvkraft/apps/web/server/routers/community.ts`

1. `community.trending` (query)
   - Auth: **public**
   - Input: `{ limit?: number(1..50), cursor?: string }`
   - Returns: `{ videos, nextCursor? }`

2. `community.publish` (mutation)
   - Auth: **protected**
   - Input: `{ generationId: string }`
   - Returns: `{ published: true }`

3. `community.like` (mutation)
   - Auth: **protected**
   - Input: `{ communityVideoId: string }`
   - Returns: `{ liked: boolean }`

4. `community.remix` (mutation)
   - Auth: **protected**
   - Input: `communityRemixSchema`
   - Returns: `{ generationId }`

### 3.10 export router (`export.*`)
File: `/home/runner/work/vvkraft/vvkraft/apps/web/server/routers/export.ts`

All procedures are **protected**.

1. `export.create` (mutation)
   - Input: `exportRequestSchema`
   - Returns:
     - local export: immediate signed download URL
     - social export: queued job metadata

2. `export.getStatus` (query)
   - Input: `{ exportJobId: string }`
   - Returns: export job status payload

3. `export.list` (query)
   - Input: `{ limit?: number(1..50) }`
   - Returns: user export jobs

### 3.11 videoEditor router (`videoEditor.*`)
File: `/home/runner/work/vvkraft/vvkraft/apps/web/server/routers/videoEditor.ts`

All procedures are **protected** and **paid-tier gated**.

1. `videoEditor.create` (mutation)
   - Input: `{ name, seedGenerationIds? }`
   - Returns: editor project

2. `videoEditor.getById` (query)
   - Input: `{ projectId: string }`
   - Returns: project

3. `videoEditor.list` (query)
   - Input: `{ limit?: number(1..50) }`
   - Returns: project list

4. `videoEditor.save` (mutation)
   - Input: `{ projectId, name?, clips, textOverlays, backgroundAudioUrl?, backgroundAudioVolume }`
   - Returns: `{ success: true, totalDurationSeconds }`

5. `videoEditor.getUploadUrl` (mutation)
   - Input: `{ projectId, clipId, fileName, contentType, fileSizeBytes }`
   - Returns: `{ uploadUrl, r2Key, publicUrl }`

6. `videoEditor.export` (mutation)
   - Input: `{ projectId: string }`
   - Returns: export state and (when ready) downloadUrl

7. `videoEditor.delete` (mutation)
   - Input: `{ projectId: string }`
   - Returns: `{ success: true }`

---

## 4) Webhook APIs

### 4.1 Fal webhook
- Path: `POST /api/webhooks/fal`
- File: `/home/runner/work/vvkraft/vvkraft/apps/web/app/api/webhooks/fal/route.ts`
- Auth: `x-fal-webhook-secret` must match `FAL_WEBHOOK_SECRET`
- Query usage:
  - `?jobType=upscale&jobId=<id>` for upscaler jobs
  - default path handles generation jobs
- Typical payload fields:
  - `request_id`
  - `status` (`COMPLETED` | `FAILED` | `IN_PROGRESS`)
  - `payload.generationId` (generation flow)
  - `output.video.url` (completed output)
  - `error` (failure reason)

### 4.2 Razorpay webhook
- Path: `POST /api/webhooks/razorpay`
- File: `/home/runner/work/vvkraft/vvkraft/apps/web/app/api/webhooks/razorpay/route.ts`
- Auth: HMAC signature via `x-razorpay-signature`, validated with `RAZORPAY_WEBHOOK_SECRET`
- Events handled:
  - `subscription.charged`
  - `subscription.cancelled`
  - `payment.failed`

---

## 5) Error behavior

Error classes are surfaced through tRPC error envelopes. Common categories:
- `UNAUTHORIZED` / `FORBIDDEN`
- `NOT_FOUND`
- `BAD_REQUEST`
- `PAYMENT_REQUIRED`
- `INTERNAL_SERVER_ERROR`

For webhooks:
- Invalid signatures return HTTP 401
- Malformed payloads return HTTP 400
- Server-side processing failures return HTTP 500

---

## 6) Versioning and change policy

- Current API is router/procedure based (tRPC), not REST-versioned by URL.
- Breaking changes should be introduced carefully and coordinated with web client updates.
- Keep this file synchronized with router definitions in `/apps/web/server/routers`.

# VideoForge API Documentation

## Version 1.0.

## Base URL: https://api.videoforge.ai/v

## Authentication: Bearer Token (JWT)

## Content-Type: application/json

## Table of Contents

## 1.Authentication

## 2.Rate Limits

## 3.Video Generation

## 4.Models

## 5.Characters

## 6.Webhooks

## 7.Errors

## 8.SDKs

## Authentication

## All API requests require authentication using a Bearer token in the Authorization header.

## Obtaining an API Key

## 1.Sign up atvideoforge.ai

## 2.Navigate to Settings → API Keys

## 3.Generate a new key with appropriate permissions

## Using the API Key

```
curl https://api.videoforge.ai/v1/generations\
-H"Authorization: Bearer YOUR_API_KEY"\
-H"Content-Type: application/json"
```
## Token Expiration

## • API keys do not expire by default

## • You can set expiration dates for enhanced security

## • Revoke keys immediately if compromised

## Rate Limits


### Tier Requests/Min Concurrent

### Generations

### Burst Limit

### Free 10 1 20

### Creator 60 2 100

### Pro 120 5 300

### Studio 300 10 1000

### Enterprise Custom Custom Custom

### Headers returned with every request:

```
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 45
X-RateLimit-Reset: 1640995200
```
### Exceeding limits returns:

##### {

```
"error":"rate_limit_exceeded",
"message":"Rate limit exceeded. Try again in 45 seconds.",
"retry_after": 45
}
```
## Video Generation

### Create Generation

### Submit a new video generation request.

### Endpoint: POST /generations

### Cost: Varies by model and duration (see Models)

### Request Body

##### {

```
"prompt":"A serene Japanese garden with cherry blossoms falling, cinematic lighting",
"negative_prompt":"blurry, low quality, distorted",
"type":"t2v",
"model":"kling-2.6-pro",
"duration": 10,
"resolution":"1080p",
"aspect_ratio":"16:9",
"enable_audio":true,
"webhook_url":"https://your-app.com/webhooks/videoforge",
"metadata": {
"project_id":"proj_123",
"user_tag":"campaign_q1"
}
}
```

### Parameters

### Field Type Required Description

### prompt string Yes Video description (max

### 2000 chars)

### negative_prompt string No What to avoid (max

### 1000 chars)

### type enum Yes t2v,i2v,v2v,avatar,

#### multishot

### model string Yes Model ID (seeModels)

### duration integer Yes Seconds (5-15, depends

### on model)

### resolution enum No 480p,720p,1080p

### (model dependent)

### aspect_ratio enum No 16:9,9:16,1:1,21:

### enable_audio boolean No Generate synchronized

### audio

### input_image_url string No For I2V (public URL)

### input_video_url string No For V2V (public URL)

### character_ids array No Character consistency

### references

### motion_control object No Camera movement

### settings

### multi_shot_config object No Multi-shot storyboard

### settings

### webhook_url string No Callback URL for

### status updates

### metadata object No Custom key-value pairs

### Motion Control Object

##### {

```
"motion_control": {
"type":"orbit",
"intensity":"moderate",
"path":"clockwise_360",
"speed": 0.
}
}
```
### Types: pan,tilt,zoom,orbit,dolly,custom

### Intensities: subtle,moderate,dynamic

### Speed: 0.1 (slow) to 1.0 (fast)

### Multi-Shot Configuration

##### {

```
"multi_shot_config": {
```

```
"shot_count": 3,
"shots": [
{
"type":"wide",
"duration": 5,
"prompt":"Wide establishing shot of the garden"
},
{
"type":"medium",
"duration": 5,
"prompt":"Medium shot of cherry blossom branch"
},
{
"type":"closeup",
"duration": 5,
"prompt":"Close-up of falling petals"
}
]
}
}
```
### Response

##### {

```
"success":true,
"data": {
"generation_id":"gen_abc123xyz",
"status":"pending",
"estimated_duration": 45,
"estimated_cost": 1.40,
"credits_charged": 14,
"credits_remaining": 186,
"queue_position": 3,
"created_at":"2026-03-22T10:30:00Z"
}
}
```
### Get Generation Status

### Check the status of a generation.

### Endpoint: GET /generations/{generation_id}

### Response (Pending)

##### {

```
"success":true,
"data": {
"generation_id":"gen_abc123xyz",
"status":"processing",
```

```
"progress": 65,
"queue_position":null,
"started_at":"2026-03-22T10:31:15Z",
"estimated_completion":"2026-03-22T10:32:30Z"
}
}
```
### Response (Completed)

##### {

```
"success":true,
"data": {
"generation_id":"gen_abc123xyz",
"status":"completed",
"video_url":"https://cdn.videoforge.ai/videos/gen_abc123xyz.mp4",
"thumbnail_url":"https://cdn.videoforge.ai/thumbnails/gen_abc123xyz.jpg",
"audio_url":"https://cdn.videoforge.ai/audio/gen_abc123xyz.mp3",
"duration": 10,
"file_size": 15728640,
"resolution":"1920x1080",
"fps": 30,
"codec":"h264",
"actual_cost": 1.40,
"credits_charged": 14,
"completed_at":"2026-03-22T10:32:28Z",
"metadata": {
"project_id":"proj_123"
}
}
}
```
### Response (Failed)

##### {

```
"success":true,
"data": {
"generation_id":"gen_abc123xyz",
"status":"failed",
"error": {
"code":"content_policy_violation",
"message":"Generation failed content policy check",
"details":"The prompt violates our content policy regarding..."
},
"credits_refunded": 14,
"failed_at":"2026-03-22T10:31:45Z"
}
}
```

### List Generations

### Retrieve all generations for the authenticated user.

### Endpoint: GET /generations

### Query Parameters:

### Parameter Type Description

### limit integer Max results (1-100, default 20)

### cursor string Pagination cursor

### status string Filter by status

### type string Filter by type

### from_date ISO 8601 Start date filter

### to_date ISO 8601 End date filter

### Response

##### {

```
"success":true,
"data": {
"items": [
{
"generation_id":"gen_abc123xyz",
"status":"completed",
"type":"t2v",
"prompt":"A serene Japanese garden...",
"thumbnail_url":"https://cdn.videoforge.ai/thumbnails/gen_abc123xyz.jpg",
"duration": 10,
"created_at":"2026-03-22T10:30:00Z"
}
],
"pagination": {
"next_cursor":"eyJpZCI6Imdlbl94eXo3ODki...",
"has_more":true
}
}
}
```
### Cancel Generation

### Cancel a pending or processing generation.

### Endpoint: POST /generations/{generation_id}/cancel

### Response

##### {

```
"success":true,
"data": {
"generation_id":"gen_abc123xyz",
```

```
"status":"cancelled",
"credits_refunded": 14,
"refund_id":"ref_abc123"
}
}
```
### Note: Credits are only refunded if cancellation occurs before generation starts.

## Models

### List Available Models

### Endpoint: GET /models

### Response

##### {

```
"success":true,
"data": {
"models": [
{
"id":"kling-3.0-pro",
"name":"Kling 3.0 Pro",
"description":"Latest generation with native audio and multi-shot",
"provider":"fal-ai",
"capabilities": ["t2v","i2v","multishot","audio","voice_control"],
"pricing": {
"per_second": 0.224,
"per_second_with_audio": 0.336,
"currency":"USD"
},
"limits": {
"max_duration": 15,
"max_resolution":"1080p",
"supported_aspect_ratios": ["16:9","9:16","1:1","21:9"]
},
"availability": ["studio","enterprise"]
},
{
"id":"kling-2.6-pro",
"name":"Kling 2.6 Pro",
"description":"High quality with motion control",
"provider":"fal-ai",
"capabilities": ["t2v","i2v","motion_control","audio"],
"pricing": {
"per_second": 0.07,
"per_second_with_audio": 0.14,
"currency":"USD"
},
"limits": {
```

```
"max_duration": 15,
"max_resolution":"1080p",
"supported_aspect_ratios": ["16:9","9:16","1:1"]
},
"availability": ["pro","studio","enterprise"]
},
{
"id":"wan-2.2-fast",
"name":"Wan 2.2 Fast",
"description":"Quick generation for drafts",
"provider":"fal-ai",
"capabilities": ["t2v","i2v"],
"pricing": {
"per_video": 0.025,
"currency":"USD"
},
"limits": {
"max_duration": 5,
"max_resolution":"720p",
"supported_aspect_ratios": ["16:9","9:16"]
},
"availability": ["free","creator","pro","studio","enterprise"]
}
]
}
}
```
## Characters

### Create Character

### Create a character for consistency across generations.

### Endpoint: POST /characters

### Request Body

##### {

```
"name":"Sarah Chen",
"description":"Young Asian woman, mid-20s, professional attire, warm smile",
"reference_images": [
"https://your-cdn.com/sarah-1.jpg",
"https://your-cdn.com/sarah-2.jpg"
],
"tags": ["professional","asian","female"],
"voice_id":"voice_sarah_01"
}
```
### Response


##### {

```
"success":true,
"data": {
"character_id":"char_xyz789",
"name":"Sarah Chen",
"reference_image_count": 2,
"created_at":"2026-03-22T10:30:00Z"
}
}
```
### List Characters

### Endpoint: GET /characters

### Response

##### {

```
"success":true,
"data": {
"characters": [
{
"character_id":"char_xyz789",
"name":"Sarah Chen",
"description":"Young Asian woman...",
"reference_image_count": 2,
"usage_count": 15,
"last_used_at":"2026-03-21T14:22:00Z",
"created_at":"2026-03-20T09:15:00Z"
}
]
}
}
```
## Webhooks

### Webhook Events

### VideoForge sends webhook events for generation status changes.

### Event Types

### Event Description

### generation.created Generation queued

### generation.processing Generation started

### generation.completed Video ready

### generation.failed Generation failed


### Table 4 – continued

### Event Description

### generation.cancelled Generation cancelled

### Webhook Payload

##### {

```
"event":"generation.completed",
"timestamp":"2026-03-22T10:32:28Z",
"data": {
"generation_id":"gen_abc123xyz",
"user_id":"user_123",
"status":"completed",
"video_url":"https://cdn.videoforge.ai/videos/gen_abc123xyz.mp4",
"thumbnail_url":"https://cdn.videoforge.ai/thumbnails/gen_abc123xyz.jpg",
"duration": 10,
"file_size": 15728640,
"metadata": {
"project_id":"proj_123"
}
}
}
```
### Webhook Security

### Webhooks are signed with HMAC-SHA256:

```
constcrypto = require('crypto');
```
```
functionverifyWebhook(payload, signature, secret) {
constexpected = crypto
.createHmac('sha256', secret)
.update(JSON.stringify(payload))
.digest('hex');
```
```
returncrypto.timingSafeEqual(
Buffer.from(signature),
Buffer.from(expected)
);
}
```
### Headers:

```
X-Webhook-Signature:sha 256 =abc 123 ...
X-Webhook-Event:generation.completed
X-Webhook-Id:wh_abc 123
```
### Retry Policy

- Failed webhooks are retried 5 times with exponential backoff


- Retry intervals: 1s, 5s, 25s, 125s, 625s
- After 5 failures, webhook is disabled (email notification sent)

## Errors

### Error Format

### All errors follow this structure:

##### {

```
"success":false,
"error": {
"code":"insufficient_credits",
"message":"Not enough credits for this generation",
"details":"Required: 14, Available: 5",
"documentation_url":"https://docs.videoforge.ai/errors/insufficient-credits"
}
}
```
### Error Codes

### Code HTTP Status Description

### invalid_request 400 Malformed request

### unauthorized 401 Invalid or missing API key

### forbidden 403 Insuﬀicient permissions

### not_found 404 Resource not found

### rate_limit_exceeded 429 Too many requests

### insufficient_credits 402 Not enough credits

### content_policy_violation 400 Prompt violates content policy

### model_unavailable 503 Model temporarily unavailable

### internal_error 500 Server error

## SDKs

### Oﬀicial SDKs

### Language Package Installation

### JavaScript/TypeScript @videoforge/sdk npm install @videoforge/sdk

### Python videoforge pip install videoforge

### Go github.com/videoforge/

#### go-sdk

#### go get github.com/videoforge/go-sdk

### JavaScript SDK Example

```
import{ VideoForgeClient }from'@videoforge/sdk';
```

```
constclient =newVideoForgeClient({
apiKey:'your_api_key',
// Optional: webhook secret for verification
webhookSecret:'whsec_...'
});
```
```
// Create generation
constgeneration =awaitclient.generations.create({
prompt:'A serene Japanese garden with cherry blossoms',
model:'kling-2.6-pro',
duration: 10,
enableAudio:true
});
```
```
console.log('Generation ID:', generation.id);
```
```
// Poll for completion
constresult =awaitclient.generations.waitForCompletion(generation.id, {
onProgress: (progress) => {
console.log(`Progress:${progress.percentage}%`);
}
});
```
```
console.log('Video URL:', result.videoUrl);
```
### Python SDK Example

```
fromvideoforgeimportVideoForgeClient
```
```
client = VideoForgeClient(api_key="your_api_key")
```
```
# Create generation
generation = client.generations.create(
prompt="A serene Japanese garden with cherry blossoms",
model="kling-2.6-pro",
duration=10,
enable_audio=True
)
```
```
# Wait for completion with webhook (recommended)
result = client.generations.wait_for_completion(
generation.id,
timeout=300 # 5 minutes
)
```
```
print(f"Video URL:{result.video_url}")
```

## Changelog

### v1.0.0 (2026-03-22)

- Initial API release
- Support for T2V, I2V, V2V generation
- Multi-shot storyboarding
- Native audio generation
- Character consistency system
- Webhook support

### Support: developers@videoforge.ai

### Status Page: status.videoforge.ai

### Documentation: docs.videoforge.ai



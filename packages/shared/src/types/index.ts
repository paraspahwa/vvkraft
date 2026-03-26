// Core domain types for VideoForge
export * from "./agents";

export type SubscriptionTier = "free" | "creator" | "pro" | "studio";
export type GenerationStatus = "pending" | "queued" | "processing" | "completed" | "failed" | "cancelled";
export type VideoResolution = "480p" | "720p" | "1080p";
export type VideoModel =
  // ── Longcat family ─────────────────────────────────────────────────────────
  | "fal-ai/longcat-video/distilled/text-to-video/480p"
  | "fal-ai/longcat-video/distilled/text-to-video/720p"
  | "fal-ai/longcat-video/text-to-video/480p"
  | "fal-ai/longcat-video/text-to-video/720p"
  // ── LTXV / LTX family ──────────────────────────────────────────────────────
  | "fal-ai/ltxv-13b-098-distilled"
  | "fal-ai/ltxv-13b-098-distilled/multiconditioning"
  | "fal-ai/ltx-2/text-to-video/fast"
  | "fal-ai/ltx-2.3/text-to-video/fast"
  | "fal-ai/ltx-2-19b/distilled/text-to-video"
  | "fal-ai/ltx-2-19b/distilled/text-to-video/lora"
  // ── Wan / Krea family ──────────────────────────────────────────────────────
  | "fal-ai/krea-wan-14b/text-to-video"
  | "fal-ai/wan-25-preview/text-to-video"
  | "fal-ai/wan/v2.2-a14b/image-to-video"
  | "fal-ai/wan/v2.2-a14b/text-to-video"
  | "fal-ai/wan/v2.2-5b/text-to-video/distill"
  | "fal-ai/wan/v2.2-5b/text-to-video/fast-wan"
  | "wan/v2.6/text-to-video"
  // ── Kling family ───────────────────────────────────────────────────────────
  | "fal-ai/kling-video/v2.6/pro/text-to-video"
  | "fal-ai/kling-video/v2.5-turbo/standard/image-to-video"
  | "fal-ai/kling-video/v3/pro/text-to-video"
  | "fal-ai/kling-video/v3/standard/text-to-video"
  | "fal-ai/kling-video/o3/pro/text-to-video"
  | "fal-ai/kling-video/o3/standard/text-to-video"
  // ── Pixverse family ────────────────────────────────────────────────────────
  | "fal-ai/pixverse/v5/text-to-video"
  | "fal-ai/pixverse/v5.5/text-to-video"
  | "fal-ai/pixverse/v5.6/text-to-video"
  // ── ByteDance / Seedance ───────────────────────────────────────────────────
  | "fal-ai/bytedance/seedance/v1/pro/fast/text-to-video"
  | "fal-ai/bytedance/seedance/v1.5/pro/text-to-video"
  // ── HeyGen / Avatar ────────────────────────────────────────────────────────
  | "fal-ai/heygen/avatar3/digital-twin"
  | "fal-ai/heygen/v2/video-agent"
  | "argil/avatars/text-to-video"
  // ── Other providers ────────────────────────────────────────────────────────
  | "fal-ai/cosmos-predict-2.5/distilled/text-to-video"
  | "fal-ai/hunyuan-video-v1.5/text-to-video"
  | "fal-ai/minimax/hailuo-2.3/standard/text-to-video"
  | "fal-ai/kandinsky5/text-to-video"
  | "fal-ai/kandinsky5/text-to-video/distill"
  | "fal-ai/vidu/q3/text-to-video/turbo"
  | "xai/grok-imagine-video/text-to-video"
  | "veed/fabric-1.0/text";

export interface User {
  id: string;
  email: string;
  displayName: string | null;
  photoURL: string | null;
  tier: SubscriptionTier;
  credits: number;
  creditsUsedThisMonth: number;
  razorpayCustomerId: string | null;
  razorpaySubscriptionId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface TierLimits {
  tier: SubscriptionTier;
  videosPerDay: number | null;    // null = unlimited
  videosPerMonth: number | null;  // null = unlimited
  maxDurationSeconds: number;
  maxResolution: VideoResolution;
  watermark: boolean;
  motionControl: boolean;
  characterConsistency: boolean;
  priorityQueue: boolean;
  monthlyPriceUsd: number;
  /** Monthly price for India region (INR) */
  monthlyPriceInr: number;
  includedCredits: number;
  /** Included credits for India region plans (PPP-adjusted, lower than global) */
  includedCreditsIndia: number;
  /** Maximum duration (seconds) allowed for long-form video generation; 0 = not available */
  longVideoMaxDurationSeconds: number;
}

export interface Generation {
  id: string;
  userId: string;
  status: GenerationStatus;
  prompt: string;
  negativePrompt: string | null;
  model: VideoModel;
  resolution: VideoResolution;
  durationSeconds: number;
  aspectRatio: "16:9" | "9:16" | "1:1";
  seed: number | null;
  motionStrength: number | null;
  referenceImageUrl: string | null;
  characterId: string | null;

  // Output
  videoUrl: string | null;
  thumbnailUrl: string | null;
  r2Key: string | null;
  falRequestId: string | null;

  // Cost tracking
  creditsCost: number;
  actualCostUsd: number | null;

  // Metadata
  errorMessage: string | null;
  processingStartedAt: Date | null;
  completedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Character {
  id: string;
  userId: string;
  name: string;
  description: string | null;
  referenceImageUrl: string;
  r2Key: string;
  generationCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreditTransaction {
  id: string;
  userId: string;
  amount: number;          // positive = credit, negative = debit
  balanceAfter: number;
  type: "purchase" | "subscription" | "generation" | "refund" | "bonus";
  description: string;
  generationId: string | null;
  razorpayPaymentId: string | null;
  createdAt: Date;
}

// ── Video Upscaler ─────────────────────────────────────────────────────────────

export type UpscaleStatus = "pending" | "queued" | "processing" | "completed" | "failed";

/** Quality mode for upscaling: standard (free) or real-esrgan (paid users) */
export type UpscaleQualityMode = "standard" | "real-esrgan";

export interface VideoUpscaleJob {
  id: string;
  userId: string;
  status: UpscaleStatus;
  /** Public URL of the input video (from R2 or other storage) */
  inputVideoUrl: string;
  /** Duration of the source video in seconds */
  inputDurationSeconds: number;
  /** R2 key used for the uploaded input file */
  inputR2Key: string | null;
  /** Quality mode selected by the user */
  qualityMode: UpscaleQualityMode;
  /** Public URL of the 4K output video after processing */
  outputVideoUrl: string | null;
  /** R2 key for the permanent output file */
  outputR2Key: string | null;
  /** Fal.ai async request ID (set once submitted) */
  falRequestId: string | null;
  /** Credits consumed */
  creditsCost: number;
  /** Human-readable error message on failure */
  errorMessage: string | null;
  processingStartedAt: Date | null;
  completedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface GenerationRequest {
  prompt: string;
  negativePrompt?: string;
  durationSeconds: number;
  aspectRatio: "16:9" | "9:16" | "1:1";
  resolution?: VideoResolution;
  seed?: number;
  motionStrength?: number;
  referenceImageUrl?: string;
  characterId?: string;
  model?: VideoModel;
}

export interface PricingPlan {
  tier: SubscriptionTier;
  name: string;
  monthlyPriceUsd: number;
  yearlyPriceUsd: number;
  /** Monthly price for India region (INR) */
  monthlyPriceInr: number;
  /** Per-month price when billed yearly for India region (INR) */
  yearlyPriceInr: number;
  razorpayPlanIdMonthly: string | null;
  razorpayPlanIdYearly: string | null;
  /** Razorpay plan ID for India monthly billing (INR) */
  razorpayPlanIdMonthlyInr: string | null;
  /** Razorpay plan ID for India yearly billing (INR) */
  razorpayPlanIdYearlyInr: string | null;
  features: string[];
  limits: TierLimits;
  highlighted: boolean;
}

// ── Templates ─────────────────────────────────────────────────────────────────

/** Category slug for 1-click video templates */
export type TemplateCategory =
  | "motivational"
  | "crypto"
  | "anime"
  | "gym"
  | "news"
  | "product"
  | "travel"
  | "food"
  | "education";

/** A 1-click video template the user can launch immediately */
export interface VideoTemplate {
  id: string;
  name: string;
  description: string;
  category: TemplateCategory;
  thumbnailUrl: string | null;
  /** Pre-filled prompt injected into the generation form */
  prompt: string;
  negativePrompt: string | null;
  aspectRatio: "16:9" | "9:16" | "1:1";
  durationSeconds: number;
  /** Suggested model for best results */
  suggestedModel: VideoModel;
  /** Minimum tier required to use this template */
  minTier: SubscriptionTier;
  tags: string[];
  usageCount: number;
  /** Example output URL (preview in the gallery) */
  exampleVideoUrl: string | null;
}

// ── Auto-Script Generator ─────────────────────────────────────────────────────

/** A single scene within an AI-generated script */
export interface ScriptScene {
  sceneIndex: number;
  /** Visual description of what happens on screen */
  visualDescription: string;
  /** Spoken or on-screen caption text */
  caption: string;
  /** Duration of this scene in seconds */
  durationSeconds: number;
  /** Background music mood hint */
  musicMood: string | null;
}

/** A full auto-generated script broken into scenes */
export interface GeneratedScript {
  id: string;
  userId: string;
  /** Original plain-English user input (e.g. "make gym video") */
  userIntent: string;
  /** Video style derived from the intent */
  style: string;
  /** Recommended aspect ratio for the platform */
  aspectRatio: "16:9" | "9:16" | "1:1";
  scenes: ScriptScene[];
  /** Overall caption / title for the video */
  title: string;
  /** Total estimated duration in seconds */
  totalDurationSeconds: number;
  /** Fal.ai model recommended for this script */
  recommendedModel: VideoModel;
  createdAt: Date;
}

// ── Export ────────────────────────────────────────────────────────────────────

/** Supported direct-export destinations */
export type ExportTarget = "youtube_shorts" | "instagram_reels" | "tiktok" | "local";

/** Metadata for a requested export job */
export interface ExportJob {
  id: string;
  userId: string;
  generationId: string;
  target: ExportTarget;
  status: "pending" | "processing" | "completed" | "failed";
  /** External URL on the platform (YouTube, Instagram, etc.) after upload */
  platformUrl: string | null;
  /** Signed download URL for local export */
  downloadUrl: string | null;
  errorMessage: string | null;
  createdAt: Date;
  updatedAt: Date;
}

// ── Video Editor ──────────────────────────────────────────────────────────────

/** Status of a video editor project export */
export type VideoEditorProjectStatus = "draft" | "exporting" | "exported" | "failed";

/** Source type for a clip in the editor */
export type VideoEditorClipSource = "generated" | "uploaded";

/** A single clip on the editor timeline */
export interface VideoEditorClip {
  id: string;
  /** Where the video came from */
  sourceType: VideoEditorClipSource;
  /** Public URL of the source video */
  sourceUrl: string;
  /** Generation ID when sourceType === "generated" */
  generationId?: string;
  /** R2 key of the uploaded file when sourceType === "uploaded" */
  uploadedR2Key?: string;
  /** Total duration of the source video in seconds */
  durationSeconds: number;
  /** Trim start point in seconds (inclusive) */
  trimStart: number;
  /**
   * Trim end point in seconds (inclusive).
   * A value of 0 is a sentinel meaning "use the full source duration".
   * Any positive value is treated as the actual end time in seconds.
   */
  trimEnd: number;
  /** Position on the timeline (determines playback order) */
  order: number;
  /** Optional human-readable label */
  label?: string;
}

/** Text overlay drawn on top of the video */
export interface VideoEditorTextOverlay {
  id: string;
  text: string;
  /** Second (relative to the full edited timeline) when the overlay appears */
  startTime: number;
  /** Second when the overlay disappears */
  endTime: number;
  /** Vertical position on screen */
  position: "top" | "center" | "bottom";
  /** Font size in pixels */
  fontSize: number;
  /** CSS-compatible colour string e.g. "#FFFFFF" */
  color: string;
  /** Background colour (semi-transparent pill) */
  backgroundColor: string;
}

/** A complete video editor project */
export interface VideoEditorProject {
  id: string;
  userId: string;
  name: string;
  /** Ordered list of clips on the timeline */
  clips: VideoEditorClip[];
  /** Text overlays keyed by overlay ID */
  textOverlays: VideoEditorTextOverlay[];
  /** Optional background audio URL */
  backgroundAudioUrl: string | null;
  /** Background audio volume multiplier 0–1 */
  backgroundAudioVolume: number;
  /** Current project status */
  status: VideoEditorProjectStatus;
  /** Public URL of the final exported/rendered video */
  exportedVideoUrl: string | null;
  /** R2 key of the final exported video */
  exportedR2Key: string | null;
  /** Human-readable error on export failure */
  errorMessage: string | null;
  /** Total timeline duration in seconds (sum of trimmed clip durations) */
  totalDurationSeconds: number;
  createdAt: Date;
  updatedAt: Date;
}

// ── Community ─────────────────────────────────────────────────────────────────

/** A video surfaced in the community trending feed */
export interface CommunityVideo {
  id: string;
  /** Source generation ID */
  generationId: string;
  userId: string;
  displayName: string;
  /** Public video URL */
  videoUrl: string;
  thumbnailUrl: string | null;
  prompt: string;
  likes: number;
  remixCount: number;
  createdAt: Date;
}

/** A remix request — generates a new video based on an existing community video */
export interface RemixRequest {
  sourceGenerationId: string;
  prompt: string;
  durationSeconds: number;
  aspectRatio: "16:9" | "9:16" | "1:1";
}

// ── Admin / Price-Control Dashboard ──────────────────────────────────────────

/** Per-user metrics visible in the admin price-control dashboard */
export interface AdminUserMetrics {
  userId: string;
  email: string;
  tier: SubscriptionTier;
  /** Total revenue from this user (INR subscription + credit purchases) */
  revenueInr: number;
  /** Estimated GPU cost incurred for this user (USD) */
  gpuCostUsd: number;
  /** Revenue in USD equivalent */
  revenueUsd: number;
  /** Net margin (revenueUsd - gpuCostUsd) */
  netMarginUsd: number;
  /** Total videos generated this billing cycle */
  videosGenerated: number;
  /** Rate of failed scene retries (0–1) */
  retryRate: number;
  /** Total GPU seconds consumed this cycle */
  gpuUsageSeconds: number;
  /** Whether the auto-downgrade engine is currently active for this user */
  isDowngraded: boolean;
  updatedAt: Date;
}

/** Snapshot of platform-wide metrics for the dashboard */
export interface PlatformMetrics {
  totalRevenueInr: number;
  totalRevenueUsd: number;
  totalGpuCostUsd: number;
  totalNetMarginUsd: number;
  totalVideosGenerated: number;
  activeUsers: number;
  averageRetryRate: number;
  /** Number of users currently in auto-downgraded state */
  downgradedUsers: number;
  periodStart: Date;
  periodEnd: Date;
}

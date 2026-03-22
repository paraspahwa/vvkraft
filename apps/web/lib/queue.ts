import { Queue, Worker, type Job } from "bullmq";
import { bullmqConnection } from "./redis";

export const QUEUE_NAMES = {
  VIDEO_GENERATION: "video-generation",
  WEBHOOK_PROCESSING: "webhook-processing",
} as const;

export interface VideoGenerationJobData {
  generationId: string;
  userId: string;
  model: string;
  prompt: string;
  negativePrompt?: string;
  durationSeconds: number;
  resolution: string;
  aspectRatio: string;
  seed?: number;
  motionStrength?: number;
  referenceImageUrl?: string;
}

export interface WebhookJobData {
  type: "fal" | "razorpay";
  payload: Record<string, unknown>;
  signature?: string;
}

export const videoGenerationQueue = new Queue<VideoGenerationJobData>(
  QUEUE_NAMES.VIDEO_GENERATION,
  {
    connection: bullmqConnection,
    defaultJobOptions: {
      attempts: 3,
      backoff: {
        type: "exponential",
        delay: 5000,
      },
      removeOnComplete: { count: 100 },
      removeOnFail: { count: 50 },
    },
  }
);

export const webhookQueue = new Queue<WebhookJobData>(
  QUEUE_NAMES.WEBHOOK_PROCESSING,
  {
    connection: bullmqConnection,
    defaultJobOptions: {
      attempts: 5,
      backoff: {
        type: "exponential",
        delay: 2000,
      },
    },
  }
);

/**
 * Enqueue a video generation job with priority based on user tier
 */
export async function enqueueVideoGeneration(
  data: VideoGenerationJobData,
  priority: number = 10
): Promise<Job<VideoGenerationJobData>> {
  return videoGenerationQueue.add(`generate-${data.generationId}`, data, {
    priority,
    jobId: data.generationId,
  });
}

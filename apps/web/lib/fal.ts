import { fal } from "@fal-ai/client";

fal.config({
  credentials: process.env.FAL_KEY,
});

export { fal };

export interface FalVideoInput {
  prompt: string;
  negative_prompt?: string;
  num_frames?: number;
  fps?: number;
  width?: number;
  height?: number;
  seed?: number;
  motion_strength?: number;
  image_url?: string;
}

export interface FalVideoOutput {
  video: {
    url: string;
    content_type: string;
    file_name: string;
    file_size: number;
  };
  seed: number;
  timings?: Record<string, number>;
}

/**
 * Resolution dimensions for each resolution type
 */
export const RESOLUTION_DIMENSIONS: Record<string, { width: number; height: number }> = {
  "480p": { width: 854, height: 480 },
  "720p": { width: 1280, height: 720 },
  "1080p": { width: 1920, height: 1080 },
};

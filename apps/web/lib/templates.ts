/**
 * 1-click video template catalogue.
 *
 * Each template provides a pre-filled prompt, suggested model, and metadata
 * that the GenerationForm can consume directly. Users never see the underlying
 * model selection — they simply pick a template and hit Generate.
 */

import type { VideoTemplate } from "@videoforge/shared";

export const VIDEO_TEMPLATES: VideoTemplate[] = [
  // ── Motivational ────────────────────────────────────────────────────────────
  {
    id: "motivational-reel",
    name: "Motivational Reel",
    description:
      "High-energy motivational content with bold text overlays. Perfect for Instagram Reels and YouTube Shorts.",
    category: "motivational",
    thumbnailUrl: null,
    prompt:
      "Cinematic slow-motion athlete training montage at sunrise, dramatic lighting, motivational energy, fire and determination, bold dynamic camera angles, ultra-HD quality",
    negativePrompt: "blurry, low quality, dark, sad, static",
    aspectRatio: "9:16",
    durationSeconds: 10,
    suggestedModel: "fal-ai/wan/v2.2-a14b/text-to-video",
    minTier: "free",
    tags: ["fitness", "motivation", "reel", "shorts"],
    usageCount: 0,
    exampleVideoUrl: null,
  },
  {
    id: "gym-workout",
    name: "Gym Workout Video",
    description: "Dynamic gym and fitness content for social media creators.",
    category: "gym",
    thumbnailUrl: null,
    prompt:
      "Intense gym workout montage, weightlifting in dramatic lighting, sweat and determination, muscular athlete in modern gym, slow motion close-ups, cinematic color grade",
    negativePrompt: "cartoon, anime, blurry, outdoor",
    aspectRatio: "9:16",
    durationSeconds: 10,
    suggestedModel: "fal-ai/wan/v2.2-a14b/text-to-video",
    minTier: "free",
    tags: ["gym", "fitness", "workout", "shorts"],
    usageCount: 0,
    exampleVideoUrl: null,
  },
  // ── Crypto ──────────────────────────────────────────────────────────────────
  {
    id: "crypto-news-short",
    name: "Crypto News Short",
    description:
      "Fast-paced crypto market update video with digital-finance aesthetics.",
    category: "crypto",
    thumbnailUrl: null,
    prompt:
      "Futuristic cryptocurrency trading dashboard, glowing blockchain nodes, Bitcoin price charts surging upward, digital data streams, neon blue and gold, high-tech financial theme, cinematic",
    negativePrompt: "people, faces, blurry, low resolution",
    aspectRatio: "9:16",
    durationSeconds: 10,
    suggestedModel: "fal-ai/ltxv-13b-098-distilled",
    minTier: "creator",
    tags: ["crypto", "bitcoin", "finance", "news", "shorts"],
    usageCount: 0,
    exampleVideoUrl: null,
  },
  // ── Anime ───────────────────────────────────────────────────────────────────
  {
    id: "anime-edit",
    name: "Anime Edit",
    description:
      "Stylised anime-aesthetic video edit with vibrant colours and fast cuts.",
    category: "anime",
    thumbnailUrl: null,
    prompt:
      "Anime-style cinematic sequence, vibrant sakura blossoms falling, anime protagonist running through futuristic city, glowing energy effects, dramatic sky, Studio Ghibli inspiration, ultra-detailed",
    negativePrompt: "realistic, photographic, western cartoon, ugly",
    aspectRatio: "9:16",
    durationSeconds: 10,
    suggestedModel: "fal-ai/kling-video/v2.6/pro/text-to-video",
    minTier: "creator",
    tags: ["anime", "edit", "aesthetic", "shorts"],
    usageCount: 0,
    exampleVideoUrl: null,
  },
  // ── News ─────────────────────────────────────────────────────────────────────
  {
    id: "news-explainer",
    name: "News Explainer",
    description: "Clean, professional news-style explainer video.",
    category: "news",
    thumbnailUrl: null,
    prompt:
      "Professional news studio backdrop, clean modern broadcast aesthetic, blue and white color palette, data visualisation overlays, formal corporate atmosphere",
    negativePrompt: "dark, horror, blurry, text artifacts",
    aspectRatio: "16:9",
    durationSeconds: 10,
    suggestedModel: "fal-ai/wan/v2.2-a14b/text-to-video",
    minTier: "free",
    tags: ["news", "explainer", "corporate", "professional"],
    usageCount: 0,
    exampleVideoUrl: null,
  },
  // ── Product ──────────────────────────────────────────────────────────────────
  {
    id: "product-showcase",
    name: "Product Showcase",
    description: "Eye-catching product advertisement with studio lighting.",
    category: "product",
    thumbnailUrl: null,
    prompt:
      "Premium product showcase, minimalist white studio background, rotating product close-up, soft studio lighting, luxury branding aesthetic, 4K macro photography style",
    negativePrompt: "people, text, cluttered background, low quality",
    aspectRatio: "1:1",
    durationSeconds: 10,
    suggestedModel: "fal-ai/kling-video/v2.6/pro/text-to-video",
    minTier: "creator",
    tags: ["product", "ecommerce", "ad", "branding"],
    usageCount: 0,
    exampleVideoUrl: null,
  },
  // ── Travel ───────────────────────────────────────────────────────────────────
  {
    id: "travel-reel",
    name: "Travel Reel",
    description:
      "Beautiful travel destination reel for wanderlust content creators.",
    category: "travel",
    thumbnailUrl: null,
    prompt:
      "Stunning travel montage, golden hour over exotic landscape, aerial drone footage, vibrant local culture, cinematic wide shots, adventure and wanderlust, rich saturated colours",
    negativePrompt: "ugly, urban decay, pollution, blurry",
    aspectRatio: "9:16",
    durationSeconds: 10,
    suggestedModel: "fal-ai/wan/v2.2-a14b/text-to-video",
    minTier: "free",
    tags: ["travel", "wanderlust", "reel", "adventure"],
    usageCount: 0,
    exampleVideoUrl: null,
  },
  // ── Food ─────────────────────────────────────────────────────────────────────
  {
    id: "food-reel",
    name: "Food Reel",
    description: "Mouth-watering food content for recipe and restaurant creators.",
    category: "food",
    thumbnailUrl: null,
    prompt:
      "Mouth-watering food close-up, sizzling pan, steam rising, vibrant ingredients, professional food photography lighting, golden hour warmth, recipe reel aesthetic",
    negativePrompt: "raw uncooked, unappetising, blurry, dark",
    aspectRatio: "9:16",
    durationSeconds: 10,
    suggestedModel: "fal-ai/wan/v2.2-a14b/text-to-video",
    minTier: "free",
    tags: ["food", "recipe", "cooking", "reel"],
    usageCount: 0,
    exampleVideoUrl: null,
  },
  // ── Education ─────────────────────────────────────────────────────────────────
  {
    id: "edu-explainer",
    name: "Educational Explainer",
    description: "Engaging educational video with animated concept visuals.",
    category: "education",
    thumbnailUrl: null,
    prompt:
      "Engaging educational animation, colourful infographic-style visuals, floating 3D diagrams, clean white background, school and learning aesthetic, bright and cheerful",
    negativePrompt: "dark, scary, violent, photorealistic",
    aspectRatio: "16:9",
    durationSeconds: 10,
    suggestedModel: "fal-ai/ltxv-13b-098-distilled",
    minTier: "free",
    tags: ["education", "explainer", "learning", "animation"],
    usageCount: 0,
    exampleVideoUrl: null,
  },
];

/** Look up a template by its ID */
export function getTemplateById(id: string): VideoTemplate | undefined {
  return VIDEO_TEMPLATES.find((t) => t.id === id);
}

/** Get templates filtered by category */
export function getTemplatesByCategory(
  category: VideoTemplate["category"]
): VideoTemplate[] {
  return VIDEO_TEMPLATES.filter((t) => t.category === category);
}

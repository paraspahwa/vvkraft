/**
 * Auto-Script Generator router.
 *
 * Accepts a plain-English intent ("make gym video") and returns a structured
 * script broken into scenes with captions and visual descriptions. In
 * production this would call an LLM (e.g. gpt-4o-mini via fal.ai or OpenAI).
 * This implementation provides deterministic scene generation based on the
 * intent so the feature works without requiring a live LLM key.
 */

import { z } from "zod";
import { router, protectedProcedure } from "../trpc";
import { autoScriptRequestSchema } from "@videoforge/shared";
import type { GeneratedScript, ScriptScene } from "@videoforge/shared";
import { supabase } from "../../lib/supabase";

// ── Keyword → scene style mapping ────────────────────────────────────────────

interface StyleConfig {
  style: string;
  sceneTemplates: string[];
  captionTemplates: string[];
  musicMood: string;
  model: GeneratedScript["recommendedModel"];
}

const STYLE_MAP: Array<{ keywords: string[]; config: StyleConfig }> = [
  {
    keywords: ["gym", "workout", "fitness", "exercise", "muscle", "training"],
    config: {
      style: "Fitness Motivation",
      sceneTemplates: [
        "Slow-motion athlete performing {action} in a modern gym, dramatic lighting",
        "Close-up of determined face dripping sweat, intense focus, gym background",
        "Cinematic wide shot of gym floor, weights rack, motivational atmosphere",
        "Overhead view of athlete completing {action}, powerful energy",
        "Sunset silhouette of fit person in athletic pose, inspirational mood",
      ],
      captionTemplates: [
        "No excuses. Just results.",
        "Every rep counts.",
        "Push your limits.",
        "Train hard. Live free.",
        "Your only competition is you.",
      ],
      musicMood: "energetic",
      model: "fal-ai/wan/v2.2-a14b/text-to-video",
    },
  },
  {
    keywords: ["crypto", "bitcoin", "blockchain", "nft", "defi", "finance", "trading"],
    config: {
      style: "Crypto Finance",
      sceneTemplates: [
        "Glowing cryptocurrency price charts surging upward, neon blue data streams",
        "Futuristic blockchain network nodes connecting, digital gold animation",
        "Bitcoin coin spinning in space with financial data overlay, cinematic",
        "Trader at multiple screens, charts glowing green, high-tech environment",
        "Digital wallet exploding with coins, abundance and wealth visual",
      ],
      captionTemplates: [
        "The future of money is here.",
        "Decentralised. Unstoppable.",
        "Buy the dip. Hold strong.",
        "Web3 is just getting started.",
        "Your keys. Your crypto.",
      ],
      musicMood: "futuristic",
      model: "fal-ai/ltxv-13b-098-distilled",
    },
  },
  {
    keywords: ["anime", "manga", "otaku", "cosplay", "japan"],
    config: {
      style: "Anime Aesthetic",
      sceneTemplates: [
        "Anime-style protagonist running through sakura-lined streets, petals falling",
        "Dramatic anime sky at sunset, silhouette of hero on rooftop",
        "Vibrant anime battle sequence with energy beams and dramatic poses",
        "Cosy anime café scene, warm amber lighting, steam rising from coffee",
        "Epic anime transformation sequence with glowing aura and determined eyes",
      ],
      captionTemplates: [
        "The story only starts now.",
        "Power beyond imagination.",
        "Believe in yourself.",
        "Your arc has just begun.",
        "Level up.",
      ],
      musicMood: "epic",
      model: "fal-ai/kling-video/v2.6/pro/text-to-video",
    },
  },
  {
    keywords: ["food", "cooking", "recipe", "restaurant", "chef", "eat"],
    config: {
      style: "Food Content",
      sceneTemplates: [
        "Sizzling ingredients in a pan, steam rising, close-up macro shot",
        "Chef's hands delicately plating a dish, minimalist fine-dining aesthetic",
        "Slow-motion pour of sauce over perfectly cooked steak, golden lighting",
        "Overhead flat-lay of fresh ingredients arranged artfully on wooden board",
        "Steaming bowl of noodles, chopsticks lifting, rich broth close-up",
      ],
      captionTemplates: [
        "Made with love.",
        "Simple. Delicious. Perfect.",
        "Taste the difference.",
        "Food that feeds the soul.",
        "Every bite tells a story.",
      ],
      musicMood: "warm",
      model: "fal-ai/wan/v2.2-a14b/text-to-video",
    },
  },
  {
    keywords: ["travel", "adventure", "explore", "trip", "vacation", "destination"],
    config: {
      style: "Travel Adventure",
      sceneTemplates: [
        "Aerial drone shot over stunning tropical coastline, crystal clear water",
        "Traveller standing on mountain peak at sunrise, arms outstretched",
        "Bustling local market with vibrant colours, cultural textures",
        "Time-lapse of stars over desert landscape, Milky Way visible",
        "Close-up of passport and map on rustic table, wanderlust mood",
      ],
      captionTemplates: [
        "The world is yours to explore.",
        "Not all those who wander are lost.",
        "Collect moments, not things.",
        "Adventure awaits.",
        "Go further.",
      ],
      musicMood: "uplifting",
      model: "fal-ai/wan/v2.2-a14b/text-to-video",
    },
  },
];

const DEFAULT_CONFIG: StyleConfig = {
  style: "Creative",
  sceneTemplates: [
    "Cinematic establishing shot with dramatic lighting and composition",
    "Close-up detail shot with shallow depth of field, bokeh background",
    "Dynamic movement shot with motion blur and energy",
    "Overhead aerial perspective revealing stunning scenery",
    "Golden hour silhouette with warm atmospheric lighting",
  ],
  captionTemplates: [
    "Create something amazing.",
    "The world is watching.",
    "Make your mark.",
    "This is your moment.",
    "Tell your story.",
  ],
  musicMood: "neutral",
  model: "fal-ai/wan/v2.2-a14b/text-to-video",
};

function detectStyle(intent: string): StyleConfig {
  const lower = intent.toLowerCase();
  for (const { keywords, config } of STYLE_MAP) {
    if (keywords.some((kw) => lower.includes(kw))) {
      return config;
    }
  }
  return DEFAULT_CONFIG;
}

function buildScene(
  index: number,
  config: StyleConfig,
  totalScenes: number,
  sceneDuration: number,
  intent: string
): ScriptScene {
  const template =
    config.sceneTemplates[index % config.sceneTemplates.length] ?? config.sceneTemplates[0]!;
  const caption =
    config.captionTemplates[index % config.captionTemplates.length] ??
    config.captionTemplates[0]!;

  // Replace {action} placeholder with a verb derived from intent
  const actionWord = intent.split(" ").find((w) => w.length > 3) ?? "moving";
  const visualDescription = template.replace("{action}", actionWord);

  return {
    sceneIndex: index,
    visualDescription,
    caption,
    durationSeconds: sceneDuration,
    musicMood: config.musicMood,
  };
}

// ── Router ────────────────────────────────────────────────────────────────────

export const autoScriptRouter = router({
  /**
   * Generate a structured script from a plain-English intent.
   * Returns a `GeneratedScript` with per-scene visual descriptions and captions.
   * The script can then be fed directly into the generation pipeline.
   */
  generate: protectedProcedure
    .input(autoScriptRequestSchema)
    .mutation(async ({ ctx, input }) => {
      const { userId } = ctx;

      const config = detectStyle(input.userIntent);
      const sceneDuration = Math.round(input.targetDurationSeconds / input.numScenes);

      const scenes: ScriptScene[] = Array.from({ length: input.numScenes }, (_, i) =>
        buildScene(i, config, input.numScenes, sceneDuration, input.userIntent)
      );

      const title = `${config.style}: ${input.userIntent
        .split(" ")
        .slice(0, 5)
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ")}`;

      const script: Omit<GeneratedScript, "id"> = {
        userId,
        userIntent: input.userIntent,
        style: config.style,
        aspectRatio: input.aspectRatio,
        scenes,
        title,
        totalDurationSeconds: input.targetDurationSeconds,
        recommendedModel: config.model,
        createdAt: new Date(),
      };

      // Persist to Supabase for later retrieval
      const { data: ref, error } = await supabase
        .from("generated_scripts")
        .insert({
          user_id: userId,
          user_intent: script.userIntent,
          style: script.style,
          aspect_ratio: script.aspectRatio,
          scenes: script.scenes,
          title: script.title,
          total_duration_seconds: script.totalDurationSeconds,
          recommended_model: script.recommendedModel,
        })
        .select("id")
        .single();

      if (error) throw new Error(error.message);

      return { id: ref.id, ...script };
    }),

  /** List a user's previously generated scripts */
  list: protectedProcedure
    .input(z.object({ limit: z.number().int().min(1).max(20).default(10) }))
    .query(async ({ ctx, input }) => {
      const { data, error } = await supabase
        .from("generated_scripts")
        .select("*")
        .eq("user_id", ctx.userId)
        .order("created_at", { ascending: false })
        .limit(input.limit);

      if (error) throw new Error(error.message);

      return (data ?? []).map((row) => ({
        id: row["id"],
        userId: row["user_id"],
        userIntent: row["user_intent"],
        style: row["style"],
        aspectRatio: row["aspect_ratio"],
        scenes: row["scenes"],
        title: row["title"],
        totalDurationSeconds: row["total_duration_seconds"],
        recommendedModel: row["recommended_model"],
        createdAt: new Date(row["created_at"]),
      }));
    }),
});

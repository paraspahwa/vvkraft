"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Wand2, Clock, Monitor, Shuffle, Lock, Zap, ChevronRight } from "lucide-react";
import { Button, Card, CardContent, CardHeader, CardTitle, Input, Textarea } from "@videoforge/ui";
import { longVideoRequestSchema, type LongVideoRequestInput } from "@videoforge/shared";
import { trpc } from "@/lib/trpc/client";
import { useGeneration } from "@/hooks/use-generation";
import Link from "next/link";
import type { Generation } from "@videoforge/shared";

interface LongVideoFormProps {
  onSuccess?: (generationId: string) => void;
}

const DURATION_PRESETS = [
  { value: 30 as const, label: "30 sec", description: "Quick story" },
  { value: 60 as const, label: "1 min", description: "Short reel" },
  { value: 120 as const, label: "2 min", description: "Full scene" },
];

const ASPECT_RATIOS = [
  { value: "16:9" as const, label: "16:9 Landscape" },
  { value: "9:16" as const, label: "9:16 Portrait" },
  { value: "1:1" as const, label: "1:1 Square" },
];

const LONG_VIDEO_MODELS = [
  {
    id: "fal-ai/longcat-video/distilled/text-to-video/480p" as const,
    name: "Longcat 480p",
    description: "Fast & affordable — 480p",
    badge: "Creator+",
  },
  {
    id: "fal-ai/longcat-video/distilled/text-to-video/720p" as const,
    name: "Longcat 720p",
    description: "Higher quality — 720p",
    badge: "Pro+",
  },
  {
    id: "fal-ai/ltxv-13b-098-distilled" as const,
    name: "LTXV 13B",
    description: "Premium quality — up to 1080p",
    badge: "Pro+",
  },
  {
    id: "fal-ai/krea-wan-14b/text-to-video" as const,
    name: "Krea WAN 14B",
    description: "Studio-grade cinematic quality",
    badge: "Studio",
  },
];

export function LongVideoForm({ onSuccess }: LongVideoFormProps) {
  const [selectedDuration, setSelectedDuration] = useState<30 | 60 | 120>(30);
  const { data: user } = trpc.user.me.useQuery();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<LongVideoRequestInput>({
    resolver: zodResolver(longVideoRequestSchema),
    defaultValues: {
      prompt: "",
      durationSeconds: 30,
      aspectRatio: "16:9",
    },
  });

  const aspectRatio = watch("aspectRatio");
  const selectedModel = watch("model");

  const { data: estimate } = trpc.generation.estimateLongVideoCost.useQuery(
    { durationSeconds: selectedDuration },
    { enabled: !!user && user.tier !== "free" }
  );

  const createLongVideoMutation = trpc.generation.createLongVideo.useMutation();

  const isFreeTier = user?.tier === "free";

  const onSubmit = async (data: LongVideoRequestInput) => {
    const generation = await createLongVideoMutation.mutateAsync(data);
    onSuccess?.(generation.id);
  };

  const handleDurationSelect = (duration: 30 | 60 | 120) => {
    setSelectedDuration(duration);
    setValue("durationSeconds", duration);
  };

  // Show upgrade prompt for free users
  if (isFreeTier) {
    return (
      <div className="space-y-6">
        <Card className="border-accent-400/30">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center py-8 space-y-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-accent-400/10 border border-accent-400/30">
                <Lock className="h-6 w-6 text-accent-400" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-white">Paid Feature</h3>
                <p className="text-sm text-gray-400 max-w-sm">
                  Long video generation (30s, 1min, 2min) is available on paid plans. Upgrade to
                  Creator or higher to unlock this feature.
                </p>
              </div>
              <div className="grid grid-cols-1 gap-3 w-full max-w-sm pt-2">
                {[
                  { tier: "Creator", price: "$19/mo", duration: "Up to 60 seconds" },
                  { tier: "Pro", price: "$49/mo", duration: "Up to 2 minutes" },
                  { tier: "Studio", price: "$149/mo", duration: "Up to 2 minutes + best models" },
                ].map((plan) => (
                  <div
                    key={plan.tier}
                    className="flex items-center justify-between rounded-lg border border-surface-border bg-surface-card px-4 py-3"
                  >
                    <div className="text-left">
                      <p className="text-sm font-medium text-white">{plan.tier}</p>
                      <p className="text-xs text-gray-400">{plan.duration}</p>
                    </div>
                    <span className="text-sm font-bold text-accent-400">{plan.price}</span>
                  </div>
                ))}
              </div>
              <Link href="/pricing">
                <Button variant="gradient" size="lg" className="mt-2">
                  <Zap className="h-4 w-4" />
                  Upgrade Now
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Preview of what the feature looks like — disabled */}
        <div className="relative opacity-40 pointer-events-none select-none">
          <div className="absolute inset-0 z-10 flex items-center justify-center rounded-xl bg-black/20" />
          <PreviewForm />
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Main prompt */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Describe your long video</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            {...register("prompt")}
            placeholder="A sweeping cinematic journey through an ancient city at golden hour, revealing its history and architecture..."
            className="min-h-[120px] resize-none"
            error={errors.prompt?.message}
          />
          <Textarea
            {...register("negativePrompt")}
            placeholder="Negative prompt (optional): blurry, low quality, artifacts..."
            className="min-h-[60px] resize-none text-sm"
            label="Negative Prompt"
          />
        </CardContent>
      </Card>

      {/* Duration presets */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-1.5 text-base">
            <Clock className="h-4 w-4" />
            Duration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-3">
            {DURATION_PRESETS.map((preset) => {
              const isDisabled =
                user?.tier === "creator" && preset.value === 120;
              return (
                <button
                  key={preset.value}
                  type="button"
                  disabled={isDisabled}
                  onClick={() => handleDurationSelect(preset.value)}
                  className={`relative rounded-xl border p-4 text-left transition-all ${
                    selectedDuration === preset.value
                      ? "border-accent-400 bg-accent-400/10"
                      : "border-surface-border hover:border-gray-500"
                  } ${isDisabled ? "opacity-40 cursor-not-allowed" : ""}`}
                >
                  {isDisabled && (
                    <span className="absolute right-2 top-2">
                      <Lock className="h-3 w-3 text-gray-500" />
                    </span>
                  )}
                  <div
                    className={`text-lg font-bold ${
                      selectedDuration === preset.value ? "text-accent-400" : "text-white"
                    }`}
                  >
                    {preset.label}
                  </div>
                  <div className="text-xs text-gray-400">{preset.description}</div>
                  {isDisabled && (
                    <div className="text-xs text-yellow-500 mt-1">Pro+ required</div>
                  )}
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Model selection */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">AI Model</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {LONG_VIDEO_MODELS.map((model) => {
              const isModelDisabled =
                (model.badge === "Pro+" && user?.tier === "creator") ||
                (model.badge === "Studio" && user?.tier !== "studio");
              return (
                <button
                  key={model.id}
                  type="button"
                  disabled={isModelDisabled}
                  onClick={() => !isModelDisabled && setValue("model", model.id)}
                  className={`w-full flex items-center justify-between rounded-lg border px-4 py-3 text-left transition-all ${
                    selectedModel === model.id
                      ? "border-accent-400 bg-accent-400/10"
                      : "border-surface-border hover:border-gray-500"
                  } ${isModelDisabled ? "opacity-40 cursor-not-allowed" : ""}`}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-sm font-medium ${
                          selectedModel === model.id ? "text-accent-400" : "text-white"
                        }`}
                      >
                        {model.name}
                      </span>
                      <span className="rounded-full bg-surface-hover px-2 py-0.5 text-xs text-gray-400">
                        {model.badge}
                      </span>
                    </div>
                    <span className="text-xs text-gray-400">{model.description}</span>
                  </div>
                  {isModelDisabled && <Lock className="h-3.5 w-3.5 text-gray-500 flex-shrink-0" />}
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Aspect ratio */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-1.5 text-base">
            <Monitor className="h-4 w-4" />
            Aspect Ratio
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-2">
            {ASPECT_RATIOS.map((ratio) => (
              <button
                key={ratio.value}
                type="button"
                onClick={() => setValue("aspectRatio", ratio.value)}
                className={`rounded-lg border px-3 py-2 text-xs font-medium transition-all ${
                  aspectRatio === ratio.value
                    ? "border-accent-400 bg-accent-400/10 text-accent-400"
                    : "border-surface-border text-gray-400 hover:border-gray-500 hover:text-white"
                }`}
              >
                {ratio.label}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Cost estimate + submit */}
      <div className="flex items-center justify-between gap-4">
        <div className="text-sm text-gray-400 space-y-0.5">
          {estimate?.available ? (
            <>
              <div>
                <span>Cost: </span>
                <span className="font-bold text-accent-400">{estimate.creditsCost} credits</span>
              </div>
              <div className="text-xs text-gray-500">
                Model: {estimate.model} · {estimate.effectiveResolution}
              </div>
              {!estimate.hasEnoughCredits && (
                <div className="text-red-400 text-xs">
                  Insufficient credits.{" "}
                  <Link href="/pricing" className="underline hover:text-red-300">
                    Buy more
                  </Link>
                </div>
              )}
            </>
          ) : estimate?.reason ? (
            <span className="text-yellow-400 text-xs">{estimate.reason}</span>
          ) : null}
        </div>

        <Button
          type="submit"
          variant="gradient"
          size="lg"
          loading={createLongVideoMutation.isPending}
          disabled={
            createLongVideoMutation.isPending ||
            (estimate?.available === true && !estimate.hasEnoughCredits)
          }
        >
          <Wand2 className="h-4 w-4" />
          {createLongVideoMutation.isPending ? "Generating..." : "Generate Long Video"}
        </Button>
      </div>

      {createLongVideoMutation.error && (
        <p className="text-sm text-red-400">{createLongVideoMutation.error.message}</p>
      )}
    </form>
  );
}

/** Blurred preview shown to free-tier users */
function PreviewForm() {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Describe your long video</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-24 rounded-lg bg-surface-hover" />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Duration</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-3">
            {["30 sec", "1 min", "2 min"].map((label) => (
              <div
                key={label}
                className="rounded-xl border border-surface-border p-4 text-left"
              >
                <div className="text-lg font-bold text-white">{label}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

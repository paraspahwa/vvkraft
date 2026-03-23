"use client";

import { useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Wand2,
  Clock,
  Monitor,
  Lock,
  Zap,
  ChevronRight,
  ChevronDown,
  Info,
} from "lucide-react";
import { Button, Card, CardContent, CardHeader, CardTitle, Textarea } from "@videoforge/ui";
import {
  longVideoRequestSchema,
  type LongVideoRequestInput,
  getLongVideoModelsForTier,
  getModelsForTier,
  type VideoModelInfo,
} from "@videoforge/shared";
import { trpc } from "@/lib/trpc/client";
import Link from "next/link";

interface LongVideoFormProps {
  onSuccess?: (generationId: string) => void;
}

const DURATION_PRESETS = [
  { value: 30 as const, label: "30 sec", description: "Quick story" },
  { value: 60 as const, label: "1 min", description: "Short reel" },
  { value: 120 as const, label: "2 min", description: "Full scene" },
];

const ASPECT_RATIOS = [
  { value: "16:9" as const, label: "16:9" },
  { value: "9:16" as const, label: "9:16" },
  { value: "1:1" as const, label: "1:1" },
];

const TIER_BADGE: Record<string, { label: string; color: string }> = {
  free:    { label: "Free",    color: "bg-gray-500/15 text-gray-400" },
  creator: { label: "Creator", color: "bg-blue-500/15 text-blue-400" },
  pro:     { label: "Pro",     color: "bg-accent-400/15 text-accent-400" },
  studio:  { label: "Studio",  color: "bg-yellow-500/15 text-yellow-400" },
};

export function LongVideoForm({ onSuccess }: LongVideoFormProps) {
  const [selectedDuration, setSelectedDuration] = useState<30 | 60 | 120>(30);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(["Longcat", "LTXV / LTX"])
  );
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
    { durationSeconds: selectedDuration, model: selectedModel },
    { enabled: !!user && user.tier !== "free" }
  );

  const createLongVideoMutation = trpc.generation.createLongVideo.useMutation();

  const isFreeTier = user?.tier === "free";

  // Build grouped model catalog from shared package
  const groupedModels = useMemo(() => {
    // Show all long-video models; studio users see everything, others see what they can use
    const allModels = getLongVideoModelsForTier("studio"); // full catalog for display
    const tierModels = user ? getLongVideoModelsForTier(user.tier) : [];
    const tierModelIds = new Set(tierModels.map((m) => m.id));

    const groups: Record<string, { model: VideoModelInfo; locked: boolean }[]> = {};
    for (const model of allModels) {
      if (!groups[model.category]) groups[model.category] = [];
      groups[model.category]!.push({ model, locked: !tierModelIds.has(model.id) });
    }
    return groups;
  }, [user]);

  const onSubmit = async (data: LongVideoRequestInput) => {
    const generation = await createLongVideoMutation.mutateAsync(data);
    onSuccess?.(generation.id);
  };

  const handleDurationSelect = (duration: 30 | 60 | 120) => {
    setSelectedDuration(duration);
    setValue("durationSeconds", duration);
  };

  const toggleCategory = (category: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(category)) next.delete(category);
      else next.add(category);
      return next;
    });
  };

  // Free-tier gate
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
                  Creator or higher to unlock this feature and access{" "}
                  {getLongVideoModelsForTier("studio").length}+ AI models.
                </p>
              </div>
              <div className="grid grid-cols-1 gap-3 w-full max-w-sm pt-2">
                {([
                  { tier: "Creator", price: "$19/mo", duration: `Up to 60s · ${getLongVideoModelsForTier("creator").length} models` },
                  { tier: "Pro",     price: "$49/mo",  duration: `Up to 2 min · ${getLongVideoModelsForTier("pro").length} models` },
                  { tier: "Studio",  price: "$149/mo", duration: `Up to 2 min · all ${getLongVideoModelsForTier("studio").length} models` },
                ] as const).map((plan) => (
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

        {/* Blurred preview */}
        <div className="relative opacity-40 pointer-events-none select-none">
          <div className="absolute inset-0 z-10 rounded-xl bg-black/20" />
          <PreviewSkeleton />
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Prompt */}
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
              const isDisabled = user?.tier === "creator" && preset.value === 120;
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

      {/* Model selection — grouped by category */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">AI Model</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {Object.entries(groupedModels).map(([category, models]) => (
            <div key={category} className="rounded-lg border border-surface-border overflow-hidden">
              {/* Category header */}
              <button
                type="button"
                onClick={() => toggleCategory(category)}
                className="flex w-full items-center justify-between px-4 py-2.5 bg-surface-hover/40 hover:bg-surface-hover transition-colors text-left"
              >
                <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                  {category}
                  <span className="ml-2 text-gray-600 normal-case tracking-normal font-normal">
                    ({models.filter((m) => !m.locked).length}/{models.length} available)
                  </span>
                </span>
                <ChevronDown
                  className={`h-3.5 w-3.5 text-gray-500 transition-transform ${
                    expandedCategories.has(category) ? "rotate-180" : ""
                  }`}
                />
              </button>

              {/* Model list */}
              {expandedCategories.has(category) && (
                <div className="divide-y divide-surface-border">
                  {models.map(({ model, locked }) => {
                    const badge = TIER_BADGE[model.minTier]!;
                    const isSelected = selectedModel === model.id;
                    return (
                      <button
                        key={model.id}
                        type="button"
                        disabled={locked}
                        onClick={() => !locked && setValue("model", model.id as LongVideoRequestInput["model"])}
                        className={`w-full flex items-start gap-3 px-4 py-3 text-left transition-colors ${
                          isSelected
                            ? "bg-accent-400/10"
                            : locked
                            ? "opacity-50 cursor-not-allowed bg-transparent"
                            : "hover:bg-surface-hover/30"
                        }`}
                      >
                        {/* Selection indicator */}
                        <div
                          className={`mt-0.5 flex-shrink-0 h-4 w-4 rounded-full border-2 transition-colors ${
                            isSelected
                              ? "border-accent-400 bg-accent-400"
                              : "border-gray-600"
                          }`}
                        />

                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span
                              className={`text-sm font-medium ${
                                isSelected ? "text-accent-400" : "text-white"
                              }`}
                            >
                              {model.displayName}
                            </span>
                            <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${badge.color}`}>
                              {badge.label}
                            </span>
                            {model.hasAudio && (
                              <span className="rounded-full bg-green-500/15 px-1.5 py-0.5 text-[10px] font-medium text-green-400">
                                Audio
                              </span>
                            )}
                            {model.isAvatarModel && (
                              <span className="rounded-full bg-purple-500/15 px-1.5 py-0.5 text-[10px] font-medium text-purple-400">
                                Avatar
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-400 mt-0.5 truncate">{model.description}</p>
                          <p className="text-xs text-gray-500 mt-0.5">{model.pricingNote}</p>
                        </div>

                        {locked && <Lock className="mt-0.5 h-3.5 w-3.5 text-gray-600 flex-shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          ))}

          {!selectedModel && (
            <p className="text-xs text-gray-500 flex items-center gap-1 pt-1">
              <Info className="h-3 w-3" />
              No model selected — your plan's default will be used automatically.
            </p>
          )}
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
                <span>Est. cost: </span>
                <span className="font-bold text-accent-400">{estimate.creditsCost} credits</span>
              </div>
              {estimate.model && (
                <div className="text-xs text-gray-500">
                  Model: {estimate.model} · {estimate.effectiveResolution}
                </div>
              )}
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

/** Blurred skeleton shown to free-tier users */
function PreviewSkeleton() {
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
              <div key={label} className="rounded-xl border border-surface-border p-4">
                <div className="text-lg font-bold text-white">{label}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">AI Model</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {["Longcat", "LTXV / LTX", "Wan / Krea"].map((cat) => (
              <div key={cat} className="h-10 rounded-lg bg-surface-hover" />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


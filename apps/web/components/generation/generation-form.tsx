"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Wand2, Settings2, Clock, Monitor, Shuffle } from "lucide-react";
import { Button, Card, CardContent, CardHeader, CardTitle, Input, Textarea } from "@videoforge/ui";
import { generationRequestSchema, type GenerationRequestInput } from "@videoforge/shared";
import { trpc } from "@/lib/trpc/client";
import { useGeneration } from "@/hooks/use-generation";

interface GenerationFormProps {
  onSuccess?: (generationId: string) => void;
}

const ASPECT_RATIOS = [
  { value: "16:9", label: "16:9 Landscape" },
  { value: "9:16", label: "9:16 Portrait" },
  { value: "1:1", label: "1:1 Square" },
] as const;

export function GenerationForm({ onSuccess }: GenerationFormProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const { generate, isGenerating, error } = useGeneration();
  const { data: user } = trpc.user.me.useQuery();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<GenerationRequestInput>({
    resolver: zodResolver(generationRequestSchema),
    defaultValues: {
      prompt: "",
      durationSeconds: 5,
      aspectRatio: "16:9",
    },
  });

  const duration = watch("durationSeconds");
  const aspectRatio = watch("aspectRatio");

  // Estimate cost
  const { data: estimate } = trpc.generation.estimateCost.useQuery(
    { durationSeconds: duration },
    { enabled: !!duration }
  );

  const onSubmit = async (data: GenerationRequestInput) => {
    const generation = await generate(data);
    onSuccess?.(generation.id);
  };

  const randomSeed = () => {
    setValue("seed", Math.floor(Math.random() * 2147483647));
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Main prompt */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Describe your video</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            {...register("prompt")}
            placeholder="A cinematic shot of a lone astronaut walking across a glowing alien landscape, epic lighting, 4K quality..."
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

      {/* Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Settings</CardTitle>
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center gap-1 text-xs text-gray-400 hover:text-white transition-colors"
            >
              <Settings2 className="h-3 w-3" />
              {showAdvanced ? "Hide" : "Show"} advanced
            </button>
          </div>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* Duration */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-1.5 text-sm font-medium text-gray-300">
                <Clock className="h-3.5 w-3.5" />
                Duration
              </label>
              <span className="text-sm font-bold text-accent-400">{duration}s</span>
            </div>
            <input
              type="range"
              min={1}
              max={user?.tier === "free" ? 5 : user?.tier === "creator" ? 10 : 15}
              step={1}
              {...register("durationSeconds", { valueAsNumber: true })}
              className="w-full accent-accent-400"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>1s</span>
              <span>{user?.tier === "free" ? "5s (Free limit)" : user?.tier === "creator" ? "10s" : "15s"}</span>
            </div>
          </div>

          {/* Aspect ratio */}
          <div className="space-y-2">
            <label className="flex items-center gap-1.5 text-sm font-medium text-gray-300">
              <Monitor className="h-3.5 w-3.5" />
              Aspect Ratio
            </label>
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
          </div>

          {/* Advanced options */}
          {showAdvanced && (
            <div className="space-y-4 pt-2 border-t border-surface-border">
              <div className="flex items-end gap-2">
                <Input
                  label="Seed"
                  type="number"
                  {...register("seed", { valueAsNumber: true })}
                  placeholder="Random"
                  helperText="Set for reproducible results"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={randomSeed}
                  title="Randomize seed"
                >
                  <Shuffle className="h-4 w-4" />
                </Button>
              </div>

              {user?.tier !== "free" && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-300">Motion Strength</label>
                    <span className="text-sm text-accent-400">{watch("motionStrength") ?? 0.5}</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.05}
                    {...register("motionStrength", { valueAsNumber: true })}
                    defaultValue={0.5}
                    className="w-full accent-accent-400"
                  />
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Cost estimate + submit */}
      <div className="flex items-center justify-between">
        {estimate && (
          <div className="text-sm text-gray-400">
            <span>Cost: </span>
            <span className="font-bold text-accent-400">{estimate.creditsCost} credits</span>
            {!estimate.hasEnoughCredits && (
              <span className="ml-2 text-red-400 text-xs">Insufficient credits</span>
            )}
          </div>
        )}
        {error && (
          <p className="text-sm text-red-400">{error.message}</p>
        )}
        <Button
          type="submit"
          variant="gradient"
          size="lg"
          loading={isGenerating}
          disabled={estimate ? !estimate.hasEnoughCredits : false}
          className="ml-auto"
        >
          <Wand2 className="h-4 w-4" />
          {isGenerating ? "Generating..." : "Generate Video"}
        </Button>
      </div>
    </form>
  );
}

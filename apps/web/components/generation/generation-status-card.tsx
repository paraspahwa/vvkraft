"use client";

import { useEffect } from "react";
import { CheckCircle2, XCircle, Clock, Loader2, Play } from "lucide-react";
import { Card, CardContent, Progress, Badge } from "@videoforge/ui";
import { trpc } from "@/lib/trpc/client";
import type { Generation } from "@videoforge/shared";

interface GenerationStatusCardProps {
  generationId: string;
  onComplete?: (generation: Generation) => void;
}

const STATUS_CONFIG = {
  pending: { label: "Queued", color: "warning" as const, icon: Clock, progress: 5 },
  queued: { label: "In Queue", color: "warning" as const, icon: Clock, progress: 10 },
  processing: { label: "Processing", color: "default" as const, icon: Loader2, progress: 60 },
  completed: { label: "Complete", color: "success" as const, icon: CheckCircle2, progress: 100 },
  failed: { label: "Failed", color: "destructive" as const, icon: XCircle, progress: 100 },
  cancelled: { label: "Cancelled", color: "outline" as const, icon: XCircle, progress: 100 },
};

export function GenerationStatusCard({ generationId, onComplete }: GenerationStatusCardProps) {
  const { data: generation, error } = trpc.generation.getById.useQuery(
    { id: generationId },
    {
      // Poll every 3 seconds while in-progress
      refetchInterval: (query) => {
        const status = query.state.data?.status;
        if (!status || ["completed", "failed", "cancelled"].includes(status)) return false;
        return 3000;
      },
    }
  );

  useEffect(() => {
    if (generation?.status === "completed") {
      onComplete?.(generation);
    }
  }, [generation, onComplete]);

  if (error) {
    return (
      <Card className="border-red-500/20">
        <CardContent className="p-4">
          <p className="text-sm text-red-400">Failed to load generation status</p>
        </CardContent>
      </Card>
    );
  }

  if (!generation) {
    return (
      <Card>
        <CardContent className="p-4">
          <div className="animate-pulse space-y-3">
            <div className="h-4 w-1/3 rounded bg-surface-border" />
            <div className="h-2 rounded bg-surface-border" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const config = STATUS_CONFIG[generation.status];
  const Icon = config.icon;
  const isAnimated = ["pending", "queued", "processing"].includes(generation.status);

  return (
    <Card className={generation.status === "failed" ? "border-red-500/20" : ""}>
      <CardContent className="p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon
              className={`h-4 w-4 ${
                generation.status === "processing" ? "animate-spin text-accent-400" :
                generation.status === "completed" ? "text-green-400" :
                generation.status === "failed" ? "text-red-400" : "text-gray-400"
              }`}
            />
            <span className="text-sm font-medium text-white">{config.label}</span>
          </div>
          <Badge variant={config.color}>{generation.status}</Badge>
        </div>

        <Progress value={config.progress} animated={isAnimated} />

        <p className="text-xs text-gray-400 line-clamp-2">{generation.prompt}</p>

        <div className="flex items-center gap-4 text-xs text-gray-500">
          <span>{generation.durationSeconds}s</span>
          <span>{generation.resolution}</span>
          <span>{generation.creditsCost} credits</span>
        </div>

        {generation.status === "completed" && generation.videoUrl && (
          <a
            href={generation.videoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-sm text-accent-400 hover:text-accent-300 transition-colors"
          >
            <Play className="h-3.5 w-3.5" />
            View Video
          </a>
        )}

        {generation.status === "failed" && generation.errorMessage && (
          <p className="text-xs text-red-400 bg-red-500/5 rounded p-2">
            {generation.errorMessage}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

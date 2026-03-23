"use client";

import { useEffect, useRef, useState } from "react";
import {
  CheckCircle2,
  XCircle,
  Clock,
  Loader2,
  Download,
  Volume2,
  VolumeX,
  Sparkles,
} from "lucide-react";
import { Card, CardContent, Progress, Badge } from "@videoforge/ui";
import { trpc } from "@/lib/trpc/client";
import type { VideoUpscaleJob } from "@videoforge/shared";

interface UpscaleStatusCardProps {
  jobId: string;
  onComplete?: (job: VideoUpscaleJob) => void;
}

type LucideIconComponent = typeof Clock;

const STATUS_CONFIG: Record<
  VideoUpscaleJob["status"],
  { label: string; color: "default" | "success" | "destructive" | "warning" | "outline" | "secondary"; icon: LucideIconComponent; progress: number }
> = {
  pending: { label: "Queued", color: "warning", icon: Clock, progress: 5 },
  queued: { label: "In Queue", color: "warning", icon: Clock, progress: 10 },
  processing: { label: "Processing", color: "default", icon: Loader2, progress: 60 },
  completed: { label: "Complete", color: "success", icon: CheckCircle2, progress: 100 },
  failed: { label: "Failed", color: "destructive", icon: XCircle, progress: 100 },
};

export function UpscaleStatusCard({ jobId, onComplete }: UpscaleStatusCardProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [muted, setMuted] = useState(true);

  const { data: job, error } = trpc.upscaler.getById.useQuery(
    { id: jobId },
    {
      refetchInterval: (query) => {
        const status = query.state.data?.status;
        if (!status || ["completed", "failed"].includes(status)) return false;
        return 3000;
      },
    }
  );

  useEffect(() => {
    if (job?.status === "completed") {
      onComplete?.(job);
    }
  }, [job, onComplete]);

  const handleDownload = () => {
    if (!job?.outputVideoUrl) return;
    const a = document.createElement("a");
    a.href = job.outputVideoUrl;
    a.download = `videoforge-4k-${jobId.slice(0, 8)}.mp4`;
    a.click();
  };

  if (error) {
    return (
      <Card className="border-red-500/20">
        <CardContent className="p-4">
          <p className="text-sm text-red-400">Failed to load upscale status</p>
        </CardContent>
      </Card>
    );
  }

  if (!job) {
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

  const config = STATUS_CONFIG[job.status];
  const Icon = config.icon;
  const isAnimated = ["pending", "queued", "processing"].includes(job.status);

  return (
    <Card className={job.status === "failed" ? "border-red-500/20" : ""}>
      {/* 4K video preview when completed */}
      {job.status === "completed" && job.outputVideoUrl && (
        <div className="relative aspect-video w-full overflow-hidden rounded-t-xl bg-black">
          <video
            ref={videoRef}
            src={job.outputVideoUrl}
            autoPlay
            loop
            muted={muted}
            playsInline
            className="h-full w-full object-contain"
          />
          {/* 4K badge */}
          <span className="absolute top-2 left-2 rounded bg-black/60 px-2 py-0.5 text-xs font-bold text-white backdrop-blur-sm">
            4K
          </span>
          {/* Mute toggle */}
          <button
            onClick={() => setMuted((m) => !m)}
            className="absolute bottom-2 right-2 rounded-lg bg-black/50 p-1.5 text-white backdrop-blur-sm hover:bg-black/70 transition-colors"
            title={muted ? "Unmute" : "Mute"}
          >
            {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
          </button>
        </div>
      )}

      <CardContent className="p-5 space-y-4">
        {/* Status row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon
              className={`h-4 w-4 ${
                job.status === "processing" ? "animate-spin text-accent-400" :
                job.status === "completed" ? "text-green-400" :
                job.status === "failed" ? "text-red-400" : "text-gray-400"
              }`}
            />
            <span className="text-sm font-medium text-white">{config.label}</span>
          </div>
          <Badge variant={config.color}>{job.status}</Badge>
        </div>

        <Progress value={config.progress} animated={isAnimated} />

        {/* Job metadata */}
        <div className="flex items-center gap-4 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <Sparkles className="h-3 w-3" />
            {job.qualityMode === "real-esrgan" ? "Real-ESRGAN" : "Standard"}
          </span>
          <span>{Math.round(job.inputDurationSeconds)}s source</span>
          <span>{job.creditsCost} credits</span>
        </div>

        {/* Download button */}
        {job.status === "completed" && job.outputVideoUrl && (
          <button
            onClick={handleDownload}
            className="flex items-center gap-1.5 text-sm text-accent-400 hover:text-accent-300 transition-colors"
          >
            <Download className="h-3.5 w-3.5" />
            Download 4K Video
          </button>
        )}

        {/* Error message */}
        {job.status === "failed" && job.errorMessage && (
          <p className="text-xs text-red-400 bg-red-500/5 rounded p-2">
            {job.errorMessage}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

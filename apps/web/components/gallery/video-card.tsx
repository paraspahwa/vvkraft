"use client";

import { useState } from "react";
import { Play, Download, Trash2, Clock, Monitor } from "lucide-react";
import { Card, CardContent, Badge } from "@videoforge/ui";
import type { Generation } from "@videoforge/shared";
import { formatDuration } from "@videoforge/shared";

interface VideoCardProps {
  generation: Generation;
  onDelete?: (id: string) => void;
}

export function VideoCard({ generation, onDelete }: VideoCardProps) {
  const [isPlaying, setIsPlaying] = useState(false);

  const handleDownload = async () => {
    if (!generation.videoUrl) return;
    const a = document.createElement("a");
    a.href = generation.videoUrl;
    a.download = `videoforge-${generation.id.slice(0, 8)}.mp4`;
    a.click();
  };

  return (
    <Card className="group overflow-hidden transition-all hover:border-accent-400/30 hover:shadow-accent-glow">
      {/* Video preview */}
      <div className="relative aspect-video bg-surface overflow-hidden">
        {generation.videoUrl ? (
          <>
            {!isPlaying && generation.thumbnailUrl && (
              <img
                src={generation.thumbnailUrl}
                alt={generation.prompt}
                className="h-full w-full object-cover"
              />
            )}
            {isPlaying ? (
              <video
                src={generation.videoUrl}
                autoPlay
                controls
                className="h-full w-full object-cover"
                onEnded={() => setIsPlaying(false)}
              />
            ) : (
              <button
                onClick={() => setIsPlaying(true)}
                className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10 backdrop-blur-sm border border-white/20">
                  <Play className="h-5 w-5 text-white fill-white ml-0.5" />
                </div>
              </button>
            )}
          </>
        ) : (
          <div className="flex h-full items-center justify-center">
            <div className="text-center space-y-2">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent-400 border-t-transparent mx-auto" />
              <p className="text-xs text-gray-500">Processing...</p>
            </div>
          </div>
        )}

        {/* Status badge */}
        {generation.status !== "completed" && (
          <div className="absolute top-2 left-2">
            <Badge
              variant={
                generation.status === "failed" ? "destructive" :
                generation.status === "cancelled" ? "outline" : "warning"
              }
            >
              {generation.status}
            </Badge>
          </div>
        )}
      </div>

      {/* Card content */}
      <CardContent className="p-4 space-y-3">
        <p className="text-sm text-gray-300 line-clamp-2">{generation.prompt}</p>

        <div className="flex items-center gap-3 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {formatDuration(generation.durationSeconds)}
          </span>
          <span className="flex items-center gap-1">
            <Monitor className="h-3 w-3" />
            {generation.resolution}
          </span>
          <span>{generation.creditsCost} credits</span>
        </div>

        <div className="flex items-center gap-2">
          {generation.videoUrl && (
            <button
              onClick={handleDownload}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-surface-border py-1.5 text-xs text-gray-400 hover:border-accent-400/50 hover:text-accent-400 transition-all"
            >
              <Download className="h-3 w-3" />
              Download
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(generation.id)}
              className="flex items-center justify-center rounded-lg border border-surface-border p-1.5 text-gray-500 hover:border-red-500/50 hover:text-red-400 transition-all"
              title="Delete"
            >
              <Trash2 className="h-3 w-3" />
            </button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

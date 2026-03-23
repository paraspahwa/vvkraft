"use client";

import { useCallback, useRef, useState } from "react";
import { Upload, X, Film, AlertCircle } from "lucide-react";
import { MAX_UPSCALE_DURATION_SECONDS } from "@videoforge/shared";
import { formatBytes } from "@videoforge/shared";

interface VideoFile {
  file: File;
  durationSeconds: number;
  previewUrl: string;
}

interface VideoUploadProps {
  onFileReady: (videoFile: VideoFile) => void;
  onClear: () => void;
  disabled?: boolean;
}

const ACCEPTED_VIDEO_TYPES = [
  "video/mp4",         // .mp4
  "video/webm",        // .webm
  "video/quicktime",   // .mov
  "video/avi",         // .avi
  "video/x-matroska",  // .mkv
];
const MAX_FILE_SIZE_BYTES = 2 * 1024 * 1024 * 1024; // 2 GB

function getVideoDuration(file: File): Promise<number> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const video = document.createElement("video");
    video.preload = "metadata";
    video.onloadedmetadata = () => {
      URL.revokeObjectURL(url);
      resolve(video.duration);
    };
    video.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Could not read video metadata"));
    };
    video.src = url;
  });
}

export function VideoUpload({ onFileReady, onClear, disabled }: VideoUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<VideoFile | null>(null);

  const processFile = useCallback(
    async (file: File) => {
      setError(null);

      if (!ACCEPTED_VIDEO_TYPES.includes(file.type)) {
        setError("Unsupported file type. Please upload an MP4, WebM, MOV, AVI, or MKV file.");
        return;
      }

      if (file.size > MAX_FILE_SIZE_BYTES) {
        setError(`File is too large. Maximum size is ${formatBytes(MAX_FILE_SIZE_BYTES)}.`);
        return;
      }

      let durationSeconds: number;
      try {
        durationSeconds = await getVideoDuration(file);
      } catch {
        setError("Could not read video duration. Please try a different file.");
        return;
      }

      if (durationSeconds > MAX_UPSCALE_DURATION_SECONDS) {
        setError(
          `Video is too long (${Math.round(durationSeconds)}s). Maximum allowed duration is ${MAX_UPSCALE_DURATION_SECONDS} seconds.`
        );
        return;
      }

      const previewUrl = URL.createObjectURL(file);
      const videoFile: VideoFile = { file, durationSeconds, previewUrl };
      setSelected(videoFile);
      onFileReady(videoFile);
    },
    [onFileReady]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) void processFile(file);
    },
    [processFile]
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) void processFile(file);
    // Reset input so the same file can be re-selected
    e.target.value = "";
  };

  const handleClear = () => {
    if (selected?.previewUrl) URL.revokeObjectURL(selected.previewUrl);
    setSelected(null);
    setError(null);
    onClear();
  };

  if (selected) {
    return (
      <div className="relative rounded-xl overflow-hidden border border-surface-border bg-surface-card">
        {/* Video preview */}
        <div className="aspect-video bg-black">
          <video
            src={selected.previewUrl}
            controls
            muted
            playsInline
            className="h-full w-full object-contain"
          />
        </div>

        {/* File info bar */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-surface-border">
          <div className="flex items-center gap-2 min-w-0">
            <Film className="h-4 w-4 text-accent-400 flex-shrink-0" />
            <span className="text-sm text-white truncate">{selected.file.name}</span>
            <span className="text-xs text-gray-400 flex-shrink-0">
              {formatBytes(selected.file.size)} · {Math.round(selected.durationSeconds)}s
            </span>
          </div>
          <button
            type="button"
            onClick={handleClear}
            disabled={disabled}
            className="ml-3 flex-shrink-0 rounded-lg p-1.5 text-gray-400 hover:bg-surface-hover hover:text-white transition-colors disabled:opacity-50"
            title="Remove video"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => !disabled && inputRef.current?.click()}
        className={`
          relative flex flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed
          cursor-pointer px-6 py-14 transition-all
          ${dragging
            ? "border-accent-400 bg-accent-400/5"
            : "border-surface-border bg-surface-card hover:border-gray-500 hover:bg-surface-hover"
          }
          ${disabled ? "opacity-50 pointer-events-none" : ""}
        `}
      >
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-accent-400/10">
          <Upload className="h-7 w-7 text-accent-400" />
        </div>
        <div className="text-center">
          <p className="text-sm font-medium text-white">
            Drag & drop your video here
          </p>
          <p className="mt-1 text-xs text-gray-400">
            or <span className="text-accent-400">browse files</span>
          </p>
          <p className="mt-2 text-xs text-gray-500">
            MP4, WebM, MOV · Max {MAX_UPSCALE_DURATION_SECONDS}s · Up to 2 GB
          </p>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED_VIDEO_TYPES.join(",")}
          onChange={handleInputChange}
          className="sr-only"
        />
      </div>

      {error && (
        <div className="flex items-start gap-2 rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-3">
          <AlertCircle className="h-4 w-4 text-red-400 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}
    </div>
  );
}

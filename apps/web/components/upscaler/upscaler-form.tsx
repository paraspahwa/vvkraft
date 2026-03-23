"use client";

import { useState, useCallback } from "react";
import { Sparkles, Zap, Lock, ArrowUpCircle } from "lucide-react";
import { Button, Card, CardContent, CardHeader, CardTitle } from "@videoforge/ui";
import { trpc } from "@/lib/trpc/client";
import { VideoUpload } from "./video-upload";

interface VideoFile {
  file: File;
  durationSeconds: number;
  previewUrl: string;
}

interface UpscalerFormProps {
  onSuccess: (jobId: string) => void;
}

type QualityMode = "standard" | "real-esrgan";

const QUALITY_OPTIONS: Array<{
  value: QualityMode;
  label: string;
  description: string;
  paidOnly: boolean;
  credits: number;
}> = [
  {
    value: "standard",
    label: "Standard",
    description: "Fast 4x upscale with AI enhancement",
    paidOnly: false,
    credits: 10,
  },
  {
    value: "real-esrgan",
    label: "Real-ESRGAN",
    description: "Highest quality — preserves fine details and textures",
    paidOnly: true,
    credits: 25,
  },
];

export function UpscalerForm({ onSuccess }: UpscalerFormProps) {
  const { data: user } = trpc.user.me.useQuery();
  const getUploadUrlMutation = trpc.upscaler.getUploadUrl.useMutation();
  const createMutation = trpc.upscaler.create.useMutation();

  const [videoFile, setVideoFile] = useState<VideoFile | null>(null);
  const [qualityMode, setQualityMode] = useState<QualityMode>("standard");
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const isPaidUser = user?.tier !== "free";
  const selectedOption = QUALITY_OPTIONS.find((o) => o.value === qualityMode) ?? QUALITY_OPTIONS[0]!;
  const hasEnoughCredits = (user?.credits ?? 0) >= selectedOption.credits;

  const handleFileReady = useCallback((file: VideoFile) => {
    setVideoFile(file);
    setUploadError(null);
  }, []);

  const handleClear = useCallback(() => {
    setVideoFile(null);
    setUploadProgress(0);
    setUploadError(null);
  }, []);

  const handleSubmit = async () => {
    if (!videoFile) return;

    setUploadError(null);

    // Step 1: get presigned upload URL
    let uploadUrlData: Awaited<ReturnType<typeof getUploadUrlMutation.mutateAsync>>;
    try {
      uploadUrlData = await getUploadUrlMutation.mutateAsync({
        fileName: videoFile.file.name,
        contentType: videoFile.file.type || "video/mp4",
        fileSizeBytes: videoFile.file.size,
      });
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Failed to get upload URL");
      return;
    }

    // Step 2: upload the file directly to R2 using XHR (so we can track progress)
    setIsUploading(true);
    setUploadProgress(0);

    try {
      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("PUT", uploadUrlData.uploadUrl, true);
        xhr.setRequestHeader("Content-Type", videoFile.file.type || "video/mp4");

        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) {
            setUploadProgress(Math.round((e.loaded / e.total) * 100));
          }
        };

        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve();
          } else {
            reject(new Error(`Upload failed with status ${xhr.status}`));
          }
        };

        xhr.onerror = () => reject(new Error("Network error during upload"));
        xhr.send(videoFile.file);
      });
    } catch (err) {
      setIsUploading(false);
      setUploadError(err instanceof Error ? err.message : "Upload failed");
      return;
    }

    setIsUploading(false);

    // Step 3: create the upscale job
    try {
      const job = await createMutation.mutateAsync({
        inputVideoUrl: uploadUrlData.publicUrl,
        inputDurationSeconds: videoFile.durationSeconds,
        inputR2Key: uploadUrlData.r2Key,
        qualityMode,
      });

      onSuccess(job.id);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Failed to start upscale job");
    }
  };

  const isBusy = isUploading || createMutation.isPending;

  return (
    <div className="space-y-6">
      {/* Video upload */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <ArrowUpCircle className="h-4 w-4 text-accent-400" />
            Upload Video
          </CardTitle>
        </CardHeader>
        <CardContent>
          <VideoUpload
            onFileReady={handleFileReady}
            onClear={handleClear}
            disabled={isBusy}
          />

          {/* Upload progress bar */}
          {isUploading && (
            <div className="mt-4 space-y-1.5">
              <div className="flex items-center justify-between text-xs text-gray-400">
                <span>Uploading…</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-surface-border overflow-hidden">
                <div
                  className="h-full rounded-full bg-accent-gradient transition-all duration-200"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quality mode */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-accent-400" />
            Quality Mode
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {QUALITY_OPTIONS.map((option) => {
            const isLocked = option.paidOnly && !isPaidUser;
            const isSelected = qualityMode === option.value;

            return (
              <button
                key={option.value}
                type="button"
                disabled={isLocked || isBusy}
                onClick={() => !isLocked && setQualityMode(option.value)}
                className={`w-full rounded-lg border p-4 text-left transition-all ${
                  isSelected
                    ? "border-accent-400 bg-accent-400/10"
                    : "border-surface-border hover:border-gray-500"
                } ${isLocked ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {option.paidOnly ? (
                      <Zap className={`h-4 w-4 ${isSelected ? "text-accent-400" : "text-gray-400"}`} />
                    ) : (
                      <Sparkles className={`h-4 w-4 ${isSelected ? "text-accent-400" : "text-gray-400"}`} />
                    )}
                    <span className={`text-sm font-medium ${isSelected ? "text-white" : "text-gray-300"}`}>
                      {option.label}
                    </span>
                    {option.paidOnly && (
                      <span className="flex items-center gap-0.5 rounded-full bg-accent-400/15 px-1.5 py-0.5 text-[10px] font-semibold text-accent-400">
                        {isLocked && <Lock className="h-2.5 w-2.5" />}
                        PAID
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-gray-400">{option.credits} credits</span>
                </div>
                <p className="mt-1 text-xs text-gray-500 pl-6">{option.description}</p>
              </button>
            );
          })}

          {!isPaidUser && (
            <p className="text-xs text-gray-500 pt-1">
              <span className="text-accent-400">Upgrade to Creator or higher</span> to unlock Real-ESRGAN quality.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Error */}
      {uploadError && (
        <p className="text-sm text-red-400 bg-red-500/5 rounded-lg px-4 py-3 border border-red-500/20">
          {uploadError}
        </p>
      )}

      {/* Submit */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-400">
          <span>Cost: </span>
          <span className="font-bold text-accent-400">{selectedOption.credits} credits</span>
          {!hasEnoughCredits && (
            <span className="ml-2 text-red-400 text-xs">Insufficient credits</span>
          )}
        </div>

        <Button
          type="button"
          variant="gradient"
          size="lg"
          onClick={() => void handleSubmit()}
          disabled={!videoFile || !hasEnoughCredits || isBusy}
          loading={isBusy}
        >
          <ArrowUpCircle className="h-4 w-4" />
          {isUploading ? `Uploading ${uploadProgress}%…` : createMutation.isPending ? "Starting…" : "Upscale to 4K"}
        </Button>
      </div>
    </div>
  );
}

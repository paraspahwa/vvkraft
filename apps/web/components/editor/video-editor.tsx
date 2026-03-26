"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import {
  Play,
  Pause,
  Plus,
  Trash2,
  Download,
  Save,
  Type,
  Music,
  GripVertical,
  ChevronLeft,
  ChevronRight,
  Scissors,
  Upload,
  Film,
  Loader2,
} from "lucide-react";
import { Button, Card, CardContent, CardHeader, CardTitle } from "@videoforge/ui";
import { trpc } from "@/lib/trpc/client";
import type { VideoEditorClip, VideoEditorTextOverlay } from "@videoforge/shared";

// ── Types ──────────────────────────────────────────────────────────────────────

interface VideoFile {
  file: File;
  durationSeconds: number;
  previewUrl: string;
}

interface VideoEditorProps {
  projectId: string;
}

// ── Helper ──────────────────────────────────────────────────────────────────────

function fmtTime(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function clipEffectiveDuration(clip: VideoEditorClip): number {
  const end = clip.trimEnd > 0 ? clip.trimEnd : clip.durationSeconds;
  return Math.max(0, end - clip.trimStart);
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function ClipTile({
  clip,
  isSelected,
  onSelect,
  onDelete,
  onMoveLeft,
  onMoveRight,
  canMoveLeft,
  canMoveRight,
}: {
  clip: VideoEditorClip;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: () => void;
  onMoveLeft: () => void;
  onMoveRight: () => void;
  canMoveLeft: boolean;
  canMoveRight: boolean;
}) {
  return (
    <div
      onClick={onSelect}
      className={`relative flex flex-col rounded-lg border cursor-pointer transition-all select-none ${
        isSelected
          ? "border-accent-400 bg-accent-400/10"
          : "border-surface-border bg-surface-card hover:border-gray-500"
      }`}
      style={{ minWidth: 120, maxWidth: 160 }}
    >
      {/* Thumbnail / placeholder */}
      <div className="relative w-full aspect-video rounded-t-lg bg-[#1A1A2E] overflow-hidden flex items-center justify-center">
        {clip.sourceUrl ? (
          <video src={clip.sourceUrl} className="w-full h-full object-cover" muted />
        ) : (
          <Film className="h-6 w-6 text-gray-600" />
        )}
        <span className="absolute bottom-1 right-1 bg-black/70 text-white text-[9px] px-1 rounded">
          {fmtTime(clipEffectiveDuration(clip))}
        </span>
      </div>

      {/* Label */}
      <div className="px-2 py-1">
        <p className="text-[10px] text-gray-300 truncate">{clip.label ?? `Clip ${clip.order + 1}`}</p>
        <p className="text-[9px] text-gray-500 capitalize">{clip.sourceType}</p>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between px-2 pb-2 gap-1">
        <button
          type="button"
          disabled={!canMoveLeft}
          onClick={(e) => { e.stopPropagation(); onMoveLeft(); }}
          className="p-0.5 text-gray-400 hover:text-white disabled:opacity-30"
          title="Move left"
        >
          <ChevronLeft className="h-3 w-3" />
        </button>
        <button
          type="button"
          disabled={!canMoveRight}
          onClick={(e) => { e.stopPropagation(); onMoveRight(); }}
          className="p-0.5 text-gray-400 hover:text-white disabled:opacity-30"
          title="Move right"
        >
          <ChevronRight className="h-3 w-3" />
        </button>
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
          className="p-0.5 text-gray-400 hover:text-red-400 ml-auto"
          title="Remove clip"
        >
          <Trash2 className="h-3 w-3" />
        </button>
      </div>
    </div>
  );
}

function TrimPanel({
  clip,
  onChange,
}: {
  clip: VideoEditorClip;
  onChange: (updated: Partial<VideoEditorClip>) => void;
}) {
  const trimEnd = clip.trimEnd > 0 ? clip.trimEnd : clip.durationSeconds;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm flex items-center gap-2">
          <Scissors className="h-4 w-4 text-accent-400" />
          Trim Clip
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-1">
          <label className="text-xs text-gray-400">
            Start — {fmtTime(clip.trimStart)}
          </label>
          <input
            type="range"
            min={0}
            max={trimEnd - 0.1}
            step={0.1}
            value={clip.trimStart}
            onChange={(e) => onChange({ trimStart: parseFloat(e.target.value) })}
            className="w-full accent-indigo-500"
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs text-gray-400">
            End — {fmtTime(trimEnd)}
          </label>
          <input
            type="range"
            min={clip.trimStart + 0.1}
            max={clip.durationSeconds}
            step={0.1}
            value={trimEnd}
            onChange={(e) =>
              onChange({ trimEnd: parseFloat(e.target.value) })
            }
            className="w-full accent-indigo-500"
          />
        </div>
        <p className="text-xs text-gray-500">
          Effective duration: <span className="text-white font-semibold">{fmtTime(clipEffectiveDuration(clip))}</span>
        </p>
      </CardContent>
    </Card>
  );
}

function TextOverlayPanel({
  overlays,
  onAdd,
  onDelete,
  onUpdate,
  totalDuration,
}: {
  overlays: VideoEditorTextOverlay[];
  onAdd: () => void;
  onDelete: (id: string) => void;
  onUpdate: (id: string, patch: Partial<VideoEditorTextOverlay>) => void;
  totalDuration: number;
}) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <Type className="h-4 w-4 text-accent-400" />
            Text Overlays
          </CardTitle>
          <button
            type="button"
            onClick={onAdd}
            className="text-xs text-accent-400 hover:text-accent-300"
          >
            + Add
          </button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {overlays.length === 0 && (
          <p className="text-xs text-gray-500 text-center py-2">No overlays yet</p>
        )}
        {overlays.map((ov) => (
          <div key={ov.id} className="space-y-2 border border-surface-border rounded-lg p-3">
            <div className="flex items-center justify-between">
              <input
                type="text"
                value={ov.text}
                onChange={(e) => onUpdate(ov.id, { text: e.target.value })}
                placeholder="Text content…"
                className="flex-1 bg-transparent text-sm text-white placeholder:text-gray-600 outline-none"
              />
              <button type="button" onClick={() => onDelete(ov.id)} className="text-gray-500 hover:text-red-400 ml-2">
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] text-gray-500">Start (s)</label>
                <input
                  type="number"
                  min={0}
                  max={totalDuration}
                  step={0.5}
                  value={ov.startTime}
                  onChange={(e) => onUpdate(ov.id, { startTime: parseFloat(e.target.value) })}
                  className="w-full bg-surface-hover rounded px-2 py-1 text-xs text-white outline-none"
                />
              </div>
              <div>
                <label className="text-[10px] text-gray-500">End (s)</label>
                <input
                  type="number"
                  min={ov.startTime + 0.5}
                  max={totalDuration}
                  step={0.5}
                  value={ov.endTime}
                  onChange={(e) => onUpdate(ov.id, { endTime: parseFloat(e.target.value) })}
                  className="w-full bg-surface-hover rounded px-2 py-1 text-xs text-white outline-none"
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="text-[10px] text-gray-500">Position</label>
                <select
                  value={ov.position}
                  onChange={(e) => onUpdate(ov.id, { position: e.target.value as VideoEditorTextOverlay["position"] })}
                  className="w-full bg-surface-hover rounded px-1 py-1 text-xs text-white outline-none"
                >
                  <option value="top">Top</option>
                  <option value="center">Center</option>
                  <option value="bottom">Bottom</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] text-gray-500">Font size</label>
                <input
                  type="number"
                  min={12}
                  max={96}
                  value={ov.fontSize}
                  onChange={(e) => onUpdate(ov.id, { fontSize: parseInt(e.target.value) })}
                  className="w-full bg-surface-hover rounded px-2 py-1 text-xs text-white outline-none"
                />
              </div>
              <div>
                <label className="text-[10px] text-gray-500">Color</label>
                <input
                  type="color"
                  value={ov.color}
                  onChange={(e) => onUpdate(ov.id, { color: e.target.value })}
                  className="w-full h-7 rounded cursor-pointer bg-transparent"
                />
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function AudioPanel({
  audioUrl,
  audioVolume,
  onUrlChange,
  onVolumeChange,
}: {
  audioUrl: string | null;
  audioVolume: number;
  onUrlChange: (url: string | null) => void;
  onVolumeChange: (vol: number) => void;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm flex items-center gap-2">
          <Music className="h-4 w-4 text-accent-400" />
          Background Audio
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <label className="text-xs text-gray-400 mb-1 block">Audio URL</label>
          <input
            type="url"
            value={audioUrl ?? ""}
            onChange={(e) => onUrlChange(e.target.value || null)}
            placeholder="https://… (MP3 or AAC)"
            className="w-full bg-surface-hover rounded-lg px-3 py-2 text-sm text-white placeholder:text-gray-600 outline-none border border-surface-border focus:border-accent-400"
          />
        </div>
        <div>
          <label className="text-xs text-gray-400">
            Volume — {Math.round(audioVolume * 100)}%
          </label>
          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={audioVolume}
            onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
            className="w-full accent-indigo-500 mt-1"
          />
        </div>
      </CardContent>
    </Card>
  );
}

// ── Main VideoEditor ───────────────────────────────────────────────────────────

export function VideoEditor({ projectId }: VideoEditorProps) {
  const utils = trpc.useUtils();

  // Load project
  const { data: project, isLoading } = trpc.videoEditor.getById.useQuery({ projectId });

  // Mutations
  const saveMutation = trpc.videoEditor.save.useMutation({
    onSuccess: () => utils.videoEditor.getById.invalidate({ projectId }),
  });
  const getUploadUrlMutation = trpc.videoEditor.getUploadUrl.useMutation();
  const exportMutation = trpc.videoEditor.export.useMutation({
    onSuccess: () => utils.videoEditor.getById.invalidate({ projectId }),
  });

  // Local edit state (synced from project on load)
  const [clips, setClips] = useState<VideoEditorClip[]>([]);
  const [overlays, setOverlays] = useState<VideoEditorTextOverlay[]>([]);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioVolume, setAudioVolume] = useState(0.5);
  const [projectName, setProjectName] = useState("");
  const [selectedClipId, setSelectedClipId] = useState<string | null>(null);

  // Preview player
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [currentClipIndex, setCurrentClipIndex] = useState(0);

  // Upload state
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const [saveError, setSaveError] = useState<string | null>(null);
  const [exportResult, setExportResult] = useState<{ status: string; downloadUrl?: string | null } | null>(null);

  // Seed state from loaded project
  useEffect(() => {
    if (!project) return;
    setClips(project.clips);
    setOverlays(project.textOverlays);
    setAudioUrl(project.backgroundAudioUrl);
    setAudioVolume(project.backgroundAudioVolume);
    setProjectName(project.name);
  }, [project]);

  // Preview: update video src when clip index changes
  useEffect(() => {
    const clip = clips[currentClipIndex];
    if (!clip || !videoRef.current) return;
    const video = videoRef.current;
    video.src = clip.sourceUrl;
    video.currentTime = clip.trimStart;
    if (isPlaying) void video.play();
  }, [currentClipIndex, clips]);

  const togglePlay = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    if (isPlaying) {
      video.pause();
      setIsPlaying(false);
    } else {
      void video.play();
      setIsPlaying(true);
    }
  }, [isPlaying]);

  const handleTimeUpdate = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    const clip = clips[currentClipIndex];
    setCurrentTime(video.currentTime);
    if (clip) {
      const trimEnd = clip.trimEnd > 0 ? clip.trimEnd : clip.durationSeconds;
      if (video.currentTime >= trimEnd) {
        // Advance to next clip
        if (currentClipIndex < clips.length - 1) {
          setCurrentClipIndex((i) => i + 1);
        } else {
          video.pause();
          setIsPlaying(false);
        }
      }
    }
  }, [clips, currentClipIndex]);

  // ── Gallery picker ──────────────────────────────────────────────────────────
  const { data: galleryData } = trpc.generation.list.useInfiniteQuery(
    { limit: 20 },
    { getNextPageParam: (lastPage) => lastPage.nextCursor }
  );
  const galleryVideos = galleryData?.pages.flatMap((p) => p.items).filter((g) => g.status === "completed") ?? [];

  const addFromGallery = useCallback(
    (generation: { id: string; videoUrl: string | null; durationSeconds: number; prompt: string }) => {
      if (!generation.videoUrl) return;
      const newClip: VideoEditorClip = {
        id: crypto.randomUUID(),
        sourceType: "generated",
        sourceUrl: generation.videoUrl,
        generationId: generation.id,
        durationSeconds: generation.durationSeconds,
        trimStart: 0,
        trimEnd: 0,
        order: clips.length,
        label: generation.prompt.slice(0, 40),
      };
      setClips((prev) => [...prev, newClip]);
    },
    [clips.length]
  );

  // ── File upload ─────────────────────────────────────────────────────────────
  const handleFileUpload = useCallback(
    async (file: File) => {
      setUploadError(null);
      const clipId = crypto.randomUUID();

      // Extract duration via HTML5 video API
      let durationSeconds: number;
      try {
        durationSeconds = await new Promise<number>((resolve, reject) => {
          const el = document.createElement("video");
          el.preload = "metadata";
          el.onloadedmetadata = () => resolve(el.duration);
          el.onerror = () => reject(new Error("Could not read video metadata. Please try a different file."));
          el.src = URL.createObjectURL(file);
        });
      } catch (err) {
        setUploadError(err instanceof Error ? err.message : "Failed to read video metadata");
        return;
      }

      // Get presigned URL
      let uploadData: { uploadUrl: string; r2Key: string; publicUrl: string };
      try {
        uploadData = await getUploadUrlMutation.mutateAsync({
          projectId,
          clipId,
          fileName: file.name,
          contentType: file.type || "video/mp4",
          fileSizeBytes: file.size,
        });
      } catch (err) {
        setUploadError(err instanceof Error ? err.message : "Failed to get upload URL");
        return;
      }

      // Upload to R2
      setIsUploading(true);
      setUploadProgress(0);
      try {
        await new Promise<void>((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          xhr.open("PUT", uploadData.uploadUrl, true);
          xhr.setRequestHeader("Content-Type", file.type || "video/mp4");
          xhr.upload.onprogress = (e) => {
            if (e.lengthComputable) setUploadProgress(Math.round((e.loaded / e.total) * 100));
          };
          xhr.onload = () => (xhr.status >= 200 && xhr.status < 300 ? resolve() : reject(new Error(`Upload status ${xhr.status}`)));
          xhr.onerror = () => reject(new Error("Network error"));
          xhr.send(file);
        });
      } catch (err) {
        setUploadError(err instanceof Error ? err.message : "Upload failed");
        setIsUploading(false);
        return;
      }
      setIsUploading(false);

      const newClip: VideoEditorClip = {
        id: clipId,
        sourceType: "uploaded",
        sourceUrl: uploadData.publicUrl,
        uploadedR2Key: uploadData.r2Key,
        durationSeconds,
        trimStart: 0,
        trimEnd: 0,
        order: clips.length,
        label: file.name.slice(0, 40),
      };
      setClips((prev) => [...prev, newClip]);
    },
    [clips.length, getUploadUrlMutation, projectId]
  );

  // ── Clip operations ─────────────────────────────────────────────────────────
  const updateClip = useCallback((id: string, patch: Partial<VideoEditorClip>) => {
    setClips((prev) => prev.map((c) => (c.id === id ? { ...c, ...patch } : c)));
  }, []);

  const deleteClip = useCallback((id: string) => {
    setClips((prev) =>
      prev
        .filter((c) => c.id !== id)
        .map((c, i) => ({ ...c, order: i }))
    );
    setSelectedClipId((sel) => (sel === id ? null : sel));
  }, []);

  const moveClip = useCallback((id: string, direction: "left" | "right") => {
    setClips((prev) => {
      const idx = prev.findIndex((c) => c.id === id);
      if (idx < 0) return prev;
      const next = [...prev];
      const targetIdx = direction === "left" ? idx - 1 : idx + 1;
      if (targetIdx < 0 || targetIdx >= next.length) return prev;
      // Both indices are verified valid above; non-null assertions are safe.
      [next[idx], next[targetIdx]] = [next[targetIdx]!, next[idx]!];
      return next.map((c, i) => ({ ...c, order: i }));
    });
  }, []);

  // ── Text overlays ───────────────────────────────────────────────────────────
  const addOverlay = useCallback(() => {
    const newOv: VideoEditorTextOverlay = {
      id: crypto.randomUUID(),
      text: "Your text here",
      startTime: 0,
      endTime: 3,
      position: "bottom",
      fontSize: 32,
      color: "#FFFFFF",
      backgroundColor: "#00000066",
    };
    setOverlays((prev) => [...prev, newOv]);
  }, []);

  const deleteOverlay = useCallback((id: string) => {
    setOverlays((prev) => prev.filter((o) => o.id !== id));
  }, []);

  const updateOverlay = useCallback((id: string, patch: Partial<VideoEditorTextOverlay>) => {
    setOverlays((prev) => prev.map((o) => (o.id === id ? { ...o, ...patch } : o)));
  }, []);

  // ── Save ────────────────────────────────────────────────────────────────────
  const handleSave = useCallback(async () => {
    setSaveError(null);
    try {
      await saveMutation.mutateAsync({
        projectId,
        name: projectName,
        clips,
        textOverlays: overlays,
        backgroundAudioUrl: audioUrl,
        backgroundAudioVolume: audioVolume,
      });
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Save failed");
    }
  }, [projectId, projectName, clips, overlays, audioUrl, audioVolume, saveMutation]);

  // ── Export ──────────────────────────────────────────────────────────────────
  const handleExport = useCallback(async () => {
    setExportResult(null);
    try {
      const result = await exportMutation.mutateAsync({ projectId });
      setExportResult(result);
    } catch (err) {
      setExportResult({ status: "error" });
    }
  }, [exportMutation, projectId]);

  // ── Computed ────────────────────────────────────────────────────────────────
  const totalDuration = clips.reduce((sum, c) => sum + clipEffectiveDuration(c), 0);
  const selectedClip = clips.find((c) => c.id === selectedClipId) ?? null;

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-accent-400" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex h-96 items-center justify-center text-gray-400">Project not found</div>
    );
  }

  return (
    <div className="flex h-full gap-6 overflow-hidden">
      {/* ── Left panel: clip library ── */}
      <div className="flex w-72 flex-col gap-4 overflow-y-auto pr-1 flex-shrink-0">
        {/* Project name */}
        <div>
          <label className="text-xs text-gray-400 mb-1 block">Project name</label>
          <input
            type="text"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            className="w-full rounded-lg border border-surface-border bg-surface-card px-3 py-2 text-sm text-white outline-none focus:border-accent-400"
          />
        </div>

        {/* Upload own video */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <Upload className="h-4 w-4 text-accent-400" />
              Upload Video
            </CardTitle>
          </CardHeader>
          <CardContent>
            <label className="block cursor-pointer rounded-lg border border-dashed border-surface-border p-4 text-center hover:border-gray-500 transition-colors">
              <input
                type="file"
                accept="video/*"
                className="sr-only"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) void handleFileUpload(f);
                }}
                disabled={isUploading}
              />
              {isUploading ? (
                <div className="space-y-2">
                  <Loader2 className="h-5 w-5 animate-spin text-accent-400 mx-auto" />
                  <p className="text-xs text-gray-400">Uploading… {uploadProgress}%</p>
                </div>
              ) : (
                <>
                  <Upload className="h-5 w-5 text-gray-500 mx-auto mb-1" />
                  <p className="text-xs text-gray-400">Click to upload (MP4, WebM, MOV)</p>
                </>
              )}
            </label>
            {uploadError && (
              <p className="mt-2 text-xs text-red-400">{uploadError}</p>
            )}
          </CardContent>
        </Card>

        {/* Gallery videos */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <Film className="h-4 w-4 text-accent-400" />
              From Gallery
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 max-h-72 overflow-y-auto">
            {galleryVideos.length === 0 && (
              <p className="text-xs text-gray-500 text-center py-2">No completed videos yet</p>
            )}
            {galleryVideos.map((gen) => (
              <button
                key={gen.id}
                type="button"
                onClick={() => addFromGallery(gen)}
                className="w-full flex items-center gap-2 rounded-lg border border-surface-border p-2 text-left hover:border-accent-400 hover:bg-accent-400/5 transition-all"
              >
                <div className="h-10 w-16 rounded bg-[#1A1A2E] flex-shrink-0 overflow-hidden">
                  {gen.thumbnailUrl ? (
                    <img src={gen.thumbnailUrl} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <Film className="h-4 w-4 text-gray-600 m-auto mt-3" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-white truncate">{gen.prompt.slice(0, 35)}</p>
                  <p className="text-[10px] text-gray-500">{gen.durationSeconds}s</p>
                </div>
                <Plus className="h-3.5 w-3.5 text-accent-400 flex-shrink-0" />
              </button>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* ── Center: preview + timeline ── */}
      <div className="flex flex-1 flex-col gap-4 min-w-0 overflow-y-auto">
        {/* Video preview */}
        <div className="relative rounded-xl bg-black overflow-hidden aspect-video">
          {clips.length > 0 ? (
            <video
              ref={videoRef}
              className="w-full h-full"
              onTimeUpdate={handleTimeUpdate}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              onEnded={() => setIsPlaying(false)}
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <div className="text-center">
                <Film className="h-12 w-12 text-gray-600 mx-auto mb-3" />
                <p className="text-gray-400 text-sm">Add clips from the library to preview</p>
              </div>
            </div>
          )}

          {/* Active text overlays */}
          {overlays
            .filter((o) => currentTime >= o.startTime && currentTime <= o.endTime)
            .map((o) => (
              <div
                key={o.id}
                className={`absolute left-0 right-0 flex justify-center px-4 ${
                  o.position === "top" ? "top-4" : o.position === "center" ? "top-1/2 -translate-y-1/2" : "bottom-4"
                }`}
              >
                <span
                  style={{
                    fontSize: o.fontSize,
                    color: o.color,
                    backgroundColor: o.backgroundColor,
                    padding: "4px 12px",
                    borderRadius: 4,
                  }}
                >
                  {o.text}
                </span>
              </div>
            ))}
        </div>

        {/* Playback controls */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={togglePlay}
            disabled={clips.length === 0}
            className="rounded-full bg-accent-400/10 border border-accent-400/30 p-2 text-accent-400 hover:bg-accent-400/20 disabled:opacity-40"
          >
            {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
          </button>
          <span className="text-xs text-gray-400">
            {fmtTime(currentTime)} / {fmtTime(totalDuration)}
          </span>
          <div className="flex-1 h-1.5 bg-surface-border rounded-full overflow-hidden">
            <div
              className="h-full bg-accent-400 transition-all"
              style={{ width: totalDuration > 0 ? `${(currentTime / totalDuration) * 100}%` : "0%" }}
            />
          </div>
        </div>

        {/* Timeline */}
        <div>
          <h3 className="text-xs font-medium text-gray-400 mb-2 flex items-center gap-2">
            <GripVertical className="h-3.5 w-3.5" />
            Timeline ({clips.length} clip{clips.length !== 1 ? "s" : ""} · {fmtTime(totalDuration)} total)
          </h3>
          {clips.length === 0 ? (
            <div className="flex items-center justify-center rounded-xl border border-dashed border-surface-border py-10 text-center">
              <div>
                <Film className="h-8 w-8 text-gray-600 mx-auto mb-2" />
                <p className="text-sm text-gray-500">Add clips using the library on the left</p>
              </div>
            </div>
          ) : (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {clips
                .slice()
                .sort((a, b) => a.order - b.order)
                .map((clip) => (
                  <ClipTile
                    key={clip.id}
                    clip={clip}
                    isSelected={selectedClipId === clip.id}
                    onSelect={() => {
                      setSelectedClipId(clip.id);
                      setCurrentClipIndex(clip.order);
                    }}
                    onDelete={() => deleteClip(clip.id)}
                    onMoveLeft={() => moveClip(clip.id, "left")}
                    onMoveRight={() => moveClip(clip.id, "right")}
                    canMoveLeft={clip.order > 0}
                    canMoveRight={clip.order < clips.length - 1}
                  />
                ))}
            </div>
          )}
        </div>

        {/* Action bar */}
        <div className="flex items-center gap-3 pt-2 border-t border-surface-border">
          {saveError && <p className="text-xs text-red-400">{saveError}</p>}
          {exportResult && (
            <p className={`text-xs ${exportResult.status === "exported" ? "text-green-400" : "text-amber-400"}`}>
              {exportResult.status === "exported" && exportResult.downloadUrl
                ? "✓ Ready to download"
                : exportResult.status === "exporting"
                ? "⏳ Export in progress…"
                : "Export queued"}
            </p>
          )}
          <div className="ml-auto flex items-center gap-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => void handleSave()}
              loading={saveMutation.isPending}
              disabled={saveMutation.isPending}
            >
              <Save className="h-4 w-4" />
              Save
            </Button>
            {exportResult?.status === "exported" && exportResult.downloadUrl ? (
              <a href={exportResult.downloadUrl} download>
                <Button type="button" variant="gradient" size="sm">
                  <Download className="h-4 w-4" />
                  Download
                </Button>
              </a>
            ) : (
              <Button
                type="button"
                variant="gradient"
                size="sm"
                onClick={() => void handleExport()}
                loading={exportMutation.isPending}
                disabled={clips.length === 0 || exportMutation.isPending}
              >
                <Download className="h-4 w-4" />
                Export
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* ── Right panel: properties ── */}
      <div className="flex w-64 flex-col gap-4 overflow-y-auto pl-1 flex-shrink-0">
        {selectedClip && (
          <TrimPanel
            clip={selectedClip}
            onChange={(patch) => updateClip(selectedClip.id, patch)}
          />
        )}
        <TextOverlayPanel
          overlays={overlays}
          onAdd={addOverlay}
          onDelete={deleteOverlay}
          onUpdate={updateOverlay}
          totalDuration={totalDuration}
        />
        <AudioPanel
          audioUrl={audioUrl}
          audioVolume={audioVolume}
          onUrlChange={setAudioUrl}
          onVolumeChange={setAudioVolume}
        />
      </div>
    </div>
  );
}

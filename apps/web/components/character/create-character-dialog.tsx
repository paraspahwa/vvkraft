"use client";

import { useRef, useState } from "react";
import { X, Upload, User2, Loader2 } from "lucide-react";
import {
  Button,
  Card,
  CardContent,
  Input,
  Textarea,
} from "@videoforge/ui";
import { trpc } from "@/lib/trpc/client";

interface CreateCharacterDialogProps {
  onClose: () => void;
  onCreated: () => void;
}

function generateId(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

export function CreateCharacterDialog({ onClose, onCreated }: CreateCharacterDialogProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<"idle" | "uploading" | "done">("idle");
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const utils = trpc.useUtils();
  const getUploadUrlMutation = trpc.character.getUploadUrl.useMutation();
  const createMutation = trpc.character.create.useMutation({
    onSuccess: () => {
      void utils.character.list.invalidate();
      onCreated();
    },
    onError: (err) => setError(err.message),
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Please select an image file (JPEG, PNG, or WebP)");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("Image must be under 5 MB");
      return;
    }
    setError(null);
    setImageFile(file);
    const url = URL.createObjectURL(file);
    setImagePreview(url);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("Please enter a character name");
      return;
    }

    if (!imageFile) {
      setError("Please select a reference image");
      return;
    }

    try {
      setUploadProgress("uploading");

      const characterId = generateId();
      // Normalize image/jpg to image/jpeg (browsers may report either)
      const rawType = imageFile.type === "image/jpg" ? "image/jpeg" : imageFile.type;
      const contentType = rawType as "image/jpeg" | "image/png" | "image/webp";

      // 1. Get a presigned upload URL from our API
      const { uploadUrl, publicUrl } = await getUploadUrlMutation.mutateAsync({
        characterId,
        contentType,
      });

      // 2. Upload the image directly to R2
      const uploadRes = await fetch(uploadUrl, {
        method: "PUT",
        body: imageFile,
        headers: { "Content-Type": contentType },
      });

      if (!uploadRes.ok) {
        throw new Error("Failed to upload image. Please try again.");
      }

      setUploadProgress("done");

      // 3. Create the character record with the public URL
      await createMutation.mutateAsync({
        name: name.trim(),
        description: description.trim() || undefined,
        referenceImageUrl: publicUrl,
      });
    } catch (err) {
      setUploadProgress("idle");
      if (!(err instanceof Error && err.message.includes("TRPC"))) {
        setError(err instanceof Error ? err.message : "Something went wrong");
      }
    }
  };

  const isLoading =
    uploadProgress === "uploading" ||
    createMutation.isPending;

  return (
    /* Backdrop */
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <Card className="w-full max-w-md">
        <CardContent className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-white">New Character</h2>
            <button
              onClick={onClose}
              className="rounded-lg p-1 text-gray-400 hover:bg-surface-hover hover:text-white transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Image upload */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">
                Reference Image <span className="text-red-400">*</span>
              </label>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="relative w-full aspect-video rounded-xl border-2 border-dashed border-surface-border bg-surface hover:border-accent-400/50 transition-colors overflow-hidden"
              >
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center gap-2 p-6 text-gray-500">
                    <Upload className="h-8 w-8" />
                    <span className="text-sm">Click to upload an image</span>
                    <span className="text-xs">JPEG, PNG, WebP — max 5 MB</span>
                  </div>
                )}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>

            {/* Name */}
            <Input
              label="Character Name"
              placeholder="e.g. Captain Stark"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />

            {/* Description */}
            <Textarea
              label="Description (optional)"
              placeholder="Describe the character's appearance..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="resize-none"
            />

            {error && (
              <p className="text-sm text-red-400 bg-red-500/5 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-1">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={onClose}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="gradient"
                className="flex-1"
                loading={isLoading}
              >
                {uploadProgress === "uploading" ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <User2 className="h-4 w-4" />
                    Create Character
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * Video Editor router — available to paid users (creator / pro / studio) only.
 *
 * Users can:
 *  - Create a new editor project (blank or seeded with gallery videos)
 *  - Save the current edit state (clips, text overlays, audio)
 *  - List their projects
 *  - Get a specific project by ID
 *  - Delete a project
 *  - Get a presigned upload URL so they can add their own video files
 *  - Request an export (marks project as "exporting"; a background worker
 *    or FFmpeg API call assembles the final video)
 */

import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { router, protectedProcedure } from "../trpc";
import {
  createEditorProject,
  getEditorProjectById,
  updateEditorProject,
  getUserEditorProjects,
  deleteEditorProject,
} from "../../lib/db";
import { getPresignedUploadUrl, getPresignedDownloadUrl, buildEditorInputKey, buildEditorOutputKey } from "../../lib/r2";
import type { VideoEditorClip, VideoEditorTextOverlay } from "@videoforge/shared";

// ── Zod schemas ────────────────────────────────────────────────────────────────

const videoEditorClipSchema = z.object({
  id: z.string().min(1),
  sourceType: z.enum(["generated", "uploaded"]),
  sourceUrl: z.string().url(),
  generationId: z.string().optional(),
  uploadedR2Key: z.string().optional(),
  durationSeconds: z.number().positive(),
  trimStart: z.number().min(0),
  trimEnd: z.number().min(0),
  order: z.number().int().min(0),
  label: z.string().max(80).optional(),
});

const videoEditorTextOverlaySchema = z.object({
  id: z.string().min(1),
  text: z.string().min(1).max(200),
  startTime: z.number().min(0),
  endTime: z.number().min(0),
  position: z.enum(["top", "center", "bottom"]),
  fontSize: z.number().int().min(12).max(96),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  backgroundColor: z.string().regex(/^#[0-9A-Fa-f]{6}([0-9A-Fa-f]{2})?$/),
});

/** Middleware that blocks free-tier users from the editor */
function assertPaidUser(tier: string) {
  if (tier === "free") {
    throw new TRPCError({
      code: "FORBIDDEN",
      message:
        "The Video Editor is available on Creator, Pro, and Studio plans. Upgrade to unlock full editing features.",
    });
  }
}

// ── Router ─────────────────────────────────────────────────────────────────────

export const videoEditorRouter = router({
  /**
   * Create a new (blank) editor project.
   * Optionally seed it with one or more generated video clips from the gallery.
   */
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1).max(100).default("Untitled Project"),
        /** Optional list of generation IDs to pre-populate the timeline */
        seedGenerationIds: z.array(z.string()).max(20).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      assertPaidUser(ctx.user.tier);

      const { userId } = ctx;

      const project = await createEditorProject({
        userId,
        name: input.name,
        clips: [],
        textOverlays: [],
        backgroundAudioUrl: null,
        backgroundAudioVolume: 0.5,
        status: "draft",
        exportedVideoUrl: null,
        exportedR2Key: null,
        errorMessage: null,
        totalDurationSeconds: 0,
      });

      return project;
    }),

  /**
   * Get a single project by ID (must belong to the authenticated user).
   */
  getById: protectedProcedure
    .input(z.object({ projectId: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      assertPaidUser(ctx.user.tier);

      const project = await getEditorProjectById(input.projectId);
      if (!project) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Project not found" });
      }
      if (project.userId !== ctx.userId) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Not your project" });
      }
      return project;
    }),

  /**
   * List the authenticated user's editor projects (newest first, max 50).
   */
  list: protectedProcedure
    .input(z.object({ limit: z.number().int().min(1).max(50).default(20) }))
    .query(async ({ ctx, input }) => {
      assertPaidUser(ctx.user.tier);
      return getUserEditorProjects(ctx.userId, input.limit);
    }),

  /**
   * Persist the full editor state (clips, text overlays, audio settings).
   * This is a client-side auto-save; the project stays in "draft" status.
   */
  save: protectedProcedure
    .input(
      z.object({
        projectId: z.string().min(1),
        name: z.string().min(1).max(100).optional(),
        clips: z.array(videoEditorClipSchema),
        textOverlays: z.array(videoEditorTextOverlaySchema),
        backgroundAudioUrl: z.string().url().nullable().optional(),
        backgroundAudioVolume: z.number().min(0).max(1).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      assertPaidUser(ctx.user.tier);

      const project = await getEditorProjectById(input.projectId);
      if (!project) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Project not found" });
      }
      if (project.userId !== ctx.userId) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Not your project" });
      }

      const totalDurationSeconds = (input.clips as VideoEditorClip[]).reduce((sum, clip) => {
        const end = clip.trimEnd > 0 ? clip.trimEnd : clip.durationSeconds;
        return sum + (end - clip.trimStart);
      }, 0);

      await updateEditorProject(input.projectId, {
        ...(input.name !== undefined && { name: input.name }),
        clips: input.clips as VideoEditorClip[],
        textOverlays: input.textOverlays as VideoEditorTextOverlay[],
        ...(input.backgroundAudioUrl !== undefined && { backgroundAudioUrl: input.backgroundAudioUrl }),
        ...(input.backgroundAudioVolume !== undefined && { backgroundAudioVolume: input.backgroundAudioVolume }),
        totalDurationSeconds,
        status: "draft",
      });

      return { success: true, totalDurationSeconds };
    }),

  /**
   * Generate a presigned upload URL so the client can PUT a video file directly
   * to R2 without routing large payloads through the API server.
   *
   * Call `save` afterwards with a clip entry that references the returned
   * `publicUrl` so the project knows about the uploaded file.
   */
  getUploadUrl: protectedProcedure
    .input(
      z.object({
        projectId: z.string().min(1),
        clipId: z.string().min(1),
        fileName: z.string().min(1).max(255),
        contentType: z.string().regex(/^video\//, "Must be a video MIME type"),
        fileSizeBytes: z.number().int().positive().max(2 * 1024 * 1024 * 1024), // 2 GB
      })
    )
    .mutation(async ({ ctx, input }) => {
      assertPaidUser(ctx.user.tier);

      // Verify project ownership
      const project = await getEditorProjectById(input.projectId);
      if (!project) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Project not found" });
      }
      if (project.userId !== ctx.userId) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Not your project" });
      }

      const r2Key = buildEditorInputKey(ctx.userId, input.projectId, input.clipId);
      const uploadUrl = await getPresignedUploadUrl(r2Key, input.contentType, 900); // 15 min TTL
      const publicUrl = `${process.env.R2_PUBLIC_URL ?? ""}/${r2Key}`;

      return { uploadUrl, r2Key, publicUrl };
    }),

  /**
   * Request an export of the current project state.
   * Sets status to "exporting". A background worker (or FFmpeg webhook)
   * assembles the final video and updates the project with the output URL.
   *
   * For now also generates a signed download URL for the last exported video
   * when one already exists (instant re-download without re-render).
   */
  export: protectedProcedure
    .input(z.object({ projectId: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      assertPaidUser(ctx.user.tier);

      const project = await getEditorProjectById(input.projectId);
      if (!project) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Project not found" });
      }
      if (project.userId !== ctx.userId) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Not your project" });
      }
      if (project.clips.length === 0) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Add at least one clip before exporting.",
        });
      }

      // If a previous export exists return a fresh signed download URL immediately
      if (project.exportedR2Key && project.status === "exported") {
        const downloadUrl = await getPresignedDownloadUrl(
          project.exportedR2Key,
          `videoforge-edit-${input.projectId}.mp4`,
          3600
        );
        return { status: "exported" as const, downloadUrl };
      }

      // Mark as exporting so the UI can poll
      const outputR2Key = buildEditorOutputKey(ctx.userId, input.projectId);
      await updateEditorProject(input.projectId, {
        status: "exporting",
        exportedR2Key: outputR2Key,
        errorMessage: null,
      });

      return {
        status: "exporting" as const,
        downloadUrl: null,
        message:
          "Your video is being assembled. This may take a few minutes depending on the total duration.",
      };
    }),

  /**
   * Delete an editor project (and its associated Firestore document).
   * R2 objects are NOT deleted here; a scheduled cleanup job handles orphaned files.
   */
  delete: protectedProcedure
    .input(z.object({ projectId: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      assertPaidUser(ctx.user.tier);

      const project = await getEditorProjectById(input.projectId);
      if (!project) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Project not found" });
      }
      if (project.userId !== ctx.userId) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Not your project" });
      }

      await deleteEditorProject(input.projectId);
      return { success: true };
    }),
});

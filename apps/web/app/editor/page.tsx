"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Film, Plus, Lock, Trash2, Pencil, Loader2 } from "lucide-react";
import { AppLayout } from "@/components/layout/app-layout";
import { Header } from "@/components/layout/header";
import { VideoEditor } from "@/components/editor/video-editor";
import { Button, Card, CardContent } from "@videoforge/ui";
import { trpc } from "@/lib/trpc/client";
import type { VideoEditorProject } from "@videoforge/shared";

function ProjectCard({
  project,
  onOpen,
  onDelete,
}: {
  project: VideoEditorProject;
  onOpen: () => void;
  onDelete: () => void;
}) {
  return (
    <Card
      className="cursor-pointer hover:border-accent-400/50 transition-colors"
      onClick={onOpen}
    >
      <CardContent className="flex items-center justify-between p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent-400/10">
            <Film className="h-5 w-5 text-accent-400" />
          </div>
          <div>
            <p className="text-sm font-medium text-white">{project.name}</p>
            <p className="text-xs text-gray-500">
              {project.clips.length} clip{project.clips.length !== 1 ? "s" : ""} ·{" "}
              {project.status === "draft"
                ? "Draft"
                : project.status === "exporting"
                ? "Exporting…"
                : project.status === "exported"
                ? "Exported"
                : "Failed"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onOpen();
            }}
            className="rounded-lg border border-surface-border p-1.5 text-gray-400 hover:text-white hover:border-gray-500"
            title="Edit project"
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="rounded-lg border border-surface-border p-1.5 text-gray-400 hover:text-red-400 hover:border-red-400/30"
            title="Delete project"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </CardContent>
    </Card>
  );
}

export default function EditorPage() {
  const router = useRouter();
  const { data: user, isLoading: userLoading } = trpc.user.me.useQuery();
  const { data: projects, isLoading: projectsLoading, refetch } = trpc.videoEditor.list.useQuery(
    { limit: 20 },
    // Only run if user is paid — avoids tRPC FORBIDDEN error flash
    { enabled: !!user && user.tier !== "free" }
  );
  const createMutation = trpc.videoEditor.create.useMutation({
    onSuccess: (project) => {
      setActiveProjectId(project.id);
    },
  });
  const deleteMutation = trpc.videoEditor.delete.useMutation({
    onSuccess: () => void refetch(),
  });

  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const isPaidUser = user && user.tier !== "free";

  const handleCreateProject = async () => {
    setIsCreating(true);
    try {
      await createMutation.mutateAsync({ name: "Untitled Project" });
    } finally {
      setIsCreating(false);
    }
  };

  // Loading state
  if (userLoading) {
    return (
      <AppLayout>
        <div className="flex h-full items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-accent-400" />
        </div>
      </AppLayout>
    );
  }

  // Paid-only gate
  if (!isPaidUser) {
    return (
      <AppLayout>
        <Header
          title="Video Editor"
          description="Professional video editing — trim, merge, add text overlays and audio"
        />
        <div className="flex flex-1 items-center justify-center p-8">
          <div className="max-w-md text-center space-y-6">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-accent-400/10 mx-auto">
              <Lock className="h-8 w-8 text-accent-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Video Editor — Paid Plans Only</h2>
              <p className="mt-2 text-sm text-gray-400">
                The full-featured video editor is available exclusively on Creator, Pro, and Studio
                plans. Trim clips, merge multiple videos, add text overlays and background audio,
                then export a polished final cut.
              </p>
            </div>
            <ul className="text-left space-y-2 text-sm text-gray-300">
              {[
                "Trim & cut clips with frame-accurate controls",
                "Merge AI-generated and your own uploaded videos",
                "Add text overlays with custom fonts and positions",
                "Layer background audio with volume control",
                "Export to MP4 — ready to share anywhere",
                "Auto-save projects so you never lose your work",
              ].map((f) => (
                <li key={f} className="flex items-start gap-2">
                  <span className="text-accent-400 mt-0.5">✓</span>
                  {f}
                </li>
              ))}
            </ul>
            <Button
              variant="gradient"
              size="lg"
              onClick={() => router.push("/pricing")}
            >
              Upgrade to Unlock Editor
            </Button>
          </div>
        </div>
      </AppLayout>
    );
  }

  // Active project — show the editor
  if (activeProjectId) {
    return (
      <AppLayout>
        <Header
          title="Video Editor"
          description="Trim, merge, and polish your videos"
        />
        <div className="p-4 border-b border-surface-border">
          <button
            type="button"
            onClick={() => setActiveProjectId(null)}
            className="text-xs text-accent-400 hover:text-accent-300 flex items-center gap-1"
          >
            ← Back to projects
          </button>
        </div>
        <div className="flex-1 overflow-hidden p-6" style={{ height: "calc(100vh - 160px)" }}>
          <VideoEditor projectId={activeProjectId} />
        </div>
      </AppLayout>
    );
  }

  // Project list view
  return (
    <AppLayout>
      <Header
        title="Video Editor"
        description="Create and manage your video editing projects"
      />
      <div className="p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-white">
            Your Projects
          </h2>
          <Button
            variant="gradient"
            size="sm"
            onClick={() => void handleCreateProject()}
            loading={isCreating}
            disabled={isCreating}
          >
            <Plus className="h-4 w-4" />
            New Project
          </Button>
        </div>

        {projectsLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-accent-400" />
          </div>
        ) : !projects || projects.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-surface-border py-20 text-center">
            <Film className="h-12 w-12 text-gray-600 mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">
              No projects yet
            </h3>
            <p className="text-sm text-gray-400 max-w-xs mb-6">
              Create a new project to start editing. You can combine AI-generated videos with
              your own uploads, trim clips, and add text overlays.
            </p>
            <Button
              variant="gradient"
              onClick={() => void handleCreateProject()}
              loading={isCreating}
            >
              <Plus className="h-4 w-4" />
              Create First Project
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {projects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onOpen={() => setActiveProjectId(project.id)}
                onDelete={() => void deleteMutation.mutateAsync({ projectId: project.id })}
              />
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}

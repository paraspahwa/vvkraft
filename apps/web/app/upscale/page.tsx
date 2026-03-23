"use client";

import { useState } from "react";
import { ArrowUpCircle, History } from "lucide-react";
import { AppLayout } from "@/components/layout/app-layout";
import { Header } from "@/components/layout/header";
import { UpscalerForm } from "@/components/upscaler/upscaler-form";
import { UpscaleStatusCard } from "@/components/upscaler/upscale-status-card";
import type { VideoUpscaleJob } from "@videoforge/shared";

export default function UpscalePage() {
  const [activeJobIds, setActiveJobIds] = useState<string[]>([]);
  const [completedJobs, setCompletedJobs] = useState<VideoUpscaleJob[]>([]);

  const handleSuccess = (jobId: string) => {
    setActiveJobIds((prev) => [jobId, ...prev]);
  };

  const handleComplete = (job: VideoUpscaleJob) => {
    setActiveJobIds((prev) => prev.filter((id) => id !== job.id));
    setCompletedJobs((prev) => [job, ...prev]);
  };

  return (
    <AppLayout>
      <Header
        title="Upscale to 4K"
        description="Enhance your videos to stunning 4K resolution using AI"
      />

      <div className="p-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Form column */}
          <div>
            <UpscalerForm onSuccess={handleSuccess} />
          </div>

          {/* Status column */}
          <div className="space-y-4">
            {activeJobIds.length === 0 && completedJobs.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-surface-border py-20 text-center">
                <ArrowUpCircle className="h-12 w-12 text-gray-600 mb-4" />
                <h3 className="text-lg font-medium text-white mb-2">
                  Your upscaled videos will appear here
                </h3>
                <p className="text-sm text-gray-400 max-w-xs">
                  Upload a video and click &ldquo;Upscale to 4K&rdquo; to start enhancing
                </p>
              </div>
            ) : (
              <>
                {activeJobIds.length > 0 && (
                  <div className="space-y-3">
                    <h2 className="text-sm font-medium text-gray-400 flex items-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-accent-400 animate-pulse" />
                      In Progress
                    </h2>
                    {activeJobIds.map((id) => (
                      <UpscaleStatusCard
                        key={id}
                        jobId={id}
                        onComplete={handleComplete}
                      />
                    ))}
                  </div>
                )}

                {completedJobs.length > 0 && (
                  <div className="space-y-3">
                    <h2 className="text-sm font-medium text-gray-400 flex items-center gap-2">
                      <History className="h-3.5 w-3.5" />
                      Completed
                    </h2>
                    {completedJobs.map((job) => (
                      <UpscaleStatusCard key={job.id} jobId={job.id} />
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

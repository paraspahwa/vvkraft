"use client";

import { useState } from "react";
import { Wand2, History } from "lucide-react";
import { AppLayout } from "@/components/layout/app-layout";
import { Header } from "@/components/layout/header";
import { GenerationForm } from "@/components/generation/generation-form";
import { GenerationStatusCard } from "@/components/generation/generation-status-card";
import type { Generation } from "@videoforge/shared";

export default function GeneratePage() {
  const [activeGenerationIds, setActiveGenerationIds] = useState<string[]>([]);
  const [completedGenerations, setCompletedGenerations] = useState<Generation[]>([]);

  const handleGenerationSuccess = (generationId: string) => {
    setActiveGenerationIds((prev) => [generationId, ...prev]);
  };

  const handleGenerationComplete = (generation: Generation) => {
    setActiveGenerationIds((prev) => prev.filter((id) => id !== generation.id));
    setCompletedGenerations((prev) => [generation, ...prev]);
  };

  return (
    <AppLayout>
      <Header
        title="Generate"
        description="Create AI-powered videos from text prompts"
      />

      <div className="p-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Form column */}
          <div className="space-y-6">
            <GenerationForm onSuccess={handleGenerationSuccess} />
          </div>

          {/* Status column */}
          <div className="space-y-4">
            {activeGenerationIds.length === 0 && completedGenerations.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-surface-border py-20 text-center">
                <Wand2 className="h-12 w-12 text-gray-600 mb-4" />
                <h3 className="text-lg font-medium text-white mb-2">Your videos will appear here</h3>
                <p className="text-sm text-gray-400 max-w-xs">
                  Fill in the form and click Generate to start creating your AI video
                </p>
              </div>
            ) : (
              <>
                {activeGenerationIds.length > 0 && (
                  <div className="space-y-3">
                    <h2 className="text-sm font-medium text-gray-400 flex items-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-accent-400 animate-pulse" />
                      In Progress
                    </h2>
                    {activeGenerationIds.map((id) => (
                      <GenerationStatusCard
                        key={id}
                        generationId={id}
                        onComplete={handleGenerationComplete}
                      />
                    ))}
                  </div>
                )}

                {completedGenerations.length > 0 && (
                  <div className="space-y-3">
                    <h2 className="text-sm font-medium text-gray-400 flex items-center gap-2">
                      <History className="h-3.5 w-3.5" />
                      Completed
                    </h2>
                    {completedGenerations.map((gen) => (
                      <GenerationStatusCard key={gen.id} generationId={gen.id} />
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

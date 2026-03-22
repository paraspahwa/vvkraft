"use client";

import { useState, useCallback } from "react";
import { trpc } from "@/lib/trpc/client";
import type { GenerationRequestInput } from "@videoforge/shared";

export function useGeneration() {
  const utils = trpc.useUtils();
  const createMutation = trpc.generation.create.useMutation({
    onSuccess: () => {
      void utils.generation.list.invalidate();
    },
  });

  const generate = useCallback(
    async (input: GenerationRequestInput) => {
      return createMutation.mutateAsync(input);
    },
    [createMutation]
  );

  return {
    generate,
    isGenerating: createMutation.isPending,
    error: createMutation.error,
    data: createMutation.data,
    reset: createMutation.reset,
  };
}

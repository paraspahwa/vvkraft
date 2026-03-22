"use client";

import { useAuth } from "@/components/auth/auth-provider";
import { trpc } from "@/lib/trpc/client";

/**
 * Returns tRPC utils with auth headers injected automatically
 * Use this hook in components that need authenticated tRPC calls
 */
export function useTrpcAuth() {
  const { getIdToken } = useAuth();
  return { getIdToken };
}

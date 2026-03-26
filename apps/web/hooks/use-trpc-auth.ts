"use client";

import { useAuth } from "@/components/auth/auth-provider";

/**
 * Returns auth context for components that need authenticated state.
 * Better Auth manages sessions via cookies automatically.
 */
export function useTrpcAuth() {
  const { user } = useAuth();
  return { user };
}

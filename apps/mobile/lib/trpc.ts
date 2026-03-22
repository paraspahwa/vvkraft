import { createTRPCReact } from "@trpc/react-query";
import type { AppRouter } from "@videoforge/web/server/routers/_app";

// Re-export types for use across the mobile app
export type { AppRouter };

// tRPC client for the mobile app
export const trpc = createTRPCReact<AppRouter>();

export function getApiUrl() {
  return process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:3000";
}

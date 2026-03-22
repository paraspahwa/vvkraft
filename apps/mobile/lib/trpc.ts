import { createTRPCReact } from "@trpc/react-query";
// AppRouter is imported as a type-only from the web app's dedicated export point.
// No server-side (Node.js-only) code is pulled in — TypeScript erases type imports at runtime.
import type { AppRouter } from "@videoforge/web/types/api";

// Re-export types for use across the mobile app
export type { AppRouter };

// tRPC client for the mobile app
export const trpc = createTRPCReact<AppRouter>();

export function getApiUrl() {
  return process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:3000";
}

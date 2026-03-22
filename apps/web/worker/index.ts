/**
 * Worker entry point.
 * Starts all BullMQ workers and handles graceful shutdown.
 *
 * Run with:
 *   npm run worker        (from apps/web)
 *   or: tsx --tsconfig tsconfig.json -r tsconfig-paths/register worker/index.ts
 */

import "dotenv/config";
import { createVideoGenerationWorker } from "./video-generation";

// Configure fal.ai credentials before any worker imports
process.env.FAL_KEY = process.env.FAL_KEY ?? "";

console.log("[workers] Starting VideoForge background workers...");

const videoWorker = createVideoGenerationWorker();

console.log("[workers] ✓ Video generation worker is running");
console.log("[workers] Waiting for jobs... (Ctrl+C to stop)");

// Graceful shutdown on SIGTERM/SIGINT
async function shutdown(): Promise<void> {
  console.log("\n[workers] Shutting down gracefully...");
  await videoWorker.close();
  console.log("[workers] All workers stopped.");
  process.exit(0);
}

process.on("SIGTERM", () => void shutdown());
process.on("SIGINT", () => void shutdown());

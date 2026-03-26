/**
 * Admin / Price-Control Dashboard router.
 *
 * Provides real-time per-user and platform-wide metrics:
 *   - Revenue per user
 *   - GPU cost per user
 *   - Videos generated
 *   - Retry rate
 *   - GPU usage (seconds)
 *
 * Auto-downgrade rule: if gpuCostUsd > revenueUsd for a user, the system
 * flags them for quality downgrade, queue slowdown, and usage limits.
 * The Python cost_optimizer.py enforces the actual degradation at render time;
 * this router surfaces the decisions and lets admins review/override them.
 */

import { z } from "zod";
import { router, adminProcedure } from "../trpc";
import { supabase } from "../../lib/supabase";
import type { AdminUserMetrics, PlatformMetrics, SubscriptionTier } from "@videoforge/shared";

// ── INR → USD conversion (fixed for margin calculations) ─────────────────────
const INR_TO_USD = 1 / 84; // 1 USD ≈ 84 INR

/** Monthly subscription revenue (INR) per internal tier */
const PLAN_REVENUE_INR: Record<SubscriptionTier, number> = {
  free: 0,
  creator: 199,   // Starter
  pro: 499,       // Creator
  studio: 999,    // Pro
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function inrToUsd(inr: number): number {
  return inr * INR_TO_USD;
}

async function buildUserMetrics(userId: string): Promise<AdminUserMetrics> {
  const [userResult, generationsResult] = await Promise.all([
    supabase.from("users").select("*").eq("id", userId).single(),
    supabase
      .from("generations")
      .select("*")
      .eq("user_id", userId)
      .gte("created_at", new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()),
  ]);

  const userData = userResult.data ?? {};
  const tier = (userData["tier"] ?? "free") as SubscriptionTier;
  const email = (userData["email"] ?? "") as string;

  const generations = generationsResult.data ?? [];

  let videosGenerated = 0;
  let totalGpuSeconds = 0;
  let failedScenes = 0;
  let totalScenes = 0;
  let totalActualCostUsd = 0;

  for (const data of generations) {
    if (data["status"] === "completed") {
      videosGenerated += 1;
    }
    totalActualCostUsd += (data["actual_cost_usd"] as number) ?? 0;
    const dur = (data["duration_seconds"] as number) ?? 0;
    totalGpuSeconds += dur * 3;
    if (data["status"] === "failed") failedScenes += 1;
    totalScenes += 1;
  }

  const revenueInr = PLAN_REVENUE_INR[tier];
  const revenueUsd = inrToUsd(revenueInr);
  // Fall back to estimated cost if actualCostUsd not yet tracked
  const gpuCostUsd =
    totalActualCostUsd > 0 ? totalActualCostUsd : totalGpuSeconds * 0.00036;
  const netMarginUsd = revenueUsd - gpuCostUsd;
  const retryRate = totalScenes > 0 ? failedScenes / totalScenes : 0;
  const isDowngraded = gpuCostUsd > revenueUsd;

  return {
    userId,
    email,
    tier,
    revenueInr,
    revenueUsd: Math.round(revenueUsd * 100) / 100,
    gpuCostUsd: Math.round(gpuCostUsd * 10000) / 10000,
    netMarginUsd: Math.round(netMarginUsd * 100) / 100,
    videosGenerated,
    retryRate: Math.round(retryRate * 1000) / 1000,
    gpuUsageSeconds: Math.round(totalGpuSeconds),
    isDowngraded,
    updatedAt: new Date(),
  };
}

// ── Router ────────────────────────────────────────────────────────────────────

export const adminRouter = router({
  /**
   * Platform-wide summary metrics for the current billing month.
   * Aggregates all users in the `users` collection.
   */
  platformMetrics: adminProcedure.query(async (): Promise<PlatformMetrics> => {
    const now = new Date();
    const periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const usersResult = await supabase.from("users").select("id");
    const userIds = (usersResult.data ?? []).map((d) => d["id"] as string);

    // Build metrics in parallel (cap batch at 50 for Firestore read limits)
    const batchSize = 50;
    const allMetrics: AdminUserMetrics[] = [];
    for (let i = 0; i < userIds.length; i += batchSize) {
      const batch = userIds.slice(i, i + batchSize);
      const batchMetrics = await Promise.all(batch.map(buildUserMetrics));
      allMetrics.push(...batchMetrics);
    }

    const totals = allMetrics.reduce(
      (acc, m) => ({
        totalRevenueInr: acc.totalRevenueInr + m.revenueInr,
        totalRevenueUsd: acc.totalRevenueUsd + m.revenueUsd,
        totalGpuCostUsd: acc.totalGpuCostUsd + m.gpuCostUsd,
        totalNetMarginUsd: acc.totalNetMarginUsd + m.netMarginUsd,
        totalVideosGenerated: acc.totalVideosGenerated + m.videosGenerated,
        activeUsers:
          acc.activeUsers + (m.videosGenerated > 0 ? 1 : 0),
        retryRateSum: acc.retryRateSum + m.retryRate,
        downgradedUsers: acc.downgradedUsers + (m.isDowngraded ? 1 : 0),
      }),
      {
        totalRevenueInr: 0,
        totalRevenueUsd: 0,
        totalGpuCostUsd: 0,
        totalNetMarginUsd: 0,
        totalVideosGenerated: 0,
        activeUsers: 0,
        retryRateSum: 0,
        downgradedUsers: 0,
      }
    );

    return {
      totalRevenueInr: Math.round(totals.totalRevenueInr),
      totalRevenueUsd: Math.round(totals.totalRevenueUsd * 100) / 100,
      totalGpuCostUsd: Math.round(totals.totalGpuCostUsd * 100) / 100,
      totalNetMarginUsd: Math.round(totals.totalNetMarginUsd * 100) / 100,
      totalVideosGenerated: totals.totalVideosGenerated,
      activeUsers: totals.activeUsers,
      averageRetryRate:
        allMetrics.length > 0
          ? Math.round((totals.retryRateSum / allMetrics.length) * 1000) / 1000
          : 0,
      downgradedUsers: totals.downgradedUsers,
      periodStart,
      periodEnd,
    };
  }),

  /**
   * Paginated per-user metrics table.
   * Supports filtering by auto-downgraded status and sorting by margin.
   */
  userMetrics: adminProcedure
    .input(
      z.object({
        limit: z.number().int().min(1).max(100).default(20),
        onlyDowngraded: z.boolean().default(false),
      })
    )
    .query(async ({ input }): Promise<AdminUserMetrics[]> => {
      const usersResult = await supabase
        .from("users")
        .select("id")
        .limit(200);

      const userIds = (usersResult.data ?? []).map((d) => d["id"] as string);
      const allMetrics = await Promise.all(userIds.map(buildUserMetrics));

      let result = input.onlyDowngraded
        ? allMetrics.filter((m) => m.isDowngraded)
        : allMetrics;

      // Sort by net margin ascending (worst first — most urgent to review)
      result.sort((a, b) => a.netMarginUsd - b.netMarginUsd);

      return result.slice(0, input.limit);
    }),

  /**
   * Get metrics for a single user.
   */
  userMetricById: adminProcedure
    .input(z.object({ userId: z.string().min(1) }))
    .query(async ({ input }): Promise<AdminUserMetrics> => {
      return buildUserMetrics(input.userId);
    }),

  /**
   * Manually trigger a downgrade flag for a specific user.
   * Stored in Firestore and read by the Python cost_optimizer at next render.
   */
  setDowngradeFlag: adminProcedure
    .input(
      z.object({
        userId: z.string().min(1),
        downgraded: z.boolean(),
        reason: z.string().max(200).optional(),
      })
    )
    .mutation(async ({ input }) => {
      await supabase.from("users").update({
        admin_downgraded: input.downgraded,
        admin_downgrade_reason: input.reason ?? null,
        admin_downgraded_at: new Date().toISOString(),
      }).eq("id", input.userId);
      return { success: true };
    }),
});

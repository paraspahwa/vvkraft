import { z } from "zod";
import { router, protectedProcedure } from "../trpc";
import { userProfileUpdateSchema } from "@videoforge/shared";
import { updateUser, getUserById } from "../../lib/db";
import { supabase } from "../../lib/supabase";

export const userRouter = router({
  // Get current user profile
  me: protectedProcedure.query(async ({ ctx }) => {
    return ctx.user;
  }),

  // Update profile
  updateProfile: protectedProcedure
    .input(userProfileUpdateSchema)
    .mutation(async ({ ctx, input }) => {
      await updateUser(ctx.userId, input);
      return getUserById(ctx.userId);
    }),

  // Get credit transaction history
  creditHistory: protectedProcedure
    .input(z.object({ limit: z.number().min(1).max(50).default(20) }))
    .query(async ({ ctx, input }) => {
      const { data, error } = await supabase
        .from("credit_transactions")
        .select("*")
        .eq("user_id", ctx.userId)
        .order("created_at", { ascending: false })
        .limit(input.limit);

      if (error) throw new Error(error.message);

      return (data ?? []).map((row) => ({
        id: row["id"],
        ...row,
        createdAt: new Date(row["created_at"]),
      }));
    }),

  // Get usage stats
  stats: protectedProcedure.query(async ({ ctx }) => {
    const { count: totalGenerations } = await supabase
      .from("generations")
      .select("*", { count: "exact", head: true })
      .eq("user_id", ctx.userId)
      .eq("status", "completed");

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const { count: generationsThisMonth } = await supabase
      .from("generations")
      .select("*", { count: "exact", head: true })
      .eq("user_id", ctx.userId)
      .gte("created_at", startOfMonth.toISOString());

    return {
      totalGenerations: totalGenerations ?? 0,
      generationsThisMonth: generationsThisMonth ?? 0,
      credits: ctx.user.credits,
      tier: ctx.user.tier,
    };
  }),
});

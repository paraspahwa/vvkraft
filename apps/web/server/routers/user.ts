import { z } from "zod";
import { router, protectedProcedure } from "../trpc";
import { userProfileUpdateSchema } from "@videoforge/shared";
import { updateUser, getUserById } from "@/lib/db";
import { adminDb } from "@/lib/firebase-admin";

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
      const snapshot = await adminDb
        .collection("creditTransactions")
        .where("userId", "==", ctx.userId)
        .orderBy("createdAt", "desc")
        .limit(input.limit)
        .get();

      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data()["createdAt"].toDate(),
      }));
    }),

  // Get usage stats
  stats: protectedProcedure.query(async ({ ctx }) => {
    const [generationsSnap] = await Promise.all([
      adminDb
        .collection("generations")
        .where("userId", "==", ctx.userId)
        .where("status", "==", "completed")
        .get(),
    ]);

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const thisMonthSnap = await adminDb
      .collection("generations")
      .where("userId", "==", ctx.userId)
      .where("createdAt", ">=", startOfMonth)
      .get();

    return {
      totalGenerations: generationsSnap.size,
      generationsThisMonth: thisMonthSnap.size,
      credits: ctx.user.credits,
      tier: ctx.user.tier,
    };
  }),
});

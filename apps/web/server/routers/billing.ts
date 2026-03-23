import crypto from "crypto";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import Razorpay from "razorpay";
import { router, protectedProcedure } from "../trpc";
import { updateUser, addCredits } from "../../lib/db";
import { PRICING_PLANS } from "../../lib/pricing";
import { TIER_LIMITS } from "@videoforge/shared";
import type { SubscriptionTier } from "@videoforge/shared";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID ?? "",
  key_secret: process.env.RAZORPAY_KEY_SECRET ?? "",
});

// Credit packs available for purchase — Global (USD)
const CREDIT_PACKS = [
  { credits: 50, priceUsd: 5, label: "50 credits" },
  { credits: 150, priceUsd: 14, label: "150 credits" },
  { credits: 500, priceUsd: 40, label: "500 credits" },
  { credits: 1500, priceUsd: 100, label: "1500 credits" },
] as const;

// Credit packs for India region (INR) — PPP-adjusted pricing
const CREDIT_PACKS_INR = [
  { credits: 50, priceInr: 399, label: "50 credits" },
  { credits: 150, priceInr: 999, label: "150 credits" },
  { credits: 500, priceInr: 2999, label: "500 credits" },
  { credits: 1500, priceInr: 7499, label: "1500 credits" },
] as const;

export const billingRouter = router({
  // Get available plans
  plans: protectedProcedure.query(() => {
    return PRICING_PLANS.map((plan) => ({
      ...plan,
      razorpayPlanIdMonthly: plan.razorpayPlanIdMonthly ? "configured" : null,
      razorpayPlanIdYearly: plan.razorpayPlanIdYearly ? "configured" : null,
      razorpayPlanIdMonthlyInr: plan.razorpayPlanIdMonthlyInr ? "configured" : null,
      razorpayPlanIdYearlyInr: plan.razorpayPlanIdYearlyInr ? "configured" : null,
    }));
  }),

  // Get credit pack options (returns both USD and INR packs)
  creditPacks: protectedProcedure.query(() => ({
    usd: CREDIT_PACKS,
    inr: CREDIT_PACKS_INR,
  })),

  // Create Razorpay subscription for plan upgrade
  createSubscriptionCheckout: protectedProcedure
    .input(
      z.object({
        tier: z.enum(["creator", "pro", "studio"]),
        billingPeriod: z.enum(["monthly", "yearly"]),
        region: z.enum(["global", "india"]).default("global"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const plan = PRICING_PLANS.find((p) => p.tier === input.tier);
      if (!plan) throw new TRPCError({ code: "BAD_REQUEST", message: "Invalid plan" });

      const isIndia = input.region === "india";
      const planId = isIndia
        ? (input.billingPeriod === "monthly" ? plan.razorpayPlanIdMonthlyInr : plan.razorpayPlanIdYearlyInr)
        : (input.billingPeriod === "monthly" ? plan.razorpayPlanIdMonthly : plan.razorpayPlanIdYearly);

      if (!planId) throw new TRPCError({ code: "BAD_REQUEST", message: "Plan not configured" });

      const subscription = await razorpay.subscriptions.create({
        plan_id: planId,
        customer_notify: 1,
        total_count: input.billingPeriod === "yearly" ? 10 : 120,
        notes: {
          userId: ctx.userId,
          tier: input.tier,
          region: input.region,
        },
      });

      const amount = isIndia
        ? (input.billingPeriod === "monthly" ? plan.monthlyPriceInr * 100 : plan.yearlyPriceInr * 12 * 100)
        : (input.billingPeriod === "monthly" ? plan.monthlyPriceUsd * 100 : plan.yearlyPriceUsd * 12 * 100);

      return {
        subscriptionId: subscription.id,
        planId,
        tier: input.tier,
        keyId: process.env.RAZORPAY_KEY_ID ?? "",
        userEmail: ctx.user.email,
        userName: ctx.user.displayName ?? "",
        amount,
        currency: isIndia ? "INR" : "USD",
        region: input.region,
      };
    }),

  // Verify subscription payment after Razorpay checkout completes
  verifySubscriptionPayment: protectedProcedure
    .input(
      z.object({
        razorpayPaymentId: z.string(),
        razorpaySubscriptionId: z.string(),
        razorpaySignature: z.string(),
        tier: z.enum(["creator", "pro", "studio"]),
        region: z.enum(["global", "india"]).default("global"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const expectedSignature = crypto
        .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET ?? "")
        .update(`${input.razorpayPaymentId}|${input.razorpaySubscriptionId}`)
        .digest("hex");

      if (expectedSignature !== input.razorpaySignature) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Invalid payment signature" });
      }

      const tier = input.tier as SubscriptionTier;
      // India plans receive fewer included credits (PPP-adjusted)
      const credits = input.region === "india"
        ? TIER_LIMITS[tier].includedCreditsIndia
        : TIER_LIMITS[tier].includedCredits;

      const payment = await razorpay.payments.fetch(input.razorpayPaymentId);

      await updateUser(ctx.userId, {
        tier,
        razorpaySubscriptionId: input.razorpaySubscriptionId,
        razorpayCustomerId: (payment as unknown as Record<string, unknown>)["customer_id"] as string | null ?? null,
      });

      if (credits > 0) {
        await addCredits(
          ctx.userId,
          credits,
          "subscription",
          `${tier} plan monthly credits${input.region === "india" ? " (India)" : ""}`,
          input.razorpayPaymentId
        );
      }

      return { success: true, tier };
    }),

  // Create Razorpay order for one-time credit purchase
  createCreditCheckout: protectedProcedure
    .input(z.object({
      credits: z.number().int().positive(),
      region: z.enum(["global", "india"]).default("global"),
    }))
    .mutation(async ({ ctx, input }) => {
      const isIndia = input.region === "india";

      if (isIndia) {
        const pack = CREDIT_PACKS_INR.find((p) => p.credits === input.credits);
        if (!pack) throw new TRPCError({ code: "BAD_REQUEST", message: "Invalid credit pack" });

        const order = await razorpay.orders.create({
          amount: pack.priceInr * 100, // amount in paise
          currency: "INR",
          receipt: `credits_${ctx.userId}_${Date.now()}`,
          notes: {
            userId: ctx.userId,
            creditAmount: pack.credits.toString(),
            label: pack.label,
            region: "india",
          },
        });

        return {
          orderId: order.id,
          amount: order.amount,
          currency: order.currency,
          keyId: process.env.RAZORPAY_KEY_ID ?? "",
          userEmail: ctx.user.email,
          userName: ctx.user.displayName ?? "",
          credits: pack.credits,
          label: pack.label,
        };
      }

      const pack = CREDIT_PACKS.find((p) => p.credits === input.credits);
      if (!pack) throw new TRPCError({ code: "BAD_REQUEST", message: "Invalid credit pack" });

      const order = await razorpay.orders.create({
        amount: pack.priceUsd * 100, // amount in cents
        currency: "USD",
        receipt: `credits_${ctx.userId}_${Date.now()}`,
        notes: {
          userId: ctx.userId,
          creditAmount: pack.credits.toString(),
          label: pack.label,
        },
      });

      return {
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        keyId: process.env.RAZORPAY_KEY_ID ?? "",
        userEmail: ctx.user.email,
        userName: ctx.user.displayName ?? "",
        credits: pack.credits,
        label: pack.label,
      };
    }),

  // Verify credit purchase payment after Razorpay checkout completes
  verifyCreditPayment: protectedProcedure
    .input(
      z.object({
        razorpayPaymentId: z.string(),
        razorpayOrderId: z.string(),
        razorpaySignature: z.string(),
        credits: z.number().int().positive(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const expectedSignature = crypto
        .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET ?? "")
        .update(`${input.razorpayOrderId}|${input.razorpayPaymentId}`)
        .digest("hex");

      if (expectedSignature !== input.razorpaySignature) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Invalid payment signature" });
      }

      const packUsd = CREDIT_PACKS.find((p) => p.credits === input.credits);
      const packInr = CREDIT_PACKS_INR.find((p) => p.credits === input.credits);
      if (!packUsd && !packInr) throw new TRPCError({ code: "BAD_REQUEST", message: "Invalid credit pack" });

      const label = packUsd?.label ?? packInr?.label ?? `${input.credits} credits`;

      await addCredits(
        ctx.userId,
        input.credits,
        "purchase",
        `Purchased ${input.credits} credits (${label})`,
        input.razorpayPaymentId
      );

      return { success: true, credits: input.credits };
    }),

  // Cancel active subscription
  cancelSubscription: protectedProcedure.mutation(async ({ ctx }) => {
    if (!ctx.user.razorpaySubscriptionId) {
      throw new TRPCError({ code: "BAD_REQUEST", message: "No active subscription found" });
    }

    await razorpay.subscriptions.cancel(ctx.user.razorpaySubscriptionId, false);

    await updateUser(ctx.userId, {
      razorpaySubscriptionId: null,
    });

    return { success: true };
  }),
});

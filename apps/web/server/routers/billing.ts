import { z } from "zod";
import { TRPCError } from "@trpc/server";
import Stripe from "stripe";
import { router, protectedProcedure } from "../trpc";
import { updateUser } from "@/lib/db";
import { PRICING_PLANS } from "@/lib/pricing";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "", {
  apiVersion: "2024-06-20",
});

// Credit packs available for purchase (credits → price in cents)
const CREDIT_PACKS = [
  { credits: 50, priceUsd: 5, label: "50 credits" },
  { credits: 150, priceUsd: 14, label: "150 credits" },
  { credits: 500, priceUsd: 40, label: "500 credits" },
  { credits: 1500, priceUsd: 100, label: "1500 credits" },
] as const;

export const billingRouter = router({
  // Get available plans
  plans: protectedProcedure.query(() => {
    return PRICING_PLANS.map((plan) => ({
      ...plan,
      // Don't expose internal Stripe price IDs to client in full
      stripePriceIdMonthly: plan.stripePriceIdMonthly ? "configured" : null,
      stripePriceIdYearly: plan.stripePriceIdYearly ? "configured" : null,
    }));
  }),

  // Get credit pack options
  creditPacks: protectedProcedure.query(() => CREDIT_PACKS),

  // Create Stripe checkout session for subscription
  createSubscriptionCheckout: protectedProcedure
    .input(
      z.object({
        tier: z.enum(["creator", "pro", "studio"]),
        billingPeriod: z.enum(["monthly", "yearly"]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const plan = PRICING_PLANS.find((p) => p.tier === input.tier);
      if (!plan) throw new TRPCError({ code: "BAD_REQUEST", message: "Invalid plan" });

      const priceId =
        input.billingPeriod === "monthly"
          ? plan.stripePriceIdMonthly
          : plan.stripePriceIdYearly;

      if (!priceId) throw new TRPCError({ code: "BAD_REQUEST", message: "Plan not configured" });

      // Get or create Stripe customer
      let customerId = ctx.user.stripeCustomerId;
      if (!customerId) {
        const customer = await stripe.customers.create({
          email: ctx.user.email,
          name: ctx.user.displayName ?? undefined,
          metadata: { userId: ctx.userId },
        });
        customerId = customer.id;
        await updateUser(ctx.userId, { stripeCustomerId: customerId });
      }

      const session = await stripe.checkout.sessions.create({
        customer: customerId,
        mode: "subscription",
        line_items: [{ price: priceId, quantity: 1 }],
        success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?upgraded=true`,
        cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing`,
        metadata: { userId: ctx.userId, tier: input.tier },
      });

      return { url: session.url };
    }),

  // Create Stripe checkout session for one-time credit purchase
  createCreditCheckout: protectedProcedure
    .input(z.object({ credits: z.number().int().positive() }))
    .mutation(async ({ ctx, input }) => {
      const pack = CREDIT_PACKS.find((p) => p.credits === input.credits);
      if (!pack) throw new TRPCError({ code: "BAD_REQUEST", message: "Invalid credit pack" });

      let customerId = ctx.user.stripeCustomerId;
      if (!customerId) {
        const customer = await stripe.customers.create({
          email: ctx.user.email,
          metadata: { userId: ctx.userId },
        });
        customerId = customer.id;
        await updateUser(ctx.userId, { stripeCustomerId: customerId });
      }

      const session = await stripe.checkout.sessions.create({
        customer: customerId,
        mode: "payment",
        line_items: [
          {
            price_data: {
              currency: "usd",
              product_data: {
                name: `VideoForge Credits — ${pack.label}`,
                description: `${pack.credits} credits ($${(pack.credits * 0.1).toFixed(2)} value)`,
              },
              unit_amount: pack.priceUsd * 100,
            },
            quantity: 1,
          },
        ],
        success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?credits_purchased=true`,
        cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing`,
        metadata: { userId: ctx.userId, creditAmount: pack.credits.toString() },
      });

      return { url: session.url };
    }),

  // Create billing portal session
  createPortalSession: protectedProcedure.mutation(async ({ ctx }) => {
    if (!ctx.user.stripeCustomerId) {
      throw new TRPCError({ code: "BAD_REQUEST", message: "No billing account found" });
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: ctx.user.stripeCustomerId,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings`,
    });

    return { url: session.url };
  }),
});

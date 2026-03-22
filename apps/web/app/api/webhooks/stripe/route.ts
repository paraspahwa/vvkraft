import { type NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { updateUser, addCredits } from "@/lib/db";
import { TIER_LIMITS } from "@videoforge/shared";
import type { SubscriptionTier } from "@videoforge/shared";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "", {
  apiVersion: "2024-06-20",
});

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET ?? ""
    );
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.["userId"];
        if (!userId) break;

        if (session.mode === "subscription") {
          const tier = session.metadata?.["tier"] as SubscriptionTier | undefined;
          if (tier && tier in TIER_LIMITS) {
            const credits = TIER_LIMITS[tier].includedCredits;
            await updateUser(userId, {
              tier,
              stripeSubscriptionId: session.subscription as string,
              stripeCustomerId: session.customer as string,
            });
            if (credits > 0) {
              await addCredits(userId, credits, "subscription", `${tier} plan monthly credits`);
            }
          }
        } else if (session.mode === "payment") {
          const creditAmount = parseInt(session.metadata?.["creditAmount"] ?? "0");
          if (creditAmount > 0) {
            await addCredits(
              userId,
              creditAmount,
              "purchase",
              `Purchased ${creditAmount} credits`,
              session.payment_intent as string
            );
          }
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        console.warn(`Subscription cancelled for customer ${subscription.customer}`);
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        console.warn(`Payment failed for customer ${invoice.customer}`);
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Stripe webhook handler error:", error);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }
}

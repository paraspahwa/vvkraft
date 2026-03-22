import crypto from "crypto";
import { type NextRequest, NextResponse } from "next/server";
import { updateUser, addCredits } from "@/lib/db";
import { TIER_LIMITS } from "@videoforge/shared";
import type { SubscriptionTier } from "@videoforge/shared";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("x-razorpay-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET ?? "")
    .update(body)
    .digest("hex");

  if (expectedSignature !== signature) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  let event: { event: string; payload: Record<string, unknown> };
  try {
    event = JSON.parse(body) as typeof event;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  try {
    switch (event.event) {
      case "subscription.charged": {
        const subscription = (event.payload as { subscription?: { entity?: Record<string, unknown> } })
          ?.subscription?.entity;
        const payment = (event.payload as { payment?: { entity?: Record<string, unknown> } })
          ?.payment?.entity;

        const userId = (subscription?.notes as Record<string, string> | undefined)?.["userId"];
        const tier = (subscription?.notes as Record<string, string> | undefined)?.["tier"] as
          | SubscriptionTier
          | undefined;
        const paymentId = payment?.["id"] as string | undefined;

        if (!userId || !tier || !(tier in TIER_LIMITS)) break;

        const credits = TIER_LIMITS[tier].includedCredits;
        await updateUser(userId, {
          tier,
          razorpaySubscriptionId: subscription?.["id"] as string | undefined,
        });

        if (credits > 0) {
          await addCredits(
            userId,
            credits,
            "subscription",
            `${tier} plan monthly credits`,
            paymentId
          );
        }
        break;
      }

      case "subscription.cancelled": {
        const subscription = (event.payload as { subscription?: { entity?: Record<string, unknown> } })
          ?.subscription?.entity;
        const userId = (subscription?.notes as Record<string, string> | undefined)?.["userId"];

        if (userId) {
          await updateUser(userId, { razorpaySubscriptionId: null });
        }
        break;
      }

      case "payment.failed": {
        const payment = (event.payload as { payment?: { entity?: Record<string, unknown> } })
          ?.payment?.entity;
        console.warn(`Payment failed: ${payment?.["id"] as string | undefined}`);
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Razorpay webhook handler error:", error);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }
}

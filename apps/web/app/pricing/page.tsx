"use client";

import { useState } from "react";
import { Zap } from "lucide-react";
import { PricingCard } from "@/components/billing/pricing-card";
import { PRICING_PLANS } from "@/lib/pricing";
import { trpc } from "@/lib/trpc/client";
import { AppLayout } from "@/components/layout/app-layout";
import { Header } from "@/components/layout/header";
import { loadRazorpayScript } from "@/lib/razorpay-client";

const CREDIT_PACKS = [
  { credits: 50, price: 5 },
  { credits: 150, price: 14 },
  { credits: 500, price: 40 },
  { credits: 1500, price: 100 },
];

export default function PricingPage() {
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "yearly">("monthly");
  const { data: user } = trpc.user.me.useQuery();

  const creditCheckoutMutation = trpc.billing.createCreditCheckout.useMutation();
  const verifyCreditMutation = trpc.billing.verifyCreditPayment.useMutation();

  const handleBuyCreditPack = async (credits: number) => {
    const loaded = await loadRazorpayScript();
    if (!loaded) {
      console.error("Failed to load Razorpay checkout");
      return;
    }

    const data = await creditCheckoutMutation.mutateAsync({ credits });

    const rzp = new window.Razorpay({
      key: data.keyId,
      order_id: data.orderId,
      name: "VideoForge",
      description: `${data.label}`,
      amount: data.amount,
      currency: data.currency,
      prefill: {
        email: data.userEmail,
        name: data.userName,
      },
      theme: { color: "#6366F1" },
      handler: (response: {
        razorpay_payment_id: string;
        razorpay_order_id: string;
        razorpay_signature: string;
      }) => {
        verifyCreditMutation.mutate({
          razorpayPaymentId: response.razorpay_payment_id,
          razorpayOrderId: response.razorpay_order_id,
          razorpaySignature: response.razorpay_signature,
          credits,
        });
      },
    });

    rzp.open();
  };

  return (
    <AppLayout>
      <Header title="Pricing" description="Choose the plan that works for you" />

      <div className="p-8 space-y-12">
        {/* Billing period toggle */}
        <div className="flex justify-center">
          <div className="flex items-center gap-1 rounded-xl border border-surface-border bg-surface-card p-1">
            <button
              onClick={() => setBillingPeriod("monthly")}
              className={`rounded-lg px-5 py-2 text-sm font-medium transition-all ${
                billingPeriod === "monthly"
                  ? "bg-accent-400 text-white shadow"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingPeriod("yearly")}
              className={`flex items-center gap-1.5 rounded-lg px-5 py-2 text-sm font-medium transition-all ${
                billingPeriod === "yearly"
                  ? "bg-accent-400 text-white shadow"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              Yearly
              <span className="rounded-full bg-green-500/20 px-1.5 py-0.5 text-xs text-green-400">
                Save 20%
              </span>
            </button>
          </div>
        </div>

        {/* Pricing cards */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {PRICING_PLANS.map((plan) => (
            <PricingCard
              key={plan.tier}
              plan={plan}
              billingPeriod={billingPeriod}
              currentTier={user?.tier}
            />
          ))}
        </div>

        {/* Credit packs */}
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white">Credit Top-ups</h2>
            <p className="mt-2 text-gray-400">
              Need more credits? Purchase additional credits any time. 1 credit = $0.10
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {CREDIT_PACKS.map((pack) => (
              <div
                key={pack.credits}
                className="glass-card p-5 space-y-4 hover:border-accent-400/30 transition-all"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5">
                    <Zap className="h-4 w-4 text-accent-400" />
                    <span className="text-xl font-bold text-white">{pack.credits.toLocaleString()}</span>
                  </div>
                  <p className="text-sm text-gray-400">credits</p>
                </div>
                <div className="text-2xl font-bold text-white">${pack.price}</div>
                <button
                  onClick={() => handleBuyCreditPack(pack.credits)}
                  disabled={creditCheckoutMutation.isPending || verifyCreditMutation.isPending}
                  className="w-full rounded-lg border border-surface-border py-2 text-sm font-medium text-white hover:bg-accent-400 hover:border-accent-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Buy Now
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ */}
        <div className="space-y-6">
          <h2 className="text-center text-2xl font-bold text-white">Frequently Asked Questions</h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 max-w-4xl mx-auto">
            {[
              {
                q: "What are credits?",
                a: "Credits are used to generate videos. 1 credit = $0.10. Each generation costs credits based on the model, duration, and resolution.",
              },
              {
                q: "Can I upgrade or downgrade?",
                a: "Yes, you can change your plan at any time. Upgrades take effect immediately; downgrades apply at the next billing cycle.",
              },
              {
                q: "What happens if I run out of credits?",
                a: "You can purchase credit top-ups at any time, or they reset with your monthly subscription renewal.",
              },
              {
                q: "Do credits roll over?",
                a: "Purchased credits never expire. Subscription-included credits reset monthly.",
              },
            ].map(({ q, a }) => (
              <div key={q} className="glass-card p-5 space-y-2">
                <h3 className="font-semibold text-white">{q}</h3>
                <p className="text-sm text-gray-400 leading-relaxed">{a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

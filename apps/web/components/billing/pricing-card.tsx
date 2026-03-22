"use client";

import { Check, Zap } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, Button, Badge } from "@videoforge/ui";
import { cn } from "@videoforge/ui";
import type { PricingPlan } from "@videoforge/shared";
import { trpc } from "@/lib/trpc/client";

interface PricingCardProps {
  plan: PricingPlan;
  billingPeriod: "monthly" | "yearly";
  currentTier?: string;
}

export function PricingCard({ plan, billingPeriod, currentTier }: PricingCardProps) {
  const isCurrent = currentTier === plan.tier;
  const price = billingPeriod === "yearly" ? plan.yearlyPriceUsd : plan.monthlyPriceUsd;

  const checkoutMutation = trpc.billing.createSubscriptionCheckout.useMutation({
    onSuccess: ({ url }) => {
      if (url) window.location.href = url;
    },
  });

  const handleUpgrade = () => {
    if (plan.tier === "free") return;
    checkoutMutation.mutate({ tier: plan.tier as "creator" | "pro" | "studio", billingPeriod });
  };

  return (
    <Card
      className={cn(
        "relative flex flex-col transition-all",
        plan.highlighted && "border-accent-400 shadow-accent-glow scale-[1.02]",
        isCurrent && "border-green-500/50"
      )}
    >
      {plan.highlighted && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <Badge className="bg-accent-gradient text-white shadow-lg">Most Popular</Badge>
        </div>
      )}
      {isCurrent && (
        <div className="absolute -top-3 right-4">
          <Badge variant="success">Current Plan</Badge>
        </div>
      )}

      <CardHeader className="pb-4">
        <CardTitle className="text-xl">{plan.name}</CardTitle>
        <div className="mt-3">
          <span className="text-4xl font-bold text-white">${price}</span>
          <span className="text-gray-400">/mo</span>
          {billingPeriod === "yearly" && plan.monthlyPriceUsd > 0 && (
            <p className="mt-1 text-xs text-green-400">
              Save ${((plan.monthlyPriceUsd - plan.yearlyPriceUsd) * 12).toFixed(0)}/yr
            </p>
          )}
        </div>
        <CardDescription className="mt-2">
          {plan.limits.videosPerMonth
            ? `${plan.limits.videosPerMonth} videos/month`
            : plan.limits.videosPerDay
            ? `${plan.limits.videosPerDay} videos/day`
            : "Unlimited videos"}
        </CardDescription>
      </CardHeader>

      <CardContent className="flex flex-col flex-1 space-y-5">
        <ul className="space-y-2.5 flex-1">
          {plan.features.map((feature) => (
            <li key={feature} className="flex items-start gap-2.5 text-sm">
              <Check className="h-4 w-4 text-accent-400 mt-0.5 flex-shrink-0" />
              <span className="text-gray-300">{feature}</span>
            </li>
          ))}
        </ul>

        <Button
          onClick={handleUpgrade}
          variant={plan.highlighted ? "gradient" : isCurrent ? "outline" : "outline"}
          size="lg"
          className="w-full"
          disabled={isCurrent || plan.tier === "free"}
          loading={checkoutMutation.isPending}
        >
          {isCurrent ? "Current Plan" : plan.tier === "free" ? "Get Started Free" : (
            <span className="flex items-center gap-1.5">
              <Zap className="h-4 w-4" />
              Upgrade to {plan.name}
            </span>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}

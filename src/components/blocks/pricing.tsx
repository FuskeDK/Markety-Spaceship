"use client";

import { useState } from "react";

import { Check } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

const plans = [
  {
    name: "Starter",
    monthlyPrice: "$3.50",
    yearlyPrice: "$3.00",
    description: "Great for getting started",
    features: [
      "Up to 50 leads/month",
      "1 ad platform",
      "Email follow-up sequences",
      "Landing page included",
    ],
  },
  {
    name: "Growth",
    monthlyPrice: "$2.80",
    yearlyPrice: "$2.50",
    features: [
      "All Starter features and...",
      "Up to 200 leads/month",
      "Multi-platform campaigns",
      "A/B testing",
      "Weekly performance reports",
      "Dedicated account manager",
    ],
  },
  {
    name: "Enterprise",
    monthlyPrice: "Custom",
    yearlyPrice: "Custom",
    features: [
      "All Growth features and...",
      "Unlimited leads",
      "Custom funnel builds",
      "CRM integration",
      "Priority support",
    ],
  },
];

export const Pricing = ({ className }: { className?: string }) => {
  const [isAnnual, setIsAnnual] = useState(true);

  return (
    <section className={cn("py-28 lg:py-32", className)}>
      <div className="container max-w-5xl">
        <div className="space-y-4 text-center">
          <h2 className="text-2xl tracking-tight md:text-4xl lg:text-5xl">
            Pricing
          </h2>
          <p className="text-muted-foreground mx-auto max-w-xl leading-snug text-balance">
            Pay only for the qualified leads we deliver. No retainers, no
            hidden fees - just results.
          </p>
        </div>

        <div className="mt-8 grid items-start gap-5 text-start md:mt-12 md:grid-cols-3 lg:mt-20">
          {plans.map((plan) => (
            <Card
              key={plan.name}
              className={`${
                plan.name === "Growth"
                  ? "outline-primary origin-top outline-4"
                  : ""
              }`}
            >
              <CardContent className="flex flex-col gap-7 px-6 py-5">
                <div className="space-y-2">
                  <h3 className="text-foreground font-semibold">{plan.name}</h3>
                  <div className="space-y-1">
                    <div className="text-muted-foreground text-lg font-medium">
                      {isAnnual ? plan.yearlyPrice : plan.monthlyPrice}{" "}
                      {plan.name !== "Enterprise" && (
                        <span className="text-muted-foreground">
                          per lead{isAnnual ? " (volume)" : " (standard)"}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {plan.name === "Starter" ? (
                  <span className="text-muted-foreground text-sm">
                    {plan.description}
                  </span>
                ) : plan.name !== "Enterprise" ? (
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={isAnnual}
                      onCheckedChange={() => setIsAnnual(!isAnnual)}
                      aria-label="Toggle volume pricing"
                    />
                    <span className="text-sm font-medium">Volume pricing</span>
                  </div>
                ) : (
                  <span className="text-muted-foreground text-sm">
                    Talk to us about your needs
                  </span>
                )}

                <div className="space-y-3">
                  {plan.features.map((feature) => (
                    <div
                      key={feature}
                      className="text-muted-foreground flex items-center gap-1.5"
                    >
                      <Check className="size-5 shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                </div>

                <Button
                  className="w-fit"
                  variant={plan.name === "Growth" ? "default" : "outline"}
                >
                  Get started
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

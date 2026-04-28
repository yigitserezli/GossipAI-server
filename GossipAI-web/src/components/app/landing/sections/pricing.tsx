import { CheckCircle2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { LandingCopy } from "@/components/app/landing/content";
import type { PlanSummary } from "@/components/app/landing/types";

export function LandingPricingSection({
  copy,
  basicPlan,
  premiumPlan,
  formatUSD,
}: {
  copy: LandingCopy;
  basicPlan: PlanSummary;
  premiumPlan: PlanSummary;
  formatUSD: (value: number) => string;
}) {
  return (
    <section id="plans" className="relative z-10 mx-auto w-full max-w-6xl px-6 py-24">
      <div className="mb-12 text-center">
        <p className="editorial-kicker mb-2 text-xs font-semibold text-(--dt-primary-container)">{copy.plansTag}</p>
        <h2 className="editorial-heading text-5xl font-extrabold tracking-tight sm:text-6xl">{copy.plansHeading}</h2>
        <p className="mx-auto mt-3 max-w-2xl text-sm text-(--dt-on-surface-variant)">
          {copy.plansSubheading}
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <Card className="tilt-card border-(--dt-outline-variant) bg-(--dt-surface)/90">
          <CardContent className="p-7">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-(--dt-on-surface-variant)">{copy.basicLabel}</p>
            <p className="mt-3 text-3xl font-extrabold text-(--dt-on-surface)">{formatUSD(basicPlan.priceUsd)}</p>
            <p className="mt-1 text-xs font-medium uppercase tracking-wide text-(--dt-outline)">{copy.usdPerMonth}</p>
            <p className="mt-2 text-sm text-(--dt-on-surface-variant)">{copy.basicBlurb}</p>
            <div className="mt-6 space-y-2.5 text-sm text-(--dt-on-surface)">
              {[
                copy.basicCoreFeature,
                `${copy.dailyPromptLabel}: ${basicPlan.dailyPromptLimit}`,
                copy.standardResponseFeature,
                copy.platformFeature,
              ].map((item) => (
                <div key={item} className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 text-(--dt-primary-container)" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="tilt-card border-(--dt-primary-container)/35 bg-(--dt-surface-low) text-(--dt-on-surface) shadow-[0_20px_50px_rgba(2,8,23,0.35)]">
          <CardContent className="p-7">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-(--dt-primary)">{copy.premiumLabel}</p>
            <p className="mt-3 text-3xl font-extrabold">{formatUSD(premiumPlan.priceUsd)}</p>
            <p className="mt-1 text-xs font-medium uppercase tracking-wide text-(--dt-primary)">{copy.usdPerMonth}</p>
            <p className="mt-2 text-sm text-(--dt-on-surface-variant)">{copy.premiumBlurb}</p>
            <div className="mt-6 space-y-2.5 text-sm text-(--dt-on-surface)">
              {[
                `${copy.dailyPromptLabel}: ${premiumPlan.dailyPromptLimit}`,
                copy.premiumReasoningFeature,
                copy.premiumPriorityFeature,
                copy.premiumWorkflowFeature,
              ].map((item) => (
                <div key={item} className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 text-(--dt-primary-container)" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}

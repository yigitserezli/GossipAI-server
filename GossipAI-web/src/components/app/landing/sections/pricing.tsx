import { CheckCircle2 } from "lucide-react";
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
  const basicFeatures = [
    copy.basicCoreFeature,
    `${copy.dailyPromptLabel}: ${basicPlan.dailyPromptLimit}`,
    copy.standardResponseFeature,
    copy.platformFeature,
  ];

  const premiumFeatures = [
    `${copy.dailyPromptLabel}: ${premiumPlan.dailyPromptLimit}`,
    copy.premiumReasoningFeature,
    copy.premiumPriorityFeature,
    copy.premiumWorkflowFeature,
  ];

  return (
    <section id="plans" className="relative z-10 overflow-hidden bg-[#02010a] py-24 sm:py-32">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute right-[-10rem] top-[-6rem] h-[32rem] w-[32rem] rounded-full bg-[radial-gradient(circle,color-mix(in_srgb,var(--dt-primary-container)_13%,transparent),transparent_68%)] blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-[-4rem] left-[-8rem] h-72 w-72 rounded-full bg-[radial-gradient(circle,color-mix(in_srgb,var(--dt-primary)_10%,transparent),transparent_70%)] blur-[100px]"
      />

      <div className="relative mx-auto w-full max-w-7xl px-6">
        {/* Header */}
        <div className="mb-20">
          <p className="editorial-kicker mb-3 text-xs font-semibold tracking-[0.16em] uppercase text-(--dt-primary-container)">
            {copy.plansTag}
          </p>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <h2 className="editorial-heading max-w-xl text-5xl font-extrabold tracking-tight text-(--dt-on-surface) sm:text-6xl xl:text-7xl">
              {copy.plansHeading}
            </h2>
            <p className="max-w-sm text-base leading-relaxed text-(--dt-on-surface-variant) lg:text-right">
              {copy.plansSubheading}
            </p>
          </div>
        </div>

        {/* Plans */}
        <div className="grid gap-0 lg:grid-cols-[1fr_1px_1fr]">
          {/* Basic */}
          <div className="pb-16 pr-0 lg:pb-0 lg:pr-16 xl:pr-24">
            <p className="text-[11px] font-semibold tracking-[0.14em] uppercase text-(--dt-on-surface-variant)">
              {copy.basicLabel}
            </p>
            <div className="mt-6 flex items-end gap-2">
              <span className="editorial-heading text-6xl font-black text-(--dt-on-surface) xl:text-7xl">
                {formatUSD(basicPlan.priceUsd)}
              </span>
              <span className="mb-2 text-sm font-medium text-(--dt-on-surface-variant)">{copy.usdPerMonth}</span>
            </div>
            <p className="mt-4 text-base leading-relaxed text-(--dt-on-surface-variant)">{copy.basicBlurb}</p>
            <ul className="mt-10 space-y-5">
              {basicFeatures.map((item) => (
                <li key={item} className="flex items-start gap-4">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-(--dt-primary-container)" />
                  <span className="text-base text-(--dt-on-surface)">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Divider */}
          <div className="hidden lg:block w-px self-stretch bg-[color-mix(in_oklab,var(--dt-outline-variant)_55%,transparent)]" />

          {/* Premium */}
          <div className="relative border-t border-(--dt-outline-variant)/40 pt-16 lg:border-none lg:pb-0 lg:pl-16 lg:pt-0 xl:pl-24">
            <div className="absolute -top-px left-0 h-px w-24 bg-[linear-gradient(to_right,var(--dt-primary-container),transparent)] lg:hidden" />
            <p className="text-[11px] font-semibold tracking-[0.14em] uppercase text-(--dt-primary-container)">
              {copy.premiumLabel}
            </p>
            <div className="mt-6 flex items-end gap-2">
              <span className="editorial-heading text-6xl font-black text-(--dt-on-surface) xl:text-7xl">
                {formatUSD(premiumPlan.priceUsd)}
              </span>
              <span className="mb-2 text-sm font-medium text-(--dt-primary-container)">{copy.usdPerMonth}</span>
            </div>
            <p className="mt-4 text-base leading-relaxed text-(--dt-on-surface-variant)">{copy.premiumBlurb}</p>
            <ul className="mt-10 space-y-5">
              {premiumFeatures.map((item) => (
                <li key={item} className="flex items-start gap-4">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-(--dt-primary-container)" />
                  <span className="text-base text-(--dt-on-surface)">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}


import type { LandingCopy } from "@/components/app/landing/content";

export function LandingHowItWorksSection({ copy }: { copy: LandingCopy }) {
  return (
    <section id="how-it-works" className="relative z-10 overflow-hidden py-24 sm:py-32">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_55%_at_50%_100%,color-mix(in_srgb,var(--dt-primary-container)_14%,transparent),transparent)]"
      />

      <div className="relative mx-auto w-full max-w-6xl px-6">
        {/* Header */}
        <div className="mb-20 text-center">
          <p className="editorial-kicker mb-3 text-xs font-semibold tracking-[0.16em] uppercase text-(--dt-primary-container)">
            {copy.howTag}
          </p>
          <h2 className="editorial-heading text-5xl font-extrabold tracking-tight text-(--dt-on-surface) sm:text-6xl xl:text-7xl">
            {copy.howHeading}
          </h2>
        </div>

        {/* Steps */}
        <div className="relative grid gap-0 lg:grid-cols-3">
          {/* Connecting line – desktop */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute left-[calc(16.66%-1px)] right-[calc(16.66%-1px)] top-[2.6rem] hidden h-px bg-[linear-gradient(to_right,transparent,color-mix(in_srgb,var(--dt-primary-container)_45%,transparent)_20%,color-mix(in_srgb,var(--dt-primary-container)_45%,transparent)_80%,transparent)] lg:block"
          />

          {copy.howSteps.map(({ step, title, desc }, i) => (
            <div
              key={step}
              className="group relative flex flex-col items-center gap-6 px-6 pb-16 text-center last:pb-0 lg:pb-0 lg:px-10"
            >
              {/* Vertical connector – mobile */}
              {i < copy.howSteps.length - 1 && (
                <div
                  aria-hidden="true"
                  className="absolute left-1/2 top-[5.5rem] h-[calc(100%-5.5rem)] w-px -translate-x-1/2 bg-[linear-gradient(to_bottom,color-mix(in_srgb,var(--dt-primary-container)_40%,transparent),transparent)] lg:hidden"
                />
              )}

              {/* Number badge */}
              <div className="relative z-10 flex h-[4.5rem] w-[4.5rem] shrink-0 items-center justify-center rounded-full border border-(--dt-primary-container)/35 bg-[color-mix(in_srgb,var(--dt-primary-container)_10%,var(--dt-surface-low))] shadow-[0_0_28px_color-mix(in_srgb,var(--dt-primary-container)_20%,transparent)] transition-shadow duration-300 group-hover:shadow-[0_0_42px_color-mix(in_srgb,var(--dt-primary-container)_35%,transparent)]">
                <span className="editorial-heading text-2xl font-black text-(--dt-primary-container)">
                  {step}
                </span>
              </div>

              {/* Text */}
              <div>
                <p className="text-xl font-bold leading-tight text-(--dt-on-surface) sm:text-2xl">{title}</p>
                <p className="mt-3 text-base leading-relaxed text-(--dt-on-surface-variant)">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}


import type { LandingCopy } from "@/components/app/landing/content";

export function LandingHowItWorksSection({ copy }: { copy: LandingCopy }) {
  return (
    <section id="how-it-works" className="relative z-10 bg-(--dt-surface-low)/50 py-24 backdrop-blur-sm">
      <div className="mx-auto w-full max-w-6xl px-6">
        <div className="mb-12 text-center">
          <p className="editorial-kicker mb-2 text-xs font-semibold text-(--dt-primary-container)">{copy.howTag}</p>
          <h2 className="editorial-heading text-5xl font-extrabold tracking-tight sm:text-6xl">{copy.howHeading}</h2>
        </div>
        <div className="grid gap-8 sm:grid-cols-3">
          {copy.howSteps.map(({ step, title, desc }) => (
            <div key={step} className="tilt-card flex flex-col items-start gap-4 rounded-2xl border border-(--dt-outline-variant) bg-(--dt-surface)/90 p-5">
              <span className="editorial-heading text-5xl font-black text-(--dt-primary-container)/30">{step}</span>
              <div>
                <p className="mb-1.5 font-semibold text-(--dt-on-surface)">{title}</p>
                <p className="text-sm leading-relaxed text-(--dt-on-surface-variant)">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

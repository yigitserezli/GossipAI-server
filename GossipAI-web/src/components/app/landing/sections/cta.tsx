import { CheckCircle2 } from "lucide-react";
import { STORE_LINKS } from "@/config/store-links";
import type { LandingCopy } from "@/components/app/landing/content";
import { APPLE_PATH, PlayIcon, StoreBadge } from "@/components/app/landing/ui";

export function LandingCtaSection({ copy }: { copy: LandingCopy }) {
  return (
    <section className="relative z-10 overflow-hidden bg-[linear-gradient(180deg,color-mix(in_oklab,var(--dt-surface-low)_96%,black_4%)_0%,color-mix(in_oklab,var(--dt-surface-low)_92%,var(--dt-primary-container)_8%)_100%)] pb-6 pt-20 text-(--dt-on-surface) md:pb-8">
      <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-(--dt-primary)/15 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-16 left-10 h-56 w-56 rounded-full bg-(--dt-primary-container)/25 blur-3xl" />
      <div className="relative mx-auto max-w-3xl px-6 text-center">
        <h2 className="editorial-heading text-5xl font-extrabold tracking-tight sm:text-6xl">{copy.ctaHeading}</h2>
        <p className="mx-auto mt-4 max-w-lg text-base text-(--dt-on-surface-variant)">
          {copy.ctaDescription}
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <StoreBadge
            href={STORE_LINKS.appStore}
            label="Download on the App Store"
            eyebrow={copy.appStoreEyebrow}
            title="App Store"
            dark
            icon={
              <svg viewBox="0 0 814 1000" className="h-6 w-6 shrink-0 fill-white" xmlns="http://www.w3.org/2000/svg">
                <path d={APPLE_PATH} />
              </svg>
            }
          />
          <StoreBadge
            href={STORE_LINKS.playStore}
            label="Get it on Google Play"
            eyebrow={copy.playStoreEyebrow}
            title="Google Play"
            dark
            icon={<PlayIcon light />}
          />
        </div>
        <div className="mt-6 flex flex-wrap justify-center gap-5 text-sm text-(--dt-on-surface-variant)">
          {copy.ctaBullets.map((text) => (
            <span key={text} className="flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-(--dt-primary-container)/70" />
              {text}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

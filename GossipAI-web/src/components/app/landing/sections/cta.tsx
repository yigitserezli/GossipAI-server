import { CheckCircle2 } from "lucide-react";
import { STORE_LINKS } from "@/config/store-links";
import type { LandingCopy } from "@/components/app/landing/content";
import { APPLE_PATH, PlayIcon, StoreBadge } from "@/components/app/landing/ui";

export function LandingCtaSection({ copy }: { copy: LandingCopy }) {
  return (
    <section className="relative z-10 overflow-hidden bg-[#02010a] py-24 sm:py-32">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_60%_at_50%_50%,color-mix(in_srgb,var(--dt-primary-container)_16%,transparent),transparent)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-[-6rem] top-[-4rem] h-72 w-72 rounded-full bg-[radial-gradient(circle,color-mix(in_srgb,var(--dt-primary)_14%,transparent),transparent_70%)] blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-[-4rem] right-[-4rem] h-64 w-64 rounded-full bg-[radial-gradient(circle,color-mix(in_srgb,var(--dt-primary-container)_18%,transparent),transparent_70%)] blur-[100px]"
      />

      <div className="relative mx-auto w-full max-w-7xl px-6">
        <div className="grid gap-16 lg:grid-cols-[1.2fr_0.8fr] lg:gap-24 lg:items-center">
          {/* Left – heading */}
          <div>
            <h2 className="editorial-heading text-5xl font-extrabold leading-[1.0] tracking-tight text-(--dt-on-surface) sm:text-6xl xl:text-7xl">
              {copy.ctaHeading}
            </h2>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-(--dt-on-surface-variant) sm:text-lg">
              {copy.ctaDescription}
            </p>
            <ul className="mt-8 space-y-3">
              {copy.ctaBullets.map((text) => (
                <li key={text} className="flex items-center gap-3 text-base text-(--dt-on-surface-variant)">
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-(--dt-primary-container)" />
                  {text}
                </li>
              ))}
            </ul>
          </div>

          {/* Right – store badges */}
          <div className="flex flex-col items-start gap-4 lg:items-end">
            <StoreBadge
              href={STORE_LINKS.appStore}
              label="Download on the App Store"
              eyebrow={copy.appStoreEyebrow}
              title="App Store"
              dark
              className="w-52"
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
              className="w-52"
              icon={<PlayIcon light />}
            />
          </div>
        </div>
      </div>
    </section>
  );
}

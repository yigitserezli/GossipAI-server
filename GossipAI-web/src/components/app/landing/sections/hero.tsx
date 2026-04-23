import Image from "next/image";
import { STORE_LINKS } from "@/config/store-links";
import type { LandingCopy } from "@/components/app/landing/content";
import type { SloganEntry } from "@/components/app/landing/types";
import { APPLE_PATH, PlayIcon, StoreBadge } from "@/components/app/landing/ui";

export function LandingHero({
  copy,
  sloganEntry,
}: {
  copy: LandingCopy;
  sloganEntry?: SloganEntry;
}) {
  return (
    <section className="relative z-10 flex min-h-0 flex-1 items-center overflow-hidden px-5 pb-6 pt-4 sm:px-8 lg:px-12">
      <div className="mx-auto grid h-full min-h-0 w-full max-w-6xl items-center gap-8 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="text-center lg:text-left">
          <h1 className="editorial-heading reveal-up mx-auto max-w-4xl text-7xl font-extrabold leading-[0.88] sm:text-8xl lg:mx-0 lg:text-9xl">
            <span className="bg-linear-to-r from-(--dt-on-surface) via-(--dt-primary) to-(--dt-primary-container) bg-clip-text text-transparent [text-shadow:0_0_30px_color-mix(in_srgb,var(--dt-primary-container)_50%,transparent)]">
              {sloganEntry?.logo ?? `${copy.heroLead} ${copy.heroHighlight}`}
            </span>
          </h1>
          <p
            className="reveal-up mx-auto mt-5 max-w-2xl text-base leading-relaxed text-(--dt-on-surface-variant) sm:text-xl lg:mx-0"
            style={{ animationDelay: "120ms" }}
          >
            {sloganEntry?.subtitle ?? copy.heroDescription}
          </p>
          <div className="relative mt-4 h-[185px] sm:h-[210px] lg:h-[235px]">
            <span className="editorial-watermark-hero">GOSSIP</span>
            <div
              className="reveal-up absolute bottom-[clamp(18px,3vw,54px)] left-1/2 z-30 flex -translate-x-1/2 flex-wrap items-center justify-center gap-4 lg:left-0 lg:translate-x-0"
              style={{ animationDelay: "200ms" }}
            >
              <StoreBadge
                href={STORE_LINKS.appStore}
                label="Download on the App Store"
                eyebrow={copy.appStoreEyebrow}
                title="App Store"
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
                icon={<PlayIcon />}
              />
            </div>
          </div>
        </div>

        <div
          className="reveal-up relative mx-auto w-full max-w-[clamp(18rem,26vw,28rem)] lg:justify-self-center"
          style={{ animationDelay: "180ms" }}
        >
          <div className="tilt-card stitch-glass relative z-20 ml-auto w-[74%] overflow-hidden rounded-[1.75rem] p-2 shadow-[0_18px_45px_rgba(2,2,2,0.32)]">
            <Image
              src="/inside-app-1.jpeg"
              alt="GossipAI inside app preview 1"
              width={760}
              height={1440}
              className="h-auto w-full rounded-[1.25rem] object-cover"
              priority
            />
          </div>
          <div className="tilt-card stitch-glass absolute -bottom-6 left-0 z-10 w-[64%] overflow-hidden rounded-[1.75rem] p-2 shadow-[0_18px_45px_rgba(2,2,2,0.32)]">
            <Image
              src="/inside-app-2.jpeg"
              alt="GossipAI inside app preview 2"
              width={760}
              height={1440}
              className="h-auto w-full rounded-[1.25rem] object-cover"
              priority
            />
          </div>
        </div>
      </div>
    </section>
  );
}

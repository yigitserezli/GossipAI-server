import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, ShieldCheck, Smartphone } from "lucide-react";
import { STORE_LINKS } from "@/config/store-links";
import type { LandingCopy } from "@/components/app/landing/content";

export function LandingFooter({ copy }: { copy: LandingCopy }) {
  return (
    <footer
      id="footer"
      className="relative -mt-px overflow-hidden border-t border-(--dt-outline-variant)/60 bg-[linear-gradient(180deg,color-mix(in_oklab,var(--dt-surface-low)_92%,var(--dt-primary-container)_8%)_0%,color-mix(in_oklab,var(--dt-surface)_95%,black_5%)_42%,color-mix(in_oklab,var(--dt-surface-low)_92%,black_8%)_100%)]"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-48 bg-[radial-gradient(85%_115%_at_50%_0%,color-mix(in_srgb,var(--dt-primary-container)_26%,transparent),transparent_72%)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute right-[-12rem] top-12 h-[18rem] w-[18rem] rounded-full bg-[radial-gradient(circle,color-mix(in_srgb,var(--dt-primary)_55%,transparent),transparent_68%)] blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-36 top-24 h-72 w-72 rounded-full bg-[radial-gradient(circle,color-mix(in_srgb,var(--dt-primary-container)_26%,transparent),transparent_72%)] blur-[120px]"
      />

      <div className="relative mx-auto w-full max-w-6xl px-6 py-8 sm:px-8">
        <div className="grid gap-8 lg:grid-cols-[1.3fr_0.95fr_0.95fr]">
          <div>
            <div className="flex items-center gap-3">
              <Image
                src="/AppIcons/Assets.xcassets/AppIcon.appiconset/58.png"
                alt="GossipAI logo"
                width={36}
                height={36}
                className="h-9 w-9 rounded-xl object-cover ring-1 ring-(--dt-outline-variant)"
              />
              <span className="text-lg font-semibold text-(--dt-on-surface)">GossipAI</span>
            </div>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-(--dt-on-surface)">
              AI communication copilot for clearer replies, calmer conversations, and better outcomes.
            </p>
            <p className="mt-5 inline-flex items-center gap-1.5 rounded-full border border-(--dt-outline-variant)/70 bg-(--dt-surface)/55 px-3 py-1 text-xs tracking-[0.12em] text-(--dt-on-surface-variant)">
              <ShieldCheck className="h-3.5 w-3.5 text-(--dt-primary-container)" />
              {copy.footerRights}
            </p>
          </div>

          <div>
            <p className="text-xs font-semibold tracking-[0.14em] text-(--dt-on-surface-variant) uppercase">Explore</p>
            <div className="mt-3 flex flex-col gap-2.5 text-sm">
              <a href="#features" className="group inline-flex items-center gap-1.5 text-(--dt-on-surface) transition-colors hover:text-(--dt-primary)">
                {copy.features}
                <ArrowUpRight className="h-3.5 w-3.5 opacity-0 transition-all group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </a>
              <a href="#how-it-works" className="group inline-flex items-center gap-1.5 text-(--dt-on-surface) transition-colors hover:text-(--dt-primary)">
                {copy.howItWorks}
                <ArrowUpRight className="h-3.5 w-3.5 opacity-0 transition-all group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </a>
              <a href="#plans" className="group inline-flex items-center gap-1.5 text-(--dt-on-surface) transition-colors hover:text-(--dt-primary)">
                {copy.plans}
                <ArrowUpRight className="h-3.5 w-3.5 opacity-0 transition-all group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </a>
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold tracking-[0.14em] text-(--dt-on-surface-variant) uppercase">Get App</p>
            <div className="mt-3 flex flex-col gap-2 text-sm">
              <a
                href={STORE_LINKS.appStore}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center gap-2 rounded-full border border-(--dt-outline-variant)/65 bg-(--dt-surface)/60 px-2.5 py-1.5 text-(--dt-on-surface) transition-all hover:border-(--dt-primary-container)/70 hover:bg-(--dt-surface) hover:text-(--dt-primary)"
              >
                <Smartphone className="h-3.5 w-3.5" />
                App Store
                <ArrowUpRight className="ml-auto h-3.5 w-3.5" aria-hidden="true" />
              </a>
              <a
                href={STORE_LINKS.playStore}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center gap-2 rounded-full border border-(--dt-outline-variant)/65 bg-(--dt-surface)/60 px-2.5 py-1.5 text-(--dt-on-surface) transition-all hover:border-(--dt-primary-container)/70 hover:bg-(--dt-surface) hover:text-(--dt-primary)"
              >
                <Smartphone className="h-3.5 w-3.5" />
                Google Play
                <ArrowUpRight className="ml-auto h-3.5 w-3.5" aria-hidden="true" />
              </a>
              <Link href="/privacy" className="group inline-flex items-center gap-1.5 text-(--dt-on-surface) transition-colors hover:text-(--dt-primary)">
                {copy.footerPrivacy}
                <ArrowUpRight className="h-3.5 w-3.5 opacity-0 transition-all group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </Link>
              <Link
                href="/terms"
                className="group inline-flex items-center gap-1.5 text-(--dt-on-surface) transition-colors hover:text-(--dt-primary)"
              >
                {copy.footerTerms}
                <ArrowUpRight className="h-3.5 w-3.5 opacity-0 transition-all group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </Link>
            </div>
          </div>
        </div>
        <div className="mt-8 flex flex-col gap-3 border-t border-(--dt-outline-variant)/50 pt-5 text-xs text-(--dt-on-surface-variant) sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} GossipAI. {copy.footerRights}</p>
          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-full border border-(--dt-outline-variant)/70 bg-(--dt-surface)/50 px-2.5 py-1 text-(--dt-on-surface)">iOS</span>
            <span className="rounded-full border border-(--dt-outline-variant)/70 bg-(--dt-surface)/50 px-2.5 py-1 text-(--dt-on-surface)">Android</span>
            <span className="rounded-full border border-(--dt-outline-variant)/70 bg-(--dt-surface)/50 px-2.5 py-1 text-(--dt-on-surface)">AI-assisted</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

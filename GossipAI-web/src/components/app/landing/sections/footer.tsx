import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, ShieldCheck, Smartphone } from "lucide-react";
import { STORE_LINKS } from "@/config/store-links";
import type { LandingCopy } from "@/components/app/landing/content";
import { APPLE_PATH, PlayIcon } from "@/components/app/landing/ui";

export function LandingFooter({ copy }: { copy: LandingCopy }) {
  return (
    <footer id="footer" className="relative z-10 px-4 pb-4 pt-6 sm:px-6 sm:pb-6">
      <div className="stitch-glass relative mx-auto w-full max-w-6xl overflow-hidden rounded-2xl shadow-[0_16px_40px_rgba(4,2,12,0.55)]">
        {/* Deco glows */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -left-20 -top-20 h-72 w-72 rounded-full bg-[radial-gradient(circle,color-mix(in_srgb,var(--dt-primary-container)_22%,transparent),transparent_68%)] blur-[90px]"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-10 right-10 h-56 w-56 rounded-full bg-[radial-gradient(circle,color-mix(in_srgb,var(--dt-primary)_12%,transparent),transparent_70%)] blur-[70px]"
        />

        {/* Main content */}
        <div className="relative grid gap-10 px-8 pt-10 sm:px-10 sm:pt-12 lg:grid-cols-[1.8fr_1px_1fr_1fr_1fr] lg:gap-0">

          {/* ── Brand ── */}
          <div className="lg:pr-10 xl:pr-14">
            <div className="flex items-center gap-3">
              <Image
                src="/AppIcons/Assets.xcassets/AppIcon.appiconset/58.png"
                alt="GossipAI logo"
                width={44}
                height={44}
                className="h-11 w-11 rounded-xl object-cover ring-1 ring-(--dt-outline-variant)/50 shadow-[0_0_16px_color-mix(in_srgb,var(--dt-primary-container)_30%,transparent)]"
              />
              <span className="editorial-heading text-[2rem] font-black tracking-tight text-(--dt-on-surface)">
                GossipAI
              </span>
            </div>
            <p className="mt-4 max-w-[24ch] text-sm leading-relaxed text-(--dt-on-surface-variant)">
              AI communication copilot for clearer replies and calmer conversations.
            </p>

            {/* Store badges */}
            <div className="mt-6 flex flex-col gap-2.5 sm:flex-row lg:flex-col xl:flex-row">
              <a
                href={STORE_LINKS.appStore}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Download on the App Store"
                className="group inline-flex items-center gap-2.5 rounded-xl border border-(--dt-outline-variant)/50 bg-(--dt-surface-low)/70 px-4 py-2.5 text-(--dt-on-surface) backdrop-blur-sm transition-all hover:border-(--dt-primary-container)/55 hover:bg-(--dt-surface) hover:shadow-[0_0_12px_color-mix(in_srgb,var(--dt-primary-container)_18%,transparent)]"
              >
                <svg viewBox="0 0 814 1000" className="h-5 w-5 shrink-0 fill-current" xmlns="http://www.w3.org/2000/svg">
                  <path d={APPLE_PATH} />
                </svg>
                <div className="flex flex-col leading-tight">
                  <span className="text-[10px] tracking-wide text-(--dt-on-surface-variant)">{copy.appStoreEyebrow}</span>
                  <span className="text-sm font-semibold">App Store</span>
                </div>
              </a>
              <a
                href={STORE_LINKS.playStore}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Get it on Google Play"
                className="group inline-flex items-center gap-2.5 rounded-xl border border-(--dt-outline-variant)/50 bg-(--dt-surface-low)/70 px-4 py-2.5 text-(--dt-on-surface) backdrop-blur-sm transition-all hover:border-(--dt-primary-container)/55 hover:bg-(--dt-surface) hover:shadow-[0_0_12px_color-mix(in_srgb,var(--dt-primary-container)_18%,transparent)]"
              >
                <PlayIcon />
                <div className="flex flex-col leading-tight">
                  <span className="text-[10px] tracking-wide text-(--dt-on-surface-variant)">{copy.playStoreEyebrow}</span>
                  <span className="text-sm font-semibold">Google Play</span>
                </div>
              </a>
            </div>
          </div>

          {/* Vertical divider */}
          <div className="hidden lg:block w-px self-stretch mx-8 bg-[color-mix(in_oklab,var(--dt-outline-variant)_38%,transparent)]" />

          {/* ── Product ── */}
          <div className="lg:px-6 xl:px-8">
            <p className="text-[11px] font-semibold tracking-[0.15em] uppercase text-(--dt-on-surface-variant)">
              Product
            </p>
            <nav className="mt-5 flex flex-col gap-3">
              {[
                { href: "#features", label: copy.features },
                { href: "#how-it-works", label: copy.howItWorks },
                { href: "#plans", label: copy.plans },
              ].map(({ href, label }) => (
                <a
                  key={href}
                  href={href}
                  className="group inline-flex items-center gap-1 text-sm text-(--dt-on-surface) transition-colors hover:text-(--dt-primary-container)"
                >
                  {label}
                  <ArrowUpRight className="h-3 w-3 opacity-0 -translate-x-1 transition-all group-hover:opacity-100 group-hover:translate-x-0" />
                </a>
              ))}
            </nav>
          </div>

          {/* ── Platform ── */}
          <div className="lg:px-6 xl:px-8">
            <p className="text-[11px] font-semibold tracking-[0.15em] uppercase text-(--dt-on-surface-variant)">
              Platform
            </p>
            <nav className="mt-5 flex flex-col gap-3">
              <a
                href={STORE_LINKS.appStore}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center gap-1.5 text-sm text-(--dt-on-surface) transition-colors hover:text-(--dt-primary-container)"
              >
                <Smartphone className="h-3.5 w-3.5 shrink-0" />
                iOS App
                <ArrowUpRight className="h-3 w-3 opacity-0 -translate-x-1 transition-all group-hover:opacity-100 group-hover:translate-x-0" />
              </a>
              <a
                href={STORE_LINKS.playStore}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center gap-1.5 text-sm text-(--dt-on-surface) transition-colors hover:text-(--dt-primary-container)"
              >
                <Smartphone className="h-3.5 w-3.5 shrink-0" />
                Android App
                <ArrowUpRight className="h-3 w-3 opacity-0 -translate-x-1 transition-all group-hover:opacity-100 group-hover:translate-x-0" />
              </a>
            </nav>
          </div>

          {/* ── Legal ── */}
          <div className="lg:pl-6 xl:pl-8">
            <p className="text-[11px] font-semibold tracking-[0.15em] uppercase text-(--dt-on-surface-variant)">
              Legal
            </p>
            <nav className="mt-5 flex flex-col gap-3">
              <Link
                href="/privacy"
                className="group inline-flex items-center gap-1 text-sm text-(--dt-on-surface) transition-colors hover:text-(--dt-primary-container)"
              >
                {copy.footerPrivacy}
                <ArrowUpRight className="h-3 w-3 opacity-0 -translate-x-1 transition-all group-hover:opacity-100 group-hover:translate-x-0" />
              </Link>
              <Link
                href="/terms"
                className="group inline-flex items-center gap-1 text-sm text-(--dt-on-surface) transition-colors hover:text-(--dt-primary-container)"
              >
                {copy.footerTerms}
                <ArrowUpRight className="h-3 w-3 opacity-0 -translate-x-1 transition-all group-hover:opacity-100 group-hover:translate-x-0" />
              </Link>
              <Link
                href="/cookies"
                className="group inline-flex items-center gap-1 text-sm text-(--dt-on-surface) transition-colors hover:text-(--dt-primary-container)"
              >
                {copy.footerCookies}
                <ArrowUpRight className="h-3 w-3 opacity-0 -translate-x-1 transition-all group-hover:opacity-100 group-hover:translate-x-0" />
              </Link>
              <Link
                href="/refund"
                className="group inline-flex items-center gap-1 text-sm text-(--dt-on-surface) transition-colors hover:text-(--dt-primary-container)"
              >
                {copy.footerRefund}
                <ArrowUpRight className="h-3 w-3 opacity-0 -translate-x-1 transition-all group-hover:opacity-100 group-hover:translate-x-0" />
              </Link>
            </nav>
          </div>
        </div>

        {/* ── Bottom bar ── */}
        <div className="relative mt-10 flex flex-col gap-3 border-t border-(--dt-outline-variant)/30 px-8 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-10">
          <div className="flex items-center gap-1.5 text-xs text-(--dt-on-surface-variant)">
            <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-(--dt-primary-container)" />
            <span>© {new Date().getFullYear()} GossipAI. {copy.footerRights}</span>
          </div>
          <div className="flex items-center gap-2">
            {(["iOS", "Android"] as const).map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-(--dt-outline-variant)/40 px-2.5 py-0.5 text-[11px] tracking-wide text-(--dt-on-surface-variant)"
              >
                {tag}
              </span>
            ))}
            <span className="rounded-full border border-(--dt-primary-container)/35 bg-[color-mix(in_srgb,var(--dt-primary-container)_8%,transparent)] px-2.5 py-0.5 text-[11px] tracking-wide text-(--dt-primary-container)">
              AI-powered
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}

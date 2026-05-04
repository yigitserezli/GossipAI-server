"use client";

import Link from "next/link";
import Image from "next/image";
import { useDesignTokens } from "@/hooks/use-design-tokens";

type LegalShellProps = {
  title: string;
  subtitle: string;
  active: "terms" | "privacy";
  children: React.ReactNode;
  navExtra?: React.ReactNode;
  backToHome?: string;
  footerRights?: string;
  footerPrivacy?: string;
  footerTerms?: string;
};

export function LegalShell({
  title,
  subtitle,
  active,
  children,
  navExtra,
  backToHome = "Back to home",
  footerRights = "All rights reserved.",
  footerPrivacy = "Privacy Policy",
  footerTerms = "Terms of Service",
}: LegalShellProps) {
  const { cssVars } = useDesignTokens();

  return (
    <div style={cssVars} className="stitch-shell min-h-screen text-(--dt-on-bg)">
      <div className="pointer-events-none absolute left-[-120px] top-[-120px] h-80 w-80 rounded-full bg-(--dt-primary-container)/20 blur-3xl" />
      <div className="pointer-events-none absolute right-[-120px] top-[30%] h-80 w-80 rounded-full bg-(--dt-secondary)/16 blur-3xl" />

      <nav className="stitch-glass sticky top-0 z-50 mx-auto mt-4 flex w-[calc(100%-2rem)] max-w-5xl items-center justify-between rounded-2xl px-6 py-4">
        <Link href="/" className="flex items-center gap-2.5">
          <Image
            src="/AppIcons/Assets.xcassets/AppIcon.appiconset/60.png"
            alt="GossipAI logo"
            width={32}
            height={32}
            className="h-8 w-8 rounded-lg object-cover"
            priority
          />
          <span className="text-sm font-semibold text-(--dt-on-surface)">GossipAI</span>
        </Link>
        <div className="flex items-center gap-3">
          {navExtra}
          <Link href="/" className="text-sm text-(--dt-on-surface-variant) hover:text-(--dt-primary)">
            {backToHome}
          </Link>
        </div>
      </nav>

      <main className="relative z-10 mx-auto w-full max-w-5xl px-6 pb-16 pt-10">
        <header className="mb-10">
          <h1 className="editorial-heading text-[length:var(--dt-h2-size)] leading-[var(--dt-h2-line)] text-(--dt-on-surface) sm:text-6xl">
            {title}
          </h1>
          <p className="mt-2 text-sm text-(--dt-on-surface-variant)">{subtitle}</p>
        </header>

        <div className="space-y-5">{children}</div>
      </main>

      <footer className="border-t border-(--dt-outline-variant)/60 py-8">
        <div className="mx-auto flex w-full max-w-5xl flex-wrap items-center justify-between gap-4 px-6">
          <p className="text-xs text-(--dt-on-surface-variant)">© {new Date().getFullYear()} GossipAI. {footerRights}</p>
          <div className="flex gap-5 text-xs text-(--dt-on-surface-variant)">
            <Link href="/privacy" className={active === "privacy" ? "text-(--dt-primary)" : "hover:text-(--dt-primary)"}>
              {footerPrivacy}
            </Link>
            <Link href="/terms" className={active === "terms" ? "text-(--dt-primary)" : "hover:text-(--dt-primary)"}>
              {footerTerms}
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

export function LegalSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="stitch-glass rounded-2xl p-5">
      <h2 className="mb-3 text-xl font-semibold text-(--dt-primary)">{title}</h2>
      <div className="space-y-3 text-sm leading-relaxed text-(--dt-on-surface-variant)">{children}</div>
    </section>
  );
}

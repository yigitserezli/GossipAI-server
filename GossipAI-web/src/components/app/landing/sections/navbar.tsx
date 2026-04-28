"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { STORE_LINKS } from "@/config/store-links";
import {
  LANDING_LANGUAGES,
  LANDING_LANGUAGE_LABELS,
  type LandingCopy,
  type LandingLanguage,
} from "@/components/app/landing/content";
import { APPLE_PATH } from "@/components/app/landing/ui";

const HEADER_LINKS: Array<{
  href: string;
  key: "features" | "plans" | "howItWorks";
}> = [
  { href: "#features", key: "features" },
  { href: "#plans", key: "plans" },
  { href: "#how-it-works", key: "howItWorks" },
];

export function LandingNavbar({
  copy,
  language,
  onLanguageChange,
}: {
  copy: LandingCopy;
  language: LandingLanguage;
  onLanguageChange: (value: LandingLanguage) => void;
}) {
  const [isCompact, setIsCompact] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      // Hysteresis prevents flicker when scroll position hovers around the threshold.
      setIsCompact((prev) => (prev ? y > 10 : y > 28));
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <div aria-hidden="true" className="h-[104px]" />
      <div className="fixed inset-x-0 top-3 z-40">
        <nav
          className={`stitch-glass mx-auto flex w-[calc(100%-2rem)] max-w-6xl items-center justify-between rounded-2xl border transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
            isCompact
              ? "border-(--dt-outline-variant)/60 px-4 py-3 shadow-[0_12px_28px_rgba(8,8,14,0.35)]"
              : "border-(--dt-outline-variant)/30 px-6 py-5"
          }`}
        >
          <div
            className={`flex items-center transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${isCompact ? "gap-2.5" : "gap-3"}`}
          >
            <Image
              src="/AppIcons/Assets.xcassets/AppIcon.appiconset/60.png"
              alt="GossipAI logo"
              width={36}
              height={36}
              className={`rounded-xl object-cover shadow-[0_8px_24px_rgba(15,23,42,0.35)] transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                isCompact ? "h-8 w-8" : "h-9 w-9"
              }`}
              priority
            />
            <span
              className={`font-semibold tracking-tight text-(--dt-on-surface) transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                isCompact ? "text-[13px]" : "text-sm"
              }`}
            >
              GossipAI
            </span>
          </div>
          <div
            className={`flex items-center transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${isCompact ? "gap-3.5" : "gap-5"}`}
          >
            {HEADER_LINKS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`hidden text-(--dt-on-surface-variant) hover:text-(--dt-on-surface) sm:block ${
                  isCompact ? "text-[13px]" : "text-sm"
                }`}
              >
                {copy[item.key]}
              </Link>
            ))}
            <select
              value={language}
              onChange={(e) => onLanguageChange(e.target.value as LandingLanguage)}
              className={`rounded-lg border border-(--dt-outline-variant) bg-(--dt-surface-low) text-xs text-(--dt-on-surface) transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                isCompact ? "h-8 px-2" : "h-9 px-2.5"
              }`}
              aria-label="Landing language"
            >
              {LANDING_LANGUAGES.map((code) => (
                <option key={code} value={code}>
                  {LANDING_LANGUAGE_LABELS[code]}
                </option>
              ))}
            </select>
            <a
              href={STORE_LINKS.appStore}
              target="_blank"
              rel="noopener noreferrer"
              className={`inline-flex items-center rounded-xl bg-(--dt-primary-container) font-semibold text-[#0A0A0A] transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:bg-(--dt-primary) ${
                isCompact ? "gap-1.5 px-3 py-1.5 text-[13px]" : "gap-2 px-4 py-2 text-sm"
              }`}
            >
              <svg viewBox="0 0 814 1000" className="h-3.5 w-3.5 fill-white" xmlns="http://www.w3.org/2000/svg">
                <path d={APPLE_PATH} />
              </svg>
              {copy.download}
            </a>
          </div>
        </nav>
      </div>
    </>
  );
}

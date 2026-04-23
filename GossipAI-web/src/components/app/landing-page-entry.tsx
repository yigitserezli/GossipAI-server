"use client";

import dynamic from "next/dynamic";
import type { SloganEntry } from "@/components/app/landing/types";

const LandingPageNoSSR = dynamic(
  () => import("@/components/app/landing-page").then((mod) => mod.LandingPage),
  {
    ssr: false,
  }
);

export function LandingPageEntry({ slogans }: { slogans?: Record<string, SloganEntry> }) {
  return <LandingPageNoSSR slogans={slogans} />;
}

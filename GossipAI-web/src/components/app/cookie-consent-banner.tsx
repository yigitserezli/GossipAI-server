"use client";

import Link from "next/link";
import { Cookie, X } from "lucide-react";
import { useSyncExternalStore } from "react";
import { Button } from "@/components/ui/button";

const COOKIE_CONSENT_STORAGE_KEY = "gossipai-cookie-consent";
const COOKIE_CONSENT_VALUE = "accepted-essential-v1";
const COOKIE_CONSENT_CHANGE_EVENT = "gossipai-cookie-consent-change";
let inMemoryConsentValue = "";

function getCookieConsentSnapshot() {
  if (typeof window === "undefined") {
    return COOKIE_CONSENT_VALUE;
  }

  try {
    return window.localStorage.getItem(COOKIE_CONSENT_STORAGE_KEY) ?? inMemoryConsentValue;
  } catch {
    return inMemoryConsentValue || COOKIE_CONSENT_VALUE;
  }
}

function subscribeToCookieConsent(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener(COOKIE_CONSENT_CHANGE_EVENT, callback);

  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(COOKIE_CONSENT_CHANGE_EVENT, callback);
  };
}

export function CookieConsentBanner() {
  const consentValue = useSyncExternalStore(
    subscribeToCookieConsent,
    getCookieConsentSnapshot,
    () => COOKIE_CONSENT_VALUE,
  );
  const isVisible = consentValue !== COOKIE_CONSENT_VALUE;

  const acceptConsent = () => {
    inMemoryConsentValue = COOKIE_CONSENT_VALUE;

    try {
      window.localStorage.setItem(COOKIE_CONSENT_STORAGE_KEY, COOKIE_CONSENT_VALUE);
    } catch {
      // If browser storage is unavailable, still let the user dismiss the notice for this session.
    }

    window.dispatchEvent(new Event(COOKIE_CONSENT_CHANGE_EVENT));
  };

  if (!isVisible) {
    return null;
  }

  return (
    <section
      aria-label="Cookie notice"
      className="fixed inset-x-0 bottom-0 z-[80] px-4 pb-4 sm:px-6 sm:pb-6"
    >
      <div className="mx-auto flex max-w-5xl flex-col gap-4 rounded-2xl border border-white/15 bg-[#0c1020]/95 p-4 text-white shadow-2xl shadow-black/30 backdrop-blur md:flex-row md:items-center md:justify-between">
        <div className="flex gap-3">
          <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/10">
            <Cookie className="h-4 w-4" />
          </div>
          <div className="space-y-1">
            <h2 className="text-sm font-semibold">Cookie ve cihaz depolama bildirimi</h2>
            <p className="max-w-3xl text-xs leading-5 text-white/78 sm:text-sm">
              GossipAI sadece gerekli ve işlevsel depolama kullanır: oturum güvenliği, dil tercihi,
              destek/admin arayüzü durumu ve bu bildirimi kabul ettiğini hatırlama. Reklam cookie&apos;si,
              üçüncü taraf pikseli veya siteler arası takip kullanmıyoruz.
            </p>
            <Link href="/cookies" className="inline-flex text-xs font-semibold text-[#8df5dc] hover:underline">
              Cookie Policy
            </Link>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2 self-end md:self-auto">
          <Button
            type="button"
            variant="outline"
            className="border-white/20 bg-white/8 text-white hover:bg-white/14 hover:text-white"
            onClick={acceptConsent}
          >
            Anladım
          </Button>
          <Button
            type="button"
            size="icon"
            variant="ghost"
            className="text-white/75 hover:bg-white/10 hover:text-white"
            onClick={acceptConsent}
            aria-label="Close cookie notice"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </section>
  );
}

"use client";

import { useEffect, useMemo, useState } from "react";
import { z } from "zod";
import { LANDING_LANGUAGES, TRANSLATIONS, type LandingLanguage } from "@/components/app/landing/content";
import {
    LandingBackground,
    LandingCtaSection,
    LandingFeatureRealmSection,
    LandingFeaturesSection,
    LandingFooter,
    LandingHero,
    LandingHowItWorksSection,
    LandingNavbar,
    LandingPricingSection,
    LandingValueSection,
} from "@/components/app/landing/sections";
import type { SloganEntry } from "@/components/app/landing/types";
import { useDesignTokens } from "@/hooks/use-design-tokens";
import { useApiQuery } from "@/lib/query/hooks";

const publicPlanSchema = z.object({
    plan: z.enum(["basic", "premium"]),
    displayName: z.string(),
    priceUsd: z.number(),
    billingInterval: z.string(),
    dailyPromptLimit: z.number(),
});

const publicPlansSchema = z.array(publicPlanSchema);

const LANDING_LANGUAGE_STORAGE_KEY = "gossipai-landing-language";

export function LandingPage({ slogans }: { slogans?: Record<string, SloganEntry> }) {
    const [isAuroraReady, setIsAuroraReady] = useState(false);
    const [language, setLanguage] = useState<LandingLanguage>(() => {
        if (typeof window === "undefined") return "en";
        const stored = window.localStorage.getItem(LANDING_LANGUAGE_STORAGE_KEY);
        if (!stored) return "en";
        return (LANDING_LANGUAGES as readonly string[]).includes(stored) ? (stored as LandingLanguage) : "en";
    });
    const { cssVars } = useDesignTokens();

    useEffect(() => {
        if (typeof window === "undefined") return;
        window.localStorage.setItem(LANDING_LANGUAGE_STORAGE_KEY, language);
    }, [language]);

    const copy = TRANSLATIONS[language] ?? TRANSLATIONS.en;
    const sloganEntry = useMemo(() => {
        const key = language.toLowerCase();
        const fallback = slogans?.en;
        return slogans?.[key] ?? fallback;
    }, [language, slogans]);

    const plansQuery = useApiQuery({
        queryKey: ["public", "subscription", "plans"],
        request: {
            method: "GET",
            url: "/subscription/plans",
        },
        schema: publicPlansSchema,
        options: {
            retry: 1,
        },
    });

    const basicPlan = useMemo(
        () => plansQuery.data?.find((plan) => plan.plan === "basic") ?? { priceUsd: 0, dailyPromptLimit: 5 },
        [plansQuery.data],
    );
    const premiumPlan = useMemo(
        () => plansQuery.data?.find((plan) => plan.plan === "premium") ?? { priceUsd: 9.99, dailyPromptLimit: 100 },
        [plansQuery.data],
    );

    const formatUSD = (value: number) =>
        new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
            minimumFractionDigits: value === 0 ? 0 : 2,
        }).format(value);

    return (
        <div style={cssVars} className="stitch-shell relative isolate overflow-x-hidden text-(--dt-on-bg)">
            <LandingBackground onReady={() => setIsAuroraReady(true)} />
            {isAuroraReady ? (
                <>
                    <LandingNavbar copy={copy} language={language} onLanguageChange={setLanguage} />
                    <div className="relative z-10 flex min-h-[calc(100vh-6.5rem)] flex-col">
                        <LandingHero copy={copy} sloganEntry={sloganEntry} />
                    </div>
                    <LandingFeatureRealmSection copy={copy} />
                    <LandingFeaturesSection copy={copy} />
                    <LandingValueSection copy={copy} />
                    <LandingHowItWorksSection copy={copy} />
                    <LandingPricingSection copy={copy} basicPlan={basicPlan} premiumPlan={premiumPlan} formatUSD={formatUSD} />
                    <LandingCtaSection copy={copy} />
                    <LandingFooter copy={copy} />
                </>
            ) : (
                <div aria-hidden="true" className="relative z-2 min-h-screen" />
            )}
        </div>
    );
}

import { ArrowRight, CheckCircle2 } from "lucide-react";
import { STORE_LINKS } from "@/config/store-links";
import type { LandingCopy } from "@/components/app/landing/content";

function renderEditorialHeading(text: string) {
    const parts = text.split(/(clarity|friction)/gi);

    return parts.map((part, index) => {
        if (/^(clarity|friction)$/i.test(part)) {
            return (
                <span key={`${part}-${index}`} className="text-(--dt-primary-container) italic">
                    {part}
                </span>
            );
        }

        return <span key={`${part}-${index}`}>{part}</span>;
    });
}

export function LandingValueSection({ copy }: { copy: LandingCopy }) {
    return (
        <section className="relative z-10 overflow-hidden bg-[#02010a] py-24 sm:py-32">
            <div
                aria-hidden="true"
                className="pointer-events-none absolute left-[-8rem] top-[-4rem] h-[28rem] w-[28rem] rounded-full bg-[radial-gradient(circle,color-mix(in_srgb,var(--dt-primary-container)_18%,transparent),transparent_70%)] blur-3xl"
            />
            <div
                aria-hidden="true"
                className="pointer-events-none absolute bottom-0 right-[-6rem] h-80 w-80 rounded-full bg-[radial-gradient(circle,color-mix(in_srgb,var(--dt-primary)_12%,transparent),transparent_70%)] blur-[120px]"
            />

            <div className="relative mx-auto w-full max-w-7xl px-6">
                <div className="grid gap-0 lg:grid-cols-[1.15fr_1px_0.85fr]">
                    {/* Left – Value */}
                    <div className="pb-16 pr-0 lg:pb-0 lg:pr-16 xl:pr-24">
                        <p className="editorial-kicker text-[11px] font-semibold tracking-[0.14em] uppercase text-(--dt-primary-container)">
                            {copy.valueTag}
                        </p>
                        <h2 className="editorial-heading mt-5 text-5xl font-extrabold leading-[1.0] tracking-tight text-(--dt-on-surface) sm:text-6xl xl:text-7xl">
                            {renderEditorialHeading(copy.valueHeading)}
                        </h2>
                        <p className="mt-6 max-w-xl text-base leading-relaxed text-(--dt-on-surface-variant) sm:text-lg">
                            {copy.valueDescription}
                        </p>
                        <ul className="mt-10 space-y-5">
                            {copy.valueBullets.map((item) => (
                                <li key={item} className="flex items-start gap-4">
                                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-(--dt-primary-container)" />
                                    <span className="text-base leading-relaxed text-(--dt-on-surface-variant)">{item}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Vertical divider */}
                    <div className="hidden lg:block w-px self-stretch bg-[color-mix(in_oklab,var(--dt-outline-variant)_55%,transparent)]" />

                    {/* Right – Mission */}
                    <div className="border-t border-(--dt-outline-variant)/40 pt-16 lg:border-none lg:pb-0 lg:pl-16 lg:pt-0 xl:pl-24">
                        <p className="editorial-kicker text-[11px] font-semibold tracking-[0.14em] uppercase text-(--dt-on-surface-variant)">
                            {copy.missionTag}
                        </p>
                        <h2 className="editorial-heading mt-5 text-4xl font-extrabold leading-[1.02] tracking-tight text-(--dt-on-surface) sm:text-5xl xl:text-6xl">
                            {renderEditorialHeading(copy.missionHeading)}
                        </h2>
                        <p className="mt-6 text-base leading-relaxed text-(--dt-on-surface-variant) sm:text-lg">
                            {copy.missionDescription}
                        </p>
                        <a
                            href={STORE_LINKS.appStore}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-10 inline-flex items-center gap-2.5 rounded-full bg-(--dt-primary-container) px-6 py-3 text-sm font-semibold text-[#0A0A0A] transition-colors hover:bg-(--dt-primary)"
                        >
                            {copy.missionCta}
                            <ArrowRight className="h-4 w-4" />
                        </a>
                    </div>
                </div>
            </div>
        </section>
    );
}


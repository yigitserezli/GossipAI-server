import { ArrowRight, CheckCircle2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { STORE_LINKS } from "@/config/store-links";
import type { LandingCopy } from "@/components/app/landing/content";

function renderEditorialHeading(text: string) {
    const parts = text.split(/(clarity|friction)/gi);

    return parts.map((part, index) => {
        if (/^(clarity|friction)$/i.test(part)) {
            return (
                <span key={`${part}-${index}`} className="text-(--dt-primary-container)">
                    {part}
                </span>
            );
        }

        return <span key={`${part}-${index}`}>{part}</span>;
    });
}

export function LandingValueSection({ copy }: { copy: LandingCopy }) {
    return (
        <section className="relative z-10 mx-auto w-full max-w-6xl px-6 pt-10 pb-24 sm:pt-14">
            <div className="grid items-start gap-5 lg:grid-cols-3 lg:gap-6">
                <Card className="tilt-card relative overflow-hidden rounded-[1.75rem] border-(--dt-outline-variant) bg-[linear-gradient(160deg,color-mix(in_oklab,var(--dt-surface)_90%,black_10%),color-mix(in_oklab,var(--dt-surface-low)_78%,black_22%))] lg:col-span-2">
                    <CardContent className="p-7 sm:p-8">
                        <div className="inline-flex items-center rounded-full border border-(--dt-primary-container)/35 bg-(--dt-primary-container)/10 px-3 py-1">
                            <p className="editorial-kicker text-[11px] font-semibold tracking-[0.08em] text-(--dt-primary-container)">
                                {copy.valueTag}
                            </p>
                        </div>
                        <h3 className="editorial-heading mt-4 text-3xl leading-[1.08] font-extrabold tracking-[0.02em] text-(--dt-on-surface) sm:text-4xl">
                            {renderEditorialHeading(copy.valueHeading)}
                        </h3>
                        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-(--dt-on-surface-variant)">{copy.valueDescription}</p>
                        <div className="mt-7 grid gap-3 sm:grid-cols-2">
                            {copy.valueBullets.map((item) => (
                                <div
                                    key={item}
                                    className="flex items-start gap-2 rounded-xl border border-(--dt-outline-variant)/70 bg-(--dt-surface)/45 px-3 py-2 text-sm text-(--dt-on-surface-variant)"
                                >
                                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-(--dt-primary-container)" />
                                    <span>{item}</span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
                <Card className="tilt-card float-slow relative overflow-hidden rounded-[1.75rem] border-(--dt-outline-variant) bg-[linear-gradient(160deg,color-mix(in_oklab,var(--dt-surface-low)_88%,black_12%),color-mix(in_oklab,var(--dt-surface)_78%,black_22%))] text-(--dt-on-surface) lg:translate-y-10">
                    <CardContent className="p-7 sm:p-8">
                        <div className="inline-flex items-center rounded-full border border-(--dt-outline-variant)/80 bg-(--dt-surface)/50 px-3 py-1">
                            <p className="editorial-kicker text-[11px] font-semibold tracking-[0.08em] text-(--dt-on-surface-variant)">
                                {copy.missionTag}
                            </p>
                        </div>
                        <h3 className="editorial-heading mt-4 text-3xl leading-[1.08] font-extrabold tracking-[0.02em] text-(--dt-on-surface) sm:text-4xl">
                            {renderEditorialHeading(copy.missionHeading)}
                        </h3>
                        <p className="mt-3 text-sm leading-relaxed text-(--dt-on-surface-variant)">{copy.missionDescription}</p>
                        <a
                            href={STORE_LINKS.appStore}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-6 inline-flex items-center gap-2 rounded-xl border border-(--dt-primary-container)/30 bg-(--dt-primary-container) px-3.5 py-2 text-sm font-semibold text-[#0A0A0A] transition-colors hover:bg-(--dt-primary)"
                        >
                            {copy.missionCta}
                            <ArrowRight className="h-4 w-4" />
                        </a>
                    </CardContent>
                </Card>
            </div>
        </section>
    );
}

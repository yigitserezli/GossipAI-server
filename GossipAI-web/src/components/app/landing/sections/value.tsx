import { ArrowRight, CheckCircle2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { STORE_LINKS } from "@/config/store-links";
import type { LandingCopy } from "@/components/app/landing/content";

export function LandingValueSection({ copy }: { copy: LandingCopy }) {
  return (
    <section className="relative z-10 mx-auto w-full max-w-6xl px-6 pb-24">
      <div className="grid gap-5 lg:grid-cols-3">
        <Card className="tilt-card border-(--dt-outline-variant) bg-(--dt-surface)/90 lg:col-span-2">
          <CardContent className="p-7">
            <p className="editorial-kicker text-xs font-semibold text-(--dt-primary-container)">{copy.valueTag}</p>
            <h3 className="editorial-heading mt-2 text-4xl font-extrabold tracking-tight">{copy.valueHeading}</h3>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-(--dt-on-surface-variant)">
              {copy.valueDescription}
            </p>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {copy.valueBullets.map((item) => (
                <div key={item} className="flex items-start gap-2 text-sm text-(--dt-on-surface-variant)">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 text-(--dt-primary-container)" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card className="tilt-card float-slow border-(--dt-outline-variant) bg-(--dt-surface-low) text-(--dt-on-surface)">
          <CardContent className="p-7">
            <p className="editorial-kicker text-xs font-semibold text-(--dt-on-surface-variant)">{copy.missionTag}</p>
            <h3 className="editorial-heading mt-2 text-4xl font-extrabold tracking-tight">{copy.missionHeading}</h3>
            <p className="mt-3 text-sm leading-relaxed text-(--dt-on-surface-variant)">
              {copy.missionDescription}
            </p>
            <a
              href={STORE_LINKS.appStore}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex items-center gap-2 rounded-lg bg-(--dt-primary-container) px-3.5 py-2 text-sm font-semibold text-[#0A0A0A] hover:bg-(--dt-primary)"
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

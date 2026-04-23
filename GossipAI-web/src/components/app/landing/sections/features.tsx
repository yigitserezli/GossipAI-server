import { BriefcaseBusiness, Users } from "lucide-react";
import type { LandingCopy } from "@/components/app/landing/content";

export function LandingFeaturesSection({ copy }: { copy: LandingCopy }) {
  return (
    <section id="features" className="relative z-10 bg-[#020202] py-24 sm:py-28">
      <div className="mx-auto grid w-full max-w-7xl gap-16 px-6 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20">
        <div className="max-w-lg">
          <h2 className="font-serif text-4xl leading-[1.02] tracking-tight text-white sm:text-5xl">
            <span>{copy.featuresRealmHeadingLine1}</span>
            <br />
            <span>{copy.featuresRealmHeadingLine2}</span>
            <br />
            <span className="text-[#b689ff] italic">{copy.featuresRealmHeadingLine3}</span>
          </h2>
          <p className="mt-6 text-base leading-relaxed text-white/58 sm:text-lg">
            {copy.featuresRealmDescription}
          </p>
        </div>

        <div className="space-y-16 sm:space-y-20">
          <article className="flex items-start gap-7 sm:gap-9">
            <div className="grid h-20 w-20 shrink-0 place-items-center border border-[#8a65d6]/35 text-[#b689ff]">
              <Users className="h-8 w-8" />
            </div>
            <div>
              <h3 className="font-serif text-2xl leading-[1.1] tracking-tight text-white sm:text-3xl">
                {copy.featuresRealmPersonalTitle}
              </h3>
              <p className="mt-3 max-w-4xl text-sm leading-relaxed text-white/58 sm:text-base">
                {copy.featuresRealmPersonalDescription}
              </p>
            </div>
          </article>

          <article className="flex items-start gap-7 sm:gap-9">
            <div className="grid h-20 w-20 shrink-0 place-items-center border border-[#8a65d6]/35 text-[#b689ff]">
              <BriefcaseBusiness className="h-8 w-8" />
            </div>
            <div>
              <h3 className="font-serif text-2xl leading-[1.1] tracking-tight text-white sm:text-3xl">
                {copy.featuresRealmProfessionalTitle}
              </h3>
              <p className="mt-3 max-w-4xl text-sm leading-relaxed text-white/58 sm:text-base">
                {copy.featuresRealmProfessionalDescription}
              </p>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}

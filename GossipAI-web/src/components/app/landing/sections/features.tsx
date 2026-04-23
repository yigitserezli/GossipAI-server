import { BriefcaseBusiness, Users } from "lucide-react";
import type { LandingCopy } from "@/components/app/landing/content";

export function LandingFeaturesSection({ copy: _copy }: { copy: LandingCopy }) {
  return (
    <section id="features" className="relative z-10 bg-[#020202] py-24 sm:py-28">
      <div className="mx-auto grid w-full max-w-7xl gap-16 px-6 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20">
        <div className="max-w-[32rem]">
          <h2 className="font-serif text-6xl leading-[0.95] tracking-tight text-white sm:text-7xl">
            <span>Two Distinct</span>
            <br />
            <span>Realms</span>
            <br />
            <span className="text-[#b689ff] italic">of Insight</span>
          </h2>
          <p className="mt-10 text-[2rem] leading-relaxed text-white/58 sm:text-[2.2rem]">
            Delve deep into the nuances of human interaction across every sphere of your life.
          </p>
        </div>

        <div className="space-y-16 sm:space-y-20">
          <article className="flex items-start gap-7 sm:gap-9">
            <div className="grid h-20 w-20 shrink-0 place-items-center border border-[#8a65d6]/35 text-[#b689ff]">
              <Users className="h-8 w-8" />
            </div>
            <div>
              <h3 className="font-serif text-5xl leading-[1.03] tracking-tight text-white sm:text-6xl">
                Personal Life Insights
              </h3>
              <p className="mt-4 max-w-4xl text-[2rem] leading-relaxed text-white/58 sm:text-[2.2rem]">
                Decode mixed signals, resolve lingering conflicts, and understand the deeper dynamics of your friendships
                and romantic pursuits with clinical precision. Our algorithms analyze subtext that human intuition might
                miss.
              </p>
            </div>
          </article>

          <article className="flex items-start gap-7 sm:gap-9">
            <div className="grid h-20 w-20 shrink-0 place-items-center border border-[#8a65d6]/35 text-[#b689ff]">
              <BriefcaseBusiness className="h-8 w-8" />
            </div>
            <div>
              <h3 className="font-serif text-5xl leading-[1.03] tracking-tight text-white sm:text-6xl">
                Professional Strategy
              </h3>
              <p className="mt-4 max-w-4xl text-[2rem] leading-relaxed text-white/58 sm:text-[2.2rem]">
                Navigate office politics, read the room in critical meetings, and optimize your career trajectory based on
                behavioral analysis of your peers and superiors. Anticipate moves before they happen.
              </p>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}

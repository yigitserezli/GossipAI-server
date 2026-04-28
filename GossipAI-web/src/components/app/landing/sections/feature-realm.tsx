import type { ReactNode } from "react";
import { MessageCircleHeart, Route, ScrollText, Sparkles } from "lucide-react";
import type { LandingCopy } from "@/components/app/landing/content";

function FeatureCard({
  icon,
  title,
  desc,
  index,
}: {
  icon: ReactNode;
  title: string;
  desc: string;
  index: number;
}) {
  return (
    <div
      className="tilt-card reveal-up relative overflow-hidden rounded-3xl border border-(--dt-primary-container)/35 bg-(--dt-surface)/85 p-6 backdrop-blur-sm"
      style={{ animationDelay: `${180 + index * 80}ms` }}
    >
      <div className="pointer-events-none absolute -right-24 -top-24 h-52 w-52 rounded-full bg-(--dt-primary-container)/14 blur-3xl" />
      <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl border border-(--dt-primary-container)/45 bg-(--dt-surface-low) text-(--dt-primary)">
        {icon}
      </div>
      <h3 className="mb-3 text-xl font-medium tracking-tight text-(--dt-on-surface) sm:text-2xl">{title}</h3>
      <p className="text-sm leading-relaxed text-(--dt-on-surface-variant) sm:text-base">{desc}</p>
    </div>
  );
}

export function LandingFeatureRealmSection({ copy }: { copy: LandingCopy }) {
  return (
    <section className="relative z-10 w-full px-4 pb-10 pt-20 md:px-8 lg:px-12">
      <div className="mx-auto w-full max-w-375">
        <div className="mb-9 text-center">
          <h2 className="text-2xl font-semibold tracking-tight text-(--dt-on-surface) sm:text-3xl">
            {copy.featureHeading}
          </h2>
        </div>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {[
            { icon: <MessageCircleHeart className="h-6 w-6" />, ...copy.featureCards[0] },
            { icon: <Sparkles className="h-6 w-6" />, ...copy.featureCards[1] },
            { icon: <Route className="h-6 w-6" />, ...copy.featureCards[2] },
            { icon: <ScrollText className="h-6 w-6" />, ...copy.featureCards[3] },
          ].map(({ icon, title, desc }, index) => (
            <FeatureCard key={title} icon={icon} title={title} desc={desc} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}

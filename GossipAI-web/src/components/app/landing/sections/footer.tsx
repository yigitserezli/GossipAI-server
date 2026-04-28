import Image from "next/image";
import Link from "next/link";
import { STORE_LINKS } from "@/config/store-links";
import type { LandingCopy } from "@/components/app/landing/content";

export function LandingFooter({ copy }: { copy: LandingCopy }) {
  return (
    <footer className="bg-(--dt-bg)">
      <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-5 px-6 py-10 sm:flex-row">
        <div className="flex items-center gap-2.5">
          <Image
            src="/AppIcons/Assets.xcassets/AppIcon.appiconset/58.png"
            alt="GossipAI logo"
            width={28}
            height={28}
            className="h-7 w-7 rounded-lg object-cover"
          />
          <span className="text-sm font-semibold">GossipAI</span>
        </div>
        <div className="flex flex-wrap justify-center gap-6 text-sm text-(--dt-on-surface-variant)">
          <Link href="/privacy" className="hover:text-(--dt-primary) hover:underline">{copy.footerPrivacy}</Link>
          <Link href="/terms" className="hover:text-(--dt-primary) hover:underline">{copy.footerTerms}</Link>
          <a href={STORE_LINKS.appStore} target="_blank" rel="noopener noreferrer" className="hover:text-(--dt-primary) hover:underline">App Store</a>
          <a href={STORE_LINKS.playStore} target="_blank" rel="noopener noreferrer" className="hover:text-(--dt-primary) hover:underline">Google Play</a>
        </div>
        <p className="text-xs text-(--dt-on-surface-variant)">© {new Date().getFullYear()} GossipAI. {copy.footerRights}</p>
      </div>
    </footer>
  );
}

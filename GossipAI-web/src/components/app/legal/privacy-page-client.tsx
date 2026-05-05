"use client";

import { useState } from "react";
import { LEGAL_CONTACT_EMAIL } from "@/components/app/legal/legal-config";
import { LegalSection, LegalShell } from "@/components/app/legal/legal-shell";
import {
  PRIVACY_TRANSLATIONS,
  LANGUAGE_LABELS,
  type SupportedLang,
} from "@/components/app/legal/privacy-translations";
import { cn } from "@/lib/utils";

export function PrivacyPageClient() {
  const [lang, setLang] = useState<SupportedLang>("en");
  const t = PRIVACY_TRANSLATIONS[lang];

  const langSwitcher = (
    <div className="flex gap-1">
      {(Object.keys(LANGUAGE_LABELS) as SupportedLang[]).map((l) => (
        <button
          key={l}
          onClick={() => setLang(l)}
          className={cn(
            "rounded-md px-2 py-1 text-xs font-medium uppercase transition-colors",
            l === lang
              ? "bg-(--dt-primary) text-(--dt-on-primary)"
              : "text-(--dt-on-surface-variant) hover:text-(--dt-primary)",
          )}
        >
          {LANGUAGE_LABELS[l]}
        </button>
      ))}
    </div>
  );

  return (
    <LegalShell
      title={t.pageTitle}
      subtitle={t.lastUpdated}
      active="privacy"
      navExtra={langSwitcher}
      backToHome={t.backToHome}
      footerRights={t.footerRights}
      footerPrivacy={t.footerPrivacy}
      footerTerms={t.footerTerms}
      footerCookies={t.footerCookies}
      footerRefund={t.footerRefund}
    >
      {t.sections.map((section) => (
        <LegalSection key={section.title} title={section.title}>
          {section.paragraph && (
            <p>
              {section.paragraph}
              {section.hasContactLink && (
                <>
                  {" "}
                  <a
                    href={`mailto:${section.contactEmail ?? LEGAL_CONTACT_EMAIL}`}
                    className="text-(--dt-primary) hover:underline"
                  >
                    {section.contactEmail ?? LEGAL_CONTACT_EMAIL}
                  </a>
                  {section.paragraphAfter && ` ${section.paragraphAfter}`}
                </>
              )}
            </p>
          )}
          {section.items && (
            <ul className="list-disc space-y-2 pl-5">
              {section.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          )}
        </LegalSection>
      ))}
    </LegalShell>
  );
}

"use client";

import Link from "next/link";
import { LegalSection, LegalShell } from "@/components/app/legal/legal-shell";
import {
  LEGAL_APP_NAME,
  LEGAL_BASE_URL,
  LEGAL_CONTACT_EMAIL,
  LEGAL_DOMAIN,
} from "@/components/app/legal/legal-config";

const LAST_UPDATED = "May 6, 2026";
const linkClass = "text-(--dt-primary) hover:underline";

export function CookiePageClient() {
  return (
    <LegalShell title="Cookie Policy" subtitle={`Last updated: ${LAST_UPDATED}`} active="cookies">
      <LegalSection title="1. Scope">
        <p>
          This Cookie Policy explains how {LEGAL_APP_NAME} uses cookies and similar technologies on{" "}
          <a href={LEGAL_BASE_URL} className={linkClass}>
            {LEGAL_DOMAIN}
          </a>{" "}
          and within the GossipAI mobile and web experience. It should be read together with our{" "}
          <Link href="/privacy" className={linkClass}>
            Privacy Policy
          </Link>{" "}
          and{" "}
          <Link href="/terms" className={linkClass}>
            Terms of Service
          </Link>
          .
        </p>
      </LegalSection>

      <LegalSection title="2. Mobile App Note">
        <p>
          GossipAI is primarily a mobile app, not a browser-first product. In this context, references to
          &quot;cookies&quot; also include secure on-device session tokens, local storage, and similar identifiers used
          to keep the app working correctly.
        </p>
      </LegalSection>

      <LegalSection title="3. What We Use">
        <ul className="list-disc space-y-2 pl-5">
          <li>Secure session or authentication tokens stored on-device so users can stay signed in.</li>
          <li>Local preferences such as language or interface state needed for app and web functionality.</li>
          <li>Limited usage and diagnostic data that may be aggregated to improve stability and product quality.</li>
          <li>
            A small functional browser cookie may be used in restricted web interface views to remember UI state, such
            as sidebar visibility.
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="4. What We Do Not Use">
        <p>
          We do not use advertising cookies, third-party ad pixels, or cross-site behavioural tracking technologies on
          the public GossipAI site.
        </p>
      </LegalSection>

      <LegalSection title="5. Why We Use These Technologies">
        <p>
          These technologies are used to authenticate sessions, preserve essential preferences, protect account access,
          and understand product performance in an aggregated way. They are not used to sell personal data.
        </p>
      </LegalSection>

      <LegalSection title="6. Your Choices">
        <p>
          You can control browser cookies and site data through your device or browser settings. In the mobile app, you
          can also remove the app or sign out to clear locally stored session information, subject to your device&apos;s
          operating system behavior.
        </p>
        <p>
          You may request deletion of your account and associated server-side data at any time through{" "}
          <Link href="/data-deletion" className={linkClass}>
            /data-deletion
          </Link>{" "}
          or by emailing{" "}
          <a href={`mailto:${LEGAL_CONTACT_EMAIL}`} className={linkClass}>
            {LEGAL_CONTACT_EMAIL}
          </a>
          .
        </p>
      </LegalSection>

      <LegalSection title="7. Changes to This Policy">
        <p>
          We may update this Cookie Policy from time to time. When we do, we will revise the &quot;Last updated&quot;
          date on this page.
        </p>
      </LegalSection>

      <LegalSection title="8. Contact Us">
        <p>
          For questions about our use of cookies or browser storage, contact{" "}
          <a href={`mailto:${LEGAL_CONTACT_EMAIL}`} className={linkClass}>
            {LEGAL_CONTACT_EMAIL}
          </a>
          .
        </p>
      </LegalSection>
    </LegalShell>
  );
}

"use client";

import { LegalSection, LegalShell } from "@/components/app/legal/legal-shell";

const LAST_UPDATED = "March 28, 2026";
const CONTACT_EMAIL = "privacy@gossip-ai.site";
const APP_NAME = "GossipAI";
const COMPANY = "GossipAI";

export function PrivacyPageClient() {
  return (
    <LegalShell title="Privacy Policy" subtitle={`Last updated: ${LAST_UPDATED}`} active="privacy">
      <LegalSection title="1. Introduction">
        <p>
          {COMPANY} operates the {APP_NAME} mobile app and website (the "Service"). This Privacy Policy explains how
          we collect, use, and safeguard your information.
        </p>
      </LegalSection>

      <LegalSection title="2. Information We Collect">
        <ul className="list-disc space-y-2 pl-5">
          <li>Account data: name, email address, and password hash.</li>
          <li>User-generated content: message text you voluntarily submit.</li>
          <li>Usage data: feature interactions and session metadata.</li>
          <li>Device data: device type, OS version, app version.</li>
          <li>Log data: IP address, browser type, crash reports.</li>
        </ul>
      </LegalSection>

      <LegalSection title="3. How We Use Your Information">
        <ul className="list-disc space-y-2 pl-5">
          <li>To provide and maintain the Service.</li>
          <li>To process AI requests and return results.</li>
          <li>To send transactional communications.</li>
          <li>To improve product quality and reliability.</li>
          <li>To prevent abuse and comply with legal obligations.</li>
        </ul>
      </LegalSection>

      <LegalSection title="4. AI Processing & OpenAI">
        <p>
          Submitted message text may be sent to OpenAI APIs to generate responses, under applicable contractual
          protections and platform policies.
        </p>
      </LegalSection>

      <LegalSection title="5. Data Retention">
        <p>
          Conversation history may be retained to provide continuity. You may request deletion at <a href={`mailto:${CONTACT_EMAIL}`} className="text-(--dt-primary) hover:underline">{CONTACT_EMAIL}</a>.
        </p>
      </LegalSection>

      <LegalSection title="6. Data Security">
        <p>
          We use standard security measures including TLS in transit, secure password hashing, and authenticated access
          controls.
        </p>
      </LegalSection>

      <LegalSection title="7. Third-Party Services">
        <ul className="list-disc space-y-2 pl-5">
          <li>OpenAI for model inference.</li>
          <li>Cloud hosting infrastructure providers.</li>
          <li>Email delivery providers for transactional messages.</li>
          <li>App distribution platforms for iOS and Android releases.</li>
        </ul>
      </LegalSection>

      <LegalSection title="8. Children's Privacy">
        <p>
          The Service is not directed to children under 13 (or 16 in the EU). We do not knowingly collect child data.
        </p>
      </LegalSection>

      <LegalSection title="9. Your Rights">
        <p>
          Depending on jurisdiction, you may request access, correction, deletion, restriction, objection, and
          portability of your personal data.
        </p>
      </LegalSection>

      <LegalSection title="10. International Transfers">
        <p>
          If you access the Service from outside our hosting region, your data may be transferred internationally with
          required safeguards.
        </p>
      </LegalSection>

      <LegalSection title="11. Changes to This Policy">
        <p>
          We may update this policy periodically and reflect changes by updating the "Last updated" date.
        </p>
      </LegalSection>

      <LegalSection title="12. Contact Us">
        <p>
          For privacy questions, contact <a href={`mailto:${CONTACT_EMAIL}`} className="text-(--dt-primary) hover:underline">{CONTACT_EMAIL}</a>.
        </p>
      </LegalSection>
    </LegalShell>
  );
}

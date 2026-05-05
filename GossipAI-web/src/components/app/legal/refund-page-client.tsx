"use client";

import Link from "next/link";
import { LegalSection, LegalShell } from "@/components/app/legal/legal-shell";
import {
  LEGAL_APP_NAME,
  LEGAL_CONTACT_EMAIL,
} from "@/components/app/legal/legal-config";

const LAST_UPDATED = "May 6, 2026";
const linkClass = "text-(--dt-primary) hover:underline";

export function RefundPageClient() {
  return (
    <LegalShell title="Refund Policy" subtitle={`Last updated: ${LAST_UPDATED}`} active="refund">
      <LegalSection title="1. Scope">
        <p>
          This Refund Policy applies to paid subscriptions and in-app purchases for {LEGAL_APP_NAME}. It supplements
          our{" "}
          <Link href="/terms" className={linkClass}>
            Terms of Service
          </Link>{" "}
          and should be read together with our{" "}
          <Link href="/privacy" className={linkClass}>
            Privacy Policy
          </Link>
          .
        </p>
      </LegalSection>

      <LegalSection title="2. Billing Channels">
        <p>
          As of {LAST_UPDATED}, paid access to {LEGAL_APP_NAME} is offered through Apple App Store and Google Play
          billing flows. Subscription status, receipt handling, and entitlement synchronization may be managed through
          RevenueCat.
        </p>
        <p>
          Apple or Google acts as the merchant of record for your purchase depending on the platform used. For that
          reason, refund decisions are handled by the relevant app store under its own policies and applicable law.
        </p>
      </LegalSection>

      <LegalSection title="3. Purchases Made Through the Apple App Store">
        <p>
          If you subscribed on iPhone or iPad, Apple handles billing and refund requests. Refund eligibility is decided
          by Apple under its platform rules and applicable law.
        </p>
        <p>
          To request an Apple refund, visit{" "}
          <a href="https://reportaproblem.apple.com/" target="_blank" rel="noreferrer" className={linkClass}>
            reportaproblem.apple.com
          </a>
          . To stop future renewals, cancel the subscription from your Apple account subscription settings.
        </p>
      </LegalSection>

      <LegalSection title="4. Purchases Made Through Google Play">
        <p>
          If you subscribed through Google Play, refund handling follows Google Play billing and refund rules together
          with any rights you have under applicable law.
        </p>
        <ul className="list-disc space-y-2 pl-5">
          <li>Request a refund through your Google Play account or through Google Play Help.</li>
          <li>For unauthorised purchases, report the charge through Google Play as soon as possible.</li>
        </ul>
        <p>
          Google Play support resources are available at{" "}
          <a
            href="https://support.google.com/googleplay/answer/2479637"
            target="_blank"
            rel="noreferrer"
            className={linkClass}
          >
            Google Play Help
          </a>
          .
        </p>
      </LegalSection>

      <LegalSection title="5. Subscription Cancellations">
        <p>
          You can cancel a subscription at any time through the same platform used to purchase it. Cancellation stops
          future renewals but does not automatically reverse charges that have already been processed.
        </p>
        <p>
          Unless the platform states otherwise, you will generally retain Premium access until the end of the current
          paid billing period and then revert to the features available on your account plan at that time.
        </p>
      </LegalSection>

      <LegalSection title="6. Situations Generally Not Eligible for a Direct Refund">
        <ul className="list-disc space-y-2 pl-5">
          <li>Change-of-mind requests after a subscription or in-app purchase was successfully activated.</li>
          <li>Requests based only on partial non-use of the current billing period.</li>
          <li>Failure to cancel before an automatic renewal date.</li>
          <li>Access restrictions caused by violations of our Terms of Service.</li>
        </ul>
        <p>
          GossipAI does not issue direct refunds. These examples do not limit any mandatory refund or withdrawal rights
          you may have under applicable law.
        </p>
      </LegalSection>

      <LegalSection title="7. Duplicate Charges or Technical Purchase Issues">
        <p>
          If you believe you were charged twice, did not receive the paid features you purchased, or experienced a
          billing error, contact{" "}
          <a href={`mailto:${LEGAL_CONTACT_EMAIL}`} className={linkClass}>
            {LEGAL_CONTACT_EMAIL}
          </a>{" "}
          and include support details so we can investigate the account status with RevenueCat or help you identify the
          correct purchase channel. Refund requests themselves must still be submitted to Apple or Google. Please
          include:
        </p>
        <ul className="list-disc space-y-2 pl-5">
          <li>The platform used for purchase (Apple App Store or Google Play).</li>
          <li>Your transaction ID or order number.</li>
          <li>The email address associated with your GossipAI account.</li>
          <li>A short description of the issue.</li>
        </ul>
      </LegalSection>

      <LegalSection title="8. Statutory Rights">
        <p>
          Nothing in this Refund Policy limits any non-waivable consumer rights that apply to you under the laws of
          your country or region.
        </p>
      </LegalSection>

      <LegalSection title="9. Contact Us">
        <p>
          For billing support that is not resolved by the purchase platform, contact{" "}
          <a href={`mailto:${LEGAL_CONTACT_EMAIL}`} className={linkClass}>
            {LEGAL_CONTACT_EMAIL}
          </a>
          .
        </p>
      </LegalSection>
    </LegalShell>
  );
}

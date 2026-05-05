"use client";

import { type FormEvent, useState } from "react";
import { LegalSection, LegalShell } from "@/components/app/legal/legal-shell";
import { LEGAL_CONTACT_EMAIL } from "@/components/app/legal/legal-config";

const LAST_UPDATED = "May 6, 2026";
const linkClass = "text-(--dt-primary) hover:underline";

const REASONS = [
  "No longer using the app",
  "Privacy concerns",
  "Switching devices",
  "Other",
] as const;

export function DataDeletionPageClient() {
  const [email, setEmail] = useState("");
  const [reason, setReason] = useState<(typeof REASONS)[number]>("No longer using the app");
  const [confirmed, setConfirmed] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!confirmed) return;

    const subject = encodeURIComponent("Account Deletion Request");
    const body = encodeURIComponent(
      `Account Deletion Request\n\nEmail: ${email}\nReason: ${reason}\n\nI understand this action is permanent and cannot be undone.`,
    );

    setSubmitted(true);
    window.location.href = `mailto:${LEGAL_CONTACT_EMAIL}?subject=${subject}&body=${body}`;
  };

  return (
    <LegalShell title="Data Deletion Request" subtitle={`Last updated: ${LAST_UPDATED}`} active="data-deletion">
      <LegalSection title="1. Request Account Deletion">
        <p>
          Submitting this request will permanently delete your GossipAI account and associated conversation data from
          our systems, subject to any limited retention period described in our Privacy Policy. This action cannot be
          undone.
        </p>
      </LegalSection>

      <LegalSection title="2. Deletion Form">
        {submitted ? (
          <div className="space-y-3">
            <p className="text-(--dt-on-surface)">
              Your deletion request has been received. We&apos;ll process it within 30 days and send a confirmation to
              your email.
            </p>
            <p>
              If your email app did not open automatically, you can send the request manually to{" "}
              <a href={`mailto:${LEGAL_CONTACT_EMAIL}`} className={linkClass}>
                {LEGAL_CONTACT_EMAIL}
              </a>{" "}
              with subject <strong className="text-(--dt-on-surface)">Account Deletion Request</strong>.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium text-(--dt-on-surface)">
                Email address
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="w-full rounded-xl border border-(--dt-outline-variant)/60 bg-(--dt-surface-container)/60 px-4 py-3 text-sm text-(--dt-on-surface) outline-none transition-colors focus:border-(--dt-primary)"
                placeholder="you@example.com"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="reason" className="block text-sm font-medium text-(--dt-on-surface)">
                Reason for deletion
              </label>
              <select
                id="reason"
                value={reason}
                onChange={(event) => setReason(event.target.value as (typeof REASONS)[number])}
                className="w-full rounded-xl border border-(--dt-outline-variant)/60 bg-(--dt-surface-container)/60 px-4 py-3 text-sm text-(--dt-on-surface) outline-none transition-colors focus:border-(--dt-primary)"
              >
                {REASONS.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>

            <label className="flex items-start gap-3 rounded-xl border border-(--dt-outline-variant)/60 bg-(--dt-surface-container)/40 px-4 py-3 text-sm text-(--dt-on-surface-variant)">
              <input
                type="checkbox"
                checked={confirmed}
                onChange={(event) => setConfirmed(event.target.checked)}
                required
                className="mt-1 h-4 w-4 accent-[var(--dt-primary)]"
              />
              <span>I understand this action is permanent and cannot be undone.</span>
            </label>

            <button
              type="submit"
              className="inline-flex items-center justify-center rounded-xl bg-(--dt-primary) px-5 py-3 text-sm font-semibold text-(--dt-on-primary) transition-opacity hover:opacity-90"
            >
              Send Deletion Request
            </button>
          </form>
        )}
      </LegalSection>

      <LegalSection title="3. Alternative Contact">
        <p>
          You can also email{" "}
          <a href={`mailto:${LEGAL_CONTACT_EMAIL}?subject=Account%20Deletion%20Request`} className={linkClass}>
            {LEGAL_CONTACT_EMAIL}
          </a>{" "}
          directly with the subject <strong className="text-(--dt-on-surface)">Account Deletion Request</strong>.
        </p>
      </LegalSection>
    </LegalShell>
  );
}

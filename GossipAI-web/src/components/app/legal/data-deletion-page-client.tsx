import { LegalSection, LegalShell } from "@/components/app/legal/legal-shell";

const LAST_UPDATED = "July 19, 2026";

export function DataDeletionPageClient() {
  return (
    <LegalShell title="Account and Data Deletion" subtitle={`Last updated: ${LAST_UPDATED}`} active="data-deletion">
      <LegalSection title="1. Delete Your Account in the App">
        <p>
          Open GossipAI, go to <strong className="text-(--dt-on-surface)">Settings → Account → Delete My Account</strong>,
          confirm that you understand the action, and enter your current password. Your account and associated data are
          then permanently deleted immediately.
        </p>
      </LegalSection>

      <LegalSection title="2. What Is Deleted">
        <p>
          We delete your account profile, conversations, messages, AI memory, sessions, devices, usage records, and
          account-linked notification data. Support ticket metadata may be retained for operational reporting only after
          its user link and all personal or free-text content have been anonymized.
        </p>
      </LegalSection>

      <LegalSection title="3. Subscriptions and Backups">
        <p>
          Deleting your account does not cancel an Apple subscription. Cancel it through your Apple subscription
          settings to prevent future charges. Limited encrypted operational backups are removed within 30 days.
        </p>
      </LegalSection>
    </LegalShell>
  );
}

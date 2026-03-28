import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy – GossipAI",
  description: "How GossipAI collects, uses, and protects your personal data.",
};

const LAST_UPDATED = "March 28, 2026";
const CONTACT_EMAIL = "privacy@gossip-ai.site";
const APP_NAME = "GossipAI";
const COMPANY = "GossipAI";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#f5f0ff] text-[#1a0a2e]">
      {/* Navbar */}
      <nav className="mx-auto flex w-full max-w-3xl items-center justify-between px-6 py-5">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="grid h-8 w-8 place-items-center rounded-lg bg-[#7f19e6] text-[11px] font-bold text-white">
            GA
          </div>
          <span className="text-sm font-semibold">GossipAI</span>
        </Link>
        <Link href="/" className="text-sm text-[#7a5e96] hover:text-[#7f19e6] hover:underline">
          ← Back to home
        </Link>
      </nav>

      {/* Content */}
      <main className="mx-auto w-full max-w-3xl px-6 pb-20">
        <h1 className="mb-2 text-3xl font-extrabold tracking-tight sm:text-4xl">Privacy Policy</h1>
        <p className="mb-10 text-sm text-[#7a5e96]">Last updated: {LAST_UPDATED}</p>

        <div className="prose prose-slate max-w-none space-y-8 text-[#1a0a2e]">

          <Section title="1. Introduction">
            <p>
              {COMPANY} (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) operates the {APP_NAME} mobile application and website (collectively, the &quot;Service&quot;). This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our Service. Please read it carefully. If you disagree with its terms, please stop using the Service.
            </p>
          </Section>

          <Section title="2. Information We Collect">
            <p>We may collect the following categories of information:</p>
            <ul>
              <li><strong>Account data:</strong> name, email address, and password (stored as a secure hash) when you register.</li>
              <li><strong>User-generated content:</strong> message text or conversation excerpts you voluntarily paste into the app to receive AI suggestions.</li>
              <li><strong>Usage data:</strong> agent mode selections, session timestamps, and feature interactions to improve the Service.</li>
              <li><strong>Device data:</strong> device type, operating system version, and app version for debugging purposes.</li>
              <li><strong>Log data:</strong> IP address, browser type, pages visited, and crash reports, collected automatically via standard server logs.</li>
            </ul>
            <p>
              We do <strong>not</strong> collect the contact details (names, phone numbers, email addresses) of third parties mentioned in messages you analyse with {APP_NAME}.
            </p>
          </Section>

          <Section title="3. How We Use Your Information">
            <ul>
              <li>To provide, operate, and maintain the Service.</li>
              <li>To process your AI requests and return results.</li>
              <li>To send transactional emails (e.g. password reset, summaries you explicitly request).</li>
              <li>To monitor and analyse usage for product improvement.</li>
              <li>To detect, investigate, and prevent fraudulent or illegal activity.</li>
              <li>To comply with legal obligations.</li>
            </ul>
            <p>
              We <strong>do not</strong> sell your personal data to third parties. We do not use your message content for training AI models without your explicit consent.
            </p>
          </Section>

          <Section title="4. AI Processing & OpenAI">
            <p>
              User-submitted message text is sent to OpenAI&apos;s API to generate AI responses. OpenAI processes this data in accordance with their{" "}
              <a href="https://openai.com/policies/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-[#7f19e6] hover:underline">
                Privacy Policy
              </a>
              . We use the API under a data processing agreement that prevents OpenAI from using your inputs to train their models (unless you separately opt in on OpenAI&apos;s platform).
            </p>
          </Section>

          <Section title="5. Data Retention">
            <p>
              Conversation history is retained on our servers to provide continuity across sessions. You may request deletion of your conversations or your entire account at any time by contacting us at <a href={`mailto:${CONTACT_EMAIL}`} className="text-[#7f19e6] hover:underline">{CONTACT_EMAIL}</a>. We will action deletion requests within 30 days.
            </p>
          </Section>

          <Section title="6. Data Security">
            <p>
              We implement industry-standard security measures including TLS encryption in transit, bcrypt password hashing, and JWT-based authentication with short-lived access tokens. No method of transmission over the internet is 100% secure; we cannot guarantee absolute security.
            </p>
          </Section>

          <Section title="7. Third-Party Services">
            <p>The Service uses the following third-party processors:</p>
            <ul>
              <li><strong>OpenAI</strong> – AI inference (see Section 4).</li>
              <li><strong>Railway</strong> – Cloud infrastructure and database hosting.</li>
              <li><strong>Resend</strong> – Transactional email delivery.</li>
              <li><strong>Expo / Apple / Google</strong> – Mobile app distribution.</li>
            </ul>
            <p>Each processor is bound by a data processing agreement and applicable data protection law.</p>
          </Section>

          <Section title="8. Children's Privacy">
            <p>
              The Service is not directed to children under 13 (or 16 in the EU). We do not knowingly collect personal information from children. If you believe a child has provided us with personal information, please contact us and we will delete it promptly.
            </p>
          </Section>

          <Section title="9. Your Rights">
            <p>Depending on your jurisdiction, you may have the right to:</p>
            <ul>
              <li>Access the personal data we hold about you.</li>
              <li>Request correction of inaccurate data.</li>
              <li>Request deletion of your data (&quot;right to be forgotten&quot;).</li>
              <li>Object to or restrict certain processing.</li>
              <li>Data portability.</li>
            </ul>
            <p>
              To exercise these rights, email us at <a href={`mailto:${CONTACT_EMAIL}`} className="text-[#7f19e6] hover:underline">{CONTACT_EMAIL}</a>.
            </p>
          </Section>

          <Section title="10. International Transfers">
            <p>
              Our servers are located in the EU (Railway EU region). If you access the Service from outside the EU, your data may be transferred internationally. We take steps to ensure adequate protection is in place for such transfers, including standard contractual clauses where required.
            </p>
          </Section>

          <Section title="11. Changes to This Policy">
            <p>
              We may update this Privacy Policy from time to time. We will notify you of material changes by updating the &quot;Last updated&quot; date at the top of this page. Continued use of the Service after such changes constitutes your acceptance of the updated policy.
            </p>
          </Section>

          <Section title="12. Contact Us">
            <p>
              If you have questions about this Privacy Policy or our data practices, please contact us at:{" "}
              <a href={`mailto:${CONTACT_EMAIL}`} className="text-[#7f19e6] hover:underline">{CONTACT_EMAIL}</a>.
            </p>
          </Section>

        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#7f19e6]/10 py-8">
        <div className="mx-auto flex w-full max-w-3xl flex-wrap items-center justify-between gap-4 px-6">
          <p className="text-xs text-[#7a5e96]">© {new Date().getFullYear()} GossipAI. All rights reserved.</p>
          <div className="flex gap-5 text-xs text-[#7a5e96]">
            <Link href="/privacy" className="font-medium text-[#7f19e6]">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-[#7f19e6] hover:underline">Terms of Service</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="mb-3 text-lg font-bold">{title}</h2>
      <div className="space-y-3 text-sm leading-relaxed text-[#3d2060]">{children}</div>
    </div>
  );
}

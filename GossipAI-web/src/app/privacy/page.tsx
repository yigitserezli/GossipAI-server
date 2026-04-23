import type { Metadata } from "next";
import { PrivacyPageClient } from "@/components/app/legal/privacy-page-client";

export const metadata: Metadata = {
  title: "Privacy Policy – GossipAI",
  description: "How GossipAI collects, uses, and protects your personal data.",
};

export default function PrivacyPage() {
  return <PrivacyPageClient />;
}

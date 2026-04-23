import type { Metadata } from "next";
import { TermsPageClient } from "@/components/app/legal/terms-page-client";

export const metadata: Metadata = {
  title: "Terms of Service – GossipAI",
  description: "The terms and conditions governing your use of GossipAI.",
};

export default function TermsPage() {
  return <TermsPageClient />;
}

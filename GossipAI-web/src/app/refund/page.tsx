import type { Metadata } from "next";
import { RefundPageClient } from "@/components/app/legal/refund-page-client";

export const metadata: Metadata = {
  title: "Refund Policy – GossipAI",
  description: "Billing, cancellation, and refund terms for GossipAI subscriptions and in-app purchases.",
};

export default function RefundPage() {
  return <RefundPageClient />;
}

import type { Metadata } from "next";
import { SupportPageClient } from "@/components/app/support-page-client";

export const metadata: Metadata = {
  title: "Support | GossipAI",
  description: "GossipAI FAQ and support ticket form.",
};

export default function SupportPage() {
  return <SupportPageClient />;
}

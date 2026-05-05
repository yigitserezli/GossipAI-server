import type { Metadata } from "next";
import { CookiePageClient } from "@/components/app/legal/cookie-page-client";

export const metadata: Metadata = {
  title: "Cookie Policy – GossipAI",
  description: "How GossipAI uses cookies and similar browser technologies on gossip-ai.site.",
};

export default function CookiesPage() {
  return <CookiePageClient />;
}

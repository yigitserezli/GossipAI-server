import type { Metadata } from "next";
import { DataDeletionPageClient } from "@/components/app/legal/data-deletion-page-client";

export const metadata: Metadata = {
  title: "Data Deletion Request – GossipAI",
  description: "Request deletion of your GossipAI account and associated data.",
};

export default function DataDeletionPage() {
  return <DataDeletionPageClient />;
}

import type { MetadataRoute } from "next";
import { LEGAL_BASE_URL } from "@/components/app/legal/legal-config";

const routes = [
  { path: "/", priority: 1 },
  { path: "/support", priority: 0.8 },
  { path: "/privacy", priority: 0.5 },
  { path: "/terms", priority: 0.5 },
  { path: "/cookies", priority: 0.4 },
  { path: "/refund", priority: 0.4 },
  { path: "/data-deletion", priority: 0.4 },
] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  return routes.map((route) => ({
    url: `${LEGAL_BASE_URL}${route.path}`,
    lastModified: now,
    changeFrequency: route.path === "/" ? "weekly" : "monthly",
    priority: route.priority,
  }));
}

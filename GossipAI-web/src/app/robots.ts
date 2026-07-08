import type { MetadataRoute } from "next";
import { LEGAL_BASE_URL } from "@/components/app/legal/legal-config";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/api"],
    },
    sitemap: `${LEGAL_BASE_URL}/sitemap.xml`,
  };
}

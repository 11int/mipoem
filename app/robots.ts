import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

// Auto-generated at /robots.txt. Points crawlers at the sitemap and keeps the
// admin/moderation area out of search results.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/api/"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}

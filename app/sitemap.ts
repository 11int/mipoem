import type { MetadataRoute } from "next";
import { getAllPoems } from "@/lib/poems";
import { SITE_URL } from "@/lib/site";

// Auto-generated at /sitemap.xml. Regenerates on each request (force-dynamic)
// so newly added poems appear without a manual step.
export const dynamic = "force-dynamic";

export default function sitemap(): MetadataRoute.Sitemap {
  const poems = getAllPoems();

  const poemEntries: MetadataRoute.Sitemap = poems.map((poem) => ({
    url: `${SITE_URL}/poems/${poem.slug}`,
    lastModified: poem.date ? new Date(poem.date) : new Date(),
    changeFrequency: "yearly",
    priority: 0.7,
  }));

  return [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${SITE_URL}/terms`,
      changeFrequency: "yearly",
      priority: 0.2,
    },
    {
      url: `${SITE_URL}/privacy`,
      changeFrequency: "yearly",
      priority: 0.2,
    },
    ...poemEntries,
  ];
}

// Canonical site origin used for absolute URLs (sitemap, robots, OG, etc.).
// Override with NEXT_PUBLIC_SITE_URL if the domain changes.
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || "https://www.mipoem.com"
).replace(/\/$/, "");

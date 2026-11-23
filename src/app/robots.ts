import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

// Admin, the creator alias and the admin API stay out of search.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/admin", "/creator", "/api/admin"] }],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}

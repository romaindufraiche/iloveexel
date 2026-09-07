import type { MetadataRoute } from "next";
import { SITE_URL, IS_PRODUCTION_DEPLOYMENT } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  // Preview deployments must never be indexed — otherwise they compete with
  // the production domain for the same keywords and split its ranking.
  if (!IS_PRODUCTION_DEPLOYMENT) {
    return { rules: { userAgent: "*", disallow: "/" } };
  }

  return {
    rules: { userAgent: "*", allow: "/", disallow: "/api/" },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}

import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";
import { USE_CASES } from "@/lib/useCases";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return [
    { url: SITE_URL, lastModified, changeFrequency: "weekly", priority: 1 },
    ...USE_CASES.map((useCase) => ({
      url: `${SITE_URL}/analyse/${useCase.slug}`,
      lastModified,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
  ];
}

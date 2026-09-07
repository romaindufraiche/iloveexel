import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";
import { getUseCases } from "@/lib/useCases";
import { LOCALES, LOCALE_HREFLANG, DEFAULT_LOCALE } from "@/lib/i18n/config";
import { findUseCaseByKey } from "@/lib/useCases";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  const homeAlternates = Object.fromEntries(LOCALES.map((l) => [LOCALE_HREFLANG[l], `${SITE_URL}/${l}`]));

  const entries: MetadataRoute.Sitemap = LOCALES.map((locale) => ({
    url: `${SITE_URL}/${locale}`,
    lastModified,
    changeFrequency: "weekly" as const,
    priority: 1,
    alternates: { languages: homeAlternates },
  }));

  for (const locale of LOCALES) {
    for (const useCase of getUseCases(locale)) {
      // Each language has its own slug, so the alternates are resolved through
      // the shared key rather than by reusing this entry's path.
      const languages: Record<string, string> = {};
      for (const other of LOCALES) {
        const translated = findUseCaseByKey(other, useCase.key);
        if (translated) languages[LOCALE_HREFLANG[other]] = `${SITE_URL}/${other}/analyse/${translated.slug}`;
      }

      entries.push({
        url: `${SITE_URL}/${locale}/analyse/${useCase.slug}`,
        lastModified,
        changeFrequency: "monthly" as const,
        priority: locale === DEFAULT_LOCALE ? 0.8 : 0.7,
        alternates: { languages },
      });
    }
  }

  return entries;
}

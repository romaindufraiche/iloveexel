export const LOCALES = ["fr", "en"] as const;

export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "fr";

export const LOCALE_LABELS: Record<Locale, string> = {
  fr: "Français",
  en: "English",
};

// Emitted as hreflang, so it has to be a valid BCP 47 tag rather than the
// bare path segment.
export const LOCALE_HREFLANG: Record<Locale, string> = {
  fr: "fr",
  en: "en",
};

export const LOCALE_OG: Record<Locale, string> = {
  fr: "fr_FR",
  en: "en_GB",
};

export function isLocale(value: string): value is Locale {
  return (LOCALES as readonly string[]).includes(value);
}

// Picks the best supported locale from an Accept-Language header, honouring
// its q-weights. "fr-CA" matches the "fr" dictionary — the base tag is what
// decides, since we translate per language, not per region.
export function matchLocale(acceptLanguage: string | null): Locale {
  if (!acceptLanguage) return DEFAULT_LOCALE;

  const ranked = acceptLanguage
    .split(",")
    .map((part) => {
      const [tag, ...params] = part.trim().split(";");
      const q = params.find((p) => p.trim().startsWith("q="));
      const quality = q ? Number.parseFloat(q.trim().slice(2)) : 1;
      return { tag: tag.trim().toLowerCase(), quality: Number.isFinite(quality) ? quality : 0 };
    })
    .filter((entry) => entry.tag !== "")
    .sort((a, b) => b.quality - a.quality);

  for (const { tag } of ranked) {
    const base = tag.split("-")[0];
    if (isLocale(base)) return base;
  }

  return DEFAULT_LOCALE;
}

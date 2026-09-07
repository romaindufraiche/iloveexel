export interface UseCase {
  /** Stable identifier shared across locales, so a page can link to its
   *  translations (hreflang) even though every slug is localized. */
  key: string;
  slug: string;
  navLabel: string;
  h1: string;
  title: string;
  metaDescription: string;
  intro: string;
  detects: { column: string; role: string }[];
  outputs: string[];
  faq: { q: string; a: string }[];
}

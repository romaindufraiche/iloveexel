// Intl groups thousands with a narrow no-break space (U+202F) in fr-FR, and
// sometimes a regular no-break space (U+00A0), neither of which the standard
// Helvetica/WinAnsi font used in the PDF can encode - pdfkit falls back to an
// unrelated glyph ("/"). Force a plain space instead.
//
// Written with escape sequences rather than the literal characters: they are
// invisible in an editor, so a copy or a rewrite of this file silently turns
// them into ordinary spaces and the guard quietly stops working - which is
// exactly how it broke once.
const NON_BREAKING_SPACES = /[\u202F\u00A0]/g;

const NUMBER_LOCALES: Record<string, string> = { fr: "fr-FR", en: "en-GB" };

export function formatNumber(n: number, locale = "fr"): string {
  const tag = NUMBER_LOCALES[locale] ?? NUMBER_LOCALES.fr;
  return new Intl.NumberFormat(tag, { maximumFractionDigits: 2 }).format(n).replace(NON_BREAKING_SPACES, " ");
}

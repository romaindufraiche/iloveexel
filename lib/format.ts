// Node's fr-FR Intl.NumberFormat groups thousands with a narrow no-break
// space (U+202F) and sometimes a regular no-break space (U+00A0), neither of
// which the standard Helvetica/WinAnsi font used in the PDF can encode -
// pdfkit falls back to rendering an unrelated glyph ("/") for them. Force a
// plain space instead so numbers render correctly in the generated report.
const NON_BREAKING_SPACES = new RegExp("[  ]", "g");

export function formatNumber(n: number): string {
  return new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 2 }).format(n).replace(NON_BREAKING_SPACES, " ");
}

import { NextResponse } from "next/server";
import { compareWorkbooks } from "@/lib/compare";
import { compareText } from "@/lib/compareText";
import { generateComparisonPdf } from "@/lib/pdfReport";
import { consumeQuota, getClientKey, peekQuota } from "@/lib/rateLimiter";
import { isLocale, DEFAULT_LOCALE, getDictionary } from "@/lib/i18n";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const MAX_FILE_SIZE = 20 * 1024 * 1024;
const ALLOWED_EXTENSIONS = [".xlsx", ".xls", ".xlsm", ".csv"];

const COMPARE_ERRORS = {
  fr: {
    invalid: "Requête invalide.",
    missing: "Il faut deux fichiers : le plus récent et le précédent.",
    badFile: "Fichier invalide (format ou taille).",
    failed: "Impossible de comparer ces deux fichiers.",
  },
  en: {
    invalid: "Invalid request.",
    missing: "Two files are needed: the recent one and the earlier one.",
    badFile: "Invalid file (format or size).",
    failed: "Couldn't compare these two files.",
  },
} as const;

function sanitizeFileName(name: string): string {
  const base = name.replace(/[\r\n"]/g, "").split(/[\\/]/).pop() ?? "fichier";
  return base.length > 150 ? base.slice(0, 150) : base;
}

function isAcceptable(file: unknown): file is File {
  if (!file || !(file instanceof File)) return false;
  if (file.size === 0 || file.size > MAX_FILE_SIZE) return false;
  const lower = (file.name || "").toLowerCase();
  return ALLOWED_EXTENSIONS.some((ext) => lower.endsWith(ext));
}

export async function POST(request: Request) {
  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: COMPARE_ERRORS[DEFAULT_LOCALE].invalid }, { status: 400 });
  }

  const localeField = formData.get("locale");
  const locale = typeof localeField === "string" && isLocale(localeField) ? localeField : DEFAULT_LOCALE;
  const errors = COMPARE_ERRORS[locale];

  const wantsPdf = formData.get("format") === "pdf";
  const current = formData.get("current");
  const previous = formData.get("previous");

  if (!current || !previous) {
    return NextResponse.json({ error: errors.missing }, { status: 400 });
  }
  if (!isAcceptable(current) || !isAcceptable(previous)) {
    return NextResponse.json({ error: errors.badFile }, { status: 400 });
  }

  // Viewing the comparison is free like the rest of the exploration; taking
  // the document away is what costs a generation.
  const clientKey = getClientKey(request);
  if (wantsPdf) {
    const quotaBefore = peekQuota(clientKey);
    if (quotaBefore.remaining <= 0) {
      return NextResponse.json(
        { error: getDictionary(locale).upload.limitHint },
        { status: 429, headers: { "X-RateLimit-Remaining": "0", "X-RateLimit-Limit": String(quotaBefore.limit) } }
      );
    }
  }

  try {
    const [currentBuffer, previousBuffer] = await Promise.all([
      current.arrayBuffer().then(Buffer.from),
      previous.arrayBuffer().then(Buffer.from),
    ]);

    const result = await compareWorkbooks(
      previousBuffer,
      currentBuffer,
      sanitizeFileName(previous.name),
      sanitizeFileName(current.name),
      locale
    );

    if (wantsPdf) {
      const pdf = await generateComparisonPdf(result, locale);
      const quota = consumeQuota(clientKey);
      const prefix = locale === "fr" ? "comparaison" : "comparison";
      const downloadName = `${prefix}-${sanitizeFileName(current.name).replace(/\.[^.]+$/, "")}.pdf`;
      return new NextResponse(new Uint8Array(pdf), {
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `attachment; filename="${downloadName}"`,
          "Cache-Control": "no-store",
          "X-RateLimit-Remaining": String(quota.remaining),
        },
      });
    }

    return NextResponse.json(result, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    // The engine's own "no shared columns" message is written for the reader
    // and safe to show; anything else is logged and replaced. Matched against
    // the localized string rather than French text, which would silently stop
    // matching on the English site.
    const explained = compareText(locale).noSharedColumns;
    const message = error instanceof Error && error.message === explained ? explained : errors.failed;
    if (message === errors.failed) console.error("compare route error:", error);
    return NextResponse.json({ error: message }, { status: 422 });
  }
}

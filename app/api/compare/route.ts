import { NextResponse } from "next/server";
import { compareWorkbooks } from "@/lib/compare";
import { isLocale, DEFAULT_LOCALE } from "@/lib/i18n";

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

  const current = formData.get("current");
  const previous = formData.get("previous");

  if (!current || !previous) {
    return NextResponse.json({ error: errors.missing }, { status: 400 });
  }
  if (!isAcceptable(current) || !isAcceptable(previous)) {
    return NextResponse.json({ error: errors.badFile }, { status: 400 });
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
      sanitizeFileName(current.name)
    );
    return NextResponse.json(result, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    // The engine's own "no shared columns" message is written for the reader
    // and safe to show; anything else is logged and replaced.
    const message = error instanceof Error && error.message.includes("colonne en commun") ? error.message : errors.failed;
    if (message === errors.failed) console.error("compare route error:", error);
    return NextResponse.json({ error: message }, { status: 422 });
  }
}

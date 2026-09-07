import { NextResponse } from "next/server";
import { analyzeWorkbook } from "@/lib/analyzer";
import { generatePdfReport } from "@/lib/pdfReport";
import { generatePptxReport } from "@/lib/pptxReport";
import { generatePngReport } from "@/lib/pngReport";
import { consumeQuota, getClientKey, peekQuota } from "@/lib/rateLimiter";
import { buildKpis } from "@/lib/kpis";
import { getDictionary, isLocale, DEFAULT_LOCALE } from "@/lib/i18n";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB
const ALLOWED_EXTENSIONS = [".xlsx", ".xls", ".xlsm", ".csv"];

const FORMATS = {
  pdf: { contentType: "application/pdf", extension: "pdf" },
  pptx: {
    contentType: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    extension: "pptx",
  },
  png: { contentType: "image/png", extension: "png" },
} as const;
type Format = keyof typeof FORMATS;

function sanitizeFileName(name: string): string {
  const base = name.replace(/[\r\n"]/g, "").split(/[\\/]/).pop() ?? "fichier";
  return base.length > 150 ? base.slice(0, 150) : base;
}

function hasAllowedExtension(name: string): boolean {
  const lower = name.toLowerCase();
  return ALLOWED_EXTENSIONS.some((ext) => lower.endsWith(ext));
}

const REQUEST_ERRORS = {
  fr: {
    invalidRequest: "Requête invalide. Merci d'envoyer votre fichier via le formulaire du site.",
    noFile: "Aucun fichier reçu.",
    unsupported: "Format non supporté. Merci d'envoyer un fichier .xlsx, .xls, .xlsm ou .csv.",
    generic: "Une erreur est survenue lors de l'analyse du fichier. Vérifiez qu'il s'agit bien d'un fichier Excel valide et réessayez.",
  },
  en: {
    invalidRequest: "Invalid request. Please send your file through the site's form.",
    noFile: "No file received.",
    unsupported: "Unsupported format. Please send an .xlsx, .xls, .xlsm or .csv file.",
    generic: "Something went wrong while analysing the file. Check that it is a valid spreadsheet and try again.",
  },
} as const;

function readLocale(formData: FormData) {
  const raw = formData.get("locale");
  return typeof raw === "string" && isLocale(raw) ? raw : DEFAULT_LOCALE;
}

export async function POST(request: Request) {
  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: REQUEST_ERRORS[DEFAULT_LOCALE].invalidRequest }, { status: 400 });
  }

  const locale = readLocale(formData);
  const errors = REQUEST_ERRORS[locale];
  const dict = getDictionary(locale);
  const file = formData.get("file");
  const formatField = formData.get("format");
  const wantsJson = formatField === "json";
  const format: Format = formatField === "pptx" || formatField === "png" ? formatField : "pdf";

  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: errors.noFile }, { status: 400 });
  }

  const originalName = sanitizeFileName(file.name || "fichier.xlsx");

  if (!hasAllowedExtension(originalName)) {
    return NextResponse.json({ error: errors.unsupported }, { status: 400 });
  }

  if (file.size === 0) {
    return NextResponse.json({ error: errors.noFile }, { status: 400 });
  }

  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json({ error: dict.errors.tooLarge }, { status: 413 });
  }

  // Fetching the report as JSON (to open the free-to-explore chart editor)
  // doesn't consume the daily quota — only a real file export does.
  const clientKey = getClientKey(request);
  if (!wantsJson) {
    const quotaBefore = peekQuota(clientKey);
    if (quotaBefore.remaining <= 0) {
      return NextResponse.json(
        {
          error: dict.upload.limitHint,
          quota: { allowed: false, ...quotaBefore },
        },
        { status: 429, headers: { "X-RateLimit-Remaining": "0", "X-RateLimit-Limit": String(quotaBefore.limit) } }
      );
    }
  }

  try {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const analysis = await analyzeWorkbook(buffer, originalName);

    if (wantsJson) {
      return NextResponse.json(
        {
          fileName: analysis.fileName,
          sheetName: analysis.sheetName,
          rowCount: analysis.rowCount,
          generatedAt: analysis.generatedAt,
          kpis: buildKpis(analysis),
          charts: analysis.charts,
          // Only what the editor's axis pickers need — the full profiles
          // carry per-column stats the browser has no use for.
          columns: analysis.columns.map((c) => ({ name: c.name, type: c.type })),
        },
        { headers: { "Cache-Control": "no-store" } }
      );
    }

    const fileBuffer =
      format === "pptx" ? await generatePptxReport(analysis) : format === "png" ? await generatePngReport(analysis) : await generatePdfReport(analysis);

    // Only a successful generation counts against the free quota — a
    // rejected or malformed upload shouldn't cost the user one of their 5.
    const quota = consumeQuota(clientKey);

    const { contentType, extension } = FORMATS[format];
    const downloadName = `${originalName.replace(/\.[^.]+$/, "")}-analyse.${extension}`.replace(/[^a-zA-Z0-9._-]/g, "_");

    return new NextResponse(new Uint8Array(fileBuffer), {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename="${downloadName}"`,
        "Cache-Control": "no-store",
        "X-RateLimit-Remaining": String(quota.remaining),
        "X-RateLimit-Limit": String(quota.limit),
      },
    });
  } catch (error) {
    // Only the analyzer's own "no usable data" message is safe to show verbatim;
    // anything else (parser internals, unexpected crashes) is logged and hidden.
    const message = error instanceof Error && error.message.startsWith("Aucune donnée exploitable") ? error.message : errors.generic;
    if (message === errors.generic) {
      console.error("Analyze route error:", error);
    }
    return NextResponse.json({ error: message }, { status: 422 });
  }
}

import { NextResponse } from "next/server";
import { buildChartFromAxes } from "@/lib/analyzer";
import { isLocale, DEFAULT_LOCALE } from "@/lib/i18n";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

const MAX_FILE_SIZE = 20 * 1024 * 1024;

const AXIS_ERRORS = {
  fr: { invalid: "Requête invalide.", noFile: "Aucun fichier reçu.", badFile: "Fichier invalide.", noAxis: "Choisissez au moins un axe.", failed: "Impossible de retracer ce graphique." },
  en: { invalid: "Invalid request.", noFile: "No file received.", badFile: "Invalid file.", noAxis: "Pick at least one axis.", failed: "Couldn't redraw this chart." },
} as const;

// Redraws one chart with the axes the reader picked. Free and outside the
// quota, like the rest of the editor — only exporting a report costs one.
export async function POST(request: Request) {
  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: AXIS_ERRORS[DEFAULT_LOCALE].invalid }, { status: 400 });
  }

  const localeField = formData.get("locale");
  const locale = typeof localeField === "string" && isLocale(localeField) ? localeField : DEFAULT_LOCALE;
  const errors = AXIS_ERRORS[locale];

  const file = formData.get("file");
  const xField = formData.get("x");
  const yField = formData.get("y");

  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: errors.noFile }, { status: 400 });
  }
  if (file.size === 0 || file.size > MAX_FILE_SIZE) {
    return NextResponse.json({ error: errors.badFile }, { status: 400 });
  }
  if (typeof xField !== "string" || xField.trim() === "") {
    return NextResponse.json({ error: errors.noAxis }, { status: 400 });
  }

  const y = typeof yField === "string" && yField.trim() !== "" ? yField : null;

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const result = await buildChartFromAxes(buffer, xField, y);
    return NextResponse.json(result, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("axis-chart route error:", error);
    return NextResponse.json({ chart: null, message: errors.failed }, { status: 422 });
  }
}

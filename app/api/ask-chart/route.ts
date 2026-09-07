import { NextResponse } from "next/server";
import { answerChartQuery } from "@/lib/analyzer";
import { isLocale, DEFAULT_LOCALE } from "@/lib/i18n";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

const MAX_FILE_SIZE = 20 * 1024 * 1024;
const MAX_PROMPT_LENGTH = 300;

const ASK_ERRORS = {
  fr: { invalid: "Requête invalide.", noFile: "Aucun fichier reçu.", badFile: "Fichier invalide.", noPrompt: "Merci de préciser votre demande.", failed: "Impossible d'analyser ce fichier pour cette demande." },
  en: { invalid: "Invalid request.", noFile: "No file received.", badFile: "Invalid file.", noPrompt: "Please describe what you're looking for.", failed: "Couldn't analyse this file for that request." },
} as const;

// Powers the editor's search bar. Free and not quota-limited like a real
// export — it never leaves the analysis stage. Re-parses the file (cheap)
// rather than trusting client-sent data, since this only exists inside the
// already-open editor for a file the visitor just uploaded themselves.
export async function POST(request: Request) {
  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: ASK_ERRORS[DEFAULT_LOCALE].invalid }, { status: 400 });
  }

  const localeField = formData.get("locale");
  const locale = typeof localeField === "string" && isLocale(localeField) ? localeField : DEFAULT_LOCALE;
  const errors = ASK_ERRORS[locale];

  const file = formData.get("file");
  const promptField = formData.get("prompt");

  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: errors.noFile }, { status: 400 });
  }
  if (file.size === 0 || file.size > MAX_FILE_SIZE) {
    return NextResponse.json({ error: errors.badFile }, { status: 400 });
  }
  if (typeof promptField !== "string" || promptField.trim().length === 0) {
    return NextResponse.json({ error: errors.noPrompt }, { status: 400 });
  }

  const prompt = promptField.trim().slice(0, MAX_PROMPT_LENGTH);

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const result = await answerChartQuery(buffer, prompt);
    return NextResponse.json(result, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("ask-chart route error:", error);
    return NextResponse.json({ chart: null, message: errors.failed }, { status: 422 });
  }
}

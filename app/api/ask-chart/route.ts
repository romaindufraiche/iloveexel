import { NextResponse } from "next/server";
import { answerChartQuery } from "@/lib/analyzer";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

const MAX_FILE_SIZE = 20 * 1024 * 1024;
const MAX_PROMPT_LENGTH = 300;

// Powers the editor's search bar. Free and not quota-limited like a real
// export — it never leaves the analysis stage. Re-parses the file (cheap)
// rather than trusting client-sent data, since this only exists inside the
// already-open editor for a file the visitor just uploaded themselves.
export async function POST(request: Request) {
  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Requête invalide." }, { status: 400 });
  }

  const file = formData.get("file");
  const promptField = formData.get("prompt");

  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: "Aucun fichier reçu." }, { status: 400 });
  }
  if (file.size === 0 || file.size > MAX_FILE_SIZE) {
    return NextResponse.json({ error: "Fichier invalide." }, { status: 400 });
  }
  if (typeof promptField !== "string" || promptField.trim().length === 0) {
    return NextResponse.json({ error: "Merci de préciser votre demande." }, { status: 400 });
  }

  const prompt = promptField.trim().slice(0, MAX_PROMPT_LENGTH);

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const result = await answerChartQuery(buffer, prompt);
    return NextResponse.json(result, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("ask-chart route error:", error);
    return NextResponse.json({ chart: null, message: "Impossible d'analyser ce fichier pour cette demande." }, { status: 422 });
  }
}

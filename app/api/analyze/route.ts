import { NextResponse } from "next/server";
import { analyzeWorkbook } from "@/lib/analyzer";
import { generatePdfReport } from "@/lib/pdfReport";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB
const ALLOWED_EXTENSIONS = [".xlsx", ".xls", ".xlsm", ".csv"];

function sanitizeFileName(name: string): string {
  const base = name.replace(/[\r\n"]/g, "").split(/[\\/]/).pop() ?? "fichier";
  return base.length > 150 ? base.slice(0, 150) : base;
}

function hasAllowedExtension(name: string): boolean {
  const lower = name.toLowerCase();
  return ALLOWED_EXTENSIONS.some((ext) => lower.endsWith(ext));
}

const GENERIC_ERROR = "Une erreur est survenue lors de l'analyse du fichier. Vérifiez qu'il s'agit bien d'un fichier Excel valide et réessayez.";

export async function POST(request: Request) {
  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Requête invalide. Merci d'envoyer votre fichier via le formulaire du site." }, { status: 400 });
  }

  const file = formData.get("file");

  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: "Aucun fichier reçu." }, { status: 400 });
  }

  const originalName = sanitizeFileName(file.name || "fichier.xlsx");

  if (!hasAllowedExtension(originalName)) {
    return NextResponse.json(
      { error: "Format non supporté. Merci d'envoyer un fichier .xlsx, .xls, .xlsm ou .csv." },
      { status: 400 }
    );
  }

  if (file.size === 0) {
    return NextResponse.json({ error: "Le fichier est vide." }, { status: 400 });
  }

  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json({ error: "Le fichier dépasse la taille maximale autorisée (20 Mo)." }, { status: 413 });
  }

  try {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const analysis = await analyzeWorkbook(buffer, originalName);
    const pdfBuffer = await generatePdfReport(analysis);

    const downloadName = `${originalName.replace(/\.[^.]+$/, "")}-analyse.pdf`.replace(/[^a-zA-Z0-9._-]/g, "_");

    return new NextResponse(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${downloadName}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    // Only the analyzer's own "no usable data" message is safe to show verbatim;
    // anything else (parser internals, unexpected crashes) is logged and hidden.
    const message = error instanceof Error && error.message.startsWith("Aucune donnée exploitable") ? error.message : GENERIC_ERROR;
    if (message === GENERIC_ERROR) {
      console.error("Analyze route error:", error);
    }
    return NextResponse.json({ error: message }, { status: 422 });
  }
}

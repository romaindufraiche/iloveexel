"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type Status = "idle" | "dragging" | "uploading" | "success" | "error" | "limit";
type ExportFormat = "pdf" | "pptx" | "png";

const ALLOWED_EXTENSIONS = [".xlsx", ".xls", ".xlsm", ".csv"];
const MAX_SIZE_MB = 20;

const FORMATS: { id: ExportFormat; label: string; hint: string }[] = [
  { id: "pdf", label: "PDF", hint: "Rapport complet" },
  { id: "pptx", label: "PowerPoint", hint: "Slides éditables" },
  { id: "png", label: "Image", hint: "À partager" },
];

function hasAllowedExtension(name: string): boolean {
  const lower = name.toLowerCase();
  return ALLOWED_EXTENSIONS.some((ext) => lower.endsWith(ext));
}

function extractFileName(disposition: string | null, fallback: string): string {
  if (!disposition) return fallback;
  const match = disposition.match(/filename="?([^"]+)"?/);
  return match ? match[1] : fallback;
}

export default function UploadCard() {
  const [status, setStatus] = useState<Status>("idle");
  const [progress, setProgress] = useState(0);
  const [fileName, setFileName] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [downloadUrl, setDownloadUrl] = useState<string>("");
  const [downloadName, setDownloadName] = useState<string>("");
  const [format, setFormat] = useState<ExportFormat>("pdf");
  const [quota, setQuota] = useState<{ remaining: number; limit: number } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/quota")
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled && typeof data?.remaining === "number") setQuota(data);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const reset = useCallback(() => {
    setStatus("idle");
    setProgress(0);
    setFileName("");
    setErrorMessage("");
    setDownloadUrl("");
    setDownloadName("");
  }, []);

  const uploadFile = useCallback(
    (file: File) => {
      if (!hasAllowedExtension(file.name)) {
        setStatus("error");
        setErrorMessage("Format non supporté. Utilisez un fichier .xlsx, .xls, .xlsm ou .csv.");
        return;
      }
      if (file.size > MAX_SIZE_MB * 1024 * 1024) {
        setStatus("error");
        setErrorMessage(`Le fichier dépasse la taille maximale autorisée (${MAX_SIZE_MB} Mo).`);
        return;
      }
      if (quota && quota.remaining <= 0) {
        setStatus("limit");
        return;
      }

      setFileName(file.name);
      setStatus("uploading");
      setProgress(0);

      const formData = new FormData();
      formData.append("file", file);
      formData.append("format", format);

      const xhr = new XMLHttpRequest();
      xhr.open("POST", "/api/analyze");
      xhr.responseType = "blob";

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          setProgress(Math.round((event.loaded / event.total) * 100));
        }
      };

      xhr.onload = async () => {
        const remainingHeader = xhr.getResponseHeader("X-RateLimit-Remaining");
        const limitHeader = xhr.getResponseHeader("X-RateLimit-Limit");
        if (remainingHeader !== null && limitHeader !== null) {
          setQuota({ remaining: Number(remainingHeader), limit: Number(limitHeader) });
        }

        if (xhr.status === 200) {
          const blob = xhr.response as Blob;
          const url = URL.createObjectURL(blob);
          const name = extractFileName(xhr.getResponseHeader("Content-Disposition"), `analyse.${format}`);
          setDownloadUrl(url);
          setDownloadName(name);
          setStatus("success");

          const link = document.createElement("a");
          link.href = url;
          link.download = name;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        } else if (xhr.status === 429) {
          setStatus("limit");
        } else {
          let message = "Une erreur est survenue lors de l'analyse du fichier.";
          try {
            const text = await xhr.response.text();
            const parsed = JSON.parse(text);
            if (parsed?.error) message = parsed.error;
          } catch {
            // ignore parse errors, keep default message
          }
          setStatus("error");
          setErrorMessage(message);
        }
      };

      xhr.onerror = () => {
        setStatus("error");
        setErrorMessage("Impossible de contacter le serveur. Vérifiez votre connexion et réessayez.");
      };

      xhr.send(formData);
    },
    [format, quota]
  );

  const onDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      const file = event.dataTransfer.files?.[0];
      if (file) uploadFile(file);
    },
    [uploadFile]
  );

  const onDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setStatus((prev) => (prev === "uploading" || prev === "success" ? prev : "dragging"));
  }, []);

  const onDragLeave = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setStatus((prev) => (prev === "dragging" ? "idle" : prev));
  }, []);

  const onFileSelect = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) uploadFile(file);
      event.target.value = "";
    },
    [uploadFile]
  );

  const showFormatPicker = status === "idle" || status === "dragging";

  return (
    <div className="w-full max-w-xl mx-auto">
      <div
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        className={`relative rounded-2xl border-2 border-dashed p-10 text-center transition-colors ${
          status === "dragging"
            ? "border-brand-500 bg-brand-50"
            : status === "error" || status === "limit"
              ? "border-red-300 bg-red-50"
              : "border-brand-300 bg-white"
        }`}
      >
        {status === "idle" || status === "dragging" ? (
          <>
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-brand-100">
              <svg viewBox="0 0 24 24" className="h-8 w-8 text-brand-600" fill="none" stroke="currentColor" strokeWidth={2}>
                <path d="M12 16V4m0 0L7 9m5-5l5 5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M20 16.5v2A2.5 2.5 0 0117.5 21h-11A2.5 2.5 0 014 18.5v-2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <p className="text-lg font-semibold text-gray-800">Glissez-déposez votre fichier Excel ici</p>
            <p className="mt-1 text-sm text-gray-500">ou cliquez pour parcourir vos fichiers — .xlsx, .xls, .xlsm, .csv</p>
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="mt-6 inline-flex items-center rounded-full bg-brand-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700"
            >
              Sélectionner un fichier
            </button>
            <input ref={inputRef} type="file" accept=".xlsx,.xls,.xlsm,.csv" onChange={onFileSelect} className="hidden" />
          </>
        ) : null}

        {status === "uploading" ? (
          <div>
            <p className="text-lg font-semibold text-gray-800">Analyse de {fileName}…</p>
            <p className="mt-1 text-sm text-gray-500">Notre moteur détecte vos indicateurs clés et construit vos graphiques.</p>
            <div className="mx-auto mt-6 h-2 w-full max-w-sm overflow-hidden rounded-full bg-brand-100">
              <div
                className="h-full rounded-full bg-brand-500 transition-all duration-200"
                style={{ width: `${Math.max(progress, 8)}%` }}
              />
            </div>
          </div>
        ) : null}

        {status === "success" ? (
          <div>
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-brand-100">
              <svg viewBox="0 0 24 24" className="h-8 w-8 text-brand-600" fill="none" stroke="currentColor" strokeWidth={2}>
                <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <p className="text-lg font-semibold text-gray-800">Votre rapport est prêt !</p>
            <p className="mt-1 text-sm text-gray-500">Le téléchargement a démarré automatiquement.</p>
            <a
              href={downloadUrl}
              download={downloadName}
              className="mt-6 inline-flex items-center rounded-full bg-brand-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700"
            >
              Télécharger {format === "pdf" ? "le PDF" : format === "pptx" ? "le PowerPoint" : "l'image"}
            </a>
            <button type="button" onClick={reset} className="mt-4 block w-full text-sm font-medium text-gray-500 hover:text-brand-700">
              Analyser un autre fichier
            </button>
          </div>
        ) : null}

        {status === "error" ? (
          <div>
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
              <svg viewBox="0 0 24 24" className="h-8 w-8 text-red-500" fill="none" stroke="currentColor" strokeWidth={2}>
                <path
                  d="M12 9v4m0 4h.01M10.29 3.86l-8.18 14.14A1 1 0 003 19.5h18a1 1 0 00.89-1.5L13.71 3.86a1 1 0 00-1.72 0z"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <p className="text-lg font-semibold text-gray-800">Oups, une erreur est survenue</p>
            <p className="mt-1 text-sm text-gray-500">{errorMessage}</p>
            <button
              type="button"
              onClick={reset}
              className="mt-6 inline-flex items-center rounded-full bg-brand-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700"
            >
              Réessayer
            </button>
          </div>
        ) : null}

        {status === "limit" ? (
          <div>
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-amber-100">
              <svg viewBox="0 0 24 24" className="h-8 w-8 text-amber-500" fill="none" stroke="currentColor" strokeWidth={2}>
                <path d="M12 8v4l2.5 2.5M12 21a9 9 0 100-18 9 9 0 000 18z" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <p className="text-lg font-semibold text-gray-800">Limite gratuite atteinte pour aujourd&apos;hui</p>
            <p className="mt-1 text-sm text-gray-500">
              Vous avez utilisé vos {quota?.limit ?? 5} analyses gratuites du jour. Revenez demain, ou passez à SheetInsight Premium
              pour des analyses illimitées.
            </p>
            <a
              href="#premium"
              className="mt-6 inline-flex items-center rounded-full bg-brand-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700"
            >
              Découvrir Premium
            </a>
          </div>
        ) : null}
      </div>

      {showFormatPicker ? (
        <div className="mt-4 flex items-center justify-center gap-2">
          {FORMATS.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setFormat(f.id)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
                format === f.id ? "bg-brand-600 text-white shadow-sm" : "bg-white text-gray-600 border border-gray-200 hover:border-brand-300"
              }`}
              title={f.hint}
            >
              {f.label}
            </button>
          ))}
        </div>
      ) : null}

      {quota && (status === "idle" || status === "dragging") ? (
        <p className="mt-3 text-center text-xs text-gray-500">
          {quota.remaining > 0 ? (
            <>
              <span className="font-semibold text-brand-700">{quota.remaining}</span> analyse{quota.remaining > 1 ? "s" : ""} gratuite
              {quota.remaining > 1 ? "s" : ""} restante{quota.remaining > 1 ? "s" : ""} aujourd&apos;hui
            </>
          ) : (
            "Limite gratuite atteinte pour aujourd'hui"
          )}
        </p>
      ) : null}
    </div>
  );
}

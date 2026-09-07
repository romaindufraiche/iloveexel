"use client";

import { useCallback, useRef, useState } from "react";
import PlansModal, { type PlansReason } from "./PlansModal";
import ReportEditor, { type EditorAnalysis } from "./ReportEditor";
import ReportPreview from "./ReportPreview";
import ComparisonReport from "./ComparisonReport";
import type { ComparisonResult } from "@/lib/compare";
import { getDictionary, type Locale } from "@/lib/i18n";

type Status = "idle" | "dragging" | "uploading" | "success" | "error" | "limit";
type ExportFormat = "pdf" | "pptx" | "png";

const ALLOWED_EXTENSIONS = [".xlsx", ".xls", ".xlsm", ".csv"];
const MAX_SIZE_MB = 20;
const FORMAT_IDS: ExportFormat[] = ["pdf", "pptx", "png"];

function hasAllowedExtension(name: string): boolean {
  const lower = name.toLowerCase();
  return ALLOWED_EXTENSIONS.some((ext) => lower.endsWith(ext));
}

function extractFileName(disposition: string | null, fallback: string): string {
  if (!disposition) return fallback;
  const match = disposition.match(/filename="?([^"]+)"?/);
  return match ? match[1] : fallback;
}

export default function UploadCard({ locale }: { locale: Locale }) {
  const dict = getDictionary(locale);
  const t = dict.upload;

  const [status, setStatus] = useState<Status>("idle");
  const [progress, setProgress] = useState(0);
  const [fileName, setFileName] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [downloadUrl, setDownloadUrl] = useState<string>("");
  const [downloadName, setDownloadName] = useState<string>("");
  const [format, setFormat] = useState<ExportFormat>("pdf");
  const [plansModalReason, setPlansModalReason] = useState<PlansReason | null>(null);
  const [lastFile, setLastFile] = useState<File | null>(null);
  const [reportAnalysis, setReportAnalysis] = useState<EditorAnalysis | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [comparison, setComparison] = useState<ComparisonResult | null>(null);
  const [comparing, setComparing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const compareInputRef = useRef<HTMLInputElement>(null);

  const reset = useCallback(() => {
    setStatus("idle");
    setProgress(0);
    setFileName("");
    setErrorMessage("");
    setDownloadUrl("");
    setDownloadName("");
    setReportAnalysis(null);
    setIsEditing(false);
    setComparison(null);
  }, []);

  const fetchPreview = useCallback(
    async (file: File) => {
      try {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("format", "json");
        formData.append("locale", locale);
        const res = await fetch("/api/analyze", { method: "POST", body: formData });
        if (!res.ok) return;
        const data = await res.json();
        setReportAnalysis(data as EditorAnalysis);
      } catch {
        // Preview is a bonus on top of the already-downloaded file — fail silently.
      }
    },
    [locale]
  );

  const runComparison = useCallback(
    async (previousFile: File) => {
      if (!lastFile) return;
      setComparing(true);
      try {
        const formData = new FormData();
        formData.append("current", lastFile);
        formData.append("previous", previousFile);
        formData.append("locale", locale);
        const res = await fetch("/api/compare", { method: "POST", body: formData });
        const data = await res.json();

        if (!res.ok) {
          setStatus("error");
          setErrorMessage(data?.error || dict.errors.generic);
          return;
        }
        setComparison(data as ComparisonResult);
      } catch {
        setStatus("error");
        setErrorMessage(dict.errors.server);
      } finally {
        setComparing(false);
      }
    },
    [lastFile, locale, dict.errors]
  );

  const uploadFile = useCallback(
    (file: File) => {
      if (!hasAllowedExtension(file.name)) {
        setStatus("error");
        setErrorMessage(dict.errors.unsupportedFormat);
        return;
      }
      if (file.size > MAX_SIZE_MB * 1024 * 1024) {
        setStatus("error");
        setErrorMessage(dict.errors.tooLarge);
        return;
      }

      setLastFile(file);
      setReportAnalysis(null);
      setFileName(file.name);
      setStatus("uploading");
      setProgress(0);

      const formData = new FormData();
      formData.append("file", file);
      formData.append("format", format);
      formData.append("locale", locale);

      const xhr = new XMLHttpRequest();
      xhr.open("POST", "/api/analyze");
      xhr.responseType = "blob";

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          setProgress(Math.round((event.loaded / event.total) * 100));
        }
      };

      xhr.onload = async () => {
        if (xhr.status === 200) {
          const blob = xhr.response as Blob;
          const url = URL.createObjectURL(blob);
          const name = extractFileName(xhr.getResponseHeader("Content-Disposition"), `analyse.${format}`);
          setDownloadUrl(url);
          setDownloadName(name);
          setStatus("success");
          fetchPreview(file);

          const link = document.createElement("a");
          link.href = url;
          link.download = name;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        } else if (xhr.status === 429) {
          setStatus("limit");
        } else {
          let message = dict.errors.generic;
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
        setErrorMessage(dict.errors.network);
      };

      xhr.send(formData);
    },
    [format, fetchPreview, locale, dict.errors]
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

  if (comparison) {
    return <ComparisonReport result={comparison} locale={locale} onClose={() => setComparison(null)} />;
  }

  if (isEditing && reportAnalysis && lastFile) {
    return (
      <>
        <ReportEditor
          analysis={reportAnalysis}
          file={lastFile}
          locale={locale}
          onRequestDownload={() => setPlansModalReason("download")}
          onRequirePremium={() => setPlansModalReason("query")}
          onClose={() => setIsEditing(false)}
        />
        {plansModalReason ? (
          <PlansModal onClose={() => setPlansModalReason(null)} reason={plansModalReason} locale={locale} />
        ) : null}
      </>
    );
  }

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
            <p className="text-lg font-semibold text-gray-800">{t.dropTitle}</p>
            <p className="mt-1 text-sm text-gray-500">{t.dropHint}</p>
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="mt-6 inline-flex items-center rounded-full bg-brand-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700"
            >
              {t.selectFile}
            </button>
            <input ref={inputRef} type="file" accept=".xlsx,.xls,.xlsm,.csv" onChange={onFileSelect} className="hidden" />
          </>
        ) : null}

        {status === "uploading" ? (
          <div>
            <p className="text-lg font-semibold text-gray-800">
              {t.analyzing} {fileName}…
            </p>
            <p className="mt-1 text-sm text-gray-500">{t.analyzingHint}</p>
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
            <p className="text-lg font-semibold text-gray-800">{t.readyTitle}</p>
            <p className="mt-1 text-sm text-gray-500">{t.readyHint}</p>

            {reportAnalysis ? (
              <ReportPreview analysis={reportAnalysis} locale={locale} />
            ) : (
              <div className="mt-6 rounded-lg border border-dashed border-gray-300 bg-gray-50 py-8 text-sm text-gray-500">
                {t.previewLoading}
              </div>
            )}

            <div className="mt-5 flex flex-col gap-2 sm:flex-row">
              <a
                href={downloadUrl}
                download={downloadName}
                className="inline-flex flex-1 items-center justify-center rounded-full bg-brand-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700"
              >
                {t.download[format]}
              </a>
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                disabled={!reportAnalysis}
                className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-full border border-gray-200 px-6 py-3 text-sm font-semibold text-gray-700 transition hover:border-brand-300 hover:text-brand-700 disabled:opacity-60"
              >
                {reportAnalysis ? t.edit : t.editLoading}
              </button>
            </div>
            <div className="mt-3 rounded-xl border border-dashed border-brand-300 bg-brand-50 p-4">
              <button
                type="button"
                onClick={() => compareInputRef.current?.click()}
                disabled={comparing}
                className="inline-flex items-center gap-2 rounded-full bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-700 disabled:opacity-60"
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path d="M7 16V4m0 0L4 7m3-3l3 3M17 8v12m0 0l3-3m-3 3l-3-3" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                {comparing ? dict.compare.loading : dict.compare.cta}
              </button>
              <p className="mt-2 text-xs text-gray-600">{dict.compare.ctaHint}</p>
              <input
                ref={compareInputRef}
                type="file"
                accept=".xlsx,.xls,.xlsm,.csv"
                onChange={(e) => {
                  const picked = e.target.files?.[0];
                  if (picked) runComparison(picked);
                  e.target.value = "";
                }}
                className="hidden"
              />
            </div>

            <button type="button" onClick={reset} className="mt-4 block w-full text-sm font-medium text-gray-500 hover:text-brand-700">
              {t.another}
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
            <p className="text-lg font-semibold text-gray-800">{t.errorTitle}</p>
            <p className="mt-1 text-sm text-gray-500">{errorMessage}</p>
            <button
              type="button"
              onClick={reset}
              className="mt-6 inline-flex items-center rounded-full bg-brand-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700"
            >
              {t.retry}
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
            <p className="text-lg font-semibold text-gray-800">{t.limitTitle}</p>
            <p className="mt-1 text-sm text-gray-500">{t.limitHint}</p>
            <button
              type="button"
              onClick={() => setPlansModalReason("account")}
              className="mt-6 inline-flex items-center rounded-full bg-brand-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700"
            >
              {t.limitCta}
            </button>
          </div>
        ) : null}
      </div>

      {showFormatPicker ? (
        <div className="mt-4 flex items-center justify-center gap-2">
          {FORMAT_IDS.map((id) => (
            <button
              key={id}
              type="button"
              onClick={() => setFormat(id)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
                format === id ? "bg-brand-600 text-white shadow-sm" : "bg-white text-gray-600 border border-gray-200 hover:border-brand-300"
              }`}
              title={t.formatHints[id]}
            >
              {t.formats[id]}
            </button>
          ))}
        </div>
      ) : null}

      {plansModalReason ? <PlansModal onClose={() => setPlansModalReason(null)} reason={plansModalReason} locale={locale} /> : null}
    </div>
  );
}

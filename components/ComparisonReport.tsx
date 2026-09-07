"use client";

import { CHART_WIDTH, CHART_HEIGHT, PALETTE } from "@/lib/svgCharts";
import { renderChartSvg } from "@/lib/chartRender";
import { useCallback, useState } from "react";
import { getDictionary, type Locale } from "@/lib/i18n";
import type { ComparisonResult } from "@/lib/compare";
import { formatNumber } from "@/lib/format";

function Delta({ value, percent, locale }: { value: number; percent: number | null; locale: Locale }) {
  const up = value > 0;
  const flat = value === 0;
  const tone = flat ? "text-gray-500" : up ? "text-brand-700" : "text-red-600";
  const sign = up ? "+" : "";

  return (
    <span className={`text-sm font-semibold ${tone}`}>
      {flat ? "=" : `${sign}${formatNumber(value, locale)}`}
      {percent !== null && !flat ? (
        <span className="ml-1 text-xs font-medium">
          ({sign}
          {formatNumber(percent, locale)} %)
        </span>
      ) : null}
    </span>
  );
}

export default function ComparisonReport({
  result,
  files,
  locale,
  onClose,
}: {
  result: ComparisonResult;
  files: { current: File; previous: File } | null;
  locale: Locale;
  onClose: () => void;
}) {
  const t = getDictionary(locale).compare;
  const [downloading, setDownloading] = useState(false);

  // The PDF is regenerated server-side from the two files rather than from
  // what is on screen, so the document and the page always agree.
  const download = useCallback(async () => {
    if (!files) return;
    setDownloading(true);
    try {
      const formData = new FormData();
      formData.append("current", files.current);
      formData.append("previous", files.previous);
      formData.append("locale", locale);
      formData.append("format", "pdf");
      const res = await fetch("/api/compare", { method: "POST", body: formData });
      if (!res.ok) return;

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = locale === "fr" ? "comparaison.pdf" : "comparison.pdf";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } finally {
      setDownloading(false);
    }
  }, [files, locale]);

  return (
    <div className="mx-auto w-full max-w-4xl text-left">
      <div className="flex items-start justify-between rounded-t-2xl border border-b-0 border-gray-200 bg-white px-6 py-4">
        <div>
          <p className="text-sm font-semibold text-gray-900">{t.reportTitle}</p>
          <p className="mt-0.5 text-xs text-gray-500">
            {t.previousLabel} <span className="font-medium text-gray-700">{result.previousName}</span> → {t.currentLabel}{" "}
            <span className="font-medium text-gray-700">{result.currentName}</span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          {files ? (
            <button
              type="button"
              onClick={download}
              disabled={downloading}
              className="rounded-full bg-brand-600 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700 disabled:opacity-60"
            >
              {downloading ? t.downloading : t.download}
            </button>
          ) : null}
        <button
          type="button"
          onClick={onClose}
          aria-label={t.close}
          className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600"
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2}>
            <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        </div>
      </div>

      <div className="space-y-6 rounded-b-2xl border border-t-0 border-gray-200 bg-white p-6">
        <section>
          <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500">{t.whatChanged}</h3>
          <ul className="mt-3 space-y-2">
            {result.highlights.map((line, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-brand-500" />
                {line}
              </li>
            ))}
          </ul>
        </section>

        {result.metrics.length > 0 ? (
          <section>
            <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500">{t.totals}</h3>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {result.metrics.map((metric) => (
                <div key={metric.name} className="rounded-lg border border-gray-200 p-3">
                  <p className="text-xs font-medium text-gray-500">{metric.name}</p>
                  <div className="mt-1 flex items-baseline gap-2">
                    <span className="text-lg font-bold text-gray-900">
                      {formatNumber(metric.current, locale)}
                    </span>
                    <Delta value={metric.delta} percent={metric.percent} locale={locale} />
                  </div>
                  <p className="mt-0.5 text-xs text-gray-400">
                    {t.was} {formatNumber(metric.previous, locale)}
                  </p>
                </div>
              ))}
            </div>
          </section>
        ) : null}

        {result.charts.map((chart, i) => (
          <section key={i} className="rounded-xl border border-gray-200 p-4">
            <p className="text-base font-semibold text-gray-900">{chart.title}</p>
            <div
              className="mx-auto mt-2 w-full max-w-[520px] overflow-hidden [&>svg]:h-full [&>svg]:w-full"
              style={{ aspectRatio: `${CHART_WIDTH} / ${CHART_HEIGHT}` }}
              dangerouslySetInnerHTML={{ __html: renderChartSvg(chart, undefined, PALETTE) }}
            />
            <p className="mt-2 text-xs italic text-gray-600">{chart.insight}</p>
          </section>
        ))}
      </div>
    </div>
  );
}

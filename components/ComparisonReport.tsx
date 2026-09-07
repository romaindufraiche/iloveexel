"use client";

import { CHART_WIDTH, CHART_HEIGHT, PALETTE } from "@/lib/svgCharts";
import { renderChartSvg } from "@/lib/chartRender";
import { getDictionary, type Locale } from "@/lib/i18n";
import type { ComparisonResult } from "@/lib/compare";

function Delta({ value, percent }: { value: number; percent: number | null }) {
  const up = value > 0;
  const flat = value === 0;
  const tone = flat ? "text-gray-500" : up ? "text-brand-700" : "text-red-600";
  const sign = up ? "+" : "";

  return (
    <span className={`text-sm font-semibold ${tone}`}>
      {flat ? "=" : `${sign}${value.toLocaleString("fr-FR", { maximumFractionDigits: 2 })}`}
      {percent !== null && !flat ? (
        <span className="ml-1 text-xs font-medium">
          ({sign}
          {percent.toLocaleString("fr-FR", { maximumFractionDigits: 1 })} %)
        </span>
      ) : null}
    </span>
  );
}

export default function ComparisonReport({
  result,
  locale,
  onClose,
}: {
  result: ComparisonResult;
  locale: Locale;
  onClose: () => void;
}) {
  const t = getDictionary(locale).compare;

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
                      {metric.current.toLocaleString("fr-FR", { maximumFractionDigits: 2 })}
                    </span>
                    <Delta value={metric.delta} percent={metric.percent} />
                  </div>
                  <p className="mt-0.5 text-xs text-gray-400">
                    {t.was} {metric.previous.toLocaleString("fr-FR", { maximumFractionDigits: 2 })}
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

"use client";

import { useCallback, useId, useState } from "react";
import { PALETTE_PRESETS, CHART_WIDTH, CHART_HEIGHT } from "@/lib/svgCharts";
import { isTypeSwitchable, renderChartSvg, type EditableChartKind } from "@/lib/chartRender";
import type { ChartSpec } from "@/lib/types";
import type { Kpi } from "@/lib/kpis";
import { getDictionary, type Locale } from "@/lib/i18n";

type EditableKind = EditableChartKind;

interface ChartBlock {
  kind: "chart";
  id: string;
  original: ChartSpec;
  title: string;
  insight: string;
  typeOverride?: EditableKind;
  paletteIndex: number;
  /** Axis columns, once the reader has overridden them. */
  xAxis?: string;
  yAxis?: string;
  axisBusy?: boolean;
  axisError?: string;
}

interface NoteBlock {
  kind: "note";
  id: string;
  text: string;
}

type Block = ChartBlock | NoteBlock;

export interface AxisColumn {
  name: string;
  type: string;
}

export interface EditorAnalysis {
  fileName: string;
  sheetName: string;
  rowCount: number;
  kpis: Kpi[];
  charts: ChartSpec[];
  columns?: AxisColumn[];
}

function blockIdFrom(prefix: string, index: number): string {
  return `${prefix}-${index}-${Math.random().toString(36).slice(2, 8)}`;
}

export default function ReportEditor({
  analysis,
  file,
  locale,
  onRequestDownload,
  onRequirePremium,
  onClose,
}: {
  analysis: EditorAnalysis;
  file: File;
  locale: Locale;
  onRequestDownload: () => void;
  onRequirePremium: () => void;
  onClose: () => void;
}) {
  const dict = getDictionary(locale);
  const t = dict.editor;
  const columns = analysis.columns ?? [];
  const [kpis, setKpis] = useState<Kpi[]>(analysis.kpis);
  const [blocks, setBlocks] = useState<Block[]>(
    analysis.charts.map((chart, i) => ({
      kind: "chart",
      id: blockIdFrom("chart", i),
      original: chart,
      title: chart.title,
      insight: chart.insight,
      paletteIndex: 0,
    }))
  );
  const [query, setQuery] = useState("");
  const [queryStatus, setQueryStatus] = useState<{ type: "idle" | "loading" | "ok" | "error"; message: string }>({
    type: "idle",
    message: "",
  });
  const searchInputId = useId();

  const updateKpi = useCallback((index: number, field: keyof Kpi, value: string) => {
    setKpis((prev) => prev.map((k, i) => (i === index ? { ...k, [field]: value } : k)));
  }, []);

  const updateBlock = useCallback((id: string, patch: Partial<ChartBlock>) => {
    setBlocks((prev) => prev.map((b) => (b.kind === "chart" && b.id === id ? { ...b, ...patch } : b)));
  }, []);

  const updateNote = useCallback((id: string, text: string) => {
    setBlocks((prev) => prev.map((b) => (b.kind === "note" && b.id === id ? { ...b, text } : b)));
  }, []);

  const removeBlock = useCallback((id: string) => {
    setBlocks((prev) => prev.filter((b) => b.id !== id));
  }, []);

  const addNote = useCallback(() => {
    setBlocks((prev) => [...prev, { kind: "note", id: blockIdFrom("note", prev.length), text: t.notePlaceholder }]);
  }, [t.notePlaceholder]);

  // Changing an axis can't be done in the browser: the chart holds only the
  // aggregated series, not the rows it came from, so the engine has to
  // recompute it from the file.
  const applyAxes = useCallback(
    async (id: string, xAxis: string, yAxis: string) => {
      if (!xAxis) return;
      setBlocks((prev) => prev.map((b) => (b.kind === "chart" && b.id === id ? { ...b, xAxis, yAxis, axisBusy: true, axisError: undefined } : b)));

      try {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("x", xAxis);
        formData.append("y", yAxis);
        formData.append("locale", locale);
        const res = await fetch("/api/axis-chart", { method: "POST", body: formData });
        const data = await res.json();

        if (!res.ok || !data.chart) {
          setBlocks((prev) =>
            prev.map((b) => (b.kind === "chart" && b.id === id ? { ...b, axisBusy: false, axisError: data.message || t.searchEmpty } : b))
          );
          return;
        }

        const next: ChartSpec = data.chart;
        setBlocks((prev) =>
          prev.map((b) =>
            b.kind === "chart" && b.id === id
              ? { ...b, original: next, title: next.title, insight: next.insight, typeOverride: undefined, axisBusy: false, axisError: undefined }
              : b
          )
        );
      } catch {
        setBlocks((prev) =>
          prev.map((b) => (b.kind === "chart" && b.id === id ? { ...b, axisBusy: false, axisError: dict.errors.server } : b))
        );
      }
    },
    [file, locale, t.searchEmpty, dict.errors.server]
  );

  const runQuery = useCallback(async () => {
    const prompt = query.trim();
    if (!prompt) return;
    setQueryStatus({ type: "loading", message: "" });

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("prompt", prompt);
      formData.append("locale", locale);
      const res = await fetch("/api/ask-chart", { method: "POST", body: formData });
      const data = await res.json();

      if (data.requiresPremium) {
        setQueryStatus({ type: "idle", message: "" });
        setQuery("");
        onRequirePremium();
        return;
      }

      if (!res.ok || !data.chart) {
        setQueryStatus({ type: "error", message: data.message || t.searchEmpty });
        return;
      }

      const newChart: ChartSpec = data.chart;
      setBlocks((prev) => [
        ...prev,
        {
          kind: "chart",
          id: blockIdFrom("chart", prev.length),
          original: newChart,
          title: newChart.title,
          insight: newChart.insight,
          paletteIndex: 0,
        },
      ]);
      setQueryStatus({ type: "ok", message: data.message || t.searchAdded });
      setQuery("");
    } catch {
      setQueryStatus({ type: "error", message: dict.errors.server });
    }
  }, [query, file, locale, onRequirePremium, t.searchEmpty, t.searchAdded, dict.errors.server]);

  return (
    <div className="mx-auto w-full max-w-4xl">
      <div className="flex items-center justify-between rounded-t-2xl border border-b-0 border-gray-200 bg-white px-6 py-4">
        <div>
          <p className="text-sm font-semibold text-gray-900">{t.title} — {analysis.fileName}</p>
          <p className="text-xs text-gray-500">
            {t.sheet} &quot;{analysis.sheetName}&quot; • {analysis.rowCount} {t.rows}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onRequestDownload}
            className="rounded-full bg-brand-600 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700"
          >
            {t.download}
          </button>
          <button
            type="button"
            onClick={onClose}
            aria-label={t.close}
            className="flex h-9 w-9 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2}>
              <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </div>

      <div className="border border-gray-200 bg-gray-50 px-6 py-4">
        <label htmlFor={searchInputId} className="mb-1.5 block text-xs font-medium text-gray-500">
          {t.searchLabel}
        </label>
        <div className="flex gap-2">
          <input
            id={searchInputId}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && runQuery()}
            placeholder={t.searchPlaceholder}
            className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
          <button
            type="button"
            onClick={runQuery}
            disabled={queryStatus.type === "loading"}
            className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-gray-700 disabled:opacity-50"
          >
            {queryStatus.type === "loading" ? t.searchLoading : t.searchButton}
          </button>
        </div>
        {queryStatus.message ? (
          <p className={`mt-2 text-xs ${queryStatus.type === "error" ? "text-red-600" : "text-brand-700"}`}>{queryStatus.message}</p>
        ) : null}
      </div>

      <div className="space-y-6 rounded-b-2xl border border-t-0 border-gray-200 bg-white p-6">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {kpis.map((kpi, i) => (
            <div key={i} className="rounded-lg bg-brand-50 p-3">
              <input
                value={kpi.value}
                onChange={(e) => updateKpi(i, "value", e.target.value)}
                className="w-full bg-transparent text-lg font-bold text-brand-700 focus:outline-none"
              />
              <input
                value={kpi.label}
                onChange={(e) => updateKpi(i, "label", e.target.value)}
                className="w-full bg-transparent text-xs text-gray-500 focus:outline-none"
              />
            </div>
          ))}
        </div>

        {blocks.map((block) =>
          block.kind === "note" ? (
            <div key={block.id} className="relative rounded-xl border border-dashed border-gray-300 bg-gray-50 p-4">
              <textarea
                value={block.text}
                onChange={(e) => updateNote(block.id, e.target.value)}
                rows={3}
                className="w-full resize-y bg-transparent text-sm text-gray-700 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => removeBlock(block.id)}
                className="absolute right-3 top-3 text-xs font-medium text-gray-400 hover:text-red-600"
              >
                {t.delete}
              </button>
            </div>
          ) : (
            <div key={block.id} className="rounded-xl border border-gray-200 p-4">
              <div className="mb-2 flex items-start justify-between gap-3">
                <input
                  value={block.title}
                  onChange={(e) => updateBlock(block.id, { title: e.target.value })}
                  className="flex-1 border-b border-transparent bg-transparent text-base font-semibold text-gray-900 focus:border-brand-400 focus:outline-none"
                />
                <button type="button" onClick={() => removeBlock(block.id)} className="text-xs font-medium text-gray-400 hover:text-red-600">
                  {t.delete}
                </button>
              </div>

              <div
                className="mx-auto w-full max-w-[520px] overflow-hidden [&>svg]:h-full [&>svg]:w-full"
                style={{ aspectRatio: `${CHART_WIDTH} / ${CHART_HEIGHT}` }}
                dangerouslySetInnerHTML={{
                  __html: renderChartSvg(block.original, block.typeOverride, PALETTE_PRESETS[block.paletteIndex].colors),
                }}
              />

              <div className="mt-3 flex flex-wrap items-center gap-3">
                {isTypeSwitchable(block.original) ? (
                  <select
                    value={block.typeOverride ?? block.original.kind}
                    onChange={(e) => updateBlock(block.id, { typeOverride: e.target.value as EditableKind })}
                    className="rounded-md border border-gray-300 px-2 py-1 text-xs"
                  >
                    <option value="bar">{t.chartTypes.bar}</option>
                    <option value="line">{t.chartTypes.line}</option>
                    <option value="donut">{t.chartTypes.donut}</option>
                  </select>
                ) : null}

                {isTypeSwitchable(block.original) ? (
                  <div className="flex items-center gap-1.5">
                    {PALETTE_PRESETS.map((preset, i) => (
                      <button
                        key={preset.name}
                        type="button"
                        title={preset.name}
                        onClick={() => updateBlock(block.id, { paletteIndex: i })}
                        className={`h-6 w-6 rounded-full border-2 ${block.paletteIndex === i ? "border-gray-900" : "border-transparent"}`}
                        style={{ background: `linear-gradient(135deg, ${preset.colors[0]}, ${preset.colors[1]})` }}
                      />
                    ))}
                  </div>
                ) : null}
              </div>

              {columns.length > 0 ? (
                <div className="mt-3 flex flex-wrap items-end gap-3 rounded-lg bg-gray-50 p-3">
                  <label className="flex flex-col gap-1">
                    <span className="text-[11px] font-medium text-gray-500">{t.xAxis}</span>
                    <select
                      value={block.xAxis ?? ""}
                      disabled={block.axisBusy}
                      onChange={(e) => applyAxes(block.id, e.target.value, block.yAxis ?? "")}
                      className="rounded-md border border-gray-300 px-2 py-1 text-xs disabled:opacity-50"
                    >
                      <option value="">{t.axisAuto}</option>
                      {columns.map((c) => (
                        <option key={c.name} value={c.name}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="flex flex-col gap-1">
                    <span className="text-[11px] font-medium text-gray-500">{t.yAxis}</span>
                    <select
                      value={block.yAxis ?? ""}
                      disabled={block.axisBusy || !block.xAxis}
                      onChange={(e) => applyAxes(block.id, block.xAxis ?? "", e.target.value)}
                      className="rounded-md border border-gray-300 px-2 py-1 text-xs disabled:opacity-50"
                    >
                      <option value="">{t.axisNone}</option>
                      {columns.map((c) => (
                        <option key={c.name} value={c.name}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </label>

                  {block.axisBusy ? <span className="pb-1 text-xs text-gray-500">{t.searchLoading}</span> : null}
                  {block.axisError ? <span className="pb-1 text-xs text-red-600">{block.axisError}</span> : null}
                </div>
              ) : null}

              <textarea
                value={block.insight}
                onChange={(e) => updateBlock(block.id, { insight: e.target.value })}
                rows={2}
                className="mt-3 w-full resize-y rounded-md border border-gray-200 bg-gray-50 p-2 text-xs italic text-gray-600 focus:outline-none"
              />
            </div>
          )
        )}

        <button
          type="button"
          onClick={addNote}
          className="w-full rounded-xl border-2 border-dashed border-gray-300 py-3 text-sm font-medium text-gray-500 transition hover:border-brand-400 hover:text-brand-700"
        >
          {t.addNote}
        </button>
      </div>
    </div>
  );
}

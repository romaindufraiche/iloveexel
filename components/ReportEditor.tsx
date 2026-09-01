"use client";

import { useCallback, useId, useState } from "react";
import {
  barChart,
  donutChart,
  heatmapChart,
  lineChart,
  scatterChart,
  tableToSvg,
  PALETTE_PRESETS,
  CHART_WIDTH,
  CHART_HEIGHT,
} from "@/lib/svgCharts";
import type { BarLineChart, ChartSpec, DonutChart } from "@/lib/types";

type EditableKind = "bar" | "line" | "donut";

interface ChartBlock {
  kind: "chart";
  id: string;
  original: ChartSpec;
  title: string;
  insight: string;
  typeOverride?: EditableKind;
  paletteIndex: number;
}

interface NoteBlock {
  kind: "note";
  id: string;
  text: string;
}

type Block = ChartBlock | NoteBlock;

interface Kpi {
  label: string;
  value: string;
}

export interface EditorAnalysis {
  fileName: string;
  sheetName: string;
  rowCount: number;
  kpis: Kpi[];
  charts: ChartSpec[];
}

function isTypeSwitchable(chart: ChartSpec): chart is BarLineChart | DonutChart {
  return chart.kind === "bar" || chart.kind === "line" || chart.kind === "donut";
}

function renderChartSvg(chart: ChartSpec, typeOverride: EditableKind | undefined, palette: string[]): string {
  if (isTypeSwitchable(chart)) {
    const kind = typeOverride ?? chart.kind;
    const seriesLabel = "seriesLabel" in chart ? chart.seriesLabel : undefined;
    if (kind === "line") return lineChart(chart.labels, chart.values, seriesLabel, palette[0]);
    if (kind === "donut") return donutChart(chart.labels, chart.values, palette);
    return barChart(chart.labels, chart.values, seriesLabel, palette);
  }
  if (chart.kind === "scatter") return scatterChart(chart.points, chart.xLabel, chart.yLabel);
  if (chart.kind === "heatmap") return heatmapChart(chart.rowLabels, chart.colLabels, chart.matrix, chart.displayMatrix, chart.colorScale);
  return tableToSvg(chart.columns, chart.rows);
}

function blockIdFrom(prefix: string, index: number): string {
  return `${prefix}-${index}-${Math.random().toString(36).slice(2, 8)}`;
}

export default function ReportEditor({
  analysis,
  file,
  onRequestDownload,
  onClose,
}: {
  analysis: EditorAnalysis;
  file: File;
  onRequestDownload: () => void;
  onClose: () => void;
}) {
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
    setBlocks((prev) => [...prev, { kind: "note", id: blockIdFrom("note", prev.length), text: "Votre texte ici..." }]);
  }, []);

  const runQuery = useCallback(async () => {
    const prompt = query.trim();
    if (!prompt) return;
    setQueryStatus({ type: "loading", message: "" });

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("prompt", prompt);
      const res = await fetch("/api/ask-chart", { method: "POST", body: formData });
      const data = await res.json();

      if (!res.ok || !data.chart) {
        setQueryStatus({ type: "error", message: data.message || "Aucun graphique trouvé pour cette demande." });
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
      setQueryStatus({ type: "ok", message: data.message || "Graphique ajouté." });
      setQuery("");
    } catch {
      setQueryStatus({ type: "error", message: "Impossible de contacter le serveur." });
    }
  }, [query, file]);

  return (
    <div className="mx-auto w-full max-w-4xl">
      <div className="flex items-center justify-between rounded-t-2xl border border-b-0 border-gray-200 bg-white px-6 py-4">
        <div>
          <p className="text-sm font-semibold text-gray-900">Édition — {analysis.fileName}</p>
          <p className="text-xs text-gray-500">
            Feuille &quot;{analysis.sheetName}&quot; • {analysis.rowCount} lignes
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onRequestDownload}
            className="rounded-full bg-brand-600 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700"
          >
            Télécharger
          </button>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer l'édition"
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
          Pas le bon graphique ? Décrivez ce que vous cherchez
        </label>
        <div className="flex gap-2">
          <input
            id={searchInputId}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && runQuery()}
            placeholder='ex : "le taux de conversion par région"'
            className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
          <button
            type="button"
            onClick={runQuery}
            disabled={queryStatus.type === "loading"}
            className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-gray-700 disabled:opacity-50"
          >
            {queryStatus.type === "loading" ? "Recherche…" : "Générer"}
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
                Supprimer
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
                  Supprimer
                </button>
              </div>

              <div
                className="mx-auto w-full max-w-[520px]"
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
                    <option value="bar">Barres</option>
                    <option value="line">Courbe</option>
                    <option value="donut">Camembert</option>
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
          + Ajouter un bloc de texte
        </button>
      </div>
    </div>
  );
}

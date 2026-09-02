import { CHART_WIDTH, CHART_HEIGHT, PALETTE } from "@/lib/svgCharts";
import { renderChartSvg } from "@/lib/chartRender";
import type { EditorAnalysis } from "./ReportEditor";

export default function ReportPreview({ analysis }: { analysis: EditorAnalysis }) {
  return (
    <div className="mt-6 rounded-xl border border-gray-200 bg-white p-5 text-left">
      <p className="text-xs text-gray-500">
        Feuille &quot;{analysis.sheetName}&quot; • {analysis.rowCount} lignes
      </p>

      <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {analysis.kpis.map((kpi, i) => (
          <div key={i} className="rounded-lg bg-brand-50 p-3">
            <p className="text-lg font-bold text-brand-700">{kpi.value}</p>
            <p className="text-xs text-gray-500">{kpi.label}</p>
          </div>
        ))}
      </div>

      <div className="mt-4 space-y-4">
        {analysis.charts.slice(0, 3).map((chart, i) => (
          <div key={i} className="rounded-lg border border-gray-100 p-3">
            <p className="text-sm font-semibold text-gray-900">{chart.title}</p>
            <div
              className="mx-auto mt-2 w-full max-w-[520px] overflow-hidden [&>svg]:h-full [&>svg]:w-full"
              style={{ aspectRatio: `${CHART_WIDTH} / ${CHART_HEIGHT}` }}
              dangerouslySetInnerHTML={{ __html: renderChartSvg(chart, undefined, PALETTE) }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ShieldCheck, AlertTriangle, Info, CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import QualityIssuesTable from "./QualityIssuesTable";

const STATUS_CONFIG = {
  Good:           { icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50 border-emerald-200", bar: "bg-emerald-500" },
  "Needs Review": { icon: AlertCircle,  color: "text-amber-600",   bg: "bg-amber-50 border-amber-200",    bar: "bg-amber-500"   },
  "Poor Quality": { icon: XCircle,      color: "text-red-600",     bg: "bg-red-50 border-red-200",        bar: "bg-red-500"     },
};

export default function QualityReport({ quality, dataset }) {
  if (!quality) {
    return (
      <Card className="border-slate-200/60">
        <CardContent className="py-12 text-center">
          <ShieldCheck className="w-8 h-8 text-slate-300 mx-auto mb-3" />
          <p className="text-sm text-slate-500">No quality report available.</p>
          <p className="text-xs text-slate-400 mt-1">Upload a CSV or Excel file to generate a quality analysis.</p>
        </CardContent>
      </Card>
    );
  }

  const cfg = STATUS_CONFIG[quality.quality_status] || STATUS_CONFIG["Needs Review"];
  const StatusIcon = cfg.icon;

  const metrics = [
    { label: "Empty Cells",        value: quality.missing_values     || 0, bad: (quality.missing_values     || 0) > 0 },
    { label: "Duplicate Rows",     value: quality.duplicate_rows     || 0, bad: (quality.duplicate_rows     || 0) > 0 },
    { label: "Empty Columns",      value: quality.empty_columns      || 0, bad: (quality.empty_columns      || 0) > 0 },
    { label: "Invalid Dates",      value: quality.invalid_dates      || 0, bad: (quality.invalid_dates      || 0) > 0 },
    { label: "Invalid Numerics",   value: quality.invalid_numerics   || 0, bad: (quality.invalid_numerics   || 0) > 0 },
    { label: "Consistency Issues", value: quality.consistency_issues || 0, bad: (quality.consistency_issues || 0) > 0 },
  ];

  return (
    <div className="space-y-5">
      {/* Score overview */}
      <Card className="border-slate-200/60">
        <CardContent className="pt-5">
          <div className="flex items-center gap-4 flex-wrap">
            <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border ${cfg.bg}`}>
              <StatusIcon className={`w-5 h-5 ${cfg.color}`} />
              <span className={`font-semibold text-sm ${cfg.color}`}>{quality.quality_status}</span>
            </div>
            <div className="flex-1 min-w-[180px]">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs text-slate-500">Overall Quality Score</span>
                <span className={`text-lg font-bold ${cfg.color}`}>{quality.quality_score}%</span>
              </div>
              <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                <div className={`h-full ${cfg.bar} rounded-full transition-all duration-700`} style={{ width: `${quality.quality_score}%` }} />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {metrics.map(({ label, value, bad }) => (
          <Card key={label} className={`border ${bad ? "border-red-100 bg-red-50/30" : "border-emerald-100 bg-emerald-50/30"}`}>
            <CardContent className="pt-4 pb-4 text-center">
              <p className={`text-2xl font-bold ${bad ? "text-red-600" : "text-emerald-600"}`}>{value.toLocaleString()}</p>
              <p className="text-xs text-slate-500 mt-1">{label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Warnings */}
      {quality.warnings?.length > 0 && (
        <Card className="border-amber-200 bg-amber-50/40">
          <CardContent className="pt-4 pb-4">
            <p className="text-sm font-semibold text-amber-700 mb-2 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4" /> Warnings
            </p>
            <ul className="space-y-1">
              {quality.warnings.map((w, i) => (
                <li key={i} className="text-sm text-amber-800 flex items-start gap-2">
                  <span className="mt-0.5 text-amber-400">•</span>{w}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Recommendations */}
      {quality.recommendations?.length > 0 && (
        <Card className="border-teal-200 bg-teal-50/40">
          <CardContent className="pt-4 pb-4">
            <p className="text-sm font-semibold text-teal-700 mb-2 flex items-center gap-1.5">
              <Info className="w-4 h-4" /> Recommendations
            </p>
            <ul className="space-y-1">
              {quality.recommendations.map((r, i) => (
                <li key={i} className="text-sm text-teal-800 flex items-start gap-2">
                  <span className="mt-0.5 text-teal-400">•</span>{r}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Per-column completeness */}
      {quality.column_quality?.some(c => c.completeness < 100) && (
        <Card className="border-slate-200/60">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-slate-800">Per-Column Completeness</CardTitle>
          </CardHeader>
          <CardContent className="pt-0 space-y-3">
            {quality.column_quality.map((c, i) => (
              <div key={i} className="space-y-1">
                <div className="flex items-center gap-3">
                  <span className="text-xs text-slate-600 w-36 truncate font-medium">{c.column_name}</span>
                  <div className="flex-1">
                    <Progress value={c.completeness} className="h-2" />
                  </div>
                  <span className={`text-xs font-semibold w-16 text-right ${c.completeness < 80 ? "text-red-500" : c.completeness < 95 ? "text-amber-500" : "text-emerald-600"}`}>
                    {c.completeness}% complete
                  </span>
                </div>
                {c.issues?.length > 0 && (
                  <div className="ml-36 flex flex-wrap gap-1">
                    {c.issues.slice(0, 5).map((iss, j) => (
                      <span key={j} className="text-[10px] bg-red-50 text-red-600 border border-red-100 rounded px-1.5 py-0.5">{iss}</span>
                    ))}
                    {c.issues.length > 5 && <span className="text-[10px] text-slate-400">+{c.issues.length - 5} more</span>}
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* ── Row-level issues table ── */}
      <QualityIssuesTable
        issues={quality.quality_issues || []}
        rowCount={quality.row_count ?? dataset?.row_count}
        columnCount={quality.column_count ?? dataset?.column_count}
        fileName={quality.analyzed_file_name || dataset?.format || dataset?.name}
        analysisTimestamp={quality.analysis_timestamp || quality.updated_date || quality.created_date}
        analysisFailed={quality.analysis_failed}
      />
    </div>
  );
}
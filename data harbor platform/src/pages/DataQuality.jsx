import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLang } from "@/components/LanguageContext";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Search, ShieldCheck, AlertTriangle, XCircle, CheckCircle2,
  Info, ChevronDown, ChevronUp, RefreshCw
} from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import moment from "moment";
import { parseDatasetFile } from "@/components/datasets/parseDatasetFile";
import QualityDebugBadge from "@/components/dataquality/QualityDebugBadge";

const STATUS_CONFIG = {
  Good: { icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50 border-emerald-200" },
  "Needs Review": { icon: AlertTriangle, color: "text-amber-600", bg: "bg-amber-50 border-amber-200" },
  "Poor Quality": { icon: XCircle, color: "text-red-600", bg: "bg-red-50 border-red-200" },
};

// Fetch file from URL, build a File object, run parseDatasetFile
async function reanalyzeDataset(dataset) {
  if (!dataset.file_url) throw new Error("No file URL on this dataset");
  const resp = await fetch(dataset.file_url);
  if (!resp.ok) throw new Error(`Failed to fetch file: ${resp.status}`);
  const blob = await resp.blob();
  const fileName = dataset.format || dataset.file_url.split("/").pop() || "file.csv";
  const file = new File([blob], fileName, { type: blob.type });
  const stats = await parseDatasetFile(file);
  if (!stats) throw new Error("parseDatasetFile returned null — unsupported file type");
  return stats;
}

export default function DataQuality() {
  const { t } = useLang();
  const qc = useQueryClient();
  const [user, setUser] = useState(null);
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState(null);
  const [reanalyzingId, setReanalyzingId] = useState(null);
  const [showDebug, setShowDebug] = useState(true);

  useEffect(() => { base44.auth.me().then(setUser); }, []);

  const { data: datasets = [] } = useQuery({
    queryKey: ["datasets", user?.email],
    queryFn: () => base44.entities.Dataset.list("-created_date", 200),
    enabled: !!user,
  });

  const { data: qualityResults = [], isLoading } = useQuery({
    queryKey: ["quality", user?.email],
    queryFn: () => base44.entities.QualityResult.list("-created_date", 200),
    enabled: !!user,
  });

  // Map dataset_id → quality result (most recent)
  const qualityMap = {};
  qualityResults.forEach(q => {
    if (!qualityMap[q.dataset_id] || q.created_date > qualityMap[q.dataset_id].created_date) {
      qualityMap[q.dataset_id] = q;
    }
  });

  const userDatasets = datasets.filter(d => d.created_by === user?.email && !d.isDemo);
  const userQuality = userDatasets
    .map(d => ({ dataset: d, quality: qualityMap[d.id] }))
    .filter(({ quality }) => !!quality);

  const filtered = userQuality.filter(({ dataset, quality }) =>
    !search || quality.dataset_name?.toLowerCase().includes(search.toLowerCase()) || dataset.name?.toLowerCase().includes(search.toLowerCase())
  );

  const avgScore = userQuality.length > 0
    ? (userQuality.reduce((a, { quality: q }) => a + (q.quality_score || 0), 0) / userQuality.length).toFixed(1)
    : 0;
  const statusCounts = { Good: 0, "Needs Review": 0, "Poor Quality": 0 };
  userQuality.forEach(({ quality: q }) => { if (q.quality_status) statusCounts[q.quality_status]++; });

  // Re-analyze: fetch file → parse → upsert QualityResult (stores failure marker if parse fails)
  const handleReanalyze = async (dataset) => {
    setReanalyzingId(dataset.id);
    const existingQ = qualityMap[dataset.id];
    let payload;
    try {
      const stats = await reanalyzeDataset(dataset);
      console.log("[DataHarbor] Re-analyze success:", dataset.name, "rows:", stats.row_count, "quality:", stats.quality?.quality_score);
      payload = {
        dataset_id: dataset.id,
        dataset_name: dataset.name,
        ownerUserId: dataset.ownerUserId,
        row_count: stats.row_count,
        column_count: stats.column_count,
        analysis_failed: false,
        analyzed_file_name: dataset.format || dataset.file_url?.split("/").pop() || "file",
        analysis_timestamp: new Date().toISOString(),
        ...stats.quality,
      };
    } catch (err) {
      console.error("[DataHarbor] Re-analyze failed for", dataset.name, err.message);
      payload = {
        dataset_id: dataset.id,
        dataset_name: dataset.name,
        ownerUserId: dataset.ownerUserId,
        analysis_failed: true,
        quality_score: 0,
        quality_status: "Poor Quality",
        missing_values: 0, duplicate_rows: 0, empty_columns: 0,
        invalid_dates: 0, invalid_numerics: 0, consistency_issues: 0,
        warnings: [`Analysis failed: ${err.message}`],
        recommendations: [],
      };
    }
    try {
      if (existingQ?.id) {
        await base44.entities.QualityResult.update(existingQ.id, payload);
      } else {
        await base44.entities.QualityResult.create(payload);
      }
      qc.invalidateQueries({ queryKey: ["quality"] });
    } finally {
      setReanalyzingId(null);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{t["Data Quality Monitoring"]}</h1>
          <p className="text-sm text-slate-500 mt-0.5">{t["Monitor data quality across all datasets"]}</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className={`text-xs gap-1.5 ${showDebug ? "border-amber-400 text-amber-700 bg-amber-50" : ""}`}
          onClick={() => setShowDebug(v => !v)}
        >
          {showDebug ? "Hide Debug" : "Show Debug"}
        </Button>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card className="border-slate-200/60"><CardContent className="pt-5">
          <p className="text-xs text-slate-500 font-medium">{t["Avg Quality Score label"]}</p>
          <p className="text-3xl font-bold text-slate-900 mt-1">{avgScore}%</p>
        </CardContent></Card>
        {Object.entries(statusCounts).map(([status, count]) => {
          const cfg = STATUS_CONFIG[status];
          const Icon = cfg.icon;
          return (
            <Card key={status} className="border-slate-200/60"><CardContent className="pt-5">
              <div className="flex items-center gap-2">
                <Icon className={`w-4 h-4 ${cfg.color}`} />
                <p className="text-xs text-slate-500 font-medium">{status}</p>
              </div>
              <p className="text-3xl font-bold text-slate-900 mt-1">{count}</p>
            </CardContent></Card>
          );
        })}
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <Input placeholder={t["Search datasets..."]} value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 bg-white" />
      </div>

      {isLoading ? (
        <div className="space-y-3">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-32 rounded-xl" />)}</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <ShieldCheck className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <p className="text-sm text-slate-500">{t["No quality reports found"]}</p>
          <p className="text-xs text-slate-400 mt-1">Upload a dataset with a CSV or Excel file to generate a quality report.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(({ dataset, quality: q }) => {
            const cfg = STATUS_CONFIG[q.quality_status] || STATUS_CONFIG.Good;
            const expanded = expandedId === q.id;
            const isAnalyzing = reanalyzingId === dataset.id;
            return (
              <Card key={q.id} className="border-slate-200/60">
                <CardContent className="py-4">
                  <div className="flex items-center justify-between cursor-pointer" onClick={() => setExpandedId(expanded ? null : q.id)}>
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <Link to={createPageUrl(`Insights?id=${dataset.id}`)} className="font-medium text-slate-800 hover:text-teal-600" onClick={(e) => e.stopPropagation()}>
                            {q.dataset_name || dataset.name || "Unnamed Dataset"}
                          </Link>
                          <span className="text-xs text-slate-400">
                            {q.row_count ?? dataset.row_count ?? "?"} rows · {q.column_count ?? dataset.column_count ?? "?"} cols
                          </span>
                        </div>
                        <div className="flex items-center gap-3 mt-2">
                          <div className="flex-1 max-w-[200px]">
                            <Progress value={q.quality_score} className="h-2" />
                          </div>
                          <span className="text-sm font-semibold text-slate-700">{q.quality_score}%</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 text-xs gap-1 text-teal-600 hover:text-teal-700"
                        disabled={isAnalyzing || !dataset.file_url}
                        onClick={(e) => { e.stopPropagation(); handleReanalyze(dataset); }}
                        title={dataset.file_url ? "Re-run quality analysis from the actual file" : "No file uploaded"}
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${isAnalyzing ? "animate-spin" : ""}`} />
                        {isAnalyzing ? "Analyzing…" : "Re-analyze"}
                      </Button>
                      <Badge variant="outline" className={cfg.bg}>{q.quality_status}</Badge>
                      {expanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                    </div>
                  </div>

                  {expanded && (
                    <div className="mt-4 pt-4 border-t border-slate-100 space-y-4">
                      {q.analysis_failed ? (
                        <div className="flex items-start gap-3 p-4 rounded-lg bg-red-50 border border-red-200">
                          <XCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                          <div>
                            <p className="text-sm font-semibold text-red-700">Quality analysis failed for this dataset.</p>
                            <p className="text-xs text-red-600 mt-0.5">No valid results were generated. Re-upload the file or click Re-analyze to retry.</p>
                          </div>
                        </div>
                      ) : (
                        <>
                          {/* Metrics grid — only shown when analysis actually ran */}
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            {[
                              { label: "Empty Cells",        val: q.missing_values },
                              { label: "Duplicate Rows",     val: q.duplicate_rows },
                              { label: "Empty Columns",      val: q.empty_columns },
                              { label: "Invalid Dates",      val: q.invalid_dates },
                              { label: "Invalid Numerics",   val: q.invalid_numerics },
                              { label: "Consistency Issues", val: q.consistency_issues },
                            ].map(({ label, val }) => (
                              <div key={label} className="bg-slate-50 rounded-lg p-3 text-center">
                                <p className={`text-lg font-bold ${val > 0 ? "text-red-600" : "text-slate-800"}`}>{val ?? 0}</p>
                                <p className="text-[10px] text-slate-500 mt-0.5">{t[label] || label}</p>
                              </div>
                            ))}
                          </div>

                          {q.warnings?.length > 0 && (
                            <div>
                              <p className="text-xs font-semibold text-amber-700 mb-2 flex items-center gap-1">
                                <AlertTriangle className="w-3.5 h-3.5" /> {t["Warnings"]}
                              </p>
                              <div className="space-y-1">
                                {q.warnings.map((w, i) => <p key={i} className="text-xs text-slate-600 pl-5">• {w}</p>)}
                              </div>
                            </div>
                          )}
                          {q.recommendations?.length > 0 && (
                            <div>
                              <p className="text-xs font-semibold text-teal-700 mb-2 flex items-center gap-1">
                                <Info className="w-3.5 h-3.5" /> {t["Recommendations"]}
                              </p>
                              <div className="space-y-1">
                                {q.recommendations.map((r, i) => <p key={i} className="text-xs text-slate-600 pl-5">• {r}</p>)}
                              </div>
                            </div>
                          )}
                        </>
                      )}

                      <p className="text-xs text-slate-400">{t["Last checked"]}: {moment(q.updated_date || q.created_date).format("MMM D, YYYY h:mm A")}</p>

                      {/* Debug panel */}
                      {showDebug && <QualityDebugBadge q={{ ...q, row_count: q.row_count ?? dataset.row_count, column_count: q.column_count ?? dataset.column_count }} dataset={dataset} />}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
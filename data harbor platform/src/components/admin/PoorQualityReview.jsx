import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { AlertTriangle, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

const STATUS_STYLES = {
  "Good":          "bg-emerald-50 text-emerald-700 border-emerald-200",
  "Needs Review":  "bg-amber-50 text-amber-700 border-amber-200",
  "Poor Quality":  "bg-red-50 text-red-700 border-red-200",
};

export default function PoorQualityReview({ qualityResults }) {
  const poor = qualityResults
    .filter(q => q.quality_status === "Poor Quality" || q.quality_status === "Needs Review")
    .sort((a, b) => a.quality_score - b.quality_score);

  if (poor.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="w-14 h-14 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-3">
          <AlertTriangle className="w-7 h-7 text-emerald-500" />
        </div>
        <p className="text-sm font-medium text-slate-700">All datasets have acceptable quality</p>
        <p className="text-xs text-slate-400 mt-1">No issues to review right now.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-xs text-slate-500">{poor.length} dataset(s) need attention</p>
      {poor.map(q => (
        <Card key={q.id} className={`border ${q.quality_status === "Poor Quality" ? "border-red-200 bg-red-50/30" : "border-amber-200 bg-amber-50/20"}`}>
          <CardContent className="pt-4 pb-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0 space-y-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-semibold text-sm text-slate-800 truncate">{q.dataset_name}</p>
                  <Badge variant="outline" className={`text-[10px] ${STATUS_STYLES[q.quality_status]}`}>
                    {q.quality_status}
                  </Badge>
                </div>

                <div className="flex items-center gap-3">
                  <Progress value={q.quality_score} className="h-2 flex-1 max-w-[160px]" />
                  <span className="text-sm font-bold text-slate-700">{q.quality_score}%</span>
                </div>

                {q.warnings?.length > 0 && (
                  <ul className="space-y-0.5">
                    {q.warnings.slice(0, 3).map((w, i) => (
                      <li key={i} className="text-xs text-slate-600 flex items-start gap-1.5">
                        <span className="text-amber-500 mt-0.5">•</span>{w}
                      </li>
                    ))}
                    {q.warnings.length > 3 && (
                      <li className="text-xs text-slate-400">+{q.warnings.length - 3} more warnings</li>
                    )}
                  </ul>
                )}

                <div className="flex flex-wrap gap-3 text-xs text-slate-500">
                  {q.missing_values > 0   && <span>Missing: <strong className="text-slate-700">{q.missing_values}</strong></span>}
                  {q.duplicate_rows > 0   && <span>Duplicates: <strong className="text-slate-700">{q.duplicate_rows}</strong></span>}
                  {q.empty_columns > 0    && <span>Empty cols: <strong className="text-slate-700">{q.empty_columns}</strong></span>}
                  {q.invalid_dates > 0    && <span>Bad dates: <strong className="text-slate-700">{q.invalid_dates}</strong></span>}
                </div>
              </div>

              <Link
                to={createPageUrl(`Insights?id=${q.dataset_id}`)}
                className="flex items-center gap-1 text-xs text-teal-600 hover:text-teal-700 font-medium whitespace-nowrap"
              >
                View <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
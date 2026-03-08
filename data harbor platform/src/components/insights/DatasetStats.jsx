import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Rows3, Columns3, ShieldCheck, Hash } from "lucide-react";

export default function DatasetStats({ dataset, quality }) {
  const qualityBg = !quality ? "bg-slate-50"
    : quality.quality_score >= 85 ? "bg-emerald-50"
    : quality.quality_score >= 70 ? "bg-amber-50"
    : "bg-red-50";
  const qualityText = !quality ? "text-slate-400"
    : quality.quality_score >= 85 ? "text-emerald-700"
    : quality.quality_score >= 70 ? "text-amber-700"
    : "text-red-700";

  const stats = [
    { label: "Total Rows", value: dataset.row_count?.toLocaleString() || "—", icon: Rows3, bg: "bg-blue-50", text: "text-blue-700" },
    { label: "Total Columns", value: dataset.column_count || "—", icon: Columns3, bg: "bg-violet-50", text: "text-violet-700" },
    { label: "Quality Score", value: quality ? `${quality.quality_score}%` : "—", icon: ShieldCheck, bg: qualityBg, text: qualityText },
    { label: "File Type", value: dataset.file_type || "—", icon: Hash, bg: "bg-teal-50", text: "text-teal-700" },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {stats.map(({ label, value, icon: Icon, bg, text }) => (
        <Card key={label} className="border-slate-200/60 shadow-sm">
          <CardContent className="pt-4 pb-4">
            <div className={`w-9 h-9 rounded-lg ${bg} flex items-center justify-center mb-3`}>
              <Icon className={`w-4.5 h-4.5 ${text}`} />
            </div>
            <p className="text-2xl font-bold text-slate-900">{value}</p>
            <p className="text-xs text-slate-500 mt-0.5">{label}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
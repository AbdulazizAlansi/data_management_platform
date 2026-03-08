import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Database, Calendar, User, Shield, RefreshCw, Tag, ArrowLeft, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import moment from "moment";

const STATUS_COLORS = {
  Active: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Archived: "bg-slate-50 text-slate-600 border-slate-200",
  Draft: "bg-amber-50 text-amber-700 border-amber-200",
  "Under Review": "bg-blue-50 text-blue-700 border-blue-200",
};

const SENSITIVITY_COLORS = {
  Public: "bg-green-50 text-green-700",
  Internal: "bg-blue-50 text-blue-700",
  Confidential: "bg-amber-50 text-amber-700",
  Restricted: "bg-red-50 text-red-700",
};

export default function DatasetHero({ dataset, quality }) {
  const qualityColor = !quality ? "text-slate-400"
    : quality.quality_score >= 85 ? "text-emerald-600"
    : quality.quality_score >= 70 ? "text-amber-500"
    : "text-red-500";

  return (
    <div className="bg-white border border-slate-200/60 rounded-2xl overflow-hidden shadow-sm">
      <div className="h-2 bg-gradient-to-r from-teal-500 via-cyan-500 to-blue-500" />
      <div className="p-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center flex-shrink-0 shadow-md">
              <Database className="w-7 h-7 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl font-bold text-slate-900">{dataset.name}</h1>
                <Badge variant="outline" className={STATUS_COLORS[dataset.status] || ""}>{dataset.status}</Badge>
                {dataset.data_sensitivity && (
                  <Badge variant="outline" className={SENSITIVITY_COLORS[dataset.data_sensitivity] || ""}>{dataset.data_sensitivity}</Badge>
                )}
              </div>
              <p className="text-sm text-slate-500 mt-1 max-w-xl">{dataset.description || "No description provided."}</p>
              <div className="flex items-center gap-4 mt-3 flex-wrap">
                {dataset.department && <span className="text-xs text-slate-500 flex items-center gap-1"><Database className="w-3 h-3" />{dataset.department}</span>}
                {dataset.category && <span className="text-xs text-slate-500 flex items-center gap-1"><Tag className="w-3 h-3" />{dataset.category}</span>}
                {dataset.owner && <span className="text-xs text-slate-500 flex items-center gap-1"><User className="w-3 h-3" />{dataset.owner}</span>}
                {dataset.update_frequency && <span className="text-xs text-slate-500 flex items-center gap-1"><RefreshCw className="w-3 h-3" />{dataset.update_frequency}</span>}
                <span className="text-xs text-slate-400 flex items-center gap-1"><Calendar className="w-3 h-3" />Added {moment(dataset.created_date).fromNow()}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {quality && (
              <div className="text-center px-4 py-2 bg-slate-50 rounded-xl border border-slate-200">
                <p className={`text-2xl font-bold ${qualityColor}`}>{quality.quality_score}%</p>
                <p className="text-[10px] text-slate-500 font-medium">Quality</p>
              </div>
            )}
          </div>
        </div>

        {dataset.tags && (
          <div className="flex flex-wrap gap-1.5 mt-4 pt-4 border-t border-slate-100">
            {dataset.tags.split(",").filter(Boolean).map(t => (
              <Badge key={t} variant="secondary" className="text-xs bg-slate-100 text-slate-600 font-normal">{t.trim()}</Badge>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
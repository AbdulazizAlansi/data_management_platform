import React from "react";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Database, ArrowRight } from "lucide-react";
import moment from "moment";
import { useLang } from "@/components/LanguageContext";

const STATUS_STYLES = {
  Active:         "bg-emerald-50 text-emerald-700 border-emerald-200",
  Archived:       "bg-slate-100 text-slate-500 border-slate-200",
  Draft:          "bg-amber-50 text-amber-700 border-amber-200",
  "Under Review": "bg-blue-50 text-blue-700 border-blue-200",
};

const DEPT_COLORS = ["bg-teal-500","bg-blue-500","bg-violet-500","bg-amber-500","bg-rose-500","bg-indigo-500","bg-emerald-500","bg-pink-500"];
const deptColor = (dept) => DEPT_COLORS[Math.abs((dept || "").split("").reduce((a, c) => a + c.charCodeAt(0), 0)) % DEPT_COLORS.length];

export default function RecentDatasets({ datasets }) {
  const { t } = useLang();
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-slate-800">{t["Recently Uploaded"] || "Recently Uploaded"}</h3>
          <p className="text-xs text-slate-400 mt-0.5">{t["Latest additions to the catalog"] || "Latest additions to the catalog"}</p>
        </div>
        <Link to={createPageUrl("Datasets")} className="flex items-center gap-1 text-xs text-teal-600 hover:text-teal-700 font-semibold transition-colors">
           {t["View All"] || "View All"} <ArrowRight className="w-3 h-3" />
         </Link>
      </div>

      <div className="divide-y divide-slate-50">
        {datasets.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 gap-2">
            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
              <Database className="w-5 h-5 text-slate-300" />
            </div>
            <p className="text-sm text-slate-400">No datasets yet</p>
          </div>
        )}
        {datasets.slice(0, 7).map((d) => (
          <Link
            key={d.id}
            to={createPageUrl(`Insights?id=${d.id}`)}
            className="flex items-center gap-3.5 px-5 py-3.5 hover:bg-slate-50/80 transition-colors group"
          >
            <div className={`w-8 h-8 rounded-lg ${deptColor(d.department)} flex items-center justify-center shrink-0`}>
              <Database className="w-3.5 h-3.5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-800 truncate group-hover:text-teal-600 transition-colors">{d.name}</p>
              <p className="text-xs text-slate-400 mt-0.5">{d.department || "—"} · {moment(d.created_date).fromNow()}</p>
            </div>
            <Badge variant="outline" className={`text-[10px] shrink-0 ${STATUS_STYLES[d.status] || ""}`}>
              {t[d.status] || d.status}
            </Badge>
          </Link>
        ))}
      </div>
    </div>
  );
}
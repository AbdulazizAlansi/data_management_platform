import React from "react";
import { Database, Upload, Edit, FileText, LogIn, ShieldCheck, UserPlus, Trash2, Activity } from "lucide-react";
import moment from "moment";
import { useLang } from "@/components/LanguageContext";

const ACTION_CONFIG = {
  "User Login":       { icon: LogIn,       bg: "bg-blue-100",    text: "text-blue-600" },
  "Dataset Uploaded": { icon: Upload,      bg: "bg-teal-100",    text: "text-teal-600" },
  "Dataset Updated":  { icon: Edit,        bg: "bg-amber-100",   text: "text-amber-600" },
  "Dataset Deleted":  { icon: Trash2,      bg: "bg-red-100",     text: "text-red-600" },
  "Metadata Edited":  { icon: Database,    bg: "bg-violet-100",  text: "text-violet-600" },
  "Report Exported":  { icon: FileText,    bg: "bg-emerald-100", text: "text-emerald-600" },
  "Quality Check":    { icon: ShieldCheck, bg: "bg-cyan-100",    text: "text-cyan-600" },
  "User Registered":  { icon: UserPlus,    bg: "bg-pink-100",    text: "text-pink-600" },
};

export default function RecentActivity({ activities }) {
  const { t } = useLang();
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-100">
        <h3 className="text-sm font-semibold text-slate-800">{t["Recent Activity"] || "Recent Activity"}</h3>
        <p className="text-xs text-slate-400 mt-0.5">{t["Latest platform events"] || "Latest platform events"}</p>
      </div>

      <div className="divide-y divide-slate-50 overflow-y-auto max-h-[360px]">
        {activities.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 gap-2">
            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
              <Activity className="w-5 h-5 text-slate-300" />
            </div>
            <p className="text-sm text-slate-400">No recent activity</p>
          </div>
        )}
        {activities.slice(0, 10).map((a) => {
          const cfg = ACTION_CONFIG[a.action] || { icon: Database, bg: "bg-slate-100", text: "text-slate-500" };
          const Icon = cfg.icon;
          return (
            <div key={a.id} className="flex items-start gap-3.5 px-5 py-3.5 hover:bg-slate-50/80 transition-colors">
              <div className={`w-8 h-8 rounded-lg ${cfg.bg} flex items-center justify-center shrink-0 mt-0.5`}>
                <Icon className={`w-3.5 h-3.5 ${cfg.text}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-slate-700 leading-snug">{a.description}</p>
                <p className="text-xs text-slate-400 mt-0.5">
                  <span className="font-medium text-slate-500">{a.user_name || a.user_email || t["System"]}</span>
                  {" · "}{moment(a.created_date).fromNow()}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
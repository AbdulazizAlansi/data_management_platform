import React from "react";
import { TrendingUp, TrendingDown } from "lucide-react";

const COLORS = {
  teal:    { bg: "bg-teal-500",    light: "bg-teal-50",    text: "text-teal-600",    border: "border-teal-100",    glow: "shadow-teal-100" },
  blue:    { bg: "bg-blue-500",    light: "bg-blue-50",    text: "text-blue-600",    border: "border-blue-100",    glow: "shadow-blue-100" },
  violet:  { bg: "bg-violet-500",  light: "bg-violet-50",  text: "text-violet-600",  border: "border-violet-100",  glow: "shadow-violet-100" },
  amber:   { bg: "bg-amber-500",   light: "bg-amber-50",   text: "text-amber-600",   border: "border-amber-100",   glow: "shadow-amber-100" },
  emerald: { bg: "bg-emerald-500", light: "bg-emerald-50", text: "text-emerald-600", border: "border-emerald-100", glow: "shadow-emerald-100" },
  rose:    { bg: "bg-rose-500",    light: "bg-rose-50",    text: "text-rose-600",    border: "border-rose-100",    glow: "shadow-rose-100" },
};

export default function KPICard({ title, value, icon: Icon, trend, trendUp, color = "teal" }) {
  const c = COLORS[color] || COLORS.teal;

  return (
    <div className={`relative bg-white rounded-2xl border ${c.border} p-5 hover:shadow-lg hover:${c.glow} transition-all duration-200 overflow-hidden group`}>
      {/* Subtle top accent bar */}
      <div className={`absolute top-0 left-0 right-0 h-0.5 ${c.bg} opacity-60`} />

      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest">{title}</p>
          <p className="text-3xl font-bold text-slate-900 mt-2 tabular leading-none">{value}</p>
          {trend && (
            <div className={`flex items-center gap-1 mt-3 text-xs font-medium ${trendUp ? "text-emerald-600" : "text-rose-500"}`}>
              <span className={`inline-flex items-center justify-center w-4 h-4 rounded-full ${trendUp ? "bg-emerald-50" : "bg-rose-50"}`}>
                {trendUp ? <TrendingUp className="w-2.5 h-2.5" /> : <TrendingDown className="w-2.5 h-2.5" />}
              </span>
              {trend}
            </div>
          )}
        </div>
        <div className={`w-11 h-11 rounded-xl ${c.light} flex items-center justify-center shrink-0 ml-3 group-hover:scale-110 transition-transform duration-200`}>
          <Icon className={`w-5 h-5 ${c.text}`} />
        </div>
      </div>
    </div>
  );
}
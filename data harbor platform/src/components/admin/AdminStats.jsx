import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Users, Database, ShieldCheck, Activity, TrendingUp, AlertTriangle } from "lucide-react";
import { useLang } from "@/components/LanguageContext";

const STATS = [
  { key: "users",       labelKey: "Total Users",       icon: Users,         color: "bg-blue-50 text-blue-600" },
  { key: "datasets",    labelKey: "Total Datasets",     icon: Database,      color: "bg-teal-50 text-teal-600" },
  { key: "avgQuality",  labelKey: "Avg Quality Score",  icon: ShieldCheck,   color: "bg-emerald-50 text-emerald-600", suffix: "%" },
  { key: "activities",  labelKey: "Activity Events",    icon: Activity,      color: "bg-violet-50 text-violet-600" },
  { key: "goodQuality", labelKey: "Good Quality",       icon: TrendingUp,    color: "bg-green-50 text-green-600", suffix: "%" },
  { key: "poorQuality", labelKey: "Poor Quality Issues",icon: AlertTriangle, color: "bg-red-50 text-red-600" },
];

export default function AdminStats({ stats }) {
  const { t } = useLang();
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      {STATS.map(({ key, labelKey, icon: IconComp, color, suffix = "" }) => (
        <Card key={key} className="border-slate-200/60 hover:shadow-md transition-shadow">
          <CardContent className="pt-5 pb-5">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${color}`}>
              <IconComp className="w-5 h-5" />
            </div>
            <p className="text-3xl font-bold text-slate-900 mb-1">{stats[key] ?? 0}{suffix}</p>
            <p className="text-xs text-slate-600 leading-tight font-medium">{t[labelKey]}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
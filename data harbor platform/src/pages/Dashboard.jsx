import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { useLang } from "@/components/LanguageContext";
import { Database, FileText, ShieldCheck, Layers, Sparkles } from "lucide-react";
import { useState, useEffect } from "react";
import KPICard from "../components/dashboard/KPICard";
import { DepartmentChart, CategoryPieChart, QualityOverviewChart, TrendLineChart } from "../components/dashboard/DashboardCharts";
import RecentActivity from "../components/dashboard/RecentActivity";
import RecentDatasets from "../components/dashboard/RecentDatasets";
import EmptyState from "../components/dashboard/EmptyState";
function SkeletonCard({ className = "" }) {
  return <div className={`shimmer ${className}`} />;
}

export default function Dashboard() {
  const { t } = useLang();
  const [user, setUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setUser);
  }, []);

  const { data: datasets = [], isLoading: loadingDs } = useQuery({
    queryKey: ["datasets", user?.email],
    queryFn: () => base44.entities.Dataset.list("-created_date", 200),
    enabled: !!user,
  });
  const { data: qualityResults = [], isLoading: loadingQr } = useQuery({
    queryKey: ["quality", user?.email],
    queryFn: () => base44.entities.QualityResult.list("-created_date", 100),
    enabled: !!user,
  });
  const { data: activities = [], isLoading: loadingAct } = useQuery({
    queryKey: ["activities", user?.email],
    queryFn: () => base44.entities.ActivityLog.filter({ user_email: user?.email }, "-created_date", 20),
    enabled: !!user,
  });

  const userDatasets = datasets.filter(d => d.created_by === user?.email && !d.isDemo);
  const userQuality = qualityResults.filter(q => {
    const dataset = datasets.find(d => d.id === q.dataset_id);
    return dataset && dataset.created_by === user?.email && !dataset.isDemo;
  });
  const demoDatasets = datasets.filter(d => d.isDemo);

  const totalRows   = userDatasets.reduce((acc, d) => acc + (d.row_count || 0), 0);
  const avgQuality  = userQuality.length > 0
    ? (userQuality.reduce((a, q) => a + (q.quality_score || 0), 0) / userQuality.length).toFixed(1)
    : 0;
  const goodCount   = userQuality.filter(q => q.quality_status === "Good").length;
  const qualityRate = userQuality.length > 0 ? Math.round((goodCount / userQuality.length) * 100) : 0;
  const isLoading   = loadingDs || loadingQr || loadingAct || !user;

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <SkeletonCard className="h-24 rounded-2xl" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <SkeletonCard key={i} className="h-28 rounded-2xl" />)}
        </div>
        <div className="grid lg:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => <SkeletonCard key={i} className="h-72 rounded-2xl" />)}
        </div>
      </div>
    );
  }

  if (userDatasets.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="space-y-6">
      {/* Hero banner */}
      <div className="bg-gradient-to-br from-slate-800 via-teal-700 to-slate-900 rounded-3xl p-8 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{backgroundImage:"radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)", backgroundSize:"40px 40px"}} />
        <div className="relative">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-5 h-5 text-teal-200" />
            <span className="text-xs font-bold text-teal-200 uppercase tracking-widest">{t["Data Overview"]}</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-3">{t["Welcome to DataHarbor"]}</h1>
          <p className="text-base text-slate-200 leading-relaxed max-w-2xl">
            {t["Your organization has"]} <span className="text-white font-semibold">{userDatasets.length} {t["datasets"]}</span> {t["with"]}{" "}
            <span className="text-white font-semibold">{totalRows.toLocaleString()} {t["records"]}</span> — {t["avg quality"]}{" "}
            <span className="text-teal-300 font-bold text-lg">{avgQuality}%</span>
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard title={t["Total Datasets"]}   value={userDatasets.length}           icon={Database}    trend={`${userDatasets.filter(d => d.status === "Active").length} ${t["active"]}`}   trendUp color="teal" />
        <KPICard title={t["Total Records"]}    value={totalRows.toLocaleString()} icon={Layers}      trend={`${t["Across"]} ${userDatasets.filter(d => d.row_count).length} ${t["datasets"]}`}    trendUp color="blue" />
        <KPICard title={t["Avg Quality Score"]} value={`${avgQuality}%`}          icon={ShieldCheck} trend={`${qualityRate}% ${t["rated Good"]}`}                                     trendUp={qualityRate >= 50} color="emerald" />
        <KPICard title={t["Quality Reports"]}  value={userQuality.length}     icon={FileText}    trend={`${userQuality.filter(q => q.quality_status === "Poor Quality").length} ${t["need attention"]}`} color="violet" />
      </div>

      {/* Charts row 1 */}
      <div className="grid lg:grid-cols-2 gap-4">
        <DepartmentChart datasets={userDatasets} />
        <CategoryPieChart datasets={userDatasets} />
      </div>

      {/* Charts row 2 */}
      <div className="grid lg:grid-cols-2 gap-4">
        <QualityOverviewChart qualityResults={userQuality} />
        <TrendLineChart datasets={userDatasets} qualityResults={userQuality} />
      </div>

      {/* Recent data */}
      <div className="grid lg:grid-cols-2 gap-4">
        <RecentDatasets datasets={userDatasets} />
        <RecentActivity activities={activities} />
      </div>
    </div>
  );
}
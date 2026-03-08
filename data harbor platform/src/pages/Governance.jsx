import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { useLang } from "@/components/LanguageContext";
import { Database, Layers, ShieldCheck, AlertTriangle, CheckCircle2, Clock, XCircle } from "lucide-react";
import KPICard from "../components/dashboard/KPICard";
import {
  QualityDistributionChart,
  DepartmentBarChart,
  CategoryBarChart,
  MissingMetadataChart,
} from "../components/governance/GovernanceCharts";

function SkeletonCard({ className = "" }) {
  return <div className={`shimmer ${className}`} />;
}

const REQUIRED_FIELDS = ["description", "owner", "tags", "region", "source", "data_sensitivity"];

export default function Governance() {
  const { t } = useLang();
  const [user, setUser] = React.useState(null);

  React.useEffect(() => {
    base44.auth.me().then(setUser);
  }, []);

  const { data: datasets = [], isLoading: loadingDs } = useQuery({
    queryKey: ["datasets", user?.id],
    queryFn: () => base44.entities.Dataset.list("-created_date", 200),
    enabled: !!user,
    refetchInterval: 30000,
  });
  const { data: qualityResults = [], isLoading: loadingQr } = useQuery({
    queryKey: ["quality", user?.id],
    queryFn: () => base44.entities.QualityResult.list("-created_date", 200),
    enabled: !!user,
    refetchInterval: 30000,
  });

  // Filter datasets: admins see all, users see only their own non-demo datasets
  const filteredDatasets = user?.role === 'admin' 
    ? datasets 
    : datasets.filter(d => d.created_by === user?.email && !d.isDemo);
  
  const filteredQuality = qualityResults.filter(q => {
    const dataset = datasets.find(d => d.id === q.dataset_id);
    return dataset && (user?.role === 'admin' ? true : dataset.created_by === user?.email && !dataset.isDemo);
  });

  const isLoading = loadingDs || loadingQr || !user;

  // ── KPI calculations ────────────────────────────────────────────────
  const totalRecords     = filteredDatasets.reduce((acc, d) => acc + (d.row_count || 0), 0);
  const goodCount        = filteredQuality.filter(q => q.quality_status === "Good").length;
  const needsReviewCount = filteredQuality.filter(q => q.quality_status === "Needs Review").length;
  const poorCount        = filteredQuality.filter(q => q.quality_status === "Poor Quality").length;

  const missingMetaDatasets = filteredDatasets.filter(d =>
    REQUIRED_FIELDS.some(f => !d[f])
  ).length;

  const completeDatasets = filteredDatasets.filter(d =>
    REQUIRED_FIELDS.every(f => !!d[f])
  ).length;

  const metadataCompleteness = filteredDatasets.length > 0
    ? Math.round((completeDatasets / filteredDatasets.length) * 100)
    : 0;

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <SkeletonCard className="h-20 rounded-2xl" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <SkeletonCard key={i} className="h-28 rounded-2xl" />)}
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <SkeletonCard key={i} className="h-28 rounded-2xl" />)}
        </div>
        <div className="grid lg:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => <SkeletonCard key={i} className="h-72 rounded-2xl" />)}
        </div>
      </div>
    );
  }

  if (filteredDatasets.length === 0) {
    return (
      <div className="text-center py-16">
        <Database className="w-12 h-12 text-slate-300 mx-auto mb-4" />
        <h2 className="text-lg font-semibold text-slate-700 mb-2">{t["No datasets yet"]}</h2>
        <p className="text-sm text-slate-500">{t["Upload your first dataset to start using the governance dashboard"]}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-800 to-teal-800 rounded-2xl p-6 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5" style={{ backgroundImage: "radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
        <div className="relative">
          <div className="flex items-center gap-2 mb-1">
            <ShieldCheck className="w-4 h-4 text-teal-300" />
            <span className="text-xs font-semibold text-teal-300 uppercase tracking-widest">{t["Data Governance"]}</span>
          </div>
          <h1 className="text-2xl font-bold text-white">{t["Governance Dashboard"]}</h1>
           <p className="text-sm text-slate-300 mt-1">
             {t["Monitor quality, metadata completeness, and catalog health across"]}{" "}
             <span className="text-white font-semibold">{filteredDatasets.length} {t["datasets"]}</span> {t["with"]}{" "}
             <span className="text-teal-300 font-semibold">{totalRecords.toLocaleString()} {t["records"]}</span>.
           </p>
        </div>
      </div>

      {/* Row 1 — Catalog KPIs */}
      <div>
        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3">{t["Catalog Overview"]}</p>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard
             title={t["Total Datasets"]}
             value={filteredDatasets.length}
             icon={Database}
             trend={`${filteredDatasets.filter(d => d.status === "Active").length} ${t["active"]}`}
             trendUp
             color="teal"
           />
           <KPICard
             title={t["Total Records"]}
             value={totalRecords.toLocaleString()}
             icon={Layers}
             trend={`${t["Across"]} ${filteredDatasets.filter(d => d.row_count).length} ${t["datasets"]}`}
             trendUp
             color="blue"
           />
           <KPICard
             title={t["Metadata Complete"]}
             value={`${metadataCompleteness}%`}
             icon={CheckCircle2}
             trend={`${completeDatasets} ${t["fully complete"]}`}
             trendUp={metadataCompleteness >= 70}
             color={metadataCompleteness >= 70 ? "emerald" : "amber"}
           />
           <KPICard
             title={t["Missing Metadata"]}
             value={missingMetaDatasets}
             icon={AlertTriangle}
             trend={`${filteredDatasets.length - missingMetaDatasets} ${t["datasets OK"]}`}
             trendUp={missingMetaDatasets === 0}
             color={missingMetaDatasets === 0 ? "emerald" : "rose"}
           />
        </div>
      </div>

      {/* Row 2 — Quality KPIs */}
      <div>
        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3">{t["Quality Health"]}</p>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard
             title={t["Quality Reports"]}
             value={filteredQuality.length}
             icon={ShieldCheck}
             trend={`${filteredDatasets.length - filteredQuality.length} ${t["not analyzed"]}`}
             trendUp={filteredQuality.length === filteredDatasets.length}
             color="violet"
           />
           <KPICard
             title={t["Good Quality"]}
             value={goodCount}
             icon={CheckCircle2}
             trend={filteredQuality.length > 0 ? `${Math.round((goodCount / filteredQuality.length) * 100)}% ${t["of analyzed"]}` : "—"}
             trendUp
             color="emerald"
           />
           <KPICard
             title={t["Needs Review"]}
             value={needsReviewCount}
             icon={Clock}
             trend={filteredQuality.length > 0 ? `${Math.round((needsReviewCount / filteredQuality.length) * 100)}% ${t["of analyzed"]}` : "—"}
             trendUp={needsReviewCount === 0}
             color="amber"
           />
           <KPICard
             title={t["Poor Quality"]}
             value={poorCount}
             icon={XCircle}
             trend={poorCount > 0 ? t["Needs immediate action"] : t["All clear"]}
             trendUp={poorCount === 0}
             color={poorCount === 0 ? "emerald" : "rose"}
           />
        </div>
      </div>

      {/* Charts row 1 */}
      <div className="grid lg:grid-cols-2 gap-4">
        <QualityDistributionChart qualityResults={filteredQuality} />
        <MissingMetadataChart datasets={filteredDatasets} />
      </div>

      {/* Charts row 2 */}
      <div className="grid lg:grid-cols-2 gap-4">
        <DepartmentBarChart datasets={filteredDatasets} />
        <CategoryBarChart datasets={filteredDatasets} />
      </div>
    </div>
  );
}
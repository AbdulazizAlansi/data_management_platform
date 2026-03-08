import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Database, ArrowRight, BarChart3, Cpu, AlertCircle, GitBranch } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { createPageUrl } from "@/utils";
import { useNavigate } from "react-router-dom";

// ── Stage config ─────────────────────────────────────────────────────────────
const STAGES = [
  { id: "source",     label: "Source",     icon: Database,  color: "bg-blue-500",    light: "bg-blue-50",    border: "border-blue-200",    text: "text-blue-700"    },
  { id: "processing", label: "Processing", icon: Cpu,       color: "bg-violet-500",  light: "bg-violet-50",  border: "border-violet-200",  text: "text-violet-700"  },
  { id: "final",      label: "Final",      icon: Database,  color: "bg-teal-500",    light: "bg-teal-50",    border: "border-teal-200",    text: "text-teal-700"    },
  { id: "analytics",  label: "Analytics",  icon: BarChart3, color: "bg-emerald-500", light: "bg-emerald-50", border: "border-emerald-200", text: "text-emerald-700" },
];

const CATEGORY_STAGE = {
  Financial:   "source",
  HR:          "source",
  Compliance:  "source",
  Research:    "source",
  Operations:  "processing",
  Customer:    "processing",
  Marketing:   "processing",
  Sales:       "final",
  Product:     "final",
  Other:       "final",
};

function getStageForDataset(dataset) {
  return CATEGORY_STAGE[dataset.category] || "final";
}

// ── Node card ─────────────────────────────────────────────────────────────────
function LineageNode({ dataset, stage, isCurrent, qualityMap, onClick }) {
  const s = STAGES.find(x => x.id === stage) || STAGES[2];
  const quality = qualityMap[dataset.id];
  const qualityColor = !quality ? "text-slate-400"
    : quality.quality_score >= 85 ? "text-emerald-600"
    : quality.quality_score >= 70 ? "text-amber-500"
    : "text-red-500";

  return (
    <button
      onClick={() => onClick(dataset)}
      className={`
        group relative flex flex-col gap-2 p-4 rounded-xl border-2 text-left w-48 transition-all duration-200
        hover:shadow-lg hover:-translate-y-0.5
        ${isCurrent
          ? `${s.border} ${s.light} shadow-md ring-2 ring-offset-2 ring-offset-white ${s.border.replace("border-", "ring-")}`
          : "border-slate-200 bg-white hover:border-slate-300"}
      `}
    >
      {isCurrent && (
        <span className={`absolute -top-2 left-3 text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full ${s.color} text-white`}>
          Current
        </span>
      )}
      <div className={`w-8 h-8 rounded-lg ${s.light} flex items-center justify-center`}>
        <s.icon className={`w-4 h-4 ${s.text}`} />
      </div>
      <div className="min-w-0">
        <p className="text-[13px] font-semibold text-slate-800 truncate leading-tight">{dataset.name}</p>
        <p className="text-[11px] text-slate-400 mt-0.5">{dataset.department || "—"}</p>
      </div>
      <div className="flex items-center justify-between mt-1">
        <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${s.border} ${s.text}`}>{dataset.category || "Other"}</Badge>
        {quality && (
          <span className={`text-[11px] font-bold ${qualityColor}`}>{quality.quality_score}%</span>
        )}
      </div>
    </button>
  );
}

// ── Arrow connector ───────────────────────────────────────────────────────────
function Arrow({ label }) {
  return (
    <div className="flex flex-col items-center gap-1 shrink-0">
      <div className="flex items-center gap-0.5 text-slate-300">
        <div className="w-8 h-0.5 bg-slate-300" />
        <ArrowRight className="w-4 h-4 text-slate-400" />
      </div>
      {label && <span className="text-[9px] font-semibold text-slate-400 uppercase tracking-widest">{label}</span>}
    </div>
  );
}

// ── Stage column ─────────────────────────────────────────────────────────────
function StageColumn({ stage, nodes, isCurrent, qualityMap, onNodeClick }) {
  const s = STAGES.find(x => x.id === stage);
  if (!s) return null;
  return (
    <div className="flex flex-col items-center gap-3">
      <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full ${s.light} border ${s.border}`}>
        <s.icon className={`w-3.5 h-3.5 ${s.text}`} />
        <span className={`text-[11px] font-bold ${s.text}`}>{s.label}</span>
      </div>
      <div className="flex flex-col gap-3">
        {nodes.length === 0 ? (
          <div className="w-48 h-20 rounded-xl border-2 border-dashed border-slate-200 flex items-center justify-center">
            <span className="text-xs text-slate-300">No datasets</span>
          </div>
        ) : nodes.map(ds => (
          <LineageNode
            key={ds.id}
            dataset={ds}
            stage={stage}
            isCurrent={isCurrent(ds.id)}
            qualityMap={qualityMap}
            onClick={onNodeClick}
          />
        ))}
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function DataLineage({ dataset }) {
  const navigate = useNavigate();

  const { data: allDatasets = [] } = useQuery({
    queryKey: ["datasets"],
    queryFn: () => base44.entities.Dataset.list("-created_date", 200),
  });

  const { data: allQuality = [] } = useQuery({
    queryKey: ["quality"],
    queryFn: () => base44.entities.QualityResult.list("-created_date", 200),
  });

  const qualityMap = {};
  allQuality.forEach(q => { qualityMap[q.dataset_id] = q; });

  // Group all datasets into stages
  const stageMap = { source: [], processing: [], final: [], analytics: [] };
  allDatasets.forEach(ds => {
    const stage = getStageForDataset(ds);
    stageMap[stage].push(ds);
  });

  // The current dataset's stage
  const currentStage = getStageForDataset(dataset);

  // Related datasets: same department or same category (excluding current)
  const related = allDatasets.filter(ds =>
    ds.id !== dataset.id && (ds.department === dataset.department || ds.category === dataset.category)
  ).slice(0, 6);

  // Build a focused view: show the current dataset plus related datasets slotted into stages
  const focusedStageMap = { source: [], processing: [], final: [], analytics: [] };
  [dataset, ...related].forEach(ds => {
    const stage = getStageForDataset(ds);
    if (!focusedStageMap[stage].find(x => x.id === ds.id)) {
      focusedStageMap[stage].push(ds);
    }
  });

  // Ensure current dataset always appears
  if (!focusedStageMap[currentStage].find(x => x.id === dataset.id)) {
    focusedStageMap[currentStage].unshift(dataset);
  }

  const handleNodeClick = (ds) => {
    navigate(createPageUrl(`Insights?id=${ds.id}`));
  };

  const stages = ["source", "processing", "final", "analytics"];
  const arrowLabels = ["Ingestion", "Transform", "Publish"];

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-xl bg-violet-50 flex items-center justify-center shrink-0">
          <GitBranch className="w-5 h-5 text-violet-600" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-slate-800">Data Lineage</h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Visual flow of how datasets move through the pipeline. Showing datasets related to <span className="font-medium text-slate-600">{dataset.name}</span>.
          </p>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3">
        {STAGES.map(s => (
          <div key={s.id} className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg ${s.light} border ${s.border}`}>
            <s.icon className={`w-3 h-3 ${s.text}`} />
            <span className={`text-[11px] font-medium ${s.text}`}>{s.label}</span>
            <span className="text-[10px] text-slate-400 ml-0.5">({(focusedStageMap[s.id] || []).length})</span>
          </div>
        ))}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200 ml-auto">
          <AlertCircle className="w-3 h-3 text-slate-400" />
          <span className="text-[11px] text-slate-500">Click any node to open dataset</span>
        </div>
      </div>

      {/* Flow diagram */}
      <div className="overflow-x-auto pb-2">
        <div className="flex items-start gap-3 min-w-max px-2">
          {stages.map((stageId, idx) => (
            <React.Fragment key={stageId}>
              <StageColumn
                stage={stageId}
                nodes={focusedStageMap[stageId] || []}
                isCurrent={(id) => id === dataset.id}
                qualityMap={qualityMap}
                onNodeClick={handleNodeClick}
              />
              {idx < stages.length - 1 && (
                <div className="flex items-center self-center mt-8">
                  <Arrow label={arrowLabels[idx]} />
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Current dataset summary */}
      <div className={`rounded-xl border-2 p-4 ${
        currentStage === "source"     ? "border-blue-200 bg-blue-50" :
        currentStage === "processing" ? "border-violet-200 bg-violet-50" :
        currentStage === "final"      ? "border-teal-200 bg-teal-50" :
                                        "border-emerald-200 bg-emerald-50"
      }`}>
        <p className="text-xs font-semibold text-slate-600 mb-1">About this dataset's position in the pipeline</p>
        <p className="text-xs text-slate-500">
          <span className="font-semibold text-slate-700">{dataset.name}</span> is classified as a{" "}
          <span className="font-semibold">{STAGES.find(s => s.id === currentStage)?.label}</span> dataset
          {dataset.source ? ` sourced from "${dataset.source}"` : ""}.
          {dataset.update_frequency ? ` It is updated ${dataset.update_frequency.toLowerCase()}.` : ""}
          {related.length > 0
            ? ` There are ${related.length} related dataset(s) in the same department or category.`
            : " No related datasets found in the same department or category."}
        </p>
      </div>
    </div>
  );
}
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useLang } from "@/components/LanguageContext";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Download, Database, Plus } from "lucide-react";
import { createPageUrl } from "@/utils";
import DatasetHero from "../components/insights/DatasetHero";
import DatasetStats from "../components/insights/DatasetStats";
import DatasetCharts from "../components/insights/DatasetCharts";
import QualityReport from "../components/insights/QualityReport";
import MetadataCard from "../components/insights/MetadataCard";
import SampleDataTable from "../components/insights/SampleDataTable";
import ColumnProfiler from "../components/insights/ColumnProfiler";
import DataPreview from "../components/insights/DataPreview";
import VersionHistory from "../components/insights/VersionHistory";
import DataLineage from "../components/insights/DataLineage";

export default function Insights() {
  const navigate = useNavigate();
  const { t } = useLang();
  const [user, setUser] = useState(null);
  const params = new URLSearchParams(window.location.search);
  const datasetId = params.get("id");

  useEffect(() => {
    base44.auth.me().then(setUser);
  }, []);

  const { data: dataset, isLoading: loadingDataset } = useQuery({
    queryKey: ["dataset", datasetId, user?.email],
    queryFn: () => base44.entities.Dataset.filter({ id: datasetId }).then(r => r[0]),
    enabled: !!datasetId && !!user,
  });

  const { data: quality } = useQuery({
    queryKey: ["quality", datasetId],
    queryFn: () => base44.entities.QualityResult.filter({ dataset_id: datasetId }).then(r => r[0] || null),
    enabled: !!datasetId,
  });

  if (!datasetId) {
    return (
      <div className="flex flex-col items-center justify-center py-40 gap-5">
        <div className="w-16 h-16 rounded-2xl bg-teal-50 flex items-center justify-center">
          <Database className="w-8 h-8 text-teal-500" />
        </div>
        <div className="text-center">
          <h2 className="text-lg font-semibold text-slate-800 mb-1">{t["No dataset selected"]}</h2>
          <p className="text-sm text-slate-400">{t["Select an existing dataset to explore its insights, or upload a new one."]}</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => navigate(createPageUrl("Datasets"))}>
            <ArrowLeft className="w-4 h-4 mr-2" /> {t["Browse Datasets"]}
          </Button>
          <Button className="bg-teal-600 hover:bg-teal-700 text-white" onClick={() => navigate(createPageUrl("Datasets"))}>
            <Database className="w-4 h-4 mr-2" /> {t["Select a Dataset"]}
          </Button>
        </div>
      </div>
    );
  }

  if (loadingDataset) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-36 rounded-2xl" />
        <div className="grid grid-cols-4 gap-3">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
        </div>
        <Skeleton className="h-64 rounded-xl" />
      </div>
    );
  }

  if (!dataset || (user && dataset.created_by !== user.email)) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-4">
        <p className="text-slate-500">{t["Dataset not found."]}</p>
        <Button variant="outline" onClick={() => navigate(createPageUrl("Datasets"))}>
          <ArrowLeft className="w-4 h-4 mr-2" /> {t["Back to Datasets"]}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Back + Download */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={() => navigate(createPageUrl("Datasets"))} className="text-slate-500 hover:text-slate-800 -ml-2">
          <ArrowLeft className="w-4 h-4 mr-1.5" /> {t["Back to Datasets"]}
        </Button>
        {dataset.file_url && (
          <Button variant="outline" size="sm" onClick={() => window.open(dataset.file_url, "_blank")}>
            <Download className="w-4 h-4 mr-1.5" /> {t["Download File"]}
          </Button>
        )}
      </div>

      <DatasetHero dataset={dataset} quality={quality} />
      <DatasetStats dataset={dataset} quality={quality} />

      <Tabs defaultValue="preview">
        <TabsList className="bg-slate-100">
          <TabsTrigger value="preview">{t["Data Preview"]}</TabsTrigger>
          <TabsTrigger value="charts">{t["Charts"]}</TabsTrigger>
          <TabsTrigger value="quality">{t["Quality Report"]}</TabsTrigger>
          <TabsTrigger value="columns">{t["Column Profiles"]}</TabsTrigger>
          <TabsTrigger value="sample">{t["Sample Data"]}</TabsTrigger>
          <TabsTrigger value="metadata">{t["Metadata"]}</TabsTrigger>
          <TabsTrigger value="versions">{t["Versions"]}</TabsTrigger>
          <TabsTrigger value="lineage">{t["Data Lineage"]}</TabsTrigger>
        </TabsList>

        <TabsContent value="preview" className="mt-4">
          <DataPreview dataset={dataset} />
        </TabsContent>
        <TabsContent value="charts" className="mt-4">
          <DatasetCharts dataset={dataset} />
        </TabsContent>
        <TabsContent value="quality" className="mt-4">
          <QualityReport quality={quality} dataset={dataset} />
        </TabsContent>
        <TabsContent value="columns" className="mt-4">
          <ColumnProfiler dataset={dataset} quality={quality} />
        </TabsContent>
        <TabsContent value="sample" className="mt-4">
          <SampleDataTable dataset={dataset} />
        </TabsContent>
        <TabsContent value="metadata" className="mt-4">
          <MetadataCard dataset={dataset} />
        </TabsContent>
        <TabsContent value="versions" className="mt-4">
          <VersionHistory dataset={dataset} />
        </TabsContent>
        <TabsContent value="lineage" className="mt-4">
          <DataLineage dataset={dataset} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
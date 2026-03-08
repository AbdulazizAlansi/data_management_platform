import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLang } from "@/components/LanguageContext";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import DatasetFilters from "../components/datasets/DatasetFilters";
import DatasetTable from "../components/datasets/DatasetTable";
import DatasetFormDialog from "../components/datasets/DatasetFormDialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function Datasets() {
  const { t } = useLang();
  const [user, setUser] = useState(null);
  const [filters, setFilters] = useState({ search: "", category: "", department: "", owner: "", region: "", quality: "", dateRange: "" });
  const [sort, setSort] = useState({ field: "created_date", dir: "desc" });
  const [showForm, setShowForm] = useState(false);
  const [editingDataset, setEditingDataset] = useState(null);
  const [deletingDataset, setDeletingDataset] = useState(null);
  const qc = useQueryClient();

  useEffect(() => {
    base44.auth.me().then(setUser);
  }, []);

  const { data: datasets = [], isLoading } = useQuery({
    queryKey: ["datasets", user?.id],
    queryFn: () => base44.entities.Dataset.list("-created_date", 200),
    enabled: !!user,
  });
  const { data: qualityResults = [] } = useQuery({
    queryKey: ["quality", user?.id],
    queryFn: () => base44.entities.QualityResult.list("-created_date", 200),
    enabled: !!user,
  });

  const createMutation = useMutation({
    mutationFn: ({ data, quality, fileInfo }) => base44.entities.Dataset.create(data).then(newDs => ({ newDs, quality, fileInfo })),
    onSuccess: async ({ newDs, quality, fileInfo }) => {
      qc.invalidateQueries({ queryKey: ["datasets"] });
      qc.invalidateQueries({ queryKey: ["quality"] });
      const user = await base44.auth.me();
      const promises = [
        base44.entities.ActivityLog.create({
          action: "Dataset Uploaded",
          description: `Uploaded dataset "${newDs.name}"`,
          user_email: user.email,
          user_id: user.id,
          user_name: user.full_name,
          dataset_id: newDs.id,
          dataset_name: newDs.name,
          ownerUserId: newDs.ownerUserId,
        }),
        base44.entities.DatasetVersion.create({
          dataset_id: newDs.id,
          dataset_name: newDs.name,
          ownerUserId: newDs.ownerUserId,
          version_number: 1,
          file_url: newDs.file_url || null,
          file_name: fileInfo?.file?.name || newDs.format || null,
          file_type: newDs.file_type || null,
          row_count: newDs.row_count || null,
          column_count: newDs.column_count || null,
          uploaded_by_email: user.email,
          uploaded_by_name: user.full_name,
          changes_summary: "Initial upload",
          is_active: true,
        }),
      ];
      if (quality) {
        promises.push(
          base44.entities.QualityResult.create({
            dataset_id: newDs.id,
            dataset_name: newDs.name,
            ownerUserId: newDs.ownerUserId,
            ...quality,
          })
        );
      }
      await Promise.all(promises);
      toast.success("Dataset uploaded successfully");
      setShowForm(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data, fileInfo, existingDataset }) =>
      base44.entities.Dataset.update(id, data).then(updated => ({ updated, fileInfo, existingDataset })),
    onSuccess: async ({ updated, fileInfo, existingDataset }) => {
      qc.invalidateQueries({ queryKey: ["datasets"] });
      // If a new file was uploaded, create a new version and update quality result
      if (fileInfo?.file) {
        const user = await base44.auth.me();
        const [existingVersions, existingQuality] = await Promise.all([
          base44.entities.DatasetVersion.filter({ dataset_id: existingDataset.id }, "-version_number", 1),
          base44.entities.QualityResult.filter({ dataset_id: existingDataset.id }, "-created_date", 1),
        ]);
        const nextVersion = (existingVersions[0]?.version_number || 1) + 1;
        const prevStats = existingVersions[0];
        const newStats = fileInfo.parsedStats;
        const changes = [];
        if (prevStats && newStats) {
          if (newStats.row_count !== prevStats.row_count) changes.push(`Rows: ${prevStats.row_count ?? "?"} → ${newStats.row_count}`);
          if (newStats.column_count !== prevStats.column_count) changes.push(`Columns: ${prevStats.column_count ?? "?"} → ${newStats.column_count}`);
        }

        const versionPromise = base44.entities.DatasetVersion.create({
          dataset_id: existingDataset.id,
          dataset_name: existingDataset.name,
          ownerUserId: existingDataset.ownerUserId,
          version_number: nextVersion,
          file_url: updated.file_url || null,
          file_name: fileInfo.file.name,
          file_type: updated.file_type || null,
          row_count: updated.row_count || null,
          column_count: updated.column_count || null,
          uploaded_by_email: user.email,
          uploaded_by_name: user.full_name,
          changes_summary: changes.length > 0 ? changes.join("; ") : "File replaced",
          is_active: true,
        });

        const qualityData = newStats?.quality;
        let qualityPromise = null;
        if (qualityData) {
          const payload = {
            dataset_id: existingDataset.id,
            dataset_name: existingDataset.name,
            ownerUserId: existingDataset.ownerUserId,
            row_count: newStats.row_count,
            column_count: newStats.column_count,
            ...qualityData,
          };
          if (existingQuality[0]?.id) {
            qualityPromise = base44.entities.QualityResult.update(existingQuality[0].id, payload);
          } else {
            qualityPromise = base44.entities.QualityResult.create(payload);
          }
        }

        await Promise.all([versionPromise, qualityPromise].filter(Boolean));
        qc.invalidateQueries({ queryKey: ["versions", existingDataset.id] });
        qc.invalidateQueries({ queryKey: ["quality"] });
      }
      toast.success("Dataset updated");
      setEditingDataset(null);
      setShowForm(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Dataset.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["datasets"] });
      toast.success("Dataset deleted");
      setDeletingDataset(null);
    },
  });

  const handleSave = async (formData, quality, fileInfo) => {
    if (editingDataset) {
      await updateMutation.mutateAsync({ id: editingDataset.id, data: formData, fileInfo, existingDataset: editingDataset });
    } else {
      await createMutation.mutateAsync({ data: formData, quality, fileInfo });
    }
  };

  const handleSort = (field) => {
    setSort(prev => prev.field === field
      ? { field, dir: prev.dir === "asc" ? "desc" : "asc" }
      : { field, dir: "asc" }
    );
  };

  const userDatasets = datasets.filter(d => d.created_by === user?.email && !d.isDemo);

  const filtered = userDatasets.filter((d) => {
    const q = filters.search.toLowerCase().trim();
    if (q) {
      const haystack = [d.name, d.tags, d.owner, d.department, d.description]
        .map(v => (v || "").toLowerCase()).join(" ");
      if (!haystack.includes(q)) return false;
    }
    if (filters.category   && d.category   !== filters.category)   return false;
    if (filters.department && d.department !== filters.department) return false;
    if (filters.region     && d.region     !== filters.region)     return false;
    if (filters.owner      && d.owner      !== filters.owner)      return false;
    if (filters.quality) {
      const qr = qualityResults.find(r => r.dataset_id === d.id);
      if (!qr || qr.quality_status !== filters.quality) return false;
    }
    if (filters.dateRange) {
      const days = { "7d": 7, "30d": 30, "90d": 90, "1y": 365 }[filters.dateRange];
      const cutoff = new Date(Date.now() - days * 86400000);
      if (new Date(d.created_date) < cutoff) return false;
    }
    return true;
  });

  const sorted = [...filtered].sort((a, b) => {
    const av = a[sort.field] ?? "";
    const bv = b[sort.field] ?? "";
    const cmp = typeof av === "number" && typeof bv === "number"
      ? av - bv
      : String(av).localeCompare(String(bv));
    return sort.dir === "asc" ? cmp : -cmp;
  });

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{t["Datasets"]}</h1>
          <p className="text-sm text-slate-500 mt-0.5">{userDatasets.length} {t["datasets in total"]}</p>
        </div>
        <Button className="bg-teal-600 hover:bg-teal-700" onClick={() => { setEditingDataset(null); setShowForm(true); }}>
          <Plus className="w-4 h-4 me-2" /> {t["Upload Dataset"]}
        </Button>
      </div>

      <DatasetFilters
        filters={filters}
        setFilters={setFilters}
        datasets={userDatasets}
        resultCount={sorted.length}
        totalCount={userDatasets.length}
      />

      {isLoading ? (
        <div className="space-y-2">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-14 rounded-lg" />)}</div>
      ) : (
        <DatasetTable
          datasets={sorted}
          onEdit={(d) => { setEditingDataset(d); setShowForm(true); }}
          onDelete={(d) => setDeletingDataset(d)}
          sort={sort}
          onSort={handleSort}
        />
      )}

      <DatasetFormDialog
        open={showForm}
        onClose={() => { setShowForm(false); setEditingDataset(null); }}
        dataset={editingDataset}
        onSave={handleSave}
      />

      <AlertDialog open={!!deletingDataset} onOpenChange={() => setDeletingDataset(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Dataset</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deletingDataset?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-red-600 hover:bg-red-700" onClick={() => deleteMutation.mutate(deletingDataset.id)}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
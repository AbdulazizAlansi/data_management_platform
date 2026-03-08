import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Upload, CheckCircle2, FileText, X } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { parseDatasetFile } from "./parseDatasetFile";
import { useOrgConfig } from "@/components/useOrgConfig";

const STATUSES = ["Active", "Archived", "Draft", "Under Review"];
const SENSITIVITIES = ["Public", "Internal", "Confidential", "Restricted"];
const FREQUENCIES = ["Real-time", "Daily", "Weekly", "Monthly", "Quarterly", "Annually", "Ad-hoc"];

export default function DatasetFormDialog({ open, onClose, dataset, onSave }) {
  const { departments, categories, regions, tags: orgTags } = useOrgConfig();
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState(null);
  const [parsedStats, setParsedStats] = useState(null);

  useEffect(() => {
    if (dataset) {
      setForm({ ...dataset });
    } else {
      setForm({ status: "Active", data_sensitivity: "Internal", region: "Global", language: "English" });
    }
    setFile(null);
    setParsedStats(null);
  }, [dataset, open]);

  const handleFileUpload = async (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setFile(f);
    setParsedStats(null);
    setUploading(true);
    const fileType = f.name.endsWith(".csv") ? "CSV" : f.name.endsWith(".xlsx") || f.name.endsWith(".xls") ? "Excel" : "JSON";
    try {
      // Run upload and parse in parallel — parse MUST succeed for quality to be saved
      const [uploadResult, stats] = await Promise.all([
        base44.integrations.Core.UploadFile({ file: f }),
        parseDatasetFile(f),
      ]);

      if (!stats) {
        console.error("[DataHarbor] parseDatasetFile returned null — unsupported or empty file:", f.name);
      } else {
        console.log("[DataHarbor] Parsed file:", f.name, "rows:", stats.row_count, "cols:", stats.column_count, "quality:", stats.quality?.quality_score);
      }

      const file_url = uploadResult?.file_url;
      setParsedStats(stats);  // null if parse failed — will be stored as "failed" in QualityResult
      setForm(prev => ({
        ...prev,
        file_url,
        file_type: fileType,
        format: f.name,
        ...(stats ? {
          row_count: stats.row_count,
          column_count: stats.column_count,
          columns_info: stats.columns_info,
          sample_rows: stats.sample_rows,
        } : {}),
      }));
    } catch (err) {
      console.error("[DataHarbor] File upload/parse error:", err);
      setParsedStats(null);
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    const user = await base44.auth.me();
    const formData = { ...form, ownerUserId: user.id };

    let qualityPayload = null;
    if (file) {
      // A file was selected
      if (parsedStats?.quality) {
        // Parse succeeded — use real metrics
        qualityPayload = {
          ...parsedStats.quality,
          row_count: parsedStats.row_count,
          column_count: parsedStats.column_count,
          analysis_failed: false,
          analyzed_file_name: file.name,
          analysis_timestamp: new Date().toISOString(),
        };
        console.log("[DataHarbor] Saving quality payload:", qualityPayload);
      } else {
        // Parse failed — store explicit failure marker so UI can show error
        qualityPayload = {
          analysis_failed: true,
          quality_score: 0,
          quality_status: "Poor Quality",
          missing_values: 0,
          duplicate_rows: 0,
          empty_columns: 0,
          invalid_dates: 0,
          invalid_numerics: 0,
          consistency_issues: 0,
          warnings: ["Quality analysis could not be completed for this file."],
          recommendations: [],
          analyzed_file_name: file.name,
          analysis_timestamp: new Date().toISOString(),
        };
        console.error("[DataHarbor] Saving quality failure marker — parsedStats was null for file:", file?.name);
      }
    }

    await onSave(formData, qualityPayload, file ? { file, parsedStats } : null);
    setSaving(false);
  };

  const set = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{dataset ? "Edit Dataset" : "Upload Dataset"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Label className="text-xs">Dataset Name *</Label>
              <Input value={form.name || ""} onChange={(e) => set("name", e.target.value)} placeholder="Enter dataset name" className="mt-1" />
            </div>
            <div className="col-span-2">
              <Label className="text-xs">Description</Label>
              <Textarea value={form.description || ""} onChange={(e) => set("description", e.target.value)} placeholder="Describe this dataset..." className="mt-1 h-20" />
            </div>
            <div>
              <Label className="text-xs">Data Category <span className="text-slate-400 font-normal">(type of data)</span></Label>
              <Select value={form.category || ""} onValueChange={(v) => set("category", v)}>
                <SelectTrigger className="mt-1"><SelectValue placeholder="Select category" /></SelectTrigger>
                <SelectContent>{categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Department * <span className="text-slate-400 font-normal">(owning team)</span></Label>
              <Select value={form.department || ""} onValueChange={(v) => set("department", v)}>
                <SelectTrigger className="mt-1"><SelectValue placeholder="Select department" /></SelectTrigger>
                <SelectContent>{departments.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Owner</Label>
              <Input value={form.owner || ""} onChange={(e) => set("owner", e.target.value)} className="mt-1" placeholder="Data owner" />
            </div>
            <div>
              <Label className="text-xs">Source</Label>
              <Input value={form.source || ""} onChange={(e) => set("source", e.target.value)} className="mt-1" placeholder="Data source" />
            </div>
            <div>
              <Label className="text-xs">Region</Label>
              <Select value={form.region || ""} onValueChange={(v) => set("region", v)}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>{regions.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Status</Label>
              <Select value={form.status || ""} onValueChange={(v) => set("status", v)}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>{STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Data Sensitivity</Label>
              <Select value={form.data_sensitivity || ""} onValueChange={(v) => set("data_sensitivity", v)}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>{SENSITIVITIES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Update Frequency</Label>
              <Select value={form.update_frequency || ""} onValueChange={(v) => set("update_frequency", v)}>
                <SelectTrigger className="mt-1"><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>{FREQUENCIES.map(f => <SelectItem key={f} value={f}>{f}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Business Owner</Label>
              <Input value={form.business_owner || ""} onChange={(e) => set("business_owner", e.target.value)} className="mt-1" />
            </div>
            <div>
              <Label className="text-xs">Technical Owner</Label>
              <Input value={form.technical_owner || ""} onChange={(e) => set("technical_owner", e.target.value)} className="mt-1" />
            </div>
            <div className="col-span-2">
              <Label className="text-xs">Tags</Label>
              <div className="mt-1 space-y-2">
                {/* Selected tags */}
                {form.tags && form.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {form.tags.split(",").map(t => t.trim()).filter(Boolean).map(tag => (
                      <span key={tag} className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
                        {tag}
                        <button type="button" onClick={() => {
                          const current = form.tags.split(",").map(t => t.trim()).filter(Boolean);
                          set("tags", current.filter(t => t !== tag).join(", "));
                        }}><X className="w-3 h-3" /></button>
                      </span>
                    ))}
                  </div>
                )}
                {/* Tag selector */}
                <Select
                  value=""
                  onValueChange={(v) => {
                    const current = form.tags ? form.tags.split(",").map(t => t.trim()).filter(Boolean) : [];
                    if (!current.includes(v)) set("tags", [...current, v].join(", "));
                  }}
                >
                  <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Add a tag…" /></SelectTrigger>
                  <SelectContent>
                    {orgTags.filter(tag => {
                      const current = form.tags ? form.tags.split(",").map(t => t.trim()).filter(Boolean) : [];
                      return !current.includes(tag);
                    }).map(tag => <SelectItem key={tag} value={tag}>{tag}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="col-span-2">
              <Label className="text-xs">{dataset ? "Upload New Version (optional)" : "Upload File (CSV or Excel)"}</Label>
              {dataset && (
                <p className="text-[11px] text-slate-400 mb-1">Uploading a new file will create a new version automatically.</p>
              )}
              <div className="mt-1 border-2 border-dashed border-slate-200 rounded-lg p-6 text-center hover:border-teal-300 transition-colors">
                <input type="file" accept=".csv,.xlsx,.xls,.json" onChange={handleFileUpload} className="hidden" id="file-upload" />
                <label htmlFor="file-upload" className="cursor-pointer">
                  {uploading ? (
                    <div className="py-2">
                      <Loader2 className="w-6 h-6 text-teal-500 animate-spin mx-auto mb-2" />
                      <p className="text-xs text-slate-500">Uploading and analyzing file...</p>
                    </div>
                  ) : parsedStats ? (
                    <div className="py-1">
                      <CheckCircle2 className="w-6 h-6 text-teal-500 mx-auto mb-2" />
                      <p className="text-sm font-medium text-slate-700">{file.name}</p>
                      <div className="flex justify-center gap-4 mt-2 text-xs text-slate-500">
                        <span>{parsedStats.row_count?.toLocaleString()} rows</span>
                        <span>{parsedStats.column_count} columns</span>
                        <span className={`font-medium ${parsedStats.quality?.quality_score >= 85 ? "text-emerald-600" : parsedStats.quality?.quality_score >= 70 ? "text-amber-600" : "text-red-600"}`}>
                          Quality: {parsedStats.quality?.quality_score}%
                        </span>
                      </div>
                    </div>
                  ) : file ? (
                    <div className="py-1">
                      <FileText className="w-6 h-6 text-slate-400 mx-auto mb-2" />
                      <p className="text-sm text-slate-600">{file.name}</p>
                      <p className="text-xs text-slate-400 mt-1">Excel file — statistics will be saved without parsing</p>
                    </div>
                  ) : (
                    <>
                      <Upload className="w-6 h-6 text-slate-400 mx-auto mb-2" />
                      <p className="text-sm text-slate-600">Click to upload</p>
                      <p className="text-xs text-slate-400 mt-1">CSV, Excel, or JSON</p>
                    </>
                  )}
                </label>
              </div>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button className="bg-teal-600 hover:bg-teal-700" onClick={handleSave} disabled={saving || !form.name || !form.department}>
            {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            {dataset ? "Update" : "Upload"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
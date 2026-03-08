import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLang } from "@/components/LanguageContext";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Search, FileSearch, Edit, Save, X, Tag, Shield, Clock, Globe, Database } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import moment from "moment";

const SENSITIVITY_STYLES = {
  Public: "bg-green-50 text-green-700 border-green-200",
  Internal: "bg-blue-50 text-blue-700 border-blue-200",
  Confidential: "bg-amber-50 text-amber-700 border-amber-200",
  Restricted: "bg-red-50 text-red-700 border-red-200",
};

const QUALITY_STYLES = {
  Good: "bg-emerald-50 text-emerald-700",
  "Needs Review": "bg-amber-50 text-amber-700",
  "Poor Quality": "bg-red-50 text-red-700",
};

export default function Metadata() {
  const { t } = useLang();
  const [user, setUser] = useState(null);
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const qc = useQueryClient();

  useEffect(() => {
    base44.auth.me().then(setUser);
  }, []);

  const { data: datasets = [], isLoading } = useQuery({
    queryKey: ["datasets", user?.email],
    queryFn: () => base44.entities.Dataset.list("-created_date", 200),
    enabled: !!user,
  });

  const { data: quality = [] } = useQuery({
    queryKey: ["quality", user?.email],
    queryFn: () => base44.entities.QualityResult.list("-created_date", 200),
    enabled: !!user,
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Dataset.update(id, data),
    onSuccess: async () => {
      qc.invalidateQueries({ queryKey: ["datasets"] });
      const user = await base44.auth.me();
      await base44.entities.ActivityLog.create({
        action: "Metadata Edited",
        description: `Updated metadata for "${editForm.name}"`,
        user_email: user.email,
        user_name: user.full_name,
      });
      toast.success("Metadata updated");
      setEditingId(null);
    },
  });

  const userDatasets = datasets.filter(d => d.created_by === user?.email && !d.isDemo);

  const filtered = userDatasets.filter(d =>
    !search || d.name?.toLowerCase().includes(search.toLowerCase()) || d.tags?.toLowerCase().includes(search.toLowerCase())
  );

  const getQuality = (dsId) => quality.find(q => q.dataset_id === dsId);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">{t["Metadata Management"]}</h1>
        <p className="text-sm text-slate-500 mt-0.5">{t["View and manage metadata for all datasets"]}</p>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <Input placeholder={t["Search by name or tags..."]} value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 bg-white" />
      </div>

      {isLoading ? (
        <div className="grid gap-4">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-48 rounded-xl" />)}</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <FileSearch className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <p className="text-sm text-slate-500">{t["No datasets found"]}</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filtered.map((d) => {
            const q = getQuality(d.id);
            return (
              <Card key={d.id} className="border-slate-200/60 hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-base">{d.name}</CardTitle>
                      <p className="text-sm text-slate-500 mt-1">{d.description || t["No description"]}</p>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => { setEditingId(d.id); setEditForm({ ...d }); }}>
                      <Edit className="w-4 h-4 mr-1" /> {t["Edit"]}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div><span className="text-slate-400 text-xs">{t["Source"]}</span><p className="text-slate-700 mt-0.5">{d.source || "—"}</p></div>
                    <div><span className="text-slate-400 text-xs">{t["Business Owner"]}</span><p className="text-slate-700 mt-0.5">{d.business_owner || "—"}</p></div>
                    <div><span className="text-slate-400 text-xs">{t["Technical Owner"]}</span><p className="text-slate-700 mt-0.5">{d.technical_owner || "—"}</p></div>
                    <div><span className="text-slate-400 text-xs">{t["Department"]}</span><p className="text-slate-700 mt-0.5">{d.department}</p></div>
                    <div><span className="text-slate-400 text-xs">{t["Region"]}</span><p className="text-slate-700 mt-0.5">{d.region || "—"}</p></div>
                    <div><span className="text-slate-400 text-xs">{t["Frequency"]}</span><p className="text-slate-700 mt-0.5">{d.update_frequency || "—"}</p></div>
                    <div><span className="text-slate-400 text-xs">{t["Language"]}</span><p className="text-slate-700 mt-0.5">{d.language || "English"}</p></div>
                    <div><span className="text-slate-400 text-xs">{t["Records"]}</span><p className="text-slate-700 mt-0.5">{d.row_count?.toLocaleString() || "—"}</p></div>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-4">
                    <Badge variant="outline" className={SENSITIVITY_STYLES[d.data_sensitivity] || ""}>{d.data_sensitivity || "Internal"}</Badge>
                    {q && <Badge className={QUALITY_STYLES[q.quality_status]}>{q.quality_status} ({q.quality_score}%)</Badge>}
                    {d.tags?.split(",").filter(Boolean).map(tag => (
                      <Badge key={tag} variant="secondary" className="text-xs"><Tag className="w-3 h-3 mr-1" />{tag.trim()}</Badge>
                    ))}
                  </div>
                  <div className="flex gap-4 mt-3 text-xs text-slate-400">
                    <span>{t["Created"]}: {moment(d.created_date).format("MMM D, YYYY")}</span>
                    <span>{t["Updated"]}: {moment(d.updated_date).format("MMM D, YYYY")}</span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog open={!!editingId} onOpenChange={() => setEditingId(null)}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{t["Edit Metadata"]}</DialogTitle></DialogHeader>
          <div className="space-y-3 py-2">
            {[
              { key: "description", labelKey: "Description", textarea: true },
              { key: "source", labelKey: "Source" },
              { key: "business_owner", labelKey: "Business Owner" },
              { key: "technical_owner", labelKey: "Technical Owner" },
              { key: "tags", labelKey: "Tags (comma-separated)" },
              { key: "language", labelKey: "Language" },
            ].map(({ key, labelKey, textarea }) => (
              <div key={key}>
                <Label className="text-xs">{t[labelKey]}</Label>
                {textarea ? (
                  <Textarea value={editForm[key] || ""} onChange={(e) => setEditForm({ ...editForm, [key]: e.target.value })} className="mt-1 h-20" />
                ) : (
                  <Input value={editForm[key] || ""} onChange={(e) => setEditForm({ ...editForm, [key]: e.target.value })} className="mt-1" />
                )}
              </div>
            ))}
            <div>
              <Label className="text-xs">{t["Data Sensitivity"]}</Label>
              <Select value={editForm.data_sensitivity || ""} onValueChange={(v) => setEditForm({ ...editForm, data_sensitivity: v })}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>{["Public","Internal","Confidential","Restricted"].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">{t["Update Frequency"]}</Label>
              <Select value={editForm.update_frequency || ""} onValueChange={(v) => setEditForm({ ...editForm, update_frequency: v })}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>{["Real-time","Daily","Weekly","Monthly","Quarterly","Annually","Ad-hoc"].map(f => <SelectItem key={f} value={f}>{f}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingId(null)}>{t["Cancel"]}</Button>
            <Button className="bg-teal-600 hover:bg-teal-700" onClick={() => updateMutation.mutate({ id: editingId, data: editForm })}>
              <Save className="w-4 h-4 mr-1" /> {t["Save"]}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
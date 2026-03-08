import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLang } from "@/components/LanguageContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { FileText, Download, Plus, Loader2, Database } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import moment from "moment";

const REPORT_TYPES = ["Metadata Report", "Data Quality Report", "Dashboard Summary", "Dataset Profile"];

const TYPE_STYLES = {
  "Metadata Report": "bg-violet-50 text-violet-700 border-violet-200",
  "Data Quality Report": "bg-teal-50 text-teal-700 border-teal-200",
  "Dashboard Summary": "bg-blue-50 text-blue-700 border-blue-200",
  "Dataset Profile": "bg-amber-50 text-amber-700 border-amber-200",
};

export default function Reports() {
  const { t } = useLang();
  const [user, setUser] = useState(null);
  const [showGenerate, setShowGenerate] = useState(false);
  const [reportType, setReportType] = useState("");
  const [datasetId, setDatasetId] = useState("");
  const qc = useQueryClient();

  useEffect(() => {
    base44.auth.me().then(setUser);
  }, []);

  const { data: reports = [], isLoading } = useQuery({
    queryKey: ["reports", user?.id],
    queryFn: () => base44.entities.Report.list("-created_date", 100),
    enabled: !!user,
  });
  const { data: datasets = [] } = useQuery({
    queryKey: ["datasets", user?.id],
    queryFn: () => base44.entities.Dataset.list("-created_date", 200),
    enabled: !!user,
  });

  const userDatasets = datasets.filter(d => d.created_by === user?.email && !d.isDemo);

  const generateMutation = useMutation({
    mutationFn: async () => {
      const ds = datasets.find(d => d.id === datasetId);
      const user = await base44.auth.me();
      const report = await base44.entities.Report.create({
        title: `${reportType} - ${ds?.name || "All Datasets"}`,
        type: reportType,
        dataset_id: datasetId || undefined,
        dataset_name: ds?.name || "All Datasets",
        generated_by: user.full_name || user.email,
        status: "Generated",
        content_summary: `${reportType} generated on ${moment().format("MMM D, YYYY")} for ${ds?.name || "all datasets"}`,
      });
      await base44.entities.ActivityLog.create({
        action: "Report Exported",
        description: `Generated ${reportType} for ${ds?.name || "All Datasets"}`,
        user_email: user.email,
        user_name: user.full_name,
      });
      return report;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["reports"] });
      toast.success("Report generated successfully");
      setShowGenerate(false);
      setReportType("");
      setDatasetId("");
    },
  });

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{t["Reports Title"]}</h1>
          <p className="text-sm text-slate-500 mt-0.5">{t["Generate and manage data reports"]}</p>
        </div>
        <Button className="bg-teal-600 hover:bg-teal-700" onClick={() => setShowGenerate(true)}>
          <Plus className="w-4 h-4 mr-2" /> {t["Generate Report"]}
        </Button>
      </div>

      {isLoading ? (
        <div className="grid gap-3">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}</div>
      ) : reports.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-slate-200/60">
          <FileText className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <p className="text-sm text-slate-500">{t["No reports generated yet"]}</p>
          <p className="text-xs text-slate-400 mt-1">{t["Generate Report"]}</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {reports.map((r) => (
            <Card key={r.id} className="border-slate-200/60 hover:shadow-sm transition-shadow">
              <CardContent className="py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-10 h-10 rounded-lg bg-slate-50 flex items-center justify-center flex-shrink-0">
                      <FileText className="w-5 h-5 text-slate-500" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-medium text-slate-800 truncate">{r.title}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className={`text-[10px] ${TYPE_STYLES[r.type] || ""}`}>{t[r.type] || r.type}</Badge>
                        <span className="text-xs text-slate-400">{r.generated_by} · {moment(r.created_date).format("MMM D, YYYY h:mm A")}</span>
                      </div>
                    </div>
                  </div>
                  <Badge className={r.status === "Generated" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}>
                    {t[r.status] || r.status}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={showGenerate} onOpenChange={setShowGenerate}>
        <DialogContent>
          <DialogHeader><DialogTitle>{t["Generate Report dialog"]}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label className="text-xs">{t["Report Type"]}</Label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger className="mt-1"><SelectValue placeholder={t["Select type"]} /></SelectTrigger>
                <SelectContent>{REPORT_TYPES.map(rt => <SelectItem key={rt} value={rt}>{rt}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">{t["Dataset (optional)"]}</Label>
              <Select value={datasetId} onValueChange={setDatasetId}>
                <SelectTrigger className="mt-1"><SelectValue placeholder={t["All Datasets"]} /></SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">{t["All Datasets"]}</SelectItem>
                    {userDatasets.map(d => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
                  </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowGenerate(false)}>{t["Cancel"]}</Button>
            <Button className="bg-teal-600 hover:bg-teal-700" onClick={() => generateMutation.mutate()} disabled={!reportType || generateMutation.isPending}>
              {generateMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              {t["Generate"]}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
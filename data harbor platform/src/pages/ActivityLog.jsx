import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { useLang } from "@/components/LanguageContext";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Activity, Database, Upload, Edit, FileText, LogIn, ShieldCheck, UserPlus, Trash2 } from "lucide-react";
import moment from "moment";

const ACTIONS = ["All", "User Login", "Dataset Uploaded", "Dataset Updated", "Dataset Deleted", "Metadata Edited", "Report Exported", "Quality Check", "User Registered"];

const ACTION_CONFIG = {
  "User Login": { icon: LogIn, color: "bg-blue-100 text-blue-700" },
  "Dataset Uploaded": { icon: Upload, color: "bg-teal-100 text-teal-700" },
  "Dataset Updated": { icon: Edit, color: "bg-amber-100 text-amber-700" },
  "Dataset Deleted": { icon: Trash2, color: "bg-red-100 text-red-700" },
  "Metadata Edited": { icon: Database, color: "bg-violet-100 text-violet-700" },
  "Report Exported": { icon: FileText, color: "bg-emerald-100 text-emerald-700" },
  "Quality Check": { icon: ShieldCheck, color: "bg-cyan-100 text-cyan-700" },
  "User Registered": { icon: UserPlus, color: "bg-pink-100 text-pink-700" },
};

export default function ActivityLogPage() {
  const { t } = useLang();
  const [user, setUser] = useState(null);
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("All");

  useEffect(() => {
    base44.auth.me().then(setUser);
  }, []);

  const { data: activities = [], isLoading } = useQuery({
    queryKey: ["activities", user?.email],
    queryFn: () => base44.entities.ActivityLog.filter({ user_email: user?.email }, "-created_date", 200),
    enabled: !!user,
  });

  const filtered = activities.filter(a => {
    if (actionFilter !== "All" && a.action !== actionFilter) return false;
    if (search && !a.description?.toLowerCase().includes(search.toLowerCase()) && !a.user_name?.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">{t["Activity Log Title"]}</h1>
        <p className="text-sm text-slate-500 mt-0.5">{t["Track all actions across the platform"]}</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input placeholder={t["Search activity..."]} value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 bg-white" />
        </div>
        <Select value={actionFilter} onValueChange={setActionFilter}>
          <SelectTrigger className="w-48 bg-white"><SelectValue /></SelectTrigger>
          <SelectContent>{ACTIONS.map(a => <SelectItem key={a} value={a}>{a === "All" ? t["All Actions"] : a}</SelectItem>)}</SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="space-y-2">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-16 rounded-lg" />)}</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <Activity className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <p className="text-sm text-slate-500">{t["No activity found"]}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((a) => {
            const config = ACTION_CONFIG[a.action] || { icon: Activity, color: "bg-slate-100 text-slate-700" };
            const Icon = config.icon;
            return (
              <Card key={a.id} className="border-slate-200/60">
                <CardContent className="py-3">
                  <div className="flex items-center gap-4">
                    <div className={`w-9 h-9 rounded-lg ${config.color} flex items-center justify-center flex-shrink-0`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-slate-800">{a.description}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-slate-400">{a.user_name || a.user_email || t["System"]}</span>
                        <span className="text-xs text-slate-300">·</span>
                        <span className="text-xs text-slate-400">{moment(a.created_date).format("MMM D, YYYY h:mm A")}</span>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-[10px] flex-shrink-0">{t[a.action] || a.action}</Badge>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
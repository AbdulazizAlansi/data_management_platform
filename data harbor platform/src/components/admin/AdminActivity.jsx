import React, { useState } from "react";
import { useLang } from "@/components/LanguageContext";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search } from "lucide-react";
import moment from "moment";

const ACTION_COLORS = {
  "User Login":       "bg-blue-50 text-blue-700 border-blue-200",
  "Dataset Uploaded": "bg-teal-50 text-teal-700 border-teal-200",
  "Dataset Updated":  "bg-amber-50 text-amber-700 border-amber-200",
  "Dataset Deleted":  "bg-red-50 text-red-700 border-red-200",
  "Metadata Edited":  "bg-purple-50 text-purple-700 border-purple-200",
  "Report Exported":  "bg-indigo-50 text-indigo-700 border-indigo-200",
  "Quality Check":    "bg-emerald-50 text-emerald-700 border-emerald-200",
  "User Registered":  "bg-sky-50 text-sky-700 border-sky-200",
};

const ACTIONS = ["All", "User Login", "Dataset Uploaded", "Dataset Updated", "Dataset Deleted", "Metadata Edited", "Report Exported", "Quality Check", "User Registered"];

export default function AdminActivity({ activities }) {
  const { t } = useLang();
  const [search, setSearch] = useState("");
  const [action, setAction] = useState("All");

  const filtered = activities.filter(a =>
    (action === "All" || a.action === action) &&
    (a.description?.toLowerCase().includes(search.toLowerCase()) ||
     a.user_name?.toLowerCase().includes(search.toLowerCase()) ||
     a.user_email?.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        <div className="relative flex-1 min-w-[180px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input placeholder={t["Search activity…"]} value={search} onChange={e => setSearch(e.target.value)} className="pl-9 h-9 text-sm" />
        </div>
        <Select value={action} onValueChange={setAction}>
          <SelectTrigger className="h-9 w-44 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {ACTIONS.map(a => <SelectItem key={a} value={a}>{a === "All" ? t["All"] : a}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1 max-h-[520px] overflow-y-auto pr-1">
        {filtered.slice(0, 50).map(a => (
          <div key={a.id} className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white border border-slate-100 hover:border-slate-200 transition-colors">
            <div className="flex-1 min-w-0">
              <p className="text-sm text-slate-700">{a.description}</p>
              <p className="text-xs text-slate-400 mt-0.5">
                {a.user_name || a.user_email || "System"} · {moment(a.created_date).fromNow()}
              </p>
            </div>
            <Badge variant="outline" className={`text-[10px] shrink-0 ${ACTION_COLORS[a.action] || ""}`}>
              {a.action}
            </Badge>
          </div>
        ))}
        {filtered.length === 0 && (
          <p className="text-sm text-slate-400 text-center py-10">{t["No matching activity"]}</p>
        )}
      </div>
    </div>
  );
}
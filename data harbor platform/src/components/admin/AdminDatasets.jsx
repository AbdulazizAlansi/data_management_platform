import React, { useState } from "react";
import { useLang } from "@/components/LanguageContext";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { createPageUrl } from "@/utils";
import { Link } from "react-router-dom";
import moment from "moment";

const STATUS_STYLES = {
  "Active":       "bg-emerald-50 text-emerald-700 border-emerald-200",
  "Archived":     "bg-slate-50 text-slate-500 border-slate-200",
  "Draft":        "bg-amber-50 text-amber-700 border-amber-200",
  "Under Review": "bg-blue-50 text-blue-700 border-blue-200",
};

export default function AdminDatasets({ datasets, qualityResults }) {
  const { t } = useLang();
  const [search, setSearch] = useState("");

  const qualityMap = Object.fromEntries(qualityResults.map(q => [q.dataset_id, q]));

  const filtered = datasets.filter(d =>
    d.name?.toLowerCase().includes(search.toLowerCase()) ||
    d.department?.toLowerCase().includes(search.toLowerCase()) ||
    d.owner?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-3">
      <div className="relative max-w-xs">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <Input placeholder={t["Search datasets…"]} value={search} onChange={e => setSearch(e.target.value)} className="pl-9 h-9 text-sm" />
      </div>

      <div className="rounded-xl border border-slate-200 overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead className="text-xs font-semibold">{t["Name"]}</TableHead>
              <TableHead className="text-xs font-semibold">{t["Department"]}</TableHead>
              <TableHead className="text-xs font-semibold">{t["Owner"]}</TableHead>
              <TableHead className="text-xs font-semibold">{t["Rows"]}</TableHead>
              <TableHead className="text-xs font-semibold">{t["Quality"]}</TableHead>
              <TableHead className="text-xs font-semibold">{t["Status"]}</TableHead>
              <TableHead className="text-xs font-semibold">{t["Uploaded"]}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map(d => {
              const qr = qualityMap[d.id];
              return (
                <TableRow key={d.id} className="hover:bg-slate-50/50">
                  <TableCell className="font-medium text-sm">
                    <Link to={createPageUrl(`Insights?id=${d.id}`)} className="hover:text-teal-600 hover:underline">
                      {d.name}
                    </Link>
                  </TableCell>
                  <TableCell className="text-sm text-slate-600">{d.department || "—"}</TableCell>
                  <TableCell className="text-sm text-slate-600">{d.owner || d.created_by || "—"}</TableCell>
                  <TableCell className="text-sm tabular-nums">{d.row_count?.toLocaleString() || "—"}</TableCell>
                  <TableCell>
                    {qr ? (
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-slate-200 rounded-full h-1.5">
                          <div
                            className={`h-1.5 rounded-full ${qr.quality_score >= 80 ? "bg-emerald-500" : qr.quality_score >= 60 ? "bg-amber-500" : "bg-red-500"}`}
                            style={{ width: `${qr.quality_score}%` }}
                          />
                        </div>
                        <span className="text-xs text-slate-600">{qr.quality_score}%</span>
                      </div>
                    ) : <span className="text-xs text-slate-400">—</span>}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={`text-[10px] ${STATUS_STYLES[d.status] || ""}`}>{d.status || "—"}</Badge>
                  </TableCell>
                  <TableCell className="text-xs text-slate-400">{moment(d.created_date).format("MMM D, YYYY")}</TableCell>
                </TableRow>
              );
            })}
            {filtered.length === 0 && (
              <TableRow><TableCell colSpan={7} className="text-center text-sm text-slate-400 py-8">{t["No datasets found"]}</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
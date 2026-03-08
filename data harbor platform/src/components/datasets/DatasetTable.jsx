import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Eye, Edit, Trash2, Download, FileSearch, Database, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import moment from "moment";
import { useLang } from "@/components/LanguageContext";

const STATUS_STYLES = {
  Active:         "bg-emerald-50 text-emerald-700 border-emerald-200",
  Archived:       "bg-slate-100 text-slate-500 border-slate-200",
  Draft:          "bg-amber-50 text-amber-700 border-amber-200",
  "Under Review": "bg-blue-50 text-blue-700 border-blue-200",
};

const CAT_COLORS = ["bg-teal-500","bg-blue-500","bg-violet-500","bg-amber-500","bg-rose-500","bg-indigo-500","bg-emerald-500"];
const catColor = (cat) => CAT_COLORS[Math.abs((cat||"").split("").reduce((a,c) => a+c.charCodeAt(0),0)) % CAT_COLORS.length];

function SortIcon({ field, sort }) {
  if (sort.field !== field) return <ArrowUpDown className="w-3 h-3 text-slate-300 ml-1 inline" />;
  return sort.dir === "asc"
    ? <ArrowUp className="w-3 h-3 text-teal-500 ml-1 inline" />
    : <ArrowDown className="w-3 h-3 text-teal-500 ml-1 inline" />;
}

function SortTh({ children, field, sort, onSort, className = "" }) {
  return (
    <th
      className={`text-left text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-4 py-3.5 cursor-pointer select-none hover:text-slate-600 transition-colors whitespace-nowrap ${className}`}
      onClick={() => onSort(field)}
    >
      {children}
      <SortIcon field={field} sort={sort} />
    </th>
  );
}

export default function DatasetTable({ datasets, onEdit, onDelete, sort, onSort }) {
  const { t } = useLang();
  if (datasets.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-slate-200/80 gap-3">
        <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center">
          <FileSearch className="w-7 h-7 text-slate-300" />
        </div>
        <div className="text-center">
          <p className="text-sm font-medium text-slate-600">{t["No datasets found"]}</p>
          <p className="text-xs text-slate-400 mt-1">{t["Try adjusting filters"]}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/60">
              <SortTh field="name"         sort={sort} onSort={onSort} className="px-5">{t["Dataset"]}</SortTh>
              <SortTh field="category"     sort={sort} onSort={onSort}>{t["Category"]}</SortTh>
              <SortTh field="department"   sort={sort} onSort={onSort}>{t["Department"]}</SortTh>
              <SortTh field="owner"        sort={sort} onSort={onSort}>{t["Owner"]}</SortTh>
              <th className="text-right text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-4 py-3.5 cursor-pointer select-none hover:text-slate-600 transition-colors whitespace-nowrap"
                  onClick={() => onSort("row_count")}>
                {t["Rows"]} <SortIcon field="row_count" sort={sort} />
              </th>
              <SortTh field="status"       sort={sort} onSort={onSort}>{t["Status"]}</SortTh>
              <SortTh field="created_date" sort={sort} onSort={onSort}>{t["Uploaded"]}</SortTh>
              <th className="w-10 px-4 py-3.5"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {datasets.map((d) => (
              <tr key={d.id} className="table-row-hover group">
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg ${catColor(d.category)} flex items-center justify-center shrink-0`}>
                      <Database className="w-3.5 h-3.5 text-white" />
                    </div>
                    <div className="min-w-0">
                      <Link to={createPageUrl(`Insights?id=${d.id}`)} className="font-semibold text-slate-800 hover:text-teal-600 transition-colors truncate block max-w-[200px]">
                        {d.name}
                      </Link>
                      {d.description && (
                        <p className="text-xs text-slate-400 mt-0.5 truncate max-w-[200px]">{d.description}</p>
                      )}
                      {d.tags && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {d.tags.split(",").slice(0, 3).map(tag => tag.trim()).filter(Boolean).map(tag => (
                            <span key={tag} className="text-[10px] bg-slate-100 text-slate-500 rounded px-1.5 py-0.5">{tag}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3.5">
                  <span className="text-sm text-slate-600">{d.category || "—"}</span>
                </td>
                <td className="px-4 py-3.5">
                  <span className="text-sm text-slate-600">{d.department || "—"}</span>
                </td>
                <td className="px-4 py-3.5">
                  <span className="text-sm text-slate-600">{d.owner || "—"}</span>
                </td>
                <td className="px-4 py-3.5 text-right">
                  <span className="text-sm text-slate-700 tabular font-medium">{d.row_count?.toLocaleString() || "—"}</span>
                </td>
                <td className="px-4 py-3.5">
                  <Badge variant="outline" className={`text-[10px] font-medium ${STATUS_STYLES[d.status] || ""}`}>
                    {d.status || "—"}
                  </Badge>
                </td>
                <td className="px-4 py-3.5">
                  <span className="text-xs text-slate-400">{moment(d.created_date).format("MMM D, YYYY")}</span>
                </td>
                <td className="px-4 py-3.5">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100 text-slate-400 hover:text-slate-700 transition-opacity">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-44">
                      <DropdownMenuItem asChild>
                        <Link to={createPageUrl(`Insights?id=${d.id}`)} className="flex items-center">
                           <Eye className="w-3.5 h-3.5 mr-2" /> {t["View Insights"]}
                         </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onEdit(d)}>
                          <Edit className="w-3.5 h-3.5 mr-2" /> {t["Edit Metadata"]}
                        </DropdownMenuItem>
                        {d.file_url && (
                          <DropdownMenuItem onClick={() => window.open(d.file_url, "_blank")}>
                            <Download className="w-3.5 h-3.5 mr-2" /> {t["Download File"]}
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => onDelete(d)} className="text-red-600 focus:text-red-600">
                          <Trash2 className="w-3.5 h-3.5 mr-2" /> {t["Delete"]}
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/40">
        <p className="text-xs text-slate-400">{datasets.length} {t["datasets shown"]}</p>
      </div>
    </div>
  );
}
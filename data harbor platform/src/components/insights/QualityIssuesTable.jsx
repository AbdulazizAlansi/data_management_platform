import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, AlertTriangle, ChevronLeft, ChevronRight } from "lucide-react";

const ISSUE_COLORS = {
  "Empty Cell":   "bg-red-100 text-red-700 border-red-200",
  "Empty Column": "bg-slate-100 text-slate-700 border-slate-200",
};

const PAGE_SIZE = 20;

export default function QualityIssuesTable({ issues = [], rowCount, columnCount, fileName, analysisTimestamp, analysisFailed }) {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");
  const [page, setPage] = useState(1);

  const issueTypes = ["All", "Empty Cell", "Empty Column"];

  const filtered = useMemo(() => {
    return issues.filter(issue => {
      const matchType = typeFilter === "All" || issue.issue_type === typeFilter;
      const q = search.toLowerCase();
      const matchSearch = !q ||
        String(issue.row ?? "").includes(q) ||
        issue.column?.toLowerCase().includes(q) ||
        issue.value?.toLowerCase().includes(q) ||
        issue.issue_type?.toLowerCase().includes(q);
      return matchType && matchSearch;
    });
  }, [issues, search, typeFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const typeCounts = useMemo(() => {
    const counts = {};
    issues.forEach(i => { counts[i.issue_type] = (counts[i.issue_type] || 0) + 1; });
    return counts;
  }, [issues]);

  const handleTypeFilter = (t) => { setTypeFilter(t); setPage(1); };
  const handleSearch = (e) => { setSearch(e.target.value); setPage(1); };

  return (
    <div className="space-y-4">
      {/* Debug / metadata bar */}
      <Card className="border-amber-200 bg-amber-50/60">
        <CardContent className="py-3">
          <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs">
            <span className="text-amber-800"><span className="font-semibold">File:</span> {fileName || "—"}</span>
            <span className="text-amber-800"><span className="font-semibold">Rows:</span> {rowCount ?? "—"}</span>
            <span className="text-amber-800"><span className="font-semibold">Columns:</span> {columnCount ?? "—"}</span>
            <span className="text-amber-800"><span className="font-semibold">Analysis:</span> {analysisTimestamp ? new Date(analysisTimestamp).toLocaleString() : "—"}</span>
            <span className={`font-semibold ${analysisFailed ? "text-red-600" : "text-emerald-700"}`}>
              Status: {analysisFailed ? "Failed" : "Success"}
            </span>
          </div>
        </CardContent>
      </Card>

      {analysisFailed ? (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="py-10 text-center">
            <AlertTriangle className="w-8 h-8 text-red-400 mx-auto mb-3" />
            <p className="text-sm font-semibold text-red-700">Quality analysis failed for this dataset.</p>
            <p className="text-xs text-red-500 mt-1">No valid results were generated. Re-upload the file to retry.</p>
          </CardContent>
        </Card>
      ) : issues.length === 0 ? (
        <Card className="border-emerald-200 bg-emerald-50">
          <CardContent className="py-10 text-center">
            <p className="text-sm font-semibold text-emerald-700">No issues found — dataset is clean.</p>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-slate-200/60">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <CardTitle className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                Quality Issues
                <Badge variant="outline" className="text-xs">{issues.length} total</Badge>
              </CardTitle>
              <div className="relative w-52">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                <Input
                  placeholder="Search row, column, value…"
                  value={search}
                  onChange={handleSearch}
                  className="pl-8 h-8 text-xs"
                />
              </div>
            </div>

            {/* Issue type filter chips */}
            <div className="flex flex-wrap gap-1.5 mt-2">
              {issueTypes.map(t => (
                <button
                  key={t}
                  onClick={() => handleTypeFilter(t)}
                  className={`px-2.5 py-1 rounded-full text-[11px] font-medium border transition-all ${
                    typeFilter === t
                      ? "bg-slate-800 text-white border-slate-800"
                      : "bg-white text-slate-600 border-slate-200 hover:border-slate-400"
                  }`}
                >
                  {t}
                  {t !== "All" && typeCounts[t] ? ` (${typeCounts[t]})` : t === "All" ? ` (${issues.length})` : ""}
                </button>
              ))}
            </div>
          </CardHeader>

          <CardContent className="pt-0">
            <div className="overflow-x-auto rounded-lg border border-slate-100">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    <th className="text-left px-3 py-2.5 font-semibold text-slate-600 w-28">Data Row</th>
                    <th className="text-left px-3 py-2.5 font-semibold text-slate-600 w-40">Column Name</th>
                    <th className="text-left px-3 py-2.5 font-semibold text-slate-600 w-36">Current Value</th>
                    <th className="text-left px-3 py-2.5 font-semibold text-slate-600">Issue Type</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {paginated.map((issue, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-3 py-2.5 text-slate-600 font-mono font-medium">
                        {issue.row != null
                          ? <span>Data Row <span className="text-slate-800">{issue.row}</span></span>
                          : <span className="italic text-slate-400">entire column</span>
                        }
                      </td>
                      <td className="px-3 py-2.5 font-medium text-slate-700 truncate max-w-[160px]">
                        {issue.column}
                      </td>
                      <td className="px-3 py-2.5 font-mono text-slate-500 truncate max-w-[140px]">
                        {issue.value !== "" ? issue.value : <span className="italic text-slate-300">empty</span>}
                      </td>
                      <td className="px-3 py-2.5">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${ISSUE_COLORS[issue.issue_type] || "bg-slate-100 text-slate-600"}`}>
                          {issue.issue_type}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100">
                <span className="text-xs text-slate-400">
                  Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}
                </span>
                <div className="flex gap-1">
                  <Button variant="ghost" size="sm" className="h-7 w-7 p-0" disabled={page === 1} onClick={() => setPage(p => p - 1)}>
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </Button>
                  <span className="text-xs text-slate-600 px-2 flex items-center">{page} / {totalPages}</span>
                  <Button variant="ghost" size="sm" className="h-7 w-7 p-0" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
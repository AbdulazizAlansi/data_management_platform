import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell
} from "recharts";
import { TableIcon, BarChart2, Columns3, Hash, Percent, TrendingUp, TrendingDown, Minus } from "lucide-react";

const TYPE_COLORS = {
  number: { badge: "bg-blue-50 text-blue-700 border-blue-200", bar: "#0ea5e9" },
  date:   { badge: "bg-violet-50 text-violet-700 border-violet-200", bar: "#8b5cf6" },
  string: { badge: "bg-slate-100 text-slate-600 border-slate-200", bar: "#0d9488" },
};

function StatPill({ label, value, icon: Icon, color = "text-slate-700" }) {
  return (
    <div className="flex flex-col items-center justify-center px-3 py-2 bg-white rounded-xl border border-slate-100 shadow-sm min-w-[72px]">
      {Icon && <Icon className={`w-3.5 h-3.5 mb-1 ${color}`} />}
      <span className="text-[11px] text-slate-400 leading-tight">{label}</span>
      <span className={`text-sm font-bold leading-snug ${color}`}>{value}</span>
    </div>
  );
}

function NumericProfile({ col }) {
  const barColor = "#0ea5e9";
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        <StatPill label="Min" value={col.min ?? "—"} icon={TrendingDown} color="text-blue-600" />
        <StatPill label="Max" value={col.max ?? "—"} icon={TrendingUp} color="text-emerald-600" />
        <StatPill label="Avg" value={col.avg ?? "—"} icon={Minus} color="text-violet-600" />
        <StatPill label="Missing" value={`${col.missing_pct ?? 0}%`} icon={Percent} color={col.missing_pct > 10 ? "text-red-500" : "text-slate-500"} />
      </div>
      {col.histogram?.length > 0 && (
        <div>
          <p className="text-[11px] font-medium text-slate-400 mb-1.5 uppercase tracking-wide">Distribution</p>
          <ResponsiveContainer width="100%" height={90}>
            <BarChart data={col.histogram} margin={{ top: 0, right: 0, bottom: 0, left: -24 }}>
              <XAxis dataKey="label" tick={{ fontSize: 9, fill: "#94a3b8" }} interval="preserveStartEnd" />
              <YAxis tick={{ fontSize: 9, fill: "#94a3b8" }} />
              <Tooltip
                contentStyle={{ fontSize: 11, borderRadius: 8, border: "1px solid #e2e8f0", padding: "4px 10px" }}
                formatter={(v) => [v, "Count"]}
              />
              <Bar dataKey="count" radius={[3, 3, 0, 0]}>
                {col.histogram.map((_, i) => (
                  <Cell key={i} fill={barColor} fillOpacity={0.75 + (i / col.histogram.length) * 0.25} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

function CategoricalProfile({ col }) {
  const topValues = col.top_values || [];
  const maxCount = topValues[0]?.count || 1;
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        <StatPill label="Unique" value={topValues.length < 10 ? topValues.length : `${topValues.length}+`} icon={Hash} color="text-teal-600" />
        <StatPill label="Missing" value={`${col.missing_pct ?? 0}%`} icon={Percent} color={col.missing_pct > 10 ? "text-red-500" : "text-slate-500"} />
      </div>
      {topValues.length > 0 && (
        <div>
          <p className="text-[11px] font-medium text-slate-400 mb-1.5 uppercase tracking-wide">Top Values</p>
          <ResponsiveContainer width="100%" height={Math.min(topValues.length * 22 + 10, 160)}>
            <BarChart data={topValues} layout="vertical" margin={{ top: 0, right: 30, bottom: 0, left: 0 }}>
              <XAxis type="number" tick={{ fontSize: 9, fill: "#94a3b8" }} />
              <YAxis type="category" dataKey="label" width={80} tick={{ fontSize: 9, fill: "#64748b" }} />
              <Tooltip
                contentStyle={{ fontSize: 11, borderRadius: 8, border: "1px solid #e2e8f0", padding: "4px 10px" }}
                formatter={(v) => [v, "Count"]}
              />
              <Bar dataKey="count" radius={[0, 3, 3, 0]}>
                {topValues.map((_, i) => (
                  <Cell key={i} fill="#0d9488" fillOpacity={1 - (i / topValues.length) * 0.5} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

export default function DataPreview({ dataset }) {
  const rows = dataset.sample_rows || [];
  const columns = dataset.columns_info || [];
  const [activeCol, setActiveCol] = useState(null);
  const [showAllRows, setShowAllRows] = useState(false);

  const hasData = rows.length > 0 && columns.length > 0;

  if (!hasData) {
    return (
      <Card className="border-slate-200/60">
        <CardContent className="py-16 text-center">
          <BarChart2 className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <p className="text-sm font-medium text-slate-500">No preview available</p>
          <p className="text-xs text-slate-400 mt-1">Upload a CSV or Excel file to generate a data preview and profiling report.</p>
        </CardContent>
      </Card>
    );
  }

  const headers = Object.keys(rows[0]);
  const displayRows = showAllRows ? rows : rows.slice(0, 15);
  const selectedCol = activeCol !== null ? columns.find(c => c.name === activeCol) : null;

  return (
    <div className="space-y-5">
      {/* Summary bar */}
      <div className="flex flex-wrap gap-3">
        <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 rounded-lg text-xs font-semibold text-blue-700">
          <TableIcon className="w-3.5 h-3.5" />
          {dataset.row_count?.toLocaleString() || rows.length} rows
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-violet-50 rounded-lg text-xs font-semibold text-violet-700">
          <Columns3 className="w-3.5 h-3.5" />
          {dataset.column_count || columns.length} columns
        </div>
        {columns.filter(c => c.type === "number").length > 0 && (
          <div className="px-3 py-1.5 bg-teal-50 rounded-lg text-xs font-semibold text-teal-700">
            {columns.filter(c => c.type === "number").length} numeric
          </div>
        )}
        {columns.filter(c => c.type === "string").length > 0 && (
          <div className="px-3 py-1.5 bg-slate-100 rounded-lg text-xs font-semibold text-slate-600">
            {columns.filter(c => c.type === "string").length} categorical
          </div>
        )}
      </div>

      {/* Preview table */}
      <Card className="border-slate-200/60">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold text-slate-800 flex items-center gap-2">
              <TableIcon className="w-4 h-4 text-teal-600" />
              Dataset Preview
              <span className="text-slate-400 font-normal text-xs">(first {rows.length} rows)</span>
            </CardTitle>
            {rows.length > 15 && (
              <button
                className="text-xs text-teal-600 hover:text-teal-700 font-medium"
                onClick={() => setShowAllRows(p => !p)}
              >
                {showAllRows ? "Show less" : `Show all ${rows.length}`}
              </button>
            )}
          </div>
          <p className="text-xs text-slate-400 mt-0.5">Click a column header to view profiling statistics</p>
        </CardHeader>
        <CardContent className="pt-0 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50">
                <TableHead className="text-xs text-slate-400 w-10 sticky left-0 bg-slate-50">#</TableHead>
                {headers.map(h => {
                  const col = columns.find(c => c.name === h);
                  const typeStyle = TYPE_COLORS[col?.type] || TYPE_COLORS.string;
                  const isActive = activeCol === h;
                  return (
                    <TableHead
                      key={h}
                      className={`whitespace-nowrap cursor-pointer select-none transition-colors ${isActive ? "bg-teal-50" : "hover:bg-slate-100"}`}
                      onClick={() => setActiveCol(isActive ? null : h)}
                    >
                      <div className="flex flex-col gap-1 py-0.5">
                        <span className="text-xs font-semibold text-slate-700">{h}</span>
                        {col && (
                          <Badge variant="outline" className={`text-[10px] px-1.5 py-0 h-4 w-fit font-normal border ${typeStyle.badge}`}>
                            {col.type}
                          </Badge>
                        )}
                      </div>
                    </TableHead>
                  );
                })}
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayRows.map((row, i) => (
                <TableRow key={i} className="hover:bg-slate-50/50">
                  <TableCell className="text-xs text-slate-300 font-mono sticky left-0 bg-white">{i + 1}</TableCell>
                  {headers.map(h => {
                    const isEmpty = row[h] === "" || row[h] === null || row[h] === undefined;
                    return (
                      <TableCell
                        key={h}
                        className={`text-xs whitespace-nowrap max-w-[180px] truncate font-mono transition-colors ${activeCol === h ? "bg-teal-50/60" : ""}`}
                      >
                        {isEmpty
                          ? <span className="text-slate-300 italic">null</span>
                          : <span className="text-slate-700">{String(row[h])}</span>
                        }
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Column Profiling Panel */}
      {selectedCol && (
        <Card className="border-teal-200 bg-teal-50/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-slate-800 flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-teal-600" />
              Profiling: <span className="font-mono text-teal-700">{selectedCol.name}</span>
              <Badge variant="outline" className={`text-[10px] border ${(TYPE_COLORS[selectedCol.type] || TYPE_COLORS.string).badge}`}>
                {selectedCol.type}
              </Badge>
              <button
                className="ml-auto text-xs text-slate-400 hover:text-slate-600"
                onClick={() => setActiveCol(null)}
              >✕</button>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            {selectedCol.type === "number"
              ? <NumericProfile col={selectedCol} />
              : <CategoricalProfile col={selectedCol} />
            }
          </CardContent>
        </Card>
      )}

      {/* Profiling Grid — all columns */}
      <div>
        <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
          <BarChart2 className="w-4 h-4 text-teal-600" />
          Full Data Profiling
        </h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {columns.map((col) => {
            const typeStyle = TYPE_COLORS[col.type] || TYPE_COLORS.string;
            return (
              <Card key={col.name} className="border-slate-200/60 hover:border-teal-200 transition-colors cursor-pointer" onClick={() => setActiveCol(col.name)}>
                <CardHeader className="pb-2 pt-4 px-4">
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-xs font-semibold text-slate-800 truncate leading-snug">{col.name}</span>
                    <Badge variant="outline" className={`text-[10px] shrink-0 border ${typeStyle.badge}`}>{col.type}</Badge>
                  </div>
                  {col.missing_pct > 0 && (
                    <div className="flex items-center gap-1 mt-1">
                      <div className="flex-1 h-1 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-amber-400 rounded-full" style={{ width: `${col.missing_pct}%` }} />
                      </div>
                      <span className="text-[10px] text-amber-600 font-medium">{col.missing_pct}% missing</span>
                    </div>
                  )}
                </CardHeader>
                <CardContent className="pt-0 px-4 pb-4">
                  {col.type === "number" ? (
                    <div className="space-y-2">
                      <div className="grid grid-cols-3 gap-1 text-center">
                        {[["Min", col.min], ["Avg", col.avg], ["Max", col.max]].map(([l, v]) => (
                          <div key={l} className="bg-slate-50 rounded-lg py-1.5 px-1">
                            <p className="text-[9px] text-slate-400 uppercase tracking-wide">{l}</p>
                            <p className="text-xs font-bold text-slate-700 truncate">{v ?? "—"}</p>
                          </div>
                        ))}
                      </div>
                      {col.histogram?.length > 0 && (
                        <ResponsiveContainer width="100%" height={55}>
                          <BarChart data={col.histogram} margin={{ top: 2, right: 0, bottom: 0, left: -30 }}>
                            <YAxis tick={false} axisLine={false} />
                            <XAxis dataKey="label" tick={{ fontSize: 8, fill: "#cbd5e1" }} interval="preserveStartEnd" axisLine={false} tickLine={false} />
                            <Tooltip
                              contentStyle={{ fontSize: 10, borderRadius: 6, border: "1px solid #e2e8f0", padding: "2px 8px" }}
                              formatter={(v) => [v, "Count"]}
                            />
                            <Bar dataKey="count" fill="#0ea5e9" fillOpacity={0.8} radius={[2, 2, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-1">
                      {(col.top_values || []).slice(0, 4).map(({ label, count }, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <span className="text-[10px] text-slate-600 truncate flex-1 font-mono">{label}</span>
                          <span className="text-[10px] text-slate-400 font-medium shrink-0">{count}</span>
                          <div className="w-14 h-1.5 bg-slate-100 rounded-full overflow-hidden shrink-0">
                            <div
                              className="h-full rounded-full bg-teal-400"
                              style={{ width: `${Math.round((count / (col.top_values?.[0]?.count || 1)) * 100)}%` }}
                            />
                          </div>
                        </div>
                      ))}
                      {(col.top_values?.length || 0) > 4 && (
                        <p className="text-[10px] text-slate-400">+{col.top_values.length - 4} more values</p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
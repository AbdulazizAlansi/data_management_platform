import React from "react";
import { useLang } from "@/components/LanguageContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from "recharts";

const COLORS = ["#0d9488","#3b82f6","#8b5cf6","#f59e0b","#ef4444","#10b981","#6366f1","#ec4899","#14b8a6","#f97316"];

export default function PlatformStats({ datasets, qualityResults, users }) {
  const { t } = useLang();
  // Datasets by department
  const deptMap = {};
  datasets.forEach(d => { deptMap[d.department || "Unknown"] = (deptMap[d.department || "Unknown"] || 0) + 1; });
  const deptData = Object.entries(deptMap).sort((a,b) => b[1]-a[1]).slice(0,8).map(([name, count]) => ({ name, count }));

  // Datasets by category
  const catMap = {};
  datasets.forEach(d => { catMap[d.category || "Other"] = (catMap[d.category || "Other"] || 0) + 1; });
  const catData = Object.entries(catMap).map(([name, value]) => ({ name, value }));

  // Quality distribution
  const qDist = { Good: 0, "Needs Review": 0, "Poor Quality": 0 };
  qualityResults.forEach(q => { if (qDist[q.quality_status] !== undefined) qDist[q.quality_status]++; });
  const qData = Object.entries(qDist).map(([name, value]) => ({ name, value }));

  // User roles
  const roleMap = {};
  users.forEach(u => { const r = u.role || "user"; roleMap[r] = (roleMap[r] || 0) + 1; });
  const roleData = Object.entries(roleMap).map(([name, value]) => ({ name, value }));

  // Sensitivity breakdown
  const sensMap = {};
  datasets.forEach(d => { sensMap[d.data_sensitivity || "Unknown"] = (sensMap[d.data_sensitivity || "Unknown"] || 0) + 1; });
  const sensData = Object.entries(sensMap).map(([name, value]) => ({ name, value }));

  return (
    <div className="space-y-5">
      {/* Top KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: t["Total Records"],   value: datasets.reduce((s,d) => s + (d.row_count || 0), 0).toLocaleString() },
          { label: t["Total Columns"],   value: datasets.reduce((s,d) => s + (d.column_count || 0), 0).toLocaleString() },
          { label: t["Avg Quality"],     value: qualityResults.length ? (qualityResults.reduce((s,q) => s + q.quality_score, 0) / qualityResults.length).toFixed(1) + "%" : "—" },
          { label: t["Analyzed Datasets"], value: qualityResults.length },
        ].map(({ label, value }) => (
          <Card key={label} className="border-slate-200/60">
            <CardContent className="pt-4 pb-4 text-center">
              <p className="text-2xl font-bold text-slate-900">{value}</p>
              <p className="text-xs text-slate-500 mt-1">{label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Department distribution */}
        <Card className="border-slate-200/60">
          <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold">Datasets by Department</CardTitle></CardHeader>
          <CardContent>
            {deptData.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={deptData} layout="vertical" margin={{ left: 10, right: 20 }}>
                  <XAxis type="number" tick={{ fontSize: 11 }} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={90} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#0d9488" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : <p className="text-sm text-slate-400 text-center py-8">No data</p>}
          </CardContent>
        </Card>

        {/* Quality distribution */}
        <Card className="border-slate-200/60">
          <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold">Data Quality Distribution</CardTitle></CardHeader>
          <CardContent>
            {qData.some(d => d.value > 0) ? (
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={qData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} dataKey="value" paddingAngle={3}>
                    {qData.map((_, i) => (
                      <Cell key={i} fill={["#10b981","#f59e0b","#ef4444"][i]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend iconSize={10} iconType="circle" wrapperStyle={{ fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            ) : <p className="text-sm text-slate-400 text-center py-8">No quality data yet</p>}
          </CardContent>
        </Card>

        {/* Category */}
        <Card className="border-slate-200/60">
          <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold">Datasets by Category</CardTitle></CardHeader>
          <CardContent>
            {catData.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={catData} cx="50%" cy="50%" outerRadius={80} dataKey="value" paddingAngle={2}>
                    {catData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                  <Legend iconSize={10} iconType="circle" wrapperStyle={{ fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
            ) : <p className="text-sm text-slate-400 text-center py-8">No data</p>}
          </CardContent>
        </Card>

        {/* Data sensitivity */}
        <Card className="border-slate-200/60">
          <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold">Data Sensitivity Levels</CardTitle></CardHeader>
          <CardContent>
            {sensData.length > 0 ? (
              <div className="space-y-2 pt-2">
                {sensData.map(({ name, value }) => {
                  const pct = Math.round((value / datasets.length) * 100);
                  const color = { Public: "bg-emerald-500", Internal: "bg-blue-500", Confidential: "bg-amber-500", Restricted: "bg-red-500" }[name] || "bg-slate-400";
                  return (
                    <div key={name} className="space-y-1">
                      <div className="flex justify-between text-xs text-slate-600">
                        <span>{name}</span>
                        <span className="font-medium">{value} ({pct}%)</span>
                      </div>
                      <div className="h-2 bg-slate-100 rounded-full">
                        <div className={`h-2 rounded-full ${color}`} style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : <p className="text-sm text-slate-400 text-center py-8">No data</p>}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
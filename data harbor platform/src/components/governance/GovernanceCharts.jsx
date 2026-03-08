import React from "react";
import {
  BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";

const COLORS = ["#0d9488","#3b82f6","#8b5cf6","#f59e0b","#ef4444","#10b981","#6366f1","#ec4899","#f97316","#64748b"];
const QUALITY_COLORS = { "Good": "#10b981", "Needs Review": "#f59e0b", "Poor Quality": "#ef4444" };

const tooltipStyle = {
  borderRadius: "10px",
  border: "1px solid #e2e8f0",
  boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
  fontSize: "12px",
  background: "#ffffff",
  padding: "10px 14px",
};
const axisStyle = { fontSize: 11, fill: "#94a3b8", fontWeight: 500 };

function ChartCard({ title, subtitle, children }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 hover:shadow-md transition-shadow duration-200">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-slate-800">{title}</h3>
        {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}

function EmptyState({ message }) {
  return (
    <div className="h-[220px] flex flex-col items-center justify-center gap-2">
      <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
        <svg className="w-5 h-5 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      </div>
      <p className="text-sm text-slate-400">{message}</p>
    </div>
  );
}

const pieLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
  if (percent < 0.07) return null;
  const RADIAN = Math.PI / 180;
  const r = innerRadius + (outerRadius - innerRadius) * 0.55;
  const x = cx + r * Math.cos(-midAngle * RADIAN);
  const y = cy + r * Math.sin(-midAngle * RADIAN);
  return <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={10} fontWeight={700}>{`${(percent * 100).toFixed(0)}%`}</text>;
};

// Quality Distribution Pie
export function QualityDistributionChart({ qualityResults }) {
  const counts = { "Good": 0, "Needs Review": 0, "Poor Quality": 0 };
  qualityResults.forEach(q => { if (counts[q.quality_status] !== undefined) counts[q.quality_status]++; });
  const data = Object.entries(counts).map(([name, value]) => ({ name, value })).filter(d => d.value > 0);

  return (
    <ChartCard title="Data Quality Distribution" subtitle="Quality status breakdown across all datasets">
      {data.length === 0 ? <EmptyState message="No quality reports yet" /> : (
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie data={data} cx="50%" cy="50%" outerRadius={85} innerRadius={48} dataKey="value" paddingAngle={3} labelLine={false} label={pieLabel}>
              {data.map((entry) => <Cell key={entry.name} fill={QUALITY_COLORS[entry.name]} stroke="none" />)}
            </Pie>
            <Tooltip contentStyle={tooltipStyle} formatter={(v, n) => [v, n]} />
            <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }} iconType="circle" iconSize={7} />
          </PieChart>
        </ResponsiveContainer>
      )}
    </ChartCard>
  );
}

// Datasets by Department Bar
export function DepartmentBarChart({ datasets }) {
  const counts = {};
  datasets.forEach(d => { const k = d.department || "Unknown"; counts[k] = (counts[k] || 0) + 1; });
  const data = Object.entries(counts).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value).slice(0, 10);

  return (
    <ChartCard title="Datasets by Department" subtitle="Number of datasets per business unit">
      {data.length === 0 ? <EmptyState message="No department data yet" /> : (
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={data} layout="vertical" margin={{ top: 0, right: 16, bottom: 0, left: 80 }} barSize={12}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
            <XAxis type="number" tick={axisStyle} allowDecimals={false} axisLine={false} tickLine={false} />
            <YAxis type="category" dataKey="name" tick={axisStyle} width={78} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "#f8fafc" }} formatter={(v) => [v, "Datasets"]} />
            <Bar dataKey="value" name="Datasets" radius={[0, 6, 6, 0]}>
              {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </ChartCard>
  );
}

// Datasets by Category Bar
export function CategoryBarChart({ datasets }) {
  const counts = {};
  datasets.forEach(d => { const k = d.category || "Other"; counts[k] = (counts[k] || 0) + 1; });
  const data = Object.entries(counts).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);

  return (
    <ChartCard title="Datasets by Category" subtitle="Classification breakdown of the data catalog">
      {data.length === 0 ? <EmptyState message="No category data yet" /> : (
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={data} margin={{ top: 4, right: 16, bottom: 32, left: 0 }} barSize={20}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis dataKey="name" tick={{ ...axisStyle, fontSize: 10 }} axisLine={false} tickLine={false} angle={-25} textAnchor="end" interval={0} />
            <YAxis tick={axisStyle} allowDecimals={false} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "#f8fafc" }} formatter={(v) => [v, "Datasets"]} />
            <Bar dataKey="value" name="Datasets" radius={[6, 6, 0, 0]}>
              {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </ChartCard>
  );
}

// Missing Metadata Bar
export function MissingMetadataChart({ datasets }) {
  const fields = [
    { label: "Description", key: "description" },
    { label: "Owner",       key: "owner" },
    { label: "Tags",        key: "tags" },
    { label: "Region",      key: "region" },
    { label: "Source",      key: "source" },
    { label: "Sensitivity", key: "data_sensitivity" },
  ];
  const total = datasets.length;
  const data = fields.map(f => ({
    name: f.label,
    missing: datasets.filter(d => !d[f.key]).length,
    pct: total > 0 ? Math.round((datasets.filter(d => !d[f.key]).length / total) * 100) : 0,
  })).sort((a, b) => b.missing - a.missing);

  return (
    <ChartCard title="Missing Metadata Fields" subtitle="Datasets missing key metadata per field">
      {total === 0 ? <EmptyState message="No datasets yet" /> : (
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={data} layout="vertical" margin={{ top: 0, right: 48, bottom: 0, left: 72 }} barSize={12}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
            <XAxis type="number" tick={axisStyle} allowDecimals={false} axisLine={false} tickLine={false} domain={[0, total]} />
            <YAxis type="category" dataKey="name" tick={axisStyle} width={70} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "#f8fafc" }} formatter={(v, n, p) => [`${v} datasets (${p.payload.pct}%)`, "Missing"]} />
            <Bar dataKey="missing" name="Missing" radius={[0, 6, 6, 0]}>
              {data.map((entry) => (
                <Cell key={entry.name} fill={entry.pct > 60 ? "#ef4444" : entry.pct > 30 ? "#f59e0b" : "#10b981"} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </ChartCard>
  );
}
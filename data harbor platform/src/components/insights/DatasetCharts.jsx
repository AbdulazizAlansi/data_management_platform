import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from "recharts";
import { BarChart3 } from "lucide-react";

const COLORS = ["#0d9488", "#06b6d4", "#6366f1", "#f59e0b", "#ef4444", "#8b5cf6", "#10b981", "#ec4899", "#f97316", "#64748b"];

function buildFrequencyData(rows, colName, limit = 10) {
  const counts = {};
  rows.forEach(row => {
    const v = row[colName];
    if (v !== "" && v !== null && v !== undefined) {
      const key = String(v).trim();
      counts[key] = (counts[key] || 0) + 1;
    }
  });
  return Object.entries(counts)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, limit);
}

function StringColumnChart({ col, rows }) {
  const data = buildFrequencyData(rows, col.name);
  if (data.length < 2) return null;

  // Use pie for low cardinality, bar for higher
  const usePie = data.length <= 6;

  return (
    <Card className="border-slate-200/60">
      <CardHeader className="pb-2">
        <CardTitle className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
          <BarChart3 className="w-3.5 h-3.5 text-teal-500" />
          {col.name} — Distribution
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={200}>
          {usePie ? (
            <PieChart>
              <Pie data={data} cx="50%" cy="50%" outerRadius={70} innerRadius={30} dataKey="value" paddingAngle={2}>
                {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: "8px", border: "1px solid #e2e8f0", fontSize: "11px" }} />
              <Legend wrapperStyle={{ fontSize: "10px" }} />
            </PieChart>
          ) : (
            <BarChart data={data} margin={{ top: 4, right: 4, bottom: 20, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fontSize: 9, fill: "#94a3b8" }} angle={-30} textAnchor="end" interval={0} />
              <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} />
              <Tooltip contentStyle={{ borderRadius: "8px", border: "1px solid #e2e8f0", fontSize: "11px" }} />
              <Bar dataKey="value" fill="#0d9488" radius={[4, 4, 0, 0]} />
            </BarChart>
          )}
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

function NumericColumnChart({ col, rows }) {
  // Build a simple histogram-like chart with 8 buckets
  const values = rows
    .map(r => parseFloat(r[col.name]))
    .filter(v => !isNaN(v));

  if (values.length < 3) return null;

  const min = Math.min(...values);
  const max = Math.max(...values);
  if (min === max) return null;

  const buckets = 8;
  const size = (max - min) / buckets;
  const bins = Array.from({ length: buckets }, (_, i) => ({
    name: `${(min + i * size).toFixed(1)}`,
    count: 0,
  }));
  values.forEach(v => {
    const idx = Math.min(Math.floor((v - min) / size), buckets - 1);
    bins[idx].count++;
  });

  return (
    <Card className="border-slate-200/60">
      <CardHeader className="pb-2">
        <CardTitle className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
          <BarChart3 className="w-3.5 h-3.5 text-blue-500" />
          {col.name} — Distribution
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={bins} margin={{ top: 4, right: 4, bottom: 20, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="name" tick={{ fontSize: 9, fill: "#94a3b8" }} angle={-30} textAnchor="end" />
            <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} />
            <Tooltip contentStyle={{ borderRadius: "8px", border: "1px solid #e2e8f0", fontSize: "11px" }} />
            <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

export default function DatasetCharts({ dataset }) {
  const columns = dataset.columns_info || [];
  const rows = dataset.sample_rows || [];

  if (columns.length === 0 || rows.length === 0) {
    return (
      <Card className="border-slate-200/60">
        <CardContent className="py-12 text-center">
          <BarChart3 className="w-8 h-8 text-slate-300 mx-auto mb-3" />
          <p className="text-sm text-slate-500">No charts available. Upload a CSV or Excel file to auto-generate charts.</p>
        </CardContent>
      </Card>
    );
  }

  const stringCols = columns.filter(c => c.type === "string").slice(0, 4);
  const numericCols = columns.filter(c => c.type === "number").slice(0, 4);

  const charts = [];
  stringCols.forEach(col => charts.push(<StringColumnChart key={`s-${col.name}`} col={col} rows={rows} />));
  numericCols.forEach(col => charts.push(<NumericColumnChart key={`n-${col.name}`} col={col} rows={rows} />));

  const rendered = charts.filter(Boolean);

  if (rendered.length === 0) {
    return (
      <Card className="border-slate-200/60">
        <CardContent className="py-12 text-center">
          <BarChart3 className="w-8 h-8 text-slate-300 mx-auto mb-3" />
          <p className="text-sm text-slate-500">Not enough data variation to generate charts.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid sm:grid-cols-2 gap-4">
      {rendered}
    </div>
  );
}
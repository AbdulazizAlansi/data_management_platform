import React from "react";
import {
  BarChart, Bar, PieChart, Pie, Cell, LineChart, Line, Area, AreaChart,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";
import moment from "moment";
import { useLang } from "@/components/LanguageContext";

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
    <div className="h-[240px] flex flex-col items-center justify-center gap-2">
      <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
        <svg className="w-5 h-5 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      </div>
      <p className="text-sm text-slate-400">{message}</p>
    </div>
  );
}

const CustomDot = ({ cx, cy, fill }) => (
  <circle cx={cx} cy={cy} r={4} fill={fill} stroke="#fff" strokeWidth={2} />
);

// ── Datasets by Department ─────────────────────────────────────────────────
export function DepartmentChart({ datasets }) {
  const { t, lang } = useLang();
  const counts = {};
  datasets.forEach(d => { const k = d.department || "Unknown"; counts[k] = (counts[k] || 0) + 1; });
  const data = Object.entries(counts).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value).slice(0, 8);

  const renderCustomTick = (props) => {
    const { x, y, payload } = props;
    const text = payload.value || "";
    return (
      <g transform={`translate(${x},${y})`}>
        <text x={0} y={0} dy={4} textAnchor="end" fontSize={11} fill="#94a3b8" fontWeight={500} style={{ wordWrap: "break-word" }}>
          {text}
        </text>
      </g>
    );
  };

  return (
    <ChartCard title={t["Datasets by Department"]} subtitle={t["Number of datasets per business unit"]}>
      {data.length === 0 ? <EmptyState message={t["No department data yet"]} /> : (
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={data} layout="vertical" margin={{ top: 0, right: 20, bottom: 0, left: 140 }} barSize={14}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
            <XAxis type="number" tick={axisStyle} allowDecimals={false} axisLine={false} tickLine={false} />
            <YAxis type="category" dataKey="name" tick={renderCustomTick} width={140} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "#f8fafc", radius: 4 }} formatter={(v) => [v, "Datasets"]} />
            <Bar dataKey="value" name="Datasets" radius={[0, 6, 6, 0]}>
              {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </ChartCard>
  );
}

// ── Datasets by Category ──────────────────────────────────────────────────
export function CategoryPieChart({ datasets }) {
  const { t } = useLang();
  const counts = {};
  datasets.forEach(d => { const k = d.category || "Other"; counts[k] = (counts[k] || 0) + 1; });
  const data = Object.entries(counts).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);

  const renderLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
    if (percent < 0.07) return null;
    const RADIAN = Math.PI / 180;
    const r = innerRadius + (outerRadius - innerRadius) * 0.55;
    const x = cx + r * Math.cos(-midAngle * RADIAN);
    const y = cy + r * Math.sin(-midAngle * RADIAN);
    return <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={10} fontWeight={700}>{`${(percent * 100).toFixed(0)}%`}</text>;
  };

  return (
    <ChartCard title={t["Datasets by Category"]} subtitle={t["Classification breakdown of the data catalog"]}>
      {data.length === 0 ? <EmptyState message={t["No category data yet"]} /> : (
        <ResponsiveContainer width="100%" height={240}>
          <PieChart>
            <Pie data={data} cx="50%" cy="50%" outerRadius={90} innerRadius={50} dataKey="value" paddingAngle={2} labelLine={false} label={renderLabel}>
              {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} stroke="none" />)}
            </Pie>
            <Tooltip contentStyle={tooltipStyle} />
            <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }} iconType="circle" iconSize={7} />
          </PieChart>
        </ResponsiveContainer>
      )}
    </ChartCard>
  );
}

// ── Data Quality Distribution ─────────────────────────────────────────────
export function QualityOverviewChart({ qualityResults }) {
  const { t } = useLang();
  const counts = { "Good": 0, "Needs Review": 0, "Poor Quality": 0 };
  qualityResults.forEach(q => { if (counts[q.quality_status] !== undefined) counts[q.quality_status]++; });
  const data = Object.entries(counts).map(([name, value]) => ({ name: t[name] || name, value })).filter(d => d.value > 0);

  const renderLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
    if (percent < 0.07) return null;
    const RADIAN = Math.PI / 180;
    const r = innerRadius + (outerRadius - innerRadius) * 0.55;
    const x = cx + r * Math.cos(-midAngle * RADIAN);
    const y = cy + r * Math.sin(-midAngle * RADIAN);
    return <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={10} fontWeight={700}>{`${(percent * 100).toFixed(0)}%`}</text>;
  };

  return (
    <ChartCard title={t["Data Quality Distribution"]} subtitle={t["Quality status breakdown across all datasets"]}>
      {data.length === 0 ? <EmptyState message={t["No quality reports yet"]} /> : (
        <ResponsiveContainer width="100%" height={240}>
          <PieChart>
            <Pie data={data} cx="50%" cy="50%" outerRadius={90} innerRadius={50} dataKey="value" paddingAngle={3} labelLine={false} label={renderLabel}>
              {data.map((entry) => {
                const keyMap = { [t["Good"]]: "Good", [t["Needs Review"]]: "Needs Review", [t["Poor Quality"]]: "Poor Quality" };
                const originalName = keyMap[entry.name] || entry.name;
                return <Cell key={entry.name} fill={QUALITY_COLORS[originalName]} stroke="none" />;
              })}
            </Pie>
            <Tooltip contentStyle={tooltipStyle} />
            <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }} iconType="circle" iconSize={7} />
          </PieChart>
        </ResponsiveContainer>
      )}
    </ChartCard>
  );
}

// ── Dataset Upload Trends ─────────────────────────────────────────────────
export function TrendLineChart({ datasets, qualityResults }) {
  const { t } = useLang();
  const buckets = {};
  for (let i = 5; i >= 0; i--) {
    const key = moment().subtract(i, "months").format("MMM YYYY");
    buckets[key] = { name: moment().subtract(i, "months").format("MMM"), month: key, uploads: 0, scores: [] };
  }
  datasets.forEach(d => {
    const key = moment(d.created_date).format("MMM YYYY");
    if (buckets[key]) buckets[key].uploads++;
  });
  qualityResults.forEach(q => {
    const key = moment(q.created_date).format("MMM YYYY");
    if (buckets[key] && q.quality_score != null) buckets[key].scores.push(q.quality_score);
  });
  const data = Object.values(buckets).map(b => ({
    name: b.name,
    uploads: b.uploads,
    avgQuality: b.scores.length > 0 ? Math.round(b.scores.reduce((a, c) => a + c, 0) / b.scores.length) : null,
  }));

  return (
    <ChartCard title={t["Upload Trends"]} subtitle={t["Datasets uploaded & average quality over last 6 months"]}>
      <ResponsiveContainer width="100%" height={240}>
        <AreaChart data={data} margin={{ top: 5, right: 16, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id="tealGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="#0d9488" stopOpacity={0.15} />
              <stop offset="95%" stopColor="#0d9488" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="violetGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="#6366f1" stopOpacity={0.12} />
              <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis dataKey="name" tick={axisStyle} axisLine={false} tickLine={false} />
          <YAxis yAxisId="left" tick={axisStyle} allowDecimals={false} axisLine={false} tickLine={false} />
          <YAxis yAxisId="right" orientation="right" tick={axisStyle} domain={[0, 100]} unit="%" axisLine={false} tickLine={false} />
          <Tooltip contentStyle={tooltipStyle} />
          <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "4px" }} iconType="circle" iconSize={7} />
          <Area yAxisId="left" type="monotone" dataKey="uploads" stroke="#0d9488" strokeWidth={2.5} fill="url(#tealGrad)" name={t["Upload Trends"] || "Uploads"} connectNulls dot={<CustomDot fill="#0d9488" />} activeDot={{ r: 6, fill: "#0d9488" }} />
          <Area yAxisId="right" type="monotone" dataKey="avgQuality" stroke="#6366f1" strokeWidth={2.5} fill="url(#violetGrad)" name={t["Avg Quality"] || "Avg Quality %"} connectNulls dot={<CustomDot fill="#6366f1" />} activeDot={{ r: 6, fill: "#6366f1" }} />
        </AreaChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
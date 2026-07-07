"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
} from "recharts";

import {
  Users, TrendingUp, DollarSign, Clock, Award,
  Target, HeartHandshake, RefreshCw,
  Download, Filter,
  BarChart3,
  UserPlus, UserMinus, CalendarDays, GraduationCap,
  Zap,
} from "lucide-react";

// ── Types ────────────────────────────────────────────────────
interface Metric {
  id: string;
  metricName: string;
  value: number;
  date: string;
}

type CategoryDef = {
  id: string;
  label: string;
  icon: React.ElementType;
  color: string;
  lightBg: string;
  metricKeys: string[];   // substrings to match metricName
};

// ── Category Config ──────────────────────────────────────────
const CATEGORIES: CategoryDef[] = [
  { id: "workforce",        label: "Workforce & Headcount",     icon: Users,         color: "#6366f1", lightBg: "bg-indigo-50",   metricKeys: ["Total Employees", "New Hires", "Active", "Headcount", "Workforce", "FTE", "Part-Time", "Contractor", "Headcount Growth"] },
  { id: "turnover",         label: "Turnover & Attrition",      icon: UserMinus,     color: "#ef4444", lightBg: "bg-red-50",      metricKeys: ["Turnover", "Attrition", "Retention", "Voluntary", "Involuntary", "Departure", "Resignation"] },
  { id: "tenure",           label: "Tenure & Experience",       icon: Clock,         color: "#f59e0b", lightBg: "bg-amber-50",     metricKeys: ["Tenure", "Age", "Year of Service", "Years of Service", "Avg Age"] },
  { id: "recruitment",      label: "Recruitment & Hiring",      icon: UserPlus,      color: "#10b981", lightBg: "bg-emerald-50",   metricKeys: ["Time to Hire", "Cost per Hire", "Offer", "Applicants", "Interview", "Recruitment", "Sourcing", "Hire"] },
  { id: "attendance",       label: "Attendance & Absenteeism",  icon: CalendarDays,  color: "#8b5cf6", lightBg: "bg-violet-50",    metricKeys: ["Absenteeism", "OT Hours", "Overtime", "Sick Days", "Presenteeism", "Attendance", "Late", "No-Show"] },
  { id: "payroll",          label: "Payroll & Compensation",    icon: DollarSign,    color: "#06b6d4", lightBg: "bg-cyan-50",      metricKeys: ["Avg Salary", "Total Payroll", "Salary", "Compensation", "Payroll", "Bonus", "Allowance", "Median"] },
  { id: "performance",      label: "Performance",               icon: Award,         color: "#f97316", lightBg: "bg-orange-50",    metricKeys: ["Performance", "Score", "Rating", "Promotion", "Top Performer", "Goal", "Review"] },
  { id: "learning",         label: "Learning & Development",    icon: GraduationCap, color: "#14b8a6", lightBg: "bg-teal-50",      metricKeys: ["Training", "L&D", "Course", "Learning", "Certification", "Development", "Completion Rate"] },
  { id: "diversity",        label: "Diversity & Inclusion",     icon: HeartHandshake,color: "#ec4899", lightBg: "bg-pink-50",      metricKeys: ["Diversity", "Gender", "Nationalit", "Age Group", "Minority", "Inclusion", "Equity"] },
  { id: "engagement",       label: "Engagement & Satisfaction", icon: Target,        color: "#22c55e", lightBg: "bg-green-50",     metricKeys: ["eNPS", "Satisfaction", "Engagement", "Morale", "Wellbeing", "Culture", "Happiness"] },
];

function classifyMetric(name: string): string {
  for (const cat of CATEGORIES) {
    for (const key of cat.metricKeys) {
      if (name.toLowerCase().includes(key.toLowerCase())) return cat.id;
    }
  }
  return "workforce"; // fallback
}

function metricColor(name: string): { color: string; bg: string } {
  for (const cat of CATEGORIES) {
    for (const key of cat.metricKeys) {
      if (name.toLowerCase().includes(key.toLowerCase())) {
        return { color: cat.color, bg: cat.lightBg };
      }
    }
  }
  return { color: "#6366f1", bg: "bg-indigo-50" };
}

function isPercentage(name: string): boolean {
  return /%|rate|rate\s*\(|score|completion|satisfaction/i.test(name);
}

function isCurrency(name: string): boolean {
  return /salary|payroll|cost.*hire|spend|budget|allowance|bonus|compensation/i.test(name);
}

function formatMetricValue(name: string, val: number): string {
  if (isCurrency(name)) return `ETB ${val.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
  if (isPercentage(name)) return `${val.toFixed(1)}%`;
  if (Number.isInteger(val)) return val.toLocaleString();
  return val.toFixed(1);
}

// ── SVG Gauge Component ─────────────────────────────────────
function GaugeChart({ value, max = 100, label, color = "#6366f1" }: { value: number; max?: number; label: string; color?: string }) {
  const pct = Math.min(value / max, 1);
  const angle = pct * 180;
  const rad = (angle * Math.PI) / 180;
  const r = 50;
  const cx = 60;
  const cy = 60;
  const x1 = cx - r * Math.cos(rad);
  const y1 = cy - r * Math.sin(rad);
  const x2 = cx + r;
  const y2 = cy;

  const gradientId = `gauge-grad-${label.replace(/\s+/g, "-")}`;

  return (
    <div className="flex flex-col items-center">
      <svg width="120" height="90" viewBox="0 0 120 90" className="overflow-visible">
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#e2e8f0" />
            <stop offset={`${pct * 100}%`} stopColor={color} />
            <stop offset={`${pct * 100}%`} stopColor="#e2e8f0" />
            <stop offset="100%" stopColor="#e2e8f0" />
          </linearGradient>
        </defs>
        {/* Background arc */}
        <path
          d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
          fill="none"
          stroke="#e2e8f0"
          strokeWidth="12"
          strokeLinecap="round"
        />
        {/* Value arc */}
        <path
          d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${x1} ${y1}`}
          fill="none"
          stroke={`url(#${gradientId})`}
          strokeWidth="12"
          strokeLinecap="round"
          className="transition-all duration-700"
        />
        {/* Dot at end */}
        {pct > 0.05 && (
          <circle cx={x1} cy={y1} r="4" fill={color} className="transition-all duration-700">
            <animate attributeName="r" values="4;5;4" dur="2s" repeatCount="indefinite" />
          </circle>
        )}
        <text x={cx} y={cy + 5} textAnchor="middle" fontSize="16" fontWeight="bold" fill="#0f172a">
          {formatMetricValue(label, value)}
        </text>
      </svg>
      <span className="text-[10px] text-slate-500 font-medium text-center leading-tight mt-0.5 max-w-[100px]">{label}</span>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
//  MAIN COMPONENT
// ══════════════════════════════════════════════════════════════
export default function HRAnalyticsDashboard() {
  const [metrics, setMetrics] = useState<Metric[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string | "all">("all");
  const [viewMode, setViewMode] = useState<"visual" | "table">("visual");

  const API_BASE = "http://localhost:3002/api/v1";

  const loadData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token") || "";
      const res = await fetch(`${API_BASE}/modules/human-resources/hr-analytics`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (json?.data && Array.isArray(json.data)) {
        setMetrics(json.data);
      }
    } catch (err) {
      console.error("Failed to load HR Analytics:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  // ── Derived data ───────────────────────────────────────────

  const { categorized, kpis } = useMemo(() => {
    const grouped: Record<string, Metric[]> = {};
    for (const m of metrics) {
      const cat = classifyMetric(m.metricName);
      if (!grouped[cat]) grouped[cat] = [];
      grouped[cat].push(m);
    }

    // KPI cards — pick key metrics
    const findKPI = (names: string[]): { metric?: Metric; idx: number } => {
      for (const n of names) {
        const idx = metrics.findIndex(m => m.metricName.toLowerCase() === n.toLowerCase());
        if (idx >= 0) return { metric: metrics[idx], idx };
      }
      return { idx: -1 };
    };

    const totalEmp = findKPI(["Total Employees", "Headcount"]).metric;
    const turnover = findKPI(["Employee Turnover Rate (%)", "Turnover Rate (%)", "turnover"]).metric;
    const retention = findKPI(["Employee Retention Rate (%)", "Retention Rate"]).metric;
    const avgSalary = findKPI(["Average Salary (ETB)", "Avg Salary (ETB)"]).metric;
    const avgScore = findKPI(["Performance Avg Score", "Average Performance Score"]).metric;
    const enps = findKPI(["Employee eNPS Score", "eNPS Score"]).metric;
    const absenteeism = findKPI(["Absenteeism Rate (%)", "Absenteeism"]).metric;
    const training = findKPI(["Training Completion Rate (%)", "Completion Rate"]).metric;
    const totalPayroll = findKPI(["Total Payroll (ETB)", "Total Payroll"]).metric;

    return {
      categorized: grouped,
      kpis: { totalEmp, turnover, retention, avgSalary, avgScore, enps, absenteeism, training, totalPayroll },
    };
  }, [metrics]);

  const filteredCategories = useMemo(() => {
    if (activeCategory === "all") return CATEGORIES;
    return CATEGORIES.filter(c => c.id === activeCategory);
  }, [activeCategory]);

  // ── Prepare chart data per category ──
  const { chartData } = useMemo(() => {
    const chart: Record<string, Metric[]> = {};
    for (const [catId, items] of Object.entries(categorized)) {
      chart[catId] = items
        .filter(m => !isPercentage(m.metricName) && !isCurrency(m.metricName) && Number.isInteger(m.value))
        .sort((a, b) => b.value - a.value)
        .slice(0, 8);
    }
    return { chartData: chart };
  }, [categorized]);

  // ── Download CSV ──
  const handleExport = () => {
    if (metrics.length === 0) return;
    const headers = "Metric,Value,Category,Date\n";
    const rows = metrics.map(m => {
      const cat = classifyMetric(m.metricName);
      const catLabel = CATEGORIES.find(c => c.id === cat)?.label || cat;
      return `"${m.metricName}",${m.value},"${catLabel}","${m.date}"`;
    }).join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "hr-analytics-export.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  // ── Loading State ──
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <span className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <span className="text-sm text-slate-500">Loading HR Analytics data...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20">

      {/* ── Header ─────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
            <span className="w-8 h-8 rounded-xl bg-indigo-100 flex items-center justify-center">
              <BarChart3 size={16} className="text-indigo-600" />
            </span>
            HR Analytics Dashboard
          </h1>
          <p className="text-slate-500 text-sm font-light mt-1">
            {metrics.length} metrics tracked &middot; Last updated: {metrics.length > 0 ? new Date(Math.max(...metrics.map(m => new Date(m.date).getTime()))).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—"}
          </p>
        </div>
        <div className="flex gap-2 items-center">
          {/* View toggle */}
          <div className="flex bg-slate-100 rounded-xl p-0.5">
            <button
              onClick={() => setViewMode("visual")}
              className={`px-3 py-1.5 rounded-[10px] text-xs font-medium transition-all ${viewMode === "visual" ? "bg-white shadow-sm text-slate-900" : "text-slate-500 hover:text-slate-700"}`}
            >
              <BarChart3 size={13} className="inline mr-1" /> Visual
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={`px-3 py-1.5 rounded-[10px] text-xs font-medium transition-all ${viewMode === "table" ? "bg-white shadow-sm text-slate-900" : "text-slate-500 hover:text-slate-700"}`}
            >
              <Filter size={13} className="inline mr-1" /> Table
            </button>
          </div>
          <button onClick={handleExport} className="flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors">
            <Download size={13} /> Export
          </button>
          <button onClick={loadData} className="flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors">
            <RefreshCw size={13} /> Refresh
          </button>
        </div>
      </div>

      {viewMode === "visual" ? (
        <>
          {/* ── KPI Grid ────────────────────────────────── */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            <KPICard icon={Users} label="Headcount" value={kpis.totalEmp ? formatMetricValue(kpis.totalEmp.metricName, kpis.totalEmp.value) : "—"} color="text-indigo-600" bg="bg-indigo-50" />
            <KPICard icon={TrendingUp} label="Turnover" value={kpis.turnover ? formatMetricValue(kpis.turnover.metricName, kpis.turnover.value) : "—"} color={kpis.turnover && kpis.turnover.value > 15 ? "text-red-600" : "text-emerald-600"} bg={kpis.turnover && kpis.turnover.value > 15 ? "bg-red-50" : "bg-emerald-50"} />
            <KPICard icon={Target} label="Retention" value={kpis.retention ? formatMetricValue(kpis.retention.metricName, kpis.retention.value) : "—"} color="text-emerald-600" bg="bg-emerald-50" />
            <KPICard icon={DollarSign} label="Avg Salary" value={kpis.avgSalary ? formatMetricValue(kpis.avgSalary.metricName, kpis.avgSalary.value) : "—"} color="text-cyan-600" bg="bg-cyan-50" />
            <KPICard icon={DollarSign} label="Total Payroll" value={kpis.totalPayroll ? formatMetricValue(kpis.totalPayroll.metricName, kpis.totalPayroll.value) : "—"} color="text-blue-600" bg="bg-blue-50" />
            <KPICard icon={Award} label="Perf. Score" value={kpis.avgScore ? formatMetricValue(kpis.avgScore.metricName, kpis.avgScore.value) : "—"} color="text-orange-600" bg="bg-orange-50" />
            <KPICard icon={Zap} label="eNPS" value={kpis.enps ? formatMetricValue(kpis.enps.metricName, kpis.enps.value) : "—"} color={kpis.enps && kpis.enps.value >= 30 ? "text-emerald-600" : "text-amber-600"} bg={kpis.enps && kpis.enps.value >= 30 ? "bg-emerald-50" : "bg-amber-50"} />
            <KPICard icon={CalendarDays} label="Absenteeism" value={kpis.absenteeism ? formatMetricValue(kpis.absenteeism.metricName, kpis.absenteeism.value) : "—"} color={kpis.absenteeism && kpis.absenteeism.value > 5 ? "text-red-600" : "text-emerald-600"} bg={kpis.absenteeism && kpis.absenteeism.value > 5 ? "bg-red-50" : "bg-emerald-50"} />
            <KPICard icon={GraduationCap} label="Training" value={kpis.training ? formatMetricValue(kpis.training.metricName, kpis.training.value) : "—"} color="text-teal-600" bg="bg-teal-50" />
          </div>

          {/* ── Category Tabs ───────────────────────────── */}
          <div className="flex gap-1.5 overflow-x-auto pb-2 -mx-1 px-1">
            <button
              onClick={() => setActiveCategory("all")}
              className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-[10px] text-xs font-medium transition-all ${
                activeCategory === "all" ? "bg-slate-900 text-white shadow-sm" : "bg-slate-50 text-slate-600 hover:bg-slate-100"
              }`}
            >
              <BarChart3 size={12} /> All Categories
            </button>
            {CATEGORIES.map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-[10px] text-xs font-medium transition-all ${
                  activeCategory === cat.id ? "bg-slate-900 text-white shadow-sm" : "bg-slate-50 text-slate-600 hover:bg-slate-100"
                }`}
              >
                <cat.icon size={12} /> {cat.label}
              </button>
            ))}
          </div>

          {/* ── Category Sections ────────────────────────── */}
          <AnimatePresence mode="wait">
            {filteredCategories.map(cat => {
              const catMetrics = categorized[cat.id] || [];
              if (catMetrics.length === 0) return null;

              const barItems = chartData[cat.id] || [];

              // Percentage metrics for gauge display
              const pctMetrics = catMetrics.filter(m => isPercentage(m.metricName));

              // Currency metrics
              const currencyMetrics = catMetrics.filter(m => isCurrency(m.metricName));

              return (
                <motion.div
                  key={cat.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.25 }}
                  className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden"
                >
                  {/* Section header */}
                  <div className={`px-5 py-3.5 ${cat.lightBg} border-b border-slate-100 flex items-center justify-between`}>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: cat.color + "15" }}>
                        <cat.icon size={15} style={{ color: cat.color }} />
                      </div>
                      <div>
                        <h2 className="text-sm font-bold text-slate-900">{cat.label}</h2>
                        <p className="text-[11px] text-slate-500">{catMetrics.length} metrics tracked</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono text-slate-400 bg-white/60 px-2 py-1 rounded-md">{catMetrics.length}</span>
                  </div>

                  <div className="p-5">
                    {/* Grid layout: gauges (left) + bar chart (right) */}
                    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                      {/* Gauges / Mini cards */}
                      <div className="lg:col-span-2 space-y-4">
                        {/* % metrics as gauges */}
                        {pctMetrics.length > 0 && (
                          <div>
                            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-3">Rate Metrics</p>
                            <div className="grid grid-cols-3 gap-2">
                              {pctMetrics.slice(0, 6).map(m => (
                                <GaugeChart key={m.id} value={m.value} label={m.metricName} color={cat.color} />
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Currency metrics as cards */}
                        {currencyMetrics.length > 0 && (
                          <div>
                            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2">Financial Metrics</p>
                            <div className="grid grid-cols-2 gap-2">
                              {currencyMetrics.slice(0, 6).map(m => (
                                <div key={m.id} className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                                  <div className="text-[9px] font-medium text-slate-500 uppercase tracking-wide mb-0.5">{m.metricName.replace(/\(ETB\)/g, "").trim()}</div>
                                  <div className="text-sm font-bold text-slate-900">{formatMetricValue(m.metricName, m.value)}</div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Remaining metrics as list */}
                        {catMetrics.filter(m => !isPercentage(m.metricName) && !isCurrency(m.metricName)).slice(0, 8).map(m => (
                          <div key={m.id} className="flex items-center justify-between py-1.5 border-b border-slate-50 last:border-0">
                            <span className="text-xs text-slate-600">{m.metricName}</span>
                            <span className="text-xs font-bold text-slate-900">{formatMetricValue(m.metricName, m.value)}</span>
                          </div>
                        ))}
                      </div>

                      {/* Bar Chart */}
                      <div className="lg:col-span-3">
                        {barItems.length > 0 ? (
                          <div>
                            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-3">Metric Comparison</p>
                            <ResponsiveContainer width="100%" height={Math.max(200, barItems.length * 40)}>
                              <BarChart data={barItems.map(m => ({ name: m.metricName.replace(/\([^)]*\)/g, "").trim(), value: m.value }))} layout="vertical" margin={{ left: 0, right: 20, top: 5, bottom: 5 }}>
                                <XAxis type="number" tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                                <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: "#64748b" }} width={140} axisLine={false} tickLine={false} />
                                <Tooltip
                                  contentStyle={{ borderRadius: "8px", border: "1px solid #e2e8f0", boxShadow: "0 4px 12px rgba(0,0,0,0.05)", fontSize: "12px" }}
                                  formatter={(val: number) => [val.toLocaleString(), "Value"]}
                                />
                                <Bar dataKey="value" fill={cat.color} radius={[0, 4, 4, 0]} barSize={16}>
                                  {barItems.map((item, idx) => (
                                    <Cell key={item.metricName || idx} fill={cat.color} opacity={0.7 + (1 - idx / barItems.length) * 0.3} />
                                  ))}
                                </Bar>
                              </BarChart>
                            </ResponsiveContainer>
                          </div>
                        ) : (
                          <div className="flex items-center justify-center h-full min-h-[200px] text-slate-400 text-xs">
                            <div className="text-center">
                              <BarChart3 size={24} className="mx-auto mb-2 opacity-30" />
                              <p>No comparable metrics</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {/* Empty state */}
          {metrics.length === 0 && (
            <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-12 text-center">
              <div className="w-16 h-16 rounded-full bg-indigo-50 flex items-center justify-center mx-auto mb-4">
                <BarChart3 size={28} className="text-indigo-400" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-1">No HR Analytics Data Yet</h3>
              <p className="text-sm text-slate-500 max-w-md mx-auto">
                Seed the database with HR analytics metrics to see visualizations here.
                Metrics like headcount, turnover, and engagement scores will appear automatically.
              </p>
            </div>
          )}
        </>
      ) : (
        /* ── Table View ──────────────────────────────── */
        <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-widest">Metric</th>
                  <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-widest">Category</th>
                  <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-widest">Value</th>
                  <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-widest">Last Updated</th>
                </tr>
              </thead>
              <tbody>
                {metrics.map((m, i) => {
                  const catId = classifyMetric(m.metricName);
                  const cat = CATEGORIES.find(c => c.id === catId);
                  const { color } = metricColor(m.metricName);
                  return (
                    <motion.tr
                      key={m.id}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.015 }}
                      className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: color }} />
                          <span className="text-sm font-medium text-slate-800">{m.metricName}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-md ${cat?.lightBg || "bg-slate-50"}`} style={{ color }}>
                          {cat?.label || catId}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm font-bold text-slate-900 font-mono">{formatMetricValue(m.metricName, m.value)}</span>
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-500">{new Date(m.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-3 border-t border-slate-50 bg-slate-50/50 flex items-center justify-between text-xs text-slate-500">
            <span>{metrics.length} total metrics</span>
            <button onClick={handleExport} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-white transition-colors">
              <Download size={11} /> Export CSV
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── KPI Card Sub-Component ──────────────────────────────────
function KPICard({
  icon: Icon,
  label,
  value,
  color,
  bg,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  color: string;
  bg: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={`${bg} rounded-xl px-4 py-3.5 border border-slate-100/50`}
    >
      <div className="flex items-center gap-2 mb-1.5">
        <Icon size={13} className={color} />
        <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">{label}</span>
      </div>
      <div className={`text-lg font-bold ${color}`}>{value}</div>
    </motion.div>
  );
}

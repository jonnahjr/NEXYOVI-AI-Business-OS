"use client";
import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Truck, DollarSign, CheckCircle, Clock, TrendingUp, Activity, Zap,
  AlertTriangle, Fuel as FuelIcon, Navigation, Users, Package,
  Download, ArrowUp, ArrowDown, Target, X
} from "lucide-react";
import { useToast } from "@/components/ui/Toast";

interface KPI {
  label: string;
  value: string;
  change: string;
  positive: boolean;
  icon: any;
  color: string;
  trend?: number;
}

interface Metric {
  metric: string;
  value: string;
  target: string;
  achieved: number;
  trend: string;
  status: string;
  detail?: string;
}

interface VehicleData {
  vehicle: string;
  deliveries: number;
  fuel: number;
  utilization: number;
  efficiency: number;
  onTimeRate: number;
  distance: number;
  driver: string;
}

const kpis: KPI[] = [
  { label: "Fleet Utilization", value: "78%", change: "+5%", positive: true, icon: Activity, color: "text-blue-600", trend: 78 },
  { label: "On-Time Delivery", value: "91%", change: "+3%", positive: true, icon: CheckCircle, color: "text-emerald-600", trend: 91 },
  { label: "Fuel Cost (MTD)", value: "ETB 84K", change: "+5%", positive: false, icon: FuelIcon, color: "text-amber-600", trend: 84 },
  { label: "Avg Trip Distance", value: "428 km", change: "+2%", positive: true, icon: Navigation, color: "text-purple-600", trend: 428 },
  { label: "Driver Score", value: "4.6/5", change: "+0.2", positive: true, icon: Users, color: "text-sky-600", trend: 92 },
  { label: "Delivery Success", value: "94%", change: "+1%", positive: true, icon: Target, color: "text-rose-600", trend: 94 },
];

const metrics: Metric[] = [
  { metric: "Fleet Utilization", value: "78%", target: "85%", achieved: 78, trend: "Up", status: "Good", detail: "5 of 7 vehicles active" },
  { metric: "On-Time Delivery", value: "91%", target: "95%", achieved: 91, trend: "Up", status: "Good", detail: "42 of 46 on time" },
  { metric: "Fuel Cost (MTD)", value: "ETB 84K", target: "ETB 75K", achieved: 112, trend: "Up", status: "Exceeded", detail: "ETB 9K over budget" },
  { metric: "Avg Trip Distance", value: "428 km", target: "450 km", achieved: 95, trend: "Stable", status: "Good" },
  { metric: "Driver Performance", value: "4.6/5", target: "4.5/5", achieved: 102, trend: "Up", status: "Excellent", detail: "Top: Mulugeta (4.9)" },
  { metric: "Maintenance Compliance", value: "82%", target: "90%", achieved: 82, trend: "Down", status: "Needs Attention", detail: "2 vehicles overdue" },
  { metric: "Fuel Efficiency", value: "8.2 km/L", target: "9 km/L", achieved: 91, trend: "Stable", status: "Good" },
  { metric: "Delivery Success Rate", value: "94%", target: "96%", achieved: 94, trend: "Up", status: "Good", detail: "3 failed deliveries" },
  { metric: "Avg Trip Duration", value: "6.8 hrs", target: "6.0 hrs", achieved: 88, trend: "Down", status: "Needs Attention" },
  { metric: "Cost per Delivery", value: "ETB 1,825", target: "ETB 1,600", achieved: 114, trend: "Up", status: "Exceeded" },
];

const fleetData: VehicleData[] = [
  { vehicle: "Toyota Hilux", deliveries: 48, fuel: 82000, utilization: 82, efficiency: 8.5, onTimeRate: 96, distance: 8240, driver: "Solomon T." },
  { vehicle: "Isuzu Truck FVR", deliveries: 52, fuel: 95000, utilization: 88, efficiency: 7.2, onTimeRate: 90, distance: 12100, driver: "Petros H." },
  { vehicle: "Land Cruiser", deliveries: 38, fuel: 65000, utilization: 72, efficiency: 9.1, onTimeRate: 95, distance: 6850, driver: "Mulugeta G." },
  { vehicle: "Hyundai H350", deliveries: 42, fuel: 58000, utilization: 68, efficiency: 6.8, onTimeRate: 88, distance: 5200, driver: "Daniel B." },
  { vehicle: "Mitsubishi Fuso", deliveries: 35, fuel: 78000, utilization: 75, efficiency: 7.8, onTimeRate: 86, distance: 9800, driver: "Bereket A." },
];

const trendIcons: Record<string, any> = { Up: TrendingUp, Down: TrendingUp, Stable: Activity };
const trendColors: Record<string, string> = { Up: "text-emerald-500", Down: "text-red-500", Stable: "text-slate-400" };

const statusColors: Record<string, string> = {
  "Good": "bg-emerald-50 text-emerald-700 border-emerald-200",
  "Excellent": "bg-blue-50 text-blue-700 border-blue-200",
  "Exceeded": "bg-amber-50 text-amber-700 border-amber-200",
  "Needs Attention": "bg-red-50 text-red-600 border-red-200",
};

const monthData = [
  { month: "Feb", utilization: 72, deliveries: 38, fuel: 72000, onTime: 88, cost: 72000 },
  { month: "Mar", utilization: 75, deliveries: 42, fuel: 75000, onTime: 89, cost: 75000 },
  { month: "Apr", utilization: 73, deliveries: 40, fuel: 78000, onTime: 87, cost: 78000 },
  { month: "May", utilization: 78, deliveries: 45, fuel: 81000, onTime: 90, cost: 81000 },
  { month: "Jun", utilization: 76, deliveries: 43, fuel: 84000, onTime: 88, cost: 84000 },
  { month: "Jul", utilization: 80, deliveries: 48, fuel: 82000, onTime: 91, cost: 82000 },
];

const maxFuel = Math.max(...monthData.map(d => d.fuel));
const maxDeliveries = Math.max(...monthData.map(d => d.deliveries));

export default function LogisticsAnalyticsPage() {
  const [activeTab, setActiveTab] = useState<"overview" | "vehicles" | "trends">("overview");
  const [selectedVehicle, setSelectedVehicle] = useState<string | null>(null);
  const [hoveredMonth, setHoveredMonth] = useState<{ chart: string; index: number } | null>(null);
  const { toast } = useToast();

  const vehicleStats = useMemo(() => {
    const maxOnTime = Math.max(...fleetData.map(v => v.onTimeRate));
    const maxDel = Math.max(...fleetData.map(v => v.deliveries));
    return { maxOnTime, maxDel };
  }, []);

  const selectedVehicleData = useMemo(() => {
    if (!selectedVehicle) return null;
    return fleetData.find(v => v.vehicle === selectedVehicle) || null;
  }, [selectedVehicle]);

  const handleExport = () => {
    const today = new Date().toISOString().split("T")[0];
    let csv = `"Logistics Analytics Report - ${today}"\n\n`;

    // KPI section
    csv += "KPI,Value,Change\n";
    kpis.forEach(k => csv += `"${k.label}","${k.value}","${k.change}"\n`);
    csv += "\n";

    // Metrics section
    csv += "Metric,Value,Target,Achieved %,Trend,Status\n";
    metrics.forEach(m => csv += `"${m.metric}","${m.value}","${m.target}",${m.achieved}%,"${m.trend}","${m.status}"\n`);
    csv += "\n";

    // Fleet section
    csv += "Vehicle,Driver,Deliveries,Utilization %,On-Time %,Efficiency (km/L),Distance (km)\n";
    fleetData.forEach(v => csv += `"${v.vehicle}","${v.driver}",${v.deliveries},${v.utilization}%,${v.onTimeRate}%,${v.efficiency},${v.distance}\n`);

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `logistics-analytics-${today}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast("Report exported successfully", "success");
  };

  return (
    <div className="space-y-5">
      {/* Tab Navigation */}
      <div className="flex gap-2 bg-slate-50 border border-slate-200 rounded-xl p-1 shadow-sm w-fit">
        {[
          { id: "overview" as const, label: "Overview", icon: Activity },
          { id: "vehicles" as const, label: "Vehicle Performance", icon: Truck },
          { id: "trends" as const, label: "Trends", icon: TrendingUp },
        ].map((tab) => {
          const TabIcon = tab.icon;
          return (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                activeTab === tab.id
                  ? "bg-slate-900 text-white shadow-sm"
                  : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
              }`}>
              <TabIcon size={13} /> {tab.label}
            </button>
          );
        })}
        <button onClick={handleExport}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-all ml-auto">
          <Download size={13} /> Export
        </button>
      </div>

      {activeTab === "overview" && (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
            {kpis.map((k, i) => {
              const Icon = k.icon;
              return (
                <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-medium text-slate-400">{k.label}</span>
                    <Icon size={14} className={k.color} />
                  </div>
                  <div className="text-lg font-bold text-slate-900">{k.value}</div>
                  <div className={`text-[11px] font-medium flex items-center gap-0.5 ${k.positive ? "text-emerald-600" : "text-red-500"}`}>
                    {k.positive ? <ArrowUp size={10} /> : <ArrowDown size={10} />}
                    {k.change}
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Performance Metrics */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-800">Fleet Performance Scorecard</h3>
              <span className="text-[10px] text-slate-400">{metrics.length} metrics</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-100">
                    <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap">Metric</th>
                    <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap">Value</th>
                    <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap">Target</th>
                    <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap">Achieved</th>
                    <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap">Trend</th>
                    <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap">Status</th>
                    <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap">Details</th>
                  </tr>
                </thead>
                <tbody>
                  {metrics.map((m, i) => {
                    const TrendIcon = trendIcons[m.trend];
                    return (
                      <tr key={i} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                        <td className="px-4 py-3 text-sm font-medium text-slate-800">{m.metric}</td>
                        <td className="px-4 py-3 text-sm font-bold text-slate-900">{m.value}</td>
                        <td className="px-4 py-3 text-sm text-slate-500">{m.target}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-20 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                              <div className={`h-full rounded-full ${m.achieved >= 100 ? "bg-emerald-500" : m.achieved >= 80 ? "bg-blue-500" : "bg-amber-500"}`}
                                style={{ width: `${Math.min(m.achieved, 100)}%` }} />
                            </div>
                            <span className="text-[10px] font-mono text-slate-500">{m.achieved}%</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <TrendIcon size={13} className={trendColors[m.trend]} />
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex text-[10px] font-semibold px-2 py-0.5 rounded-full border ${statusColors[m.status]}`}>{m.status}</span>
                        </td>
                        <td className="px-4 py-3 text-[11px] text-slate-400">{m.detail || "—"}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {activeTab === "vehicles" && (
        <div className="bg-slate-50 border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800">Vehicle Performance Comparison</h3>
            {selectedVehicleData && (
              <button onClick={() => setSelectedVehicle(null)}
                className="text-[10px] font-semibold text-slate-400 hover:text-slate-700 transition-colors">
                Clear selection
              </button>
            )}
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-100">
                  <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap">Vehicle</th>
                  <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap">Driver</th>
                  <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap">Deliveries</th>
                  <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap">Utilization</th>
                  <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap">On-Time</th>
                  <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap">Efficiency</th>
                  <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap">Distance</th>
                  <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap">Fuel Cost</th>
                </tr>
              </thead>
              <tbody>
                {fleetData.map((v, i) => (
                  <motion.tr key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }}
                    onClick={() => setSelectedVehicle(selectedVehicle === v.vehicle ? null : v.vehicle)}
                    className={`border-b border-slate-100 hover:bg-slate-100/50 transition-colors cursor-pointer ${
                      selectedVehicle === v.vehicle ? "bg-blue-50 border-b-2 border-b-blue-200" : ""
                    }`}>
                    <td className="px-4 py-3 text-sm font-semibold text-slate-900">
                      <div className="flex items-center gap-2"><Truck size={13} className="text-slate-400" />{v.vehicle}</div>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-500">{v.driver}</td>
                    <td className="px-4 py-3 text-sm font-mono text-slate-800">{v.deliveries}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${v.utilization >= 80 ? "bg-emerald-500" : v.utilization >= 60 ? "bg-amber-500" : "bg-red-500"}`}
                            style={{ width: `${v.utilization}%` }} />
                        </div>
                        <span className="text-sm font-mono text-slate-600">{v.utilization}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${v.onTimeRate >= 90 ? "bg-emerald-500" : "bg-amber-500"}`}
                            style={{ width: `${v.onTimeRate}%` }} />
                        </div>
                        <span className="text-sm font-mono text-slate-600">{v.onTimeRate}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm font-mono text-emerald-600 font-semibold">{v.efficiency} km/L</td>
                    <td className="px-4 py-3 text-sm font-mono text-slate-500">{v.distance.toLocaleString()} km</td>
                    <td className="px-4 py-3 text-sm font-mono text-amber-600">ETB {v.fuel.toLocaleString()}</td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Expanded Vehicle Detail Panel */}
          {selectedVehicleData && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
              className="border-t border-slate-200 bg-blue-50/30 overflow-hidden">
              <div className="p-5">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                      <Truck size={18} className="text-blue-600" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">{selectedVehicleData.vehicle}</h4>
                      <p className="text-[11px] text-slate-500">Driver: {selectedVehicleData.driver}</p>
                    </div>
                  </div>
                  <button onClick={() => setSelectedVehicle(null)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-[10px] font-semibold text-slate-500 hover:text-slate-800 hover:border-slate-300 transition-all">
                    <X size={12} /> Close
                  </button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-white rounded-xl p-3 border border-slate-200 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-medium text-slate-400">Deliveries</span>
                      <Activity size={12} className="text-blue-500" />
                    </div>
                    <span className="text-lg font-bold text-slate-900">{selectedVehicleData.deliveries}</span>
                    <span className="text-[10px] text-slate-400 ml-1">total</span>
                  </div>
                  <div className="bg-white rounded-xl p-3 border border-slate-200 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-medium text-slate-400">Fuel Cost</span>
                      <FuelIcon size={12} className="text-amber-500" />
                    </div>
                    <span className="text-lg font-bold text-slate-900">ETB {selectedVehicleData.fuel.toLocaleString()}</span>
                    <span className="text-[10px] text-slate-400 ml-1">MTD</span>
                  </div>
                  <div className="bg-white rounded-xl p-3 border border-slate-200 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-medium text-slate-400">Efficiency</span>
                      <TrendingUp size={12} className="text-emerald-500" />
                    </div>
                    <span className="text-lg font-bold text-emerald-600">{selectedVehicleData.efficiency}</span>
                    <span className="text-[10px] text-slate-400 ml-1">km/L</span>
                  </div>
                  <div className="bg-white rounded-xl p-3 border border-slate-200 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-medium text-slate-400">Distance</span>
                      <Navigation size={12} className="text-purple-500" />
                    </div>
                    <span className="text-lg font-bold text-slate-900">{selectedVehicleData.distance.toLocaleString()}</span>
                    <span className="text-[10px] text-slate-400 ml-1">km</span>
                  </div>
                </div>

                {/* Performance breakdown bars */}
                <div className="mt-4 grid grid-cols-3 gap-4">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-medium text-slate-500">Utilization</span>
                      <span className="text-[11px] font-bold text-slate-700">{selectedVehicleData.utilization}%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                      <motion.div initial={{ width: 0 }} animate={{ width: `${selectedVehicleData.utilization}%` }} transition={{ duration: 0.8, ease: "easeOut" }}
                        className={`h-full rounded-full ${selectedVehicleData.utilization >= 80 ? "bg-emerald-500" : selectedVehicleData.utilization >= 60 ? "bg-amber-500" : "bg-red-500"}`} />
                    </div>
                    <span className="text-[9px] text-slate-400 mt-0.5 block">Target: 80%</span>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-medium text-slate-500">On-Time Rate</span>
                      <span className="text-[11px] font-bold text-slate-700">{selectedVehicleData.onTimeRate}%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                      <motion.div initial={{ width: 0 }} animate={{ width: `${selectedVehicleData.onTimeRate}%` }} transition={{ duration: 0.8, ease: "easeOut", delay: 0.1 }}
                        className={`h-full rounded-full ${selectedVehicleData.onTimeRate >= 90 ? "bg-emerald-500" : "bg-amber-500"}`} />
                    </div>
                    <span className="text-[9px] text-slate-400 mt-0.5 block">Target: 90%</span>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-medium text-slate-500">Efficiency</span>
                      <span className="text-[11px] font-bold text-slate-700">{selectedVehicleData.efficiency} km/L</span>
                    </div>
                    <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                      <motion.div initial={{ width: 0 }} animate={{ width: `${(selectedVehicleData.efficiency / 10) * 100}%` }} transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
                        className="h-full rounded-full bg-blue-500" />
                    </div>
                    <span className="text-[9px] text-slate-400 mt-0.5 block">Target: 9 km/L</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      )}

      {activeTab === "trends" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Utilization Chart */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 shadow-sm">
            <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
              <Activity size={14} className="text-blue-500" /> Fleet Utilization Trend
            </h3>
            <div className="flex items-end gap-2 h-32">
              {monthData.map((d, i) => {
                const height = (d.utilization / 85) * 100;
                const isHovered = hoveredMonth?.chart === "utilization" && hoveredMonth?.index === i;
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    {isHovered ? (
                      <span className="text-[9px] font-bold font-mono text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded">{d.utilization}%</span>
                    ) : (
                      <span className="text-[9px] font-mono text-slate-400">{d.utilization}%</span>
                    )}
                    <div
                      onMouseEnter={() => setHoveredMonth({ chart: "utilization", index: i })}
                      onMouseLeave={() => setHoveredMonth(null)}
                      className="w-full bg-blue-50 rounded-t-md relative flex-1 cursor-pointer transition-all hover:opacity-80"
                      style={{ maxHeight: `${height}%` }}>
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: "100%" }}
                        transition={{ delay: i * 0.1, duration: 0.5 }}
                        className="absolute bottom-0 left-0 right-0 bg-blue-500 rounded-t-md"
                      />
                    </div>
                    <span className="text-[9px] text-slate-400">{d.month}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Fuel Cost Chart */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 shadow-sm">
            <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
              <FuelIcon size={14} className="text-amber-500" /> Monthly Fuel Cost
            </h3>
            <div className="flex items-end gap-2 h-32">
              {monthData.map((d, i) => {
                const height = (d.fuel / maxFuel) * 100;
                const isHovered = hoveredMonth?.chart === "fuel" && hoveredMonth?.index === i;
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    {isHovered ? (
                      <span className="text-[9px] font-bold font-mono text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded">
                        ETB {(d.fuel / 1000).toFixed(1)}K
                      </span>
                    ) : (
                      <span className="text-[9px] font-mono text-slate-400">{(d.fuel / 1000).toFixed(0)}K</span>
                    )}
                    <div
                      onMouseEnter={() => setHoveredMonth({ chart: "fuel", index: i })}
                      onMouseLeave={() => setHoveredMonth(null)}
                      className="w-full bg-amber-50 rounded-t-md relative flex-1 cursor-pointer transition-all hover:opacity-80"
                      style={{ maxHeight: `${height}%` }}>
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: "100%" }}
                        transition={{ delay: i * 0.1, duration: 0.5 }}
                        className="absolute bottom-0 left-0 right-0 bg-amber-500 rounded-t-md group-hover:bg-amber-400"
                      />
                    </div>
                    <span className="text-[9px] text-slate-400">{d.month}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* On-Time Delivery Chart */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 shadow-sm">
            <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
              <CheckCircle size={14} className="text-emerald-500" /> On-Time Delivery Rate
            </h3>
            <div className="flex items-end gap-2 h-32">
              {monthData.map((d, i) => {
                const height = (d.onTime / 100) * 100;
                const isHovered = hoveredMonth?.chart === "ontime" && hoveredMonth?.index === i;
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    {isHovered ? (
                      <span className="text-[9px] font-bold font-mono text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">{d.onTime}%</span>
                    ) : (
                      <span className="text-[9px] font-mono text-slate-400">{d.onTime}%</span>
                    )}
                    <div
                      onMouseEnter={() => setHoveredMonth({ chart: "ontime", index: i })}
                      onMouseLeave={() => setHoveredMonth(null)}
                      className="w-full bg-emerald-50 rounded-t-md relative flex-1 cursor-pointer transition-all hover:opacity-80"
                      style={{ maxHeight: `${height}%` }}>
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: "100%" }}
                        transition={{ delay: i * 0.1, duration: 0.5 }}
                        className="absolute bottom-0 left-0 right-0 bg-emerald-500 rounded-t-md"
                      />
                    </div>
                    <span className="text-[9px] text-slate-400">{d.month}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Deliveries Chart */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 shadow-sm">
            <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
              <Package size={14} className="text-purple-500" /> Monthly Deliveries
            </h3>
            <div className="flex items-end gap-2 h-32">
              {monthData.map((d, i) => {
                const height = (d.deliveries / maxDeliveries) * 100;
                const isHovered = hoveredMonth?.chart === "deliveries" && hoveredMonth?.index === i;
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    {isHovered ? (
                      <span className="text-[9px] font-bold font-mono text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded">{d.deliveries}</span>
                    ) : (
                      <span className="text-[9px] font-mono text-slate-400">{d.deliveries}</span>
                    )}
                    <div
                      onMouseEnter={() => setHoveredMonth({ chart: "deliveries", index: i })}
                      onMouseLeave={() => setHoveredMonth(null)}
                      className="w-full bg-purple-50 rounded-t-md relative flex-1 cursor-pointer transition-all hover:opacity-80"
                      style={{ maxHeight: `${height}%` }}>
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: "100%" }}
                        transition={{ delay: i * 0.1, duration: 0.5 }}
                        className="absolute bottom-0 left-0 right-0 bg-purple-500 rounded-t-md"
                      />
                    </div>
                    <span className="text-[9px] text-slate-400">{d.month}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

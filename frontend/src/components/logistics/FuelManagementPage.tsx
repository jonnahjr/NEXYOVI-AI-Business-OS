"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import {
  Search, Plus, DollarSign, Fuel as FuelIcon, Truck,
  CheckCircle, XCircle, Clock, Download,
  BarChart3, Gauge, X, Zap, Trash2
} from "lucide-react";
import { useToast } from "@/components/ui/Toast";

interface FuelRecord {
  id: string;
  date: string;
  vehicle: string;
  driver: string;
  fuelType: string;
  liters: number;
  costPerLiter: number;
  totalCost: number;
  odometer: number;
  station: string;
  fuelStatus: string;
  efficiency?: number;
}

const sampleFuel: FuelRecord[] = [
  { id: "f1", date: "2026-07-10", vehicle: "Toyota Hilux 2022", driver: "Solomon Tadesse", fuelType: "Diesel", liters: 45, costPerLiter: 126, totalCost: 5670, odometer: 43200, station: "Total Bole", fuelStatus: "Approved", efficiency: 8.5 },
  { id: "f2", date: "2026-07-09", vehicle: "Isuzu Truck FVR", driver: "Petros Haile", fuelType: "Diesel", liters: 120, costPerLiter: 124, totalCost: 14880, odometer: 78900, station: "NOC Mexico", fuelStatus: "Approved", efficiency: 7.2 },
  { id: "f3", date: "2026-07-08", vehicle: "Land Cruiser", driver: "Mulugeta Girma", fuelType: "Diesel", liters: 60, costPerLiter: 126, totalCost: 7560, odometer: 95500, station: "Total Bole", fuelStatus: "Approved", efficiency: 9.1 },
  { id: "f4", date: "2026-07-07", vehicle: "Hyundai H350 Van", driver: "Daniel Bekele", fuelType: "Petrol", liters: 35, costPerLiter: 132, totalCost: 4620, odometer: 34800, station: "Shell Kazanchis", fuelStatus: "Pending", efficiency: 6.8 },
  { id: "f5", date: "2026-07-06", vehicle: "Mitsubishi Fuso", driver: "Bereket Alemu", fuelType: "Diesel", liters: 95, costPerLiter: 124, totalCost: 11780, odometer: 112800, station: "NOC Bole", fuelStatus: "Approved", efficiency: 7.8 },
  { id: "f6", date: "2026-07-05", vehicle: "Toyota Hilux 2022", driver: "Solomon Tadesse", fuelType: "Diesel", liters: 50, costPerLiter: 125, totalCost: 6250, odometer: 42700, station: "Shell Bole", fuelStatus: "Approved", efficiency: 8.3 },
  { id: "f7", date: "2026-07-04", vehicle: "Land Cruiser", driver: "Mulugeta Girma", fuelType: "Diesel", liters: 55, costPerLiter: 126, totalCost: 6930, odometer: 94800, station: "NOC", fuelStatus: "Pending", efficiency: 8.9 },
  { id: "f8", date: "2026-07-03", vehicle: "Isuzu Truck FVR", driver: "Petros Haile", fuelType: "Diesel", liters: 130, costPerLiter: 123, totalCost: 15990, odometer: 78500, station: "Total Mexico", fuelStatus: "Approved", efficiency: 7.0 },
  { id: "f9", date: "2026-07-02", vehicle: "Mitsubishi Fuso", driver: "Bereket Alemu", fuelType: "Diesel", liters: 100, costPerLiter: 124, totalCost: 12400, odometer: 112200, station: "Shell", fuelStatus: "Approved", efficiency: 7.5 },
];

const statusColors: Record<string, string> = {
  Approved: "text-emerald-600 bg-emerald-50 border-emerald-200",
  Pending: "text-amber-600 bg-amber-50 border-amber-200",
  Rejected: "text-red-600 bg-red-50 border-red-200",
};

const fuelTypeColors: Record<string, string> = {
  Diesel: "bg-slate-800 text-white",
  Petrol: "bg-amber-500 text-white",
  Electric: "bg-emerald-500 text-white",
  Hybrid: "bg-blue-500 text-white",
};

const VEHICLES = ["Toyota Hilux 2022", "Isuzu Truck FVR", "Land Cruiser", "Hyundai H350 Van", "Mitsubishi Fuso", "Toyota Hiace", "Nissan Navara"];
const DRIVERS = ["Solomon Tadesse", "Petros Haile", "Mulugeta Girma", "Daniel Bekele", "Bereket Alemu", "Tewodros Hailu", "Almaz Wolde"];
const STATIONS = ["Total Bole", "NOC Mexico", "Shell Kazanchis", "NOC Bole", "Shell Bole", "NOC", "Total Mexico", "Shell"];
const FUEL_TYPES = ["Diesel", "Petrol", "Diesel", "Diesel", "Diesel", "Petrol"];

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomPick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateRecord(): FuelRecord {
  const vehicle = randomPick(VEHICLES);
  const driver = randomPick(DRIVERS);
  const date = new Date(Date.now() - randomInt(0, 14) * 86400000).toISOString().slice(0, 10);
  const liters = randomInt(20, 140);
  const costPerLiter = randomInt(118, 135);
  const totalCost = liters * costPerLiter;
  const odometer = randomInt(10000, 160000);
  const efficiency = +((odometer % 10000) / liters).toFixed(1);
  return {
    id: `f${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    date,
    vehicle,
    driver,
    fuelType: randomPick(FUEL_TYPES),
    liters,
    costPerLiter,
    totalCost,
    odometer,
    station: randomPick(STATIONS),
    fuelStatus: randomPick(["Approved", "Approved", "Pending"]),
    efficiency,
  };
}

export default function FuelManagementPage() {
  const [records, setRecords] = useState<FuelRecord[]>(sampleFuel);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [showChart, setShowChart] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<any>({});
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const filtered = records.filter(r => {
    const matchesSearch = !search ||
      r.vehicle.toLowerCase().includes(search.toLowerCase()) ||
      r.driver.toLowerCase().includes(search.toLowerCase()) ||
      r.station.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "All" || r.fuelStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalLiters = records.reduce((s, r) => s + r.liters, 0);
  const totalCost = records.reduce((s, r) => s + r.totalCost, 0);
  const pendingCount = records.filter(r => r.fuelStatus === "Pending").length;
  const avgCost = totalLiters > 0 ? totalCost / totalLiters : 0;
  const avgEfficiency = records.filter(r => r.efficiency).reduce((s, r) => s + (r.efficiency || 0), 0) / Math.max(1, records.filter(r => r.efficiency).length);

  const vehicleStats = Object.entries(
    records.reduce((acc: Record<string, { liters: number; cost: number; count: number }>, r) => {
      if (!acc[r.vehicle]) acc[r.vehicle] = { liters: 0, cost: 0, count: 0 };
      acc[r.vehicle].liters += r.liters;
      acc[r.vehicle].cost += r.totalCost;
      acc[r.vehicle].count++;
      return acc;
    }, {})
  ).map(([vehicle, stats]) => ({ vehicle, ...stats }));

  const maxLiters = Math.max(...vehicleStats.map(v => v.liters), 1);

  const openForm = () => {
    setFormData({
      date: new Date().toISOString().slice(0, 10),
      vehicle: randomPick(VEHICLES),
      driver: randomPick(DRIVERS),
      fuelType: "Diesel",
      liters: 50,
      costPerLiter: 126,
      station: randomPick(STATIONS),
      odometer: randomInt(10000, 150000),
      fuelStatus: "Pending",
    });
    setShowForm(true);
  };

  const handleAddRecord = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    const liters = Number(formData.liters) || 0;
    const costPerLiter = Number(formData.costPerLiter) || 0;
    const odometer = Number(formData.odometer) || 0;
    const efficiency = liters > 0 ? +((odometer % 10000) / liters).toFixed(1) : undefined;
    const newRecord: FuelRecord = {
      id: `f${Date.now()}`,
      date: formData.date || new Date().toISOString().slice(0, 10),
      vehicle: formData.vehicle || "Unknown",
      driver: formData.driver || "Unknown",
      fuelType: formData.fuelType || "Diesel",
      liters,
      costPerLiter,
      totalCost: liters * costPerLiter,
      odometer,
      station: formData.station || "Unknown",
      fuelStatus: formData.fuelStatus || "Pending",
      efficiency,
    };
    setRecords(prev => [newRecord, ...prev]);
    setIsSaving(false);
    setShowForm(false);
    toast("Fuel record added", "success");
  };

  const handleAutoGenerate = () => {
    const count = randomInt(3, 6);
    const generated: FuelRecord[] = [];
    for (let i = 0; i < count; i++) {
      generated.push(generateRecord());
    }
    setRecords(prev => [...generated, ...prev]);
    toast(`${count} fuel records auto-generated!`, "success");
  };

  const handleApprove = (id: string) => {
    setRecords(prev => prev.map(r => r.id === id ? { ...r, fuelStatus: "Approved" } : r));
    toast("Record approved", "success");
  };

  const handleDelete = (id: string) => {
    setRecords(prev => prev.filter(r => r.id !== id));
    toast("Record removed", "success");
  };

  const handleExport = () => {
    const csv = [["Date","Vehicle","Driver","Liters","Cost","Efficiency"], ...records.map(r => [r.date, r.vehicle, r.driver, String(r.liters), String(r.totalCost), r.efficiency ? String(r.efficiency) : ""])].map(row => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "fuel-records.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-5">
      {/* KPI Cards */}
      <div className="grid grid-cols-5 gap-3">
        <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-2 text-slate-400 text-xs font-medium mb-1"><FuelIcon size={12} /> Total Liters</div>
          <div className="text-lg font-bold text-slate-900">{totalLiters.toLocaleString()} L</div>
        </div>
        <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-2 text-slate-400 text-xs font-medium mb-1"><DollarSign size={12} /> Total Cost</div>
          <div className="text-lg font-bold text-red-500">ETB {totalCost.toLocaleString()}</div>
        </div>
        <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-2 text-slate-400 text-xs font-medium mb-1"><DollarSign size={12} /> Avg Cost/L</div>
          <div className="text-lg font-bold text-slate-900">ETB {avgCost.toFixed(0)}</div>
        </div>
        <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-2 text-slate-400 text-xs font-medium mb-1"><Gauge size={12} /> Avg Efficiency</div>
          <div className="text-lg font-bold text-emerald-600">{avgEfficiency.toFixed(1)} km/L</div>
        </div>
        <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-2 text-slate-400 text-xs font-medium mb-1"><Clock size={12} /> Pending</div>
          <div className="text-lg font-bold text-amber-600">{pendingCount}</div>
        </div>
      </div>

      {/* Search, Filter, Chart toggle */}
      <div className="flex gap-3 items-center flex-wrap">
        <div className="flex-1 relative min-w-[200px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search fuel records..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900" />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          className="px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 bg-white">
          <option value="All">All Status</option>
          <option value="Approved">Approved</option>
          <option value="Pending">Pending</option>
          <option value="Rejected">Rejected</option>
        </select>
        <button onClick={() => setShowChart(!showChart)}
          className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-xs font-medium transition-all ${
            showChart ? "bg-blue-50 border-blue-200 text-blue-700" : "border-slate-200 text-slate-600 hover:bg-slate-50"
          }`}>
          <BarChart3 size={13} /> {showChart ? "Hide Chart" : "Chart"}
        </button>
        <button onClick={handleAutoGenerate}
          className="flex items-center gap-2 px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-purple-600 hover:bg-purple-50 transition-all">
          <Zap size={13} /> Auto-Generate
        </button>
        <button onClick={openForm}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-black text-xs font-bold transition-all">
          <Plus size={13} /> Add Record
        </button>
      </div>

      {/* Vehicle Consumption Chart */}
      {showChart && (
        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
          className="bg-slate-50 border border-slate-200 rounded-xl p-4 shadow-sm">
          <h3 className="text-xs font-bold text-slate-500 uppercase mb-3">Fuel Consumption by Vehicle</h3>
          <div className="space-y-2">
            {vehicleStats.sort((a, b) => b.liters - a.liters).map((v, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                  <Truck size={14} className="text-slate-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between text-xs text-slate-700 mb-0.5">
                    <span className="truncate font-medium">{v.vehicle}</span>
                    <div className="flex gap-3 shrink-0">
                      <span className="font-mono text-slate-400">{v.liters} L</span>
                      <span className="font-mono text-red-500">ETB {v.cost.toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-500 rounded-full" style={{ width: `${(v.liters / maxLiters) * 100}%` }} />
                  </div>
                  <div className="flex gap-2 text-[9px] text-slate-400 mt-0.5">
                    <span>{v.count} fill-ups</span>
                    <span>Avg: {Math.round(v.liters / (v.count || 1))} L/refill</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Fuel Records — Card Grid */}
      {filtered.length === 0 && (
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-10 text-center">
          <FuelIcon size={24} className="text-slate-300 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-slate-900 mb-1">No Fuel Records Found</h3>
          <p className="text-sm text-slate-500">{search ? "Try a different search term" : "Add your first fuel record"}</p>
        </div>
      )}
      {filtered.length > 0 && (
      <div className="bg-slate-50 border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-100">
                {["Date", "Vehicle", "Driver", "Fuel Type", "Liters", "Cost/L", "Total", "Efficiency", "Odometer", "Station", "Status", ""].map(h => (
                  <th key={h} className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((r, i) => (
                <motion.tr key={r.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                  className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                  <td className="px-4 py-3 text-sm text-slate-600">{r.date}</td>
                  <td className="px-4 py-3 text-sm font-medium text-slate-800"><div className="flex items-center gap-2"><Truck size={12} />{r.vehicle}</div></td>
                  <td className="px-4 py-3 text-sm text-slate-600">{r.driver}</td>
                  <td className="px-4 py-3">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${fuelTypeColors[r.fuelType] || "bg-slate-100 text-slate-700"}`}>
                      {r.fuelType}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm font-mono">{r.liters}</td>
                  <td className="px-4 py-3 text-sm font-mono">{r.costPerLiter}</td>
                  <td className="px-4 py-3 text-sm font-mono font-bold text-slate-900">{r.totalCost.toLocaleString()}</td>
                  <td className="px-4 py-3 text-sm font-mono text-emerald-600">{r.efficiency ? `${r.efficiency}` : "—"}</td>
                  <td className="px-4 py-3 text-sm text-slate-500 font-mono">{r.odometer.toLocaleString()}</td>
                  <td className="px-4 py-3 text-sm text-slate-500">{r.station}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${statusColors[r.fuelStatus]}`}>
                      {r.fuelStatus === "Approved" ? <CheckCircle size={10} /> : r.fuelStatus === "Pending" ? <Clock size={10} /> : <XCircle size={10} />}
                      {r.fuelStatus}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      {r.fuelStatus === "Pending" && (
                        <button onClick={() => handleApprove(r.id)}
                          className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-medium text-emerald-600 hover:bg-emerald-50 transition-colors">
                          <CheckCircle size={10} /> Approve
                        </button>
                      )}
                      <button onClick={() => handleDelete(r.id)}
                        className="w-7 h-7 rounded-lg hover:bg-red-50 flex items-center justify-center text-slate-400 hover:text-red-500 transition-colors">
                        <Trash2 size={11} />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 border-t border-slate-200 bg-slate-50/50 flex items-center justify-between text-xs text-slate-500">
          <span>{filtered.length} record{filtered.length !== 1 ? "s" : ""}</span>
          <button onClick={handleExport} className="flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-white transition-colors">
            <Download size={11} /> Export
          </button>
        </div>
      </div>
      )}

      {/* Add Record Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-900">Add Fuel Record</h2>
              <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600"><X size={18} /></button>
            </div>
            <form onSubmit={handleAddRecord} className="p-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-slate-700">Date *</label>
                  <input type="date" value={formData.date || ""}
                    onChange={e => setFormData({ ...formData, date: e.target.value })} required
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-slate-900" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-slate-700">Fuel Type *</label>
                  <select value={formData.fuelType || "Diesel"} onChange={e => setFormData({ ...formData, fuelType: e.target.value })}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-slate-900 bg-white">
                    <option>Diesel</option>
                    <option>Petrol</option>
                    <option>Electric</option>
                    <option>Hybrid</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-slate-700">Vehicle *</label>
                  <select value={formData.vehicle || ""} onChange={e => setFormData({ ...formData, vehicle: e.target.value })} required
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-slate-900 bg-white">
                    <option value="">Select vehicle</option>
                    {VEHICLES.map(v => <option key={v} value={v}>{v}</option>)}
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-slate-700">Driver *</label>
                  <select value={formData.driver || ""} onChange={e => setFormData({ ...formData, driver: e.target.value })} required
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-slate-900 bg-white">
                    <option value="">Select driver</option>
                    {DRIVERS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-slate-700">Liters *</label>
                  <input type="number" min="1" value={formData.liters || ""}
                    onChange={e => setFormData({ ...formData, liters: e.target.value })} required
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-slate-900" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-slate-700">Cost per Liter *</label>
                  <input type="number" min="1" value={formData.costPerLiter || ""}
                    onChange={e => setFormData({ ...formData, costPerLiter: e.target.value })} required
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-slate-900" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-slate-700">Odometer (km)</label>
                  <input type="number" value={formData.odometer || ""}
                    onChange={e => setFormData({ ...formData, odometer: e.target.value })}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-slate-900" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-slate-700">Station</label>
                  <select value={formData.station || ""} onChange={e => setFormData({ ...formData, station: e.target.value })}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-slate-900 bg-white">
                    <option value="">Select station</option>
                    {STATIONS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-slate-700">Status</label>
                  <select value={formData.fuelStatus || "Pending"} onChange={e => setFormData({ ...formData, fuelStatus: e.target.value })}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-slate-900 bg-white">
                    <option>Pending</option>
                    <option>Approved</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button type="button" onClick={() => setShowForm(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">Cancel</button>
                <button type="submit" disabled={isSaving}
                  className="px-4 py-2 rounded-xl bg-primary hover:bg-primary/90 text-black text-sm font-bold transition-all disabled:opacity-50">
                  {isSaving ? "Adding..." : "Add Record"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

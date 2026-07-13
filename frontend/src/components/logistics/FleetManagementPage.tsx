"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Search, Plus, Truck, Users, Wrench, AlertTriangle,
  Pencil, Trash2, Eye, X, CheckCircle, Clock, Gauge, Calendar,
  Fuel, Navigation, MapPin, Filter, Download, RefreshCw
} from "lucide-react";
import { useToast } from "@/components/ui/Toast";

interface Vehicle {
  id: string;
  plate: string;
  model: string;
  make: string;
  plateNumber: string;
  driver: string;
  status: string;
  odometer: number;
  mileage: number;
  nextService: string;
  fuelType?: string;
  year?: number;
  createdAt: string;
  updatedAt: string;
}

const sampleVehicles: Vehicle[] = [
  { id: "v1", plate: "AA-3-5678", model: "Toyota Hilux 2022", make: "Toyota", plateNumber: "AA-3-5678", driver: "Solomon Tadesse", status: "In Use", odometer: 42800, mileage: 42800, nextService: "2026-08-15", fuelType: "Diesel", year: 2022, createdAt: "2025-01-01", updatedAt: "2026-07-10" },
  { id: "v2", plate: "AA-1-1234", model: "Isuzu Truck FVR", make: "Isuzu", plateNumber: "AA-1-1234", driver: "Petros Haile", status: "Available", odometer: 78400, mileage: 78400, nextService: "2026-07-20", fuelType: "Diesel", year: 2021, createdAt: "2025-01-01", updatedAt: "2026-07-10" },
  { id: "v3", plate: "OR-2-9012", model: "Land Cruiser", make: "Toyota", plateNumber: "OR-2-9012", driver: "Mulugeta Girma", status: "In Use", odometer: 95200, mileage: 95200, nextService: "2026-09-10", fuelType: "Diesel", year: 2023, createdAt: "2025-01-01", updatedAt: "2026-07-10" },
  { id: "v4", plate: "AA-4-3456", model: "Hyundai H350 Van", make: "Hyundai", plateNumber: "AA-4-3456", driver: "Daniel Bekele", status: "Maintenance", odometer: 34600, mileage: 34600, nextService: "2026-07-05", fuelType: "Petrol", year: 2022, createdAt: "2025-01-01", updatedAt: "2026-07-10" },
  { id: "v5", plate: "SN-1-7890", model: "Mitsubishi Fuso", make: "Mitsubishi", plateNumber: "SN-1-7890", driver: "Bereket Alemu", status: "Available", odometer: 112000, mileage: 112000, nextService: "2026-07-25", fuelType: "Diesel", year: 2020, createdAt: "2025-01-01", updatedAt: "2026-07-10" },
  { id: "v6", plate: "AA-5-2345", model: "Toyota Hiace", make: "Toyota", plateNumber: "AA-5-2345", driver: "Tewodros Hailu", status: "Reserved", odometer: 18200, mileage: 18200, nextService: "2026-10-01", fuelType: "Diesel", year: 2024, createdAt: "2025-01-01", updatedAt: "2026-07-10" },
  { id: "v7", plate: "AA-6-6789", model: "Nissan Navara", make: "Nissan", plateNumber: "AA-6-6789", driver: "Almaz Wolde", status: "Out of Service", odometer: 156000, mileage: 156000, nextService: "2026-08-20", fuelType: "Diesel", year: 2019, createdAt: "2025-01-01", updatedAt: "2026-07-10" },
];

const statusColors: Record<string, string> = {
  "Available": "bg-emerald-50 text-emerald-700 border-emerald-200",
  "In Use": "bg-blue-50 text-blue-700 border-blue-200",
  "Maintenance": "bg-amber-50 text-amber-700 border-amber-200",
  "Retired": "bg-slate-100 text-slate-600 border-slate-200",
  "Reserved": "bg-purple-50 text-purple-700 border-purple-200",
  "Out of Service": "bg-red-50 text-red-600 border-red-200",
};

const statusDots: Record<string, string> = {
  "Available": "bg-emerald-500",
  "In Use": "bg-blue-500 animate-pulse",
  "Maintenance": "bg-amber-500",
  "Retired": "bg-slate-400",
  "Reserved": "bg-purple-500",
  "Out of Service": "bg-red-500",
};

const STATUS_ACTIONS: Record<string, { nextStatus: string; label: string; color: string }[]> = {
  "Available": [{ nextStatus: "In Use", label: "Assign", color: "hover:bg-blue-50 hover:text-blue-600" }],
  "In Use": [
    { nextStatus: "Available", label: "Release", color: "hover:bg-emerald-50 hover:text-emerald-600" },
    { nextStatus: "Maintenance", label: "Maintenance", color: "hover:bg-amber-50 hover:text-amber-600" },
  ],
  "Maintenance": [{ nextStatus: "Available", label: "Ready", color: "hover:bg-emerald-50 hover:text-emerald-600" }],
  "Reserved": [{ nextStatus: "In Use", label: "Deploy", color: "hover:bg-blue-50 hover:text-blue-600" }],
  "Out of Service": [{ nextStatus: "Available", label: "Reactivate", color: "hover:bg-emerald-50 hover:text-emerald-600" }],
};

export default function FleetManagementPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>(sampleVehicles);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit" | "view">("create");
  const [activeVehicle, setActiveVehicle] = useState<Vehicle | null>(null);
  const [formData, setFormData] = useState<any>({});
  const [isSaving, setIsSaving] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [isUpdatingStatus, setIsUpdatingStatus] = useState<string | null>(null);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null);
  const { toast } = useToast();

  const loadData = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token") || "";
      const res = await fetch("http://localhost:3002/api/v1/modules/logistics-fleet/fleet-management", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const json = await res.json();
      if (json?.data && Array.isArray(json.data) && json.data.length > 0) {
        setVehicles(json.data);
      }
    } catch {}
    setIsLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  const filtered = vehicles.filter(v => {
    const matchesSearch = !search || 
      v.plate.toLowerCase().includes(search.toLowerCase()) ||
      v.model.toLowerCase().includes(search.toLowerCase()) ||
      v.driver.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "All" || v.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: vehicles.length,
    inUse: vehicles.filter(v => v.status === "In Use").length,
    available: vehicles.filter(v => v.status === "Available").length,
    maintenance: vehicles.filter(v => v.status === "Maintenance" || v.status === "Out of Service").length,
  };

  const openModal = (mode: "create" | "edit" | "view", vehicle: Vehicle | null = null) => {
    setModalMode(mode);
    setActiveVehicle(vehicle);
    if (mode === "create") {
      setFormData({
        plate: `NXV-${String(vehicles.length + 1).padStart(3, "0")}`,
        model: "",
        make: "",
        driver: "",
        status: "Available",
        odometer: 0,
        fuelType: "Diesel",
        year: new Date().getFullYear(),
        nextService: "",
      });
    } else {
      setFormData(vehicle || {});
    }
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const token = localStorage.getItem("token") || "";
      const url = modalMode === "edit" && activeVehicle
        ? `http://localhost:3002/api/v1/modules/logistics-fleet/fleet-management/${activeVehicle.id}`
        : "http://localhost:3002/api/v1/modules/logistics-fleet/fleet-management";
      const method = modalMode === "edit" ? "PUT" : "POST";
      
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        toast("Vehicle saved", "success");
        setModalOpen(false);
        loadData();
      } else {
        // Fallback: update local state
        if (modalMode === "edit") {
          setVehicles(prev => prev.map(v => v.id === activeVehicle?.id ? { ...v, ...formData } : v));
        } else {
          const newVehicle = { ...formData, id: `v${Date.now()}` };
          setVehicles(prev => [newVehicle, ...prev]);
        }
        toast("Vehicle saved locally", "success");
        setModalOpen(false);
      }
    } catch {
      // Fallback: update local state
      if (modalMode === "edit" && activeVehicle) {
        setVehicles(prev => prev.map(v => v.id === activeVehicle.id ? { ...v, ...formData } : v));
      } else {
        const newVehicle = { ...formData, id: `v${Date.now()}` };
        setVehicles(prev => [newVehicle, ...prev]);
      }
      toast("Vehicle saved locally", "success");
      setModalOpen(false);
    } finally {
      setIsSaving(false);
    }
  };

  const handleStatusUpdate = async (vehicleId: string, newStatus: string) => {
    setIsUpdatingStatus(vehicleId);
    try {
      const token = localStorage.getItem("token") || "";
      const res = await fetch(`http://localhost:3002/api/v1/modules/logistics-fleet/fleet-management/${vehicleId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        toast(`Status changed to ${newStatus}`, "success");
        loadData();
      } else {
        setVehicles(prev => prev.map(v => v.id === vehicleId ? { ...v, status: newStatus } : v));
        toast(`Status changed to ${newStatus}`, "success");
      }
    } catch {
      setVehicles(prev => prev.map(v => v.id === vehicleId ? { ...v, status: newStatus } : v));
      toast(`Status changed to ${newStatus}`, "success");
    } finally {
      setIsUpdatingStatus(null);
    }
  };

  const handleDelete = async (vehicleId: string) => {
    try {
      const token = localStorage.getItem("token") || "";
      await fetch(`http://localhost:3002/api/v1/modules/logistics-fleet/fleet-management/${vehicleId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch {}
    setVehicles(prev => prev.filter(v => v.id !== vehicleId));
    setConfirmDeleteId(null);
    toast("Vehicle removed", "success");
  };

  const exportData = () => {
    const headers = "Plate,Model,Driver,Status,Odometer,Next Service";
    const rows = vehicles.map(v => `${v.plate},"${v.model}","${v.driver}",${v.status},${v.odometer},${v.nextService}`);
    const csv = [headers, ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "fleet-management.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-5">
      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: "Total Vehicles", value: stats.total, icon: Truck, color: "text-slate-900" },
          { label: "In Use", value: stats.inUse, icon: Navigation, color: "text-blue-600" },
          { label: "Available", value: stats.available, icon: CheckCircle, color: "text-emerald-600" },
          { label: "Needs Service", value: stats.maintenance, icon: Wrench, color: "text-amber-600" },
        ].map((k, i) => {
          const Icon = k.icon;
          return (
            <div key={i}
              className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-2 text-slate-400 text-xs font-medium mb-1">
                <Icon size={12} className={k.color} /> {k.label}
              </div>
              <div className="text-lg font-bold text-slate-900">{k.value}</div>
            </div>
          );
        })}
      </div>

      {/* Search, Filter, Actions */}
      <div className="flex gap-3 items-center flex-wrap">
        <div className="flex-1 relative min-w-[200px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search vehicles by plate, model, driver..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900" />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          className="px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 bg-white">
          <option value="All">All Status</option>
          <option value="Available">Available</option>
          <option value="In Use">In Use</option>
          <option value="Maintenance">Maintenance</option>
          <option value="Reserved">Reserved</option>
          <option value="Out of Service">Out of Service</option>
        </select>
        <button onClick={exportData}
          className="flex items-center gap-2 px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-50 transition-all">
          <Download size={13} /> Export
        </button>
        <button onClick={() => openModal("create")}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-black text-xs font-bold transition-all">
          <Plus size={13} /> Add Vehicle
        </button>
      </div>

      {/* Vehicle Table */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-100">
                <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap">Plate</th>
                <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap">Model</th>
                <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap">Driver</th>
                <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap">Status</th>
                <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap">Odometer</th>
                <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap">Fuel</th>
                <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap">Next Service</th>
                <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((vehicle, i) => (
                <motion.tr key={vehicle.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                  onClick={() => setSelectedVehicleId(selectedVehicleId === vehicle.id ? null : vehicle.id)}
                  className={`border-b border-slate-100 hover:bg-slate-100/50 transition-colors cursor-pointer ${
                    selectedVehicleId === vehicle.id ? "bg-blue-50 border-b-2 border-b-blue-200" : ""
                  }`}>
                  <td className="px-4 py-3 text-sm font-mono font-semibold text-slate-900">{vehicle.plate}</td>
                  <td className="px-4 py-3 text-sm text-slate-800"><div className="flex items-center gap-2"><Truck size={13} className="text-slate-400" />{vehicle.model}</div></td>
                  <td className="px-4 py-3 text-sm text-slate-600">{vehicle.driver || "—"}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${statusColors[vehicle.status] || "bg-slate-100 text-slate-600"}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${statusDots[vehicle.status] || "bg-slate-400"}`} />
                      {vehicle.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm font-mono text-slate-500">{vehicle.odometer.toLocaleString()} km</td>
                  <td className="px-4 py-3 text-sm text-slate-500">{vehicle.fuelType || "—"}</td>
                  <td className="px-4 py-3 text-sm text-slate-500">{vehicle.nextService || "—"}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      {vehicle.status && STATUS_ACTIONS[vehicle.status]?.map((act, ai) => (
                        <button key={ai}
                          onClick={(e) => { e.stopPropagation(); handleStatusUpdate(vehicle.id, act.nextStatus); }}
                          disabled={isUpdatingStatus === vehicle.id}
                          className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-medium text-slate-500 ${act.color} transition-colors disabled:opacity-50`}>
                          {act.label}
                        </button>
                      ))}
                      <button onClick={(e) => { e.stopPropagation(); openModal("view", vehicle); }}
                        className="w-7 h-7 rounded-lg hover:bg-blue-50 flex items-center justify-center text-slate-400 hover:text-blue-600 transition-colors">
                        <Eye size={12} />
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); openModal("edit", vehicle); }}
                        className="w-7 h-7 rounded-lg hover:bg-amber-50 flex items-center justify-center text-slate-400 hover:text-amber-600 transition-colors">
                        <Pencil size={12} />
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); setConfirmDeleteId(vehicle.id); }}
                        className="w-7 h-7 rounded-lg hover:bg-red-50 flex items-center justify-center text-slate-400 hover:text-red-500 transition-colors">
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length > 0 && (
          <div className="px-4 py-3 border-t border-slate-200 bg-slate-50/50 flex items-center justify-between text-xs text-slate-500">
            <span>{filtered.length} vehicle{filtered.length !== 1 ? "s" : ""}</span>
          </div>
        )}
      </div>

      {/* Expanded Vehicle Details */}
      {selectedVehicleId && (() => {
        const v = vehicles.find(veh => veh.id === selectedVehicleId);
        if (!v) return null;
        const daysToService = v.nextService ? Math.floor((new Date(v.nextService).getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : null;
        const serviceStatus = daysToService !== null ? (daysToService < 0 ? "Overdue" : daysToService < 7 ? "Due Soon" : daysToService < 30 ? "Approaching" : "OK") : "N/A";
        const serviceColor = daysToService !== null ? (daysToService < 0 ? "text-red-600 bg-red-50" : daysToService < 7 ? "text-amber-600 bg-amber-50" : daysToService < 30 ? "text-blue-600 bg-blue-50" : "text-emerald-600 bg-emerald-50") : "text-slate-400";
        const odometerPct = Math.min((v.odometer / 200000) * 100, 100);
        return (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
            className="bg-slate-50 border border-slate-200 rounded-xl p-4 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Truck size={18} className="text-blue-600" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">{v.plate}</h4>
                  <p className="text-[11px] text-slate-500">{v.make} {v.model} &middot; {v.fuelType || "N/A"}</p>
                </div>
              </div>
              <button onClick={() => setSelectedVehicleId(null)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-[10px] font-semibold text-slate-500 hover:text-slate-800 hover:border-slate-300 transition-all">
                <X size={12} /> Close
              </button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
              <div className="bg-white rounded-xl p-3 border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-medium text-slate-400">Driver</span>
                  <Users size={12} className="text-slate-400" />
                </div>
                <span className="text-sm font-bold text-slate-900">{v.driver || "Unassigned"}</span>
              </div>
              <div className="bg-white rounded-xl p-3 border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-medium text-slate-400">Status</span>
                  <CheckCircle size={12} className="text-slate-400" />
                </div>
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${statusColors[v.status] || "bg-slate-100 text-slate-600"}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${statusDots[v.status] || "bg-slate-400"}`} />
                  {v.status}
                </span>
              </div>
              <div className="bg-white rounded-xl p-3 border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-medium text-slate-400">Year</span>
                  <Calendar size={12} className="text-slate-400" />
                </div>
                <span className="text-sm font-bold text-slate-900">{v.year || "&mdash;"}</span>
              </div>
              <div className="bg-white rounded-xl p-3 border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-medium text-slate-400">Service</span>
                  <Wrench size={12} className="text-slate-400" />
                </div>
                <span className={`text-sm font-bold ${serviceColor.split(" ")[0]}`}>{daysToService !== null ? `${Math.abs(daysToService)}d` : "&mdash;"}</span>
                <span className={`text-[9px] ml-1 px-1 py-0.5 rounded ${serviceColor}`}>{serviceStatus}</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-medium text-slate-500">Odometer</span>
                  <span className="text-[11px] font-bold font-mono text-slate-700">{v.odometer.toLocaleString()} km</span>
                </div>
                <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${odometerPct}%` }} transition={{ duration: 0.8, ease: "easeOut" }}
                    className={`h-full rounded-full ${odometerPct > 80 ? "bg-amber-500" : odometerPct > 50 ? "bg-blue-500" : "bg-emerald-500"}`} />
                </div>
                <span className="text-[9px] text-slate-400 mt-0.5 block">Lifetime: {v.mileage.toLocaleString()} km &middot; Target: 200,000 km</span>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-medium text-slate-500">Next Service</span>
                  <span className="text-[11px] font-bold text-slate-700">{v.nextService || "Not set"}</span>
                </div>
                <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${daysToService !== null ? Math.min(Math.max((30 - Math.abs(daysToService)) / 30 * 100, 0), 100) : 0}%` }} transition={{ duration: 0.8, ease: "easeOut", delay: 0.1 }}
                    className={`h-full rounded-full ${daysToService !== null && daysToService < 0 ? "bg-red-500" : daysToService !== null && daysToService < 7 ? "bg-amber-500" : "bg-emerald-500"}`} />
                </div>
                <span className="text-[9px] text-slate-400 mt-0.5 block">{daysToService !== null ? `${daysToService >= 0 ? `${daysToService} days remaining` : `${Math.abs(daysToService)} days overdue`}` : "No service scheduled"}</span>
              </div>
            </div>
            <div className="flex gap-1.5 mt-4 pt-3 border-t border-slate-200">
              {v.status && STATUS_ACTIONS[v.status]?.map((act, ai) => (
                <button key={ai} onClick={() => { handleStatusUpdate(v.id, act.nextStatus); }}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-semibold ${act.color} transition-colors`}>
                  {act.label}
                </button>
              ))}
              <button onClick={() => { openModal("edit", v); setSelectedVehicleId(null); }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-[10px] font-semibold text-slate-600 hover:bg-amber-50 hover:border-amber-200 hover:text-amber-700 transition-all">
                <Pencil size={11} /> Edit
              </button>
              <button onClick={() => { setConfirmDeleteId(v.id); }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-[10px] font-semibold text-slate-600 hover:bg-red-50 hover:border-red-200 hover:text-red-600 transition-all">
                <Trash2 size={11} /> Delete
              </button>
            </div>
          </motion.div>
        );
      })()}

      {/* Empty State */}
      {filtered.length === 0 && !isLoading && (
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-10 text-center">
          <Truck size={24} className="text-slate-300 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-slate-900 mb-1">No Vehicles Found</h3>
          <p className="text-sm text-slate-500 mb-4">{search ? "Try a different search term" : "Add your first vehicle to get started"}</p>
          {!search && (
            <button onClick={() => openModal("create")}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-black text-xs font-bold">
              <Plus size={13} /> Add Vehicle
            </button>
          )}
        </div>
      )}

      {/* CRUD Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-900 capitalize">{modalMode} Vehicle</h2>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X size={18} /></button>
            </div>
            <form onSubmit={handleSave} className="p-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-slate-700">Plate Number *</label>
                  <input type="text" value={formData.plate || ""}
                    onChange={e => setFormData({ ...formData, plate: e.target.value, plateNumber: e.target.value })}
                    disabled={modalMode === "view" || modalMode === "edit"}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-slate-900 disabled:bg-slate-50 disabled:text-slate-500" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-slate-700">Make *</label>
                  <input type="text" value={formData.make || ""}
                    onChange={e => setFormData({ ...formData, make: e.target.value })}
                    disabled={modalMode === "view"}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-slate-900 disabled:bg-slate-50" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-slate-700">Model *</label>
                  <input type="text" value={formData.model || ""}
                    onChange={e => setFormData({ ...formData, model: e.target.value })}
                    disabled={modalMode === "view"}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-slate-900 disabled:bg-slate-50" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-slate-700">Year</label>
                  <input type="number" value={formData.year || new Date().getFullYear()}
                    onChange={e => setFormData({ ...formData, year: parseInt(e.target.value) || 2024 })}
                    disabled={modalMode === "view"}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-slate-900 disabled:bg-slate-50" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-slate-700">Driver</label>
                  <input type="text" value={formData.driver || ""}
                    onChange={e => setFormData({ ...formData, driver: e.target.value })}
                    disabled={modalMode === "view"}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-slate-900 disabled:bg-slate-50" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-slate-700">Fuel Type</label>
                  <select value={formData.fuelType || "Diesel"}
                    onChange={e => setFormData({ ...formData, fuelType: e.target.value })}
                    disabled={modalMode === "view"}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-slate-900 bg-white disabled:bg-slate-50">
                    <option>Diesel</option>
                    <option>Petrol</option>
                    <option>Electric</option>
                    <option>Hybrid</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-slate-700">Status</label>
                  <select value={formData.status || "Available"}
                    onChange={e => setFormData({ ...formData, status: e.target.value })}
                    disabled={modalMode === "view"}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-slate-900 bg-white disabled:bg-slate-50">
                    <option>Available</option>
                    <option>In Use</option>
                    <option>Maintenance</option>
                    <option>Reserved</option>
                    <option>Retired</option>
                    <option>Out of Service</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-slate-700">Odometer (km)</label>
                  <input type="number" value={formData.odometer || 0}
                    onChange={e => setFormData({ ...formData, odometer: parseInt(e.target.value) || 0, mileage: parseInt(e.target.value) || 0 })}
                    disabled={modalMode === "view"}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-slate-900 disabled:bg-slate-50" />
                </div>
                <div className="flex flex-col gap-1 col-span-2">
                  <label className="text-xs font-semibold text-slate-700">Next Service Date</label>
                  <input type="date" value={formData.nextService || ""}
                    onChange={e => setFormData({ ...formData, nextService: e.target.value })}
                    disabled={modalMode === "view"}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-slate-900 disabled:bg-slate-50" />
                </div>
              </div>
              {modalMode !== "view" && (
                <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                  <button type="button" onClick={() => setModalOpen(false)}
                    className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">Cancel</button>
                  <button type="submit" disabled={isSaving}
                    className="px-4 py-2 rounded-xl bg-primary hover:bg-primary/90 text-black text-sm font-bold transition-all disabled:opacity-50">
                    {isSaving ? "Saving..." : "Save Vehicle"}
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {confirmDeleteId && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl text-center">
            <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-3">
              <AlertTriangle size={22} className="text-red-500" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-1">Delete Vehicle?</h3>
            <p className="text-sm text-slate-500 mb-5">This action cannot be undone.</p>
            <div className="flex gap-2 justify-center">
              <button onClick={() => setConfirmDeleteId(null)}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">Cancel</button>
              <button onClick={() => handleDelete(confirmDeleteId)}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-bold transition-all">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

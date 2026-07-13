"use client";
import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import {
  Users, Truck, BadgeCheck, Phone, Star, Mail,
  Pencil, Trash2, Eye, Plus, Search, X, AlertTriangle,
  Calendar, Clock, CheckCircle, Download, Zap
} from "lucide-react";
import { useToast } from "@/components/ui/Toast";

interface Driver {
  id: string;
  name: string;
  licenseNo: string;
  licenseClass: string;
  licenseExpiry: string;
  phone: string;
  email: string;
  assignedVehicle: string;
  rating: number;
  driverStatus: string;
  totalTrips: number;
  accidents: number;
  violations?: number;
  joinDate?: string;
  totalDistance?: number;
  fuelEfficiency?: number;
}

const sampleDrivers: Driver[] = [
  { id: "d1", name: "Solomon Tadesse", licenseNo: "DL-001", licenseClass: "Heavy", licenseExpiry: "2027-06-15", phone: "+251-911-1001", email: "solomon@nexyovi.com", assignedVehicle: "Toyota Hilux 2022", rating: 4.8, driverStatus: "On Route", totalTrips: 142, accidents: 0, violations: 1, joinDate: "2022-03-10", totalDistance: 45800, fuelEfficiency: 8.2 },
  { id: "d2", name: "Petros Haile", licenseNo: "DL-002", licenseClass: "Heavy", licenseExpiry: "2026-12-01", phone: "+251-911-1002", email: "petros@nexyovi.com", assignedVehicle: "Isuzu Truck FVR", rating: 4.5, driverStatus: "Available", totalTrips: 98, accidents: 1, violations: 2, joinDate: "2021-08-20", totalDistance: 35200, fuelEfficiency: 7.8 },
  { id: "d3", name: "Mulugeta Girma", licenseNo: "DL-003", licenseClass: "Medium", licenseExpiry: "2028-03-20", phone: "+251-911-1003", email: "mulugeta@nexyovi.com", assignedVehicle: "Land Cruiser", rating: 4.9, driverStatus: "On Route", totalTrips: 215, accidents: 0, violations: 0, joinDate: "2020-01-15", totalDistance: 68200, fuelEfficiency: 8.9 },
  { id: "d4", name: "Daniel Bekele", licenseNo: "DL-004", licenseClass: "Light", licenseExpiry: "2026-09-10", phone: "+251-911-1004", email: "daniel@nexyovi.com", assignedVehicle: "Hyundai H350 Van", rating: 4.2, driverStatus: "Off Duty", totalTrips: 67, accidents: 2, violations: 3, joinDate: "2023-06-01", totalDistance: 18400, fuelEfficiency: 7.5 },
  { id: "d5", name: "Bereket Alemu", licenseNo: "DL-005", licenseClass: "Heavy", licenseExpiry: "2027-01-05", phone: "+251-911-1005", email: "bereket@nexyovi.com", assignedVehicle: "Mitsubishi Fuso", rating: 4.6, driverStatus: "Available", totalTrips: 156, accidents: 0, violations: 1, joinDate: "2021-11-10", totalDistance: 52400, fuelEfficiency: 8.4 },
  { id: "d6", name: "Tewodros Hailu", licenseNo: "DL-006", licenseClass: "Medium", licenseExpiry: "2027-09-22", phone: "+251-911-1006", email: "tewodros@nexyovi.com", assignedVehicle: "Toyota Hiace", rating: 4.7, driverStatus: "On Route", totalTrips: 89, accidents: 0, violations: 0, joinDate: "2024-02-14", totalDistance: 12400, fuelEfficiency: 9.1 },
];

const statusColors: Record<string, string> = {
  "On Route": "bg-blue-50 text-blue-700 border-blue-200",
  "Available": "bg-emerald-50 text-emerald-700 border-emerald-200",
  "Off Duty": "bg-slate-100 text-slate-600 border-slate-200",
  "Suspended": "bg-red-50 text-red-600 border-red-200",
  "On Leave": "bg-amber-50 text-amber-600 border-amber-200",
};

const STATUS_ACTIONS: Record<string, { nextStatus: string; label: string; color: string }[]> = {
  "Available": [{ nextStatus: "On Route", label: "Assign", color: "hover:bg-blue-50 hover:text-blue-600" }],
  "On Route": [{ nextStatus: "Available", label: "Release", color: "hover:bg-emerald-50 hover:text-emerald-600" }],
  "Off Duty": [{ nextStatus: "Available", label: "Available", color: "hover:bg-emerald-50 hover:text-emerald-600" }],
};

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomPick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

const DRIVER_NAMES = ["Abebe Kebede", "Tigist Wondimu", "Hailu Mekonnen", "Frehiwot Alemu", "Biruk Tadesse", "Meron Assefa", "Endalkachew Zewdie", "Sara Girma", "Yonas Desta", "Hiwot Belay"];
const DRIVER_VEHICLES = ["Toyota Hilux 2022", "Isuzu Truck FVR", "Land Cruiser", "Hyundai H350 Van", "Mitsubishi Fuso", "Toyota Hiace", "Nissan Navara"];
const LICENSE_CLASSES = ["Light", "Medium", "Heavy", "Trailer"];
const DRIVER_STATUSES = ["Available", "On Route", "Off Duty", "On Leave"];
const PHONE_PREFIXES = ["+251-911-", "+251-912-", "+251-913-", "+251-966-"];

function generateDriver(existingCount: number): Driver {
  const name = randomPick(DRIVER_NAMES);
  const phone = randomPick(PHONE_PREFIXES) + String(randomInt(1001, 9999));
  const joinDate = new Date(Date.now() - randomInt(30, 1500) * 86400000).toISOString().slice(0, 10);
  const expiryDate = new Date(Date.now() + randomInt(60, 700) * 86400000).toISOString().slice(0, 10);
  const rating = +(Math.random() * 1.8 + 3.2).toFixed(1);
  const trips = randomInt(5, 250);
  const accidents = Math.random() > 0.7 ? randomInt(1, 3) : 0;
  return {
    id: `d${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
    name,
    licenseNo: `DL-${String(existingCount + 1).padStart(3, "0")}`,
    licenseClass: randomPick(LICENSE_CLASSES),
    licenseExpiry: expiryDate,
    phone,
    email: name.toLowerCase().replace(" ", ".") + "@nexyovi.com",
    assignedVehicle: randomPick(DRIVER_VEHICLES),
    rating,
    driverStatus: randomPick(DRIVER_STATUSES),
    totalTrips: trips,
    accidents,
    violations: Math.random() > 0.6 ? randomInt(1, 5) : 0,
    joinDate,
    totalDistance: randomInt(5000, 80000),
    fuelEfficiency: +(Math.random() * 3 + 6).toFixed(1),
  };
}

function getLicenseWarning(expiry: string): { text: string; color: string } | null {
  if (!expiry) return null;
  const days = Math.floor((new Date(expiry).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  if (days < 0) return { text: `Expired ${Math.abs(days)}d ago`, color: "text-red-600 bg-red-50" };
  if (days < 30) return { text: `${days}d remaining`, color: "text-amber-600 bg-amber-50" };
  if (days < 90) return { text: `${days}d remaining`, color: "text-blue-600 bg-blue-50" };
  return null;
}

export default function DriverManagementPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [drivers, setDrivers] = useState<Driver[]>(sampleDrivers);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<any>({});
  const [editingDriver, setEditingDriver] = useState<Driver | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [viewDriver, setViewDriver] = useState<Driver | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedDriverId, setSelectedDriverId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Try to load from API
    (async () => {
      try {
        const token = localStorage.getItem("token") || "";
        const res = await fetch("http://localhost:3002/api/v1/modules/logistics-fleet/drivers", {
          headers: { Authorization: `Bearer ${token}` }
        });
        const json = await res.json();
        if (json?.data && Array.isArray(json.data) && json.data.length > 0) {
          setDrivers(json.data.map((d: any) => ({
            id: d.id || d.licenseNo,
            name: d.name || "",
            licenseNo: d.licenseNo || "N/A",
            licenseClass: d.licenseClass || "N/A",
            licenseExpiry: d.licenseExpiry || "",
            phone: d.phone || "",
            email: d.email || "",
            assignedVehicle: d.assignedVehicle || "Unassigned",
            rating: d.rating || 0,
            driverStatus: d.driverStatus || d.status || "Available",
            totalTrips: d.totalTrips || 0,
            accidents: d.accidents || 0,
          })));
        }
      } catch {}
    })();
  }, []);

  const filtered = drivers.filter(d => {
    const matchesSearch = !search ||
      d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.licenseNo.toLowerCase().includes(search.toLowerCase()) ||
      d.assignedVehicle.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "All" || d.driverStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const availableDrivers = drivers.filter(d => d.driverStatus === "Available").length;
  const onRouteDrivers = drivers.filter(d => d.driverStatus === "On Route").length;
  const expiringLicenseCount = drivers.filter(d => {
    if (!d.licenseExpiry) return false;
    const days = Math.floor((new Date(d.licenseExpiry).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    return days < 30;
  }).length;

  const openForm = (driver?: Driver) => {
    if (driver) {
      setFormData({ ...driver });
      setEditingDriver(driver);
    } else {
      setFormData({
        name: "",
        licenseNo: `DL-${String(drivers.length + 1).padStart(3, "0")}`,
        licenseClass: "Medium",
        licenseExpiry: "",
        phone: "",
        email: "",
        assignedVehicle: "",
        driverStatus: "Available",
        rating: 0,
        totalTrips: 0,
        accidents: 0,
      });
      setEditingDriver(null);
    }
    setShowForm(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      if (editingDriver) {
        setDrivers(prev => prev.map(d => d.id === editingDriver.id ? { ...d, ...formData } : d));
        toast("Driver updated", "success");
      } else {
        const newDriver: Driver = { ...formData, id: `d${Date.now()}` };
        setDrivers(prev => [newDriver, ...prev]);
        toast("Driver added", "success");
      }
      setShowForm(false);
    } catch {
      toast("Error saving driver", "error");
    } finally {
      setIsSaving(false);
    }
  };

  function parseCSVLine(line: string): string[] {
    const result: string[] = [];
    let current = "", inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      if (line[i] === '"') { inQuotes = !inQuotes; continue; }
      if (line[i] === ',' && !inQuotes) { result.push(current.trim()); current = ""; continue; }
      current += line[i];
    }
    result.push(current.trim());
    return result;
  }

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const text = ev.target?.result as string;
        const lines = text.split(/\r?\n/).filter(l => l.trim());
        if (lines.length < 2) { toast("CSV file is empty or missing headers", "error"); return; }
        const headers = parseCSVLine(lines[0]).map(h => h.toLowerCase());
        const nameIdx = headers.findIndex(h => h.includes("name"));
        const licenseIdx = headers.findIndex(h => h.includes("license"));
        const classIdx = headers.findIndex(h => h === "class");
        const expiryIdx = headers.findIndex(h => h.includes("expir"));
        const phoneIdx = headers.findIndex(h => h === "phone");
        const vehicleIdx = headers.findIndex(h => h.includes("vehicle"));
        const statusIdx = headers.findIndex(h => h.includes("status"));
        const ratingIdx = headers.findIndex(h => h.includes("rating"));
        const tripsIdx = headers.findIndex(h => h.includes("trip"));
        const newDrivers: Driver[] = [];
        for (let i = 1; i < lines.length; i++) {
          const vals = parseCSVLine(lines[i]);
          const name = nameIdx >= 0 ? vals[nameIdx] : "";
          if (!name) continue;
          newDrivers.push({
            id: `d${Date.now()}-${i}`,
            name,
            licenseNo: licenseIdx >= 0 ? vals[licenseIdx] : `DL-${String(drivers.length + newDrivers.length + 1).padStart(3, "0")}`,
            licenseClass: classIdx >= 0 ? vals[classIdx] : "Medium",
            licenseExpiry: expiryIdx >= 0 ? vals[expiryIdx] : "",
            phone: phoneIdx >= 0 ? vals[phoneIdx] : "",
            email: name.toLowerCase().replace(/\s+/g, ".") + "@nexyovi.com",
            assignedVehicle: vehicleIdx >= 0 ? vals[vehicleIdx] : "",
            rating: ratingIdx >= 0 ? parseFloat(vals[ratingIdx]) || 0 : 0,
            driverStatus: statusIdx >= 0 ? vals[statusIdx] : "Available",
            totalTrips: tripsIdx >= 0 ? parseInt(vals[tripsIdx]) || 0 : 0,
            accidents: 0,
          });
        }
        if (newDrivers.length === 0) { toast("No valid driver records found", "error"); return; }
        setDrivers(prev => [...newDrivers, ...prev]);
        toast(`${newDrivers.length} drivers imported from CSV!`, "success");
      } catch { toast("Error parsing CSV file", "error"); }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const handleAutoGenerate = () => {
    const count = randomInt(3, 6);
    const generated: Driver[] = [];
    for (let i = 0; i < count; i++) {
      generated.push(generateDriver(drivers.length + generated.length + 1));
    }
    setDrivers(prev => [...generated, ...prev]);
    toast(`${count} drivers auto-generated!`, "success");
  };

  const handleDelete = (id: string) => {
    setDrivers(prev => prev.filter(d => d.id !== id));
    setConfirmDeleteId(null);
    toast("Driver removed", "success");
  };

  const handleStatusUpdate = (id: string, newStatus: string) => {
    setDrivers(prev => prev.map(d => d.id === id ? { ...d, driverStatus: newStatus } : d));
    toast(`Status changed to ${newStatus}`, "success");
  };

  const exportData = () => {
    const headers = "Name,License #,Class,Expiry,Phone,Vehicle,Status,Rating,Trips";
    const rows = drivers.map(d => `"${d.name}",${d.licenseNo},${d.licenseClass},${d.licenseExpiry},${d.phone},"${d.assignedVehicle}",${d.driverStatus},${d.rating},${d.totalTrips}`);
    const csv = [headers, ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "drivers.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  const avgRating = drivers.length > 0 ? (drivers.reduce((s, d) => s + d.rating, 0) / drivers.length) : 0;

  return (
    <div className="space-y-5">
      {/* Stats Cards */}
      <div className="grid grid-cols-5 gap-3">
        <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-2 text-slate-400 text-xs font-medium mb-1"><Users size={12} /> Total Drivers</div>
          <div className="text-lg font-bold text-slate-900">{drivers.length}</div>
        </div>
        <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-2 text-slate-400 text-xs font-medium mb-1"><Truck size={12} /> On Route</div>
          <div className="text-lg font-bold text-blue-600">{onRouteDrivers}</div>
        </div>
        <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-2 text-slate-400 text-xs font-medium mb-1"><BadgeCheck size={12} /> Available</div>
          <div className="text-lg font-bold text-emerald-600">{availableDrivers}</div>
        </div>
        <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-2 text-slate-400 text-xs font-medium mb-1"><Star size={12} /> Avg Rating</div>
          <div className="text-lg font-bold text-amber-600">{avgRating.toFixed(1)}</div>
        </div>
        <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-2 text-slate-400 text-xs font-medium mb-1"><AlertTriangle size={12} /> License Expiring</div>
          <div className="text-lg font-bold text-red-500">{expiringLicenseCount}</div>
        </div>
      </div>

      {/* Search, Filter, Add */}
      <div className="flex gap-3 items-center flex-wrap">
        <div className="flex-1 relative min-w-[200px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search drivers by name, license, vehicle..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900" />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          className="px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 bg-white">
          <option value="All">All Status</option>
          <option value="On Route">On Route</option>
          <option value="Available">Available</option>
          <option value="Off Duty">Off Duty</option>
          <option value="On Leave">On Leave</option>
        </select>          <input ref={fileInputRef} type="file" accept=".csv" onChange={handleImport} className="hidden" />
          <button onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-green-600 hover:bg-green-50 transition-all">
            <Download size={13} /> Import CSV
          </button>
          <button onClick={exportData}
            className="flex items-center gap-2 px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-50 transition-all">
            <Download size={13} /> Export
          </button>
        <button onClick={handleAutoGenerate}
          className="flex items-center gap-2 px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-purple-600 hover:bg-purple-50 transition-all">
          <Zap size={13} /> Auto-Generate
        </button>
        <button onClick={() => openForm()}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-black text-xs font-bold transition-all">
          <Plus size={13} /> Add Driver
        </button>
      </div>

      {/* Driver Table */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-100">
                <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap">Name</th>
                <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap">License</th>
                <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap">Class</th>
                <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap">Expiry</th>
                <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap">Phone</th>
                <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap">Vehicle</th>
                <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap">Status</th>
                <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap">Rating</th>
                <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((driver, i) => {
                const licenseWarning = getLicenseWarning(driver.licenseExpiry);
                return (
                  <motion.tr key={driver.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                    onClick={() => setSelectedDriverId(selectedDriverId === driver.id ? null : driver.id)}
                    className={`border-b border-slate-100 hover:bg-slate-100/50 transition-colors cursor-pointer ${
                      selectedDriverId === driver.id ? "bg-blue-50 border-b-2 border-b-blue-200" : ""
                    }`}>
                    <td className="px-4 py-3 text-sm font-semibold text-slate-900">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary shrink-0">
                          {driver.name.split(" ").map(n => n[0]).join("")}
                        </div>
                        {driver.name}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm font-mono text-slate-500">{driver.licenseNo}</td>
                    <td className="px-4 py-3 text-sm text-slate-600">{driver.licenseClass}</td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-slate-500">{driver.licenseExpiry}</span>
                      {licenseWarning && (
                        <span className={`ml-1 text-[9px] font-medium px-1 py-0.5 rounded ${licenseWarning.color}`}>{licenseWarning.text}</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-500">{driver.phone}</td>
                    <td className="px-4 py-3 text-sm text-slate-600">{driver.assignedVehicle}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${statusColors[driver.driverStatus] || "bg-slate-100 text-slate-600"}`}>
                        {driver.driverStatus}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span className="flex items-center gap-1"><Star size={11} className="text-amber-400" /> {driver.rating}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        {STATUS_ACTIONS[driver.driverStatus]?.slice(0, 1).map((act, ai) => (
                          <button key={ai} onClick={(e) => { e.stopPropagation(); handleStatusUpdate(driver.id, act.nextStatus); }}
                            className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-medium text-slate-500 ${act.color} transition-colors`}>
                            {act.label}
                          </button>
                        ))}
                        <button onClick={(e) => { e.stopPropagation(); openForm(driver); }}
                          className="w-7 h-7 rounded-lg hover:bg-amber-50 flex items-center justify-center text-slate-400 hover:text-amber-600 transition-colors">
                          <Pencil size={11} />
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); setViewDriver(driver); }}
                          className="w-7 h-7 rounded-lg hover:bg-blue-50 flex items-center justify-center text-slate-400 hover:text-blue-600 transition-colors">
                          <Eye size={11} />
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); setConfirmDeleteId(driver.id); }}
                          className="w-7 h-7 rounded-lg hover:bg-red-50 flex items-center justify-center text-slate-400 hover:text-red-500 transition-colors">
                          <Trash2 size={11} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 border-t border-slate-200 bg-slate-50/50 flex items-center justify-between text-xs text-slate-500">
          <span>{filtered.length} driver{filtered.length !== 1 ? "s" : ""}</span>
        </div>
      </div>

      {/* Expanded Driver Details */}
      {selectedDriverId && (() => {
        const d = drivers.find(dr => dr.id === selectedDriverId);
        if (!d) return null;
        const licenseWarning = getLicenseWarning(d.licenseExpiry);
        const performancePct = Math.min((d.rating / 5) * 100, 100);
        const tripsPct = Math.min((d.totalTrips / 250) * 100, 100);
        return (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
            className="bg-slate-50 border border-slate-200 rounded-xl p-4 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-base font-bold text-primary">
                  {d.name.split(" ").map(n => n[0]).join("")}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">{d.name}</h4>
                  <p className="text-[11px] text-slate-500">{d.licenseNo} &middot; {d.licenseClass} class</p>
                </div>
              </div>
              <button onClick={() => setSelectedDriverId(null)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-[10px] font-semibold text-slate-500 hover:text-slate-800 hover:border-slate-300 transition-all">
                <X size={12} /> Close
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
              <div className="bg-white rounded-xl p-3 border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-medium text-slate-400">Status</span>
                  <BadgeCheck size={12} className="text-slate-400" />
                </div>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${statusColors[d.driverStatus] || "bg-slate-100 text-slate-600"}`}>
                  {d.driverStatus}
                </span>
              </div>
              <div className="bg-white rounded-xl p-3 border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-medium text-slate-400">Vehicle</span>
                  <Truck size={12} className="text-slate-400" />
                </div>
                <span className="text-sm font-bold text-slate-900">{d.assignedVehicle || "Unassigned"}</span>
              </div>
              <div className="bg-white rounded-xl p-3 border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-medium text-slate-400">Rating</span>
                  <Star size={12} className="text-amber-400" />
                </div>
                <span className="text-sm font-bold text-amber-600">{d.rating} / 5</span>
              </div>
              <div className="bg-white rounded-xl p-3 border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-medium text-slate-400">Trips</span>
                  <Truck size={12} className="text-slate-400" />
                </div>
                <span className="text-sm font-bold text-slate-900">{d.totalTrips}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-medium text-slate-500">Performance</span>
                  <span className="text-[11px] font-bold text-slate-700">{d.rating}/5</span>
                </div>
                <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${performancePct}%` }} transition={{ duration: 0.8, ease: "easeOut" }}
                    className={`h-full rounded-full ${d.rating >= 4.5 ? "bg-emerald-500" : d.rating >= 4.0 ? "bg-blue-500" : "bg-amber-500"}`} />
                </div>
                <span className="text-[9px] text-slate-400 mt-0.5 block">Accidents: {d.accidents} &middot; Violations: {d.violations || 0} &middot; Joined: {d.joinDate || "N/A"}</span>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-medium text-slate-500">Experience</span>
                  <span className="text-[11px] font-bold text-slate-700">{d.totalTrips} trips</span>
                </div>
                <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${tripsPct}%` }} transition={{ duration: 0.8, ease: "easeOut", delay: 0.1 }}
                    className={`h-full rounded-full ${d.totalTrips >= 150 ? "bg-emerald-500" : d.totalTrips >= 80 ? "bg-blue-500" : "bg-amber-500"}`} />
                </div>
                <span className="text-[9px] text-slate-400 mt-0.5 block">Total Distance: {d.totalDistance?.toLocaleString() || "N/A"} km &middot; Efficiency: {d.fuelEfficiency || "N/A"} km/L</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs text-slate-500 mb-4">
              <div>
                <div className="text-[9px] text-slate-400 uppercase font-bold mb-0.5">License</div>
                <div className="font-semibold text-slate-800">{d.licenseNo} ({d.licenseClass})</div>
                <div className="flex items-center gap-1 mt-0.5">
                  <span>Expires: {d.licenseExpiry || "N/A"}</span>
                  {licenseWarning && <span className={`text-[9px] font-medium px-1 py-0.5 rounded ${licenseWarning.color}`}>{licenseWarning.text}</span>}
                </div>
              </div>
              <div>
                <div className="text-[9px] text-slate-400 uppercase font-bold mb-0.5">Contact</div>
                <div className="font-semibold text-slate-800 flex items-center gap-1"><Phone size={10} /> {d.phone}</div>
                <div className="text-slate-400 flex items-center gap-1"><Mail size={10} /> {d.email}</div>
              </div>
            </div>

            <div className="flex gap-1.5 pt-3 border-t border-slate-200">
              {STATUS_ACTIONS[d.driverStatus]?.slice(0, 1).map((act, ai) => (
                <button key={ai} onClick={() => { handleStatusUpdate(d.id, act.nextStatus); setSelectedDriverId(null); }}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-semibold ${act.color} transition-colors`}>
                  {act.label}
                </button>
              ))}
              <button onClick={() => { openForm(d); setSelectedDriverId(null); }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-[10px] font-semibold text-slate-600 hover:bg-amber-50 hover:border-amber-200 hover:text-amber-700 transition-all">
                <Pencil size={11} /> Edit
              </button>
              <button onClick={() => { setConfirmDeleteId(d.id); }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-[10px] font-semibold text-slate-600 hover:bg-red-50 hover:border-red-200 hover:text-red-600 transition-all">
                <Trash2 size={11} /> Delete
              </button>
            </div>
          </motion.div>
        );
      })()}

      {/* Empty State */}
      {filtered.length === 0 && (
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-10 text-center">
          <Users size={24} className="text-slate-300 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-slate-900 mb-1">No Drivers Found</h3>
          <p className="text-sm text-slate-500 mb-4">{search ? "Try a different search" : "Add your first driver"}</p>
          {!search && <button onClick={() => openForm()} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-black text-xs font-bold"><Plus size={13} /> Add Driver</button>}
        </div>
      )}

      {/* Add/Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-900">{editingDriver ? "Edit Driver" : "Add Driver"}</h2>
              <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600"><X size={18} /></button>
            </div>
            <form onSubmit={handleSave} className="p-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="text-xs font-semibold text-slate-700">Full Name *</label>
                  <input type="text" value={formData.name || ""} onChange={e => setFormData({ ...formData, name: e.target.value })} required
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-slate-900" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700">License # *</label>
                  <input type="text" value={formData.licenseNo || ""} onChange={e => setFormData({ ...formData, licenseNo: e.target.value })} required
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-slate-900" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700">License Class</label>
                  <select value={formData.licenseClass || "Medium"} onChange={e => setFormData({ ...formData, licenseClass: e.target.value })}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-slate-900 bg-white">
                    <option>Light</option><option>Medium</option><option>Heavy</option><option>Trailer</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700">License Expiry</label>
                  <input type="date" value={formData.licenseExpiry || ""} onChange={e => setFormData({ ...formData, licenseExpiry: e.target.value })}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-slate-900" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700">Status</label>
                  <select value={formData.driverStatus || "Available"} onChange={e => setFormData({ ...formData, driverStatus: e.target.value })}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-slate-900 bg-white">
                    <option>Available</option><option>On Route</option><option>Off Duty</option><option>On Leave</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="text-xs font-semibold text-slate-700">Phone</label>
                  <input type="text" value={formData.phone || ""} onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-slate-900" />
                </div>
                <div className="col-span-2">
                  <label className="text-xs font-semibold text-slate-700">Email</label>
                  <input type="email" value={formData.email || ""} onChange={e => setFormData({ ...formData, email: e.target.value })}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-slate-900" />
                </div>
                <div className="col-span-2">
                  <label className="text-xs font-semibold text-slate-700">Assigned Vehicle</label>
                  <input type="text" value={formData.assignedVehicle || ""} onChange={e => setFormData({ ...formData, assignedVehicle: e.target.value })}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-slate-900" />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900">Cancel</button>
                <button type="submit" disabled={isSaving}
                  className="px-4 py-2 rounded-xl bg-primary hover:bg-primary/90 text-black text-sm font-bold transition-all disabled:opacity-50">
                  {isSaving ? "Saving..." : editingDriver ? "Update Driver" : "Add Driver"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Driver Modal */}
      {viewDriver && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-xl p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-lg font-bold text-primary">
                  {viewDriver.name.split(" ").map(n => n[0]).join("")}
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">{viewDriver.name}</h3>
                  <p className="text-xs text-slate-400">{viewDriver.licenseNo}</p>
                </div>
              </div>
              <button onClick={() => setViewDriver(null)} className="text-slate-400"><X size={18} /></button>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="bg-slate-50 rounded-xl p-3">
                <div className="text-[10px] text-slate-400 uppercase font-bold">License Class</div>
                <div className="font-semibold text-slate-900">{viewDriver.licenseClass}</div>
              </div>
              <div className="bg-slate-50 rounded-xl p-3">
                <div className="text-[10px] text-slate-400 uppercase font-bold">Expiry</div>
                <div className="font-semibold text-slate-900">{viewDriver.licenseExpiry || "N/A"}</div>
              </div>
              <div className="bg-slate-50 rounded-xl p-3">
                <div className="text-[10px] text-slate-400 uppercase font-bold">Rating</div>
                <div className="font-semibold text-amber-600">{viewDriver.rating}/5</div>
              </div>
              <div className="bg-slate-50 rounded-xl p-3">
                <div className="text-[10px] text-slate-400 uppercase font-bold">Trips</div>
                <div className="font-semibold text-slate-900">{viewDriver.totalTrips}</div>
              </div>
              <div className="bg-slate-50 rounded-xl p-3 col-span-2">
                <div className="text-[10px] text-slate-400 uppercase font-bold">Vehicle</div>
                <div className="font-semibold text-slate-900">{viewDriver.assignedVehicle || "Unassigned"}</div>
              </div>
            </div>
            <div className="flex justify-end mt-4 pt-3 border-t border-slate-100">
              <button onClick={() => setViewDriver(null)}
                className="px-4 py-2 rounded-xl bg-primary hover:bg-primary/90 text-black text-xs font-bold">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {confirmDeleteId && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-xl text-center">
            <AlertTriangle size={22} className="text-red-500 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-slate-900 mb-1">Delete Driver?</h3>
            <p className="text-sm text-slate-500 mb-5">This action cannot be undone.</p>
            <div className="flex gap-2 justify-center">
              <button onClick={() => setConfirmDeleteId(null)} className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900">Cancel</button>
              <button onClick={() => handleDelete(confirmDeleteId)} className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-bold">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

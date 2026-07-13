"use client";
import { useState, useRef } from "react";
import { motion } from "framer-motion";
import {
  Search, Package, Truck, User, MapPin, Calendar, ArrowRight, Anchor,
  CheckCircle, Loader, X, FileText, Download, Globe, Clock, AlertCircle,
  Weight, Box, Ship, Plane, MoreHorizontal, Plus, Zap, Trash2, Upload
} from "lucide-react";
import { useToast } from "@/components/ui/Toast";

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomPick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

const CUSTOMERS = ["Global Exports", "Sunrise PLC", "TechParts Ethiopia", "Green Valley Ltd", "Blue Nile Exports", "Ethio Supply Co", "Horn of Africa", "Addis Tech"];
const ORIGINS = ["Addis Ababa", "Hawassa", "Bahir Dar", "Dire Dawa", "Mekelle"];
const DESTINATIONS = ["Djibouti Port", "Gondar", "Hawassa", "Addis Ababa", "Bahir Dar", "Mekelle", "Jimma", "Arba Minch"];
const SHIP_VEHICLES = ["Mitsubishi Fuso", "Isuzu Truck FVR", "Toyota Hilux", "Land Cruiser", "Toyota Hiace"];
const SHIP_DRIVERS = ["Bereket Alemu", "Petros Haile", "Solomon Tadesse", "Mulugeta Girma", "Tewodros Hailu"];
const TRANSPORT_MODES = ["Truck", "Truck", "Truck", "Ship", "Plane"];
const SHIP_STATUSES = ["Created", "Created", "Loaded", "In Transit", "Delivered"];

function generateShipment(existingCount: number): Shipment {
  const origin = randomPick(ORIGINS);
  let destination = randomPick(DESTINATIONS);
  while (destination === origin) destination = randomPick(DESTINATIONS);
  const pickupDate = new Date(Date.now() - randomInt(0, 5) * 86400000).toISOString().slice(0, 10);
  const estDays = randomInt(2, 7);
  const estDelivery = new Date(new Date(pickupDate).getTime() + estDays * 86400000).toISOString().slice(0, 10);
  const items = randomInt(20, 500);
  const totalWeight = items * randomInt(15, 60);
  const status = randomPick(SHIP_STATUSES);
  return {
    id: `s${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
    shipmentNo: `SHP-${String(existingCount + 1).padStart(3, "0")}`,
    customer: randomPick(CUSTOMERS),
    customerRef: `PO-${new Date().getFullYear()}-${randomInt(80, 150)}`,
    origin,
    destination,
    vehicle: randomPick(SHIP_VEHICLES),
    driver: randomPick(SHIP_DRIVERS),
    items,
    totalWeight,
    pickupDate,
    estDelivery,
    actualDelivery: status === "Delivered" ? new Date().toISOString().slice(0, 10) : undefined,
    shipStatus: status,
    transportMode: randomPick(TRANSPORT_MODES),
    documents: Math.random() > 0.5 ? [{ name: "Bill of Lading", type: "PDF" }] : undefined,
    notes: Math.random() > 0.8 ? "Temperature sensitive - 4°C required" : undefined,
    priority: randomPick(["Low", "Medium", "High", "Medium", "Medium"]),
  };
}

interface Shipment {
  id: string;
  shipmentNo: string;
  customer: string;
  customerRef?: string;
  origin: string;
  destination: string;
  vehicle: string;
  driver: string;
  items: number;
  totalWeight: number;
  pickupDate: string;
  estDelivery: string;
  actualDelivery?: string;
  shipStatus: string;
  transportMode?: string;
  documents?: { name: string; type: string }[];
  trackingUrl?: string;
  notes?: string;
  priority?: string;
}

const sampleShipments: Shipment[] = [
  { id: "s1", shipmentNo: "SHP-001", customer: "Global Exports", customerRef: "PO-2026-089", origin: "Addis Ababa", destination: "Djibouti Port", vehicle: "Mitsubishi Fuso", driver: "Bereket Alemu", items: 400, totalWeight: 20000, pickupDate: "2026-07-08", estDelivery: "2026-07-11", shipStatus: "In Transit", transportMode: "Truck", documents: [{ name: "Bill of Lading", type: "PDF" }, { name: "Export Permit", type: "PDF" }], trackingUrl: "track.nexyovi.com/SHP-001", priority: "High" },
  { id: "s2", shipmentNo: "SHP-002", customer: "Sunrise PLC", customerRef: "ORD-2026-112", origin: "Addis Ababa", destination: "Gondar", vehicle: "Isuzu Truck FVR", driver: "Petros Haile", items: 120, totalWeight: 6000, pickupDate: "2026-07-10", estDelivery: "2026-07-11", shipStatus: "Loaded", transportMode: "Truck", priority: "Medium" },
  { id: "s3", shipmentNo: "SHP-003", customer: "TechParts Ethiopia", customerRef: "PO-2026-094", origin: "Addis Ababa", destination: "Hawassa", vehicle: "Toyota Hilux", driver: "Solomon Tadesse", items: 50, totalWeight: 1250, pickupDate: "2026-07-11", estDelivery: "2026-07-12", shipStatus: "Created", transportMode: "Truck", priority: "Low" },
  { id: "s4", shipmentNo: "SHP-004", customer: "Green Valley Ltd", origin: "Hawassa", destination: "Addis Ababa", vehicle: "Land Cruiser", driver: "Mulugeta Girma", items: 30, totalWeight: 900, pickupDate: "2026-07-09", estDelivery: "2026-07-10", actualDelivery: "2026-07-10", shipStatus: "Delivered", transportMode: "Truck", documents: [{ name: "POD", type: "PDF" }], priority: "Medium" },
  { id: "s5", shipmentNo: "SHP-005", customer: "Blue Nile Exports", customerRef: "PO-2026-101", origin: "Addis Ababa", destination: "Bahir Dar", vehicle: "Mitsubishi Fuso", driver: "Bereket Alemu", items: 250, totalWeight: 12000, pickupDate: "2026-07-12", estDelivery: "2026-07-14", shipStatus: "Created", transportMode: "Truck", notes: "Temperature sensitive - 4°C required", priority: "High" },
  { id: "s6", shipmentNo: "SHP-006", customer: "Ethio Supply Co", origin: "Addis Ababa", destination: "Mekelle", vehicle: "Isuzu Truck FVR", driver: "Petros Haile", items: 180, totalWeight: 9000, pickupDate: "2026-07-13", estDelivery: "2026-07-15", shipStatus: "Created", transportMode: "Truck", priority: "Medium" },
];

const statusPipeline: string[] = ["Created", "Loaded", "In Transit", "Delivered"];
const statusColors: Record<string, string> = {
  "Created": "bg-slate-100 text-slate-600 border-slate-200",
  "Loaded": "bg-blue-50 text-blue-700 border-blue-200",
  "In Transit": "bg-amber-50 text-amber-700 border-amber-200",
  "Delivered": "bg-emerald-50 text-emerald-700 border-emerald-200",
  "Cancelled": "bg-red-50 text-red-600 border-red-200",
};

const transportModeIcons: Record<string, any> = {
  Truck: Truck, Ship: Ship, Plane: Plane, Rail: Truck,
};

export default function ShipmentManagementPage() {
  const [shipments, setShipments] = useState<Shipment[]>(sampleShipments);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [expandedShipment, setExpandedShipment] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<any>({});
  const [isSaving, setIsSaving] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const filtered = shipments.filter(s => {
    const matchesSearch = !search ||
      s.shipmentNo.toLowerCase().includes(search.toLowerCase()) ||
      s.customer.toLowerCase().includes(search.toLowerCase()) ||
      s.destination.toLowerCase().includes(search.toLowerCase()) ||
      s.driver.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "All" || s.shipStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const activeShipments = shipments.filter(s => s.shipStatus === "In Transit" || s.shipStatus === "Loaded").length;
  const delivered = shipments.filter(s => s.shipStatus === "Delivered").length;
  const created = shipments.filter(s => s.shipStatus === "Created").length;
  const totalWeight = shipments.reduce((s, r) => s + r.totalWeight, 0);

  const handleStatusAdvance = (id: string, nextStatus: string) => {
    setShipments(prev => prev.map(s => {
      if (s.id !== id) return s;
      const updates: Partial<Shipment> = { shipStatus: nextStatus };
      if (nextStatus === "Delivered") updates.actualDelivery = new Date().toISOString().slice(0, 10);
      return { ...s, ...updates };
    }));
    toast(`Shipment moved to ${nextStatus}`, "success");
  };

  const openForm = () => {
    setFormData({
      shipmentNo: `SHP-${String(shipments.length + 1).padStart(3, "0")}`,
      customer: randomPick(CUSTOMERS),
      origin: "Addis Ababa",
      destination: randomPick(DESTINATIONS),
      vehicle: randomPick(SHIP_VEHICLES),
      driver: randomPick(SHIP_DRIVERS),
      items: 100,
      totalWeight: 5000,
      pickupDate: new Date().toISOString().slice(0, 10),
      estDelivery: new Date(Date.now() + 3 * 86400000).toISOString().slice(0, 10),
      transportMode: "Truck",
      priority: "Medium",
    });
    setShowForm(true);
  };

  const handleAddShipment = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    const items = Number(formData.items) || 0;
    const totalWeight = Number(formData.totalWeight) || 0;
    const newShipment: Shipment = {
      id: `s${Date.now()}`,
      shipmentNo: formData.shipmentNo || `SHP-${String(shipments.length + 1).padStart(3, "0")}`,
      customer: formData.customer || "Unknown",
      customerRef: formData.customerRef,
      origin: formData.origin || "Addis Ababa",
      destination: formData.destination || "Unknown",
      vehicle: formData.vehicle || "Unknown",
      driver: formData.driver || "Unknown",
      items,
      totalWeight,
      pickupDate: formData.pickupDate || new Date().toISOString().slice(0, 10),
      estDelivery: formData.estDelivery || "",
      shipStatus: formData.shipStatus || "Created",
      transportMode: formData.transportMode || "Truck",
      documents: formData.documents || undefined,
      notes: formData.notes || undefined,
      priority: formData.priority || "Medium",
    };
    setShipments(prev => [newShipment, ...prev]);
    setIsSaving(false);
    setShowForm(false);
    toast("Shipment added", "success");
  };

  const handleAutoGenerate = () => {
    const count = randomInt(3, 6);
    const generated: Shipment[] = [];
    for (let i = 0; i < count; i++) {
      generated.push(generateShipment(shipments.length + generated.length + 1));
    }
    setShipments(prev => [...generated, ...prev]);
    toast(`${count} shipments auto-generated!`, "success");
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
        const noIdx = headers.findIndex(h => h.includes("shipment") || h === "no");
        const custIdx = headers.findIndex(h => h.includes("customer"));
        const originIdx = headers.findIndex(h => h === "origin");
        const destIdx = headers.findIndex(h => h.includes("dest"));
        const pickupIdx = headers.findIndex(h => h.includes("pickup"));
        const estIdx = headers.findIndex(h => h.includes("est") || h.includes("delivery"));
        const vehicleIdx = headers.findIndex(h => h.includes("vehicle"));
        const driverIdx = headers.findIndex(h => h.includes("driver"));
        const itemsIdx = headers.findIndex(h => h === "items");
        const weightIdx = headers.findIndex(h => h.includes("weight") || h.includes("wt"));
        const statusIdx = headers.findIndex(h => h.includes("status"));
        const modeIdx = headers.findIndex(h => h.includes("mode") || h.includes("transport"));
        const priorityIdx = headers.findIndex(h => h.includes("priority"));
        const newShipments: Shipment[] = [];
        for (let i = 1; i < lines.length; i++) {
          const vals = parseCSVLine(lines[i]);
          const customer = custIdx >= 0 ? vals[custIdx] : "";
          if (!customer) continue;
          newShipments.push({
            id: `s${Date.now()}-${i}`,
            shipmentNo: noIdx >= 0 ? vals[noIdx] : `SHP-${String(shipments.length + newShipments.length + 1).padStart(3, "0")}`,
            customer,
            origin: originIdx >= 0 ? vals[originIdx] : "Addis Ababa",
            destination: destIdx >= 0 ? vals[destIdx] : "Unknown",
            vehicle: vehicleIdx >= 0 ? vals[vehicleIdx] : "Unknown",
            driver: driverIdx >= 0 ? vals[driverIdx] : "Unknown",
            items: itemsIdx >= 0 ? parseInt(vals[itemsIdx]) || 0 : 0,
            totalWeight: weightIdx >= 0 ? parseInt(vals[weightIdx]) || 0 : 0,
            pickupDate: pickupIdx >= 0 ? vals[pickupIdx] : new Date().toISOString().slice(0, 10),
            estDelivery: estIdx >= 0 ? vals[estIdx] : "",
            shipStatus: statusIdx >= 0 ? vals[statusIdx] : "Created",
            transportMode: modeIdx >= 0 ? vals[modeIdx] : "Truck",
            priority: priorityIdx >= 0 ? vals[priorityIdx] : "Medium",
          });
        }
        if (newShipments.length === 0) { toast("No valid shipment records found", "error"); return; }
        setShipments(prev => [...newShipments, ...prev]);
        toast(`${newShipments.length} shipments imported from CSV!`, "success");
      } catch { toast("Error parsing CSV file", "error"); }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const handleExport = () => {
    const headers = "Shipment No,Customer,Origin,Destination,Pickup Date,Est Delivery,Vehicle,Driver,Items,Weight (kg),Status,Transport Mode,Priority";
    const rows = shipments.map(s =>
      `"${s.shipmentNo}","${s.customer}","${s.origin}","${s.destination}",${s.pickupDate},${s.estDelivery},"${s.vehicle}","${s.driver}",${s.items},${s.totalWeight},"${s.shipStatus}","${s.transportMode || "Truck"}","${s.priority || "Medium"}"`
    );
    const csv = [headers, ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "shipments.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  const handleDelete = (id: string) => {
    setShipments(prev => prev.filter(s => s.id !== id));
    setExpandedShipment(null);
    toast("Shipment removed", "success");
  };

  return (
    <div className="space-y-5">
      {/* Stats */}
      <div className="grid grid-cols-5 gap-3">
        <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-2 text-slate-400 text-xs font-medium mb-1"><Package size={12} /> Total</div>
          <div className="text-lg font-bold text-slate-900">{sampleShipments.length}</div>
        </div>
        <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-2 text-slate-400 text-xs font-medium mb-1"><Truck size={12} /> Active</div>
          <div className="text-lg font-bold text-blue-600">{activeShipments}</div>
        </div>
        <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-2 text-slate-400 text-xs font-medium mb-1"><CheckCircle size={12} /> Delivered</div>
          <div className="text-lg font-bold text-emerald-600">{delivered}</div>
        </div>
        <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-2 text-slate-400 text-xs font-medium mb-1"><Clock size={12} /> Created</div>
          <div className="text-lg font-bold text-amber-600">{created}</div>
        </div>
        <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-2 text-slate-400 text-xs font-medium mb-1"><Anchor size={12} /> Total Weight</div>
          <div className="text-lg font-bold text-slate-900">{(totalWeight / 1000).toFixed(0)}T</div>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="flex gap-3 items-center flex-wrap">
        <div className="flex-1 relative min-w-[200px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search shipments..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900" />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          className="px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 bg-white">
          <option value="All">All Status</option>
          <option value="Created">Created</option>
          <option value="Loaded">Loaded</option>
          <option value="In Transit">In Transit</option>
          <option value="Delivered">Delivered</option>
        </select>
        <input ref={fileInputRef} type="file" accept=".csv" onChange={handleImport} className="hidden" />
        <button onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-2 px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-green-600 hover:bg-green-50 transition-all">
          <Upload size={13} /> Import CSV
        </button>
        <button onClick={handleExport}
          className="flex items-center gap-2 px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-50 transition-all">
          <Download size={13} /> Export
        </button>
        <button onClick={handleAutoGenerate}
          className="flex items-center gap-2 px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-purple-600 hover:bg-purple-50 transition-all">
          <Zap size={13} /> Auto-Generate
        </button>
        <button onClick={openForm}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-black text-xs font-bold transition-all">
          <Plus size={13} /> Add Shipment
        </button>
      </div>

      {/* Shipment Table with Pipeline */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-100">
                <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap">Shipment</th>
                <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap">Customer</th>
                <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap">Route</th>
                <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap">Mode</th>
                <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap">Items/Wt</th>
                <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap">Pickup</th>
                <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap">Pipeline</th>
                <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap">Status</th>
                <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s, i) => {
                const TransportIcon = transportModeIcons[s.transportMode || "Truck"] || Truck;
                return (
                  <motion.tr key={s.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                    className={`border-b border-slate-100 hover:bg-slate-50/50 transition-colors ${
                      expandedShipment === s.id ? "bg-blue-50/50" : ""
                    }`}>
                    <td className="px-4 py-3 text-sm font-semibold text-slate-900">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-md bg-primary/5 flex items-center justify-center font-bold text-[10px] text-primary">{s.shipmentNo.slice(-3)}</div>
                        {s.shipmentNo}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600">
                      <div>
                        <div>{s.customer}</div>
                        {s.customerRef && <div className="text-[10px] text-slate-400">{s.customerRef}</div>}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-500">
                      <span className="text-emerald-600">{s.origin.split(" ")[0]}</span>
                      <ArrowRight size={9} className="inline mx-0.5 text-slate-300" />
                      <span className="text-red-400">{s.destination.split(" ")[0]}</span>
                    </td>
                    <td className="px-4 py-3">
                      <TransportIcon size={13} className="text-slate-400" />
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-500">{s.items} / {(s.totalWeight / 1000).toFixed(1)}T</td>
                    <td className="px-4 py-3 text-sm text-slate-500">{s.pickupDate}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-0.5">
                        {statusPipeline.map((step, si) => {
                          const currentIdx = statusPipeline.indexOf(s.shipStatus === "Cancelled" ? "Created" : s.shipStatus);
                          const isDone = si < currentIdx;
                          const isCurrent = si === currentIdx;
                          return (
                            <div key={step} className="flex items-center">
                              <div className={`w-4 h-4 rounded-full flex items-center justify-center ${isDone ? "bg-emerald-100" : isCurrent ? "bg-blue-100" : "bg-slate-100"}`}>
                                {isDone ? <CheckCircle size={8} className="text-emerald-500" /> : <div className={`w-1.5 h-1.5 rounded-full ${isCurrent ? "bg-blue-500" : "bg-slate-300"}`} />}
                              </div>
                              {si < statusPipeline.length - 1 && <div className={`w-3 h-px ${si < currentIdx ? "bg-emerald-300" : "bg-slate-200"}`} />}
                            </div>
                          );
                        })}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${statusColors[s.shipStatus]}`}>{s.shipStatus}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button onClick={() => setExpandedShipment(expandedShipment === s.id ? null : s.id)}
                          className={`w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100 transition-colors ${expandedShipment === s.id ? "bg-blue-50" : ""}`}>
                          <MoreHorizontal size={12} />
                        </button>
                        <button onClick={() => setConfirmDeleteId(s.id)}
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
          <span>{filtered.length} shipment{filtered.length !== 1 ? "s" : ""}</span>
        </div>
      </div>

      {/* Expanded Shipment Details */}
      {/* Delete Confirmation */}
      {confirmDeleteId && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-xl text-center">
            <AlertCircle size={22} className="text-red-500 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-slate-900 mb-1">Delete Shipment?</h3>
            <p className="text-sm text-slate-500 mb-5">This action cannot be undone.</p>
            <div className="flex gap-2 justify-center">
              <button onClick={() => setConfirmDeleteId(null)} className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">Cancel</button>
              <button onClick={() => handleDelete(confirmDeleteId)} className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-bold transition-all">Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* Add Shipment Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-900">Add Shipment</h2>
              <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600"><X size={18} /></button>
            </div>
            <form onSubmit={handleAddShipment} className="p-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1 col-span-2">
                  <label className="text-xs font-semibold text-slate-700">Customer *</label>
                  <select value={formData.customer || ""} onChange={e => setFormData({ ...formData, customer: e.target.value })} required
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-slate-900 bg-white">
                    <option value="">Select customer</option>
                    {CUSTOMERS.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-slate-700">Origin *</label>
                  <input type="text" value={formData.origin || ""} onChange={e => setFormData({ ...formData, origin: e.target.value })} required
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-slate-900" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-slate-700">Destination *</label>
                  <input type="text" value={formData.destination || ""} onChange={e => setFormData({ ...formData, destination: e.target.value })} required
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-slate-900" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-slate-700">Pickup Date *</label>
                  <input type="date" value={formData.pickupDate || ""} onChange={e => setFormData({ ...formData, pickupDate: e.target.value })} required
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-slate-900" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-slate-700">Est. Delivery *</label>
                  <input type="date" value={formData.estDelivery || ""} onChange={e => setFormData({ ...formData, estDelivery: e.target.value })} required
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-slate-900" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-slate-700">Vehicle</label>
                  <select value={formData.vehicle || ""} onChange={e => setFormData({ ...formData, vehicle: e.target.value })}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-slate-900 bg-white">
                    <option value="">Select vehicle</option>
                    {SHIP_VEHICLES.map(v => <option key={v} value={v}>{v}</option>)}
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-slate-700">Driver</label>
                  <select value={formData.driver || ""} onChange={e => setFormData({ ...formData, driver: e.target.value })}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-slate-900 bg-white">
                    <option value="">Select driver</option>
                    {SHIP_DRIVERS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-slate-700">Items *</label>
                  <input type="number" min="1" value={formData.items || ""} onChange={e => setFormData({ ...formData, items: e.target.value })} required
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-slate-900" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-slate-700">Weight (kg) *</label>
                  <input type="number" min="1" value={formData.totalWeight || ""} onChange={e => setFormData({ ...formData, totalWeight: e.target.value })} required
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-slate-900" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-slate-700">Transport Mode</label>
                  <select value={formData.transportMode || "Truck"} onChange={e => setFormData({ ...formData, transportMode: e.target.value })}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-slate-900 bg-white">
                    <option>Truck</option><option>Ship</option><option>Plane</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-slate-700">Priority</label>
                  <select value={formData.priority || "Medium"} onChange={e => setFormData({ ...formData, priority: e.target.value })}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-slate-900 bg-white">
                    <option>Low</option><option>Medium</option><option>High</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button type="button" onClick={() => setShowForm(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">Cancel</button>
                <button type="submit" disabled={isSaving}
                  className="px-4 py-2 rounded-xl bg-primary hover:bg-primary/90 text-black text-sm font-bold transition-all disabled:opacity-50">
                  {isSaving ? "Adding..." : "Add Shipment"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Expanded Shipment Details */}
      {expandedShipment && (() => {
        const s = shipments.find(sh => sh.id === expandedShipment);
        if (!s) return null;
        return (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
            className="bg-slate-50 border border-slate-200 rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-slate-900">{s.shipmentNo} — Details</h3>
              <button onClick={() => setExpandedShipment(null)} className="text-slate-400 hover:text-slate-600"><X size={16} /></button>
            </div>
            {s.notes && (
              <div className="flex items-center gap-1 text-[10px] text-amber-600 bg-amber-50 rounded-lg px-2.5 py-1.5 mb-3">
                <AlertCircle size={10} /> {s.notes}
              </div>
            )}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs text-slate-500 mb-3">
              <div>
                <div className="text-[9px] text-slate-400 uppercase font-bold">Vehicle</div>
                <div className="font-semibold text-slate-800">{s.vehicle}</div>
                <div className="text-slate-400">{s.driver}</div>
              </div>
              <div>
                <div className="text-[9px] text-slate-400 uppercase font-bold">Weight</div>
                <div className="font-semibold text-slate-800">{(s.totalWeight / 1000).toFixed(1)}T</div>
                <div className="text-slate-400">{s.items} packages</div>
              </div>
              <div>
                <div className="text-[9px] text-slate-400 uppercase font-bold">Est. Delivery</div>
                <div className="font-semibold text-slate-800">{s.estDelivery}</div>
                {s.actualDelivery && <div className="text-emerald-500">Delivered: {s.actualDelivery}</div>}
              </div>
              <div>
                <div className="text-[9px] text-slate-400 uppercase font-bold">Route</div>
                <div className="font-semibold text-slate-800">{s.origin} → {s.destination}</div>
              </div>
            </div>
            {s.documents && s.documents.length > 0 && (
              <div className="mb-3">
                <div className="text-[9px] font-bold text-slate-400 uppercase mb-1">Documents</div>
                <div className="flex gap-1.5 flex-wrap">
                  {s.documents.map((doc, di) => (
                    <span key={di} className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-slate-100 text-[9px] text-slate-600 font-medium">
                      <FileText size={9} /> {doc.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
            <div className="flex gap-1.5 pt-2 border-t border-slate-100">
              {s.shipStatus === "Created" && (
                <button onClick={() => handleStatusAdvance(s.id, "Loaded")}
                  className="px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 text-[10px] font-semibold hover:bg-blue-100 transition-colors">
                  <CheckCircle size={10} className="inline mr-1" />Mark Loaded
                </button>
              )}
              {s.shipStatus === "Loaded" && (
                <button onClick={() => handleStatusAdvance(s.id, "In Transit")}
                  className="px-3 py-1.5 rounded-lg bg-amber-50 text-amber-700 text-[10px] font-semibold hover:bg-amber-100 transition-colors">
                  <Truck size={10} className="inline mr-1" />Start Transit
                </button>
              )}
              {s.trackingUrl && (
                <button onClick={() => toast(`Tracking URL: ${s.trackingUrl}`, "info")}
                  className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-600 text-[10px] font-semibold hover:bg-slate-200 transition-colors">
                  <Globe size={10} className="inline mr-1" />Tracking
                </button>
              )}
            </div>
          </motion.div>
        );
      })()}

      {/* Empty State */}
      {filtered.length === 0 && (
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-10 text-center">
          <Ship size={24} className="text-slate-300 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-slate-900 mb-1">No Shipments Found</h3>
          <p className="text-sm text-slate-500">{search ? "Try a different search" : "Create your first shipment"}</p>
        </div>
      )}
    </div>
  );
}

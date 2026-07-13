"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import {
  Search, Package, Truck, User, MapPin, Calendar, CheckCircle, Clock, XCircle,
  ArrowRight, Phone, Mail, Camera, FileText, Star, Navigation, AlertCircle,
  Download, Filter, ChevronDown, ChevronUp, CreditCard, Send, X
} from "lucide-react";
import { useToast } from "@/components/ui/Toast";

interface Delivery {
  id: string;
  deliveryNo: string;
  customer: string;
  customerPhone: string;
  address: string;
  vehicle: string;
  driver: string;
  items: number;
  weight: number;
  scheduledDate: string;
  deliveredDate: string;
  deliStatus: string;
  priority?: string;
  signature?: string;
  notes?: string;
  proofImages?: number;
  rating?: number;
}

const sampleDeliveries: Delivery[] = [
  { id: "del1", deliveryNo: "DEL-001", customer: "Sunrise PLC", customerPhone: "+251-911-2001", address: "Bole, Addis Ababa", vehicle: "Toyota Hilux", driver: "Solomon Tadesse", items: 24, weight: 480, scheduledDate: "2026-07-10", deliveredDate: "2026-07-10", deliStatus: "Delivered", priority: "High", signature: "S. Tadesse", proofImages: 2, rating: 5 },
  { id: "del2", deliveryNo: "DEL-002", customer: "Green Valley Ltd", customerPhone: "+251-911-2002", address: "CMC, Addis Ababa", vehicle: "Isuzu Truck FVR", driver: "Petros Haile", items: 120, weight: 2400, scheduledDate: "2026-07-10", deliveredDate: "", deliStatus: "In Transit", priority: "Medium", notes: "Handle with care - fragile items" },
  { id: "del3", deliveryNo: "DEL-003", customer: "Addis Tech", customerPhone: "+251-911-2003", address: "Kazanchis, Addis Ababa", vehicle: "Hyundai H350", driver: "Daniel Bekele", items: 8, weight: 160, scheduledDate: "2026-07-11", deliveredDate: "", deliStatus: "Pending", priority: "Low" },
  { id: "del4", deliveryNo: "DEL-004", customer: "Blue Nile Exports", customerPhone: "+251-911-2004", address: "Djibouti Road", vehicle: "Mitsubishi Fuso", driver: "Bereket Alemu", items: 200, weight: 8000, scheduledDate: "2026-07-09", deliveredDate: "2026-07-09", deliStatus: "Delivered", priority: "High", signature: "B. Alemu", proofImages: 3, rating: 4 },
  { id: "del5", deliveryNo: "DEL-005", customer: "Ethio Supply Co", customerPhone: "+251-911-2005", address: "Akaki, Addis Ababa", vehicle: "Land Cruiser", driver: "Mulugeta Girma", items: 15, weight: 300, scheduledDate: "2026-07-10", deliveredDate: "", deliStatus: "Failed", priority: "Medium", notes: "Customer not available, rescheduled" },
  { id: "del6", deliveryNo: "DEL-006", customer: "TechParts Ethiopia", customerPhone: "+251-911-2006", address: "Bole Airport Area", vehicle: "Toyota Hiace", driver: "Tewodros Hailu", items: 45, weight: 680, scheduledDate: "2026-07-11", deliveredDate: "", deliStatus: "Pending", priority: "High" },
  { id: "del7", deliveryNo: "DEL-007", customer: "Horn of Africa", customerPhone: "+251-911-2007", address: "Piassa, Addis Ababa", vehicle: "Isuzu Truck FVR", driver: "Petros Haile", items: 60, weight: 1500, scheduledDate: "2026-07-08", deliveredDate: "2026-07-08", deliStatus: "Delivered", priority: "Medium", signature: "P. Haile", proofImages: 1, rating: 5 },
];

const statusColors: Record<string, string> = {
  "Delivered": "bg-emerald-50 text-emerald-700 border-emerald-200",
  "In Transit": "bg-blue-50 text-blue-700 border-blue-200",
  "Pending": "bg-amber-50 text-amber-700 border-amber-200",
  "Failed": "bg-red-50 text-red-600 border-red-200",
  "Returned": "bg-slate-100 text-slate-600 border-slate-200",
};

const statusIcons: Record<string, any> = {
  "Delivered": CheckCircle, "In Transit": Truck, "Pending": Clock, "Failed": XCircle, "Returned": XCircle,
};

const priorityColors: Record<string, string> = {
  "High": "text-red-600 bg-red-50", "Medium": "text-amber-600 bg-amber-50", "Low": "text-slate-500 bg-slate-50",
};

export default function DeliveryTrackingPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedDelivery, setSelectedDelivery] = useState<Delivery | null>(null);
  const { toast } = useToast();

  const filtered = sampleDeliveries.filter(d => {
    const matchesSearch = !search ||
      d.deliveryNo.toLowerCase().includes(search.toLowerCase()) ||
      d.customer.toLowerCase().includes(search.toLowerCase()) ||
      d.driver.toLowerCase().includes(search.toLowerCase()) ||
      d.address.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "All" || d.deliStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const inTransit = sampleDeliveries.filter(d => d.deliStatus === "In Transit").length;
  const delivered = sampleDeliveries.filter(d => d.deliStatus === "Delivered").length;
  const pending = sampleDeliveries.filter(d => d.deliStatus === "Pending").length;
  const failed = sampleDeliveries.filter(d => d.deliStatus === "Failed").length;

  const handleStatusUpdate = (id: string, newStatus: string) => {
    toast(`Delivery ${id} status changed to ${newStatus}`, "success");
  };

  return (
    <div className="space-y-5">
      {/* Stats */}
      <div className="grid grid-cols-5 gap-3">
        <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-2 text-slate-400 text-xs font-medium mb-1"><Package size={12} /> Total</div>
          <div className="text-lg font-bold text-slate-900">{sampleDeliveries.length}</div>
        </div>
        <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-2 text-slate-400 text-xs font-medium mb-1"><Truck size={12} /> In Transit</div>
          <div className="text-lg font-bold text-blue-600">{inTransit}</div>
        </div>
        <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-2 text-slate-400 text-xs font-medium mb-1"><CheckCircle size={12} /> Delivered</div>
          <div className="text-lg font-bold text-emerald-600">{delivered}</div>
        </div>
        <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-2 text-slate-400 text-xs font-medium mb-1"><Clock size={12} /> Pending</div>
          <div className="text-lg font-bold text-amber-600">{pending}</div>
        </div>
        <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-2 text-slate-400 text-xs font-medium mb-1"><XCircle size={12} /> Failed</div>
          <div className="text-lg font-bold text-red-500">{failed}</div>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="flex gap-3 items-center flex-wrap">
        <div className="flex-1 relative min-w-[200px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search deliveries..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900" />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          className="px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 bg-white">
          <option value="All">All Status</option>
          <option value="In Transit">In Transit</option>
          <option value="Delivered">Delivered</option>
          <option value="Pending">Pending</option>
          <option value="Failed">Failed</option>
        </select>
      </div>

      {/* Delivery Table */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-100">
                <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap">Delivery</th>
                <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap">Customer</th>
                <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap">Address</th>
                <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap">Vehicle</th>
                <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap">Items</th>
                <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap">Status</th>
                <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap">Priority</th>
                <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((d, i) => {
                const Icon = statusIcons[d.deliStatus] || Package;
                return (
                  <motion.tr key={d.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                    className={`border-b border-slate-100 hover:bg-slate-50/50 transition-colors ${
                      selectedDelivery?.id === d.id ? "bg-blue-50/50" : ""
                    }`}>
                    <td className="px-4 py-3 text-sm font-semibold text-slate-900">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-md bg-primary/5 flex items-center justify-center"><Icon size={11} className="text-primary" /></div>
                        {d.deliveryNo}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600">{d.customer}</td>
                    <td className="px-4 py-3 text-sm text-slate-500">{d.address}</td>
                    <td className="px-4 py-3 text-sm text-slate-600">{d.vehicle}</td>
                    <td className="px-4 py-3 text-sm text-slate-500">{d.items} / {d.weight}kg</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${statusColors[d.deliStatus]}`}>{d.deliStatus}</span>
                    </td>
                    <td className="px-4 py-3">
                      {d.priority && (
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md ${priorityColors[d.priority]}`}>{d.priority}</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        {d.deliStatus === "Pending" && (
                          <button onClick={() => handleStatusUpdate(d.id, "In Transit")}
                            className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-medium text-blue-600 hover:bg-blue-50 transition-colors">
                            <Truck size={10} /> Dispatch
                          </button>
                        )}
                        {d.deliStatus === "In Transit" && (
                          <button onClick={() => handleStatusUpdate(d.id, "Delivered")}
                            className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-medium text-emerald-600 hover:bg-emerald-50 transition-colors">
                            <CheckCircle size={10} /> Deliver
                          </button>
                        )}
                        <button onClick={() => setSelectedDelivery(selectedDelivery?.id === d.id ? null : d)}
                          className={`w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100 transition-colors ${selectedDelivery?.id === d.id ? "bg-blue-50" : ""}`}>
                          {selectedDelivery?.id === d.id ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                        </button>
                      </div>
                      {selectedDelivery?.id === d.id && d.notes && (
                        <div className="mt-1 text-[10px] text-amber-600 flex items-center gap-1"><AlertCircle size={9} /> {d.notes}</div>
                      )}
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 border-t border-slate-200 bg-slate-50/50 flex items-center justify-between text-xs text-slate-500">
          <span>{filtered.length} deliver{filtered.length !== 1 ? "ies" : "y"}</span>
        </div>
      </div>

      {/* Expanded Delivery Details */}
      {selectedDelivery && (() => {
        const d = sampleDeliveries.find(del => del.id === selectedDelivery.id);
        if (!d) return null;
        return (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
            className="bg-slate-50 border border-slate-200 rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-slate-900">{d.deliveryNo} — {d.customer}</h3>
              <button onClick={() => setSelectedDelivery(null)} className="text-slate-400 hover:text-slate-600"><X size={16} /></button>
            </div>
            <div className="grid grid-cols-2 gap-3 text-xs text-slate-500 mb-3">
              <div>
                <div className="text-[9px] text-slate-400 uppercase font-bold">Driver</div>
                <div className="font-semibold text-slate-800">{d.driver}</div>
              </div>
              <div>
                <div className="text-[9px] text-slate-400 uppercase font-bold">Phone</div>
                <div className="font-semibold text-slate-800">{d.customerPhone}</div>
              </div>
              <div>
                <div className="text-[9px] text-slate-400 uppercase font-bold">Scheduled</div>
                <div className="font-semibold text-slate-800">{d.scheduledDate}</div>
              </div>
              <div>
                <div className="text-[9px] text-slate-400 uppercase font-bold">Delivered</div>
                <div className="font-semibold text-slate-800">{d.deliveredDate || "—"}</div>
              </div>
            </div>
            {d.notes && (
              <div className="flex items-center gap-1 text-[10px] text-amber-600 bg-amber-50 rounded-lg px-2.5 py-1.5 mb-3">
                <AlertCircle size={10} /> {d.notes}
              </div>
            )}
            <div className="flex flex-wrap gap-1.5 pt-2 border-t border-slate-100">
              <button className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-100 text-[10px] font-medium text-slate-600 hover:bg-green-50 hover:text-green-600 transition-colors">
                <Phone size={10} /> Call {d.driver}
              </button>
              <button className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-100 text-[10px] font-medium text-slate-600 hover:bg-blue-50 hover:text-blue-600 transition-colors">
                <Navigation size={10} /> Navigate
              </button>
              {d.deliStatus === "In Transit" && (
                <button onClick={() => handleStatusUpdate(d.id, "Delivered")}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 text-[10px] font-semibold hover:bg-emerald-100 transition-colors">
                  <CheckCircle size={10} /> Mark Delivered
                </button>
              )}
              {(d.deliStatus === "Pending" || d.deliStatus === "In Transit") && (
                <button onClick={() => handleStatusUpdate(d.id, "Failed")}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-50 text-red-600 text-[10px] font-semibold hover:bg-red-100 transition-colors">
                  <XCircle size={10} /> Mark Failed
                </button>
              )}
              {d.proofImages && (
                <span className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-100 text-[10px] text-slate-500">
                  <Camera size={10} /> {d.proofImages} photo{d.proofImages !== 1 ? "s" : ""}
                  {d.signature && <> · Signed: {d.signature}</>}
                </span>
              )}
              {d.rating && (
                <span className="flex items-center gap-0.5 px-3 py-1.5 rounded-lg bg-slate-100 text-[10px] text-amber-500">
                  {Array.from({ length: d.rating }).map((_, ri) => <Star key={ri} size={9} className="fill-amber-400" />)}
                </span>
              )}
            </div>
          </motion.div>
        );
      })()}

      {/* Empty State */}
      {filtered.length === 0 && (
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-10 text-center">
          <Package size={24} className="text-slate-300 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-slate-900 mb-1">No Deliveries Found</h3>
          <p className="text-sm text-slate-500">{search ? "Try a different search" : "No deliveries scheduled"}</p>
        </div>
      )}
    </div>
  );
}

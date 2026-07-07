"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LifeBuoy, Plus, Send, Search, RefreshCw,
  HelpCircle, MessageSquare, Clock, CheckCircle,
  AlertCircle, ChevronRight, Download, X,
  FileText, Calendar, Users as UsersIcon,
  DollarSign, HeartHandshake, BookOpen,
} from "lucide-react";
import { useToast } from "@/components/ui/Toast";

// ── Types ────────────────────────────────────────────────────
interface HelpRequest {
  id: string;
  subject: string;
  description?: string;
  category: string;
  status: string;
  employeeId?: string;
  createdAt: string;
}

interface EmployeeInfo {
  id: string;
  name: string;
  employeeCode: string;
  department: string;
  position: string;
  email: string;
  phone: string;
}

// ── Category Config ──────────────────────────────────────────
const CATEGORIES = [
  { value: "PAYROLL",      label: "Payroll",        icon: DollarSign,    color: "text-emerald-600", bg: "bg-emerald-50" },
  { value: "LEAVE",        label: "Leave Request",   icon: Calendar,      color: "text-blue-600",    bg: "bg-blue-50" },
  { value: "IT_SUPPORT",   label: "IT Support",      icon: HelpCircle,    color: "text-violet-600",  bg: "bg-violet-50" },
  { value: "HR_QUERY",     label: "HR Query",        icon: UsersIcon,     color: "text-indigo-600",  bg: "bg-indigo-50" },
  { value: "BENEFITS",     label: "Benefits",        icon: HeartHandshake,color: "text-pink-600",    bg: "bg-pink-50" },
  { value: "TRAINING",     label: "Training",        icon: BookOpen,      color: "text-teal-600",    bg: "bg-teal-50" },
  { value: "DOCUMENTS",    label: "Documents",       icon: FileText,      color: "text-amber-600",   bg: "bg-amber-50" },
  { value: "GENERAL",      label: "General",         icon: MessageSquare, color: "text-slate-600",   bg: "bg-slate-50" },
];

const STATUS_STYLES: Record<string, { label: string; bg: string; text: string; dot: string }> = {
  OPEN:        { label: "Open",         bg: "bg-blue-50",     text: "text-blue-700",    dot: "bg-blue-500" },
  IN_PROGRESS: { label: "In Progress",  bg: "bg-amber-50",    text: "text-amber-700",   dot: "bg-amber-500" },
  RESOLVED:    { label: "Resolved",     bg: "bg-emerald-50",  text: "text-emerald-700", dot: "bg-emerald-500" },
};

function getCategory(cat: string) {
  return CATEGORIES.find(c => c.value === cat) || CATEGORIES.find(c => c.value === "GENERAL") || CATEGORIES[0];
}

function StatusBadge({ status }: { status: string }) {
  const s = STATUS_STYLES[status] || { label: status, bg: "bg-slate-50", text: "text-slate-600", dot: "bg-slate-400" };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold ${s.bg} ${s.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {s.label}
    </span>
  );
}

function CatBadge({ category }: { category: string }) {
  const cat = getCategory(category);
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold ${cat.bg} ${cat.color}`}>
      <cat.icon size={10} />
      {cat.label}
    </span>
  );
}

// ── Detail Modal (defined outside component for performance) ──
function DetailModal({ request, onClose }: { request: HelpRequest; onClose: () => void }) {
  const cat = getCategory(request.category);
  const s = STATUS_STYLES[request.status] || { label: request.status, bg: "bg-slate-50", text: "text-slate-600", dot: "bg-slate-400" };
  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <div className="bg-gradient-to-r from-slate-900 to-slate-700 px-6 py-5 text-white">
          <div className="flex items-center justify-between mb-2">
            <CatBadge category={request.category} />
            <button onClick={onClose} className="text-white/60 hover:text-white transition-colors">
              <X size={18} />
            </button>
          </div>
          <h3 className="text-lg font-bold mt-2">{request.subject}</h3>
          <div className="flex items-center gap-2 mt-1">
            <Clock size={12} className="text-slate-400" />
            <span className="text-xs text-slate-300">
              {new Date(request.createdAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" })}
            </span>
          </div>
        </div>
        <div className="p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className={`px-3 py-1.5 rounded-lg ${s.bg} ${s.text} text-xs font-semibold flex items-center gap-1.5`}>
              <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
              {s.label}
            </div>
            <div className={`px-3 py-1.5 rounded-lg ${cat.bg} text-xs font-semibold flex items-center gap-1.5 ${cat.color}`}>
              <cat.icon size={12} /> {cat.label}
            </div>
          </div>
          {request.description && (
            <div className="bg-slate-50 rounded-xl p-4">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Description</p>
              <p className="text-sm text-slate-700 whitespace-pre-wrap">{request.description}</p>
            </div>
          )}
          <div className="bg-slate-50 rounded-xl p-4">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Request Info</p>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div><span className="text-slate-400">ID:</span> <span className="font-medium text-slate-700 ml-1">{request.id.slice(0, 8)}</span></div>
              <div><span className="text-slate-400">Category:</span> <span className="font-medium text-slate-700 ml-1">{cat.label}</span></div>
              <div><span className="text-slate-400">Status:</span> <span className="font-medium text-slate-700 ml-1">{s.label}</span></div>
              <div><span className="text-slate-400">Submitted:</span> <span className="font-medium text-slate-700 ml-1">{new Date(request.createdAt).toLocaleDateString()}</span></div>
            </div>
          </div>
        </div>
        <div className="px-6 pb-6">
          <button onClick={onClose} className="w-full py-2.5 rounded-xl bg-slate-900 text-white text-sm font-semibold hover:bg-black transition-colors">Close</button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ══════════════════════════════════════════════════════════════
//  MAIN COMPONENT
// ══════════════════════════════════════════════════════════════
export default function EmployeeSelfService() {
  const { toast } = useToast();
  const [requests, setRequests] = useState<HelpRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [filterCat, setFilterCat] = useState<string>("ALL");
  const [showForm, setShowForm] = useState(false);
  const [showDetail, setShowDetail] = useState<HelpRequest | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({ subject: "", description: "", category: "GENERAL" });

  // Employee info from JWT
  const [employeeInfo] = useState<EmployeeInfo>(() => {
    try {
      const token = localStorage.getItem("token") || "";
      const payload = JSON.parse(atob(token.split(".")[1]));
      return {
        id: payload.sub || "",
        name: `${payload.firstName || ""} ${payload.lastName || ""}`.trim() || payload.email?.split("@")[0] || "Employee",
        employeeCode: payload.employeeCode || "",
        department: payload.department || "",
        position: payload.position || "",
        email: payload.email || "",
        phone: payload.phone || "",
      };
    } catch {
      return { id: "", name: "Employee", employeeCode: "", department: "", position: "", email: "", phone: "" };
    }
  });

  const API_BASE = "http://localhost:3002/api/v1/modules/human-resources/employee-self-service";
  const getToken = () => localStorage.getItem("token") || "";

  const loadRequests = async () => {
    setLoading(true);
    try {
      const res = await fetch(API_BASE, { headers: { Authorization: `Bearer ${getToken()}` } });
      const data = await res.json();
      if (data?.data && Array.isArray(data.data)) {
        setRequests(data.data);
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadRequests(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.subject.trim()) { toast("Please enter a subject", "error"); return; }
    setSubmitting(true);
    try {
      const res = await fetch(API_BASE, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        toast("Request submitted successfully", "success");
        setShowForm(false);
        setFormData({ subject: "", description: "", category: "GENERAL" });
        loadRequests();
      } else {
        const err = await res.json();
        toast(err?.message || "Failed to submit", "error");
      }
    } catch {
      toast("Failed to submit request", "error");
    } finally {
      setSubmitting(false);
    }
  };

  // ── Filtering ─────────────────────────────────────────────
  const filtered = requests.filter(r => {
    const matchesSearch = r.subject.toLowerCase().includes(search.toLowerCase()) ||
      (r.description || "").toLowerCase().includes(search.toLowerCase());
    const matchesStatus = filterStatus === "ALL" || r.status === filterStatus;
    const matchesCat = filterCat === "ALL" || r.category === filterCat;
    return matchesSearch && matchesStatus && matchesCat;
  });

  const stats = {
    total: requests.length,
    open: requests.filter(r => r.status === "OPEN").length,
    inProgress: requests.filter(r => r.status === "IN_PROGRESS").length,
    resolved: requests.filter(r => r.status === "RESOLVED").length,
  };

  // ── Export ─────────────────────────────────────────────────
  const handleExport = () => {
    if (requests.length === 0) return;
    const headers = "Subject,Category,Status,Description,Created\n";
    const rows = requests.map(r =>
      `"${r.subject}","${r.category}","${r.status}","${(r.description || "").replace(/"/g, '""')}","${r.createdAt}"`
    ).join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "employee-requests.csv";
    a.click(); URL.revokeObjectURL(url);
    toast("Exported CSV", "success");
  };

  // ── Loading ──
  if (loading && requests.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <span className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <span className="text-sm text-slate-500">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20">
      {/* ── Header ─────────────────────────────────────── */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
              <LifeBuoy size={22} className="text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">Employee Self-Service</h1>
              <p className="text-sm text-slate-400 mt-0.5">Welcome, {employeeInfo.name} — submit and track HR requests</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={loadRequests} className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors" title="Refresh">
              <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
            </button>
            <button onClick={handleExport} className="px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-semibold transition-colors flex items-center gap-1.5 border border-white/10">
              <Download size={12} /> Export
            </button>
          </div>
        </div>
      </div>

      {/* ── Stats Cards ────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total Requests", value: stats.total, color: "from-slate-600 to-slate-500", icon: MessageSquare },
          { label: "Open", value: stats.open, color: "from-blue-600 to-blue-500", icon: AlertCircle },
          { label: "In Progress", value: stats.inProgress, color: "from-amber-600 to-amber-500", icon: Clock },
          { label: "Resolved", value: stats.resolved, color: "from-emerald-600 to-emerald-500", icon: CheckCircle },
        ].map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="bg-white border border-slate-100 rounded-xl p-4 hover:shadow-sm transition-shadow"
          >
            <div className="flex items-center gap-2.5 mb-2">
              <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${card.color} flex items-center justify-center shadow-sm`}>
                <card.icon size={14} className="text-white" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-900">{card.value}</div>
            <div className="text-[11px] text-slate-500 font-medium mt-0.5">{card.label}</div>
          </motion.div>
        ))}
      </div>

      {/* ── New Request Button + Filters ──────────────── */}
      <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-black text-xs font-bold transition-all shadow-sm"
          >
            <Plus size={14} /> New Request
          </button>
          <div className="flex gap-2 flex-wrap">
            <div className="relative">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search requests..."
                className="w-44 pl-8 pr-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-slate-900 bg-white placeholder:text-slate-400"
              />
            </div>
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-900 bg-white">
              <option value="ALL">All Status</option>
              <option value="OPEN">Open</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="RESOLVED">Resolved</option>
            </select>
            <select value={filterCat} onChange={e => setFilterCat(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-900 bg-white">
              <option value="ALL">All Categories</option>
              {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* ── Requests List ─────────────────────────────── */}
      <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-100 bg-slate-50/50">
          <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            {filtered.length === requests.length
              ? `All Requests (${requests.length})`
              : `Filtered (${filtered.length} of ${requests.length})`}
          </h2>
        </div>

        {filtered.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-14 h-14 rounded-full bg-slate-50 flex items-center justify-center mx-auto mb-3">
              <MessageSquare size={24} className="text-slate-300" />
            </div>
            <p className="text-sm font-semibold text-slate-500 mb-1">
              {search || filterStatus !== "ALL" || filterCat !== "ALL" ? "No matching requests" : "No requests yet"}
            </p>
            <p className="text-xs text-slate-400 mb-4">
              {search || filterStatus !== "ALL" || filterCat !== "ALL"
                ? "Try changing your filters"
                : "Submit your first HR request to get started"}
            </p>
            {!search && filterStatus === "ALL" && filterCat === "ALL" && (
              <button onClick={() => setShowForm(true)}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-black text-xs font-bold transition-all">
                <Plus size={13} /> New Request
              </button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {filtered.map((req, i) => {
              const cat = getCategory(req.category);
              return (
                <motion.div
                  key={req.id}
                  initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.02 }}
                  className="px-5 py-3.5 hover:bg-slate-50/50 transition-colors cursor-pointer"
                  onClick={() => setShowDetail(req)}
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2.5 mb-1">
                        <div className={`w-7 h-7 rounded-lg ${cat.bg} flex items-center justify-center shrink-0`}>
                          <cat.icon size={12} className={cat.color} />
                        </div>
                        <span className="text-sm font-semibold text-slate-900 truncate">{req.subject}</span>
                      </div>
                      <div className="flex items-center gap-2.5 ml-9">
                        <CatBadge category={req.category} />
                        <span className="text-[10px] text-slate-400">
                          {new Date(req.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <StatusBadge status={req.status} />
                      <ChevronRight size={14} className="text-slate-300" />
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between text-xs text-slate-500">
          <span>{filtered.length} of {requests.length} request{requests.length !== 1 ? "s" : ""}</span>
          <button onClick={handleExport} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-white transition-colors">
            <Download size={11} /> CSV
          </button>
        </div>
      </div>

      {/* ── New Request Form Modal ────────────────────── */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
            onClick={() => setShowForm(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-100">
                <div className="w-9 h-9 rounded-xl bg-primary/20 flex items-center justify-center">
                  <LifeBuoy size={16} className="text-primary" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">Submit a Request</h2>
                  <p className="text-xs text-slate-500">Describe your HR-related request</p>
                </div>
                <button onClick={() => setShowForm(false)} className="ml-auto text-slate-400 hover:text-slate-600 transition-colors">
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 block">Category</label>
                  <div className="grid grid-cols-4 gap-2">
                    {CATEGORIES.map(cat => (
                      <button
                        key={cat.value}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, category: cat.value }))}
                        className={`flex flex-col items-center gap-1 p-2.5 rounded-xl border transition-all ${
                          formData.category === cat.value
                            ? "border-slate-900 bg-slate-50 ring-1 ring-slate-900"
                            : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                        }`}
                      >
                        <cat.icon size={14} className={cat.color} />
                        <span className={`text-[9px] font-semibold text-center leading-tight ${formData.category === cat.value ? "text-slate-900" : "text-slate-500"}`}>
                          {cat.label}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 block">Subject</label>
                  <input
                    value={formData.subject}
                    onChange={e => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                    placeholder="Brief title of your request"
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 placeholder:text-slate-400"
                    autoFocus
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 block">Description (optional)</label>
                  <textarea
                    value={formData.description}
                    onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Provide more details about your request..."
                    rows={4}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 placeholder:text-slate-400 resize-none"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting || !formData.subject.trim()}
                    className="flex-1 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-black transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {submitting ? (
                      <><span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" /> Submitting...</>
                    ) : (
                      <><Send size={12} /> Submit Request</>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Detail Modal ──────────────────────────────── */}
      <AnimatePresence>
        {showDetail && <DetailModal request={showDetail} onClose={() => setShowDetail(null)} />}
      </AnimatePresence>
    </div>
  );
}

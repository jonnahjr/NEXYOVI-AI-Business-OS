"use client";

import { use, useState, useEffect } from "react";
import { notFound } from "next/navigation";
import { motion } from "framer-motion";
import {
  BrainCircuit, Send, Plus, Search, Filter, Download,
  MoreHorizontal, ChevronLeft, Pencil, Trash2, Eye, X
} from "lucide-react";
import Link from "next/link";
import { NEXYOVI_PILLARS, toSlug } from "@/lib/pillars";
import { getModuleConfig, Column } from "@/lib/module-config";
import { getPillarConfig } from "@/lib/pillar-config";
import UltimateEmployeeManager from "@/components/hr/UltimateEmployeeManager";

const STATUS_COLORS: Record<string, string> = {
  "Active":           "bg-slate-100 text-slate-900",
  "Inactive":         "bg-slate-100 text-slate-900",
  "On Leave":         "bg-slate-100 text-slate-900",
  "Paid":             "bg-slate-100 text-slate-900",
  "Pending":          "bg-slate-100 text-slate-900",
  "Processing":       "bg-slate-100 text-slate-900",
  "Approved":         "bg-slate-100 text-slate-900",
  "Rejected":         "bg-slate-100 text-slate-900",
  "Overdue":          "bg-slate-100 text-slate-900",
  "Partial":          "bg-slate-100 text-slate-900",
  "Sent":             "bg-slate-100 text-slate-900",
  "Draft":            "bg-slate-100 text-slate-900",
  "Final":            "bg-slate-100 text-slate-900",
  "Signed":           "bg-slate-100 text-slate-900",
  "Pending Signature":"bg-slate-100 text-slate-900",
  "Qualified":        "bg-slate-100 text-slate-900",
  "Proposal":         "bg-slate-100 text-slate-900",
  "Negotiation":      "bg-slate-100 text-slate-900",
  "New":              "bg-slate-100 text-slate-900",
  "Closed Won":       "bg-slate-100 text-slate-900",
  "Lost":             "bg-slate-100 text-slate-900",
  "In Stock":         "bg-slate-100 text-slate-900",
  "Low Stock":        "bg-slate-100 text-slate-900",
  "Out of Stock":     "bg-slate-100 text-slate-900",
  "Posted":           "bg-slate-100 text-slate-900",
  "High":             "bg-slate-100 text-slate-900",
  "Medium":           "bg-slate-100 text-slate-900",
  "Low":              "bg-slate-100 text-slate-900",
  "Completed":        "bg-slate-100 text-slate-900",
  "In Progress":      "bg-slate-100 text-slate-900",
  "Planned":          "bg-slate-100 text-slate-900",
  "On Track":         "bg-slate-100 text-slate-900",
  "At Risk":          "bg-slate-100 text-slate-900",
  "Delayed":          "bg-slate-100 text-slate-900",
  "On Route":         "bg-slate-100 text-slate-900",
  "Available":        "bg-slate-100 text-slate-900",
  "Maintenance":      "bg-slate-100 text-slate-900",
  "Present":          "bg-slate-100 text-slate-900",
  "Absent":           "bg-slate-100 text-slate-900",
  "Late":             "bg-slate-100 text-slate-900",
  "Website":          "bg-slate-100 text-slate-900",
  "Referral":         "bg-slate-100 text-slate-900",
  "LinkedIn":         "bg-slate-100 text-slate-900",
  "Cold Call":        "bg-slate-100 text-slate-900",
  "Event":            "bg-slate-100 text-slate-900",
  "Food":             "bg-slate-100 text-slate-900",
  "Electronics":      "bg-slate-100 text-slate-900",
  "Construction":     "bg-slate-100 text-slate-900",
  "Furniture":        "bg-slate-100 text-slate-900",
  "Export":           "bg-slate-100 text-slate-900",
};

function Badge({ value }: { value: string }) {
  const cls = STATUS_COLORS[value] ?? "bg-slate-100 text-slate-900";
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${cls}`}>
      {value}
    </span>
  );
}

function AvatarCell({ name }: { name: string }) {
  const initials = name.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase();
  return (
    <div className="flex items-center gap-2.5">
      <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary shrink-0">
        {initials}
      </div>
      <span className="font-medium text-slate-800 text-sm">{name}</span>
    </div>
  );
}

function CellRenderer({ col, value }: { col: Column; value: any }) {
  if (value === undefined || value === null || value === "") return <span className="text-slate-300">—</span>;
  switch (col.type) {
    case "badge":    return <Badge value={String(value)} />;
    case "avatar":   return <AvatarCell name={String(value)} />;
    case "currency": return <span className="font-mono text-sm font-medium">{Number(value).toLocaleString()}</span>;
    case "number":   return <span className="font-mono text-sm">{Number(value).toLocaleString()}</span>;
    case "date":     return <span className="text-sm text-slate-600">{value}</span>;
    default:         return <span className="text-sm text-slate-700">{value}</span>;
  }
}

export default function ModulePage({
  params,
}: {
  params: Promise<{ pillarSlug: string; moduleSlug: string }>;
}) {
  const { pillarSlug, moduleSlug } = use(params);

  const pillar = NEXYOVI_PILLARS.find(p => toSlug(p.name) === pillarSlug);
  if (!pillar) notFound();

  const pillarConfig  = getPillarConfig(pillarSlug);
  const moduleConfig  = getModuleConfig(moduleSlug);
  const [search, setSearch]       = useState("");
  const [aiInput, setAiInput]     = useState("");
  const [showAI, setShowAI]       = useState(true);
  const [aiMessages, setAiMessages] = useState([
    { role: "ai", text: `I'm your AI assistant for ${moduleConfig.title}. I can help you create records, analyse data, generate reports, or answer questions about this module.` }
  ]);
  const [loadingAI, setLoadingAI] = useState(false);
  const [rows, setRows]           = useState<any[]>(moduleConfig.rows);
  const [isLoadingData, setIsLoadingData] = useState(true);

  // CRUD State
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit" | "view">("create");
  const [activeRow, setActiveRow] = useState<any>(null);
  const [formData, setFormData] = useState<any>({});
  
  // Ultimate HR state
  const [showUltimateHR, setShowUltimateHR] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const getApiUrl = () => {
    if (pillarSlug === "ai-core") return `http://localhost:3002/api/ai-core/${moduleSlug}`;
    if (pillarSlug === "human-resources") return `http://localhost:3002/api/human-resources/${moduleSlug}`;
    return `http://localhost:3002/api/modules/${pillarSlug}/${moduleSlug}`;
  };

  const loadData = async () => {
    setIsLoadingData(true);
    try {
      const token = localStorage.getItem("token") || "";
      const res = await fetch(getApiUrl(), { headers: { "Authorization": `Bearer ${token}` } });
      const data = await res.json();
      if (data?.data && Array.isArray(data.data) && data.data.length > 0) {
        setRows(data.data);
      } else {
        setRows([]); // clear mock data if nothing found
      }
    } catch (err) {
      console.error(`Error fetching:`, err);
    } finally {
      setIsLoadingData(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [pillarSlug, moduleSlug]);

  const handleOpenModal = (mode: "create" | "edit" | "view", row: any = null) => {
    // Specialized route for Ultimate HR System
    if (pillarSlug === "human-resources" && moduleSlug === "employee-management" && mode === "create") {
      setShowUltimateHR(true);
      return;
    }

    setModalMode(mode);
    setActiveRow(row);
    
    if (mode === "create") {
      // Decode company name from JWT to use as prefix
      let companyAbbr = "CO";
      try {
        const token = localStorage.getItem("token") || "";
        if (token) {
          const payload = JSON.parse(atob(token.split(".")[1]));
          const companyName: string = payload.companyName || payload.company?.name || payload.name || "Company";
          // Get initials from company name (e.g. "Nexyovi Enterprise" → "NE")
          companyAbbr = companyName
            .split(/\s+/)
            .map((w: string) => w[0])
            .join("")
            .toUpperCase()
            .slice(0, 4);
        }
      } catch {}

      // Next sequential number = current row count + 1, zero-padded to 5 digits (starts at 00001)
      const nextNum = String(rows.length + 1).padStart(5, "0");

      const initialData: any = {};
      moduleConfig.columns.forEach(col => {
        const key = col.key.toLowerCase();
        const label = col.label.toLowerCase();
        const isIdField = ["id", "sku"].includes(key) || 
                          key.endsWith("no") || 
                          key.endsWith("code") || 
                          label.includes(" id") || 
                          label.includes(" no");
        
        if (isIdField) {
          // Use col-specific 3-letter tag after the company abbreviation
          const tag = key === "id" ? "" : `-${col.key.substring(0, 3).toUpperCase()}`;
          initialData[col.key] = `${companyAbbr}${tag}-${nextNum}`;
        }
      });
      setFormData(initialData);
    } else {
      setFormData(row || {});
    }
    
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const token = localStorage.getItem("token") || "";
      const url = modalMode === "edit" ? `${getApiUrl()}/${activeRow.id}` : getApiUrl();
      const method = modalMode === "edit" ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setModalOpen(false);
        loadData();
      } else {
        alert("Failed to save record.");
      }
    } catch (err) {
      console.error(err);
      alert("Error saving record.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this record?")) return;
    try {
      const token = localStorage.getItem("token") || "";
      const res = await fetch(`${getApiUrl()}/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        loadData();
      } else {
        alert("Failed to delete record.");
      }
    } catch (err) {
      console.error(err);
      alert("Error deleting record.");
    }
  };

  const handleExport = () => {
    if (rows.length === 0) return alert("No data to export.");
    const headers = moduleConfig.columns.map(c => c.label).join(",");
    const csvRows = rows.map(row => 
      moduleConfig.columns.map(c => {
        let val = row[c.key] || "";
        if (typeof val === 'string') val = val.replace(/"/g, '""');
        return `"${val}"`;
      }).join(",")
    );
    const csvContent = [headers, ...csvRows].join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `${moduleSlug}_export.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredRows = rows.filter(row =>
    Object.values(row).some(v => String(v).toLowerCase().includes(search.toLowerCase()))
  );

  const sendAI = async (text?: string) => {
    const msg = text ?? aiInput;
    if (!msg.trim()) return;
    
    // Add user message to UI immediately
    setAiMessages(prev => [...prev, { role: "user", text: msg }]);
    setAiInput("");
    setLoadingAI(true);
    
    try {
      const token = localStorage.getItem("token") || "";
      const res = await fetch(`http://localhost:3002/api/ai-core/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          moduleSlug,
          message: msg,
          history: aiMessages
        })
      });
      
      const data = await res.json();
      setAiMessages(prev => [...prev, data]);
    } catch (error) {
      console.error("AI Error:", error);
      setAiMessages(prev => [...prev, {
        role: "ai",
        text: "Sorry, I am having trouble connecting to the AI brain right now."
      }]);
    } finally {
      setLoadingAI(false);
    }
  };

  if (showUltimateHR) {
    return (
      <div className="max-w-7xl mx-auto pb-20">
        <UltimateEmployeeManager onBack={() => { setShowUltimateHR(false); loadData(); }} />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto pb-20">

      {/* ── BREADCRUMB ───────────────────────────────────── */}
      <div className="flex items-center gap-2 text-sm text-slate-500 mb-6">
        <Link href="/dashboard" className="hover:text-slate-800 transition-colors">Dashboard</Link>
        <span>/</span>
        <Link href={`/dashboard/${pillarSlug}`} className="hover:text-slate-800 transition-colors flex items-center gap-1">
          <span>{pillar.emoji}</span> {pillar.name}
        </Link>
        <span>/</span>
        <span className="text-slate-900 font-semibold">{moduleConfig.title}</span>
      </div>

      <div className={`flex gap-6 transition-all`}>

        {/* ── MAIN CONTENT ─────────────────────────────── */}
        <div className="flex-1 min-w-0 space-y-5">

          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{moduleConfig.title}</h1>
              <p className="text-slate-500 text-sm font-light mt-0.5">
                {pillar.emoji} {pillar.name} · {filteredRows.length} records
              </p>
            </div>
            <div className="flex gap-2 items-center">
              <button
                onClick={() => setShowAI(!showAI)}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-medium transition-all ${
                  showAI ? "bg-slate-900 text-white border-slate-900" : "border-slate-200 text-slate-600 hover:border-slate-300"
                }`}
              >
                <BrainCircuit size={13} /> AI
              </button>
              <button onClick={handleExport} className="flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-50">
                <Download size={13} /> Export
              </button>
              <button onClick={() => handleOpenModal("create")} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary hover:bg-primary/90 text-black text-xs font-bold transition-all">
                <Plus size={13} /> New Record
              </button>
            </div>
          </div>

          {/* Search & Filter bar */}
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder={`Search ${moduleConfig.title.toLowerCase()}...`}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent placeholder:text-slate-400"
              />
            </div>
            <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-600 hover:bg-slate-50 transition-colors">
              <Filter size={14} /> Filter
            </button>
          </div>

          {/* Data Table */}
          <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50">
                    {moduleConfig.columns.map((col, i) => (
                      <th key={i} className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap">
                        {col.label}
                      </th>
                    ))}
                    <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-widest">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoadingData ? (
                    <tr>
                      <td colSpan={moduleConfig.columns.length + 1} className="text-center py-16 text-slate-500 text-sm">
                        <div className="flex flex-col items-center gap-3">
                          <span className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></span>
                          Loading records from secure database...
                        </div>
                      </td>
                    </tr>
                  ) : filteredRows.length === 0 ? (
                    <tr>
                      <td colSpan={moduleConfig.columns.length + 1} className="text-center py-16 text-slate-400 text-sm font-light">
                        No records found in database
                      </td>
                    </tr>
                  ) : (
                    filteredRows.map((row, rowIdx) => (
                      <motion.tr
                        key={rowIdx}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: rowIdx * 0.04 }}
                        className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors"
                      >
                        {moduleConfig.columns.map((col, colIdx) => (
                          <td key={colIdx} className="px-4 py-3.5 whitespace-nowrap">
                            <CellRenderer col={col} value={row[col.key]} />
                          </td>
                        ))}
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-1">
                            <button onClick={() => handleOpenModal("view", row)} className="w-7 h-7 rounded-lg hover:bg-blue-50 flex items-center justify-center text-slate-400 hover:text-blue-600 transition-colors" title="View">
                              <Eye size={13} />
                            </button>
                            <button onClick={() => handleOpenModal("edit", row)} className="w-7 h-7 rounded-lg hover:bg-amber-50 flex items-center justify-center text-slate-400 hover:text-amber-600 transition-colors" title="Edit">
                              <Pencil size={13} />
                            </button>
                            <button onClick={() => handleDelete(row.id)} className="w-7 h-7 rounded-lg hover:bg-red-50 flex items-center justify-center text-slate-400 hover:text-red-500 transition-colors" title="Delete">
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Table Footer */}
            <div className="px-4 py-3 border-t border-slate-50 bg-slate-50/50 flex items-center justify-between text-xs text-slate-500">
              <span>Showing {filteredRows.length} of {rows.length} records</span>
              <div className="flex gap-2">
                <button className="px-3 py-1 rounded-lg border border-slate-200 hover:bg-white transition-colors">Previous</button>
                <button className="px-3 py-1 rounded-lg bg-slate-900 text-white">1</button>
                <button className="px-3 py-1 rounded-lg border border-slate-200 hover:bg-white transition-colors">Next</button>
              </div>
            </div>
          </div>
        </div>

        {/* ── AI PANEL ──────────────────────────────────── */}
        {showAI && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="w-72 shrink-0 hidden xl:flex flex-col"
          >
            <div className="bg-slate-900 rounded-2xl p-5 shadow-xl flex flex-col h-full min-h-[500px]">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-7 h-7 rounded-lg bg-primary/20 flex items-center justify-center shrink-0">
                  <BrainCircuit size={13} className="text-primary" />
                </div>
                <span className="text-white font-semibold text-xs">SASA AI Assistant</span>
              </div>

              <div className="flex-1 space-y-3 overflow-y-auto mb-4">
                {aiMessages.map((m, i) => (
                  <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[90%] px-3 py-2 rounded-xl text-xs ${
                      m.role === "user"
                        ? "bg-primary text-black font-medium rounded-br-sm"
                        : "bg-white/10 text-slate-300 font-light rounded-bl-sm"
                    }`}>{m.text}</div>
                  </div>
                ))}
                {loadingAI && (
                  <div className="flex gap-1 px-3 py-2">
                    {[0, 150, 300].map(d => (
                      <span key={d} className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: `${d}ms` }} />
                    ))}
                  </div>
                )}
              </div>

              {/* Quick suggestions */}
              <div className="flex flex-wrap gap-1.5 mb-3">
                {[`Add new record`, `Export to Excel`, `Generate report`].map((s, i) => (
                  <button
                    key={i}
                    onClick={() => sendAI(s)}
                    className="px-2 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-slate-400 hover:text-white text-[10px] transition-all"
                  >
                    {s}
                  </button>
                ))}
              </div>

              <div className="flex gap-2">
                <input
                  value={aiInput}
                  onChange={e => setAiInput(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && sendAI()}
                  placeholder="Ask anything..."
                  className="flex-1 bg-white/10 border border-white/10 rounded-xl px-3 py-2 text-white placeholder:text-slate-500 text-xs focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
                <button
                  onClick={() => sendAI()}
                  className="w-9 h-9 rounded-xl bg-primary hover:bg-primary/90 flex items-center justify-center transition-colors shrink-0"
                >
                  <Send size={12} className="text-black" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* CRUD Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center p-4 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-900 capitalize">
                {modalMode} Record
              </h2>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X size={18} />
              </button>
            </div>
            <div className="p-4 overflow-y-auto flex-1 space-y-4">
              {moduleConfig.columns.map((col, i) => {
                const isIdField = ["id", "sku"].includes(col.key.toLowerCase()) || 
                                  col.key.toLowerCase().endsWith("no") || 
                                  col.key.toLowerCase().endsWith("code") || 
                                  col.label.toLowerCase().includes(" id") || 
                                  col.label.toLowerCase().includes(" no");
                return (
                  <div key={i} className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-slate-700">{col.label}</label>
                    <input
                      type={col.type === "number" || col.type === "currency" ? "number" : col.type === "date" ? "date" : "text"}
                      value={formData[col.key] || ""}
                      onChange={e => setFormData({ ...formData, [col.key]: col.type === "number" || col.type === "currency" ? parseFloat(e.target.value) || 0 : e.target.value })}
                      disabled={modalMode === "view" || isIdField}
                      placeholder={isIdField ? "Auto-generated by system" : ""}
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-slate-900 bg-white text-slate-900 disabled:bg-slate-50 disabled:text-slate-500"
                    />
                  </div>
                );
              })}
            </div>
            {modalMode !== "view" && (
              <div className="p-4 border-t border-slate-100 flex justify-end gap-2 bg-slate-50">
                <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
                  Cancel
                </button>
                <button onClick={handleSave} disabled={isSaving} className="px-4 py-2 rounded-xl bg-primary hover:bg-primary/90 text-black text-sm font-bold transition-all disabled:opacity-50">
                  {isSaving ? "Saving..." : "Save Record"}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

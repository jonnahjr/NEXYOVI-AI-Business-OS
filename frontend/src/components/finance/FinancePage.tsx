"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Search, Plus, Download, Pencil, Trash2, Eye, X, DollarSign,
  TrendingUp, ArrowUpRight, ArrowDownRight,
  CreditCard, Landmark, BarChart3, PieChart,
  FileText, Activity, BookOpen, ShieldAlert, Globe,
  Calculator
} from "lucide-react";
import { getModuleConfig, Column } from "@/lib/module-config";
import { useToast } from "@/components/ui/Toast";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer
} from "recharts";

const STATUS_COLORS: Record<string, string> = {
  "Posted": "bg-emerald-50 text-emerald-700",
  "Draft": "bg-slate-100 text-slate-900",
  "Pending": "bg-amber-50 text-amber-700",
  "Overdue": "bg-red-50 text-red-700",
  "Paid": "bg-emerald-50 text-emerald-700",
  "Cleared": "bg-emerald-50 text-emerald-700",
  "Reconciled": "bg-blue-50 text-blue-700",
  "Outstanding": "bg-amber-50 text-amber-700",
  "Filed": "bg-emerald-50 text-emerald-700",
  "Current": "bg-blue-50 text-blue-700",
  "Active": "bg-emerald-50 text-emerald-700",
  "Profitable": "bg-emerald-50 text-emerald-700",
  "Loss": "bg-red-50 text-red-700",
  "Under Budget": "bg-emerald-50 text-emerald-700",
  "Over Budget": "bg-red-50 text-red-700",
  "On Track": "bg-blue-50 text-blue-700",
  "Planned": "bg-slate-100 text-slate-900",
  "Actual": "bg-emerald-50 text-emerald-700",
  "Up": "bg-emerald-50 text-emerald-700",
  "Down": "bg-red-50 text-red-700",
  "Stable": "bg-slate-100 text-slate-900",
  "Positive": "bg-emerald-50 text-emerald-700",
  "Negative": "bg-red-50 text-red-700",
  "Approved": "bg-emerald-50 text-emerald-700",
  "Rejected": "bg-red-50 text-red-700",
  "Reimbursed": "bg-blue-50 text-blue-700",
  "Cancelled": "bg-slate-100 text-slate-900",
  "Sent": "bg-blue-50 text-blue-700",
  "1-30 Days": "bg-amber-50 text-amber-700",
  "31-60 Days": "bg-orange-50 text-orange-700",
  "61-90 Days": "bg-red-50 text-red-700",
  "90+ Days": "bg-red-100 text-red-800",
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

function CellRenderer({ col, value, row }: { col: Column; value: any; row?: any }) {
  if (value === undefined || value === null || value === "") return <span className="text-slate-300">—</span>;
  const displayValue = typeof value === 'object' && value !== null
    ? value.name || value.label || JSON.stringify(value)
    : String(value);

  switch (col.type) {
    case "badge":    return <Badge value={displayValue} />;
    case "select":   return <Badge value={displayValue} />;
    case "avatar":   return <AvatarCell name={displayValue} />;
    case "currency": return <span className="font-mono text-sm font-medium">{Number(value).toLocaleString()}</span>;
    case "number":   return <span className="font-mono text-sm">{Number(value).toLocaleString()}</span>;
    case "date":     return <span className="text-sm text-slate-600">{value}</span>;
    default:         return <span className="text-sm text-slate-700">{value}</span>;
  }
}

// ── MODULE META ───────────────────────────────────────────────
const MODULE_META: Record<string, { icon: any; color: string; desc: string }> = {
  "general-ledger":        { icon: BookOpen,     color: "bg-slate-50 text-slate-600", desc: "Double-entry journal entries from invoices, expenses, and budgets" },
  "accounts-payable":      { icon: CreditCard,   color: "bg-amber-50 text-amber-600", desc: "Track unpaid vendor bills and payment due dates" },
  "accounts-receivable":   { icon: DollarSign,   color: "bg-emerald-50 text-emerald-600", desc: "Monitor customer payments and aging receivables" },
  "budgeting":             { icon: Calculator,   color: "bg-blue-50 text-blue-600", desc: "Create and track departmental budgets vs actual spend" },
  "expenses":              { icon: FileText,     color: "bg-red-50 text-red-600", desc: "Record and approve business expenses" },
  "banking":               { icon: Landmark,     color: "bg-indigo-50 text-indigo-600", desc: "Bank transactions with running balance" },
  "cash-flow":             { icon: TrendingUp,   color: "bg-emerald-50 text-emerald-600", desc: "Monthly cash inflows, outflows, and net position" },
  "tax-vat":               { icon: ShieldAlert,  color: "bg-purple-50 text-purple-600", desc: "Output VAT (sales) and Input VAT (purchases) tracking" },
  "fixed-assets":          { icon: Activity,     color: "bg-cyan-50 text-cyan-600", desc: "Track fixed asset purchases, depreciation, and current value" },
  "financial-statements":  { icon: PieChart,     color: "bg-slate-50 text-slate-600", desc: "Income statement and balance sheet summary" },
  "multi-currency":        { icon: Globe,        color: "bg-teal-50 text-teal-600", desc: "Live exchange rates for ETB against major currencies" },
  "audit-trail":           { icon: Activity,     color: "bg-rose-50 text-rose-600", desc: "Complete audit log of all financial transactions" },
  "financial-analytics":   { icon: BarChart3,    color: "bg-slate-50 text-slate-600", desc: "Key financial KPIs with targets and best practices" },
};

interface FinancePageProps {
  pillarSlug: string;
  moduleSlug: string;
}

export default function FinancePage({ pillarSlug, moduleSlug }: FinancePageProps) {
  const moduleConfig = getModuleConfig(moduleSlug);
  const meta = MODULE_META[moduleSlug] || { icon: DollarSign, color: "bg-slate-50 text-slate-600", desc: "" };
  const { toast } = useToast();

  const isReadOnly = ["banking", "cash-flow", "financial-statements", "multi-currency", "audit-trail", "financial-analytics"].includes(moduleSlug);
  const isPayable = ["accounts-payable", "accounts-receivable"].includes(moduleSlug);

  const [search, setSearch] = useState("");
  const [rows, setRows] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [payingId, setPayingId] = useState<string | null>(null);
  const [payConfirm, setPayConfirm] = useState<{ id: string; vendor: string; amount: number } | null>(null);

  // CRUD
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit" | "view">("create");
  const [activeRow, setActiveRow] = useState<any>(null);
  const [formData, setFormData] = useState<any>({});
  const [isSaving, setIsSaving] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // Computed stats
  const [computedStats, setComputedStats] = useState<any>(null);

  const getApiUrl = useCallback(() => {
    return `http://localhost:3002/api/v1/modules/${pillarSlug}/${moduleSlug}`;
  }, [pillarSlug, moduleSlug]);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token") || "";
      const res = await fetch(getApiUrl(), { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (data?.data && Array.isArray(data.data)) {
        setRows(data.data);
        computeStats(data.data);
      } else {
        setRows([]);
        setComputedStats(null);
      }
    } catch (err) {
      console.error("Error loading data:", err);
    } finally {
      setIsLoading(false);
    }
  }, [pillarSlug, moduleSlug]);

  const computeStats = (data: any[]) => {
    if (!data || data.length === 0) {
      setComputedStats(null);
      return;
    }
    switch (moduleSlug) {
      case "accounts-payable": {
        const totalPayable = data.reduce((s: number, r: any) => s + (r.balance || 0), 0);
        const overdue = data.filter((r: any) => r.status === "Overdue");
        const pending = data.filter((r: any) => r.status === "Pending");
        setComputedStats({ totalPayable, overdueCount: overdue.length, overdueAmount: overdue.reduce((s: number, r: any) => s + (r.balance || 0), 0), pendingCount: pending.length, pendingAmount: pending.reduce((s: number, r: any) => s + (r.balance || 0), 0) });
        break;
      }
      case "accounts-receivable": {
        const totalReceivable = data.reduce((s: number, r: any) => s + (r.balance || 0), 0);
        const overdue = data.filter((r: any) => r.status === "Overdue");
        const outstanding = data.filter((r: any) => r.status === "Outstanding");
        // Aging buckets
        const agingLabels = ["Current", "1-30 Days", "31-60 Days", "61-90 Days", "90+ Days"] as const;
        type AgingLabel = typeof agingLabels[number];
        const buckets: Record<AgingLabel, { count: number; total: number }> = { "Current": { count: 0, total: 0 }, "1-30 Days": { count: 0, total: 0 }, "31-60 Days": { count: 0, total: 0 }, "61-90 Days": { count: 0, total: 0 }, "90+ Days": { count: 0, total: 0 } };
        data.forEach((r: any) => {
          const age: AgingLabel = r.aging || "Current";
          if (buckets[age]) { buckets[age].count++; buckets[age].total += r.balance || 0; }
        });
        setComputedStats({ totalReceivable, overdueCount: overdue.length, overdueAmount: overdue.reduce((s: number, r: any) => s + (r.balance || 0), 0), outstandingCount: outstanding.length, buckets });
        break;
      }
      case "banking": {
        const totalDeposits = data.filter((r: any) => r.type === "Deposit").reduce((s: number, r: any) => s + (r.debit || 0), 0);
        const totalWithdrawals = data.filter((r: any) => r.type === "Withdrawal").reduce((s: number, r: any) => s + (r.credit || 0), 0);
        setComputedStats({ totalDeposits, totalWithdrawals, balance: data[0]?.balance || 0 });
        break;
      }
      case "cash-flow": {
        const totalInflow = data.reduce((s: number, r: any) => s + (r.inflow || 0), 0);
        const totalOutflow = data.reduce((s: number, r: any) => s + (r.outflow || 0), 0);
        setComputedStats({ totalInflow, totalOutflow, netPosition: totalInflow - totalOutflow });
        break;
      }
      case "budgeting": {
        const totalBudget = data.reduce((s: number, r: any) => s + (r.amount || 0), 0);
        const totalSpent = data.reduce((s: number, r: any) => s + (r.spent || 0), 0);
        setComputedStats({ totalBudget, totalSpent, variance: totalBudget - totalSpent, utilPct: totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0 });
        break;
      }
      case "fixed-assets": {
        const totalPurchaseValue = data.reduce((s: number, r: any) => s + (r.purchaseValue || r.value || 0), 0);
        const totalCurrentValue = data.reduce((s: number, r: any) => s + (r.currentValue || r.value || 0), 0);
        const totalDepreciation = totalPurchaseValue - totalCurrentValue;
        setComputedStats({ totalPurchaseValue, totalCurrentValue, totalDepreciation, count: data.length });
        break;
      }
      default:
        setComputedStats(null);
    }
  };

  useEffect(() => { loadData(); }, [loadData]);

  const deepSearch = (obj: any, term: string): boolean => {
    const lower = term.toLowerCase();
    if (obj === null || obj === undefined) return false;
    if (typeof obj === 'string') return obj.toLowerCase().includes(lower);
    if (typeof obj === 'number' || typeof obj === 'boolean') return String(obj).toLowerCase().includes(lower);
    if (Array.isArray(obj)) return obj.some(item => deepSearch(item, term));
    if (typeof obj === 'object') return Object.values(obj).some(v => deepSearch(v, term));
    return false;
  };

  const filteredRows = rows.filter(row => deepSearch(row, search));

  const handleOpenModal = (mode: "create" | "edit" | "view", row: any = null) => {
    setModalMode(mode);
    setActiveRow(row);
    if (mode === "create") {
      const initialData: any = {};
      moduleConfig.columns.forEach(col => {
        initialData[col.key] = col.type === "number" || col.type === "currency" ? 0 : "";
      });
      // Auto-generate reference numbers
      if (moduleSlug === "general-ledger") initialData.ref = `JV-${String(rows.length + 1).padStart(3, "0")}`;
      if (moduleSlug === "expenses") initialData.status = "Pending";
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
      const { id, createdAt, updatedAt, ...cleanData } = formData;
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(cleanData),
      });
      if (res.ok) {
        setModalOpen(false);
        loadData();
        toast("Record saved successfully", "success");
      } else {
        const err = await res.json().catch(() => ({}));
        toast(err?.message || "Failed to save", "error");
      }
    } catch {
      toast("Error saving record", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    setConfirmDeleteId(id);
  };

  const confirmDelete = async () => {
    if (!confirmDeleteId) return;
    try {
      const token = localStorage.getItem("token") || "";
      const res = await fetch(`${getApiUrl()}/${confirmDeleteId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        loadData();
        toast("Record deleted", "success");
      } else {
        toast("Failed to delete", "error");
      }
    } catch {
      toast("Error deleting record", "error");
    } finally {
      setConfirmDeleteId(null);
    }
  };

  const handleMarkPaid = async (id: string) => {
    setPayingId(id);
    try {
      const token = localStorage.getItem("token") || "";
      const res = await fetch(`http://localhost:3002/api/v1/modules/finance-accounting/${moduleSlug}/${id}/pay`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        loadData();
        setPayConfirm(null);
        toast("Invoice marked as paid", "success");
      } else {
        const err = await res.json().catch(() => ({}));
        toast(err?.message || "Failed to mark as paid", "error");
      }
    } catch {
      toast("Error processing payment", "error");
    } finally {
      setPayingId(null);
    }
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const token = localStorage.getItem("token") || "";
      const res = await fetch(`${getApiUrl()}/generate-demo`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        toast(`Generated ${data?.data?.created || 0} demo records`, "success");
        loadData();
      } else {
        toast("Failed to generate demo data", "error");
      }
    } catch {
      toast("Error generating demo data", "error");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleExport = () => {
    if (rows.length === 0) return toast("No data to export", "info");
    const headers = moduleConfig.columns.map(c => c.label).join(",");
    const csvRows = rows.map(row =>
      moduleConfig.columns.map(c => {
        let val = row[c.key] || "";
        if (typeof val === 'string') val = val.replace(/"/g, '""');
        return `"${val}"`;
      }).join(",")
    );
    const csv = [headers, ...csvRows].join("\n");
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${moduleSlug}_export.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  const MetaIcon = meta.icon;

  return (
    <div className="max-w-7xl mx-auto pb-20 space-y-6">
      {/* ── HEADER ──────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className={`w-9 h-9 rounded-xl ${meta.color} flex items-center justify-center`}>
              <MetaIcon size={18} />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{moduleConfig.title}</h1>
          </div>
          <p className="text-sm text-slate-400 ml-1">{meta.desc}</p>
        </div>
        <div className="flex gap-2">
          <button onClick={handleExport} className="flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-50 transition-all">
            <Download size={13} className="text-black" /> Export
          </button>
          {isReadOnly ? (
            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-all disabled:opacity-50"
            >
              {isGenerating ? (
                <><span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" /> Generating...</>
              ) : (
                <><Plus size={13} /> Generate</>
              )}
            </button>
          ) : (
            <button
              onClick={() => handleOpenModal("create")}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary hover:bg-primary/90 text-black text-xs font-bold transition-all"
            >
              <Plus size={13} /> New Record
            </button>
          )}
        </div>
      </div>

      {/* ── STATS CARDS ─────────────────────────── */}
      {moduleSlug === "accounts-payable" && computedStats && (
        <>
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-white border border-slate-100 rounded-xl p-4 shadow-sm">
              <div className="text-xs text-slate-400 font-medium mb-1">Total Payable</div>
              <div className="text-xl font-bold text-amber-600">ETB {computedStats.totalPayable.toLocaleString()}</div>
            </div>
            <div className="bg-white border border-slate-100 rounded-xl p-4 shadow-sm">
              <div className="text-xs text-slate-400 font-medium mb-1">Pending</div>
              <div className="text-xl font-bold text-blue-600">ETB {computedStats.pendingAmount?.toLocaleString() || '0'}</div>
              <div className="text-[10px] text-slate-400">{computedStats.pendingCount || 0} invoice(s)</div>
            </div>
            <div className="bg-white border border-slate-100 rounded-xl p-4 shadow-sm">
              <div className="text-xs text-slate-400 font-medium mb-1">Overdue</div>
              <div className="text-xl font-bold text-red-500">ETB {computedStats.overdueAmount.toLocaleString()}</div>
              <div className="text-[10px] text-slate-400">{computedStats.overdueCount} invoice(s)</div>
            </div>
            <div className="bg-white border border-slate-100 rounded-xl p-4 shadow-sm">
              <div className="text-xs text-slate-400 font-medium mb-1">Open Bills</div>
              <div className="text-xl font-bold text-slate-900">{rows.length}</div>
            </div>
          </div>
          {/* Vendor Breakdown */}
          {rows.length > 0 && (
            <div className="bg-white border border-slate-100 rounded-xl p-5 shadow-sm">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Payables by Vendor</h3>
              <div className="space-y-2.5">
                {Object.entries(
                  rows.reduce((acc: any, r: any) => {
                    const key = r.vendor || 'Unknown';
                    if (!acc[key]) acc[key] = { total: 0, count: 0 };
                    acc[key].total += r.balance || 0;
                    acc[key].count++;
                    return acc;
                  }, {})
                ).sort(([, a]: any, [, b]: any) => b.total - a.total).slice(0, 5).map(([vendor, data]: any, i: number) => {
                  const pct = computedStats.totalPayable > 0 ? (data.total / computedStats.totalPayable) * 100 : 0;
                  return (
                    <div key={vendor} className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-full bg-amber-50 flex items-center justify-center text-[10px] font-bold text-amber-700 shrink-0">
                        {vendor.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm font-medium text-slate-800 truncate">{vendor}</span>
                          <span className="text-sm font-bold text-slate-900">ETB {data.total.toLocaleString()}</span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full rounded-full bg-amber-500/60 transition-all" style={{ width: `${Math.min(100, pct)}%` }} />
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5">{data.count} invoice(s) · {pct.toFixed(1)}% of total</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}

      {moduleSlug === "accounts-receivable" && computedStats && (
        <>
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-white border border-slate-100 rounded-xl p-4 shadow-sm">
              <div className="text-xs text-slate-400 font-medium mb-1">Total Receivable</div>
              <div className="text-xl font-bold text-emerald-600">ETB {computedStats.totalReceivable.toLocaleString()}</div>
            </div>
            <div className="bg-white border border-slate-100 rounded-xl p-4 shadow-sm">
              <div className="text-xs text-slate-400 font-medium mb-1">Outstanding</div>
              <div className="text-xl font-bold text-blue-600">ETB {(computedStats.totalReceivable - computedStats.overdueAmount).toLocaleString()}</div>
              <div className="text-[10px] text-slate-400">{computedStats.outstandingCount || 0} invoice(s)</div>
            </div>
            <div className="bg-white border border-slate-100 rounded-xl p-4 shadow-sm">
              <div className="text-xs text-slate-400 font-medium mb-1">Overdue</div>
              <div className="text-xl font-bold text-red-500">ETB {computedStats.overdueAmount.toLocaleString()}</div>
              <div className="text-[10px] text-slate-400">{computedStats.overdueCount} invoice(s)</div>
            </div>
            <div className="bg-white border border-slate-100 rounded-xl p-4 shadow-sm">
              <div className="text-xs text-slate-400 font-medium mb-1">Open Items</div>
              <div className="text-xl font-bold text-slate-900">{rows.length}</div>
            </div>
          </div>
          {/* Aging Distribution */}
          {computedStats.buckets && (
            <div className="bg-white border border-slate-100 rounded-xl p-5 shadow-sm">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Aging Distribution</h3>
              <div className="space-y-3">
                {Object.entries(computedStats.buckets).map(([label, data]: any) => {
                  const pct = computedStats.totalReceivable > 0 ? (data.total / computedStats.totalReceivable) * 100 : 0;
                  const colors: Record<string, string> = {
                    "Current": "bg-emerald-400",
                    "1-30 Days": "bg-amber-400",
                    "31-60 Days": "bg-orange-400",
                    "61-90 Days": "bg-red-400",
                    "90+ Days": "bg-red-600",
                  };
                  return (
                    <div key={label}>
                      <div className="flex justify-between items-center mb-1.5">
                        <div className="flex items-center gap-2">
                          <div className={`w-2.5 h-2.5 rounded-full ${colors[label] || 'bg-slate-300'}`} />
                          <span className="text-sm font-medium text-slate-700">{label}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-sm font-bold text-slate-900">ETB {data.total.toLocaleString()}</span>
                          <span className="text-[11px] text-slate-400 ml-2">{data.count} items</span>
                        </div>
                      </div>
                      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-700 ${colors[label] || 'bg-slate-300'}`} 
                          style={{ width: `${Math.max(0.5, pct)}%` }} 
                        />
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">{pct.toFixed(1)}% of total receivables</div>
                    </div>
                  );
                })}
              </div>
              {/* Summary bar */}
              <div className="mt-4 pt-3 border-t border-slate-100">
                <div className="flex items-center gap-1 h-3 w-full rounded-full overflow-hidden">
                  {Object.entries(computedStats.buckets).map(([label, data]: any) => {
                    const pct = computedStats.totalReceivable > 0 ? (data.total / computedStats.totalReceivable) * 100 : 0;
                    if (pct < 0.5) return null;
                    const barColors: Record<string, string> = {
                      "Current": "bg-emerald-400",
                      "1-30 Days": "bg-amber-400",
                      "31-60 Days": "bg-orange-400",
                      "61-90 Days": "bg-red-400",
                      "90+ Days": "bg-red-600",
                    };
                    return <div key={label} className={`h-full ${barColors[label] || 'bg-slate-300'}`} style={{ width: `${pct}%` }} title={`${label}: ETB ${data.total.toLocaleString()}`} />;
                  })}
                </div>
                <div className="flex flex-wrap gap-3 mt-2">
                  {Object.entries(computedStats.buckets).map(([label, data]: any) => {
                    const dotColors: Record<string, string> = {
                      "Current": "bg-emerald-400",
                      "1-30 Days": "bg-amber-400",
                      "31-60 Days": "bg-orange-400",
                      "61-90 Days": "bg-red-400",
                      "90+ Days": "bg-red-600",
                    };
                    return (
                      <div key={label} className="flex items-center gap-1.5 text-[10px] text-slate-500">
                        <div className={`w-2 h-2 rounded-full ${dotColors[label] || 'bg-slate-300'}`} />
                        <span>{label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
          {/* Customer Breakdown */}
          {rows.length > 0 && (
            <div className="bg-white border border-slate-100 rounded-xl p-5 shadow-sm">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Receivables by Customer</h3>
              <div className="space-y-2.5">
                {Object.entries(
                  rows.reduce((acc: any, r: any) => {
                    const key = r.customer || 'Unknown';
                    if (!acc[key]) acc[key] = { total: 0, count: 0, aging: 'Current' };
                    acc[key].total += r.balance || 0;
                    acc[key].count++;
                    if (r.status === 'Overdue') acc[key].aging = 'Overdue';
                    return acc;
                  }, {})
                ).sort(([, a]: any, [, b]: any) => b.total - a.total).slice(0, 5).map(([customer, data]: any, i: number) => {
                  const pct = computedStats.totalReceivable > 0 ? (data.total / computedStats.totalReceivable) * 100 : 0;
                  return (
                    <div key={customer} className="flex items-center gap-3">
                      <div className={`w-7 h-7 rounded-full ${data.aging === 'Overdue' ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'} flex items-center justify-center text-[10px] font-bold shrink-0`}>
                        {customer.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm font-medium text-slate-800 truncate">{customer}</span>
                          <span className="text-sm font-bold text-slate-900">ETB {data.total.toLocaleString()}</span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full transition-all ${data.aging === 'Overdue' ? 'bg-red-400/60' : 'bg-emerald-400/60'}`} style={{ width: `${Math.min(100, pct)}%` }} />
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5">{data.count} invoice(s) · {data.aging}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}

      {moduleSlug === "banking" && rows.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white border border-slate-100 rounded-xl p-4 shadow-sm">
            <div className="text-xs text-slate-400 font-medium mb-1">Current Balance</div>
            <div className="text-xl font-bold text-slate-900">ETB {(rows[0]?.balance || 0).toLocaleString()}</div>
          </div>
          <div className="bg-white border border-slate-100 rounded-xl p-4 shadow-sm">
            <div className="text-xs text-slate-400 font-medium mb-1">Total Deposits</div>
            <div className="text-xl font-bold text-emerald-600">ETB {(rows.filter((r: any) => r.type === 'Deposit').reduce((s: number, r: any) => s + (r.debit || 0), 0)).toLocaleString()}</div>
          </div>
          <div className="bg-white border border-slate-100 rounded-xl p-4 shadow-sm">
            <div className="text-xs text-slate-400 font-medium mb-1">Total Withdrawals</div>
            <div className="text-xl font-bold text-red-500">ETB {(rows.filter((r: any) => r.type === 'Withdrawal').reduce((s: number, r: any) => s + (r.credit || 0), 0)).toLocaleString()}</div>
          </div>
        </div>
      )}

      {moduleSlug === "cash-flow" && rows.length > 0 && (
        <>
          <div className="grid grid-cols-3 gap-4">
            {(() => {
              const totalIn = rows.reduce((s: number, r: any) => s + (r.inflow || 0), 0);
              const totalOut = rows.reduce((s: number, r: any) => s + (r.outflow || 0), 0);
              return (
                <>
                  <div className="bg-white border border-slate-100 rounded-xl p-4 shadow-sm">
                    <div className="text-xs text-slate-400 font-medium mb-1">Total Inflow</div>
                    <div className="text-xl font-bold text-emerald-600">ETB {totalIn.toLocaleString()}</div>
                  </div>
                  <div className="bg-white border border-slate-100 rounded-xl p-4 shadow-sm">
                    <div className="text-xs text-slate-400 font-medium mb-1">Total Outflow</div>
                    <div className="text-xl font-bold text-red-500">ETB {totalOut.toLocaleString()}</div>
                  </div>
                  <div className="bg-white border border-slate-100 rounded-xl p-4 shadow-sm">
                    <div className="text-xs text-slate-400 font-medium mb-1">Net Position</div>
                    <div className={`text-xl font-bold ${totalIn - totalOut >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                      ETB {(totalIn - totalOut).toLocaleString()}
                    </div>
                  </div>
                </>
              );
            })()}
          </div>
          {/* Cash Flow Chart */}
          <div className="bg-white border border-slate-100 rounded-xl p-5 shadow-sm">
            <h3 className="text-sm font-bold text-slate-800 mb-4">Cash Flow Trend</h3>
            <div className="w-full h-60">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={rows.slice().reverse()} margin={{ top: 8, right: 8, left: -10, bottom: 0 }}>
                  <XAxis dataKey="period" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '12px' }} formatter={(value: number) => [`ETB ${value.toLocaleString()}`, '']} />
                  <Bar dataKey="inflow" fill="#059669" radius={[4, 4, 0, 0]} barSize={20} />
                  <Bar dataKey="outflow" fill="#dc2626" radius={[4, 4, 0, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}

      {moduleSlug === "budgeting" && computedStats && (
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-white border border-slate-100 rounded-xl p-4 shadow-sm">
            <div className="text-xs text-slate-400 font-medium mb-1">Total Budget</div>
            <div className="text-xl font-bold text-slate-900">ETB {computedStats.totalBudget.toLocaleString()}</div>
          </div>
          <div className="bg-white border border-slate-100 rounded-xl p-4 shadow-sm">
            <div className="text-xs text-slate-400 font-medium mb-1">Total Spent</div>
            <div className="text-xl font-bold text-blue-600">ETB {computedStats.totalSpent.toLocaleString()}</div>
          </div>
          <div className="bg-white border border-slate-100 rounded-xl p-4 shadow-sm">
            <div className="text-xs text-slate-400 font-medium mb-1">Variance</div>
            <div className={`text-xl font-bold ${computedStats.variance >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
              ETB {computedStats.variance.toLocaleString()}
            </div>
          </div>
          <div className="bg-white border border-slate-100 rounded-xl p-4 shadow-sm">
            <div className="text-xs text-slate-400 font-medium mb-1">Utilization</div>
            <div className="text-xl font-bold text-slate-900">{computedStats.utilPct}%</div>
            <div className="w-full h-1.5 bg-slate-100 rounded-full mt-1 overflow-hidden">
              <div className="h-full bg-blue-500 rounded-full transition-all" style={{ width: `${Math.min(100, computedStats.utilPct)}%` }} />
            </div>
          </div>
        </div>
      )}

      {moduleSlug === "fixed-assets" && computedStats && (
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-white border border-slate-100 rounded-xl p-4 shadow-sm">
            <div className="text-xs text-slate-400 font-medium mb-1">Total Assets</div>
            <div className="text-xl font-bold text-slate-900">{computedStats.count}</div>
          </div>
          <div className="bg-white border border-slate-100 rounded-xl p-4 shadow-sm">
            <div className="text-xs text-slate-400 font-medium mb-1">Purchase Value</div>
            <div className="text-xl font-bold text-slate-900">ETB {computedStats.totalPurchaseValue.toLocaleString()}</div>
          </div>
          <div className="bg-white border border-slate-100 rounded-xl p-4 shadow-sm">
            <div className="text-xs text-slate-400 font-medium mb-1">Current Value</div>
            <div className="text-xl font-bold text-emerald-600">ETB {computedStats.totalCurrentValue.toLocaleString()}</div>
          </div>
          <div className="bg-white border border-slate-100 rounded-xl p-4 shadow-sm">
            <div className="text-xs text-slate-400 font-medium mb-1">Total Depreciation</div>
            <div className="text-xl font-bold text-amber-600">ETB {computedStats.totalDepreciation.toLocaleString()}</div>
          </div>
        </div>
      )}

      {moduleSlug === "tax-vat" && rows.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          {(() => {
            const outputVat = rows.filter(r => r.type === 'Output VAT (Sales)').reduce((s: number, r: any) => s + (r.vatAmount || 0), 0);
            const inputVat = rows.filter(r => r.type === 'Input VAT (Purchases)').reduce((s: number, r: any) => s + (r.vatAmount || 0), 0);
            return (
              <>
                <div className="bg-white border border-slate-100 rounded-xl p-4 shadow-sm">
                  <div className="text-xs text-slate-400 font-medium mb-1">Output VAT (Sales)</div>
                  <div className="text-xl font-bold text-purple-600">ETB {outputVat.toLocaleString()}</div>
                </div>
                <div className="bg-white border border-slate-100 rounded-xl p-4 shadow-sm">
                  <div className="text-xs text-slate-400 font-medium mb-1">Input VAT (Purchases)</div>
                  <div className="text-xl font-bold text-blue-600">ETB {inputVat.toLocaleString()}</div>
                </div>
                <div className="bg-white border border-slate-100 rounded-xl p-4 shadow-sm">
                  <div className="text-xs text-slate-400 font-medium mb-1">Net VAT Payable</div>
                  <div className={`text-xl font-bold ${outputVat - inputVat >= 0 ? 'text-red-500' : 'text-emerald-600'}`}>
                    ETB {(outputVat - inputVat).toLocaleString()}
                  </div>
                </div>
              </>
            );
          })()}
        </div>
      )}

      {moduleSlug === "financial-statements" && rows.length > 0 && (
        <div className="bg-white border border-slate-100 rounded-xl p-5 shadow-sm">
          <h3 className="text-sm font-bold text-slate-800 mb-4">Financial Summary</h3>
          {["Income", "Expenses", "Net Profit", "Balance Sheet"].map((section) => {
            const sectionRows = rows.filter((r: any) => r.section === section);
            if (sectionRows.length === 0) return null;
            return (
              <div key={section} className="mb-4 last:mb-0">
                <div className="flex items-center gap-2 mb-2">
                  <div className={`w-2 h-2 rounded-full ${
                    section === "Income" ? "bg-emerald-500" :
                    section === "Expenses" ? "bg-red-500" :
                    section === "Net Profit" ? "bg-blue-500" : "bg-slate-500"
                  }`} />
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">{section}</h4>
                </div>
                {sectionRows.map((row: any, i: number) => (
                  <div key={i} className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-slate-50">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-slate-700">{row.account}</span>
                      <Badge value={row.status || ""} />
                    </div>
                    <span className={`font-mono text-sm font-bold ${
                      row.amount >= 0 ? "text-slate-900" : "text-red-500"
                    }`}>
                      ETB {(row.amount || 0).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      )}

      {moduleSlug === "multi-currency" && rows.length > 0 && (
        <div className="bg-white border border-slate-100 rounded-xl overflow-hidden shadow-sm">
          <div className="p-4 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-800">Exchange Rates (vs. ETB)</h3>
            <p className="text-xs text-slate-400 mt-0.5">Rates updated daily from National Bank of Ethiopia</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-px bg-slate-100">
            {rows.map((rate: any, i: number) => (
              <div key={i} className="bg-white p-4 hover:bg-slate-50 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <Badge value={rate.currency} />
                  <span className={`text-xs font-medium flex items-center gap-0.5 ${
                    (rate.change || "").startsWith("+") ? "text-emerald-600" :
                    (rate.change || "").startsWith("-") ? "text-red-500" : "text-slate-400"
                  }`}>
                    {(rate.change || "").startsWith("+") ? <ArrowUpRight size={10} /> : (rate.change || "").startsWith("-") ? <ArrowDownRight size={10} /> : null}
                    {rate.change || "0.00"}
                  </span>
                </div>
                <div className="text-lg font-bold text-slate-900">{Number(rate.rate || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })}</div>
                <div className="text-[10px] text-slate-400 mt-1">{rate.lastUpdated || ""}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {moduleSlug === "financial-analytics" && rows.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {rows.map((kpi: any, i: number) => {
            const achieved = Number(kpi.achieved) || 0;
            return (
              <div key={i} className="bg-white border border-slate-100 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">{kpi.metric}</h3>
                  </div>
                  <Badge value={kpi.trend || "Stable"} />
                </div>
                <div className="text-2xl font-bold text-slate-900 mb-1">{kpi.value}</div>
                <div className="text-xs text-slate-400 mb-3">Target: {kpi.target || "N/A"}</div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        achieved >= 80 ? "bg-emerald-500" : achieved >= 50 ? "bg-amber-500" : "bg-red-500"
                      }`}
                      style={{ width: `${Math.min(100, Math.max(0, achieved))}%` }}
                    />
                  </div>
                  <span className={`text-xs font-bold ${
                    achieved >= 80 ? "text-emerald-600" : achieved >= 50 ? "text-amber-600" : "text-red-500"
                  }`}>
                    {achieved}%
                  </span>
                </div>
                <div className="text-[10px] text-slate-400 italic mt-1 border-t border-slate-50 pt-2">
                  {kpi.bestPractice || ""}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── SEARCH BAR ───────────────────────────── */}
      {(moduleSlug !== "financial-analytics" || rows.length === 0) && (
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-black" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder={`Search ${moduleConfig.title.toLowerCase()}...`}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent placeholder:text-slate-400"
            />
          </div>
          <button
            onClick={() => { setSearch(''); search && toast('Search cleared', 'info'); }}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-colors ${
              search ? 'bg-slate-900 text-white border-slate-900' : 'border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {search ? 'Clear' : 'Filter'}
          </button>
        </div>
      )}

      {/* ── DATA TABLE ───────────────────────────── */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-100">
                {moduleConfig.columns.map((col, i) => (
                  <th key={i} className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap">
                    {col.label}
                  </th>
                ))}
                {(!isReadOnly || isPayable) && (
                  <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-widest">Actions</th>
                )}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={moduleConfig.columns.length + 1} className="text-center py-16 text-slate-500 text-sm">
                    <div className="flex flex-col items-center gap-3">
                      <span className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></span>
                      Loading financial data...
                    </div>
                  </td>
                </tr>
              ) : filteredRows.length === 0 ? (
                <tr>
                  <td colSpan={moduleConfig.columns.length + 1} className="text-center py-16 text-slate-400 text-sm font-light">
                    No records found
                  </td>
                </tr>
              ) : (
                filteredRows.map((row, rowIdx) => (
                  <motion.tr
                    key={rowIdx}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: rowIdx * 0.04 }}
                    className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors"
                  >
                    {moduleConfig.columns.map((col, colIdx) => (
                      <td key={colIdx} className="px-4 py-3.5 whitespace-nowrap">
                        <CellRenderer col={col} value={row[col.key]} row={row} />
                      </td>
                    ))}
                    {(!isReadOnly || isPayable) && (
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-1">
                          {isPayable ? (
                            <>
                              <button onClick={() => setPayConfirm({
                                id: row.id,
                                vendor: row.vendor || row.customer || 'Unknown',
                                amount: row.balance || 0
                              })} 
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-semibold transition-all hover:shadow-sm" 
                                title="Mark as Paid"
                              >
                                <DollarSign size={12} /> Pay Now
                              </button>
                              <button onClick={() => handleOpenModal("view", row)} className="w-7 h-7 rounded-lg hover:bg-blue-50 flex items-center justify-center text-slate-400 hover:text-blue-600 transition-colors" title="View">
                                <Eye size={13} className="text-black" />
                              </button>
                            </>
                          ) : (
                            <>
                              <button onClick={() => handleOpenModal("view", row)} className="w-7 h-7 rounded-lg hover:bg-blue-50 flex items-center justify-center text-slate-400 hover:text-blue-600 transition-colors" title="View">
                                <Eye size={13} className="text-black" />
                              </button>
                              {row.id && (
                                <>
                                  <button onClick={() => handleOpenModal("edit", row)} className="w-7 h-7 rounded-lg hover:bg-amber-50 flex items-center justify-center text-slate-400 hover:text-amber-600 transition-colors" title="Edit">
                                    <Pencil size={13} className="text-black" />
                                  </button>
                                  <button onClick={() => handleDelete(row.id)} className="w-7 h-7 rounded-lg hover:bg-red-50 flex items-center justify-center text-slate-400 hover:text-red-500 transition-colors" title="Delete">
                                    <Trash2 size={13} className="text-black" />
                                  </button>
                                </>
                              )}
                            </>
                          )}
                        </div>
                      </td>
                    )}
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 border-t border-slate-200 bg-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>Showing {filteredRows.length} of {rows.length} records</span>
        </div>
      </div>

      {/* ── CRUD MODAL ───────────────────────────── */}
      {modalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center p-4 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-900 capitalize">{modalMode} Record</h2>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X size={18} className="text-black" />
              </button>
            </div>
            <div className="p-4 overflow-y-auto flex-1 space-y-4">
              {moduleConfig.columns.map((col, i) => {
                const isViewOnly = modalMode === "view";
                return (
                  <div key={i} className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-slate-700">{col.label}</label>
                    {col.type === "select" && col.options ? (
                      <select
                        value={formData[col.key] || ""}
                        onChange={e => setFormData({ ...formData, [col.key]: e.target.value })}
                        disabled={isViewOnly}
                        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-slate-900 bg-white text-slate-900 disabled:bg-slate-50 disabled:text-slate-500"
                      >
                        <option value="">Select {col.label}...</option>
                        {col.options.map(opt => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type={col.type === "date" ? "date" : col.type === "number" || col.type === "currency" ? "number" : "text"}
                        value={formData[col.key] || ""}
                        onChange={e => setFormData({ ...formData, [col.key]: col.type === "number" || col.type === "currency" ? parseFloat(e.target.value) || 0 : e.target.value })}
                        disabled={isViewOnly}
                        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-slate-900 bg-white text-slate-900 disabled:bg-slate-50 disabled:text-slate-500"
                      />
                    )}
                  </div>
                );
              })}
            </div>
            {modalMode !== "view" && (
              <div className="p-4 border-t border-slate-100 flex justify-end gap-2 bg-slate-50">
                <button onClick={() => setModalOpen(false)} className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900">
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

      <ConfirmDialog
        open={!!confirmDeleteId}
        variant="danger"
        title="Delete Record"
        message="Are you sure you want to delete this record? This action cannot be undone."
        confirmLabel="Delete"
        onConfirm={confirmDelete}
        onCancel={() => setConfirmDeleteId(null)}
      />

      {/* ── PAY CONFIRMATION ───────────────────────────── */}
      {payConfirm && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-xl overflow-hidden">
            <div className="p-5">
              <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center mb-4 mx-auto">
                <DollarSign size={22} className="text-emerald-600" />
              </div>
              <h2 className="text-lg font-bold text-slate-900 text-center mb-2">Confirm Payment</h2>
              <p className="text-sm text-slate-500 text-center mb-4">
                Mark invoice from <strong className="text-slate-800">{payConfirm.vendor}</strong> as paid?
              </p>
              <div className="bg-slate-50 rounded-xl p-4 mb-5">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-500">Amount</span>
                  <span className="text-xl font-bold text-emerald-600">ETB {payConfirm.amount.toLocaleString()}</span>
                </div>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setPayConfirm(null)} disabled={payingId !== null} className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-all">
                  Cancel
                </button>
                <button onClick={() => handleMarkPaid(payConfirm.id)} disabled={payingId !== null} className="flex-1 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                  {payingId === payConfirm.id ? (
                    <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Processing...</>
                  ) : (
                    <><DollarSign size={14} /> Confirm Payment</>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

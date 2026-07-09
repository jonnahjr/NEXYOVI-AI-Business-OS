"use client";

import { use, useState, useEffect } from "react";
import { notFound } from "next/navigation";
import { motion } from "framer-motion";
import {
  BrainCircuit, Send, Plus, Search, Filter, Download,
  MoreHorizontal, ChevronLeft, Pencil, Trash2, Eye, X,
  Calculator, RefreshCw, DollarSign, CheckCircle, Clock, Settings,
  Check, XCircle, CreditCard, Play, Pause, RotateCcw, FileText
} from "lucide-react";
import Link from "next/link";
import { NEXYOVI_PILLARS, toSlug } from "@/lib/pillars";
import { getPillarLogo } from "@/components/pillar-logos";
import { getModuleConfig, Column } from "@/lib/module-config";
import { getPillarConfig } from "@/lib/pillar-config";
import UltimateEmployeeManager from "@/components/hr/UltimateEmployeeManager";
import UltimateLeadManager from "@/components/crm/UltimateLeadManager";
import UltimateCustomerManager from "@/components/crm/UltimateCustomerManager";
import UltimateDealManager from "@/components/crm/UltimateDealManager";
import UltimateInvoiceManager from "@/components/crm/UltimateInvoiceManager";
import ATSKanban from "@/components/hr/ATSKanban";
import UltimateAttendanceDashboard from "@/components/hr/UltimateAttendanceDashboard";
import HRAnalyticsDashboard from "@/components/hr/HRAnalyticsDashboard";
import EmployeeSelfService from "@/components/hr/EmployeeSelfService";
import OrganizationalChart from "@/components/hr/OrganizationalChart";
import BarcodeQRPage from "@/components/inventory/BarcodeQRPage";
import FinancePage from "@/components/finance/FinancePage";
import EmployeeAutocomplete from "@/components/ui/EmployeeAutocomplete";
import SearchableSelect from "@/components/ui/SearchableSelect";
import ProductAutocomplete from "@/components/ui/ProductAutocomplete";
import WarehouseAutocomplete from "@/components/ui/WarehouseAutocomplete";
import { useToast } from "@/components/ui/Toast";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer
} from "recharts";

const STATUS_COLORS: Record<string, string> = {
  "Active":           "bg-slate-100 text-slate-900",
  "Inactive":         "bg-slate-100 text-slate-900",
  "On Leave":         "bg-slate-100 text-slate-900",
  "Paid":             "bg-slate-100 text-slate-900",
  "Pending":          "bg-amber-50 text-amber-700",
  "Processing":       "bg-blue-50 text-blue-700",
  "Approved":         "bg-emerald-50 text-emerald-700",
  "Rejected":         "bg-red-50 text-red-700",
  "Overdue":          "bg-slate-100 text-slate-900",
  "Partial":          "bg-slate-100 text-slate-900",
  "Sent":             "bg-slate-100 text-slate-900",
  "Draft":            "bg-slate-100 text-slate-900",
  "Final":            "bg-slate-100 text-slate-900",
  "Signed":           "bg-slate-100 text-slate-900",
  "Pending Signature":"bg-slate-100 text-slate-900",
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
  "Contacted":        "bg-sky-50 text-sky-700",
  "Qualified":        "bg-indigo-50 text-indigo-700",
  "Closed Lost":      "bg-red-50 text-red-700",
  "Delivered":        "bg-emerald-50 text-emerald-700",
  "Shipped":          "bg-blue-50 text-blue-700",
  "Event":            "bg-slate-100 text-slate-900",
  "Food":             "bg-slate-100 text-slate-900",
  "Electronics":      "bg-slate-100 text-slate-900",
  "Construction":     "bg-slate-100 text-slate-900",
  "Furniture":        "bg-slate-100 text-slate-900",
  "Export":           "bg-slate-100 text-slate-900",
};

// ── STATUS ACTION TRANSITIONS ──────────────────────────────────
// Maps a current status to available transition buttons
type StatusAction = {
  nextStatus: string;
  label: string;
  icon: React.ReactNode;
  color: string;
};

const STATUS_ACTIONS: Record<string, StatusAction[]> = {
  "Pending": [
    { nextStatus: "Approved", label: "Approve", icon: <Check size={13} />, color: "hover:bg-emerald-50 hover:text-emerald-600" },
    { nextStatus: "Rejected", label: "Reject", icon: <XCircle size={13} />, color: "hover:bg-red-50 hover:text-red-600" },
  ],
  "Draft": [
    { nextStatus: "Sent", label: "Send", icon: <Send size={13} />, color: "hover:bg-blue-50 hover:text-blue-600" },
    { nextStatus: "Final", label: "Finalize", icon: <Check size={13} />, color: "hover:bg-emerald-50 hover:text-emerald-600" },
  ],
  "Open": [
    { nextStatus: "In Progress", label: "Start", icon: <Play size={13} />, color: "hover:bg-blue-50 hover:text-blue-600" },
  ],
  "In Progress": [
    { nextStatus: "Resolved", label: "Resolve", icon: <Check size={13} />, color: "hover:bg-emerald-50 hover:text-emerald-600" },
    { nextStatus: "Completed", label: "Complete", icon: <CheckCircle size={13} />, color: "hover:bg-green-50 hover:text-green-600" },
  ],
  "New": [
    { nextStatus: "Contacted", label: "Contact", icon: <Send size={13} />, color: "hover:bg-blue-50 hover:text-blue-600" },
    { nextStatus: "Closed Lost", label: "Close Lost", icon: <XCircle size={13} />, color: "hover:bg-red-50 hover:text-red-600" },
  ],
  "Contacted": [
    { nextStatus: "Qualified", label: "Qualify", icon: <Check size={13} />, color: "hover:bg-emerald-50 hover:text-emerald-600" },
    { nextStatus: "Closed Lost", label: "Close Lost", icon: <XCircle size={13} />, color: "hover:bg-red-50 hover:text-red-600" },
  ],
  "Sent": [
    { nextStatus: "Paid", label: "Mark Paid", icon: <CreditCard size={13} />, color: "hover:bg-green-50 hover:text-green-600" },
    { nextStatus: "Overdue", label: "Mark Overdue", icon: <Clock size={13} />, color: "hover:bg-amber-50 hover:text-amber-600" },
  ],
  "Approved": [
    { nextStatus: "Paid", label: "Pay", icon: <CreditCard size={13} />, color: "hover:bg-green-50 hover:text-green-600" },
  ],
  "Active": [
    { nextStatus: "Inactive", label: "Deactivate", icon: <Pause size={13} />, color: "hover:bg-amber-50 hover:text-amber-600" },
  ],
  "Inactive": [
    { nextStatus: "Active", label: "Activate", icon: <Play size={13} />, color: "hover:bg-emerald-50 hover:text-emerald-600" },
  ],
  "Rejected": [
    { nextStatus: "Open", label: "Reopen", icon: <RotateCcw size={13} />, color: "hover:bg-blue-50 hover:text-blue-600" },
  ],
  "Cancelled": [
    { nextStatus: "Open", label: "Reopen", icon: <RotateCcw size={13} />, color: "hover:bg-blue-50 hover:text-blue-600" },
  ],
  "Resolved": [
    { nextStatus: "Open", label: "Reopen", icon: <RotateCcw size={13} />, color: "hover:bg-blue-50 hover:text-blue-600" },
  ],
  "Shipped": [
    { nextStatus: "Delivered", label: "Deliver", icon: <Check size={13} />, color: "hover:bg-emerald-50 hover:text-emerald-600" },
  ],
  "Processing": [
    { nextStatus: "Shipped", label: "Ship", icon: <Send size={13} />, color: "hover:bg-blue-50 hover:text-blue-600" },
  ],
};

// Statuses that allow a generic "Cancel" action
const CANCELABLE_STATUSES = new Set([
  "Pending", "Draft", "Open", "New", "Sent", "Approved", "Active", "Processing", "Scheduled"
]);

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
  // Handle object values (e.g. employee: { firstName, lastName } from API)
  const displayValue = typeof value === 'object' && value !== null
    ? value.firstName && value.lastName
      ? `${value.firstName} ${value.lastName}`.trim()
      : value.name || value.label || JSON.stringify(value)
    : String(value);
  // Days column in Leave Management: show remaining balance with color
  if (col.key === "days" && row?.remainingDays !== undefined) {
    const remaining = Number(row.remainingDays);
    const isNegative = remaining < 0;
    const isExhausted = remaining <= 0;
    return (
      <div className="flex items-center gap-2">
        <span className="font-mono text-sm">{Number(value).toLocaleString()}</span>
        <span className={`text-[11px] font-medium px-1.5 py-0.5 rounded-md ${
          isExhausted
            ? 'bg-red-50 text-red-600'
            : 'bg-green-50 text-green-700'
        }`}>
          {remaining >= 0 ? `${remaining} left` : `${Math.abs(remaining)} over`}
        </span>
      </div>
    );
  }
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
  const [ultimateHR, setUltimateHR] = useState<{ mode: 'create' | 'edit' | 'view'; data?: any; id?: string } | null>(null);
  // Ultimate Lead Manager state
  const [ultimateLead, setUltimateLead] = useState<{ mode: 'create' | 'edit' | 'view'; data?: any; id?: string } | null>(null);
  // Ultimate CRM Managers state
  const [ultimateCustomer, setUltimateCustomer] = useState<{ mode: 'create' | 'edit' | 'view'; data?: any; id?: string } | null>(null);
  const [ultimateDeal, setUltimateDeal] = useState<{ mode: 'create' | 'edit' | 'view'; data?: any; id?: string } | null>(null);
  const [ultimateInvoice, setUltimateInvoice] = useState<{ mode: 'create' | 'edit' | 'view'; data?: any; id?: string } | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  // Invoice stats state
  const [invoiceStats, setInvoiceStats] = useState<{
    totalOutstanding: number;
    totalOverdue: number;
    totalPaid: number;
    monthlyRevenue: number;
    overdueCount: number;
    paidCount: number;
    outstandingCount: number;
    sentCount: number;
    draftCount: number;
    totalInvoices: number;
    monthlyRevenueData: { month: number; year: number; revenue: number; count: number }[];
  } | null>(null);
  const [isLoadingInvoiceStats, setIsLoadingInvoiceStats] = useState(false);
  const [invoiceStatsRefreshKey, setInvoiceStatsRefreshKey] = useState(0);

  // Payroll-specific state
  const [isGeneratingPayroll, setIsGeneratingPayroll] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState<string | null>(null);
  const [showQuickEdit, setShowQuickEdit] = useState<any>(null);
  const [showPayrollSettings, setShowPayrollSettings] = useState(false);
  const [payrollSettings, setPayrollSettings] = useState<Record<string, boolean>>({
    includeAttendanceOvertime: true,
    includeAbsenceDeductions: true,
    includeLatePenalties: true,
    includeUnpaidLeaveDeductions: true,
    includeBonuses: true,
    autoCalculateTax: true,
    includePension: true,
    useWorkDayBasedPay: false,
  });
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [payrollSummary, setPayrollSummary] = useState<{
    totalBasic: number;
    totalAllowance: number;
    totalDeduction: number;
    totalNet: number;
    totalPaid: number;
    totalDraft: number;
    totalApproved: number;
  } | null>(null);

  // Compute payroll summary whenever rows change
  useEffect(() => {
    if (moduleSlug === "payroll" && rows.length > 0) {
      const summary = rows.reduce((acc: any, row: any) => ({
        totalBasic: acc.totalBasic + (Number(row.basic) || 0),
        totalAllowance: acc.totalAllowance + (Number(row.allowance) || 0),
        totalDeduction: acc.totalDeduction + (Number(row.deduction) || 0),
        totalNet: acc.totalNet + (Number(row.net) || 0),
        totalPaid: acc.totalPaid + (row.status === 'Paid' ? 1 : 0),
        totalDraft: acc.totalDraft + (row.status === 'Draft' ? 1 : 0),
        totalApproved: acc.totalApproved + (row.status === 'Approved' ? 1 : 0),
      }), { totalBasic: 0, totalAllowance: 0, totalDeduction: 0, totalNet: 0, totalPaid: 0, totalDraft: 0, totalApproved: 0 });
      setPayrollSummary(summary);
    } else if (moduleSlug === "payroll") {
      setPayrollSummary(null);
    }
  }, [rows, moduleSlug]);

  // Leave Management: employee balances for remaining days calculation
  const [employeeBalances, setEmployeeBalances] = useState<any>(null);
  const [remainingDays, setRemainingDays] = useState<number | null>(null);

  const getApiUrl = () => {
    return `http://localhost:3002/api/v1/modules/${pillarSlug}/${moduleSlug}`;
  };

  // Payroll: load settings when on payroll page
  useEffect(() => {
    if (moduleSlug !== "payroll") return;
    (async () => {
      try {
        const token = localStorage.getItem("token") || "";
        const res = await fetch(
          `http://localhost:3002/api/v1/modules/human-resources/payroll/settings`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const json = await res.json();
        if (json?.success && json?.data) {
          const { id, companyId, createdAt, updatedAt, ...toggles } = json.data;
          setPayrollSettings(toggles);
        }
      } catch {}
    })();
  }, [moduleSlug]);

  // Payroll: save settings
  const handleSavePayrollSettings = async () => {
    setIsSavingSettings(true);
    try {
      const token = localStorage.getItem("token") || "";
      const res = await fetch(
        `http://localhost:3002/api/v1/modules/human-resources/payroll/settings`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payrollSettings),
        }
      );
      const json = await res.json();
      if (res.ok && json?.success) {
        toast("Payroll settings saved", "success");
        setShowPayrollSettings(false);
      } else {
        toast(json?.error || "Failed to save settings", "error");
      }
    } catch {
      toast("Error saving settings", "error");
    } finally {
      setIsSavingSettings(false);
    }
  };

  // Payroll: generate payroll for all active employees
  const handleGeneratePayroll = async () => {
    setIsGeneratingPayroll(true);
    try {
      const token = localStorage.getItem("token") || "";
      const now = new Date();
      const res = await fetch(`http://localhost:3002/api/v1/modules/human-resources/payroll/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          month: now.getMonth() + 1,
          year: now.getFullYear(),
        })
      });
      const json = await res.json();
      if (res.ok && json?.success) {
        const result = json.data;
        toast(
          `Payroll generated: ${result.totalCreated} employee(s) created, ${result.totalSkipped} already had records`,
          "success"
        );
        loadData();
      } else {
        toast(json?.message || json?.error || "Failed to generate payroll", "error");
      }
    } catch (err) {
      console.error(err);
      toast("Error generating payroll", "error");
    } finally {
      setIsGeneratingPayroll(false);
    }
  };

  // Payroll: update individual record status
  const handlePayrollStatusUpdate = async (recordId: string, newStatus: string) => {
    setIsUpdatingStatus(recordId);
    try {
      const token = localStorage.getItem("token") || "";
      // Find the row to get current data
      const row = rows.find(r => (r.prismaId || r.id) === recordId);
      if (!row) { toast("Record not found", "error"); return; }
      // Send only status + key numeric fields to backend
      const updateData = {
        status: newStatus,
        basic: row.basic,
        allowance: row.allowance,
        deduction: row.deduction,
        tax: row.tax,
        net: row.net,
      };
      const res = await fetch(`${getApiUrl()}/${recordId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(updateData),
      });
      if (res.ok) {
        toast(`Status changed to ${newStatus}`, "success");
        loadData();
      } else {
        const err = await res.json().catch(() => ({}));
        toast(err?.message || "Failed to update status", "error");
      }
    } catch {
      toast("Error updating status", "error");
    } finally {
      setIsUpdatingStatus(null);
    }
  };

  // Payroll: approve all draft records
  const handleApproveAllDraft = async () => {
    setIsUpdatingStatus("all");
    try {
      const draftRows = rows.filter(r => r.status === "Draft");
      if (draftRows.length === 0) {
        toast("No draft records to approve", "info");
        setIsUpdatingStatus(null);
        return;
      }
      const token = localStorage.getItem("token") || "";
      let successCount = 0;
      let failCount = 0;
      for (const row of draftRows) {
        const recordId = row.prismaId || row.id;
        try {
          const res = await fetch(`${getApiUrl()}/${recordId}`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({
              status: "APPROVED",
              basic: row.basic,
              allowance: row.allowance,
              deduction: row.deduction,
              tax: row.tax,
              net: row.net,
            }),
          });
          if (res.ok) successCount++;
          else failCount++;
        } catch { failCount++; }
      }
      toast(`${successCount} approved, ${failCount} failed`, successCount > 0 ? "success" : "error");
      loadData();
    } catch {
      toast("Error approving records", "error");
    } finally {
      setIsUpdatingStatus(null);
    }
  };

  // Payroll: quick-edit save for financial fields
  const handleQuickEditSave = async () => {
    if (!showQuickEdit) return;
    setIsSaving(true);
    try {
      const token = localStorage.getItem("token") || "";
      const recordId = showQuickEdit.prismaId || showQuickEdit.id;
      const res = await fetch(`${getApiUrl()}/${recordId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          basic: Number(showQuickEdit.basic) || 0,
          allowance: Number(showQuickEdit.allowance) || 0,
          deduction: Number(showQuickEdit.deduction) || 0,
          tax: Number(showQuickEdit.tax) || 0,
          net: Number(showQuickEdit.net) || 0,
          status: showQuickEdit.status || 'DRAFT',
        }),
      });
      if (res.ok) {
        toast("Payroll updated", "success");
        setShowQuickEdit(null);
        loadData();
      } else {
        const err = await res.json().catch(() => ({}));
        toast(err?.message || "Failed to update", "error");
      }
    } catch {
      toast("Error updating payroll", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const loadData = async () => {
    setIsLoadingData(true);
    try {
      const token = localStorage.getItem("token") || "";
      const res = await fetch(getApiUrl(), { headers: { "Authorization": `Bearer ${token}` } });
      const data = await res.json();
      if (data?.data && Array.isArray(data.data) && data.data.length > 0) {
        // Compute days and remainingDays for leave management (in case backend doesn't provide them)
        let processed = data.data;
        if (moduleSlug === "leave-management") {
          // Fetch employee balances for all referenced employees to compute remaining days
          const empIds = [...new Set(processed.map((r: any) => r.employeeId))].filter((id): id is string => !!id);
          const balancesMap: Record<string, any> = {};
          await Promise.all(empIds.map(async (eid: string) => {
            try {
              const eres = await fetch(
                `http://localhost:3002/api/v1/modules/human-resources/employee-management/${eid}`,
                { headers: { Authorization: `Bearer ${token}` } }
              );
              const ejson = await eres.json();
              if (ejson?.data) balancesMap[eid] = ejson.data;
            } catch {}
          }));
          const TYPE_BALANCE_MAP: Record<string, string> = {
            ANNUAL: 'annualLeaveBalance', SICK: 'sickLeaveBalance',
            MATERNITY: 'maternityLeave', PATERNITY: 'paternityLeave',
            UNPAID: 'unpaidLeaveBalance',
          };
          processed = processed.map((r: any) => {
            const s = r.startDate, e = r.endDate;
            let days = r.days;
            if (!days && s && e) {
              days = Math.floor(Math.abs(new Date(e).getTime() - new Date(s).getTime()) / (1000 * 60 * 60 * 24)) + 1;
            }
            const balanceField = TYPE_BALANCE_MAP[(r.type || '').toUpperCase()];
            const empBal = balancesMap[r.employeeId] || {};
            const balance = balanceField ? Number(empBal[balanceField] || 0) : null;
            const remaining = balance !== null ? balance - (days || 0) : null;
            // Flatten employee object if it's {firstName, lastName}
            const emp = r.employee;
            const employeeName = emp && typeof emp === 'object'
              ? `${emp.firstName || ''} ${emp.lastName || ''}`.trim() || emp.name || emp.label || ''
              : emp || '';
            return { ...r, days: days || 0, remainingDays: remaining, employee: employeeName };
          });
        }
        setRows(processed);
      } else {
        setRows([]);
      }
    } catch (err) {
      console.error(`Error fetching:`, err);
    } finally {
      setIsLoadingData(false);
    }
  };

  // Fetch invoice stats when on invoicing module
  useEffect(() => {
    if (moduleSlug !== "invoicing") return;
    setIsLoadingInvoiceStats(true);
    (async () => {
      try {
        const token = localStorage.getItem("token") || "";
        const res = await fetch(
          `http://localhost:3002/api/v1/modules/${pillarSlug}/invoicing/stats`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const json = await res.json();
        if (json?.success && json?.data) {
          setInvoiceStats(json.data);
        }
      } catch {}
      setIsLoadingInvoiceStats(false);
    })();
  }, [pillarSlug, moduleSlug, invoiceStatsRefreshKey]);

  useEffect(() => {
    loadData();
  }, [pillarSlug, moduleSlug]);

  // Auto-calculate Days for Leave Management when both dates are filled
  useEffect(() => {
    if (moduleSlug !== "leave-management") return;
    const { startDate, endDate } = formData;
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
        const diffTime = Math.abs(end.getTime() - start.getTime());
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1; // inclusive
        setFormData((prev: any) => ({ ...prev, days: diffDays }));
      }
    }
  }, [formData.startDate, formData.endDate, moduleSlug]);

  // Fetch employee leave balances when employeeId changes (Leave Management)
  useEffect(() => {
    if (moduleSlug !== "leave-management") return;
    const empId = formData.employeeId;
    if (!empId) {
      setEmployeeBalances(null);
      setRemainingDays(null);
      return;
    }
    const fetchBalances = async () => {
      try {
        const token = localStorage.getItem("token") || "";
        const res = await fetch(
          `http://localhost:3002/api/v1/modules/human-resources/employee-management/${empId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const json = await res.json();
        const empData = json?.data;
        if (empData) {
          setEmployeeBalances({
            ANNUAL: Number(empData.annualLeaveBalance || 0),
            SICK: Number(empData.sickLeaveBalance || 0),
            MATERNITY: Number(empData.maternityLeave || 0),
            PATERNITY: Number(empData.paternityLeave || 0),
            UNPAID: Number(empData.unpaidLeaveBalance || 0),
            OTHER: null,
          });
        }
      } catch {
        // silent fail — balances remain unset
      }
    };
    fetchBalances();
  }, [formData.employeeId, moduleSlug]);

  // Recalculate remaining days when type, days, or balances change
  useEffect(() => {
    if (moduleSlug !== "leave-management") return;
    const { type, days } = formData;
    if (!type || !days || !employeeBalances) {
      setRemainingDays(null);
      return;
    }
    // Normalize type to uppercase enum
    const typeUpper = String(type).toUpperCase();
    const balance = employeeBalances[typeUpper];
    if (balance === null || balance === undefined) {
      setRemainingDays(null);
      return;
    }
    const remaining = Number(balance) - Number(days);
    setRemainingDays(remaining);
  }, [formData.type, formData.days, employeeBalances, moduleSlug]);

  const handleOpenModal = (mode: "create" | "edit" | "view", row: any = null) => {
    // Specialized route for Ultimate HR System
    if (pillarSlug === "human-resources" && moduleSlug === "employee-management") {
      setUltimateHR({
        mode,
        data: row || undefined,
        id: row?.prismaId || undefined,
      });
      return;
    }

    // Specialized route for Ultimate Lead Manager
    if (pillarSlug === "crm-sales" && moduleSlug === "lead-management") {
      setUltimateLead({
        mode,
        data: row || undefined,
        id: row?.id || undefined,
      });
      return;
    }

    // Specialized route for Ultimate Customer Manager
    if (pillarSlug === "crm-sales" && moduleSlug === "customer-management") {
      setUltimateCustomer({
        mode,
        data: row || undefined,
        id: row?.id || undefined,
      });
      return;
    }

    // Specialized route for Ultimate Deal Manager
    if (pillarSlug === "crm-sales" && moduleSlug === "opportunity-pipeline") {
      setUltimateDeal({
        mode,
        data: row || undefined,
        id: row?.id || undefined,
      });
      return;
    }

    // Specialized route for Ultimate Invoice Manager
    if (pillarSlug === "crm-sales" && moduleSlug === "invoicing") {
      setUltimateInvoice({
        mode,
        data: row || undefined,
        id: row?.id || undefined,
      });
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

      // Strip auto-generated & display-only fields that Prisma wouldn't understand
      const { createdAt, updatedAt, id, prismaId, remainingDays, leaveBalances, employee, ...cleanData } = formData;
      
      // Only remove 'name' if this module doesn't have a name column in its config
      // (e.g. employee-management computes name from firstName+lastName.
      // For products/customers/contracts etc., name is a real DB field that must be saved.)
      const hasNameColumn = moduleConfig.columns.some(col => col.key === "name");
      if (!hasNameColumn && "name" in cleanData) {
        delete (cleanData as any).name;
      }
      
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(cleanData)
      });
      if (res.ok) {
        setModalOpen(false);
        loadData();
        toast("Record saved successfully", "success");
      } else {
        const errData = await res.json().catch(() => ({}));
        toast(errData?.message || errData?.error || "Failed to save record", "error");
      }
    } catch (err) {
      console.error(err);
      toast("Error saving record. Please try again.", "error");
    } finally {
      setIsSaving(false);
    }
  };

  // ── Generic status update for any module ──────────────────────
  const handleStatusUpdate = async (recordId: string, newStatus: string) => {
    setIsUpdatingStatus(recordId);
    try {
      const token = localStorage.getItem("token") || "";
      const res = await fetch(`${getApiUrl()}/${recordId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        toast(`Status changed to ${newStatus}`, "success");
        loadData();
      } else {
        const err = await res.json().catch(() => ({}));
        toast(err?.message || "Failed to update status", "error");
      }
    } catch {
      toast("Error updating status", "error");
    } finally {
      setIsUpdatingStatus(null);
    }
  };

  const handleDelete = async (recordId: string) => {
    setConfirmDeleteId(recordId);
  };

  const confirmDelete = async () => {
    if (!confirmDeleteId) return;
    const recordId = confirmDeleteId;
    setConfirmDeleteId(null);
    try {
      const token = localStorage.getItem("token") || "";
      const res = await fetch(`${getApiUrl()}/${recordId}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        loadData();
        toast("Record deleted successfully", "success");
      } else {
        toast("Failed to delete record", "error");
      }
    } catch (err) {
      console.error(err);
      toast("Error deleting record. Please try again.", "error");
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

  // ── Deep recursive search — handles nested objects, arrays, dates ──
  const deepSearch = (obj: any, term: string): boolean => {
    const lower = term.toLowerCase();
    if (obj === null || obj === undefined) return false;
    if (typeof obj === 'string') return obj.toLowerCase().includes(lower);
    if (typeof obj === 'number' || typeof obj === 'boolean') return String(obj).toLowerCase().includes(lower);
    if (obj instanceof Date) return obj.toISOString().includes(lower);
    if (Array.isArray(obj)) return obj.some(item => deepSearch(item, term));
    if (typeof obj === 'object') return Object.values(obj).some(v => deepSearch(v, term));
    return false;
  };

  const filteredRows = rows.filter(row => deepSearch(row, search));

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

  // Specialized route for Finance & Accounting (all 13 modules)
  if (pillarSlug === "finance-accounting") {
    return (
      <div className="max-w-7xl mx-auto pb-20">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-slate-500 mb-6">
          <Link href="/dashboard" className="hover:text-slate-800 transition-colors">Dashboard</Link>
          <span>/</span>
          <Link href={`/dashboard/${pillarSlug}`} className="hover:text-slate-800 transition-colors flex items-center gap-1">
            {(() => {
              const Logo = getPillarLogo(pillarSlug);
              return Logo ? <Logo size={16} className="text-slate-500 inline" /> : <span>{pillar.emoji}</span>;
            })()} {pillar.name}
          </Link>
          <span>/</span>
          <span className="text-slate-900 font-semibold">{moduleConfig.title}</span>
        </div>
        <FinancePage pillarSlug={pillarSlug} moduleSlug={moduleSlug} />
      </div>
    );
  }

  // Specialized route for Barcode / QR management
  if (pillarSlug === "inventory-warehouse" && moduleSlug === "barcode-qr") {
    return <BarcodeQRPage />;
  }

  // Specialized route for ATS Kanban board
  if (pillarSlug === "human-resources" && moduleSlug === "recruitment-ats") {
    return <ATSKanban />;
  }

  // Specialized route for Ultimate Attendance Dashboard
  if (pillarSlug === "human-resources" && moduleSlug === "attendance") {
    return <UltimateAttendanceDashboard />;
  }

  // Specialized route for HR Analytics Dashboard
  if (pillarSlug === "human-resources" && moduleSlug === "hr-analytics") {
    return (
      <div className="max-w-7xl mx-auto pb-20">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-slate-500 mb-6">
          <Link href="/dashboard" className="hover:text-slate-800 transition-colors">Dashboard</Link>
          <span>/</span>
          <Link href={`/dashboard/${pillarSlug}`} className="hover:text-slate-800 transition-colors flex items-center gap-1">
            {(() => {
            const Logo = getPillarLogo(pillarSlug);
            return Logo ? <Logo size={16} className="text-slate-500 inline" /> : <span>{pillar.emoji}</span>;
          })()} {pillar.name}
          </Link>
          <span>/</span>
          <span className="text-slate-900 font-semibold">HR Analytics</span>
        </div>
        <HRAnalyticsDashboard />
      </div>
    );
  }

  // Specialized route for Employee Self-Service
  if (pillarSlug === "human-resources" && moduleSlug === "employee-self-service") {
    return (
      <div className="max-w-7xl mx-auto pb-20">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-slate-500 mb-6">
          <Link href="/dashboard" className="hover:text-slate-800 transition-colors">Dashboard</Link>
          <span>/</span>
          <Link href={`/dashboard/${pillarSlug}`} className="hover:text-slate-800 transition-colors flex items-center gap-1">
            {(() => {
            const Logo = getPillarLogo(pillarSlug);
            return Logo ? <Logo size={16} className="text-slate-500 inline" /> : <span>{pillar.emoji}</span>;
          })()} {pillar.name}
          </Link>
          <span>/</span>
          <span className="text-slate-900 font-semibold">Employee Self-Service</span>
        </div>
        <EmployeeSelfService />
      </div>
    );
  }

  // Specialized route for Organizational Chart
  if (pillarSlug === "human-resources" && moduleSlug === "organizational-chart") {
    return (
      <div className="max-w-7xl mx-auto pb-20">
        <OrganizationalChart />
      </div>
    );
  }

  if (ultimateCustomer) {
    return (
      <div className="max-w-7xl mx-auto pb-20">
        <UltimateCustomerManager
          onBack={() => { setUltimateCustomer(null); loadData(); }}
          initialData={ultimateCustomer.mode !== 'create' ? ultimateCustomer.data : undefined}
          customerId={ultimateCustomer.id}
          readOnly={ultimateCustomer.mode === 'view'}
        />
      </div>
    );
  }

  if (ultimateDeal) {
    return (
      <div className="max-w-7xl mx-auto pb-20">
        <UltimateDealManager
          onBack={() => { setUltimateDeal(null); loadData(); }}
          initialData={ultimateDeal.mode !== 'create' ? ultimateDeal.data : undefined}
          dealId={ultimateDeal.id}
          readOnly={ultimateDeal.mode === 'view'}
        />
      </div>
    );
  }

  if (ultimateInvoice) {
    return (
      <div className="max-w-7xl mx-auto pb-20">
        <UltimateInvoiceManager
          onBack={() => { setUltimateInvoice(null); loadData(); setInvoiceStatsRefreshKey(k => k + 1); }}
          initialData={ultimateInvoice.mode !== 'create' ? ultimateInvoice.data : undefined}
          invoiceId={ultimateInvoice.id}
          readOnly={ultimateInvoice.mode === 'view'}
        />
      </div>
    );
  }

  if (ultimateLead) {
    return (
      <div className="max-w-7xl mx-auto pb-20">
        <UltimateLeadManager
          onBack={() => { setUltimateLead(null); loadData(); }}
          initialData={ultimateLead.mode !== 'create' ? ultimateLead.data : undefined}
          leadId={ultimateLead.id}
          readOnly={ultimateLead.mode === 'view'}
        />
      </div>
    );
  }

  if (ultimateHR) {
    return (
      <div className="max-w-7xl mx-auto pb-20">
        <UltimateEmployeeManager
          onBack={() => { setUltimateHR(null); loadData(); }}
          initialData={ultimateHR.mode !== 'create' ? ultimateHR.data : undefined}
          employeeId={ultimateHR.id}
          readOnly={ultimateHR.mode === 'view'}
        />
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
          {(() => {
            const Logo = getPillarLogo(pillarSlug);
            return Logo ? <Logo size={16} className="text-slate-500 inline" /> : <span>{pillar.emoji}</span>;
          })()} {pillar.name}
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
              {/* Payroll: Generate Payroll & Settings buttons */}
              {moduleSlug === "payroll" && (
                <>
                  <button
                    onClick={() => setShowPayrollSettings(true)}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium text-slate-600 hover:bg-slate-50 transition-all"
                    title="Payroll Calculation Settings"
                  >
                    <Settings size={13} /> Settings
                  </button>
                  <button
                    onClick={handleApproveAllDraft}
                    disabled={isUpdatingStatus === "all"}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl border border-emerald-300 text-xs font-medium text-emerald-700 hover:bg-emerald-50 transition-all disabled:opacity-50"
                    title="Approve all Draft records"
                  >
                    <Check size={13} /> {isUpdatingStatus === "all" ? "Approving..." : "Approve All"}
                  </button>
                  <button
                    onClick={handleGeneratePayroll}
                    disabled={isGeneratingPayroll}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all disabled:opacity-50"
                  >
                    {isGeneratingPayroll ? (
                      <><RefreshCw size={13} className="animate-spin" /> Generating…</>
                    ) : (
                      <><Calculator size={13} /> Generate Payroll</>
                    )}
                  </button>
                </>
              )}
              <button
                onClick={() => setShowAI(!showAI)}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-medium transition-all ${
                  showAI ? "bg-slate-900 text-white border-slate-900" : "border-slate-200 text-slate-600 hover:border-slate-300"
                }`}
              >
                <BrainCircuit size={13} className={showAI ? "text-white" : "text-black"} /> AI
              </button>
              <button onClick={handleExport} className="flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-50">
                <Download size={13} className="text-black" /> Export
              </button>
              <button onClick={() => handleOpenModal("create")} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary hover:bg-primary/90 text-black text-xs font-bold transition-all">
                <Plus size={13} /> New Record
              </button>
            </div>
          </div>

          {/* Payroll: Summary Cards */}
          {moduleSlug === "payroll" && payrollSummary && (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              <div className="bg-white border border-slate-100 rounded-xl px-4 py-3 shadow-sm">
                <div className="flex items-center gap-2 text-slate-400 text-xs font-medium mb-1">
                  <DollarSign size={12} /> Total Basic
                </div>
                <div className="text-lg font-bold text-slate-900">{payrollSummary.totalBasic.toLocaleString()}</div>
              </div>
              <div className="bg-white border border-slate-100 rounded-xl px-4 py-3 shadow-sm">
                <div className="flex items-center gap-2 text-slate-400 text-xs font-medium mb-1">
                  <DollarSign size={12} /> Total Allowance
                </div>
                <div className="text-lg font-bold text-emerald-600">{payrollSummary.totalAllowance.toLocaleString()}</div>
              </div>
              <div className="bg-white border border-slate-100 rounded-xl px-4 py-3 shadow-sm">
                <div className="flex items-center gap-2 text-slate-400 text-xs font-medium mb-1">
                  <DollarSign size={12} /> Total Deduction
                </div>
                <div className="text-lg font-bold text-red-500">{payrollSummary.totalDeduction.toLocaleString()}</div>
              </div>
              <div className="bg-white border border-slate-100 rounded-xl px-4 py-3 shadow-sm">
                <div className="flex items-center gap-2 text-slate-400 text-xs font-medium mb-1">
                  <DollarSign size={12} /> Total Net Pay
                </div>
                <div className="text-lg font-bold text-slate-900">{payrollSummary.totalNet.toLocaleString()}</div>
              </div>
              <div className="bg-white border border-slate-100 rounded-xl px-4 py-3 shadow-sm">
                <div className="flex items-center gap-2 text-slate-400 text-xs font-medium mb-1">
                  <CheckCircle size={12} /> Paid
                </div>
                <div className="text-lg font-bold text-green-600">{payrollSummary.totalPaid}</div>
              </div>
              <div className="bg-white border border-slate-100 rounded-xl px-4 py-3 shadow-sm">
                <div className="flex items-center gap-2 text-slate-400 text-xs font-medium mb-1">
                  <Clock size={12} /> Draft
                </div>
                <div className="text-lg font-bold text-amber-600">{payrollSummary.totalDraft}</div>
              </div>
            </div>
          )}

          {/* Invoicing: Stats Cards */}
          {moduleSlug === "invoicing" && invoiceStats && (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              <div className="bg-white border border-slate-100 rounded-xl px-4 py-3 shadow-sm">
                <div className="flex items-center gap-2 text-slate-400 text-xs font-medium mb-1">
                  <DollarSign size={12} /> Outstanding
                </div>
                <div className="text-lg font-bold text-amber-600">{(invoiceStats.totalOutstanding || 0).toLocaleString()}</div>
                <div className="text-[10px] text-slate-400 mt-0.5">{invoiceStats.outstandingCount} invoice(s)</div>
              </div>
              <div className="bg-white border border-slate-100 rounded-xl px-4 py-3 shadow-sm">
                <div className="flex items-center gap-2 text-slate-400 text-xs font-medium mb-1">
                  <Clock size={12} /> Overdue
                </div>
                <div className="text-lg font-bold text-red-500">{(invoiceStats.totalOverdue || 0).toLocaleString()}</div>
                <div className="text-[10px] text-slate-400 mt-0.5">{invoiceStats.overdueCount} overdue</div>
              </div>
              <div className="bg-white border border-slate-100 rounded-xl px-4 py-3 shadow-sm">
                <div className="flex items-center gap-2 text-slate-400 text-xs font-medium mb-1">
                  <DollarSign size={12} /> Monthly Revenue
                </div>
                <div className="text-lg font-bold text-emerald-600">{(invoiceStats.monthlyRevenue || 0).toLocaleString()}</div>
                <div className="text-[10px] text-slate-400 mt-0.5">{new Date().toLocaleString('default', { month: 'long' })} {new Date().getFullYear()}</div>
              </div>
              <div className="bg-white border border-slate-100 rounded-xl px-4 py-3 shadow-sm">
                <div className="flex items-center gap-2 text-slate-400 text-xs font-medium mb-1">
                  <CheckCircle size={12} /> Paid
                </div>
                <div className="text-lg font-bold text-green-600">{(invoiceStats.totalPaid || 0).toLocaleString()}</div>
                <div className="text-[10px] text-slate-400 mt-0.5">{invoiceStats.paidCount} paid</div>
              </div>
              <div className="bg-white border border-slate-100 rounded-xl px-4 py-3 shadow-sm">
                <div className="flex items-center gap-2 text-slate-400 text-xs font-medium mb-1">
                  <Send size={12} /> Sent
                </div>
                <div className="text-lg font-bold text-blue-600">{invoiceStats.sentCount}</div>
                <div className="text-[10px] text-slate-400 mt-0.5">awaiting payment</div>
              </div>
              <div className="bg-white border border-slate-100 rounded-xl px-4 py-3 shadow-sm">
                <div className="flex items-center gap-2 text-slate-400 text-xs font-medium mb-1">
                  <FileText size={12} /> Drafts
                </div>
                <div className="text-lg font-bold text-slate-600">{invoiceStats.draftCount}</div>
                <div className="text-[10px] text-slate-400 mt-0.5">not yet sent</div>
              </div>
            </div>
          )}
          {/* Invoicing: Revenue Bar Chart */}
          {moduleSlug === "invoicing" && invoiceStats && invoiceStats.monthlyRevenueData && invoiceStats.monthlyRevenueData.length > 0 && (
            <div className="bg-white border border-slate-100 rounded-xl p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-emerald-50 flex items-center justify-center">
                    <DollarSign size={13} className="text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-800">Monthly Revenue Trend</h3>
                    <p className="text-[10px] text-slate-400">Last 12 months · PAID invoices only</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-emerald-600">
                    {(invoiceStats.monthlyRevenueData.reduce((s: number, d: any) => s + d.revenue, 0) || 0).toLocaleString()} ETB
                  </p>
                  <p className="text-[10px] text-slate-400">Total revenue (12mo)</p>
                </div>
              </div>
              <div className="w-full h-52">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={(() => {
                      const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
                      return invoiceStats.monthlyRevenueData.map((d: any) => ({
                        name: `${MONTH_NAMES[(d.month || 1) - 1]} '${String(d.year || 0).slice(2)}`,
                        revenue: d.revenue || 0,
                        count: d.count || 0,
                      }));
                    })()}
                    margin={{ top: 8, right: 8, left: -10, bottom: 0 }}
                  >
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 10, fill: '#94a3b8' }}
                      axisLine={true}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 10, fill: '#94a3b8' }} 
                      axisLine={false}
                      tickLine={false}
                      {...{ tickFormatter: (val: number) => val >= 1000 ? `${(val / 1000).toFixed(0)}k` : String(val) }}
                    />
                    <Tooltip
                      contentStyle={{
                        borderRadius: '10px',
                        border: '1px solid #e2e8f0',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                        fontSize: '12px',
                        padding: '8px 12px',
                      } as any}
                      formatter={(value: number, name: string) => {
                        if (name === 'revenue') return [`${value.toLocaleString()} ETB`, 'Revenue'];
                        return [value, name];
                      }}
                      labelStyle={{ fontWeight: 600, fontSize: '12px', marginBottom: '4px' }}
                    />
                    <Bar
                      dataKey="revenue"
                      fill="#059669"
                      radius={[4, 4, 0, 0] as any}
                      barSize={32}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {moduleSlug === "invoicing" && isLoadingInvoiceStats && !invoiceStats && (
            <div className="bg-white border border-slate-100 rounded-xl p-6 text-center text-sm text-slate-400">
              <div className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></span>
                Loading invoice statistics...
              </div>
            </div>
          )}

          {/* Payroll: Empty state with generate button */}
          {moduleSlug === "payroll" && rows.length === 0 && !isLoadingData && (
            <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-10 text-center">
              <div className="w-14 h-14 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-4">
                <Calculator size={24} className="text-emerald-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-1">No Payroll Records Yet</h3>
              <p className="text-sm text-slate-500 mb-6 max-w-md mx-auto">
                Generate payroll for all active employees this month. The system will automatically
                calculate salaries, allowances, deductions, taxes, and net pay.
              </p>
              <button
                onClick={handleGeneratePayroll}
                disabled={isGeneratingPayroll}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold transition-all disabled:opacity-50"
              >
                {isGeneratingPayroll ? (
                  <><RefreshCw size={15} className="animate-spin" /> Generating Payroll…</>
                ) : (
                  <><Calculator size={15} /> Generate Payroll Now</>
                )}
              </button>
            </div>
          )}

          {/* Search & Filter bar — hidden when payroll-specific empty state is shown */}
          {!(moduleSlug === "payroll" && rows.length === 0 && !isLoadingData) && (
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
                onClick={() => {
                  if (!search) return;
                  setSearch('');
                  toast('Search cleared', 'info');
                }}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-colors ${
                  search
                    ? 'bg-slate-900 text-white border-slate-900 hover:bg-slate-800'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Filter size={14} /> {search ? 'Clear' : 'Filter'}
              </button>
            </div>
          )}          {/* Data Table — hidden when payroll-specific empty state is shown */}
          {!(moduleSlug === "payroll" && rows.length === 0 && !isLoadingData) && (
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
                              <CellRenderer col={col} value={row[col.key]} row={row} />
                            </td>
                          ))}
                          <td className="px-4 py-3.5">
                            {moduleSlug === "payroll" ? (
                              <div className="flex items-center gap-1">
                                {/* Quick edit — open inline calculator */}
                                <button onClick={() => setShowQuickEdit({ ...row })} className="w-7 h-7 rounded-lg hover:bg-amber-50 flex items-center justify-center text-slate-400 hover:text-amber-600 transition-colors" title="Quick Edit">
                                  <Pencil size={13} className="text-black" />
                                </button>
                                {/* Status action: Draft → Approve */}
                                {row.status === "Draft" && (
                                  <button
                                    onClick={() => handlePayrollStatusUpdate(row.prismaId || row.id, "APPROVED")}
                                    disabled={isUpdatingStatus === (row.prismaId || row.id)}
                                    className="w-7 h-7 rounded-lg hover:bg-emerald-50 flex items-center justify-center text-slate-400 hover:text-emerald-600 transition-colors"
                                    title="Approve"
                                  >
                                    <Check size={13} className="text-black" />
                                  </button>
                                )}
                                {/* Status action: Approved → Pay */}
                                {row.status === "Approved" && (
                                  <button
                                    onClick={() => handlePayrollStatusUpdate(row.prismaId || row.id, "PAID")}
                                    disabled={isUpdatingStatus === (row.prismaId || row.id)}
                                    className="w-7 h-7 rounded-lg hover:bg-green-50 flex items-center justify-center text-slate-400 hover:text-green-600 transition-colors"
                                    title="Mark Paid"
                                  >
                                    <CreditCard size={13} className="text-black" />
                                  </button>
                                )}
                                {/* Cancel any status */}
                                {row.status !== "Cancelled" && (
                                  <button
                                    onClick={() => handlePayrollStatusUpdate(row.prismaId || row.id, "CANCELLED")}
                                    disabled={isUpdatingStatus === (row.prismaId || row.id)}
                                    className="w-7 h-7 rounded-lg hover:bg-red-50 flex items-center justify-center text-slate-400 hover:text-red-500 transition-colors"
                                    title="Cancel"
                                  >
                                    <XCircle size={13} className="text-black" />
                                  </button>
                                )}
                                <button onClick={() => handleDelete(row.prismaId || row.id)} className="w-7 h-7 rounded-lg hover:bg-red-50 flex items-center justify-center text-slate-400 hover:text-red-500 transition-colors" title="Delete">
                                  <Trash2 size={13} className="text-black" />
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-center gap-1 flex-wrap">
                                {/* Status-based action buttons */}
                                {(() => {
                                  const statusVal = row.status || row.stage;
                                  if (statusVal) {
                                    const actions = STATUS_ACTIONS[statusVal] || [];
                                    return (
                                      <>
                                        {actions.map((act, ai) => (
                                          <button
                                            key={ai}
                                            onClick={() => handleStatusUpdate(row.prismaId || row.id, act.nextStatus)}
                                            disabled={isUpdatingStatus === (row.prismaId || row.id)}
                                            className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-medium text-slate-500 transition-colors ${act.color}`}
                                            title={act.label}
                                          >
                                            {act.icon} {act.label}
                                          </button>
                                        ))}
                                        {CANCELABLE_STATUSES.has(statusVal) && (
                                          <button
                                            onClick={() => handleStatusUpdate(row.prismaId || row.id, "Cancelled")}
                                            disabled={isUpdatingStatus === (row.prismaId || row.id)}
                                            className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-medium text-slate-500 hover:bg-red-50 hover:text-red-500 transition-colors"
                                            title="Cancel"
                                          >
                                            <XCircle size={11} className="text-current" /> Cancel
                                          </button>
                                        )}
                                      </>
                                    );
                                  }
                                  return null;
                                })()}
                                <button onClick={() => handleOpenModal("view", row)} className="w-7 h-7 rounded-lg hover:bg-blue-50 flex items-center justify-center text-slate-400 hover:text-blue-600 transition-colors" title="View">
                                  <Eye size={13} className="text-black" />
                                </button>
                                <button onClick={() => handleOpenModal("edit", row)} className="w-7 h-7 rounded-lg hover:bg-amber-50 flex items-center justify-center text-slate-400 hover:text-amber-600 transition-colors" title="Edit">
                                  <Pencil size={13} className="text-black" />
                                </button>
                                <button onClick={() => handleDelete(row.prismaId || row.id)} className="w-7 h-7 rounded-lg hover:bg-red-50 flex items-center justify-center text-slate-400 hover:text-red-500 transition-colors" title="Delete">
                                  <Trash2 size={13} className="text-black" />
                                </button>
                              </div>
                            )}
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
          )}

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
                  <BrainCircuit size={13} className="text-black" />
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
                <X size={18} className="text-black" />
              </button>
            </div>
            <div className="p-4 overflow-y-auto flex-1 space-y-4">
              {moduleConfig.columns.map((col, i) => {
                const isIdField = ["id", "sku"].includes(col.key.toLowerCase()) || 
                                  col.key.toLowerCase().endsWith("no") || 
                                  col.key.toLowerCase().endsWith("code") || 
                                  col.label.toLowerCase().includes(" id") || 
                                  col.label.toLowerCase().includes(" no");
                const isPhoneField = col.key.toLowerCase().includes("phone") || col.label.toLowerCase().includes("phone");
                const isEmployeeField = col.type === "avatar" && (col.key.toLowerCase() === "employee" || col.label.toLowerCase() === "employee");
                const isProductField = pillarSlug === "inventory-warehouse" &&
                  col.key.toLowerCase() === "product";
                const isWarehouseField = pillarSlug === "inventory-warehouse" &&
                  col.key.toLowerCase() === "warehouse";
                const isViewOnly = modalMode === "view" || isIdField;
                const isDateField = col.type === "date";
                // Format ISO date string to YYYY-MM-DD for <input type="date">
                const dateValue = isDateField && formData[col.key]
                  ? formData[col.key].split('T')[0] || formData[col.key]
                  : formData[col.key] || "";
                return (
                  <div key={i} className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-slate-700">{col.label}</label>
                    {isProductField ? (
                      <ProductAutocomplete
                        value={formData[col.key] || ""}
                        onChange={(name, productId, productSku) => {
                          setFormData((prev: any) => ({
                            ...prev,
                            [col.key]: name,
                            ...(productId ? { productId } : {}),
                            ...(productSku ? { sku: productSku } : {}),
                          }));
                        }}
                        disabled={isViewOnly}
                      />
                    ) : isWarehouseField ? (
                      <WarehouseAutocomplete
                        value={formData[col.key] || ""}
                        onChange={(name, warehouseId) => {
                          setFormData((prev: any) => ({
                            ...prev,
                            [col.key]: name,
                            ...(warehouseId ? { warehouseId } : {}),
                          }));
                        }}
                        disabled={isViewOnly}
                      />
                    ) : isEmployeeField ? (
                      <EmployeeAutocomplete
                        value={formData[col.key] || ""}
                        onChange={(name, employeeId) => {
                          setFormData((prev: any) => ({
                            ...prev,
                            [col.key]: name,
                            ...(employeeId ? { employeeId } : {}),
                          }));
                        }}
                        disabled={isViewOnly}
                      />
                    ) : col.type === "select" && col.options ? (
                      <>
                        {col.options.length > 8 ? (
                          <SearchableSelect
                            value={formData[col.key] || ""}
                            onChange={(val) => setFormData({ ...formData, [col.key]: val })}
                            options={col.options}
                            placeholder={`Select ${col.label}...`}
                            disabled={isViewOnly}
                          />
                        ) : (
                          <div className="flex flex-col gap-1.5">
                            <select
                              value={col.options.includes(formData[col.key]) ? formData[col.key] : ""}
                              onChange={e => {
                                setFormData({ ...formData, [col.key]: e.target.value });
                              }}
                              disabled={isViewOnly}
                              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-slate-900 bg-white text-slate-900 disabled:bg-slate-50 disabled:text-slate-500 appearance-none cursor-pointer bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2216%22%20height%3D%2216%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%2394a3b8%22%20stroke-width%3D%222%22%3E%3Cpath%20d%3D%22M6%209l6%206%206-6%22%2F%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[right_8px_center] pr-8"
                            >
                              <option value="">Select {col.label}...</option>
                              {col.options.map(opt => (
                                <option key={opt} value={opt}>{opt}</option>
                              ))}
                              <option value="__other__">Other (Please specify)</option>
                            </select>
                            {(formData[col.key] === "__other__" || (formData[col.key] && !col.options.includes(formData[col.key]))) && (
                              <input
                                type="text"
                                value={formData[col.key] === "__other__" ? "" : formData[col.key]}
                                onChange={e => setFormData({ ...formData, [col.key]: e.target.value })}
                                disabled={isViewOnly}
                                placeholder="Please specify..."
                                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-slate-900 bg-white text-slate-900 disabled:bg-slate-50 disabled:text-slate-500"
                                autoFocus
                              />
                            )}
                          </div>
                        )}
                        {/* If the user selected "Other" from the options (literal word) or typed a custom value not in the options, show a text input to specify */}
                        {/* Note: exclude "__other__" here because it's handled by the native select's own sentinel handler above */}
                        {(formData[col.key] === "Other" || (formData[col.key] && formData[col.key] !== "__other__" && !col.options.includes(formData[col.key]))) && (
                          <div className="mt-1.5">
                            <label className="text-[11px] font-medium text-slate-500 mb-1 block">
                              Please specify your custom {col.label.toLowerCase()}:
                            </label>
                            <input
                              type="text"
                              value={formData[col.key] === "Other" ? "" : formData[col.key]}
                              onChange={e => {
                                const val = e.target.value;
                                setFormData({ ...formData, [col.key]: val });
                              }}
                              disabled={isViewOnly}
                              placeholder={`Type custom ${col.label.toLowerCase()}...`}
                              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-slate-900 bg-white text-slate-900 disabled:bg-slate-50 disabled:text-slate-500"
                              autoFocus
                            />
                          </div>
                        )}
                      </>
                    ) : isPhoneField ? (
                      <div className={isViewOnly ? "pointer-events-none opacity-60" : ""}>
                        <PhoneInput
                          country="et"
                          value={formData[col.key] || ""}
                          onChange={val => setFormData({ ...formData, [col.key]: val })}
                          disabled={isViewOnly}
                          inputStyle={{
                            width: "100%",
                            height: "40px",
                            border: "1px solid #e2e8f0",
                            borderRadius: "0.5rem",
                            fontSize: "14px",
                            fontFamily: "inherit",
                            background: isViewOnly ? "#f8fafc" : "white",
                            color: isViewOnly ? "#64748b" : "#0f172a",
                          }}
                          buttonStyle={{
                            border: "1px solid #e2e8f0",
                            borderRight: "none",
                            borderRadius: "0.5rem 0 0 0.5rem",
                            background: "#f8fafc",
                          }}
                          dropdownStyle={{
                            borderRadius: "0.5rem",
                            border: "1px solid #e2e8f0",
                            boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
                          }}
                          containerStyle={{ width: "100%" }}
                          enableSearch
                          searchStyle={{
                            border: "1px solid #e2e8f0",
                            borderRadius: "0.375rem",
                            padding: "6px 10px",
                            fontSize: "13px",
                            outline: "none",
                          }}
                        />
                      </div>
                    ) : col.key === "days" && moduleSlug === "leave-management" ? (
                      <div>
                        <input
                          type="number"
                          value={formData[col.key] || ""}
                          onChange={e => setFormData({ ...formData, [col.key]: parseInt(e.target.value) || 0 })}
                          disabled={isViewOnly}
                          className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-slate-900 bg-white text-slate-900 disabled:bg-slate-50 disabled:text-slate-500"
                        />
                        {remainingDays !== null && (
                          <div className={`mt-1.5 text-xs font-medium flex items-center gap-1 ${
                            remainingDays < 0 ? 'text-red-600' : 'text-green-700'
                          }`}>
                            <span className={`inline-block w-1.5 h-1.5 rounded-full ${
                              remainingDays < 0 ? 'bg-red-500' : 'bg-green-500'
                            }`}></span>
                            {remainingDays >= 0
                              ? `${remainingDays} day${remainingDays !== 1 ? 's' : ''} remaining`
                              : `Exceeded by ${Math.abs(remainingDays)} day${Math.abs(remainingDays) !== 1 ? 's' : ''}`}
                          </div>
                        )}
                        {!formData.employeeId && (
                          <div className="mt-1.5 text-xs text-slate-400">Select an employee to see remaining balance</div>
                        )}
                      </div>
                    ) : (
                      <input
                        type={isDateField ? "date" : col.type === "number" || col.type === "currency" ? "number" : "text"}
                        value={dateValue}
                        onChange={e => setFormData({ ...formData, [col.key]: col.type === "number" || col.type === "currency" ? parseFloat(e.target.value) || 0 : e.target.value })}
                        disabled={isViewOnly}
                        placeholder={isIdField ? "Auto-generated by system" : ""}
                        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-slate-900 bg-white text-slate-900 disabled:bg-slate-50 disabled:text-slate-500"
                      />
                    )}
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

      {/* Payroll Settings Modal */}
      {showPayrollSettings && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-xl">
            <div className="flex justify-between items-center p-4 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-900">Payroll Settings</h2>
              <button onClick={() => setShowPayrollSettings(false)} className="text-slate-400 hover:text-slate-600">
                <X size={18} />
              </button>
            </div>
            <div className="p-4 space-y-1">
              <p className="text-xs text-slate-500 mb-3">
                Toggle which modules influence payroll calculations. Changes apply to future payroll generations.
              </p>
              {[
                { key: 'useWorkDayBasedPay', label: 'Work-Day Based Pay', desc: 'Calculate pay based on days actually worked (from attendance) instead of monthly salary minus deductions' },
                { key: 'includeAttendanceOvertime', label: 'Attendance Overtime', desc: 'Include overtime hours at 1.5x hourly rate' },
                { key: 'includeAbsenceDeductions', label: 'Absence Deductions', desc: 'Deduct full daily rate for absent & half-days' },
                { key: 'includeLatePenalties', label: 'Late Penalties', desc: 'Deduct 25% of daily rate per late arrival' },
                { key: 'includeUnpaidLeaveDeductions', label: 'Unpaid Leave Deductions', desc: 'Deduct full daily rate for unpaid leave days' },
                { key: 'includeBonuses', label: 'Bonuses', desc: 'Include employee bonuses in gross pay' },
                { key: 'autoCalculateTax', label: 'Auto-Calculate Tax', desc: 'Apply Ethiopian progressive income tax' },
                { key: 'includePension', label: 'Pension (7%)', desc: 'Deduct 7% employee pension contribution' },
              ].map(({ key, label, desc }) => (
                <div
                  key={key}
                  className="flex items-center justify-between py-2.5 px-3 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors"
                  onClick={() => setPayrollSettings((prev: any) => ({ ...prev, [key]: !prev[key] }))}
                >
                  <div className="flex-1">
                    <div className="text-sm font-semibold text-slate-800">{label}</div>
                    <div className="text-[11px] text-slate-400">{desc}</div>
                  </div>
                  <div className={`w-10 h-6 rounded-full flex items-center px-0.5 transition-colors ${
                    payrollSettings[key] ? 'bg-emerald-500 justify-end' : 'bg-slate-300 justify-start'
                  }`}>
                    <div className={`w-5 h-5 rounded-full bg-white shadow-sm transition-transform`} />
                  </div>
                </div>
              ))}
              <div className="mt-4 pt-3 border-t border-slate-100">
                <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                  <span>Currently active modules:</span>
                  <span className="font-semibold text-slate-700">
                    {Object.entries(payrollSettings).filter(([, v]) => v).length} / 7
                  </span>
                </div>
              </div>
            </div>
            <div className="p-4 border-t border-slate-100 flex justify-end gap-2 bg-slate-50 rounded-b-2xl">
              <button
                onClick={() => setShowPayrollSettings(false)}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSavePayrollSettings}
                disabled={isSavingSettings}
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-sm font-bold transition-all disabled:opacity-50"
              >
                {isSavingSettings ? 'Saving...' : 'Save Settings'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payroll Quick-Edit Modal */}
      {showQuickEdit && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-xl">
            <div className="flex justify-between items-center p-4 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-900">
                Quick Edit — {showQuickEdit.employee}
              </h2>
              <button onClick={() => setShowQuickEdit(null)} className="text-slate-400 hover:text-slate-600">
                <X size={18} />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Basic Salary (ETB)</label>
                  <input
                    type="number"
                    value={showQuickEdit.basic}
                    onChange={e => setShowQuickEdit((prev: any) => ({ ...prev, basic: parseFloat(e.target.value) || 0 }))}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-slate-900"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Allowance (ETB)</label>
                  <input
                    type="number"
                    value={showQuickEdit.allowance}
                    onChange={e => setShowQuickEdit((prev: any) => ({ ...prev, allowance: parseFloat(e.target.value) || 0 }))}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-slate-900"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Deduction (ETB)</label>
                  <input
                    type="number"
                    value={showQuickEdit.deduction}
                    onChange={e => setShowQuickEdit((prev: any) => ({ ...prev, deduction: parseFloat(e.target.value) || 0 }))}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-slate-900"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Tax (ETB)</label>
                  <input
                    type="number"
                    value={showQuickEdit.tax}
                    onChange={e => setShowQuickEdit((prev: any) => ({ ...prev, tax: parseFloat(e.target.value) || 0 }))}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-slate-900"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Net Pay (ETB)</label>
                <input
                  type="number"
                  value={showQuickEdit.net}
                  onChange={e => setShowQuickEdit((prev: any) => ({ ...prev, net: parseFloat(e.target.value) || 0 }))}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-slate-900 font-bold"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Status</label>
                <select
                  value={showQuickEdit.status}
                  onChange={e => setShowQuickEdit((prev: any) => ({ ...prev, status: e.target.value }))}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-slate-900"
                >
                  <option value="DRAFT">Draft</option>
                  <option value="APPROVED">Approved</option>
                  <option value="PAID">Paid</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
              </div>
              <div className="text-xs text-slate-400 bg-slate-50 rounded-lg p-3">
                ✏️ Edit the fields above and click Save. The notes breakdown will be preserved.
              </div>
            </div>
            <div className="p-4 border-t border-slate-100 flex justify-end gap-2 bg-slate-50 rounded-b-2xl">
              <button onClick={() => setShowQuickEdit(null)} className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
                Cancel
              </button>
              <button onClick={handleQuickEditSave} disabled={isSaving} className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-sm font-bold transition-all disabled:opacity-50">
                {isSaving ? "Saving..." : "Save Changes"}
              </button>
            </div>
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
    </div>
  );
}

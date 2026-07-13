"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FolderKanban, ListTodo, LayoutDashboard, GanttChartSquare,
  GitBranch, CalendarRange, Users, Clock, BarChart3,
  Search, Plus, Download, Eye, Pencil, Trash2, X,
  CheckCircle, AlertTriangle, Clock as ClockIcon, Target,
  TrendingUp, DollarSign, UserCheck, Briefcase, Zap,
  Filter, RefreshCw, ArrowUp, ArrowDown, Minus,
} from "lucide-react";
import { useToast } from "@/components/ui/Toast";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";

// ── TYPES ──────────────────────────────────────────────────
type TabId = "projects" | "tasks" | "kanban" | "gantt" | "scrum" | "sprint" | "resources" | "time" | "analytics";

interface TabDef {
  id: TabId;
  label: string;
  icon: React.ElementType;
  color: string;
  apiSlug: string;
}

const TABS: TabDef[] = [
  { id: "projects",  label: "Projects",         icon: FolderKanban,    color: "text-indigo-600 bg-indigo-50",  apiSlug: "projects" },
  { id: "tasks",     label: "Tasks",            icon: ListTodo,        color: "text-blue-600 bg-blue-50",      apiSlug: "tasks" },
  { id: "kanban",    label: "Kanban Board",     icon: LayoutDashboard, color: "text-emerald-600 bg-emerald-50",apiSlug: "kanban-boards" },
  { id: "gantt",     label: "Gantt Charts",     icon: GanttChartSquare,color: "text-violet-600 bg-violet-50",  apiSlug: "gantt-charts" },
  { id: "scrum",     label: "Scrum",            icon: GitBranch,       color: "text-amber-600 bg-amber-50",    apiSlug: "scrum" },
  { id: "sprint",    label: "Sprint Planning",  icon: CalendarRange,   color: "text-orange-600 bg-orange-50",  apiSlug: "sprint-planning" },
  { id: "resources", label: "Resources",        icon: Users,           color: "text-cyan-600 bg-cyan-50",      apiSlug: "resource-allocation" },
  { id: "time",      label: "Time Tracking",    icon: Clock,           color: "text-rose-600 bg-rose-50",      apiSlug: "time-tracking" },
  { id: "analytics", label: "Analytics",        icon: BarChart3,       color: "text-purple-600 bg-purple-50",  apiSlug: "project-analytics" },
];

// ── FIELD DEFINITIONS for dedicated modals ───────────────────
interface FieldDef {
  key: string;
  label: string;
  type: "text" | "number" | "date" | "select" | "textarea";
  options?: string[];
  required?: boolean;
}

const TAB_FIELDS: Record<TabId, FieldDef[]> = {
  projects: [
    { key: "name", label: "Project Name", type: "text", required: true },
    { key: "description", label: "Description", type: "textarea" },
    { key: "budget", label: "Budget (ETB)", type: "number" },
    { key: "startDate", label: "Start Date", type: "date" },
    { key: "endDate", label: "Deadline", type: "date" },
    { key: "status", label: "Status", type: "select", options: ["PLANNING", "IN_PROGRESS", "ON_HOLD", "COMPLETED", "CANCELLED"] },
  ],
  tasks: [
    { key: "title", label: "Task Title", type: "text", required: true },
    { key: "description", label: "Description", type: "textarea" },
    { key: "assignee", label: "Assignee", type: "text" },
    { key: "priority", label: "Priority", type: "select", options: ["LOW", "MEDIUM", "HIGH", "URGENT"] },
    { key: "dueDate", label: "Due Date", type: "date" },
    { key: "points", label: "Story Points", type: "number" },
    { key: "status", label: "Status", type: "select", options: ["TODO", "IN_PROGRESS", "REVIEW", "DONE"] },
  ],
  kanban: [
    { key: "title", label: "Task Title", type: "text", required: true },
    { key: "assignee", label: "Assignee", type: "text" },
    { key: "priority", label: "Priority", type: "select", options: ["LOW", "MEDIUM", "HIGH", "URGENT"] },
    { key: "dueDate", label: "Due Date", type: "date" },
    { key: "points", label: "Story Points", type: "number" },
    { key: "status", label: "Status", type: "select", options: ["TODO", "IN_PROGRESS", "REVIEW", "DONE", "BLOCKED"] },
  ],
  gantt: [
    { key: "title", label: "Task Title", type: "text", required: true },
    { key: "assignee", label: "Assignee", type: "text" },
    { key: "start", label: "Start Date", type: "date" },
    { key: "end", label: "End Date", type: "date" },
    { key: "pct", label: "Completion %", type: "number" },
    { key: "status", label: "Status", type: "select", options: ["TODO", "IN_PROGRESS", "REVIEW", "DONE"] },
  ],
  scrum: [
    { key: "name", label: "Sprint Name", type: "text", required: true },
    { key: "goal", label: "Sprint Goal", type: "textarea" },
    { key: "startDate", label: "Start Date", type: "date" },
    { key: "endDate", label: "End Date", type: "date" },
    { key: "totalPoints", label: "Total Points", type: "number" },
    { key: "donePoints", label: "Completed Points", type: "number" },
    { key: "status", label: "Status", type: "select", options: ["PLANNING", "ACTIVE", "COMPLETED"] },
  ],
  sprint: [
    { key: "name", label: "Sprint Name", type: "text", required: true },
    { key: "goal", label: "Sprint Goal", type: "textarea" },
    { key: "startDate", label: "Start Date", type: "date" },
    { key: "endDate", label: "End Date", type: "date" },
    { key: "totalPoints", label: "Total Points", type: "number" },
    { key: "donePoints", label: "Completed Points", type: "number" },
    { key: "status", label: "Status", type: "select", options: ["PLANNING", "ACTIVE", "COMPLETED"] },
  ],
  resources: [
    { key: "personName", label: "Person Name", type: "text", required: true },
    { key: "role", label: "Role", type: "text" },
    { key: "allocation", label: "Allocation %", type: "number" },
    { key: "rate", label: "Rate (ETB/hr)", type: "number" },
    { key: "status", label: "Status", type: "select", options: ["Active", "Completed"] },
  ],
  time: [
    { key: "personName", label: "Person Name", type: "text", required: true },
    { key: "date", label: "Date", type: "date" },
    { key: "hours", label: "Hours Worked", type: "number" },
    { key: "billable", label: "Billable Hours", type: "number" },
    { key: "description", label: "Description", type: "textarea" },
    { key: "status", label: "Status", type: "select", options: ["Draft", "Submitted", "Approved"] },
  ],
  analytics: [],
};

// ── HELPERS ─────────────────────────────────────────────────
function Avatar({ name, size = "sm" }: { name: string; size?: "sm" | "md" }) {
  const dims = size === "md" ? "w-8 h-8 text-xs" : "w-6 h-6 text-[9px]";
  const initials = name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();
  return (
    <div className={`${dims} rounded-full bg-gradient-to-br from-slate-800 to-slate-600 flex items-center justify-center font-bold text-white shrink-0`}>
      {initials}
    </div>
  );
}

function Badge({ value }: { value: string }) {
  const defaults: Record<string, string> = {
    "On Track": "bg-emerald-50 text-emerald-700", "At Risk": "bg-amber-50 text-amber-700",
    "Delayed": "bg-red-50 text-red-700", "Completed": "bg-emerald-50 text-emerald-700",
    "Cancelled": "bg-slate-100 text-slate-500", "On Hold": "bg-slate-100 text-slate-600",
    "Todo": "bg-slate-100 text-slate-600", "In Progress": "bg-blue-50 text-blue-700",
    "In Review": "bg-amber-50 text-amber-700", "Done": "bg-emerald-50 text-emerald-700",
    "Blocked": "bg-red-50 text-red-700", "Active": "bg-blue-50 text-blue-700",
    "Planning": "bg-amber-50 text-amber-700", "Urgent": "bg-red-50 text-red-700",
    "High": "bg-orange-50 text-orange-700", "Medium": "bg-blue-50 text-blue-700",
    "Low": "bg-slate-50 text-slate-600", "Critical": "bg-red-50 text-red-700",
    "Approved": "bg-emerald-50 text-emerald-700", "Submitted": "bg-blue-50 text-blue-700",
    "Draft": "bg-slate-100 text-slate-600", "Up": "bg-emerald-50 text-emerald-700",
    "Down": "bg-red-50 text-red-700", "Stable": "bg-slate-100 text-slate-600",
    "PLANNING": "bg-amber-100 text-amber-700", "ACTIVE": "bg-blue-100 text-blue-700",
    "COMPLETED": "bg-emerald-100 text-emerald-700",
  };
  const cls = defaults[value] || "bg-slate-100 text-slate-700";
  return <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ${cls}`}>{value}</span>;
}

function TrendIcon({ trend }: { trend: string }) {
  if (trend === "Up") return <ArrowUp size={12} className="text-emerald-500" />;
  if (trend === "Down") return <ArrowDown size={12} className="text-red-500" />;
  return <Minus size={12} className="text-slate-400" />;
}

function ProgressBar({ pct, size = "md" }: { pct: number; size?: "sm" | "md" | "lg" }) {
  const h = size === "lg" ? "h-3" : size === "sm" ? "h-1.5" : "h-2";
  const color = pct >= 100 ? "bg-emerald-500" : pct >= 70 ? "bg-blue-500" : pct >= 40 ? "bg-amber-500" : "bg-red-500";
  return (
    <div className={`w-full ${h} bg-slate-100 rounded-full overflow-hidden`}>
      <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min(100, Math.max(0, pct))}%` }} transition={{ duration: 0.6 }}
        className={`h-full rounded-full ${color}`} />
    </div>
  );
}

// ── COMPONENT ──────────────────────────────────────────────
interface ProjectManagementPageProps {
  pillarSlug: string;
  moduleSlug: string;
}

export default function ProjectManagementPage({ pillarSlug, moduleSlug }: ProjectManagementPageProps) {
  const slugToTab: Record<string, TabId> = {
    "projects": "projects", "tasks": "tasks", "kanban-boards": "kanban",
    "gantt-charts": "gantt", "scrum": "scrum", "sprint-planning": "sprint",
    "resource-allocation": "resources", "time-tracking": "time", "project-analytics": "analytics",
  };
  const [activeTab, setActiveTab] = useState<TabId>(slugToTab[moduleSlug] || "projects");
  const [search, setSearch] = useState("");
  const { toast } = useToast();
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  // Data state per module
  const [projectsData, setProjectsData] = useState<any[]>([]);
  const [tasksData, setTasksData] = useState<any[]>([]);
  const [kanbanData, setKanbanData] = useState<any[]>([]);
  const [ganttData, setGanttData] = useState<any[]>([]);
  const [scrumData, setScrumData] = useState<any[]>([]);
  const [sprintData, setSprintData] = useState<any[]>([]);
  const [resourcesData, setResourcesData] = useState<any[]>([]);
  const [timeData, setTimeData] = useState<any[]>([]);
  const [analyticsData, setAnalyticsData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // CRUD state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit" | "view">("create");
  const [activeRow, setActiveRow] = useState<any>(null);
  const [formData, setFormData] = useState<any>({});
  const [isSaving, setIsSaving] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // Client-side validation state
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // ── VALIDATION ────────────────────────────────────────────
  const validateForm = useCallback((fields: FieldDef[], data: any): Record<string, string> => {
    const errors: Record<string, string> = {};
    for (const field of fields) {
      if (field.required) {
        const val = data[field.key];
        if (val === undefined || val === null || val === "" || val === 0) {
          errors[field.key] = `${field.label} is required`;
        }
      }
    }
    return errors;
  }, []);

  const activeTabDef = TABS.find(t => t.id === activeTab)!;

  const getApiUrl = useCallback((tabSlug: string) => {
    return `http://localhost:3002/api/v1/modules/${pillarSlug}/${tabSlug}`;
  }, [pillarSlug]);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token") || "";
      const headers = { Authorization: `Bearer ${token}` };

      const [projectsRes, tasksRes, kanbanRes, ganttRes, scrumRes, sprintRes, resourcesRes, timeRes, analyticsRes] = await Promise.allSettled([
        fetch(getApiUrl("projects"), { headers }).then(r => r.json()),
        fetch(getApiUrl("tasks"), { headers }).then(r => r.json()),
        fetch(getApiUrl("kanban-boards"), { headers }).then(r => r.json()),
        fetch(getApiUrl("gantt-charts"), { headers }).then(r => r.json()),
        fetch(getApiUrl("scrum"), { headers }).then(r => r.json()),
        fetch(getApiUrl("sprint-planning"), { headers }).then(r => r.json()),
        fetch(getApiUrl("resource-allocation"), { headers }).then(r => r.json()),
        fetch(getApiUrl("time-tracking"), { headers }).then(r => r.json()),
        fetch(getApiUrl("project-analytics"), { headers }).then(r => r.json()),
      ]);

      const extract = (res: PromiseSettledResult<any>) => res.status === "fulfilled" && res.value?.data ? res.value.data : [];

      setProjectsData(extract(projectsRes));
      setTasksData(extract(tasksRes));
      setKanbanData(extract(kanbanRes));
      setGanttData(extract(ganttRes));
      setScrumData(extract(scrumRes));
      setSprintData(extract(sprintRes));
      setResourcesData(extract(resourcesRes));
      setTimeData(extract(timeRes));
      setAnalyticsData(extract(analyticsRes));
    } catch (err) {
      console.error("Error loading project data:", err);
    } finally {
      setIsLoading(false);
    }
  }, [getApiUrl]);

  useEffect(() => { loadData(); }, [loadData]);

  // ── KPI COMPUTATIONS ───────────────────────────────────
  const kpis = useMemo(() => {
    const active = projectsData.filter((p: any) => p.status !== "Completed" && p.status !== "Cancelled");
    const totalBudget = projectsData.reduce((s: number, p: any) => s + (p.budget || 0), 0);
    const totalSpent = projectsData.reduce((s: number, p: any) => s + (p.spent || 0), 0);
    const totalTasks = tasksData.length;
    const doneTasks = tasksData.filter((t: any) => t.status === "Done").length;
    const totalHours = timeData.reduce((s: number, t: any) => s + (t.hours || t.hoursWorked || 0), 0);
    const totalBillable = timeData.reduce((s: number, t: any) => s + (t.billable || 0), 0);
    return { activeCount: active.length, totalBudget, totalSpent, totalTasks, doneTasks, totalHours, totalBillable };
  }, [projectsData, tasksData, timeData]);

  // ── SEARCH FILTER for current tab ──────────────────────
  const deepSearch = (obj: any, term: string): boolean => {
    const lower = term.toLowerCase();
    if (obj === null || obj === undefined) return false;
    if (typeof obj === 'string') return obj.toLowerCase().includes(lower);
    if (typeof obj === 'number' || typeof obj === 'boolean') return String(obj).toLowerCase().includes(lower);
    if (Array.isArray(obj)) return obj.some(item => deepSearch(item, term));
    if (typeof obj === 'object') return Object.values(obj).some(v => deepSearch(v, term));
    return false;
  };

  const filteredProjects = projectsData.filter((p: any) => deepSearch(p, search));
  const filteredTasks = tasksData.filter((t: any) => deepSearch(t, search));
  const filteredResources = resourcesData.filter((r: any) => deepSearch(r, search));
  const filteredTime = timeData.filter((t: any) => deepSearch(t, search));

  // ── KANBAN ─────────────────────────────────────────────
  const KANBAN_STATUSES = ["Todo", "In Progress", "In Review", "Done", "Blocked"];
  const kanbanTasks = useMemo(() => {
    const cols: Record<string, any[]> = {};
    for (const status of KANBAN_STATUSES) {
      cols[status] = kanbanData.filter((t: any) => t.status === status);
    }
    return cols;
  }, [kanbanData]);

  // ── GANTT ──────────────────────────────────────────────
  const ganttMinDate = useMemo(() => {
    if (ganttData.length === 0) return Date.now();
    return Math.min(...ganttData.map((t: any) => new Date(t.start || t.createdAt || Date.now()).getTime()));
  }, [ganttData]);
  const ganttMaxDate = useMemo(() => {
    if (ganttData.length === 0) return Date.now() + 86400000 * 30;
    return Math.max(...ganttData.map((t: any) => new Date(t.end || t.due || Date.now() + 86400000).getTime()));
  }, [ganttData]);
  const ganttDays = useMemo(() => Math.max(1, Math.ceil((ganttMaxDate - ganttMinDate) / (1000 * 60 * 60 * 24))), [ganttMinDate, ganttMaxDate]);
  const dayWidth = 12;

  const ganttDates = useMemo(() => {
    const dates: Date[] = [];
    for (let i = 0; i <= ganttDays; i++) {
      dates.push(new Date(ganttMinDate + i * 86400000));
    }
    return dates;
  }, [ganttMinDate, ganttDays]);

  const ganttBar = (start: string, end: string) => {
    const s = new Date(start || ganttMinDate).getTime();
    const e = new Date(end || start || Date.now()).getTime();
    const left = ((s - ganttMinDate) / (1000 * 60 * 60 * 24)) * dayWidth;
    const width = Math.max(dayWidth, ((e - s) / (1000 * 60 * 60 * 24) + 1) * dayWidth);
    return { left, width };
  };

  // ── CRUD OPERATIONS ───────────────────────────────────
  const handleOpenModal = (mode: "create" | "edit" | "view", row: any = null) => {
    setModalMode(mode);
    setActiveRow(row);
    setFormErrors({});
    if (mode === "create") {
      const fields = TAB_FIELDS[activeTab] || [];
      const initial: any = {};
      fields.forEach(f => {
        initial[f.key] = f.type === "number" ? 0 : "";
      });
      // Set sensible defaults
      if (activeTab === "projects") initial.status = "PLANNING";
      if (activeTab === "tasks" || activeTab === "kanban") initial.status = "TODO";
      if (activeTab === "gantt") initial.status = "TODO";
      if (activeTab === "scrum" || activeTab === "sprint") initial.status = "PLANNING";
      if (activeTab === "resources") initial.status = "Active";
      if (activeTab === "time") { initial.status = "Draft"; initial.date = new Date().toISOString().split("T")[0]; }
      setFormData(initial);
    } else {
      setFormData(row || {});
    }
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    // Client-side validation
    const fields = TAB_FIELDS[activeTab] || [];
    const errors = validateForm(fields, formData);
    setFormErrors(errors);
    if (Object.keys(errors).length > 0) {
      toast("Please fix the highlighted errors before saving", "error");
      return;
    }
    setIsSaving(true);
    try {
      const token = localStorage.getItem("token") || "";
      const apiSlug = activeTabDef.apiSlug;
      const url = modalMode === "edit" ? `${getApiUrl(apiSlug)}/${activeRow?.id}` : getApiUrl(apiSlug);
      const method = modalMode === "edit" ? "PUT" : "POST";
      const { id, createdAt, updatedAt, prismaId, ...cleanData } = formData;
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

  const confirmDeleteAction = async () => {
    if (!confirmDeleteId) return;
    try {
      const token = localStorage.getItem("token") || "";
      const apiSlug = activeTabDef.apiSlug;
      const res = await fetch(`${getApiUrl(apiSlug)}/${confirmDeleteId}`, {
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

  // ── DEDICATED MODAL FORM RENDERER ──────────────────────
  const renderModalFormFields = () => {
    const fields = TAB_FIELDS[activeTab] || [];
    const isViewOnly = modalMode === "view";

    if (fields.length === 0) {
      return <p className="text-sm text-slate-400 text-center py-8">This module has no editable fields.</p>;
    }

    return fields.map((field) => {
      const val = formData[field.key] !== undefined ? formData[field.key] : "";
      const error = formErrors[field.key];
      const hasError = !!error;

      const updateField = (newVal: any) => {
        setFormData({ ...formData, [field.key]: newVal });
        // Clear error for this field on change
        if (hasError) {
          const next = { ...formErrors };
          delete next[field.key];
          setFormErrors(next);
        }
      };

      const baseInputClass = `w-full rounded-lg px-3 py-2 text-sm focus:outline-none bg-white disabled:bg-slate-50 disabled:text-slate-500 transition-colors ${
        hasError
          ? "border-red-300 focus:border-red-500 focus:ring-1 focus:ring-red-500"
          : "border border-slate-200 focus:border-slate-900"
      }`;

      if (field.type === "select" && field.options) {
        return (
          <div key={field.key} className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-slate-700">
              {field.label} {field.required && <span className="text-red-400">*</span>}
            </label>
            <select
              value={String(val)}
              onChange={e => updateField(e.target.value)}
              disabled={isViewOnly}
              className={baseInputClass}
            >
              <option value="">Select {field.label}...</option>
              {field.options.map(opt => (
                <option key={opt} value={opt}>{opt.replace(/_/g, " ")}</option>
              ))}
            </select>
            {hasError && <p className="text-[11px] text-red-500 mt-0.5">{error}</p>}
          </div>
        );
      }

      if (field.type === "textarea") {
        return (
          <div key={field.key} className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-slate-700">
              {field.label} {field.required && <span className="text-red-400">*</span>}
            </label>
            <textarea
              value={String(val)}
              onChange={e => updateField(e.target.value)}
              disabled={isViewOnly}
              rows={3}
              className={`${baseInputClass} resize-none`}
            />
            {hasError && <p className="text-[11px] text-red-500 mt-0.5">{error}</p>}
          </div>
        );
      }

      return (
        <div key={field.key} className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-slate-700">
            {field.label} {field.required && <span className="text-red-400">*</span>}
          </label>
          <input
            type={field.type === "date" ? "date" : field.type === "number" ? "number" : "text"}
            value={String(val)}
            onChange={e => updateField(field.type === "number" ? parseFloat(e.target.value) || 0 : e.target.value)}
            disabled={isViewOnly}
            min={field.type === "number" ? "0" : undefined}
            className={baseInputClass}
          />
          {hasError && <p className="text-[11px] text-red-500 mt-0.5">{error}</p>}
        </div>
      );
    });
  };

  const Icon = activeTabDef.icon;

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-20">
      {/* ── HEADER ─────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl ${activeTabDef.color} flex items-center justify-center`}>
            <Icon size={20} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{activeTabDef.label}</h1>
            <p className="text-sm text-slate-400">Project Management · {TABS.length} modules integrated</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => { loadData(); toast("Data refreshed from API", "success"); }}
            className="flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors">
            <RefreshCw size={13} /> Refresh
          </button>
          {activeTab !== "analytics" && (
            <button onClick={() => handleOpenModal("create")}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary hover:bg-primary/90 text-black text-xs font-bold transition-all">
              <Plus size={13} /> New{activeTab === "projects" ? " Project" : activeTab === "tasks" ? " Task" : activeTab === "scrum" || activeTab === "sprint" ? " Sprint" : activeTab === "resources" ? " Resource" : activeTab === "time" ? " Entry" : ""}
            </button>
          )}
        </div>
      </div>

      {/* ── KPI STRIP ──────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        <div className="bg-white border border-slate-100 rounded-xl px-4 py-3 shadow-sm">
          <div className="flex items-center gap-2 text-slate-400 text-[11px] font-medium mb-1">
            <FolderKanban size={12} /> Active Projects
          </div>
          <div className="text-lg font-bold text-slate-900">{kpis.activeCount}</div>
        </div>
        <div className="bg-white border border-slate-100 rounded-xl px-4 py-3 shadow-sm">
          <div className="flex items-center gap-2 text-slate-400 text-[11px] font-medium mb-1">
            <DollarSign size={12} /> Total Budget
          </div>
          <div className="text-lg font-bold text-slate-900">{kpis.totalBudget.toLocaleString()}</div>
        </div>
        <div className="bg-white border border-slate-100 rounded-xl px-4 py-3 shadow-sm">
          <div className="flex items-center gap-2 text-slate-400 text-[11px] font-medium mb-1">
            <TrendingUp size={12} /> Spent
          </div>
          <div className="text-lg font-bold text-amber-600">{kpis.totalSpent.toLocaleString()}</div>
        </div>
        <div className="bg-white border border-slate-100 rounded-xl px-4 py-3 shadow-sm">
          <div className="flex items-center gap-2 text-slate-400 text-[11px] font-medium mb-1">
            <ListTodo size={12} /> Tasks
          </div>
          <div className="text-lg font-bold text-slate-900">{kpis.totalTasks}</div>
          <div className="text-[10px] text-slate-400">{kpis.doneTasks} done</div>
        </div>
        <div className="bg-white border border-slate-100 rounded-xl px-4 py-3 shadow-sm">
          <div className="flex items-center gap-2 text-slate-400 text-[11px] font-medium mb-1">
            <CheckCircle size={12} /> Completion
          </div>
          <div className="text-lg font-bold text-emerald-600">{kpis.totalTasks > 0 ? Math.round(kpis.doneTasks / kpis.totalTasks * 100) : 0}%</div>
        </div>
        <div className="bg-white border border-slate-100 rounded-xl px-4 py-3 shadow-sm">
          <div className="flex items-center gap-2 text-slate-400 text-[11px] font-medium mb-1">
            <ClockIcon size={12} /> Hours Logged
          </div>
          <div className="text-lg font-bold text-slate-900">{kpis.totalHours}</div>
        </div>
        <div className="bg-white border border-slate-100 rounded-xl px-4 py-3 shadow-sm">
          <div className="flex items-center gap-2 text-slate-400 text-[11px] font-medium mb-1">
            <DollarSign size={12} /> Billable
          </div>
          <div className="text-lg font-bold text-emerald-600">{kpis.totalBillable}</div>
        </div>
      </div>

      {/* ── TAB NAVIGATION ─────────────────────────────── */}
      <div className="flex gap-1.5 overflow-x-auto pb-2 -mx-1 px-1">
        {TABS.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-[10px] text-xs font-medium transition-all ${
              activeTab === tab.id
                ? "bg-slate-900 text-white shadow-sm"
                : "bg-white border border-slate-100 text-slate-600 hover:bg-slate-50"
            }`}>
            <tab.icon size={12} /> {tab.label}
          </button>
        ))}
      </div>

      {/* ── SEARCH BAR ─────────────────────────────────── */}
      {activeTab !== "analytics" && (
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-black" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder={`Search ${activeTabDef.label.toLowerCase()}...`}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent placeholder:text-slate-400"
            />
          </div>
          <button onClick={() => { setSearch(''); search && toast('Search cleared', 'info'); }}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-colors ${
              search ? 'bg-slate-900 text-white border-slate-900' : 'border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}>
            <Filter size={14} /> {search ? 'Clear' : 'Filter'}
          </button>
        </div>
      )}

      {/* ── LOADING ────────────────────────────────────── */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-3">
          <span className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></span>
          <span className="text-sm text-slate-400">Loading project data from database...</span>
        </div>
      ) : (
        <AnimatePresence mode="wait">
          <motion.div key={activeTab} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.2 }}>

            {/* ══════════ PROJECTS TAB ════════════════════ */}
            {activeTab === "projects" && (
              <div className="bg-slate-50 border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-100">
                        {["Project Name", "Manager", "Team", "Budget (ETB)", "Progress", "Deadline", "Status", "Actions"].map(h => (
                          <th key={h} className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filteredProjects.length === 0 ? (
                        <tr><td colSpan={8} className="text-center py-16 text-slate-400 text-sm font-light">No projects found</td></tr>
                      ) : (
                        filteredProjects.map((p: any, i: number) => (
                          <motion.tr key={p.id || i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                            className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                            <td className="px-4 py-3.5"><span className="text-sm font-semibold text-slate-800">{p.name || "Untitled"}</span></td>
                            <td className="px-4 py-3.5"><div className="flex items-center gap-2"><Avatar name={p.manager || "Unassigned"} /><span className="text-sm text-slate-700">{p.manager || "Unassigned"}</span></div></td>
                            <td className="px-4 py-3.5"><span className="text-sm font-mono">{p.team || p.tasksCount || 0}</span></td>
                            <td className="px-4 py-3.5"><span className="text-sm font-mono font-medium">{Number(p.budget || 0).toLocaleString()}</span></td>
                            <td className="px-4 py-3.5"><div className="flex items-center gap-2"><ProgressBar pct={p.progress || 0} size="sm" /><span className="text-xs font-mono font-bold w-8">{p.progress || 0}%</span></div></td>
                            <td className="px-4 py-3.5"><span className="text-sm text-slate-600">{p.deadline || p.endDate || "—"}</span></td>
                            <td className="px-4 py-3.5"><Badge value={p.status || "Planning"} /></td>
                            <td className="px-4 py-3.5"><div className="flex gap-1">
                              <button onClick={() => handleOpenModal("view", p)} className="w-7 h-7 rounded-lg hover:bg-blue-50 flex items-center justify-center text-slate-400 hover:text-blue-600"><Eye size={13} /></button>
                              <button onClick={() => handleOpenModal("edit", p)} className="w-7 h-7 rounded-lg hover:bg-amber-50 flex items-center justify-center text-slate-400 hover:text-amber-600"><Pencil size={13} /></button>
                              <button onClick={() => setConfirmDeleteId(p.id)} className="w-7 h-7 rounded-lg hover:bg-red-50 flex items-center justify-center text-slate-400 hover:text-red-500"><Trash2 size={13} /></button>
                            </div></td>
                          </motion.tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
                <div className="px-4 py-3 border-t border-slate-200 bg-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span>{filteredProjects.length} of {projectsData.length} projects</span>
                </div>
              </div>
            )}

            {/* ══════════ TASKS TAB ════════════════════════ */}
            {activeTab === "tasks" && (
              <div className="bg-slate-50 border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-100">
                        {["Task", "Assignee", "Priority", "Due", "Status", "Actions"].map(h => (
                          <th key={h} className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filteredTasks.length === 0 ? (
                        <tr><td colSpan={6} className="text-center py-16 text-slate-400 text-sm font-light">No tasks found</td></tr>
                      ) : (
                        filteredTasks.map((t: any, i: number) => (
                          <motion.tr key={t.id || i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                            className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                            <td className="px-4 py-3.5"><div className="flex items-center gap-2"><div className={`w-1.5 h-1.5 rounded-full ${(t.priority || "Medium") === "URGENT" || t.priority === "Urgent" ? "bg-red-500" : (t.priority || "Medium") === "HIGH" || t.priority === "High" ? "bg-orange-400" : (t.priority || "Medium") === "MEDIUM" || t.priority === "Medium" ? "bg-blue-400" : "bg-slate-300"}`} /><span className="text-sm font-medium text-slate-800">{t.title || "Untitled"}</span></div></td>
                            <td className="px-4 py-3.5"><div className="flex items-center gap-2"><Avatar name={t.assignee || "NA"} /><span className="text-sm text-slate-700">{t.assignee || "NA"}</span></div></td>
                            <td className="px-4 py-3.5"><Badge value={t.priority || "Medium"} /></td>
                            <td className="px-4 py-3.5"><span className="text-sm text-slate-600">{t.due || t.dueDate || t.end || "—"}</span></td>
                            <td className="px-4 py-3.5"><Badge value={t.status || "Todo"} /></td>
                            <td className="px-4 py-3.5"><div className="flex gap-1">
                              <button onClick={() => handleOpenModal("view", t)} className="w-7 h-7 rounded-lg hover:bg-blue-50 flex items-center justify-center text-slate-400"><Eye size={13} /></button>
                              <button onClick={() => handleOpenModal("edit", t)} className="w-7 h-7 rounded-lg hover:bg-amber-50 flex items-center justify-center text-slate-400"><Pencil size={13} /></button>
                              <button onClick={() => setConfirmDeleteId(t.id)} className="w-7 h-7 rounded-lg hover:bg-red-50 flex items-center justify-center text-slate-400"><Trash2 size={13} /></button>
                            </div></td>
                          </motion.tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
                <div className="px-4 py-3 border-t border-slate-200 bg-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span>{filteredTasks.length} of {tasksData.length} tasks</span>
                </div>
              </div>
            )}

            {/* ══════════ KANBAN TAB ═══════════════════════ */}
            {activeTab === "kanban" && (
              <div className="grid grid-cols-5 gap-3">
                {KANBAN_STATUSES.map(status => (
                  <div key={status} className="bg-slate-50 border border-slate-200 rounded-xl overflow-hidden">
                    <div className={`px-3 py-2.5 border-b border-slate-200 flex items-center justify-between ${
                      status === "Todo" ? "bg-slate-100" : status === "In Progress" ? "bg-blue-50" : status === "In Review" ? "bg-amber-50" : status === "Done" ? "bg-emerald-50" : "bg-red-50"
                    }`}>
                      <span className={`text-xs font-bold uppercase tracking-wider ${status === "Todo" ? "text-slate-600" : status === "In Progress" ? "text-blue-700" : status === "In Review" ? "text-amber-700" : status === "Done" ? "text-emerald-700" : "text-red-700"}`}>{status}</span>
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${status === "Todo" ? "bg-slate-200 text-slate-600" : status === "In Progress" ? "bg-blue-200 text-blue-700" : status === "In Review" ? "bg-amber-200 text-amber-700" : status === "Done" ? "bg-emerald-200 text-emerald-700" : "bg-red-200 text-red-700"}`}>{(kanbanTasks[status] || []).length}</span>
                    </div>
                    <div className="p-2 space-y-2 min-h-[120px]">
                      {(kanbanTasks[status] || []).length === 0 ? (
                        <div className="text-[10px] text-slate-400 text-center py-4">No tasks</div>
                      ) : (
                        (kanbanTasks[status] || []).map((t: any, i: number) => (
                          <motion.div key={t.id || i} layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                            className="bg-white rounded-lg p-3 border border-slate-200 shadow-sm hover:shadow-md transition-all cursor-pointer">
                            <div className="flex items-start justify-between mb-2">
                              <span className="text-xs font-semibold text-slate-800 leading-tight flex-1">{t.title || "Untitled"}</span>
                              <Badge value={t.priority || "Medium"} />
                            </div>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-1.5">
                                <Avatar name={t.assignee || "NA"} />
                                <span className="text-[10px] text-slate-500">{t.assignee ? t.assignee.split(" ")[0] : "NA"}</span>
                              </div>
                              <span className="text-[10px] font-mono text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded">{t.points || 0} pts</span>
                            </div>
                          </motion.div>
                        ))
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* ══════════ GANTT TAB ════════════════════════ */}
            {activeTab === "gantt" && ganttData.length > 0 && (
              <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <div className="min-w-[600px]">
                    <div className="flex border-b border-slate-200" style={{ paddingLeft: 280 }}>
                      {ganttDates.map((d, i) => (
                        <div key={i} className={`text-[8px] text-center py-1 border-r border-slate-50 ${d.getDay() === 0 || d.getDay() === 6 ? 'bg-slate-50' : ''}`}
                          style={{ width: dayWidth, color: d.getDay() === 0 || d.getDay() === 6 ? '#94a3b8' : '#64748b' }}>
                          {d.getDate()}
                        </div>
                      ))}
                    </div>
                    {ganttData.map((gt: any, i: number) => {
                      const bar = ganttBar(gt.start || gt.createdAt || "", gt.end || gt.due || "");
                      const barColor = (gt.pct || 0) >= 100 ? "bg-emerald-500" : (gt.pct || 0) >= 50 ? "bg-blue-500" : (gt.pct || 0) >= 20 ? "bg-amber-500" : "bg-red-400";
                      return (
                        <div key={i} className="flex border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                          <div className="w-[280px] shrink-0 px-3 py-2.5 flex items-center gap-2 border-r border-slate-100">
                            <Avatar name={gt.assignee || "NA"} />
                            <div className="min-w-0 flex-1">
                              <div className="text-xs font-medium text-slate-800 truncate">{gt.title || gt.task || "Task"}</div>
                              <div className="text-[10px] text-slate-400 truncate">{gt.project || ""}</div>
                            </div>
                            <span className="text-[10px] font-mono text-slate-500">{gt.pct || 0}%</span>
                          </div>
                          <div className="flex-1 relative py-2" style={{ height: 44 }}>
                            <motion.div initial={{ width: 0 }} animate={{ width: bar.width }} transition={{ duration: 0.5, delay: i * 0.05 }}
                              className={`absolute top-2 h-6 rounded-md ${barColor} flex items-center px-2 shadow-sm`}
                              style={{ left: bar.left, minWidth: dayWidth }}>
                              <span className="text-[7px] text-white font-semibold whitespace-nowrap">{gt.pct || 0}%</span>
                            </motion.div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
                <div className="px-4 py-3 border-t border-slate-200 bg-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span>{ganttData.length} tasks · Timeline: {new Date(ganttMinDate).toLocaleDateString()}</span>
                </div>
              </div>
            )}
            {activeTab === "gantt" && ganttData.length === 0 && !isLoading && (
              <div className="text-center py-16 text-slate-400 text-sm font-light bg-white border border-slate-200 rounded-2xl">No timeline data available yet. Create tasks to see the Gantt chart.</div>
            )}

            {/* ══════════ SCRUM TAB ════════════════════════ */}
            {activeTab === "scrum" && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {scrumData.filter((s: any) => s.status === "ACTIVE").length === 0 ? (
                    <div className="col-span-3 text-center py-12 text-slate-400 text-sm">No active sprints</div>
                  ) : (
                    scrumData.filter((s: any) => s.status === "ACTIVE").map((s: any, i: number) => (
                      <motion.div key={s.id || i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                        className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{s.name || s.sprint || "Sprint"}</span>
                          </div>
                          <Badge value={s.status || "ACTIVE"} />
                        </div>
                        <h3 className="text-sm font-bold text-slate-900 mb-1">{s.project || ""}</h3>
                        <p className="text-xs text-slate-500 mb-4">{s.goal || "No goal set"}</p>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[11px] font-medium text-slate-500">Progress</span>
                          <span className="text-xs font-bold">{s.totalPoints > 0 ? Math.round((s.donePoints || 0) / s.totalPoints * 100) : 0}%</span>
                        </div>
                        <ProgressBar pct={s.totalPoints > 0 ? Math.round((s.donePoints || 0) / s.totalPoints * 100) : 0} size="md" />
                        <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100 text-xs text-slate-500">
                          <span>{(s.donePoints || 0)}/{(s.totalPoints || 0)} points</span>
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>
                {scrumData.length > 0 && (
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left">
                        <thead>
                          <tr className="border-b border-slate-200 bg-slate-100">
                            {["Sprint", "Points", "Done", "Status", "Actions"].map(h => (
                              <th key={h} className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-widest">{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {scrumData.map((s: any, i: number) => (
                            <motion.tr key={s.id || i} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                              className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                              <td className="px-4 py-3.5"><span className="text-sm font-semibold text-slate-800">{s.name || s.sprint || "Sprint"}</span></td>
                              <td className="px-4 py-3.5"><span className="text-sm font-mono">{s.totalPoints || 0}</span></td>
                              <td className="px-4 py-3.5"><span className="text-sm font-mono text-emerald-600 font-bold">{s.donePoints || 0}</span></td>
                              <td className="px-4 py-3.5"><Badge value={s.status || "PLANNING"} /></td>
                              <td className="px-4 py-3.5"><div className="flex gap-1">
                                <button onClick={() => handleOpenModal("view", s)} className="w-7 h-7 rounded-lg hover:bg-blue-50 flex items-center justify-center text-slate-400"><Eye size={13} /></button>
                                <button onClick={() => handleOpenModal("edit", s)} className="w-7 h-7 rounded-lg hover:bg-amber-50 flex items-center justify-center text-slate-400"><Pencil size={13} /></button>
                              </div></td>
                            </motion.tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ══════════ SPRINT PLANNING TAB ═══════════════ */}
            {activeTab === "sprint" && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {(sprintData.length > 0 ? sprintData : scrumData).map((s: any, i: number) => {
                    const pct = s.totalPoints > 0 ? Math.round((s.donePoints || 0) / s.totalPoints * 100) : 0;
                    return (
                      <motion.div key={s.id || i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                        className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${s.status === "ACTIVE" ? "bg-blue-50" : s.status === "COMPLETED" ? "bg-emerald-50" : "bg-slate-50"}`}>
                              <CalendarRange size={13} className={s.status === "ACTIVE" ? "text-blue-600" : s.status === "COMPLETED" ? "text-emerald-600" : "text-slate-400"} />
                            </div>
                            <div>
                              <span className="text-sm font-bold text-slate-900">{s.name || s.sprint || "Sprint"}</span>
                            </div>
                          </div>
                          <Badge value={s.status || "PLANNING"} />
                        </div>
                        <p className="text-xs text-slate-600 mb-3 italic">"{s.goal || "No goal set"}"</p>
                        <ProgressBar pct={pct} />
                        <div className="grid grid-cols-3 gap-3 mt-4 pt-3 border-t border-slate-100">
                          <div><div className="text-[10px] text-slate-400">Total Points</div><div className="text-sm font-bold text-slate-900">{s.totalPoints || 0}</div></div>
                          <div><div className="text-[10px] text-slate-400">Completed</div><div className="text-sm font-bold text-emerald-600">{s.donePoints || 0}</div></div>
                          <div><div className="text-[10px] text-slate-400">Velocity</div><div className="text-sm font-bold text-blue-600">{s.donePoints || 0}</div></div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ══════════ RESOURCE ALLOCATION TAB ══════════ */}
            {activeTab === "resources" && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Array.from(new Set(filteredResources.map((r: any) => r.personName))).map((name, i) => {
                    const allocations = filteredResources.filter((r: any) => r.personName === name);
                    const totalAlloc = allocations.reduce((s: number, r: any) => s + (r.allocation || 0), 0);
                    return (
                      <motion.div key={String(name)} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                        className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
                        <div className="flex items-center gap-3 mb-3">
                          <Avatar name={String(name)} size="md" />
                          <div className="flex-1">
                            <h3 className="text-sm font-bold text-slate-900">{String(name)}</h3>
                            <p className="text-[11px] text-slate-500">{allocations[0]?.role || "Team Member"}</p>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold text-slate-900">{totalAlloc}%</div>
                            <div className="text-[10px] text-slate-400">allocated</div>
                          </div>
                        </div>
                        {allocations.map((r: any, j: number) => (
                          <div key={j}>
                            <div className="flex justify-between text-[11px] mb-1">
                              <span className="text-slate-600">{r.project || "—"}</span>
                              <span className="font-semibold text-slate-800">{r.allocation || 0}%</span>
                            </div>
                            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                              <motion.div initial={{ width: 0 }} animate={{ width: `${r.allocation || 0}%` }} transition={{ duration: 0.5, delay: j * 0.1 }}
                                className="h-full rounded-full bg-blue-500" />
                            </div>
                          </div>
                        ))}
                      </motion.div>
                    );
                  })}
                </div>
                {filteredResources.length > 0 && (
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left">
                        <thead>
                          <tr className="border-b border-slate-200 bg-slate-100">
                            {["Resource", "Role", "Allocation", "Rate", "Status", "Actions"].map(h => (
                              <th key={h} className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-widest">{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {filteredResources.map((r: any, i: number) => (
                            <motion.tr key={r.id || i} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                              className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                              <td className="px-4 py-3.5"><div className="flex items-center gap-2"><Avatar name={r.personName || "NA"} /><span className="text-sm font-medium text-slate-800">{r.personName || "NA"}</span></div></td>
                              <td className="px-4 py-3.5"><span className="text-sm text-slate-600">{r.role || "—"}</span></td>
                              <td className="px-4 py-3.5"><div className="flex items-center gap-2"><ProgressBar pct={r.allocation || 0} size="sm" /><span className="text-xs font-mono font-bold w-10">{r.allocation || 0}%</span></div></td>
                              <td className="px-4 py-3.5"><span className="text-sm font-mono">{Number(r.rate || 0).toLocaleString()} ETB</span></td>
                              <td className="px-4 py-3.5"><Badge value={r.status || "Active"} /></td>
                              <td className="px-4 py-3.5"><div className="flex gap-1">
                                <button onClick={() => handleOpenModal("edit", r)} className="w-7 h-7 rounded-lg hover:bg-amber-50 flex items-center justify-center text-slate-400"><Pencil size={13} /></button>
                                <button onClick={() => setConfirmDeleteId(r.id)} className="w-7 h-7 rounded-lg hover:bg-red-50 flex items-center justify-center text-slate-400"><Trash2 size={13} /></button>
                              </div></td>
                            </motion.tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ══════════ TIME TRACKING TAB ════════════════ */}
            {activeTab === "time" && (
              <div className="space-y-4">
                <div className="grid grid-cols-4 gap-3">
                  <div className="bg-white border border-slate-100 rounded-xl px-4 py-3 shadow-sm">
                    <div className="text-[11px] text-slate-400 font-medium mb-1">Total Hours</div>
                    <div className="text-xl font-bold text-slate-900">{timeData.reduce((s: number, t: any) => s + (t.hours || t.hoursWorked || 0), 0)}</div>
                  </div>
                  <div className="bg-white border border-slate-100 rounded-xl px-4 py-3 shadow-sm">
                    <div className="text-[11px] text-slate-400 font-medium mb-1">Billable Hours</div>
                    <div className="text-xl font-bold text-emerald-600">{timeData.reduce((s: number, t: any) => s + (t.billable || 0), 0)}</div>
                  </div>
                  <div className="bg-white border border-slate-100 rounded-xl px-4 py-3 shadow-sm">
                    <div className="text-[11px] text-slate-400 font-medium mb-1">Entries</div>
                    <div className="text-xl font-bold text-blue-600">{timeData.length}</div>
                  </div>
                  <div className="bg-white border border-slate-100 rounded-xl px-4 py-3 shadow-sm">
                    <div className="text-[11px] text-slate-400 font-medium mb-1">Avg / Entry</div>
                    <div className="text-xl font-bold text-slate-900">{timeData.length > 0 ? (timeData.reduce((s: number, t: any) => s + (t.hours || t.hoursWorked || 0), 0) / timeData.length).toFixed(1) : 0}h</div>
                  </div>
                </div>
                <div className="bg-slate-50 border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="border-b border-slate-200 bg-slate-100">
                          {["Person", "Description", "Hours", "Billable", "Status", "Actions"].map(h => (
                            <th key={h} className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-widest">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {filteredTime.length === 0 ? (
                          <tr><td colSpan={6} className="text-center py-16 text-slate-400 text-sm">No time entries</td></tr>
                        ) : (
                          filteredTime.map((t: any, i: number) => (
                            <motion.tr key={t.id || i} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                              className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                              <td className="px-4 py-3.5"><div className="flex items-center gap-2"><Avatar name={t.personName || t.employee || "NA"} /><span className="text-sm font-medium text-slate-800">{t.personName || t.employee || "NA"}</span></div></td>
                              <td className="px-4 py-3.5"><span className="text-sm text-slate-700">{t.description || t.task || "—"}</span></td>
                              <td className="px-4 py-3.5"><span className="text-sm font-mono font-bold">{(t.hours || t.hoursWorked || 0)}h</span></td>
                              <td className="px-4 py-3.5"><span className="text-sm font-mono text-emerald-600">{(t.billable || 0)}h</span></td>
                              <td className="px-4 py-3.5"><Badge value={t.status || "Draft"} /></td>
                              <td className="px-4 py-3.5"><div className="flex gap-1">
                                <button onClick={() => handleOpenModal("view", t)} className="w-7 h-7 rounded-lg hover:bg-blue-50 flex items-center justify-center text-slate-400"><Eye size={13} /></button>
                                <button onClick={() => handleOpenModal("edit", t)} className="w-7 h-7 rounded-lg hover:bg-amber-50 flex items-center justify-center text-slate-400"><Pencil size={13} /></button>
                                <button onClick={() => setConfirmDeleteId(t.id)} className="w-7 h-7 rounded-lg hover:bg-red-50 flex items-center justify-center text-slate-400"><Trash2 size={13} /></button>
                              </div></td>
                            </motion.tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                  <div className="px-4 py-3 border-t border-slate-200 bg-slate-100 flex items-center justify-between text-xs text-slate-500">
                    <span>{filteredTime.length} entries</span>
                  </div>
                </div>
              </div>
            )}

            {/* ══════════ ANALYTICS TAB ════════════════════ */}
            {activeTab === "analytics" && (
              <Dashboard analyticsData={analyticsData} projectsData={projectsData} tasksData={tasksData} scrumData={scrumData} resourcesData={resourcesData} timeData={timeData} />
            )}

          </motion.div>
        </AnimatePresence>
      )}

      {/* ── DEDICATED CRUD MODAL ────────────────────────── */}
      {modalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center p-4 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-900 capitalize">{modalMode} {activeTabDef.label}</h2>
              <button onClick={() => { setModalOpen(false); setFormErrors({}); }} className="text-slate-400 hover:text-slate-600"><X size={18} /></button>
            </div>
            <form onSubmit={handleSave} className="flex flex-col flex-1 min-h-0">
              <div className="p-4 overflow-y-auto flex-1 space-y-4">
                {renderModalFormFields()}
              </div>
              {modalMode !== "view" && (
                <div className="p-4 border-t border-slate-100 flex justify-end gap-2 bg-slate-50">
                  <button type="button" onClick={() => { setModalOpen(false); setFormErrors({}); }} className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900">Cancel</button>
                  <button type="submit" disabled={isSaving} className="px-4 py-2 rounded-xl bg-primary hover:bg-primary/90 text-black text-sm font-bold transition-all disabled:opacity-50 flex items-center gap-2">
                    {isSaving && <span className="w-3 h-3 border-2 border-black border-t-transparent rounded-full animate-spin" />}
                    {isSaving ? "Saving..." : `Save ${activeTabDef.label}`}
                  </button>
                </div>
              )}
              {modalMode === "view" && (
                <div className="p-4 border-t border-slate-100 flex justify-end bg-slate-50">
                  <button type="button" onClick={() => { setModalOpen(false); setFormErrors({}); }} className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900">Close</button>
                </div>
              )}
            </form>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={!!confirmDeleteId}
        variant="danger"
        title="Delete Record"
        message="Are you sure you want to delete this record? This action cannot be undone."
        confirmLabel="Delete"
        onConfirm={confirmDeleteAction}
        onCancel={() => setConfirmDeleteId(null)}
      />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// PROJECT MANAGEMENT DASHBOARD (Analytics Tab)
// ═══════════════════════════════════════════════════════════════════════════
function Dashboard({ analyticsData, projectsData, tasksData, scrumData, resourcesData, timeData }: {
  analyticsData: any[]; projectsData: any[]; tasksData: any[];
  scrumData: any[]; resourcesData: any[]; timeData: any[];
}) {
  // ── Compute KPIs from all available data ──
  const dashboard = useMemo(() => {
    const totalTasks = tasksData.length;
    const doneTasks = tasksData.filter((t: any) => t.status === "Done" || t.status === "DONE").length;
    const inProgress = tasksData.filter((t: any) => t.status === "In Progress" || t.status === "IN_PROGRESS").length;
    const reviewTasks = tasksData.filter((t: any) => t.status === "In Review" || t.status === "REVIEW").length;
    const todoTasks = totalTasks - doneTasks - inProgress - reviewTasks;
    const urgent = tasksData.filter((t: any) => t.priority === "Urgent" || t.priority === "URGENT").length;
    const high = tasksData.filter((t: any) => t.priority === "High" || t.priority === "HIGH").length;
    const medium = tasksData.filter((t: any) => t.priority === "Medium" || t.priority === "MEDIUM").length;
    const completionRate = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;
    const totalHours = timeData.reduce((s: number, t: any) => s + (t.hours || t.hoursWorked || 0), 0);
    const billable = timeData.reduce((s: number, t: any) => s + (t.billable || 0), 0);
    
    // Sprint velocity
    const totalSprintPoints = scrumData.reduce((s: number, sp: any) => s + (sp.totalPoints || sp.donePoints || 0), 0);
    const doneSprintPoints = scrumData.reduce((s: number, sp: any) => s + (sp.donePoints || 0), 0);
    const avgVelocity = scrumData.length > 0 ? Math.round(doneSprintPoints / scrumData.length) : 0;

    // Budget
    const totalBudget = projectsData.reduce((s: number, p: any) => s + (p.budget || 0), 0);
    const totalSpent = projectsData.reduce((s: number, p: any) => s + (p.spent || 0), 0);
    
    // Resources
    const resourceNames = [...new Set(resourcesData.map((r: any) => r.personName).filter(Boolean))];
    const avgAlloc = resourcesData.length > 0
      ? Math.round(resourcesData.reduce((s: number, r: any) => s + (r.allocation || 0), 0) / resourcesData.length)
      : 0;

    // Assignee breakdown
    const assigneeMap: Record<string, number> = {};
    tasksData.forEach((t: any) => {
      const name = t.assignee || "Unassigned";
      assigneeMap[name] = (assigneeMap[name] || 0) + 1;
    });
    const assignees = Object.entries(assigneeMap)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);

    // Active projects
    const activeProj = projectsData.filter((p: any) =>
      p.status !== "Completed" && p.status !== "Cancelled"
    ).length;

    return {
      totalTasks, doneTasks, inProgress, reviewTasks, todoTasks,
      urgent, high, medium, completionRate,
      totalHours, billable, nonBillable: totalHours - billable,
      totalSprintPoints, doneSprintPoints, avgVelocity,
      totalBudget, totalSpent,
      resourceCount: resourceNames.length, avgAlloc,
      assignees, activeProj,
    };
  }, [projectsData, tasksData, scrumData, resourcesData, timeData]);

  // Colors for donut chart
  const STATUS_COLORS = ["#94a3b8", "#3b82f6", "#f59e0b", "#10b981"];
  const statusLabels = ["Todo", "In Progress", "In Review", "Done"];
  const statusCounts = [dashboard.todoTasks, dashboard.inProgress, dashboard.reviewTasks, dashboard.doneTasks];
  const total = dashboard.totalTasks || 1;

  // Build donut segments via conic-gradient
  let donutGradient = "";
  let cumulative = 0;
  statusCounts.forEach((count, i) => {
    const pct = (count / total) * 100;
    if (pct > 0) {
      const start = cumulative;
      const end = cumulative + pct;
      donutGradient += `${STATUS_COLORS[i]} ${start}% ${end}%${i < statusCounts.length - 1 ? ", " : ""}`;
      cumulative = end;
    }
  });

  return (
    <div className="space-y-6">
      {/* ── KPI STRIP ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        {[
          { icon: FolderKanban, label: "Active Projects", value: dashboard.activeProj, color: "text-indigo-600", bg: "bg-indigo-50" },
          { icon: ListTodo, label: "Total Tasks", value: dashboard.totalTasks, color: "text-blue-600", bg: "bg-blue-50", sub: `${dashboard.doneTasks} done` },
          { icon: CheckCircle, label: "Completion", value: `${dashboard.completionRate}%`, color: "text-emerald-600", bg: "bg-emerald-50" },
          { icon: ClockIcon, label: "Hours Logged", value: dashboard.totalHours, color: "text-rose-600", bg: "bg-rose-50", sub: `${dashboard.billable} billable` },
          { icon: GitBranch, label: "Sprint Velocity", value: dashboard.avgVelocity, color: "text-amber-600", bg: "bg-amber-50", sub: "pts/sprint" },
          { icon: Users, label: "Resources", value: dashboard.resourceCount, color: "text-cyan-600", bg: "bg-cyan-50", sub: `${dashboard.avgAlloc}% avg alloc` },
          { icon: DollarSign, label: "Budget Total", value: dashboard.totalBudget.toLocaleString(), color: "text-slate-900", bg: "bg-slate-100", sub: `ETB` },
          { icon: TrendingUp, label: "Urgent Tasks", value: dashboard.urgent, color: "text-red-600", bg: "bg-red-50", sub: `${dashboard.high} high priority` },
        ].map((kpi, i) => (
          <motion.div key={kpi.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="bg-white border border-slate-100 rounded-xl px-3 py-3 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-2 mb-1">
              <div className={`w-6 h-6 rounded-lg ${kpi.bg} flex items-center justify-center`}>
                <kpi.icon size={12} className={kpi.color} />
              </div>
              <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">{kpi.label}</span>
            </div>
            <div className={`text-lg font-bold ${kpi.color}`}>{kpi.value}</div>
            {kpi.sub && <div className="text-[10px] text-slate-400 mt-0.5">{kpi.sub}</div>}
          </motion.div>
        ))}
      </div>

      {/* ── CHARTS ROW 1: Status Donut + Priority + Sprint Velocity ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Task Status Distribution - Donut Chart */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Task Status Distribution</h3>
          <div className="flex items-center gap-6">
            <div className="relative w-28 h-28 shrink-0">
              <div className="w-28 h-28 rounded-full" style={{
                background: `conic-gradient(${donutGradient})`,
              }}>
                <div className="absolute inset-3 bg-white rounded-full flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-lg font-bold text-slate-900">{dashboard.completionRate}%</div>
                    <div className="text-[8px] text-slate-400 uppercase tracking-wider">Done</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-1.5 flex-1">
              {statusLabels.map((label, i) => (
                <div key={label} className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: STATUS_COLORS[i] }} />
                  <span className="text-[11px] text-slate-600 flex-1">{label}</span>
                  <span className="text-[11px] font-bold text-slate-800">{statusCounts[i]}</span>
                  <span className="text-[10px] text-slate-400 w-8 text-right">{Math.round((statusCounts[i] / total) * 100)}%</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Priority Distribution - Bar Chart */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Priority Distribution</h3>
          <div className="space-y-3">
            {[
              { label: "Urgent", count: dashboard.urgent, color: "bg-red-500" },
              { label: "High", count: dashboard.high, color: "bg-orange-500" },
              { label: "Medium", count: dashboard.medium, color: "bg-blue-500" },
              { label: "Low", count: dashboard.totalTasks - dashboard.urgent - dashboard.high - dashboard.medium, color: "bg-slate-300" },
            ].map((item) => {
              const maxCount = Math.max(dashboard.urgent, dashboard.high, dashboard.medium, 1);
              const width = (item.count / maxCount) * 100;
              return (
                <div key={item.label}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-medium text-slate-700">{item.label}</span>
                    <span className="font-bold text-slate-800">{item.count}</span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${width}%` }} transition={{ duration: 0.6, delay: 0.2 }}
                      className={`h-full rounded-full ${item.color}`} />
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Sprint Velocity */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Sprint Velocity</h3>
          {(scrumData.length > 0 ? scrumData : []).length === 0 ? (
            <div className="text-xs text-slate-400 text-center py-8">No sprint data available yet</div>
          ) : (
            <div className="space-y-2.5">
              {(scrumData.length > 0 ? scrumData : []).slice(-5).map((s: any, i: number) => {
                const totalPts = s.totalPoints || 1;
                const donePts = s.donePoints || 0;
                const pct = Math.round((donePts / totalPts) * 100);
                return (
                  <div key={s.id || i}>
                    <div className="flex justify-between text-[11px] mb-0.5">
                      <span className="font-medium text-slate-600 truncate">{s.name || `Sprint ${i + 1}`}</span>
                      <span className="font-bold text-slate-800">{donePts}/{totalPts}</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.5, delay: i * 0.1 }}
                        className={`h-full rounded-full ${pct >= 100 ? "bg-emerald-500" : pct >= 50 ? "bg-blue-500" : "bg-amber-500"}`} />
                    </div>
                  </div>
                );
              })}
              <div className="pt-2 mt-2 border-t border-slate-100 flex justify-between text-[11px]">
                <span className="text-slate-500">Avg Velocity</span>
                <span className="font-bold text-slate-900">{dashboard.avgVelocity} pts</span>
              </div>
            </div>
          )}
        </motion.div>
      </div>

      {/* ── CHARTS ROW 2: Project Progress + Resource Utilization + Team Performance ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Project Progress */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Project Progress</h3>
            <Badge value={`${projectsData.length} projects`} />
          </div>
          <div className="space-y-3">
            {projectsData.length === 0 ? (
              <div className="text-xs text-slate-400 text-center py-6">No projects created yet</div>
            ) : (
              projectsData.slice(0, 5).map((p: any, i: number) => (
                <div key={p.id || i}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-medium text-slate-700 truncate flex-1">{p.name || "Project"}</span>
                    <span className="font-bold text-slate-800 ml-2">{p.progress || 0}%</span>
                    <span className="text-[10px] text-slate-400 ml-2">{p.budget ? `ETB ${Number(p.budget).toLocaleString()}` : ""}</span>
                  </div>
                  <ProgressBar pct={p.progress || 0} size="sm" />
                </div>
              ))
            )}
          </div>
        </motion.div>

        {/* Resource Utilization */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Resource Utilization</h3>
            <Badge value={`${dashboard.resourceCount} people`} />
          </div>
          <div className="space-y-3">
            {resourcesData.length === 0 ? (
              <div className="text-xs text-slate-400 text-center py-6">No resources allocated</div>
            ) : (
              Array.from(new Set(resourcesData.map((r: any) => r.personName))).slice(0, 6).map((name) => {
                const allocs = resourcesData.filter((r: any) => r.personName === name);
                const total = allocs.reduce((s: number, r: any) => s + (r.allocation || 0), 0);
                return (
                  <div key={String(name)}>
                    <div className="flex justify-between text-xs mb-1">
                      <div className="flex items-center gap-1.5">
                        <Avatar name={String(name)} />
                        <span className="font-medium text-slate-700">{String(name)}</span>
                      </div>
                      <span className="font-bold text-slate-800">{total}%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <motion.div initial={{ width: 0 }} animate={{ width: `${total}%` }} transition={{ duration: 0.5 }}
                        className={`h-full rounded-full ${total >= 100 ? "bg-emerald-500" : total >= 80 ? "bg-blue-500" : total >= 50 ? "bg-amber-500" : "bg-slate-400"}`} />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </motion.div>

        {/* Team Performance */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Team Performance</h3>
            <Badge value={`${dashboard.assignees.length} members`} />
          </div>
          <div className="space-y-3">
            {dashboard.assignees.length === 0 ? (
              <div className="text-xs text-slate-400 text-center py-6">No task assignments yet</div>
            ) : (
              dashboard.assignees.map((a: any, i: number) => {
                const maxCount = Math.max(...dashboard.assignees.map((x: any) => x.count), 1);
                const width = (a.count / maxCount) * 100;
                return (
                  <div key={a.name}>
                    <div className="flex justify-between text-xs mb-1">
                      <div className="flex items-center gap-1.5">
                        <Avatar name={a.name} />
                        <span className="font-medium text-slate-700 truncate max-w-[120px]">{a.name}</span>
                      </div>
                      <span className="font-bold text-slate-800">{a.count} tasks</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <motion.div initial={{ width: 0 }} animate={{ width: `${width}%` }} transition={{ duration: 0.5, delay: i * 0.08 }}
                        className="h-full rounded-full bg-purple-500" />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </motion.div>
      </div>

      {/* ── CHARTS ROW 3: Time Summary + Budget Overview ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Time Tracking Summary */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Time Tracking Summary</h3>
          <div className="grid grid-cols-4 gap-3">
            {[
              { label: "Total Hours", value: dashboard.totalHours, color: "text-slate-900", bg: "bg-slate-50" },
              { label: "Billable", value: dashboard.billable, color: "text-emerald-600", bg: "bg-emerald-50" },
              { label: "Non-Billable", value: dashboard.nonBillable, color: "text-amber-600", bg: "bg-amber-50" },
              { label: "Entries", value: timeData.length, color: "text-blue-600", bg: "bg-blue-50" },
            ].map((item) => (
              <div key={item.label} className={`${item.bg} rounded-xl px-3 py-2.5 text-center`}>
                <div className={`text-lg font-bold ${item.color}`}>{item.value}</div>
                <div className="text-[9px] text-slate-500 uppercase tracking-wider mt-0.5">{item.label}</div>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100">
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-600">Billable vs Non-Billable</span>
              <span className="font-bold text-slate-800">
                {dashboard.totalHours > 0 ? Math.round((dashboard.billable / dashboard.totalHours) * 100) : 0}% billable
              </span>
            </div>
            <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
              <motion.div initial={{ width: 0 }} animate={{ width: `${dashboard.totalHours > 0 ? (dashboard.billable / dashboard.totalHours) * 100 : 0}%` }} transition={{ duration: 0.6 }}
                className="h-full rounded-full bg-emerald-500" />
            </div>
          </div>
        </motion.div>

        {/* Budget Overview */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Budget Overview</h3>
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="bg-slate-50 rounded-xl px-3 py-2.5 text-center">
              <div className="text-lg font-bold text-slate-900">ETB {dashboard.totalBudget.toLocaleString()}</div>
              <div className="text-[9px] text-slate-500 uppercase tracking-wider mt-0.5">Budget</div>
            </div>
            <div className="bg-amber-50 rounded-xl px-3 py-2.5 text-center">
              <div className="text-lg font-bold text-amber-600">ETB {dashboard.totalSpent.toLocaleString()}</div>
              <div className="text-[9px] text-slate-500 uppercase tracking-wider mt-0.5">Spent</div>
            </div>
            <div className="bg-emerald-50 rounded-xl px-3 py-2.5 text-center">
              <div className="text-lg font-bold text-emerald-600">ETB {(dashboard.totalBudget - dashboard.totalSpent).toLocaleString()}</div>
              <div className="text-[9px] text-slate-500 uppercase tracking-wider mt-0.5">Remaining</div>
            </div>
          </div>
          <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
            <motion.div initial={{ width: 0 }} animate={{ width: `${dashboard.totalBudget > 0 ? Math.min(100, (dashboard.totalSpent / dashboard.totalBudget) * 100) : 0}%` }} transition={{ duration: 0.6 }}
              className={`h-full rounded-full ${dashboard.totalSpent > dashboard.totalBudget ? "bg-red-500" : dashboard.totalSpent > dashboard.totalBudget * 0.8 ? "bg-amber-500" : "bg-emerald-500"}`} />
          </div>
          <div className="flex justify-between text-[10px] text-slate-400 mt-1">
            <span>0%</span>
            <span>{dashboard.totalBudget > 0 ? `${Math.round((dashboard.totalSpent / dashboard.totalBudget) * 100)}%` : "0%"} used</span>
            <span>100%</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

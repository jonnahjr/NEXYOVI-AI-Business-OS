"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  Users, Search, ChevronDown, ChevronsUpDown, Home,
  Building2, UserCircle, X, Download, RefreshCw,
  ChevronUp, ZoomIn, ZoomOut, ChevronRight,
} from "lucide-react";
import { useToast } from "@/components/ui/Toast";

// ── Types ────────────────────────────────────────────────────
interface EmployeeNode {
  id: string;
  name: string;
  employeeCode: string;
  jobTitle: string;
  department: string;
  departmentId?: string;
  status: string;
  salary: number;
  managerId?: string | null;
  children: EmployeeNode[];
  _depth: number;
}

interface RawEmp {
  id: string;
  firstName: string;
  lastName: string;
  employeeCode: string;
  jobTitle?: string;
  department?: { id: string; name: string };
  managerId?: string | null;
  status?: string;
  salary?: number;
  manager?: { id: string; firstName: string; lastName: string };
}

// ── Colors by department ──────────────────────────────────────
const DEPT_COLORS: Record<string, { bg: string; text: string; border: string; light: string }> = {
  "Executive":        { bg: "bg-slate-900",     text: "text-white",          border: "border-slate-900",      light: "bg-slate-50" },
  "Engineering":      { bg: "bg-blue-600",      text: "text-white",          border: "border-blue-600",       light: "bg-blue-50" },
  "Product":          { bg: "bg-violet-600",    text: "text-white",          border: "border-violet-600",     light: "bg-violet-50" },
  "Design":           { bg: "bg-pink-600",      text: "text-white",          border: "border-pink-600",       light: "bg-pink-50" },
  "Marketing":        { bg: "bg-emerald-600",   text: "text-white",          border: "border-emerald-600",    light: "bg-emerald-50" },
  "Sales":            { bg: "bg-amber-600",     text: "text-white",          border: "border-amber-600",      light: "bg-amber-50" },
  "Finance":          { bg: "bg-cyan-600",      text: "text-white",          border: "border-cyan-600",       light: "bg-cyan-50" },
  "Human Resources":  { bg: "bg-indigo-600",    text: "text-white",          border: "border-indigo-600",     light: "bg-indigo-50" },
  "Operations":       { bg: "bg-orange-600",    text: "text-white",          border: "border-orange-600",     light: "bg-orange-50" },
  "Customer Success": { bg: "bg-teal-600",      text: "text-white",          border: "border-teal-600",       light: "bg-teal-50" },
  "Legal":            { bg: "bg-rose-600",      text: "text-white",          border: "border-rose-600",       light: "bg-rose-50" },
  "IT":               { bg: "bg-purple-600",    text: "text-white",          border: "border-purple-600",     light: "bg-purple-50" },
};

function getDeptColor(dept: string) {
  return DEPT_COLORS[dept] || { bg: "bg-slate-600", text: "text-white", border: "border-slate-600", light: "bg-slate-50" };
}

function Avatar({ name, size = "sm" }: { name: string; size?: "sm" | "md" | "lg" }) {
  const initials = name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();
  const dims = size === "sm" ? "w-7 h-7 text-[9px]" : size === "lg" ? "w-12 h-12 text-sm" : "w-9 h-9 text-xs";
  return (
    <div className={`${dims} rounded-full bg-gradient-to-br from-slate-800 to-slate-600 flex items-center justify-center font-bold text-white shrink-0`}>
      {initials}
    </div>
  );
}

// ── Employee Details Popup ────────────────────────────────────
function DetailPopup({ emp, onClose }: { emp: EmployeeNode; onClose: () => void }) {
  const color = getDeptColor(emp.department);
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
        className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <div className={`${color.bg} px-6 py-5 text-white`}>
          <div className="flex items-center gap-4">
            <Avatar name={emp.name} size="lg" />
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-base truncate">{emp.name}</h3>
              <p className="text-xs opacity-80 truncate">{emp.jobTitle}</p>
            </div>
            <button onClick={onClose} className="text-white/60 hover:text-white transition-colors">
              <X size={18} />
            </button>
          </div>
        </div>
        <div className="p-5 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <InfoTile label="Department" value={emp.department} color={color} />
            <InfoTile label="Employee ID" value={emp.employeeCode} color={color} />
            <InfoTile label="Status" value={emp.status || "Active"} color={color} />
            <InfoTile label="Salary" value={`ETB ${emp.salary?.toLocaleString() || "—"}`} color={color} />
          </div>
          {emp.managerId && (
            <div className="bg-slate-50 rounded-xl p-3 text-xs text-slate-500 flex items-center gap-2">
              <UserCircle size={14} className="text-slate-400" />
              Reports to someone in {emp.department}
            </div>
          )}
          <div className="text-[10px] text-slate-400 text-center pt-1">
            {emp.children.length} direct report{emp.children.length !== 1 ? "s" : ""}
          </div>
        </div>
        <div className="px-5 pb-5">
          <button onClick={onClose} className="w-full py-2.5 rounded-xl bg-slate-900 text-white text-sm font-semibold hover:bg-black transition-colors">
            Close
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

function InfoTile({ label, value, color }: { label: string; value: string; color: { light: string } }) {
  return (
    <div className={`${color.light} rounded-xl p-3`}>
      <p className="text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">{label}</p>
      <p className="text-xs font-semibold text-slate-800">{value}</p>
    </div>
  );
}

// ── Tree Node Component ──────────────────────────────────────
function OrgTreeNode({
  node,
  collapsedSet,
  onToggle,
  onClick,
  searchTerm,
  depth,
}: {
  node: EmployeeNode;
  collapsedSet: Set<string>;
  onToggle: (id: string) => void;
  onClick: (emp: EmployeeNode) => void;
  searchTerm: string;
  depth: number;
}) {
  const collapsed = collapsedSet.has(node.id);
  const color = getDeptColor(node.department);
  const hasChildren = node.children.length > 0;
  const isMatched = searchTerm
    ? node.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      node.jobTitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      node.department?.toLowerCase().includes(searchTerm.toLowerCase())
    : true;

  if (searchTerm && !isMatched) return null;

  return (
    <div className="flex flex-col items-center">
      {/* Connector line going up (except root) */}
      {depth > 0 && (
        <div className="w-px h-5 bg-slate-300" />
      )}

      {/* Card */}
      <motion.div
        layout
        className={`relative group bg-white border-2 rounded-xl shadow-sm hover:shadow-md transition-all cursor-pointer min-w-[160px] max-w-[180px] ${
          isMatched && searchTerm ? "ring-2 ring-primary ring-offset-2" : color.border
        }`}
        onClick={() => onClick(node)}
        whileHover={{ y: -2 }}
      >
        {/* Department color bar */}
        <div className={`h-1.5 rounded-t-[10px] ${color.bg}`} />

        <div className="p-3">
          <div className="flex items-center gap-2 mb-1.5">
            <Avatar name={node.name} size="sm" />
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-bold text-slate-900 truncate leading-tight">{node.name}</p>
              <p className="text-[9px] text-slate-500 truncate leading-tight">{node.jobTitle}</p>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className={`text-[8px] font-semibold px-1.5 py-0.5 rounded ${color.light} ${color.border.replace("border-", "text-").replace("600", "700")} truncate max-w-[100px]`}>
              {node.department}
            </span>
            {hasChildren && (
              <button
                onClick={e => { e.stopPropagation(); onToggle(node.id); }}
                className="w-5 h-5 rounded hover:bg-slate-100 flex items-center justify-center transition-colors"
              >
                {collapsed ? <ChevronDown size={12} className="text-slate-400" /> : <ChevronUp size={12} className="text-slate-400" />}
              </button>
            )}
          </div>
        </div>

        {/* Direct report count badge */}
        {hasChildren && (
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2">
            <span className="text-[8px] font-bold bg-slate-900 text-white px-1.5 py-0.5 rounded-full shadow-sm">
              {node.children.length}
            </span>
          </div>
        )}
      </motion.div>

      {/* Children */}
      {hasChildren && !collapsed && (
        <div className="flex flex-col items-center mt-4">
          {/* Horizontal connector */}
          <div className="flex gap-4">
            {node.children.map((child, i) => (
              <div key={child.id} className="flex flex-col items-center relative">
                {/* Vertical connector */}
                <div className="w-px h-4 bg-slate-300" />
                {/* Node */}
                <OrgTreeNode
                  node={child}
                  collapsedSet={collapsedSet}
                  onToggle={onToggle}
                  onClick={onClick}
                  searchTerm={searchTerm}
                  depth={depth + 1}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
//  MAIN COMPONENT
// ══════════════════════════════════════════════════════════════
export default function OrganizationalChart() {
  const { toast } = useToast();
  const [employees, setEmployees] = useState<EmployeeNode[]>([]);
  const [allNodes, setAllNodes] = useState<EmployeeNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterDept, setFilterDept] = useState<string>("ALL");
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
  const [zoom, setZoom] = useState(1);
  const [selectedEmp, setSelectedEmp] = useState<EmployeeNode | null>(null);
  const [viewMode, setViewMode] = useState<"tree" | "grid">("tree");

  const API_BASE = "http://localhost:3002/api/v1/modules/human-resources/organizational-chart";
  const getToken = () => localStorage.getItem("token") || "";

  const loadEmployees = async () => {
    setLoading(true);
    try {
      const res = await fetch(API_BASE, { headers: { Authorization: `Bearer ${getToken()}` } });
      const data = await res.json();
      const raw: RawEmp[] = data?.data || [];

      // Build a map
      const nodeMap = new Map<string, EmployeeNode>();
      const allRecords: RawEmp[] = raw;

      // Create nodes
      for (const e of allRecords) {
        nodeMap.set(e.id, {
          id: e.id,
          name: `${e.firstName} ${e.lastName}`.trim(),
          employeeCode: e.employeeCode,
          jobTitle: e.jobTitle || "",
          department: e.department?.name || "Unknown",
          departmentId: e.department?.id,
          status: e.status || "ACTIVE",
          salary: e.salary || 0,
          managerId: e.managerId,
          children: [],
          _depth: 0,
        });
      }

      // Build tree
      const roots: EmployeeNode[] = [];
      for (const node of nodeMap.values()) {
        if (node.managerId && nodeMap.has(node.managerId)) {
          nodeMap.get(node.managerId)!.children.push(node);
        } else {
          roots.push(node);
        }
      }

      // Sort children by department then name
      const sortChildren = (nodes: EmployeeNode[]) => {
        for (const n of nodes) {
          n.children.sort((a, b) => a.department.localeCompare(b.department) || a.name.localeCompare(b.name));
          sortChildren(n.children);
        }
      };
      sortChildren(roots);

      // Assign depths
      const assignDepth = (nodes: EmployeeNode[], depth: number) => {
        for (const n of nodes) {
          n._depth = depth;
          assignDepth(n.children, depth + 1);
        }
      };
      assignDepth(roots, 0);

      // Collect all nodes flat
      const flat: EmployeeNode[] = [];
      const flatten = (nodes: EmployeeNode[]) => {
        for (const n of nodes) {
          flat.push(n);
          flatten(n.children);
        }
      };
      flatten(roots);

      setEmployees(roots);
      setAllNodes(flat);
      // Collapse everything below depth 1 by default
      const collapsedSet = new Set<string>();
      for (const n of flat) {
        if (n._depth >= 2 && n.children.length > 0) collapsedSet.add(n.id);
      }
      setCollapsed(collapsedSet);
    } catch (err) {
      console.error("Failed to load org chart:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadEmployees(); }, []);

  // ── Department filter ───────────────────────────────────────
  const departments = useMemo(() => {
    const depts = new Set(allNodes.map(e => e.department));
    return ["ALL", ...Array.from(depts).sort()];
  }, [allNodes]);

  const filteredRoots = useMemo(() => {
    if (filterDept === "ALL") return employees;
    return employees.map(root => {
      const filterTree = (node: EmployeeNode): EmployeeNode | null => {
        const filteredChildren = node.children.map(filterTree).filter(Boolean) as EmployeeNode[];
        const matchesDept = node.department === filterDept || filterDept === "ALL";
        if (matchesDept || filteredChildren.length > 0) {
          return { ...node, children: filteredChildren };
        }
        return null;
      };
      return filterTree(root);
    }).filter(Boolean) as EmployeeNode[];
  }, [employees, filterDept]);

  // ── Toggle collapse ─────────────────────────────────────────
  const toggleCollapse = (id: string) => {
    setCollapsed(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (collapsed.size > 0) {
      setCollapsed(new Set());
    } else {
      const all = new Set<string>();
      for (const n of allNodes) {
        if (n._depth >= 1 && n.children.length > 0) all.add(n.id);
      }
      setCollapsed(all);
    }
  };

  // ── Export ───────────────────────────────────────────────────
  const handleExport = () => {
    const headers = "Name,Employee ID,Job Title,Department,Manager,Status\n";
    const rows = allNodes.map(n => {
      const mgr = n.managerId ? allNodes.find(m => m.id === n.managerId) : null;
      return `"${n.name}","${n.employeeCode}","${n.jobTitle}","${n.department}","${mgr?.name || ""}","${n.status}"`;
    }).join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "org-chart.csv";
    a.click(); URL.revokeObjectURL(url);
    toast("Exported CSV", "success");
  };

  // ── Grid view ───────────────────────────────────────────────
  const groupedByDept = useMemo(() => {
    const groups: Record<string, EmployeeNode[]> = {};
    for (const n of allNodes) {
      if (!groups[n.department]) groups[n.department] = [];
      groups[n.department].push(n);
    }
    return groups;
  }, [allNodes]);

  // ── Loading ──
  if (loading && allNodes.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <span className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <span className="text-sm text-slate-500">Organizing company hierarchy...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20">
      {/* ── Breadcrumb ────────────────────────────────── */}
      <nav className="flex items-center gap-1.5 text-xs text-slate-500">
        <Link href="/dashboard" className="flex items-center gap-1 hover:text-slate-800 transition-colors">
          <Home size={12} />
          <span>Dashboard</span>
        </Link>
        <ChevronRight size={10} className="text-slate-300" />
        <Link href="/dashboard/human-resources" className="hover:text-slate-800 transition-colors">
          Human Resources
        </Link>
        <ChevronRight size={10} className="text-slate-300" />
        <span className="text-slate-900 font-semibold">Organizational Chart</span>
      </nav>

      {/* ── Header ─────────────────────────────────────── */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
              <Users size={22} className="text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">Organizational Chart</h1>
              <p className="text-sm text-slate-400 mt-0.5">{allNodes.length} employees across {departments.length - 1} departments</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* View toggle */}
            <div className="flex bg-white/10 rounded-lg p-0.5">
              <button
                onClick={() => setViewMode("tree")}
                className={`px-2.5 py-1.5 rounded-[7px] text-[10px] font-semibold transition-all ${viewMode === "tree" ? "bg-white text-slate-900" : "text-white/60 hover:text-white"}`}
              >
                Tree
              </button>
              <button
                onClick={() => setViewMode("grid")}
                className={`px-2.5 py-1.5 rounded-[7px] text-[10px] font-semibold transition-all ${viewMode === "grid" ? "bg-white text-slate-900" : "text-white/60 hover:text-white"}`}
              >
                Grid
              </button>
            </div>
            <button onClick={toggleAll} className="px-2.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-[10px] font-semibold transition-colors border border-white/10 flex items-center gap-1">
              <ChevronsUpDown size={11} /> {collapsed.size > 0 ? "Expand All" : "Collapse All"}
            </button>
            <button onClick={handleExport} className="px-2.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-[10px] font-semibold transition-colors border border-white/10 flex items-center gap-1">
              <Download size={11} /> CSV
            </button>
            <button onClick={loadEmployees} className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
              <RefreshCw size={11} className={loading ? "animate-spin" : ""} />
            </button>
          </div>
        </div>
      </div>

      {/* ── Search & Filters ───────────────────────────── */}
      <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <div className="relative flex-1 max-w-xs">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search employee name, title, department..."
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-slate-900 placeholder:text-slate-400"
            />
          </div>
          <div className="flex gap-2">
            <select value={filterDept} onChange={e => setFilterDept(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-900 bg-white">
              {departments.map(d => <option key={d} value={d}>{d === "ALL" ? "All Departments" : d}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* ── Legend ─────────────────────────────────────── */}
      <div className="flex flex-wrap gap-1.5">
        {Object.entries(DEPT_COLORS).filter(([name]) => departments.includes(name)).map(([name, color]) => (
          <span key={name} className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-[9px] font-semibold ${color.light}`}>
            <span className={`w-2 h-2 rounded-full ${color.bg}`} />
            {name}
          </span>
        ))}
      </div>

      {/* ══════════════════════════════════════════════════ */}
      {/* TREE VIEW                                           */}
      {/* ══════════════════════════════════════════════════ */}
      {viewMode === "tree" ? (
        <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-6 overflow-x-auto">
          {filteredRoots.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-14 h-14 rounded-full bg-slate-50 flex items-center justify-center mx-auto mb-3">
                <Building2 size={24} className="text-slate-300" />
              </div>
              <p className="text-sm font-semibold text-slate-500">No employees found</p>
              <p className="text-xs text-slate-400 mt-1">Try adjusting your search or filters</p>
            </div>
          ) : (
            <div className="flex justify-center gap-8" style={{ transform: `scale(${zoom})`, transformOrigin: "top center" }}>
              {filteredRoots.map(root => (
                <div key={root.id} className="flex flex-col items-center">
                  <OrgTreeNode
                    node={root}
                    collapsedSet={collapsed}
                    onToggle={toggleCollapse}
                    onClick={setSelectedEmp}
                    searchTerm={search}
                    depth={0}
                  />
                </div>
              ))}
            </div>
          )}

          {/* Zoom controls */}
          <div className="flex items-center justify-center gap-2 mt-6 pt-4 border-t border-slate-100">
            <button onClick={() => setZoom(z => Math.max(0.5, z - 0.1))} className="w-7 h-7 rounded-lg border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition-colors">
              <ZoomOut size={12} className="text-slate-500" />
            </button>
            <span className="text-xs font-semibold text-slate-500 min-w-[40px] text-center">{Math.round(zoom * 100)}%</span>
            <button onClick={() => setZoom(z => Math.min(1.5, z + 0.1))} className="w-7 h-7 rounded-lg border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition-colors">
              <ZoomIn size={12} className="text-slate-500" />
            </button>
            <button onClick={() => setZoom(1)} className="ml-2 px-2 py-1 rounded-lg border border-slate-200 text-[10px] font-medium text-slate-500 hover:bg-slate-50 transition-colors">
              Reset
            </button>
          </div>
        </div>
      ) : (
        /* ══════════════════════════════════════════════════ */
        /* GRID VIEW (by department)                           */
        /* ══════════════════════════════════════════════════ */
        <div className="space-y-6">
          {Object.entries(groupedByDept)
            .filter(([dept]) => filterDept === "ALL" || dept === filterDept)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([dept, emps]) => {
              const color = getDeptColor(dept);
              return (
                <motion.div
                  key={dept}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden"
                >
                  <div className={`${color.light} px-5 py-3 border-b border-slate-100 flex items-center justify-between`}>
                    <div className="flex items-center gap-2.5">
                      <div className={`w-3 h-3 rounded-full ${color.bg}`} />
                      <h3 className="text-sm font-bold text-slate-900">{dept}</h3>
                      <span className="text-xs text-slate-400 font-medium">({emps.length})</span>
                    </div>
                  </div>
                  <div className="p-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                    {emps.map(emp => (
                      <motion.button
                        key={emp.id}
                        whileHover={{ y: -2 }}
                        onClick={() => setSelectedEmp(emp)}
                        className="text-left bg-white border border-slate-100 rounded-xl p-3 hover:shadow-md transition-all"
                      >
                        <div className="flex items-center gap-2.5 mb-2">
                          <Avatar name={emp.name} size="sm" />
                          <div className="flex-1 min-w-0">
                            <p className="text-[11px] font-bold text-slate-900 truncate">{emp.name}</p>
                            <p className="text-[9px] text-slate-500 truncate">{emp.jobTitle}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className={`text-[8px] font-semibold px-1.5 py-0.5 rounded ${color.light} truncate max-w-full`}>
                            {emp.employeeCode}
                          </span>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              );
            })}
        </div>
      )}

      {/* ── Employee Detail Modal ───────────────────────── */}
      <AnimatePresence>
        {selectedEmp && <DetailPopup emp={selectedEmp} onClose={() => setSelectedEmp(null)} />}
      </AnimatePresence>
    </div>
  );
}

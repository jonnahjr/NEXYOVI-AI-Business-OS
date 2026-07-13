"use client";

import { motion } from "framer-motion";
import { ArrowUp, ArrowDown, Minus, FileText, GitBranch, ScanText, Search, PenTool, LayoutTemplate, FileDown } from "lucide-react";

// ── AVATAR ───────────────────────────────────────────────
export function Avatar({ name, size = "sm" }: { name: string; size?: "sm" | "md" }) {
  const dims = size === "md" ? "w-8 h-8 text-xs" : "w-6 h-6 text-[9px]";
  const initials = name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();
  return (
    <div className={`${dims} rounded-full bg-gradient-to-br from-slate-800 to-slate-600 flex items-center justify-center font-bold text-white shrink-0`}>
      {initials}
    </div>
  );
}

// ── BADGE ────────────────────────────────────────────────
export function Badge({ value }: { value: string }) {
  const defaults: Record<string, string> = {
    "Signed": "bg-emerald-100 text-emerald-700",
    "Pending": "bg-amber-100 text-amber-700",
    "Pending Signature": "bg-amber-50 text-amber-700",
    "Declined": "bg-red-50 text-red-700",
    "Expired": "bg-slate-100 text-slate-500",
    "Draft": "bg-slate-100 text-slate-600",
    "Final": "bg-blue-50 text-blue-700",
    "Under Review": "bg-amber-50 text-amber-700",
    "Archived": "bg-slate-100 text-slate-500",
    "Completed": "bg-emerald-100 text-emerald-700",
    "Processing": "bg-blue-100 text-blue-700",
    "Indexed": "bg-indigo-100 text-indigo-700",
    "Not Indexed": "bg-slate-100 text-slate-500",
    "Generated": "bg-emerald-100 text-emerald-700",
    "Active": "bg-emerald-100 text-emerald-700",
    "Up": "bg-emerald-50 text-emerald-700",
    "Down": "bg-red-50 text-red-700",
    "Stable": "bg-slate-100 text-slate-600",
    "PDF": "bg-red-50 text-red-600",
    "DOCX": "bg-blue-50 text-blue-600",
    "XLSX": "bg-emerald-50 text-emerald-600",
    "Image": "bg-amber-50 text-amber-600",
    "Passed": "bg-emerald-50 text-emerald-700",
    "Failed": "bg-red-50 text-red-700",
  };
  const cls = defaults[value] || "bg-slate-100 text-slate-700";
  return <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ${cls}`}>{value}</span>;
}

// ── TREND ICON ───────────────────────────────────────────
export function TrendIcon({ trend }: { trend: string }) {
  if (trend === "Up") return <ArrowUp size={12} className="text-emerald-500" />;
  if (trend === "Down") return <ArrowDown size={12} className="text-red-500" />;
  return <Minus size={12} className="text-slate-400" />;
}

// ── PROGRESS BAR ─────────────────────────────────────────
export function ProgressBar({ pct, size = "md" }: { pct: number; size?: "sm" | "md" | "lg" }) {
  const h = size === "lg" ? "h-3" : size === "sm" ? "h-1.5" : "h-2";
  const color = pct >= 100 ? "bg-emerald-500" : pct >= 70 ? "bg-blue-500" : pct >= 40 ? "bg-amber-500" : "bg-red-500";
  return (
    <div className={`w-full ${h} bg-slate-100 rounded-full overflow-hidden`}>
      <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min(100, Math.max(0, pct))}%` }} transition={{ duration: 0.6 }}
        className={`h-full rounded-full ${color}`} />
    </div>
  );
}

// ── FILE TYPE ICON ───────────────────────────────────────
export function FileTypeIcon({ type }: { type: string }) {
  const t = (type || "").toUpperCase();
  const cls = "w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold";
  if (t === "PDF") return <div className={`${cls} bg-red-50 text-red-600`}>PDF</div>;
  if (t === "DOCX" || t === "DOC") return <div className={`${cls} bg-blue-50 text-blue-600`}>DOC</div>;
  if (t === "XLSX" || t === "XLS" || t === "CSV") return <div className={`${cls} bg-emerald-50 text-emerald-600`}>XLS</div>;
  if (t === "PPTX" || t === "PPT") return <div className={`${cls} bg-orange-50 text-orange-600`}>PPT</div>;
  if (t === "PNG" || t === "JPG" || t === "JPEG" || t === "GIF" || t === "SVG") return <div className={`${cls} bg-amber-50 text-amber-600`}>IMG</div>;
  return <div className={`${cls} bg-slate-50 text-slate-500`}>FILE</div>;
}

// ── TAB TYPES ────────────────────────────────────────────
export type TabId = "storage" | "versions" | "ocr" | "ai-search" | "signatures" | "templates" | "pdf";

export interface TabDef {
  id: TabId;
  label: string;
  icon: React.ElementType;
  color: string;
  apiSlug: string;
}

export const TABS: TabDef[] = [
  { id: "storage",    label: "File Storage",       icon: FileText,       color: "text-sky-600 bg-sky-50",     apiSlug: "file-storage" },
  { id: "versions",   label: "Version Control",    icon: GitBranch,      color: "text-violet-600 bg-violet-50",apiSlug: "version-control" },
  { id: "ocr",        label: "OCR",                icon: ScanText,       color: "text-amber-600 bg-amber-50",  apiSlug: "ocr" },
  { id: "ai-search",  label: "AI Document Search", icon: Search,         color: "text-indigo-600 bg-indigo-50",apiSlug: "ai-document-search" },
  { id: "signatures", label: "Digital Signatures", icon: PenTool,        color: "text-emerald-600 bg-emerald-50",apiSlug: "digital-signatures" },
  { id: "templates",  label: "Templates",           icon: LayoutTemplate,color: "text-orange-600 bg-orange-50", apiSlug: "templates" },
  { id: "pdf",        label: "PDF Generation",      icon: FileDown,      color: "text-rose-600 bg-rose-50",   apiSlug: "pdf-generation" },
];

// ── FIELD TYPES ──────────────────────────────────────────
export interface FieldDef {
  key: string;
  label: string;
  type: "text" | "number" | "date" | "select" | "textarea";
  options?: string[];
  required?: boolean;
}

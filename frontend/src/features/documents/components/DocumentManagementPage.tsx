"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import NextLink from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText, GitBranch, ScanText, Search,
  PenTool, LayoutTemplate, FileDown,
  Search as SearchIcon, Plus, Eye, Pencil, Trash2, X,
  CheckCircle, AlertTriangle, TrendingUp, Zap,
  Filter, RefreshCw, ArrowUp, ArrowDown, Minus,
  Upload, FileType, HardDrive, Download, Link,
  FolderOpen, Sparkles,
} from "lucide-react";
import { useToast } from "@/components/ui/Toast";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { jsPDF } from "jspdf";
import { useDocumentData } from "../hooks/useDocumentData";
import { useDocumentCrud } from "../hooks/useDocumentCrud";
import { useDocumentUpload } from "../hooks/useDocumentUpload";
import { useEntitySearch } from "../hooks/useEntitySearch";
import {
  useDocumentKpis,
  useStorageAnalytics,
  useVersionAnalytics,
  useOcrAnalytics,
  useAiAnalytics,
  useSigAnalytics,
  useTemplateAnalytics,
  usePdfAnalytics,
} from "../hooks/useDocumentAnalytics";
import { renderDocPages, drawDashboardPage } from "../utils/pdf-renderer";
import type { TabId, TabDef, FieldDef, EntityRef } from "../types/documents";
import { ENTITY_MODULES } from "../types/documents";

// ── TAB CONFIGURATION ──────────────────────────────────────────
const TABS: TabDef[] = [
  { id: "storage",    label: "File Storage",       icon: FileText,       color: "text-sky-600 bg-sky-50",     apiSlug: "file-storage" },
  { id: "versions",   label: "Version Control",    icon: GitBranch,      color: "text-violet-600 bg-violet-50",apiSlug: "version-control" },
  { id: "ocr",        label: "OCR",                icon: ScanText,       color: "text-amber-600 bg-amber-50",  apiSlug: "ocr" },
  { id: "ai-search",  label: "AI Document Search", icon: Search,         color: "text-indigo-600 bg-indigo-50",apiSlug: "ai-document-search" },
  { id: "signatures", label: "Digital Signatures", icon: PenTool,        color: "text-emerald-600 bg-emerald-50",apiSlug: "digital-signatures" },
  { id: "templates",  label: "Templates",           icon: LayoutTemplate,color: "text-orange-600 bg-orange-50", apiSlug: "templates" },
  { id: "pdf",        label: "PDF Generation",      icon: FileDown,      color: "text-rose-600 bg-rose-50",   apiSlug: "pdf-generation" },
];

const TAB_FIELDS: Record<TabId, FieldDef[]> = {
  storage: [
    { key: "title", label: "Document Name", type: "text", required: true },
    { key: "fileType", label: "File Type", type: "select", options: ["PDF", "DOCX", "XLSX", "PPTX", "Image", "Video", "Audio", "Archive", "Other"] },
    { key: "size", label: "File Size", type: "text" },
    { key: "category", label: "Category", type: "select", options: ["General", "Contract", "Report", "Invoice", "Proposal", "Legal", "HR", "Financial", "Technical", "Marketing", "Training", "Other"] },
    { key: "owner", label: "Owner", type: "text" },
    { key: "tags", label: "Tags", type: "text" },
    { key: "status", label: "Status", type: "select", options: ["Draft", "Final", "Under Review", "Archived"] },
  ],
  versions: [
    { key: "version", label: "Version Number", type: "number" },
    { key: "fileType", label: "File Type", type: "select", options: ["PDF", "DOCX", "XLSX", "PPTX", "Image", "Video", "Audio", "Archive", "Other"] },
    { key: "status", label: "Status", type: "select", options: ["Draft", "Under Review", "Approved", "Deprecated"] },
    { key: "size", label: "File Size (bytes)", type: "text" },
    { key: "changeLog", label: "Change Log", type: "textarea" },
    { key: "createdBy", label: "Created By", type: "text" },
    { key: "approvedBy", label: "Approved By", type: "text" },
    { key: "tags", label: "Tags", type: "text" },
    { key: "fileUrl", label: "File URL", type: "text" },
  ],
  ocr: [
    { key: "document", label: "Document", type: "text", required: true },
    { key: "fileType", label: "File Type", type: "select", options: ["PDF", "Image", "DOCX", "Other"] },
    { key: "language", label: "Language", type: "text" },
    { key: "status", label: "Status", type: "select", options: ["Pending", "Processing", "Completed", "Failed"] },
  ],
  "ai-search": [
    { key: "document", label: "Document", type: "text", required: true },
    { key: "fileType", label: "File Type", type: "text" },
    { key: "status", label: "Index Status", type: "select", options: ["Indexed", "Not Indexed"] },
  ],
  signatures: [
    { key: "requestName", label: "Request Name", type: "text", required: true },
    { key: "document", label: "Document", type: "text" },
    { key: "signerName", label: "Signer Name", type: "text" },
    { key: "signerEmail", label: "Signer Email", type: "text" },
    { key: "status", label: "Status", type: "select", options: ["Pending", "Signed", "Declined", "Expired"] },
    { key: "notes", label: "Notes", type: "textarea" },
  ],
  templates: [
    { key: "name", label: "Template Name", type: "text", required: true },
    { key: "category", label: "Category", type: "select", options: ["General", "Contract", "Report", "Invoice", "Letter", "Form", "Proposal", "Other"] },
    { key: "description", label: "Description", type: "textarea" },
    { key: "variables", label: "Variables", type: "text" },
  ],
  pdf: [
    { key: "document", label: "Document", type: "text", required: true },
    { key: "fileType", label: "Source Format", type: "text" },
    { key: "size", label: "File Size", type: "text" },
    { key: "format", label: "Output Format", type: "select", options: ["PDF", "PDF (Converted)"] },
    { key: "status", label: "Status", type: "select", options: ["Draft", "Generated"] },
  ],
};

// ── HELPERS ──────────────────────────────────────────────────
/** Format bytes to human-readable KB/MB/GB */
function formatBytes(bytes: number | string | null | undefined): string {
  if (bytes == null || bytes === "" || bytes === 0) return "N/A";
  const num = typeof bytes === "string" ? parseFloat(bytes) || 0 : bytes;
  if (isNaN(num) || num <= 0) return "N/A";
  if (num >= 1024 * 1024 * 1024) return `${(num / (1024 * 1024 * 1024)).toFixed(1)} GB`;
  if (num >= 1024 * 1024) return `${(num / (1024 * 1024)).toFixed(1)} MB`;
  if (num >= 1024) return `${(num / 1024).toFixed(1)} KB`;
  return `${num} B`;
}

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
    Signed: "bg-emerald-100 text-emerald-700", Pending: "bg-amber-100 text-amber-700",
    Declined: "bg-red-50 text-red-700", Expired: "bg-slate-100 text-slate-500",
    Draft: "bg-slate-100 text-slate-600", Final: "bg-blue-50 text-blue-700",
    "Under Review": "bg-amber-50 text-amber-700", Archived: "bg-slate-100 text-slate-500",
    Completed: "bg-emerald-100 text-emerald-700", Processing: "bg-blue-100 text-blue-700",
    Indexed: "bg-indigo-100 text-indigo-700", "Not Indexed": "bg-slate-100 text-slate-500",
    Generated: "bg-emerald-100 text-emerald-700", Active: "bg-emerald-100 text-emerald-700",
    Up: "bg-emerald-50 text-emerald-700", Down: "bg-red-50 text-red-700",
    Stable: "bg-slate-100 text-slate-600", PDF: "bg-red-50 text-red-600",
    DOCX: "bg-blue-50 text-blue-600", XLSX: "bg-emerald-50 text-emerald-600",
    Image: "bg-amber-50 text-amber-600", Passed: "bg-emerald-50 text-emerald-700",
    Failed: "bg-red-50 text-red-700",
  };
  return <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ${defaults[value] || "bg-slate-100 text-slate-700"}`}>{value}</span>;
}

function FileTypeIcon({ type }: { type: string }) {
  const t = (type || "").toUpperCase();
  const cls = "w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold";
  if (t === "PDF") return <div className={`${cls} bg-red-50 text-red-600`}>PDF</div>;
  if (["DOCX", "DOC"].includes(t)) return <div className={`${cls} bg-blue-50 text-blue-600`}>DOC</div>;
  if (["XLSX", "XLS", "CSV"].includes(t)) return <div className={`${cls} bg-emerald-50 text-emerald-600`}>XLS</div>;
  if (["PPTX", "PPT"].includes(t)) return <div className={`${cls} bg-orange-50 text-orange-600`}>PPT</div>;
  if (["PNG", "JPG", "JPEG", "GIF", "SVG"].includes(t)) return <div className={`${cls} bg-amber-50 text-amber-600`}>IMG</div>;
  return <div className={`${cls} bg-slate-50 text-slate-500`}>FILE</div>;
}

// ── MAIN COMPONENT ────────────────────────────────────────────
interface Props {
  pillarSlug: string;
  moduleSlug: string;
}

export default function DocumentManagementPage({ pillarSlug, moduleSlug }: Props) {
  const slugToTab: Record<string, TabId> = {
    "file-storage": "storage", "version-control": "versions", "ocr": "ocr",
    "ai-document-search": "ai-search", "digital-signatures": "signatures",
    "templates": "templates", "pdf-generation": "pdf",
  };

  const [activeTab, setActiveTab] = useState<TabId>(slugToTab[moduleSlug] || "storage");
  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  // ── Data hook ──────────────────────────────────────────────
  const {
    storageData, versionsData, ocrData, aiSearchData,
    signaturesData, templatesData, pdfData, isLoading, loadData, getApiUrl,
  } = useDocumentData(pillarSlug);

  // ── CRUD hook ──────────────────────────────────────────────
  const crud = useDocumentCrud(getApiUrl, loadData, toast);

  // ── Upload hook ─────────────────────────────────────────────
  const upload = useDocumentUpload(getApiUrl, loadData, toast);

  // ── Entity search hook (cross-module integration) ──────────
  const entitySearch = useEntitySearch();

  // ── Resolve linked entities for storage data ───────────────
  const [linkedEntityNames, setLinkedEntityNames] = useState<Record<string, string>>({});
  const resolveEntityRef = useRef(entitySearch.resolveEntity);
  resolveEntityRef.current = entitySearch.resolveEntity;

  useEffect(() => {
    const resolve = async () => {
      const map: Record<string, string> = {};
      for (const doc of storageData) {
        if (doc.referenceType && doc.referenceId && !map[doc.id]) {
          const ref = await resolveEntityRef.current(doc.referenceType, doc.referenceId);
          if (ref) {
            map[doc.id] = ref.name;
          }
        }
      }
      setLinkedEntityNames(map);
    };
    resolve();
  }, [storageData]);

  // ── Analytics hooks ───────────────────────────────────────
  const kpis = useDocumentKpis(storageData, signaturesData, ocrData, templatesData, aiSearchData);
  const storageAnalytics = useStorageAnalytics(storageData);
  const versionAnalytics = useVersionAnalytics(versionsData);
  const ocrAnalytics = useOcrAnalytics(ocrData);
  const aiAnalytics = useAiAnalytics(aiSearchData);
  const sigAnalytics = useSigAnalytics(signaturesData);
  const templateAnalytics = useTemplateAnalytics(templatesData);
  const pdfAnalytics = usePdfAnalytics(pdfData);

  const activeTabDef = TABS.find(t => t.id === activeTab)!;
  const Icon = activeTabDef.icon;

  // ── Derived data ───────────────────────────────────────────
  const deepSearch = (obj: any, term: string): boolean => {
    const lower = term.toLowerCase();
    if (!obj || term === "") return true;
    if (typeof obj === "string") return obj.toLowerCase().includes(lower);
    if (typeof obj === "number") return String(obj).toLowerCase().includes(lower);
    if (Array.isArray(obj)) return obj.some(item => deepSearch(item, term));
    if (typeof obj === "object") return Object.values(obj).some(v => deepSearch(v, term));
    return false;
  };

  const filtered = useCallback(
    (data: any[]) => data.filter((d: any) => deepSearch(d, search)),
    [search]
  );

  const toggleSelectAll = useCallback(
    (ids: string[]) => {
      setSelectedIds(prev => (prev.size === ids.length ? new Set() : new Set(ids)));
    },
    []
  );

  // ── PDF generation ────────────────────────────────────────
  const generatePdf = useCallback(
    async (doc: any) => {
      crud.setGeneratingPdfId(doc.id);
      try {
        const pdf = new jsPDF("p", "mm", "a4");
        const ps = { pageNum: 1 };
        renderDocPages(pdf, doc, ps, {
          storageData, versionsData, signaturesData, ocrData, aiSearchData,
        });
        drawDashboardPage(pdf, ps, storageData, versionsData, signaturesData, ocrData, aiSearchData, templatesData, pdfData, kpis);
        const safeName = (doc.document || doc.title || doc.name || "Document").replace(/[^a-zA-Z0-9]/g, "_") || "Document";
        pdf.save(`${safeName}.pdf`);
        toast("PDF report generated successfully", "success");
      } catch (err) {
        console.error("PDF generation error:", err);
        toast("Failed to generate PDF", "error");
      } finally {
        crud.setGeneratingPdfId(null);
      }
    },
    [storageData, versionsData, signaturesData, ocrData, aiSearchData, templatesData, pdfData, kpis, crud, toast]
  );

  const generateCombinedPdf = useCallback(
    async (docs: any[]) => {
      if (docs.length === 0) { toast("No documents selected", "info"); return; }
      crud.setGeneratingPdfId("all");
      try {
        const pdf = new jsPDF("p", "mm", "a4");
        const ps = { pageNum: 1 };
        pdf.setFillColor(15, 23, 42); pdf.rect(0, 0, 210, 297, "F");
        pdf.setTextColor(255, 255, 255); pdf.setFontSize(28); pdf.setFont("helvetica", "bold");
        pdf.text("NEXYOVI", 20, 80);
        pdf.setFontSize(10); pdf.setFont("helvetica", "normal");
        pdf.text("AI-Powered Business OS \u2022 Document Management", 20, 92);
        pdf.setDrawColor(37, 99, 235); pdf.setLineWidth(2);
        pdf.line(20, 97, 100, 97);
        pdf.setTextColor(255, 255, 255); pdf.setFontSize(18); pdf.setFont("helvetica", "bold");
        pdf.text("Combined Document Report", 20, 130);
        pdf.setFontSize(10); pdf.setFont("helvetica", "normal");
        pdf.text(`This report contains ${docs.length} document(s) with related metadata,`, 20, 145);
        pdf.text("version history, digital signatures, and AI processing status.", 20, 157);
        pdf.text(`Generated: ${new Date().toLocaleString("en-US", { dateStyle: "full", timeStyle: "short" })}`, 20, 172);

        for (const doc of docs) {
          ps.pageNum++;
          pdf.addPage();
          renderDocPages(pdf, doc, ps, {
            storageData, versionsData, signaturesData, ocrData, aiSearchData,
          });
        }
        drawDashboardPage(pdf, ps, storageData, versionsData, signaturesData, ocrData, aiSearchData, templatesData, pdfData, kpis);
        pdf.save(`Combined_Document_Report_${new Date().toISOString().split("T")[0]}.pdf`);
        toast(`Combined PDF generated: ${docs.length} document(s)`, "success");
      } catch (err) {
        console.error("Combined PDF generation error:", err);
        toast("Failed to generate combined PDF", "error");
      } finally {
        crud.setGeneratingPdfId(null);
      }
    },
    [storageData, versionsData, signaturesData, ocrData, aiSearchData, templatesData, pdfData, kpis, crud, toast]
  );

  // ── Table renderers ─────────────────────────────────────────
  const renderTable = (
    data: any[],
    headers: string[],
    renderRow: (item: any, i: number) => React.ReactNode,
    emptyMessage: string,
    rowActions?: React.ReactNode
  ) => {
    const filteredData = data.filter((d: any) => deepSearch(d, search));
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-200/70 bg-slate-50/90 backdrop-blur-sm sticky top-0 z-10">
                {headers.map(h => (
                  <th key={h} className="px-5 py-3.5 text-[11px] font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100/80">
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan={headers.length} className="text-center py-20">
                    <motion.div
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="flex flex-col items-center gap-3"
                    >
                      <div className="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center">
                        <FileText size={28} className="text-slate-300" />
                      </div>
                      <p className="text-sm text-slate-400 font-medium">{emptyMessage}</p>
                      <p className="text-xs text-slate-300">Create a new record or adjust your search filters</p>
                    </motion.div>
                  </td>
                </tr>
              ) : (
                filteredData.map((item, i) => renderRow(item, i))
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    );
  };

  // ── Form-level file upload state ───────────────────────────
  const [formUploadFile, setFormUploadFile] = useState<File | null>(null);
  const [formUploading, setFormUploading] = useState(false);
  const [formUploadProgress, setFormUploadProgress] = useState(0);
  const formUploadInputRef = useRef<HTMLInputElement>(null);

  const handleFormUpload = useCallback(async (file: File) => {
    if (!file) return;
    setFormUploadFile(file);
    setFormUploading(true);
    setFormUploadProgress(10);
    try {
      const token = localStorage.getItem("token") || "";

      // Upload file
      const fd = new FormData();
      fd.append("file", file);
      setFormUploadProgress(30);
      const res = await fetch("http://localhost:3002/api/v1/uploads/file", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });
      if (!res.ok) throw new Error("Upload failed");
      setFormUploadProgress(60);
      const data = await res.json();

      // Detect file type from extension
      const ext = file.name.split(".").pop()?.toUpperCase() || "OTHER";
      const typeMap: Record<string, string> = {
        PDF: "PDF", DOC: "DOCX", DOCX: "DOCX", XLS: "XLSX", XLSX: "XLSX",
        PPT: "PPTX", PPTX: "PPTX", PNG: "Image", JPG: "Image", JPEG: "Image",
        GIF: "Image", SVG: "Image", WEBP: "Image", MP4: "Video",
        AVI: "Video", MOV: "Video", MP3: "Audio", WAV: "Audio",
        ZIP: "Archive", RAR: "Archive", GZ: "Archive",
      };
      const fileType = typeMap[ext] || "Other";

      // Auto-fill form fields
      crud.setFormData((prev: any) => ({
        ...prev,
        fileUrl: data.url,
        fileType,
        size: file.size,
        status: prev.status || "Final",
        title: prev.title || file.name.replace(`.${file.name.split(".").pop()}`, ""),
      }));

      setFormUploadProgress(100);
      setTimeout(() => {
        setFormUploadProgress(0);
        setFormUploading(false);
      }, 600);
    } catch (err: any) {
      console.error("Form upload error:", err);
      toast(err?.message || "Failed to upload file", "error");
      setFormUploading(false);
      setFormUploadProgress(0);
    }
  }, [crud, toast]);

  // ── Linked entity search field + click-outside handler ─────
  const [entitySearchFocused, setEntitySearchFocused] = useState(false);
  const entitySearchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (entitySearchRef.current && !entitySearchRef.current.contains(e.target as Node)) {
        setEntitySearchFocused(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ── Form field renderer helper ─────────────────────────────
  const renderField = (field: FieldDef) => {
    const val = crud.formData[field.key] !== undefined ? crud.formData[field.key] : "";
    const error = crud.formErrors[field.key];
    const isViewOnly = crud.modalMode === "view";
    const baseClass = `w-full rounded-xl px-3.5 py-2.5 text-sm focus:outline-none bg-white disabled:bg-slate-50 disabled:text-slate-400 transition-all border ${
      error ? "border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-500/20" : "border-slate-200 focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
    }`;

    const updateField = (newVal: any) => {
      crud.setFormData({ ...crud.formData, [field.key]: newVal });
      if (error) {
        const next = { ...crud.formErrors };
        delete next[field.key];
        crud.setFormErrors(next);
      }
    };

    return (
      <motion.div
        key={field.key}
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-1.5"
      >
        <label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
          {field.label}
          {field.required && <span className="text-red-400 text-[13px]">*</span>}
          {!field.required && !isViewOnly && <span className="text-[10px] font-normal text-slate-400 font-normal">(optional)</span>}
        </label>
        {field.type === "select" && field.options ? (
          <select
            value={String(val)}
            onChange={e => updateField(e.target.value)}
            disabled={isViewOnly}
            className={baseClass}
          >
            <option value="">Select {field.label}...</option>
            {field.options.map(opt => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        ) : field.type === "textarea" ? (
          <textarea
            value={String(val)}
            onChange={e => updateField(e.target.value)}
            disabled={isViewOnly}
            rows={3}
            className={`${baseClass} resize-none`}
          />
        ) : (
          <input
            type={field.type === "number" ? "number" : "text"}
            value={String(val)}
            onChange={e => updateField(field.type === "number" ? parseFloat(e.target.value) || 0 : e.target.value)}
            disabled={isViewOnly}
            min={field.type === "number" ? "0" : undefined}
            className={baseClass}
          />
        )}
        {error && (
          <motion.p
            initial={{ opacity: 0, x: -4 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-[11px] text-red-500 flex items-center gap-1"
          >
            <AlertTriangle size={10} />
            {error}
          </motion.p>
        )}
      </motion.div>
    );
  };

  // ── Modal form renderer ─────────────────────────────────────
  const renderModalForm = () => {
    const fields = TAB_FIELDS[activeTab] || [];
    if (fields.length === 0) return <p className="text-sm text-slate-400 text-center py-8">No editable fields.</p>;
    const isViewOnly = crud.modalMode === "view";

    return (
      <form onSubmit={(e) => crud.handleSave(e, fields, activeTabDef.apiSlug, pillarSlug)} className="space-y-5">
        {/* Form fields section */}
        <div className="space-y-3.5 divide-y divide-slate-100">
          {fields.slice(0, 4).length > 0 && (
            <div className="pb-3">
              {fields.slice(0, 4).map((field) => renderField(field))}
            </div>
          )}
          {fields.slice(4).length > 0 && (
            <div className="pt-3">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2.5">Additional Details</p>
              {fields.slice(4).map((field) => renderField(field))}
            </div>
          )}
        </div>

        {/* File upload drop zone — storage tab only, create/edit mode */}
        {activeTab === "storage" && !isViewOnly && (
          <div className="border-t border-slate-100 pt-3.5">
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Upload File</label>
              <motion.div
                whileHover={{ scale: 1.005 }}
                onClick={() => {
                  if (formUploading) return;
                  formUploadInputRef.current?.click();
                }}
                className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all ${
                  formUploadFile
                    ? "border-emerald-300 bg-emerald-50/50 shadow-sm"
                    : "border-slate-200 hover:border-primary/40 hover:bg-slate-50/50"
                }`}
              >
                {formUploading ? (
                  <div className="flex flex-col items-center gap-3">
                    <span className="w-8 h-8 border-[3px] border-primary border-t-transparent rounded-full animate-spin" />
                    <span className="text-xs font-medium text-slate-500">Uploading... {formUploadProgress}%</span>
                    {formUploadProgress > 0 && (
                      <div className="w-full max-w-[200px] h-2 bg-slate-100 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${formUploadProgress}%` }}
                          className="h-full bg-primary rounded-full"
                        />
                      </div>
                    )}
                  </div>
                ) : formUploadFile ? (
                  <div className="flex items-center gap-3 justify-center">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                      <FileType size={20} className="text-emerald-600" />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-medium text-emerald-800 truncate max-w-[220px]">{formUploadFile.name}</p>
                      <p className="text-[11px] text-emerald-500">{(formUploadFile.size / 1024 / 1024).toFixed(1)} MB</p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setFormUploadFile(null);
                        crud.setFormData((prev: any) => ({
                          ...prev,
                          fileUrl: undefined,
                          fileType: "",
                          size: 0,
                        }));
                      }}
                      className="ml-2 w-8 h-8 rounded-lg hover:bg-red-50 flex items-center justify-center text-slate-400 hover:text-red-500 transition-colors"
                    ><X size={14} /></button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center">
                      <Upload size={24} className="text-slate-300" />
                    </div>
                    <p className="text-sm font-medium text-slate-500">Click to select a file</p>
                    <p className="text-[11px] text-slate-400">PDF, DOCX, Images &mdash; Max 10MB</p>
                  </div>
                )}
                <input
                  ref={formUploadInputRef}
                  type="file"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleFormUpload(f);
                    if (e.target) e.target.value = "";
                  }}
                />
              </motion.div>
              {crud.formData.fileUrl && !formUploadFile && !formUploading && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-1.5 mt-1.5 text-[11px] text-emerald-600 font-medium"
                >
                  <CheckCircle size={12} />
                  <span className="truncate">File uploaded: {crud.formData.fileUrl.slice(0, 40)}...</span>
                </motion.div>
              )}
            </div>
          </div>
        )}

        {/* Cross-module linked entity field (storage tab only) */}
        {activeTab === "storage" && (
          <div className="border-t border-slate-100 pt-3.5">
            <div className="flex flex-col gap-1" ref={entitySearchRef}>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Linked Entity
              </label>
              <p className="text-[11px] text-slate-400 mt-[-2px] mb-1">Connect this document to a Customer, Employee, or Project</p>
              {isViewOnly ? (
                <div className="px-3 py-2.5 text-sm text-slate-600 bg-slate-50 rounded-xl border border-slate-100">
                  {crud.formData.referenceType && crud.formData.referenceId ? (
                    <span className="inline-flex items-center gap-1.5 text-indigo-700 font-medium">
                      <Link size={13} className="text-indigo-400" />
                      {crud.formData.referenceType}: {crud.formData.referenceId.slice(0, 8)}...
                    </span>
                  ) : (
                    <span className="text-slate-400 italic">No linked entity</span>
                  )}
                </div>
              ) : (
                <>
                  <div className="relative">
                    <input
                      value={entitySearch.searchTerm}
                      onChange={e => entitySearch.search(e.target.value)}
                      onFocus={() => setEntitySearchFocused(true)}
                      placeholder="Search across all modules..."
                      className="w-full rounded-xl pl-9 pr-10 py-2.5 text-sm border border-slate-200 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/10 transition-all"
                    />
                    <Link size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    {crud.formData.referenceType && crud.formData.referenceId && entitySearch.searchTerm.length < 2 && (
                      <button
                        onClick={() => {
                          crud.setFormData({ ...crud.formData, referenceType: undefined, referenceId: undefined });
                          entitySearch.clearSearch();
                        }}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-red-500 transition-colors"
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>
                  <AnimatePresence>
                    {entitySearchFocused && entitySearch.searchTerm.length >= 2 && (
                      <motion.div
                        initial={{ opacity: 0, y: -4, height: 0 }}
                        animate={{ opacity: 1, y: 0, height: "auto" }}
                        exit={{ opacity: 0, y: -4, height: 0 }}
                        className="mt-1 max-h-44 overflow-y-auto bg-white border border-slate-200 rounded-xl shadow-lg"
                      >
                        {entitySearch.isSearching ? (
                          <div className="p-4 text-xs text-slate-400 text-center flex items-center justify-center gap-2">
                            <span className="w-3 h-3 border-2 border-slate-300 border-t-transparent rounded-full animate-spin" />
                            Searching...
                          </div>
                        ) : entitySearch.results.length === 0 ? (
                          <div className="p-4 text-xs text-slate-400 text-center">No results found</div>
                        ) : (
                          entitySearch.results.map((ref: EntityRef, idx: number) => (
                            <button
                              key={`${ref.type}-${ref.id}`}
                              onClick={() => {
                                crud.setFormData({
                                  ...crud.formData,
                                  referenceType: ref.type,
                                  referenceId: ref.id,
                                });
                                entitySearch.clearSearch();
                                setEntitySearchFocused(false);
                              }}
                              className={`w-full text-left px-4 py-2.5 hover:bg-indigo-50/80 transition-colors flex items-center gap-3 text-sm ${
                                idx > 0 ? "border-t border-slate-100" : ""
                              }`}
                            >
                              <div className="w-6 h-6 rounded-lg bg-indigo-50 flex items-center justify-center">
                                <Link size={12} className="text-indigo-500" />
                              </div>
                              <span className="font-medium text-slate-800 flex-1">{ref.name}</span>
                              <span className="text-[10px] font-medium text-slate-400 uppercase px-2 py-0.5 rounded-md bg-slate-50">{ref.type}</span>
                            </button>
                          ))
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                  {crud.formData.referenceType && crud.formData.referenceId && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-indigo-50/80 border border-indigo-100 text-indigo-700 text-xs font-medium mt-2 self-start"
                    >
                      <Link size={11} />
                      Linked to {crud.formData.referenceType}: {crud.formData.referenceId.slice(0, 8)}...
                    </motion.div>
                  )}
                </>
              )}
            </div>
          </div>
        )}

        {!isViewOnly && (
          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="button"
              onClick={() => { crud.setModalOpen(false); setFormUploadFile(null); setFormUploading(false); setFormUploadProgress(0); }}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={crud.isSaving}
              className="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-black text-sm font-bold transition-colors disabled:opacity-40 flex items-center gap-2 shadow-sm"
            >
              {crud.isSaving && (
                <motion.span
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                  className="w-4 h-4 border-2 border-black border-t-transparent rounded-full"
                />
              )}
              {crud.modalMode === "edit" ? "Update" : "Create"}
            </motion.button>
          </div>
        )}
      </form>
    );
  };

  // ── PDF Button component ────────────────────────────────────
  const PdfButton = ({ doc }: { doc: any }) => (
    <button onClick={() => generatePdf(doc)} disabled={crud.generatingPdfId === doc.id}
      className="w-7 h-7 rounded-lg hover:bg-rose-50 flex items-center justify-center text-slate-400 hover:text-rose-600 transition-colors disabled:opacity-40" title="Generate PDF Report">
      {crud.generatingPdfId === doc.id ? <span className="w-3 h-3 border-2 border-rose-400 border-t-transparent rounded-full animate-spin" /> : <FileDown size={13} />}
    </button>
  );

  // ── Per-row PDF file upload ─────────────────────────────────
  const [uploadingRowId, setUploadingRowId] = useState<string | null>(null);
  const uploadDocIdRef = useRef<string>("");
  const uploadApiSlugRef = useRef<string>("file-storage");
  const uploadInputRef = useRef<HTMLInputElement>(null);

  const handleRowUpload = useCallback(
    async (file: File, docId: string, apiSlug: string) => {
      if (!file) return;
      setUploadingRowId(docId);
      try {
        const token = localStorage.getItem("token") || "";

        // 1) Upload physical file
        const formData = new FormData();
        formData.append("file", file);
        const uploadRes = await fetch(
          "http://localhost:3002/api/v1/uploads/file",
          {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` },
            body: formData,
          }
        );
        if (!uploadRes.ok) {
          const errData = await uploadRes.json().catch(() => ({}));
          throw new Error(errData?.message || "Upload failed");
        }
        const uploadData = await uploadRes.json();

        // 2) Compute file metadata
        const fileExt =
          file.name.split(".").pop()?.toUpperCase() || "OTHER";
        const typeMap: Record<string, string> = {
          PDF: "PDF", DOC: "DOCX", DOCX: "DOCX",
          XLS: "XLSX", XLSX: "XLSX", PPT: "PPTX", PPTX: "PPTX",
          PNG: "Image", JPG: "Image", JPEG: "Image",
          GIF: "Image", SVG: "Image", WEBP: "Image",
        };
        const fileType = typeMap[fileExt] || "Other";

        // 3) Update the existing document record with file info
        // size is sent as integer bytes for Prisma compatibility
        const updatePayload: Record<string, any> = {
          fileUrl: uploadData.url,
          fileType,
          size: file.size,
          status: "Final",
        };

        const updateRes = await fetch(`${getApiUrl(apiSlug)}/${docId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(updatePayload),
        });

        if (!updateRes.ok) {
          console.warn("File uploaded but record update failed");
          toast("File uploaded to server but record couldn't be updated", "info");
        } else {
          toast("File uploaded and saved to record", "success");
        }

        setTimeout(() => {
          setUploadingRowId(null);
          loadData();
        }, 400);
      } catch (err: any) {
        console.error("Row upload error:", err);
        toast(err?.message || "Failed to upload file", "error");
        setUploadingRowId(null);
      }
    },
    [getApiUrl, loadData, toast]
  );

  // Single hidden file input shared by all row upload buttons
  // We use refs (not state) to pass the target doc/API-slug to avoid stale closures
  const triggerRowUpload = (docId: string, apiSlug: string) => {
    uploadDocIdRef.current = docId;
    uploadApiSlugRef.current = apiSlug;
    if (uploadInputRef.current) {
      uploadInputRef.current.value = "";
      uploadInputRef.current.click();
    }
  };

  // ── RENDER ─────────────────────────────────────────────────
  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl ${activeTabDef.color} flex items-center justify-center`}><Icon size={20} /></div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{activeTabDef.label}</h1>
            <p className="text-sm text-slate-400">Document Management · {TABS.length} modules integrated</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => { loadData(); toast("Data refreshed", "success"); }}
            className="flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors">
            <RefreshCw size={13} /> Refresh
          </button>
          <button onClick={() => {
            const fields = TAB_FIELDS[activeTab] || [];
            const overrides: Record<string, any> = {};
            if (activeTab === "storage") overrides.status = "Draft";
            if (activeTab === "ocr") overrides.status = "Pending";
            if (activeTab === "ai-search") overrides.status = "Not Indexed";
            if (activeTab === "signatures") overrides.status = "Pending";
            if (activeTab === "templates") overrides.category = "General";
            if (activeTab === "pdf") { overrides.status = "Draft"; overrides.format = "PDF"; }
            crud.handleOpenModal("create", null, fields, activeTab, overrides);
          }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary hover:bg-primary/90 text-black text-xs font-bold transition-all">
            <Plus size={13} /> New
          </button>
        </div>
      </div>

      {/* KPI Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        {[
          { icon: FileText, label: "Total Documents", value: kpis.totalDocs, color: "text-slate-900" },
          { icon: HardDrive, label: "Storage Used", value: formatBytes(kpis.totalSize), color: "text-slate-900" },
          { icon: AlertTriangle, label: "Pending Signatures", value: kpis.pendingSigs, color: "text-amber-600" },
          { icon: CheckCircle, label: "Signed", value: kpis.signedDocs, color: "text-emerald-600" },
          { icon: ScanText, label: "OCR Completed", value: kpis.ocrCompleted, color: "text-blue-600" },
          { icon: LayoutTemplate, label: "Templates", value: kpis.templates, color: "text-orange-600" },
          { icon: Search, label: "AI Indexed", value: kpis.indexed, color: "text-indigo-600" },
        ].map((kpi, i) => (
            <motion.div key={i}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              whileHover={{ y: -2, boxShadow: "0 8px 25px rgba(0,0,0,0.06)" }}
              className="bg-white border border-slate-100 rounded-xl px-4 py-3 shadow-sm hover:shadow-md hover:border-slate-200 transition-all cursor-default"
            >
              <div className="flex items-center gap-2 text-slate-400 text-[11px] font-medium mb-1"><kpi.icon size={12} /> {kpi.label}</div>
              <div className={`text-lg font-bold ${kpi.color}`}>{kpi.value}</div>
            </motion.div>
          ))}
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-1.5 overflow-x-auto pb-2 -mx-1 px-1">
        {TABS.map(tab => (
          <button key={tab.id} onClick={() => { setActiveTab(tab.id); setSelectedIds(new Set()); }}
            className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-[10px] text-xs font-medium transition-all ${
              activeTab === tab.id ? "bg-slate-900 text-white shadow-sm" : "bg-white border border-slate-100 text-slate-600 hover:bg-slate-50"
            }`}>
            <tab.icon size={12} /> {tab.label}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="flex gap-3">
        <div className="flex-1 relative">
          <SearchIcon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-black" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder={`Search ${activeTabDef.label.toLowerCase()}...`}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent placeholder:text-slate-400" />
        </div>
        <button onClick={() => { setSearch(""); search && toast("Search cleared", "info"); }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-colors ${search ? "bg-slate-900 text-white border-slate-900" : "border-slate-200 text-slate-600 hover:bg-slate-50"}`}>
          <Filter size={14} /> {search ? "Clear" : "Filter"}
        </button>
      </div>

      {/* Loading */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-3">
          <span className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <span className="text-sm text-slate-400">Loading documents from database...</span>
        </div>
      ) : (
        <AnimatePresence mode="wait">
          <motion.div key={activeTab} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.2 }}>
            {/* FILE STORAGE TAB */}
            {activeTab === "storage" && renderTable(
              storageData,
              ["Document", "Type", "Size", "Owner", "Linked To", "Status", "File", "Actions"],
              (d: any, i) => {
                const linkedName = linkedEntityNames[d.id];
                const refType = d.referenceType;
                return (
                <motion.tr key={d.id || i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                  className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                  <td className="px-4 py-3.5"><div className="flex items-center gap-3"><FileTypeIcon type={d.fileType || d.type} /><span className="text-sm font-medium text-slate-800">{d.name || d.title || "Untitled"}</span></div></td>
                  <td className="px-4 py-3.5"><Badge value={d.type || d.fileType || "\u2014"} /></td>
                  <td className="px-4 py-3.5"><span className="text-sm font-mono text-slate-600">{formatBytes(d.size)}</span></td>
                  <td className="px-4 py-3.5"><div className="flex items-center gap-2"><Avatar name={d.owner || "Unassigned"} /><span className="text-sm text-slate-700">{d.owner || "Unassigned"}</span></div></td>
                  <td className="px-4 py-3.5">
                    {linkedName ? (
                      <NextLink href={`/dashboard/${ENTITY_MODULES[refType]?.pillarSlug || ""}/${ENTITY_MODULES[refType]?.moduleSlug || ""}`}
                        className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 text-[11px] font-medium hover:bg-indigo-100 transition-colors"
                        title={`View in ${refType}`}>
                        <Link size={10} /> {linkedName}
                      </NextLink>
                    ) : (
                      <span className="text-sm text-slate-300 italic">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3.5"><Badge value={d.status || "Draft"} /></td>
                  <td className="px-4 py-3.5">
                    {d.fileUrl ? (
                      <a href={d.fileUrl} target="_blank" rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-sky-50 hover:bg-sky-100 text-sky-700 text-[11px] font-medium transition-colors group"
                        title={d.fileUrl}
                      >
                        <Download size={11} className="group-hover:scale-110 transition-transform" />
                        <span>Open</span>
                      </a>
                    ) : (
                      <span className="text-xs text-slate-300 italic">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3.5"><div className="flex gap-1">
                    <button onClick={() => crud.handleOpenModal("view", d, [], activeTab)} className="w-7 h-7 rounded-lg hover:bg-blue-50 flex items-center justify-center text-slate-400" title="View"><Eye size={13} /></button>
                    <button onClick={() => crud.handleOpenModal("edit", d, [], activeTab)} className="w-7 h-7 rounded-lg hover:bg-amber-50 flex items-center justify-center text-slate-400" title="Edit"><Pencil size={13} /></button>
                    <button
                      onClick={() => triggerRowUpload(d.id, "file-storage")}
                      disabled={uploadingRowId === d.id}
                      className="w-7 h-7 rounded-lg hover:bg-emerald-50 flex items-center justify-center text-slate-400 hover:text-emerald-600 transition-colors disabled:opacity-40"
                      title="Upload PDF file to this record"
                    >
                      {uploadingRowId === d.id ? (
                        <span className="w-3 h-3 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Upload size={13} />
                      )}
                    </button>
                    <PdfButton doc={d} />
                    <button onClick={() => crud.setConfirmDeleteId(d.id)} className="w-7 h-7 rounded-lg hover:bg-red-50 flex items-center justify-center text-slate-400" title="Delete"><Trash2 size={13} /></button>
                  </div></td>
                </motion.tr>
                );
              },
              "No documents found."
            )}

            {/* VERSION CONTROL TAB */}
            {activeTab === "versions" && renderTable(
              versionsData,
              ["Document", "File Type", "Version", "Status", "Size", "Changelog", "By", "Date", "Actions"],
              (v: any, i) => (
                <motion.tr key={v.id || i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                  className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                  <td className="px-4 py-3.5"><div className="flex items-center gap-3"><FileTypeIcon type={v.fileType} /><span className="text-sm font-medium text-slate-800">{v.document || "Unknown"}</span></div></td>
                  <td className="px-4 py-3.5"><Badge value={v.fileType || "\u2014"} /></td>
                  <td className="px-4 py-3.5"><span className="text-sm font-bold font-mono text-slate-800">v{v.version || 1}</span></td>
                  <td className="px-4 py-3.5"><Badge value={v.status || "Draft"} /></td>
                  <td className="px-4 py-3.5"><span className="text-sm font-mono text-slate-600">{formatBytes(v.size) || <span className="text-slate-300 italic">N/A</span>}</span></td>
                  <td className="px-4 py-3.5 max-w-[180px]"><span className="text-sm text-slate-600 truncate block" title={v.changeLog || ""}>{v.changeLog || "\u2014"}</span></td>
                  <td className="px-4 py-3.5"><div className="flex items-center gap-2"><Avatar name={v.createdBy || "System"} /><span className="text-sm text-slate-700">{v.createdBy || "System"}</span></div></td>
                  <td className="px-4 py-3.5"><span className="text-sm text-slate-600">{v.createdAt ? new Date(v.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "\u2014"}</span></td>
                  <td className="px-4 py-3.5"><div className="flex gap-1">
                    <button onClick={() => crud.handleOpenModal("view", v, [], activeTab)} className="w-7 h-7 rounded-lg hover:bg-blue-50 flex items-center justify-center text-slate-400" title="View"><Eye size={13} /></button>
                    <button onClick={() => crud.handleOpenModal("edit", v, [], activeTab)} className="w-7 h-7 rounded-lg hover:bg-amber-50 flex items-center justify-center text-slate-400" title="Edit"><Pencil size={13} /></button>
                    <PdfButton doc={v} />
                    <button onClick={() => crud.setConfirmDeleteId(v.id)} className="w-7 h-7 rounded-lg hover:bg-red-50 flex items-center justify-center text-slate-400" title="Delete"><Trash2 size={13} /></button>
                  </div></td>
                </motion.tr>
              ),
              "No version history available"
            )}

            {/* OCR TAB */}
            {activeTab === "ocr" && renderTable(
              ocrData,
              ["Document", "File Type", "Confidence", "Pages", "Status", "Actions"],
              (o: any, i) => (
                <motion.tr key={o.id || i} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                  className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                  <td className="px-4 py-3.5"><div className="flex items-center gap-2"><FileTypeIcon type={o.fileType} /><span className="text-sm font-medium text-slate-800">{o.document || "Unknown"}</span></div></td>
                  <td className="px-4 py-3.5"><Badge value={o.fileType || "\u2014"} /></td>
                  <td className="px-4 py-3.5"><span className="text-sm font-mono text-indigo-600 font-bold">{o.confidence || "\u2014"}</span></td>
                  <td className="px-4 py-3.5"><span className="text-sm font-mono">{o.pages || 1}</span></td>
                  <td className="px-4 py-3.5"><Badge value={o.status || "Pending"} /></td>
                  <td className="px-4 py-3.5"><div className="flex gap-1">
                    <button onClick={() => crud.handleOpenModal("view", o, [], activeTab)} className="w-7 h-7 rounded-lg hover:bg-blue-50 flex items-center justify-center text-slate-400"><Eye size={13} /></button>
                    <button onClick={() => crud.handleOpenModal("edit", o, [], activeTab)} className="w-7 h-7 rounded-lg hover:bg-amber-50 flex items-center justify-center text-slate-400"><Pencil size={13} /></button>
                    <PdfButton doc={o} />
                    <button onClick={() => crud.setConfirmDeleteId(o.id)} className="w-7 h-7 rounded-lg hover:bg-red-50 flex items-center justify-center text-slate-400"><Trash2 size={13} /></button>
                  </div></td>
                </motion.tr>
              ),
              "No OCR records"
            )}

            {/* AI SEARCH TAB */}
            {activeTab === "ai-search" && renderTable(
              aiSearchData,
              ["Document", "File Type", "Extracted Text", "Confidence", "Status", "Last Indexed", "Actions"],
              (a: any, i) => (
                <motion.tr key={a.id || i} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                  className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                  <td className="px-4 py-3.5"><div className="flex items-center gap-2"><FileTypeIcon type={a.fileType} /><span className="text-sm font-medium text-slate-800">{a.document || "Unknown"}</span></div></td>
                  <td className="px-4 py-3.5"><Badge value={a.fileType || "\u2014"} /></td>
                  <td className="px-4 py-3.5 max-w-[250px]"><span className="text-xs text-slate-500 truncate block">{a.extractedText || "\u2014"}</span></td>
                  <td className="px-4 py-3.5"><span className="text-sm font-mono text-indigo-600">{a.confidence || "\u2014"}</span></td>
                  <td className="px-4 py-3.5"><Badge value={a.status || "Not Indexed"} /></td>
                  <td className="px-4 py-3.5"><span className="text-sm text-slate-600">{a.lastIndexed || "\u2014"}</span></td>
                  <td className="px-4 py-3.5"><div className="flex gap-1">
                    <button onClick={() => crud.handleOpenModal("view", a, [], activeTab)} className="w-7 h-7 rounded-lg hover:bg-blue-50 flex items-center justify-center text-slate-400"><Eye size={13} /></button>
                    <button onClick={() => crud.handleOpenModal("edit", a, [], activeTab)} className="w-7 h-7 rounded-lg hover:bg-amber-50 flex items-center justify-center text-slate-400"><Pencil size={13} /></button>
                    <PdfButton doc={a} />
                    <button onClick={() => crud.setConfirmDeleteId(a.id)} className="w-7 h-7 rounded-lg hover:bg-red-50 flex items-center justify-center text-slate-400"><Trash2 size={13} /></button>
                  </div></td>
                </motion.tr>
              ),
              "No indexed documents found"
            )}

            {/* SIGNATURES TAB */}
            {activeTab === "signatures" && renderTable(
              signaturesData,
              ["Request", "Document", "Signer", "Email", "Status", "Signed At", "Actions"],
              (s: any, i) => (
                <motion.tr key={s.id || i} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                  className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                  <td className="px-4 py-3.5"><span className="text-sm font-semibold text-slate-800">{s.requestName || "Signature Request"}</span></td>
                  <td className="px-4 py-3.5"><span className="text-sm text-slate-600">{s.document || "\u2014"}</span></td>
                  <td className="px-4 py-3.5"><div className="flex items-center gap-2"><Avatar name={s.signerName || "NA"} /><span className="text-sm text-slate-700">{s.signerName || "NA"}</span></div></td>
                  <td className="px-4 py-3.5"><span className="text-sm text-slate-600">{s.signerEmail || "\u2014"}</span></td>
                  <td className="px-4 py-3.5"><Badge value={s.status || "Pending"} /></td>
                  <td className="px-4 py-3.5"><span className="text-sm text-slate-600">{s.signedAt || "\u2014"}</span></td>
                  <td className="px-4 py-3.5"><div className="flex gap-1">
                    <button onClick={() => crud.handleOpenModal("view", s, [], activeTab)} className="w-7 h-7 rounded-lg hover:bg-blue-50 flex items-center justify-center text-slate-400"><Eye size={13} /></button>
                    <button onClick={() => crud.handleOpenModal("edit", s, [], activeTab)} className="w-7 h-7 rounded-lg hover:bg-amber-50 flex items-center justify-center text-slate-400"><Pencil size={13} /></button>
                    <PdfButton doc={s} />
                    <button onClick={() => crud.setConfirmDeleteId(s.id)} className="w-7 h-7 rounded-lg hover:bg-red-50 flex items-center justify-center text-slate-400"><Trash2 size={13} /></button>
                  </div></td>
                </motion.tr>
              ),
              "No signature requests found"
            )}

            {/* TEMPLATES TAB */}
            {activeTab === "templates" && renderTable(
              templatesData,
              ["Template Name", "Category", "Description", "Variables", "Actions"],
              (t: any, i) => (
                <motion.tr key={t.id || i} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                  className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                  <td className="px-4 py-3.5"><span className="text-sm font-semibold text-slate-800">{t.name || "Unnamed"}</span></td>
                  <td className="px-4 py-3.5"><Badge value={t.category || "General"} /></td>
                  <td className="px-4 py-3.5 max-w-[250px]"><span className="text-sm text-slate-600 truncate block">{t.description || "\u2014"}</span></td>
                  <td className="px-4 py-3.5"><span className="text-sm font-mono text-slate-500">{t.variables || "\u2014"}</span></td>
                  <td className="px-4 py-3.5"><div className="flex gap-1">
                    <button onClick={() => crud.handleOpenModal("view", t, [], activeTab)} className="w-7 h-7 rounded-lg hover:bg-blue-50 flex items-center justify-center text-slate-400"><Eye size={13} /></button>
                    <button onClick={() => crud.handleOpenModal("edit", t, [], activeTab)} className="w-7 h-7 rounded-lg hover:bg-amber-50 flex items-center justify-center text-slate-400"><Pencil size={13} /></button>
                    <PdfButton doc={t} />
                    <button onClick={() => crud.setConfirmDeleteId(t.id)} className="w-7 h-7 rounded-lg hover:bg-red-50 flex items-center justify-center text-slate-400"><Trash2 size={13} /></button>
                  </div></td>
                </motion.tr>
              ),
              "No templates found"
            )}

            {/* PDF GENERATION TAB */}
            {activeTab === "pdf" && renderTable(
              pdfData,
              ["Document", "Source Format", "Format", "Size", "Pages", "Status", "Actions"],
              (p: any, i) => (
                <motion.tr key={p.id || i} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                  className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                  <td className="px-4 py-3.5"><div className="flex items-center gap-2"><FileTypeIcon type="PDF" /><span className="text-sm font-medium text-slate-800">{p.document || "Unknown"}</span></div></td>
                  <td className="px-4 py-3.5"><Badge value={p.fileType || "\u2014"} /></td>
                  <td className="px-4 py-3.5"><Badge value={p.format || "PDF"} /></td>
                  <td className="px-4 py-3.5"><span className="text-sm font-mono text-slate-600">{p.size || <span className="text-slate-300 italic">N/A</span>}</span></td>
                  <td className="px-4 py-3.5"><span className="text-sm font-mono">{p.pages || 1}</span></td>
                  <td className="px-4 py-3.5"><Badge value={p.status || "Draft"} /></td>
                  <td className="px-4 py-3.5"><div className="flex gap-1">
                    <button onClick={() => crud.handleOpenModal("view", p, [], activeTab)} className="w-7 h-7 rounded-lg hover:bg-blue-50 flex items-center justify-center text-slate-400"><Eye size={13} /></button>
                    <button onClick={() => crud.handleOpenModal("edit", p, [], activeTab)} className="w-7 h-7 rounded-lg hover:bg-amber-50 flex items-center justify-center text-slate-400"><Pencil size={13} /></button>
                    <button
                      onClick={() => triggerRowUpload(p.id, "pdf-generation")}
                      disabled={uploadingRowId === p.id}
                      className="w-7 h-7 rounded-lg hover:bg-emerald-50 flex items-center justify-center text-slate-400 hover:text-emerald-600 transition-colors disabled:opacity-40"
                      title="Upload PDF file to this record"
                    >
                      {uploadingRowId === p.id ? (
                        <span className="w-3 h-3 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Upload size={13} />
                      )}
                    </button>
                    <PdfButton doc={p} />
                    <button onClick={() => crud.setConfirmDeleteId(p.id)} className="w-7 h-7 rounded-lg hover:bg-red-50 flex items-center justify-center text-slate-400"><Trash2 size={13} /></button>
                  </div></td>
                </motion.tr>
              ),
              "No PDF generations yet"
            )}
          </motion.div>
        </AnimatePresence>
      )}

      {/* CRUD Modal */}
      <AnimatePresence>
      {crud.modalOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-md"
          onClick={() => { crud.setModalOpen(false); setFormUploadFile(null); setFormUploading(false); setFormUploadProgress(0); }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", duration: 0.35, bounce: 0.2 }}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 p-6 border border-white/10"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg ${activeTabDef.color} flex items-center justify-center`}>
                  <Icon size={15} />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    {crud.modalMode === "create" ? `New ${activeTabDef.label.slice(0, -1)}` : crud.modalMode === "edit" ? "Edit Record" : "View Record"}
                  </h2>
                  <p className="text-[11px] text-slate-400">{activeTabDef.label}</p>
                </div>
              </div>
              <button onClick={() => { crud.setModalOpen(false); setFormUploadFile(null); setFormUploading(false); setFormUploadProgress(0); }} className="w-7 h-7 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400 transition-colors"><X size={15} /></button>
            </div>
            {renderModalForm()}
          </motion.div>
        </motion.div>
      )}
      </AnimatePresence>

      {/* Confirm Delete */}
      {crud.confirmDeleteId && (
        <ConfirmDialog
          open={!!crud.confirmDeleteId}
          title="Delete Record"
          message="Are you sure you want to delete this record? This action cannot be undone."
          onConfirm={() => crud.confirmDeleteAction(activeTabDef.apiSlug)}
          onCancel={() => crud.setConfirmDeleteId(null)}
        />
      )}

      {/* Shared hidden file input for per-row PDF upload */}
      <input
        ref={uploadInputRef}
        type="file"
        accept=".pdf,application/pdf"
        className="hidden"
        onChange={async (e) => {
          const file = e.target.files?.[0];
          if (file && uploadDocIdRef.current) {
            await handleRowUpload(file, uploadDocIdRef.current, uploadApiSlugRef.current);
          }
          if (e.target) e.target.value = "";
          uploadDocIdRef.current = "";
        }}
      />

      {/* Upload Modal */}
      {upload.uploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm" onClick={() => upload.setUploadModalOpen(false)}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-900">Upload File</h2>
              <button onClick={() => upload.setUploadModalOpen(false)} className="w-7 h-7 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400"><X size={15} /></button>
            </div>
            <form onSubmit={upload.handleFileUpload} className="space-y-4">
              <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center hover:border-primary/50 transition-colors cursor-pointer" onClick={() => upload.fileInputRef.current?.click()}>
                <Upload size={24} className="mx-auto text-slate-300 mb-2" />
                <p className="text-sm text-slate-500">{upload.uploadFile ? upload.uploadFile.name : "Click to select file"}</p>
                <p className="text-[10px] text-slate-400 mt-1">Max 10MB</p>
                <input ref={upload.fileInputRef} type="file" className="hidden" onChange={e => upload.setUploadFile(e.target.files?.[0] || null)} />
              </div>
              {upload.fileSizeTooLarge && <p className="text-xs text-red-500">File exceeds 10MB limit</p>}
              {upload.uploadProgress > 0 && (
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${upload.uploadProgress}%` }} />
                </div>
              )}
              <div>
                <label className="text-xs font-semibold text-slate-700 mb-1 block">Category</label>
                <select value={upload.uploadCategory} onChange={e => upload.setUploadCategory(e.target.value)} className="w-full rounded-lg px-3 py-2 text-sm border border-slate-200 focus:outline-none focus:border-slate-900">
                  {["General", "Contract", "Report", "Invoice", "Proposal", "Legal", "HR", "Financial", "Technical", "Marketing", "Training", "Other"].map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700 mb-1 block">Tags</label>
                <input value={upload.uploadTags} onChange={e => upload.setUploadTags(e.target.value)} placeholder="e.g. important, draft, final" className="w-full rounded-lg px-3 py-2 text-sm border border-slate-200 focus:outline-none focus:border-slate-900" />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => upload.setUploadModalOpen(false)} className="px-4 py-2 rounded-lg border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50">Cancel</button>
                <button type="submit" disabled={upload.isUploading || !upload.uploadFile} className="px-4 py-2 rounded-lg bg-primary hover:bg-primary/90 text-black text-sm font-bold transition-colors disabled:opacity-40 flex items-center gap-2">
                  {upload.isUploading && <span className="w-3 h-3 border-2 border-black border-t-transparent rounded-full animate-spin" />}
                  Upload
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

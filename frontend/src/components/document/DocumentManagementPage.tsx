"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  FileDown, Search as SearchIcon, Upload, X,
  Download, Eye, Pencil, Trash2,
  Filter, RefreshCw,
} from "lucide-react";
import { useToast } from "@/components/ui/Toast";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { jsPDF } from "jspdf";

import { Avatar, Badge, FileTypeIcon, TABS } from "./document-helpers";
import type { TabId, FieldDef } from "./document-helpers";
import { StorageTab, VersionsTab, OcrTab, AiSearchTab, SignaturesTab, TemplatesTab, PdfTab } from "./document-tab-content";
import {
  useDocumentKpis,
  useStorageAnalytics,
  useVersionAnalytics,
  useOcrAnalytics,
  useAiAnalytics,
  useSigAnalytics,
  useTemplateAnalytics,
  usePdfAnalytics,
} from "./use-document-analytics";

// ── FIELD DEFINITIONS ────────────────────────────────────
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
    { key: "confidence", label: "Confidence (%)", type: "number" },
    { key: "pages", label: "Pages", type: "number" },
    { key: "language", label: "Language", type: "text" },
    { key: "extractedText", label: "Extracted Text", type: "textarea" },
    { key: "status", label: "Status", type: "select", options: ["Pending", "Processing", "Completed", "Failed"] },
  ],
  "ai-search": [
    { key: "title", label: "Document", type: "text", required: true },
    { key: "fileType", label: "File Type", type: "text" },
    { key: "extractedText", label: "Extracted Text", type: "textarea" },
    { key: "confidence", label: "Confidence (%)", type: "number" },
    { key: "lastIndexed", label: "Last Indexed", type: "date" },
    { key: "status", label: "Index Status", type: "select", options: ["Indexed", "Not Indexed"] },
  ],
  signatures: [
    { key: "requestName", label: "Request Name", type: "text", required: true },
    { key: "signerName", label: "Signer Name", type: "text" },
    { key: "signedBy", label: "Signed By", type: "text" },
    { key: "signerEmail", label: "Signer Email", type: "text" },
    { key: "signedAt", label: "Signed At", type: "date" },
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

// ── DATE HELPERS ─────────────────────────────────────────
function fmtDate(date: Date, style: "full" | "long" | "short" = "long"): string {
  return date.toLocaleString("en-US", { dateStyle: style, timeStyle: "short" });
}

function fmtDateOnly(date: Date): string {
  return date.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}

// ── DOCUMENT SELECTOR (for Digital Signature form) ──────
function DocumentSelector({
  documents,
  selectedId,
  onSelect,
  disabled,
}: {
  documents: any[];
  selectedId: string;
  onSelect: (id: string) => void;
  disabled?: boolean;
}) {
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const filtered = documents.filter((d) =>
    (d.title || d.name || "").toLowerCase().includes(search.toLowerCase())
  );

  const selected = documents.find((d) => d.id === selectedId);
  const selectedName = selected
    ? selected.title || selected.name || selectedId.slice(0, 8) + "…"
    : "";

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => !disabled && setOpen(!open)}
        disabled={disabled}
        className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm transition-all text-left
          ${disabled
            ? "bg-slate-50 text-slate-600 cursor-default border-slate-200"
            : "bg-white hover:border-slate-300 border-slate-200"}
          ${selectedName ? "text-slate-800" : "text-slate-400"}`}
      >
        {selectedName ? (
          <>
            <span className="w-6 h-6 rounded bg-indigo-50 text-indigo-600 flex items-center justify-center text-[9px] font-bold shrink-0">
              {selectedName[0].toUpperCase()}
            </span>
            <span className="truncate">{selectedName}</span>
          </>
        ) : (
          <span className="text-slate-400">Select a document to link...</span>
        )}
        {!disabled && (
          <svg className={`w-4 h-4 ml-auto text-slate-400 transition-transform ${open ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        )}
        {selectedName && !disabled && (
          <span
            onClick={(e) => { e.stopPropagation(); onSelect(""); }}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.stopPropagation(); onSelect(''); } }}
            className="w-5 h-5 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 cursor-pointer"
          >
            <X size={12} />
          </span>
        )}
      </button>

      {open && !disabled && (
        <div className="absolute z-50 mt-1 w-full bg-white border border-slate-200 rounded-xl shadow-xl max-h-64 flex flex-col">
          <div className="p-2 border-b border-slate-100">
            <input
              autoFocus
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && filtered.length > 0) {
                  e.preventDefault();
                  onSelect(filtered[0].id);
                  setOpen(false);
                  setSearch("");
                }
                if (e.key === "Escape") { setOpen(false); setSearch(""); }
              }}
              placeholder="Search documents..."
              className="w-full bg-slate-50 border border-slate-100 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-slate-300"
            />
          </div>
          <div className="overflow-y-auto flex-1">
            {filtered.length === 0 ? (
              <div className="px-3 py-6 text-center text-xs text-slate-400">
                {search ? "No matching documents" : "No documents available"}
              </div>
            ) : (
              filtered.map((d) => {
                const name = d.title || d.name || "Untitled";
                const isSelected = d.id === selectedId;
                return (
                  <button
                    key={d.id}
                    type="button"
                    className={`w-full px-3 py-2 text-left text-xs hover:bg-slate-50 transition-colors flex items-center gap-2
                      ${isSelected ? "bg-primary/5 text-primary font-semibold" : "text-slate-700"}`}
                    onClick={() => {
                      onSelect(d.id);
                      setOpen(false);
                      setSearch("");
                    }}
                  >
                    <span className="w-5 h-5 rounded bg-slate-100 text-slate-500 flex items-center justify-center text-[8px] font-bold shrink-0">
                      {name[0].toUpperCase()}
                    </span>
                    <span className="truncate">{name}</span>
                    {isSelected && (
                      <svg className="w-3.5 h-3.5 ml-auto text-primary shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </button>
                );
              })
            )}
          </div>
          <div className="p-1.5 border-t border-slate-100 bg-slate-50 text-center text-[10px] text-slate-400 rounded-b-xl">
            {filtered.length} document{filtered.length !== 1 ? "s" : ""} ·
            Enter to select · Esc to close
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════
interface DocumentManagementPageProps {
  pillarSlug: string;
  moduleSlug: string;
}

export default function DocumentManagementPage({ pillarSlug, moduleSlug }: DocumentManagementPageProps) {
  const slugToTab: Record<string, TabId> = {
    "file-storage": "storage", "version-control": "versions", "ocr": "ocr",
    "ai-document-search": "ai-search", "digital-signatures": "signatures",
    "templates": "templates", "pdf-generation": "pdf",
  };
  const [activeTab, setActiveTab] = useState<TabId>(slugToTab[moduleSlug] || "storage");
  const [search, setSearch] = useState("");
  const { toast } = useToast();

  // Data state per module
  const [storageData, setStorageData] = useState<any[]>([]);
  const [versionsData, setVersionsData] = useState<any[]>([]);
  const [ocrData, setOcrData] = useState<any[]>([]);
  const [aiSearchData, setAiSearchData] = useState<any[]>([]);
  const [signaturesData, setSignaturesData] = useState<any[]>([]);
  const [templatesData, setTemplatesData] = useState<any[]>([]);
  const [pdfData, setPdfData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // CRUD state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit" | "view">("create");
  const [activeRow, setActiveRow] = useState<any>(null);
  const [formData, setFormData] = useState<any>({});
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [generatingPdfId, setGeneratingPdfId] = useState<string | null>(null);

  // Batch selection state
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  useEffect(() => { setSelectedIds(new Set()); }, [activeTab]);

  // Upload state
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadCategory, setUploadCategory] = useState("General");
  const [uploadTags, setUploadTags] = useState("");
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form-level file upload state
  const [formUploadFile, setFormUploadFile] = useState<File | null>(null);
  const [formUploading, setFormUploading] = useState(false);
  const [formUploadProgress, setFormUploadProgress] = useState(0);
  const formUploadInputRef = useRef<HTMLInputElement>(null);

  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  const fileSizeTooLarge = useMemo(() => uploadFile ? uploadFile.size > MAX_FILE_SIZE : false, [uploadFile]);
  const fileSizePercent = useMemo(() => uploadFile ? Math.min(100, Math.round((uploadFile.size / MAX_FILE_SIZE) * 100)) : 0, [uploadFile]);

  const formatFileSize = useCallback((bytes: number) => {
    if (bytes >= 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
    if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    if (bytes >= 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${bytes} B`;
  }, []);

  const activeTabDef = TABS.find(t => t.id === activeTab)!;

  const getApiUrl = useCallback((tabSlug: string) => {
    return `http://localhost:3002/api/v1/modules/${pillarSlug}/${tabSlug}`;
  }, [pillarSlug]);

  // ── VALIDATION ──────────────────────────────────────────
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

  // ── DATA LOADING ──────────────────────────────────────
  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token") || "";
      const headers = { Authorization: `Bearer ${token}` };

      const [sRes, vRes, oRes, aRes, sigRes, tRes, pRes] = await Promise.allSettled([
        fetch(getApiUrl("file-storage"), { headers }).then(r => r.json()),
        fetch(getApiUrl("version-control"), { headers }).then(r => r.json()),
        fetch(getApiUrl("ocr"), { headers }).then(r => r.json()),
        fetch(getApiUrl("ai-document-search"), { headers }).then(r => r.json()),
        fetch(getApiUrl("digital-signatures"), { headers }).then(r => r.json()),
        fetch(getApiUrl("templates"), { headers }).then(r => r.json()),
        fetch(getApiUrl("pdf-generation"), { headers }).then(r => r.json()),
      ]);

      const extract = (res: PromiseSettledResult<any>) =>
        res.status === "fulfilled" && res.value?.data ? res.value.data : [];

      setStorageData(extract(sRes));
      setVersionsData(extract(vRes));
      setOcrData(extract(oRes));
      setAiSearchData(extract(aRes));
      setSignaturesData(extract(sigRes));
      setTemplatesData(extract(tRes));
      setPdfData(extract(pRes));
    } catch (err) {
      console.error("Error loading document data:", err);
    } finally {
      setIsLoading(false);
    }
  }, [getApiUrl]);

  useEffect(() => { loadData(); }, [loadData]);

  // ── KPI & ANALYTICS ────────────────────────────────────
  const kpis = useDocumentKpis(storageData, signaturesData, ocrData, templatesData, aiSearchData);
  const storageAnalytics = useStorageAnalytics(storageData);
  const versionAnalytics = useVersionAnalytics(versionsData);
  const ocrAnalytics = useOcrAnalytics(ocrData);
  const aiAnalytics = useAiAnalytics(aiSearchData);
  const sigAnalytics = useSigAnalytics(signaturesData);
  const templateAnalytics = useTemplateAnalytics(templatesData);
  const pdfAnalytics = usePdfAnalytics(pdfData);

  // ── SEARCH ─────────────────────────────────────────────
  const deepSearch = (obj: any, term: string): boolean => {
    const lower = term.toLowerCase();
    if (obj === null || obj === undefined) return false;
    if (typeof obj === 'string') return obj.toLowerCase().includes(lower);
    if (typeof obj === 'number' || typeof obj === 'boolean') return String(obj).toLowerCase().includes(lower);
    if (Array.isArray(obj)) return obj.some(item => deepSearch(item, term));
    if (typeof obj === 'object') return Object.values(obj).some(v => deepSearch(v, term));
    return false;
  };

  const filteredStorage = storageData.filter((d: any) => deepSearch(d, search));
  const filteredVersions = versionsData.filter((v: any) => deepSearch(v, search));
  const filteredOcr = ocrData.filter((o: any) => deepSearch(o, search));
  const filteredAiSearch = aiSearchData.filter((a: any) => deepSearch(a, search));
  const filteredSignatures = signaturesData.filter((s: any) => deepSearch(s, search));
  const filteredTemplates = templatesData.filter((t: any) => deepSearch(t, search));
  const filteredPdf = pdfData.filter((p: any) => deepSearch(p, search));

  const getTabData = useCallback((tabId: TabId): any[] => {
    switch (tabId) {
      case "storage": return storageData;
      case "versions": return versionsData;
      case "ocr": return ocrData;
      case "ai-search": return aiSearchData;
      case "signatures": return signaturesData;
      case "templates": return templatesData;
      case "pdf": return pdfData;
      default: return [];
    }
  }, [storageData, versionsData, ocrData, aiSearchData, signaturesData, templatesData, pdfData]);

  const getFilteredData = useCallback((tabId: TabId): any[] => {
    const all = getTabData(tabId);
    return all.filter((d: any) => deepSearch(d, search));
  }, [getTabData, search]);

  const toggleSelect = useCallback((id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }, []);

  const toggleSelectAll = useCallback(() => {
    const visibleIds = getFilteredData(activeTab)
      .map((d: any) => d.id)
      .filter(Boolean);
    setSelectedIds(prev => {
      if (prev.size === visibleIds.length) return new Set();
      return new Set(visibleIds);
    });
  }, [getFilteredData, activeTab]);

  const selectedDocs = useMemo(
    () => getTabData(activeTab).filter((d: any) => selectedIds.has(d.id)),
    [getTabData, activeTab, selectedIds]
  );

  const clearSelection = useCallback(() => setSelectedIds(new Set()), []);

  // ── CRUD: OPEN MODAL ──────────────────────────────────
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
      if (activeTab === "storage") initial.status = "Draft";
      if (activeTab === "ocr") initial.status = "Pending";
      if (activeTab === "ai-search") initial.status = "Not Indexed";
      if (activeTab === "signatures") initial.status = "Pending";
      if (activeTab === "templates") initial.category = "General";
      if (activeTab === "pdf") { initial.status = "Draft"; initial.format = "PDF"; }
      if (activeTab === "versions") { initial.version = 1; }
      setFormData(initial);
    } else {
      const editData = { ...(row || {}) };
      if (!editData.title && editData.name) editData.title = editData.name;
      if (!editData.requestName && editData.name) editData.requestName = editData.name;
      setFormData(editData);
    }
    setModalOpen(true);
  };

  // ── CRUD: SAVE ────────────────────────────────────────
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
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

  // ── CRUD: DELETE ──────────────────────────────────────
  const handleDelete = async (id: string) => {
    try {
      const token = localStorage.getItem("token") || "";
      const apiSlug = activeTabDef.apiSlug;
      const res = await fetch(`${getApiUrl(apiSlug)}/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        loadData();
        toast("Record deleted", "success");
      } else {
        const err = await res.json().catch(() => ({}));
        toast(err?.message || "Failed to delete", "error");
      }
    } catch {
      toast("Error deleting record", "error");
    }
  };

  // ── CORE PDF RENDERING ────────────────────────────────
  const renderDocPages = useCallback((pdf: any, doc: any, pageState: { pageNum: number }) => {
    const pageW = 210;
    const margin = 20;
    const contentW = pageW - margin * 2;
    const C = {
      primary: [15, 23, 42] as [number, number, number],
      accent: [37, 99, 235] as [number, number, number],
      accentLight: [219, 234, 254] as [number, number, number],
      gray: [100, 116, 139] as [number, number, number],
      lightBg: [241, 245, 249] as [number, number, number],
      border: [226, 232, 240] as [number, number, number],
      footer: [148, 163, 184] as [number, number, number],
      white: [255, 255, 255] as [number, number, number],
      green: [5, 150, 105] as [number, number, number],
      amber: [217, 119, 6] as [number, number, number],
      red: [220, 38, 38] as [number, number, number],
    };
    const drawHeader = (title: string, subtitle: string) => {
      pdf.setFillColor(...C.primary);
      pdf.rect(0, 0, pageW, 45, "F");
      pdf.setTextColor(...C.white);
      pdf.setFontSize(20);
      pdf.setFont("helvetica", "bold");
      pdf.text("NEXYOVI", margin, 22);
      pdf.setFontSize(7);
      pdf.setFont("helvetica", "normal");
      pdf.text("AI-Powered Business OS • Document Management", margin, 32);
      pdf.setTextColor(...C.white);
      pdf.setFontSize(8);
      pdf.setFont("helvetica", "bold");
      pdf.text(subtitle, pageW - margin, 22, { align: "right" });
    };
    const drawFooter = () => {
      pdf.setDrawColor(...C.border);
      pdf.setLineWidth(0.5);
      pdf.line(margin, 285, pageW - margin, 285);
      pdf.setTextColor(...C.footer);
      pdf.setFontSize(7);
      pdf.setFont("helvetica", "normal");
      pdf.text(`Generated by NEXYOVI Document Management • ${new Date().toISOString().split("T")[0]}`, margin, 291);
      pdf.text(`Page ${pageState.pageNum}`, pageW - margin, 291, { align: "right" });
    };
    const addNewPage = (title: string) => {
      pageState.pageNum++;
      pdf.addPage();
      drawHeader(title, `${pageState.pageNum}`);
      drawFooter();
      return 55;
    };
    const drawSectionBadge = (label: string, color: [number, number, number], yPos: number) => {
      pdf.setFillColor(...color);
      const bw = pdf.getTextWidth(label) + 10;
      pdf.roundedRect(margin, yPos - 4, bw, 12, 3, 3, "F");
      pdf.setTextColor(...C.white);
      pdf.setFontSize(7);
      pdf.setFont("helvetica", "bold");
      pdf.text(label, margin + 5, yPos + 4);
      pdf.setTextColor(...C.primary);
      pdf.setFontSize(9);
    };
    const drawInfoRow = (label: string, value: string, yPos: number, even = false) => {
      if (even) { pdf.setFillColor(...C.lightBg); pdf.rect(margin, yPos, contentW, 10, "F"); }
      pdf.setTextColor(...C.gray); pdf.setFontSize(9); pdf.setFont("helvetica", "bold");
      pdf.text(label, margin + 4, yPos + 7);
      pdf.setTextColor(...C.primary); pdf.setFont("helvetica", "normal");
      pdf.text(String(value || "—"), margin + contentW * 0.35, yPos + 7);
      return yPos + 10;
    };
    const drawProgressBar = (label: string, pct: number, yPos: number, barColor: [number, number, number]) => {
      pdf.setTextColor(...C.gray); pdf.setFontSize(8); pdf.setFont("helvetica", "normal");
      pdf.text(label, margin, yPos);
      pdf.setDrawColor(...C.border); pdf.setFillColor(241, 245, 249);
      const barW = contentW; const barH = 5;
      pdf.roundedRect(margin, yPos + 3, barW, barH, 2, 2, "FD");
      if (pct > 0) { pdf.setFillColor(...barColor); pdf.roundedRect(margin, yPos + 3, barW * Math.min(1, pct / 100), barH, 2, 2, "F"); }
      pdf.setTextColor(...C.primary); pdf.setFontSize(7); pdf.setFont("helvetica", "bold");
      pdf.text(`${Math.round(pct)}%`, margin + barW - 15, yPos);
      return yPos + 14;
    };
    const drawKpiCard = (label: string, value: string, x: number, yPos: number, cardColor: [number, number, number]) => {
      const cardW = (contentW - 12) / 3;
      pdf.setFillColor(...cardColor); pdf.roundedRect(x, yPos, cardW, 24, 4, 4, "F");
      pdf.setTextColor(...C.primary); pdf.setFontSize(8); pdf.setFont("helvetica", "bold");
      pdf.text(label, x + 6, yPos + 10);
      pdf.setTextColor(...C.white); pdf.setFontSize(12); pdf.setFont("helvetica", "bold");
      pdf.text(String(value), x + 6, yPos + 21);
    };

    // PAGE 1: Document Details
    drawHeader("Document Report", `${pageState.pageNum}`);
    drawFooter();
    const docName = doc.document || "Untitled Document";
    let y = 55;
    pdf.setTextColor(...C.primary); pdf.setFontSize(18); pdf.setFont("helvetica", "bold");
    pdf.text(docName, margin, y);
    y += 5; pdf.setDrawColor(...C.accent); pdf.setLineWidth(2);
    pdf.line(margin, y, margin + Math.min(120, pdf.getTextWidth(docName) + 10), y);
    y += 12;

    const docTitle = (doc.document || doc.title || doc.name || "").toLowerCase().trim();
    const relStorage = storageData.find((s: any) => (s.title || s.name || "").toLowerCase().includes(docTitle));
    const relVersions = versionsData.filter((v: any) => (v.document || "").toLowerCase().includes(docTitle));
    const relSigs = signaturesData.filter((s: any) => (s.document || "").toLowerCase().includes(docTitle));
    const relOcr = ocrData.filter((o: any) => (o.document || "").toLowerCase().includes(docTitle));

    // Document metadata info rows
    drawSectionBadge("DOCUMENT INFO", C.accent, y);
    y += 18;
    const infoRows: [string, string][] = [
      ["Status", doc.status || "—"],
      ["Owner", doc.owner || doc.createdBy || "—"],
      ["Type", doc.fileType || doc.type || "—"],
      ["Category", doc.category || "—"],
      ["Tags", doc.tags || "—"],
    ];
    infoRows.forEach(([l, v], i) => { y = drawInfoRow(l, v, y, i % 2 === 0); });
    y += 4;

    // Related data section
    if (relStorage || relVersions.length > 0 || relSigs.length > 0 || relOcr.length > 0) {
      if (y > 220) y = addNewPage("Related Records");
      drawSectionBadge("RELATED RECORDS", C.green, y);
      y += 18;

      if (relStorage) {
        pdf.setTextColor(...C.primary); pdf.setFontSize(9); pdf.setFont("helvetica", "bold");
        pdf.text(`• File Storage: ${relStorage.title || relStorage.name || "—"}`, margin + 4, y + 4);
        y += 12;
      }
      if (relVersions.length > 0) {
        pdf.setTextColor(...C.primary); pdf.setFontSize(9); pdf.setFont("helvetica", "bold");
        pdf.text(`• Versions: ${relVersions.length} version(s)`, margin + 4, y + 4);
        y += 12;
      }
      if (relSigs.length > 0) {
        pdf.setTextColor(...C.primary); pdf.setFontSize(9); pdf.setFont("helvetica", "bold");
        pdf.text(`• Signatures: ${relSigs.length} request(s)`, margin + 4, y + 4);
        y += 12;
      }
      if (relOcr.length > 0) {
        pdf.setTextColor(...C.primary); pdf.setFontSize(9); pdf.setFont("helvetica", "bold");
        pdf.text(`• OCR: ${relOcr.length} record(s)`, margin + 4, y + 4);
        y += 12;
      }
    }
  }, [storageData, versionsData, signaturesData, ocrData]);

  // ── PDF GENERATION ─────────────────────────────────────
  const generatePdf = async (doc: any) => {
    setGeneratingPdfId(doc.id);
    try {
      const pdf = new jsPDF();
      let pageNum = 0;
      renderDocPages(pdf, doc, { pageNum });
      const safeName = (doc.document || doc.title || doc.name || "document")
        .replace(/[^a-z0-9]/gi, "_").substring(0, 40);
      pdf.save(`${safeName}.pdf`);
      toast("PDF generated", "success");
    } catch (err) {
      console.error("PDF generation error:", err);
      toast("Failed to generate PDF", "error");
    } finally {
      setGeneratingPdfId(null);
    }
  };

  const generateCombinedPdf = async (docs: any[]) => {
    setGeneratingPdfId("all");
    try {
      const pdf = new jsPDF();
      let pageNum = 0;
      docs.forEach((doc, i) => {
        if (i > 0) pdf.addPage();
        renderDocPages(pdf, doc, { pageNum });
      });
      pdf.save("combined_documents.pdf");
      toast("Combined PDF generated", "success");
    } catch (err) {
      console.error("Combined PDF error:", err);
      toast("Failed to generate combined PDF", "error");
    } finally {
      setGeneratingPdfId(null);
    }
  };

  // ── MODAL FORM FIELDS ─────────────────────────────────
  const renderModalFormFields = () => {
    const fields = TAB_FIELDS[activeTab] || [];
    const isViewOnly = modalMode === "view";
    const setValue = (key: string, value: any) => {
      const updates: any = { [key]: value };
      // Auto-fill signedAt when status is set to 'Signed' for signatures
      if (activeTab === "signatures" && key === "status" && value === "Signed") {
        updates.signedAt = new Date().toISOString();
      }
      // Clear signedAt if status changes away from 'Signed'
      if (activeTab === "signatures" && key === "status" && value !== "Signed") {
        updates.signedAt = "";
      }
      setFormData((prev: any) => ({ ...prev, ...updates }));
      if (formErrors[key]) {
        setFormErrors((prev: any) => {
          const next = { ...prev };
          delete next[key];
          return next;
        });
      }
    };

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {fields.map((field) => {
          const val = formData[field.key] ?? "";
          const err = formErrors[field.key];

          if (field.type === "textarea") {
            return (
              <div key={field.key} className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  {field.label} {field.required && <span className="text-red-400">*</span>}
                </label>
                <textarea
                  value={val}
                  onChange={(e) => setValue(field.key, e.target.value)}
                  readOnly={isViewOnly}
                  rows={3}
                  className={`w-full px-3 py-2 rounded-xl border text-sm transition-all resize-none
                    ${err ? "border-red-300 bg-red-50" : "border-slate-200 bg-white hover:border-slate-300 focus:border-primary/50"}
                    ${isViewOnly ? "bg-slate-50 text-slate-600 cursor-default" : ""}`}
                />
                {err && <p className="text-red-500 text-[11px] mt-1">{err}</p>}
              </div>
            );
          }

          if (field.type === "select" && field.options) {
            return (
              <div key={field.key}>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  {field.label} {field.required && <span className="text-red-400">*</span>}
                </label>
                <select
                  value={val}
                  onChange={(e) => setValue(field.key, e.target.value)}
                  disabled={isViewOnly}
                  className={`w-full px-3 py-2.5 rounded-xl border text-sm transition-all appearance-none
                    ${err ? "border-red-300 bg-red-50" : "border-slate-200 bg-white hover:border-slate-300 focus:border-primary/50"}
                    ${isViewOnly ? "bg-slate-50 text-slate-600 cursor-default" : ""}`}
                >
                  <option value="">Select...</option>
                  {field.options.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
                {err && <p className="text-red-500 text-[11px] mt-1">{err}</p>}
              </div>
            );
          }

          return (
            <div key={field.key}>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                {field.label} {field.required && <span className="text-red-400">*</span>}
              </label>
              <input
                type={field.type === "number" ? "number" : field.type === "date" ? "date" : "text"}
                value={val}
                onChange={(e) => setValue(field.key, field.type === "number" ? Number(e.target.value) : e.target.value)}
                readOnly={isViewOnly}
                className={`w-full px-3 py-2.5 rounded-xl border text-sm transition-all
                  ${err ? "border-red-300 bg-red-50" : "border-slate-200 bg-white hover:border-slate-300 focus:border-primary/50"}
                  ${isViewOnly ? "bg-slate-50 text-slate-600 cursor-default" : ""}`}
              />
              {err && <p className="text-red-500 text-[11px] mt-1">{err}</p>}
            </div>
          );
        })}
      </div>
    );
  };

  // ════════════════════════════════════════════════════════
  // MAIN RETURN (JSX)
  // ════════════════════════════════════════════════════════
  return (
    <div className="min-h-screen bg-slate-50">
      {/* ── TOP BAR ─────────────────────────────────────── */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-slate-800 to-slate-700 flex items-center justify-center text-white font-bold text-sm shadow-sm">
              {activeTabDef.label[0]}
            </div>
            <div>
              <h1 className="text-sm font-bold text-slate-800">Document Management</h1>
              <p className="text-[10px] text-slate-400 font-medium">{activeTabDef.label}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => loadData()}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-600 transition-all">
              <RefreshCw size={13} /> Refresh
            </button>
            <button onClick={() => handleOpenModal("create")}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary hover:bg-primary/90 text-black text-xs font-bold transition-all">
              <Plus size={13} /> New{activeTab === "storage" ? " Document" : activeTab === "versions" ? " Version" : activeTab === "signatures" ? " Request" : activeTab === "templates" ? " Template" : activeTab === "pdf" ? " PDF" : ""}
            </button>
          </div>
        </div>
        {/* Tab bar */}
        <div className="px-6 flex gap-1 overflow-x-auto scrollbar-none pb-px">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            return (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-t-lg transition-all whitespace-nowrap
                  ${activeTab === tab.id
                    ? "bg-slate-50 text-slate-800 border-b-2 border-slate-800"
                    : "text-slate-400 hover:text-slate-600 hover:bg-slate-50/50"}`}>
                <Icon size={13} /> {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── KPI BANNER ───────────────────────────────────── */}
      <div className="px-6 pt-4 pb-2">
        <div className="grid grid-cols-4 sm:grid-cols-7 gap-2.5">
          {[
            { label: "Total Docs", value: kpis.totalDocs, color: "from-sky-500 to-sky-600", icon: "📄" },
            { label: "Pending Sigs", value: kpis.pendingSigs, color: "from-amber-500 to-amber-600", icon: "✍️" },
            { label: "Signed", value: kpis.signedDocs, color: "from-emerald-500 to-emerald-600", icon: "✅" },
            { label: "OCR Done", value: kpis.ocrCompleted, color: "from-violet-500 to-violet-600", icon: "🔍" },
            { label: "Templates", value: kpis.templates, color: "from-orange-500 to-orange-600", icon: "📋" },
            { label: "Total Size", value: kpis.totalSize >= 1024 ? `${(kpis.totalSize / 1024).toFixed(0)}MB` : `${kpis.totalSize}KB`, color: "from-indigo-500 to-indigo-600", icon: "💾" },
            { label: "Indexed", value: kpis.indexed, color: "from-rose-500 to-rose-600", icon: "🏷️" },
          ].map((kpi) => (
            <div key={kpi.label}
              className={`bg-gradient-to-br ${kpi.color} rounded-xl p-2.5 text-white shadow-sm`}>
              <span className="text-lg">{kpi.icon}</span>
              <div className="text-lg font-bold mt-0.5">{kpi.value}</div>
              <div className="text-[8px] font-semibold opacity-80 uppercase tracking-wider mt-0.5">{kpi.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── SEARCH BAR ──────────────────────────────────── */}
      <div className="px-6 py-2">
        <div className="relative max-w-md">
          <SearchIcon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text" placeholder="Search documents..."
            value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-9 py-2 rounded-xl border border-slate-200 bg-white text-sm placeholder:text-slate-400 focus:outline-none focus:border-primary/50 transition-all"
          />
          {search && (
            <button onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* ── TAB CONTENT ─────────────────────────────────── */}
      <div className="px-6 pb-8">
        <AnimatePresence mode="wait">
          <motion.div key={activeTab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.15 }}>
            {activeTab === "storage" && (
              <StorageTab
                data={storageData}
                filtered={filteredStorage}
                search={search}
                selectedIds={selectedIds}
                generatingPdfId={generatingPdfId}
                onToggleSelect={toggleSelect}
                onToggleSelectAll={(ids) => toggleSelectAll()}
                onClearSelection={clearSelection}
                onView={(row) => handleOpenModal("view", row)}
                onEdit={(row) => handleOpenModal("edit", row)}
                onDelete={(id) => setConfirmDeleteId(id)}
                onGeneratePdf={generatePdf}
                onGenerateCombinedPdf={generateCombinedPdf}
                selectedDocs={selectedDocs}
                storageAnalytics={storageAnalytics}
                storageData={storageData}
              />
            )}
            {activeTab === "versions" && (
              <VersionsTab
                data={versionsData}
                filtered={filteredVersions}
                search={search}
                selectedIds={selectedIds}
                generatingPdfId={generatingPdfId}
                onToggleSelect={toggleSelect}
                onToggleSelectAll={(ids) => toggleSelectAll()}
                onClearSelection={clearSelection}
                onView={(row) => handleOpenModal("view", row)}
                onEdit={(row) => handleOpenModal("edit", row)}
                onDelete={(id) => setConfirmDeleteId(id)}
                onGeneratePdf={generatePdf}
                onGenerateCombinedPdf={generateCombinedPdf}
                selectedDocs={selectedDocs}
                versionAnalytics={versionAnalytics}
                versionsData={versionsData}
              />
            )}
            {activeTab === "ocr" && (
              <OcrTab
                data={ocrData}
                filtered={filteredOcr}
                search={search}
                selectedIds={selectedIds}
                generatingPdfId={generatingPdfId}
                onToggleSelect={toggleSelect}
                onToggleSelectAll={(ids) => toggleSelectAll()}
                onClearSelection={clearSelection}
                onView={(row) => handleOpenModal("view", row)}
                onEdit={(row) => handleOpenModal("edit", row)}
                onDelete={(id) => setConfirmDeleteId(id)}
                onGeneratePdf={generatePdf}
                onGenerateCombinedPdf={generateCombinedPdf}
                selectedDocs={selectedDocs}
                ocrAnalytics={ocrAnalytics}
                ocrData={ocrData}
              />
            )}
            {activeTab === "ai-search" && (
              <AiSearchTab
                data={aiSearchData}
                filtered={filteredAiSearch}
                search={search}
                selectedIds={selectedIds}
                generatingPdfId={generatingPdfId}
                onToggleSelect={toggleSelect}
                onToggleSelectAll={(ids) => toggleSelectAll()}
                onClearSelection={clearSelection}
                onView={(row) => handleOpenModal("view", row)}
                onEdit={(row) => handleOpenModal("edit", row)}
                onDelete={(id) => setConfirmDeleteId(id)}
                onGeneratePdf={generatePdf}
                onGenerateCombinedPdf={generateCombinedPdf}
                selectedDocs={selectedDocs}
                aiAnalytics={aiAnalytics}
                aiSearchData={aiSearchData}
              />
            )}
            {activeTab === "signatures" && (
              <SignaturesTab
                data={signaturesData}
                filtered={filteredSignatures}
                search={search}
                selectedIds={selectedIds}
                generatingPdfId={generatingPdfId}
                onToggleSelect={toggleSelect}
                onToggleSelectAll={(ids) => toggleSelectAll()}
                onClearSelection={clearSelection}
                onView={(row) => handleOpenModal("view", row)}
                onEdit={(row) => handleOpenModal("edit", row)}
                onDelete={(id) => setConfirmDeleteId(id)}
                onGeneratePdf={generatePdf}
                onGenerateCombinedPdf={generateCombinedPdf}
                selectedDocs={selectedDocs}
                sigAnalytics={sigAnalytics}
                signaturesData={signaturesData}
              />
            )}
            {activeTab === "templates" && (
              <TemplatesTab
                data={templatesData}
                filtered={filteredTemplates}
                search={search}
                selectedIds={selectedIds}
                generatingPdfId={generatingPdfId}
                onToggleSelect={toggleSelect}
                onToggleSelectAll={(ids) => toggleSelectAll()}
                onClearSelection={clearSelection}
                onView={(row) => handleOpenModal("view", row)}
                onEdit={(row) => handleOpenModal("edit", row)}
                onDelete={(id) => setConfirmDeleteId(id)}
                onGeneratePdf={generatePdf}
                onGenerateCombinedPdf={generateCombinedPdf}
                selectedDocs={selectedDocs}
                templateAnalytics={templateAnalytics}
                templatesData={templatesData}
              />
            )}
            {activeTab === "pdf" && (
              <PdfTab
                data={pdfData}
                filtered={filteredPdf}
                search={search}
                selectedIds={selectedIds}
                generatingPdfId={generatingPdfId}
                onToggleSelect={toggleSelect}
                onToggleSelectAll={(ids) => toggleSelectAll()}
                onClearSelection={clearSelection}
                onView={(row) => handleOpenModal("view", row)}
                onEdit={(row) => handleOpenModal("edit", row)}
                onDelete={(id) => setConfirmDeleteId(id)}
                onGeneratePdf={generatePdf}
                onGenerateCombinedPdf={generateCombinedPdf}
                selectedDocs={selectedDocs}
                pdfAnalytics={pdfAnalytics}
                pdfData={pdfData}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ── CREATE/EDIT MODAL ─────────────────────────────── */}
      <AnimatePresence>
        {modalOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setModalOpen(false)}>
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[85vh] overflow-y-auto border border-slate-100"
              onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between p-4 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-slate-800 to-slate-700 flex items-center justify-center text-white font-bold text-xs">
                    {modalMode === "create" ? "+" : modalMode === "edit" ? "✎" : "👁"}
                  </div>
                  <span className="text-sm font-bold text-slate-800">
                    {modalMode === "create" ? "Create" : modalMode === "edit" ? "Edit" : "View"} {activeTabDef.label}
                  </span>
                </div>
                <button onClick={() => setModalOpen(false)} className="w-7 h-7 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400">
                  <X size={15} />
                </button>
              </div>
              <form onSubmit={handleSave} className="p-4 space-y-4">
                {renderModalFormFields()}
                {/* Document selector for Digital Signatures */}
                {activeTab === "signatures" && storageData.length > 0 && (
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                      Link Document <span className="text-xs font-normal normal-case text-slate-400">(optional)</span>
                    </label>
                    <DocumentSelector
                      documents={storageData}
                      selectedId={formData.documentId || ""}
                      onSelect={(id) => {
                        setFormData((prev: any) => ({ ...prev, documentId: id }));
                      }}
                      disabled={modalMode === "view"}
                    />
                  </div>
                )}
                {modalMode !== "view" && (
                  <div className="flex gap-2 pt-2 border-t border-slate-100">
                    <button type="button" onClick={() => setModalOpen(false)}
                      className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-600 transition-all">
                      Cancel
                    </button>
                    <button type="submit" disabled={isSaving}
                      className="flex-1 px-4 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-black text-xs font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                      {isSaving ? <><span className="w-3 h-3 border-2 border-black border-t-transparent rounded-full animate-spin" /> Saving...</> : "Save"}
                    </button>
                  </div>
                )}
                {modalMode === "view" && (
                  <button type="button" onClick={() => setModalOpen(false)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-600 transition-all">
                    Close
                  </button>
                )}
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── DELETE CONFIRMATION ──────────────────────────── */}
      <ConfirmDialog
        open={!!confirmDeleteId}
        onCancel={() => setConfirmDeleteId(null)}
        onConfirm={() => {
          if (confirmDeleteId) {
            handleDelete(confirmDeleteId);
            setConfirmDeleteId(null);
          }
        }}
        title="Delete Record"
        message="Are you sure you want to delete this record? This action cannot be undone."
        confirmLabel="Delete"
      />
    </div>
  );
}

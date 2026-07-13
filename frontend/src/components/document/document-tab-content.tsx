"use client";

import { motion } from "framer-motion";
import {
  FileText, GitBranch, ScanText, Search,
  PenTool, LayoutTemplate, FileDown,
  Eye, Pencil, Trash2, X,
  CheckCircle, AlertTriangle, Zap,
  TrendingUp, FileType, HardDrive, Upload,
} from "lucide-react";
import { Avatar, Badge, FileTypeIcon } from "./document-helpers";
import type { TabId } from "./document-helpers";
import type { StorageAnalytics, VersionAnalytics, OcrAnalytics, AiAnalytics, SigAnalytics, TemplateAnalytics, PdfAnalytics } from "./use-document-analytics";

// ── TAB PROPS ────────────────────────────────────────────
interface TabProps {
  data: any[];
  filtered: any[];
  search: string;
  selectedIds: Set<string>;
  generatingPdfId: string | null;
  onToggleSelect: (id: string) => void;
  onToggleSelectAll: (ids: string[]) => void;
  onClearSelection: () => void;
  onView: (row: any) => void;
  onEdit: (row: any) => void;
  onDelete: (id: string) => void;
  onGeneratePdf: (doc: any) => void;
  onGenerateCombinedPdf: (docs: any[]) => void;
  selectedDocs: any[];
}

// ── HELPERS ──────────────────────────────────────────────
function SelectAllCheckbox({ checked, indeterminate, onChange }: { checked: boolean; indeterminate: boolean; onChange: () => void }) {
  return (
    <div className="flex items-center justify-center">
      <input type="checkbox" checked={checked}
        ref={(el) => { if (el) el.indeterminate = indeterminate; }}
        onChange={onChange}
        className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary/30 cursor-pointer" />
    </div>
  );
}

function Footer({ filtered, total, selectedIds, selectedDocs, onClearSelection, onGenerateCombinedPdf, generatingPdfId, extraButtons }: {
  filtered: number; total: number; selectedIds: Set<string>; selectedDocs: any[];
  onClearSelection: () => void; onGenerateCombinedPdf: (docs: any[]) => void; generatingPdfId: string | null;
  extraButtons?: React.ReactNode;
}) {
  return (
    <div className="px-4 py-3 border-t border-slate-200 bg-slate-100 flex items-center justify-between text-xs text-slate-500">
      <div className="flex items-center gap-3">
        <span>{filtered} of {total} records</span>
        {selectedIds.size > 0 && <span className="text-primary font-semibold">{selectedIds.size} selected</span>}
      </div>
      <div className="flex items-center gap-2">
        {selectedIds.size > 0 && (
          <>
            <button onClick={onClearSelection} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-xs font-medium text-slate-600">
              <X size={12} /> Clear
            </button>
            <button onClick={() => { if (selectedDocs.length === 0) return; onGenerateCombinedPdf(selectedDocs); }}
              disabled={generatingPdfId === "all"}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary hover:bg-primary/90 text-black text-xs font-bold disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
              {generatingPdfId === "all" ? <span className="w-3 h-3 border-2 border-black border-t-transparent rounded-full animate-spin" /> : <FileDown size={12} />}
              Generate PDF ({selectedIds.size})
            </button>
          </>
        )}
        {extraButtons}
      </div>
    </div>
  );
}

// ═══════════════════ ANALYTICS COMPONENTS ════════════════

function AnalyticsBar({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  const pct = max > 0 ? (value / max) * 100 : 0;
  return (
    <div className="flex items-center gap-2 mb-1.5">
      <span className="text-[11px] font-medium text-slate-600 w-16 shrink-0 truncate">{label}</span>
      <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden">
        <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.6 }}
          className={`h-full rounded-full ${color}`} />
      </div>
      <span className="text-[11px] font-mono text-slate-500 w-6 text-right">{value}</span>
    </div>
  );
}

function StatCard({ value, label, gradient }: { value: string | number; label: string; gradient: string }) {
  return (
    <div className={`rounded-xl p-3 ${gradient}`}>
      <div className="text-[18px] font-bold">{value}</div>
      <div className="text-[10px] font-medium opacity-70">{label}</div>
    </div>
  );
}

// ══════════════ FILE STORAGE TAB ═════════════════════════
export function StorageTab({ storageAnalytics, storageData, ...props }: TabProps & { storageAnalytics: StorageAnalytics; storageData: any[] }) {
  const { data, filtered, selectedIds, generatingPdfId, onToggleSelect, onToggleSelectAll, onView, onEdit, onDelete, onGeneratePdf, onClearSelection, selectedDocs, onGenerateCombinedPdf } = props;
  return (
    <div className="space-y-4">
      {storageData.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <FileType size={14} className="text-sky-500" />
              <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">By File Type</span>
            </div>
            {Object.entries(storageAnalytics.typeDist).sort((a, b) => b[1] - a[1]).map(([type, count]) => (
              <AnalyticsBar key={type} label={type} value={count} max={storageData.length}
                color={type === 'PDF' ? 'bg-red-400' : type === 'DOCX' || type === 'DOC' ? 'bg-blue-400' : type === 'Image' ? 'bg-amber-400' : type === 'XLSX' ? 'bg-emerald-400' : type === 'PPTX' ? 'bg-orange-400' : 'bg-slate-400'} />
            ))}
          </div>
          <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle size={14} className="text-emerald-500" />
              <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">By Status</span>
            </div>
            {Object.entries(storageAnalytics.statusDist).sort((a, b) => b[1] - a[1]).map(([status, count]) => (
              <AnalyticsBar key={status} label={status} value={count} max={storageData.length}
                color={status === 'Final' ? 'bg-blue-400' : status === 'Draft' ? 'bg-slate-400' : status === 'Under Review' ? 'bg-amber-400' : 'bg-slate-500'} />
            ))}
            <div className="mt-3 pt-2 border-t border-slate-100 flex gap-3 text-[10px] text-slate-400">
              <span><span className="font-bold text-slate-700">{storageAnalytics.total}</span> total</span>
              <span><span className="font-bold text-emerald-600">{storageAnalytics.statusDist['Final'] || 0}</span> final</span>
            </div>
          </div>
          <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <LayoutTemplate size={14} className="text-violet-500" />
              <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">By Category</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {Object.entries(storageAnalytics.catDist).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([cat, count]) => (
                <div key={cat} className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-100">
                  <span className="text-[11px] font-medium text-slate-700">{cat}</span>
                  <span className="text-[10px] font-bold text-slate-400">{count}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <HardDrive size={14} className="text-indigo-500" />
              <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Top Contributors</span>
            </div>
            {Object.entries(storageAnalytics.ownerDist).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([owner, count], idx) => {
              const pct = storageData.length > 0 ? (count / storageData.length) * 100 : 0;
              return (
                <div key={owner} className="flex items-center gap-2 mb-1.5">
                  <span className="text-[10px] font-bold text-slate-300 w-4">{idx + 1}</span>
                  <Avatar name={owner} />
                  <span className="text-[11px] text-slate-700 flex-1 truncate">{owner}</span>
                  <div className="w-16 h-2 bg-slate-100 rounded-full overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.5 }}
                      className="h-full rounded-full bg-indigo-400" />
                  </div>
                  <span className="text-[10px] font-mono text-slate-400 w-5 text-right">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-100">
                <th className="px-3 py-3 w-10">
                  <SelectAllCheckbox checked={filtered.length > 0 && selectedIds.size === filtered.length}
                    indeterminate={selectedIds.size > 0 && selectedIds.size < filtered.length}
                    onChange={() => onToggleSelectAll(filtered.map((d: any) => d.id).filter(Boolean))} />
                </th>
                {["Document", "Type", "Size", "Owner", "Modified", "Status", "Actions"].map(h => (
                  <th key={h} className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={8} className="text-center py-16 text-slate-400 text-sm font-light">No documents found.</td></tr>
              ) : (
                filtered.map((d: any, i: number) => (
                  <motion.tr key={d.id || i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                    className={`border-b border-slate-100 transition-colors ${selectedIds.has(d.id) ? "bg-primary/5 hover:bg-primary/10" : "hover:bg-slate-50/50"}`}>
                    <td className="px-3 py-3.5"><div className="flex items-center justify-center"><input type="checkbox" checked={selectedIds.has(d.id)} onChange={() => onToggleSelect(d.id)} className="w-4 h-4 rounded border-slate-300 text-primary cursor-pointer" /></div></td>
                    <td className="px-4 py-3.5"><div className="flex items-center gap-3"><FileTypeIcon type={d.fileType || d.type} /><span className="text-sm font-medium text-slate-800">{d.name || d.title || "Untitled"}</span></div></td>
                    <td className="px-4 py-3.5"><Badge value={d.type || d.fileType || "—"} /></td>
                    <td className="px-4 py-3.5"><span className="text-sm font-mono text-slate-600">{d.size || "—"}</span></td>
                    <td className="px-4 py-3.5"><div className="flex items-center gap-2"><Avatar name={d.owner || "Unassigned"} /><span className="text-sm text-slate-700">{d.owner || "Unassigned"}</span></div></td>
                    <td className="px-4 py-3.5"><span className="text-sm text-slate-600">{d.modified || "—"}</span></td>
                    <td className="px-4 py-3.5"><Badge value={d.status || "Draft"} /></td>
                    <td className="px-4 py-3.5">
                      <div className="flex gap-1">
                        <button onClick={() => onView(d)} className="w-7 h-7 rounded-lg hover:bg-blue-50 flex items-center justify-center text-slate-400" title="View"><Eye size={13} /></button>
                        <button onClick={() => onEdit(d)} className="w-7 h-7 rounded-lg hover:bg-amber-50 flex items-center justify-center text-slate-400" title="Edit"><Pencil size={13} /></button>
                        <button onClick={() => onGeneratePdf(d)} disabled={generatingPdfId === d.id}
                          className="w-7 h-7 rounded-lg hover:bg-rose-50 flex items-center justify-center text-slate-400 hover:text-rose-600 transition-colors disabled:opacity-40" title="Generate PDF">
                          {generatingPdfId === d.id ? <span className="w-3 h-3 border-2 border-rose-400 border-t-transparent rounded-full animate-spin" /> : <FileDown size={13} />}
                        </button>
                        <button onClick={() => onDelete(d.id)} className="w-7 h-7 rounded-lg hover:bg-red-50 flex items-center justify-center text-slate-400" title="Delete"><Trash2 size={13} /></button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <Footer filtered={filtered.length} total={data.length} selectedIds={selectedIds} selectedDocs={selectedDocs}
          onClearSelection={onClearSelection} onGenerateCombinedPdf={onGenerateCombinedPdf} generatingPdfId={generatingPdfId} />
      </div>
    </div>
  );
}

// ══════════════ VERSION CONTROL TAB ══════════════════════
export function VersionsTab({ versionAnalytics, versionsData, ...props }: TabProps & { versionAnalytics: VersionAnalytics; versionsData: any[] }) {
  const { data, filtered, selectedIds, generatingPdfId, onToggleSelect, onToggleSelectAll, onView, onClearSelection, selectedDocs, onGenerateCombinedPdf } = props;
  return (
    <div className="space-y-4">
      {versionsData.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <GitBranch size={14} className="text-violet-500" />
              <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Top Contributors</span>
            </div>
            {versionAnalytics.topContrib.map(([name, count], idx) => {
              const pct = versionAnalytics.total > 0 ? (count / versionAnalytics.total) * 100 : 0;
              return (
                <div key={name} className="flex items-center gap-2 mb-1.5">
                  <span className="text-[10px] font-bold text-slate-300 w-4">{idx + 1}</span>
                  <Avatar name={name} />
                  <span className="text-[11px] text-slate-700 flex-1 truncate">{name}</span>
                  <div className="w-16 h-2 bg-slate-100 rounded-full overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.5 }}
                      className="h-full rounded-full bg-violet-400" />
                  </div>
                  <span className="text-[10px] font-mono text-slate-400 w-5 text-right">{count}</span>
                </div>
              );
            })}
            <div className="mt-3 pt-2 border-t border-slate-100 flex gap-4 text-[10px] text-slate-400">
              <span><span className="font-bold text-slate-700">{versionAnalytics.total}</span> versions</span>
              <span><span className="font-bold text-violet-600">{versionAnalytics.latestVersion}</span> latest v</span>
            </div>
          </div>
          <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp size={14} className="text-emerald-500" />
              <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Version Activity</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <StatCard value={versionAnalytics.total} label="Total Versions" gradient="bg-gradient-to-br from-violet-50 to-violet-100/50 text-violet-700" />
              <StatCard value={versionAnalytics.latestVersion} label="Latest Version" gradient="bg-gradient-to-br from-blue-50 to-blue-100/50 text-blue-700" />
              <StatCard value={versionAnalytics.topContrib.length} label="Contributors" gradient="bg-gradient-to-br from-amber-50 to-amber-100/50 text-amber-700" />
              <StatCard value={versionAnalytics.total > 0 ? Math.round(versionAnalytics.total / Math.max(versionAnalytics.topContrib.length, 1)) : 0} label="Avg/Contributor" gradient="bg-gradient-to-br from-emerald-50 to-emerald-100/50 text-emerald-700" />
            </div>
          </div>
        </div>
      )}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-100">
                <th className="px-3 py-3 w-10">
                  <SelectAllCheckbox checked={filtered.length > 0 && selectedIds.size === filtered.length}
                    indeterminate={selectedIds.size > 0 && selectedIds.size < filtered.length}
                    onChange={() => onToggleSelectAll(filtered.map((d: any) => d.id).filter(Boolean))} />
                </th>
                {["Document", "File Type", "Version", "Size", "Changelog", "By", "Date", "Actions"].map(h => (
                  <th key={h} className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={9} className="text-center py-16 text-slate-400 text-sm font-light">No version history available</td></tr>
              ) : (
                filtered.map((v: any, i: number) => (
                  <motion.tr key={v.id || i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                    className={`border-b border-slate-100 transition-colors ${selectedIds.has(v.id) ? "bg-primary/5 hover:bg-primary/10" : "hover:bg-slate-50/50"}`}>
                    <td className="px-3 py-3.5"><div className="flex items-center justify-center"><input type="checkbox" checked={selectedIds.has(v.id)} onChange={() => onToggleSelect(v.id)} className="w-4 h-4 rounded border-slate-300 text-primary cursor-pointer" /></div></td>
                    <td className="px-4 py-3.5"><div className="flex items-center gap-3"><FileTypeIcon type={v.fileType} /><span className="text-sm font-medium text-slate-800">{v.document || "Unknown"}</span></div></td>
                    <td className="px-4 py-3.5"><Badge value={v.fileType || "—"} /></td>
                    <td className="px-4 py-3.5"><span className="text-sm font-bold font-mono text-slate-800">v{v.version || 1}</span></td>
                    <td className="px-4 py-3.5"><span className="text-sm font-mono text-slate-600">{v.size || "—"}</span></td>
                    <td className="px-4 py-3.5 max-w-[200px]"><span className="text-sm text-slate-600 truncate block">{v.changeLog || "—"}</span></td>
                    <td className="px-4 py-3.5"><div className="flex items-center gap-2"><Avatar name={v.createdBy || "System"} /><span className="text-sm text-slate-700">{v.createdBy || "System"}</span></div></td>
                    <td className="px-4 py-3.5"><span className="text-sm text-slate-600">{v.createdAt || "—"}</span></td>
                    <td className="px-4 py-3.5"><button onClick={() => onView(v)} className="w-7 h-7 rounded-lg hover:bg-blue-50 flex items-center justify-center text-slate-400"><Eye size={13} /></button></td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <Footer filtered={filtered.length} total={data.length} selectedIds={selectedIds} selectedDocs={selectedDocs}
          onClearSelection={onClearSelection} onGenerateCombinedPdf={onGenerateCombinedPdf} generatingPdfId={generatingPdfId} />
      </div>
    </div>
  );
}

// ══════════════ OCR TAB ══════════════════════════════════
export function OcrTab({ ocrAnalytics, ocrData, ...props }: TabProps & { ocrAnalytics: OcrAnalytics; ocrData: any[] }) {
  const { filtered, selectedIds, generatingPdfId, onToggleSelect, onToggleSelectAll, onView, onClearSelection, selectedDocs, onGenerateCombinedPdf } = props;
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-4 gap-3">
        <StatCard value={ocrData.length} label="Total Processed" gradient="bg-white border border-slate-100 text-slate-900" />
        <StatCard value={ocrAnalytics.total} label="Completed" gradient="bg-white border border-slate-100 text-emerald-600" />
        <StatCard value={ocrData.length > 0 ? Math.round(ocrAnalytics.total / ocrData.length * 100) : 0 + "%"} label="Success Rate" gradient="bg-white border border-slate-100 text-blue-600" />
        <StatCard value={ocrData.filter((o: any) => o.status === "Processing").length} label="Processing" gradient="bg-white border border-slate-100 text-amber-600" />
      </div>
      {ocrData.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <ScanText size={14} className="text-amber-500" />
              <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">OCR Status Breakdown</span>
            </div>
            {Object.entries(ocrAnalytics.statusDist).sort((a, b) => b[1] - a[1]).map(([status, count]) => (
              <AnalyticsBar key={status} label={status} value={count} max={ocrAnalytics.total}
                color={status === 'Completed' ? 'bg-emerald-400' : status === 'Processing' ? 'bg-blue-400' : status === 'Failed' ? 'bg-red-400' : 'bg-amber-400'} />
            ))}
          </div>
          <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <Zap size={14} className="text-amber-500" />
              <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Performance Metrics</span>
            </div>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <StatCard value={ocrAnalytics.total} label="Documents" gradient="bg-gradient-to-br from-amber-50 to-amber-100/50 text-amber-700" />
              <StatCard value={ocrAnalytics.avgConfidence.toFixed(1) + "%"} label="Avg Confidence" gradient="bg-gradient-to-br from-emerald-50 to-emerald-100/50 text-emerald-700" />
              <StatCard value={ocrAnalytics.totalPages} label="Total Pages" gradient="bg-gradient-to-br from-blue-50 to-blue-100/50 text-blue-700" />
              <StatCard value={ocrAnalytics.total > 0 ? (ocrAnalytics.totalPages / ocrAnalytics.total).toFixed(1) : 0} label="Avg Pages/Doc" gradient="bg-gradient-to-br from-violet-50 to-violet-100/50 text-violet-700" />
            </div>
            {Object.keys(ocrAnalytics.langDist).length > 0 && (
              <div className="pt-2 border-t border-slate-100">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Languages</span>
                <div className="flex flex-wrap gap-1 mt-1.5">
                  {Object.entries(ocrAnalytics.langDist).map(([lang, count]) => (
                    <div key={lang} className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-50 border border-slate-100">
                      <span className="text-[10px] text-slate-600">{lang}</span>
                      <span className="text-[9px] font-bold text-slate-400">{count}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-100">
                <th className="px-3 py-3 w-10">
                  <SelectAllCheckbox checked={filtered.length > 0 && selectedIds.size === filtered.length}
                    indeterminate={selectedIds.size > 0 && selectedIds.size < filtered.length}
                    onChange={() => onToggleSelectAll(filtered.map((d: any) => d.id).filter(Boolean))} />
                </th>
                {["Document", "File Type", "Confidence", "Pages", "Status", "Actions"].map(h => (
                  <th key={h} className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-widest">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-16 text-slate-400 text-sm">No OCR records</td></tr>
              ) : (
                filtered.map((o: any, i: number) => (
                  <motion.tr key={o.id || i} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                    className={`border-b border-slate-100 transition-colors ${selectedIds.has(o.id) ? "bg-primary/5 hover:bg-primary/10" : "hover:bg-slate-50/50"}`}>
                    <td className="px-3 py-3.5"><div className="flex items-center justify-center"><input type="checkbox" checked={selectedIds.has(o.id)} onChange={() => onToggleSelect(o.id)} className="w-4 h-4 rounded border-slate-300 text-primary cursor-pointer" /></div></td>
                    <td className="px-4 py-3.5"><div className="flex items-center gap-2"><FileTypeIcon type={o.fileType} /><span className="text-sm font-medium text-slate-800">{o.document || "Unknown"}</span></div></td>
                    <td className="px-4 py-3.5"><Badge value={o.fileType || "—"} /></td>
                    <td className="px-4 py-3.5"><span className="text-sm font-mono text-indigo-600 font-bold">{o.confidence || "—"}</span></td>
                    <td className="px-4 py-3.5"><span className="text-sm font-mono">{o.pages || 1}</span></td>
                    <td className="px-4 py-3.5"><Badge value={o.status || "Pending"} /></td>
                    <td className="px-4 py-3.5"><button onClick={() => onView(o)} className="w-7 h-7 rounded-lg hover:bg-blue-50 flex items-center justify-center text-slate-400"><Eye size={13} /></button></td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <Footer filtered={filtered.length} total={ocrData.length} selectedIds={selectedIds} selectedDocs={selectedDocs}
          onClearSelection={onClearSelection} onGenerateCombinedPdf={onGenerateCombinedPdf} generatingPdfId={generatingPdfId} />
      </div>
    </div>
  );
}

// ══════════════ AI SEARCH TAB ═════════════════════════════
export function AiSearchTab({ aiAnalytics, aiSearchData, ...props }: TabProps & { aiAnalytics: AiAnalytics; aiSearchData: any[] }) {
  const { filtered, selectedIds, generatingPdfId, onToggleSelect, onToggleSelectAll, onView, onClearSelection, selectedDocs, onGenerateCombinedPdf } = props;
  return (
    <div className="space-y-4">
      {aiSearchData.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <Search size={14} className="text-indigo-500" />
              <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Index Coverage</span>
            </div>
            <div className="flex items-center gap-4 mb-3">
              <div className="flex-1">
                <div className="flex h-4 rounded-full overflow-hidden bg-slate-100">
                  {aiAnalytics.total > 0 && (
                    <>
                      <motion.div initial={{ width: 0 }} animate={{ width: `${(aiAnalytics.indexed / aiAnalytics.total) * 100}%` }} transition={{ duration: 0.6 }}
                        className="h-full bg-indigo-500" />
                      <motion.div initial={{ width: 0 }} animate={{ width: `${(aiAnalytics.notIndexed / aiAnalytics.total) * 100}%` }} transition={{ duration: 0.6 }}
                        className="h-full bg-slate-300" />
                    </>
                  )}
                </div>
              </div>
              <span className="text-[11px] font-mono text-slate-500">{aiAnalytics.indexed}/{aiAnalytics.total}</span>
            </div>
            <div className="flex gap-3 text-[10px]">
              <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-sm bg-indigo-500" /><span className="text-slate-600">Indexed <strong>{aiAnalytics.indexed}</strong></span></div>
              <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-sm bg-slate-300" /><span className="text-slate-600">Not Indexed <strong>{aiAnalytics.notIndexed}</strong></span></div>
            </div>
            <div className="mt-3 pt-2 border-t border-slate-100">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Avg Confidence</span>
              <div className="mt-1 flex items-center gap-2">
                <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${aiAnalytics.avgConfidence}%` }} transition={{ duration: 0.6 }}
                    className="h-full rounded-full bg-indigo-400" />
                </div>
                <span className="text-[11px] font-bold text-indigo-600">{aiAnalytics.avgConfidence.toFixed(1)}%</span>
              </div>
            </div>
          </div>
          <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <FileType size={14} className="text-indigo-500" />
              <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">By File Type</span>
            </div>
            {Object.entries(aiAnalytics.typeDist).sort((a, b) => b[1] - a[1]).map(([type, count]) => (
              <AnalyticsBar key={type} label={type} value={count} max={aiAnalytics.total}
                color={type === 'PDF' ? 'bg-red-400' : 'bg-indigo-400'} />
            ))}
          </div>
        </div>
      )}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-100">
                <th className="px-3 py-3 w-10">
                  <SelectAllCheckbox checked={filtered.length > 0 && selectedIds.size === filtered.length}
                    indeterminate={selectedIds.size > 0 && selectedIds.size < filtered.length}
                    onChange={() => onToggleSelectAll(filtered.map((d: any) => d.id).filter(Boolean))} />
                </th>
                {["Document", "File Type", "Extracted Text", "Confidence", "Status", "Last Indexed", "Actions"].map(h => (
                  <th key={h} className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-widest">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={8} className="text-center py-16 text-slate-400 text-sm">No indexed documents found</td></tr>
              ) : (
                filtered.map((a: any, i: number) => (
                  <motion.tr key={a.id || i} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                    className={`border-b border-slate-100 transition-colors ${selectedIds.has(a.id) ? "bg-primary/5 hover:bg-primary/10" : "hover:bg-slate-50/50"}`}>
                    <td className="px-3 py-3.5"><input type="checkbox" checked={selectedIds.has(a.id)} onChange={() => onToggleSelect(a.id)} className="w-4 h-4 rounded border-slate-300 text-primary cursor-pointer" /></td>
                    <td className="px-4 py-3.5"><div className="flex items-center gap-2"><FileTypeIcon type={a.fileType} /><span className="text-sm font-medium text-slate-800">{a.document || "Unknown"}</span></div></td>
                    <td className="px-4 py-3.5"><Badge value={a.fileType || "—"} /></td>
                    <td className="px-4 py-3.5 max-w-[250px]"><span className="text-xs text-slate-500 truncate block">{a.extractedText || "—"}</span></td>
                    <td className="px-4 py-3.5"><span className="text-sm font-mono text-indigo-600">{a.confidence || "—"}</span></td>
                    <td className="px-4 py-3.5"><Badge value={a.status || "Not Indexed"} /></td>
                    <td className="px-4 py-3.5"><span className="text-sm text-slate-600">{a.lastIndexed || "—"}</span></td>
                    <td className="px-4 py-3.5"><button onClick={() => onView(a)} className="w-7 h-7 rounded-lg hover:bg-blue-50 flex items-center justify-center text-slate-400"><Eye size={13} /></button></td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <Footer filtered={filtered.length} total={aiSearchData.length} selectedIds={selectedIds} selectedDocs={selectedDocs}
          onClearSelection={onClearSelection} onGenerateCombinedPdf={onGenerateCombinedPdf} generatingPdfId={generatingPdfId} />
      </div>
    </div>
  );
}

// ══════════════ SIGNATURES TAB ════════════════════════════
export function SignaturesTab({ sigAnalytics, signaturesData, ...props }: TabProps & { sigAnalytics: SigAnalytics; signaturesData: any[] }) {
  const { filtered, selectedIds, generatingPdfId, onToggleSelect, onToggleSelectAll, onView, onEdit, onDelete, onClearSelection, selectedDocs, onGenerateCombinedPdf } = props;
  return (
    <div className="space-y-4">
      {signaturesData.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <PenTool size={14} className="text-emerald-500" />
              <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Signature Status</span>
            </div>
            {Object.entries(sigAnalytics.statusDist).sort((a, b) => b[1] - a[1]).map(([status, count]) => (
              <AnalyticsBar key={status} label={status} value={count} max={sigAnalytics.total}
                color={status === 'Signed' ? 'bg-emerald-400' : status === 'Pending' ? 'bg-amber-400' : status === 'Declined' ? 'bg-red-400' : 'bg-slate-400'} />
            ))}
            <div className="mt-3 pt-2 border-t border-slate-100 flex gap-4 text-[10px] text-slate-400">
              <span><span className="font-bold text-emerald-600">{sigAnalytics.signed}</span> signed</span>
              <span><span className="font-bold text-amber-600">{sigAnalytics.pending}</span> pending</span>
              <span><span className="font-bold text-slate-700">{sigAnalytics.signed + sigAnalytics.pending > 0 ? Math.round(sigAnalytics.signed / (sigAnalytics.signed + sigAnalytics.pending) * 100) : 0}%</span> completion</span>
            </div>
          </div>
          <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp size={14} className="text-emerald-500" />
              <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Top Signers</span>
            </div>
            {sigAnalytics.topSigners.map(([name, count], idx) => {
              const pct = sigAnalytics.total > 0 ? (count / sigAnalytics.total) * 100 : 0;
              return (
                <div key={name} className="flex items-center gap-2 mb-1.5">
                  <span className="text-[10px] font-bold text-slate-300 w-4">{idx + 1}</span>
                  <Avatar name={name} />
                  <span className="text-[11px] text-slate-700 flex-1 truncate">{name}</span>
                  <div className="w-16 h-2 bg-slate-100 rounded-full overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.5 }}
                      className="h-full rounded-full bg-emerald-400" />
                  </div>
                  <span className="text-[10px] font-mono text-slate-400 w-5 text-right">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-100">
                <th className="px-3 py-3 w-10">
                  <SelectAllCheckbox checked={filtered.length > 0 && selectedIds.size === filtered.length}
                    indeterminate={selectedIds.size > 0 && selectedIds.size < filtered.length}
                    onChange={() => onToggleSelectAll(filtered.map((d: any) => d.id).filter(Boolean))} />
                </th>
                {["Request", "Document", "Signer", "Signed By", "Email", "Status", "Signed At", "Actions"].map(h => (
                  <th key={h} className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={9} className="text-center py-16 text-slate-400 text-sm">No signature requests found</td></tr>
              ) : (
                filtered.map((s: any, i: number) => (
                  <motion.tr key={s.id || i} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                    className={`border-b border-slate-100 transition-colors ${selectedIds.has(s.id) ? "bg-primary/5 hover:bg-primary/10" : "hover:bg-slate-50/50"}`}>
                    <td className="px-3 py-3.5"><input type="checkbox" checked={selectedIds.has(s.id)} onChange={() => onToggleSelect(s.id)} className="w-4 h-4 rounded border-slate-300 text-primary cursor-pointer" /></td>
                    <td className="px-4 py-3.5"><span className="text-sm font-semibold text-slate-800">{s.requestName || "Signature Request"}</span></td>
                    <td className="px-4 py-3.5"><span className="text-sm text-slate-600">{s.documentId ? s.documentId.slice(0, 8) + "…" : "—"}</span></td>
                    <td className="px-4 py-3.5"><div className="flex items-center gap-2 whitespace-nowrap"><Avatar name={s.signerName || "NA"} /><span className="text-sm text-slate-700">{s.signerName || "NA"}</span></div></td>
                    <td className="px-4 py-3.5"><span className="text-sm text-slate-600">{s.signedBy || "—"}</span></td>
                    <td className="px-4 py-3.5"><span className="text-sm text-slate-600">{s.signerEmail || "—"}</span></td>
                    <td className="px-4 py-3.5"><Badge value={s.status || "Pending"} /></td>
                    <td className="px-4 py-3.5"><span className="text-sm text-slate-600">{s.signedAt || "—"}</span></td>
                    <td className="px-4 py-3.5"><div className="flex gap-1">
                      <button onClick={() => onView(s)} className="w-7 h-7 rounded-lg hover:bg-blue-50 flex items-center justify-center text-slate-400"><Eye size={13} /></button>
                      <button onClick={() => onEdit(s)} className="w-7 h-7 rounded-lg hover:bg-amber-50 flex items-center justify-center text-slate-400"><Pencil size={13} /></button>
                      <button onClick={() => onDelete(s.id)} className="w-7 h-7 rounded-lg hover:bg-red-50 flex items-center justify-center text-slate-400"><Trash2 size={13} /></button>
                    </div></td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <Footer filtered={filtered.length} total={signaturesData.length} selectedIds={selectedIds} selectedDocs={selectedDocs}
          onClearSelection={onClearSelection} onGenerateCombinedPdf={onGenerateCombinedPdf} generatingPdfId={generatingPdfId} />
      </div>
    </div>
  );
}

// ══════════════ TEMPLATES TAB ═════════════════════════════
export function TemplatesTab({ templateAnalytics, templatesData, ...props }: TabProps & { templateAnalytics: TemplateAnalytics; templatesData: any[] }) {
  const { filtered, selectedIds, generatingPdfId, onToggleSelect, onToggleSelectAll, onView, onEdit, onDelete, onClearSelection, selectedDocs, onGenerateCombinedPdf } = props;
  return (
    <div className="space-y-4">
      {templatesData.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <LayoutTemplate size={14} className="text-orange-500" />
              <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">By Category</span>
            </div>
            {Object.entries(templateAnalytics.catDist).sort((a, b) => b[1] - a[1]).map(([cat, count]) => (
              <AnalyticsBar key={cat} label={cat} value={count} max={templateAnalytics.total}
                color={cat === 'Contract' ? 'bg-blue-400' : cat === 'Report' ? 'bg-violet-400' : cat === 'Invoice' ? 'bg-emerald-400' : cat === 'Letter' ? 'bg-amber-400' : cat === 'Form' ? 'bg-cyan-400' : cat === 'Proposal' ? 'bg-rose-400' : 'bg-slate-400'} />
            ))}
          </div>
          <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp size={14} className="text-orange-500" />
              <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Template Overview</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <StatCard value={templateAnalytics.total} label="Total Templates" gradient="bg-gradient-to-br from-orange-50 to-orange-100/50 text-orange-700" />
              <StatCard value={Object.keys(templateAnalytics.catDist).length} label="Categories" gradient="bg-gradient-to-br from-amber-50 to-amber-100/50 text-amber-700" />
              <StatCard value={templatesData.filter((t: any) => t.variables).length} label="Has Variables" gradient="bg-gradient-to-br from-blue-50 to-blue-100/50 text-blue-700" />
              <StatCard value={templatesData.reduce((s: number, t: any) => s + ((t.variables || "").split(",").length > 1 ? (t.variables || "").split(",").length : 0), 0)} label="Total Variables" gradient="bg-gradient-to-br from-violet-50 to-violet-100/50 text-violet-700" />
            </div>
          </div>
        </div>
      )}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-100">
                <th className="px-3 py-3 w-10">
                  <SelectAllCheckbox checked={filtered.length > 0 && selectedIds.size === filtered.length}
                    indeterminate={selectedIds.size > 0 && selectedIds.size < filtered.length}
                    onChange={() => onToggleSelectAll(filtered.map((d: any) => d.id).filter(Boolean))} />
                </th>
                {["Template Name", "Category", "Description", "Variables", "Actions"].map(h => (
                  <th key={h} className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-widest">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-16 text-slate-400 text-sm">No templates found</td></tr>
              ) : (
                filtered.map((t: any, i: number) => (
                  <motion.tr key={t.id || i} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                    className={`border-b border-slate-100 transition-colors ${selectedIds.has(t.id) ? "bg-primary/5 hover:bg-primary/10" : "hover:bg-slate-50/50"}`}>
                    <td className="px-3 py-3.5"><input type="checkbox" checked={selectedIds.has(t.id)} onChange={() => onToggleSelect(t.id)} className="w-4 h-4 rounded border-slate-300 text-primary cursor-pointer" /></td>
                    <td className="px-4 py-3.5"><span className="text-sm font-semibold text-slate-800">{t.name || "Unnamed"}</span></td>
                    <td className="px-4 py-3.5"><Badge value={t.category || "General"} /></td>
                    <td className="px-4 py-3.5 max-w-[250px]"><span className="text-sm text-slate-600 truncate block">{t.description || "—"}</span></td>
                    <td className="px-4 py-3.5"><span className="text-sm font-mono text-slate-500">{t.variables || "—"}</span></td>
                    <td className="px-4 py-3.5"><div className="flex gap-1">
                      <button onClick={() => onView(t)} className="w-7 h-7 rounded-lg hover:bg-blue-50 flex items-center justify-center text-slate-400"><Eye size={13} /></button>
                      <button onClick={() => onEdit(t)} className="w-7 h-7 rounded-lg hover:bg-amber-50 flex items-center justify-center text-slate-400"><Pencil size={13} /></button>
                      <button onClick={() => onDelete(t.id)} className="w-7 h-7 rounded-lg hover:bg-red-50 flex items-center justify-center text-slate-400"><Trash2 size={13} /></button>
                    </div></td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <Footer filtered={filtered.length} total={templatesData.length} selectedIds={selectedIds} selectedDocs={selectedDocs}
          onClearSelection={onClearSelection} onGenerateCombinedPdf={onGenerateCombinedPdf} generatingPdfId={generatingPdfId} />
      </div>
    </div>
  );
}

// ══════════════ PDF GENERATION TAB ════════════════════════
export function PdfTab({ pdfAnalytics, pdfData, ...props }: TabProps & { pdfAnalytics: PdfAnalytics; pdfData: any[] }) {
  const { filtered, generatingPdfId } = props;
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-4 gap-3">
        <StatCard value={pdfData.length} label="Total Generated" gradient="bg-white border border-slate-100 text-slate-900" />
        <StatCard value={pdfData.filter((p: any) => p.status === "Draft").length} label="Drafts" gradient="bg-white border border-slate-100 text-amber-600" />
        <StatCard value={pdfData.filter((p: any) => p.status === "Generated").length} label="Completed" gradient="bg-white border border-slate-100 text-emerald-600" />
        <StatCard value={pdfAnalytics.totalPages} label="Total Pages" gradient="bg-white border border-slate-100 text-blue-600" />
      </div>
      {pdfData.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <FileDown size={14} className="text-rose-500" />
              <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">By Status</span>
            </div>
            {Object.entries(pdfAnalytics.statusDist).sort((a, b) => b[1] - a[1]).map(([status, count]) => (
              <AnalyticsBar key={status} label={status} value={count} max={pdfAnalytics.total}
                color={status === 'Generated' ? 'bg-emerald-400' : 'bg-amber-400'} />
            ))}
          </div>
          <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <FileType size={14} className="text-rose-500" />
              <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">By Format</span>
            </div>
            {Object.entries(pdfAnalytics.formatDist).sort((a, b) => b[1] - a[1]).map(([format, count]) => (
              <AnalyticsBar key={format} label={format} value={count} max={pdfAnalytics.total}
                color={format === 'PDF' ? 'bg-rose-400' : 'bg-blue-400'} />
            ))}
            <div className="mt-3 pt-2 border-t border-slate-100 flex gap-3 text-[10px] text-slate-400">
              <span><span className="font-bold text-slate-700">{pdfAnalytics.total}</span> total</span>
              <span><span className="font-bold text-rose-600">{pdfAnalytics.totalPages}</span> pages</span>
              <span><span className="font-bold text-blue-600">{pdfAnalytics.total > 0 ? (pdfAnalytics.totalPages / pdfAnalytics.total).toFixed(1) : 0}</span> avg pages</span>
            </div>
          </div>
        </div>
      )}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-100">
                {["Document", "Source Format", "Format", "Size", "Pages", "Status", "Generated", "Actions"].map(h => (
                  <th key={h} className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-widest">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={8} className="text-center py-16 text-slate-400 text-sm">No PDF generations yet</td></tr>
              ) : (
                filtered.map((p: any, i: number) => (
                  <motion.tr key={p.id || i} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                    className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                    <td className="px-4 py-3.5"><div className="flex items-center gap-2"><FileTypeIcon type="PDF" /><span className="text-sm font-medium text-slate-800">{p.document || "Unknown"}</span></div></td>
                    <td className="px-4 py-3.5"><Badge value={p.fileType || "—"} /></td>
                    <td className="px-4 py-3.5"><Badge value={p.format || "PDF"} /></td>
                    <td className="px-4 py-3.5"><span className="text-sm font-mono text-slate-600">{p.size || "—"}</span></td>
                    <td className="px-4 py-3.5"><span className="text-sm font-mono">{p.pages || 1}</span></td>
                    <td className="px-4 py-3.5"><Badge value={p.status || "Draft"} /></td>
                    <td className="px-4 py-3.5"><span className="text-sm text-slate-600">{p.generatedAt || "—"}</span></td>
                    <td className="px-4 py-3.5">{generatingPdfId === p.id ? <span className="w-3 h-3 border-2 border-rose-400 border-t-transparent rounded-full animate-spin inline-block" /> : "—"}</td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

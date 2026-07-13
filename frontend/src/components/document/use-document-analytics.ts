"use client";

import { useMemo } from "react";

// ── ANALYTICS RESULT TYPES ──────────────────────────────
export interface StorageAnalytics {
  typeDist: Record<string, number>;
  statusDist: Record<string, number>;
  catDist: Record<string, number>;
  ownerDist: Record<string, number>;
  total: number;
}

export interface VersionAnalytics {
  topContrib: [string, number][];
  latestVersion: number;
  total: number;
}

export interface OcrAnalytics {
  langDist: Record<string, number>;
  statusDist: Record<string, number>;
  avgConfidence: number;
  totalPages: number;
  total: number;
}

export interface AiAnalytics {
  indexed: number;
  notIndexed: number;
  avgConfidence: number;
  typeDist: Record<string, number>;
  total: number;
}

export interface SigAnalytics {
  statusDist: Record<string, number>;
  topSigners: [string, number][];
  signed: number;
  pending: number;
  total: number;
}

export interface TemplateAnalytics {
  catDist: Record<string, number>;
  total: number;
}

export interface PdfAnalytics {
  statusDist: Record<string, number>;
  formatDist: Record<string, number>;
  totalPages: number;
  total: number;
}

export interface DocumentKpis {
  totalDocs: number;
  pendingSigs: number;
  signedDocs: number;
  ocrCompleted: number;
  templates: number;
  totalSize: number;
  indexed: number;
}

// ── KPI HOOK ────────────────────────────────────────────
export function useDocumentKpis(
  storageData: any[],
  signaturesData: any[],
  ocrData: any[],
  templatesData: any[],
  aiSearchData: any[]
): DocumentKpis {
  return useMemo(() => {
    const totalDocs = storageData.length;
    const pendingSigs = signaturesData.filter((s: any) => s.status === "Pending").length;
    const signedDocs = signaturesData.filter((s: any) => s.status === "Signed").length;
    const ocrCompleted = ocrData.filter((o: any) => o.status === "Completed").length;
    const templates = templatesData.length;
    const totalSize = storageData.reduce((s: number, d: any) => {
      const sz = d.size;
      // If size is already a number (bytes from Prisma), add it directly
      if (typeof sz === 'number' && !isNaN(sz)) return s + sz;
      // If size is a formatted string like "1.2 MB", parse it to bytes
      if (typeof sz === 'string') {
        const match = sz.match(/([\d.]+)\s*(KB|MB|GB|B)/);
        if (match) {
          const num = parseFloat(match[1]);
          const unit = match[2];
          if (unit === 'GB') return s + num * 1024 * 1024 * 1024;
          if (unit === 'MB') return s + num * 1024 * 1024;
          if (unit === 'KB') return s + num * 1024;
          if (unit === 'B') return s + num;
        }
      }
      return s;
    }, 0);
    const indexed = aiSearchData.filter((a: any) => a.status === "Indexed").length;
    return { totalDocs, pendingSigs, signedDocs, ocrCompleted, templates, totalSize: Math.round(totalSize), indexed };
  }, [storageData, signaturesData, ocrData, templatesData, aiSearchData]);
}

// ── TAB ANALYTICS HOOKS ─────────────────────────────────
export function useStorageAnalytics(storageData: any[]): StorageAnalytics {
  return useMemo(() => {
    const typeDist: Record<string, number> = {};
    storageData.forEach((d: any) => { const t = d.fileType || d.type || 'Other'; typeDist[t] = (typeDist[t] || 0) + 1; });
    const statusDist: Record<string, number> = {};
    storageData.forEach((d: any) => { const s = d.status || 'Draft'; statusDist[s] = (statusDist[s] || 0) + 1; });
    const catDist: Record<string, number> = {};
    storageData.forEach((d: any) => { const c = d.category || 'Uncategorized'; catDist[c] = (catDist[c] || 0) + 1; });
    const ownerDist: Record<string, number> = {};
    storageData.forEach((d: any) => { const o = d.owner || 'Unassigned'; ownerDist[o] = (ownerDist[o] || 0) + 1; });
    const total = storageData.length;
    return { typeDist, statusDist, catDist, ownerDist, total };
  }, [storageData]);
}

export function useVersionAnalytics(versionsData: any[]): VersionAnalytics {
  return useMemo(() => {
    const contrib: Record<string, number> = {};
    versionsData.forEach((v: any) => { const c = v.createdBy || 'System'; contrib[c] = (contrib[c] || 0) + 1; });
    const topContrib = Object.entries(contrib).sort((a, b) => b[1] - a[1]).slice(0, 5);
    const latestVersion = versionsData.length > 0 ? Math.max(...versionsData.map((v: any) => v.version || 1)) : 0;
    const total = versionsData.length;
    return { topContrib, latestVersion, total };
  }, [versionsData]);
}

export function useOcrAnalytics(ocrData: any[]): OcrAnalytics {
  return useMemo(() => {
    const langDist: Record<string, number> = {};
    ocrData.forEach((o: any) => { const l = o.language || 'Unknown'; langDist[l] = (langDist[l] || 0) + 1; });
    const statusDist: Record<string, number> = {};
    ocrData.forEach((o: any) => { const s = o.status || 'Pending'; statusDist[s] = (statusDist[s] || 0) + 1; });
    const confidenceLevels = ocrData.filter((o: any) => o.confidence).map((o: any) => parseFloat(o.confidence) || 0);
    const avgConfidence = confidenceLevels.length > 0 ? confidenceLevels.reduce((a: number, b: number) => a + b, 0) / confidenceLevels.length : 0;
    const totalPages = ocrData.reduce((s: number, o: any) => s + (o.pages || 1), 0);
    const total = ocrData.length;
    return { langDist, statusDist, avgConfidence, totalPages, total };
  }, [ocrData]);
}

export function useAiAnalytics(aiSearchData: any[]): AiAnalytics {
  return useMemo(() => {
    const indexed = aiSearchData.filter((a: any) => a.status === 'Indexed').length;
    const notIndexed = aiSearchData.filter((a: any) => a.status === 'Not Indexed' || !a.status).length;
    const confidenceLevels = aiSearchData.filter((a: any) => a.confidence).map((a: any) => parseFloat(a.confidence) || 0);
    const avgConfidence = confidenceLevels.length > 0 ? confidenceLevels.reduce((a: number, b: number) => a + b, 0) / confidenceLevels.length : 0;
    const typeDist: Record<string, number> = {};
    aiSearchData.forEach((a: any) => { const t = a.fileType || 'Other'; typeDist[t] = (typeDist[t] || 0) + 1; });
    const total = aiSearchData.length;
    return { indexed, notIndexed, avgConfidence, typeDist, total };
  }, [aiSearchData]);
}

export function useSigAnalytics(signaturesData: any[]): SigAnalytics {
  return useMemo(() => {
    const statusDist: Record<string, number> = {};
    signaturesData.forEach((s: any) => { const st = s.status || 'Pending'; statusDist[st] = (statusDist[st] || 0) + 1; });
    const signerActivity: Record<string, number> = {};
    signaturesData.forEach((s: any) => { const sn = s.signerName || 'Unknown'; signerActivity[sn] = (signerActivity[sn] || 0) + 1; });
    const topSigners = Object.entries(signerActivity).sort((a, b) => b[1] - a[1]).slice(0, 5);
    const signed = signaturesData.filter((s: any) => s.status === 'Signed').length;
    const pending = signaturesData.filter((s: any) => s.status === 'Pending').length;
    const total = signaturesData.length;
    return { statusDist, topSigners, signed, pending, total };
  }, [signaturesData]);
}

export function useTemplateAnalytics(templatesData: any[]): TemplateAnalytics {
  return useMemo(() => {
    const catDist: Record<string, number> = {};
    templatesData.forEach((t: any) => { const c = t.category || 'General'; catDist[c] = (catDist[c] || 0) + 1; });
    const total = templatesData.length;
    return { catDist, total };
  }, [templatesData]);
}

export function usePdfAnalytics(pdfData: any[]): PdfAnalytics {
  return useMemo(() => {
    const statusDist: Record<string, number> = {};
    pdfData.forEach((p: any) => { const s = p.status || 'Draft'; statusDist[s] = (statusDist[s] || 0) + 1; });
    const formatDist: Record<string, number> = {};
    pdfData.forEach((p: any) => { const f = p.format || 'PDF'; formatDist[f] = (formatDist[f] || 0) + 1; });
    const totalPages = pdfData.reduce((s: number, p: any) => s + (p.pages || 0), 0);
    const total = pdfData.length;
    return { statusDist, formatDist, totalPages, total };
  }, [pdfData]);
}

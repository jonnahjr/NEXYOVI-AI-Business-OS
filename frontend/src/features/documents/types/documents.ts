export type TabId = "storage" | "versions" | "ocr" | "ai-search" | "signatures" | "templates" | "pdf";

export interface TabDef {
  id: TabId;
  label: string;
  icon: React.ElementType;
  color: string;
  apiSlug: string;
}

export interface FieldDef {
  key: string;
  label: string;
  type: "text" | "number" | "date" | "select" | "textarea";
  options?: string[];
  required?: boolean;
}

export interface EntityRef {
  type: "customer" | "employee" | "project" | "deal" | "invoice" | "contract" | "vendor" | "product" | "" | string;
  id: string;
  name: string;
  pillarSlug?: string;
  moduleSlug?: string;
}

export interface Document {
  id: string;
  title: string;
  fileUrl?: string;
  fileType: string;
  size: number;
  category?: string;
  owner?: string;
  status: string;
  version: number;
  tags?: string;
  referenceType?: string;  // "customer", "employee", "project", "deal", "invoice", "contract", etc.
  referenceId?: string;    // UUID of the linked entity
  companyId: string;
  createdAt: string;
  updatedAt: string;
  // Computed fields from API
  name?: string;
  type?: string;
  modified?: string;
  // Linked entity info (populated on frontend)
  linkedEntity?: EntityRef;
}

// Cross-module entity mapping for links
export const ENTITY_MODULES: Record<string, { pillarSlug: string; moduleSlug: string; labelKey: string; icon: string }> = {
  customer: { pillarSlug: "crm-sales", moduleSlug: "customer-management", labelKey: "name", icon: "Users" },
  employee: { pillarSlug: "human-resources", moduleSlug: "employee-management", labelKey: "name", icon: "User" },
  project:  { pillarSlug: "project-management", moduleSlug: "projects", labelKey: "name", icon: "ClipboardList" },
  deal:     { pillarSlug: "crm-sales", moduleSlug: "opportunity-pipeline", labelKey: "title", icon: "Activity" },
  invoice:  { pillarSlug: "finance-accounting", moduleSlug: "invoicing", labelKey: "invoiceNo", icon: "FileText" },
  vendor:   { pillarSlug: "procurement", moduleSlug: "vendor-management", labelKey: "name", icon: "Building2" },
  product:  { pillarSlug: "inventory-warehouse", moduleSlug: "products", labelKey: "name", icon: "Package" },
};

export interface DocumentVersion {
  id: string;
  documentId?: string;
  document?: string;
  version: number;
  fileUrl?: string;
  size: number;
  changeLog?: string;
  createdBy?: string;
  companyId: string;
  createdAt: string;
  fileType?: string;
}

export interface DigitalSignature {
  id: string;
  requestName: string;
  documentId?: string;
  document?: string;
  signerName?: string;
  signerEmail?: string;
  status: string;
  signedAt?: string;
  certificateRef?: string;
  notes?: string;
  companyId: string;
  createdAt: string;
  updatedAt: string;
}

export interface DocumentTemplate {
  id: string;
  name: string;
  category: string;
  description?: string;
  content?: string;
  fileUrl?: string;
  variables?: string;
  companyId: string;
  createdAt: string;
  updatedAt: string;
}

export interface OcrRecord {
  id: string;
  document: string;
  fileType?: string;
  confidence?: string;
  pages?: number;
  language?: string;
  status: string;
}

export interface AiSearchRecord {
  id: string;
  document: string;
  fileType?: string;
  extractedText?: string;
  confidence?: string;
  status: string;
  lastIndexed?: string;
}

export interface PdfRecord {
  id: string;
  document: string;
  fileType?: string;
  format?: string;
  size?: number;
  pages?: number;
  status: string;
  generatedAt?: string;
}

export type ModalMode = "create" | "edit" | "view";

export interface TabAnalytics {
  storage: StorageAnalytics;
  version: VersionAnalytics;
  ocr: OcrAnalytics;
  ai: AiAnalytics;
  signatures: SigAnalytics;
  templates: TemplateAnalytics;
  pdf: PdfAnalytics;
}

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

export interface KpiData {
  totalDocs: number;
  pendingSigs: number;
  signedDocs: number;
  ocrCompleted: number;
  templates: number;
  totalSize: number;
  indexed: number;
}

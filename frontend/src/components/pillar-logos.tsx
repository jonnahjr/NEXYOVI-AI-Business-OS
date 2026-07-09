import React from "react";

// ─── AI CORE LOGO ──────────────────────────────────────────────────
// A stylized brain circuit / neural network with connected nodes
export function AiCoreLogo({ size = 24, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <path d="M12 2C8 2 5 5 5 9c0 2 .8 3.8 2 5-.4 1-.7 2.2-.7 3.5 0 2.5 1.5 4.5 3.5 4.5.8 0 1.5-.3 2.2-.7" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <path d="M12 2c4 0 7 3 7 7 0 2-.8 3.8-2 5 .4 1 .7 2.2.7 3.5 0 2.5-1.5 4.5-3.5 4.5-.8 0-1.5-.3-2.2-.7" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <line x1="12" y1="2" x2="12" y2="19" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      <circle cx="12" cy="2" r="1.2" fill="currentColor" />
      <circle cx="12" cy="19" r="1.2" fill="currentColor" />
      <circle cx="7" cy="6" r="1" fill="currentColor" />
      <circle cx="6" cy="11" r="1" fill="currentColor" />
      <circle cx="7.5" cy="15.5" r="1" fill="currentColor" />
      <circle cx="17" cy="6" r="1" fill="currentColor" />
      <circle cx="18" cy="11" r="1" fill="currentColor" />
      <circle cx="16.5" cy="15.5" r="1" fill="currentColor" />
      <line x1="12" y1="2" x2="7" y2="6" stroke="currentColor" strokeWidth="0.7" strokeDasharray="1 1" />
      <line x1="7" y1="6" x2="6" y2="11" stroke="currentColor" strokeWidth="0.7" strokeDasharray="1 1" />
      <line x1="6" y1="11" x2="7.5" y2="15.5" stroke="currentColor" strokeWidth="0.7" strokeDasharray="1 1" />
      <line x1="7.5" y1="15.5" x2="12" y2="19" stroke="currentColor" strokeWidth="0.7" strokeDasharray="1 1" />
      <line x1="12" y1="2" x2="17" y2="6" stroke="currentColor" strokeWidth="0.7" strokeDasharray="1 1" />
      <line x1="17" y1="6" x2="18" y2="11" stroke="currentColor" strokeWidth="0.7" strokeDasharray="1 1" />
      <line x1="18" y1="11" x2="16.5" y2="15.5" stroke="currentColor" strokeWidth="0.7" strokeDasharray="1 1" />
      <line x1="16.5" y1="15.5" x2="12" y2="19" stroke="currentColor" strokeWidth="0.7" strokeDasharray="1 1" />
      <line x1="7" y1="6" x2="17" y2="6" stroke="currentColor" strokeWidth="0.5" strokeDasharray="1 2" opacity="0.5" />
      <line x1="6" y1="11" x2="18" y2="11" stroke="currentColor" strokeWidth="0.5" strokeDasharray="1 2" opacity="0.5" />
      <circle cx="4" cy="4" r="0.5" fill="currentColor" opacity="0.6" />
      <circle cx="20" cy="4" r="0.5" fill="currentColor" opacity="0.6" />
      <circle cx="3" cy="14" r="0.5" fill="currentColor" opacity="0.4" />
      <circle cx="21" cy="14" r="0.5" fill="currentColor" opacity="0.4" />
    </svg>
  );
}

// ─── HUMAN RESOURCES LOGO ──────────────────────────────────────────
export function HrLogo({ size = 24, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <circle cx="8.5" cy="6" r="3" fill="currentColor" />
      <path d="M4 17c0-3 2-5.5 4.5-5.5S13 14 13 17v1H4v-1z" fill="currentColor" />
      <circle cx="15.5" cy="7.5" r="2.8" fill="currentColor" />
      <path d="M11 18c0-2.8 2-5 4.5-5S20 15.2 20 18v0.5H11V18z" fill="currentColor" />
      <circle cx="12.5" cy="12.5" r="0.8" fill="currentColor" opacity="0.7" />
    </svg>
  );
}

// ─── CRM & SALES LOGO ─────────────────────────────────────────────
// A handshake forming a deal/pipeline arrow
export function CRMLogo({ size = 24, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <path d="M6 14c0-2 1.5-3.5 3.5-3.5S13 12 13 14v1H6v-1z" fill="currentColor" opacity="0.6" />
      <circle cx="9.5" cy="7.5" r="2.5" fill="currentColor" opacity="0.6" />
      <path d="M11 15c0-2 1.5-3.8 3.5-3.8S18 13 18 15v0.8H11V15z" fill="currentColor" />
      <circle cx="14.5" cy="8.5" r="2.5" fill="currentColor" />
      <path d="M7 10l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M17 3v4h-4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M17 13v4h-4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" opacity="0.5" />
      <path d="M3 17v4h4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" opacity="0.5" />
    </svg>
  );
}

// ─── INVENTORY & WAREHOUSE LOGO ───────────────────────────────────
// A box/package with shelves
export function InventoryLogo({ size = 24, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <rect x="3" y="4" width="18" height="4" rx="1" fill="currentColor" opacity="0.3" />
      <rect x="3" y="10" width="18" height="4" rx="1" fill="currentColor" opacity="0.5" />
      <rect x="3" y="16" width="18" height="4" rx="1" fill="currentColor" />
      <rect x="5" y="17" width="4" height="2" rx="0.5" fill="white" opacity="0.7" />
      <rect x="11" y="17" width="4" height="2" rx="0.5" fill="white" opacity="0.7" />
      <rect x="5" y="5" width="6" height="2" rx="0.5" fill="white" opacity="0.6" />
      <rect x="13" y="5" width="6" height="2" rx="0.5" fill="white" opacity="0.6" />
      <rect x="5" y="11" width="4" height="2" rx="0.5" fill="white" opacity="0.7" />
    </svg>
  );
}

// ─── FINANCE & ACCOUNTING LOGO ────────────────────────────────────
// A coin/growth chart
export function FinanceLogo({ size = 24, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.5" fill="none" />
      <circle cx="12" cy="12" r="5" fill="currentColor" opacity="0.15" />
      <line x1="12" y1="7" x2="12" y2="9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="12" y1="15" x2="12" y2="17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="7" y1="12" x2="9" y2="12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="15" y1="12" x2="17" y2="12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M9 12l1.5-2 1.5 1 2-2.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <circle cx="12" cy="12" r="0.5" fill="currentColor" />
      <line x1="12" y1="7" x2="12" y2="5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.4" />
      <line x1="15.5" y1="8.5" x2="17" y2="7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.4" />
    </svg>
  );
}

// ─── PROCUREMENT LOGO ─────────────────────────────────────────────
// A shopping cart / purchase order icon
export function ProcurementLogo({ size = 24, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4H6z" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <path d="M3 6h18" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M16 10a4 4 0 01-8 0" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" fill="none" />
      <circle cx="8.5" cy="20.5" r="1.2" fill="currentColor" />
      <circle cx="15.5" cy="20.5" r="1.2" fill="currentColor" />
      <line x1="16" y1="14" x2="18" y2="16" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" opacity="0.5" />
      <line x1="18" y1="14" x2="16" y2="16" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" opacity="0.5" />
    </svg>
  );
}

// ─── MANUFACTURING LOGO ───────────────────────────────────────────
// A factory/gear icon
export function ManufacturingLogo({ size = 24, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <path d="M2 20V10l4 2V8l4 2V6l4 2v2l4-2v12H2z" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <line x1="6" y1="14" x2="6" y2="17" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="10" y1="14" x2="10" y2="17" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="14" y1="14" x2="14" y2="17" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="18" y1="14" x2="18" y2="17" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      <circle cx="20" cy="6" r="2" stroke="currentColor" strokeWidth="1.2" fill="none" />
      <line x1="20" y1="4" x2="20" y2="2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="20" y1="8" x2="20" y2="10" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="18" y1="6" x2="16" y2="6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="22" y1="6" x2="24" y2="6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      <path d="M22 20v-3l-4-2" stroke="currentColor" strokeWidth="1" strokeLinecap="round" opacity="0.5" />
      <circle cx="22" cy="6" r="0.5" fill="currentColor" />
    </svg>
  );
}

// ─── LOGISTICS & FLEET LOGO ───────────────────────────────────────
// A delivery truck icon
export function LogisticsLogo({ size = 24, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <rect x="1" y="9" width="15" height="7" rx="1" stroke="currentColor" strokeWidth="1.4" fill="none" />
      <line x1="1" y1="9" x2="1" y2="7" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <line x1="16" y1="10" x2="20" y2="10" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M20 10l2 2v4h-2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <circle cx="5" cy="17" r="2" stroke="currentColor" strokeWidth="1.3" fill="none" />
      <circle cx="5" cy="17" r="0.8" fill="currentColor" />
      <circle cx="17" cy="17" r="2" stroke="currentColor" strokeWidth="1.3" fill="none" />
      <circle cx="17" cy="17" r="0.8" fill="currentColor" />
      <line x1="10" y1="11" x2="10" y2="14" stroke="currentColor" strokeWidth="1" strokeLinecap="round" opacity="0.5" />
      <line x1="13" y1="11" x2="13" y2="14" stroke="currentColor" strokeWidth="1" strokeLinecap="round" opacity="0.5" />
      <circle cx="19" cy="6" r="1" fill="currentColor" opacity="0.5" />
      <line x1="19" y1="4" x2="19" y2="3" stroke="currentColor" strokeWidth="1" strokeLinecap="round" opacity="0.3" />
    </svg>
  );
}

// ─── PROJECT MANAGEMENT LOGO ──────────────────────────────────────
// A kanban board / clipboard with checklist
export function ProjectLogo({ size = 24, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <rect x="5" y="3" width="14" height="18" rx="2" stroke="currentColor" strokeWidth="1.4" fill="none" />
      <line x1="5" y1="7" x2="19" y2="7" stroke="currentColor" strokeWidth="1.4" />
      <line x1="8" y1="3" x2="8" y2="5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="12" y1="3" x2="12" y2="5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="16" y1="3" x2="16" y2="5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      <rect x="7.5" y="9.5" width="3" height="3" rx="0.5" fill="currentColor" opacity="0.6" />
      <rect x="12.5" y="9.5" width="4" height="3" rx="0.5" fill="currentColor" opacity="0.3" />
      <rect x="7.5" y="14" width="3" height="3" rx="0.5" fill="currentColor" opacity="0.3" />
      <rect x="12.5" y="14" width="4" height="3" rx="0.5" fill="currentColor" opacity="0.6" />
      <line x1="8" y1="7" x2="8" y2="8.5" stroke="currentColor" strokeWidth="0.8" opacity="0.5" />
      <line x1="12" y1="7" x2="12" y2="8.5" stroke="currentColor" strokeWidth="0.8" opacity="0.5" />
      <line x1="16" y1="7" x2="16" y2="8.5" stroke="currentColor" strokeWidth="0.8" opacity="0.5" />
    </svg>
  );
}

// ─── DOCUMENT MANAGEMENT LOGO ─────────────────────────────────────
// A document/folder with text lines
export function DocumentLogo({ size = 24, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <path d="M14 2v6h6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <line x1="8" y1="13" x2="16" y2="13" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="8" y1="17" x2="13" y2="17" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="8" y1="9" x2="10" y2="9" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      <rect x="16" y="15" width="3" height="3" rx="0.5" fill="currentColor" opacity="0.4" />
      <circle cx="17.5" cy="16.5" r="0.5" fill="white" opacity="0.8" />
    </svg>
  );
}

// ─── MARKETING LOGO ───────────────────────────────────────────────
// A megaphone / announcement icon
export function MarketingLogo({ size = 24, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <path d="M3 10a1 1 0 011-1h2l4-5v12l-4-5H4a1 1 0 01-1-1v0z" fill="currentColor" />
      <path d="M10 8h2a4 4 0 010 8h-2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" fill="none" />
      <path d="M14 12h1a2 2 0 012 2v0a2 2 0 01-2 2h-1" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" fill="none" />
      <path d="M14 8h1a2 2 0 012-2v0" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" fill="none" />
      <path d="M12 18v2a1 1 0 01-1 1H9a1 1 0 01-1-1v-1" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" fill="none" />
      <circle cx="18" cy="12" r="1.5" fill="currentColor" opacity="0.4" />
      <circle cx="20" cy="10" r="0.8" fill="currentColor" opacity="0.3" />
      <circle cx="20" cy="14" r="0.8" fill="currentColor" opacity="0.3" />
    </svg>
  );
}

// ─── E-COMMERCE LOGO ──────────────────────────────────────────────
// A shopping bag icon
export function EcommerceLogo({ size = 24, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4H6z" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <path d="M3 6h18" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M16 10a4 4 0 01-8 0" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" fill="none" />
      <circle cx="12" cy="12" r="1.5" fill="currentColor" opacity="0.3" />
      <path d="M7 9c0-1 .5-2 2-2" stroke="currentColor" strokeWidth="1" strokeLinecap="round" opacity="0.5" />
      <path d="M17 9c0-1-.5-2-2-2" stroke="currentColor" strokeWidth="1" strokeLinecap="round" opacity="0.5" />
    </svg>
  );
}

// ─── BUSINESS INTELLIGENCE LOGO ───────────────────────────────────
// A bar chart with growth arrow
export function BiLogo({ size = 24, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <rect x="4" y="14" width="3" height="7" rx="0.5" fill="currentColor" />
      <rect x="9" y="10" width="3" height="11" rx="0.5" fill="currentColor" opacity="0.7" />
      <rect x="14" y="6" width="3" height="15" rx="0.5" fill="currentColor" opacity="0.5" />
      <rect x="19" y="3" width="3" height="18" rx="0.5" fill="currentColor" opacity="0.3" />
      <path d="M4 21h18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M21 3l-2 3-2.5-1.5L14 6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <path d="M19 3h3v3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <circle cx="11" cy="4" r="0.8" fill="currentColor" opacity="0.4" />
    </svg>
  );
}

// ─── COMMUNICATION HUB LOGO ───────────────────────────────────────
// A chat bubble with message dots
export function CommHubLogo({ size = 24, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <path d="M21 11.5a8.5 8.5 0 01-8.5 8.5H4l2-3.5A8.5 8.5 0 1121 11.5z" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <circle cx="8" cy="11" r="1" fill="currentColor" />
      <circle cx="12" cy="11" r="1" fill="currentColor" />
      <circle cx="16" cy="11" r="1" fill="currentColor" />
      <line x1="4" y1="20" x2="6" y2="17" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" opacity="0.6" />
      <circle cx="19" cy="6" r="1.5" fill="currentColor" opacity="0.3" />
      <circle cx="21" cy="4" r="0.8" fill="currentColor" opacity="0.2" />
    </svg>
  );
}

// ─── WORKFLOW AUTOMATION LOGO ─────────────────────────────────────
// Interconnected gears / workflow nodes
export function WorkflowLogo({ size = 24, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <circle cx="6" cy="6" r="3" stroke="currentColor" strokeWidth="1.4" fill="none" />
      <circle cx="6" cy="6" r="1" fill="currentColor" />
      <circle cx="18" cy="6" r="3" stroke="currentColor" strokeWidth="1.4" fill="none" />
      <circle cx="18" cy="6" r="1" fill="currentColor" />
      <circle cx="12" cy="18" r="3" stroke="currentColor" strokeWidth="1.4" fill="none" />
      <circle cx="12" cy="18" r="1" fill="currentColor" />
      <line x1="9" y1="6" x2="15" y2="6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="7" y1="8.5" x2="11" y2="15.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeDasharray="2 2" />
      <line x1="17" y1="8.5" x2="13" y2="15.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeDasharray="2 2" />
      <circle cx="12" cy="12" r="0.8" fill="currentColor" opacity="0.5" />
      <line x1="4" y1="6" x2="3" y2="6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" opacity="0.5" />
      <line x1="21" y1="6" x2="22" y2="6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" opacity="0.5" />
      <line x1="12" y1="21" x2="12" y2="22" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" opacity="0.5" />
    </svg>
  );
}

// ─── SECURITY & COMPLIANCE LOGO ───────────────────────────────────
// A shield with checkmark
export function SecurityLogo({ size = 24, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <path d="M12 2l7 3v5c0 5-3.5 9.7-7 11-3.5-1.3-7-6-7-11V5l7-3z" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <circle cx="12" cy="12" r="0.5" fill="currentColor" opacity="0.3" />
      <line x1="12" y1="3" x2="12" y2="4" stroke="currentColor" strokeWidth="1" strokeLinecap="round" opacity="0.5" />
    </svg>
  );
}

// ─── PLATFORM & INTEGRATIONS LOGO ────────────────────────────────
// A globe with plug/connection nodes
export function PlatformLogo({ size = 24, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.4" fill="none" />
      <path d="M12 4c-2 0-4 3.5-4 8s2 8 4 8c2 0 4-3.5 4-8s-2-8-4-8z" stroke="currentColor" strokeWidth="1.4" fill="none" />
      <line x1="4" y1="12" x2="20" y2="12" stroke="currentColor" strokeWidth="1.4" />
      <circle cx="8" cy="12" r="0.8" fill="currentColor" />
      <circle cx="16" cy="12" r="0.8" fill="currentColor" />
      <circle cx="12" cy="8" r="0.8" fill="currentColor" opacity="0.6" />
      <circle cx="12" cy="16" r="0.8" fill="currentColor" opacity="0.6" />
      <path d="M17 7l2-2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" opacity="0.5" />
      <path d="M7 17l-2 2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" opacity="0.5" />
      <path d="M7 7L5 5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" opacity="0.5" />
      <path d="M17 17l2 2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" opacity="0.5" />
    </svg>
  );
}

// ─── INDUSTRY SOLUTIONS LOGO ──────────────────────────────────────
// A building / institution icon
export function IndustryLogo({ size = 24, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <rect x="3" y="8" width="7" height="13" rx="0.5" stroke="currentColor" strokeWidth="1.4" fill="none" />
      <rect x="14" y="4" width="7" height="17" rx="0.5" stroke="currentColor" strokeWidth="1.4" fill="none" />
      <line x1="3" y1="21" x2="21" y2="21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="5" y1="11" x2="8" y2="11" stroke="currentColor" strokeWidth="1" strokeLinecap="round" opacity="0.6" />
      <line x1="5" y1="14" x2="8" y2="14" stroke="currentColor" strokeWidth="1" strokeLinecap="round" opacity="0.6" />
      <line x1="5" y1="17" x2="8" y2="17" stroke="currentColor" strokeWidth="1" strokeLinecap="round" opacity="0.6" />
      <line x1="16" y1="8" x2="19" y2="8" stroke="currentColor" strokeWidth="1" strokeLinecap="round" opacity="0.6" />
      <line x1="16" y1="11" x2="19" y2="11" stroke="currentColor" strokeWidth="1" strokeLinecap="round" opacity="0.6" />
      <line x1="16" y1="14" x2="19" y2="14" stroke="currentColor" strokeWidth="1" strokeLinecap="round" opacity="0.6" />
      <line x1="16" y1="17" x2="19" y2="17" stroke="currentColor" strokeWidth="1" strokeLinecap="round" opacity="0.6" />
      <line x1="10.5" y1="4" x2="10.5" y2="3" stroke="currentColor" strokeWidth="1" strokeLinecap="round" opacity="0.5" />
      <line x1="13.5" y1="4" x2="13.5" y2="3" stroke="currentColor" strokeWidth="1" strokeLinecap="round" opacity="0.5" />
    </svg>
  );
}

// ─── ETHIOPIA FEATURES LOGO ──────────────────────────────────────
// A star/map outline with Ethiopian reference
export function EthiopiaLogo({ size = 24, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <path d="M12 2l2.5 5.5L20 8l-4 4 1 6-5-3-5 3 1-6-4-4 5.5-.5L12 2z" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <circle cx="12" cy="10" r="3" stroke="currentColor" strokeWidth="1.2" fill="none" />
      <circle cx="12" cy="10" r="1.2" fill="currentColor" />
      <line x1="12" y1="13" x2="12" y2="16" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="9" y1="10" x2="6" y2="10" stroke="currentColor" strokeWidth="1" strokeLinecap="round" opacity="0.5" />
      <line x1="15" y1="10" x2="18" y2="10" stroke="currentColor" strokeWidth="1" strokeLinecap="round" opacity="0.5" />
      <circle cx="5" cy="5" r="0.5" fill="currentColor" opacity="0.4" />
      <circle cx="19" cy="5" r="0.5" fill="currentColor" opacity="0.4" />
    </svg>
  );
}

// ─── LOGO MAPPING ──────────────────────────────────────────────────
// Maps pillar slugs to their custom logo components
export const PILLAR_LOGOS: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  "ai-core": AiCoreLogo,
  "human-resources": HrLogo,
  "crm-sales": CRMLogo,
  "inventory-warehouse": InventoryLogo,
  "finance-accounting": FinanceLogo,
  "procurement": ProcurementLogo,
  "manufacturing": ManufacturingLogo,
  "logistics-fleet": LogisticsLogo,
  "project-management": ProjectLogo,
  "document-management": DocumentLogo,
  "marketing": MarketingLogo,
  "e-commerce": EcommerceLogo,
  "business-intelligence": BiLogo,
  "communication-hub": CommHubLogo,
  "workflow-automation": WorkflowLogo,
  "security-compliance": SecurityLogo,
  "platform-integrations": PlatformLogo,
  "industry-solutions": IndustryLogo,
  "ethiopia-features": EthiopiaLogo,
};

// Helper to get a logo component by pillar slug
export function getPillarLogo(slug: string) {
  return PILLAR_LOGOS[slug];
}

// ─── REUSABLE LOGO RENDERER ────────────────────────────────────────────
export function PillarLogoIcon({ slug, size, className, emojiFallback }: {
  slug: string;
  size?: number;
  className?: string;
  emojiFallback?: string;
}) {
  const Logo = getPillarLogo(slug);
  if (Logo) {
    return <Logo size={size} className={className} />;
  }
  return <span className={className}>{emojiFallback}</span>;
}

import {
  BrainCircuit, Users, Activity, Package, Wallet, ShoppingCart,
  Factory, Truck, ClipboardList, FileText, Megaphone, Store, BarChart2,
  MessageSquare, Workflow, ShieldCheck, Globe, Building2, Flag
} from "lucide-react";

export function toSlug(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export const NEXYOVI_PILLARS = [
  { 
    emoji: "🧠", name: "AI Core", icon: BrainCircuit, 
    desc: "Autonomous agents, decision engine, voice AI",
    status: "Active",
    modules: ["AI CEO","AI Copilot","AI Agents","AI Workflow Builder","AI Voice Assistant","AI Knowledge Base","AI Document Intelligence","AI Analytics","AI Automation","AI Decision Engine"]
  },
  { 
    emoji: "👥", name: "Human Resources", icon: Users, 
    desc: "Employee lifecycle, payroll, LMS & more",
    status: "Active",
    modules: ["Employee Management","Recruitment (ATS)","Onboarding","Attendance","Leave Management","Payroll","Performance Management","Learning & Training (LMS)","Benefits","Employee Self-Service","Organizational Chart","Time Tracking","Shift Scheduling","Exit Management","HR Analytics"]
  },
  { 
    emoji: "🤝", name: "CRM & Sales", icon: Activity, 
    desc: "Pipeline, customers, contracts & forecasting",
    status: "Active",
    modules: ["Lead Management","Opportunity Pipeline","Customer Management","Contact Management","Sales Quotes","Orders","Invoicing","Contracts","Sales Forecasting","Customer Support","Customer Portal","Loyalty Programs","Sales Analytics"]
  },
  { 
    emoji: "📦", name: "Inventory & Warehouse", icon: Package, 
    desc: "Multi-warehouse, barcode & stock transfers",
    status: "Active",
    modules: ["Products","Categories","Warehouses","Stock Management","Batch & Serial Numbers","Barcode / QR","Purchase Orders","Goods Receipt","Stock Transfers","Cycle Counts","Inventory Forecasting","Supplier Stock","Warehouse Analytics"]
  },
  { 
    emoji: "💰", name: "Finance & Accounting", icon: Wallet, 
    desc: "GL, AP/AR, multi-currency & tax compliance",
    status: "Active",
    modules: ["General Ledger","Accounts Payable","Accounts Receivable","Budgeting","Expenses","Banking","Cash Flow","Tax & VAT","Fixed Assets","Financial Statements","Multi-Currency","Audit Trail","Financial Analytics"]
  },
  { 
    emoji: "🛒", name: "Procurement", icon: ShoppingCart, 
    desc: "Vendors, RFQs, tenders & approval chains",
    status: "Active",
    modules: ["Purchase Requests","RFQs","Vendor Management","Supplier Portal","Contract Management","Approval Workflow","Tender Management","Procurement Analytics"]
  },
  { 
    emoji: "🏭", name: "Manufacturing", icon: Factory, 
    desc: "BOM, work orders, quality & scheduling",
    status: "Active",
    modules: ["Production Planning","Bills of Materials (BOM)","Work Orders","Machine Monitoring","Maintenance","Quality Control","Production Scheduling","Manufacturing Analytics"]
  },
  { 
    emoji: "🚚", name: "Logistics & Fleet", icon: Truck, 
    desc: "GPS tracking, route optimization, delivery",
    status: "Beta",
    modules: ["Fleet Management","GPS Tracking","Driver Management","Route Optimization","Fuel Management","Delivery Tracking","Shipment Management","Logistics Analytics"]
  },
  { 
    emoji: "📋", name: "Project Management", icon: ClipboardList, 
    desc: "Kanban, Gantt, Scrum & resource allocation",
    status: "Active",
    modules: ["Projects","Tasks","Kanban Boards","Gantt Charts","Scrum","Sprint Planning","Resource Allocation","Time Tracking","Project Analytics"]
  },
  { 
    emoji: "📄", name: "Document Management", icon: FileText, 
    desc: "AI OCR, versioning & digital signatures",
    status: "Active",
    modules: ["File Storage","Version Control","OCR","AI Document Search","Digital Signatures","Templates","PDF Generation"]
  },
  { 
    emoji: "📢", name: "Marketing", icon: Megaphone, 
    desc: "Email, SMS, social media & AI content",
    status: "Beta",
    modules: ["Email Marketing","SMS Campaigns","Social Media Management","AI Content Generator","SEO","Landing Pages","Campaign Analytics"]
  },
  { 
    emoji: "🛍️", name: "E-Commerce", icon: Store, 
    desc: "Online store, payments & marketplace",
    status: "Beta",
    modules: ["Online Store","Product Catalog","Shopping Cart","Checkout","Payment Gateway","Shipping","Marketplace Integration","Customer Reviews"]
  },
  { 
    emoji: "📊", name: "Business Intelligence", icon: BarChart2, 
    desc: "KPIs, AI insights & custom reports",
    status: "Active",
    modules: ["Executive Dashboard","KPI Monitoring","Custom Reports","Forecasting","AI Insights","Data Warehouse","Interactive Charts"]
  },
  { 
    emoji: "💬", name: "Communication Hub", icon: MessageSquare, 
    desc: "Chat, video, WhatsApp & voice calls",
    status: "Active",
    modules: ["Team Chat","Video Meetings","Email","SMS","Push Notifications","WhatsApp Integration","Voice Calls"]
  },
  { 
    emoji: "⚙️", name: "Workflow Automation", icon: Workflow, 
    desc: "Drag-and-drop builder & event triggers",
    status: "Active",
    modules: ["Drag-and-Drop Builder","Approval Chains","Scheduled Jobs","Event Triggers","AI Automation","Business Rules Engine"]
  },
  { 
    emoji: "🔒", name: "Security & Compliance", icon: ShieldCheck, 
    desc: "RBAC, SSO, MFA & audit trail",
    status: "Active",
    modules: ["RBAC","ABAC","Single Sign-On (SSO)","Multi-Factor Auth (MFA)","Audit Logs","Encryption","Backup & Recovery","Device Management"]
  },
  { 
    emoji: "🌍", name: "Platform & Integrations", icon: Globe, 
    desc: "REST, GraphQL, webhooks & cloud connectors",
    status: "Active",
    modules: ["REST API","GraphQL API","Webhooks","Third-Party Integrations","Payment Integrations","Email Providers","SMS Providers","Cloud Storage"]
  },
  { 
    emoji: "🏢", name: "Industry Solutions", icon: Building2, 
    desc: "Hospital, School, Hotel, NGO & Gov ERP",
    status: "Beta",
    modules: ["Hospital Management","School Management","Hotel Management","NGO Management","Construction ERP","Agriculture ERP","Manufacturing ERP","Government ERP","Retail POS","Restaurant Management"]
  },
  { 
    emoji: "🇪🇹", name: "Ethiopia Features", icon: Flag, 
    desc: "Telebirr, Ethiopian calendar & local compliance",
    status: "Active",
    modules: ["Telebirr Integration","CBE Birr Integration","Ethiopian Calendar","Amharic / Afaan Oromo UI","Tigrinya / Somali UI","VAT & Pension Calculations","Government Procurement","Local Banking Integrations"]
  }
];

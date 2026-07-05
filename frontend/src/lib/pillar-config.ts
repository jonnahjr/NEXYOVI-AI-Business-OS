import { LucideIcon, Users, DollarSign, Activity, Package, ShoppingCart, Factory, Truck, ClipboardList, FileText, Megaphone, Store, BarChart2, MessageSquare, Workflow, ShieldCheck, Globe, Building2, Flag, BrainCircuit, TrendingUp, Clock, CheckCircle, AlertTriangle, Zap } from "lucide-react";

export type KPI = {
  label: string;
  value: string;
  change: string;
  positive: boolean;
  icon: LucideIcon;
};

export type QuickAction = {
  label: string;
  icon: LucideIcon;
  href: string;
  color: string;
};

export type PillarConfig = {
  kpis: KPI[];
  quickActions: QuickAction[];
  aiContext: string;
  color: string;
};

const PILLAR_CONFIGS: Record<string, PillarConfig> = {
  "ai-core": {
    color: "from-slate-900 to-black",
    aiContext: "I'm your AI Core assistant. I can help you configure AI agents, build workflows, and monitor AI performance across the entire OS.",
    kpis: [
      { label: "Active AI Agents",   value: "12",      change: "+3",    positive: true,  icon: BrainCircuit },
      { label: "Tasks Automated",    value: "1,247",   change: "+18%",  positive: true,  icon: Zap },
      { label: "Decisions Today",    value: "89",      change: "+24%",  positive: true,  icon: Activity },
      { label: "Avg Response Time",  value: "1.2s",    change: "-0.3s", positive: true,  icon: Clock },
    ],
    quickActions: [
      { label: "New AI Agent",       icon: BrainCircuit, href: "#", color: "bg-slate-100 text-slate-900" },
      { label: "Build Workflow",     icon: Workflow,     href: "#", color: "bg-slate-100 text-slate-900" },
      { label: "AI Knowledge Base",  icon: FileText,     href: "#", color: "bg-slate-100 text-slate-900" },
      { label: "AI Analytics",       icon: BarChart2,    href: "#", color: "bg-slate-100 text-slate-900" },
    ],
  },
  "human-resources": {
    color: "from-slate-900 to-black",
    aiContext: "I'm your HR AI assistant. I can help you onboard employees, process payroll, manage leave, and analyze workforce performance.",
    kpis: [
      { label: "Total Employees",    value: "247",     change: "+5",    positive: true,  icon: Users },
      { label: "On Leave Today",     value: "18",      change: "+2",    positive: false, icon: Clock },
      { label: "Pending Approvals",  value: "12",      change: "3 new", positive: false, icon: AlertTriangle },
      { label: "Payroll (MTD)",      value: "ETB 2.1M",change: "+4%",  positive: true,  icon: DollarSign },
    ],
    quickActions: [
      { label: "Add Employee",       icon: Users,       href: "/dashboard/human-resources/employee-management", color: "bg-slate-100 text-slate-900" },
      { label: "Run Payroll",        icon: DollarSign,  href: "/dashboard/human-resources/payroll",             color: "bg-slate-100 text-slate-900" },
      { label: "Approve Leave",      icon: CheckCircle, href: "/dashboard/human-resources/leave-management",    color: "bg-slate-100 text-slate-900" },
      { label: "View Org Chart",     icon: Building2,   href: "/dashboard/human-resources/organizational-chart",color: "bg-slate-100 text-slate-900" },
    ],
  },
  "crm-sales": {
    color: "from-slate-900 to-black",
    aiContext: "I'm your CRM AI assistant. I track your pipeline, predict deal closures, and suggest next best actions for each customer.",
    kpis: [
      { label: "Open Leads",         value: "84",      change: "+12",   positive: true,  icon: Activity },
      { label: "Pipeline Value",     value: "ETB 8.4M",change: "+23%",  positive: true,  icon: DollarSign },
      { label: "Won (MTD)",          value: "17",      change: "+5",    positive: true,  icon: CheckCircle },
      { label: "Avg Deal Size",      value: "ETB 494K",change: "+8%",   positive: true,  icon: TrendingUp },
    ],
    quickActions: [
      { label: "New Lead",           icon: Activity,    href: "/dashboard/crm-sales/lead-management",       color: "bg-slate-100 text-slate-900" },
      { label: "Create Invoice",     icon: FileText,    href: "/dashboard/crm-sales/invoicing",             color: "bg-slate-100 text-slate-900" },
      { label: "New Customer",       icon: Users,       href: "/dashboard/crm-sales/customer-management",   color: "bg-slate-100 text-slate-900" },
      { label: "Sales Report",       icon: BarChart2,   href: "/dashboard/crm-sales/sales-analytics",       color: "bg-slate-100 text-slate-900" },
    ],
  },
  "inventory-warehouse": {
    color: "from-slate-900 to-black",
    aiContext: "I'm your Inventory AI. I monitor stock levels, predict shortages, and can automatically trigger reorder requests.",
    kpis: [
      { label: "Total SKUs",         value: "3,412",   change: "+48",   positive: true,  icon: Package },
      { label: "Low Stock Alerts",   value: "23",      change: "+7",    positive: false, icon: AlertTriangle },
      { label: "Warehouses",         value: "4",       change: "1 full",positive: false, icon: Building2 },
      { label: "Stock Value",        value: "ETB 14M", change: "+6%",   positive: true,  icon: DollarSign },
    ],
    quickActions: [
      { label: "Add Product",        icon: Package,     href: "/dashboard/inventory-warehouse/products",         color: "bg-slate-100 text-slate-900" },
      { label: "Stock Transfer",     icon: Truck,       href: "/dashboard/inventory-warehouse/stock-transfers",  color: "bg-slate-100 text-slate-900" },
      { label: "Barcode Scan",       icon: Zap,         href: "/dashboard/inventory-warehouse/barcode-qr",      color: "bg-slate-100 text-slate-900" },
      { label: "Inventory Report",   icon: BarChart2,   href: "/dashboard/inventory-warehouse/warehouse-analytics",color: "bg-slate-100 text-slate-900" },
    ],
  },
  "finance-accounting": {
    color: "from-slate-900 to-black",
    aiContext: "I'm your Finance AI. I can generate financial reports, detect anomalies, forecast cash flow, and ensure tax compliance.",
    kpis: [
      { label: "Revenue (MTD)",      value: "ETB 4.2M",change: "+17%",  positive: true,  icon: TrendingUp },
      { label: "Expenses (MTD)",     value: "ETB 1.8M",change: "+3%",   positive: false, icon: DollarSign },
      { label: "Accounts Payable",   value: "ETB 620K",change: "-5%",   positive: true,  icon: Activity },
      { label: "Cash Balance",       value: "ETB 9.1M",change: "+8%",   positive: true,  icon: CheckCircle },
    ],
    quickActions: [
      { label: "New Journal Entry",  icon: FileText,    href: "/dashboard/finance-accounting/general-ledger",       color: "bg-slate-100 text-slate-900" },
      { label: "Pay Invoice",        icon: DollarSign,  href: "/dashboard/finance-accounting/accounts-payable",     color: "bg-slate-100 text-slate-900" },
      { label: "View Cash Flow",     icon: TrendingUp,  href: "/dashboard/finance-accounting/cash-flow",            color: "bg-slate-100 text-slate-900" },
      { label: "Tax Report",         icon: ShieldCheck, href: "/dashboard/finance-accounting/tax-vat",              color: "bg-slate-100 text-slate-900" },
    ],
  },
  "procurement": {
    color: "from-slate-900 to-black",
    aiContext: "I'm your Procurement AI. I can find the best vendors, generate RFQs, and manage your entire supply chain.",
    kpis: [
      { label: "Open Requests",      value: "34",      change: "+8",    positive: false, icon: ClipboardList },
      { label: "Active Vendors",     value: "128",     change: "+4",    positive: true,  icon: Building2 },
      { label: "Pending RFQs",       value: "11",      change: "-3",    positive: true,  icon: FileText },
      { label: "PO Value (MTD)",     value: "ETB 3.2M",change: "+12%",  positive: true,  icon: DollarSign },
    ],
    quickActions: [
      { label: "New Purchase Request",icon: ClipboardList,href: "/dashboard/procurement/purchase-requests",  color: "bg-slate-100 text-slate-900" },
      { label: "Send RFQ",           icon: FileText,    href: "/dashboard/procurement/rfqs",                color: "bg-slate-100 text-slate-900" },
      { label: "Add Vendor",         icon: Building2,   href: "/dashboard/procurement/vendor-management",   color: "bg-slate-100 text-slate-900" },
      { label: "Open Tenders",       icon: Zap,         href: "/dashboard/procurement/tender-management",   color: "bg-slate-100 text-slate-900" },
    ],
  },
  "manufacturing": {
    color: "from-slate-900 to-black",
    aiContext: "I'm your Manufacturing AI. I monitor production lines, predict maintenance needs, and optimize your work order scheduling.",
    kpis: [
      { label: "Active Work Orders", value: "28",      change: "+4",    positive: true,  icon: Factory },
      { label: "Production Output",  value: "94%",     change: "+2%",   positive: true,  icon: TrendingUp },
      { label: "Quality Defects",    value: "1.2%",    change: "-0.4%", positive: true,  icon: CheckCircle },
      { label: "Machine Uptime",     value: "98.4%",   change: "+1%",   positive: true,  icon: Zap },
    ],
    quickActions: [
      { label: "New Work Order",     icon: Factory,     href: "/dashboard/manufacturing/work-orders",          color: "bg-slate-100 text-slate-900" },
      { label: "View BOM",           icon: FileText,    href: "/dashboard/manufacturing/bills-of-materials-bom",color: "bg-slate-100 text-slate-900" },
      { label: "Quality Check",      icon: CheckCircle, href: "/dashboard/manufacturing/quality-control",      color: "bg-slate-100 text-slate-900" },
      { label: "Schedule",           icon: Clock,       href: "/dashboard/manufacturing/production-scheduling", color: "bg-slate-100 text-slate-900" },
    ],
  },
  "logistics-fleet": {
    color: "from-slate-900 to-black",
    aiContext: "I'm your Logistics AI. I optimize delivery routes, monitor your fleet in real time, and forecast delivery times.",
    kpis: [
      { label: "Active Deliveries",  value: "43",      change: "+6",    positive: true,  icon: Truck },
      { label: "Vehicles in Fleet",  value: "22",      change: "+1",    positive: true,  icon: Truck },
      { label: "On-Time Rate",       value: "91%",     change: "+3%",   positive: true,  icon: CheckCircle },
      { label: "Fuel Cost (MTD)",    value: "ETB 84K", change: "+5%",   positive: false, icon: DollarSign },
    ],
    quickActions: [
      { label: "New Shipment",       icon: Truck,       href: "/dashboard/logistics-fleet/shipment-management",  color: "bg-slate-100 text-slate-900" },
      { label: "Track Delivery",     icon: Activity,    href: "/dashboard/logistics-fleet/delivery-tracking",    color: "bg-slate-100 text-slate-900" },
      { label: "Optimize Route",     icon: Zap,         href: "/dashboard/logistics-fleet/route-optimization",  color: "bg-slate-100 text-slate-900" },
      { label: "Fleet Report",       icon: BarChart2,   href: "/dashboard/logistics-fleet/logistics-analytics",  color: "bg-slate-100 text-slate-900" },
    ],
  },
  "project-management": {
    color: "from-slate-900 to-black",
    aiContext: "I'm your Project AI. I track milestones, alert you on blockers, allocate resources, and generate status reports automatically.",
    kpis: [
      { label: "Active Projects",    value: "16",      change: "+2",    positive: true,  icon: ClipboardList },
      { label: "Tasks Due Today",    value: "24",      change: "+5",    positive: false, icon: AlertTriangle },
      { label: "On-Track Projects",  value: "12/16",   change: "75%",   positive: true,  icon: CheckCircle },
      { label: "Overdue Tasks",      value: "7",       change: "-3",    positive: true,  icon: Clock },
    ],
    quickActions: [
      { label: "New Project",        icon: ClipboardList,href: "/dashboard/project-management/projects",          color: "bg-slate-100 text-slate-900" },
      { label: "Add Task",           icon: CheckCircle,  href: "/dashboard/project-management/tasks",             color: "bg-slate-100 text-slate-900" },
      { label: "Kanban Board",       icon: Workflow,     href: "/dashboard/project-management/kanban-boards",     color: "bg-slate-100 text-slate-900" },
      { label: "Gantt Chart",        icon: BarChart2,    href: "/dashboard/project-management/gantt-charts",      color: "bg-slate-100 text-slate-900" },
    ],
  },
  "document-management": {
    color: "from-slate-900 to-black",
    aiContext: "I'm your Document AI. I can read, classify, extract data, and summarize any document you upload.",
    kpis: [
      { label: "Total Documents",    value: "8,421",   change: "+234",  positive: true,  icon: FileText },
      { label: "Pending Signatures", value: "14",      change: "+4",    positive: false, icon: AlertTriangle },
      { label: "OCR Processed",      value: "1,204",   change: "+89",   positive: true,  icon: Zap },
      { label: "Storage Used",       value: "42 GB",   change: "+2GB",  positive: false, icon: Package },
    ],
    quickActions: [
      { label: "Upload Document",    icon: FileText,    href: "/dashboard/document-management/file-storage",       color: "bg-slate-100 text-slate-900" },
      { label: "Send for Signature", icon: CheckCircle, href: "/dashboard/document-management/digital-signatures", color: "bg-slate-100 text-slate-900" },
      { label: "Run OCR",            icon: Zap,         href: "/dashboard/document-management/ocr",                color: "bg-slate-100 text-slate-900" },
      { label: "Search Documents",   icon: Activity,    href: "/dashboard/document-management/ai-document-search", color: "bg-slate-100 text-slate-900" },
    ],
  },
  "marketing": {
    color: "from-slate-900 to-black",
    aiContext: "I'm your Marketing AI. I can draft email campaigns, generate social media content, and analyze campaign performance.",
    kpis: [
      { label: "Active Campaigns",   value: "6",       change: "+2",    positive: true,  icon: Megaphone },
      { label: "Email Open Rate",    value: "34%",     change: "+4%",   positive: true,  icon: TrendingUp },
      { label: "Leads Generated",    value: "182",     change: "+47",   positive: true,  icon: Users },
      { label: "Campaign ROI",       value: "3.2x",    change: "+0.4x", positive: true,  icon: DollarSign },
    ],
    quickActions: [
      { label: "New Campaign",       icon: Megaphone,   href: "/dashboard/marketing/email-marketing",      color: "bg-slate-100 text-slate-900" },
      { label: "AI Content",         icon: BrainCircuit,href: "/dashboard/marketing/ai-content-generator", color: "bg-slate-100 text-slate-900" },
      { label: "SMS Campaign",       icon: MessageSquare,href: "/dashboard/marketing/sms-campaigns",       color: "bg-slate-100 text-slate-900" },
      { label: "Analytics",          icon: BarChart2,   href: "/dashboard/marketing/campaign-analytics",   color: "bg-slate-100 text-slate-900" },
    ],
  },
  "e-commerce": {
    color: "from-slate-900 to-black",
    aiContext: "I'm your E-Commerce AI. I optimize product listings, manage inventory sync, and predict which products will sell best.",
    kpis: [
      { label: "Online Orders",      value: "1,204",   change: "+18%",  positive: true,  icon: Store },
      { label: "Revenue (Online)",   value: "ETB 2.8M",change: "+22%",  positive: true,  icon: DollarSign },
      { label: "Cart Abandonment",   value: "32%",     change: "-4%",   positive: true,  icon: Activity },
      { label: "Active Products",    value: "842",     change: "+24",   positive: true,  icon: Package },
    ],
    quickActions: [
      { label: "Add Product",        icon: Package,     href: "/dashboard/e-commerce/product-catalog",        color: "bg-slate-100 text-slate-900" },
      { label: "View Orders",        icon: Store,       href: "/dashboard/e-commerce/shopping-cart",          color: "bg-slate-100 text-slate-900" },
      { label: "Setup Payment",      icon: DollarSign,  href: "/dashboard/e-commerce/payment-gateway",        color: "bg-slate-100 text-slate-900" },
      { label: "Marketplace Sync",   icon: Globe,       href: "/dashboard/e-commerce/marketplace-integration",color: "bg-slate-100 text-slate-900" },
    ],
  },
  "business-intelligence": {
    color: "from-slate-900 to-black",
    aiContext: "I'm your BI AI. I analyze trends, generate executive dashboards, forecast KPIs, and surface hidden insights from your data.",
    kpis: [
      { label: "Active Dashboards",  value: "8",       change: "+2",    positive: true,  icon: BarChart2 },
      { label: "Reports Generated",  value: "124",     change: "+34",   positive: true,  icon: FileText },
      { label: "Data Sources",       value: "14",      change: "+1",    positive: true,  icon: Package },
      { label: "AI Insights",        value: "47",      change: "+12",   positive: true,  icon: BrainCircuit },
    ],
    quickActions: [
      { label: "New Dashboard",      icon: BarChart2,   href: "/dashboard/business-intelligence/executive-dashboard",color: "bg-slate-100 text-slate-900" },
      { label: "Custom Report",      icon: FileText,    href: "/dashboard/business-intelligence/custom-reports",    color: "bg-slate-100 text-slate-900" },
      { label: "AI Forecast",        icon: TrendingUp,  href: "/dashboard/business-intelligence/forecasting",       color: "bg-slate-100 text-slate-900" },
      { label: "KPI Monitor",        icon: Activity,    href: "/dashboard/business-intelligence/kpi-monitoring",    color: "bg-slate-100 text-slate-900" },
    ],
  },
  "communication-hub": {
    color: "from-slate-900 to-black",
    aiContext: "I'm your Communication AI. I summarize meetings, draft messages, and help you stay on top of all your team communications.",
    kpis: [
      { label: "Messages Today",     value: "1,482",   change: "+234",  positive: true,  icon: MessageSquare },
      { label: "Video Meetings",     value: "12",      change: "+3",    positive: true,  icon: Activity },
      { label: "WhatsApp Msgs",      value: "384",     change: "+67",   positive: true,  icon: MessageSquare },
      { label: "Unread Alerts",      value: "24",      change: "+8",    positive: false, icon: AlertTriangle },
    ],
    quickActions: [
      { label: "Team Chat",          icon: MessageSquare,href: "/dashboard/communication-hub/team-chat",             color: "bg-slate-100 text-slate-900" },
      { label: "Start Meeting",      icon: Activity,    href: "/dashboard/communication-hub/video-meetings",         color: "bg-slate-100 text-slate-900" },
      { label: "Send SMS",           icon: Zap,         href: "/dashboard/communication-hub/sms",                   color: "bg-slate-100 text-slate-900" },
      { label: "WhatsApp",           icon: MessageSquare,href: "/dashboard/communication-hub/whatsapp-integration",  color: "bg-slate-100 text-slate-900" },
    ],
  },
  "workflow-automation": {
    color: "from-slate-900 to-black",
    aiContext: "I'm your Workflow AI. I can design automation from scratch — just describe what you want to automate, and I'll build it.",
    kpis: [
      { label: "Active Workflows",   value: "34",      change: "+8",    positive: true,  icon: Workflow },
      { label: "Tasks Automated",    value: "4,821",   change: "+18%",  positive: true,  icon: Zap },
      { label: "Time Saved (hrs)",   value: "128",     change: "+24",   positive: true,  icon: Clock },
      { label: "Failed Runs",        value: "2",       change: "-5",    positive: true,  icon: AlertTriangle },
    ],
    quickActions: [
      { label: "Build Workflow",     icon: Workflow,    href: "/dashboard/workflow-automation/drag-and-drop-builder",color: "bg-slate-100 text-slate-900" },
      { label: "Approval Chain",     icon: CheckCircle, href: "/dashboard/workflow-automation/approval-chains",      color: "bg-slate-100 text-slate-900" },
      { label: "Scheduled Jobs",     icon: Clock,       href: "/dashboard/workflow-automation/scheduled-jobs",       color: "bg-slate-100 text-slate-900" },
      { label: "AI Automation",      icon: BrainCircuit,href: "/dashboard/workflow-automation/ai-automation",        color: "bg-slate-100 text-slate-900" },
    ],
  },
  "security-compliance": {
    color: "from-slate-900 to-black",
    aiContext: "I'm your Security AI. I monitor threats, enforce compliance, analyze access patterns, and alert you to suspicious activity.",
    kpis: [
      { label: "Active Users",       value: "247",     change: "+5",    positive: true,  icon: Users },
      { label: "Security Score",     value: "94/100",  change: "+2",    positive: true,  icon: ShieldCheck },
      { label: "Threats Blocked",    value: "38",      change: "+12",   positive: true,  icon: AlertTriangle },
      { label: "Audit Events",       value: "12,421",  change: "+1.2K", positive: true,  icon: FileText },
    ],
    quickActions: [
      { label: "Manage Roles",       icon: ShieldCheck, href: "/dashboard/security-compliance/rbac",           color: "bg-slate-100 text-slate-900" },
      { label: "MFA Settings",       icon: Zap,         href: "/dashboard/security-compliance/multi-factor-auth-mfa",color: "bg-slate-100 text-slate-900" },
      { label: "View Audit Logs",    icon: FileText,    href: "/dashboard/security-compliance/audit-logs",     color: "bg-slate-100 text-slate-900" },
      { label: "Backup System",      icon: Package,     href: "/dashboard/security-compliance/backup-recovery",color: "bg-slate-100 text-slate-900" },
    ],
  },
  "platform-integrations": {
    color: "from-slate-900 to-black",
    aiContext: "I'm your Integration AI. I help you connect any external system, build API workflows, and monitor all your integration health.",
    kpis: [
      { label: "Active Integrations",value: "24",      change: "+3",    positive: true,  icon: Globe },
      { label: "API Calls (Today)",  value: "48,241",  change: "+12%",  positive: true,  icon: Zap },
      { label: "Webhook Events",     value: "1,842",   change: "+234",  positive: true,  icon: Activity },
      { label: "Uptime",             value: "99.97%",  change: "+0.01%",positive: true,  icon: CheckCircle },
    ],
    quickActions: [
      { label: "Connect App",        icon: Globe,       href: "/dashboard/platform-integrations/third-party-integrations",color: "bg-slate-100 text-slate-900" },
      { label: "API Keys",           icon: ShieldCheck, href: "/dashboard/platform-integrations/rest-api",               color: "bg-slate-100 text-slate-900" },
      { label: "Webhooks",           icon: Zap,         href: "/dashboard/platform-integrations/webhooks",              color: "bg-slate-100 text-slate-900" },
      { label: "Telebirr Connect",   icon: DollarSign,  href: "/dashboard/platform-integrations/payment-integrations",  color: "bg-slate-100 text-slate-900" },
    ],
  },
  "industry-solutions": {
    color: "from-slate-900 to-black",
    aiContext: "I'm your Industry AI. I configure SASA specifically for your industry with pre-built templates, workflows, and compliance rules.",
    kpis: [
      { label: "Active Industries",  value: "3",       change: "+1",    positive: true,  icon: Building2 },
      { label: "Templates Deployed", value: "12",      change: "+4",    positive: true,  icon: FileText },
      { label: "Branches",           value: "6",       change: "+1",    positive: true,  icon: Globe },
      { label: "Custom Modules",     value: "8",       change: "+2",    positive: true,  icon: Package },
    ],
    quickActions: [
      { label: "Hospital Module",    icon: Building2,   href: "/dashboard/industry-solutions/hospital-management",color: "bg-slate-100 text-slate-900" },
      { label: "School Module",      icon: Users,       href: "/dashboard/industry-solutions/school-management", color: "bg-slate-100 text-slate-900" },
      { label: "Hotel Module",       icon: Globe,       href: "/dashboard/industry-solutions/hotel-management",  color: "bg-slate-100 text-slate-900" },
      { label: "NGO Module",         icon: CheckCircle, href: "/dashboard/industry-solutions/ngo-management",    color: "bg-slate-100 text-slate-900" },
    ],
  },
  "ethiopia-features": {
    color: "from-slate-900 to-black",
    aiContext: "I'm your Ethiopia-specific assistant. I manage Telebirr payments, Ethiopian calendar operations, Amharic content, and local tax compliance.",
    kpis: [
      { label: "Telebirr Txns (MTD)",value: "4,821",   change: "+18%",  positive: true,  icon: DollarSign },
      { label: "CBE Birr Txns",      value: "1,204",   change: "+12%",  positive: true,  icon: DollarSign },
      { label: "Amharic Users",      value: "184",     change: "+24",   positive: true,  icon: Users },
      { label: "Tax Compliance",     value: "100%",    change: "✓",     positive: true,  icon: ShieldCheck },
    ],
    quickActions: [
      { label: "Telebirr Payment",   icon: DollarSign,  href: "/dashboard/ethiopia-features/telebirr-integration",        color: "bg-slate-100 text-slate-900" },
      { label: "CBE Birr",           icon: DollarSign,  href: "/dashboard/ethiopia-features/cbe-birr-integration",        color: "bg-slate-100 text-slate-900" },
      { label: "Ethiopian Calendar", icon: Clock,       href: "/dashboard/ethiopia-features/ethiopian-calendar",          color: "bg-slate-100 text-slate-900" },
      { label: "Tax Report",         icon: FileText,    href: "/dashboard/ethiopia-features/vat-pension-calculations",    color: "bg-slate-100 text-slate-900" },
    ],
  },
};

export function getPillarConfig(slug: string): PillarConfig {
  return PILLAR_CONFIGS[slug] ?? {
    color: "from-slate-900 to-black",
    aiContext: "I'm your AI assistant for this pillar. How can I help you today?",
    kpis: [
      { label: "Total Records",  value: "—", change: "—", positive: true, icon: Activity },
      { label: "Active",         value: "—", change: "—", positive: true, icon: CheckCircle },
      { label: "Pending",        value: "—", change: "—", positive: false, icon: Clock },
      { label: "Completed",      value: "—", change: "—", positive: true, icon: CheckCircle },
    ],
    quickActions: [],
  };
}

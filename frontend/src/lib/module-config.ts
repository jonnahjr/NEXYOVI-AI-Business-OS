// Module config: columns and sample records for every module across all 19 pillars

export type Column = {
  key: string;
  label: string;
  type: "text" | "badge" | "currency" | "date" | "number" | "avatar" | "select";
  options?: string[];
};

export type ModuleConfig = {
  title: string;
  columns: Column[];
  rows: Record<string, any>[];
};

// ── HR MODULES ────────────────────────────────────────────
const EMPLOYEES = {
  title: "Employee Management",
  columns: [
    // ── Personal Info ───────────────────────────────────────
    { key: "name",          label: "Name",            type: "avatar" as const },
    { key: "id",            label: "Emp ID",           type: "text" as const },
    { key: "gender",        label: "Gender",           type: "select" as const, options: ["Male", "Female", "Other", "Unspecified"] },
    { key: "dateOfBirth",   label: "DOB",              type: "date" as const },
    { key: "nationality",   label: "Nationality",      type: "text" as const },
    { key: "maritalStatus", label: "Marital Status",   type: "select" as const, options: ["Single", "Married", "Divorced", "Widowed", "Separated", "Other"] },
    { key: "nationalId",    label: "National ID",      type: "text" as const },
    { key: "passportNumber",label: "Passport",         type: "text" as const },
    // ── Contact ─────────────────────────────────────────────
    { key: "personalEmail", label: "Personal Email",   type: "text" as const },
    { key: "workEmail",     label: "Work Email",       type: "text" as const },
    { key: "personalPhone", label: "Mobile",           type: "text" as const },
    { key: "workPhone",     label: "Work Phone",       type: "text" as const },
    { key: "address",       label: "Address",          type: "text" as const },
    { key: "city",          label: "City",             type: "text" as const },
    { key: "region",        label: "Region",           type: "text" as const },
    { key: "country",       label: "Country",          type: "text" as const },
    { key: "postalCode",    label: "Postal Code",       type: "text" as const },
    { key: "emergencyName", label: "Emergency Contact",type: "text" as const },
    { key: "emergencyPhone",label: "Emergency Phone",  type: "text" as const },
    { key: "emergencyRelation",label: "Emergency Rel", type: "text" as const },
    // ── Employment ──────────────────────────────────────────
    { key: "department",    label: "Department",       type: "text" as const },
    { key: "position",      label: "Position",         type: "text" as const },
    { key: "employmentType",label: "Employ Type",      type: "select" as const, options: ["Full Time", "Part Time", "Contract", "Intern", "Temporary", "Freelance"] },
    { key: "status",        label: "Status",           type: "select" as const, options: ["Active", "Inactive", "On Leave", "Terminated", "Suspended"] },
    { key: "startDate",     label: "Hire Date",        type: "date" as const },
    { key: "branchOffice",  label: "Branch",           type: "text" as const },
    { key: "workLocation",  label: "Work Location",    type: "select" as const, options: ["On-site", "Remote", "Hybrid", "Field", "Client Site"] },
    { key: "workShift",     label: "Shift",            type: "select" as const, options: ["Morning Shift", "Evening Shift", "Night Shift", "Day Shift", "Flexible / On-Demand", "Rotating", "Split Shift"] },
    { key: "gradeLevel",    label: "Grade",            type: "text" as const },
    { key: "costCenter",    label: "Cost Center",      type: "text" as const },
    // ── Payroll ─────────────────────────────────────────────
    { key: "salary",        label: "Salary (ETB)",     type: "currency" as const },
    { key: "salaryType",    label: "Salary Type",      type: "select" as const, options: ["Monthly", "Daily", "Hourly", "Weekly", "Bi-Weekly", "Annual"] },
    { key: "currency",      label: "Currency",         type: "select" as const, options: ["ETB", "USD", "EUR", "GBP", "KES", "UGX", "TZS", "RWF"] },
    { key: "allowances",    label: "Allowances",       type: "currency" as const },
    { key: "bonuses",       label: "Bonuses",          type: "currency" as const },
    { key: "paymentMethod", label: "Payment Method",   type: "select" as const, options: ["Bank Transfer", "Cash", "Check", "Mobile Money", "Telebirr", "CBE Birr"] },
    { key: "bankName",      label: "Bank",             type: "text" as const },
    { key: "bankAccount",   label: "Bank Account",     type: "text" as const },
    { key: "taxId",         label: "TIN",              type: "text" as const },
    { key: "pensionId",     label: "Pension ID",       type: "text" as const },
    // ── Leave ───────────────────────────────────────────────
    { key: "annualLeaveBalance",   label: "Annual Leave", type: "number" as const },
    { key: "sickLeaveBalance",     label: "Sick Leave",   type: "number" as const },
    { key: "maternityLeave",       label: "Maternity",    type: "number" as const },
    { key: "paternityLeave",       label: "Paternity",    type: "number" as const },
    { key: "otherLeaveTypes",       label: "Other Leave",   type: "text" as const },
  ],
  rows: [
    { name: "Abebe Girma",    id: "EMP-001", gender: "Male", dateOfBirth: "1990-05-12", nationality: "Ethiopian", maritalStatus: "Married", nationalId: "ID-001", passportNumber: "EP123456", personalEmail: "abebe@example.com", workEmail: "abebe@nexyovi.com", personalPhone: "+251-911-000001", workPhone: "+251-911-000101", address: "Bole, Woreda 03", city: "Addis Ababa", region: "Addis Ababa", country: "Ethiopia", postalCode: "1000", emergencyName: "Sara A.", emergencyPhone: "+251-922-000001", emergencyRelation: "Spouse", department: "Finance", position: "Senior Accountant", employmentType: "Full Time", status: "Active", startDate: "2021-03-15", branchOffice: "Head Office (HQ)", workLocation: "Addis Ababa (HQ)", workShift: "9-11 Full Time", gradeLevel: "L4 - Senior", costCenter: "CC-FIN-1001", salary: 35000, salaryType: "Monthly", currency: "ETB", allowances: 4200, bonuses: 5000, paymentMethod: "Bank Transfer", bankName: "CBE", bankAccount: "1000123456789", taxId: "TIN-001", pensionId: "PEN-001", annualLeaveBalance: 21, sickLeaveBalance: 14, maternityLeave: 0, paternityLeave: 0, otherLeaveTypes: "" },
    { name: "Tigist Haile",   id: "EMP-002", gender: "Female", dateOfBirth: "1988-11-25", nationality: "Ethiopian", maritalStatus: "Married", nationalId: "ID-002", passportNumber: "EP789012", personalEmail: "tigist@example.com", workEmail: "tigist@nexyovi.com", personalPhone: "+251-911-000002", workPhone: "+251-911-000102", address: "CMC", city: "Addis Ababa", region: "Addis Ababa", country: "Ethiopia", postalCode: "1000", emergencyName: "Dawit H.", emergencyPhone: "+251-922-000002", emergencyRelation: "Spouse", department: "HR", position: "HR Manager", employmentType: "Full Time", status: "Active", startDate: "2020-08-01", branchOffice: "Head Office (HQ)", workLocation: "Addis Ababa (HQ)", workShift: "9-11 Full Time", gradeLevel: "L5 - Lead", costCenter: "CC-HR-1001", salary: 42000, salaryType: "Monthly", currency: "ETB", allowances: 5040, bonuses: 6000, paymentMethod: "Bank Transfer", bankName: "Awash Bank", bankAccount: "1000234567890", taxId: "TIN-002", pensionId: "PEN-002", annualLeaveBalance: 21, sickLeaveBalance: 14, maternityLeave: 0, paternityLeave: 0, otherLeaveTypes: "" },
    { name: "Dawit Bekele",   id: "EMP-003", gender: "Male", dateOfBirth: "1995-02-18", nationality: "Ethiopian", maritalStatus: "Single", nationalId: "ID-003", passportNumber: "", personalEmail: "dawit@example.com", workEmail: "dawit@nexyovi.com", personalPhone: "+251-911-000003", workPhone: "+251-911-000103", address: "22 Kebele", city: "Addis Ababa", region: "Addis Ababa", country: "Ethiopia", postalCode: "1000", emergencyName: "Bekele D.", emergencyPhone: "+251-922-000003", emergencyRelation: "Parent", department: "IT", position: "Software Engineer", employmentType: "Full Time", status: "Active", startDate: "2022-01-10", branchOffice: "Head Office (HQ)", workLocation: "Remote", workShift: "Flexible / On-Demand", gradeLevel: "L3 - Mid-Level", costCenter: "CC-IT-1001", salary: 48000, salaryType: "Monthly", currency: "ETB", allowances: 5760, bonuses: 8000, paymentMethod: "Bank Transfer", bankName: "Dashen Bank", bankAccount: "1000345678901", taxId: "TIN-003", pensionId: "PEN-003", annualLeaveBalance: 18, sickLeaveBalance: 14, maternityLeave: 0, paternityLeave: 0, otherLeaveTypes: "" },
    { name: "Sara Tadesse",   id: "EMP-004", gender: "Female", dateOfBirth: "1997-07-30", nationality: "Ethiopian", maritalStatus: "Single", nationalId: "ID-004", passportNumber: "", personalEmail: "sara@example.com", workEmail: "sara@nexyovi.com", personalPhone: "+251-911-000004", workPhone: "+251-911-000104", address: "Mexico Square", city: "Addis Ababa", region: "Addis Ababa", country: "Ethiopia", postalCode: "1000", emergencyName: "Tadesse S.", emergencyPhone: "+251-922-000004", emergencyRelation: "Parent", department: "Sales", position: "Sales Executive", employmentType: "Full Time", status: "Active", startDate: "2022-06-20", branchOffice: "Head Office (HQ)", workLocation: "On-site", workShift: "Morning Shift", gradeLevel: "L3 - Mid-Level", costCenter: "CC-SAL-1001", salary: 28000, salaryType: "Monthly", currency: "ETB", allowances: 3360, bonuses: 4000, paymentMethod: "Bank Transfer", bankName: "CBE", bankAccount: "1000456789012", taxId: "TIN-004", pensionId: "PEN-004", annualLeaveBalance: 21, sickLeaveBalance: 14, maternityLeave: 90, paternityLeave: 0, otherLeaveTypes: "" },
    { name: "Yonas Alemu",    id: "EMP-005", gender: "Male", dateOfBirth: "1985-09-14", nationality: "Ethiopian", maritalStatus: "Married", nationalId: "ID-005", passportNumber: "EP345678", personalEmail: "yonas@example.com", workEmail: "yonas@nexyovi.com", personalPhone: "+251-911-000005", workPhone: "+251-911-000105", address: "Piassa", city: "Addis Ababa", region: "Addis Ababa", country: "Ethiopia", postalCode: "1000", emergencyName: "Alemu Y.", emergencyPhone: "+251-922-000005", emergencyRelation: "Spouse", department: "Operations", position: "Operations Manager", employmentType: "Full Time", status: "On Leave", startDate: "2019-11-05", branchOffice: "Head Office (HQ)", workLocation: "On-site", workShift: "Day Shift", gradeLevel: "L5 - Lead", costCenter: "CC-OPS-1001", salary: 52000, salaryType: "Monthly", currency: "ETB", allowances: 6240, bonuses: 10000, paymentMethod: "Bank Transfer", bankName: "CBE", bankAccount: "1000567890123", taxId: "TIN-005", pensionId: "PEN-005", annualLeaveBalance: 25, sickLeaveBalance: 14, maternityLeave: 0, paternityLeave: 14, otherLeaveTypes: "" },
    { name: "Mekdes Worku",   id: "EMP-006", gender: "Female", dateOfBirth: "1993-04-22", nationality: "Ethiopian", maritalStatus: "Married", nationalId: "ID-006", passportNumber: "", personalEmail: "mekdes@example.com", workEmail: "mekdes@nexyovi.com", personalPhone: "+251-911-000006", workPhone: "+251-911-000106", address: "Bole", city: "Addis Ababa", region: "Addis Ababa", country: "Ethiopia", postalCode: "1000", emergencyName: "Worku M.", emergencyPhone: "+251-922-000006", emergencyRelation: "Spouse", department: "Marketing", position: "Marketing Specialist", employmentType: "Contract", status: "Active", startDate: "2023-02-14", branchOffice: "Head Office (HQ)", workLocation: "Hybrid", workShift: "Flexible / On-Demand", gradeLevel: "L3 - Mid-Level", costCenter: "CC-MKT-1001", salary: 32000, salaryType: "Monthly", currency: "ETB", allowances: 3840, bonuses: 3000, paymentMethod: "Bank Transfer", bankName: "Bank of Abyssinia", bankAccount: "1000678901234", taxId: "TIN-006", pensionId: "PEN-006", annualLeaveBalance: 21, sickLeaveBalance: 14, maternityLeave: 90, paternityLeave: 0, otherLeaveTypes: "" },
    { name: "Biniam Tesfaye", id: "EMP-007", gender: "Male", dateOfBirth: "1991-12-05", nationality: "Ethiopian", maritalStatus: "Single", nationalId: "ID-007", passportNumber: "", personalEmail: "biniam@example.com", workEmail: "biniam@nexyovi.com", personalPhone: "+251-911-000007", workPhone: "+251-911-000107", address: "Kera", city: "Addis Ababa", region: "Addis Ababa", country: "Ethiopia", postalCode: "1000", emergencyName: "Tesfaye B.", emergencyPhone: "+251-922-000007", emergencyRelation: "Parent", department: "Procurement", position: "Procurement Officer", employmentType: "Full Time", status: "Active", startDate: "2021-09-30", branchOffice: "Head Office (HQ)", workLocation: "On-site", workShift: "Morning Shift", gradeLevel: "L3 - Mid-Level", costCenter: "CC-PRO-1001", salary: 30000, salaryType: "Monthly", currency: "ETB", allowances: 3600, bonuses: 3500, paymentMethod: "Bank Transfer", bankName: "CBE", bankAccount: "1000789012345", taxId: "TIN-007", pensionId: "PEN-007", annualLeaveBalance: 21, sickLeaveBalance: 14, maternityLeave: 0, paternityLeave: 0, otherLeaveTypes: "" },
    { name: "Hana Bekele",    id: "EMP-008", gender: "Female", dateOfBirth: "1989-08-19", nationality: "Ethiopian", maritalStatus: "Divorced", nationalId: "ID-008", passportNumber: "EP901234", personalEmail: "hana@example.com", workEmail: "hana@nexyovi.com", personalPhone: "+251-911-000008", workPhone: "+251-911-000108", address: "Kazanchis", city: "Addis Ababa", region: "Addis Ababa", country: "Ethiopia", postalCode: "1000", emergencyName: "Bekele H.", emergencyPhone: "+251-922-000008", emergencyRelation: "Sibling", department: "Finance", position: "Financial Analyst", employmentType: "Part Time", status: "Inactive", startDate: "2020-04-22", branchOffice: "Head Office (HQ)", workLocation: "Remote", workShift: "Evening Shift", gradeLevel: "L4 - Senior", costCenter: "CC-FIN-1002", salary: 38000, salaryType: "Monthly", currency: "ETB", allowances: 4560, bonuses: 4500, paymentMethod: "Bank Transfer", bankName: "Zemen Bank", bankAccount: "1000890123456", taxId: "TIN-008", pensionId: "PEN-008", annualLeaveBalance: 21, sickLeaveBalance: 14, maternityLeave: 0, paternityLeave: 0, otherLeaveTypes: "" },
  ],
};

const PAYROLL = {
  title: "Payroll",
  columns: [
    { key: "employee",      label: "Employee",      type: "avatar" as const },
    { key: "employeeCode",  label: "Emp ID",        type: "text" as const },
    { key: "department",    label: "Department",    type: "text" as const },
    { key: "position",      label: "Position",      type: "text" as const },
    { key: "employmentType",label: "Type",          type: "select" as const, options: ["Full Time", "Part Time", "Contract", "Intern", "Temporary", "Freelance"] },
    { key: "empStatus",     label: "Emp Status",    type: "select" as const, options: ["Active", "Inactive", "On Leave", "Terminated"] },
    { key: "period",        label: "Period",        type: "text" as const },
    { key: "basic",         label: "Basic (ETB)",   type: "currency" as const },
    { key: "allowance",     label: "Allowance",     type: "currency" as const },
    { key: "deduction",     label: "Deduction",     type: "currency" as const },
    { key: "tax",           label: "Tax",           type: "currency" as const },
    { key: "net",           label: "Net Pay (ETB)", type: "currency" as const },
    { key: "status",        label: "Status",        type: "select" as const, options: ["Draft", "Approved", "Paid", "Cancelled"] },
  ],
  rows: [
    { employee: "Abebe Girma",    period: "June 2025", basic: 35000, allowance: 4200, deduction: 3850, net: 35350, status: "Paid" },
    { employee: "Tigist Haile",   period: "June 2025", basic: 42000, allowance: 5040, deduction: 4620, net: 42420, status: "Paid" },
    { employee: "Dawit Bekele",   period: "June 2025", basic: 48000, allowance: 5760, deduction: 5280, net: 48480, status: "Pending" },
    { employee: "Sara Tadesse",   period: "June 2025", basic: 28000, allowance: 3360, deduction: 3080, net: 28280, status: "Paid" },
    { employee: "Yonas Alemu",    period: "June 2025", basic: 52000, allowance: 6240, deduction: 5720, net: 52520, status: "Processing" },
    { employee: "Mekdes Worku",   period: "June 2025", basic: 32000, allowance: 3840, deduction: 3520, net: 32320, status: "Paid" },
    { employee: "Biniam Tesfaye", period: "June 2025", basic: 30000, allowance: 3600, deduction: 3300, net: 30300, status: "Paid" },
  ],
};

const LEAVE_MANAGEMENT = {
  title: "Leave Management",
  columns: [
    { key: "employee",   label: "Employee",      type: "avatar" as const },
    { key: "type",       label: "Leave Type",    type: "select" as const, options: ["Annual", "Sick", "Maternity", "Paternity", "Emergency", "Unpaid", "Study", "Compassionate", "Other"] },
    { key: "startDate",  label: "From",          type: "date" as const },
    { key: "endDate",    label: "To",            type: "date" as const },
    { key: "days",       label: "Days",          type: "number" as const },
    { key: "reason",     label: "Reason",        type: "select" as const, options: ["Medical Appointment", "Family Emergency", "Personal Vacation", "Bereavement", "Study Leave", "Travel", "Sick Leave", "Religious Holiday", "Wedding", "Maternity/Paternity", "Appointment", "Work from Home"] },
    { key: "status",     label: "Status",        type: "select" as const, options: ["Pending", "Approved", "Rejected", "Cancelled"] },
  ],
  rows: [
    { employee: "Yonas Alemu",  type: "Annual",    startDate: "2025-07-01", endDate: "2025-07-10", days: 10, reason: "Family vacation",     status: "Approved" },
    { employee: "Sara Tadesse", type: "Sick",      startDate: "2025-07-05", endDate: "2025-07-06", days: 2,  reason: "Medical appointment",  status: "Approved" },
    { employee: "Dawit Bekele", type: "Annual",    startDate: "2025-07-15", endDate: "2025-07-20", days: 6,  reason: "Personal travel",      status: "Pending" },
    { employee: "Mekdes Worku", type: "Maternity", startDate: "2025-08-01", endDate: "2025-10-31", days: 90, reason: "Maternity leave",      status: "Approved" },
    { employee: "Abebe Girma",  type: "Emergency", startDate: "2025-07-03", endDate: "2025-07-03", days: 1,  reason: "Family emergency",     status: "Pending" },
  ],
};

// ── CRM MODULES ────────────────────────────────────────────
const LEADS = {
  title: "Lead Management",
  columns: [
    { key: "name",      label: "Lead Name",    type: "avatar" as const },
    { key: "company",   label: "Company",      type: "text" as const },
    { key: "email",     label: "Email",        type: "text" as const },
    { key: "phone",     label: "Phone",        type: "text" as const },
    { key: "source",    label: "Source",       type: "select" as const, options: ["Website", "Referral", "Social Media", "Cold Call", "Email Campaign", "Event", "Partner", "Other"] },
    { key: "value",     label: "Est. Value",   type: "currency" as const },
    { key: "score",     label: "Score",        type: "number" as const },
    { key: "stage",     label: "Stage",        type: "select" as const, options: ["New", "Contacted", "Qualified", "Proposal", "Negotiation", "Closed Won", "Closed Lost"] },
  ],
  rows: [
    { name: "Selam Habtamu",   company: "Addis Corp",      email: "selam@corp.et",      phone: "+251 94 400 4004", source: "Website",    value: 180000, score: 80, stage: "Qualified" },
    { name: "Kifle Amare",     company: "Tech Hub",        email: "kifle@tech.et",      phone: "+251 95 500 5005", source: "Referral",   value: 480000, score: 65, stage: "Proposal" },
    { name: "Hana Girma",      company: "Biz Solutions",    email: "hana@biz.et",        phone: "+251 96 600 6006", source: "Social Media", value: 95000,  score: 30, stage: "New" },
    { name: "Dawit Bekele",    company: "Startup ET",       email: "dawit@startup.et",   phone: "+251 97 700 7007", source: "Email Campaign", value: 220000, score: 50, stage: "Contacted" },
  ],
};

const INVOICES = {
  title: "Invoicing",
  columns: [
    { key: "invoiceNo", label: "Invoice #",     type: "text" as const },
    { key: "customer",  label: "Customer",      type: "avatar" as const },
    { key: "deal",      label: "Deal",           type: "text" as const },
    { key: "date",      label: "Date",          type: "date" as const },
    { key: "dueDate",   label: "Due Date",      type: "date" as const },
    { key: "amount",    label: "Amount (ETB)",  type: "currency" as const },
    { key: "paid",      label: "Paid (ETB)",    type: "currency" as const },
    { key: "status",    label: "Status",        type: "select" as const, options: ["Draft", "Sent", "Paid", "Overdue", "Cancelled", "Refunded"] },
  ],
  rows: [
    { invoiceNo: "INV-2026-001", customer: "Sunrise PLC",       deal: "ERP Implementation",        date: "2026-06-01", dueDate: "2026-06-30", amount: 250000, paid: 250000, status: "Paid" },
    { invoiceNo: "INV-2026-002", customer: "Green Valley Ltd",  deal: "HR Module",                  date: "2026-06-05", dueDate: "2026-07-05", amount: 180000, paid: 0,      status: "Overdue" },
    { invoiceNo: "INV-2026-003", customer: "Addis Tech",        deal: "Infrastructure Upgrade",    date: "2026-06-10", dueDate: "2026-07-10", amount: 480000, paid: 240000, status: "Partial" },
    { invoiceNo: "INV-2026-004", customer: "Blue Nile Exports", deal: "",                          date: "2026-06-15", dueDate: "2026-07-15", amount: 120000, paid: 0,      status: "Sent" },
    { invoiceNo: "INV-2026-005", customer: "Horn of Africa",    deal: "Export Logistics",           date: "2026-06-20", dueDate: "2026-07-20", amount: 650000, paid: 650000, status: "Paid" },
  ],
};

// ── INVENTORY MODULES ──────────────────────────────────────
const PRODUCTS = {
  title: "Products",
  columns: [
    { key: "sku",        label: "SKU",          type: "text" as const },
    { key: "name",       label: "Product Name", type: "avatar" as const },
    { key: "category",   label: "Category",     type: "select" as const, options: ["Food", "Beverage", "Electronics", "Construction", "Furniture", "Export", "Hardware", "Office Supplies", "Raw Materials", "Packaging", "Pharmaceutical", "Textile", "Other"] },
    { key: "stock",      label: "Qty in Stock", type: "number" as const },
    { key: "unit",       label: "Unit",         type: "select" as const, options: ["Piece", "Bag", "Box", "Kg", "Quintal", "Liter", "Meter", "Pair", "Set", "Carton", "Roll", "Drum", "Pallet", "Bottle", "Tin"] },
    { key: "sellPrice",  label: "Price (ETB)",  type: "currency" as const },
    { key: "minStock",   label: "Min Stock",    type: "number" as const },
    { key: "barcode",    label: "Barcode",      type: "text" as const },
  ],
  rows: [
    { sku: "PRD-001", name: "Injera Flour (50kg)",      category: "Food",       stock: 842,  unit: "Bag",    sellPrice: 1200,  minStock: 20,  barcode: "4901234567890" },
    { sku: "PRD-002", name: "Teff Grain (25kg)",         category: "Food",       stock: 23,   unit: "Bag",    sellPrice: 890,   minStock: 50,  barcode: "4901234567891" },
    { sku: "PRD-003", name: "Office Chair (Ergonomic)",  category: "Furniture",  stock: 45,   unit: "Piece",  sellPrice: 6500,  minStock: 10,  barcode: "4901234567892" },
    { sku: "PRD-004", name: "HP Laptop 15\"",            category: "Electronics",stock: 12,   unit: "Piece",  sellPrice: 48000, minStock: 5,   barcode: "4901234567893" },
    { sku: "PRD-005", name: "PVC Pipe 2\" (6m)",         category: "Hardware",   stock: 0,    unit: "Piece",  sellPrice: 320,   minStock: 100, barcode: "" },
    { sku: "PRD-006", name: "Cement (50kg bag)",         category: "Construction",stock: 1204, unit: "Bag",   sellPrice: 480,   minStock: 200, barcode: "4901234567894" },
    { sku: "PRD-007", name: "Coffee Arabica (Export)",   category: "Export",     stock: 340,  unit: "Quintal",sellPrice: 82000, minStock: 30,  barcode: "4901234567895" },
  ],
};

// ── FINANCE MODULES ────────────────────────────────────────
const GENERAL_LEDGER = {
  title: "General Ledger",
  columns: [
    { key: "date",       label: "Date",         type: "date" as const },
    { key: "ref",        label: "Reference",    type: "text" as const },
    { key: "account",    label: "Account",      type: "text" as const },
    { key: "description",label: "Description",  type: "text" as const },
    { key: "debit",      label: "Debit (ETB)",  type: "currency" as const },
    { key: "credit",     label: "Credit (ETB)", type: "currency" as const },
    { key: "status",     label: "Status",       type: "select" as const, options: ["Draft", "Posted", "Cancelled", "On Hold"] },
  ],
  rows: [
    { date: "2025-07-01", ref: "JV-001", account: "4100 - Sales Revenue",        description: "Invoice INV-2025-005",   debit: 0,      credit: 650000, status: "Posted" },
    { date: "2025-07-01", ref: "JV-001", account: "1100 - Accounts Receivable",   description: "Invoice INV-2025-005",   debit: 650000, credit: 0,      status: "Posted" },
    { date: "2025-07-02", ref: "JV-002", account: "6100 - Salary Expense",        description: "June 2025 Payroll",      debit: 267000, credit: 0,      status: "Posted" },
    { date: "2025-07-02", ref: "JV-002", account: "2100 - Salaries Payable",      description: "June 2025 Payroll",      debit: 0,      credit: 267000, status: "Posted" },
    { date: "2025-07-03", ref: "JV-003", account: "5200 - Cost of Goods Sold",    description: "Inventory issued",       debit: 120000, credit: 0,      status: "Draft" },
    { date: "2025-07-03", ref: "JV-003", account: "1300 - Inventory Asset",       description: "Inventory issued",       debit: 0,      credit: 120000, status: "Draft" },
  ],
};

// ── PROCUREMENT MODULES ────────────────────────────────────
const PURCHASE_REQUESTS = {
  title: "Purchase Requests",
  columns: [
    { key: "reqNo",     label: "Request #",    type: "text" as const },
    { key: "requester", label: "Requested By", type: "avatar" as const },
    { key: "item",      label: "Item",         type: "text" as const },
    { key: "qty",       label: "Qty",          type: "number" as const },
    { key: "estCost",   label: "Est. Cost",    type: "currency" as const },
    { key: "priority",  label: "Priority",     type: "select" as const, options: ["Low", "Medium", "High", "Urgent", "Critical"] },
    { key: "status",    label: "Status",       type: "select" as const, options: ["Pending", "Approved", "Rejected", "Cancelled", "On Hold"] },
  ],
  rows: [
    { reqNo: "PR-2025-001", requester: "Biniam Tesfaye", item: "Office Supplies",    qty: 50,  estCost: 25000,  priority: "Medium", status: "Approved" },
    { reqNo: "PR-2025-002", requester: "Dawit Bekele",   item: "Laptop Dell i7",     qty: 5,   estCost: 280000, priority: "High",   status: "Pending" },
    { reqNo: "PR-2025-003", requester: "Mekdes Worku",   item: "Marketing Materials",qty: 100, estCost: 48000,  priority: "Low",    status: "Pending" },
    { reqNo: "PR-2025-004", requester: "Yonas Alemu",    item: "Generator 50KVA",    qty: 1,   estCost: 480000, priority: "High",   status: "Approved" },
    { reqNo: "PR-2025-005", requester: "Abebe Girma",    item: "Accounting Software",qty: 1,   estCost: 120000, priority: "Medium", status: "Rejected" },
  ],
};

// ── MANUFACTURING MODULES ──────────────────────────────────
const WORK_ORDERS = {
  title: "Work Orders",
  columns: [
    { key: "woNo",      label: "WO #",         type: "text" as const },
    { key: "product",   label: "Product",      type: "text" as const },
    { key: "qty",       label: "Qty Target",   type: "number" as const },
    { key: "produced",  label: "Qty Done",     type: "number" as const },
    { key: "startDate", label: "Start",        type: "date" as const },
    { key: "endDate",   label: "Target End",   type: "date" as const },
    { key: "status",    label: "Status",       type: "select" as const, options: ["Planned", "In Progress", "Completed", "Cancelled", "On Hold", "Quality Check"] },
  ],
  rows: [
    { woNo: "WO-2025-001", product: "Teff Flour Blend",     qty: 500,  produced: 500,  startDate: "2025-06-01", endDate: "2025-06-15", status: "Completed" },
    { woNo: "WO-2025-002", product: "Coffee Export Pack",   qty: 200,  produced: 180,  startDate: "2025-06-10", endDate: "2025-06-25", status: "In Progress" },
    { woNo: "WO-2025-003", product: "PVC Pipe 2\" (6m)",   qty: 1000, produced: 0,    startDate: "2025-07-01", endDate: "2025-07-20", status: "Planned" },
    { woNo: "WO-2025-004", product: "Concrete Block",       qty: 5000, produced: 2300, startDate: "2025-06-15", endDate: "2025-07-15", status: "In Progress" },
    { woNo: "WO-2025-005", product: "Sesame Oil (1L)",      qty: 800,  produced: 800,  startDate: "2025-05-20", endDate: "2025-06-05", status: "Completed" },
  ],
};

// ── PROJECTS MODULE ────────────────────────────────────────
const PROJECTS = {
  title: "Projects",
  columns: [
    { key: "name",      label: "Project Name", type: "text" as const },
    { key: "manager",   label: "Manager",      type: "avatar" as const },
    { key: "team",      label: "Team Size",    type: "number" as const },
    { key: "budget",    label: "Budget (ETB)", type: "currency" as const },
    { key: "progress",  label: "Progress %",  type: "number" as const },
    { key: "deadline",  label: "Deadline",    type: "date" as const },
    { key: "status",    label: "Status",      type: "select" as const, options: ["On Track", "At Risk", "Delayed", "Completed", "Cancelled", "On Hold"] },
  ],
  rows: [
    { name: "NEXYOVI OS Launch",       manager: "Tigist Haile",   team: 12, budget: 2400000, progress: 78, deadline: "2025-09-30", status: "On Track" },
    { name: "Warehouse Automation",    manager: "Yonas Alemu",    team: 6,  budget: 840000,  progress: 45, deadline: "2025-08-15", status: "At Risk" },
    { name: "Mobile App v2",           manager: "Dawit Bekele",   team: 8,  budget: 1200000, progress: 92, deadline: "2025-07-31", status: "On Track" },
    { name: "HR Portal Redesign",      manager: "Tigist Haile",   team: 4,  budget: 360000,  progress: 20, deadline: "2025-10-01", status: "Delayed" },
    { name: "Ethiopia Tax Compliance", manager: "Abebe Girma",    team: 3,  budget: 180000,  progress: 100, deadline: "2025-06-30", status: "Completed" },
  ],
};

// ── DOCUMENTS MODULE ───────────────────────────────────────
const DOCUMENTS = {
  title: "File Storage",
  columns: [
    { key: "name",     label: "Document Name", type: "text" as const },
    { key: "type",     label: "Type",          type: "select" as const, options: ["PDF", "DOCX", "XLSX", "PPTX", "Image", "Video", "Audio", "Archive", "Other"] },
    { key: "size",     label: "Size",          type: "text" as const },
    { key: "owner",    label: "Owner",         type: "avatar" as const },
    { key: "modified", label: "Last Modified", type: "date" as const },
    { key: "status",   label: "Status",        type: "select" as const, options: ["Draft", "Final", "Signed", "Pending Signature", "Archived", "Under Review"] },
  ],
  rows: [
    { name: "Employment Contract - Abebe",     type: "PDF",   size: "1.2 MB", owner: "Tigist Haile",  modified: "2025-06-10", status: "Signed" },
    { name: "Q2 Financial Report",             type: "XLSX",  size: "3.8 MB", owner: "Abebe Girma",   modified: "2025-07-01", status: "Final" },
    { name: "Project Proposal - Warehouse",    type: "DOCX",  size: "2.1 MB", owner: "Yonas Alemu",   modified: "2025-06-28", status: "Draft" },
    { name: "Board Meeting Minutes June",      type: "PDF",   size: "0.8 MB", owner: "Tigist Haile",  modified: "2025-06-30", status: "Final" },
    { name: "Vendor Agreement - Addis Tech",   type: "PDF",   size: "1.6 MB", owner: "Biniam Tesfaye",modified: "2025-06-15", status: "Pending Signature" },
    { name: "Marketing Campaign Brief",        type: "PPTX",  size: "5.4 MB", owner: "Mekdes Worku",  modified: "2025-07-02", status: "Draft" },
  ],
};

// ── FLEET MODULE ───────────────────────────────────────────
const FLEET = {
  title: "Fleet Management",
  columns: [
    { key: "plate",    label: "Plate No.",    type: "text" as const },
    { key: "model",    label: "Model",        type: "text" as const },
    { key: "driver",   label: "Driver",       type: "avatar" as const },
    { key: "status",   label: "Status",       type: "select" as const, options: ["Available", "In Use", "Maintenance", "Retired", "Reserved", "Out of Service"] },
    { key: "odometer", label: "Odometer km",  type: "number" as const },
    { key: "nextService",label: "Next Service",type: "date" as const },
  ],
  rows: [
    { plate: "AA-3-5678", model: "Toyota Hilux 2022",  driver: "Solomon Tadesse", status: "In Use",    odometer: 42800, nextService: "2025-08-01" },
    { plate: "AA-1-1234", model: "Isuzu Truck FVR",    driver: "Petros Haile",    status: "Available",   odometer: 78400, nextService: "2025-07-15" },
    { plate: "OR-2-9012", model: "Toyota Land Cruiser", driver: "Mulugeta Girma", status: "In Use",    odometer: 95200, nextService: "2025-09-10" },
    { plate: "AA-4-3456", model: "Hyundai H350 Van",   driver: "Daniel Bekele",   status: "Maintenance", odometer: 34600, nextService: "2025-07-05" },
    { plate: "SN-1-7890", model: "Mitsubishi Fuso",    driver: "Bereket Alemu",   status: "Available",   odometer: 112000, nextService: "2025-07-20" },
  ],
};

// ── SECURITY MODULE ────────────────────────────────────────
const RBAC = {
  title: "Roles & Permissions (RBAC)",
  columns: [
    { key: "role",       label: "Role",         type: "badge" as const },
    { key: "users",      label: "Users",        type: "number" as const },
    { key: "modules",    label: "Module Access",type: "number" as const },
    { key: "permissions",label: "Permissions",  type: "text" as const },
    { key: "createdBy",  label: "Created By",   type: "text" as const },
    { key: "status",     label: "Status",       type: "select" as const, options: ["Active", "Inactive", "Archived"] },
  ],
  rows: [
    { role: "Super Admin",     users: 2,  modules: 19, permissions: "Full Access",          createdBy: "System",        status: "Active" },
    { role: "Finance Manager", users: 5,  modules: 4,  permissions: "Read/Write/Approve",   createdBy: "Tigist Haile",  status: "Active" },
    { role: "HR Officer",      users: 8,  modules: 3,  permissions: "Read/Write",           createdBy: "Tigist Haile",  status: "Active" },
    { role: "Sales Agent",     users: 24, modules: 2,  permissions: "Read/Write Own",       createdBy: "Abebe Girma",   status: "Active" },
    { role: "Warehouse Staff", users: 15, modules: 2,  permissions: "Read/Write",           createdBy: "Yonas Alemu",   status: "Active" },
    { role: "Read Only",       users: 12, modules: 19, permissions: "Read Only",            createdBy: "Tigist Haile",  status: "Active" },
    { role: "Auditor",         users: 3,  modules: 19, permissions: "Read + Export",        createdBy: "Abebe Girma",   status: "Active" },
  ],
};

// ── MODULE CONFIG MAP ──────────────────────────────────────
const MODULE_CONFIGS: Record<string, ModuleConfig> = {
  // HR
  "employee-management": EMPLOYEES,
  "payroll":             PAYROLL,
  "leave-management":    LEAVE_MANAGEMENT,
  "recruitment-ats":     { title: "Recruitment (ATS)", columns: EMPLOYEES.columns, rows: EMPLOYEES.rows.slice(0,4) },
  "onboarding":          { title: "Onboarding", columns: EMPLOYEES.columns, rows: EMPLOYEES.rows.slice(0,3) },
  "attendance":          { title: "Attendance", columns: [
    { key: "employee", label: "Employee",   type: "avatar" as const },
    { key: "date",     label: "Date",       type: "date" as const },
    { key: "checkIn",  label: "Check In",   type: "text" as const },
    { key: "checkOut", label: "Check Out",  type: "text" as const },
    { key: "hours",    label: "Hours",      type: "number" as const },
    { key: "status",   label: "Status",     type: "select" as const, options: ["Present", "Absent", "Late", "Half Day", "Holiday", "On Leave", "Remote", "On Business Trip"] },
  ], rows: [
    { employee: "Abebe Girma",  date: "2025-07-05", checkIn: "08:02", checkOut: "17:05", hours: 9.0, status: "Present" },
    { employee: "Tigist Haile", date: "2025-07-05", checkIn: "08:15", checkOut: "17:00", hours: 8.7, status: "Present" },
    { employee: "Dawit Bekele", date: "2025-07-05", checkIn: "09:30", checkOut: "18:00", hours: 8.5, status: "Late" },
    { employee: "Sara Tadesse", date: "2025-07-05", checkIn: "—",     checkOut: "—",     hours: 0,   status: "Absent" },
    { employee: "Yonas Alemu",  date: "2025-07-05", checkIn: "08:00", checkOut: "17:00", hours: 9.0, status: "On Leave" },
  ]},
  "performance-management": { title: "Performance Management", columns: EMPLOYEES.columns, rows: EMPLOYEES.rows },
  "learning-training-lms":  { title: "Learning & Training (LMS)", columns: EMPLOYEES.columns, rows: EMPLOYEES.rows },
  "benefits":               { title: "Benefits", columns: EMPLOYEES.columns, rows: EMPLOYEES.rows.slice(0,5) },
  "employee-self-service":  { title: "Employee Self-Service", columns: EMPLOYEES.columns, rows: EMPLOYEES.rows },
  "organizational-chart":   { title: "Organizational Chart", columns: EMPLOYEES.columns, rows: EMPLOYEES.rows },
  "time-tracking":          { title: "Time Tracking", columns: EMPLOYEES.columns, rows: EMPLOYEES.rows },
  "shift-scheduling":       { title: "Shift Scheduling", columns: EMPLOYEES.columns, rows: EMPLOYEES.rows },
  "exit-management":        { title: "Exit Management", columns: EMPLOYEES.columns, rows: EMPLOYEES.rows.slice(0,3) },
  "hr-analytics":           { title: "HR Analytics", columns: EMPLOYEES.columns, rows: EMPLOYEES.rows },

  // CRM
  "lead-management":        LEADS,
  "opportunity-pipeline":   {
    title: "Opportunity Pipeline",
    columns: [
      { key: "title",      label: "Deal Title",   type: "text" as const },
      { key: "customer",   label: "Customer",     type: "avatar" as const },
      { key: "value",      label: "Value (ETB)",  type: "currency" as const },
      { key: "stage",      label: "Stage",        type: "select" as const, options: ["Prospecting", "Qualification", "Proposal", "Negotiation", "Closed Won", "Closed Lost"] },
      { key: "probability",label: "Prob. %",     type: "number" as const },
      { key: "closeDate",  label: "Close Date",   type: "date" as const },
    ],
    rows: [
      { title: "ERP Implementation - Sunrise PLC", customer: "Sunrise PLC",     value: 2500000, stage: "Negotiation", probability: 75, closeDate: "2026-09-01" },
      { title: "HR Module - Green Valley",         customer: "Green Valley Ltd", value: 850000,  stage: "Proposal",    probability: 50, closeDate: "2026-08-15" },
      { title: "Consulting - Mehari Tesfaye",      customer: "Mehari Tesfaye",   value: 120000,  stage: "Prospecting", probability: 20, closeDate: "" },
    ],
  },
  "customer-management":    {
    title: "Customer Management",
    columns: [
      { key: "name",         label: "Customer",     type: "avatar" as const },
      { key: "email",        label: "Email",        type: "text" as const },
      { key: "phone",        label: "Phone",        type: "text" as const },
      { key: "company",      label: "Company",      type: "text" as const },
      { key: "type",         label: "Type",         type: "select" as const, options: ["Individual", "Business", "Government", "NGO", "Educational"] },
      { key: "status",       label: "Status",       type: "select" as const, options: ["Active", "Inactive", "Prospect", "Lost", "VIP"] },
      { key: "dealsCount",   label: "Deals",        type: "number" as const },
      { key: "invoicesCount",label: "Invoices",     type: "number" as const },
      { key: "createdAt",    label: "Created",      type: "date" as const },
    ],
    rows: [
      { name: "Sunrise PLC",       email: "contact@sunrise.et", phone: "+251 91 100 1001", company: "Sunrise PLC",       type: "Business", status: "Active", dealsCount: 1, invoicesCount: 2, createdAt: "2026-01-15" },
      { name: "Green Valley Ltd",  email: "info@greenvalley.et", phone: "+251 92 200 2002", company: "Green Valley Ltd",  type: "Business", status: "Active", dealsCount: 2, invoicesCount: 1, createdAt: "2026-02-20" },
      { name: "Selam Habtamu",     email: "selam@corp.et", phone: "+251 94 400 4004", company: "Addis Corp",        type: "Individual", status: "Prospect", dealsCount: 0, invoicesCount: 0, createdAt: "2026-03-10" },
    ],
  },
  "contact-management":     {
    title: "Contact Management",
    columns: [
      { key: "name",      label: "Contact Name", type: "avatar" as const },
      { key: "email",     label: "Email",        type: "text" as const },
      { key: "phone",     label: "Phone",        type: "text" as const },
      { key: "company",   label: "Company",      type: "text" as const },
      { key: "type",      label: "Type",         type: "select" as const, options: ["Individual", "Business", "Government", "NGO"] },
    ],
    rows: [
      { name: "Mehari Tesfaye",  email: "mehari@personal.et", phone: "+251 93 300 3003", company: "Mehari Tesfaye", type: "Individual" },
      { name: "Selam Habtamu",   email: "selam@corp.et",      phone: "+251 94 400 4004", company: "Addis Corp",     type: "Individual" },
      { name: "Kifle Amare",     email: "kifle@tech.et",      phone: "+251 95 500 5005", company: "Tech Hub",       type: "Business" },
    ],
  },
  "sales-quotes":           {
    title: "Sales Quotes",
    columns: [
      { key: "quoteNo",   label: "Quote #",      type: "text" as const },
      { key: "customer",  label: "Customer",     type: "avatar" as const },
      { key: "date",      label: "Date",         type: "date" as const },
      { key: "expiryDate",label: "Expires",      type: "date" as const },
      { key: "amount",    label: "Amount (ETB)", type: "currency" as const },
      { key: "status",    label: "Status",       type: "select" as const, options: ["Draft", "Sent", "Accepted", "Declined", "Expired", "Revised"] },
    ],
    rows: [
      { quoteNo: "Q-2025-001", customer: "Sunrise PLC",       date: "2025-06-01", expiryDate: "2025-07-01", amount: 250000, status: "Sent" },
      { quoteNo: "Q-2025-002", customer: "Green Valley Ltd",  date: "2025-06-10", expiryDate: "2025-07-10", amount: 180000, status: "Draft" },
      { quoteNo: "Q-2025-003", customer: "Addis Tech",        date: "2025-06-20", expiryDate: "2025-07-20", amount: 480000, status: "Accepted" },
      { quoteNo: "Q-2025-004", customer: "Blue Nile Exports", date: "2025-06-25", expiryDate: "2025-07-25", amount: 120000, status: "Declined" },
    ],
  },
  "orders":                 {
    title: "Orders",
    columns: [
      { key: "orderNo",   label: "Order #",      type: "text" as const },
      { key: "customer",  label: "Customer",     type: "avatar" as const },
      { key: "date",      label: "Date",         type: "date" as const },
      { key: "items",     label: "Items",        type: "number" as const },
      { key: "amount",    label: "Total (ETB)",  type: "currency" as const },
      { key: "status",    label: "Status",       type: "select" as const, options: ["Pending", "Processing", "Shipped", "Delivered", "Cancelled", "Returned"] },
    ],
    rows: [
      { orderNo: "ORD-2025-001", customer: "Sunrise PLC",       date: "2025-06-15", items: 3, amount: 250000, status: "Processing" },
      { orderNo: "ORD-2025-002", customer: "Green Valley Ltd",  date: "2025-06-20", items: 1, amount: 85000,  status: "Shipped" },
      { orderNo: "ORD-2025-003", customer: "Addis Tech",        date: "2025-06-25", items: 5, amount: 480000, status: "Pending" },
    ],
  },
  "invoicing":              INVOICES,
  "contracts":              {
    title: "Contracts",
    columns: [
      { key: "title",      label: "Contract",     type: "text" as const },
      { key: "vendor",     label: "Vendor",       type: "avatar" as const },
      { key: "value",      label: "Value (ETB)",  type: "currency" as const },
      { key: "startDate",  label: "Start Date",   type: "date" as const },
      { key: "endDate",    label: "End Date",     type: "date" as const },
      { key: "status",     label: "Status",       type: "select" as const, options: ["Draft", "Active", "Expired", "Terminated", "Pending Signature", "Suspended"] },
    ],
    rows: [
      { title: "Annual IT Support",      vendor: "TechParts Ethiopia",  value: 240000, startDate: "2025-01-01", endDate: "2025-12-31", status: "Active" },
      { title: "Office Lease - HQ",      vendor: "Ethio Supply Co",     value: 540000, startDate: "2025-03-01", endDate: "2027-02-28", status: "Active" },
      { title: "Consulting Agreement",   vendor: "Global Imports PLC",  value: 180000, startDate: "2025-06-01", endDate: "2025-09-30", status: "Draft" },
    ],
  },
  "sales-forecasting":      {
    title: "Sales Forecasting",
    columns: [
      { key: "period",     label: "Period",       type: "text" as const },
      { key: "pipeline",   label: "Pipeline",     type: "currency" as const },
      { key: "forecast",   label: "Forecast",     type: "currency" as const },
      { key: "weighted",   label: "Weighted",     type: "currency" as const },
      { key: "closed",     label: "Closed",       type: "currency" as const },
      { key: "confidence", label: "Confidence",   type: "select" as const, options: ["High", "Medium", "Low"] },
    ],
    rows: [
      { period: "Q3 2026", pipeline: 4500000, forecast: 3200000, weighted: 2150000, closed: 850000, confidence: "High" },
      { period: "Q4 2026", pipeline: 6200000, forecast: 4100000, weighted: 2800000, closed: 0,      confidence: "Medium" },
      { period: "Q1 2027", pipeline: 2800000, forecast: 1800000, weighted: 900000,  closed: 0,      confidence: "Low" },
    ],
  },
  "customer-support":       {
    title: "Customer Support",
    columns: [
      { key: "ticketNo",  label: "Ticket #",     type: "text" as const },
      { key: "customer",  label: "Customer",     type: "avatar" as const },
      { key: "subject",   label: "Subject",      type: "text" as const },
      { key: "priority",  label: "Priority",     type: "select" as const, options: ["Low", "Medium", "High", "Urgent", "Critical"] },
      { key: "status",    label: "Status",       type: "select" as const, options: ["Open", "In Progress", "Resolved", "Closed", "Reopened", "On Hold"] },
      { key: "createdAt", label: "Opened",       type: "date" as const },
    ],
    rows: [
      { ticketNo: "SUP-001", customer: "Sunrise PLC",       subject: "Login issue with dashboard",       priority: "High",   status: "Open",         createdAt: "2026-07-01" },
      { ticketNo: "SUP-002", customer: "Green Valley Ltd",  subject: "Invoice payment not reflecting",    priority: "Urgent", status: "In Progress",  createdAt: "2026-07-03" },
      { ticketNo: "SUP-003", customer: "Addis Tech",        subject: "User permission request",          priority: "Low",    status: "Resolved",     createdAt: "2026-06-28" },
      { ticketNo: "SUP-004", customer: "Blue Nile Exports", subject: "Report export not working",         priority: "Medium", status: "Open",         createdAt: "2026-07-05" },
    ],
  },
  "customer-portal":        {
    title: "Customer Portal",
    columns: [
      { key: "name",      label: "Company",      type: "avatar" as const },
      { key: "portalUrl", label: "Portal URL",   type: "text" as const },
      { key: "users",     label: "Users",        type: "number" as const },
      { key: "lastLogin", label: "Last Login",   type: "date" as const },
      { key: "status",    label: "Status",       type: "select" as const, options: ["Active", "Inactive", "Suspended", "Pending Setup"] },
    ],
    rows: [
      { name: "Sunrise PLC",       portalUrl: "portal.nexyovi.com/sunrise",       users: 12, lastLogin: "2026-07-05", status: "Active" },
      { name: "Green Valley Ltd",  portalUrl: "portal.nexyovi.com/greenvalley",    users: 8,  lastLogin: "2026-07-02", status: "Active" },
      { name: "Addis Tech",        portalUrl: "portal.nexyovi.com/addistech",      users: 5,  lastLogin: "2026-06-20", status: "Active" },
    ],
  },
  "loyalty-programs":       {
    title: "Loyalty Programs",
    columns: [
      { key: "name",      label: "Program",      type: "text" as const },
      { key: "members",   label: "Members",      type: "number" as const },
      { key: "tier",      label: "Tier",         type: "select" as const, options: ["Silver", "Gold", "Platinum", "Diamond", "Bronze"] },
      { key: "points",    label: "Points",       type: "number" as const },
      { key: "revenue",   label: "Revenue (ETB)",type: "currency" as const },
      { key: "status",    label: "Status",       type: "select" as const, options: ["Active", "Inactive", "Paused"] },
    ],
    rows: [
      { name: "Platinum Rewards",  members: 45,  tier: "Platinum", points: 125000, revenue: 850000,  status: "Active" },
      { name: "Gold Club",         members: 128, tier: "Gold",     points: 42000,  revenue: 320000,  status: "Active" },
      { name: "Silver Saver",      members: 340, tier: "Silver",   points: 15000,  revenue: 120000,  status: "Active" },
    ],
  },
  "sales-analytics":        {
    title: "Sales Analytics",
    columns: [
      { key: "metric",    label: "Metric",       type: "text" as const },
      { key: "current",   label: "Current",      type: "currency" as const },
      { key: "target",    label: "Target",       type: "currency" as const },
      { key: "achieved",  label: "Achieved %",   type: "number" as const },
      { key: "trend",     label: "Trend",        type: "select" as const, options: ["Up", "Down", "Stable"] },
    ],
    rows: [
      { metric: "Monthly Revenue",    current: 1200000, target: 1500000, achieved: 80,  trend: "Up" },
      { metric: "New Leads",          current: 85,      target: 100,     achieved: 85,  trend: "Stable" },
      { metric: "Deals Closed",       current: 8,       target: 12,      achieved: 67,  trend: "Down" },
      { metric: "Avg. Deal Size",     current: 340000,  target: 400000,  achieved: 85,  trend: "Up" },
      { metric: "Win Rate",           current: 62,      target: 70,      achieved: 89,  trend: "Up" },
      { metric: "Customer Acq. Cost",  current: 28000,   target: 25000,   achieved: 112, trend: "Up" },
    ],
  },

  // Inventory
  "products":               PRODUCTS,
  "categories":             { title: "Categories", columns: [
    { key: "name",         label: "Category",      type: "text" as const },
    { key: "productCount", label: "Products",      type: "number" as const },
    { key: "status",       label: "Status",        type: "select" as const, options: ["Active", "Inactive", "Archived"] },
  ], rows: [
    { name: "Food & Beverage",   productCount: 234, status: "Active" },
    { name: "Electronics",       productCount: 142, status: "Active" },
    { name: "Construction",      productCount: 389, status: "Active" },
    { name: "Furniture",         productCount: 87,  status: "Active" },
    { name: "Export Goods",      productCount: 56,  status: "Active" },
    { name: "Office Supplies",   productCount: 203, status: "Active" },
  ]},
  "warehouses":             { title: "Warehouses", columns: [
    { key: "name",        label: "Warehouse",     type: "text" as const },
    { key: "code",        label: "Code",          type: "text" as const },
    { key: "location",    label: "Location",      type: "text" as const },
    { key: "capacity",    label: "Capacity (m²)", type: "number" as const },
    { key: "managerName", label: "Manager",       type: "avatar" as const },
    { key: "isActive",    label: "Status",        type: "select" as const, options: ["Active", "Inactive", "Under Maintenance"] },
  ], rows: [
    { name: "Main Warehouse",    code: "WH-001", location: "Addis Ababa (Akaki)", capacity: 5000, managerName: "Yonas Alemu",   isActive: "Active" },
    { name: "North Hub",         code: "WH-002", location: "Gondar",              capacity: 2000, managerName: "Petros Haile",  isActive: "Active" },
    { name: "South Distribution",code: "WH-003", location: "Hawassa",             capacity: 3000, managerName: "Daniel Bekele", isActive: "Active" },
    { name: "Export Terminal",   code: "WH-004", location: "Djibouti Road",       capacity: 8000, managerName: "Solomon T.",    isActive: "Active" },
  ]},
  "stock-management":        { title: "Stock Management", columns: [
    { key: "product",       label: "Product",        type: "avatar" as const },
    { key: "sku",           label: "SKU",            type: "text" as const },
    { key: "category",       label: "Category",       type: "select" as const, options: ["Food", "Beverage", "Electronics", "Construction", "Furniture", "Export", "Hardware", "Office Supplies", "Raw Materials", "Packaging", "Pharmaceutical", "Textile", "Other"] },
    { key: "currentStock",   label: "Stock",          type: "number" as const },
    { key: "minStock",       label: "Min Stock",      type: "number" as const },
    { key: "maxStock",       label: "Max Stock",      type: "number" as const },
    { key: "unit",           label: "Unit",           type: "select" as const, options: ["Piece", "Bag", "Box", "Kg", "Quintal", "Liter", "Meter", "Pair", "Set", "Carton", "Roll", "Drum", "Pallet", "Bottle", "Tin"] },
    { key: "reorderPoint",   label: "Reorder At",     type: "number" as const },
    { key: "status",         label: "Status",         type: "select" as const, options: ["In Stock", "Low Stock", "Out of Stock", "Discontinued", "Pre-Order"] },
  ], rows: [
    { product: "Injera Flour (50kg)",      sku: "PRD-001", category: "Food",       currentStock: 842, minStock: 20,  maxStock: 1000, unit: "Bag",    reorderPoint: 30,  status: "In Stock" },
    { product: "Teff Grain (25kg)",         sku: "PRD-002", category: "Food",       currentStock: 23,  minStock: 50,  maxStock: 500,  unit: "Bag",    reorderPoint: 75,  status: "Low Stock" },
    { product: "Office Chair (Ergonomic)",  sku: "PRD-003", category: "Furniture",  currentStock: 45,  minStock: 10,  maxStock: 100,  unit: "Piece",  reorderPoint: 15,  status: "In Stock" },
    { product: "HP Laptop 15\"",            sku: "PRD-004", category: "Electronics",currentStock: 12,  minStock: 5,   maxStock: 30,   unit: "Piece",  reorderPoint: 8,   status: "In Stock" },
    { product: "PVC Pipe 2\" (6m)",         sku: "PRD-005", category: "Hardware",   currentStock: 0,   minStock: 100, maxStock: 2000, unit: "Piece",  reorderPoint: 150, status: "Out of Stock" },
    { product: "Cement (50kg bag)",         sku: "PRD-006", category: "Construction",currentStock: 1204,minStock: 200, maxStock: 5000, unit: "Bag",   reorderPoint: 300, status: "In Stock" },
  ]},
  "batch-serial-numbers":    { title: "Batch & Serial Numbers", columns: [
    { key: "batchNumber",       label: "Batch #",        type: "text" as const },
    { key: "serialNumber",      label: "Serial #",       type: "text" as const },
    { key: "product",           label: "Product",        type: "avatar" as const },
    { key: "sku",               label: "SKU",            type: "text" as const },
    { key: "quantity",          label: "Qty",            type: "number" as const },
    { key: "expiryDate",        label: "Expiry",         type: "date" as const },
    { key: "manufacturingDate", label: "Mfg Date",       type: "date" as const },
    { key: "warehouse",         label: "Warehouse",      type: "text" as const },
    { key: "status",            label: "Status",         type: "select" as const, options: ["Active", "Expired", "Disposed", "Quarantined", "Reserved"] },
  ], rows: [
    { batchNumber: "BATCH-001", serialNumber: "SN-10001", product: "Injera Flour",   sku: "PRD-001", quantity: 200, expiryDate: "2027-06-01", manufacturingDate: "2026-01-15", warehouse: "Main Warehouse", status: "Active" },
    { batchNumber: "BATCH-002", serialNumber: "SN-10002", product: "Teff Grain",    sku: "PRD-002", quantity: 50,  expiryDate: "2027-03-01", manufacturingDate: "2026-02-20", warehouse: "Main Warehouse", status: "Active" },
    { batchNumber: "BATCH-003", serialNumber: "",         product: "Cement",        sku: "PRD-006", quantity: 500, expiryDate: "2027-12-31", manufacturingDate: "2026-03-10", warehouse: "North Hub",      status: "Active" },
    { batchNumber: "BATCH-004", serialNumber: "LAP-001",  product: "HP Laptop",     sku: "PRD-004", quantity: 5,   expiryDate: "",         manufacturingDate: "2026-05-01", warehouse: "Main Warehouse", status: "Active" },
  ]},
  "barcode-qr":              { title: "Barcode / QR", columns: [
    { key: "name",      label: "Product",       type: "avatar" as const },
    { key: "sku",       label: "SKU",           type: "text" as const },
    { key: "barcode",   label: "Barcode",       type: "text" as const },
    { key: "category",  label: "Category",      type: "select" as const, options: ["Food", "Beverage", "Electronics", "Construction", "Furniture", "Export", "Hardware", "Office Supplies", "Raw Materials", "Packaging", "Pharmaceutical", "Textile", "Other"] },
    { key: "stock",     label: "Stock",         type: "number" as const },
    { key: "sellPrice", label: "Price (ETB)",   type: "currency" as const },
    { key: "isActive",  label: "Status",        type: "select" as const, options: ["Active", "Inactive"] },
  ], rows: [
    { name: "Injera Flour (50kg)",      sku: "PRD-001", barcode: "4901234567890",  category: "Food",       stock: 842, sellPrice: 1200,  isActive: "Active" },
    { name: "Teff Grain (25kg)",         sku: "PRD-002", barcode: "4901234567891",  category: "Food",       stock: 23,  sellPrice: 890,   isActive: "Active" },
    { name: "Office Chair (Ergonomic)",  sku: "PRD-003", barcode: "4901234567892",  category: "Furniture",  stock: 45,  sellPrice: 6500,  isActive: "Active" },
    { name: "HP Laptop 15\"",            sku: "PRD-004", barcode: "4901234567893",  category: "Electronics",stock: 12,  sellPrice: 48000, isActive: "Active" },
  ]},
  "purchase-orders":         { title: "Purchase Orders", columns: [
    { key: "purchaseNo",  label: "PO #",          type: "text" as const },
    { key: "supplierName",label: "Supplier",      type: "avatar" as const },
    { key: "orderDate",   label: "Order Date",    type: "date" as const },
    { key: "total",       label: "Total (ETB)",   type: "currency" as const },
    { key: "status",      label: "Status",        type: "select" as const, options: ["Pending", "Ordered", "Received", "Cancelled", "Partially Received"] },
  ], rows: [
    { purchaseNo: "PO-2026-001", supplierName: "Ethio Supply Co",     orderDate: "2026-06-01", total: 250000, status: "Ordered" },
    { purchaseNo: "PO-2026-002", supplierName: "Global Imports PLC",  orderDate: "2026-06-10", total: 180000, status: "Pending" },
    { purchaseNo: "PO-2026-003", supplierName: "TechParts Ethiopia",  orderDate: "2026-06-20", total: 480000, status: "Received" },
    { purchaseNo: "PO-2026-004", supplierName: "Blue Nile Exports",   orderDate: "2026-06-25", total: 120000, status: "Pending" },
  ]},
  "goods-receipt":           { title: "Goods Receipt", columns: [
    { key: "referenceNo",   label: "Reference",      type: "text" as const },
    { key: "product",       label: "Product",        type: "avatar" as const },
    { key: "sku",           label: "SKU",            type: "text" as const },
    { key: "quantityChange",label: "Qty Received",   type: "number" as const },
    { key: "warehouse",     label: "Warehouse",      type: "text" as const },
    { key: "type",          label: "Type",           type: "select" as const, options: ["RECEIPT", "RETURN", "ADJUSTMENT", "INITIAL_STOCK"] },
    { key: "createdAt",     label: "Date",           type: "date" as const },
  ], rows: [
    { referenceNo: "GR-001", product: "Injera Flour",     sku: "PRD-001", quantityChange: 100, warehouse: "Main Warehouse", type: "RECEIPT", createdAt: "2026-06-15" },
    { referenceNo: "GR-002", product: "Teff Grain",       sku: "PRD-002", quantityChange: 50,  warehouse: "Main Warehouse", type: "RECEIPT", createdAt: "2026-06-18" },
    { referenceNo: "GR-003", product: "Cement",           sku: "PRD-006", quantityChange: 500, warehouse: "North Hub",      type: "RECEIPT", createdAt: "2026-06-20" },
    { referenceNo: "GR-004", product: "HP Laptop",        sku: "PRD-004", quantityChange: 5,   warehouse: "Main Warehouse", type: "RECEIPT", createdAt: "2026-06-22" },
  ]},
  "stock-transfers":         { title: "Stock Transfers", columns: [
    { key: "referenceNo",   label: "Transfer #",     type: "text" as const },
    { key: "product",       label: "Product",        type: "avatar" as const },
    { key: "sku",           label: "SKU",            type: "text" as const },
    { key: "quantityChange",label: "Qty",            type: "number" as const },
    { key: "type",          label: "Direction",      type: "select" as const, options: ["TRANSFER_IN", "TRANSFER_OUT", "TRANSFER_BETWEEN"] },
    { key: "warehouse",     label: "Warehouse",      type: "text" as const },
    { key: "createdAt",     label: "Date",           type: "date" as const },
  ], rows: [
    { referenceNo: "ST-001", product: "Injera Flour",     sku: "PRD-001", quantityChange: 50,  type: "TRANSFER_OUT", warehouse: "North Hub",      createdAt: "2026-06-25" },
    { referenceNo: "ST-002", product: "Cement",           sku: "PRD-006", quantityChange: 200, type: "TRANSFER_IN",  warehouse: "South Hub",     createdAt: "2026-06-26" },
    { referenceNo: "ST-003", product: "Office Chair",     sku: "PRD-003", quantityChange: 10,  type: "TRANSFER_OUT", warehouse: "Export Terminal", createdAt: "2026-06-28" },
    { referenceNo: "ST-004", product: "Teff Grain",       sku: "PRD-002", quantityChange: 30,  type: "TRANSFER_IN",  warehouse: "Main Warehouse", createdAt: "2026-06-30" },
  ]},
  "cycle-counts":            { title: "Cycle Counts", columns: [
    { key: "countNo",         label: "Count #",         type: "text" as const },
    { key: "product",         label: "Product",         type: "avatar" as const },
    { key: "sku",             label: "SKU",             type: "text" as const },
    { key: "warehouse",       label: "Warehouse",       type: "text" as const },
    { key: "expectedQuantity",label: "Expected",        type: "number" as const },
    { key: "actualQuantity",  label: "Actual",          type: "number" as const },
    { key: "variance",        label: "Variance",        type: "number" as const },
    { key: "countedBy",       label: "Counted By",      type: "avatar" as const },
    { key: "status",          label: "Status",          type: "select" as const, options: ["Pending", "In Progress", "Completed", "Approved", "Cancelled", "Discrepancy Found"] },
  ], rows: [
    { countNo: "CC-001", product: "Injera Flour",     sku: "PRD-001", warehouse: "Main Warehouse", expectedQuantity: 842, actualQuantity: 838, variance: -4,  countedBy: "Yonas Alemu",   status: "Approved" },
    { countNo: "CC-002", product: "Teff Grain",       sku: "PRD-002", warehouse: "Main Warehouse", expectedQuantity: 23,  actualQuantity: 23,  variance: 0,   countedBy: "Daniel Bekele", status: "Completed" },
    { countNo: "CC-003", product: "Cement",           sku: "PRD-006", warehouse: "North Hub",      expectedQuantity: 1204,actualQuantity: 1200,variance: -4,  countedBy: "Yonas Alemu",   status: "Pending" },
    { countNo: "CC-004", product: "HP Laptop",        sku: "PRD-004", warehouse: "Main Warehouse", expectedQuantity: 12,  actualQuantity: 12,  variance: 0,   countedBy: "Daniel Bekele", status: "In Progress" },
  ]},
  "inventory-forecasting":   { title: "Inventory Forecasting", columns: [
    { key: "product",          label: "Product",         type: "avatar" as const },
    { key: "sku",              label: "SKU",             type: "text" as const },
    { key: "currentStock",     label: "Current Stock",   type: "number" as const },
    { key: "avgDemand",        label: "Avg Demand",      type: "number" as const },
    { key: "leadTimeDays",     label: "Lead Time (d)",   type: "number" as const },
    { key: "reorderPoint",     label: "Reorder Point",   type: "number" as const },
    { key: "suggestedOrder",   label: "Suggested Order", type: "number" as const },
    { key: "daysUntilStockout",label: "Stockout In (d)", type: "number" as const },
    { key: "confidence",       label: "Confidence",      type: "select" as const, options: ["High", "Medium", "Low"] },
  ], rows: [
    { product: "Injera Flour (50kg)",      sku: "PRD-001", currentStock: 842, avgDemand: 120, leadTimeDays: 7,  reorderPoint: 840, suggestedOrder: 0,   daysUntilStockout: 7,   confidence: "High" },
    { product: "Teff Grain (25kg)",         sku: "PRD-002", currentStock: 23,  avgDemand: 80,  leadTimeDays: 5,  reorderPoint: 400, suggestedOrder: 577, daysUntilStockout: 0,   confidence: "Medium" },
    { product: "Cement (50kg bag)",         sku: "PRD-006", currentStock: 1204,avgDemand: 200, leadTimeDays: 10, reorderPoint: 2000,suggestedOrder: 0,   daysUntilStockout: 6,   confidence: "High" },
    { product: "PVC Pipe 2\" (6m)",         sku: "PRD-005", currentStock: 0,   avgDemand: 50,  leadTimeDays: 14, reorderPoint: 700, suggestedOrder: 1050,daysUntilStockout: 0,   confidence: "Low" },
  ]},
  "supplier-stock":          { title: "Supplier Stock", columns: [
    { key: "product",       label: "Product",        type: "avatar" as const },
    { key: "sku",           label: "SKU",            type: "text" as const },
    { key: "supplier",      label: "Supplier",       type: "text" as const },
    { key: "stockLevel",    label: "Stock Level",    type: "number" as const },
    { key: "costPrice",     label: "Cost Price",     type: "currency" as const },
    { key: "leadTime",      label: "Lead Time (d)",  type: "number" as const },
    { key: "status",        label: "Status",         type: "select" as const, options: ["Available", "Low Stock", "Out of Stock", "Discontinued", "Backordered"] },
  ], rows: [
    { product: "Injera Flour (50kg)",      sku: "PRD-001", supplier: "Ethio Supply Co",     stockLevel: 842, costPrice: 850,  leadTime: 7,  status: "Available" },
    { product: "Teff Grain (25kg)",         sku: "PRD-002", supplier: "Global Imports PLC",  stockLevel: 23,  costPrice: 620,  leadTime: 5,  status: "Low Stock" },
    { product: "Office Chair (Ergonomic)",  sku: "PRD-003", supplier: "TechParts Ethiopia",  stockLevel: 45,  costPrice: 4200, leadTime: 10, status: "Available" },
    { product: "HP Laptop 15\"",            sku: "PRD-004", supplier: "TechParts Ethiopia",  stockLevel: 12,  costPrice: 35000,leadTime: 14, status: "Available" },
    { product: "PVC Pipe 2\" (6m)",         sku: "PRD-005", supplier: "Ethio Supply Co",     stockLevel: 0,   costPrice: 200,  leadTime: 7,  status: "Out of Stock" },
  ]},
  "warehouse-analytics":     { title: "Warehouse Analytics", columns: [
    { key: "metric",  label: "Metric",     type: "text" as const },
    { key: "value",   label: "Value",      type: "text" as const },
    { key: "change",  label: "Change",     type: "text" as const },
    { key: "trend",   label: "Trend",      type: "select" as const, options: ["Up", "Down", "Stable"] },
  ], rows: [
    { metric: "Total Products",     value: "3,412",   change: "All time",      trend: "Stable" },
    { metric: "Total Stock Units",  value: "12,847",  change: "Across all WH", trend: "Up" },
    { metric: "Stock Value (Cost)", value: "ETB 8.2M", change: "Total cost",    trend: "Up" },
    { metric: "Avg Turnover Rate",  value: "3.8 u/p",  change: "Monthly avg",   trend: "Stable" },
    { metric: "Warehouses",         value: "4",        change: "Active",         trend: "Stable" },
    { metric: "Categories",         value: "8",        change: "Product groups", trend: "Stable" },
  ]},

  // Finance
  "general-ledger":          GENERAL_LEDGER,
  "accounts-payable":        { title: "Accounts Payable", columns: [
    { key: "vendor",        label: "Vendor",         type: "avatar" as const },
    { key: "invoiceNo",     label: "Invoice #",      type: "text" as const },
    { key: "invoiceDate",   label: "Invoice Date",   type: "date" as const },
    { key: "dueDate",       label: "Due Date",       type: "date" as const },
    { key: "amount",        label: "Amount (ETB)",   type: "currency" as const },
    { key: "balance",       label: "Balance (ETB)",  type: "currency" as const },
    { key: "daysOverdue",   label: "Overdue Days",   type: "number" as const },
    { key: "status",        label: "Status",         type: "select" as const, options: ["Pending", "Overdue", "Paid", "Cancelled"] },
  ], rows: [] },
  "accounts-receivable":     { title: "Accounts Receivable", columns: [
    { key: "customer",      label: "Customer",       type: "avatar" as const },
    { key: "invoiceNo",     label: "Invoice #",      type: "text" as const },
    { key: "issueDate",     label: "Issue Date",     type: "date" as const },
    { key: "dueDate",       label: "Due Date",       type: "date" as const },
    { key: "amount",        label: "Amount (ETB)",   type: "currency" as const },
    { key: "balance",        label: "Balance (ETB)",  type: "currency" as const },
    { key: "aging",         label: "Aging",          type: "select" as const, options: ["Current", "1-30 Days", "31-60 Days", "61-90 Days", "90+ Days"] },
    { key: "status",        label: "Status",         type: "select" as const, options: ["Outstanding", "Overdue", "Paid", "Cancelled"] },
  ], rows: [] },
  "budgeting":               { title: "Budgeting", columns: [
    { key: "name",          label: "Budget Name",    type: "text" as const },
    { key: "department",    label: "Department",     type: "text" as const },
    { key: "year",          label: "Year",           type: "number" as const },
    { key: "month",         label: "Month",          type: "number" as const },
    { key: "amount",        label: "Budget (ETB)",   type: "currency" as const },
    { key: "spent",         label: "Spent (ETB)",    type: "currency" as const },
    { key: "status",        label: "Status",         type: "select" as const, options: ["Under Budget", "On Track", "Over Budget", "Draft"] },
  ], rows: [] },
  "expenses":                { title: "Expenses", columns: [
    { key: "title",          label: "Expense",        type: "text" as const },
    { key: "amount",         label: "Amount (ETB)",   type: "currency" as const },
    { key: "category",       label: "Category",       type: "text" as const },
    { key: "date",           label: "Date",           type: "date" as const },
    { key: "status",         label: "Status",         type: "select" as const, options: ["Pending", "Approved", "Rejected", "Reimbursed"] },
  ], rows: [] },
  "banking":                 { title: "Banking", columns: [
    { key: "date",           label: "Date",           type: "date" as const },
    { key: "ref",            label: "Reference",      type: "text" as const },
    { key: "description",    label: "Description",    type: "text" as const },
    { key: "debit",          label: "Deposit (ETB)",  type: "currency" as const },
    { key: "credit",         label: "Withdrawal (ETB)",type: "currency" as const },
    { key: "balance",        label: "Balance (ETB)",  type: "currency" as const },
    { key: "type",           label: "Type",           type: "select" as const, options: ["Deposit", "Withdrawal", "Transfer", "Opening Balance"] },
    { key: "status",         label: "Status",         type: "select" as const, options: ["Cleared", "Pending", "Reconciled", "Void"] },
  ], rows: [] },
  "cash-flow":               { title: "Cash Flow", columns: [
    { key: "period",         label: "Period",         type: "text" as const },
    { key: "inflow",         label: "Inflow (ETB)",   type: "currency" as const },
    { key: "outflow",        label: "Outflow (ETB)",  type: "currency" as const },
    { key: "net",            label: "Net (ETB)",      type: "currency" as const },
    { key: "count",          label: "Transactions",   type: "number" as const },
    { key: "trend",          label: "Trend",          type: "select" as const, options: ["Positive", "Negative", "Stable"] },
  ], rows: [] },
  "tax-vat":                 { title: "Tax & VAT", columns: [
    { key: "date",           label: "Date",           type: "date" as const },
    { key: "ref",            label: "Reference",      type: "text" as const },
    { key: "description",    label: "Description",    type: "text" as const },
    { key: "taxableAmount",  label: "Taxable (ETB)",  type: "currency" as const },
    { key: "vatAmount",      label: "VAT (ETB)",      type: "currency" as const },
    { key: "type",           label: "Type",           type: "select" as const, options: ["Output VAT (Sales)", "Input VAT (Purchases)", "Summary", "Rate Info"] },
    { key: "status",         label: "Status",         type: "select" as const, options: ["Filed", "Pending", "Current"] },
  ], rows: [] },
  "fixed-assets":            { title: "Fixed Assets", columns: [
    { key: "name",            label: "Asset",          type: "avatar" as const },
    { key: "category",        label: "Category",       type: "text" as const },
    { key: "purchaseDate",    label: "Purchase Date",  type: "date" as const },
    { key: "purchaseValue",   label: "Purchase (ETB)", type: "currency" as const },
    { key: "currentValue",    label: "Current (ETB)",  type: "currency" as const },
    { key: "depreciationRate",label: "Depr. Rate",     type: "number" as const },
    { key: "location",        label: "Location",       type: "text" as const },
  ], rows: [] },
  "financial-statements":    { title: "Financial Statements", columns: [
    { key: "section",        label: "Section",        type: "badge" as const },
    { key: "account",        label: "Account",        type: "text" as const },
    { key: "amount",         label: "Amount (ETB)",   type: "currency" as const },
    { key: "status",         label: "Status",         type: "select" as const, options: ["Actual", "Pending", "Under Budget", "Over Budget", "Profitable", "Loss", "Active", "Planned"] },
  ], rows: [] },
  "multi-currency":          { title: "Multi-Currency", columns: [
    { key: "currency",       label: "Currency",       type: "badge" as const },
    { key: "rate",           label: "Rate (ETB)",     type: "currency" as const },
    { key: "change",         label: "Change",         type: "text" as const },
    { key: "lastUpdated",    label: "Last Updated",   type: "date" as const },
  ], rows: [] },
  "audit-trail":             { title: "Audit Trail", columns: [
    { key: "timestamp",       label: "Timestamp",      type: "date" as const },
    { key: "user",            label: "User",           type: "text" as const },
    { key: "action",          label: "Action",         type: "badge" as const },
    { key: "module",          label: "Module",         type: "badge" as const },
    { key: "details",         label: "Details",        type: "text" as const },
  ], rows: [] },
  "financial-analytics":     { title: "Financial Analytics", columns: [
    { key: "metric",          label: "Metric",          type: "text" as const },
    { key: "value",           label: "Value",           type: "text" as const },
    { key: "target",          label: "Target",          type: "text" as const },
    { key: "achieved",        label: "Achieved %",      type: "number" as const },
    { key: "trend",           label: "Trend",           type: "select" as const, options: ["Up", "Down", "Stable"] },
    { key: "bestPractice",    label: "Best Practice",    type: "text" as const },
  ], rows: [] },

  // Procurement
  "purchase-requests":       PURCHASE_REQUESTS,
  "rfqs":                    {
    title: "RFQs",
    columns: [
      { key: "rfqNo",     label: "RFQ #",        type: "text" as const },
      { key: "title",     label: "Title",        type: "text" as const },
      { key: "vendor",    label: "Vendor",       type: "text" as const },
      { key: "dueDate",   label: "Due Date",     type: "date" as const },
      { key: "total",     label: "Total (ETB)",  type: "currency" as const },
      { key: "status",    label: "Status",       type: "select" as const, options: ["Draft", "Sent", "Awarded", "Cancelled", "Expired"] },
    ],
    rows: [
      { rfqNo: "RFQ-2026-001", title: "Office Supplies Q3", vendor: "Ethio Supply Co", dueDate: "2026-08-15", total: 250000, status: "Sent" },
      { rfqNo: "RFQ-2026-002", title: "IT Equipment Bundle", vendor: "TechParts Ethiopia", dueDate: "2026-08-30", total: 480000, status: "Draft" },
      { rfqNo: "RFQ-2026-003", title: "Construction Materials", vendor: "Global Imports PLC", dueDate: "2026-09-01", total: 120000, status: "Awarded" },
    ],
  },
  "vendor-management":       {
    title: "Vendor Management",
    columns: [
      { key: "name",      label: "Vendor",       type: "avatar" as const },
      { key: "email",     label: "Email",        type: "text" as const },
      { key: "phone",     label: "Phone",        type: "text" as const },
      { key: "category",  label: "Category",     type: "text" as const },
      { key: "rating",    label: "Rating",       type: "number" as const },
      { key: "status",    label: "Status",       type: "select" as const, options: ["Active", "Inactive"] },
    ],
    rows: [
      { name: "Ethio Supply Co", email: "info@ethiosupply.et", phone: "+251 11 123 4567", category: "Raw Materials", rating: 4.5, status: "Active" },
      { name: "TechParts Ethiopia", email: "sales@techparts.et", phone: "+251 11 234 5678", category: "Electronics", rating: 3.8, status: "Active" },
      { name: "Global Imports PLC", email: "info@globalimports.et", phone: "+251 11 345 6789", category: "Logistics", rating: 4.2, status: "Active" },
    ],
  },
  "supplier-portal":         {
    title: "Supplier Portal",
    columns: [
      { key: "name",      label: "Supplier",     type: "avatar" as const },
      { key: "email",     label: "Email",        type: "text" as const },
      { key: "phone",     label: "Phone",        type: "text" as const },
      { key: "category",  label: "Category",     type: "text" as const },
      { key: "rating",    label: "Rating",       type: "number" as const },
      { key: "status",    label: "Status",       type: "select" as const, options: ["Active", "Inactive"] },
    ],
    rows: [
      { name: "Ethio Supply Co", email: "info@ethiosupply.et", phone: "+251 11 123 4567", category: "Raw Materials", rating: 4.5, status: "Active" },
      { name: "TechParts Ethiopia", email: "sales@techparts.et", phone: "+251 11 234 5678", category: "Electronics", rating: 3.8, status: "Active" },
      { name: "Global Imports PLC", email: "info@globalimports.et", phone: "+251 11 345 6789", category: "Logistics", rating: 4.2, status: "Active" },
    ],
  },
  "contract-management":     {
    title: "Contract Management",
    columns: [
      { key: "title",     label: "Contract",     type: "text" as const },
      { key: "vendor",    label: "Vendor",       type: "avatar" as const },
      { key: "value",     label: "Value (ETB)",  type: "currency" as const },
      { key: "startDate", label: "Start Date",   type: "date" as const },
      { key: "endDate",   label: "End Date",     type: "date" as const },
      { key: "status",    label: "Status",       type: "select" as const, options: ["Draft", "Active", "Expired", "Terminated", "Pending Signature"] },
    ],
    rows: [
      { title: "Annual Supply Agreement", vendor: "Ethio Supply Co", value: 3600000, startDate: "2026-01-01", endDate: "2026-12-31", status: "Active" },
      { title: "IT Hardware Procurement", vendor: "TechParts Ethiopia", value: 8400000, startDate: "2026-03-01", endDate: "2027-02-28", status: "Active" },
      { title: "Import Freight Agreement", vendor: "Global Imports PLC", value: 2500000, startDate: "2026-02-01", endDate: "2026-08-01", status: "Expired" },
    ],
  },
  "approval-workflow":       {
    title: "Approval Workflow",
    columns: [
      { key: "requestNo",  label: "Request #",    type: "text" as const },
      { key: "module",     label: "Module",       type: "text" as const },
      { key: "requestedBy",label: "Requested By", type: "avatar" as const },
      { key: "approver",   label: "Approver",     type: "text" as const },
      { key: "status",     label: "Status",       type: "select" as const, options: ["Pending", "Approved", "Rejected", "Cancelled"] },
      { key: "createdAt",  label: "Date",         type: "date" as const },
    ],
    rows: [
      { requestNo: "APR-001", module: "Purchase", requestedBy: "Biniam Tesfaye", approver: "Yonas Alemu", status: "Pending", createdAt: "2026-07-01" },
      { requestNo: "APR-002", module: "Contract", requestedBy: "Mekdes Worku", approver: "Yonas Alemu", status: "Approved", createdAt: "2026-07-05" },
      { requestNo: "APR-003", module: "Tender", requestedBy: "Dawit Bekele", approver: "Tigist Haile", status: "Rejected", createdAt: "2026-07-10" },
    ],
  },
  "tender-management":       {
    title: "Tender Management",
    columns: [
      { key: "tenderNo",   label: "Tender #",     type: "text" as const },
      { key: "title",      label: "Title",        type: "text" as const },
      { key: "department", label: "Department",   type: "text" as const },
      { key: "issueDate",  label: "Issue Date",   type: "date" as const },
      { key: "closingDate",label: "Closing Date", type: "date" as const },
      { key: "budget",     label: "Budget (ETB)", type: "currency" as const },
      { key: "status",     label: "Status",       type: "select" as const, options: ["Open", "Under Review", "Awarded", "Cancelled", "Closed"] },
    ],
    rows: [
      { tenderNo: "TNR-001", title: "Office Furniture Supply", department: "Administration", issueDate: "2026-06-01", closingDate: "2026-07-15", budget: 500000, status: "Open" },
      { tenderNo: "TNR-002", title: "IT Infrastructure Upgrade", department: "IT", issueDate: "2026-06-10", closingDate: "2026-07-30", budget: 1200000, status: "Open" },
      { tenderNo: "TNR-003", title: "Vehicle Fleet Maintenance", department: "Fleet", issueDate: "2026-05-15", closingDate: "2026-06-30", budget: 350000, status: "Awarded" },
    ],
  },
  "procurement-analytics":   {
    title: "Procurement Analytics",
    columns: [
      { key: "metric",   label: "Metric",        type: "text" as const },
      { key: "value",    label: "Value",         type: "text" as const },
      { key: "target",   label: "Target",        type: "text" as const },
      { key: "achieved", label: "Achieved %",    type: "number" as const },
      { key: "trend",    label: "Trend",         type: "select" as const, options: ["Up", "Down", "Stable"] },
    ],
    rows: [
      { metric: "Total Vendors", value: "0", target: "30", achieved: 0, trend: "Stable" },
      { metric: "Active Contracts", value: "0", target: "20", achieved: 0, trend: "Stable" },
      { metric: "Open RFQs", value: "0", target: "8", achieved: 0, trend: "Stable" },
      { metric: "Avg Vendor Rating", value: "0/5", target: "4.5/5", achieved: 0, trend: "Stable" },
    ],
  },

  // Manufacturing
  "production-planning":     {
    title: "Production Planning",
    columns: [
      { key: "planNo",     label: "Plan #",       type: "text" as const },
      { key: "product",    label: "Product",      type: "avatar" as const },
      { key: "qty",        label: "Target Qty",   type: "number" as const },
      { key: "status",     label: "Status",       type: "select" as const, options: ["Planned", "In Progress", "Completed", "Cancelled"] },
      { key: "startDate",  label: "Start Date",   type: "date" as const },
      { key: "endDate",    label: "Target End",   type: "date" as const },
    ],
    rows: [
      { planNo: "PP-001", product: "Teff Flour Blend", qty: 5000, status: "In Progress", startDate: "2026-07-01", endDate: "2026-07-15" },
      { planNo: "PP-002", product: "Coffee Export Pack", qty: 200, status: "Planned", startDate: "2026-07-10", endDate: "2026-07-25" },
      { planNo: "PP-003", product: "PVC Pipe 2in", qty: 10000, status: "Completed", startDate: "2026-06-15", endDate: "2026-06-30" },
    ],
  },
  "bills-of-materials-bom":  {
    title: "Bills of Materials (BOM)",
    columns: [
      { key: "name",       label: "BOM Name",     type: "text" as const },
      { key: "product",    label: "Product",      type: "avatar" as const },
      { key: "version",    label: "Version",      type: "text" as const },
      { key: "totalCost",  label: "Total Cost",   type: "currency" as const },
      { key: "itemsCount", label: "Items",        type: "number" as const },
      { key: "status",     label: "Status",       type: "select" as const, options: ["Active", "Inactive", "Archived"] },
    ],
    rows: [
      { name: "Teff Flour Blend BOM v1", product: "Teff Flour Blend", version: "1.0", totalCost: 450000, itemsCount: 5, status: "Active" },
      { name: "Coffee Export Pack BOM", product: "Coffee Arabica (Export)", version: "2.0", totalCost: 520000, itemsCount: 3, status: "Active" },
      { name: "PVC Pipe 2in BOM", product: "PVC Pipe 2in (6m)", version: "1.0", totalCost: 180000, itemsCount: 4, status: "Archived" },
    ],
  },
  "work-orders":             { title: "Work Orders", columns: [ { key: "orderNumber", label: "WO #", type: "text" }, { key: "product", label: "Product", type: "avatar" }, { key: "quantity", label: "Qty Target", type: "number" }, { key: "startDate", label: "Start", type: "date" }, { key: "endDate", label: "Target End", type: "date" }, { key: "status", label: "Status", type: "select", options: ["Planned", "In Production", "Quality Check", "Completed", "Cancelled"] } ], rows: [ { orderNumber: "WO-2026-001", product: "Teff Flour Blend", quantity: 500, startDate: "2026-07-01", endDate: "2026-07-15", status: "Completed" }, { orderNumber: "WO-2026-002", product: "Coffee Export Pack", quantity: 200, startDate: "2026-07-10", endDate: "2026-07-25", status: "In Production" }, { orderNumber: "WO-2026-003", product: "PVC Pipe 2in (6m)", quantity: 1000, startDate: "2026-07-15", endDate: "2026-08-05", status: "Planned" } ] },
  "machine-monitoring":      {
    title: "Machine Monitoring",
    columns: [
      { key: "machineNo",  label: "Machine #",    type: "text" as const },
      { key: "name",       label: "Machine",      type: "avatar" as const },
      { key: "model",      label: "Model",        type: "text" as const },
      { key: "utilization",label: "Utilization %",type: "number" as const },
      { key: "location",   label: "Location",     type: "text" as const },
      { key: "status",     label: "Status",       type: "select" as const, options: ["Operational", "Idle", "Maintenance", "Offline"] },
    ],
    rows: [
      { machineNo: "MCH-001", name: "CNC Milling Machine", model: "Haas VF-2", utilization: 85, location: "Bldg A - Section 1", status: "Operational" },
      { machineNo: "MCH-002", name: "Injection Molder", model: "Arburg 320C", utilization: 72, location: "Bldg A - Section 2", status: "Operational" },
      { machineNo: "MCH-003", name: "Packaging Line A", model: "Bosch P2500", utilization: 0, location: "Bldg B", status: "Maintenance" },
    ],
  },
  "maintenance":             {
    title: "Maintenance",
    columns: [
      { key: "recordNo",   label: "Record #",     type: "text" as const },
      { key: "machine",    label: "Machine",      type: "text" as const },
      { key: "title",      label: "Maintenance",  type: "text" as const },
      { key: "type",       label: "Type",         type: "select" as const, options: ["Preventive", "Corrective", "Emergency", "Scheduled"] },
      { key: "scheduledDate",label: "Scheduled",  type: "date" as const },
      { key: "cost",       label: "Cost (ETB)",   type: "currency" as const },
      { key: "status",     label: "Status",       type: "select" as const, options: ["Planned", "In Progress", "Completed", "Cancelled"] },
    ],
    rows: [
      { recordNo: "MT-001", machine: "CNC Milling Machine", title: "Lubrication & Oil Change", type: "Preventive", scheduledDate: "2026-07-15", cost: 15000, status: "Planned" },
      { recordNo: "MT-002", machine: "Packaging Line A", title: "Belt Replacement", type: "Corrective", scheduledDate: "2026-07-10", cost: 45000, status: "In Progress" },
      { recordNo: "MT-003", machine: "Injection Molder", title: "Hydraulic System Check", type: "Scheduled", scheduledDate: "2026-07-20", cost: 22000, status: "Planned" },
    ],
  },
  "quality-control":         {
    title: "Quality Control",
    columns: [
      { key: "checkNo",    label: "Check #",      type: "text" as const },
      { key: "product",    label: "Product",      type: "avatar" as const },
      { key: "inspector",  label: "Inspector",    type: "text" as const },
      { key: "result",     label: "Result",       type: "select" as const, options: ["Pass", "Fail", "Pending", "Rework"] },
      { key: "notes",      label: "Notes",        type: "text" as const },
      { key: "checkedAt",  label: "Date",         type: "date" as const },
    ],
    rows: [
      { checkNo: "QC-001", product: "Teff Flour Blend", inspector: "Tigist Haile", result: "Pass", notes: "All specs met", checkedAt: "2026-07-05" },
      { checkNo: "QC-002", product: "PVC Pipe 2in", inspector: "Dawit Bekele", result: "Rework", notes: "Wall thickness below spec", checkedAt: "2026-07-06" },
      { checkNo: "QC-003", product: "Coffee Export Pack", inspector: "Tigist Haile", result: "Pending", notes: "Awaiting lab results", checkedAt: "2026-07-07" },
    ],
  },
  "production-scheduling":   {
    title: "Production Scheduling",
    columns: [
      { key: "scheduleNo", label: "Schedule #",   type: "text" as const },
      { key: "workOrder",  label: "Work Order",   type: "text" as const },
      { key: "machine",    label: "Machine",      type: "text" as const },
      { key: "priority",   label: "Priority",     type: "select" as const, options: ["Low", "Medium", "High", "Urgent"] },
      { key: "startDate",  label: "Start Date",   type: "date" as const },
      { key: "endDate",    label: "End Date",     type: "date" as const },
      { key: "status",     label: "Status",       type: "select" as const, options: ["Scheduled", "In Progress", "Completed", "Delayed", "Cancelled"] },
    ],
    rows: [
      { scheduleNo: "SCH-001", workOrder: "WO-2026-001", machine: "CNC Milling Machine", priority: "High", startDate: "2026-07-01", endDate: "2026-07-05", status: "Completed" },
      { scheduleNo: "SCH-002", workOrder: "WO-2026-002", machine: "Injection Molder", priority: "Medium", startDate: "2026-07-06", endDate: "2026-07-12", status: "In Progress" },
      { scheduleNo: "SCH-003", workOrder: "WO-2026-003", machine: "Packaging Line A", priority: "Low", startDate: "2026-07-15", endDate: "2026-07-20", status: "Scheduled" },
    ],
  },
  "manufacturing-analytics": {
    title: "Manufacturing Analytics",
    columns: [
      { key: "metric",     label: "Metric",       type: "text" as const },
      { key: "value",      label: "Value",        type: "text" as const },
      { key: "target",     label: "Target",       type: "text" as const },
      { key: "achieved",   label: "Achieved %",   type: "number" as const },
      { key: "trend",      label: "Trend",        type: "select" as const, options: ["Up", "Down", "Stable"] },
    ],
    rows: [
      { metric: "Total Work Orders", value: "0", target: "50", achieved: 0, trend: "Stable" },
      { metric: "Completion Rate", value: "0%", target: "90%", achieved: 0, trend: "Stable" },
      { metric: "Quality Pass Rate", value: "0%", target: "95%", achieved: 0, trend: "Stable" },
      { metric: "Machine Utilization", value: "0%", target: "75%", achieved: 0, trend: "Stable" },
    ],
  },

  // Logistics
  "fleet-management":        FLEET,
  "gps-tracking":            { title: "GPS Tracking", columns: [
    { key: "vehicle",    label: "Vehicle",     type: "avatar" as const },
    { key: "driver",     label: "Driver",       type: "avatar" as const },
    { key: "lat",        label: "Latitude",     type: "text" as const },
    { key: "lng",        label: "Longitude",    type: "text" as const },
    { key: "speed",      label: "Speed (km/h)",type: "number" as const },
    { key: "heading",    label: "Heading",      type: "text" as const },
    { key: "lastUpdated",label: "Last Updated", type: "text" as const },
    { key: "gpsStatus",  label: "Status",       type: "select" as const, options: ["Moving", "Idle", "Stopped", "Offline"] },
  ], rows: [
    { vehicle: "Toyota Hilux 2022",  driver: "Solomon Tadesse", lat: "8.9806", lng: "38.7578", speed: 65, heading: "NE", lastUpdated: "2026-07-10 14:32", gpsStatus: "Moving" },
    { vehicle: "Isuzu Truck FVR",    driver: "Petros Haile",    lat: "9.0241", lng: "38.7469", speed: 0,  heading: "N",  lastUpdated: "2026-07-10 14:15", gpsStatus: "Idle" },
    { vehicle: "Land Cruiser",       driver: "Mulugeta Girma",  lat: "8.9932", lng: "38.7998", speed: 72, heading: "SW", lastUpdated: "2026-07-10 14:28", gpsStatus: "Moving" },
    { vehicle: "Hyundai H350 Van",   driver: "Daniel Bekele",   lat: "8.9600", lng: "38.7700", speed: 0,  heading: "-",  lastUpdated: "2026-07-10 13:00", gpsStatus: "Stopped" },
    { vehicle: "Mitsubishi Fuso",    driver: "Bereket Alemu",   lat: "9.0300", lng: "38.8100", speed: 0,  heading: "-",  lastUpdated: "2026-07-10 11:45", gpsStatus: "Offline" },
  ]},
  "driver-management":       { title: "Driver Management", columns: [
    { key: "name",          label: "Name",          type: "avatar" as const },
    { key: "licenseNo",     label: "License #",     type: "text" as const },
    { key: "licenseClass",  label: "Class",          type: "select" as const, options: ["Light", "Medium", "Heavy", "Trailer", "Motorcycle"] },
    { key: "licenseExpiry", label: "License Expiry", type: "date" as const },
    { key: "phone",         label: "Phone",          type: "text" as const },
    { key: "email",         label: "Email",          type: "text" as const },
    { key: "assignedVehicle",label: "Assigned To",    type: "text" as const },
    { key: "rating",        label: "Rating",          type: "number" as const },
    { key: "driverStatus",  label: "Status",          type: "select" as const, options: ["Available", "On Route", "Off Duty", "Suspended", "On Leave"] },
  ], rows: [
    { name: "Solomon Tadesse",  licenseNo: "DL-001", licenseClass: "Heavy", licenseExpiry: "2027-06-15", phone: "+251-911-1001", email: "solomon@nexyovi.com", assignedVehicle: "Toyota Hilux 2022", rating: 4.8, driverStatus: "On Route" },
    { name: "Petros Haile",     licenseNo: "DL-002", licenseClass: "Heavy", licenseExpiry: "2026-12-01", phone: "+251-911-1002", email: "petros@nexyovi.com", assignedVehicle: "Isuzu Truck FVR", rating: 4.5, driverStatus: "Available" },
    { name: "Mulugeta Girma",   licenseNo: "DL-003", licenseClass: "Medium", licenseExpiry: "2028-03-20", phone: "+251-911-1003", email: "mulugeta@nexyovi.com", assignedVehicle: "Land Cruiser", rating: 4.9, driverStatus: "On Route" },
    { name: "Daniel Bekele",    licenseNo: "DL-004", licenseClass: "Light", licenseExpiry: "2026-09-10", phone: "+251-911-1004", email: "daniel@nexyovi.com", assignedVehicle: "Hyundai H350 Van", rating: 4.2, driverStatus: "Off Duty" },
    { name: "Bereket Alemu",    licenseNo: "DL-005", licenseClass: "Heavy", licenseExpiry: "2027-01-05", phone: "+251-911-1005", email: "bereket@nexyovi.com", assignedVehicle: "Mitsubishi Fuso", rating: 4.6, driverStatus: "Available" },
  ]},
  "route-optimization":      { title: "Route Optimization", columns: [
    { key: "routeNo",       label: "Route #",       type: "text" as const },
    { key: "origin",        label: "Origin",         type: "text" as const },
    { key: "destination",   label: "Destination",    type: "text" as const },
    { key: "distance",      label: "Distance (km)",  type: "number" as const },
    { key: "estDuration",   label: "Est. Duration",  type: "text" as const },
    { key: "vehicle",       label: "Vehicle",        type: "text" as const },
    { key: "driver",        label: "Driver",          type: "avatar" as const },
    { key: "fuelEstimate",  label: "Fuel Est. (L)",  type: "number" as const },
    { key: "optimized",     label: "Optimization",    type: "select" as const, options: ["Optimal", "Alternative", "Express", "Economy", "Scenic"] },
    { key: "routeStatus",   label: "Status",          type: "select" as const, options: ["Planned", "In Progress", "Completed", "Cancelled"] },
  ], rows: [
    { routeNo: "RTE-001", origin: "Addis Ababa (HQ)", destination: "Gondar", distance: 720, estDuration: "10h 30m", vehicle: "Isuzu Truck FVR", driver: "Petros Haile", fuelEstimate: 85, optimized: "Optimal", routeStatus: "Completed" },
    { routeNo: "RTE-002", origin: "Addis Ababa (HQ)", destination: "Hawassa", distance: 275, estDuration: "4h 15m", vehicle: "Toyota Hilux", driver: "Solomon Tadesse", fuelEstimate: 35, optimized: "Express", routeStatus: "In Progress" },
    { routeNo: "RTE-003", origin: "Addis Ababa (HQ)", destination: "Dire Dawa", distance: 445, estDuration: "6h 45m", vehicle: "Mitsubishi Fuso", driver: "Bereket Alemu", fuelEstimate: 55, optimized: "Economy", routeStatus: "Planned" },
    { routeNo: "RTE-004", origin: "Hawassa", destination: "Arba Minch", distance: 275, estDuration: "4h 00m", vehicle: "Land Cruiser", driver: "Mulugeta Girma", fuelEstimate: 32, optimized: "Alternative", routeStatus: "Planned" },
  ]},
  "fuel-management":         { title: "Fuel Management", columns: [
    { key: "date",          label: "Date",           type: "date" as const },
    { key: "vehicle",       label: "Vehicle",        type: "avatar" as const },
    { key: "driver",        label: "Driver",          type: "text" as const },
    { key: "fuelType",      label: "Fuel Type",      type: "select" as const, options: ["Diesel", "Petrol", "Electric", "Hybrid"] },
    { key: "liters",        label: "Liters",          type: "number" as const },
    { key: "costPerLiter",  label: "Cost/L (ETB)",   type: "currency" as const },
    { key: "totalCost",     label: "Total (ETB)",    type: "currency" as const },
    { key: "odometer",      label: "Odometer (km)",  type: "number" as const },
    { key: "station",       label: "Station",         type: "text" as const },
    { key: "fuelStatus",    label: "Status",          type: "select" as const, options: ["Approved", "Pending", "Rejected"] },
  ], rows: [
    { date: "2026-07-10", vehicle: "Toyota Hilux 2022", driver: "Solomon Tadesse", fuelType: "Diesel", liters: 45, costPerLiter: 126, totalCost: 5670, odometer: 43200, station: "Total Bole", fuelStatus: "Approved" },
    { date: "2026-07-09", vehicle: "Isuzu Truck FVR", driver: "Petros Haile", fuelType: "Diesel", liters: 120, costPerLiter: 124, totalCost: 14880, odometer: 78900, station: "NOC Mexico", fuelStatus: "Approved" },
    { date: "2026-07-08", vehicle: "Land Cruiser", driver: "Mulugeta Girma", fuelType: "Diesel", liters: 60, costPerLiter: 126, totalCost: 7560, odometer: 95500, station: "Total Bole", fuelStatus: "Approved" },
    { date: "2026-07-07", vehicle: "Hyundai H350 Van", driver: "Daniel Bekele", fuelType: "Petrol", liters: 35, costPerLiter: 132, totalCost: 4620, odometer: 34800, station: "Shell Kazanchis", fuelStatus: "Pending" },
    { date: "2026-07-06", vehicle: "Mitsubishi Fuso", driver: "Bereket Alemu", fuelType: "Diesel", liters: 95, costPerLiter: 124, totalCost: 11780, odometer: 112800, station: "NOC Bole", fuelStatus: "Approved" },
  ]},
  "delivery-tracking":       { title: "Delivery Tracking", columns: [
    { key: "deliveryNo",   label: "Delivery #",    type: "text" as const },
    { key: "customer",     label: "Customer",      type: "avatar" as const },
    { key: "address",      label: "Address",        type: "text" as const },
    { key: "vehicle",      label: "Vehicle",        type: "text" as const },
    { key: "driver",       label: "Driver",          type: "text" as const },
    { key: "items",        label: "Items",           type: "number" as const },
    { key: "weight",       label: "Weight (kg)",    type: "number" as const },
    { key: "scheduledDate",label: "Scheduled",       type: "date" as const },
    { key: "deliveredDate",label: "Delivered",       type: "date" as const },
    { key: "deliStatus",   label: "Status",          type: "select" as const, options: ["Pending", "In Transit", "Delivered", "Failed", "Returned"] },
  ], rows: [
    { deliveryNo: "DEL-001", customer: "Sunrise PLC", address: "Bole, Addis Ababa", vehicle: "Toyota Hilux", driver: "Solomon Tadesse", items: 24, weight: 480, scheduledDate: "2026-07-10", deliveredDate: "2026-07-10", deliStatus: "Delivered" },
    { deliveryNo: "DEL-002", customer: "Green Valley Ltd", address: "CMC, Addis Ababa", vehicle: "Isuzu Truck FVR", driver: "Petros Haile", items: 120, weight: 2400, scheduledDate: "2026-07-10", deliveredDate: "", deliStatus: "In Transit" },
    { deliveryNo: "DEL-003", customer: "Addis Tech", address: "Kazanchis, Addis Ababa", vehicle: "Hyundai H350", driver: "Daniel Bekele", items: 8, weight: 160, scheduledDate: "2026-07-11", deliveredDate: "", deliStatus: "Pending" },
    { deliveryNo: "DEL-004", customer: "Blue Nile Exports", address: "Djibouti Road", vehicle: "Mitsubishi Fuso", driver: "Bereket Alemu", items: 200, weight: 8000, scheduledDate: "2026-07-09", deliveredDate: "2026-07-09", deliStatus: "Delivered" },
    { deliveryNo: "DEL-005", customer: "Ethio Supply Co", address: "Akaki, Addis Ababa", vehicle: "Land Cruiser", driver: "Mulugeta Girma", items: 15, weight: 300, scheduledDate: "2026-07-10", deliveredDate: "", deliStatus: "Failed" },
  ]},
  "shipment-management":     { title: "Shipment Management", columns: [
    { key: "shipmentNo",   label: "Shipment #",    type: "text" as const },
    { key: "customer",     label: "Customer",      type: "avatar" as const },
    { key: "origin",       label: "Origin",         type: "text" as const },
    { key: "destination",  label: "Destination",    type: "text" as const },
    { key: "vehicle",      label: "Vehicle",        type: "text" as const },
    { key: "driver",       label: "Driver",          type: "text" as const },
    { key: "items",        label: "Items",           type: "number" as const },
    { key: "totalWeight",  label: "Weight (kg)",    type: "number" as const },
    { key: "pickupDate",   label: "Pickup",         type: "date" as const },
    { key: "estDelivery",  label: "Est. Delivery",  type: "date" as const },
    { key: "shipStatus",   label: "Status",          type: "select" as const, options: ["Created", "Loaded", "In Transit", "Delivered", "Cancelled"] },
  ], rows: [
    { shipmentNo: "SHP-001", customer: "Global Exports", origin: "Addis Ababa", destination: "Djibouti Port", vehicle: "Mitsubishi Fuso", driver: "Bereket Alemu", items: 400, totalWeight: 20000, pickupDate: "2026-07-08", estDelivery: "2026-07-11", shipStatus: "In Transit" },
    { shipmentNo: "SHP-002", customer: "Sunrise PLC", origin: "Addis Ababa", destination: "Gondar", vehicle: "Isuzu Truck FVR", driver: "Petros Haile", items: 120, totalWeight: 6000, pickupDate: "2026-07-10", estDelivery: "2026-07-11", shipStatus: "Loaded" },
    { shipmentNo: "SHP-003", customer: "TechParts Ethiopia", origin: "Addis Ababa", destination: "Hawassa", vehicle: "Toyota Hilux", driver: "Solomon Tadesse", items: 50, totalWeight: 1250, pickupDate: "2026-07-11", estDelivery: "2026-07-12", shipStatus: "Created" },
    { shipmentNo: "SHP-004", customer: "Green Valley Ltd", origin: "Hawassa", destination: "Addis Ababa", vehicle: "Land Cruiser", driver: "Mulugeta Girma", items: 30, totalWeight: 900, pickupDate: "2026-07-09", estDelivery: "2026-07-10", shipStatus: "Delivered" },
  ]},
  "logistics-analytics":     { title: "Logistics Analytics", columns: [
    { key: "metric",       label: "Metric",         type: "text" as const },
    { key: "value",        label: "Value",           type: "text" as const },
    { key: "target",       label: "Target",          type: "text" as const },
    { key: "achieved",     label: "Achieved %",     type: "number" as const },
    { key: "trend",        label: "Trend",           type: "select" as const, options: ["Up", "Down", "Stable"] },
    { key: "statusBadge",  label: "Status",          type: "badge" as const },
  ], rows: [
    { metric: "Fleet Utilization", value: "78%", target: "85%", achieved: 78, trend: "Up", statusBadge: "Good" },
    { metric: "On-Time Delivery", value: "91%", target: "95%", achieved: 91, trend: "Up", statusBadge: "Good" },
    { metric: "Fuel Cost (MTD)", value: "ETB 84K", target: "ETB 75K", achieved: 112, trend: "Up", statusBadge: "Exceeded" },
    { metric: "Avg Trip Distance", value: "428 km", target: "450 km", achieved: 95, trend: "Stable", statusBadge: "Good" },
    { metric: "Driver Performance", value: "4.6/5", target: "4.5/5", achieved: 102, trend: "Up", statusBadge: "Excellent" },
  ]},

  // Projects
  "projects":                PROJECTS,
  "tasks":                   { title: "Tasks", columns: [
    { key: "title",    label: "Task",       type: "text" as const },
    { key: "project",  label: "Project",    type: "text" as const },
    { key: "assignee", label: "Assignee",   type: "avatar" as const },
    { key: "priority", label: "Priority",   type: "select" as const, options: ["Low", "Medium", "High", "Urgent", "Critical"] },
    { key: "due",      label: "Due Date",   type: "date" as const },
    { key: "status",   label: "Status",     type: "select" as const, options: ["Todo", "In Progress", "In Review", "Done", "Cancelled", "Blocked"] },
  ], rows: [
    { title: "Design UI for HR module",    project: "NEXYOVI OS Launch",  assignee: "Dawit Bekele",  priority: "High",   due: "2025-07-10", status: "In Progress" },
    { title: "Write API documentation",    project: "Mobile App v2",      assignee: "Dawit Bekele",  priority: "Medium", due: "2025-07-15", status: "Todo" },
    { title: "Review payroll calculations",project: "HR Portal Redesign", assignee: "Abebe Girma",   priority: "High",   due: "2025-07-08", status: "In Review" },
    { title: "Set up production server",   project: "NEXYOVI OS Launch",  assignee: "Dawit Bekele",  priority: "High",   due: "2025-07-20", status: "Todo" },
    { title: "Train HR team on system",    project: "HR Portal Redesign",  assignee: "Tigist Haile", priority: "Low",    due: "2025-08-01", status: "Todo" },
  ]},
  "kanban-boards":           { title: "Kanban Boards", columns: PROJECTS.columns, rows: PROJECTS.rows },
  "gantt-charts":            { title: "Gantt Charts",  columns: PROJECTS.columns, rows: PROJECTS.rows },
  "scrum":                   { title: "Scrum",         columns: PROJECTS.columns, rows: PROJECTS.rows },
  "sprint-planning":         { title: "Sprint Planning",columns: PROJECTS.columns, rows: PROJECTS.rows },
  "resource-allocation":     { title: "Resource Allocation", columns: EMPLOYEES.columns, rows: EMPLOYEES.rows },
  "project-analytics":       { title: "Project Analytics", columns: PROJECTS.columns, rows: PROJECTS.rows },

  // Documents
  "file-storage":            DOCUMENTS,
  "version-control":         { title: "Version Control", columns: DOCUMENTS.columns, rows: DOCUMENTS.rows },
  "ocr":                     { title: "OCR", columns: DOCUMENTS.columns, rows: DOCUMENTS.rows },
  "ai-document-search":      { title: "AI Document Search", columns: DOCUMENTS.columns, rows: DOCUMENTS.rows },
  "digital-signatures":      { title: "Digital Signatures", columns: DOCUMENTS.columns, rows: DOCUMENTS.rows },
  "templates":               { title: "Templates", columns: DOCUMENTS.columns, rows: DOCUMENTS.rows },
  "pdf-generation":          { title: "PDF Generation", columns: DOCUMENTS.columns, rows: DOCUMENTS.rows },

  // Security
  "rbac":                    RBAC,
  "abac":                    { title: "Attribute-Based Access (ABAC)", columns: RBAC.columns, rows: RBAC.rows },
  "single-sign-on-sso":      { title: "Single Sign-On (SSO)", columns: RBAC.columns, rows: RBAC.rows },
  "multi-factor-auth-mfa":   { title: "Multi-Factor Auth (MFA)", columns: EMPLOYEES.columns, rows: EMPLOYEES.rows },
  "audit-logs":              { title: "Audit Logs", columns: GENERAL_LEDGER.columns, rows: GENERAL_LEDGER.rows },
  "encryption":              { title: "Encryption", columns: RBAC.columns, rows: RBAC.rows },
  "backup-recovery":         { title: "Backup & Recovery", columns: DOCUMENTS.columns, rows: DOCUMENTS.rows },
  "device-management":       { title: "Device Management", columns: FLEET.columns, rows: FLEET.rows },

  // Platform
  "rest-api":                { title: "REST API", columns: RBAC.columns, rows: RBAC.rows },
  "graphql-api":             { title: "GraphQL API", columns: RBAC.columns, rows: RBAC.rows },
  "webhooks":                { title: "Webhooks", columns: RBAC.columns, rows: RBAC.rows },
  "third-party-integrations":{ title: "Third-Party Integrations", columns: RBAC.columns, rows: RBAC.rows },
  "payment-integrations":    { title: "Payment Integrations", columns: GENERAL_LEDGER.columns, rows: GENERAL_LEDGER.rows },
  "email-providers":         { title: "Email Providers", columns: RBAC.columns, rows: RBAC.rows },
  "sms-providers":           { title: "SMS Providers", columns: RBAC.columns, rows: RBAC.rows },
  "cloud-storage":           { title: "Cloud Storage", columns: DOCUMENTS.columns, rows: DOCUMENTS.rows },

  // Industry
  "hospital-management":     { title: "Hospital Management", columns: EMPLOYEES.columns, rows: EMPLOYEES.rows },
  "school-management":       { title: "School Management", columns: EMPLOYEES.columns, rows: EMPLOYEES.rows },
  "hotel-management":        { title: "Hotel Management", columns: LEADS.columns, rows: LEADS.rows },
  "ngo-management":          { title: "NGO Management", columns: PROJECTS.columns, rows: PROJECTS.rows },
  "construction-erp":        { title: "Construction ERP", columns: PROJECTS.columns, rows: PROJECTS.rows },
  "agriculture-erp":         { title: "Agriculture ERP", columns: PRODUCTS.columns, rows: PRODUCTS.rows },
  "manufacturing-erp":       { title: "Manufacturing ERP", columns: WORK_ORDERS.columns, rows: WORK_ORDERS.rows },
  "government-erp":          { title: "Government ERP", columns: EMPLOYEES.columns, rows: EMPLOYEES.rows },
  "retail-pos":              { title: "Retail POS", columns: PRODUCTS.columns, rows: PRODUCTS.rows },
  "restaurant-management":   { title: "Restaurant Management", columns: PRODUCTS.columns, rows: PRODUCTS.rows },

  // Ethiopia
  "telebirr-integration":          { title: "Telebirr Integration", columns: GENERAL_LEDGER.columns, rows: GENERAL_LEDGER.rows },
  "cbe-birr-integration":          { title: "CBE Birr Integration", columns: GENERAL_LEDGER.columns, rows: GENERAL_LEDGER.rows },
  "ethiopian-calendar":            { title: "Ethiopian Calendar", columns: EMPLOYEES.columns, rows: EMPLOYEES.rows },
  "amharic-afaan-oromo-ui":        { title: "Amharic / Afaan Oromo UI", columns: EMPLOYEES.columns, rows: EMPLOYEES.rows },
  "tigrinya-somali-ui":            { title: "Tigrinya / Somali UI", columns: EMPLOYEES.columns, rows: EMPLOYEES.rows },
  "vat-pension-calculations":      { title: "VAT & Pension Calculations", columns: GENERAL_LEDGER.columns, rows: GENERAL_LEDGER.rows },
  "government-procurement":        { title: "Government Procurement", columns: PURCHASE_REQUESTS.columns, rows: PURCHASE_REQUESTS.rows },
  "local-banking-integrations":    { title: "Local Banking Integrations", columns: GENERAL_LEDGER.columns, rows: GENERAL_LEDGER.rows },
  // AI CORE MODULES (Live SQL Data mapped from Backend)
  "ai-ceo": { title: "AI CEO", columns: [ { key: "id", label: "ID", type: "text" }, { key: "title", label: "Objective", type: "text" }, { key: "currentValue", label: "Current Value", type: "number" }, { key: "targetValue", label: "Target", type: "number" }, { key: "status", label: "Status", type: "badge" } ], rows: [] },
  "ai-copilot": { title: "AI Copilot", columns: [ { key: "id", label: "ID", type: "text" }, { key: "title", label: "Session Title", type: "text" }, { key: "tokensUsed", label: "Tokens", type: "number" }, { key: "createdAt", label: "Date", type: "date" } ], rows: [] },
  "ai-agents": { title: "AI Agents", columns: [ { key: "id", label: "ID", type: "text" }, { key: "name", label: "Agent Name", type: "text" }, { key: "role", label: "Role", type: "text" }, { key: "model", label: "Model", type: "text" }, { key: "status", label: "Status", type: "badge" }, { key: "tasksDone", label: "Tasks Done", type: "number" } ], rows: [] },
  "ai-workflow-builder": { title: "AI Workflow Builder", columns: [ { key: "id", label: "ID", type: "text" }, { key: "name", label: "Workflow", type: "text" }, { key: "triggerType", label: 'Trigger', type: 'text' }, { key: "status", label: "Status", type: "badge" } ], rows: [] },
  "ai-voice-assistant": { title: "AI Voice Assistant", columns: [ { key: "id", label: "Call ID", type: "text" }, { key: "callerId", label: "Caller", type: "text" }, { key: "intent", label: "Intent", type: "text" }, { key: "durationSec", label: "Duration (s)", type: "number" }, { key: "status", label: "Status", type: "badge" } ], rows: [] },
  "ai-knowledge-base": { title: "AI Knowledge Base", columns: [ { key: "id", label: "ID", type: "text" }, { key: "title", label: "Source", type: "text" }, { key: "type", label: "Type", type: "text" }, { key: "chunkCount", label: "Chunks", type: "number" }, { key: "status", label: "Status", type: "badge" } ], rows: [] },
  "ai-document-intelligence": { title: "AI Document Intelligence", columns: [ { key: "id", label: "ID", type: "text" }, { key: "fileName", label: "File", type: "text" }, { key: "confidence", label: "Confidence", type: "number" }, { key: "status", label: "Status", type: "badge" } ], rows: [] },
  "ai-analytics": { title: "AI Analytics", columns: [ { key: "id", label: "ID", type: "text" }, { key: "metricName", label: "Metric", type: "text" }, { key: "value", label: "Value", type: "number" }, { key: "date", label: "Date", type: "date" } ], rows: [] },
  "ai-automation": { title: "AI Automation", columns: [ { key: "id", label: "ID", type: "text" }, { key: "taskName", label: "Task", type: "text" }, { key: "executionTimeMs", label: "Time (ms)", type: "number" }, { key: "status", label: "Status", type: "badge" } ], rows: [] },
  "ai-decision-engine": { title: "AI Decision Engine", columns: [ { key: "id", label: "ID", type: "text" }, { key: "context", label: "Context", type: "text" }, { key: "confidenceScore", label: "Confidence", type: "number" }, { key: "status", label: "Status", type: "badge" } ], rows: [] },
};

// ── HR MEGA EXPANSION MODULES ────────────────────────────────────────
const RECRUITMENT_ATS = {
  title: 'Recruitment (ATS)',
  columns: [
    { key: 'name', label: 'Candidate', type: 'avatar' as const },
    { key: 'email', label: 'Email', type: 'text' as const },
    { key: 'phone', label: 'Phone', type: 'text' as const },
    { key: 'position', label: 'Position', type: 'text' as const },
    { key: 'stage', label: 'Stage', type: 'select' as const, options: ['New', 'Screening', 'Phone Screen', 'Interview', 'Technical Test', 'Offer', 'Hired', 'Rejected', 'Withdrawn'] },
    { key: 'rating', label: 'Rating', type: 'number' as const },
    { key: 'notes', label: 'Notes', type: 'text' as const },
    { key: 'createdAt', label: 'Applied On', type: 'date' as const }
  ],
  rows: []
};
const ONBOARDING = {
  title: 'Onboarding',
  columns: [
    { key: 'title', label: 'Task', type: 'text' as const },
    { key: 'status', label: 'Status', type: 'select' as const, options: ['Pending', 'In Progress', 'Completed', 'Skipped', 'Cancelled'] },
    { key: 'createdAt', label: 'Created At', type: 'date' as const }
  ],
  rows: []
};
const ATTENDANCE = {
  title: 'Attendance',
  columns: [
    { key: 'employee', label: 'Employee', type: 'avatar' as const },
    { key: 'date', label: 'Date', type: 'date' as const },
    { key: 'checkIn', label: 'Check In', type: 'date' as const },
    { key: 'checkOut', label: 'Check Out', type: 'date' as const },
    { key: 'status', label: 'Status', type: 'select' as const, options: ['Present', 'Absent', 'Late', 'Half Day', 'Holiday', 'On Leave', 'Remote', 'On Business Trip'] }
  ],
  rows: []
};
const PERFORMANCE_MANAGEMENT = {
  title: 'Performance Management',
  columns: [
    { key: 'employee', label: 'Employee', type: 'avatar' as const },
    { key: 'period', label: 'Period', type: 'text' as const },
    { key: 'score', label: 'Score', type: 'number' as const },
    { key: 'status', label: 'Status', type: 'select' as const, options: ['Pending', 'In Progress', 'Completed', 'Under Review', 'Cancelled'] }
  ],
  rows: []
};
const LEARNING_TRAINING_LMS = {
  title: 'Learning & Training (LMS)',
  columns: [
    { key: 'title', label: 'Course', type: 'text' as const },
    { key: 'instructor', label: 'Instructor', type: 'text' as const },
    { key: 'durationHrs', label: 'Hours', type: 'number' as const },
    { key: 'status', label: 'Status', type: 'select' as const, options: ['Active', 'Inactive', 'Completed', 'Draft', 'Archived'] }
  ],
  rows: []
};
const BENEFITS = {
  title: 'Benefits',
  columns: [
    { key: 'employee', label: 'Employee', type: 'avatar' as const },
    { key: 'name', label: 'Benefit', type: 'text' as const },
    { key: 'type', label: 'Type', type: 'select' as const, options: ['Health Insurance', 'Life Insurance', 'Pension', 'Transport', 'Meal', 'Education', 'Housing', 'Wellness', 'Other'] },
    { key: 'cost', label: 'Cost (ETB)', type: 'currency' as const }
  ],
  rows: []
};
const EMPLOYEE_SELF_SERVICE = {
  title: 'Employee Self-Service',
  columns: [
    { key: 'subject', label: 'Subject', type: 'text' as const },
    { key: 'category', label: 'Category', type: 'select' as const, options: ['HR Request', 'IT Support', 'Finance', 'Leave', 'Payroll', 'Training', 'Facilities', 'Other'] },
    { key: 'status', label: 'Status', type: 'select' as const, options: ['Open', 'In Progress', 'Resolved', 'Closed', 'Reopened'] },
    { key: 'createdAt', label: 'Date', type: 'date' as const }
  ],
  rows: []
};
const ORGANIZATIONAL_CHART = {
  title: 'Organizational Chart',
  columns: [
    { key: 'name', label: 'Employee', type: 'avatar' as const },
    { key: 'manager', label: 'Manager', type: 'text' as const },
    { key: 'department', label: 'Department', type: 'text' as const }
  ],
  rows: []
};
const TIME_TRACKING = {
  title: 'Time Tracking',
  columns: [
    { key: 'employee', label: 'Employee', type: 'avatar' as const },
    { key: 'date', label: 'Date', type: 'date' as const },
    { key: 'task', label: 'Task', type: 'text' as const },
    { key: 'hoursWorked', label: 'Hours', type: 'number' as const }
  ],
  rows: []
};
const SHIFT_SCHEDULING = {
  title: 'Shift Scheduling',
  columns: [
    { key: 'employee', label: 'Employee', type: 'avatar' as const },
    { key: 'shiftName', label: 'Shift', type: 'text' as const },
    { key: 'startTime', label: 'Start Time', type: 'date' as const },
    { key: 'endTime', label: 'End Time', type: 'date' as const },
    { key: 'status', label: 'Status', type: 'select' as const, options: ['Scheduled', 'Confirmed', 'Completed', 'Cancelled', 'Swapped', 'No Show'] }
  ],
  rows: []
};
const EXIT_MANAGEMENT = {
  title: 'Exit Management',
  columns: [
    { key: 'employee', label: 'Employee', type: 'avatar' as const },
    { key: 'exitDate', label: 'Exit Date', type: 'date' as const },
    { key: 'reason', label: 'Reason', type: 'select' as const, options: ['Resignation', 'Retirement', 'Termination', 'End of Contract', 'Mutual Agreement', 'Relocation', 'Health', 'Study', 'Other'] }
  ],
  rows: []
};
const HR_ANALYTICS = {
  title: 'HR Analytics',
  columns: [
    { key: 'metricName', label: 'Metric', type: 'text' as const },
    { key: 'value', label: 'Value', type: 'number' as const },
    { key: 'date', label: 'Last Updated', type: 'date' as const }
  ],
  rows: []
};

export function getModuleConfig(slug: string): ModuleConfig {
  const hrMap: Record<string, ModuleConfig> = {
    'recruitment-ats': RECRUITMENT_ATS,
    'onboarding': ONBOARDING,
    'attendance': ATTENDANCE,
    'performance-management': PERFORMANCE_MANAGEMENT,
    'learning-training-lms': LEARNING_TRAINING_LMS,
    'benefits': BENEFITS,
    'employee-self-service': EMPLOYEE_SELF_SERVICE,
    'organizational-chart': ORGANIZATIONAL_CHART,
    'time-tracking': TIME_TRACKING,
    'shift-scheduling': SHIFT_SCHEDULING,
    'exit-management': EXIT_MANAGEMENT,
    'hr-analytics': HR_ANALYTICS,
  };
  if (hrMap[slug]) return hrMap[slug];

  return MODULE_CONFIGS[slug] ?? {
    title: slug.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" "),
    columns: [
      { key: "id",     label: "ID",     type: "text" as const },
      { key: "name",   label: "Name",   type: "text" as const },
      { key: "status", label: "Status", type: "badge" as const },
    ],
    rows: [
      { id: "001", name: "Sample Record 1", status: "Active" },
      { id: "002", name: "Sample Record 2", status: "Pending" },
      { id: "003", name: "Sample Record 3", status: "Active" },
    ],
  };
}

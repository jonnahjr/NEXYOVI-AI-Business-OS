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
    { key: "gender",        label: "Gender",           type: "text" as const },
    { key: "dateOfBirth",   label: "DOB",              type: "date" as const },
    { key: "nationality",   label: "Nationality",      type: "text" as const },
    { key: "maritalStatus", label: "Marital Status",   type: "text" as const },
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
    { key: "employmentType",label: "Employ Type",      type: "text" as const },
    { key: "status",        label: "Status",           type: "badge" as const },
    { key: "startDate",     label: "Hire Date",        type: "date" as const },
    { key: "branchOffice",  label: "Branch",           type: "text" as const },
    { key: "workLocation",  label: "Work Location",    type: "text" as const },
    { key: "workShift",     label: "Shift",            type: "text" as const },
    { key: "gradeLevel",    label: "Grade",            type: "text" as const },
    { key: "costCenter",    label: "Cost Center",      type: "text" as const },
    // ── Payroll ─────────────────────────────────────────────
    { key: "salary",        label: "Salary (ETB)",     type: "currency" as const },
    { key: "salaryType",    label: "Salary Type",      type: "text" as const },
    { key: "currency",      label: "Currency",         type: "text" as const },
    { key: "allowances",    label: "Allowances",       type: "currency" as const },
    { key: "bonuses",       label: "Bonuses",          type: "currency" as const },
    { key: "paymentMethod", label: "Payment Method",   type: "text" as const },
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
    { key: "employmentType",label: "Type",          type: "text" as const },
    { key: "empStatus",     label: "Emp Status",    type: "badge" as const },
    { key: "period",        label: "Period",        type: "text" as const },
    { key: "basic",         label: "Basic (ETB)",   type: "currency" as const },
    { key: "allowance",     label: "Allowance",     type: "currency" as const },
    { key: "deduction",     label: "Deduction",     type: "currency" as const },
    { key: "tax",           label: "Tax",           type: "currency" as const },
    { key: "net",           label: "Net Pay (ETB)", type: "currency" as const },
    { key: "status",        label: "Status",        type: "badge" as const },
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
    { key: "phone",     label: "Phone",        type: "text" as const },
    { key: "source",    label: "Source",       type: "badge" as const },
    { key: "value",     label: "Est. Value",   type: "currency" as const },
    { key: "stage",     label: "Stage",        type: "badge" as const },
    { key: "assignee",  label: "Assigned To",  type: "text" as const },
  ],
  rows: [
    { name: "Mehari Tesfaye",  company: "Sunrise PLC",       phone: "+251 91 234 5678", source: "Website",  value: 250000, stage: "Qualified",    assignee: "Sara Tadesse" },
    { name: "Selam Habtamu",   company: "Green Valley Ltd",  phone: "+251 92 345 6789", source: "Referral", value: 180000, stage: "Proposal",     assignee: "Sara Tadesse" },
    { name: "Kifle Amare",     company: "Addis Tech",        phone: "+251 93 456 7890", source: "LinkedIn", value: 480000, stage: "Negotiation",  assignee: "Abebe Girma" },
    { name: "Wubet Girma",     company: "Blue Nile Exports", phone: "+251 94 567 8901", source: "Cold Call",value: 120000, stage: "New",          assignee: "Sara Tadesse" },
    { name: "Hailemariam T.", company: "Horn of Africa",     phone: "+251 91 678 9012", source: "Event",    value: 650000, stage: "Closed Won",   assignee: "Abebe Girma" },
    { name: "Azeb Alemu",      company: "Ethio Trading",     phone: "+251 92 789 0123", source: "Website",  value: 90000,  stage: "Lost",         assignee: "Sara Tadesse" },
  ],
};

const INVOICES = {
  title: "Invoicing",
  columns: [
    { key: "invoiceNo", label: "Invoice #",     type: "text" as const },
    { key: "customer",  label: "Customer",      type: "avatar" as const },
    { key: "date",      label: "Date",          type: "date" as const },
    { key: "dueDate",   label: "Due Date",      type: "date" as const },
    { key: "amount",    label: "Amount (ETB)",  type: "currency" as const },
    { key: "paid",      label: "Paid (ETB)",    type: "currency" as const },
    { key: "status",    label: "Status",        type: "badge" as const },
  ],
  rows: [
    { invoiceNo: "INV-2025-001", customer: "Sunrise PLC",       date: "2025-06-01", dueDate: "2025-06-30", amount: 250000, paid: 250000, status: "Paid" },
    { invoiceNo: "INV-2025-002", customer: "Green Valley Ltd",  date: "2025-06-05", dueDate: "2025-07-05", amount: 180000, paid: 0,      status: "Overdue" },
    { invoiceNo: "INV-2025-003", customer: "Addis Tech",        date: "2025-06-10", dueDate: "2025-07-10", amount: 480000, paid: 240000, status: "Partial" },
    { invoiceNo: "INV-2025-004", customer: "Blue Nile Exports", date: "2025-06-15", dueDate: "2025-07-15", amount: 120000, paid: 0,      status: "Sent" },
    { invoiceNo: "INV-2025-005", customer: "Horn of Africa",    date: "2025-06-20", dueDate: "2025-07-20", amount: 650000, paid: 650000, status: "Paid" },
  ],
};

// ── INVENTORY MODULES ──────────────────────────────────────
const PRODUCTS = {
  title: "Products",
  columns: [
    { key: "sku",        label: "SKU",          type: "text" as const },
    { key: "name",       label: "Product Name", type: "text" as const },
    { key: "category",   label: "Category",     type: "badge" as const },
    { key: "qty",        label: "Qty in Stock", type: "number" as const },
    { key: "unit",       label: "Unit",         type: "text" as const },
    { key: "price",      label: "Price (ETB)",  type: "currency" as const },
    { key: "status",     label: "Status",       type: "badge" as const },
  ],
  rows: [
    { sku: "PRD-001", name: "Injera Flour (50kg)",      category: "Food",       qty: 842,  unit: "Bag",    price: 1200,  status: "In Stock" },
    { sku: "PRD-002", name: "Teff Grain (25kg)",         category: "Food",       qty: 23,   unit: "Bag",    price: 890,   status: "Low Stock" },
    { sku: "PRD-003", name: "Office Chair (Ergonomic)",  category: "Furniture",  qty: 45,   unit: "Piece",  price: 6500,  status: "In Stock" },
    { sku: "PRD-004", name: "HP Laptop 15\"",            category: "Electronics",qty: 12,   unit: "Piece",  price: 48000, status: "In Stock" },
    { sku: "PRD-005", name: "PVC Pipe 2\" (6m)",         category: "Hardware",   qty: 0,    unit: "Piece",  price: 320,   status: "Out of Stock" },
    { sku: "PRD-006", name: "Cement (50kg bag)",         category: "Construction",qty: 1204, unit: "Bag",   price: 480,   status: "In Stock" },
    { sku: "PRD-007", name: "Coffee Arabica (Export)",   category: "Export",     qty: 340,  unit: "Quintal",price: 82000, status: "In Stock" },
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
    { key: "status",     label: "Status",       type: "badge" as const },
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
    { key: "priority",  label: "Priority",     type: "badge" as const },
    { key: "status",    label: "Status",       type: "badge" as const },
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
    { key: "status",    label: "Status",       type: "badge" as const },
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
    { key: "status",    label: "Status",      type: "badge" as const },
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
    { key: "type",     label: "Type",          type: "badge" as const },
    { key: "size",     label: "Size",          type: "text" as const },
    { key: "owner",    label: "Owner",         type: "avatar" as const },
    { key: "modified", label: "Last Modified", type: "date" as const },
    { key: "status",   label: "Status",        type: "badge" as const },
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
    { key: "status",   label: "Status",       type: "badge" as const },
    { key: "odometer", label: "Odometer km",  type: "number" as const },
    { key: "nextService",label: "Next Service",type: "date" as const },
  ],
  rows: [
    { plate: "AA-3-5678", model: "Toyota Hilux 2022",  driver: "Solomon Tadesse", status: "On Route",    odometer: 42800, nextService: "2025-08-01" },
    { plate: "AA-1-1234", model: "Isuzu Truck FVR",    driver: "Petros Haile",    status: "Available",   odometer: 78400, nextService: "2025-07-15" },
    { plate: "OR-2-9012", model: "Toyota Land Cruiser", driver: "Mulugeta Girma", status: "On Route",    odometer: 95200, nextService: "2025-09-10" },
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
    { key: "status",     label: "Status",       type: "badge" as const },
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
    { key: "status",   label: "Status",     type: "badge" as const },
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
  "opportunity-pipeline":   { title: "Opportunity Pipeline", columns: LEADS.columns, rows: LEADS.rows },
  "customer-management":    { title: "Customer Management", columns: LEADS.columns, rows: LEADS.rows },
  "contact-management":     { title: "Contact Management", columns: LEADS.columns, rows: LEADS.rows },
  "sales-quotes":           { title: "Sales Quotes", columns: INVOICES.columns, rows: INVOICES.rows.slice(0,4) },
  "orders":                 { title: "Orders", columns: INVOICES.columns, rows: INVOICES.rows },
  "invoicing":              INVOICES,
  "contracts":              { title: "Contracts", columns: DOCUMENTS.columns, rows: DOCUMENTS.rows.slice(0,4) },
  "sales-forecasting":      { title: "Sales Forecasting", columns: LEADS.columns, rows: LEADS.rows },
  "customer-support":       { title: "Customer Support", columns: LEADS.columns, rows: LEADS.rows },
  "customer-portal":        { title: "Customer Portal", columns: LEADS.columns, rows: LEADS.rows },
  "loyalty-programs":       { title: "Loyalty Programs", columns: LEADS.columns, rows: LEADS.rows },
  "sales-analytics":        { title: "Sales Analytics", columns: LEADS.columns, rows: LEADS.rows },

  // Inventory
  "products":               PRODUCTS,
  "categories":             { title: "Categories", columns: [
    { key: "name",   label: "Category",     type: "text" as const },
    { key: "parent", label: "Parent",       type: "text" as const },
    { key: "items",  label: "Items",        type: "number" as const },
    { key: "status", label: "Status",       type: "badge" as const },
  ], rows: [
    { name: "Food & Beverage",   parent: "Root",       items: 234, status: "Active" },
    { name: "Electronics",       parent: "Root",       items: 142, status: "Active" },
    { name: "Construction",      parent: "Root",       items: 389, status: "Active" },
    { name: "Furniture",         parent: "Root",       items: 87,  status: "Active" },
    { name: "Export Goods",      parent: "Root",       items: 56,  status: "Active" },
    { name: "Office Supplies",   parent: "Root",       items: 203, status: "Active" },
  ]},
  "warehouses":             { title: "Warehouses", columns: [
    { key: "name",      label: "Warehouse",    type: "text" as const },
    { key: "location",  label: "Location",     type: "text" as const },
    { key: "capacity",  label: "Capacity (m²)",type: "number" as const },
    { key: "occupancy", label: "Occupancy %",  type: "number" as const },
    { key: "manager",   label: "Manager",      type: "avatar" as const },
    { key: "status",    label: "Status",       type: "badge" as const },
  ], rows: [
    { name: "Main Warehouse",    location: "Addis Ababa (Akaki)", capacity: 5000, occupancy: 74, manager: "Yonas Alemu",   status: "Active" },
    { name: "North Hub",         location: "Gondar",              capacity: 2000, occupancy: 91, manager: "Petros Haile",  status: "Active" },
    { name: "South Distribution",location: "Hawassa",             capacity: 3000, occupancy: 55, manager: "Daniel Bekele", status: "Active" },
    { name: "Export Terminal",   location: "Djibouti Road",       capacity: 8000, occupancy: 40, manager: "Solomon T.",    status: "Active" },
  ]},
  "stock-management":        { title: "Stock Management", columns: PRODUCTS.columns, rows: PRODUCTS.rows },
  "batch-serial-numbers":    { title: "Batch & Serial Numbers", columns: PRODUCTS.columns, rows: PRODUCTS.rows.slice(0,4) },
  "barcode-qr":              { title: "Barcode / QR", columns: PRODUCTS.columns, rows: PRODUCTS.rows },
  "purchase-orders":         { title: "Purchase Orders", columns: INVOICES.columns, rows: INVOICES.rows },
  "goods-receipt":           { title: "Goods Receipt", columns: PRODUCTS.columns, rows: PRODUCTS.rows.slice(0,5) },
  "stock-transfers":         { title: "Stock Transfers", columns: PRODUCTS.columns, rows: PRODUCTS.rows },
  "cycle-counts":            { title: "Cycle Counts", columns: PRODUCTS.columns, rows: PRODUCTS.rows },
  "inventory-forecasting":   { title: "Inventory Forecasting", columns: PRODUCTS.columns, rows: PRODUCTS.rows },
  "supplier-stock":          { title: "Supplier Stock", columns: PRODUCTS.columns, rows: PRODUCTS.rows },
  "warehouse-analytics":     { title: "Warehouse Analytics", columns: PRODUCTS.columns, rows: PRODUCTS.rows },

  // Finance
  "general-ledger":          GENERAL_LEDGER,
  "accounts-payable":        { title: "Accounts Payable", columns: INVOICES.columns, rows: INVOICES.rows },
  "accounts-receivable":     { title: "Accounts Receivable", columns: INVOICES.columns, rows: INVOICES.rows },
  "budgeting":               { title: "Budgeting", columns: GENERAL_LEDGER.columns, rows: GENERAL_LEDGER.rows },
  "expenses":                { title: "Expenses", columns: GENERAL_LEDGER.columns, rows: GENERAL_LEDGER.rows.slice(0,4) },
  "banking":                 { title: "Banking", columns: GENERAL_LEDGER.columns, rows: GENERAL_LEDGER.rows },
  "cash-flow":               { title: "Cash Flow", columns: GENERAL_LEDGER.columns, rows: GENERAL_LEDGER.rows },
  "tax-vat":                 { title: "Tax & VAT", columns: GENERAL_LEDGER.columns, rows: GENERAL_LEDGER.rows },
  "fixed-assets":            { title: "Fixed Assets", columns: PRODUCTS.columns, rows: PRODUCTS.rows.slice(0,5) },
  "financial-statements":    { title: "Financial Statements", columns: GENERAL_LEDGER.columns, rows: GENERAL_LEDGER.rows },
  "multi-currency":          { title: "Multi-Currency", columns: GENERAL_LEDGER.columns, rows: GENERAL_LEDGER.rows },
  "audit-trail":             { title: "Audit Trail", columns: GENERAL_LEDGER.columns, rows: GENERAL_LEDGER.rows },
  "financial-analytics":     { title: "Financial Analytics", columns: GENERAL_LEDGER.columns, rows: GENERAL_LEDGER.rows },

  // Procurement
  "purchase-requests":       PURCHASE_REQUESTS,
  "rfqs":                    { title: "RFQs", columns: PURCHASE_REQUESTS.columns, rows: PURCHASE_REQUESTS.rows },
  "vendor-management":       { title: "Vendor Management", columns: LEADS.columns, rows: LEADS.rows },
  "supplier-portal":         { title: "Supplier Portal", columns: LEADS.columns, rows: LEADS.rows },
  "contract-management":     { title: "Contract Management", columns: DOCUMENTS.columns, rows: DOCUMENTS.rows.slice(0,4) },
  "approval-workflow":       { title: "Approval Workflow", columns: PURCHASE_REQUESTS.columns, rows: PURCHASE_REQUESTS.rows },
  "tender-management":       { title: "Tender Management", columns: PURCHASE_REQUESTS.columns, rows: PURCHASE_REQUESTS.rows },
  "procurement-analytics":   { title: "Procurement Analytics", columns: PURCHASE_REQUESTS.columns, rows: PURCHASE_REQUESTS.rows },

  // Manufacturing
  "production-planning":     { title: "Production Planning", columns: WORK_ORDERS.columns, rows: WORK_ORDERS.rows },
  "bills-of-materials-bom":  { title: "Bills of Materials (BOM)", columns: PRODUCTS.columns, rows: PRODUCTS.rows },
  "work-orders":             WORK_ORDERS,
  "machine-monitoring":      { title: "Machine Monitoring", columns: WORK_ORDERS.columns, rows: WORK_ORDERS.rows },
  "maintenance":             { title: "Maintenance", columns: FLEET.columns, rows: FLEET.rows },
  "quality-control":         { title: "Quality Control", columns: WORK_ORDERS.columns, rows: WORK_ORDERS.rows },
  "production-scheduling":   { title: "Production Scheduling", columns: WORK_ORDERS.columns, rows: WORK_ORDERS.rows },
  "manufacturing-analytics": { title: "Manufacturing Analytics", columns: WORK_ORDERS.columns, rows: WORK_ORDERS.rows },

  // Logistics
  "fleet-management":        FLEET,
  "gps-tracking":            { title: "GPS Tracking", columns: FLEET.columns, rows: FLEET.rows },
  "driver-management":       { title: "Driver Management", columns: EMPLOYEES.columns, rows: EMPLOYEES.rows.slice(0,5) },
  "route-optimization":      { title: "Route Optimization", columns: FLEET.columns, rows: FLEET.rows },
  "fuel-management":         { title: "Fuel Management", columns: FLEET.columns, rows: FLEET.rows },
  "delivery-tracking":       { title: "Delivery Tracking", columns: FLEET.columns, rows: FLEET.rows },
  "shipment-management":     { title: "Shipment Management", columns: FLEET.columns, rows: FLEET.rows },
  "logistics-analytics":     { title: "Logistics Analytics", columns: FLEET.columns, rows: FLEET.rows },

  // Projects
  "projects":                PROJECTS,
  "tasks":                   { title: "Tasks", columns: [
    { key: "title",    label: "Task",       type: "text" as const },
    { key: "project",  label: "Project",    type: "text" as const },
    { key: "assignee", label: "Assignee",   type: "avatar" as const },
    { key: "priority", label: "Priority",   type: "badge" as const },
    { key: "due",      label: "Due Date",   type: "date" as const },
    { key: "status",   label: "Status",     type: "badge" as const },
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
    { key: 'stage', label: 'Stage', type: 'badge' as const },
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
    { key: 'status', label: 'Status', type: 'badge' as const },
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
    { key: 'status', label: 'Status', type: 'badge' as const }
  ],
  rows: []
};
const PERFORMANCE_MANAGEMENT = {
  title: 'Performance Management',
  columns: [
    { key: 'employee', label: 'Employee', type: 'avatar' as const },
    { key: 'period', label: 'Period', type: 'text' as const },
    { key: 'score', label: 'Score', type: 'number' as const },
    { key: 'status', label: 'Status', type: 'badge' as const }
  ],
  rows: []
};
const LEARNING_TRAINING_LMS = {
  title: 'Learning & Training (LMS)',
  columns: [
    { key: 'title', label: 'Course', type: 'text' as const },
    { key: 'instructor', label: 'Instructor', type: 'text' as const },
    { key: 'durationHrs', label: 'Hours', type: 'number' as const },
    { key: 'status', label: 'Status', type: 'badge' as const }
  ],
  rows: []
};
const BENEFITS = {
  title: 'Benefits',
  columns: [
    { key: 'employee', label: 'Employee', type: 'avatar' as const },
    { key: 'name', label: 'Benefit', type: 'text' as const },
    { key: 'type', label: 'Type', type: 'badge' as const },
    { key: 'cost', label: 'Cost (ETB)', type: 'currency' as const }
  ],
  rows: []
};
const EMPLOYEE_SELF_SERVICE = {
  title: 'Employee Self-Service',
  columns: [
    { key: 'subject', label: 'Subject', type: 'text' as const },
    { key: 'category', label: 'Category', type: 'badge' as const },
    { key: 'status', label: 'Status', type: 'badge' as const },
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
    { key: 'status', label: 'Status', type: 'badge' as const }
  ],
  rows: []
};
const EXIT_MANAGEMENT = {
  title: 'Exit Management',
  columns: [
    { key: 'employee', label: 'Employee', type: 'avatar' as const },
    { key: 'exitDate', label: 'Exit Date', type: 'date' as const },
    { key: 'reason', label: 'Reason', type: 'text' as const }
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

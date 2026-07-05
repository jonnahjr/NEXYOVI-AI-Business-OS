import React, { useState, useEffect } from "react";
import { Plus, X, Save, User, Phone, Briefcase, DollarSign, GraduationCap, Clock, Star, FileText, Calendar } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import FileUploadField from "./FileUploadField";


const inputClass = "w-full border border-black/20 bg-white p-3 rounded-md text-sm text-black focus:border-black focus:ring-1 focus:ring-black outline-none transition placeholder:text-black/40";
const readonlyInputClass = "w-full border border-black/10 p-3 rounded-md bg-black/5 text-black/60 font-mono text-sm outline-none";
const labelClass = "block text-xs font-bold text-black mb-1.5 uppercase tracking-wider";
const sectionTitleClass = "col-span-2 text-lg font-black pt-4 pb-2 border-b border-black/10 mb-2";

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className={labelClass}>{label} {required && <span className="text-[#F9A230]">*</span>}</label>
      {children}
    </div>
  );
}

function FullField({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="col-span-2">
      <label className={labelClass}>{label} {required && <span className="text-[#F9A230]">*</span>}</label>
      {children}
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <div className={sectionTitleClass}>{children}</div>;
}

function DropdownWithOther({ label, name, value, options, onChange, required, fullWidth }: any) {
  const isStandard = options.includes(value) || value === "" || !value;
  const [isOther, setIsOther] = useState(!isStandard && value);

  const handleSelectChange = (e: any) => {
    const val = e.target.value;
    if (val === "Other") {
      setIsOther(true);
      onChange({ target: { name, value: "" } });
    } else {
      setIsOther(false);
      onChange(e);
    }
  };

  const Wrapper = fullWidth ? FullField : Field;

  return (
    <Wrapper label={label} required={required}>
      <div className="flex gap-2">
        <select 
          name={name} 
          value={isOther ? "Other" : (value || "")} 
          onChange={handleSelectChange} 
          className={inputClass}
        >
          <option value="">Select...</option>
          {options.map((opt: string) => <option key={opt} value={opt}>{opt}</option>)}
          <option value="Other">Other (Please specify)</option>
        </select>
        {isOther && (
          <input 
            name={name} 
            value={isOther ? value : ""} 
            onChange={onChange} 
            className={inputClass} 
            placeholder="Please specify" 
            autoFocus
          />
        )}
      </div>
    </Wrapper>
  );
}

function DynamicList({ title, items, onAdd, onRemove, empty, children }: {
  title: string; items: any[]; onAdd: () => void; onRemove: (i: number) => void; empty: string; children: (item: any, i: number) => React.ReactNode;
}) {
  return (
    <div>
      <div className="flex justify-between items-center mb-6 border-b border-black/10 pb-4">
        <h3 className="font-black text-xl">{title}</h3>
        <button onClick={onAdd} className="text-xs font-bold bg-black text-white px-4 py-2 rounded-md flex items-center gap-1.5 hover:bg-black/80 transition">
          <Plus size={14} /> Add
        </button>
      </div>
      {items.length === 0 && (
        <div className="text-black/40 text-sm font-medium text-center py-12 border border-dashed border-black/20 rounded-md">{empty}</div>
      )}
      {items.map((item, i) => (
        <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} key={i}
          className="border border-black/20 p-5 rounded-md mb-4 relative group"
        >
          <button onClick={() => onRemove(i)}
            className="absolute top-3 right-3 p-1.5 text-black/40 hover:text-black transition opacity-0 group-hover:opacity-100"
          ><X size={16} /></button>
          {children(item, i)}
        </motion.div>
      ))}
    </div>
  );
}

export default function UltimateEmployeeManager({ onBack }: { onBack: () => void }) {
  const [activeTab, setActiveTab] = useState("personal");
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState<any>({
    // 1. Personal
    employeeCode: "",
    firstName: "", middleName: "", lastName: "",
    gender: "", dateOfBirth: "", nationality: "", maritalStatus: "",
    nationalId: "", passportNumber: "",
    profilePhoto: "",
    // 2. Contact
    personalPhone: "", workPhone: "",
    personalEmail: "", workEmail: "",
    address: "", city: "", region: "", country: "Ethiopia", postalCode: "",
    emergencyName: "", emergencyPhone: "", emergencyRelation: "",
    // 3. Employment
    status: "ACTIVE", employmentType: "FULL_TIME",
    hireDate: "",
    departmentId: "", jobTitle: "", managerId: "",
    branchOffice: "", workLocation: "", workShift: "", gradeLevel: "", costCenter: "",
    // 4. Payroll
    salary: 0, salaryType: "MONTHLY", paymentMethod: "",
    bankName: "", bankAccount: "", accountHolderName: "",
    taxId: "", pensionId: "", currency: "ETB",
    allowances: 0, bonuses: 0,
    // Dynamic arrays
    educations: [],
    experiences: [],
    skills: [],
    children: [],
    // Leave
    annualLeaveBalance: 0,
    sickLeaveBalance: 0,
    maternityLeave: 0,
    paternityLeave: 0,
    unpaidLeaveBalance: 0,
    compassionateLeave: 0,
    otherLeaveTypes: "",
  });

  useEffect(() => {
    let companyAbbr = "NXV";
    let token = "";
    try {
      token = localStorage.getItem("token") || "";
      if (token) {
        const payload = JSON.parse(atob(token.split(".")[1]));
        const companyName = payload.companyName || "Company";
        companyAbbr = companyName.split(/\s+/).map((w: string) => w[0]).join("").toUpperCase().slice(0, 4);
      }
    } catch {}

    // Fetch real count for sequential ID
    fetch("http://localhost:3002/api/v1/modules/human-resources/employee-management/count", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(data => {
        const seq = String((data.count || 0) + 1).padStart(4, "0");
        setFormData((prev: any) => ({ ...prev, employeeCode: `${companyAbbr}-EMP-${seq}` }));
      })
      .catch(() => {
        setFormData((prev: any) => ({ ...prev, employeeCode: `${companyAbbr}-EMP-0001` }));
      });
  }, []);

  useEffect(() => {
    if (formData.departmentId) {
      const code = formData.departmentId === "Other" ? "OTH" : formData.departmentId.replace(/[^A-Za-z]/g, "").substring(0, 3).toUpperCase();
      const newCostCenter = `CC-${code}-1001`;
      if (formData.costCenter !== newCostCenter) {
        setFormData((prev: any) => ({ ...prev, costCenter: newCostCenter }));
      }
    } else {
      if (formData.costCenter !== "") {
        setFormData((prev: any) => ({ ...prev, costCenter: "" }));
      }
    }
  }, [formData.departmentId]);

  const set = (key: string, value: any) => setFormData((p: any) => ({ ...p, [key]: value }));
  const handle = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => set(e.target.name, e.target.value);

  const formatPhone = (value: string) => {
    const d = value.replace(/\D/g, "");
    if (d.length <= 3) return d.length ? `(${d}` : "";
    if (d.length <= 6) return `(${d.slice(0,3)}) ${d.slice(3)}`;
    return `(${d.slice(0,3)}) ${d.slice(3,6)}-${d.slice(6,10)}`;
  };

  const updateList = (key: string, i: number, field: string, value: any) => {
    const arr = [...formData[key]];
    arr[i] = { ...arr[i], [field]: value };
    set(key, arr);
  };
  const addToList = (key: string, template: any) => set(key, [...formData[key], template]);
  const removeFromList = (key: string, i: number) => set(key, formData[key].filter((_: any, idx: number) => idx !== i));

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token") || "";
      const res = await fetch("http://localhost:3002/api/v1/modules/human-resources/employee-management", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify(formData),
      });
      if (res.ok) { onBack(); }
      else { const e = await res.json(); alert(`Failed to save: ${e.message || "Unknown error"}`); }
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const tabs = [
    { id: "personal",    label: "Personal",    icon: User },
    { id: "contact",     label: "Contact",     icon: Phone },
    { id: "employment",  label: "Employment",  icon: Briefcase },
    { id: "payroll",     label: "Payroll",     icon: DollarSign },
    { id: "education",   label: "Education",   icon: GraduationCap },
    { id: "experience",  label: "Experience",  icon: Clock },
    { id: "skills",      label: "Skills",      icon: Star },
    { id: "documents",   label: "Documents",   icon: FileText },
    { id: "leave",       label: "Leave",        icon: Calendar },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      className="bg-white text-black min-h-[calc(100vh-4rem)] p-8 flex flex-col font-sans"
    >
      {/* Header */}
      <div className="flex justify-between items-center mb-8 border-b border-black/10 pb-6">
        <div>
          <h2 className="text-4xl font-black tracking-tight text-black">Ultimate HR Record</h2>
          <p className="text-sm text-black/60 mt-1 font-medium">Full 360° Employee Lifecycle Management</p>
        </div>
        <div className="flex space-x-3">
          <button onClick={onBack} className="px-5 py-2.5 border border-black/20 rounded-md text-sm font-semibold hover:bg-black/5 transition text-black">Cancel</button>
          <button onClick={handleSave} disabled={isLoading} className="px-6 py-2.5 bg-[#F9A230] text-black rounded-md text-sm font-black flex items-center space-x-2 hover:bg-amber-500 transition disabled:opacity-50">
            <Save size={16} /><span>{isLoading ? "Saving..." : "Save Record"}</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 border-b border-black/10 mb-10 overflow-x-auto pb-0">
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 pb-4 font-bold text-sm transition relative whitespace-nowrap ${activeTab === tab.id ? "text-black" : "text-black/40 hover:text-black/70"}`}
          >
            <tab.icon size={15} /><span>{tab.label}</span>
            {activeTab === tab.id && <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-black" />}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto max-w-4xl">
        <AnimatePresence mode="wait">
          <motion.div key={activeTab} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 6 }} transition={{ duration: 0.18 }}>

            {/* ── 1. PERSONAL ──────────────────────────────── */}
            {activeTab === "personal" && (
              <div className="grid grid-cols-2 gap-x-8 gap-y-5">
                <SectionTitle>Employee Information</SectionTitle>
                <Field label="Employee Code (Auto)"><input readOnly value={formData.employeeCode} className={readonlyInputClass} /></Field>
                <div />
                <Field label="First Name" required><input name="firstName" value={formData.firstName} onChange={handle} className={inputClass} placeholder="Abebe" /></Field>
                <Field label="Middle Name"><input name="middleName" value={formData.middleName} onChange={handle} className={inputClass} placeholder="Bekele" /></Field>
                <Field label="Last Name" required><input name="lastName" value={formData.lastName} onChange={handle} className={inputClass} placeholder="Girma" /></Field>
                <DropdownWithOther label="Gender" name="gender" value={formData.gender} onChange={handle} options={["MALE", "FEMALE", "NON-BINARY"]} />
                <Field label="Date of Birth" required><input type="date" name="dateOfBirth" value={formData.dateOfBirth} onChange={handle} className={inputClass} /></Field>
                <DropdownWithOther label="Nationality" name="nationality" value={formData.nationality} onChange={handle} required options={[
                  "Ethiopian", "Kenyan", "Nigerian", "South African", "Ugandan", "Rwandan", "Ghanaian", "Tanzanian", "Egyptian", "Senegalese",
                  "American", "British", "Canadian", "Indian", "Chinese", "Australian", "Brazilian", "French", "German", "Japanese", "UAE", "Saudi Arabian"
                ]} />
                <DropdownWithOther label="Marital Status" name="maritalStatus" value={formData.maritalStatus} onChange={handle} required options={[
                  "SINGLE", "MARRIED", "DIVORCED", "WIDOWED", "SEPARATED", "DOMESTIC PARTNERSHIP"
                ]} />
                <SectionTitle>Identity Documents</SectionTitle>
                <Field label="National ID" required><input name="nationalId" value={formData.nationalId} onChange={handle} className={inputClass} placeholder="National ID Number" /></Field>
                <Field label="Passport Number"><input name="passportNumber" value={formData.passportNumber} onChange={handle} className={inputClass} placeholder="EP1234567" /></Field>
              </div>
            )}

            {/* ── 2. CONTACT ───────────────────────────────── */}
            {activeTab === "contact" && (
              <div className="grid grid-cols-2 gap-x-8 gap-y-5">
                <SectionTitle>Phone Numbers</SectionTitle>
                <Field label="Mobile Number" required>
                  <div className="hr-phone">
                    <PhoneInput
                      country="et"
                      value={formData.personalPhone}
                      onChange={val => set("personalPhone", val)}
                      inputStyle={{ width: "100%", height: "46px", border: "1px solid rgba(0,0,0,0.2)", borderRadius: "0.375rem", fontSize: "14px", fontFamily: "inherit" }}
                      buttonStyle={{ border: "1px solid rgba(0,0,0,0.2)", borderRight: "none", borderRadius: "0.375rem 0 0 0.375rem", background: "rgba(0,0,0,0.05)" }}
                      dropdownStyle={{ borderRadius: "0.375rem", border: "1px solid rgba(0,0,0,0.2)", boxShadow: "0 4px 20px rgba(0,0,0,0.1)" }}
                      containerStyle={{ width: "100%" }}
                      enableSearch
                      searchStyle={{ border: "1px solid rgba(0,0,0,0.2)", borderRadius: "0.375rem", padding: "6px 10px", fontSize: "13px", outline: "none" }}
                    />
                  </div>
                </Field>
                    <Field label="Work Phone / Alternative Phone">
                      <div className="hr-phone">
                        <PhoneInput
                          country="et"
                          value={formData.workPhone}
                          onChange={val => set("workPhone", val)}
                          inputStyle={{ width: "100%", height: "46px", border: "1px solid rgba(0,0,0,0.2)", borderRadius: "0.375rem", fontSize: "14px", fontFamily: "inherit" }}
                          buttonStyle={{ border: "1px solid rgba(0,0,0,0.2)", borderRight: "none", borderRadius: "0.375rem 0 0 0.375rem", background: "rgba(0,0,0,0.05)" }}

                      dropdownStyle={{ borderRadius: "0.375rem", border: "1px solid rgba(0,0,0,0.2)", boxShadow: "0 4px 20px rgba(0,0,0,0.1)" }}
                      containerStyle={{ width: "100%" }}
                      enableSearch
                    />
                  </div>
                </Field>
                <SectionTitle>Email Addresses</SectionTitle>
                <Field label="Personal Email"><input type="email" name="personalEmail" value={formData.personalEmail} onChange={handle} className={inputClass} placeholder="abebe@gmail.com" /></Field>
                <Field label="Work Email"><input type="email" name="workEmail" value={formData.workEmail} onChange={handle} className={inputClass} placeholder="abebe@company.com" /></Field>
                <SectionTitle>Home Address</SectionTitle>
                <FullField label="Street Address"><input name="address" value={formData.address} onChange={handle} className={inputClass} placeholder="Bole, Woreda 03, House No. 150" /></FullField>
                <Field label="City"><input name="city" value={formData.city} onChange={handle} className={inputClass} placeholder="Addis Ababa" /></Field>
                <DropdownWithOther label="State / Region" name="region" value={formData.region} onChange={handle} options={[
                  "Addis Ababa", "Afar", "Amhara", "Benishangul-Gumuz", "Central Ethiopia", "Dire Dawa", "Gambela", "Harari", "Oromia", "Sidama", "Somali", "South Ethiopia", "South West Ethiopia", "Tigray"
                ]} />
                <Field label="Country"><input name="country" value={formData.country} onChange={handle} className={inputClass} placeholder="Ethiopia" /></Field>
                <Field label="Postal Code"><input name="postalCode" value={formData.postalCode} onChange={handle} className={inputClass} placeholder="1000" /></Field>
                <SectionTitle>Emergency Contact</SectionTitle>
                <Field label="Contact Name" required><input name="emergencyName" value={formData.emergencyName} onChange={handle} className={inputClass} placeholder="Jane Doe" /></Field>
                <DropdownWithOther label="Relationship" name="emergencyRelation" value={formData.emergencyRelation} onChange={handle} options={[
                  "Spouse", "Parent", "Sibling", "Child", "Friend", "Colleague", "Partner", "Neighbor"
                ]} />
                <FullField label="Emergency Phone">
                  <div className="hr-phone">
                    <PhoneInput
                      country="et"
                      value={formData.emergencyPhone}
                      onChange={val => set("emergencyPhone", val)}
                      inputStyle={{ width: "100%", height: "46px", border: "1px solid rgba(0,0,0,0.2)", borderRadius: "0.375rem", fontSize: "14px", fontFamily: "inherit" }}
                      buttonStyle={{ border: "1px solid rgba(0,0,0,0.2)", borderRight: "none", borderRadius: "0.375rem 0 0 0.375rem", background: "rgba(0,0,0,0.05)" }}
                      dropdownStyle={{ borderRadius: "0.375rem", border: "1px solid rgba(0,0,0,0.2)", boxShadow: "0 4px 20px rgba(0,0,0,0.1)" }}
                      containerStyle={{ width: "100%" }}
                      enableSearch
                    />
                  </div>
                </FullField>
              </div>
            )}

            {/* ── 3. EMPLOYMENT ────────────────────────────── */}
            {activeTab === "employment" && (
              <div className="grid grid-cols-2 gap-x-8 gap-y-5">
                <SectionTitle>Employment Status</SectionTitle>
                <DropdownWithOther label="Employment Status" name="status" value={formData.status} onChange={handle} required options={[
                  "ACTIVE", "PROBATION", "CONTRACT", "INTERN", "ON_LEAVE", "SUSPENDED", "TERMINATED"
                ]} />
                <DropdownWithOther label="Employment Type" name="employmentType" value={formData.employmentType} onChange={handle} required options={[
                  "FULL_TIME", "PART_TIME", "CONTRACT", "INTERN", "TEMPORARY", "FREELANCE"
                ]} />
                <SectionTitle>Position Details</SectionTitle>
                <Field label="Job Title / Position" required><input name="jobTitle" value={formData.jobTitle} onChange={handle} className={inputClass} placeholder="Senior Software Engineer" /></Field>
                <Field label="Joining Date" required><input type="date" name="hireDate" value={formData.hireDate} onChange={handle} className={inputClass} /></Field>
                <DropdownWithOther label="Department" name="departmentId" value={formData.departmentId} onChange={handle} required options={[
                  "Engineering", "Human Resources", "Finance", "Accounting", "Marketing", "Sales", "Operations", "IT Support", "Legal", "Product Management", "Customer Success", "R&D", "Quality Assurance", "Administration", "Supply Chain"
                ]} />
                <Field label="Manager / Supervisor"><input name="managerId" value={formData.managerId} onChange={handle} className={inputClass} placeholder="Manager Name or ID" /></Field>
                <DropdownWithOther label="Branch / Office" name="branchOffice" value={formData.branchOffice} onChange={handle} required options={[
                  "Head Office (HQ)", "Addis Ababa Branch", "Dire Dawa Branch", "Mekelle Branch", "Bahir Dar Branch", "Hawassa Branch", "Adama Branch", "Gondar Branch", "Jimma Branch", "Dessie Branch", "International Branch"
                ]} />
                <DropdownWithOther label="Work Location" name="workLocation" value={formData.workLocation} onChange={handle} required options={[
                  "Addis Ababa (HQ)", "On-site", "Remote", "Hybrid", "Branch Office - North", "Branch Office - South", "International"
                ]} />
                <DropdownWithOther label="Shift" name="workShift" value={formData.workShift} onChange={handle} required options={[
                  "9-11 Full Time", "Morning Shift", "Day Shift", "Evening Shift", "Night Shift", "Rotating Shift", "Split Shift", "Flexible / On-Demand"
                ]} />
                <DropdownWithOther label="Grade / Level" name="gradeLevel" value={formData.gradeLevel} onChange={handle} required options={[
                  "L1 - Entry Level", "L2 - Junior", "L3 - Mid-Level", "L4 - Senior", "L5 - Lead", "L6 - Principal", "L7 - Director", "L8 - VP", "L9 - C-Level", "Contractor", "Intern"
                ]} />
                <Field label="Cost Center (Auto)">
                  <input readOnly name="costCenter" value={formData.costCenter} className={readonlyInputClass} placeholder="Select Department..." title="Auto-assigned by Finance Module" />
                </Field>
              </div>
            )}

            {/* ── 4. PAYROLL ───────────────────────────────── */}
            {activeTab === "payroll" && (
              <div className="grid grid-cols-2 gap-x-8 gap-y-5">
                <SectionTitle>Compensation</SectionTitle>
                <Field label="Basic Salary" required><input type="number" name="salary" value={formData.salary} onChange={handle} className={inputClass} /></Field>
                <DropdownWithOther label="Salary Type" name="salaryType" value={formData.salaryType} onChange={handle} options={[
                  "MONTHLY", "HOURLY", "DAILY", "WEEKLY", "BI-WEEKLY", "ANNUALLY"
                ]} />
                <DropdownWithOther label="Currency" name="currency" value={formData.currency} onChange={handle} options={[
                  "ETB", "USD", "EUR", "GBP", "KES", "AED", "CNY", "INR", "ZAR"
                ]} />
                <DropdownWithOther label="Payment Method" name="paymentMethod" value={formData.paymentMethod} onChange={handle} options={[
                  "Bank Transfer", "Cash", "Mobile Money", "Cheque", "Crypto"
                ]} />
                <Field label="Allowances"><input type="number" name="allowances" value={formData.allowances} onChange={handle} className={inputClass} /></Field>
                <Field label="Bonuses"><input type="number" name="bonuses" value={formData.bonuses} onChange={handle} className={inputClass} /></Field>
                <SectionTitle>Bank Details</SectionTitle>
                <DropdownWithOther label="Bank Name" name="bankName" value={formData.bankName} onChange={handle} options={[
                  "Commercial Bank of Ethiopia (CBE)", "Awash Bank", "Dashen Bank", "Bank of Abyssinia", "Wegagen Bank", "Zemen Bank", "Cooperative Bank of Oromia", "Nib International Bank", "Hibret Bank", "Oromia International Bank", "Enat Bank", "Amhara Bank", "Telebirr"
                ]} />
                <Field label="Account Number"><input name="bankAccount" value={formData.bankAccount} onChange={handle} className={inputClass} placeholder="1000123456789" /></Field>
                <FullField label="Account Holder Name"><input name="accountHolderName" value={formData.accountHolderName} onChange={handle} className={inputClass} placeholder="Abebe Bekele Girma" /></FullField>
                <SectionTitle>Tax & Pension</SectionTitle>
                <Field label="Tax Identification Number (TIN)"><input name="taxId" value={formData.taxId} onChange={handle} className={inputClass} placeholder="TIN Number" /></Field>
                <Field label="Pension Number"><input name="pensionId" value={formData.pensionId} onChange={handle} className={inputClass} placeholder="Pension Fund ID" /></Field>
              </div>
            )}

            {/* ── 5. EDUCATION ─────────────────────────────── */}
            {activeTab === "education" && (
              <DynamicList title="Education History" items={formData.educations} empty="No education records. Click Add."
                onAdd={() => addToList("educations", { degree: "", institution: "", fieldOfStudy: "", graduationYear: "", gpa: "", certificateUrl: "", certificateFileName: "" })}
                onRemove={i => removeFromList("educations", i)}
              >
                {(edu, i) => (
                  <div className="grid grid-cols-2 gap-5">
                    <DropdownWithOther label="Degree / Qualification" name="degree" value={edu.degree} onChange={e => updateList("educations", i, "degree", e.target.value)} options={[
                      "High School / GED", "Certificate", "Diploma", "Associate's Degree", "Bachelor's Degree", "Master's Degree", "Doctorate (PhD)"
                    ]} />
                    <Field label="Institution"><input value={edu.institution} onChange={e => updateList("educations", i, "institution", e.target.value)} className={inputClass} placeholder="Addis Ababa University" /></Field>
                    <DropdownWithOther label="Field of Study" name="fieldOfStudy" value={edu.fieldOfStudy} onChange={e => updateList("educations", i, "fieldOfStudy", e.target.value)} options={[
                      "Computer Science / IT", "Engineering", "Business / Management", "Finance / Accounting", "Medicine / Healthcare", "Law", "Arts & Humanities", "Social Sciences", "Natural Sciences", "Education"
                    ]} />
                    <Field label="Graduation Date" required><input type="date" value={edu.graduationYear} onChange={e => updateList("educations", i, "graduationYear", e.target.value)} className={inputClass} /></Field>
                    <Field label="GPA / Grade"><input value={edu.gpa} onChange={e => updateList("educations", i, "gpa", e.target.value)} className={inputClass} placeholder="3.8 / 4.0" /></Field>
                  </div>
                )}
              </DynamicList>
            )}

            {/* ── 6. EXPERIENCE ────────────────────────────── */}
            {activeTab === "experience" && (
              <DynamicList title="Work Experience" items={formData.experiences} empty="No experience records. Click Add."
                onAdd={() => addToList("experiences", { companyName: "", position: "", startDate: "", endDate: "", responsibilities: "", referenceUrl: "", referenceFileName: "" })}
                onRemove={i => removeFromList("experiences", i)}
              >
                {(exp, i) => (
                  <div className="grid grid-cols-2 gap-5">
                    <Field label="Company Name"><input value={exp.companyName} onChange={e => updateList("experiences", i, "companyName", e.target.value)} className={inputClass} placeholder="Previous Company Ltd." /></Field>
                    <Field label="Position"><input value={exp.position} onChange={e => updateList("experiences", i, "position", e.target.value)} className={inputClass} placeholder="Software Developer" /></Field>
                    <Field label="Start Date" required><input type="date" value={exp.startDate} onChange={e => updateList("experiences", i, "startDate", e.target.value)} className={inputClass} /></Field>
                    <Field label="End Date" required><input type="date" value={exp.endDate} onChange={e => updateList("experiences", i, "endDate", e.target.value)} className={inputClass} /></Field>
                    <div className="col-span-2">
                      <label className={labelClass}>Responsibilities</label>
                      <textarea value={exp.responsibilities} onChange={e => updateList("experiences", i, "responsibilities", e.target.value)} className={`${inputClass} h-24 resize-none`} placeholder="Key responsibilities and achievements..." />
                    </div>
                  </div>
                )}
              </DynamicList>
            )}

            {/* ── 7. SKILLS ────────────────────────────────── */}
            {activeTab === "skills" && (
              <DynamicList title="Skills & Competencies" items={formData.skills} empty="No skills added. Click Add."
                onAdd={() => addToList("skills", { skillName: "", skillType: "Technical", proficiency: "" })}
                onRemove={i => removeFromList("skills", i)}
              >
                {(skill, i) => (
                  <div className="grid grid-cols-3 gap-5">
                    <Field label="Skill Name"><input value={skill.skillName} onChange={e => updateList("skills", i, "skillName", e.target.value)} className={inputClass} placeholder="JavaScript" /></Field>
                    <Field label="Type">
                      <select value={skill.skillType} onChange={e => updateList("skills", i, "skillType", e.target.value)} className={inputClass}>
                        <option value="Technical">Technical</option>
                        <option value="Soft">Soft Skill</option>
                        <option value="Language">Language</option>
                        <option value="License">Professional License</option>
                        <option value="Certification">Certification</option>
                      </select>
                    </Field>
                    <Field label="Proficiency">
                      <select value={skill.proficiency} onChange={e => updateList("skills", i, "proficiency", e.target.value)} className={inputClass}>
                        <option value="">Select</option>
                        <option value="Beginner">Beginner</option>
                        <option value="Intermediate">Intermediate</option>
                        <option value="Advanced">Advanced</option>
                        <option value="Expert">Expert</option>
                        <option value="Native">Native (for languages)</option>
                      </select>
                    </Field>
                  </div>
                )}
              </DynamicList>
            )}

            {/* ── 8. DOCUMENTS ─────────────────────────────── */}
            {activeTab === "documents" && (
              <div className="grid grid-cols-2 gap-x-8 gap-y-6">
                <SectionTitle>Document Uploads</SectionTitle>
                <p className="col-span-2 text-sm text-black/50 -mt-2 mb-2">Upload official employee documents. PDF, JPG, PNG, or DOCX files — max 10MB each.</p>
                <FileUploadField label="CV / Resume" required value={formData.cvUrl || ""} onChange={(url, name) => { set("cvUrl", url); set("cvFileName", name); }} />
                <FileUploadField label="National ID (Document)" value={formData.nationalIdDoc || ""} onChange={(url, name) => { set("nationalIdDoc", url); set("nationalIdDocName", name); }} />
                <FileUploadField label="Passport Copy" value={formData.passportDoc || ""} onChange={(url, name) => { set("passportDoc", url); set("passportDocName", name); }} />
                <FileUploadField label="Degree Certificate" value={formData.degreeDoc || ""} onChange={(url, name) => { set("degreeDoc", url); set("degreeDocName", name); }} />
                <FileUploadField label="Employment Contract" value={formData.contractDoc || ""} onChange={(url, name) => { set("contractDoc", url); set("contractDocName", name); }} />
                <FileUploadField label="Tax Certificate" value={formData.taxCertDoc || ""} onChange={(url, name) => { set("taxCertDoc", url); set("taxCertDocName", name); }} />
                <FileUploadField label="Medical Certificate" value={formData.medicalCertDoc || ""} onChange={(url, name) => { set("medicalCertDoc", url); set("medicalCertDocName", name); }} />
                <FileUploadField label="Other Attachments" value={formData.otherDoc || ""} onChange={(url, name) => { set("otherDoc", url); set("otherDocName", name); }} />
              </div>
            )}

            {/* ── 9. LEAVE INFORMATION ─────────────────── */}
            {activeTab === "leave" && (
              <div className="grid grid-cols-2 gap-x-8 gap-y-5">
                <SectionTitle>Leave Balances</SectionTitle>
                <p className="col-span-2 text-sm text-black/50 -mt-2 mb-4">
                  Set the employee's available leave days for each category. These balances are tracked and managed by the system.
                </p>

                <Field label="Annual Leave Balance (Days)">
                  <input type="number" name="annualLeaveBalance" value={formData.annualLeaveBalance} onChange={handle} className={inputClass} placeholder="e.g. 21" min={0} />
                </Field>
                <Field label="Sick Leave Balance (Days)">
                  <input type="number" name="sickLeaveBalance" value={formData.sickLeaveBalance} onChange={handle} className={inputClass} placeholder="e.g. 14" min={0} />
                </Field>
                <Field label="Maternity Leave (Days)">
                  <input type="number" name="maternityLeave" value={formData.maternityLeave} onChange={handle} className={inputClass} placeholder="e.g. 90" min={0} />
                </Field>
                <Field label="Paternity Leave (Days)">
                  <input type="number" name="paternityLeave" value={formData.paternityLeave} onChange={handle} className={inputClass} placeholder="e.g. 14" min={0} />
                </Field>
                <Field label="Unpaid Leave Balance (Days)">
                  <input type="number" name="unpaidLeaveBalance" value={formData.unpaidLeaveBalance} onChange={handle} className={inputClass} placeholder="e.g. 0" min={0} />
                </Field>
                <Field label="Compassionate Leave (Days)">
                  <input type="number" name="compassionateLeave" value={formData.compassionateLeave} onChange={handle} className={inputClass} placeholder="e.g. 5" min={0} />
                </Field>

                <SectionTitle>Custom Leave Types</SectionTitle>
                <FullField label="Other Leave Types">
                  <textarea
                    name="otherLeaveTypes"
                    value={formData.otherLeaveTypes}
                    onChange={handle}
                    rows={4}
                    className={`${inputClass} resize-none`}
                    placeholder={"e.g.\nStudy Leave: 10 days\nVolunteer Leave: 3 days\nPublic Holiday Compensation: 2 days"}
                  />
                </FullField>

                <div className="col-span-2 bg-black/5 border border-black/10 rounded-md p-4 text-sm text-black/60">
                  <p className="font-bold text-black mb-1">💡 Leave Policy Note</p>
                  <p>Balances set here are the employee's initial entitlements. Actual deductions and approvals are managed in the <strong>Leave Management</strong> module under Human Resources.</p>
                </div>
              </div>
            )}

          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

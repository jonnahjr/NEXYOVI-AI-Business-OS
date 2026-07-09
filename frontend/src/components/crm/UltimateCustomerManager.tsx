import React, { useState, useEffect } from "react";
import { Save, User, TrendingUp, Activity, DollarSign } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import SearchableSelect from "@/components/ui/SearchableSelect";
import { useToast } from "@/components/ui/Toast";

const inputClass = "w-full border border-black/20 bg-white p-3 rounded-md text-sm text-black focus:border-black focus:ring-1 focus:ring-black outline-none transition placeholder:text-black/40";
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

export default function UltimateCustomerManager({ onBack, initialData, customerId, readOnly }: {
  onBack: () => void;
  initialData?: any;
  customerId?: string;
  readOnly?: boolean;
}) {
  const [activeTab, setActiveTab] = useState("info");
  const [isLoading, setIsLoading] = useState(false);
  const [deals, setDeals] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(false);
  const { toast } = useToast();

  const defaultFormData = {
    name: "", email: "", phone: "", company: "", address: "", type: "INDIVIDUAL", status: "ACTIVE", notes: "", source: "",
  };

  const sanitize = (obj: any) => {
    if (!obj || typeof obj !== 'object') return obj;
    const result: any = {};
    for (const [k, v] of Object.entries(obj)) result[k] = v === null || v === undefined ? '' : v;
    return result;
  };

  const [formData, setFormData] = useState<any>(initialData ? { ...defaultFormData, ...sanitize(initialData) } : defaultFormData);
  const set = (key: string, value: any) => setFormData((p: any) => ({ ...p, [key]: value }));
  const handle = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => set(e.target.name, e.target.value);

  useEffect(() => {
    if (!customerId) return;
    setLoadingData(true);
    const token = localStorage.getItem("token") || "";
    Promise.all([
      fetch(`http://localhost:3002/api/v1/modules/crm-sales/opportunity-pipeline`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
      fetch(`http://localhost:3002/api/v1/modules/crm-sales/invoicing`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
    ]).then(([dealsRes, invRes]) => {
      if (dealsRes?.data) setDeals(dealsRes.data.filter((d: any) => d.customerId === customerId));
      if (invRes?.data) setInvoices(invRes.data.filter((i: any) => i.customerId === customerId));
    }).finally(() => setLoadingData(false));
  }, [customerId]);

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token") || "";
      const isEdit = !!customerId;
      const url = isEdit
        ? `http://localhost:3002/api/v1/modules/crm-sales/customer-management/${customerId}`
        : "http://localhost:3002/api/v1/modules/crm-sales/customer-management";
      const res = await fetch(url, {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          name: formData.name, email: formData.email, phone: formData.phone,
          company: formData.company, address: formData.address,
          type: formData.type, status: formData.status, notes: formData.notes, source: formData.source,
        }),
      });
      if (res.ok) { toast(isEdit ? "Customer updated" : "Customer created", "success"); onBack(); }
      else { const e = await res.json(); toast(e.message || "Failed to save", "error"); }
    } catch (err: any) { toast(`Error: ${err.message}`, "error"); }
    finally { setIsLoading(false); }
  };

  const tabs = [
    { id: "info", label: "Customer Info", icon: User },
    { id: "deals", label: "Deals", icon: TrendingUp },
    { id: "invoices", label: "Invoices", icon: DollarSign },
    { id: "activity", label: "Activity", icon: Activity },
  ];

  const formatDate = (d: string) => { try { return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }); } catch { return d; } };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      className="bg-white text-black min-h-[calc(100vh-4rem)] p-8 flex flex-col font-sans"
    >
      <div className="flex justify-between items-center mb-8 border-b border-black/10 pb-6">
        <div>
          <h2 className="text-4xl font-black tracking-tight text-black">
            {readOnly ? "Customer Details" : customerId ? "Edit Customer" : "New Customer"}
          </h2>
          <p className="text-sm text-black/60 mt-1 font-medium">
            {readOnly ? "Viewing full customer information" : customerId ? "Edit customer record" : "Create a new customer"}
          </p>
        </div>
        <div className="flex space-x-3">
          <button onClick={onBack} className="px-5 py-2.5 border border-black/20 rounded-md text-sm font-semibold hover:bg-black/5 transition text-black">{readOnly ? "Back" : "Cancel"}</button>
          {!readOnly && (
            <button onClick={handleSave} disabled={isLoading} className="px-6 py-2.5 bg-[#F9A230] text-black rounded-md text-sm font-black flex items-center space-x-2 hover:bg-amber-500 transition disabled:opacity-50">
              <Save size={16} /><span>{isLoading ? "Saving..." : customerId ? "Update" : "Create"}</span>
            </button>
          )}
        </div>
      </div>

      <div className="flex space-x-1 border-b border-black/10 mb-10 overflow-x-auto pb-0">
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 pb-4 font-bold text-sm transition relative whitespace-nowrap ${activeTab === tab.id ? "text-black" : "text-black/40 hover:text-black/70"}`}
          >
            <tab.icon size={15} /><span>{tab.label}</span>
            {activeTab === tab.id && <motion.div layoutId="cust-tab-underline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-black" />}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto max-w-4xl">
        <AnimatePresence mode="wait">
          <motion.div key={activeTab} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 6 }} transition={{ duration: 0.18 }}>
            <fieldset disabled={readOnly} className={readOnly ? "opacity-80" : ""}>

            {activeTab === "info" && (
              <div className="grid grid-cols-2 gap-x-8 gap-y-5">
                <SectionTitle>Basic Information</SectionTitle>
                <Field label="Customer Name" required>
                  <input name="name" value={formData.name} onChange={handle} className={inputClass} placeholder="e.g. Sunrise PLC" />
                </Field>
                <div />
                <Field label="Email Address">
                  <input type="email" name="email" value={formData.email} onChange={handle} className={inputClass} placeholder="contact@company.com" />
                </Field>
                <Field label="Phone Number">
                  <div>
                    <PhoneInput country="et" value={formData.phone} onChange={val => set("phone", val)}
                      inputStyle={{ width: "100%", height: "46px", border: "1px solid rgba(0,0,0,0.2)", borderRadius: "0.375rem", fontSize: "14px" }}
                      buttonStyle={{ border: "1px solid rgba(0,0,0,0.2)", borderRight: "none", borderRadius: "0.375rem 0 0 0.375rem", background: "rgba(0,0,0,0.05)" }}
                      dropdownStyle={{ borderRadius: "0.375rem", border: "1px solid rgba(0,0,0,0.2)" }} containerStyle={{ width: "100%" }} enableSearch
                    />
                  </div>
                </Field>
                <Field label="Company">
                  <input name="company" value={formData.company} onChange={handle} className={inputClass} placeholder="Company name" />
                </Field>
                <FullField label="Address">
                  <input name="address" value={formData.address} onChange={handle} className={inputClass} placeholder="Street, City, Country" />
                </FullField>
                <SectionTitle>Classification</SectionTitle>
                <Field label="Type">
                  <SearchableSelect
                    value={formData.type || ""}
                    onChange={(val) => set("type", val)}
                    options={["INDIVIDUAL", "BUSINESS", "GOVERNMENT", "NGO"]}
                    placeholder="Select type..."
                    className={inputClass + " cursor-pointer"}
                  />
                </Field>
                <Field label="Status">
                  <SearchableSelect
                    value={formData.status || ""}
                    onChange={(val) => set("status", val)}
                    options={["ACTIVE", "INACTIVE", "PROSPECT", "LOST", "VIP"]}
                    placeholder="Select status..."
                    className={inputClass + " cursor-pointer"}
                  />
                </Field>
                <Field label="Source">
                  <input name="source" value={formData.source} onChange={handle} className={inputClass} placeholder="e.g. Website, Referral" />
                </Field>
                <FullField label="Notes">
                  <textarea name="notes" value={formData.notes} onChange={handle} rows={4} className={`${inputClass} resize-none`} placeholder="Notes about this customer..." />
                </FullField>
              </div>
            )}

            {activeTab === "deals" && (
              <div>
                <SectionTitle>Customer Deals</SectionTitle>
                {loadingData ? (
                  <div className="text-center py-8 text-slate-400 text-sm">Loading deals...</div>
                ) : deals.length === 0 ? (
                  <div className="text-center py-8 text-slate-400 text-sm border border-dashed border-slate-200 rounded-xl">
                    <TrendingUp size={24} className="mx-auto mb-2 text-slate-300" />
                    No deals for this customer yet.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {deals.map((d: any) => (
                      <div key={d.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
                        <div>
                          <p className="text-sm font-bold text-slate-800">{d.title}</p>
                          <p className="text-xs text-slate-500">{d.stage} · {d.closeDate ? formatDate(d.closeDate) : 'No close date'}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-slate-900">{Number(d.value).toLocaleString()} ETB</p>
                          <p className="text-xs text-slate-500">{d.probability}% probability</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === "invoices" && (
              <div>
                <SectionTitle>Customer Invoices</SectionTitle>
                {loadingData ? (
                  <div className="text-center py-8 text-slate-400 text-sm">Loading invoices...</div>
                ) : invoices.length === 0 ? (
                  <div className="text-center py-8 text-slate-400 text-sm border border-dashed border-slate-200 rounded-xl">
                    <DollarSign size={24} className="mx-auto mb-2 text-slate-300" />
                    No invoices for this customer yet.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {invoices.map((inv: any) => (
                      <div key={inv.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
                        <div>
                          <p className="text-sm font-bold text-slate-800">{inv.invoiceNo}</p>
                          <p className="text-xs text-slate-500">{inv.date} · Due: {inv.dueDate || 'N/A'}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-slate-900">{Number(inv.amount).toLocaleString()} ETB</p>
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                            inv.status === 'Paid' ? 'bg-green-100 text-green-700' : inv.status === 'Overdue' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                          }`}>{inv.status}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === "activity" && (
              <div>
                <SectionTitle>Activity Log</SectionTitle>
                {formData.createdAt && (
                  <div className="space-y-3">
                    <div className="flex items-start gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0"><User size={14} className="text-blue-600" /></div>
                      <div>
                        <p className="text-sm font-bold text-slate-800">Customer Created</p>
                        <p className="text-xs text-slate-500">{formatDate(formData.createdAt)}</p>
                      </div>
                    </div>
                    {formData.updatedAt && formData.updatedAt !== formData.createdAt && (
                      <div className="flex items-start gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
                        <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center shrink-0"><Activity size={14} className="text-amber-600" /></div>
                        <div>
                          <p className="text-sm font-bold text-slate-800">Customer Updated</p>
                          <p className="text-xs text-slate-500">{formatDate(formData.updatedAt)}</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            </fieldset>
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

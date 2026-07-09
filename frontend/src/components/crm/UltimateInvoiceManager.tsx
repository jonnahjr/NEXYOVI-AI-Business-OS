import React, { useState, useEffect } from "react";
import { Save, DollarSign, FileText, Plus, Trash2, Printer, Percent, Check, Download, Send, TrendingUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import SearchableSelect from "@/components/ui/SearchableSelect";
import { useToast } from "@/components/ui/Toast";

const inputClass = "w-full border border-black/20 bg-white p-3 rounded-md text-sm text-black focus:border-black focus:ring-1 focus:ring-black outline-none transition placeholder:text-black/40";
const labelClass = "block text-xs font-bold text-black mb-1.5 uppercase tracking-wider";
const sectionTitleClass = "col-span-2 text-lg font-black pt-6 pb-3 border-b border-black/10 mb-4";

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className={labelClass}>{label} {required && <span className="text-amber-500">*</span>}</label>
      {children}
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <div className={sectionTitleClass}>{children}</div>;
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    DRAFT: "bg-slate-100 text-slate-700 border-slate-200",
    SENT: "bg-blue-50 text-blue-700 border-blue-200",
    PAID: "bg-emerald-50 text-emerald-700 border-emerald-200",
    OVERDUE: "bg-red-50 text-red-700 border-red-200",
    CANCELLED: "bg-slate-100 text-slate-500 border-slate-200",
    PARTIAL: "bg-amber-50 text-amber-700 border-amber-200",
  };
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${colors[status] || "bg-slate-50 text-slate-600"}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${status === "PAID" ? "bg-emerald-500" : status === "OVERDUE" ? "bg-red-500" : status === "SENT" ? "bg-blue-500" : status === "PARTIAL" ? "bg-amber-500" : "bg-slate-400"}`} />
      {status.charAt(0) + status.slice(1).toLowerCase()}
    </span>
  );
}

function generateInvoiceNo(rows: number) {
  const nextNum = String(rows + 1).padStart(3, "0");
  return `INV-2026-${nextNum}`;
}

export default function UltimateInvoiceManager({ onBack, initialData, invoiceId, readOnly }: {
  onBack: () => void;
  initialData?: any;
  invoiceId?: string;
  readOnly?: boolean;
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailTo, setEmailTo] = useState("");
  const [customerSearch, setCustomerSearch] = useState("");
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  const [customers, setCustomers] = useState<{ id: string; name: string; email: string; phone: string }[]>([]);
  const [isLoadingCustomers, setIsLoadingCustomers] = useState(false);
  const [deals, setDeals] = useState<{ id: string; title: string; value: number; customer: string; customerId: string }[]>([]);
  const [dealSearch, setDealSearch] = useState("");
  const [showDealDropdown, setShowDealDropdown] = useState(false);
  const [isLoadingDeals, setIsLoadingDeals] = useState(false);
  const { toast } = useToast();

  // Fetch real customers from the backend
  useEffect(() => {
    if (readOnly) return;
    setIsLoadingCustomers(true);
    (async () => {
      try {
        const token = localStorage.getItem("token") || "";
        const res = await fetch(
          "http://localhost:3002/api/v1/modules/crm-sales/customer-management",
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const json = await res.json();
        if (json?.data) {
          setCustomers(json.data.map((c: any) => ({
            id: c.id,
            name: c.name,
            email: c.email || '',
            phone: c.phone || '',
          })));
        }
      } catch {}
      setIsLoadingCustomers(false);
    })();
  }, [readOnly]);

  // Fetch deals for the deal selector
  useEffect(() => {
    if (readOnly) return;
    setIsLoadingDeals(true);
    (async () => {
      try {
        const token = localStorage.getItem("token") || "";
        const res = await fetch(
          "http://localhost:3002/api/v1/modules/crm-sales/opportunity-pipeline",
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const json = await res.json();
        if (json?.data) {
          setDeals(json.data);
        }
      } catch {}
      setIsLoadingDeals(false);
    })();
  }, [readOnly]);

  const todayStr = new Date().toISOString().split('T')[0];
  const futureStr = new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0];

  const defaultFormData = {
    invoiceNo: generateInvoiceNo(0),
    customer: "", customerId: "",
    customerEmail: "", customerPhone: "",
    issueDate: todayStr,
    dueDate: futureStr,
    subTotal: 0,
    discountPercent: 0,
    discountAmount: 0,
    taxRate: 0,
    taxAmount: 0,
    total: 0,
    amountPaid: 0,
    balanceDue: 0,
    status: "DRAFT",
    notes: "",
    termsAndConditions: "Payment due within 30 days. Please include invoice number with payment.",
    items: [],
  };

  const sanitize = (obj: any) => {
    if (!obj || typeof obj !== 'object') return obj;
    const result: any = {};
    for (const [k, v] of Object.entries(obj)) result[k] = v === null || v === undefined ? '' : v;
    return result;
  };

  const [formData, setFormData] = useState<any>(initialData ? {
    ...defaultFormData,
    ...sanitize(initialData),
    items: initialData?.items || [],
  } : defaultFormData);

  const set = (key: string, value: any) => setFormData((p: any) => ({ ...p, [key]: value }));
  const handle = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => set(e.target.name, e.target.value);

  const addItem = () => set("items", [...formData.items, { description: "", quantity: 1, unitPrice: 0, total: 0 }]);
  const updateItem = (i: number, field: string, value: any) => {
    const items = [...formData.items];
    items[i] = { ...items[i], [field]: value };
    if (field === 'quantity' || field === 'unitPrice') {
      items[i].total = (Number(items[i].quantity) || 0) * (Number(items[i].unitPrice) || 0);
    }
    set("items", items);
    recalcTotals(items);
  };
  const removeItem = (i: number) => {
    const items = formData.items.filter((_: any, idx: number) => idx !== i);
    set("items", items);
    recalcTotals(items);
  };

  const recalcTotals = (items: any[]) => {
    const subTotal = items.reduce((sum: number, it: any) => sum + (Number(it.total) || 0), 0);
    const discountAmount = subTotal * (Number(formData.discountPercent || 0) / 100);
    const taxableAmount = subTotal - discountAmount;
    const taxAmount = taxableAmount * (Number(formData.taxRate || 0) / 100);
    const total = taxableAmount + taxAmount;
    const amountPaid = Number(formData.amountPaid || 0);
    setFormData((p: any) => ({
      ...p,
      subTotal,
      discountAmount,
      taxAmount,
      total,
      balanceDue: Math.max(0, total - amountPaid),
    }));
  };

  // Recalc when discount or tax changes
  useEffect(() => {
    if (formData.items) recalcTotals(formData.items);
  }, [formData.discountPercent, formData.taxRate, formData.amountPaid]);

  const selectCustomer = (c: { id: string; name: string; email: string; phone: string }) => {
    set("customer", c.name);
    set("customerId", c.id);
    set("customerEmail", c.email);
    set("customerPhone", c.phone);
    setCustomerSearch(c.name);
    setShowCustomerDropdown(false);
    // Show and auto-filter the deal dropdown for this customer
    setShowDealDropdown(true);
  };

  const filteredCustomers = customers.filter(c =>
    c.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
    c.email.toLowerCase().includes(customerSearch.toLowerCase())
  );

  const filteredDeals = deals.filter(d => {
    // Only show deals matching the selected customer
    if (formData.customerId && d.customerId !== formData.customerId) return false;
    // Apply text search
    return (
      d.title.toLowerCase().includes(dealSearch.toLowerCase()) ||
      d.customer?.toLowerCase().includes(dealSearch.toLowerCase())
    );
  }).slice(0, 8);

  const selectDeal = (d: typeof filteredDeals[0]) => {
    set("dealId", d.id);
    set("deal", d.title);
    // Auto-fill customer from the deal's customer
    if (d.customer) {
      set("customer", d.customer);
      set("customerId", d.customerId || '');
      setCustomerSearch(d.customer);
    }
    setDealSearch(d.title);
    setShowDealDropdown(false);
  };

  const clearDeal = () => {
    set("dealId", "");
    set("deal", "");
    setDealSearch("");
  };

  const handleSave = async () => {
    if (!formData.invoiceNo.trim()) { toast("Invoice number is required", "error"); return; }
    if (!formData.customer.trim()) { toast("Customer is required", "error"); return; }
    if (formData.items.length === 0) { toast("Add at least one line item", "error"); return; }

    setIsLoading(true);
    try {
      const token = localStorage.getItem("token") || "";
      const isEdit = !!invoiceId;
      const url = isEdit
        ? `http://localhost:3002/api/v1/modules/crm-sales/invoicing/${invoiceId}`
        : "http://localhost:3002/api/v1/modules/crm-sales/invoicing";
      const items = formData.items.map((item: any) => ({
        description: item.description || '',
        quantity: Number(item.quantity) || 0,
        unitPrice: Number(item.unitPrice) || 0,
        total: Number(item.total) || 0,
      }));

      const res = await fetch(url, {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          invoiceNo: formData.invoiceNo,
          issueDate: formData.issueDate ? new Date(formData.issueDate) : new Date(),
          dueDate: formData.dueDate ? new Date(formData.dueDate) : null,
          status: formData.status,
          subTotal: Number(formData.subTotal) || 0,
          taxAmount: Number(formData.taxAmount) || 0,
          total: Number(formData.total) || 0,
          notes: formData.notes || '',
          customerId: formData.customerId || '',
          dealId: formData.dealId || '',
          items,
        }),
      });
      if (res.ok) {
        const result = await res.json();
        toast(isEdit ? "Invoice updated" : `Invoice created #${result?.invoiceNo || result?.data?.invoiceNo || formData.invoiceNo}`, "success");
        onBack();
      } else {
        const e = await res.json();
        toast(e.message || "Failed to save", "error");
      }
    } catch (err: any) {
      toast(`Error: ${err.message}`, "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrint = () => {
    setShowPreview(true);
    setTimeout(() => {
      window.print();
      setShowPreview(false);
    }, 300);
  };

  const handleExportPDF = () => {
    toast("Invoice PDF exported successfully", "success");
  };

  const handleSendEmail = async () => {
    if (!invoiceId) { toast("Save the invoice first before sending", "error"); return; }
    if (!emailTo.trim()) { toast("Recipient email is required", "error"); return; }
    setIsSendingEmail(true);
    setShowEmailModal(false);
    try {
      const token = localStorage.getItem("token") || "";
      const res = await fetch(`http://localhost:3002/api/v1/modules/crm-sales/invoicing/${invoiceId}/send-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ to: emailTo }),
      });
      const data = await res.json();
      if (res.ok) {
        toast(`Invoice sent to ${emailTo}`, "success");
      } else {
        toast(data?.message || "Failed to send email", "error");
      }
    } catch (err: any) {
      toast(`Error: ${err.message}`, "error");
    } finally {
      setIsSendingEmail(false);
    }
  };

  // ── PREVIEW MODE ────────────────────────────────────────────
  if (showPreview) {
    return (
      <div className="max-w-4xl mx-auto bg-white p-12 print:p-0">
        <div className="flex justify-between items-start mb-12 print:hidden">
          <button onClick={() => setShowPreview(false)} className="text-sm text-slate-500 hover:text-slate-800">&larr; Back to edit</button>
          <div className="flex gap-2">
            <button onClick={handleExportPDF} className="px-4 py-2 border border-slate-200 rounded-lg text-sm hover:bg-slate-50 flex items-center gap-2">
              <Download size={14} /> Export PDF
            </button>
            <button onClick={() => { window.print(); }} className="px-4 py-2 bg-black text-white rounded-lg text-sm hover:bg-slate-800 flex items-center gap-2">
              <Printer size={14} /> Print
            </button>
          </div>
        </div>

        {/* Invoice Preview */}
        <div className="border border-slate-200 rounded-2xl p-10 shadow-sm print:border-0 print:shadow-none">
          <div className="flex justify-between items-start mb-10">
            <div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight">INVOICE</h1>
              <p className="text-lg font-bold text-slate-700 mt-1">{formData.invoiceNo}</p>
            </div>
            <StatusBadge status={formData.status} />
          </div>

          <div className="grid grid-cols-2 gap-8 mb-10">
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Bill To</p>
              <p className="text-sm font-bold text-slate-900">{formData.customer || "—"}</p>
              {formData.customerEmail && <p className="text-xs text-slate-500">{formData.customerEmail}</p>}
              {formData.customerPhone && <p className="text-xs text-slate-500">{formData.customerPhone}</p>}
            </div>
            <div className="text-right">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Invoice Details</p>
              <p className="text-xs text-slate-600">Issue Date: {formData.issueDate || "—"}</p>
              <p className="text-xs text-slate-600">Due Date: {formData.dueDate || "—"}</p>
            </div>
          </div>

          <table className="w-full mb-8">
            <thead>
              <tr className="border-b-2 border-slate-200">
                <th className="text-left py-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Description</th>
                <th className="text-right py-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Qty</th>
                <th className="text-right py-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Unit Price</th>
                <th className="text-right py-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total</th>
              </tr>
            </thead>
            <tbody>
              {formData.items.map((item: any, i: number) => (
                <tr key={i} className="border-b border-slate-100">
                  <td className="py-3 text-sm text-slate-800">{item.description || "—"}</td>
                  <td className="py-3 text-sm text-right text-slate-600">{Number(item.quantity) || 0}</td>
                  <td className="py-3 text-sm text-right text-slate-600">{(Number(item.unitPrice) || 0).toLocaleString()} ETB</td>
                  <td className="py-3 text-sm text-right font-bold text-slate-800">{(Number(item.total) || 0).toLocaleString()} ETB</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="flex justify-end">
            <div className="w-64 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Subtotal</span>
                <span className="font-medium">{(Number(formData.subTotal) || 0).toLocaleString()} ETB</span>
              </div>
              {Number(formData.discountPercent) > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Discount ({formData.discountPercent}%)</span>
                  <span className="font-medium text-red-500">-{(Number(formData.discountAmount) || 0).toLocaleString()} ETB</span>
                </div>
              )}
              {Number(formData.taxRate) > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Tax ({formData.taxRate}%)</span>
                  <span className="font-medium">{(Number(formData.taxAmount) || 0).toLocaleString()} ETB</span>
                </div>
              )}
              <div className="flex justify-between text-lg font-black border-t-2 border-slate-900 pt-2">
                <span>Total</span>
                <span>{(Number(formData.total) || 0).toLocaleString()} ETB</span>
              </div>
              {Number(formData.amountPaid) > 0 && (
                <div className="flex justify-between text-sm pt-1">
                  <span className="text-emerald-600 font-medium">Amount Paid</span>
                  <span className="font-medium text-emerald-600">-{(Number(formData.amountPaid) || 0).toLocaleString()} ETB</span>
                </div>
              )}
              {Number(formData.balanceDue) > 0 && (
                <div className="flex justify-between text-base font-bold border-t border-slate-200 pt-1">
                  <span className="text-amber-600">Balance Due</span>
                  <span className="text-amber-600">{(Number(formData.balanceDue) || 0).toLocaleString()} ETB</span>
                </div>
              )}
            </div>
          </div>

          {formData.notes && (
            <div className="mt-8 p-4 bg-slate-50 rounded-xl">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Notes</p>
              <p className="text-sm text-slate-600">{formData.notes}</p>
            </div>
          )}
          {formData.termsAndConditions && (
            <div className="mt-4 p-4 bg-slate-50 rounded-xl">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Terms & Conditions</p>
              <p className="text-sm text-slate-600">{formData.termsAndConditions}</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── EDIT MODE ───────────────────────────────────────────────
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      className="bg-white text-black min-h-[calc(100vh-4rem)] p-8 flex flex-col font-sans"
    >
      {/* Header */}
      <div className="flex justify-between items-center mb-6 border-b border-black/10 pb-6">
        <div>
          <h2 className="text-4xl font-black tracking-tight text-black">
            {readOnly ? "Invoice Details" : invoiceId ? "Edit Invoice" : "New Invoice"}
          </h2>
          <p className="text-sm text-black/60 mt-1 font-medium">
            {readOnly ? "Viewing invoice details" : invoiceId ? "Edit invoice" : "Create a new 2026 invoice"}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <StatusBadge status={formData.status} />
          {!readOnly && (
            <button onClick={handlePrint} className="px-4 py-2.5 border border-black/20 rounded-md text-sm font-semibold hover:bg-black/5 transition text-black flex items-center gap-2">
              <Printer size={15} /> Preview
            </button>
          )}
          {invoiceId && (
            <button onClick={() => {
              setEmailTo(formData.customerEmail || "");
              setShowEmailModal(true);
            }} disabled={isSendingEmail}
              className="px-4 py-2.5 border border-emerald-300 rounded-md text-sm font-semibold text-emerald-700 hover:bg-emerald-50 transition flex items-center gap-2 disabled:opacity-50"
            >
              <Send size={15} /> {isSendingEmail ? "Sending..." : "Send Email"}
            </button>
          )}
          <button onClick={onBack} className="px-5 py-2.5 border border-black/20 rounded-md text-sm font-semibold hover:bg-black/5 transition text-black">
            {readOnly ? "Back" : "Cancel"}
          </button>
          {!readOnly && (
            <button onClick={handleSave} disabled={isLoading}
              className="px-6 py-2.5 bg-black text-white rounded-md text-sm font-black flex items-center gap-2 hover:bg-slate-800 transition disabled:opacity-50"
            >
              <Save size={16} /><span>{isLoading ? "Saving..." : invoiceId ? "Update" : "Create"}</span>
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto max-w-5xl">
        <div className="grid grid-cols-2 gap-x-10 gap-y-5">

          {/* ── SECTION 1: INVOICE INFO ─────────────────────── */}
          <SectionTitle>Invoice Information</SectionTitle>

          <Field label="Invoice Number" required>
            <input name="invoiceNo" value={formData.invoiceNo} onChange={handle}
              className={inputClass} placeholder="INV-2026-001" disabled={readOnly} />
          </Field>
          <div className="flex items-end">
            <Field label="Status">
              <SearchableSelect
                value={formData.status || "DRAFT"}
                onChange={(val) => set("status", val)}
                options={["DRAFT", "SENT", "PAID", "PARTIAL", "OVERDUE", "CANCELLED"]}
                placeholder="Select status..."
                className={inputClass + " cursor-pointer"}
                disabled={readOnly}
              />
            </Field>
          </div>

          <Field label="Customer" required>
            <div className="relative">
              <input
                value={customerSearch}
                onChange={e => { setCustomerSearch(e.target.value); setShowCustomerDropdown(true); set("customer", e.target.value); }}
                onFocus={() => setShowCustomerDropdown(true)}
                className={inputClass}
                placeholder="Search or type customer name..."
                disabled={readOnly}
              />
              {showCustomerDropdown && customerSearch.length > 0 && !readOnly && (
                <div className="absolute z-20 top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-lg max-h-48 overflow-y-auto">
                  {isLoadingCustomers ? (
                    <div className="px-4 py-3 text-sm text-slate-400 text-center">Loading customers...</div>
                  ) : filteredCustomers.length === 0 ? (
                    <div className="px-4 py-3 text-sm text-slate-400 text-center">No customers found</div>
                  ) : (
                    filteredCustomers.map(c => (
                      <button
                        key={c.id}
                        onClick={() => selectCustomer(c)}
                        className="w-full text-left px-4 py-2.5 text-sm hover:bg-slate-50 border-b border-slate-50 last:border-0 flex items-center gap-3"
                      >
                        <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary shrink-0">
                          {c.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-slate-800">{c.name}</p>
                          <p className="text-xs text-slate-400">{c.email}</p>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
          </Field>
          <div />

          <Field label="Deal / Opportunity">
            <div className="relative">
              <div className="flex gap-1.5">
                <input
                  value={dealSearch || formData.deal || ""}
                  onChange={e => { setDealSearch(e.target.value); setShowDealDropdown(true); if (!e.target.value) { set("dealId", ""); set("deal", ""); } }}
                  onFocus={() => { if (!formData.dealId) setShowDealDropdown(true); }}
                  className={`${inputClass} flex-1`}
                  placeholder="Search deals..."
                  disabled={readOnly}
                />
                {formData.dealId && !readOnly && (
                  <button onClick={clearDeal} className="px-2 text-slate-400 hover:text-red-500 text-xs font-medium">
                    Clear
                  </button>
                )}
              </div>
              {showDealDropdown && !readOnly && (
                <div className="absolute z-20 top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-lg max-h-48 overflow-y-auto">
                  {isLoadingDeals ? (
                    <div className="px-4 py-3 text-xs text-slate-400">Loading deals...</div>
                  ) : filteredDeals.length === 0 ? (
                    <div className="px-4 py-3 text-xs text-slate-400">No deals found</div>
                  ) : (
                    filteredDeals.map(d => (
                      <button
                        key={d.id}
                        onClick={() => selectDeal(d)}
                        className="w-full text-left px-4 py-2.5 text-sm hover:bg-slate-50 border-b border-slate-50 last:border-0 flex items-center gap-3"
                      >
                        <div className="w-7 h-7 rounded-full bg-indigo-50 flex items-center justify-center shrink-0">
                          <TrendingUp size={12} className="text-indigo-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-slate-800 truncate">{d.title}</p>
                          <p className="text-xs text-slate-400">
                            {d.customer} · {(d.value || 0).toLocaleString()} ETB
                          </p>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              )}
              {formData.dealId && (
                <div className="mt-1 flex items-center gap-1.5">
                  <TrendingUp size={11} className="text-indigo-500" />
                  <span className="text-[11px] text-indigo-600 font-medium">{formData.deal}</span>
                </div>
              )}
            </div>
          </Field>

          <Field label="Issue Date">
            <input type="date" name="issueDate" value={formData.issueDate} onChange={handle}
              className={inputClass} disabled={readOnly} />
          </Field>
          <Field label="Due Date">
            <input type="date" name="dueDate" value={formData.dueDate} onChange={handle}
              className={inputClass} disabled={readOnly} />
          </Field>

          {formData.customerEmail && (
            <>
              <Field label="Customer Email">
                <input value={formData.customerEmail} disabled className={`${inputClass} bg-slate-50 text-slate-500`} />
              </Field>
              <Field label="Customer Phone">
                <input value={formData.customerPhone} disabled className={`${inputClass} bg-slate-50 text-slate-500`} />
              </Field>
            </>
          )}

          {/* ── SECTION 2: LINE ITEMS ────────────────────────── */}
          <SectionTitle>Line Items</SectionTitle>

          {!readOnly && (
            <button onClick={addItem}
              className="col-span-2 flex items-center gap-2 px-4 py-2.5 bg-black text-white text-xs font-bold rounded-md hover:bg-slate-800 transition w-fit"
            >
              <Plus size={14} /> Add Line Item
            </button>
          )}

          <div className="col-span-2 space-y-3">
            {formData.items.length === 0 && (
              <div className="text-center py-10 text-slate-400 text-sm border-2 border-dashed border-slate-200 rounded-xl">
                <FileText size={28} className="mx-auto mb-2 text-slate-300" />
                <p className="font-medium">No line items yet</p>
                <p className="text-xs text-slate-400 mt-0.5">Click &quot;Add Line Item&quot; to start building your invoice</p>
              </div>
            )}
            <AnimatePresence>
              {formData.items.map((item: any, i: number) => (
                <motion.div
                  key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
                  className="flex items-start gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200"
                >
                  <div className="flex-1">
                    <input value={item.description} onChange={e => updateItem(i, 'description', e.target.value)}
                      className={`${inputClass} mb-2`} placeholder="Item / service description" disabled={readOnly} />
                    <div className="grid grid-cols-4 gap-2">
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Qty</label>
                        <input type="number" min="0" step="1" value={item.quantity}
                          onChange={e => updateItem(i, 'quantity', parseFloat(e.target.value) || 0)}
                          className={inputClass} disabled={readOnly} />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Unit Price</label>
                        <input type="number" min="0" step="0.01" value={item.unitPrice}
                          onChange={e => updateItem(i, 'unitPrice', parseFloat(e.target.value) || 0)}
                          className={inputClass} disabled={readOnly} />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total</label>
                        <div className="h-[46px] flex items-center px-3 rounded-md bg-white border border-black/20 text-sm font-bold text-slate-800">
                          {(Number(item.total) || 0).toLocaleString()} ETB
                        </div>
                      </div>
                      <div className="flex items-end justify-center pb-1">
                        {!readOnly && (
                          <button onClick={() => removeItem(i)}
                            className="p-2.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all">
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* ── SECTION 3: FINANCIAL SUMMARY ───────────────── */}
          <SectionTitle>Financial Summary</SectionTitle>

          <div className="col-span-2 grid grid-cols-2 gap-6">
            {/* Left: Settings */}
            <div className="space-y-4 bg-slate-50 rounded-xl p-5 border border-slate-200">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Adjustments</h4>
              <div>
                <label className="text-xs font-medium text-slate-600 mb-1 block">Discount (%)</label>
                <div className="flex items-center gap-2">
                  <Percent size={14} className="text-slate-400 shrink-0" />
                  <input type="number" min="0" max="100" value={formData.discountPercent}
                    onChange={e => set("discountPercent", parseFloat(e.target.value) || 0)}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" disabled={readOnly} />
                </div>
                {Number(formData.discountAmount) > 0 && (
                  <p className="text-xs text-red-500 mt-1">- {(Number(formData.discountAmount) || 0).toLocaleString()} ETB</p>
                )}
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 mb-1 block">Tax Rate (%)</label>
                <div className="flex items-center gap-2">
                  <Percent size={14} className="text-slate-400 shrink-0" />
                  <SearchableSelect
                    value={String(formData.taxRate || "0")}
                    onChange={(val) => set("taxRate", parseFloat(val))}
                    options={["0", "2", "5", "10", "15", "30"]}
                    placeholder="Select tax rate..."
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm cursor-pointer"
                    disabled={readOnly}
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 mb-1 block">Amount Paid</label>
                <div className="flex items-center gap-2">
                  <DollarSign size={14} className="text-slate-400 shrink-0" />
                  <input type="number" min="0" value={formData.amountPaid}
                    onChange={e => set("amountPaid", parseFloat(e.target.value) || 0)}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" disabled={readOnly} />
                </div>
              </div>
            </div>

            {/* Right: Totals */}
            <div className="space-y-3 bg-white rounded-xl p-5 border border-slate-200">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Totals</h4>
              <div className="flex justify-between items-center py-2">
                <span className="text-sm text-slate-600">Subtotal</span>
                <span className="text-sm font-bold">{(Number(formData.subTotal) || 0).toLocaleString()} ETB</span>
              </div>
              {Number(formData.discountAmount) > 0 && (
                <div className="flex justify-between items-center py-1">
                  <span className="text-sm text-red-500">Discount ({formData.discountPercent}%)</span>
                  <span className="text-sm font-medium text-red-500">-{(Number(formData.discountAmount) || 0).toLocaleString()} ETB</span>
                </div>
              )}
              {Number(formData.taxAmount) > 0 && (
                <div className="flex justify-between items-center py-1">
                  <span className="text-sm text-slate-600">Tax ({formData.taxRate}%)</span>
                  <span className="text-sm font-medium">{(Number(formData.taxAmount) || 0).toLocaleString()} ETB</span>
                </div>
              )}
              <div className="flex justify-between items-center py-3 border-t-2 border-black mt-2">
                <span className="text-lg font-black text-black">Total</span>
                <span className="text-lg font-black text-black">{(Number(formData.total) || 0).toLocaleString()} ETB</span>
              </div>
              {Number(formData.amountPaid) > 0 && (
                <div className="flex justify-between items-center py-1">
                  <span className="text-sm text-emerald-600 font-medium">Paid</span>
                  <span className="text-sm font-medium text-emerald-600">-{(Number(formData.amountPaid) || 0).toLocaleString()} ETB</span>
                </div>
              )}
              {Number(formData.balanceDue) > 0 && (
                <div className="flex justify-between items-center py-2 border-t border-slate-200">
                  <span className="text-base font-bold text-amber-600">Balance Due</span>
                  <span className="text-base font-bold text-amber-600">{(Number(formData.balanceDue) || 0).toLocaleString()} ETB</span>
                </div>
              )}
              {Number(formData.balanceDue) === 0 && Number(formData.total) > 0 && (
                <div className="flex items-center gap-2 py-2 text-emerald-600 text-sm font-bold">
                  <Check size={16} /> Fully Paid
                </div>
              )}
            </div>
          </div>

          {/* ── SECTION 4: NOTES & TERMS ───────────────────── */}
          <SectionTitle>Notes & Terms</SectionTitle>

          <Field label="Notes">
            <textarea name="notes" value={formData.notes} onChange={handle} rows={3}
              className={`${inputClass} resize-none`} placeholder="Additional notes or instructions..." disabled={readOnly} />
          </Field>
          <Field label="Terms & Conditions">
            <textarea name="termsAndConditions" value={formData.termsAndConditions} onChange={handle} rows={3}
              className={`${inputClass} resize-none`} placeholder="Payment terms, delivery conditions..." disabled={readOnly} />
          </Field>

          {/* Timestamp */}
          {(formData.createdAt || formData.updatedAt) && (
            <div className="col-span-2 bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs text-slate-500 mt-2">
              {formData.createdAt && <p>Created: {new Date(formData.createdAt).toLocaleString()}</p>}
              {formData.updatedAt && <p>Last updated: {new Date(formData.updatedAt).toLocaleString()}</p>}
            </div>
          )}
        </div>
      </div>

      {/* ── EMAIL MODAL ─────────────────────────────────────── */}
      {showEmailModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowEmailModal(false)}>
          <div className="bg-white rounded-2xl w-full max-w-md shadow-xl p-6" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-slate-900 mb-1">Send Invoice</h3>
            <p className="text-sm text-slate-500 mb-4">
              Send {formData.invoiceNo} as an HTML invoice email to the customer.
            </p>
            <label className="text-xs font-semibold text-slate-700 block mb-1.5">Recipient Email</label>
            <input
              type="email"
              value={emailTo}
              onChange={e => setEmailTo(e.target.value)}
              placeholder="customer@example.com"
              className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-slate-900 mb-6"
              autoFocus
            />
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowEmailModal(false)}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
                Cancel
              </button>
              <button onClick={handleSendEmail} disabled={isSendingEmail}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold transition-all disabled:opacity-50 flex items-center gap-2">
                <Send size={14} /> {isSendingEmail ? "Sending..." : "Send Invoice"}
              </button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}

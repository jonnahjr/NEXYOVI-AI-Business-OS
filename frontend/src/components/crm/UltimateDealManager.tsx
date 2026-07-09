import React, { useState, useEffect } from "react";
import { Save, TrendingUp, FileText } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
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

const STAGES = [
  { key: "PROSPECTING", label: "Prospecting", icon: "🔍", color: "bg-slate-100" },
  { key: "QUALIFICATION", label: "Qualification", icon: "📋", color: "bg-blue-100" },
  { key: "PROPOSAL", label: "Proposal", icon: "📄", color: "bg-amber-100" },
  { key: "NEGOTIATION", label: "Negotiation", icon: "🤝", color: "bg-purple-100" },
  { key: "CLOSED_WON", label: "Closed Won", icon: "🏆", color: "bg-green-100" },
  { key: "CLOSED_LOST", label: "Lost", icon: "❌", color: "bg-red-100" },
];

export default function UltimateDealManager({ onBack, initialData, dealId, readOnly }: {
  onBack: () => void;
  initialData?: any;
  dealId?: string;
  readOnly?: boolean;
}) {
  const [activeTab, setActiveTab] = useState("overview");
  const [isLoading, setIsLoading] = useState(false);
  const [customerSearch, setCustomerSearch] = useState("");
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  const [customers, setCustomers] = useState<{ id: string; name: string; email?: string }[]>([]);
  const [isLoadingCustomers, setIsLoadingCustomers] = useState(false);
  const { toast } = useToast();

  // Fetch real customers from the backend for deal-customer linking
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
          setCustomers(json.data.map((c: any) => ({ id: c.id, name: c.name, email: c.email })));
        }
      } catch {}
      setIsLoadingCustomers(false);
    })();
  }, [readOnly]);

  const defaultFormData = {
    title: "", value: 0, stage: "PROSPECTING", closeDate: "", probability: 0, notes: "", customer: "", customerId: "",
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

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token") || "";
      const isEdit = !!dealId;
      const url = isEdit
        ? `http://localhost:3002/api/v1/modules/crm-sales/opportunity-pipeline/${dealId}`
        : "http://localhost:3002/api/v1/modules/crm-sales/opportunity-pipeline";
      const res = await fetch(url, {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          title: formData.title, value: Number(formData.value) || 0,
          stage: formData.stage, closeDate: formData.closeDate ? new Date(formData.closeDate) : null,
          probability: Number(formData.probability) || 0, notes: formData.notes || '',
          ...(formData.customerId ? { customerId: formData.customerId } : {}),
        }),
      });
      if (res.ok) { toast(isEdit ? "Deal updated" : "Deal created", "success"); onBack(); }
      else { const e = await res.json(); toast(e.message || "Failed to save", "error"); }
    } catch (err: any) { toast(`Error: ${err.message}`, "error"); }
    finally { setIsLoading(false); }
  };

  const currentStageIdx = STAGES.findIndex(s => s.key === formData.stage);
  const winProbability = currentStageIdx >= 4 ? 100 : currentStageIdx >= 3 ? 80 : currentStageIdx >= 2 ? 50 : currentStageIdx >= 1 ? 25 : 10;

  const tabs = [
    { id: "overview", label: "Overview", icon: TrendingUp },
    { id: "details", label: "Details", icon: FileText },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      className="bg-white text-black min-h-[calc(100vh-4rem)] p-8 flex flex-col font-sans"
    >
      <div className="flex justify-between items-center mb-8 border-b border-black/10 pb-6">
        <div>
          <h2 className="text-4xl font-black tracking-tight text-black">
            {readOnly ? "Deal Details" : dealId ? "Edit Deal" : "New Deal"}
          </h2>
          <p className="text-sm text-black/60 mt-1 font-medium">
            {readOnly ? "Viewing deal details" : dealId ? "Edit opportunity" : "Create a new opportunity"}
          </p>
        </div>
        <div className="flex space-x-3">
          <button onClick={onBack} className="px-5 py-2.5 border border-black/20 rounded-md text-sm font-semibold hover:bg-black/5 transition text-black">{readOnly ? "Back" : "Cancel"}</button>
          {!readOnly && (
            <button onClick={handleSave} disabled={isLoading} className="px-6 py-2.5 bg-[#F9A230] text-black rounded-md text-sm font-black flex items-center space-x-2 hover:bg-amber-500 transition disabled:opacity-50">
              <Save size={16} /><span>{isLoading ? "Saving..." : dealId ? "Update" : "Create"}</span>
            </button>
          )}
        </div>
      </div>

      {/* Pipeline Progress */}
      {initialData && (
        <div className="mb-8 bg-slate-50 border border-slate-200 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xl font-bold text-slate-900">{formData.title}</h3>
              <p className="text-sm text-slate-500">{formData.customer || "No customer"}</p>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold text-slate-900">{Number(formData.value).toLocaleString()} ETB</p>
              <p className="text-xs text-slate-500">{winProbability}% win probability</p>
            </div>
          </div>
          <div className="relative">
            <div className="flex justify-between mb-2">
              {STAGES.map((s, i) => (
                <div key={s.key} className="flex flex-col items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                    i <= currentStageIdx ? "bg-black text-white" : "bg-slate-200 text-slate-400"
                  } ${i === currentStageIdx ? "ring-2 ring-offset-2 ring-black" : ""}`}>
                    {s.icon}
                  </div>
                  <span className={`text-[9px] mt-1 font-medium ${i <= currentStageIdx ? "text-black" : "text-slate-400"}`}>{s.label}</span>
                </div>
              ))}
            </div>
            <div className="relative h-1.5 bg-slate-200 rounded-full mt-1">
              <div className="absolute top-0 left-0 h-full bg-black rounded-full transition-all"
                style={{ width: `${((currentStageIdx + 1) / STAGES.length) * 100}%` }} />
            </div>
          </div>
        </div>
      )}

      <div className="flex space-x-1 border-b border-black/10 mb-10 overflow-x-auto pb-0">
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 pb-4 font-bold text-sm transition relative whitespace-nowrap ${activeTab === tab.id ? "text-black" : "text-black/40 hover:text-black/70"}`}
          >
            <tab.icon size={15} /><span>{tab.label}</span>
            {activeTab === tab.id && <motion.div layoutId="deal-tab-underline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-black" />}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto max-w-4xl">
        <AnimatePresence mode="wait">
          <motion.div key={activeTab} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 6 }} transition={{ duration: 0.18 }}>
            <fieldset disabled={readOnly} className={readOnly ? "opacity-80" : ""}>

            {activeTab === "overview" && (
              <div className="grid grid-cols-2 gap-x-8 gap-y-5">
                <SectionTitle>Deal Information</SectionTitle>
                <Field label="Deal Title" required>
                  <input name="title" value={formData.title} onChange={handle} className={inputClass} placeholder="e.g. ERP Implementation" />
                </Field>
                <div />
                <Field label="Deal Value (ETB)" required>
                  <input type="number" name="value" value={formData.value} onChange={handle} className={inputClass} placeholder="2500000" />
                </Field>
                <Field label="Customer">
                  <div className="relative">
                    <input
                      value={customerSearch || formData.customer || ""}
                      onChange={e => { setCustomerSearch(e.target.value); setShowCustomerDropdown(true); set("customer", e.target.value); set("customerId", ""); }}
                      onFocus={() => setShowCustomerDropdown(true)}
                      className={inputClass}
                      placeholder="Search or type customer name..."
                      disabled={readOnly}
                    />
                    {showCustomerDropdown && (customerSearch.length > 0 || !formData.customer) && !readOnly && (
                      <div className="absolute z-20 top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-lg max-h-48 overflow-y-auto">
                        {isLoadingCustomers ? (
                          <div className="px-4 py-3 text-sm text-slate-400 text-center">Loading customers...</div>
                        ) : (
                          <>
                            {customers.filter(c =>
                              c.name.toLowerCase().includes((customerSearch || formData.customer || "").toLowerCase())
                            ).map(c => (
                              <button
                                key={c.id}
                                onClick={() => {
                                  set("customer", c.name);
                                  set("customerId", c.id);
                                  setCustomerSearch(c.name);
                                  setShowCustomerDropdown(false);
                                }}
                                className="w-full text-left px-4 py-2.5 text-sm hover:bg-slate-50 border-b border-slate-50 last:border-0 flex items-center gap-3"
                              >
                                <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary shrink-0">
                                  {c.name.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase()}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <span className="font-medium text-slate-800 block truncate">{c.name}</span>
                                  {c.email && <span className="text-xs text-slate-400 truncate">{c.email}</span>}
                                </div>
                              </button>
                            ))}
                            {customers.filter(c =>
                              c.name.toLowerCase().includes((customerSearch || formData.customer || "").toLowerCase())
                            ).length === 0 && (
                              <div className="px-4 py-3 text-sm text-slate-400 text-center">No customers found</div>
                            )}
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </Field>
                <SectionTitle>Pipeline Stage</SectionTitle>
                <FullField label="Current Stage">
                  <div className="flex flex-wrap gap-2">
                    {STAGES.map(s => (
                      <button key={s.key} type="button" onClick={() => set("stage", s.key)}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition-all ${
                          formData.stage === s.key ? "bg-black text-white border-black" : "bg-white text-slate-600 border-slate-200 hover:border-black"
                        }`}
                      >
                        <span>{s.icon}</span> {s.label}
                      </button>
                    ))}
                  </div>
                </FullField>
                <Field label="Probability (%)">
                  <div className="flex items-center gap-3">
                    <input type="range" min="0" max="100" step="5" value={formData.probability || winProbability}
                      onChange={e => set("probability", parseInt(e.target.value))} className="flex-1 accent-black" />
                    <span className="text-lg font-bold text-black w-10 text-right">{formData.probability || winProbability}%</span>
                  </div>
                </Field>
                <Field label="Expected Close Date">
                  <input type="date" name="closeDate" value={formData.closeDate} onChange={handle} className={inputClass} />
                </Field>
              </div>
            )}

            {activeTab === "details" && (
              <div className="grid grid-cols-1 gap-x-8 gap-y-5">
                <SectionTitle>Additional Details</SectionTitle>
                <div>
                  <label className={labelClass}>Notes & Remarks</label>
                  <textarea name="notes" value={formData.notes} onChange={handle} rows={8}
                    className={`${inputClass} resize-y min-h-[200px]`}
                    placeholder="Enter deal notes, requirements, competitor info, next steps..." />
                </div>
                {formData.createdAt && (
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm text-slate-500">
                    <p>Created: {new Date(formData.createdAt).toLocaleString()}</p>
                    {formData.updatedAt && <p>Last updated: {new Date(formData.updatedAt).toLocaleString()}</p>}
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

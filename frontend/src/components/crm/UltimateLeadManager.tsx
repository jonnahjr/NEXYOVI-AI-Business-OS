import React, { useState, useEffect } from "react";
import { X, Save, User, TrendingUp, FileText, Activity, Users } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { useToast } from "@/components/ui/Toast";

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

function StatusBadge({ value }: { value: string }) {
  const colors: Record<string, string> = {
    "New": "bg-blue-100 text-blue-800",
    "Contacted": "bg-indigo-100 text-indigo-800",
    "Qualified": "bg-emerald-100 text-emerald-800",
    "Proposal": "bg-amber-100 text-amber-800",
    "Negotiation": "bg-purple-100 text-purple-800",
    "Closed Won": "bg-green-100 text-green-800",
    "Lost": "bg-red-100 text-red-800",
  };
  const cls = colors[value] || "bg-slate-100 text-slate-800";
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${cls}`}>
      {value}
    </span>
  );
}

export default function UltimateLeadManager({ onBack, initialData, leadId, readOnly }: {
  onBack: () => void;
  initialData?: any;
  leadId?: string;
  readOnly?: boolean;
}) {
  const [activeTab, setActiveTab] = useState("info");
  const [isLoading, setIsLoading] = useState(false);
  const [isConverting, setIsConverting] = useState(false);
  const [showConvertConfirm, setShowConvertConfirm] = useState(false);
  const { toast } = useToast();

  const defaultFormData = {
    name: "",
    email: "",
    phone: "",
    company: "",
    source: "",
    status: "NEW",
    score: 0,
    estimatedValue: 0,
    notes: "",
  };

  const sanitize = (obj: any) => {
    if (!obj || typeof obj !== 'object') return obj;
    const result: any = {};
    for (const [k, v] of Object.entries(obj)) {
      result[k] = v === null || v === undefined ? '' : v;
    }
    return result;
  };

  const [formData, setFormData] = useState<any>(initialData ? {
    ...defaultFormData,
    ...sanitize(initialData),
  } : defaultFormData);

  const set = (key: string, value: any) => setFormData((p: any) => ({ ...p, [key]: value }));
  const handle = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => set(e.target.name, e.target.value);

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token") || "";
      const isEdit = !!leadId;
      const url = isEdit
        ? `http://localhost:3002/api/v1/modules/crm-sales/lead-management/${leadId}`
        : "http://localhost:3002/api/v1/modules/crm-sales/lead-management";
      const res = await fetch(url, {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          company: formData.company,
          source: formData.source?.toUpperCase().replace(/\s+/g, '_') || 'OTHER',
          status: formData.status?.toUpperCase().replace(/\s+/g, '_') || 'NEW',
          score: Number(formData.score) || 0,
          estimatedValue: Number(formData.estimatedValue) || 0,
          notes: formData.notes || '',
        }),
      });
      if (res.ok) {
        toast(isEdit ? "Lead updated successfully" : "Lead created successfully", "success");
        onBack();
      } else {
        const e = await res.json();
        toast(e.message || "Failed to save lead", "error");
      }
    } catch (err: any) {
      toast(`Error: ${err.message}`, "error");
    } finally {
      setIsLoading(false);
    }
  };

  // ── CONVERT LEAD TO CUSTOMER ────────────────────────────────
  const handleConvertToCustomer = async () => {
    if (!leadId) return;
    setIsConverting(true);
    setShowConvertConfirm(false);
    try {
      const token = localStorage.getItem("token") || "";
      // Create the customer from lead data
      const body: any = {
        name: formData.name || 'Unknown',
        email: formData.email || '',
        phone: formData.phone || '',
        company: formData.company || '',
        type: formData.company ? 'BUSINESS' : 'INDIVIDUAL',
        status: 'ACTIVE',
        source: formData.source || 'Lead Conversion',
        notes: formData.notes ? `[Converted from lead] ${formData.notes}` : 'Converted from lead',
      };
      const res = await fetch(`http://localhost:3002/api/v1/modules/crm-sales/customer-management`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
      });
      const result = await res.json();
      if (res.ok) {
        // Update the lead status to CLOSED_WON
        await fetch(`http://localhost:3002/api/v1/modules/crm-sales/lead-management/${leadId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ status: 'CLOSED_WON' }),
        }).catch(() => {});
        toast(`Lead converted to customer successfully!`, "success");
        onBack();
      } else {
        toast(result?.message || result?.error || "Failed to convert lead", "error");
      }
    } catch (err: any) {
      toast(`Error: ${err.message}`, "error");
    } finally {
      setIsConverting(false);
    }
  };

  const tabs = [
    { id: "info",      label: "Lead Info",    icon: User },
    { id: "pipeline",  label: "Pipeline",     icon: TrendingUp },
    { id: "notes",     label: "Notes",        icon: FileText },
    { id: "activity",  label: "Activity",     icon: Activity },
  ];

  const LEAD_SOURCES = ["Website", "Referral", "Social Media", "Cold Call", "Email Campaign", "Other"];
  const LEAD_STATUSES = ["New", "Contacted", "Qualified", "Proposal", "Negotiation", "Closed Won", "Lost"];

  const stageIcons: Record<string, { icon: string; color: string }> = {
    "New": { icon: "🟢", color: "bg-blue-100" },
    "Contacted": { icon: "📞", color: "bg-indigo-100" },
    "Qualified": { icon: "✅", color: "bg-emerald-100" },
    "Proposal": { icon: "📄", color: "bg-amber-100" },
    "Negotiation": { icon: "🤝", color: "bg-purple-100" },
    "Closed Won": { icon: "🏆", color: "bg-green-100" },
    "Lost": { icon: "❌", color: "bg-red-100" },
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      className="bg-white text-black min-h-[calc(100vh-4rem)] p-8 flex flex-col font-sans"
    >
      {/* Header */}
      <div className="flex justify-between items-center mb-8 border-b border-black/10 pb-6">
        <div>
          <h2 className="text-4xl font-black tracking-tight text-black">
            {readOnly ? "Lead Details" : leadId ? "Edit Lead" : "New Lead"}
          </h2>
          <p className="text-sm text-black/60 mt-1 font-medium">
            {readOnly ? "Viewing full lead information" : leadId ? "Editing lead record" : "Create a new sales lead"}
          </p>
        </div>
        <div className="flex space-x-3">
          <button onClick={onBack} className="px-5 py-2.5 border border-black/20 rounded-md text-sm font-semibold hover:bg-black/5 transition text-black">
            {readOnly ? "Back" : "Cancel"}
          </button>
          {leadId && !readOnly && (
            <button onClick={() => setShowConvertConfirm(true)} disabled={isConverting}
              className="px-5 py-2.5 border border-emerald-300 rounded-md text-sm font-semibold text-emerald-700 hover:bg-emerald-50 transition flex items-center gap-2 disabled:opacity-50"
            >
              <Users size={15} /> {isConverting ? "Converting..." : "Convert to Customer"}
            </button>
          )}
          {!readOnly && (
            <button onClick={handleSave} disabled={isLoading} className="px-6 py-2.5 bg-[#F9A230] text-black rounded-md text-sm font-black flex items-center space-x-2 hover:bg-amber-500 transition disabled:opacity-50">
              <Save size={16} /><span>{isLoading ? "Saving..." : leadId ? "Update Lead" : "Create Lead"}</span>
            </button>
          )}
        </div>
      </div>

      {/* Lead Status Banner */}
      {initialData && (
        <div className="mb-8 bg-slate-50 border border-slate-200 rounded-xl p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-xl font-bold text-primary">
                {(formData.name || "?").split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase()}
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900">{formData.name}</h3>
                <p className="text-sm text-slate-500">{formData.company || "No company"}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <StatusBadge value={LEAD_STATUSES.find(s => s.toUpperCase() === formData.status?.toUpperCase()) || "New"} />
              {formData.score > 0 && (
                <div className="flex items-center gap-1 px-3 py-1.5 bg-slate-100 rounded-lg">
                  <span className="text-xs font-bold text-slate-600">Score</span>
                  <span className="text-sm font-bold text-slate-900">{formData.score}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex space-x-1 border-b border-black/10 mb-10 overflow-x-auto pb-0">
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 pb-4 font-bold text-sm transition relative whitespace-nowrap ${activeTab === tab.id ? "text-black" : "text-black/40 hover:text-black/70"}`}
          >
            <tab.icon size={15} /><span>{tab.label}</span>
            {activeTab === tab.id && <motion.div layoutId="lead-tab-underline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-black" />}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto max-w-4xl">
        <AnimatePresence mode="wait">
          <motion.div key={activeTab} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 6 }} transition={{ duration: 0.18 }}>
            <fieldset disabled={readOnly} className={readOnly ? "opacity-80" : ""}>

            {/* ── CONVERT TO CUSTOMER CONFIRMATION ──────────── */}
            {showConvertConfirm && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowConvertConfirm(false)}>
                <div className="bg-white rounded-2xl w-full max-w-md shadow-xl p-6" onClick={e => e.stopPropagation()}>
                  <h3 className="text-lg font-bold text-slate-900 mb-1">Convert Lead to Customer</h3>
                  <p className="text-sm text-slate-500 mb-4">
                    This will create a new customer record from <strong>{formData.name || 'this lead'}</strong> and mark the lead as <strong>Closed Won</strong>.
                  </p>
                  <div className="bg-slate-50 rounded-xl p-4 mb-6 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Name</span>
                      <span className="font-medium text-slate-800">{formData.name || '—'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Email</span>
                      <span className="font-medium text-slate-800">{formData.email || '—'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Phone</span>
                      <span className="font-medium text-slate-800">{formData.phone || '—'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Company</span>
                      <span className="font-medium text-slate-800">{formData.company || '—'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Customer Type</span>
                      <span className="font-medium text-slate-800">{formData.company ? 'Business' : 'Individual'}</span>
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <button onClick={() => setShowConvertConfirm(false)}
                      className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
                      Cancel
                    </button>
                    <button onClick={handleConvertToCustomer} disabled={isConverting}
                      className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold transition-all disabled:opacity-50 flex items-center gap-2">
                      <Users size={14} /> {isConverting ? "Converting..." : "Confirm Conversion"}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ── 1. LEAD INFO ──────────────────────────────── */}
            {activeTab === "info" && (
              <div className="grid grid-cols-2 gap-x-8 gap-y-5">
                <SectionTitle>Contact Information</SectionTitle>
                <Field label="Lead Name" required>
                  <input name="name" value={formData.name} onChange={handle} className={inputClass} placeholder="e.g. Selam Habtamu" />
                </Field>
                <div />
                <Field label="Email Address" required>
                  <input type="email" name="email" value={formData.email} onChange={handle} className={inputClass} placeholder="selam@company.com" />
                </Field>
                <Field label="Phone Number">
                  <div>
                    <PhoneInput
                      country="et"
                      value={formData.phone}
                      onChange={val => set("phone", val)}
                      inputStyle={{ width: "100%", height: "46px", border: "1px solid rgba(0,0,0,0.2)", borderRadius: "0.375rem", fontSize: "14px", fontFamily: "inherit" }}
                      buttonStyle={{ border: "1px solid rgba(0,0,0,0.2)", borderRight: "none", borderRadius: "0.375rem 0 0 0.375rem", background: "rgba(0,0,0,0.05)" }}
                      dropdownStyle={{ borderRadius: "0.375rem", border: "1px solid rgba(0,0,0,0.2)", boxShadow: "0 4px 20px rgba(0,0,0,0.1)" }}
                      containerStyle={{ width: "100%" }}
                      enableSearch
                    />
                  </div>
                </Field>
                <Field label="Company">
                  <input name="company" value={formData.company} onChange={handle} className={inputClass} placeholder="e.g. Addis Corp" />
                </Field>
                <SectionTitle>Lead Source</SectionTitle>
                <FullField label="How did this lead find us?">
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {LEAD_SOURCES.map(src => {
                      const isSelected = formData.source?.toUpperCase().replace(/\s+/g, '_') === src.toUpperCase().replace(/\s+/g, '_') ||
                                        formData.source === src;
                      return (
                        <button
                          key={src}
                          type="button"
                          onClick={() => set("source", src)}
                          className={`px-4 py-3 rounded-lg border text-sm font-medium transition-all ${
                            isSelected
                              ? "bg-black text-white border-black"
                              : "bg-white text-slate-600 border-slate-200 hover:border-black hover:text-black"
                          }`}
                        >
                          {src}
                        </button>
                      );
                    })}
                  </div>
                </FullField>
              </div>
            )}

            {/* ── 2. PIPELINE ───────────────────────────────── */}
            {activeTab === "pipeline" && (
              <div className="grid grid-cols-2 gap-x-8 gap-y-5">
                <SectionTitle>Pipeline Stage</SectionTitle>
                <FullField label="Current Stage">
                  <div className="flex flex-wrap gap-2">
                    {LEAD_STATUSES.map(stage => {
                      const isSelected = formData.status?.toUpperCase().replace(/\s+/g, '_') === stage.toUpperCase().replace(/\s+/g, '_') ||
                                        formData.status === stage ||
                                        (formData.status === "CLOSED_WON" && stage === "Closed Won") ||
                                        (formData.status === "CLOSED_LOST" && stage === "Lost");
                      const info = stageIcons[stage] || { icon: "•", color: "bg-slate-100" };
                      return (
                        <button
                          key={stage}
                          type="button"
                          onClick={() => set("status", stage.toUpperCase().replace(/\s+/g, '_'))}
                          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border text-sm font-medium transition-all ${
                            isSelected
                              ? "bg-black text-white border-black"
                              : "bg-white text-slate-600 border-slate-200 hover:border-black hover:text-black"
                          }`}
                        >
                          <span>{info.icon}</span>
                          {stage}
                        </button>
                      );
                    })}
                  </div>
                </FullField>

                <SectionTitle>Lead Scoring</SectionTitle>
                <Field label="Lead Score (0-100)">
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      step="5"
                      value={formData.score || 0}
                      onChange={e => set("score", parseInt(e.target.value))}
                      className="flex-1 accent-black"
                    />
                    <span className="text-lg font-bold text-black w-10 text-right">{formData.score || 0}</span>
                  </div>
                </Field>
                <Field label="Estimated Value (ETB)">
                  <input
                    type="number"
                    name="estimatedValue"
                    value={formData.estimatedValue}
                    onChange={handle}
                    className={inputClass}
                    placeholder="e.g. 250000"
                  />
                </Field>

                <SectionTitle>Stage Progress</SectionTitle>
                <FullField label="Pipeline Progress">
                  <div className="bg-slate-50 rounded-xl p-5">
                    <div className="flex items-center justify-between mb-4">
                      {LEAD_STATUSES.map((stage, i) => {
                        const currentIdx = LEAD_STATUSES.findIndex(s =>
                          s.toUpperCase() === formData.status?.toUpperCase().replace(/\s+/g, '_') ||
                          (formData.status === "CLOSED_WON" && s === "Closed Won") ||
                          (formData.status === "CLOSED_LOST" && s === "Lost")
                        );
                        const isCompleted = i <= currentIdx;
                        const isCurrent = i === currentIdx;
                        return (
                          <div key={stage} className="flex flex-col items-center">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                              isCompleted ? "bg-black text-white" : "bg-slate-200 text-slate-400"
                            } ${isCurrent ? "ring-2 ring-offset-2 ring-black" : ""}`}>
                              {i + 1}
                            </div>
                            <span className={`text-[10px] mt-1 font-medium ${isCompleted ? "text-black" : "text-slate-400"}`}>
                              {stage.split(" ")[0]}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                    <div className="relative h-1 bg-slate-200 rounded-full">
                      <div
                        className="absolute top-0 left-0 h-full bg-black rounded-full transition-all"
                        style={{
                          width: `${(LEAD_STATUSES.findIndex(s =>
                            s.toUpperCase() === formData.status?.toUpperCase().replace(/\s+/g, '_') ||
                            (formData.status === "CLOSED_WON" && s === "Closed Won") ||
                            (formData.status === "CLOSED_LOST" && s === "Lost")
                          ) + 1) / LEAD_STATUSES.length * 100}%`
                        }}
                      />
                    </div>
                  </div>
                </FullField>
              </div>
            )}

            {/* ── 3. NOTES ──────────────────────────────────── */}
            {activeTab === "notes" && (
              <div className="grid grid-cols-1 gap-x-8 gap-y-5">
                <SectionTitle>Lead Notes</SectionTitle>
                <div>
                  <label className={labelClass}>Notes & Follow-up Notes</label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handle}
                    rows={10}
                    className={`${inputClass} resize-y min-h-[200px]`}
                    placeholder="Enter any notes about this lead, including conversation summaries, follow-up actions, preferences, and next steps..."
                  />
                </div>
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm text-slate-600">
                  <p className="font-bold text-slate-800 mb-1">💡 Tips for lead notes</p>
                  <ul className="list-disc list-inside space-y-1 text-slate-500">
                    <li>Record key conversation points and pain points</li>
                    <li>Note preferred communication channels and times</li>
                    <li>Track follow-up dates and action items</li>
                    <li>Mention any competitors they&apos;re evaluating</li>
                    <li>Document budget constraints or decision-making timeline</li>
                  </ul>
                </div>
              </div>
            )}

            {/* ── 4. ACTIVITY ───────────────────────────────── */}
            {activeTab === "activity" && <LeadActivitySection leadId={leadId} createdAt={formData.createdAt} updatedAt={formData.updatedAt} />}

            </fieldset>
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

function LeadActivitySection({ leadId, createdAt, updatedAt }: { leadId?: string; createdAt?: string; updatedAt?: string }) {
  const [activities, setActivities] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [newActivity, setNewActivity] = useState({ type: "NOTE", title: "", notes: "", outcome: "", date: new Date().toISOString().split('T')[0] });
  const { toast } = useToast();

  const loadActivities = async () => {
    if (!leadId) { setIsLoading(false); return; }
    try {
      const token = localStorage.getItem("token") || "";
      const res = await fetch(`http://localhost:3002/api/v1/modules/crm-sales/lead-management/${leadId}/activities`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const json = await res.json();
      if (json?.data) setActivities(json.data);
    } catch {}
    setIsLoading(false);
  };

  useEffect(() => { loadActivities(); }, [leadId]);

  const handleAddActivity = async () => {
    if (!newActivity.title.trim()) {
      toast("Please enter a title for the activity", "error");
      return;
    }
    try {
      const token = localStorage.getItem("token") || "";
      const res = await fetch(`http://localhost:3002/api/v1/modules/crm-sales/lead-management/${leadId}/activities`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify(newActivity),
      });
      if (res.ok) {
        toast("Activity logged", "success");
        setNewActivity({ type: "NOTE", title: "", notes: "", outcome: "", date: new Date().toISOString().split('T')[0] });
        setShowForm(false);
        loadActivities();
      } else {
        const err = await res.json();
        toast(err?.message || "Failed to log activity", "error");
      }
    } catch {
      toast("Error logging activity", "error");
    }
  };

  const handleDeleteActivity = async (activityId: string) => {
    try {
      const token = localStorage.getItem("token") || "";
      const res = await fetch(`http://localhost:3002/api/v1/modules/crm-sales/lead-management/${leadId}/activities/${activityId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        toast("Activity deleted", "success");
        loadActivities();
      }
    } catch {}
  };

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('en-US', {
        year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
      });
    } catch { return dateStr; }
  };

  const activityTypes = [
    { value: "CALL", label: "📞 Call", color: "bg-green-100 text-green-700" },
    { value: "EMAIL", label: "📧 Email", color: "bg-blue-100 text-blue-700" },
    { value: "MEETING", label: "🤝 Meeting", color: "bg-purple-100 text-purple-700" },
    { value: "NOTE", label: "📝 Note", color: "bg-amber-100 text-amber-700" },
    { value: "TASK", label: "✅ Task", color: "bg-slate-100 text-slate-700" },
  ];

  const outcomeOptions = ["Interested", "Not Interested", "Call Back Later", "Meeting Scheduled", "Proposal Sent", "Follow-Up Needed", "Closed"];

  return (
    <div className="grid grid-cols-1 gap-x-8 gap-y-5">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-black col-span-2 pt-4 pb-2 border-b border-black/10 mb-2">Activity Timeline</h3>
        {leadId && (
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-1.5 px-4 py-2 bg-black text-white text-xs font-bold rounded-md hover:bg-black/80 transition"
          >
            {showForm ? "Cancel" : "+ Log Activity"}
          </button>
        )}
      </div>

      {/* New Activity Form */}
      {showForm && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="border border-black/20 rounded-xl p-5 space-y-4 bg-white"
        >
          <div className="flex gap-2 flex-wrap">
            {activityTypes.map(at => (
              <button
                key={at.value}
                type="button"
                onClick={() => setNewActivity({ ...newActivity, type: at.value })}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${newActivity.type === at.value ? 'bg-black text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
              >
                {at.label}
              </button>
            ))}
          </div>
          <div>
            <label className={labelClass}>Title *</label>
            <input
              value={newActivity.title}
              onChange={e => setNewActivity({ ...newActivity, title: e.target.value })}
              className={inputClass}
              placeholder="e.g. Demo call with Selam"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Date</label>
              <input
                type="date"
                value={newActivity.date}
                onChange={e => setNewActivity({ ...newActivity, date: e.target.value })}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Outcome</label>
              <select
                value={newActivity.outcome}
                onChange={e => setNewActivity({ ...newActivity, outcome: e.target.value })}
                className={inputClass}
              >
                <option value="">Select outcome...</option>
                {outcomeOptions.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className={labelClass}>Notes</label>
            <textarea
              value={newActivity.notes}
              onChange={e => setNewActivity({ ...newActivity, notes: e.target.value })}
              rows={3}
              className={`${inputClass} resize-none`}
              placeholder="Activity details..."
            />
          </div>
          <div className="flex justify-end">
            <button
              onClick={handleAddActivity}
              className="px-5 py-2 bg-[#F9A230] text-black text-xs font-bold rounded-md hover:bg-amber-500 transition"
            >
              Save Activity
            </button>
          </div>
        </motion.div>
      )}

      {/* Activity List */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl divide-y divide-slate-200">
        {isLoading ? (
          <div className="p-8 text-center text-slate-400 text-sm">
            <span className="w-5 h-5 border-2 border-slate-400 border-t-transparent rounded-full animate-spin inline-block mr-2 align-middle"></span>
            Loading activities...
          </div>
        ) : activities.length === 0 && !createdAt ? (
          <div className="p-8 text-center text-slate-400 text-sm">
            <Activity size={24} className="mx-auto mb-2 text-slate-300" />
            No activity recorded yet. Save the lead first, then log interactions here.
          </div>
        ) : (
          <>
            {/* Lead created event */}
            {createdAt && (
              <div className="flex items-start gap-4 p-4">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                  <User size={14} className="text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-800">Lead Created</p>
                  <p className="text-xs text-slate-500">Lead was added to the CRM system</p>
                  <p className="text-[11px] text-slate-400 mt-1">{formatDate(createdAt)}</p>
                </div>
              </div>
            )}
            {/* Manual activities */}
            {activities.map((act: any) => (
              <div key={act.id} className="flex items-start gap-4 p-4 group">
                <div className={`w-8 h-8 rounded-full ${act.icon || 'bg-slate-100'} flex items-center justify-center shrink-0`}>
                  <span className="text-xs">{act.type?.split(' ')[0] || '📝'}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-bold text-slate-800">{act.title}</p>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      activityTypes.find(at => at.value === act.typeRaw)?.color || 'bg-slate-100 text-slate-600'
                    }`}>
                      {act.type?.split(' ').slice(1).join(' ') || act.type}
                    </span>
                    {act.outcome && (
                      <span className="text-[10px] font-medium text-slate-500">· {act.outcome}</span>
                    )}
                  </div>
                  {act.notes && <p className="text-xs text-slate-500 mt-1">{act.notes}</p>}
                  <p className="text-[11px] text-slate-400 mt-1">{formatDate(act.date || act.createdAt)}</p>
                </div>
                <button
                  onClick={() => handleDeleteActivity(act.id)}
                  className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-400 hover:text-red-500 transition-all"
                  title="Delete activity"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
            {updatedAt && updatedAt !== createdAt && (
              <div className="flex items-start gap-4 p-4">
                <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                  <Activity size={14} className="text-amber-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-800">Lead Updated</p>
                  <p className="text-xs text-slate-500">Lead information was modified</p>
                  <p className="text-[11px] text-slate-400 mt-1">{formatDate(updatedAt)}</p>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
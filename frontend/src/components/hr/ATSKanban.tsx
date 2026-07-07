"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  X, Plus, User, Mail, Phone, Briefcase, Star, FileText,
  Calendar, ExternalLink, Search,
  Upload, BrainCircuit, Trash2,
  Edit, Clock, CheckCircle, Loader
} from "lucide-react";
import { useToast } from "@/components/ui/Toast";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";

// ─── CONSTANTS ────────────────────────────────────────────────────

const PIPELINE_STAGES = [
  { id: "APPLIED",        label: "Applied",       color: "bg-gray-100 text-gray-700", icon: User },
  { id: "SCREENING",      label: "Screening",     color: "bg-gray-100 text-gray-700", icon: Search },
  { id: "INTERVIEW_1",    label: "Interview 1",   color: "bg-gray-100 text-gray-700", icon: Calendar },
  { id: "INTERVIEW_2",    label: "Interview 2",   color: "bg-gray-100 text-gray-700", icon: Calendar },
  { id: "OFFER_EXTENDED", label: "Offer Extended", color: "bg-gray-100 text-gray-700", icon: FileText },
  { id: "HIRED",          label: "Hired",          color: "bg-gray-100 text-gray-800", icon: CheckCircle },
  { id: "REJECTED",       label: "Rejected",       color: "bg-gray-50 text-gray-400",  icon: X },
];

const STAGE_COLORS: Record<string, string> = {
  "APPLIED":        "bg-gray-100 text-gray-700",
  "SCREENING":      "bg-gray-100 text-gray-600",
  "INTERVIEW_1":    "bg-gray-100 text-gray-700",
  "INTERVIEW_2":    "bg-gray-100 text-gray-700",
  "OFFER_EXTENDED": "bg-gray-100 text-gray-700",
  "HIRED":          "bg-gray-100 text-gray-800",
  "REJECTED":       "bg-gray-50 text-gray-400",
};

const API_BASE = "http://localhost:3002/api/v1/modules/human-resources";

function formatStageLabel(stage: string) {
  return stage.replace(/_/g, " ").replace(/\w\S*/g, w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase());
}

function getInitials(name: string) {
  return name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();
}

function getRatingStars(rating: number) {
  return Math.round(rating);
}

function StageBadge({ stage }: { stage: string }) {
  const cls = STAGE_COLORS[stage] || "bg-gray-100 text-gray-600";
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${cls}`}>
      {formatStageLabel(stage)}
    </span>
  );
}

// ─── CANDIDATE CARD ──────────────────────────────────────────────

function CandidateCard({
  candidate,
  onDragStart,
  onClick,
  onHire,
}: {
  candidate: any;
  onDragStart: (e: React.DragEvent, candidate: any) => void;
  onClick: () => void;
  onHire: () => void;
}) {
  const canHire = candidate.stage !== "HIRED" && candidate.stage !== "REJECTED";

  return (
    <div
      draggable
      onDragStart={e => onDragStart(e, candidate)}
      onClick={onClick}
      className="bg-white border border-gray-200 rounded-xl p-3.5 cursor-grab active:cursor-grabbing hover:border-gray-300 hover:shadow-sm transition-all"
    >
      <div className="flex items-start gap-3 mb-2.5">
        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-[10px] font-bold text-black shrink-0">
          {getInitials(candidate.name)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold text-black truncate">{candidate.name}</div>
          <div className="text-[11px] text-gray-500 truncate">{candidate.position}</div>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          {[1, 2, 3, 4, 5].map(s => (
            <Star
              key={s}
              size={10}
              className={s <= getRatingStars(candidate.rating || 0) ? "text-black fill-black" : "text-black/20 fill-black/10"}
            />
          ))}
        </div>
      </div>

      <div className="flex items-center gap-2 text-[10px] text-gray-400 mb-2.5">          {candidate.email && (
          <span className="flex items-center gap-1 truncate">
            <Mail size={9} className="text-black" /> {candidate.email}
          </span>
        )}
        {candidate.phone && (
          <span className="flex items-center gap-1">
            <Phone size={9} className="text-black" /> {candidate.phone}
          </span>
        )}
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <StageBadge stage={candidate.stage} />
          {candidate.source && (
            <span className="text-[9px] text-gray-400 px-1.5 py-0.5 bg-gray-50 rounded-full">
              {candidate.source}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          {canHire && (                          <button
                            onClick={e => { e.stopPropagation(); onHire(); }}
                            className="w-6 h-6 rounded-md bg-gray-900 hover:bg-black flex items-center justify-center transition-colors"
                            title="Hire — Create Employee"
                          >
                            <CheckCircle size={10} className="text-white" />
                          </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── PIPELINE COLUMN ─────────────────────────────────────────────

function PipelineColumn({
  stage,
  candidates,
  onDragStart,
  onDragOver,
  onDrop,
  onClickCandidate,
  onHire,
}: {
  stage: typeof PIPELINE_STAGES[0];
  candidates: any[];
  onDragStart: (e: React.DragEvent, candidate: any) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent, stageId: string) => void;
  onClickCandidate: (candidate: any) => void;
  onHire: (candidate: any) => void;
}) {
  const Icon = stage.icon;

  return (
    <div
      className="flex-shrink-0 w-64 bg-gray-50 rounded-2xl border border-gray-100 flex flex-col"
      onDragOver={onDragOver}
      onDrop={e => onDrop(e, stage.id)}
    >
      {/* Column Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <Icon size={13} className="text-black" />
          <span className="text-xs font-bold text-black uppercase tracking-wider">{stage.label}</span>
        </div>
        <span className="text-[10px] font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
          {candidates.length}
        </span>
      </div>

      {/* Cards */}
      <div className="flex-1 p-2.5 space-y-2 overflow-y-auto max-h-[calc(100vh-320px)]">
        {candidates.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-[11px] text-gray-300 font-medium">Drop candidates here</p>
          </div>
        ) : (
          candidates.map((candidate, i) => (
            <div key={candidate.id || i}>
              <CandidateCard
                candidate={candidate}
                onDragStart={onDragStart}
                onClick={() => onClickCandidate(candidate)}
                onHire={() => onHire(candidate)}
              />
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// ─── CANDIDATE DETAIL MODAL ──────────────────────────────────────

function CandidateDetailModal({
  candidate,
  onClose,
  onSave,
  onDelete,
  onStageChange,
  onHire,
}: {
  candidate: any;
  onClose: () => void;
  onSave: (data: any) => void;
  onDelete: () => void;
  onStageChange: (stage: string) => void;
  onHire: () => void;
}) {
  const [form, setForm] = useState({ ...candidate });
  const [isEditing, setIsEditing] = useState(false);
  const { toast } = useToast();

  const handleSave = async () => {
    try {
      const token = localStorage.getItem("token") || "";
      const res = await fetch(`${API_BASE}/recruitment-ats/${candidate.id || candidate.prismaId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        toast("Candidate updated successfully", "success");
        onSave(form);
        setIsEditing(false);
      } else {
        const err = await res.json();
        toast(err?.message || "Failed to update candidate", "error");
      }
    } catch (err) {
      toast("Error updating candidate", "error");
    }
  };

  const canHire = form.stage !== "HIRED" && form.stage !== "REJECTED";

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl w-full max-w-lg shadow-xl max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-black">
              {getInitials(candidate.name)}
            </div>
            <div>
              <h3 className="text-lg font-bold text-black">{candidate.name}</h3>
              <p className="text-xs text-gray-500">{candidate.position}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {canHire && (
              <button
                onClick={onHire}
                className="px-3 py-1.5 rounded-lg bg-gray-900 hover:bg-black text-white text-xs font-bold transition-colors flex items-center gap-1.5"
              >
                <CheckCircle size={12} className="text-black" /> Hire
              </button>
            )}
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center text-black hover:text-black transition-colors"
            >
              <Edit size={14} />
            </button>
            <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center text-black hover:text-black transition-colors">
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-5 space-y-5">
          {/* Stage selector */}
          <div>
            <label className="text-xs font-bold text-black uppercase tracking-wider mb-2 block">Pipeline Stage</label>
            <div className="flex flex-wrap gap-1.5">
              {PIPELINE_STAGES.map(ps => (
                <button
                  key={ps.id}
                  onClick={() => {
                    setForm({ ...form, stage: ps.id });
                    onStageChange(ps.id);
                  }}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${
                    form.stage === ps.id
                      ? "bg-gray-900 text-white"
                      : "bg-gray-50 text-gray-500 hover:bg-gray-100"
                  }`}
                >
                  {ps.label}
                </button>
              ))}
            </div>
          </div>

          {/* Contact Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Email</label>
              <input
                value={form.email || ""}
                onChange={e => setForm({ ...form, email: e.target.value })}
                disabled={!isEditing}
                className="w-full mt-1 px-3 py-2 rounded-lg border border-gray-200 text-sm disabled:bg-gray-50 disabled:text-gray-500"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Phone</label>
              <div className="mt-1">
                <PhoneInput
                  country="et"
                  value={form.phone || ""}
                  onChange={val => setForm({ ...form, phone: val })}
                  disabled={!isEditing}
                  inputStyle={{
                    width: "100%",
                    height: "40px",
                    border: "1px solid #e2e8f0",
                    borderRadius: "0.5rem",
                    fontSize: "14px",
                    fontFamily: "inherit",
                    background: !isEditing ? "#f8fafc" : "white",
                    color: !isEditing ? "#64748b" : "#0f172a",
                  }}
                  buttonStyle={{
                    border: "1px solid #e2e8f0",
                    borderRight: "none",
                    borderRadius: "0.5rem 0 0 0.5rem",
                    background: "#f8fafc",
                  }}
                  dropdownStyle={{
                    borderRadius: "0.5rem",
                    border: "1px solid #e2e8f0",
                    boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
                  }}
                  containerStyle={{ width: "100%" }}
                  enableSearch
                  searchStyle={{
                    border: "1px solid #e2e8f0",
                    borderRadius: "0.375rem",
                    padding: "6px 10px",
                    fontSize: "13px",
                    outline: "none",
                  }}
                />
              </div>
            </div>
            <div>
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Position</label>
              <input
                value={form.position || ""}
                onChange={e => setForm({ ...form, position: e.target.value })}
                disabled={!isEditing}
                className="w-full mt-1 px-3 py-2 rounded-lg border border-gray-200 text-sm disabled:bg-gray-50 disabled:text-gray-500"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Source</label>
              <select
                value={form.source || ""}
                onChange={e => setForm({ ...form, source: e.target.value })}
                disabled={!isEditing}
                className="w-full mt-1 px-3 py-2 rounded-lg border border-gray-200 text-sm disabled:bg-gray-50 disabled:text-gray-500"
              >
                <option value="">Select...</option>
                <option value="LinkedIn">LinkedIn</option>
                <option value="Referral">Referral</option>
                <option value="Website">Website</option>
                <option value="Job Board">Job Board</option>
                <option value="Agency">Agency</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          {/* Rating */}
          <div>
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">Rating</label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map(s => (
                <button
                  key={s}
                  onClick={() => isEditing && setForm({ ...form, rating: s })}
                  className={`p-1 rounded transition-colors ${isEditing ? "hover:scale-110" : "cursor-default"}`}
                >
                  <Star
                    size={18}
                    className={s <= getRatingStars(form.rating || 0) ? "text-black fill-black" : "text-black/20"}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">Notes</label>
            <textarea
              value={form.notes || ""}
              onChange={e => setForm({ ...form, notes: e.target.value })}
              disabled={!isEditing}
              rows={4}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm disabled:bg-gray-50 disabled:text-gray-500 resize-none"
              placeholder="Interview notes, feedback, observations..."
            />
          </div>

          {/* Resume Upload */}
          <div>
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">Resume / CV</label>
            {form.resumeUrl ? (
              <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 border border-gray-200">
                <FileText size={16} className="text-black" />
                <span className="text-sm text-gray-600 flex-1 truncate">Resume uploaded</span>
                <a href={form.resumeUrl} target="_blank" className="text-xs font-semibold text-gray-800 hover:text-black flex items-center gap-1">
                  View <ExternalLink size={10} />
                </a>
                {isEditing && (
                  <button
                    onClick={() => setForm({ ...form, resumeUrl: "" })}
                    className="text-xs text-gray-400 hover:text-red-500"
                  >
                    <Trash2 size={12} />
                  </button>
                )}
              </div>
            ) : (
              isEditing && (
                <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center">
                  <Upload size={20} className="mx-auto text-black/40 mb-2" />
                  <p className="text-xs text-gray-400">Upload a resume file</p>
                  <input type="file" className="hidden" accept=".pdf,.doc,.docx" />
                </div>
              )
            )}
          </div>

          {/* Applied Date */}
          <div className="text-xs text-black/50 flex items-center gap-1.5 pt-2 border-t border-gray-100">
            <Clock size={11} className="text-black" />
            Applied {candidate.createdAt ? new Date(candidate.createdAt).toLocaleDateString() : "—"}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-5 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
          <button
            onClick={onDelete}
            className="px-3 py-2 rounded-lg text-xs font-medium text-red-400 hover:text-red-600 hover:bg-red-50 transition-colors flex items-center gap-1.5"
          >
            <Trash2 size={12} /> Delete
          </button>
          <div className="flex gap-2">
            <button onClick={onClose} className="px-4 py-2 rounded-lg text-xs font-medium text-gray-500 hover:text-gray-700 transition-colors">
              Close
            </button>
            {isEditing && (
              <button onClick={handleSave} className="px-4 py-2 rounded-lg bg-gray-900 hover:bg-black text-white text-xs font-bold transition-colors">
                Save Changes
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// ─── ADD CANDIDATE MODAL ─────────────────────────────────────────

function AddCandidateModal({
  onClose,
  onSave,
  jobs,
}: {
  onClose: () => void;
  onSave: () => void;
  jobs: any[];
}) {
  const [form, setForm] = useState({
    name: "", email: "", phone: "", position: "", stage: "APPLIED",
    source: "", rating: 0, notes: "", jobPostingId: "",
  });
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const handleSave = async () => {
    if (!form.name || !form.email || !form.position) {
      toast("Name, email, and position are required", "error");
      return;
    }
    setSaving(true);
    try {
      const token = localStorage.getItem("token") || "";
      // Clean up empty foreign keys to null so Prisma doesn't try to resolve them
      const payload = {
        ...form,
        jobPostingId: form.jobPostingId || null,
      };
      const res = await fetch(`${API_BASE}/recruitment-ats`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        toast("Candidate added successfully", "success");
        onSave();
        onClose();
      } else {
        const err = await res.json();
        toast(err?.message || "Failed to add candidate", "error");
      }
    } catch (err) {
      toast("Error adding candidate", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl w-full max-w-md shadow-xl"
      >
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h3 className="text-lg font-bold text-black">Add Candidate</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center text-black hover:text-black">
            <X size={16} />
          </button>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1 block">Full Name *</label>
            <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-gray-400" placeholder="Abebech Tesfaye" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1 block">Email *</label>
              <input value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-gray-400" placeholder="abebech@example.com" />
            </div>
            <div>
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1 block">Phone</label>
              <PhoneInput
                country="et"
                value={form.phone}
                onChange={val => setForm({ ...form, phone: val })}
                inputStyle={{
                  width: "100%",
                  height: "42px",
                  border: "1px solid #e2e8f0",
                  borderRadius: "0.5rem",
                  fontSize: "14px",
                  fontFamily: "inherit",
                  background: "white",
                  color: "#0f172a",
                }}
                buttonStyle={{
                  border: "1px solid #e2e8f0",
                  borderRight: "none",
                  borderRadius: "0.5rem 0 0 0.5rem",
                  background: "#f8fafc",
                }}
                dropdownStyle={{
                  borderRadius: "0.5rem",
                  border: "1px solid #e2e8f0",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
                }}
                containerStyle={{ width: "100%" }}
                enableSearch
                searchStyle={{
                  border: "1px solid #e2e8f0",
                  borderRadius: "0.375rem",
                  padding: "6px 10px",
                  fontSize: "13px",
                  outline: "none",
                }}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1 block">Position</label>
              <input value={form.position} onChange={e => setForm({ ...form, position: e.target.value })} className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-gray-400" placeholder="Software Engineer" />
            </div>
            <div>
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1 block">Job Posting</label>
              <select value={form.jobPostingId} onChange={e => setForm({ ...form, jobPostingId: e.target.value })} className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-gray-400">
                <option value="">General Application</option>
                {jobs.map((j: any) => (
                  <option key={j.id} value={j.id}>{j.title}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1 block">Source</label>
            <select value={form.source} onChange={e => setForm({ ...form, source: e.target.value })} className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-gray-400">
              <option value="">Select source...</option>
              <option value="LinkedIn">LinkedIn</option>
              <option value="Referral">Referral</option>
              <option value="Website">Website</option>
              <option value="Job Board">Job Board</option>
              <option value="Agency">Agency</option>
              <option value="Direct">Direct Application</option>
            </select>
          </div>
          <div>
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1 block">Notes</label>
            <textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} rows={3} className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm resize-none focus:outline-none focus:border-gray-400" placeholder="Any initial notes..." />
          </div>
        </div>
        <div className="flex justify-end gap-2 p-5 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
          <button onClick={onClose} className="px-4 py-2 rounded-lg text-xs font-medium text-gray-500 hover:text-gray-700 transition-colors">Cancel</button>
          <button onClick={handleSave} disabled={saving} className="px-5 py-2 rounded-lg bg-gray-900 hover:bg-black text-white text-xs font-bold transition-colors disabled:opacity-50 flex items-center gap-1.5">
            {saving ? <Loader size={12} className="animate-spin" /> : <Plus size={12} />}
            {saving ? "Adding..." : "Add Candidate"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ─── JOB POSTING MODAL ───────────────────────────────────────────

function JobPostingModal({
  job,
  onClose,
  onSave,
}: {
  job: any;
  onClose: () => void;
  onSave: () => void;
}) {
  const isEdit = !!job?.id;
  const [form, setForm] = useState({
    title: job?.title || "", description: job?.description || "",
    department: job?.department || "", location: job?.location || "",
    type: job?.type || "FULL_TIME", salaryMin: job?.salaryMin || "",
    salaryMax: job?.salaryMax || "", currency: job?.currency || "ETB",
    status: job?.status || "DRAFT", requirements: job?.requirements || "",
    responsibilities: job?.responsibilities || "", closingDate: job?.closingDate || "",
  });
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const handleSave = async () => {
    if (!form.title) { toast("Job title is required", "error"); return; }
    setSaving(true);
    try {
      const token = localStorage.getItem("token") || "";
      const url = isEdit ? `${API_BASE}/job-posting/${job.id}` : `${API_BASE}/job-posting`;
      const method = isEdit ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          ...form,
          salaryMin: form.salaryMin ? Number(form.salaryMin) : null,
          salaryMax: form.salaryMax ? Number(form.salaryMax) : null,
        }),
      });
      if (res.ok) {
        toast(isEdit ? "Job posting updated" : "Job posting created", "success");
        onSave();
        onClose();
      } else {
        const err = await res.json();
        toast(err?.message || "Failed to save job", "error");
      }
    } catch (err) {
      toast("Error saving job posting", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl w-full max-w-lg shadow-xl max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h3 className="text-lg font-bold text-black">{isEdit ? "Edit Job" : "New Job Posting"}</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center text-black hover:text-black">
            <X size={16} />
          </button>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1 block">Job Title *</label>
            <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-gray-400" placeholder="Senior Software Engineer" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1 block">Department</label>
              <input value={form.department} onChange={e => setForm({ ...form, department: e.target.value })} className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm" placeholder="Engineering" />
            </div>
            <div>
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1 block">Location</label>
              <input value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm" placeholder="Addis Ababa" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1 block">Type</label>
              <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm">
                <option value="FULL_TIME">Full Time</option>
                <option value="PART_TIME">Part Time</option>
                <option value="CONTRACT">Contract</option>
                <option value="REMOTE">Remote</option>
                <option value="HYBRID">Hybrid</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1 block">Min Salary</label>
              <input type="number" value={form.salaryMin} onChange={e => setForm({ ...form, salaryMin: e.target.value })} className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm" placeholder="50000" />
            </div>
            <div>
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1 block">Max Salary</label>
              <input type="number" value={form.salaryMax} onChange={e => setForm({ ...form, salaryMax: e.target.value })} className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm" placeholder="120000" />
            </div>
          </div>
          <div>
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1 block">Description</label>
            <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3} className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm resize-none" placeholder="Job description..." />
          </div>
          <div>
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1 block">Requirements</label>
            <textarea value={form.requirements} onChange={e => setForm({ ...form, requirements: e.target.value })} rows={3} className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm resize-none" placeholder="Key requirements..." />
          </div>
          <div>
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1 block">Responsibilities</label>
            <textarea value={form.responsibilities} onChange={e => setForm({ ...form, responsibilities: e.target.value })} rows={3} className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm resize-none" placeholder="Key responsibilities..." />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1 block">Status</label>
              <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm">
                <option value="DRAFT">Draft</option>
                <option value="ACTIVE">Active</option>
                <option value="CLOSED">Closed</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1 block">Closing Date</label>
              <input type="date" value={form.closingDate} onChange={e => setForm({ ...form, closingDate: e.target.value })} className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm" />
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-2 p-5 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
          <button onClick={onClose} className="px-4 py-2 rounded-lg text-xs font-medium text-gray-500 hover:text-gray-700 transition-colors">Cancel</button>
          <button onClick={handleSave} disabled={saving} className="px-5 py-2 rounded-lg bg-gray-900 hover:bg-black text-white text-xs font-bold transition-colors disabled:opacity-50">
            {saving ? "Saving..." : isEdit ? "Update Job" : "Create Job"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ─── AI RANKING MODAL ────────────────────────────────────────────

function AIRankingModal({
  open,
  candidates,
  onClose,
}: {
  open: boolean;
  candidates: any[];
  onClose: () => void;
}) {
  const [ranked, setRanked] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    // Simulate AI ranking based on rating + stage progression
    setTimeout(() => {
      const sorted = [...candidates]
        .filter(c => c.stage !== "HIRED" && c.stage !== "REJECTED")
        .sort((a, b) => {
          // Score: rating * 10 + stage progression score
          const stageOrder = ["APPLIED", "SCREENING", "INTERVIEW_1", "INTERVIEW_2", "OFFER_EXTENDED"];
          const aStageIdx = stageOrder.indexOf(a.stage);
          const bStageIdx = stageOrder.indexOf(b.stage);
          const aScore = (a.rating || 0) * 10 + aStageIdx * 2;
          const bScore = (b.rating || 0) * 10 + bStageIdx * 2;
          return bScore - aScore;
        })
        .map((c, i) => ({ ...c, rank: i + 1, matchScore: Math.min(99, (c.rating || 0) * 18 + Math.floor(Math.random() * 10)) }));
      setRanked(sorted);
      setLoading(false);
      toast("AI ranking complete", "success");
    }, 1500);
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl w-full max-w-lg shadow-xl max-h-[80vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gray-900 flex items-center justify-center">
              <BrainCircuit size={14} className="text-black" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-black">AI Candidate Ranking</h3>
              <p className="text-[10px] text-gray-400">Candidates sorted by AI match score</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center text-black">
            <X size={16} />
          </button>
        </div>
        <div className="p-5 space-y-2.5">
          {loading ? (
            <div className="text-center py-12">
              <Loader size={24} className="mx-auto text-black/40 animate-spin mb-3" />
              <p className="text-sm text-gray-400 font-medium">AI is analyzing candidates...</p>
              <p className="text-xs text-gray-300 mt-1">Evaluating skills, experience, and fit</p>
            </div>
          ) : (
            ranked.map((c, i) => (
              <div key={c.id || i} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                  i === 0 ? "bg-gray-900 text-white" : "bg-gray-200 text-gray-500"
                }`}>
                  {c.rank}
                </div>
                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-[10px] font-bold text-black shrink-0">
                  {getInitials(c.name)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-black truncate">{c.name}</div>
                  <div className="text-[10px] text-gray-400">{c.position} · {formatStageLabel(c.stage)}</div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-sm font-bold text-black">{c.matchScore}%</div>
                  <div className="text-[9px] text-gray-400">Match</div>
                </div>
              </div>
            ))
          )}
        </div>
        <div className="flex justify-end p-5 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
          <button onClick={onClose} className="px-4 py-2 rounded-lg text-xs font-medium text-gray-500 hover:text-gray-700 transition-colors">Close</button>
        </div>
      </motion.div>
    </div>
  );
}

// ─── MAIN ATS KANBAN COMPONENT ───────────────────────────────────

export default function ATSKanban() {
  const [candidates, setCandidates] = useState<any[]>([]);
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCandidate, setSelectedCandidate] = useState<any>(null);
  const [showAddCandidate, setShowAddCandidate] = useState(false);
  const [showJobModal, setShowJobModal] = useState(false);
  const [editingJob, setEditingJob] = useState<any>(null);
  const [showAIRanking, setShowAIRanking] = useState(false);
  const [search, setSearch] = useState("");
  const [showJobsPanel, setShowJobsPanel] = useState(false);
  const [draggedCandidate, setDraggedCandidate] = useState<any>(null);
  const [confirmState, setConfirmState] = useState<{
    variant: "hire" | "delete";
    candidate?: any;
  } | null>(null);
  const { toast } = useToast();

  // ── Data Loading ──────────────────────────────────────────
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token") || "";

      const [candRes, jobsRes] = await Promise.all([
        fetch(`${API_BASE}/recruitment-ats`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        fetch(`${API_BASE}/job-posting`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
      ]);

      const candData = await candRes.json();
      const jobsData = await jobsRes.json();

      setCandidates(candData?.data || []);
      setJobs(jobsData?.data || []);
    } catch (err) {
      console.error("Failed to load ATS data:", err);
      toast("Failed to load ATS data from server", "error");
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => { loadData(); }, [loadData]);

  // ── Filtered candidates by search ─────────────────────────
  const filteredBySearch = candidates.filter(c =>
    !search || c.name?.toLowerCase().includes(search.toLowerCase()) ||
    c.email?.toLowerCase().includes(search.toLowerCase()) ||
    c.position?.toLowerCase().includes(search.toLowerCase())
  );

  // Group by stage
  const candidatesByStage = Object.fromEntries(
    PIPELINE_STAGES.map(s => [s.id, filteredBySearch.filter(c => c.stage === s.id)])
  );

  // ── Drag & Drop ───────────────────────────────────────────
  const handleDragStart = (e: React.DragEvent, candidate: any) => {
    setDraggedCandidate(candidate);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", candidate.id || candidate.prismaId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = async (e: React.DragEvent, stageId: string) => {
    e.preventDefault();
    const candidateId = e.dataTransfer.getData("text/plain");
    if (!candidateId || !draggedCandidate) return;

    const newStage = stageId;
    if (draggedCandidate.stage === newStage) return;

    try {
      const token = localStorage.getItem("token") || "";
      const res = await fetch(`${API_BASE}/recruitment-ats/${candidateId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ stage: newStage }),
      });

      if (res.ok) {
        // Update local state
        setCandidates(prev =>
          prev.map(c => (c.id === candidateId || c.prismaId === candidateId) ? { ...c, stage: newStage } : c)
        );
        toast(`Moved to ${formatStageLabel(newStage)}`, "success");
      } else {
        const err = await res.json();
        toast(err?.message || "Failed to update stage", "error");
      }
    } catch (err) {
      toast("Error updating stage", "error");
    }
    setDraggedCandidate(null);
  };

  // ── Hire Candidate (Auto-Onboarding) ──────────────────────
  const handleHire = async (candidate: any) => {
    setConfirmState({ variant: "hire", candidate });
  };

  const confirmHire = async () => {
    const candidate = confirmState?.candidate;
    if (!candidate) return;
    setConfirmState(null);
    try {
      const token = localStorage.getItem("token") || "";
      const res = await fetch(`${API_BASE}/recruitment-ats/${candidate.id || candidate.prismaId}/hire`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const data = await res.json();
        toast(`🎉 ${candidate.name} hired! Employee record created.`, "success");

        // Refresh data
        loadData();
        setSelectedCandidate(null);
      } else {
        const err = await res.json();
        toast(err?.message || "Failed to hire candidate", "error");
      }
    } catch (err) {
      toast("Error hiring candidate", "error");
    }
  };

  // ── Stage Change from Modal ───────────────────────────────
  const handleStageChange = async (stage: string) => {
    if (!selectedCandidate) return;
    try {
      const token = localStorage.getItem("token") || "";
      const res = await fetch(`${API_BASE}/recruitment-ats/${selectedCandidate.id || selectedCandidate.prismaId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ stage }),
      });
      if (res.ok) {
        setCandidates(prev =>
          prev.map(c => (c.id === selectedCandidate.id || c.prismaId === selectedCandidate.prismaId) ? { ...c, stage } : c)
        );
        setSelectedCandidate((prev: any) => prev ? { ...prev, stage } : null);
        toast(`Stage updated to ${formatStageLabel(stage)}`, "success");
      }
    } catch (err) {
      toast("Error updating stage", "error");
    }
  };

  // ── Delete Candidate ──────────────────────────────────────
  const handleDelete = async () => {
    if (!selectedCandidate) return;
    setConfirmState({ variant: "delete", candidate: selectedCandidate });
  };

  const confirmDelete = async () => {
    const candidate = confirmState?.candidate;
    if (!candidate) return;
    setConfirmState(null);
    try {
      const token = localStorage.getItem("token") || "";
      const res = await fetch(`${API_BASE}/recruitment-ats/${candidate.id || candidate.prismaId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        toast(`${candidate.name} deleted`, "success");
        setSelectedCandidate(null);
        loadData();
      } else {
        toast("Failed to delete candidate", "error");
      }
    } catch (err) {
      toast("Error deleting candidate", "error");
    }
  };

  // ── AI Quick Ranking ──────────────────────────────────────
  const handleAIAnalyze = async () => {
    setShowAIRanking(true);
  };

  // Stats
  const total = candidates.length;
  const active = candidates.filter(c => c.stage !== "HIRED" && c.stage !== "REJECTED").length;
  const hired = candidates.filter(c => c.stage === "HIRED").length;
  const interviewed = candidates.filter(c => c.stage === "INTERVIEW_1" || c.stage === "INTERVIEW_2").length;

  const kpiCards = [
    { label: "Total Candidates", value: total, change: "All time" },
    { label: "Active Pipeline", value: active, change: "In progress" },
    { label: "Interviewed", value: interviewed, change: "Stage 3+4" },
    { label: "Hired", value: hired, change: "Converted" },
  ];

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto pb-20">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="flex flex-col items-center gap-4">
            <Loader size={32} className="text-black/20 animate-spin" />
            <p className="text-sm text-black/40 font-medium">Loading ATS pipeline...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1600px] mx-auto pb-20">
      {/* ── HEADER ──────────────────────────────────────────── */}
      <div className="border-b border-gray-200 pb-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-black tracking-tight">Recruitment (ATS)</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Full pipeline management · {total} candidates · {jobs.length} active jobs
            </p>
          </div>
          <div className="flex items-center gap-2">                <button
              onClick={() => setShowJobsPanel(!showJobsPanel)}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-medium transition-all ${
                showJobsPanel ? "bg-gray-900 text-white border-gray-900" : "border-gray-200 text-black/60 hover:border-gray-300"
              }`}
            >
              <Briefcase size={13} className="text-black" /> Jobs
            </button>
            <button
              onClick={handleAIAnalyze}
              className="flex items-center gap-2 px-3 py-2 rounded-xl border border-gray-200 text-xs font-medium text-black/60 hover:bg-gray-50 transition-all"
            >
              <BrainCircuit size={13} className="text-black" /> AI Rank
            </button>
            <button                onClick={() => setShowAddCandidate(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-900 hover:bg-black text-white text-xs font-bold transition-all"
            >
              <Plus size={13} className="text-white" /> Add Candidate
            </button>
          </div>
        </div>

        {/* KPI Strip */}
        <div className="grid grid-cols-4 gap-4 mt-6">
          {kpiCards.map((kpi, i) => (
            <div key={i} className="bg-white border border-gray-200 rounded-xl px-4 py-3">
              <div className="text-2xl font-bold text-black tracking-tight leading-none mb-1">{kpi.value}</div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500 font-medium">{kpi.label}</span>
                <span className="text-[10px] text-black/40 font-medium">{kpi.change}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── SEARCH BAR ──────────────────────────────────────── */}
      <div className="flex items-center gap-3 mb-6">
        <div className="relative flex-1 max-w-md">              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-black" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search candidates by name, email, or position..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent placeholder:text-gray-400"
          />
        </div>
        <div className="flex items-center gap-2 text-xs text-black/40">
          <Clock size={12} className="text-black" /> Last updated: {new Date().toLocaleTimeString()}
        </div>
      </div>

      {/* ── MAIN LAYOUT ─────────────────────────────────────── */}
      <div className="flex gap-6">
        {/* ── JOBS PANEL (sidebar) ─────────────────────────── */}
        {showJobsPanel && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="w-64 shrink-0 space-y-3"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-black uppercase tracking-widest">Job Postings</h3>
              <button
                onClick={() => { setEditingJob(null); setShowJobModal(true); }}
                className="w-6 h-6 rounded-md bg-gray-900 hover:bg-black flex items-center justify-center transition-colors"
              >                  <Plus size={10} className="text-white" />
              </button>
            </div>
            {jobs.length === 0 ? (
              <div className="text-center py-8 bg-gray-50 rounded-xl border border-gray-100">
                <Briefcase size={20} className="mx-auto text-black mb-2" />
                <p className="text-xs text-black/40">No jobs posted yet</p>
                <button
                  onClick={() => { setEditingJob(null); setShowJobModal(true); }}
                  className="mt-2 text-[10px] font-semibold text-gray-600 hover:text-black underline"
                >
                  Create first job
                </button>
              </div>
            ) : (
              jobs.map((job, i) => {
                const candidateCount = candidates.filter(c => c.jobPostingId === job.id).length;
                return (
                  <div key={job.id || i} className="bg-white border border-gray-200 rounded-xl p-3.5 hover:border-gray-300 transition-colors cursor-pointer"
                    onClick={() => { setEditingJob(job); setShowJobModal(true); }}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                        job.status === "ACTIVE" ? "bg-gray-100 text-gray-700" :
                        job.status === "DRAFT" ? "bg-gray-50 text-gray-400" : "bg-gray-50 text-gray-400"
                      }`}>{job.status}</span>
                      <span className="text-[10px] text-gray-400">{candidateCount} applicants</span>
                    </div>
                    <div className="text-sm font-semibold text-black truncate">{job.title}</div>
                    <div className="flex items-center gap-2 text-[10px] text-gray-400 mt-1">
                      {job.department && <span>{job.department}</span>}
                      {job.location && <span>· {job.location}</span>}
                      {job.type && <span>· {job.type.replace(/_/g, " ")}</span>}
                    </div>
                    {(job.salaryMin || job.salaryMax) && (
                      <div className="text-[10px] text-gray-500 mt-1 font-medium">
                        {job.salaryMin ? `ETB ${Number(job.salaryMin).toLocaleString()}` : ""}
                        {job.salaryMin && job.salaryMax ? " - " : ""}
                        {job.salaryMax ? `ETB ${Number(job.salaryMax).toLocaleString()}` : ""}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </motion.div>
        )}

        {/* ── KANBAN BOARD ──────────────────────────────────── */}
        <div className="flex-1 min-w-0">
          <div className="flex gap-4 overflow-x-auto pb-4">
            {PIPELINE_STAGES.map(stage => (
              <PipelineColumn
                key={stage.id}
                stage={stage}
                candidates={candidatesByStage[stage.id] || []}
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClickCandidate={setSelectedCandidate}
                onHire={handleHire}
              />
            ))}
          </div>
        </div>
      </div>

      {/* ── MODALS ──────────────────────────────────────────── */}
      {selectedCandidate && (
        <CandidateDetailModal
          candidate={selectedCandidate}
          onClose={() => setSelectedCandidate(null)}
          onSave={data => {
            setCandidates(prev => prev.map(c =>
              (c.id === data.id || c.prismaId === data.prismaId) ? data : c
            ));
          }}
          onDelete={handleDelete}
          onStageChange={handleStageChange}
          onHire={() => handleHire(selectedCandidate)}
        />
      )}

      {showAddCandidate && (
        <AddCandidateModal
          onClose={() => setShowAddCandidate(false)}
          onSave={loadData}
          jobs={jobs}
        />
      )}

      {showJobModal && (
        <JobPostingModal
          job={editingJob}
          onClose={() => { setShowJobModal(false); setEditingJob(null); }}
          onSave={loadData}
        />
      )}

      <AIRankingModal
        open={showAIRanking}
        candidates={candidates}
        onClose={() => setShowAIRanking(false)}
      />

      {/* Confirm Dialogs */}
      <ConfirmDialog
        open={confirmState?.variant === "hire"}
        variant="hire"
        title="Hire Candidate"
        message={`Hire ${confirmState?.candidate?.name}? This will create an Employee record and move them to HIRED.`}
        confirmLabel="Hire Candidate"
        onConfirm={confirmHire}
        onCancel={() => setConfirmState(null)}
      />
      <ConfirmDialog
        open={confirmState?.variant === "delete"}
        variant="danger"
        title="Delete Candidate"
        message={`Delete ${confirmState?.candidate?.name}? This action cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={confirmDelete}
        onCancel={() => setConfirmState(null)}
      />
    </div>
  );
}

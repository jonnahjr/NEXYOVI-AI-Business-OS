"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  BrainCircuit, Users, Activity, Package, Wallet, ShoppingCart,
  Factory, Truck, ClipboardList, FileText, Megaphone, Store, BarChart2,
  MessageSquare, Workflow, ShieldCheck, Globe, Building2, Flag,
  ArrowRight, ShieldCheck as Shield
} from "lucide-react";
import Link from "next/link";
import DemoModal from "./DemoModal";
import { toSlug } from "@/lib/pillars";

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05, delayChildren: 0.4 } }
};
const itemVariants = {
  hidden: { y: 16, opacity: 0 },
  show: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 300, damping: 26 } }
};

const pillars = [
  { emoji: "🧠", name: "AI Core",                icon: BrainCircuit,  count: 10, desc: "Autonomous agents, decision engine, voice AI" },
  { emoji: "👥", name: "Human Resources",        icon: Users,          count: 15, desc: "Employee lifecycle, payroll, LMS & more" },
  { emoji: "🤝", name: "CRM & Sales",            icon: Activity,       count: 13, desc: "Pipeline, customers, contracts & forecasting" },
  { emoji: "📦", name: "Inventory & Warehouse",  icon: Package,        count: 13, desc: "Multi-warehouse, barcode & stock transfers" },
  { emoji: "💰", name: "Finance & Accounting",   icon: Wallet,         count: 13, desc: "GL, AP/AR, multi-currency & tax compliance" },
  { emoji: "🛒", name: "Procurement",            icon: ShoppingCart,   count: 8,  desc: "Vendors, RFQs, tenders & approval chains" },
  { emoji: "🏭", name: "Manufacturing",          icon: Factory,        count: 8,  desc: "BOM, work orders, quality & scheduling" },
  { emoji: "🚚", name: "Logistics & Fleet",      icon: Truck,          count: 8,  desc: "GPS tracking, route optimization, delivery" },
  { emoji: "📋", name: "Project Management",     icon: ClipboardList,  count: 9,  desc: "Kanban, Gantt, Scrum & resource allocation" },
  { emoji: "📄", name: "Document Management",    icon: FileText,       count: 7,  desc: "AI OCR, versioning & digital signatures" },
  { emoji: "📢", name: "Marketing",              icon: Megaphone,      count: 7,  desc: "Email, SMS, social media & AI content" },
  { emoji: "🛍️", name: "E-Commerce",            icon: Store,          count: 8,  desc: "Online store, payments & marketplace" },
  { emoji: "📊", name: "Business Intelligence",  icon: BarChart2,      count: 7,  desc: "KPIs, AI insights & custom reports" },
  { emoji: "💬", name: "Communication Hub",      icon: MessageSquare,  count: 7,  desc: "Chat, video, WhatsApp & voice calls" },
  { emoji: "⚙️", name: "Workflow Automation",   icon: Workflow,       count: 6,  desc: "Drag-and-drop builder & event triggers" },
  { emoji: "🔒", name: "Security & Compliance", icon: ShieldCheck,    count: 8,  desc: "RBAC, SSO, MFA & audit trail" },
  { emoji: "🌍", name: "Platform & Integrations",icon: Globe,          count: 8,  desc: "REST, GraphQL, webhooks & cloud connectors" },
  { emoji: "🏢", name: "Industry Solutions",     icon: Building2,      count: 10, desc: "Hospital, School, Hotel, NGO & Gov ERP" },
  { emoji: "🇪🇹", name: "Ethiopia Features",    icon: Flag,           count: 8,  desc: "Telebirr, Ethiopian calendar & local compliance" },
];

export default function HeroDashboard({ user }: { user: any }) {
  const [showDemo, setShowDemo] = useState(false);

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      {/* ── HERO ────────────────────────────────────── */}
      <section className="flex flex-col items-center justify-center text-center px-6 pt-28 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-slate-200 bg-slate-50 mb-8 text-slate-500 text-xs font-semibold uppercase tracking-widest shadow-sm">
            <Shield size={13} />
            NEXYOVI AI OS · 19 Pillars · 500+ Features
          </div>

          <h1 className="text-5xl md:text-7xl font-light tracking-tighter mb-6 text-slate-900 max-w-4xl mx-auto">
            The future of<br />
            <span className="font-bold">Enterprise Management.</span>
          </h1>

          <p className="text-lg text-slate-500 mb-10 max-w-2xl mx-auto font-light leading-relaxed">
            A world-class AI Business OS designed for Ethiopia — unifying HR, Finance, CRM, Manufacturing, Logistics, and AI Agents in one platform.
          </p>

          <div className="flex gap-4 justify-center flex-wrap">
            <Link href="/dashboard">
              <button className="px-8 py-4 rounded-full bg-primary hover:bg-primary/90 text-black font-medium transition-all shadow-xl hover:shadow-2xl flex items-center gap-2">
                Enter Command Center <ArrowRight size={18} />
              </button>
            </Link>
            <button
              onClick={() => setShowDemo(true)}
              className="px-8 py-4 rounded-full bg-primary hover:bg-primary/90 text-black font-medium transition-all shadow-xl hover:shadow-2xl"
            >
              Request Demo
            </button>
          </div>

          {user && (
            <p className="mt-6 text-sm text-slate-400 font-light">
              Signed in as <span className="text-slate-700 font-medium">{user.email}</span>
            </p>
          )}
        </motion.div>
      </section>

      {/* ── STATS BAR ───────────────────────────────── */}
      <section className="border-y border-slate-100 bg-slate-50 py-6">
        <div className="max-w-5xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            { val: "19",   label: "Pillars" },
            { val: "500+", label: "Features" },
            { val: "50+",  label: "AI Agents" },
            { val: "10+",  label: "Industries" },
          ].map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 + i * 0.1 }}>
              <div className="text-3xl font-bold text-slate-900">{s.val}</div>
              <div className="text-sm text-slate-500 font-light">{s.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── ALL 19 PILLARS GRID ─────────────────────── */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight mb-3">Everything your business needs</h2>
          <p className="text-slate-500 font-light max-w-xl mx-auto">19 enterprise pillars covering every function of your organisation — from AI to Ethiopia-specific compliance.</p>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
        >
          {pillars.map((p, i) => (
            <Link key={i} href={`/dashboard/${toSlug(p.name)}`} className="block">
              <motion.div
                variants={itemVariants}
                className="bg-slate-900 rounded-2xl p-6 shadow-md hover:bg-slate-800 transition-all cursor-pointer group h-full"
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="text-2xl">{p.emoji}</span>
                  <span className="text-[10px] font-bold bg-white/10 text-white/50 px-2 py-1 rounded-lg group-hover:bg-white/20 transition-colors">
                    {p.count} features
                  </span>
                </div>
                <h3 className="text-sm font-semibold text-white mb-1.5">{p.name}</h3>
                <p className="text-xs text-slate-400 font-light leading-relaxed">{p.desc}</p>
              </motion.div>
            </Link>
          ))}
        </motion.div>
      </section>

      {/* ── ETHIOPIA HIGHLIGHT ──────────────────────── */}
      <section className="bg-slate-900 py-16 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="text-4xl mb-4">🇪🇹</div>
          <h2 className="text-3xl font-bold text-white mb-4 tracking-tight">Built for Ethiopia</h2>
          <p className="text-slate-400 font-light mb-10 max-w-2xl mx-auto">
            Telebirr & CBE Birr integration, Ethiopian Calendar, Amharic / Afaan Oromo / Tigrinya / Somali UI, local VAT & Pension calculations, and Government Procurement workflows — all built-in.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {["Telebirr", "CBE Birr", "Ethiopian Calendar", "Amharic UI"].map((f, i) => (
              <div key={i} className="bg-white/5 border border-white/10 rounded-xl py-4 px-3 text-sm text-white font-medium">
                {f}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FOOTER CTA ──────────────────────────────── */}
      <section className="py-20 text-center px-6">
        <h2 className="text-3xl font-bold text-slate-900 mb-4">Ready to transform your business?</h2>
        <p className="text-slate-500 font-light mb-8 max-w-lg mx-auto">Join Ethiopia's most advanced AI Business Operating System.</p>
        <div className="flex gap-4 justify-center flex-wrap">
          <Link href="/dashboard">
            <button className="px-8 py-4 rounded-full bg-primary hover:bg-primary/90 text-black font-medium transition-all shadow-xl hover:shadow-2xl flex items-center gap-2">
              Get Started <ArrowRight size={18} />
            </button>
          </Link>
          <button
            onClick={() => setShowDemo(true)}
            className="px-8 py-4 rounded-full bg-primary hover:bg-primary/90 text-black font-medium transition-all shadow-xl hover:shadow-2xl"
          >
            Request Demo
          </button>
        </div>
      </section>

      {showDemo && <DemoModal onClose={() => setShowDemo(false)} />}
    </div>
  );
}

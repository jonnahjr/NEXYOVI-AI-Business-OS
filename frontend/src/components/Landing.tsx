"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BrainCircuit, Sparkles, Building2, ShieldCheck, Flag,
  ChevronRight, Play, ArrowRight, CheckCircle2, MessageSquare, Briefcase, Zap,
  Globe, Database
} from "lucide-react";
import Link from "next/link";
import DemoModal from "./DemoModal";

export default function Landing({ user }: { user: any }) {
  const [showDemo, setShowDemo] = useState(false);
  const [aiTextIndex, setAiTextIndex] = useState(0);

  const aiPrompts = [
    "Create this month's payroll...",
    "Generate Q3 financial report...",
    "Onboard new employee Sarah...",
    "Analyze low stock in Warehouse A..."
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setAiTextIndex((prev) => (prev + 1) % aiPrompts.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [aiPrompts.length]);

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-slate-900 selection:bg-primary/20 selection:text-primary overflow-x-hidden">
      
      {/* ── HERO SECTION ────────────────────────────────────── */}
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 px-6 flex flex-col items-center justify-center text-center overflow-hidden">
        {/* Abstract Background Elements */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative z-10 w-full max-w-5xl mx-auto"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-slate-200 bg-white/50 backdrop-blur-sm mb-8 text-slate-600 text-xs font-semibold uppercase tracking-widest shadow-sm">
            <Sparkles size={13} className="text-primary" />
            SASA AI Business Operating System
          </div>

          <h1 className="text-6xl md:text-8xl font-medium tracking-tighter mb-6 leading-[1.1]">
            One AI.<br />
            <span className="text-slate-400">One Platform.</span><br />
            Every Business.
          </h1>

          <p className="text-xl md:text-2xl text-slate-500 mb-12 max-w-2xl mx-auto font-light leading-relaxed">
            The world's first truly autonomous ERP. Built for the African Enterprise, powered by intelligence.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/dashboard">
              <button className="px-8 py-4 rounded-full bg-primary hover:bg-primary/90 text-black font-medium transition-all shadow-xl hover:shadow-2xl flex items-center gap-2 text-lg">
                Start Free <ArrowRight size={18} />
              </button>
            </Link>
            <button
              onClick={() => setShowDemo(true)}
              className="px-8 py-4 rounded-full bg-white border border-slate-200 hover:border-slate-300 text-slate-900 font-medium transition-all flex items-center gap-2 shadow-sm text-lg"
            >
              <Play size={16} className="text-primary" /> Watch Demo
            </button>
          </div>

          {user && (
            <p className="mt-6 text-sm text-slate-400 font-light">
              Signed in as <span className="text-slate-700 font-medium">{user.email}</span>
            </p>
          )}
        </motion.div>

        {/* Hero AI Animation */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.4, ease: "easeOut" }}
          className="relative z-10 w-full max-w-3xl mx-auto mt-20"
        >
          <div className="bg-white rounded-2xl shadow-2xl shadow-black/5 border border-slate-100 overflow-hidden backdrop-blur-xl flex flex-col">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-50 bg-slate-50/50">
              <div className="w-3 h-3 rounded-full bg-slate-200" />
              <div className="w-3 h-3 rounded-full bg-slate-200" />
              <div className="w-3 h-3 rounded-full bg-slate-200" />
              <span className="ml-2 text-xs font-medium text-slate-400">SASA AI Assistant</span>
            </div>
            <div className="p-6 md:p-8 flex items-start gap-4 text-left">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <BrainCircuit size={20} className="text-primary" />
              </div>
              <div className="flex-1">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={aiTextIndex}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.5 }}
                    className="text-xl md:text-2xl font-medium text-slate-800"
                  >
                    "{aiPrompts[aiTextIndex]}"
                  </motion.div>
                </AnimatePresence>
                <div className="mt-4 flex flex-col gap-2">
                  <div className="h-2 bg-slate-100 rounded-full w-3/4 animate-pulse" />
                  <div className="h-2 bg-slate-100 rounded-full w-1/2 animate-pulse delay-75" />
                  <div className="h-2 bg-slate-100 rounded-full w-5/6 animate-pulse delay-150" />
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ── TRUSTED BY LOGOS ──────────────────────────────── */}
      <section className="py-10 border-y border-slate-100 bg-white overflow-hidden">
        <p className="text-center text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">Trusted by Innovative Enterprises</p>
        <div className="flex justify-center items-center gap-12 md:gap-24 opacity-40 grayscale flex-wrap px-6">
          <div className="text-xl font-bold flex items-center gap-2"><Briefcase /> TechFlow</div>
          <div className="text-xl font-bold flex items-center gap-2"><Globe /> GlobalTrade</div>
          <div className="text-xl font-bold flex items-center gap-2"><Zap /> NovaEnergy</div>
          <div className="text-xl font-bold flex items-center gap-2"><Database /> DataSys</div>
          <div className="text-xl font-bold flex items-center gap-2"><Building2 /> BuildCorp</div>
        </div>
      </section>

      {/* ── WHY SASA? ────────────────────────────────────── */}
      <section className="py-32 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">Why SASA?</h2>
          <p className="text-xl text-slate-500 font-light">Everything you need, unified by intelligence.</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { title: "19 Enterprise Pillars", icon: Database, desc: "From HR to Manufacturing, fully integrated." },
            { title: "500+ Modules", icon: Briefcase, desc: "Deep, enterprise-grade functionality for every department." },
            { title: "AI Business Brain", icon: BrainCircuit, desc: "Understands your data, predicts trends, and automates tasks." },
            { title: "Ethiopian Localization", icon: Flag, desc: "Telebirr, CBE, Amharic, and local tax compliance built-in." },
            { title: "Enterprise Security", icon: ShieldCheck, desc: "Bank-grade encryption, RBAC, and comprehensive audit logs." },
            { title: "Universal Workflow", icon: Sparkles, desc: "Connect any module with no-code automated logic." }
          ].map((feature, i) => (
            <div key={i} className="p-8 rounded-3xl bg-white border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center mb-6">
                <feature.icon className="text-black" size={24} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">{feature.title}</h3>
              <p className="text-slate-500 font-light leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── INTERACTIVE AI DEMO ───────────────────────────── */}
      <section className="py-32 px-6 bg-slate-900 text-white overflow-hidden relative">
        
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-white/80 text-xs font-semibold uppercase tracking-widest mb-6 border border-white/20">
              <Sparkles size={12} className="text-primary" /> Magic Action
            </div>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6 leading-tight">
              Don't click menus.<br/>Just ask SASA.
            </h2>
            <p className="text-lg text-slate-400 font-light mb-8 leading-relaxed">
              Skip the 10-step process. Tell the AI what you want to achieve, and it builds the workflow, fills the forms, and executes the action instantly.
            </p>
            <ul className="space-y-4">
              {[
                "Natural Language ERP commands",
                "Automated data entry and validation",
                "Instant cross-module reporting"
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-slate-300 font-light">
                  <CheckCircle2 className="text-primary" size={20} /> {item}
                </li>
              ))}
            </ul>
          </div>
          
          {/* Mock Interactive Window */}
          <div className="bg-slate-800 rounded-3xl border border-white/10 shadow-2xl p-6 relative z-10">
            <div className="bg-slate-900 rounded-2xl p-4 flex items-center gap-3 mb-6 border border-white/5">
              <MessageSquare className="text-slate-500" size={20} />
              <span className="text-slate-300 flex-1 font-mono text-sm">Create payroll for June, include bonuses</span>
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                <ArrowRight size={14} className="text-black" />
              </div>
            </div>
            
            <div className="space-y-3">
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="bg-white/5 rounded-xl p-4 border border-white/5 flex items-center gap-4"
              >
                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                  <CheckCircle2 size={16} className="text-white" />
                </div>
                <div>
                  <div className="text-sm font-medium">Gathered employee data</div>
                  <div className="text-xs text-slate-400">45 active employees found</div>
                </div>
              </motion.div>
              
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
                className="bg-white/5 rounded-xl p-4 border border-white/5 flex items-center gap-4"
              >
                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                  <CheckCircle2 size={16} className="text-white" />
                </div>
                <div>
                  <div className="text-sm font-medium">Applied Q2 Bonuses</div>
                  <div className="text-xs text-slate-400">Sales team targets matched</div>
                </div>
              </motion.div>
              
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.6 }}
                className="bg-primary/10 rounded-xl p-4 border border-primary/20 flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                    <Sparkles size={16} className="text-primary" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-primary">Payroll Draft Ready</div>
                    <div className="text-xs text-primary/70">Total: ETB 1,245,000. Pending approval.</div>
                  </div>
                </div>
                <button className="px-4 py-1.5 rounded-full bg-primary text-black text-xs font-bold hover:bg-primary/90 transition-colors">
                  Review
                </button>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* ── INDUSTRIES ────────────────────────────────────── */}
      <section className="py-32 px-6 bg-slate-50 border-y border-slate-200">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">Built for Every Industry</h2>
          <p className="text-lg text-slate-500 font-light mb-16 max-w-2xl mx-auto">
            SASA adapts to your specific business model. No generic solutions.
          </p>
          
          <div className="flex flex-wrap justify-center gap-3 md:gap-4">
            {[
              "Healthcare", "Manufacturing", "Government", "Education", 
              "Retail & E-commerce", "Construction", "NGO & Non-Profit", 
              "Finance & Banking", "Hospitality", "Logistics"
            ].map((industry, i) => (
              <div key={i} className="px-6 py-3 rounded-full bg-white border border-slate-200 text-slate-700 font-medium hover:border-primary hover:text-primary transition-colors cursor-pointer shadow-sm">
                {industry}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURE SHOWCASE (Mini Pillars) ───────────────── */}
      <section className="py-32 px-6 max-w-7xl mx-auto text-center">
        <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-16">The complete suite.</h2>
        <div className="flex flex-wrap justify-center gap-x-12 gap-y-8">
          {[
            { label: "CRM & Sales",       icon: MessageSquare, slug: "crm-sales" },
            { label: "Human Resources",   icon: Building2,     slug: "human-resources" },
            { label: "Finance",           icon: Briefcase,     slug: "finance-accounting" },
            { label: "Inventory",         icon: Database,      slug: "inventory-warehouse" },
            { label: "AI Core",           icon: BrainCircuit,  slug: "ai-core" },
            { label: "Procurement",       icon: ShieldCheck,   slug: "procurement" },
            { label: "Manufacturing",     icon: Zap,           slug: "manufacturing" }
          ].map((f, i) => (
            <Link key={i} href={`/dashboard/${f.slug}`} className="flex flex-col items-center gap-3 group cursor-pointer">
              <div className="w-16 h-16 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center group-hover:bg-primary/10 group-hover:border-primary/30 transition-all group-hover:scale-110">
                <f.icon size={28} className="text-black group-hover:text-primary transition-colors" />
              </div>
              <span className="text-sm font-bold text-black">{f.label}</span>
            </Link>
          ))}
          <Link href="/dashboard" className="flex flex-col items-center justify-center gap-3 cursor-pointer group">
            <div className="w-16 h-16 rounded-2xl border-2 border-dashed border-slate-200 flex items-center justify-center group-hover:border-primary group-hover:bg-primary/5 transition-colors">
              <span className="text-xs font-bold text-slate-400 group-hover:text-primary transition-colors">+12 More</span>
            </div>
            <span className="text-sm font-bold text-black">All Pillars</span>
          </Link>
        </div>
      </section>

      {/* ── FOOTER CTA ────────────────────────────────────── */}
      <section className="py-32 px-6 bg-slate-900 text-center relative overflow-hidden">
        <div className="relative z-10 max-w-3xl mx-auto">
          <h2 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 text-white leading-tight">
            Ready to upgrade your business?
          </h2>
          <p className="text-xl text-slate-400 font-light mb-10">
            Join the AI-first revolution. Set up your workspace in minutes.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/dashboard">
              <button className="px-8 py-4 rounded-full bg-primary hover:bg-primary/90 text-black font-medium transition-all shadow-xl hover:shadow-2xl flex items-center gap-2 text-lg">
                Start Free Workspace <ArrowRight size={18} />
              </button>
            </Link>
            <button
              onClick={() => setShowDemo(true)}
              className="px-8 py-4 rounded-full bg-white/10 hover:bg-white/20 text-white font-medium transition-all flex items-center gap-2 text-lg border border-white/10"
            >
              Request Enterprise Demo
            </button>
          </div>
        </div>
      </section>

      {showDemo && <DemoModal onClose={() => setShowDemo(false)} />}
    </div>
  );
}

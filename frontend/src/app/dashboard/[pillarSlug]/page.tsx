"use client";

import { use } from "react";
import { notFound } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowRight, Box, BrainCircuit, Send } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { NEXYOVI_PILLARS, toSlug } from "@/lib/pillars";
import { getPillarConfig } from "@/lib/pillar-config";

export default function PillarPage({ params }: { params: Promise<{ pillarSlug: string }> }) {
  const resolvedParams = use(params);
  const pillar = NEXYOVI_PILLARS.find(p => toSlug(p.name) === resolvedParams.pillarSlug);
  if (!pillar) notFound();

  const config = getPillarConfig(resolvedParams.pillarSlug);

  return (
    <PillarPageContent pillar={pillar} config={config} pillarSlug={resolvedParams.pillarSlug} />
  );
}

function PillarPageContent({ pillar, config, pillarSlug }: { pillar: any; config: any; pillarSlug: string }) {
  const [aiInput, setAiInput] = useState("");
  const [aiMessages, setAiMessages] = useState([
    { role: "ai", text: config.aiContext }
  ]);
  const [loading, setLoading] = useState(false);

  const sendMessage = async (text?: string) => {
    const msg = text ?? aiInput;
    if (!msg.trim()) return;
    setAiMessages(prev => [...prev, { role: "user", text: msg }]);
    setAiInput("");
    setLoading(true);
    await new Promise(r => setTimeout(r, 1000));
    setAiMessages(prev => [...prev, {
      role: "ai",
      text: `Processing: "${msg}". I'll execute this across the ${pillar.name} modules automatically.`
    }]);
    setLoading(false);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-20">

      {/* ── PILLAR HERO ─────────────────────────────────── */}
      <div className={`bg-gradient-to-r ${config.color} rounded-3xl p-8 md:p-10 text-white relative overflow-hidden shadow-xl`}>
        <div className="relative z-10 flex flex-col md:flex-row gap-6 md:items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <span className="text-5xl">{pillar.emoji}</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2">{pillar.name}</h1>
            <p className="text-white/70 text-sm font-light max-w-xl">{pillar.desc}</p>
          </div>
          <div className="shrink-0 bg-white/10 border border-white/20 rounded-2xl p-6 text-center backdrop-blur-md">
            <div className="text-4xl font-bold mb-1">{pillar.modules.length}</div>
            <div className="text-xs text-white/50 font-semibold uppercase tracking-widest">Modules</div>
          </div>
        </div>
        <div className="absolute -right-10 -bottom-16 text-white/5 pointer-events-none">
          <pillar.icon size={260} strokeWidth={0.5} />
        </div>
      </div>

      {/* ── KPI STRIP ───────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {config.kpis.map((kpi: any, i: number) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
            className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center">
                <kpi.icon size={16} className="text-slate-600" />
              </div>
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                "bg-slate-100 text-slate-900"
              }`}>{kpi.change}</span>
            </div>
            <div className="text-2xl font-bold text-slate-900 leading-none mb-1">{kpi.value}</div>
            <div className="text-xs text-slate-500 font-light">{kpi.label}</div>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">

        {/* ── QUICK ACTIONS ────────────────────────────── */}
        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900 mb-4 uppercase tracking-widest">Quick Actions</h3>
          <div className="space-y-2">
            {config.quickActions.map((action: any, i: number) => (
              <Link
                key={i}
                href={action.href}
                className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 hover:border-slate-200 hover:shadow-sm transition-all group"
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${action.color}`}>
                  <action.icon size={15} />
                </div>
                <span className="text-sm font-medium text-slate-700 group-hover:text-slate-900 flex-1">{action.label}</span>
                <ArrowRight size={14} className="text-slate-300 group-hover:text-slate-600 transition-colors" />
              </Link>
            ))}
          </div>
        </div>

        {/* ── AI ASSISTANT ─────────────────────────────── */}
        <div className="lg:col-span-2 bg-slate-900 rounded-2xl p-6 shadow-xl flex flex-col">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
              <BrainCircuit size={16} className="text-primary" />
            </div>
            <span className="text-white font-semibold text-sm">SASA AI — {pillar.name}</span>
          </div>
          <div className="flex-1 space-y-3 mb-4 max-h-36 overflow-y-auto">
            {aiMessages.map((m, i) => (
              <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[85%] px-3 py-2 rounded-xl text-sm ${
                  m.role === "user"
                    ? "bg-primary text-black font-medium rounded-br-sm"
                    : "bg-white/10 text-slate-300 font-light rounded-bl-sm"
                }`}>{m.text}</div>
              </div>
            ))}
            {loading && (
              <div className="flex gap-1 px-3 py-2">
                {[0,150,300].map(d => <span key={d} className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: `${d}ms` }} />)}
              </div>
            )}
          </div>
          <div className="flex gap-2">
            <input
              value={aiInput}
              onChange={e => setAiInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && sendMessage()}
              placeholder={`Ask AI about ${pillar.name}...`}
              className="flex-1 bg-white/10 border border-white/10 rounded-xl px-3 py-2.5 text-white placeholder:text-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
            <button
              onClick={() => sendMessage()}
              className="w-10 h-10 rounded-xl bg-primary hover:bg-primary/90 flex items-center justify-center transition-colors shrink-0"
            >
              <Send size={14} className="text-black" />
            </button>
          </div>
        </div>
      </div>

      {/* ── MODULES GRID ────────────────────────────────── */}
      <div>
        <h2 className="text-lg font-bold text-slate-900 mb-5 flex items-center gap-2">
          <Box className="text-slate-400" size={18} /> All Modules
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {pillar.modules.map((mod: string, i: number) => (
            <Link key={i} href={`/dashboard/${pillarSlug}/${toSlug(mod)}`} className="block h-full">
              <motion.div
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 + i * 0.03 }}
                className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-slate-200 transition-all cursor-pointer group h-full flex flex-col justify-between"
              >
                <div>
                  <h3 className="text-sm font-semibold text-slate-900 mb-1">{mod}</h3>
                  <p className="text-xs text-slate-500 font-light leading-relaxed mb-4">
                    Manage {mod.toLowerCase()} within {pillar.name}.
                  </p>
                </div>
                <div className="flex items-center text-xs font-semibold text-slate-400 group-hover:text-slate-900 transition-colors">
                  Open Module <ArrowRight size={13} className="ml-1 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                </div>
              </motion.div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

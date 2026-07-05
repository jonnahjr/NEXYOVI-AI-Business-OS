"use client";

import { motion } from "framer-motion";
import {
  BrainCircuit, Send, TrendingUp, Users, DollarSign,
  ClipboardList, Bell, ArrowUpRight, Zap, Package, Activity,
  BarChart2, ShieldCheck, Clock
} from "lucide-react";
import { useState } from "react";

const AI_SUGGESTIONS = [
  "Run payroll for this month",
  "Generate Q3 financial report",
  "Show overdue invoices",
  "Create a new employee",
  "Approve pending leave requests",
  "Forecast next quarter's revenue",
  "Check low stock items",
  "Analyze department expenses",
];

const KPI_CARDS = [
  { label: "Revenue (MTD)",    value: "ETB 4.2M",  change: "+17%",  positive: true,  icon: DollarSign,    color: "bg-slate-100 text-slate-900" },
  { label: "Expenses (MTD)",   value: "ETB 1.8M",  change: "+3%",   positive: false, icon: TrendingUp,    color: "bg-slate-100 text-slate-900" },
  { label: "Active Employees", value: "247",        change: "+5",    positive: true,  icon: Users,         color: "bg-slate-100 text-slate-900" },
  { label: "Open Tasks",       value: "38",         change: "12 due",positive: false, icon: ClipboardList, color: "bg-slate-100 text-slate-900" },
];

const NOTIFICATIONS = [
  { icon: DollarSign,  color: "text-slate-900 bg-slate-100",   title: "Payroll due tomorrow",      time: "2h ago",    priority: "high" },
  { icon: Package,     color: "text-slate-900 bg-slate-100",   title: "Inventory low — Warehouse A", time: "3h ago",  priority: "high" },
  { icon: Activity,    color: "text-slate-900 bg-slate-100",   title: "Sales up 17% this week",    time: "5h ago",   priority: "info" },
  { icon: Bell,        color: "text-slate-900 bg-slate-100",   title: "3 invoices overdue",        time: "1d ago",    priority: "medium" },
  { icon: ShieldCheck, color: "text-slate-900 bg-slate-100",   title: "Security audit scheduled",  time: "2d ago",    priority: "info" },
];

const QUICK_ACTIONS = [
  { label: "Add Employee",      icon: Users,      href: "/dashboard/human-resources" },
  { label: "Run Payroll",       icon: DollarSign, href: "/dashboard/human-resources" },
  { label: "New Invoice",       icon: Activity,   href: "/dashboard/crm-sales" },
  { label: "Purchase Request",  icon: Package,    href: "/dashboard/procurement" },
  { label: "Create Project",    icon: ClipboardList,href: "/dashboard/project-management" },
  { label: "View Analytics",    icon: BarChart2,  href: "/dashboard/business-intelligence" },
];

export default function DashboardPage() {
  const [aiInput, setAiInput] = useState("");
  const [aiMessages, setAiMessages] = useState<{ role: "user" | "ai"; text: string }[]>([
    { role: "ai", text: "Hello! I'm SASA, your AI Business Brain. I have full context on your business — ask me anything or tell me what to do." }
  ]);
  const [loading, setLoading] = useState(false);

  const sendMessage = async (text?: string) => {
    const msg = text ?? aiInput;
    if (!msg.trim()) return;
    setAiMessages(prev => [...prev, { role: "user", text: msg }]);
    setAiInput("");
    setLoading(true);
    await new Promise(r => setTimeout(r, 1200));
    setAiMessages(prev => [...prev, {
      role: "ai",
      text: `I'm processing your request: "${msg}". In the full implementation, I'll execute this action across the relevant modules automatically.`
    }]);
    setLoading(false);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-20">

      {/* ── AI BRAIN CENTER ─────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-slate-900 rounded-3xl p-6 md:p-8 shadow-xl"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
            <BrainCircuit size={22} className="text-primary" />
          </div>
          <div>
            <h2 className="text-white font-bold text-lg leading-none">SASA AI Business Brain</h2>
            <span className="text-slate-400 text-xs font-light">What would you like to do today?</span>
          </div>
        </div>

        {/* Chat messages */}
        <div className="space-y-3 mb-5 max-h-40 overflow-y-auto pr-1">
          {aiMessages.map((m, i) => (
            <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm ${
                m.role === "user"
                  ? "bg-primary text-black font-medium rounded-br-sm"
                  : "bg-white/10 text-slate-200 font-light rounded-bl-sm"
              }`}>
                {m.text}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-white/10 text-slate-400 px-4 py-2.5 rounded-2xl rounded-bl-sm text-sm flex items-center gap-2">
                <span className="flex gap-1">
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                </span>
                Thinking...
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <div className="flex gap-3">
          <input
            value={aiInput}
            onChange={e => setAiInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && sendMessage()}
            placeholder="Type a command... e.g. 'Create payroll for June'"
            className="flex-1 bg-white/10 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all"
          />
          <button
            onClick={() => sendMessage()}
            className="w-11 h-11 rounded-xl bg-primary hover:bg-primary/90 flex items-center justify-center transition-colors shrink-0"
          >
            <Send size={16} className="text-black" />
          </button>
        </div>

        {/* Suggestion chips */}
        <div className="flex gap-2 mt-4 flex-wrap">
          {AI_SUGGESTIONS.slice(0, 4).map((s, i) => (
            <button
              key={i}
              onClick={() => sendMessage(s)}
              className="px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-slate-400 hover:text-white text-xs transition-all"
            >
              {s}
            </button>
          ))}
        </div>
      </motion.div>

      {/* ── TODAY'S BUSINESS KPIs ────────────────────────── */}
      <div>
        <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
          <BarChart2 size={18} className="text-slate-400" /> Today's Business
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {KPI_CARDS.map((k, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${k.color}`}>
                  <k.icon size={18} />
                </div>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${"bg-slate-100 text-slate-900"}`}>
                  {k.change}
                </span>
              </div>
              <div className="text-2xl font-bold text-slate-900 leading-none mb-1">{k.value}</div>
              <div className="text-xs text-slate-500 font-light">{k.label}</div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* ── QUICK ACTIONS + NOTIFICATIONS ────────────────── */}
      <div className="grid lg:grid-cols-2 gap-6">

        {/* Quick Actions */}
        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
          <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Zap size={16} className="text-primary" /> Quick Actions
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {QUICK_ACTIONS.map((a, i) => (
              <a
                key={i}
                href={a.href}
                className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 hover:border-primary/30 hover:bg-primary/5 transition-all group"
              >
                <div className="w-8 h-8 rounded-lg bg-slate-100 group-hover:bg-primary/10 flex items-center justify-center transition-colors shrink-0">
                  <a.icon size={15} className="text-slate-600 group-hover:text-primary transition-colors" />
                </div>
                <span className="text-xs font-semibold text-slate-700 group-hover:text-slate-900 leading-tight">{a.label}</span>
              </a>
            ))}
          </div>
        </div>

        {/* AI Notifications */}
        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
          <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Bell size={16} className="text-primary" /> AI Notifications
            <span className="ml-auto text-xs font-medium text-slate-400">Prioritized by AI</span>
          </h3>
          <div className="space-y-3">
            {NOTIFICATIONS.map((n, i) => (
              <div key={i} className="flex items-start gap-3 group cursor-pointer hover:bg-slate-50 p-2 -mx-2 rounded-xl transition-colors">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${n.color}`}>
                  <n.icon size={15} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-800 leading-tight">{n.title}</p>
                  <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                    <Clock size={10} /> {n.time}
                  </p>
                </div>
                <ArrowUpRight size={14} className="text-slate-300 group-hover:text-slate-600 transition-colors shrink-0 mt-0.5" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

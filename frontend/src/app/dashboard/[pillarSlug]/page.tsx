"use client";

import { use, useEffect } from "react";
import { notFound } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowRight, Box, BrainCircuit, Send, Users, Clock, CheckCircle, AlertTriangle, DollarSign, Building2, Plus, Eye, UserPlus, Briefcase, CalendarCheck, BarChart3, Activity, TrendingUp, ExternalLink, Package, Truck, ClipboardList, Zap, FileText } from "lucide-react";
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

// ─── HR DASHBOARD ────────────────────────────────────────────────
function HRDashboard({ pillar, config, pillarSlug }: { pillar: any; config: any; pillarSlug: string }) {
  const [stats, setStats] = useState<any>(null);
  const [recentEmployees, setRecentEmployees] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [pendingLeaves, setPendingLeaves] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [aiInput, setAiInput] = useState("");
  const [aiMessages, setAiMessages] = useState([
    { role: "ai", text: config.aiContext }
  ]);
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function loadHRData() {
      try {
        const token = localStorage.getItem("token") || "";
        let companyId = "";
        try {
          if (token) {
            const payload = JSON.parse(atob(token.split(".")[1]));
            companyId = payload.companyId || payload.company?.id || "";
          }
        } catch {}

        // Fetch employees from generic module
        const empRes = await fetch(
          "http://localhost:3002/api/v1/modules/human-resources/employee-management",
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const empData = await empRes.json();
        
        if (cancelled) return;
        
        const employees = empData?.data || [];
        setRecentEmployees(employees.slice(0, 6));
        
        // Compute stats from real data
        const total = employees.length;
        const active = employees.filter((e: any) => e.status === "Active" || e.status === "ACTIVE").length;
        const onLeave = employees.filter((e: any) => (e.status || "").toLowerCase().includes("leave")).length;
        
        // Fetch department breakdown
        let deptMap: Record<string, number> = {};
        employees.forEach((e: any) => {
          const dept = e.department || e.departmentId || "Unassigned";
          deptMap[dept] = (deptMap[dept] || 0) + 1;
        });
        
        const deptArray = Object.entries(deptMap)
          .filter(([name]) => name && name !== "Unassigned")
          .map(([name, count]) => ({ name, count }))
          .sort((a, b) => b.count - a.count);
        setDepartments(deptArray);
        
        // Fetch leaves from generic module
        const leaveRes = await fetch(
          "http://localhost:3002/api/v1/modules/human-resources/leave-management",
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const leaveData = await leaveRes.json();
        const leaves = (leaveData?.data || []).filter(
          (l: any) => (l.status || "").toLowerCase() === "pending"
        );
        setPendingLeaves(leaves.slice(0, 5));
        
        setStats({ totalEmployees: total, activeEmployees: active, onLeave, departments: deptArray.length, pendingLeaves: leaves.length });
      } catch (err) {
        console.error("Failed to load HR data:", err);
        setStats({ totalEmployees: 0, activeEmployees: 0, onLeave: 0, departments: 0, pendingLeaves: 0 });
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    loadHRData();
    return () => { cancelled = true; };
  }, []);

  const sendMessage = async (text?: string) => {
    const msg = text ?? aiInput;
    if (!msg.trim()) return;
    setAiMessages(prev => [...prev, { role: "user", text: msg }]);
    setAiInput("");
    setAiLoading(true);
    await new Promise(r => setTimeout(r, 1000));
    setAiMessages(prev => [...prev, {
      role: "ai",
      text: `Processing: "${msg}". I'll execute this across the HR modules automatically.`
    }]);
    setAiLoading(false);
  };

  const kpiCards = [
    { label: "Total Employees", value: stats?.totalEmployees ?? "—", icon: Users, change: "All time" },
    { label: "Active", value: stats?.activeEmployees ?? "—", icon: Activity, change: `On leave: ${stats?.onLeave ?? 0}` },
    { label: "Departments", value: stats?.departments ?? "—", icon: Building2, change: "Across org" },
    { label: "Pending Leaves", value: stats?.pendingLeaves ?? "—", icon: Clock, change: "Awaiting approval" },
  ];

  const quickActions = [
    { label: "Add Employee", icon: UserPlus, href: "/dashboard/human-resources/employee-management", desc: "Register new employee" },
    { label: "Run Payroll", icon: DollarSign, href: "/dashboard/human-resources/payroll", desc: "Process this month" },
    { label: "Approve Leave", icon: CalendarCheck, href: "/dashboard/human-resources/leave-management", desc: `${stats?.pendingLeaves ?? 0} pending` },
    { label: "View Org Chart", icon: Building2, href: "/dashboard/human-resources/organizational-chart", desc: "Team structure" },
    { label: "HR Analytics", icon: BarChart3, href: "/dashboard/human-resources/hr-analytics", desc: "Workforce insights" },
    { label: "Recruitment", icon: Briefcase, href: "/dashboard/human-resources/recruitment-ats", desc: "ATS pipeline" },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-20">
      
      {/* ── HEADER ─────────────────────────────────── */}
      <div className="border-b border-gray-200 pb-6">
        <div className="flex items-center gap-3 mb-3">
          <span className="text-4xl">{pillar.emoji}</span>
          <div>
            <h1 className="text-3xl font-bold text-black tracking-tight">{pillar.name}</h1>
            <p className="text-sm text-gray-500 font-normal mt-0.5">{pillar.desc}</p>
          </div>
        </div>
      </div>

      {/* ── KPI CARDS ──────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {kpiCards.map((kpi, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            className="bg-white border border-gray-200 rounded-xl px-5 py-4"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                <kpi.icon size={15} className="text-black" />
              </div>
            </div>
            <div className="text-2xl font-bold text-black tracking-tight leading-none mb-1">
              {loading ? <span className="text-gray-300">—</span> : kpi.value}
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500 font-medium">{kpi.label}</span>
              <span className="text-[10px] text-gray-400 font-medium">{kpi.change}</span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* ── MAIN CONTENT ROW 1 ──────────────────────── */}
      <div className="grid lg:grid-cols-3 gap-6">
        
        {/* ── RECENT EMPLOYEES ───────────────────────── */}
        <div className="lg:col-span-2 bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h3 className="text-sm font-bold text-black uppercase tracking-widest">Recent Employees</h3>
            <Link href="/dashboard/human-resources/employee-management" className="text-xs font-semibold text-gray-400 hover:text-black transition-colors flex items-center gap-1">
              View All <ExternalLink size={12} className="text-black" />
            </Link>
          </div>
          <div className="divide-y divide-gray-50">
            {loading ? (
              <div className="px-5 py-8 text-center text-sm text-gray-300 font-medium">Loading...</div>
            ) : recentEmployees.length === 0 ? (
              <div className="px-5 py-8 text-center text-sm text-gray-400 font-medium">No employees registered yet</div>
            ) : (
              recentEmployees.map((emp, i) => (
                <div key={i} className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50 transition-colors">
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-[11px] font-bold text-black shrink-0">
                    {((emp.firstName?.[0] || "") + (emp.lastName?.[0] || "")).toUpperCase() || "—"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-black truncate">{emp.name || `${emp.firstName || ""} ${emp.lastName || ""}`.trim() || emp.employeeCode}</div>
                    <div className="text-xs text-gray-400">{emp.position || emp.jobTitle || "—"} {emp.department ? `· ${emp.department}` : ""}</div>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                    (emp.status || "").toLowerCase() === "active" ? "bg-gray-100 text-gray-700" :
                    (emp.status || "").toLowerCase().includes("leave") ? "bg-gray-100 text-gray-500" :
                    "bg-gray-50 text-gray-400"
                  }`}>
                    {emp.status || "—"}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* ── RIGHT COLUMN: Departments + Leaves ───── */}
        <div className="space-y-6">
          
          {/* Department Breakdown */}
          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <h3 className="text-xs font-bold text-black uppercase tracking-widest mb-4">Departments</h3>
            {loading ? (
              <div className="text-sm text-gray-300 font-medium">Loading...</div>
            ) : departments.length === 0 ? (
              <div className="text-sm text-gray-400 font-medium">No departments</div>
            ) : (
              <div className="space-y-3">
                {departments.slice(0, 5).map((dept, i) => {
                  const maxCount = departments[0]?.count || 1;
                  const pct = (dept.count / maxCount) * 100;
                  return (
                    <div key={i}>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-medium text-black">{dept.name}</span>
                        <span className="text-xs font-bold text-gray-400">{dept.count}</span>
                      </div>
                      <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ duration: 0.5, delay: i * 0.1 }}
                          className="h-full bg-black rounded-full"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Pending Leaves */}
          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <h3 className="text-xs font-bold text-black uppercase tracking-widest mb-4">Pending Approvals</h3>
            {loading ? (
              <div className="text-sm text-gray-300 font-medium">Loading...</div>
            ) : pendingLeaves.length === 0 ? (
              <div className="text-sm text-gray-400 font-medium">All clear — no pending approvals</div>
            ) : (
              <div className="space-y-3">
                {pendingLeaves.map((leave, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-[10px] font-bold text-black shrink-0">
                      {((leave.employee?.user?.firstName?.[0] || "") + (leave.employee?.user?.lastName?.[0] || "")).toUpperCase() || "—"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-semibold text-black truncate">
                        {leave.employee?.user?.firstName || ""} {leave.employee?.user?.lastName || ""}
                      </div>
                      <div className="text-[10px] text-gray-400">{leave.type || "Leave"} · {leave.startDate?.split("T")[0] || "—"}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── MAIN CONTENT ROW 2 ──────────────────────── */}
      <div className="grid lg:grid-cols-3 gap-6">
        
        {/* ── QUICK ACTIONS ─────────────────────────── */}
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <h3 className="text-xs font-bold text-black uppercase tracking-widest mb-4">Quick Actions</h3>
          <div className="space-y-1.5">
            {quickActions.map((action, i) => (
              <Link
                key={i}
                href={action.href}
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors group"
              >
                <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                  <action.icon size={14} className="text-black" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-black group-hover:text-black transition-colors">{action.label}</div>
                  <div className="text-[10px] text-gray-400">{action.desc}</div>
                </div>
                <ArrowRight size={13} className="text-black transition-colors shrink-0" />
              </Link>
            ))}
          </div>
        </div>

        {/* ── AI ASSISTANT ──────────────────────────── */}
        <div className="lg:col-span-2 bg-white border border-gray-200 rounded-xl p-5 flex flex-col">
          <div className="flex items-center gap-3 mb-4 pb-3 border-b border-gray-100">
            <div className="w-8 h-8 rounded-lg bg-gray-900 flex items-center justify-center">
              <BrainCircuit size={15} className="text-white" />
            </div>
            <div>
              <span className="text-sm font-bold text-black">SASA AI — {pillar.name}</span>
              <span className="text-[10px] text-gray-400 ml-2 font-medium">Powered by DeepSeek</span>
            </div>
          </div>
          <div className="flex-1 space-y-3 mb-4 min-h-[120px] max-h-[200px] overflow-y-auto">
            {aiMessages.map((m, i) => (
              <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[85%] px-3.5 py-2 rounded-xl text-sm ${
                  m.role === "user"
                    ? "bg-gray-900 text-white rounded-br-sm"
                    : "bg-gray-50 text-gray-700 rounded-bl-sm"
                }`}>{m.text}</div>
              </div>
            ))}
            {aiLoading && (
              <div className="flex gap-1.5 px-3 py-2">
                {[0,150,300].map(d => <span key={d} className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: `${d}ms` }} />)}
              </div>
            )}
          </div>
          <div className="flex gap-2 items-center">
            {["Add employee", "Approve leaves", "Payroll summary"].map((s, i) => (
              <button
                key={i}
                onClick={() => sendMessage(s)}
                className="px-2.5 py-1.5 rounded-lg bg-gray-50 hover:bg-gray-100 border border-gray-100 text-gray-500 hover:text-black text-[10px] font-semibold transition-all"
              >
                {s}
              </button>
            ))}
          </div>
          <div className="flex gap-2 mt-3">
            <input
              value={aiInput}
              onChange={e => setAiInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && sendMessage()}
              placeholder={`Ask AI about ${pillar.name}...`}
              className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-3.5 py-2.5 text-black placeholder:text-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
            />
            <button
              onClick={() => sendMessage()}
              className="w-10 h-10 rounded-lg bg-gray-900 hover:bg-black flex items-center justify-center transition-colors shrink-0"
            >
              <Send size={14} className="text-white" />
            </button>
          </div>
        </div>
      </div>

      {/* ── MODULES GRID ────────────────────────────── */}
      <div>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-sm font-bold text-black uppercase tracking-widest">All HR Modules</h2>
          <span className="text-[10px] text-gray-400 font-medium">{pillar.modules.length} modules</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {pillar.modules.map((mod: string, i: number) => (
            <Link key={i} href={`/dashboard/${pillarSlug}/${toSlug(mod)}`} className="block h-full">
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 + i * 0.02 }}
                className="bg-white border border-gray-200 rounded-xl px-4 py-3.5 hover:border-gray-300 hover:shadow-sm transition-all cursor-pointer group h-full flex items-center justify-between"
              >
                <span className="text-sm font-semibold text-black group-hover:text-black">{mod}</span>
                <ArrowRight size={13} className="text-gray-300 group-hover:text-black transition-colors shrink-0 ml-2" />
              </motion.div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── CRM DASHBOARD ────────────────────────────────────────────────
function CRMDashboard({ pillar, config, pillarSlug }: { pillar: any; config: any; pillarSlug: string }) {
  const [stats, setStats] = useState<any>(null);
  const [recentLeads, setRecentLeads] = useState<any[]>([]);
  const [dealsByStage, setDealsByStage] = useState<{ name: string; count: number; value: number }[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [aiInput, setAiInput] = useState("");
  const [aiMessages, setAiMessages] = useState([
    { role: "ai", text: config.aiContext }
  ]);
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function loadCRMData() {
      try {
        const token = localStorage.getItem("token") || "";

        // Fetch leads
        const leadsRes = await fetch(
          "http://localhost:3002/api/v1/modules/crm-sales/lead-management",
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const leadsData = await leadsRes.json();
        const leads = leadsData?.data || [];
        
        if (cancelled) return;

        // Fetch deals/pipeline
        const dealsRes = await fetch(
          "http://localhost:3002/api/v1/modules/crm-sales/opportunity-pipeline",
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const dealsData = await dealsRes.json();
        const deals = dealsData?.data || [];

        // Fetch customers
        const custRes = await fetch(
          "http://localhost:3002/api/v1/modules/crm-sales/customer-management",
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const custData = await custRes.json();
        const customers = custData?.data || [];

        // Fetch invoices
        const invRes = await fetch(
          "http://localhost:3002/api/v1/modules/crm-sales/invoicing",
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const invData = await invRes.json();
        const invs = invData?.data || [];

        if (cancelled) return;

        // Compute stats
        const openDeals = deals.filter((d: any) => !d.stage?.toLowerCase().includes("closed")).length;
        const wonDeals = deals.filter((d: any) => d.stage?.toLowerCase().includes("won")).length;
        const pipelineValue = deals.reduce((sum: number, d: any) => sum + (d.value || d.amount || 0), 0);
        const totalCust = customers.length;

        // Deals by stage
        const stageMap: Record<string, { count: number; value: number }> = {};
        deals.forEach((d: any) => {
          const stage = d.stage || d.status || "Unknown";
          if (!stageMap[stage]) stageMap[stage] = { count: 0, value: 0 };
          stageMap[stage].count++;
          stageMap[stage].value += d.value || d.amount || 0;
        });
        const stageArray = Object.entries(stageMap).map(([name, vals]) => ({
          name: name.replace(/_/g, ' ').replace(/\w\S*/g, w => w.charAt(0) + w.slice(1).toLowerCase()),
          count: vals.count,
          value: vals.value,
        }));

        setStats({
          totalLeads: leads.length,
          openDeals,
          pipelineValue,
          customers: totalCust,
          wonDeals,
          invoices: invs.length,
        });
        setRecentLeads(leads.slice(0, 6));
        setDealsByStage(stageArray);
        setInvoices(invs.slice(0, 5));
      } catch (err) {
        console.error("Failed to load CRM data:", err);
        setStats({ totalLeads: 0, openDeals: 0, pipelineValue: 0, customers: 0, wonDeals: 0, invoices: 0 });
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    loadCRMData();
    return () => { cancelled = true; };
  }, []);

  const sendMessage = async (text?: string) => {
    const msg = text ?? aiInput;
    if (!msg.trim()) return;
    setAiMessages(prev => [...prev, { role: "user", text: msg }]);
    setAiInput("");
    setAiLoading(true);
    await new Promise(r => setTimeout(r, 1000));
    setAiMessages(prev => [...prev, {
      role: "ai",
      text: `Processing: "${msg}". I'll execute this across the CRM modules automatically.`
    }]);
    setAiLoading(false);
  };

  const formatCurrency = (val: number) => {
    if (val >= 1000000) return `ETB ${(val / 1000000).toFixed(1)}M`;
    if (val >= 1000) return `ETB ${(val / 1000).toFixed(0)}K`;
    return `ETB ${val}`;
  };

  const kpiCards = [
    { label: "Total Leads", value: stats?.totalLeads ?? "—", icon: Activity, change: "All time" },
    { label: "Open Deals", value: stats?.openDeals ?? "—", icon: TrendingUp, change: `Won: ${stats?.wonDeals ?? 0}` },
    { label: "Pipeline Value", value: stats?.pipelineValue ? formatCurrency(stats.pipelineValue) : "—", icon: DollarSign, change: "Total pipeline" },
    { label: "Customers", value: stats?.customers ?? "—", icon: Users, change: "Active accounts" },
  ];

  const quickActions = [
    { label: "New Lead", icon: Activity, href: "/dashboard/crm-sales/lead-management", desc: "Add prospect" },
    { label: "Create Invoice", icon: FileText, href: "/dashboard/crm-sales/invoicing", desc: "Bill customer" },
    { label: "New Customer", icon: Users, href: "/dashboard/crm-sales/customer-management", desc: "Register account" },
    { label: "Deal Pipeline", icon: TrendingUp, href: "/dashboard/crm-sales/opportunity-pipeline", desc: `${stats?.openDeals ?? 0} active` },
    { label: "Sales Analytics", icon: BarChart3, href: "/dashboard/crm-sales/sales-analytics", desc: "Reports & insights" },
    { label: "Invoicing", icon: DollarSign, href: "/dashboard/crm-sales/invoicing", desc: `${stats?.invoices ?? 0} records` },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-20">
      
      {/* ── HEADER ─────────────────────────────────── */}
      <div className="border-b border-gray-200 pb-6">
        <div className="flex items-center gap-3 mb-3">
          <span className="text-4xl">{pillar.emoji}</span>
          <div>
            <h1 className="text-3xl font-bold text-black tracking-tight">{pillar.name}</h1>
            <p className="text-sm text-gray-500 font-normal mt-0.5">{pillar.desc}</p>
          </div>
        </div>
      </div>

      {/* ── KPI CARDS ──────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {kpiCards.map((kpi, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            className="bg-white border border-gray-200 rounded-xl px-5 py-4"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                <kpi.icon size={15} className="text-black" />
              </div>
            </div>
            <div className="text-2xl font-bold text-black tracking-tight leading-none mb-1">
              {loading ? <span className="text-gray-300">—</span> : kpi.value}
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500 font-medium">{kpi.label}</span>
              <span className="text-[10px] text-gray-400 font-medium">{kpi.change}</span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* ── MAIN CONTENT ROW 1 ──────────────────────── */}
      <div className="grid lg:grid-cols-3 gap-6">
        
        {/* ── RECENT LEADS ──────────────────────────── */}
        <div className="lg:col-span-2 bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h3 className="text-sm font-bold text-black uppercase tracking-widest">Recent Leads</h3>
            <Link href="/dashboard/crm-sales/lead-management" className="text-xs font-semibold text-gray-400 hover:text-black transition-colors flex items-center gap-1">
              View All <ExternalLink size={12} className="text-black" />
            </Link>
          </div>
          <div className="divide-y divide-gray-50">
            {loading ? (
              <div className="px-5 py-8 text-center text-sm text-gray-300 font-medium">Loading...</div>
            ) : recentLeads.length === 0 ? (
              <div className="px-5 py-8 text-center text-sm text-gray-400 font-medium">No leads registered yet</div>
            ) : (
              recentLeads.map((lead, i) => (
                <div key={i} className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50 transition-colors">
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-[11px] font-bold text-black shrink-0">
                    {(lead.name?.[0] || "—").toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-black truncate">{lead.name || "—"}</div>
                    <div className="text-xs text-gray-400">{lead.company || lead.email || "—"} {lead.phone ? `· ${lead.phone}` : ""}</div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-xs font-semibold text-black">{lead.estimatedValue ? formatCurrency(lead.estimatedValue) : lead.value ? formatCurrency(lead.value) : ""}</div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      (lead.status || lead.stage || "").toLowerCase() === "new" ? "bg-gray-100 text-gray-600" :
                      (lead.status || lead.stage || "").toLowerCase() === "qualified" ? "bg-gray-100 text-gray-700" :
                      (lead.status || lead.stage || "").toLowerCase().includes("won") ? "bg-gray-100 text-gray-800" :
                      "bg-gray-50 text-gray-400"
                    }`}>
                      {lead.stage || lead.status || "—"}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* ── RIGHT COLUMN: Pipeline + Invoices ────── */}
        <div className="space-y-6">
          
          {/* Pipeline Stages */}
          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <h3 className="text-xs font-bold text-black uppercase tracking-widest mb-4">Pipeline Stages</h3>
            {loading ? (
              <div className="text-sm text-gray-300 font-medium">Loading...</div>
            ) : dealsByStage.length === 0 ? (
              <div className="text-sm text-gray-400 font-medium">No deals in pipeline</div>
            ) : (
              <div className="space-y-3">
                {dealsByStage.map((stage, i) => {
                  const maxCount = Math.max(...dealsByStage.map(s => s.count), 1);
                  const pct = (stage.count / maxCount) * 100;
                  return (
                    <div key={i}>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-medium text-black">{stage.name}</span>
                        <div className="text-right">
                          <span className="text-xs font-bold text-gray-400 mr-2">{stage.count}</span>
                          <span className="text-[10px] text-gray-400">{formatCurrency(stage.value)}</span>
                        </div>
                      </div>
                      <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ duration: 0.5, delay: i * 0.1 }}
                          className="h-full bg-black rounded-full"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Recent Invoices */}
          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <h3 className="text-xs font-bold text-black uppercase tracking-widest mb-4">Recent Invoices</h3>
            {loading ? (
              <div className="text-sm text-gray-300 font-medium">Loading...</div>
            ) : invoices.length === 0 ? (
              <div className="text-sm text-gray-400 font-medium">No invoices yet</div>
            ) : (
              <div className="space-y-3">
                {invoices.map((inv, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center text-[10px] font-bold text-black shrink-0">
                      <DollarSign size={12} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-semibold text-black truncate">{inv.invoiceNo || `INV-${i + 1}`}</div>
                      <div className="text-[10px] text-gray-400">{inv.customer?.name || inv.customerName || "—"} · {inv.total ? formatCurrency(inv.total) : "—"}</div>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      (inv.status || "").toLowerCase() === "paid" ? "bg-gray-100 text-gray-700" :
                      (inv.status || "").toLowerCase() === "overdue" ? "bg-gray-100 text-gray-500" :
                      "bg-gray-50 text-gray-400"
                    }`}>
                      {inv.status || "—"}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── MAIN CONTENT ROW 2 ──────────────────────── */}
      <div className="grid lg:grid-cols-3 gap-6">
        
        {/* ── QUICK ACTIONS ─────────────────────────── */}
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <h3 className="text-xs font-bold text-black uppercase tracking-widest mb-4">Quick Actions</h3>
          <div className="space-y-1.5">
            {quickActions.map((action, i) => (
              <Link
                key={i}
                href={action.href}
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors group"
              >
                <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                  <action.icon size={14} className="text-black" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-black group-hover:text-black transition-colors">{action.label}</div>
                  <div className="text-[10px] text-gray-400">{action.desc}</div>
                </div>
                <ArrowRight size={13} className="text-black transition-colors shrink-0" />
              </Link>
            ))}
          </div>
        </div>

        {/* ── AI ASSISTANT ──────────────────────────── */}
        <div className="lg:col-span-2 bg-white border border-gray-200 rounded-xl p-5 flex flex-col">
          <div className="flex items-center gap-3 mb-4 pb-3 border-b border-gray-100">
            <div className="w-8 h-8 rounded-lg bg-gray-900 flex items-center justify-center">
              <BrainCircuit size={15} className="text-white" />
            </div>
            <div>
              <span className="text-sm font-bold text-black">SASA AI — {pillar.name}</span>
              <span className="text-[10px] text-gray-400 ml-2 font-medium">Powered by DeepSeek</span>
            </div>
          </div>
          <div className="flex-1 space-y-3 mb-4 min-h-[120px] max-h-[200px] overflow-y-auto">
            {aiMessages.map((m, i) => (
              <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[85%] px-3.5 py-2 rounded-xl text-sm ${
                  m.role === "user"
                    ? "bg-gray-900 text-white rounded-br-sm"
                    : "bg-gray-50 text-gray-700 rounded-bl-sm"
                }`}>{m.text}</div>
              </div>
            ))}
            {aiLoading && (
              <div className="flex gap-1.5 px-3 py-2">
                {[0,150,300].map(d => <span key={d} className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: `${d}ms` }} />)}
              </div>
            )}
          </div>
          <div className="flex gap-2 items-center">
            {["Top leads", "Pipeline report", "New invoice"].map((s, i) => (
              <button
                key={i}
                onClick={() => sendMessage(s)}
                className="px-2.5 py-1.5 rounded-lg bg-gray-50 hover:bg-gray-100 border border-gray-100 text-gray-500 hover:text-black text-[10px] font-semibold transition-all"
              >
                {s}
              </button>
            ))}
          </div>
          <div className="flex gap-2 mt-3">
            <input
              value={aiInput}
              onChange={e => setAiInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && sendMessage()}
              placeholder={`Ask AI about ${pillar.name}...`}
              className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-3.5 py-2.5 text-black placeholder:text-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
            />
            <button
              onClick={() => sendMessage()}
              className="w-10 h-10 rounded-lg bg-gray-900 hover:bg-black flex items-center justify-center transition-colors shrink-0"
            >
              <Send size={14} className="text-white" />
            </button>
          </div>
        </div>
      </div>

      {/* ── MODULES GRID ────────────────────────────── */}
      <div>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-sm font-bold text-black uppercase tracking-widest">All CRM Modules</h2>
          <span className="text-[10px] text-gray-400 font-medium">{pillar.modules.length} modules</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {pillar.modules.map((mod: string, i: number) => (
            <Link key={i} href={`/dashboard/${pillarSlug}/${toSlug(mod)}`} className="block h-full">
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 + i * 0.02 }}
                className="bg-white border border-gray-200 rounded-xl px-4 py-3.5 hover:border-gray-300 hover:shadow-sm transition-all cursor-pointer group h-full flex items-center justify-between"
              >
                <span className="text-sm font-semibold text-black group-hover:text-black">{mod}</span>
                <ArrowRight size={13} className="text-gray-300 group-hover:text-black transition-colors shrink-0 ml-2" />
              </motion.div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── INVENTORY DASHBOARD ─────────────────────────────────────────
function InventoryDashboard({ pillar, config, pillarSlug }: { pillar: any; config: any; pillarSlug: string }) {
  const [stats, setStats] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<{ name: string; count: number }[]>([]);
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [aiInput, setAiInput] = useState("");
  const [aiMessages, setAiMessages] = useState([
    { role: "ai", text: config.aiContext }
  ]);
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function loadData() {
      try {
        const token = localStorage.getItem("token") || "";

        // Fetch products
        const prodRes = await fetch(
          "http://localhost:3002/api/v1/modules/inventory-warehouse/products",
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const prodData = await prodRes.json();
        const prods = prodData?.data || [];
        
        if (cancelled) return;

        // Fetch warehouses
        const whRes = await fetch(
          "http://localhost:3002/api/v1/modules/inventory-warehouse/warehouses",
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const whData = await whRes.json();
        const whs = whData?.data || [];

        if (cancelled) return;

        // Compute stats
        const totalProducts = prods.length;
        const lowStock = prods.filter((p: any) => {
          const stock = p.stock || p.quantity || 0;
          const minStock = p.minStock || 0;
          return stock > 0 && stock <= (minStock || 10);
        }).length;
        const outOfStock = prods.filter((p: any) => (p.stock || p.quantity || 0) <= 0).length;
        const stockValue = prods.reduce((sum: number, p: any) => sum + ((p.stock || 0) * (p.costPrice || p.sellPrice || 0)), 0);

        // Category breakdown
        const catMap: Record<string, number> = {};
        prods.forEach((p: any) => {
          const cat = p.category || "Uncategorized";
          catMap[cat] = (catMap[cat] || 0) + 1;
        });
        const catArray = Object.entries(catMap)
          .filter(([name]) => name !== "Uncategorized")
          .map(([name, count]) => ({ name, count }))
          .sort((a, b) => b.count - a.count);

        setStats({ totalProducts, lowStock, outOfStock, warehouses: whs.length, stockValue });
        setProducts(prods.slice(0, 6));
        setCategories(catArray);
        setWarehouses(whs.slice(0, 4));
      } catch (err) {
        console.error("Failed to load inventory data:", err);
        setStats({ totalProducts: 0, lowStock: 0, outOfStock: 0, warehouses: 0, stockValue: 0 });
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    loadData();
    return () => { cancelled = true; };
  }, []);

  const sendMessage = async (text?: string) => {
    const msg = text ?? aiInput;
    if (!msg.trim()) return;
    setAiMessages(prev => [...prev, { role: "user", text: msg }]);
    setAiInput("");
    setAiLoading(true);
    await new Promise(r => setTimeout(r, 1000));
    setAiMessages(prev => [...prev, {
      role: "ai",
      text: `Processing: "${msg}". I'll execute this across the Inventory modules automatically.`
    }]);
    setAiLoading(false);
  };

  const formatCurrency = (val: number) => {
    if (val >= 1000000) return `ETB ${(val / 1000000).toFixed(1)}M`;
    if (val >= 1000) return `ETB ${(val / 1000).toFixed(0)}K`;
    return `ETB ${val.toLocaleString()}`;
  };

  const kpiCards = [
    { label: "Total Products", value: stats?.totalProducts ?? "—", icon: Package, change: "All SKUs" },
    { label: "Low Stock Items", value: stats?.lowStock ?? "—", icon: AlertTriangle, change: `Out: ${stats?.outOfStock ?? 0}` },
    { label: "Warehouses", value: stats?.warehouses ?? "—", icon: Building2, change: "Locations" },
    { label: "Stock Value", value: stats?.stockValue ? formatCurrency(stats.stockValue) : "—", icon: DollarSign, change: "Total cost" },
  ];

  const quickActions = [
    { label: "Add Product", icon: Package, href: "/dashboard/inventory-warehouse/products", desc: "New SKU" },
    { label: "Stock Transfer", icon: Truck, href: "/dashboard/inventory-warehouse/stock-transfers", desc: "Move inventory" },
    { label: "Purchase Order", icon: ClipboardList, href: "/dashboard/inventory-warehouse/purchase-orders", desc: "Order stock" },
    { label: "Barcode / QR", icon: Zap, href: "/dashboard/inventory-warehouse/barcode-qr", desc: "Scan items" },
    { label: "Cycle Counts", icon: CheckCircle, href: "/dashboard/inventory-warehouse/cycle-counts", desc: "Audit stock" },
    { label: "Inventory Analytics", icon: BarChart3, href: "/dashboard/inventory-warehouse/warehouse-analytics", desc: "Reports" },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-20">
      
      {/* ── HEADER ─────────────────────────────────── */}
      <div className="border-b border-gray-200 pb-6">
        <div className="flex items-center gap-3 mb-3">
          <span className="text-4xl">{pillar.emoji}</span>
          <div>
            <h1 className="text-3xl font-bold text-black tracking-tight">{pillar.name}</h1>
            <p className="text-sm text-gray-500 font-normal mt-0.5">{pillar.desc}</p>
          </div>
        </div>
      </div>

      {/* ── KPI CARDS ──────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {kpiCards.map((kpi, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            className="bg-white border border-gray-200 rounded-xl px-5 py-4"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                <kpi.icon size={15} className="text-black" />
              </div>
            </div>
            <div className="text-2xl font-bold text-black tracking-tight leading-none mb-1">
              {loading ? <span className="text-gray-300">—</span> : kpi.value}
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500 font-medium">{kpi.label}</span>
              <span className="text-[10px] text-gray-400 font-medium">{kpi.change}</span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* ── MAIN CONTENT ROW 1 ──────────────────────── */}
      <div className="grid lg:grid-cols-3 gap-6">
        
        {/* ── RECENT PRODUCTS ───────────────────────── */}
        <div className="lg:col-span-2 bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h3 className="text-sm font-bold text-black uppercase tracking-widest">Recent Products</h3>
            <Link href="/dashboard/inventory-warehouse/products" className="text-xs font-semibold text-gray-400 hover:text-black transition-colors flex items-center gap-1">
              View All <ExternalLink size={12} className="text-black" />
            </Link>
          </div>
          <div className="divide-y divide-gray-50">
            {loading ? (
              <div className="px-5 py-8 text-center text-sm text-gray-300 font-medium">Loading...</div>
            ) : products.length === 0 ? (
              <div className="px-5 py-8 text-center text-sm text-gray-400 font-medium">No products registered yet</div>
            ) : (
              products.map((prod, i) => {
                const stock = prod.stock ?? prod.quantity ?? 0;
                const isLow = stock > 0 && stock <= (prod.minStock || 10);
                const isOut = stock <= 0;
                return (
                  <div key={i} className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50 transition-colors">
                    <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-[11px] font-bold text-black shrink-0">
                      <Package size={14} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-black truncate">{prod.name || prod.sku || "—"}</div>
                      <div className="text-xs text-gray-400">{prod.sku ? `SKU: ${prod.sku}` : ""} {prod.category ? `· ${prod.category}` : ""}</div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className={`text-xs font-bold ${isOut ? "text-gray-400" : isLow ? "text-gray-600" : "text-black"}`}>
                        {stock} {prod.unit || "pcs"}
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        isOut ? "bg-gray-50 text-gray-400" :
                        isLow ? "bg-gray-100 text-gray-600" :
                        "bg-gray-100 text-gray-700"
                      }`}>
                        {isOut ? "Out of Stock" : isLow ? "Low Stock" : "In Stock"}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* ── RIGHT COLUMN: Categories + Warehouses ── */}
        <div className="space-y-6">
          
          {/* Category Breakdown */}
          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <h3 className="text-xs font-bold text-black uppercase tracking-widest mb-4">Categories</h3>
            {loading ? (
              <div className="text-sm text-gray-300 font-medium">Loading...</div>
            ) : categories.length === 0 ? (
              <div className="text-sm text-gray-400 font-medium">No categories</div>
            ) : (
              <div className="space-y-3">
                {categories.slice(0, 5).map((cat, i) => {
                  const maxCount = Math.max(...categories.map(c => c.count), 1);
                  const pct = (cat.count / maxCount) * 100;
                  return (
                    <div key={i}>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-medium text-black">{cat.name}</span>
                        <span className="text-xs font-bold text-gray-400">{cat.count}</span>
                      </div>
                      <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ duration: 0.5, delay: i * 0.1 }}
                          className="h-full bg-black rounded-full"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Warehouses */}
          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <h3 className="text-xs font-bold text-black uppercase tracking-widest mb-4">Warehouses</h3>
            {loading ? (
              <div className="text-sm text-gray-300 font-medium">Loading...</div>
            ) : warehouses.length === 0 ? (
              <div className="text-sm text-gray-400 font-medium">No warehouses</div>
            ) : (
              <div className="space-y-3">
                {warehouses.map((wh, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center text-[10px] font-bold text-black shrink-0">
                      <Building2 size={12} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-semibold text-black truncate">{wh.name || "—"}</div>
                      <div className="text-[10px] text-gray-400">{wh.location || wh.city || "—"}</div>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${wh.isActive === false ? "bg-gray-50 text-gray-400" : "bg-gray-100 text-gray-700"}`}>
                      {wh.isActive === false ? "Inactive" : "Active"}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── MAIN CONTENT ROW 2 ──────────────────────── */}
      <div className="grid lg:grid-cols-3 gap-6">
        
        {/* ── QUICK ACTIONS ─────────────────────────── */}
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <h3 className="text-xs font-bold text-black uppercase tracking-widest mb-4">Quick Actions</h3>
          <div className="space-y-1.5">
            {quickActions.map((action, i) => (
              <Link
                key={i}
                href={action.href}
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors group"
              >
                <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                  <action.icon size={14} className="text-black" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-black group-hover:text-black transition-colors">{action.label}</div>
                  <div className="text-[10px] text-gray-400">{action.desc}</div>
                </div>
                <ArrowRight size={13} className="text-black transition-colors shrink-0" />
              </Link>
            ))}
          </div>
        </div>

        {/* ── AI ASSISTANT ──────────────────────────── */}
        <div className="lg:col-span-2 bg-white border border-gray-200 rounded-xl p-5 flex flex-col">
          <div className="flex items-center gap-3 mb-4 pb-3 border-b border-gray-100">
            <div className="w-8 h-8 rounded-lg bg-gray-900 flex items-center justify-center">
              <BrainCircuit size={15} className="text-white" />
            </div>
            <div>
              <span className="text-sm font-bold text-black">SASA AI — {pillar.name}</span>
              <span className="text-[10px] text-gray-400 ml-2 font-medium">Powered by DeepSeek</span>
            </div>
          </div>
          <div className="flex-1 space-y-3 mb-4 min-h-[120px] max-h-[200px] overflow-y-auto">
            {aiMessages.map((m, i) => (
              <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[85%] px-3.5 py-2 rounded-xl text-sm ${
                  m.role === "user"
                    ? "bg-gray-900 text-white rounded-br-sm"
                    : "bg-gray-50 text-gray-700 rounded-bl-sm"
                }`}>{m.text}</div>
              </div>
            ))}
            {aiLoading && (
              <div className="flex gap-1.5 px-3 py-2">
                {[0,150,300].map(d => <span key={d} className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: `${d}ms` }} />)}
              </div>
            )}
          </div>
          <div className="flex gap-2 items-center">
            {["Low stock report", "Add product", "Stock value"].map((s, i) => (
              <button
                key={i}
                onClick={() => sendMessage(s)}
                className="px-2.5 py-1.5 rounded-lg bg-gray-50 hover:bg-gray-100 border border-gray-100 text-gray-500 hover:text-black text-[10px] font-semibold transition-all"
              >
                {s}
              </button>
            ))}
          </div>
          <div className="flex gap-2 mt-3">
            <input
              value={aiInput}
              onChange={e => setAiInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && sendMessage()}
              placeholder={`Ask AI about ${pillar.name}...`}
              className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-3.5 py-2.5 text-black placeholder:text-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
            />
            <button
              onClick={() => sendMessage()}
              className="w-10 h-10 rounded-lg bg-gray-900 hover:bg-black flex items-center justify-center transition-colors shrink-0"
            >
              <Send size={14} className="text-white" />
            </button>
          </div>
        </div>
      </div>

      {/* ── MODULES GRID ────────────────────────────── */}
      <div>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-sm font-bold text-black uppercase tracking-widest">All Inventory Modules</h2>
          <span className="text-[10px] text-gray-400 font-medium">{pillar.modules.length} modules</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {pillar.modules.map((mod: string, i: number) => (
            <Link key={i} href={`/dashboard/${pillarSlug}/${toSlug(mod)}`} className="block h-full">
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 + i * 0.02 }}
                className="bg-white border border-gray-200 rounded-xl px-4 py-3.5 hover:border-gray-300 hover:shadow-sm transition-all cursor-pointer group h-full flex items-center justify-between"
              >
                <span className="text-sm font-semibold text-black group-hover:text-black">{mod}</span>
                <ArrowRight size={13} className="text-gray-300 group-hover:text-black transition-colors shrink-0 ml-2" />
              </motion.div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── FINANCE DASHBOARD ──────────────────────────────────────────
function FinanceDashboard({ pillar, config, pillarSlug }: { pillar: any; config: any; pillarSlug: string }) {
  const [stats, setStats] = useState<any>(null);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [budgets, setBudgets] = useState<{ name: string; amount: number; spent: number; pct: number }[]>([]);
  const [assets, setAssets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [aiInput, setAiInput] = useState("");
  const [aiMessages, setAiMessages] = useState([
    { role: "ai", text: config.aiContext }
  ]);
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function loadData() {
      try {
        const token = localStorage.getItem("token") || "";

        // Fetch expenses
        const expRes = await fetch(
          "http://localhost:3002/api/v1/modules/finance-accounting/expenses",
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const expData = await expRes.json();
        const exps = expData?.data || [];
        
        if (cancelled) return;

        // Fetch invoices
        const invRes = await fetch(
          "http://localhost:3002/api/v1/modules/finance-accounting/invoicing",
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const invData = await invRes.json();
        const invs = invData?.data || [];

        // Fetch budgets
        const budRes = await fetch(
          "http://localhost:3002/api/v1/modules/finance-accounting/budgeting",
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const budData = await budRes.json();
        const buds = budData?.data || [];

        // Fetch fixed assets
        const astRes = await fetch(
          "http://localhost:3002/api/v1/modules/finance-accounting/fixed-assets",
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const astData = await astRes.json();
        const asts = astData?.data || [];

        if (cancelled) return;

        // Compute stats
        const totalExpenses = exps.length;
        const totalExpenseAmount = exps.reduce((sum: number, e: any) => sum + (e.amount || 0), 0);
        const totalInvoiceAmount = invs.reduce((sum: number, i: any) => sum + (i.total || 0), 0);
        const pendingInvoices = invs.filter((i: any) => (i.status || "").toLowerCase() === "pending" || (i.status || "").toLowerCase() === "unpaid").length;
        const totalBudgets = buds.length;
        const budgetUtilization = buds.length > 0
          ? Math.round(buds.reduce((sum: number, b: any) => sum + ((b.spent || 0) / (b.amount || 1)) * 100, 0) / buds.length)
          : 0;

        // Budget tracking bars
        const budgetArray = buds.slice(0, 5).map((b: any) => {
          const amount = b.amount || 1;
          const spent = b.spent || 0;
          return {
            name: b.name || b.category || "Budget",
            amount,
            spent,
            pct: Math.min(Math.round((spent / amount) * 100), 100),
          };
        });

        setStats({
          totalExpenses,
          totalExpenseAmount,
          totalInvoiceAmount,
          pendingInvoices,
          totalBudgets,
          budgetUtilization,
          totalAssets: asts.length,
          assetValue: asts.reduce((sum: number, a: any) => sum + (a.value || a.cost || 0), 0),
        });
        setExpenses(exps.slice(0, 6));
        setInvoices(invs.slice(0, 5));
        setBudgets(budgetArray);
        setAssets(asts.slice(0, 4));
      } catch (err) {
        console.error("Failed to load finance data:", err);
        setStats({ totalExpenses: 0, totalExpenseAmount: 0, totalInvoiceAmount: 0, pendingInvoices: 0, totalBudgets: 0, budgetUtilization: 0, totalAssets: 0, assetValue: 0 });
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    loadData();
    return () => { cancelled = true; };
  }, []);

  const sendMessage = async (text?: string) => {
    const msg = text ?? aiInput;
    if (!msg.trim()) return;
    setAiMessages(prev => [...prev, { role: "user", text: msg }]);
    setAiInput("");
    setAiLoading(true);
    await new Promise(r => setTimeout(r, 1000));
    setAiMessages(prev => [...prev, {
      role: "ai",
      text: `Processing: "${msg}". I'll execute this across the Finance modules automatically.`
    }]);
    setAiLoading(false);
  };

  const formatCurrency = (val: number) => {
    if (val >= 1000000) return `ETB ${(val / 1000000).toFixed(1)}M`;
    if (val >= 1000) return `ETB ${(val / 1000).toFixed(0)}K`;
    return `ETB ${val.toLocaleString()}`;
  };

  const kpiCards = [
    { label: "Total Expenses", value: stats?.totalExpenses ?? "—", icon: DollarSign, change: stats?.totalExpenseAmount ? formatCurrency(stats.totalExpenseAmount) : "—" },
    { label: "Invoices", value: stats?.totalInvoiceAmount ? formatCurrency(stats.totalInvoiceAmount) : "—", icon: FileText, change: `${stats?.pendingInvoices ?? 0} pending` },
    { label: "Budget Util.", value: stats?.budgetUtilization != null ? `${stats.budgetUtilization}%` : "—", icon: BarChart3, change: `${stats?.totalBudgets ?? 0} active` },
    { label: "Fixed Assets", value: stats?.totalAssets ?? "—", icon: Building2, change: stats?.assetValue ? formatCurrency(stats.assetValue) : "—" },
  ];

  const quickActions = [
    { label: "New Expense", icon: DollarSign, href: "/dashboard/finance-accounting/expenses", desc: "Record expense" },
    { label: "Create Invoice", icon: FileText, href: "/dashboard/finance-accounting/invoicing", desc: "Bill customer" },
    { label: "View Budgets", icon: BarChart3, href: "/dashboard/finance-accounting/budgeting", desc: "Track spending" },
    { label: "Cash Flow", icon: TrendingUp, href: "/dashboard/finance-accounting/cash-flow", desc: "Forecast & reports" },
    { label: "General Ledger", icon: Activity, href: "/dashboard/finance-accounting/general-ledger", desc: "Journal entries" },
    { label: "Tax Report", icon: CheckCircle, href: "/dashboard/finance-accounting/tax-vat", desc: "Compliance" },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-20">
      
      {/* ── HEADER ─────────────────────────────────── */}
      <div className="border-b border-gray-200 pb-6">
        <div className="flex items-center gap-3 mb-3">
          <span className="text-4xl">{pillar.emoji}</span>
          <div>
            <h1 className="text-3xl font-bold text-black tracking-tight">{pillar.name}</h1>
            <p className="text-sm text-gray-500 font-normal mt-0.5">{pillar.desc}</p>
          </div>
        </div>
      </div>

      {/* ── KPI CARDS ──────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {kpiCards.map((kpi, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            className="bg-white border border-gray-200 rounded-xl px-5 py-4"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                <kpi.icon size={15} className="text-black" />
              </div>
            </div>
            <div className="text-2xl font-bold text-black tracking-tight leading-none mb-1">
              {loading ? <span className="text-gray-300">—</span> : kpi.value}
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500 font-medium">{kpi.label}</span>
              <span className="text-[10px] text-gray-400 font-medium">{kpi.change}</span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* ── MAIN CONTENT ROW 1 ──────────────────────── */}
      <div className="grid lg:grid-cols-3 gap-6">
        
        {/* ── RECENT EXPENSES ───────────────────────── */}
        <div className="lg:col-span-2 bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h3 className="text-sm font-bold text-black uppercase tracking-widest">Recent Expenses</h3>
            <Link href="/dashboard/finance-accounting/expenses" className="text-xs font-semibold text-gray-400 hover:text-black transition-colors flex items-center gap-1">
              View All <ExternalLink size={12} className="text-black" />
            </Link>
          </div>
          <div className="divide-y divide-gray-50">
            {loading ? (
              <div className="px-5 py-8 text-center text-sm text-gray-300 font-medium">Loading...</div>
            ) : expenses.length === 0 ? (
              <div className="px-5 py-8 text-center text-sm text-gray-400 font-medium">No expenses recorded yet</div>
            ) : (
              expenses.map((exp, i) => (
                <div key={i} className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50 transition-colors">
                  <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-[11px] font-bold text-black shrink-0">
                    <DollarSign size={14} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-black truncate">{exp.description || exp.name || "—"}</div>
                    <div className="text-xs text-gray-400">{exp.category || "Uncategorized"} {exp.date ? `· ${exp.date.split("T")[0] || exp.date}` : ""}</div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-xs font-bold text-black">{formatCurrency(exp.amount || 0)}</div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      (exp.status || "").toLowerCase() === "approved" ? "bg-gray-100 text-gray-700" :
                      (exp.status || "").toLowerCase() === "pending" ? "bg-gray-50 text-gray-500" :
                      "bg-gray-50 text-gray-400"
                    }`}>
                      {exp.status || "—"}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* ── RIGHT COLUMN: Budgets + Assets ────────── */}
        <div className="space-y-6">
          
          {/* Budget Tracking */}
          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <h3 className="text-xs font-bold text-black uppercase tracking-widest mb-4">Budget Tracking</h3>
            {loading ? (
              <div className="text-sm text-gray-300 font-medium">Loading...</div>
            ) : budgets.length === 0 ? (
              <div className="text-sm text-gray-400 font-medium">No budgets configured</div>
            ) : (
              <div className="space-y-4">
                {budgets.map((bud, i) => (
                  <div key={i}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium text-black truncate mr-2">{bud.name}</span>
                      <span className="text-xs font-bold text-gray-400 shrink-0">{bud.pct}%</span>
                    </div>
                    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${bud.pct}%` }}
                        transition={{ duration: 0.6, delay: i * 0.12 }}
                        className={`h-full rounded-full ${
                          bud.pct > 90 ? "bg-gray-700" :
                          bud.pct > 75 ? "bg-gray-500" :
                          "bg-black"
                        }`}
                      />
                    </div>
                    <div className="flex justify-between mt-0.5">
                      <span className="text-[10px] text-gray-400">{formatCurrency(bud.spent)} spent</span>
                      <span className="text-[10px] text-gray-400">of {formatCurrency(bud.amount)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Fixed Assets */}
          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <h3 className="text-xs font-bold text-black uppercase tracking-widest mb-4">Fixed Assets</h3>
            {loading ? (
              <div className="text-sm text-gray-300 font-medium">Loading...</div>
            ) : assets.length === 0 ? (
              <div className="text-sm text-gray-400 font-medium">No fixed assets</div>
            ) : (
              <div className="space-y-3">
                {assets.map((asset, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center text-[10px] font-bold text-black shrink-0">
                      <Building2 size={12} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-semibold text-black truncate">{asset.name || "—"}</div>
                      <div className="text-[10px] text-gray-400">{asset.category || asset.type || "—"} · {formatCurrency(asset.value || asset.cost || 0)}</div>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      (asset.status || "").toLowerCase() === "active" || (asset.status || "").toLowerCase() === "in use" ? "bg-gray-100 text-gray-700" :
                      "bg-gray-50 text-gray-400"
                    }`}>
                      {asset.status || "—"}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── MAIN CONTENT ROW 2 ──────────────────────── */}
      <div className="grid lg:grid-cols-3 gap-6">
        
        {/* ── QUICK ACTIONS ─────────────────────────── */}
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <h3 className="text-xs font-bold text-black uppercase tracking-widest mb-4">Quick Actions</h3>
          <div className="space-y-1.5">
            {quickActions.map((action, i) => (
              <Link
                key={i}
                href={action.href}
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors group"
              >
                <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                  <action.icon size={14} className="text-black" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-black group-hover:text-black transition-colors">{action.label}</div>
                  <div className="text-[10px] text-gray-400">{action.desc}</div>
                </div>
                <ArrowRight size={13} className="text-black transition-colors shrink-0" />
              </Link>
            ))}
          </div>
        </div>

        {/* ── AI ASSISTANT ──────────────────────────── */}
        <div className="lg:col-span-2 bg-white border border-gray-200 rounded-xl p-5 flex flex-col">
          <div className="flex items-center gap-3 mb-4 pb-3 border-b border-gray-100">
            <div className="w-8 h-8 rounded-lg bg-gray-900 flex items-center justify-center">
              <BrainCircuit size={15} className="text-white" />
            </div>
            <div>
              <span className="text-sm font-bold text-black">SASA AI — {pillar.name}</span>
              <span className="text-[10px] text-gray-400 ml-2 font-medium">Powered by DeepSeek</span>
            </div>
          </div>
          <div className="flex-1 space-y-3 mb-4 min-h-[120px] max-h-[200px] overflow-y-auto">
            {aiMessages.map((m, i) => (
              <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[85%] px-3.5 py-2 rounded-xl text-sm ${
                  m.role === "user"
                    ? "bg-gray-900 text-white rounded-br-sm"
                    : "bg-gray-50 text-gray-700 rounded-bl-sm"
                }`}>{m.text}</div>
              </div>
            ))}
            {aiLoading && (
              <div className="flex gap-1.5 px-3 py-2">
                {[0,150,300].map(d => <span key={d} className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: `${d}ms` }} />)}
              </div>
            )}
          </div>
          <div className="flex gap-2 items-center">
            {["Expense report", "Invoice summary", "Cash flow"].map((s, i) => (
              <button
                key={i}
                onClick={() => sendMessage(s)}
                className="px-2.5 py-1.5 rounded-lg bg-gray-50 hover:bg-gray-100 border border-gray-100 text-gray-500 hover:text-black text-[10px] font-semibold transition-all"
              >
                {s}
              </button>
            ))}
          </div>
          <div className="flex gap-2 mt-3">
            <input
              value={aiInput}
              onChange={e => setAiInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && sendMessage()}
              placeholder={`Ask AI about ${pillar.name}...`}
              className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-3.5 py-2.5 text-black placeholder:text-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
            />
            <button
              onClick={() => sendMessage()}
              className="w-10 h-10 rounded-lg bg-gray-900 hover:bg-black flex items-center justify-center transition-colors shrink-0"
            >
              <Send size={14} className="text-white" />
            </button>
          </div>
        </div>
      </div>

      {/* ── MODULES GRID ────────────────────────────── */}
      <div>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-sm font-bold text-black uppercase tracking-widest">All Finance Modules</h2>
          <span className="text-[10px] text-gray-400 font-medium">{pillar.modules.length} modules</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {pillar.modules.map((mod: string, i: number) => (
            <Link key={i} href={`/dashboard/${pillarSlug}/${toSlug(mod)}`} className="block h-full">
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 + i * 0.02 }}
                className="bg-white border border-gray-200 rounded-xl px-4 py-3.5 hover:border-gray-300 hover:shadow-sm transition-all cursor-pointer group h-full flex items-center justify-between"
              >
                <span className="text-sm font-semibold text-black group-hover:text-black">{mod}</span>
                <ArrowRight size={13} className="text-gray-300 group-hover:text-black transition-colors shrink-0 ml-2" />
              </motion.div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

function PillarPageContent({ pillar, config, pillarSlug }: { pillar: any; config: any; pillarSlug: string }) {
  // Render specialized dashboards
  if (pillarSlug === "human-resources") {
    return <HRDashboard pillar={pillar} config={config} pillarSlug={pillarSlug} />;
  }
  if (pillarSlug === "crm-sales") {
    return <CRMDashboard pillar={pillar} config={config} pillarSlug={pillarSlug} />;
  }
  if (pillarSlug === "inventory-warehouse") {
    return <InventoryDashboard pillar={pillar} config={config} pillarSlug={pillarSlug} />;
  }
  if (pillarSlug === "finance-accounting") {
    return <FinanceDashboard pillar={pillar} config={config} pillarSlug={pillarSlug} />;
  }
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
                <kpi.icon size={16} className="text-black" />
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
                <ArrowRight size={14} className="text-black transition-colors" />
              </Link>
            ))}
          </div>
        </div>

        {/* ── AI ASSISTANT ─────────────────────────────── */}
        <div className="lg:col-span-2 bg-slate-900 rounded-2xl p-6 shadow-xl flex flex-col">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
              <BrainCircuit size={16} className="text-black" />
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
          <Box className="text-black" size={18} /> All Modules
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
                  Open Module <ArrowRight size={13} className="ml-1 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-black" />
                </div>
              </motion.div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

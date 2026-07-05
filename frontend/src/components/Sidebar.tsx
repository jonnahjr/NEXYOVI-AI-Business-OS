"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ChevronDown, Hexagon, Settings, LayoutDashboard, BrainCircuit
} from "lucide-react";

import { NEXYOVI_PILLARS, toSlug } from "@/lib/pillars";

export default function Sidebar() {
  const pathname = usePathname();
  const [openPillar, setOpenPillar] = useState<number | null>(null);

  return (
    <aside className="w-72 h-screen fixed left-0 top-0 bg-white border-r border-slate-100 overflow-y-auto hidden md:flex flex-col">
      {/* Logo */}
      <div className="px-6 py-5 sticky top-0 bg-white/90 backdrop-blur-md z-20 border-b border-slate-100">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center group-hover:scale-105 transition-transform">
            <Hexagon className="text-white fill-white/20" size={16} />
          </div>
          <div>
            <h1 className="text-base font-bold tracking-tight text-slate-900 leading-none">NEXYOVI</h1>
            <span className="text-[9px] uppercase tracking-widest text-slate-400 font-semibold">AI Business OS</span>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-0.5 pb-24 overflow-y-auto">

        {/* Dashboard Home */}
        <Link
          href="/dashboard"
          className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition-all duration-200 ${
            pathname === "/dashboard"
              ? "bg-primary text-black font-semibold"
              : "hover:bg-slate-50 text-slate-600"
          }`}
        >
          <LayoutDashboard size={16} />
          <span className="font-medium text-sm">Command Center</span>
        </Link>

        {/* AI Assistant */}
        <Link
          href="/dashboard/ai-core"
          className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition-all duration-200 ${
            pathname === "/dashboard/ai-core"
              ? "bg-primary text-black font-semibold"
              : "hover:bg-slate-50 text-slate-600"
          }`}
        >
          <BrainCircuit size={16} />
          <span className="font-medium text-sm">AI Assistant</span>
        </Link>

        <div className="h-px bg-slate-100 my-2" />

        {/* All Pillars */}
        {NEXYOVI_PILLARS.map((pillar, idx) => {
          const pillarSlug = toSlug(pillar.name);
          const pillarHref = `/dashboard/${pillarSlug}`;
          const isPillarActive = pathname.startsWith(pillarHref);
          const isOpen = openPillar === idx;

          return (
            <div key={idx}>
              <div className={`flex items-center rounded-xl transition-all duration-200 ${
                isPillarActive ? "bg-primary/10" : "hover:bg-slate-50"
              }`}>
                {/* Pillar name → its own page */}
                <Link
                  href={pillarHref}
                  className={`flex-1 flex items-center gap-2.5 px-3 py-2.5 ${
                    isPillarActive ? "text-black font-semibold" : "text-slate-600"
                  }`}
                >
                  <span className="text-base leading-none">{pillar.emoji}</span>
                  <span className="font-medium text-sm truncate">{pillar.name}</span>
                </Link>

                {/* Chevron → expands sub-modules */}
                <button
                  onClick={() => setOpenPillar(isOpen ? null : idx)}
                  className={`px-2 py-2.5 rounded-r-xl transition-colors ${
                    isPillarActive ? "text-black/60" : "text-slate-400 hover:text-slate-700"
                  }`}
                >
                  <ChevronDown size={13} className={`transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} />
                </button>
              </div>

              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="ml-3 mt-0.5 mb-1 pl-4 border-l border-slate-100 space-y-0.5">
                      {pillar.modules.map((mod, i) => {
                        const href = `/dashboard/${pillarSlug}/${toSlug(mod)}`;
                        const active = pathname === href;
                        return (
                          <Link
                            key={i}
                            href={href}
                            className={`block py-1.5 px-2 text-sm rounded-lg transition-colors ${
                              active ? "bg-slate-100 text-slate-900 font-medium" : "text-slate-500 hover:text-slate-900 hover:bg-slate-50 font-light"
                            }`}
                          >
                            {mod}
                          </Link>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-slate-100 bg-white">
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-black text-xs font-bold">N</div>
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-semibold text-slate-900 truncate">System Admin</h4>
          </div>
          <Settings size={14} className="text-slate-400 shrink-0" />
        </div>
      </div>
    </aside>
  );
}

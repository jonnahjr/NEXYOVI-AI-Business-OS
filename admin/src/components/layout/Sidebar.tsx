"use client";

import { motion } from "framer-motion";
import { 
  LayoutDashboard, 
  Users, 
  Briefcase, 
  Box, 
  DollarSign, 
  Activity, 
  Settings, 
  Bot 
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { icon: LayoutDashboard, label: "AI CEO Dashboard", href: "/" },
  { icon: Users, label: "HR & Payroll", href: "/hr" },
  { icon: Briefcase, label: "CRM & Sales", href: "/crm" },
  { icon: Box, label: "Inventory", href: "/inventory" },
  { icon: DollarSign, label: "Accounting", href: "/accounting" },
  { icon: Activity, label: "Live Analytics", href: "/analytics" },
  { icon: Bot, label: "AI Agents", href: "/agents" },
  { icon: Settings, label: "System Config", href: "/settings" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <motion.aside 
      initial={{ x: -300 }}
      animate={{ x: 0 }}
      className="w-64 glass border-r border-white/10 flex flex-col h-screen fixed left-0 top-0 z-40 bg-black/40"
    >
      <div className="p-6 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
          <Bot className="text-black w-5 h-5" />
        </div>
        <h1 className="text-xl font-bold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-white to-white/50">
          NEXYOVI
        </h1>
      </div>

      <nav className="flex-1 px-4 space-y-2 mt-4">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          
          return (
            <Link key={item.label} href={item.href} className="block relative">
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-primary/20 rounded-lg border border-primary/50"
                  initial={false}
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              <div className={`relative flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive ? 'text-black' : 'text-black hover:text-black hover:bg-white/5'}`}>
                <Icon className="w-5 h-5 text-black" />
                <span className="font-medium text-sm">{item.label}</span>
              </div>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 mt-auto">
        <div className="glass p-4 rounded-xl relative overflow-hidden group cursor-pointer">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <p className="text-xs text-muted-foreground mb-1">System Status</p>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-sm font-medium text-white">All Systems Nominal</span>
          </div>
        </div>
      </div>
    </motion.aside>
  );
}

"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowUpRight, ArrowDownRight, Activity, Users, DollarSign, Box } from "lucide-react";
import { AreaChart, Area, ResponsiveContainer, Tooltip } from "recharts";

const data = [
  { value: 400 },
  { value: 300 },
  { value: 550 },
  { value: 450 },
  { value: 700 },
  { value: 650 },
  { value: 850 },
];

const kpis = [
  {
    title: "Total Revenue",
    value: "ETB 24.5M",
    change: "+12.5%",
    trend: "up",
    icon: DollarSign,
  },
  {
    title: "Active Employees",
    value: "1,240",
    change: "+4.1%",
    trend: "up",
    icon: Users,
  },
  {
    title: "Inventory Value",
    value: "ETB 8.2M",
    change: "-2.4%",
    trend: "down",
    icon: Box,
  },
  {
    title: "System Efficiency",
    value: "98.4%",
    change: "+0.2%",
    trend: "up",
    icon: Activity,
  },
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

export function KPIGrid() {
  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
    >
      {kpis.map((kpi, index) => (
        <motion.div key={kpi.title} variants={item}>
          <Card className="glass border-white/5 bg-black/20 hover:bg-black/40 transition-colors relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <kpi.icon className="w-16 h-16 text-black" />
            </div>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {kpi.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white mb-1">{kpi.value}</div>
              <div className="flex items-center text-xs">
                {kpi.trend === "up" ? (
                  <span className="text-black flex items-center bg-black/10 px-1 py-0.5 rounded">
                    <ArrowUpRight className="w-3 h-3 mr-1" />
                    {kpi.change}
                  </span>
                ) : (
                  <span className="text-black flex items-center bg-black/10 px-1 py-0.5 rounded">
                    <ArrowDownRight className="w-3 h-3 mr-1" />
                    {kpi.change}
                  </span>
                )}
                <span className="text-muted-foreground ml-2">vs last month</span>
              </div>
              <div className="h-[40px] mt-4 opacity-50">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data}>
                    <defs>
                      <linearGradient id={`colorValue${index}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#000000" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#000000" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <Area type="monotone" dataKey="value" stroke="#000000" fillOpacity={1} fill={`url(#colorValue${index})`} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </motion.div>
  );
}

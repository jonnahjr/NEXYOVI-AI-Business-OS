"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, MapPin, ArrowRight, Truck, User, Fuel, Clock, Zap, CheckCircle,
  RotateCw, BarChart3, Route, Mountain, Navigation,
  DollarSign, X
} from "lucide-react";
import { useToast } from "@/components/ui/Toast";

interface Route {
  id: string;
  routeNo: string;
  origin: string;
  destination: string;
  distance: number;
  estDuration: string;
  vehicle: string;
  driver: string;
  fuelEstimate: number;
  costEstimate: number;
  optimized: string;
  routeStatus: string;
  trafficFactor?: string;
  roadCondition?: string;
  waypoints?: string[];
  alternativeRoutes?: { label: string; distance: number; duration: string; fuel: number }[];
}

const sampleRoutes: Route[] = [
  { id: "r1", routeNo: "RTE-001", origin: "Addis Ababa (HQ)", destination: "Gondar", distance: 720, estDuration: "10h 30m", vehicle: "Isuzu Truck FVR", driver: "Petros Haile", fuelEstimate: 85, costEstimate: 10710, optimized: "Optimal", routeStatus: "Completed", trafficFactor: "Light", roadCondition: "Good", waypoints: ["Debre Markos", "Bahir Dar"] },
  { id: "r2", routeNo: "RTE-002", origin: "Addis Ababa (HQ)", destination: "Hawassa", distance: 275, estDuration: "4h 15m", vehicle: "Toyota Hilux", driver: "Solomon Tadesse", fuelEstimate: 35, costEstimate: 4410, optimized: "Express", routeStatus: "In Progress", trafficFactor: "Moderate", roadCondition: "Excellent", alternativeRoutes: [{ label: "Via Ziway", distance: 290, duration: "4h 30m", fuel: 38 }] },
  { id: "r3", routeNo: "RTE-003", origin: "Addis Ababa (HQ)", destination: "Dire Dawa", distance: 445, estDuration: "6h 45m", vehicle: "Mitsubishi Fuso", driver: "Bereket Alemu", fuelEstimate: 55, costEstimate: 6930, optimized: "Economy", routeStatus: "Planned", trafficFactor: "Light", roadCondition: "Good", alternativeRoutes: [{ label: "Via Debre Birhan", distance: 420, duration: "7h 00m", fuel: 52 }] },
  { id: "r4", routeNo: "RTE-004", origin: "Hawassa", destination: "Arba Minch", distance: 275, estDuration: "4h 00m", vehicle: "Land Cruiser", driver: "Mulugeta Girma", fuelEstimate: 32, costEstimate: 4032, optimized: "Alternative", routeStatus: "Planned", trafficFactor: "Light", roadCondition: "Fair" },
  { id: "r5", routeNo: "RTE-005", origin: "Addis Ababa (HQ)", destination: "Bahir Dar", distance: 565, estDuration: "8h 15m", vehicle: "Isuzu Truck FVR", driver: "Petros Haile", fuelEstimate: 68, costEstimate: 8568, optimized: "Optimal", routeStatus: "Planned", trafficFactor: "Light", roadCondition: "Good", waypoints: ["Debre Libanos"] },
  { id: "r6", routeNo: "RTE-006", origin: "Addis Ababa (HQ)", destination: "Mekelle", distance: 780, estDuration: "11h 00m", vehicle: "Mitsubishi Fuso", driver: "Bereket Alemu", fuelEstimate: 95, costEstimate: 11970, optimized: "Scenic", routeStatus: "Planned", trafficFactor: "Light", roadCondition: "Fair", alternativeRoutes: [{ label: "Via Dessie", distance: 750, duration: "10h 30m", fuel: 90 }] },
  { id: "r7", routeNo: "RTE-007", origin: "Addis Ababa (HQ)", destination: "Jimma", distance: 350, estDuration: "5h 30m", vehicle: "Toyota Hilux", driver: "Mulugeta Girma", fuelEstimate: 42, costEstimate: 5292, optimized: "Optimal", routeStatus: "Planned", trafficFactor: "Light", roadCondition: "Fair" },
];

const statusColors: Record<string, string> = {
  "Completed": "bg-emerald-50 text-emerald-700 border-emerald-200",
  "In Progress": "bg-blue-50 text-blue-700 border-blue-200",
  "Planned": "bg-slate-100 text-slate-600 border-slate-200",
  "Cancelled": "bg-red-50 text-red-600 border-red-200",
};

const optimizationColors: Record<string, string> = {
  "Optimal": "bg-emerald-50 text-emerald-700 border-emerald-200",
  "Express": "bg-blue-50 text-blue-700 border-blue-200",
  "Economy": "bg-amber-50 text-amber-700 border-amber-200",
  "Alternative": "bg-purple-50 text-purple-700 border-purple-200",
  "Scenic": "bg-rose-50 text-rose-700 border-rose-200",
};

const optimizationIcons: Record<string, any> = {
  "Optimal": Zap, "Express": Navigation, "Economy": DollarSign,
  "Alternative": Route, "Scenic": Mountain,
};

export default function RouteOptimizationPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedRoute, setSelectedRoute] = useState<Route | null>(null);
  const [compareMode, setCompareMode] = useState(false);
  const { toast } = useToast();

  const filtered = sampleRoutes.filter(r => {
    const matchesSearch = !search ||
      r.routeNo.toLowerCase().includes(search.toLowerCase()) ||
      r.origin.toLowerCase().includes(search.toLowerCase()) ||
      r.destination.toLowerCase().includes(search.toLowerCase()) ||
      r.driver.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "All" || r.routeStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalDistance = sampleRoutes.reduce((s, r) => s + r.distance, 0);
  const totalFuel = sampleRoutes.reduce((s, r) => s + r.fuelEstimate, 0);
  const totalCost = sampleRoutes.reduce((s, r) => s + r.costEstimate, 0);
  const activeRoutes = sampleRoutes.filter(r => r.routeStatus === "In Progress" || r.routeStatus === "Planned").length;

  const handleOptimize = () => {
    toast("Routes optimized! Check alternatives for each route.", "success");
  };

  return (
    <div className="space-y-5">
      {/* KPI Cards */}
      <div className="grid grid-cols-5 gap-3">
        <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-2 text-slate-400 text-xs font-medium mb-1"><MapPin size={12} /> Total Routes</div>
          <div className="text-lg font-bold text-slate-900">{sampleRoutes.length}</div>
        </div>
        <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-2 text-slate-400 text-xs font-medium mb-1"><ArrowRight size={12} /> Total Distance</div>
          <div className="text-lg font-bold text-slate-900">{totalDistance.toLocaleString()} km</div>
        </div>
        <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-2 text-slate-400 text-xs font-medium mb-1"><Fuel size={12} /> Est. Fuel</div>
          <div className="text-lg font-bold text-amber-600">{totalFuel} L</div>
        </div>
        <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-2 text-slate-400 text-xs font-medium mb-1"><DollarSign size={12} /> Est. Cost</div>
          <div className="text-lg font-bold text-red-500">ETB {totalCost.toLocaleString()}</div>
        </div>
        <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-2 text-slate-400 text-xs font-medium mb-1"><Zap size={12} /> Active Routes</div>
          <div className="text-lg font-bold text-blue-600">{activeRoutes}</div>
        </div>
      </div>

      {/* Search, Filter, Actions */}
      <div className="flex gap-3 items-center flex-wrap">
        <div className="flex-1 relative min-w-[200px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search routes..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900" />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          className="px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 bg-white">
          <option value="All">All Status</option>
          <option value="Planned">Planned</option>
          <option value="In Progress">In Progress</option>
          <option value="Completed">Completed</option>
        </select>
        <button onClick={handleOptimize}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-black text-xs font-bold transition-all">
          <RotateCw size={13} /> Optimize All
        </button>
        <button onClick={() => setCompareMode(!compareMode)}
          className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-xs font-medium transition-all ${
            compareMode ? "bg-blue-50 border-blue-200 text-blue-700" : "border-slate-200 text-slate-600 hover:bg-slate-50"
          }`}>
          <BarChart3 size={13} /> Compare
        </button>
      </div>

      {/* Comparison Chart */}
      {compareMode && (
        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
          className="bg-slate-50 border border-slate-200 rounded-xl p-4 shadow-sm overflow-hidden">
          <h3 className="text-xs font-bold text-slate-500 uppercase mb-3">Route Comparison</h3>
          <div className="space-y-2">
            {sampleRoutes.map((r, i) => {
              const maxDistance = Math.max(...sampleRoutes.map(x => x.distance));
              const widthPct = (r.distance / maxDistance) * 100;
              const CostIcon = optimizationIcons[r.optimized] || Zap;
              return (
                <div key={i} className="flex items-center gap-3">
                  <span className="text-[10px] font-mono text-slate-400 w-14">{r.routeNo}</span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between text-[10px] text-slate-500 mb-0.5">
                      <span>{r.origin.split("(")[0].trim()} → {r.destination}</span>
                      <span className="font-mono">{r.distance} km</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500 rounded-full" style={{ width: `${widthPct}%` }} />
                    </div>
                  </div>
                  <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-semibold border ${optimizationColors[r.optimized]}`}>
                    <CostIcon size={8} /> {r.optimized}
                  </span>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Route Table */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-100">
                <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap">Route</th>
                <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap">Origin → Destination</th>
                <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap">Distance</th>
                <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap">Duration</th>
                <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap">Vehicle</th>
                <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap">Optimization</th>
                <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap">Status</th>
                <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r, i) => {
                const OptIcon = optimizationIcons[r.optimized] || Zap;
                return (
                  <motion.tr key={r.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                    className={`border-b border-slate-100 hover:bg-slate-50/50 transition-colors ${
                      selectedRoute?.id === r.id ? "bg-blue-50/50" : ""
                    }`}>
                    <td className="px-4 py-3 text-sm font-semibold text-slate-900">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-md bg-slate-100 flex items-center justify-center font-bold text-[10px] text-slate-600">{r.routeNo.slice(-3)}</div>
                        {r.routeNo}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600">
                      <span className="text-emerald-600">{r.origin.split("(")[0].trim()}</span>
                      <ArrowRight size={10} className="inline mx-1 text-slate-300" />
                      <span className="text-red-400">{r.destination}</span>
                    </td>
                    <td className="px-4 py-3 text-sm font-mono text-slate-500">{r.distance} km</td>
                    <td className="px-4 py-3 text-sm text-slate-500">{r.estDuration}</td>
                    <td className="px-4 py-3 text-sm text-slate-600">{r.vehicle}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${optimizationColors[r.optimized]}`}>
                        <OptIcon size={10} />{r.optimized}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${statusColors[r.routeStatus]}`}>{r.routeStatus}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button onClick={() => toast("Route recalculated", "success")}
                          className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-medium text-slate-500 hover:bg-blue-50 hover:text-blue-600 transition-colors">
                          <RotateCw size={10} /> Recalc
                        </button>
                        <button onClick={() => setSelectedRoute(selectedRoute?.id === r.id ? null : r)}
                          className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-medium text-slate-500 hover:bg-slate-100 transition-colors">
                          {selectedRoute?.id === r.id ? "Hide" : "View"}
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 border-t border-slate-200 bg-slate-50/50 flex items-center justify-between text-xs text-slate-500">
          <span>{filtered.length} route{filtered.length !== 1 ? "s" : ""}</span>
        </div>
      </div>

      {/* Expanded Route Details */}
      {selectedRoute && (() => {
        const r = sampleRoutes.find(rt => rt.id === selectedRoute.id);
        if (!r) return null;
        return (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
            className="bg-slate-50 border border-slate-200 rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-slate-900">{r.routeNo} — Details</h3>
              <button onClick={() => setSelectedRoute(null)} className="text-slate-400 hover:text-slate-600"><X size={16} /></button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs text-slate-500 mb-3">
              <div>
                <div className="text-[9px] text-slate-400 uppercase font-bold">Driver</div>
                <div className="font-semibold text-slate-800">{r.driver}</div>
              </div>
              <div>
                <div className="text-[9px] text-slate-400 uppercase font-bold">Fuel Est.</div>
                <div className="font-semibold text-slate-800">{r.fuelEstimate} L</div>
              </div>
              <div>
                <div className="text-[9px] text-slate-400 uppercase font-bold">Cost Est.</div>
                <div className="font-semibold text-red-500">ETB {r.costEstimate.toLocaleString()}</div>
              </div>
              <div>
                <div className="text-[9px] text-slate-400 uppercase font-bold">Traffic</div>
                <div className="font-semibold text-slate-800">{r.trafficFactor || "N/A"}</div>
              </div>
              <div>
                <div className="text-[9px] text-slate-400 uppercase font-bold">Road Condition</div>
                <div className="font-semibold text-slate-800">{r.roadCondition || "N/A"}</div>
              </div>
              <div>
                <div className="text-[9px] text-slate-400 uppercase font-bold">Waypoints</div>
                <div className="font-semibold text-slate-800">{r.waypoints?.join(", ") || "None"}</div>
              </div>
            </div>
            {r.alternativeRoutes && r.alternativeRoutes.length > 0 && (
              <div className="pt-2 border-t border-slate-100">
                <div className="text-[9px] font-bold text-slate-400 uppercase mb-1.5">Alternative Routes</div>
                <div className="space-y-1">
                  {r.alternativeRoutes.map((alt, ai) => (
                    <div key={ai} className="flex items-center gap-2 text-[10px] text-slate-500 bg-blue-50/50 rounded-lg px-3 py-1.5">
                      <Navigation size={9} className="text-blue-500 shrink-0" />
                      <span className="font-medium">{alt.label}</span>
                      <span className="font-mono text-slate-400">{alt.distance} km</span>
                      <span className="font-mono text-slate-400">{alt.duration}</span>
                      <span className="font-mono text-slate-400">{alt.fuel} L</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        );
      })()}

      {/* Empty State */}
      {filtered.length === 0 && (
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-10 text-center">
          <Route size={24} className="text-slate-300 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-slate-900 mb-1">No Routes Found</h3>
          <p className="text-sm text-slate-500">{search ? "Try a different search" : "Plan your first route"}</p>
        </div>
      )}
    </div>
  );
}

"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Search, Truck, Navigation, Circle, MapPin, Clock, Gauge, Wifi, WifiOff, User,
  Battery, BatteryCharging, BatteryWarning, RefreshCw, Play, Pause,
  ChevronDown, ChevronUp, Map, AlertTriangle, Radar, X
} from "lucide-react";
import MapView from "./MapView";

interface VehicleTrack {
  id: string;
  vehicle: string;
  driver: string;
  plate: string;
  lat: number;
  lng: number;
  speed: number;
  heading: string;
  lastUpdated: string;
  gpsStatus: string;
  batteryLevel?: number;
  fuelLevel?: number;
  lastStop?: string;
  totalDistanceToday?: number;
  routeHistory?: { lat: number; lng: number; time: string }[];
}

const sampleTracks: VehicleTrack[] = [
  { id: "v1", vehicle: "Toyota Hilux 2022", driver: "Solomon Tadesse", plate: "AA-3-5678", lat: 8.9806, lng: 38.7578, speed: 65, heading: "NE", lastUpdated: "2026-07-10 14:32", gpsStatus: "Moving", batteryLevel: 85, fuelLevel: 72, lastStop: "Bole Fuel Station", totalDistanceToday: 142 },
  { id: "v2", vehicle: "Isuzu Truck FVR", driver: "Petros Haile", plate: "AA-1-1234", lat: 9.0241, lng: 38.7469, speed: 0, heading: "N", lastUpdated: "2026-07-10 14:15", gpsStatus: "Idle", batteryLevel: 92, fuelLevel: 45, lastStop: "Mexico Terminal", totalDistanceToday: 87 },
  { id: "v3", vehicle: "Land Cruiser", driver: "Mulugeta Girma", plate: "OR-2-9012", lat: 8.9932, lng: 38.7998, speed: 72, heading: "SW", lastUpdated: "2026-07-10 14:28", gpsStatus: "Moving", batteryLevel: 68, fuelLevel: 55, lastStop: "Kazanchis", totalDistanceToday: 195 },
  { id: "v4", vehicle: "Hyundai H350 Van", driver: "Daniel Bekele", plate: "AA-4-3456", lat: 8.96, lng: 38.77, speed: 0, heading: "-", lastUpdated: "2026-07-10 13:00", gpsStatus: "Stopped", batteryLevel: 45, fuelLevel: 30, lastStop: "Bole Cargo", totalDistanceToday: 56 },
  { id: "v5", vehicle: "Mitsubishi Fuso", driver: "Bereket Alemu", plate: "SN-1-7890", lat: 9.03, lng: 38.81, speed: 0, heading: "-", lastUpdated: "2026-07-10 11:45", gpsStatus: "Offline", batteryLevel: 0, fuelLevel: 15, lastStop: "Semera Junction", totalDistanceToday: 320 },
  { id: "v6", vehicle: "Toyota Hiace", driver: "Tewodros Hailu", plate: "AA-5-2345", lat: 8.9700, lng: 38.7900, speed: 48, heading: "SE", lastUpdated: "2026-07-10 14:30", gpsStatus: "Moving", batteryLevel: 78, fuelLevel: 60, lastStop: "CMC", totalDistanceToday: 110 },
];

const statusColors: Record<string, string> = {
  Moving: "text-emerald-600 bg-emerald-50 border-emerald-200",
  Idle: "text-amber-600 bg-amber-50 border-amber-200",
  Stopped: "text-slate-500 bg-slate-50 border-slate-200",
  Offline: "text-red-500 bg-red-50 border-red-200",
};

const statusDots: Record<string, string> = {
  Moving: "bg-emerald-500 animate-pulse",
  Idle: "bg-amber-500",
  Stopped: "bg-slate-400",
  Offline: "bg-red-400",
};

export default function GPSTrackingPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [isSimulating, setIsSimulating] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleTrack | null>(null);
  const [tracks, setTracks] = useState<VehicleTrack[]>(sampleTracks);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  // Simulate live GPS updates
  useEffect(() => {
    if (!isSimulating) return;
    const interval = setInterval(() => {
      setTracks(prev => prev.map(t => {
        if (t.gpsStatus !== "Moving") return t;
        return {
          ...t,
          lat: t.lat + (Math.random() - 0.5) * 0.002,
          lng: t.lng + (Math.random() - 0.5) * 0.002,
          speed: Math.max(0, t.speed + (Math.random() - 0.5) * 8),
          lastUpdated: new Date().toISOString().replace("T", " ").slice(0, 16),
        };
      }));
      setLastRefresh(new Date());
    }, 3000);
    return () => clearInterval(interval);
  }, [isSimulating]);

  const filtered = tracks.filter(t => {
    const matchesSearch = !search ||
      t.vehicle.toLowerCase().includes(search.toLowerCase()) ||
      t.driver.toLowerCase().includes(search.toLowerCase()) ||
      t.plate.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "All" || t.gpsStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: tracks.length,
    moving: tracks.filter(t => t.gpsStatus === "Moving").length,
    idle: tracks.filter(t => t.gpsStatus === "Idle").length,
    offline: tracks.filter(t => t.gpsStatus === "Offline").length,
    stopped: tracks.filter(t => t.gpsStatus === "Stopped").length,
  };

  return (
    <div className="space-y-5">
      {/* Stats Cards */}
      <div className="grid grid-cols-5 gap-3">
        <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-2 text-slate-400 text-xs font-medium mb-1"><Truck size={12} /> Total Tracked</div>
          <div className="text-lg font-bold text-slate-900">{stats.total}</div>
        </div>
        <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-2 text-slate-400 text-xs font-medium mb-1"><Navigation size={12} /> Moving</div>
          <div className="text-lg font-bold text-emerald-600">{stats.moving}</div>
        </div>
        <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-2 text-slate-400 text-xs font-medium mb-1"><Circle size={12} /> Idle</div>
          <div className="text-lg font-bold text-amber-600">{stats.idle}</div>
        </div>
        <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-2 text-slate-400 text-xs font-medium mb-1"><MapPin size={12} /> Stopped</div>
          <div className="text-lg font-bold text-slate-600">{stats.stopped}</div>
        </div>
        <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-2 text-slate-400 text-xs font-medium mb-1"><WifiOff size={12} /> Offline</div>
          <div className="text-lg font-bold text-red-500">{stats.offline}</div>
        </div>
      </div>

      {/* Search, Filter, Simulate Controls */}
      <div className="flex gap-3 items-center flex-wrap">
        <div className="flex-1 relative min-w-[200px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search vehicles, drivers, plates..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900" />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          className="px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 bg-white">
          <option value="All">All Status</option>
          <option value="Moving">Moving</option>
          <option value="Idle">Idle</option>
          <option value="Stopped">Stopped</option>
          <option value="Offline">Offline</option>
        </select>
        <button
          onClick={() => setIsSimulating(!isSimulating)}
          className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-xs font-medium transition-all ${
            isSimulating
              ? "bg-amber-50 border-amber-200 text-amber-700"
              : "border-slate-200 text-slate-600 hover:bg-slate-50"
          }`}
        >
          {isSimulating ? <><Pause size={13} /> Pause Live</> : <><Play size={13} /> Simulate Live</>}
        </button>
        <button
          onClick={() => { setTracks(sampleTracks); setLastRefresh(new Date()); }}
          className="flex items-center gap-2 px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-50 transition-all"
        >
          <RefreshCw size={13} /> Reset
        </button>
        <div className="text-[10px] text-slate-400 font-mono">
          Last update: {lastRefresh.toLocaleTimeString()}
        </div>
      </div>

      {/* Live Map */}
      <div className="relative">
        <MapView vehicles={tracks.map(t => ({
          name: t.vehicle.split(" ").slice(0, 2).join(" "),
          plate: t.plate,
          driver: t.driver.split(" ")[0] + ".",
          lat: t.lat,
          lng: t.lng,
          speed: t.speed,
          heading: t.heading,
          status: t.gpsStatus as "Moving" | "Idle" | "Stopped" | "Offline",
        }))} />
        {isSimulating && (
          <div className="absolute top-3 left-3 bg-emerald-500 text-white text-[10px] font-bold px-2 py-1 rounded-lg flex items-center gap-1">
            <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
            LIVE
          </div>
        )}
      </div>

      {/* Vehicle Tracks Table */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-100">
                <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap">Vehicle</th>
                <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap">Plate</th>
                <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap">Driver</th>
                <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap">Speed</th>
                <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap">Status</th>
                <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap">Coordinates</th>
                <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap">Last Updated</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((t, i) => (
                <motion.tr key={t.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                  onClick={() => setSelectedVehicle(selectedVehicle?.id === t.id ? null : t)}
                  className={`border-b border-slate-100 hover:bg-slate-50/50 transition-colors cursor-pointer ${
                    selectedVehicle?.id === t.id ? "bg-blue-50/50" : ""
                  }`}>
                  <td className="px-4 py-3 text-sm font-semibold text-slate-900">
                    <div className="flex items-center gap-2">
                      <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${statusDots[t.gpsStatus]}`} />
                      {t.vehicle}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm font-mono text-slate-500">{t.plate}</td>
                  <td className="px-4 py-3 text-sm text-slate-600">{t.driver}</td>
                  <td className="px-4 py-3 text-sm font-mono text-slate-500">{t.speed > 0 ? `${Math.round(t.speed)} km/h` : "0 km/h"}</td>
                  <td className="px-4 py-3">
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${statusColors[t.gpsStatus]}`}>
                      <Wifi size={10} className="inline mr-1" />{t.gpsStatus}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs font-mono text-slate-400">{t.lat.toFixed(4)}, {t.lng.toFixed(4)}</td>
                  <td className="px-4 py-3 text-sm text-slate-400">{t.lastUpdated.split(" ")[1]}</td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 border-t border-slate-200 bg-slate-50/50 flex items-center justify-between text-xs text-slate-500">
          <span>{filtered.length} vehicle{filtered.length !== 1 ? "s" : ""} tracked</span>
        </div>
      </div>

      {/* Expanded Vehicle Details */}
      {selectedVehicle && (() => {
        const t = tracks.find(tr => tr.id === selectedVehicle.id);
        if (!t) return null;
        return (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
            className="bg-slate-50 border border-slate-200 rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-slate-900">{t.vehicle} — Details</h3>
              <button onClick={() => setSelectedVehicle(null)} className="text-slate-400 hover:text-slate-600"><X size={16} /></button>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-3">
              <div>
                <div className="flex items-center justify-between text-[10px] text-slate-500 mb-1">
                  <span className="flex items-center gap-1">
                    {t.batteryLevel && t.batteryLevel > 80
                      ? <BatteryCharging size={10} className="text-emerald-500" />
                      : t.batteryLevel && t.batteryLevel > 30
                      ? <Battery size={10} />
                      : <BatteryWarning size={10} className="text-red-500" />
                    }
                    Battery
                  </span>
                  <span className="font-mono">{t.batteryLevel ?? "N/A"}%</span>
                </div>
                <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full transition-all ${
                    (t.batteryLevel ?? 0) > 80 ? "bg-emerald-500" :
                    (t.batteryLevel ?? 0) > 30 ? "bg-amber-500" : "bg-red-500"
                  }`} style={{ width: `${t.batteryLevel ?? 0}%` }} />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between text-[10px] text-slate-500 mb-1">
                  <span className="flex items-center gap-1"><Gauge size={10} /> Fuel</span>
                  <span className="font-mono">{t.fuelLevel ?? "N/A"}%</span>
                </div>
                <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 rounded-full transition-all" style={{ width: `${t.fuelLevel ?? 0}%` }} />
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 text-[10px] text-slate-500 mb-3">
              <span>Last stop: {t.lastStop || "N/A"}</span>
              <span>Today: {t.totalDistanceToday ?? 0} km</span>
              <span>Driver: {t.driver}</span>
              <span>Heading: {t.heading}</span>
            </div>
            <div className="flex gap-1.5 pt-2 border-t border-slate-100">
              <button className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-100 text-[10px] font-medium text-slate-600 hover:bg-blue-50 hover:text-blue-600 transition-colors">
                <Map size={10} /> Route History
              </button>
              <button className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-100 text-[10px] font-medium text-slate-600 hover:bg-purple-50 hover:text-purple-600 transition-colors">
                <Radar size={10} /> Geofence
              </button>
              <button className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-100 text-[10px] font-medium text-slate-600 hover:bg-red-50 hover:text-red-500 transition-colors">
                <AlertTriangle size={10} /> Alert
              </button>
            </div>
          </motion.div>
        );
      })()}
    </div>
  );
}

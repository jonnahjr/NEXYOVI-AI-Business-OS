"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Clock, CheckCircle, XCircle, AlertTriangle, Users, Fingerprint,
  MapPin, Download, Search,
  Calendar, BarChart3, Plus, Edit3, Trash2, RefreshCw, Wifi, WifiOff,
  Smartphone, Monitor, Activity, Sun,
  Eye, Loader2, LogIn, LogOut, UserCheck,
  UserX, Briefcase, Building2,
  ChevronLeft, ChevronRight, Clock as ClockIcon, Award
} from "lucide-react";
import { useToast } from "@/components/ui/Toast";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";

// ─── TYPES ─────────────────────────────────────────────────────────
type Employee = {
  id: string;
  employeeCode: string;
  firstName: string;
  lastName: string;
  jobTitle?: string;
  department?: { name?: string };
  user: { firstName: string; lastName: string; email: string; avatarUrl?: string };
  attendances?: { status: string; date: string; checkIn?: string }[];
};

type Attendance = {
  id: string;
  date: string;
  checkIn?: string;
  checkOut?: string;
  status: string;
  totalHours?: number;
  overtimeHours?: number;
  isLate?: boolean;
  earlyDeparture?: boolean;
  deviceType?: string;
  biometricVerified?: boolean;
  locationName?: string;
  notes?: string;
  employee: {
    id: string;
    firstName: string;
    lastName: string;
    jobTitle?: string;
    employeeCode?: string;
    department?: { name?: string };
    user: { firstName: string; lastName: string; email: string; avatarUrl?: string };
  };
};

type Summary = {
  date: string;
  totalEmployees: number;
  today: {
    present: number;
    late: number;
    absent: number;
    halfDay: number;
    onLeave: number;
    remote: number;
    notMarked: number;
    checkedIn: number;
    checkedOut: number;
    biometricVerified: number;
    totalHours: number;
    overtimeHours: number;
    deviceBreakdown: Record<string, number>;
  };
  monthly: { totalRecords: number; totalHours: number; overtimeHours: number };
  pendingAbsences: number;
  attendanceRate: number;
};

type BiometricDevice = {
  id: string;
  name: string;
  deviceType: string;
  serialNumber: string;
  model?: string;
  ipAddress?: string;
  port?: number;
  location?: string;
  status: string;
  lastSyncAt?: string;
  lastSyncStatus?: string;
};

// ─── STATUS CONFIG ─────────────────────────────────────────────────
const STATUS_STYLE: Record<string, { label: string; bg: string; text: string; dot: string; icon: any }> = {
  PRESENT:          { label: "Present",        bg: "bg-emerald-50",   text: "text-emerald-700",  dot: "bg-emerald-500",  icon: CheckCircle },
  LATE:             { label: "Late",           bg: "bg-amber-50",     text: "text-amber-700",    dot: "bg-amber-500",   icon: AlertTriangle },
  ABSENT:           { label: "Absent",         bg: "bg-rose-50",      text: "text-rose-700",     dot: "bg-rose-500",    icon: XCircle },
  HALF_DAY:         { label: "Half Day",       bg: "bg-orange-50",    text: "text-orange-700",   dot: "bg-orange-500",  icon: Clock },
  ON_LEAVE:         { label: "On Leave",       bg: "bg-violet-50",    text: "text-violet-700",   dot: "bg-violet-500",  icon: Sun },
  REMOTE:           { label: "Remote",         bg: "bg-blue-50",      text: "text-blue-700",     dot: "bg-blue-500",    icon: Monitor },
  ON_BUSINESS_TRIP: { label: "Business Trip",  bg: "bg-cyan-50",      text: "text-cyan-700",     dot: "bg-cyan-500",    icon: Briefcase },
  HOLIDAY:          { label: "Holiday",        bg: "bg-pink-50",      text: "text-pink-700",     dot: "bg-pink-500",    icon: Award },
};

// ─── STAT CARD CONFIG ─────────────────────────────────────────────
const STAT_CARDS = [
  { label: "Attendance Rate", key: "rate",    icon: Activity,       color: "from-slate-900 to-slate-700" },
  { label: "Present",         key: "present", icon: UserCheck,      color: "from-emerald-600 to-emerald-500" },
  { label: "Absent",          key: "absent",  icon: UserX,          color: "from-rose-600 to-rose-500" },
  { label: "Hours Today",     key: "hours",   icon: ClockIcon,      color: "from-blue-600 to-blue-500" },
  { label: "Biometric",       key: "bio",     icon: Fingerprint,    color: "from-violet-600 to-violet-500" },
  { label: "Monthly Hours",   key: "monthly", icon: BarChart3,      color: "from-amber-600 to-amber-500" },
];

const ITEMS_PER_PAGE = 10;

// ─── HELPER: paginate ─────────────────────────────────────────────
function paginate<T>(items: T[], page: number, perPage: number): T[] {
  return items.slice((page - 1) * perPage, page * perPage);
}

// ─── COMPONENT ────────────────────────────────────────────────────
export default function UltimateAttendanceDashboard() {
  const { toast } = useToast();

  // ── State ───────────────────────────────────────────────────────
  const [view, setView] = useState<"dashboard" | "devices">("dashboard");
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [attendances, setAttendances] = useState<Attendance[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [devices, setDevices] = useState<BiometricDevice[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);

  // Table controls
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [page, setPage] = useState(1);

  // Date range
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [historyRecords, setHistoryRecords] = useState<Attendance[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Modals
  const [showCheckInModal, setShowCheckInModal] = useState(false);
  const [showDeviceModal, setShowDeviceModal] = useState(false);
  const [showEmployeeDetail, setShowEmployeeDetail] = useState<Attendance | null>(null);
  const [selectedEmployee, setSelectedEmployee] = useState<string>("");
  const [editingDevice, setEditingDevice] = useState<BiometricDevice | null>(null);
  const [deviceForm, setDeviceForm] = useState({
    name: "", deviceType: "FINGERPRINT", serialNumber: "", model: "",
    ipAddress: "", port: 8080, location: "",
  });
  const [checkInGeo, setCheckInGeo] = useState<{ lat?: number; lng?: number }>({});
  const [isCheckingIn, setIsCheckingIn] = useState(false);

  // Auto-refresh
  const [autoRefresh, setAutoRefresh] = useState(false);
  const autoRefreshRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Confirm dialogs
  const [confirmSync, setConfirmSync] = useState(false);
  const [confirmDeleteDeviceId, setConfirmDeleteDeviceId] = useState<string | null>(null);

  const getToken = () => localStorage.getItem("token") || "";

  // ── LOAD DATA ───────────────────────────────────────────────────
  const loadAll = useCallback(async () => {
    setLoading(true);
    const token = getToken();
    try {
      const [empRes, attRes, sumRes, devRes] = await Promise.all([
        fetch("http://localhost:3002/api/v1/attendance/employees", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch("http://localhost:3002/api/v1/attendance/today", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch("http://localhost:3002/api/v1/attendance/summary", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch("http://localhost:3002/api/v1/attendance/devices", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const [empData, attData, sumData, devData] = await Promise.all([
        empRes.json(), attRes.json(), sumRes.json(), devRes.json(),
      ]);

      setEmployees(Array.isArray(empData) ? empData : empData?.data || []);
      setAttendances(Array.isArray(attData) ? attData : attData?.data || []);
      setSummary(sumData?.data || sumData || null);
      setDevices(Array.isArray(devData) ? devData : devData?.data || []);
      setPage(1);
    } catch (err) {
      console.error("Failed to load attendance data:", err);
      toast("Failed to load attendance data", "error");
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Initial load
  useEffect(() => { loadAll(); }, [loadAll]);

  // ── AUTO-REFRESH INTERVAL ──────────────────────────────────────────
  useEffect(() => {
    if (autoRefresh && view === "dashboard") {
      autoRefreshRef.current = setInterval(() => {
        loadAll();
      }, 30000); // 30 seconds
    } else {
      if (autoRefreshRef.current) {
        clearInterval(autoRefreshRef.current);
        autoRefreshRef.current = null;
      }
    }
    return () => {
      if (autoRefreshRef.current) {
        clearInterval(autoRefreshRef.current);
        autoRefreshRef.current = null;
      }
    };
  }, [autoRefresh, view, loadAll]);

  // ── LOAD HISTORY ────────────────────────────────────────────────
  const loadHistory = useCallback(async () => {
    if (!dateRange.start || !dateRange.end) {
      toast("Select a start and end date", "error");
      return;
    }
    setLoadingHistory(true);
    try {
      const token = getToken();
      const res = await fetch(
        `http://localhost:3002/api/v1/attendance/range?startDate=${dateRange.start}&endDate=${dateRange.end}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await res.json();
      setHistoryRecords(Array.isArray(data) ? data : data?.data || []);
      setShowHistory(true);
    } catch {
      toast("Failed to load history", "error");
    } finally {
      setLoadingHistory(false);
    }
  }, [dateRange, toast]);

  // ── FILTERED & PAGINATED ────────────────────────────────────────
  const filteredAttendances = attendances.filter(a => {
    const name = `${a.employee.firstName} ${a.employee.lastName}`.toLowerCase();
    const matchesSearch = name.includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "ALL" || a.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.max(1, Math.ceil(filteredAttendances.length / ITEMS_PER_PAGE));
  const paginatedAttendances = paginate(filteredAttendances, Math.min(page, totalPages), ITEMS_PER_PAGE);

  const notCheckedIn = employees.filter(e =>
    !attendances.some(a => a.employee.id === e.id)
  );

  // ── CHECK-IN ────────────────────────────────────────────────────
  const handleCheckIn = async (employeeId?: string) => {
    const targetId = employeeId || selectedEmployee;
    if (!targetId) { toast("Select an employee", "error"); return; }
    setIsCheckingIn(true);
    try {
      const res = await fetch(`http://localhost:3002/api/v1/attendance/check-in/${targetId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify({
          latitude: checkInGeo.lat,
          longitude: checkInGeo.lng,
          locationName: checkInGeo.lat ? "GPS Location" : undefined,
          deviceType: "MANUAL",
        }),
      });
      if (res.ok) {
        toast("Check-in successful", "success");
        setShowCheckInModal(false);
        setSelectedEmployee("");
        loadAll();
      } else {
        const err = await res.json();
        toast(err?.message || "Check-in failed", "error");
      }
    } catch {
      toast("Check-in failed", "error");
    } finally {
      setIsCheckingIn(false);
    }
  };

  // ── CHECK-OUT ───────────────────────────────────────────────────
  const handleCheckOut = async (employeeId: string) => {
    try {
      const res = await fetch(`http://localhost:3002/api/v1/attendance/check-out/${employeeId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify({ deviceType: "MANUAL" }),
      });
      if (res.ok) {
        toast("Check-out successful", "success");
        loadAll();
      } else {
        const err = await res.json();
        toast(err?.message || "Check-out failed", "error");
      }
    } catch {
      toast("Check-out failed", "error");
    }
  };

  // ── GPS ─────────────────────────────────────────────────────────
  const getGPS = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setCheckInGeo({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => toast("GPS unavailable, continuing without location", "info"),
      );
    }
  };

  // ── BULK MARK ───────────────────────────────────────────────────
  const handleBulkMark = async (status: string) => {
    const today = new Date().toISOString().split("T")[0];
    const activeEmployeeIds = employees.map(e => e.id);
    if (activeEmployeeIds.length === 0) { toast("No employees", "error"); return; }
    try {
      const res = await fetch("http://localhost:3002/api/v1/attendance/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify({ date: today, employeeIds: activeEmployeeIds, status }),
      });
      if (res.ok) {
        toast(`Marked ${status.toLowerCase()} for all`, "success");
        loadAll();
      }
    } catch {
      toast("Bulk mark failed", "error");
    }
  };

  // ── SYNC ALL ────────────────────────────────────────────────────
  const handleSyncAll = async () => {
    setIsSyncing(true);
    try {
      const res = await fetch("http://localhost:3002/api/v1/attendance/sync-all", {
        method: "POST",
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const data = await res.json();
      if (res.ok) {
        toast(`Synced ${data.synced} employee(s) to attendance (${data.alreadyHadRecord} already had records)`, "success");
        loadAll();
      } else {
        toast(data?.message || "Sync failed", "error");
      }
    } catch {
      toast("Sync failed", "error");
    } finally {
      setIsSyncing(false);
      setConfirmSync(false);
    }
  };

  // ── EXPORT CSV ──────────────────────────────────────────────────
  const exportCSV = () => {
    const headers = ["Employee", "Date", "Check In", "Check Out", "Hours", "Status", "Device", "Biometric", "Location"];
    const rows = attendances.map(a => [
      `${a.employee.firstName} ${a.employee.lastName}`,
      new Date(a.date).toLocaleDateString(),
      a.checkIn ? new Date(a.checkIn).toLocaleTimeString() : "—",
      a.checkOut ? new Date(a.checkOut).toLocaleTimeString() : "—",
      a.totalHours?.toFixed(1) || "—",
      STATUS_STYLE[a.status]?.label || a.status,
      a.deviceType || "—",
      a.biometricVerified ? "Yes" : "No",
      a.locationName || "—",
    ]);
    const csv = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `attendance-${new Date().toISOString().split("T")[0]}.csv`;
    a.click(); URL.revokeObjectURL(url);
    toast("Exported CSV", "success");
  };

  // ── DEVICE CRUD ─────────────────────────────────────────────────
  const saveDevice = async () => {
    try {
      const url = editingDevice
        ? `http://localhost:3002/api/v1/attendance/devices/${editingDevice.id}`
        : "http://localhost:3002/api/v1/attendance/devices";
      const method = editingDevice ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify(deviceForm),
      });
      if (res.ok) {
        toast(editingDevice ? "Device updated" : "Device registered", "success");
        setShowDeviceModal(false);
        setEditingDevice(null);
        setDeviceForm({ name: "", deviceType: "FINGERPRINT", serialNumber: "", model: "", ipAddress: "", port: 8080, location: "" });
        loadAll();
      }
    } catch {
      toast("Device save failed", "error");
    }
  };

  const confirmDeleteDevice = async () => {
    if (!confirmDeleteDeviceId) return;
    const id = confirmDeleteDeviceId;
    setConfirmDeleteDeviceId(null);
    try {
      await fetch(`http://localhost:3002/api/v1/attendance/devices/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      toast("Device deleted", "success");
      loadAll();
    } catch {
      toast("Delete failed", "error");
    }
  };

  // ── DERIVED STATS ───────────────────────────────────────────────
  const todayStats = summary?.today;
  const monthlyStats = summary?.monthly;

  const statsCards = summary && todayStats && monthlyStats ? [
    { label: "Attendance Rate", value: `${summary.attendanceRate || 0}%`, icon: Activity, change: `Out of ${summary.totalEmployees || 0} employees`, color: STAT_CARDS[0].color },
    { label: "Present",         value: (todayStats.present ?? 0).toString(), icon: UserCheck,  change: `${todayStats.late ?? 0} late`, color: STAT_CARDS[1].color },
    { label: "Absent",          value: (todayStats.absent ?? 0).toString(), icon: UserX,      change: `${todayStats.notMarked ?? 0} not marked`, color: STAT_CARDS[2].color },
    { label: "Hours Today",     value: `${(todayStats.totalHours ?? 0).toFixed(0)}h`, icon: ClockIcon,  change: `${(todayStats.overtimeHours ?? 0).toFixed(0)}h overtime`, color: STAT_CARDS[3].color },
    { label: "Biometric",       value: (todayStats.biometricVerified ?? 0).toString(), icon: Fingerprint, change: "verified today", color: STAT_CARDS[4].color },
    { label: "Monthly Hours",   value: `${(monthlyStats.totalHours ?? 0).toFixed(0)}h`, icon: BarChart3,  change: `${(monthlyStats.overtimeHours ?? 0).toFixed(0)}h overtime`, color: STAT_CARDS[5].color },
  ] : [];

  // ── STATUS BAR DATA ─────────────────────────────────────────────
  const statusBars = summary?.today ? [
    { label: "Present",   value: summary.today.present || 0, color: "bg-emerald-500", max: summary.totalEmployees || 1 },
    { label: "Late",      value: summary.today.late || 0,    color: "bg-amber-500",   max: summary.totalEmployees || 1 },
    { label: "Absent",    value: summary.today.absent || 0,  color: "bg-rose-500",    max: summary.totalEmployees || 1 },
    { label: "On Leave",  value: summary.today.onLeave || 0, color: "bg-violet-500",  max: summary.totalEmployees || 1 },
    { label: "Remote",    value: summary.today.remote || 0,  color: "bg-blue-500",    max: summary.totalEmployees || 1 },
  ] : [];

  // ── RENDER: Status Badge ────────────────────────────────────────
  function StatusBadge({ status }: { status: string }) {
    const cfg = STATUS_STYLE[status];
    if (!cfg) return <span className="text-[11px] font-semibold text-gray-400">{status}</span>;
    const Icon = cfg.icon;
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold ${cfg.bg} ${cfg.text}`}>
        <Icon size={12} />
        {cfg.label}
      </span>
    );
  }

  // ── RENDER: Avatar initials ─────────────────────────────────────
  function Avatar({ firstName, lastName, size = "md" }: { firstName: string; lastName: string; size?: "sm" | "md" | "lg" }) {
    const dims = size === "sm" ? "w-6 h-6 text-[9px]" : size === "lg" ? "w-10 h-10 text-sm" : "w-8 h-8 text-[11px]";
    return (
      <div className={`${dims} rounded-full bg-gradient-to-br from-slate-800 to-slate-600 flex items-center justify-center font-bold text-white shrink-0`}>
        {((firstName?.[0] || "") + (lastName?.[0] || "")).toUpperCase()}
      </div>
    );
  }

  // ── RENDER: Stat Card ───────────────────────────────────────────
  function StatCard({ stat, index }: { stat: typeof statsCards[0]; index: number }) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05 }}
        whileHover={{ y: -2, boxShadow: "0 8px 25px rgba(0,0,0,0.08)" }}
        className="bg-white rounded-xl border border-gray-100 p-4 cursor-default transition-shadow"
      >
        <div className="flex items-center justify-between mb-3">
          <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-sm`}>
            <stat.icon size={15} className="text-white" />
          </div>
          {index === 0 && summary && (
            <div className="flex items-center gap-1">
              <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${summary.attendanceRate || 0}%` }}
                  className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full"
                />
              </div>
            </div>
          )}
        </div>
        <div className="text-2xl font-bold text-gray-900 tracking-tight">{stat.value}</div>
        <div className="text-[11px] text-gray-400 font-medium mt-0.5">{stat.change}</div>
      </motion.div>
    );
  }

  // ── RENDER: Employee Detail Popup ───────────────────────────────
  function EmployeeDetailPopup({ attendance }: { attendance: Attendance }) {
    const emp = attendance.employee;
    const cfg = STATUS_STYLE[attendance.status];
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
        onClick={() => setShowEmployeeDetail(null)}
      >
        <motion.div
          className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden"
          onClick={e => e.stopPropagation()}
        >
          {/* Header gradient */}
          <div className="bg-gradient-to-r from-slate-900 to-slate-700 px-6 py-5 text-white">
            <div className="flex items-center gap-3">
              <Avatar firstName={emp.firstName} lastName={emp.lastName} size="lg" />
              <div>
                <h3 className="font-bold text-base">{emp.firstName} {emp.lastName}</h3>
                <p className="text-xs text-slate-300">{emp.jobTitle || "No title"}</p>
              </div>
            </div>
          </div>

          <div className="p-5 space-y-4">
            {/* Status & Time */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Status</p>
                <StatusBadge status={attendance.status} />
              </div>
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Date</p>
                <p className="text-sm font-semibold text-gray-900">{new Date(attendance.date).toLocaleDateString()}</p>
              </div>
            </div>

            {/* Check-in / Check-out */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-50 rounded-xl p-3">
                <div className="flex items-center gap-1.5 mb-1">
                  <LogIn size={12} className="text-black" />
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Check In</p>
                </div>
                <p className="text-sm font-semibold text-gray-900">
                  {attendance.checkIn ? new Date(attendance.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "—"}
                </p>
              </div>
              <div className="bg-gray-50 rounded-xl p-3">
                <div className="flex items-center gap-1.5 mb-1">
                  <LogOut size={12} className="text-black" />
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Check Out</p>
                </div>
                <p className="text-sm font-semibold text-gray-900">
                  {attendance.checkOut ? new Date(attendance.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "—"}
                </p>
              </div>
            </div>

            {/* Hours & Device */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Total Hours</p>
                <p className="text-sm font-semibold text-gray-900">{attendance.totalHours?.toFixed(1) || "—"}h</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Device</p>
                <p className="text-sm font-semibold text-gray-900">{attendance.deviceType || "—"}</p>
              </div>
            </div>

            {/* Location & Notes */}
            {attendance.locationName && (
              <div className="bg-gray-50 rounded-xl p-3">
                <div className="flex items-center gap-1.5 mb-1">
                  <MapPin size={12} className="text-black" />
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Location</p>
                </div>
                <p className="text-sm font-medium text-gray-700">{attendance.locationName}</p>
              </div>
            )}
            {attendance.notes && (
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Notes</p>
                <p className="text-sm text-gray-600">{attendance.notes}</p>
              </div>
            )}
          </div>

          <div className="px-5 pb-5">
            <button
              onClick={() => setShowEmployeeDetail(null)}
              className="w-full py-2.5 rounded-xl bg-gray-900 text-white text-sm font-semibold hover:bg-black transition-colors"
            >
              Close
            </button>
          </div>
        </motion.div>
      </motion.div>
    );
  }

  // ═══════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════
  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-20">
      {/* ── HEADER ────────────────────────────────────────────── */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Attendance Dashboard</h1>
            <p className="text-sm text-slate-400 mt-0.5">
              Biometric-ready attendance with check-in/out, device integration & reporting
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => { setView(view === "dashboard" ? "devices" : "dashboard"); }}
              className="px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-semibold transition-colors flex items-center gap-2 border border-white/10"
            >
              {view === "dashboard" ? <Smartphone size={13} /> : <Activity size={13} />}
              {view === "dashboard" ? "Devices" : "Dashboard"}
            </button>
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`px-3 py-2 rounded-lg text-xs font-semibold transition-colors flex items-center gap-2 border ${
                autoRefresh
                  ? "bg-emerald-500/20 border-emerald-400/30 text-emerald-300"
                  : "bg-white/10 border-white/10 hover:bg-white/20"
              }`}
              title={autoRefresh ? "Auto-refresh is ON (30s)" : "Enable auto-refresh every 30s"}
            >
              {autoRefresh && (
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
              )}
              <RefreshCw size={12} className={autoRefresh ? "text-emerald-300" : ""} />
              {autoRefresh ? "Live" : "Auto"}
            </button>
            <button
              onClick={loadAll}
              className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
              title="Refresh now"
            >
              <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
            </button>
          </div>
        </div>
        {/* Mini date & time */}
        <div className="mt-3 flex items-center gap-4 text-xs text-slate-500">
          <span>{new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</span>
          <span className="w-1 h-1 rounded-full bg-slate-600" />
          <span>{summary ? `${summary.totalEmployees} active employees` : "—"}</span>
        </div>
      </div>

      {view === "dashboard" ? (
        <>
          {/* ── STAT CARDS ───────────────────────────────────── */}
          {statsCards.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {statsCards.map((stat, i) => <StatCard key={i} stat={stat} index={i} />)}
            </div>
          )}

          {/* ── QUICK ACTIONS ────────────────────────────────── */}
          <div className="flex flex-wrap gap-2 items-center">
            <button
              onClick={() => setShowCheckInModal(true)}
              className="px-4 py-2.5 rounded-xl bg-gray-900 text-white text-xs font-semibold hover:bg-black transition-colors flex items-center gap-2 shadow-sm"
            >
              <Plus size={13} /> Manual Check-In
            </button>
            <button onClick={() => handleBulkMark("PRESENT")} className="px-3 py-2 rounded-xl border border-gray-200 text-[11px] font-semibold text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-1.5">
              <UserCheck size={12} className="text-black" /> Mark All Present
            </button>
            <button onClick={() => handleBulkMark("ABSENT")} className="px-3 py-2 rounded-xl border border-gray-200 text-[11px] font-semibold text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-1.5">
              <UserX size={12} className="text-black" /> Mark All Absent
            </button>
            <button
              onClick={() => setConfirmSync(true)}
              disabled={isSyncing}
              className="px-3 py-2 rounded-xl border border-gray-200 text-[11px] font-semibold text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-1.5 disabled:opacity-50"
            >
              {isSyncing ? <Loader2 size={12} className="animate-spin" /> : <Users size={12} />}
              {isSyncing ? "Syncing..." : "Sync All"}
            </button>
            <button onClick={getGPS} className="px-3 py-2 rounded-xl border border-gray-200 text-[11px] font-semibold text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-1.5">
              <MapPin size={11} className="text-black" /> {checkInGeo.lat ? "GPS Ready" : "Get GPS"}
            </button>
          </div>

          {/* ── DATE RANGE PICKER ────────────────────────────── */}
          <div className="bg-white border border-gray-100 rounded-xl p-4">
            <div className="flex items-center gap-3 flex-wrap">
              <Calendar size={14} className="text-black/60" />
              <span className="text-xs font-semibold text-gray-700">View History:</span>
              <input
                type="date"
                value={dateRange.start}
                onChange={e => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs focus:outline-none focus:ring-1 focus:ring-gray-900"
              />
              <span className="text-xs text-gray-400">to</span>
              <input
                type="date"
                value={dateRange.end}
                onChange={e => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs focus:outline-none focus:ring-1 focus:ring-gray-900"
              />
              <button
                onClick={loadHistory}
                disabled={loadingHistory}
                className="px-3 py-1.5 rounded-lg bg-gray-900 text-white text-xs font-semibold hover:bg-black transition-colors disabled:opacity-50 flex items-center gap-1"
              >
                {loadingHistory ? <Loader2 size={11} className="animate-spin" /> : <Search size={11} />}
                {loadingHistory ? "Loading..." : "Search"}
              </button>
              {showHistory && (
                <button
                  onClick={() => { setShowHistory(false); setHistoryRecords([]); }}
                  className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-semibold text-gray-500 hover:bg-gray-50 transition-colors"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* ── STATUS BREAKDOWN ─────────────────────────────── */}
          {statusBars.length > 0 && (
            <div className="bg-white border border-gray-100 rounded-xl p-5">
              <h3 className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-4">
                Today's Status Breakdown
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                {statusBars.map((item, i) => (
                  <div key={i}>
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="font-semibold text-gray-700">{item.label}</span>
                      <span className="font-bold text-gray-400">{item.value}</span>
                    </div>
                    <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(item.value / Math.max(item.max, 1)) * 100}%` }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                        className={`h-full rounded-full ${item.color}`}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── ATTENDANCE TABLE ─────────────────────────────── */}
          <div className="bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h3 className="text-sm font-bold text-gray-900">
                {showHistory ? "Historical Records" : "Today's Records"}
                <span className="text-gray-400 font-normal ml-1.5">
                  ({showHistory ? historyRecords.length : filteredAttendances.length})
                </span>
              </h3>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-black/50" />
                  <input
                    value={searchQuery}
                    onChange={e => { setSearchQuery(e.target.value); setPage(1); }}
                    placeholder="Search employee..."
                    className="w-40 pl-8 pr-3 py-1.5 rounded-lg bg-gray-50 border border-gray-200 text-xs focus:outline-none focus:ring-1 focus:ring-gray-900 placeholder:text-gray-400"
                  />
                </div>
                <select
                  value={statusFilter}
                  onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
                  className="px-2.5 py-1.5 rounded-lg bg-gray-50 border border-gray-200 text-xs font-medium text-gray-700 focus:outline-none focus:ring-1 focus:ring-gray-900"
                >
                  <option value="ALL">All Status</option>
                  {Object.entries(STATUS_STYLE).map(([key, cfg]) => (
                    <option key={key} value={key}>{cfg.label}</option>
                  ))}
                </select>
                <button
                  onClick={exportCSV}
                  className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-1.5"
                >
                  <Download size={11} /> Export
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="text-left px-5 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Employee</th>
                    <th className="text-left px-4 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Check In</th>
                    <th className="text-left px-4 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Check Out</th>
                    <th className="text-left px-4 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Hours</th>
                    <th className="text-left px-4 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Status</th>
                    <th className="text-left px-4 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Device</th>
                    <th className="text-left px-4 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Bio</th>
                    <th className="text-right px-5 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {loading ? (
                    <tr>
                      <td colSpan={8} className="px-5 py-16 text-center">
                        <div className="flex flex-col items-center gap-3">
                          <Loader2 size={20} className="animate-spin text-gray-300" />
                          <span className="text-sm text-gray-400 font-medium">Loading attendance records...</span>
                        </div>
                      </td>
                    </tr>
                  ) : (showHistory ? historyRecords : paginatedAttendances).length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-5 py-16 text-center">
                        <div className="flex flex-col items-center gap-2">
                          <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center">
                            <Calendar size={20} className="text-black/40" />
                          </div>
                          <p className="text-sm font-semibold text-gray-500">
                            {showHistory ? "No records found for this date range" : "No attendance records for today"}
                          </p>
                          <p className="text-xs text-gray-400">
                            {showHistory ? "Try a different date range" : "Use Sync All or Manual Check-In to add records"}
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    (showHistory ? historyRecords : paginatedAttendances).map((a, i) => (
                      <motion.tr
                        key={a.id || i}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: i * 0.03 }}
                        className="hover:bg-gray-50/80 transition-colors"
                      >
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-3">
                            <Avatar firstName={a.employee.firstName} lastName={a.employee.lastName} />
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-semibold text-gray-900">
                                  {a.employee.firstName} {a.employee.lastName}
                                </span>
                                {a.employee.jobTitle && (
                                  <span className="text-[10px] text-gray-400 hidden sm:inline">{a.employee.jobTitle}</span>
                                )}
                              </div>
                              {a.employee.department?.name && (
                                <div className="flex items-center gap-1 mt-0.5">
                                  <Building2 size={10} className="text-black/50" />
                                  <span className="text-[10px] text-gray-400">{a.employee.department.name}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5">
                            <div className={`w-1.5 h-1.5 rounded-full ${a.checkIn ? "bg-emerald-400" : "bg-gray-200"}`} />
                            <span className="text-xs font-medium text-gray-700">
                              {a.checkIn
                                ? new Date(a.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                : <span className="text-gray-300">—</span>
                              }
                            </span>
                            {a.isLate && <span className="text-[9px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">LATE</span>}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-xs font-medium text-gray-700">
                          {a.checkOut
                            ? new Date(a.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                            : a.checkIn && !a.checkOut ? (
                              <button
                                onClick={() => handleCheckOut(a.employee.id)}
                                className="text-[10px] bg-gray-900 text-white px-2.5 py-1 rounded-lg hover:bg-black transition-colors font-semibold"
                              >
                                Check Out
                              </button>
                            ) : <span className="text-gray-300">—</span>
                          }
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-xs font-semibold text-gray-800 font-mono">
                            {a.totalHours?.toFixed(1) || "—"}<span className="text-gray-400">h</span>
                          </span>
                          {a.overtimeHours && a.overtimeHours > 0 && (
                            <span className="text-[9px] text-amber-600 bg-amber-50 px-1 ml-1 rounded font-semibold">+{a.overtimeHours.toFixed(1)}</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <StatusBadge status={a.status} />
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5">
                            {a.deviceType === "FINGERPRINT" || a.deviceType === "FACE" ? (
                              <Fingerprint size={12} className="text-black" />
                            ) : a.deviceType === "MANUAL" ? (
                              <Monitor size={12} className="text-black" />
                            ) : (
                              <Smartphone size={12} className="text-black" />
                            )}
                            <span className="text-[10px] text-gray-500 font-medium">{a.deviceType || "—"}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          {a.biometricVerified ? (
                            <div className="flex items-center gap-1">
                              <CheckCircle size={12} className="text-black" />
                              <span className="text-[10px] text-emerald-600 font-medium">Verified</span>
                            </div>
                          ) : (
                            <span className="text-[10px] text-gray-300 font-medium">—</span>
                          )}
                        </td>
                        <td className="px-5 py-3 text-right">
                          <button
                            onClick={() => setShowEmployeeDetail(a)}
                            className="w-7 h-7 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-700 transition-colors"
                            title="View Details"
                          >
                            <Eye size={13} />
                          </button>
                        </td>
                      </motion.tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {!showHistory && !loading && filteredAttendances.length > ITEMS_PER_PAGE && (
              <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100 bg-gray-50/50">
                <span className="text-xs text-gray-500">
                  Showing {(page - 1) * ITEMS_PER_PAGE + 1}–{Math.min(page * ITEMS_PER_PAGE, filteredAttendances.length)} of {filteredAttendances.length}
                </span>
                <div className="flex gap-1">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page <= 1}
                    className="px-2.5 py-1.5 rounded-lg border border-gray-200 text-xs font-medium text-gray-600 hover:bg-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft size={13} />
                  </button>
                  {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                    const start = Math.max(1, Math.min(page - 2, totalPages - 4));
                    const p = start + i;
                    if (p > totalPages) return null;
                    return (
                      <button
                        key={p}
                        onClick={() => setPage(p)}
                        className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                          p === page
                            ? "bg-gray-900 text-white"
                            : "border border-gray-200 text-gray-600 hover:bg-white"
                        }`}
                      >
                        {p}
                      </button>
                    );
                  })}
                  <button
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page >= totalPages}
                    className="px-2.5 py-1.5 rounded-lg border border-gray-200 text-xs font-medium text-gray-600 hover:bg-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <ChevronRight size={13} />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* ── NOT CHECKED IN ───────────────────────────────── */}
          {notCheckedIn.length > 0 && !showHistory && (
            <div className="bg-white border border-gray-100 rounded-xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">
                  Not Checked In
                  <span className="text-gray-300 font-normal ml-1.5">({notCheckedIn.length})</span>
                </h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {notCheckedIn.slice(0, 12).map(e => (
                  <div key={e.id} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-50 border border-gray-100 hover:bg-gray-100 transition-colors">
                    <Avatar firstName={e.firstName} lastName={e.lastName} size="sm" />
                    <div>
                      <span className="text-xs font-semibold text-gray-800">{e.firstName} {e.lastName}</span>
                      <span className="text-[10px] text-gray-400 ml-1.5">{e.department?.name || ""}</span>
                    </div>
                    <button
                      onClick={() => { setSelectedEmployee(e.id); handleCheckIn(e.id); }}
                      className="text-[10px] bg-gray-900 text-white px-2 py-1 rounded-md hover:bg-black transition-colors ml-1 font-semibold"
                    >
                      Check In
                    </button>
                  </div>
                ))}
                {notCheckedIn.length > 12 && (
                  <div className="px-3 py-2 rounded-lg bg-gray-50 border border-gray-100 text-xs text-gray-400 font-medium">
                    +{notCheckedIn.length - 12} more
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── DEVICE BREAKDOWN ─────────────────────────────── */}
          {summary?.today?.deviceBreakdown && Object.keys(summary.today.deviceBreakdown).length > 0 && !showHistory && (
            <div className="bg-white border border-gray-100 rounded-xl p-5">
              <h3 className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-3">Device Breakdown</h3>
              <div className="flex flex-wrap gap-3">
                {Object.entries(summary.today.deviceBreakdown).map(([type, count]) => (
                  <div key={type} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-50 border border-gray-100">
                    {type === "FINGERPRINT" || type === "FACE" ? (
                      <Fingerprint size={13} className="text-black" />
                    ) : type === "MANUAL" ? (
                      <Monitor size={13} className="text-black" />
                    ) : (
                      <Smartphone size={13} className="text-black" />
                    )}
                    <span className="text-xs font-semibold text-gray-700">{type}</span>
                    <span className="text-xs font-bold text-gray-400 bg-white px-1.5 py-0.5 rounded">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── CHECK-IN MODAL ───────────────────────────────── */}
          <AnimatePresence>
            {showCheckInModal && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
                onClick={() => setShowCheckInModal(false)}
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 10 }}
                  className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6"
                  onClick={e => e.stopPropagation()}
                >
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-900 to-slate-700 flex items-center justify-center">
                      <LogIn size={16} className="text-white" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-gray-900">Manual Check-In</h2>
                      <p className="text-xs text-gray-500">Record an employee's arrival</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5 block">Employee</label>
                      <select
                        value={selectedEmployee}
                        onChange={e => setSelectedEmployee(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 bg-white text-gray-900"
                      >
                        <option value="">Select employee...</option>
                        {employees.map(e => (
                          <option key={e.id} value={e.id}>
                            {e.firstName} {e.lastName} — {e.department?.name || e.jobTitle || "—"}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5 block">Location</label>
                      <div className="flex gap-2">
                        <input
                          value={checkInGeo.lat ? `${checkInGeo.lat?.toFixed(4)}, ${checkInGeo.lng?.toFixed(4)}` : ""}
                          placeholder="GPS coordinates"
                          readOnly
                          className="flex-1 px-3 py-2.5 rounded-xl border border-gray-200 text-xs bg-gray-50 text-gray-500"
                        />
                        <button onClick={getGPS} className="px-3 py-2 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors">
                          <MapPin size={14} className="text-gray-600" />
                        </button>
                      </div>
                    </div>
                    <div className="flex gap-2 pt-2">
                      <button
                        onClick={() => setShowCheckInModal(false)}
                        className="flex-1 py-2.5 rounded-xl border border-gray-200 text-xs font-semibold text-gray-500 hover:bg-gray-50 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleCheckIn()}
                        disabled={isCheckingIn || !selectedEmployee}
                        className="flex-1 py-2.5 rounded-xl bg-gray-900 text-white text-xs font-semibold hover:bg-black transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        {isCheckingIn ? <Loader2 size={12} className="animate-spin" /> : <Fingerprint size={12} />}
                        {isCheckingIn ? "Processing..." : "Check In"}
                      </button>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── EMPLOYEE DETAIL POPUP ────────────────────────── */}
          <AnimatePresence>
            {showEmployeeDetail && <EmployeeDetailPopup attendance={showEmployeeDetail} />}
          </AnimatePresence>
        </>
      ) : (
        /* ══════════════════════════════════════════════════════ */
        /* DEVICE MANAGEMENT VIEW                                  */
        /* ══════════════════════════════════════════════════════ */
        <>
          <div className="bg-white border border-gray-100 rounded-xl p-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-gray-900 uppercase tracking-widest">Biometric Devices</h2>
                <p className="text-xs text-gray-400 mt-0.5">{devices.length} device(s) registered</p>
              </div>
              <button
                onClick={() => { setEditingDevice(null); setDeviceForm({ name: "", deviceType: "FINGERPRINT", serialNumber: "", model: "", ipAddress: "", port: 8080, location: "" }); setShowDeviceModal(true); }}
                className="px-4 py-2 rounded-xl bg-gray-900 text-white text-xs font-semibold hover:bg-black transition-colors flex items-center gap-2"
              >
                <Plus size={13} /> Register Device
              </button>
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {devices.map((device, i) => {
              const isOnline = device.status === "ACTIVE";
              return (
                <motion.div
                  key={device.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  whileHover={{ y: -2 }}
                  className="bg-white border border-gray-100 rounded-xl p-5 hover:shadow-md transition-all"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isOnline ? "bg-emerald-50" : "bg-gray-50"}`}>
                        {device.deviceType === "FINGERPRINT" || device.deviceType === "FACE" ? (
                          <Fingerprint size={18} className={isOnline ? "text-black" : "text-black/40"} />
                        ) : (
                          <Smartphone size={18} className={isOnline ? "text-black" : "text-black/40"} />
                        )}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-gray-900">{device.name}</h4>
                        <span className="text-[10px] text-gray-400 font-medium">{device.deviceType} · {device.serialNumber}</span>
                      </div>
                    </div>
                    <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      isOnline ? "bg-emerald-50 text-emerald-700" : "bg-gray-50 text-gray-500"
                    }`}>
                      <div className={`w-1.5 h-1.5 rounded-full ${isOnline ? "bg-emerald-500" : "bg-gray-300"}`} />
                      {device.status}
                    </div>
                  </div>
                  <div className="space-y-1.5 mb-4 text-xs">
                    {device.location && (
                      <p className="text-gray-500 flex items-center gap-1.5">
                        <MapPin size={10} className="text-black/60 shrink-0" /> {device.location}
                      </p>
                    )}
                    {device.ipAddress && (
                      <p className="text-gray-500 flex items-center gap-1.5">
                        <Monitor size={10} className="text-black/60 shrink-0" /> {device.ipAddress}:{device.port}
                      </p>
                    )}
                    {device.lastSyncAt && (
                      <p className="text-gray-400 flex items-center gap-1.5">
                        <RefreshCw size={10} className="text-black/50 shrink-0" />
                        Last sync: {new Date(device.lastSyncAt).toLocaleString()}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2 pt-3 border-t border-gray-100">
                    <button
                      onClick={() => { setEditingDevice(device); setDeviceForm({
                        name: device.name, deviceType: device.deviceType, serialNumber: device.serialNumber,
                        model: device.model || "", ipAddress: device.ipAddress || "", port: device.port || 8080,
                        location: device.location || "",
                      }); setShowDeviceModal(true); }}
                      className="flex-1 py-1.5 rounded-lg border border-gray-200 text-[10px] font-semibold text-gray-700 hover:bg-gray-50 transition-colors flex items-center justify-center gap-1"
                    >
                      <Edit3 size={10} /> Edit
                    </button>
                    <button
                      onClick={() => setConfirmDeleteDeviceId(device.id)}
                      className="flex-1 py-1.5 rounded-lg border border-gray-200 text-[10px] font-semibold text-rose-500 hover:bg-rose-50 transition-colors flex items-center justify-center gap-1"
                    >
                      <Trash2 size={10} /> Remove
                    </button>
                  </div>
                </motion.div>
              );
            })}
            {devices.length === 0 && !loading && (
              <div className="col-span-full bg-white border border-gray-100 rounded-xl p-10 text-center">
                <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center mx-auto mb-4">
                  <Fingerprint size={28} className="text-gray-300" />
                </div>
                <p className="text-sm font-semibold text-gray-500 mb-1">No biometric devices registered</p>
                <p className="text-xs text-gray-400 mb-4">Register fingerprint scanners, face recognition cameras, or card readers</p>
                <button
                  onClick={() => { setEditingDevice(null); setDeviceForm({ name: "", deviceType: "FINGERPRINT", serialNumber: "", model: "", ipAddress: "", port: 8080, location: "" }); setShowDeviceModal(true); }}
                  className="px-4 py-2 rounded-xl bg-gray-900 text-white text-xs font-semibold hover:bg-black transition-colors inline-flex items-center gap-2"
                >
                  <Plus size={13} /> Register Your First Device
                </button>
              </div>
            )}
          </div>

          {/* ── DEVICE MODAL ─────────────────────────────────── */}
          <AnimatePresence>
            {showDeviceModal && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
                onClick={() => setShowDeviceModal(false)}
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 10 }}
                  className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6"
                  onClick={e => e.stopPropagation()}
                >
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-900 to-slate-700 flex items-center justify-center">
                      <Smartphone size={16} className="text-white" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-gray-900">
                        {editingDevice ? "Edit Device" : "Register Biometric Device"}
                      </h2>
                      <p className="text-xs text-gray-500">{editingDevice ? "Update device details" : "Add a new biometric scanner"}</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1 block">Device Name</label>
                        <input value={deviceForm.name} onChange={e => setDeviceForm({ ...deviceForm, name: e.target.value })} placeholder="Main Entrance Scanner" className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900" />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1 block">Type</label>
                        <select value={deviceForm.deviceType} onChange={e => setDeviceForm({ ...deviceForm, deviceType: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 bg-white">
                          <option value="FINGERPRINT">Fingerprint</option>
                          <option value="FACE">Face Recognition</option>
                          <option value="CARD">Card Reader</option>
                          <option value="IRIS">Iris Scanner</option>
                          <option value="PALM">Palm Scanner</option>
                        </select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1 block">Serial Number</label>
                        <input value={deviceForm.serialNumber} onChange={e => setDeviceForm({ ...deviceForm, serialNumber: e.target.value })} placeholder="ZK-181-001" className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900" />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1 block">Model</label>
                        <input value={deviceForm.model} onChange={e => setDeviceForm({ ...deviceForm, model: e.target.value })} placeholder="ZK-181" className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1 block">IP Address</label>
                        <input value={deviceForm.ipAddress} onChange={e => setDeviceForm({ ...deviceForm, ipAddress: e.target.value })} placeholder="192.168.1.100" className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900" />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1 block">Port</label>
                        <input type="number" value={deviceForm.port} onChange={e => setDeviceForm({ ...deviceForm, port: parseInt(e.target.value) || 8080 })} className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900" />
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1 block">Location</label>
                      <input value={deviceForm.location} onChange={e => setDeviceForm({ ...deviceForm, location: e.target.value })} placeholder="Main Entrance, Building A" className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900" />
                    </div>
                    <div className="flex gap-2 pt-2">
                      <button onClick={() => setShowDeviceModal(false)} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-xs font-semibold text-gray-500 hover:bg-gray-50 transition-colors">Cancel</button>
                      <button onClick={saveDevice} className="flex-1 py-2.5 rounded-xl bg-gray-900 text-white text-xs font-semibold hover:bg-black transition-colors">
                        {editingDevice ? "Update Device" : "Register Device"}
                      </button>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}

      {/* ── CONFIRM: Sync All ───────────────────────────────── */}
      <ConfirmDialog
        open={confirmSync}
        variant="default"
        title="Sync All Employees to Attendance?"
        message={`This will create PRESENT attendance records for all ${employees.filter(e => !attendances.some(a => a.employee.id === e.id)).length} employee(s) who don't have today's record yet.`}
        confirmLabel="Sync All"
        onConfirm={handleSyncAll}
        onCancel={() => setConfirmSync(false)}
      />

      {/* ── CONFIRM: Delete Device ──────────────────────────── */}
      <ConfirmDialog
        open={!!confirmDeleteDeviceId}
        variant="danger"
        title="Remove Device"
        message="Are you sure you want to remove this biometric device? This action cannot be undone."
        confirmLabel="Remove"
        onConfirm={confirmDeleteDevice}
        onCancel={() => setConfirmDeleteDeviceId(null)}
      />
    </div>
  );
}

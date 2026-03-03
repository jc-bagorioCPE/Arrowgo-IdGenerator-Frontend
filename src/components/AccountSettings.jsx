import { useEffect, useState, useRef, useCallback } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  LogOut,
  ShieldCheck,
  KeyRound,
  Pencil,
  Trash2,
  MoreVertical,
  UserCheck,
  UserX,
  AlertCircle,
  Clock,
  Users,
  MapPin,
  Monitor,
  History,
  Wifi,
  WifiOff,
  Ban,
  Activity,
  RefreshCw,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../lib/api";

// ── How often to auto-refresh the admin list (ms) ──────────────────────────
const POLL_INTERVAL = 15_000;

// ── Status config ────────────────────────────────────────────────────────────
const statusConfig = {
  active: {
    color: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-400 dark:border-emerald-800",
    dot: "bg-emerald-500",
    icon: Activity,
    label: "Active",
    pulse: true,
  },
  offline: {
    color: "bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-800/50 dark:text-slate-400 dark:border-slate-700",
    dot: "bg-slate-400 dark:bg-slate-500",
    icon: WifiOff,
    label: "Offline",
    pulse: false,
  },
  disabled: {
    color: "bg-red-50 text-red-600 border-red-200 dark:bg-red-950/50 dark:text-red-400 dark:border-red-800",
    dot: "bg-red-500",
    icon: Ban,
    label: "Disabled",
    pulse: false,
  },
};

const sessionStatusConfig = {
  active: {
    color: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-400 dark:border-emerald-800",
    label: "Active",
  },
  expired: {
    color: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-400 dark:border-amber-800",
    label: "Expired",
  },
  logged_out: {
    color: "bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-800/50 dark:text-slate-400 dark:border-slate-700",
    label: "Logged Out",
  },
};

// ── Sub-components ───────────────────────────────────────────────────────────
const StatusBadge = ({ status }) => {
  const cfg = statusConfig[status] || statusConfig.offline;
  return (
    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-semibold ${cfg.color}`}>
      <span className="relative flex h-2 w-2">
        {cfg.pulse && (
          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${cfg.dot} opacity-60`} />
        )}
        <span className={`relative inline-flex rounded-full h-2 w-2 ${cfg.dot}`} />
      </span>
      {cfg.label}
    </div>
  );
};

const StatCard = ({ icon: Icon, label, value, lightColor, darkColor, lightBorder, darkBorder, lightBg, darkBg, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.35, delay }}
  >
    <Card className={`border-l-4 ${lightBorder} ${darkBorder} hover:shadow-md transition-shadow dark:bg-gray-900 dark:border-gray-800`}>
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">{label}</p>
            <p className={`text-3xl font-black ${lightColor} ${darkColor}`}>{value}</p>
          </div>
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${lightBg} ${darkBg}`}>
            <Icon className={`h-5 w-5 ${lightColor} ${darkColor}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  </motion.div>
);

// ── Main Component ───────────────────────────────────────────────────────────
export default function AccountSettings() {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);
  const [lastRefreshed, setLastRefreshed] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  const [logoutDialog, setLogoutDialog] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [editDialog, setEditDialog] = useState(false);
  const [passwordDialog, setPasswordDialog] = useState(false);
  const [sessionDialog, setSessionDialog] = useState(false);

  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [formError, setFormError] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);

  const [sessions, setSessions] = useState([]);
  const [sessionsLoading, setSessionsLoading] = useState(false);

  const [countdown, setCountdown] = useState(10);
  const countdownRef = useRef(null);
  const pollRef = useRef(null);

  const token = localStorage.getItem("token");

  const fetchAdmins = useCallback(async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      else setRefreshing(true);

      const res = await api.get("/api/admins", {
        headers: { Authorization: `Bearer ${token}` },
      });

      setAdmins(res.data);
      setLastRefreshed(new Date());
    } catch (err) {
      console.error("Failed to load admins", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [token]);

  useEffect(() => {
    fetchAdmins(false);
  }, [fetchAdmins]);

  useEffect(() => {
    pollRef.current = setInterval(() => fetchAdmins(true), POLL_INTERVAL);
    return () => clearInterval(pollRef.current);
  }, [fetchAdmins]);

  useEffect(() => {
    if (logoutDialog) {
      setCountdown(10);
      countdownRef.current = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(countdownRef.current);
            setLogoutDialog(false);
            return 10;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(countdownRef.current);
    }
    return () => clearInterval(countdownRef.current);
  }, [logoutDialog]);

  const refreshAfterAction = useCallback((delayMs = 600) => {
    setTimeout(() => fetchAdmins(true), delayMs);
  }, [fetchAdmins]);

  const fetchSessions = async (adminId) => {
    setSessionsLoading(true);
    try {
      const res = await api.get(`/api/admins/${adminId}/sessions`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSessions(res.data);
    } catch (err) {
      console.error("Failed to fetch sessions", err);
      setSessions([]);
    } finally {
      setSessionsLoading(false);
    }
  };

  const toggleStatus = async (admin) => {
    const endpoint = admin.status === "disabled" ? "enable" : "disable";
    const optimisticStatus = admin.status === "disabled" ? "active" : "disabled";

    setAdmins((prev) =>
      prev.map((a) => (a.id === admin.id ? { ...a, status: optimisticStatus } : a))
    );
    setActionLoading(admin.id);

    try {
      await api.put(
        `/api/admins/${admin.id}/${endpoint}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      refreshAfterAction();
    } catch (err) {
      console.error("Failed to update status", err);
      fetchAdmins(true);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async () => {
    if (!selectedAdmin) return;
    setActionLoading(selectedAdmin.id);
    try {
      await api.delete(`/api/admins/${selectedAdmin.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDeleteDialog(false);
      setSelectedAdmin(null);
      refreshAfterAction();
    } catch (err) {
      setFormError(err.response?.data?.message || "Failed to delete admin");
    } finally {
      setActionLoading(null);
    }
  };

  const handleUpdateUsername = async () => {
    if (!newUsername.trim()) { setFormError("Username cannot be empty"); return; }
    setActionLoading(selectedAdmin.id);
    setFormError("");
    try {
      await api.put(
        `/api/admins/${selectedAdmin.id}`,
        { username: newUsername },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setEditDialog(false);
      setSelectedAdmin(null);
      setNewUsername("");
      refreshAfterAction();
    } catch (err) {
      setFormError(err.response?.data?.message || "Failed to update username");
    } finally {
      setActionLoading(null);
    }
  };

  const handleChangePassword = async () => {
    if (newPassword.length < 6) { setFormError("Password must be at least 6 characters"); return; }
    if (newPassword !== confirmPassword) { setFormError("Passwords do not match"); return; }
    setActionLoading(selectedAdmin.id);
    setFormError("");
    try {
      await api.post(
        `/api/admins/${selectedAdmin.id}/change-password`,
        { newPassword },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPasswordDialog(false);
      setSelectedAdmin(null);
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setFormError(err.response?.data?.message || "Failed to update password");
    } finally {
      setActionLoading(null);
    }
  };

  const handleLogoutAll = async () => {
    try {
      await api.post("/api/admins/logout-all", {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      localStorage.clear();
      window.location.href = "/";
    } catch (err) {
      console.error("Failed to logout all", err);
    }
  };

  const openEditDialog = (admin) => { setSelectedAdmin(admin); setNewUsername(admin.username); setFormError(""); setEditDialog(true); };
  const openPasswordDialog = (admin) => { setSelectedAdmin(admin); setNewPassword(""); setConfirmPassword(""); setFormError(""); setPasswordDialog(true); };
  const openDeleteDialog = (admin) => { setSelectedAdmin(admin); setFormError(""); setDeleteDialog(true); };
  const openSessionDialog = (admin) => { setSelectedAdmin(admin); setSessions([]); setSessionDialog(true); fetchSessions(admin.id); };

  const adminStats = {
    total: admins.length,
    active: admins.filter((a) => a.status === "active").length,
    offline: admins.filter((a) => a.status === "offline").length,
    disabled: admins.filter((a) => a.status === "disabled").length,
  };

  const totalPages = Math.max(1, Math.ceil(admins.length / itemsPerPage));
  const paginatedAdmins = admins.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getPageNumbers = () => {
    const pages = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else if (currentPage <= 3) {
      pages.push(1, 2, 3, 4, "ellipsis", totalPages);
    } else if (currentPage >= totalPages - 2) {
      pages.push(1, "ellipsis", totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
    } else {
      pages.push(1, "ellipsis", currentPage - 1, currentPage, currentPage + 1, "ellipsis2", totalPages);
    }
    return pages;
  };

  const formatDate = (date) =>
    date
      ? new Date(date).toLocaleString("en-US", {
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })
      : "—";

  const AvatarInitial = ({ name, size = "md" }) => {
    const colors = [
      "from-violet-500 to-purple-600",
      "from-blue-500 to-cyan-600",
      "from-green-500 to-emerald-600",
      "from-orange-500 to-amber-600",
      "from-pink-500 to-rose-600",
    ];
    const idx = name?.charCodeAt(0) % colors.length || 0;
    const sz = size === "sm" ? "h-7 w-7 text-xs" : "h-10 w-10 text-sm";
    return (
      <div className={`${sz} rounded-full bg-gradient-to-br ${colors[idx]} flex items-center justify-center text-white font-bold shadow-sm flex-shrink-0`}>
        {name?.charAt(0).toUpperCase()}
      </div>
    );
  };

  return (
    <div className="space-y-6 pb-10">
      {/* Page Header */}
      <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-gray-900 dark:text-gray-50">Account Settings</h1>
            <p className="text-muted-foreground text-sm mt-0.5">
              Manage administrators, sessions, and security
            </p>
            {lastRefreshed && (
              <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-1 flex items-center gap-1">
                <Clock className="h-3 w-3" />
                Updated {formatDate(lastRefreshed)}
                {refreshing && (
                  <RefreshCw className="h-3 w-3 animate-spin ml-1 text-blue-400" />
                )}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchAdmins(true)}
              disabled={refreshing}
              className="gap-2 dark:border-gray-700 dark:hover:bg-gray-800"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setLogoutDialog(true)}
              className="gap-2 shadow-sm hover:shadow-md transition-shadow"
            >
              <LogOut className="h-4 w-4" />
              Logout All
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
        <StatCard
          icon={Users} label="Total" value={adminStats.total}
          lightColor="text-blue-600" darkColor="dark:text-blue-400"
          lightBorder="border-l-blue-500" darkBorder="dark:border-l-blue-600"
          lightBg="bg-blue-100" darkBg="dark:bg-blue-900/40"
          delay={0.05}
        />
        <StatCard
          icon={Activity} label="Active" value={adminStats.active}
          lightColor="text-emerald-600" darkColor="dark:text-emerald-400"
          lightBorder="border-l-emerald-500" darkBorder="dark:border-l-emerald-600"
          lightBg="bg-emerald-100" darkBg="dark:bg-emerald-900/40"
          delay={0.1}
        />
        <StatCard
          icon={WifiOff} label="Offline" value={adminStats.offline}
          lightColor="text-slate-600" darkColor="dark:text-slate-400"
          lightBorder="border-l-slate-400" darkBorder="dark:border-l-slate-600"
          lightBg="bg-slate-100" darkBg="dark:bg-slate-800/60"
          delay={0.15}
        />
        <StatCard
          icon={Ban} label="Disabled" value={adminStats.disabled}
          lightColor="text-red-600" darkColor="dark:text-red-400"
          lightBorder="border-l-red-500" darkBorder="dark:border-l-red-600"
          lightBg="bg-red-100" darkBg="dark:bg-red-900/40"
          delay={0.2}
        />
      </div>

      {/* Table */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.25 }}>
        <Card className="shadow-sm border border-gray-100 dark:border-gray-800 dark:bg-gray-900">
          <CardHeader className="border-b border-gray-100 dark:border-gray-800 bg-gray-50/60 dark:bg-gray-800/40 py-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center">
                <ShieldCheck className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <CardTitle className="text-base text-gray-900 dark:text-gray-100">System Administrators</CardTitle>
                <CardDescription className="text-xs dark:text-gray-400">
                  Manage user access, permissions, and session history · Auto-refreshes every {POLL_INTERVAL / 1000}s
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="p-6 space-y-3">
                {[...Array(4)].map((_, i) => (
                  <Skeleton key={i} className="h-14 w-full rounded-xl dark:bg-gray-800" />
                ))}
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50/40 dark:bg-gray-800/30 hover:bg-gray-50/40 dark:hover:bg-gray-800/30 border-gray-100 dark:border-gray-800">
                        <TableHead className="font-semibold text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400">Administrator</TableHead>
                        <TableHead className="font-semibold text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400">Role</TableHead>
                        <TableHead className="font-semibold text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400">Status</TableHead>
                        <TableHead className="font-semibold text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400">Last Active</TableHead>
                        <TableHead className="font-semibold text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400">Login Location</TableHead>
                        <TableHead className="text-right font-semibold text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <AnimatePresence>
                        {paginatedAdmins.map((admin, index) => (
                          <motion.tr
                            key={admin.id}
                            initial={{ opacity: 0, x: -16 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 16 }}
                            transition={{ duration: 0.2, delay: index * 0.04 }}
                            className="group hover:bg-gray-50/60 dark:hover:bg-gray-800/40 transition-colors border-b border-gray-50 dark:border-gray-800/60"
                          >
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <AvatarInitial name={admin.username} />
                                <div>
                                  <p className="font-semibold text-sm text-gray-800 dark:text-gray-100">{admin.username}</p>
                                  <p className="text-xs text-gray-400 dark:text-gray-500">ID #{admin.id}</p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold capitalize ${
                                admin.role === "superadmin"
                                  ? "bg-purple-50 text-purple-700 border border-purple-200 dark:bg-purple-950/50 dark:text-purple-400 dark:border-purple-800"
                                  : "bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950/50 dark:text-blue-400 dark:border-blue-800"
                              }`}>
                                {admin.role === "superadmin" ? "Super Admin" : "Admin"}
                              </span>
                            </TableCell>
                            <TableCell>
                              <StatusBadge status={admin.status} />
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                                <Clock className="h-3 w-3" />
                                {formatDate(admin.last_active)}
                              </div>
                            </TableCell>
                            <TableCell>
                              {admin.login_location ? (
                                <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 max-w-[160px]">
                                  <MapPin className="h-3 w-3 text-green-500 dark:text-green-400 flex-shrink-0" />
                                  <span className="truncate">{admin.login_location}</span>
                                </div>
                              ) : (
                                <span className="text-xs text-gray-300 dark:text-gray-600">—</span>
                              )}
                            </TableCell>
                            <TableCell className="text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity dark:hover:bg-gray-700"
                                    disabled={actionLoading === admin.id}
                                  >
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-52 dark:bg-gray-900 dark:border-gray-700">
                                  <DropdownMenuItem onClick={() => openSessionDialog(admin)} className="gap-2 text-sm dark:hover:bg-gray-800 dark:focus:bg-gray-800">
                                    <History className="h-4 w-4 text-blue-500" />
                                    View Sessions
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator className="dark:bg-gray-700" />
                                  <DropdownMenuItem onClick={() => openEditDialog(admin)} className="gap-2 text-sm dark:hover:bg-gray-800 dark:focus:bg-gray-800">
                                    <Pencil className="h-4 w-4" />
                                    Edit Username
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => openPasswordDialog(admin)} className="gap-2 text-sm dark:hover:bg-gray-800 dark:focus:bg-gray-800">
                                    <KeyRound className="h-4 w-4" />
                                    Change Password
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator className="dark:bg-gray-700" />
                                  <DropdownMenuItem onClick={() => toggleStatus(admin)} className="gap-2 text-sm dark:hover:bg-gray-800 dark:focus:bg-gray-800">
                                    {admin.status === "disabled"
                                      ? <><UserCheck className="h-4 w-4 text-emerald-500" />Enable Account</>
                                      : <><UserX className="h-4 w-4 text-orange-500" />Disable Account</>}
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator className="dark:bg-gray-700" />
                                  <DropdownMenuItem
                                    onClick={() => openDeleteDialog(admin)}
                                    className="gap-2 text-sm text-red-600 focus:text-red-600 dark:text-red-400 dark:focus:text-red-400 dark:hover:bg-gray-800 dark:focus:bg-gray-800"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                    Delete Admin
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </motion.tr>
                        ))}
                      </AnimatePresence>
                    </TableBody>
                  </Table>
                </div>

                {/* Pagination */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-gray-100 dark:border-gray-800 px-4 py-3 bg-gray-50/40 dark:bg-gray-800/20">
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span>
                      {admins.length === 0 ? "0" : (currentPage - 1) * itemsPerPage + 1}–
                      {Math.min(currentPage * itemsPerPage, admins.length)} of {admins.length}
                    </span>
                    <Select
                      value={String(itemsPerPage)}
                      onValueChange={(v) => { setItemsPerPage(Number(v)); setCurrentPage(1); }}
                    >
                      <SelectTrigger className="h-7 w-16 text-xs dark:border-gray-700 dark:bg-gray-800"><SelectValue /></SelectTrigger>
                      <SelectContent className="dark:bg-gray-900 dark:border-gray-700">
                        {[5, 10, 20, 50].map((n) => (
                          <SelectItem key={n} value={String(n)} className="dark:hover:bg-gray-800 dark:focus:bg-gray-800">{n}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Pagination className="w-auto mx-0">
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          onClick={() => currentPage > 1 && setCurrentPage((p) => p - 1)}
                          className={`${currentPage === 1 ? "pointer-events-none opacity-40" : "cursor-pointer"} dark:hover:bg-gray-800 dark:border-gray-700`}
                        />
                      </PaginationItem>
                      {getPageNumbers().map((page, idx) =>
                        String(page).startsWith("ellipsis") ? (
                          <PaginationItem key={`${page}-${idx}`}><PaginationEllipsis /></PaginationItem>
                        ) : (
                          <PaginationItem key={page}>
                            <PaginationLink
                              isActive={currentPage === page}
                              onClick={() => setCurrentPage(page)}
                              className="cursor-pointer dark:hover:bg-gray-800 dark:border-gray-700 data-[active=true]:dark:bg-gray-700"
                            >
                              {page}
                            </PaginationLink>
                          </PaginationItem>
                        )
                      )}
                      <PaginationItem>
                        <PaginationNext
                          onClick={() => currentPage < totalPages && setCurrentPage((p) => p + 1)}
                          className={`${currentPage === totalPages ? "pointer-events-none opacity-40" : "cursor-pointer"} dark:hover:bg-gray-800 dark:border-gray-700`}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* ── SESSION HISTORY DIALOG ── */}
      <Dialog open={sessionDialog} onOpenChange={setSessionDialog}>
        <DialogContent className="max-w-2xl dark:bg-gray-900 dark:border-gray-800">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 dark:text-gray-100">
              <History className="h-5 w-5 text-blue-500" />
              Session History
              {selectedAdmin && (
                <span className="text-sm font-normal text-muted-foreground ml-1">
                  — {selectedAdmin.username}
                </span>
              )}
            </DialogTitle>
            <DialogDescription className="dark:text-gray-400">Last 20 login sessions for this administrator</DialogDescription>
          </DialogHeader>
          <div className="max-h-[420px] overflow-y-auto mt-2 space-y-2 pr-1">
            {sessionsLoading ? (
              [...Array(4)].map((_, i) => <Skeleton key={i} className="h-16 w-full rounded-xl dark:bg-gray-800" />)
            ) : sessions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-gray-400 dark:text-gray-500">
                <Monitor className="h-10 w-10 mb-2 opacity-30" />
                <p className="text-sm">No sessions found</p>
              </div>
            ) : (
              sessions.map((session, i) => {
                const scfg = sessionStatusConfig[session.status] || sessionStatusConfig.logged_out;
                return (
                  <motion.div
                    key={session.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className="flex items-start gap-3 p-3.5 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Monitor className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                          <MapPin className="h-3 w-3 text-green-500 dark:text-green-400 flex-shrink-0" />
                          <span className="font-medium text-gray-700 dark:text-gray-200 truncate">
                            {session.location || "Unknown Location"}
                          </span>
                        </div>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full border text-xs font-semibold flex-shrink-0 ${scfg.color}`}>
                          {scfg.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-400 dark:text-gray-500">
                        <span className="flex items-center gap-1">
                          <Wifi className="h-3 w-3" />
                          {session.ip_address || "—"}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatDate(session.login_at)}
                        </span>
                        {session.logged_out_at && (
                          <span className="flex items-center gap-1">
                            <LogOut className="h-3 w-3" />
                            {formatDate(session.logged_out_at)}
                          </span>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>
          <DialogFooter className="mt-2">
            <Button variant="outline" onClick={() => setSessionDialog(false)} className="dark:border-gray-700 dark:hover:bg-gray-800">Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── EDIT USERNAME DIALOG ── */}
      <Dialog open={editDialog} onOpenChange={setEditDialog}>
        <DialogContent className="dark:bg-gray-900 dark:border-gray-800">
          <DialogHeader>
            <DialogTitle className="dark:text-gray-100">Edit Username</DialogTitle>
            <DialogDescription className="dark:text-gray-400">Update username for <strong>{selectedAdmin?.username}</strong></DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-3">
            {formError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{formError}</AlertDescription>
              </Alert>
            )}
            <div className="space-y-1.5">
              <Label htmlFor="edit-username" className="text-sm font-semibold dark:text-gray-200">New Username</Label>
              <Input
                id="edit-username"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                placeholder="Enter new username"
                className="h-10 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100 dark:placeholder-gray-500"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialog(false)} className="dark:border-gray-700 dark:hover:bg-gray-800">Cancel</Button>
            <Button onClick={handleUpdateUsername} disabled={actionLoading === selectedAdmin?.id}>
              {actionLoading === selectedAdmin?.id ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── CHANGE PASSWORD DIALOG ── */}
      <Dialog open={passwordDialog} onOpenChange={setPasswordDialog}>
        <DialogContent className="dark:bg-gray-900 dark:border-gray-800">
          <DialogHeader>
            <DialogTitle className="dark:text-gray-100">Change Password</DialogTitle>
            <DialogDescription className="dark:text-gray-400">Set a new password for <strong>{selectedAdmin?.username}</strong></DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-3">
            {formError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{formError}</AlertDescription>
              </Alert>
            )}
            <div className="space-y-1.5">
              <Label className="text-sm font-semibold dark:text-gray-200">New Password</Label>
              <Input
                type={showNewPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="h-10 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100 dark:placeholder-gray-500"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-semibold dark:text-gray-200">Confirm Password</Label>
              <Input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repeat password"
                className="h-10 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100 dark:placeholder-gray-500"
              />
            </div>
            {newPassword && confirmPassword && newPassword !== confirmPassword && (
              <p className="text-xs text-red-500 dark:text-red-400 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />Passwords do not match
              </p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPasswordDialog(false)} className="dark:border-gray-700 dark:hover:bg-gray-800">Cancel</Button>
            <Button onClick={handleChangePassword} disabled={actionLoading === selectedAdmin?.id}>
              {actionLoading === selectedAdmin?.id ? "Updating..." : "Update Password"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── DELETE DIALOG ── */}
      <Dialog open={deleteDialog} onOpenChange={setDeleteDialog}>
        <DialogContent className="dark:bg-gray-900 dark:border-gray-800">
          <DialogHeader>
            <DialogTitle className="text-red-600 dark:text-red-400 flex items-center gap-2">
              <Trash2 className="h-5 w-5" />
              Delete Administrator
            </DialogTitle>
            <DialogDescription className="dark:text-gray-400">
              This will permanently delete <strong>{selectedAdmin?.username}</strong>. This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          {formError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{formError}</AlertDescription>
            </Alert>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialog(false)} className="dark:border-gray-700 dark:hover:bg-gray-800">Cancel</Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={actionLoading === selectedAdmin?.id}
            >
              {actionLoading === selectedAdmin?.id ? "Deleting..." : "Delete Admin"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── LOGOUT ALL DIALOG ── */}
      <Dialog open={logoutDialog} onOpenChange={setLogoutDialog}>
        <DialogContent className="sm:max-w-sm dark:bg-gray-900 dark:border-gray-800">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600 dark:text-red-400">
              <AlertCircle className="h-5 w-5" />
              Logout All Sessions
            </DialogTitle>
            <DialogDescription className="dark:text-gray-400">
              All admins will be logged out from every device immediately.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center py-6 gap-2">
            <div className="relative w-20 h-20 flex items-center justify-center">
              <svg className="absolute inset-0 -rotate-90" viewBox="0 0 80 80">
                <circle cx="40" cy="40" r="34" fill="none" stroke="#fee2e2" strokeWidth="6" className="dark:stroke-red-950" />
                <circle
                  cx="40" cy="40" r="34"
                  fill="none" stroke="#ef4444" strokeWidth="6"
                  strokeDasharray={`${2 * Math.PI * 34}`}
                  strokeDashoffset={`${2 * Math.PI * 34 * (1 - countdown / 10)}`}
                  style={{ transition: "stroke-dashoffset 1s linear" }}
                />
              </svg>
              <span className="text-3xl font-black text-red-600 dark:text-red-400">{countdown}</span>
            </div>
            <p className="text-xs text-muted-foreground">Auto-cancels in {countdown}s</p>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setLogoutDialog(false)} className="flex-1 dark:border-gray-700 dark:hover:bg-gray-800">Cancel</Button>
            <Button variant="destructive" onClick={handleLogoutAll} className="flex-1 gap-2">
              <LogOut className="h-4 w-4" />
              Confirm Logout
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
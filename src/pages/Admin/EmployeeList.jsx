import { useEffect, useState } from "react";
import api from "../../lib/api";
import DataTable from "../../components/DataTable-Admin";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import ViewEmployeeModal from "../../components/ViewEmployeeModal";
import EditInfo from "../../components/EditInfo";
import {
  RefreshCw,
  Users,
  MoreVertical,
  Eye,
  Pencil,
  CheckCircle2,
  Clock,
  AlertCircle,
  Archive,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// ── date helpers ──────────────────────────────────────────────────────────────
const convertDatesToLocal = (employees) =>
  employees.map((employee) => {
    const c = { ...employee };
    ["date_hired", "birth_date"].forEach((f) => {
      if (c[f]) {
        const d = new Date(c[f]);
        c[f] = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      }
    });
    ["created_at", "claimed_at", "ID_created"].forEach((f) => {
      if (c[f]) {
        const d = new Date(c[f]);
        c[f] = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}:${String(d.getSeconds()).padStart(2, "0")}`;
      }
    });
    return c;
  });

const sortEmployeeId = (rowA, rowB, columnId) => {
  const order = ["ALIMDC", "ALITAG", "ALIPAL", "TEMPO-ALICEBU", "TEMPO-ALIDAVAO"];
  const idA = rowA.getValue(columnId);
  const idB = rowB.getValue(columnId);
  const ia = order.indexOf(idA);
  const ib = order.indexOf(idB);
  if (ia !== -1 && ib !== -1) return ia - ib;
  if (ia !== -1) return -1;
  if (ib !== -1) return 1;
  return idA.localeCompare(idB);
};

// ── status config ─────────────────────────────────────────────────────────────
const STATUS_CONFIG = {
  pending: {
    cls: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800",
    icon: Clock,
    label: "Pending",
  },
  done: {
    cls: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800",
    icon: CheckCircle2,
    label: "Done",
  },
};

// ── status badge (supports loading state) ─────────────────────────────────────
function StatusBadge({ status, isUpdating }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  const Icon = cfg.icon;
  return (
    <Badge
      variant="outline"
      className={`${cfg.cls} gap-1.5 font-semibold text-[11px] select-none transition-opacity ${isUpdating ? "opacity-60" : ""}`}
    >
      {isUpdating ? (
        <RefreshCw className="h-3 w-3 animate-spin" />
      ) : (
        <Icon className="h-3 w-3" />
      )}
      {isUpdating ? "Updating…" : cfg.label}
    </Badge>
  );
}

// ── main component ────────────────────────────────────────────────────────────
export default function EmployeeList() {
  const [employees,        setEmployees]        = useState([]);
  const [loading,          setLoading]          = useState(true);
  const [refreshing,       setRefreshing]       = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [viewEmployee,     setViewEmployee]     = useState(null);
  const [deleteDialog,     setDeleteDialog]     = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState(null);
  const [deleteLoading,    setDeleteLoading]    = useState(false);
  const [notification,     setNotification]     = useState(null);
  // tracks which employee_id is currently having its status updated
  const [updatingStatusId, setUpdatingStatusId] = useState(null);

  // ── load ────────────────────────────────────────────────────────────────────
  const loadEmployees = async (showRefreshIndicator = false) => {
    try {
      showRefreshIndicator ? setRefreshing(true) : setLoading(true);
      const res = await api.get("/api/employees");
      setEmployees(convertDatesToLocal(res.data));
    } catch {
      showNotification("Failed to load employees", "error");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { loadEmployees(); }, []);

  useEffect(() => {
    if (!notification) return;
    const t = setTimeout(() => setNotification(null), 4000);
    return () => clearTimeout(t);
  }, [notification]);

  const showNotification = (message, type = "success") => setNotification({ message, type });

  // ── actions ─────────────────────────────────────────────────────────────────
  const handleEditClose = (shouldRefresh) => {
    setSelectedEmployee(null);
    if (shouldRefresh) { loadEmployees(true); showNotification("Employee updated successfully"); }
  };

  const openViewModal = async (id) => {
    try {
      const res = await api.get(`/api/employees/${id}`);
      setViewEmployee(convertDatesToLocal([res.data])[0]);
    } catch {
      showNotification("Failed to load employee details", "error");
    }
  };

  const handleDelete = async () => {
    if (!employeeToDelete) return;
    setDeleteLoading(true);
    try {
      await api.delete(`/api/employees/${employeeToDelete.employee_id}`);
      setEmployees((prev) => prev.filter((e) => e.employee_id !== employeeToDelete.employee_id));
      showNotification("Employee archived successfully");
      setDeleteDialog(false);
      setEmployeeToDelete(null);
    } catch {
      showNotification("Failed to archive employee", "error");
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleStatusChange = async (employee, newStatus) => {
    // Prevent double-click while already updating this row
    if (updatingStatusId === employee.employee_id) return;

    setUpdatingStatusId(employee.employee_id);
    try {
      await api.put(`/api/employees/${employee.employee_id}`, { ...employee, status: newStatus });
      setEmployees((prev) =>
        prev.map((e) => e.employee_id === employee.employee_id ? { ...e, status: newStatus } : e)
      );
      showNotification(`Status changed to ${newStatus}`);
    } catch {
      showNotification("Failed to update status", "error");
      loadEmployees(true);
    } finally {
      setUpdatingStatusId(null);
    }
  };

  // ── derived stats ───────────────────────────────────────────────────────────
  const total   = employees.length;
  const done    = employees.filter((e) => e.status === "done").length;
  const pending = employees.filter((e) => e.status === "pending").length;

  // ── columns ─────────────────────────────────────────────────────────────────
  const columns = [
    {
      accessorKey: "employee_name",
      header: "Employee Name",
      cell: ({ row }) => (
        <div className="font-semibold text-foreground min-w-[150px] text-sm">
          {row.original.employee_name}
        </div>
      ),
    },
    {
      accessorKey: "employee_id",
      header: "Employee ID",
      sortingFn: sortEmployeeId,
      cell: ({ row }) => (
        <span className="text-xs font-mono text-muted-foreground">
          {row.original.employee_id}
        </span>
      ),
    },
    {
      accessorKey: "position",
      header: "Position",
      cell: ({ row }) => (
        <span className="text-sm text-foreground min-w-[120px] inline-block">
          {row.original.position}
        </span>
      ),
    },
    {
      accessorKey: "contact_person",
      header: "Contact Person",
      cell: ({ row }) => (
        <span className="text-sm text-foreground min-w-[120px] inline-block">
          {row.original.contact_person || <span className="text-muted-foreground/50">—</span>}
        </span>
      ),
    },
    {
      accessorKey: "contact_number",
      header: "Contact Number",
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground whitespace-nowrap font-mono">
          {row.original.contact_number || <span className="text-muted-foreground/50">—</span>}
        </span>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const isUpdating = updatingStatusId === row.original.employee_id;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild disabled={isUpdating}>
              <button className="cursor-pointer hover:opacity-75 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 rounded-md disabled:cursor-not-allowed disabled:pointer-events-none">
                <StatusBadge status={row.original.status} isUpdating={isUpdating} />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-popover border-border">
              <DropdownMenuItem
                onClick={() => handleStatusChange(row.original, "pending")}
                disabled={isUpdating || row.original.status === "pending"}
                className="gap-2 text-popover-foreground focus:bg-accent disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isUpdating ? (
                  <RefreshCw className="h-4 w-4 animate-spin text-amber-500" />
                ) : (
                  <Clock className="h-4 w-4 text-amber-500" />
                )}
                Mark as Pending
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleStatusChange(row.original, "done")}
                disabled={isUpdating || row.original.status === "done"}
                className="gap-2 text-popover-foreground focus:bg-accent disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isUpdating ? (
                  <RefreshCw className="h-4 w-4 animate-spin text-emerald-500" />
                ) : (
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                )}
                Mark as Done
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
    {
      header: "Actions",
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent"
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 bg-popover border-border">
            <DropdownMenuItem
              onClick={() => openViewModal(row.original.employee_id)}
              className="gap-2 text-popover-foreground focus:bg-accent"
            >
              <Eye className="h-4 w-4" />
              View Details
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => setSelectedEmployee(row.original)}
              className="gap-2 text-popover-foreground focus:bg-accent"
            >
              <Pencil className="h-4 w-4" />
              Edit Employee
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-border" />
            <DropdownMenuItem
              onClick={() => { setEmployeeToDelete(row.original); setDeleteDialog(true); }}
              className="gap-2 text-red-600 dark:text-red-400 focus:bg-red-50 dark:focus:bg-red-950/40 focus:text-red-600 dark:focus:text-red-400"
            >
              <Archive className="h-4 w-4" />
              Archive
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  // ── render ──────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-5 pb-8 w-full max-w-full">

      {/* ── Toast notification ── */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -40, x: "-50%" }}
            animate={{ opacity: 1, y: 0,  x: "-50%" }}
            exit={{   opacity: 0, y: -40, x: "-50%" }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="fixed top-5 left-1/2 z-50 w-full max-w-sm px-4"
          >
            <Alert
              variant={notification.type === "error" ? "destructive" : "default"}
              className={
                notification.type === "success"
                  ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 shadow-lg"
                  : "shadow-lg"
              }
            >
              {notification.type === "success"
                ? <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                : <AlertCircle className="h-4 w-4" />
              }
              <AlertDescription
                className={notification.type === "success"
                  ? "text-emerald-800 dark:text-emerald-300 font-medium"
                  : "font-medium"
                }
              >
                {notification.message}
              </AlertDescription>
            </Alert>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Page header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
            <Users size={18} className="text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <h1 className="text-lg font-extrabold text-foreground leading-tight tracking-tight">
              Employee Directory
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              View and manage all employee information
            </p>
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => loadEmployees(true)}
          disabled={refreshing}
          className="gap-2 rounded-xl h-9 border-border text-foreground hover:bg-accent self-start sm:self-auto"
        >
          <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} />
          {refreshing ? "Refreshing…" : "Refresh"}
        </Button>
      </div>

      {/* ── Stat chips ── */}
      <div className="flex flex-wrap gap-2">
        {[
          { label: "Total",   value: total,   color: "text-foreground",                        bg: "bg-muted/60 border-border"                                                        },
          { label: "Done",    value: done,     color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800"  },
          { label: "Pending", value: pending,  color: "text-amber-600 dark:text-amber-400",     bg: "bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800"          },
        ].map(({ label, value, color, bg }) => (
          <div
            key={label}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-semibold ${bg}`}
          >
            <span className="text-muted-foreground">{label}</span>
            <span className={`font-black text-sm ${color}`}>{value}</span>
          </div>
        ))}
      </div>

      {/* ── Table card ── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.05 }}
        className="w-full"
      >
        <Card className="border-border bg-card shadow-sm overflow-hidden">
          <CardContent className="p-0 overflow-x-auto">
            {loading ? (
              <div className="flex items-center justify-center min-h-[400px]">
                <div className="flex flex-col items-center gap-5">
                  <div className="relative w-12 h-12">
                    <div className="absolute inset-0 rounded-full border-[3px] border-emerald-200/30 dark:border-emerald-900/30" />
                    <div className="absolute inset-0 rounded-full border-[3px] border-emerald-500 border-t-transparent animate-spin" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-bold text-foreground">Loading Employees</p>
                    <p className="text-xs text-muted-foreground mt-1">Fetching employee data…</p>
                  </div>
                </div>
              </div>
            ) : (
              <DataTable columns={columns} data={employees} />
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* ── Archive confirmation dialog ── */}
      <Dialog open={deleteDialog} onOpenChange={setDeleteDialog}>
        <DialogContent className="bg-card border-border sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-foreground">
              <div className="w-8 h-8 rounded-xl bg-red-500/10 flex items-center justify-center flex-shrink-0">
                <Archive className="h-4 w-4 text-red-500" />
              </div>
              Archive Employee
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Are you sure you want to archive{" "}
              <strong className="text-foreground">{employeeToDelete?.employee_name}</strong>?
              This action can be reversed later from the archive list.
            </DialogDescription>
          </DialogHeader>

          {employeeToDelete && (
            <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-muted/50 border border-border">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0 shadow-sm">
                {employeeToDelete.employee_name?.charAt(0)?.toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">{employeeToDelete.employee_name}</p>
                <p className="text-[10px] text-muted-foreground font-mono">{employeeToDelete.employee_id}</p>
              </div>
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-2">
            <Button
              variant="outline"
              onClick={() => setDeleteDialog(false)}
              disabled={deleteLoading}
              className="rounded-xl border-border text-foreground hover:bg-accent"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteLoading}
              className="rounded-xl gap-2"
            >
              {deleteLoading ? (
                <><RefreshCw className="h-4 w-4 animate-spin" /> Archiving…</>
              ) : (
                <><Archive className="h-4 w-4" /> Archive Employee</>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Modals ── */}
      <EditInfo employee={selectedEmployee} onClose={handleEditClose} />
      <ViewEmployeeModal employee={viewEmployee} onClose={() => setViewEmployee(null)} />
    </div>
  );
}
import { useEffect, useState, useCallback } from "react";
import api from "../../lib/api";
import DataTableClaim from "../../components/DataTable-Claim";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  CheckCircle2,
  XCircle,
  RefreshCw,
  Users,
  ChevronDown,
  AlertCircle,
  Loader2,
} from "lucide-react";

/* ======================================================
   Claim Status Badge Component
====================================================== */
const ClaimBadge = ({ status, isUpdating }) => {
  const safeStatus = status || "not_claimed";
  const config = {
    claimed: {
      className:
        "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 " +
        "dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20 dark:hover:bg-emerald-500/20",
      icon: CheckCircle2,
      label: "Claimed",
    },
    not_claimed: {
      className:
        "bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 " +
        "dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20 dark:hover:bg-rose-500/20",
      icon: XCircle,
      label: "Unclaimed",
    },
  };
  const { className, icon: Icon, label } =
    config[safeStatus] || config.not_claimed;

  if (isUpdating) {
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold tracking-wide transition-all duration-150 select-none opacity-60 ${className}`}
      >
        <RefreshCw className="h-3.5 w-3.5 shrink-0 animate-spin" />
        Updating…
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold tracking-wide transition-all duration-150 cursor-pointer select-none ${className}`}
    >
      <Icon className="h-3.5 w-3.5 shrink-0" />
      {label}
      <ChevronDown className="h-3 w-3 opacity-60 ml-0.5" />
    </span>
  );
};

/* ======================================================
   Stat Card
====================================================== */
const StatCard = ({ label, value, icon: Icon, colorClass, chipBg }) => (
  <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${chipBg}`}>
    <div className={`p-2 rounded-lg ${colorClass}`}>
      <Icon className="h-4 w-4" />
    </div>
    <div>
      <p className="text-xs text-slate-500 dark:text-zinc-500 font-medium">{label}</p>
      <p className="text-lg font-bold text-slate-900 dark:text-white leading-tight">{value}</p>
    </div>
  </div>
);

/* ======================================================
   Main Page
====================================================== */
export default function ClaimPage() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);

  /* ================================
     Load Employees
  ================================= */
  const loadEmployees = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      const res = await api.get("/api/employees");
      const formatted = res.data.map((emp) => ({
        ...emp,
        current_status: emp.current_status || "not_claimed",
      }));
      setEmployees(formatted);
    } catch (error) {
      console.error("Load Employees Error:", error);
      alert("Failed to load employees");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadEmployees();
  }, [loadEmployees]);

  /* ================================
     Update Claim Status
  ================================= */
  const handleClaimChange = async (employee, newStatus) => {
    if (employee.current_status === newStatus || updatingId === employee.employee_id) return;
    setUpdatingId(employee.employee_id);
    try {
      const endpoint = newStatus === "claimed" ? "claim" : "unclaim";
      await api.put(`/api/employees/${employee.employee_id}/${endpoint}`);
      setEmployees((prev) =>
        prev.map((emp) =>
          emp.employee_id === employee.employee_id
            ? { ...emp, current_status: newStatus }
            : emp
        )
      );
    } catch (error) {
      console.error("Claim Update Error:", error);
      alert("Failed to update claim status");
      loadEmployees();
    } finally {
      setUpdatingId(null);
    }
  };

  /* ================================
     Derived Stats
  ================================= */
  const total = employees.length;
  const claimed = employees.filter((e) => e.current_status === "claimed").length;
  const unclaimed = total - claimed;

  /* ================================
     Table Columns
  ================================= */
  const columns = [
    {
      accessorKey: "employee_name",
      header: "Employee Name",
      cell: ({ row }) => (
        <span className="font-semibold text-slate-900 dark:text-white">
          {row.getValue("employee_name")}
        </span>
      ),
    },
    {
      accessorKey: "employee_id",
      header: "Employee ID",
      cell: ({ row }) => (
        <span className="font-mono text-xs text-slate-500 dark:text-zinc-400 bg-slate-100 dark:bg-white/5 px-2 py-0.5 rounded">
          {row.getValue("employee_id")}
        </span>
      ),
    },
    {
      accessorKey: "position",
      header: "Position",
      cell: ({ row }) => (
        <span className="text-slate-700 dark:text-zinc-300">
          {row.getValue("position")}
        </span>
      ),
    },
    {
      accessorKey: "contact_person",
      header: "Contact Person",
      cell: ({ row }) => (
        <span className="text-slate-700 dark:text-zinc-300">
          {row.getValue("contact_person") || (
            <span className="text-slate-300 dark:text-zinc-600">—</span>
          )}
        </span>
      ),
    },
    {
      accessorKey: "contact_number",
      header: "Contact Number",
      cell: ({ row }) => (
        <span className="font-mono text-sm text-slate-600 dark:text-zinc-400">
          {row.getValue("contact_number") || (
            <span className="text-slate-300 dark:text-zinc-600">—</span>
          )}
        </span>
      ),
    },
    {
      accessorKey: "current_status",
      header: "Claim Status",
      cell: ({ row }) => {
        const employee = row.original;
        const currentStatus = employee.current_status || "not_claimed";
        const isUpdating = updatingId === employee.employee_id;

        return (
          <TooltipProvider delayDuration={300}>
            <Tooltip>
              <DropdownMenu>
                <DropdownMenuTrigger asChild disabled={isUpdating}>
                  <TooltipTrigger asChild>
                    <button
                      className="focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded-md disabled:cursor-not-allowed disabled:pointer-events-none"
                      aria-label={`Change claim status for ${employee.employee_name}`}
                    >
                      <ClaimBadge status={currentStatus} isUpdating={isUpdating} />
                    </button>
                  </TooltipTrigger>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-44 shadow-xl rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 dark:shadow-black/50"
                >
                  <DropdownMenuLabel className="text-xs font-semibold text-slate-400 dark:text-zinc-500 uppercase tracking-wider px-3 pt-2 pb-1">
                    Change Status
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-slate-100 dark:bg-zinc-800" />
                  <DropdownMenuItem
                    onClick={() => handleClaimChange(employee, "claimed")}
                    disabled={isUpdating || currentStatus === "claimed"}
                    className="gap-2 cursor-pointer hover:bg-emerald-50 dark:hover:bg-emerald-500/10 focus:bg-emerald-50 dark:focus:bg-emerald-500/10 rounded-lg mx-1 my-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isUpdating ? (
                      <RefreshCw className="h-4 w-4 animate-spin text-emerald-500 shrink-0" />
                    ) : (
                      <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                    )}
                    <span className="text-sm font-medium text-slate-700 dark:text-zinc-200">
                      Mark as Claimed
                    </span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleClaimChange(employee, "not_claimed")}
                    disabled={isUpdating || currentStatus === "not_claimed"}
                    className="gap-2 cursor-pointer hover:bg-rose-50 dark:hover:bg-rose-500/10 focus:bg-rose-50 dark:focus:bg-rose-500/10 rounded-lg mx-1 my-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isUpdating ? (
                      <RefreshCw className="h-4 w-4 animate-spin text-rose-500 shrink-0" />
                    ) : (
                      <XCircle className="h-4 w-4 text-rose-500 shrink-0" />
                    )}
                    <span className="text-sm font-medium text-slate-700 dark:text-zinc-200">
                      Mark as Unclaimed
                    </span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              {!isUpdating && (
                <TooltipContent
                  side="top"
                  className="text-xs bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-lg px-2.5 py-1.5"
                >
                  Click to change status
                </TooltipContent>
              )}
            </Tooltip>
          </TooltipProvider>
        );
      },
    },
  ];

  /* ================================
     UI
  ================================= */
  return (
    <div className="space-y-5 pb-8 w-full max-w-full p-4 sm:p-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 flex items-center justify-center flex-shrink-0">
            <Users size={18} className="text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <h1 className="text-lg font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
              Claim Management
            </h1>
            <p className="text-xs text-slate-500 dark:text-zinc-500 mt-0.5">
              Track and manage employee claim statuses across your organization.
            </p>
          </div>
        </div>

        <TooltipProvider delayDuration={300}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                onClick={() => loadEmployees(true)}
                disabled={refreshing}
                className="gap-2 self-start sm:self-auto rounded-xl h-9 border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800 transition-all"
              >
                <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
                {refreshing ? "Refreshing..." : "Refresh"}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="text-xs rounded-lg">
              Reload employee data
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {/* Stats Row */}
      {!loading && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <StatCard
            label="Total Employees"
            value={total}
            icon={Users}
            colorClass="bg-indigo-100 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400"
            chipBg="bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10"
          />
          <StatCard
            label="Claimed"
            value={claimed}
            icon={CheckCircle2}
            colorClass="bg-emerald-100 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400"
            chipBg="bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20"
          />
          <StatCard
            label="Unclaimed"
            value={unclaimed}
            icon={XCircle}
            colorClass="bg-rose-100 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400"
            chipBg="bg-rose-50 dark:bg-rose-500/10 border-rose-200 dark:border-rose-500/20"
          />
        </div>
      )}

      {/* Main Table Card */}
      <Card className="shadow-sm border border-slate-200 dark:border-zinc-800 rounded-2xl overflow-hidden bg-white dark:bg-zinc-950 dark:shadow-black/40">
        <CardHeader className="px-6 py-4 border-b border-slate-100 dark:border-zinc-800 bg-slate-50/60 dark:bg-white/[0.03] flex flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-indigo-100 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20">
              <Users className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-800 dark:text-white leading-tight">
                Employee Records
              </h2>
              {!loading && (
                <p className="text-xs text-slate-400 dark:text-zinc-500 mt-0.5">
                  {total} employee{total !== 1 ? "s" : ""} found
                </p>
              )}
            </div>
          </div>

          {!loading && unclaimed > 0 && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 text-amber-700 dark:text-amber-400">
              <AlertCircle className="h-3.5 w-3.5 shrink-0" />
              <span className="text-xs font-semibold">{unclaimed} unclaimed</span>
            </div>
          )}
        </CardHeader>

        <CardContent className="p-0">
          {loading ? (
            <div className="flex flex-col items-center justify-center min-h-[420px] gap-4">
              <div className="relative w-12 h-12">
                <div className="absolute inset-0 rounded-full border-[3px] border-indigo-200/30 dark:border-indigo-500/10" />
                <div className="absolute inset-0 rounded-full border-[3px] border-indigo-500 border-t-transparent animate-spin" />
              </div>
              <div className="text-center">
                <p className="text-sm font-bold text-slate-900 dark:text-white">
                  Loading Employees
                </p>
                <p className="text-xs text-slate-500 dark:text-zinc-500 mt-1">
                  Fetching employee data…
                </p>
              </div>
            </div>
          ) : employees.length === 0 ? (
            <div className="flex flex-col items-center justify-center min-h-[420px] gap-3">
              <Users className="h-10 w-10 text-slate-300 dark:text-zinc-700" />
              <p className="text-sm font-medium text-slate-500 dark:text-zinc-500">
                No employees found
              </p>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => loadEmployees()}
                className="text-indigo-500 hover:text-indigo-700 dark:hover:text-indigo-400"
              >
                Try again
              </Button>
            </div>
          ) : (
            <DataTableClaim
              columns={columns}
              data={employees}
              onRefresh={loadEmployees}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
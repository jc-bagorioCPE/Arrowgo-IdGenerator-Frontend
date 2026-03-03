import { useEffect, useState } from "react";
import api from "../../lib/api";
import DataTable from "../../components/DataTable-Admin";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import ViewEmployeeModal from "../../components/ArchiveView";
import { RefreshCw, Archive, MoreVertical, Eye, RotateCcw, Trash2 } from "lucide-react";
import { toast } from "sonner";

export default function ArchiveList() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [viewEmployee, setViewEmployee] = useState(null);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, employeeId: null });
  const [restoreDialog, setRestoreDialog] = useState({ open: false, employeeId: null });

  const formatLocalDateTime = (dateString) => {
    if (!dateString) return "";

    return new Date(dateString).toLocaleString("en-PH", {
      timeZone: "Asia/Manila",
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  // Load archived employees
  const loadEmployees = async (showRefreshIndicator = false) => {
    try {
      showRefreshIndicator ? setRefreshing(true) : setLoading(true);
      const res = await api.get("/archive");
      setEmployees(res.data);
    } catch (err) {
      toast.error("Failed to fetch archived employees.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadEmployees();
  }, []);

  // Restore function
  const handleRestore = async (employeeId) => {
    try {
      await api.post(`/api/archive/restore/${employeeId}`);
      toast.success("Employee restored successfully!");
      loadEmployees(true);
      setRestoreDialog({ open: false, employeeId: null });
    } catch (err) {
      console.error(err);
      toast.error(
        err.response?.data?.message || "Failed to restore employee."
      );
    }
  };

  // Permanent delete function
  const handleDelete = async (employeeId) => {
    try {
      await api.delete(`/api/archive/${employeeId}`);
      toast.success("Archived employee permanently deleted!");
      loadEmployees(true);
      setDeleteDialog({ open: false, employeeId: null });
    } catch (err) {
      console.error(err);
      toast.error(
        err.response?.data?.message || "Failed to delete archived employee."
      );
    }
  };

  const columns = [
    {
      accessorKey: "employee_name",
      header: "Employee Name",
      cell: ({ row }) => (
        <div className="font-medium">{row.original.employee_name}</div>
      ),
    },
    {
      accessorKey: "employee_id",
      header: "Employee ID",
      cell: ({ row }) => (
        <div className="text-muted-foreground">{row.original.employee_id}</div>
      ),
    },
    {
      accessorKey: "position",
      header: "Position",
      cell: ({ row }) => (
        <Badge variant="secondary" className="font-normal">
          {row.original.position}
        </Badge>
      ),
    },
    {
      accessorKey: "archived_at",
      header: "Archived At",
      cell: ({ row }) => (
        <div className="text-sm text-muted-foreground">
          {formatLocalDateTime(row.original.archived_at)}
        </div>
      ),
    },
    {
      id: "actions",
      header: () => <div className="text-right">Actions</div>,
      cell: ({ row }) => (
        <div className="flex justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 hover:bg-muted"
              >
                <MoreVertical className="h-4 w-4" />
                <span className="sr-only">Open menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              
              <DropdownMenuItem
                onClick={() => setViewEmployee(row.original)}
                className="cursor-pointer"
              >
                <Eye className="mr-2 h-4 w-4" />
                View Details
              </DropdownMenuItem>
              
              <DropdownMenuItem
                onClick={() =>
                  setRestoreDialog({
                    open: true,
                    employeeId: row.original.employee_id,
                  })
                }
                className="cursor-pointer text-emerald-600 focus:text-emerald-600"
              >
                <RotateCcw className="mr-2 h-4 w-4" />
                Restore Employee
              </DropdownMenuItem>
              
              <DropdownMenuSeparator />
              
              <DropdownMenuItem
                onClick={() =>
                  setDeleteDialog({
                    open: true,
                    employeeId: row.original.employee_id,
                  })
                }
                className="cursor-pointer text-destructive focus:text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Permanently
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    },
  ];

  return (
    <>
      <div className="space-y-6">
        <Card className="max-w-7xl mx-auto border-none shadow-sm">
          <CardHeader className="space-y-1 pb-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Archive className="h-5 w-5 text-muted-foreground" />
                  <CardTitle className="text-2xl font-semibold">
                    Archived Employees
                  </CardTitle>
                </div>
                <CardDescription>
                  Manage archived employee records. You can restore or permanently delete entries.
                </CardDescription>
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => loadEmployees(true)}
                disabled={refreshing}
                className="gap-2"
              >
                <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
                Refresh
              </Button>
            </div>

            {employees.length > 0 && (
              <div className="pt-2">
                <p className="text-sm text-muted-foreground">
                  Total archived: <span className="font-medium text-foreground">{employees.length}</span>
                </p>
              </div>
            )}
          </CardHeader>

          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : employees.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Archive className="h-12 w-12 text-muted-foreground/50 mb-4" />
                <h3 className="text-lg font-semibold mb-1">No Archived Employees</h3>
                <p className="text-sm text-muted-foreground max-w-sm">
                  There are currently no archived employee records in the system.
                </p>
              </div>
            ) : (
              <DataTable columns={columns} data={employees} />
            )}
          </CardContent>
        </Card>
      </div>

      {/* View Employee Modal */}
      <ViewEmployeeModal
        employee={viewEmployee}
        onClose={() => setViewEmployee(null)}
      />

      {/* Restore Confirmation Dialog */}
      <AlertDialog
        open={restoreDialog.open}
        onOpenChange={(open) =>
          !open && setRestoreDialog({ open: false, employeeId: null })
        }
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <RotateCcw className="h-5 w-5 text-emerald-600" />
              Restore Employee
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to restore this employee? They will be moved back to the active employees list and will regain access to the system.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => handleRestore(restoreDialog.employeeId)}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              Restore Employee
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={deleteDialog.open}
        onOpenChange={(open) =>
          !open && setDeleteDialog({ open: false, employeeId: null })
        }
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-destructive">
              <Trash2 className="h-5 w-5" />
              Permanent Deletion
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the archived employee record. This action cannot be undone and all associated data will be lost forever.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => handleDelete(deleteDialog.employeeId)}
              className="bg-destructive hover:bg-destructive/90"
            >
              Delete Permanently
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
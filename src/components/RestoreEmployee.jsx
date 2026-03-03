import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import api from "../lib/api";

export default function RestoreButton({ employeeId, onRestored }) {
  const handleRestore = async () => {
    const confirmRestore = window.confirm(
      "Are you sure you want to restore this employee?\nThey will be moved back to active employees."
    );

    if (!confirmRestore) return;

    try {
      await api.post(`/api/archive/restore/${employeeId}`);
      toast.success("Employee restored successfully!");
      onRestored?.(); // refresh list
    } catch (err) {
      console.error("Restore failed:", err);
      toast.error(
        err.response?.data?.error ||
        "Failed to restore employee. Check backend."
      );
    }
  };

  return (
    <Button
      size="sm"
      onClick={handleRestore}
      className="bg-gradient-to-r from-emerald-500 to-emerald-600
                 hover:from-emerald-600 hover:to-emerald-700
                 text-white shadow-sm"
    >
      Restore
    </Button>
  );
}

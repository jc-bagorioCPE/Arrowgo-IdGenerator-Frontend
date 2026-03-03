import { Button } from "./ui/button";
import axios from "axios";

const api = import.meta.env.VITE_API_BASE_URL;
export const columns = [
  {
    accessorKey: "employee_name",
    header: "Employee Name",
  },
  {
    accessorKey: "employee_id",
    header: "Employee ID",
  },
  {
    accessorKey: "position",
    header: "Position",
  },
  {
    accessorKey: "contact_person",
    header: "Contact Person",
  },
  {
    accessorKey: "contact_number",
    header: "Contact Number",
  },
  {
    accessorKey: "created_at",
    header: "Created At",
    cell: ({ row }) => {
      const date = new Date(row.original.created_at);
      return date.toLocaleDateString() + " " + date.toLocaleTimeString();
    }
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const employee = row.original;

      const updateStatus = async (newStatus) => {
        try {
          await axios.put(
            `${api}/api/employees/${employee.employee_id}/status`,
            { status: newStatus }
          );
          window.location.reload();
        } catch (error) {
          console.error("Update error:", error);
          alert("Failed to update status!");
        }
      };

      return (
        <select
          className="border p-2 rounded text-gray-800"
          defaultValue={employee.status}
          onChange={(e) => updateStatus(e.target.value)}
        >
          <option value="pending">Pending</option>
          <option value="done">Done</option>
        </select>
      );
    },
  },
  {
    header: "Actions",
    cell: ({ row }) => {
      const employee = row.original;

      const deleteItem = async () => {
        if (!confirm("Delete this employee?")) return;

        try {
          await axios.delete(
            `${api}/api/employees/${employee.employee_id}`
          );
          window.location.reload();
        } catch (err) {
          console.error("Delete error:", err);
        }
      };

      const editItem = () => {
        // You can navigate to an edit page or open a modal
        // Example: navigate(`/adminRoutes/editEmployee/${employee.employee_id}`);
        alert(`Edit employee: ${employee.employee_name}`);
      };

      return (
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="text-blue-600 border-blue-600 hover:bg-blue-600 hover:text-white transition"
            onClick={editItem}
          >
            Edit
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={deleteItem}
          >
            Delete
          </Button>
        </div>
      );
    },
  },
];

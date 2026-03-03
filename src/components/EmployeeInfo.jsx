import { Separator } from "@/components/ui/separator";

export default function EmployeeInfoGrid({ employee }) {
  if (!employee) return null;

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-gray-800">
        Employee Information
      </h2>


      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-700">
        <Info label="Position" value={employee.position} />
        <Info label="PhilHealth" value={employee.philhealth} />
        <Info label="SSS" value={employee.sss} />
        <Info label="Pag-IBIG" value={employee.pagibig} />
        <Info label="TIN" value={employee.tin} />
        <Info label="Contact Person" value={employee.contact_person} />
        <Info label="Contact Number" value={employee.contact_number} />
      </div>
    </div>
  );
}

function Info({ label, value }) {
  return (
    <div className="flex flex-col bg-gray-50 rounded-lg p-3 border">
      <span className="text-xs font-medium text-gray-500">{label}</span>
      <span className="font-semibold text-gray-800">
        {value || "—"}
      </span>
    </div>
  );
}

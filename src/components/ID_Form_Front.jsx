import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Briefcase, Hash } from "lucide-react";

const fields = [
  {
    key: "employeeName",
    label: "Employee Name",
    placeholder: "e.g. Maria Santos",
    icon: User,
  },
  {
    key: "position",
    label: "Position / Role",
    placeholder: "e.g. Logistics Officer",
    icon: Briefcase,
  },
  {
    key: "employeeId",
    label: "Employee ID",
    placeholder: "e.g. ALIMDC-0001",
    icon: Hash,
  },
];

export default function ID_Form_Front({
  employeeName,
  setEmployeeName,
  position,
  setPosition,
  employeeId,
  setEmployeeId,
}) {
  const values   = { employeeName, position, employeeId };
  const setters  = { employeeName: setEmployeeName, position: setPosition, employeeId: setEmployeeId };

  return (
    <div className="flex flex-col gap-5">
      {fields.map(({ key, label, placeholder, icon: Icon }) => (
        <div key={key} className="space-y-1.5">
          <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {label}
          </Label>
          <div className="relative">
            <Icon
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
            />
            <Input
              value={values[key]}
              onChange={(e) => setters[key](e.target.value)}
              placeholder={placeholder}
              className="pl-9 h-10 bg-background border-border text-foreground placeholder:text-muted-foreground/60 focus-visible:ring-emerald-500/40 focus-visible:border-emerald-500/60 rounded-xl transition-colors"
            />
          </div>
        </div>
      ))}
    </div>
  );
}
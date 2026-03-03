import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Save,
  X,
  User,
  Briefcase,
  Phone,
  UserCircle,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

// ==========================================
// FORMATTING UTILITIES
// ==========================================
const API = import.meta.env.VITE_API_BASE_URL;

/**
 * Capitalizes the first letter of every word instantly as the user types.
 * Works character-by-character so casing updates on every keystroke.
 */
const toTitleCase = (str) =>
  str
    .split('')
    .map((char, i, arr) => {
      const prev = arr.slice(0, i).join('').trimEnd();
      if (i === 0 || prev.length === 0 || arr[i - 1] === ' ') {
        return char.toUpperCase();
      }
      return char.toLowerCase();
    })
    .join('');

const formatters = {
  contactNumber: (value) => value.replace(/\D/g, '').slice(0, 11),
  textOnly: (value) => toTitleCase(value.replace(/[^A-Za-zÑñ\s.]/g, '')),
};

// ==========================================
// VALIDATION UTILITIES
// ==========================================
const validators = {
  employee_name: (value) => {
    const trimmed = value.trim();
    if (!trimmed) return "Employee name is required";
    if (!/^[A-Za-zÑñ\s.]+$/.test(trimmed)) return "Only letters, spaces, ñ, and dot (.) allowed";
    return "";
  },
  position: (value) => {
    const trimmed = value.trim();
    if (!trimmed) return "Position is required";
    if (!/^[A-Za-zÑñ\s.]+$/.test(trimmed)) return "Only letters, spaces, ñ, and dot (.) allowed";
    return "";
  },
  contact_person: (value) => {
    const trimmed = value.trim();
    if (!trimmed) return "";
    if (!/^[A-Za-zÑñ\s.]+$/.test(trimmed)) return "Only letters, spaces, ñ, and dot (.) allowed";
    return "";
  },
  contact_number: (value) => {
    const trimmed = value.trim();
    if (trimmed && !/^09\d{9}$/.test(value)) return "Must start with 09 and be 11 digits";
    return "";
  },
};

// ==========================================
// MAIN COMPONENT
// ==========================================
const EditInfo = ({ employee, onClose }) => {
  const [form, setForm] = useState({
    employee_name: "",
    position: "",
    contact_person: "",
    contact_number: "",
  });

  const [fieldErrors, setFieldErrors]   = useState({});
  const [isSaving, setIsSaving]         = useState(false);
  const [generalError, setGeneralError] = useState("");
  const [success, setSuccess]           = useState(false);

  // ── Populate form when employee changes ────────────────────────────────────
  useEffect(() => {
    if (employee) {
      setForm({
        employee_name:  toTitleCase(employee.employee_name  || employee.employeeName  || ""),
        position:       toTitleCase(employee.position       || ""),
        contact_person: toTitleCase(employee.contact_person || employee.contactPerson || ""),
        contact_number: employee.contact_number || employee.contactNumber || "",
      });
      setFieldErrors({});
      setGeneralError("");
      setSuccess(false);
    }
  }, [employee]);

  // ── Handle input changes ───────────────────────────────────────────────────
  const handleFormChange = useCallback((e) => {
    const { name, value } = e.target;
    let formattedValue = value;

    switch (name) {
      case "employee_name":
      case "position":
      case "contact_person":
        formattedValue = formatters.textOnly(value);
        break;
      case "contact_number":
        formattedValue = formatters.contactNumber(value);
        break;
    }

    setForm((prev) => ({ ...prev, [name]: formattedValue }));

    const error = validators[name] ? validators[name](formattedValue) : "";
    setFieldErrors((prev) => {
      const newErrors = { ...prev };
      if (error) newErrors[name] = error;
      else delete newErrors[name];
      return newErrors;
    });

    setGeneralError("");
  }, []);

  // ── Submit ─────────────────────────────────────────────────────────────────
  const handleUpdate = useCallback(async () => {
    const errors = {};
    Object.keys(form).forEach((key) => {
      if (validators[key]) {
        const error = validators[key](form[key]);
        if (error) errors[key] = error;
      }
    });

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setGeneralError("Please fix the errors above");
      return;
    }

    setIsSaving(true);
    setGeneralError("");

    try {
      const token      = localStorage.getItem("token");
      const employeeId = employee.employee_id || employee.employeeId;
      if (!employeeId) throw new Error("Employee ID is missing");

      const payload = {
        employee_name:  form.employee_name.trim(),
        position:       form.position.trim(),
        contact_person: form.contact_person.trim() || null,
        contact_number: form.contact_number.trim() || null,
      };

      console.log("📤 Sending update request:", { employeeId, payload });

      const response = await fetch(`${API}/api/employees/${employeeId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      console.log("📥 Response status:", response.status, response.statusText);

      const responseText = await response.text();
      console.log("📄 Response text:", responseText);

      let data;
      if (responseText) {
        try {
          data = JSON.parse(responseText);
        } catch (parseError) {
          console.error("❌ JSON parse error:", parseError);
          throw new Error(`Invalid JSON response: ${responseText.substring(0, 100)}`);
        }
      } else {
        throw new Error("Server returned an empty response");
      }

      if (!response.ok) {
        throw new Error(data?.error || data?.message || `Update failed with status ${response.status}`);
      }

      console.log("✅ Update successful:", data);
      setSuccess(true);
      setTimeout(() => onClose(true), 1500);

    } catch (err) {
      console.error("❌ Update error:", err);
      setGeneralError(err.message || "Failed to update employee");
    } finally {
      setIsSaving(false);
    }
  }, [form, employee, onClose]);

  const formSections = useMemo(() => [
    {
      title: "Personal Information",
      icon: User,
      fields: [
        { name: "employee_name", label: "Employee Name", type: "text", icon: User,      required: true, placeholder: "Enter full name",    hint: "Letters and spaces only", maxLength: 100 },
        { name: "position",      label: "Position",      type: "text", icon: Briefcase, required: true, placeholder: "Ex: Driver, Helper", hint: "Letters and spaces only", maxLength: 50  },
      ],
    },
    {
      title: "Contact Information",
      icon: Phone,
      fields: [
        { name: "contact_person", label: "Contact Person", type: "text", icon: UserCircle, placeholder: "Emergency contact name", hint: "Letters and spaces only",    maxLength: 100 },
        { name: "contact_number", label: "Contact Number", type: "tel",  icon: Phone,      placeholder: "09XXXXXXXXX",           hint: "11 digits starting with 09", maxLength: 11  },
      ],
    },
  ], []);

  const validationStatus = useMemo(() => {
    const hasAnyErrors      = Object.keys(fieldErrors).some((key) => fieldErrors[key]);
    const hasRequiredFields = form.employee_name.trim() && form.position.trim();
    const canSave           = hasRequiredFields && !hasAnyErrors && !isSaving && !success;
    return { hasAnyErrors, hasRequiredFields, canSave };
  }, [fieldErrors, form.employee_name, form.position, isSaving, success]);

  if (!employee) return null;

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <Dialog open={!!employee} onOpenChange={() => !isSaving && onClose(false)}>
      <DialogContent className="w-[95vw] max-w-2xl max-h-[90vh] overflow-hidden bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 p-0">

        {/* Header */}
        <DialogHeader className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-gradient-to-r from-[#70B9A1]/10 to-emerald-50/50 dark:from-slate-900 dark:to-slate-950">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-[#70B9A1] to-[#5A9A85] rounded-lg flex items-center justify-center shadow-md">
                <User className="text-white" size={20} />
              </div>
              <div>
                <DialogTitle className="text-xl font-bold text-slate-900 dark:text-slate-100">
                  Edit Employee
                </DialogTitle>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                  ID:{" "}
                  <span className="font-mono font-semibold text-[#70B9A1]">
                    {employee.employee_id || employee.employeeId}
                  </span>
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => !isSaving && onClose(false)}
              disabled={isSaving}
              className="rounded-full w-8 h-8 p-0 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X size={18} className="text-slate-600 dark:text-slate-400" />
            </Button>
          </div>
        </DialogHeader>

        {/* Body */}
        <div className="overflow-y-auto max-h-[calc(90vh-180px)] px-6 py-4">
          <div className="space-y-6">
            {formSections.map((section, sectionIdx) => {
              const SectionIcon = section.icon;
              return (
                <div key={sectionIdx} className="space-y-4">
                  <div className="flex items-center gap-2 pb-2 border-b border-slate-200 dark:border-slate-800">
                    <SectionIcon className="text-[#70B9A1]" size={18} />
                    <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                      {section.title}
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {section.fields.map((field) => {
                      const FieldIcon = field.icon;
                      const hasError  = fieldErrors[field.name];
                      const isFilled  = form[field.name]?.trim() !== "";
                      return (
                        <div
                          key={field.name}
                          className={
                            section.fields.length % 2 !== 0 &&
                            field === section.fields[section.fields.length - 1]
                              ? "sm:col-span-2"
                              : ""
                          }
                        >
                          <Label
                            htmlFor={field.name}
                            className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-1"
                          >
                            {field.label}
                            {field.required && <span className="text-red-500">*</span>}
                          </Label>

                          <div className="relative">
                            <FieldIcon
                              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 pointer-events-none z-10"
                              size={16}
                            />
                            <Input
                              id={field.name}
                              name={field.name}
                              type={field.type}
                              placeholder={field.placeholder}
                              value={form[field.name]}
                              onChange={handleFormChange}
                              disabled={isSaving}
                              maxLength={field.maxLength}
                              className={`pl-10 w-full border-2 transition-all ${
                                hasError
                                  ? "border-red-400 focus:border-red-500 bg-red-50 dark:bg-red-950/20"
                                  : isFilled
                                  ? "border-green-400 focus:border-green-500 bg-green-50 dark:bg-green-950/20"
                                  : "border-slate-300 dark:border-slate-700"
                              } dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:ring-2 focus:ring-[#70B9A1] dark:focus:ring-[#70B9A1]`}
                            />
                            {isFilled && !hasError && (
                              <CheckCircle2
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-green-600 pointer-events-none"
                                size={16}
                              />
                            )}
                          </div>

                          {!hasError && field.hint && (
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                              {field.hint}
                            </p>
                          )}
                          {hasError && (
                            <div className="flex items-center gap-1 mt-1">
                              <AlertCircle className="h-3 w-3 text-red-500 flex-shrink-0" />
                              <p className="text-xs text-red-600 dark:text-red-400">{hasError}</p>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}

            {/* General error */}
            {generalError && (
              <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg">
                <AlertCircle className="text-red-600 dark:text-red-400 flex-shrink-0" size={18} />
                <p className="text-sm text-red-600 dark:text-red-400">{generalError}</p>
              </div>
            )}

            {/* Success */}
            {success && (
              <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg">
                <CheckCircle2 className="text-green-600 dark:text-green-400 flex-shrink-0" size={18} />
                <p className="text-sm text-green-600 dark:text-green-400">
                  Employee updated successfully!
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 px-6 py-4 flex flex-col sm:flex-row justify-between items-center gap-3">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            <span className="text-red-500">*</span> Required fields
          </p>
          <div className="flex gap-2 w-full sm:w-auto">
            <Button
              variant="outline"
              onClick={() => onClose(false)}
              disabled={isSaving}
              className="flex-1 sm:flex-none border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X size={16} className="mr-2" />
              Cancel
            </Button>
            <Button
              onClick={handleUpdate}
              disabled={!validationStatus.canSave}
              className="flex-1 sm:flex-none bg-gradient-to-r from-[#70B9A1] to-[#5A9A85] hover:from-[#5A9A85] hover:to-[#4A8A75] text-white shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Saving...
                </>
              ) : success ? (
                <>
                  <CheckCircle2 size={16} className="mr-2" />
                  Saved!
                </>
              ) : (
                <>
                  <Save size={16} className="mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </div>

      </DialogContent>
    </Dialog>
  );
};

export default EditInfo;
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { QRCodeCanvas } from "qrcode.react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";
import {
  UserPlus,
  Save,
  Download,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  User,
  Briefcase,
  Heart,
  CreditCard,
  Home,
  FileText,
  Phone,
  Users,
  QrCode,
  Sparkles,
  Clock,
} from "lucide-react";

export default function RegisterEmployee() {
  const navigate = useNavigate();
  const qrWrapperRef = useRef(null);

  const [form, setForm] = useState({
    employeeName:  "",
    employeeId:    "",
    position:      "",
    philhealth:    "",
    sss:           "",
    pagibig:       "",
    tin:           "",
    contactPerson: "",
    contactNumber: "",
  });

  const [errors,             setErrors]             = useState({});
  const [employee,           setEmployee]           = useState(null);
  const [loading,            setLoading]            = useState(false);
  const [tokenExpiryWarning, setTokenExpiryWarning] = useState(false);
  const [isEmployeeIdLocked, setIsEmployeeIdLocked] = useState(false);
  // ── NEW: stores the permanent qr_token returned after save ────────────────
  const [qrToken,            setQrToken]            = useState(null);

  const api = import.meta.env.VITE_API_BASE_URL;
  const url = import.meta.env.VITE_FRONTEND_BASE_URL;

  // ── Title Case helper ──────────────────────────────────────────────────────
  const toTitleCase = (str) =>
    str.replace(/\b\w/g, (char) => char.toUpperCase());

  // ── Load data from registration token on mount ─────────────────────────────
  useEffect(() => {
    const tokenData = sessionStorage.getItem("registrationToken");
    if (tokenData) {
      try {
        const parsed = JSON.parse(tokenData);
        const emp = parsed.employeeData;
        if (emp) {
          setForm((prev) => ({
            ...prev,
            employeeId:    emp.employeeId    || "",
            employeeName:  toTitleCase(emp.employeeName  || ""),
            position:      toTitleCase(emp.position      || ""),
            sss:           emp.sss           || "",
            philhealth:    emp.philhealth    || "",
            pagibig:       emp.pagibig       || "",
            tin:           emp.tin           || "",
            contactPerson: toTitleCase(emp.contactPerson || ""),
            contactNumber: (emp.contactNumber || "").replace(/\s+/g, ""),
          }));
          if (emp.employeeId) setIsEmployeeIdLocked(true);
        }
      } catch (error) {
        console.error("Error loading token data:", error);
      }
    }
  }, []);

  // ── Session expiry countdown ───────────────────────────────────────────────
  useEffect(() => {
    let hasAlerted10s = false;
    const checkTokenExpiry = setInterval(() => {
      const tokenData = sessionStorage.getItem("registrationToken");
      if (tokenData) {
        try {
          const parsed      = JSON.parse(tokenData);
          const timeLeft    = parsed.expiresAt - Date.now();
          const secondsLeft = Math.ceil(timeLeft / 1000);
          console.log(`⏳ Token expires in: ${secondsLeft}s`);

          if (secondsLeft === 10 && !hasAlerted10s) {
            hasAlerted10s = true;
            alert("⚠️ Your session will expire in 10 seconds!");
          }
          if (timeLeft < 2 * 60 * 1000 && timeLeft > 0) {
            setTokenExpiryWarning(true);
          }
          if (timeLeft <= 0) {
            console.log("❌ Token expired");
            sessionStorage.removeItem("registrationToken");
            alert("Your session has expired. Please verify again.");
            navigate("/verify");
          }
        } catch (error) {
          console.error("Token validation error:", error);
        }
      }
    }, 1000);
    return () => clearInterval(checkTokenExpiry);
  }, [navigate]);

  // ── Field config ───────────────────────────────────────────────────────────
  const fieldConfig = {
    employeeName:  { placeholder: "Enter full employee name",         icon: User,       label: "Employee Name",  color: "blue",   format: "Letters, spaces, and . ' - allowed",  maxLength: 100 },
    employeeId:    { placeholder: "Ex: EMP-001",                      icon: FileText,   label: "Employee ID",    color: "purple", format: "Format: XXXXXX-####-###",             maxLength: 15  },
    position:      { placeholder: "Ex: Driver, Helper, Coordinator",  icon: Briefcase,  label: "Position",       color: "green",  format: "Letters, spaces, and . ' - allowed",  maxLength: 50  },
    philhealth:    { placeholder: "##-#########-#",                   icon: Heart,      label: "PhilHealth",     color: "red",    format: "Format: 12-345678901-2 (14 digits)",  maxLength: 14  },
    sss:           { placeholder: "##-#######-#",                     icon: CreditCard, label: "SSS",            color: "yellow", format: "Format: 12-3456789-0 (10 digits)",    maxLength: 12  },
    pagibig:       { placeholder: "####-####-####",                   icon: Home,       label: "Pag-IBIG",       color: "orange", format: "Format: 1234-5678-9012 (12 digits)",  maxLength: 14  },
    tin:           { placeholder: "###-###-###-###",                  icon: FileText,   label: "TIN",            color: "indigo", format: "Format: 123-456-789-000 (12 digits)", maxLength: 15  },
    contactPerson: { placeholder: "Emergency contact name",            icon: Users,      label: "Contact Person", color: "pink",   format: "Letters, spaces, and . ' - allowed",  maxLength: 100 },
    contactNumber: { placeholder: "09#########",                      icon: Phone,      label: "Contact Number", color: "teal",   format: "Format: 09XXXXXXXXX (11 digits)",     maxLength: 11  },
  };

  // ── Formatters ─────────────────────────────────────────────────────────────
  const formatPhilHealth = (value) => {
    const n = value.replace(/\D/g, "");
    if (n.length <= 2)  return n;
    if (n.length <= 11) return `${n.slice(0, 2)}-${n.slice(2)}`;
    return `${n.slice(0, 2)}-${n.slice(2, 11)}-${n.slice(11, 12)}`;
  };
  const formatSSS = (value) => {
    const n = value.replace(/\D/g, "");
    if (n.length <= 2) return n;
    if (n.length <= 9) return `${n.slice(0, 2)}-${n.slice(2)}`;
    return `${n.slice(0, 2)}-${n.slice(2, 9)}-${n.slice(9, 10)}`;
  };
  const formatPagibig = (value) => {
    const n = value.replace(/\D/g, "");
    if (n.length <= 4) return n;
    if (n.length <= 8) return `${n.slice(0, 4)}-${n.slice(4)}`;
    return `${n.slice(0, 4)}-${n.slice(4, 8)}-${n.slice(8, 12)}`;
  };
  const formatTIN = (value) => {
    const n = value.replace(/\D/g, "");
    if (n.length <= 3) return n;
    if (n.length <= 6) return `${n.slice(0, 3)}-${n.slice(3)}`;
    if (n.length <= 9) return `${n.slice(0, 3)}-${n.slice(3, 6)}-${n.slice(6)}`;
    return `${n.slice(0, 3)}-${n.slice(3, 6)}-${n.slice(6, 9)}-${n.slice(9, 12)}`;
  };
  const formatContactNumber = (value) =>
    value.replace(/\D/g, "").slice(0, 11);

  // ── Validation ─────────────────────────────────────────────────────────────
  const validateField = (name, value) => {
    switch (name) {
      case "employeeName":
      case "contactPerson":
        if (!/^[A-Za-z.\s'-]+$/.test(value) && value !== "")
          return "Only letters, spaces, and . ' - are allowed";
        break;
      case "position":
        if (!/^[A-Za-z.\s]+$/.test(value) && value !== "")
          return "Only letters, spaces, and dots allowed";
        break;
      case "sss":
        if (value.replace(/\D/g, "").length !== 10)
          return "SSS must be 10 digits (XX-XXXXXXX-X)";
        break;
      case "pagibig":
        if (value.replace(/\D/g, "").length !== 12)
          return "Pag-IBIG must be 12 digits (XXXX-XXXX-XXXX)";
        break;
      case "tin":
        if (value.replace(/\D/g, "").length !== 12)
          return "TIN must be 12 digits (XXX-XXX-XXX-XXX)";
        break;
      case "contactNumber":
        if (!/^09\d{9}$/.test(value))
          return "Must start with 09 and be 11 digits total";
        break;
      case "employeeId":
        if (value.trim() === "") return "Employee ID is required";
        break;
      default:
        break;
    }
    if (value.trim() === "") return "This field is required";
    return "";
  };

  // ── handleChange with title case ───────────────────────────────────────────
  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "employeeId" && isEmployeeIdLocked) return;

    let formattedValue = value;
    switch (name) {
      case "employeeName":
      case "contactPerson":
        formattedValue = toTitleCase(value.replace(/[^A-Za-z.\s'-]/g, ""));
        break;
      case "position":
        formattedValue = toTitleCase(value.replace(/[^A-Za-z.\s]/g, ""));
        break;
      case "philhealth":     formattedValue = formatPhilHealth(value);     break;
      case "sss":            formattedValue = formatSSS(value);            break;
      case "pagibig":        formattedValue = formatPagibig(value);        break;
      case "tin":            formattedValue = formatTIN(value);            break;
      case "contactNumber":  formattedValue = formatContactNumber(value);  break;
      default: break;
    }

    setForm((prev) => ({ ...prev, [name]: formattedValue }));
    const error = validateField(name, formattedValue);
    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  const validateForm = () => {
    const newErrors = {};
    Object.keys(form).forEach((key) => {
      const error = validateField(key, form[key]);
      if (error) newErrors[key] = error;
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ── QR helpers ─────────────────────────────────────────────────────────────
  const waitForCanvas = async (timeout = 2000) => {
    const start = Date.now();
    while (Date.now() - start < timeout) {
      const wrapper = qrWrapperRef.current;
      if (wrapper) {
        const canvas = wrapper.querySelector("canvas");
        if (canvas) return canvas;
      }
      await new Promise((r) => setTimeout(r, 50));
    }
    return null;
  };

  const getQRBase64 = async () => {
    const canvas = await waitForCanvas(2000);
    if (!canvas) return null;
    return canvas.toDataURL("image/png");
  };

  // ── Submit ─────────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!validateForm()) return;
    setLoading(true);
    try {
      // The hidden QR canvas still encodes a placeholder URL using employeeId.
      // The server will generate the real qr_token and return it.
      // After save, the success-screen QR will re-render with the token URL.
      const qrBase64 = await getQRBase64();
      if (!qrBase64) {
        alert("Failed to capture QR. Make sure the canvas is rendered.");
        setLoading(false);
        return;
      }

      const payload = { ...form, qrImageBase64: qrBase64 };
      const res  = await fetch(`${api}/save-employee`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Server error");

      sessionStorage.removeItem("registrationToken");

      // ── NEW: capture the permanent qr_token from the server response ───────
      setQrToken(data.qr_token);
      setEmployee(data);
    } catch (err) {
      console.error("Save error:", err);
      alert("Save failed: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const downloadQR = () => {
    const canvas = document.getElementById("qr-gen-visible");
    if (!canvas) return alert("QR canvas not found to download.");
    const pngUrl = canvas.toDataURL("image/png");
    const link   = document.createElement("a");
    link.href     = pngUrl;
    link.download = `employee-${employee.employee_id}-qr.png`;
    link.click();
  };

  const isFormComplete =
    Object.values(form).every((v) => v.trim() !== "") &&
    Object.values(errors).every((e) => !e);

  const filledFields = Object.values(form).filter((v) => v.trim() !== "").length;
  const progress     = (filledFields / Object.keys(form).length) * 100;

  // ── Hidden pre-save QR still uses employeeId (token doesn't exist yet) ─────
  const hiddenQrValue = form.employeeId
    ? `${url}/employee/${form.employeeId.toUpperCase()}`
    : `${url}/employee/temp`;

  // ── NEW: success QR encodes the permanent token-based URL ──────────────────
  // Falls back to employee ID route if server didn't return a token (safety net)
  const successQrValue = qrToken
    ? `${url}/employee/token/${qrToken}`
    : employee
    ? `${url}/employee/${employee.employee_id.toUpperCase()}`
    : "";

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 p-6">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-72 h-72 bg-green-200 rounded-full filter blur-3xl opacity-20" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-blue-200 rounded-full filter blur-3xl opacity-20" />
      </div>

      <div className="max-w-5xl mx-auto relative z-10">
        <AnimatePresence mode="wait">
          {!employee ? (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
            >
              {/* Header */}
              <div className="text-center mb-8">
                <div className="inline-flex items-center gap-2 bg-white/90 backdrop-blur-sm px-5 py-2.5 rounded-full mb-4 shadow-lg border border-green-200">
                  <UserPlus className="h-5 w-5 text-green-600" />
                  <span className="text-sm font-bold text-green-700 tracking-wide">
                    EMPLOYEE REGISTRATION
                  </span>
                </div>
                <h1 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-3">
                  Register New Employee
                </h1>
                <p className="text-gray-600 text-lg">
                  Fill in the employee details to generate their ID and QR code
                </p>
              </div>

              {/* Token Expiry Warning */}
              <AnimatePresence>
                {tokenExpiryWarning && (
                  <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="mb-6"
                  >
                    <Card className="border-2 border-yellow-300 bg-yellow-50">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="flex-shrink-0 w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                            <Clock className="h-5 w-5 text-yellow-600" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-yellow-800">
                              Session Expiring Soon
                            </p>
                            <p className="text-sm text-yellow-700 mt-1">
                              Your session will expire in less than 2 minutes. Please complete registration quickly.
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Progress bar */}
              <Card className="mb-6 border-2 border-green-100 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-gray-700">Form Progress</span>
                    <span className="text-sm font-bold text-green-600">
                      {filledFields} / {Object.keys(form).length}
                    </span>
                  </div>
                  <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-green-600 to-emerald-600"
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Form */}
              <Card className="border-2 border-green-200 shadow-2xl">
                <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b border-green-200">
                  <CardTitle className="text-2xl text-gray-800 flex items-center gap-2">
                    <Sparkles className="h-6 w-6 text-green-600" />
                    Employee Information
                  </CardTitle>
                  <CardDescription className="text-gray-600">
                    Please provide accurate information for ID generation
                  </CardDescription>
                </CardHeader>

                <CardContent className="p-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {Object.keys(form).map((key, index) => {
                      const config   = fieldConfig[key];
                      const Icon     = config.icon;
                      const hasError = errors[key];
                      const isFilled = form[key].trim() !== "";
                      const isLocked = key === "employeeId" && isEmployeeIdLocked;

                      return (
                        <motion.div
                          key={key}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.05 }}
                          className={key === "employeeName" ? "md:col-span-2" : ""}
                        >
                          <Label className="text-gray-700 font-semibold flex items-center gap-2 mb-2">
                            <Icon className={`h-4 w-4 text-${config.color}-600`} />
                            {config.label}
                            {isLocked ? (
                              <span className="ml-auto flex items-center gap-1 text-xs font-medium text-purple-600 bg-purple-50 border border-purple-200 px-2 py-0.5 rounded-full">
                                Verified Employee ID
                              </span>
                            ) : (
                              isFilled && !hasError && (
                                <CheckCircle className="h-4 w-4 text-green-600 ml-auto" />
                              )
                            )}
                          </Label>

                          <div className="relative">
                            <Input
                              name={key}
                              placeholder={config.placeholder}
                              value={form[key]}
                              onChange={handleChange}
                              maxLength={config.maxLength}
                              readOnly={isLocked}
                              className={`h-12 pl-4 pr-4 border-2 rounded-xl transition-all ${
                                isLocked
                                  ? "border-purple-200 bg-purple-50 text-purple-800 cursor-not-allowed select-none focus:border-purple-200 focus:ring-0"
                                  : hasError
                                  ? "border-red-400 focus:border-red-500 bg-red-50"
                                  : isFilled
                                  ? "border-green-400 focus:border-green-500 bg-green-50"
                                  : "border-gray-200 focus:border-green-500"
                              }`}
                            />
                          </div>

                          <p className="text-xs mt-1 flex items-center gap-1">
                            {isLocked ? (
                              <span className="text-purple-500">
                                This ID was assigned by the system and cannot be changed
                              </span>
                            ) : (
                              <span className="text-gray-500">{config.format}</span>
                            )}
                          </p>

                          <AnimatePresence>
                            {hasError && !isLocked && (
                              <motion.div
                                initial={{ opacity: 0, y: -5 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -5 }}
                                className="flex items-center gap-1 mt-1"
                              >
                                <AlertCircle className="h-4 w-4 text-red-500" />
                                <p className="text-sm text-red-600 font-medium">{errors[key]}</p>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </motion.div>
                      );
                    })}
                  </div>

                  {/* Hidden QR canvas — uses employeeId placeholder before save */}
                  <div style={{ position: "absolute", left: -9999, top: 0 }}>
                    <div ref={qrWrapperRef}>
                      <QRCodeCanvas
                        value={hiddenQrValue}
                        size={256}
                        includeMargin={false}
                      />
                    </div>
                  </div>

                  {/* Submit button */}
                  <motion.div
                    whileHover={{ scale: isFormComplete ? 1.02 : 1 }}
                    whileTap={{ scale: isFormComplete ? 0.98 : 1 }}
                  >
                    <Button
                      onClick={handleSubmit}
                      className={`mt-8 w-full h-14 text-lg font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-3 ${
                        !isFormComplete
                          ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                          : "bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white hover:shadow-xl"
                      }`}
                      disabled={!isFormComplete || loading}
                    >
                      {loading ? (
                        <>
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            className="w-6 h-6 border-2 border-white border-t-transparent rounded-full"
                          />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="h-6 w-6" />
                          Save & Generate QR Code
                        </>
                      )}
                    </Button>
                  </motion.div>
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            /* ── Success screen ── */
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="text-center"
            >
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="mb-8"
              >
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-green-600 to-emerald-600 rounded-full mb-4 shadow-lg">
                  <CheckCircle className="h-10 w-10 text-white" strokeWidth={3} />
                </div>
                <h2 className="text-4xl font-bold text-gray-800 mb-2">
                  Registration Complete!
                </h2>
                <p className="text-gray-600 text-lg">
                  Employee QR code has been generated successfully
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <Card className="inline-block border-2 border-green-200 shadow-2xl">
                  <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50">
                    <CardTitle className="flex items-center justify-center gap-2 text-gray-800">
                      <QrCode className="h-6 w-6 text-green-600" />
                      Employee QR Code
                    </CardTitle>
                    <CardDescription>ID: {employee.employee_id}</CardDescription>
                  </CardHeader>
                  <CardContent className="p-8 bg-white">
                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-2xl inline-block">
                      {/* ── NEW: QR now encodes the permanent token URL ─────── */}
                      {successQrValue && (
                        <QRCodeCanvas
                          id="qr-gen-visible"
                          value={successQrValue}
                          size={280}
                          level="H"
                        />
                      )}
                    </div>
                    {/* ── Show the token URL for transparency ────────────────── */}
                    {qrToken && (
                      <p className="mt-3 text-xs text-gray-400 font-mono break-all">
                        {successQrValue}
                      </p>
                    )}
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="flex flex-col sm:flex-row gap-4 justify-center mt-8"
              >
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    onClick={downloadQR}
                    className="px-8 py-6 text-lg font-bold bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-xl shadow-lg hover:shadow-xl flex items-center gap-3"
                  >
                    <Download className="h-5 w-5" />
                    Download QR Code
                  </Button>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    onClick={() => window.location.reload()}
                    variant="outline"
                    className="px-8 py-6 text-lg font-bold border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50 rounded-xl flex items-center gap-3"
                  >
                    <RefreshCw className="h-5 w-5" />
                    Register Another
                  </Button>
                </motion.div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
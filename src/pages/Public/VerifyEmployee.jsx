import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
    AlertCircle,
    CheckCircle,
    ShieldCheck,
    User,
    Briefcase,
    IdCard,
    Lock,
    Zap,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import verifyImg from "../../assets/FAQ.png";

export default function VerifyEmployeeModal({ open, onOpenChange }) {
    const [employeeId, setEmployeeId] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [employeeData, setEmployeeData] = useState(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const api = import.meta.env.VITE_API_BASE_URL;

    const handleVerify = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");
        setEmployeeData(null);
        setLoading(true);
        try {
            const res = await fetch(`${api}/api/verify-employee/${employeeId.trim()}`);
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Verification failed");
            if (!data.employeeId || !data.employeeName) throw new Error("Invalid employee data received");

            const looksEncrypted = (val) => typeof val === "string" && val.length > 50;
            if (looksEncrypted(data.sss) || looksEncrypted(data.philhealth) || looksEncrypted(data.pagibig) || looksEncrypted(data.tin)) {
                throw new Error("Employee data is not decrypted. Please contact administrator.");
            }

            setEmployeeData(data);
            setSuccess("Employee verified successfully!");

            const registrationToken = {
                token: `REG-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                employeeData: {
                    employeeId: data.employeeId,
                    employeeName: data.employeeName,
                    firstName: data.firstName,
                    middleInitial: data.middleInitial,
                    lastName: data.lastName,
                    position: data.position,
                    sss: data.sss,
                    philhealth: data.philhealth,
                    pagibig: data.pagibig,
                    tin: data.tin,
                    contactPerson: data.contactPerson,
                    contactNumber: data.contactNumber,
                },
                expiresAt: Date.now() + 10 * 60 * 1000,
                createdAt: Date.now(),
            };
            sessionStorage.setItem("registrationToken", JSON.stringify(registrationToken));

            setTimeout(() => {
                onOpenChange(false);
                navigate("/Register");
                setEmployeeId("");
                setEmployeeData(null);
                setSuccess("");
            }, 1800);
        } catch (err) {
            setError(err.message || "Verification failed");
        } finally {
            setLoading(false);
        }
    };

    const handleOpenChange = (isOpen) => {
        if (!isOpen) {
            setEmployeeId("");
            setError("");
            setSuccess("");
            setEmployeeData(null);
        }
        onOpenChange(isOpen);
    };

    const features = [
        { icon: Zap, label: "Instant Verification" },
        { icon: Lock, label: "Data Encryption" },
        { icon: ShieldCheck, label: "Secure Process" },
        { icon: CheckCircle, label: "Quick Access" },
    ];

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="max-w-[95vw] md:max-w-4xl lg:max-w-5xl p-0 overflow-hidden border-0 shadow-2xl [&>button]:hidden rounded-2xl">
                <div className="grid grid-cols-1 md:grid-cols-2 min-h-[580px]">

                    {/* LEFT — Form Panel */}
                    <div className="relative flex flex-col justify-center p-8 md:p-12 bg-white overflow-hidden">
                        {/* Background dot pattern */}
                        <div
                            className="absolute inset-0 opacity-[0.03]"
                            style={{
                                backgroundImage: `radial-gradient(circle at 1px 1px, #059669 1px, transparent 0)`,
                                backgroundSize: "32px 32px",
                            }}
                        />
                        {/* Glow blobs */}
                        <div className="absolute -top-20 -left-20 w-64 h-64 bg-emerald-400 rounded-full blur-3xl opacity-10 pointer-events-none" />
                        <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-teal-300 rounded-full blur-3xl opacity-10 pointer-events-none" />

                        <div className="relative z-10">
                            <AnimatePresence mode="wait">
                                {success && employeeData ? (
                                    /* ── Success State ── */
                                    <motion.div
                                        key="success"
                                        initial={{ opacity: 0, scale: 0.92 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="flex flex-col items-center text-center gap-5 py-6"
                                    >
                                        <motion.div
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
                                            className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-200"
                                        >
                                            <CheckCircle className="h-10 w-10 text-white" strokeWidth={2.5} />
                                        </motion.div>

                                        <div>
                                            <h2 className="text-2xl font-bold text-gray-800">Verified!</h2>
                                            <p className="text-gray-500 text-sm mt-1">Identity confirmed successfully</p>
                                        </div>

                                        {/* Employee card */}
                                        <motion.div
                                            initial={{ opacity: 0, y: 12 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.25 }}
                                            className="w-full bg-gradient-to-br from-gray-50 to-emerald-50 border border-emerald-100 rounded-2xl p-4 space-y-3 text-left"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center flex-shrink-0">
                                                    <User className="w-5 h-5 text-emerald-600" />
                                                </div>
                                                <div>
                                                    <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">Employee Name</p>
                                                    <p className="text-sm font-bold text-gray-800">{employeeData.employeeName}</p>
                                                </div>
                                            </div>
                                            <div className="h-px bg-emerald-100" />
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
                                                    <Briefcase className="w-5 h-5 text-blue-500" />
                                                </div>
                                                <div>
                                                    <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">Position</p>
                                                    <p className="text-sm font-bold text-gray-800">{employeeData.position || "Not Assigned"}</p>
                                                </div>
                                            </div>
                                        </motion.div>

                                        <p className="text-xs text-gray-400 animate-pulse">Redirecting to registration...</p>
                                    </motion.div>
                                ) : (
                                    /* ── Input Form ── */
                                    <motion.div
                                        key="form"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                    >
                                        {/* Header */}
                                        <motion.div
                                            initial={{ opacity: 0, y: -16 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.4 }}
                                            className="mb-8"
                                        >
                                            <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-xl shadow-lg shadow-emerald-200 mb-4">
                                                <ShieldCheck className="h-7 w-7 text-white" strokeWidth={2.5} />
                                            </div>
                                            <DialogHeader>
                                                <DialogTitle className="text-3xl font-extrabold tracking-tight text-gray-900">
                                                    Verify Employee
                                                </DialogTitle>
                                                <p className="text-gray-500 mt-1 text-sm">
                                                    Enter your employee ID to verify and continue registration
                                                </p>
                                            </DialogHeader>
                                        </motion.div>

                                        {/* Form */}
                                        <motion.form
                                            initial={{ opacity: 0, y: 16 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.4, delay: 0.15 }}
                                            onSubmit={handleVerify}
                                            className="space-y-5"
                                        >
                                            {/* Employee ID input */}
                                            <div className="space-y-1.5">
                                                <Label htmlFor="employeeId" className="text-sm font-semibold text-gray-700">
                                                    Employee ID
                                                </Label>
                                                <div className="relative group">
                                                    <Input
                                                        id="employeeId"
                                                        type="text"
                                                        value={employeeId}
                                                        onChange={(e) => setEmployeeId(e.target.value)}
                                                        placeholder="e.g., EMP-001"
                                                        className="pl-10 h-11 border-2 border-gray-100 bg-gray-50 focus:bg-white focus:border-emerald-500 rounded-xl transition-all duration-200 placeholder:text-gray-400"
                                                        required
                                                        autoFocus
                                                        disabled={loading}
                                                    />
                                                    <IdCard className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-emerald-500 transition-colors" />
                                                </div>
                                            </div>

                                            {/* Error */}
                                            <AnimatePresence>
                                                {error && (
                                                    <motion.div
                                                        initial={{ opacity: 0, y: -8, height: 0 }}
                                                        animate={{ opacity: 1, y: 0, height: "auto" }}
                                                        exit={{ opacity: 0, y: -8, height: 0 }}
                                                        className="flex items-start gap-2.5 p-3 bg-red-50 border border-red-200 rounded-xl overflow-hidden"
                                                    >
                                                        <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0 mt-0.5" />
                                                        <div>
                                                            <p className="text-xs font-semibold text-red-800">Verification Failed</p>
                                                            <p className="text-xs text-red-600 mt-0.5">{error}</p>
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>

                                            {/* Submit */}
                                            <Button
                                                type="submit"
                                                disabled={!employeeId.trim() || loading}
                                                className="w-full h-11 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold rounded-xl shadow-md shadow-emerald-200 hover:shadow-lg hover:shadow-emerald-300 transition-all duration-200 flex items-center justify-center gap-2"
                                            >
                                                {loading ? (
                                                    <>
                                                        <motion.div
                                                            animate={{ rotate: 360 }}
                                                            transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                                                            className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                                                        />
                                                        Verifying...
                                                    </>
                                                ) : (
                                                    <>
                                                        <ShieldCheck className="h-4 w-4" />
                                                        Verify Employee
                                                    </>
                                                )}
                                            </Button>

                                            <div className="flex items-center justify-center gap-2 pt-1">
                                                <Lock className="h-3 w-3 text-gray-300" />
                                                <p className="text-xs text-gray-400">
                                                    Secure verification • All data encrypted
                                                </p>
                                            </div>
                                        </motion.form>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>

                    {/* RIGHT — Visual Panel */}
                    <div className="hidden md:block relative overflow-hidden bg-gray-900">
                        <img
                            src={verifyImg}
                            alt="Verification Visual"
                            className="absolute inset-0 h-full w-full object-cover opacity-40"
                        />
                        {/* Layered gradient */}
                        <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/80 via-teal-800/70 to-cyan-900/80" />

                        {/* Decorative rings */}
                        <div className="absolute -top-16 -right-16 w-64 h-64 border border-white/10 rounded-full" />
                        <div className="absolute -top-8 -right-8 w-48 h-48 border border-white/10 rounded-full" />
                        <div className="absolute -bottom-16 -left-16 w-64 h-64 border border-white/10 rounded-full" />

                        <div className="relative z-10 p-12 flex flex-col justify-center h-full">
                            <motion.div
                                initial={{ opacity: 0, x: 40 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.6, delay: 0.3 }}
                            >
                                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-xs text-white/80 mb-6">
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                    ARROWGO Verification System
                                </div>

                                <h3 className="text-4xl font-black text-white mb-3 leading-tight">
                                    Secure <br />Verification
                                </h3>
                                <p className="text-white/60 text-sm leading-relaxed mb-8 max-w-xs">
                                    Your employee data is protected with enterprise-grade encryption. Verify your identity to proceed safely.
                                </p>

                                <div className="space-y-3">
                                    {features.map((feature, index) => (
                                        <motion.div
                                            key={feature.label}
                                            initial={{ opacity: 0, x: 30 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ duration: 0.4, delay: 0.5 + index * 0.1 }}
                                            className="flex items-center gap-3"
                                        >
                                            <div className="flex-shrink-0 w-7 h-7 bg-emerald-500/20 border border-emerald-400/30 rounded-lg flex items-center justify-center">
                                                <feature.icon className="h-4 w-4 text-emerald-400" strokeWidth={2.5} />
                                            </div>
                                            <span className="text-white/75 text-sm font-medium">{feature.label}</span>
                                        </motion.div>
                                    ))}
                                </div>

                                {/* Info notice */}
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 1 }}
                                    className="mt-10 flex items-start gap-3 p-3 bg-white/5 border border-white/10 rounded-xl"
                                >
                                    <IdCard className="h-4 w-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                                    <p className="text-white/50 text-xs leading-relaxed">
                                        Your employee ID is required to access the registration portal.
                                    </p>
                                </motion.div>
                            </motion.div>
                        </div>
                    </div>

                </div>
            </DialogContent>
        </Dialog>
    );
}
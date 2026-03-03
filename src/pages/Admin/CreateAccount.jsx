import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import api from "../../lib/api";
import {
  UserPlus, Lock, User, Shield, CheckCircle2, AlertCircle,
  Eye, EyeOff, Key, ShieldCheck, Crown, Info, Sparkles,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function CreateAdminForm() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("admin");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);

  const calculatePasswordStrength = (pwd) => {
    let s = 0;
    if (pwd.length >= 8) s++;
    if (pwd.length >= 12) s++;
    if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) s++;
    if (/\d/.test(pwd)) s++;
    if (/[^a-zA-Z0-9]/.test(pwd)) s++;
    return s;
  };

  const handlePasswordChange = (value) => {
    setPassword(value);
    setPasswordStrength(calculatePasswordStrength(value));
  };

  const strengthMeta = () => {
    if (passwordStrength === 0) return { label: "", color: "", bar: "", width: "0%" };
    if (passwordStrength <= 2) return { label: "Weak",   color: "text-red-500 dark:text-red-400",     bar: "bg-red-500",     width: "30%" };
    if (passwordStrength <= 3) return { label: "Fair",   color: "text-amber-500 dark:text-amber-400", bar: "bg-amber-500",   width: "55%" };
    if (passwordStrength <= 4) return { label: "Good",   color: "text-blue-500 dark:text-blue-400",   bar: "bg-blue-500",    width: "80%" };
    return                            { label: "Strong", color: "text-emerald-500 dark:text-emerald-400", bar: "bg-emerald-500", width: "100%" };
  };

  const checks = [
    { label: "8+ characters", pass: password.length >= 8 },
    { label: "Mixed case",    pass: /[a-z]/.test(password) && /[A-Z]/.test(password) },
    { label: "Numbers",       pass: /\d/.test(password) },
    { label: "Special chars", pass: /[^a-zA-Z0-9]/.test(password) },
  ];

  const isFormValid = username.length >= 3 && password.length >= 8 && confirmPassword === password;

  const handleRegister = async (e) => {
    e.preventDefault();
    setError(""); setSuccess("");
    if (password.length < 8) { setError("Password must be at least 8 characters long"); return; }
    if (password !== confirmPassword) { setError("Passwords do not match"); return; }
    setIsLoading(true);
    try {
      const res = await api.post("/api/auth/register", { username, password, role });
      setSuccess(res.data.message || "Administrator account created successfully!");
      setUsername(""); setPassword(""); setConfirmPassword(""); setRole("admin"); setPasswordStrength(0);
      setTimeout(() => setSuccess(""), 5000);
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const sm = strengthMeta();

  // Reusable input class builder
  const inputBase = "h-11 border-2 rounded-xl transition-all duration-200 placeholder:text-gray-400 dark:placeholder:text-gray-600 text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-gray-800/80 focus:bg-white dark:focus:bg-gray-900";
  const inputNeutral = "border-gray-200 dark:border-gray-700 focus:border-blue-400 dark:focus:border-blue-500";

  return (
    <div className="w-full max-w-5xl">

      {/* ── Header ── */}
      <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="mb-7">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-md shadow-blue-200 dark:shadow-blue-950">
            <UserPlus className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-black tracking-tight text-gray-900 dark:text-gray-50">Create Administrator</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">Add a new admin user to the system</p>
          </div>
        </div>
      </motion.div>

      {/* ── Feedback banners ── */}
      <AnimatePresence>
        {error && (
          <motion.div key="err" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="mb-5 overflow-hidden">
            <div className="flex items-center gap-2.5 p-3.5 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-xl">
              <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400 flex-shrink-0" />
              <p className="text-sm text-red-700 dark:text-red-300 font-medium">{error}</p>
            </div>
          </motion.div>
        )}
        {success && (
          <motion.div key="ok" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="mb-5 overflow-hidden">
            <div className="flex items-center gap-2.5 p-3.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
              <p className="text-sm text-emerald-700 dark:text-emerald-300 font-medium">{success}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Card ── */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.1 }}>
        <div className="rounded-2xl border border-gray-200 dark:border-gray-700/60 shadow-sm bg-white dark:bg-gray-900 overflow-hidden">

          {/* Card header strip */}
          <div className="px-7 py-5 border-b border-gray-100 dark:border-gray-700/60 bg-gray-50/60 dark:bg-gray-800/50 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-gray-800 dark:text-gray-100">Account Details</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Enter the credentials for the new administrator</p>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/30 border border-blue-100 dark:border-blue-800/60 rounded-full">
              <Info className="h-3.5 w-3.5 text-blue-500 dark:text-blue-400" />
              <span className="text-xs text-blue-600 dark:text-blue-300 font-medium">Access granted immediately after creation</span>
            </div>
          </div>

          <form onSubmit={handleRegister}>
            <div className="p-7 grid grid-cols-1 lg:grid-cols-2 gap-x-10">

              {/* ══ LEFT — Credentials ══ */}
              <div className="space-y-5">

                {/* Username */}
                <div className="space-y-1.5">
                  <Label htmlFor="username" className="text-sm font-semibold text-gray-700 dark:text-gray-300">Username</Label>
                  <div className="relative group">
                    <Input
                      id="username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="e.g. admin_john"
                      required disabled={isLoading}
                      className={`pl-10 ${inputBase} ${
                        username && username.length < 3 ? "border-amber-300 dark:border-amber-600 focus:border-amber-400 dark:focus:border-amber-500"
                        : username.length >= 3           ? "border-emerald-300 dark:border-emerald-600 focus:border-emerald-400 dark:focus:border-emerald-500"
                        : inputNeutral
                      }`}
                    />
                    <User className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 transition-colors pointer-events-none
                      ${username.length >= 3 ? "text-emerald-500 dark:text-emerald-400" : "text-gray-400 dark:text-gray-500 group-focus-within:text-blue-500 dark:group-focus-within:text-blue-400"}`} />
                    {username.length >= 3 && <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-500 dark:text-emerald-400 pointer-events-none" />}
                  </div>
                  <AnimatePresence mode="wait">
                    {username && username.length < 3
                      ? <motion.p key="a" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1"><AlertCircle className="w-3 h-3" />At least 3 characters required</motion.p>
                      : username.length >= 3
                      ? <motion.p key="b" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" />Username looks good</motion.p>
                      : <motion.p key="c" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-xs text-gray-400 dark:text-gray-500">Used to sign in to the system</motion.p>
                    }
                  </AnimatePresence>
                </div>

                {/* Password */}
                <div className="space-y-1.5">
                  <Label htmlFor="password" className="text-sm font-semibold text-gray-700 dark:text-gray-300">Password</Label>
                  <div className="relative group">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => handlePasswordChange(e.target.value)}
                      placeholder="Enter a secure password"
                      required disabled={isLoading}
                      className={`pl-10 pr-10 ${inputBase} ${inputNeutral}`}
                    />
                    <Key className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500 group-focus-within:text-blue-500 dark:group-focus-within:text-blue-400 transition-colors pointer-events-none" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} disabled={isLoading}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <AnimatePresence>
                    {password && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="space-y-2 overflow-hidden">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }} animate={{ width: sm.width }}
                              transition={{ duration: 0.4, ease: "easeOut" }}
                              className={`h-full rounded-full ${sm.bar}`}
                            />
                          </div>
                          <span className={`text-xs font-semibold w-12 ${sm.color}`}>{sm.label}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                          {checks.map((c) => (
                            <span key={c.label} className={`text-xs flex items-center gap-1.5 transition-colors ${c.pass ? "text-emerald-600 dark:text-emerald-400" : "text-gray-400 dark:text-gray-500"}`}>
                              <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center flex-shrink-0 ${c.pass ? "bg-emerald-100 dark:bg-emerald-900/50" : "bg-gray-100 dark:bg-gray-800"}`}>
                                {c.pass ? <CheckCircle2 className="w-2.5 h-2.5" /> : <span className="w-1 h-1 rounded-full bg-gray-400 dark:bg-gray-600 block" />}
                              </span>
                              {c.label}
                            </span>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Confirm Password */}
                <div className="space-y-1.5">
                  <Label htmlFor="confirmPassword" className="text-sm font-semibold text-gray-700 dark:text-gray-300">Confirm Password</Label>
                  <div className="relative group">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter password"
                      required disabled={isLoading}
                      className={`pl-10 pr-10 ${inputBase} ${
                        confirmPassword && password !== confirmPassword ? "border-red-300 dark:border-red-700 focus:border-red-400 dark:focus:border-red-500"
                        : confirmPassword && password === confirmPassword ? "border-emerald-300 dark:border-emerald-600 focus:border-emerald-400 dark:focus:border-emerald-500"
                        : inputNeutral
                      }`}
                    />
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500 group-focus-within:text-blue-500 dark:group-focus-within:text-blue-400 transition-colors pointer-events-none" />
                    <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} disabled={isLoading}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <AnimatePresence mode="wait">
                    {confirmPassword && (
                      password === confirmPassword
                        ? <motion.p key="m"  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" />Passwords match</motion.p>
                        : <motion.p key="nm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-xs text-red-500 dark:text-red-400 flex items-center gap-1"><AlertCircle className="w-3 h-3" />Passwords do not match</motion.p>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* ══ RIGHT — Role + Submit ══ */}
              <div className="flex flex-col gap-5 mt-5 lg:mt-0">

                {/* Role selector */}
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                    <Shield className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    Administrator Role
                  </Label>
                  <div className="space-y-2.5">

                    {/* Admin card */}
                    <motion.button type="button" whileTap={{ scale: 0.985 }} onClick={() => setRole("admin")} disabled={isLoading}
                      className={`w-full p-4 rounded-xl border-2 text-left transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed
                        ${role === "admin"
                          ? "border-blue-400 dark:border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-sm shadow-blue-100 dark:shadow-none"
                          : "border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/80 hover:border-gray-300 dark:hover:border-gray-600 hover:bg-white dark:hover:bg-gray-800"
                        }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors
                          ${role === "admin" ? "bg-blue-100 dark:bg-blue-900/50" : "bg-gray-100 dark:bg-gray-700"}`}>
                          <ShieldCheck className={`w-5 h-5 transition-colors ${role === "admin" ? "text-blue-600 dark:text-blue-400" : "text-gray-400 dark:text-gray-500"}`} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span className={`text-sm font-bold ${role === "admin" ? "text-blue-800 dark:text-blue-300" : "text-gray-700 dark:text-gray-300"}`}>Admin</span>
                            <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all ${role === "admin" ? "border-blue-500 bg-blue-500" : "border-gray-300 dark:border-gray-600"}`}>
                              {role === "admin" && <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-1.5 h-1.5 rounded-full bg-white" />}
                            </div>
                          </div>
                          <p className={`text-xs mt-0.5 ${role === "admin" ? "text-blue-600 dark:text-blue-400" : "text-gray-400 dark:text-gray-500"}`}>
                            Standard access for day-to-day operations
                          </p>
                        </div>
                      </div>
                    </motion.button>

                    {/* Super Admin card */}
                    <motion.button type="button" whileTap={{ scale: 0.985 }} onClick={() => setRole("superadmin")} disabled={isLoading}
                      className={`w-full p-4 rounded-xl border-2 text-left transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed
                        ${role === "superadmin"
                          ? "border-purple-400 dark:border-purple-500 bg-purple-50 dark:bg-purple-900/20 shadow-sm shadow-purple-100 dark:shadow-none"
                          : "border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/80 hover:border-gray-300 dark:hover:border-gray-600 hover:bg-white dark:hover:bg-gray-800"
                        }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors
                          ${role === "superadmin" ? "bg-purple-100 dark:bg-purple-900/50" : "bg-gray-100 dark:bg-gray-700"}`}>
                          <Crown className={`w-5 h-5 transition-colors ${role === "superadmin" ? "text-purple-600 dark:text-purple-400" : "text-gray-400 dark:text-gray-500"}`} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className={`text-sm font-bold ${role === "superadmin" ? "text-purple-800 dark:text-purple-300" : "text-gray-700 dark:text-gray-300"}`}>Super Admin</span>
                              <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold
                                ${role === "superadmin" ? "bg-purple-200 dark:bg-purple-800/60 text-purple-700 dark:text-purple-300" : "bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400"}`}>
                                ELEVATED
                              </span>
                            </div>
                            <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all ${role === "superadmin" ? "border-purple-500 bg-purple-500" : "border-gray-300 dark:border-gray-600"}`}>
                              {role === "superadmin" && <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-1.5 h-1.5 rounded-full bg-white" />}
                            </div>
                          </div>
                          <p className={`text-xs mt-0.5 ${role === "superadmin" ? "text-purple-600 dark:text-purple-400" : "text-gray-400 dark:text-gray-500"}`}>
                            Full system control with all privileges
                          </p>
                        </div>
                      </div>
                    </motion.button>
                  </div>
                </div>

                {/* Submit */}
                <div className="mt-auto">
                  <Button
                    type="submit"
                    disabled={isLoading || !isFormValid}
                    className={`w-full h-11 font-semibold rounded-xl transition-all duration-200 flex items-center justify-center gap-2
                      ${isFormValid && !isLoading
                        ? "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md shadow-blue-200 dark:shadow-blue-950 hover:shadow-lg"
                        : "bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600 border border-gray-200 dark:border-gray-700 cursor-not-allowed shadow-none"
                      }`}
                  >
                    {isLoading ? (
                      <>
                        <motion.div animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                          className="w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                        Creating Account...
                      </>
                    ) : (
                      <>
                        {isFormValid ? <Sparkles className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
                        Create Administrator
                      </>
                    )}
                  </Button>
                  <AnimatePresence>
                    {!isFormValid && (username || password || confirmPassword) && (
                      <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                        className="text-xs text-center text-gray-400 dark:text-gray-500 mt-2">
                        Complete all fields correctly to continue
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>

              </div>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
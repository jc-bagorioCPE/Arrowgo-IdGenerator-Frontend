import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

import {
  LogIn, User, Lock, Eye, EyeOff, Shield,
  AlertCircle, CheckCircle, MapPin, Wifi, 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import loginImg from "../../assets/login.png";

import api, { performLogout } from "../../lib/api";

const getTokenExpiry = (token) => {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.exp * 1000;
  } catch {
    return null;
  }
};

const scheduleAutoLogout = (token) => {
  const expiry = getTokenExpiry(token);
  if (!expiry) return () => { };
  const ms = expiry - Date.now();
  if (ms <= 0) {
    performLogout();
    return () => { };
  }
  console.log(`⏱ Token expires in ${Math.round(ms / 1000)}s — auto-logout scheduled`);
  const timer = setTimeout(() => {
    console.warn("⏰ Token expired — logging out");
    performLogout();
  }, ms);
  return () => clearTimeout(timer);
};

// Phase labels matching the 5-phase backend system
const TIER_LABELS = {
  1: "1 minute",
  2: "5 minutes",
  3: "15 minutes",
  4: "1 hour",
  5: "1 hour 30 minutes",
};

// What the NEXT phase lockout will be (shown as a warning)
const NEXT_TIER_LABELS = {
  1: "5 minutes",
  2: "15 minutes",
  3: "1 hour",
  4: "1 hour 30 minutes",
};

export default function LoginModal({ open, onOpenChange }) {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState(null);
  const [rateLimitInfo, setRateLimitInfo] = useState(null);
  // { expiresAt, remaining, tier }
  const [attemptsLeft, setAttemptsLeft] = useState(null);
  const [accountDisabled, setAccountDisabled] = useState(false);
  const timerCleanupRef = useRef(null);
  const countdownRef = useRef(null);

  // ── Cleanup countdown on unmount ─────────────────────────────────────────
  useEffect(() => () => clearInterval(countdownRef.current), []);

  // ── Live countdown tick ───────────────────────────────────────────────────
  useEffect(() => {
    if (!rateLimitInfo?.expiresAt) return;
    countdownRef.current = setInterval(() => {
      const remaining = Math.ceil((rateLimitInfo.expiresAt - Date.now()) / 1000);
      if (remaining <= 0) {
        setRateLimitInfo(null);
        clearInterval(countdownRef.current);
      } else {
        setRateLimitInfo(prev => prev ? { ...prev, remaining } : null);
      }
    }, 1000);
    return () => clearInterval(countdownRef.current);
  }, [rateLimitInfo?.expiresAt]);

  // ── On mount: silently clear stale token — never redirect ─────────────────
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    const expiry = getTokenExpiry(token);
    if (!expiry || Date.now() >= expiry) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("role");
      return;
    }
    timerCleanupRef.current = scheduleAutoLogout(token);
    return () => timerCleanupRef.current?.();
  }, []);

  // ── Reset all state when dialog closes ────────────────────────────────────
  useEffect(() => {
    if (!open) {
      setUsername("");
      setPassword("");
      setError("");
      setLoginSuccess(null);
      setShowPassword(false);
      setRateLimitInfo(null);
      setAttemptsLeft(null);
      setAccountDisabled(false);
      clearInterval(countdownRef.current);
    }
  }, [open]);

  const isLockedOut = Boolean(rateLimitInfo && rateLimitInfo.remaining > 0);

  const redirectByRole = (role) => {
    switch (role) {
      case "superadmin": navigate("/developerRoutes/Dashboard"); break;
      case "admin":      navigate("/adminRoutes/Dashboard");     break;
      default:           navigate("/unauthorized");
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (isLockedOut || accountDisabled) return;
    setError("");
    setAttemptsLeft(null);
    setIsLoading(true);

    try {
      const res = await api.post("/api/auth/login", { username, password });
      const { token, user } = res.data;

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("role", user.role);

      timerCleanupRef.current?.();
      timerCleanupRef.current = scheduleAutoLogout(token);

      setLoginSuccess({
        location: user.loginLocation || "Unknown Location",
        username: user.username,
        role: user.role,
      });

      setTimeout(() => {
        onOpenChange(false);
        redirectByRole(user.role);
      }, 1800);

    } catch (err) {
      const status = err.response?.status;
      const data = err.response?.data;

      if (status === 429) {
        // Locked out — start countdown
        const retryAfter = data?.retryAfter ?? 60;
        setRateLimitInfo({
          expiresAt: Date.now() + retryAfter * 1000,
          remaining: retryAfter,
          tier: data?.tier ?? 1,
        });
        setError("");
        setAttemptsLeft(null);
      } else if (status === 403 && data?.accountDisabled) {
        // Account permanently disabled
        setAccountDisabled(true);
        setError("");
        setRateLimitInfo(null);
      } else {
        // Normal wrong-password — keep username, clear password only
        if (data?.attemptsLeft !== undefined) setAttemptsLeft(data.attemptsLeft);
        setError(data?.message || "Login failed");
        setPassword("");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const features = [
    "Employee Registration Management",
    "QR Code Generation & Tracking",
    "ID Approval Workflow",
    "Secure Admin Dashboard",
  ];

  // Formats seconds into HH:MM:SS or MM:SS depending on length
  const formatCountdown = (seconds) => {
    if (seconds >= 3600) {
      const h = Math.floor(seconds / 3600);
      const m = Math.floor((seconds % 3600) / 60);
      const s = seconds % 60;
      return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
    }
    return `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-[95vw] md:max-w-4xl lg:max-w-5xl p-0 overflow-hidden border-0 shadow-2xl rounded-2xl"
      >
        {/* ── Manual close button (top-right) ── */}
        {!loginSuccess && (
          <button
            onClick={() => onOpenChange(false)}
            className="absolute top-4 right-4 z-50 p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
            aria-label="Close"
          >
          </button>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 min-h-[580px]">

          {/* LEFT — Form Panel */}
          <div className="relative flex flex-col justify-center p-8 md:p-12 bg-white overflow-hidden">
            <div className="absolute inset-0 opacity-[0.03]"
              style={{ backgroundImage: `radial-gradient(circle at 1px 1px, #16a34a 1px, transparent 0)`, backgroundSize: "32px 32px" }} />
            <div className="absolute -top-20 -left-20 w-64 h-64 bg-green-400 rounded-full blur-3xl opacity-10 pointer-events-none" />
            <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-emerald-300 rounded-full blur-3xl opacity-10 pointer-events-none" />

            <div className="relative z-10">
              <AnimatePresence mode="wait">
                {loginSuccess ? (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col items-center text-center gap-4 py-8"
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
                      className="w-20 h-20 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-green-200"
                    >
                      <CheckCircle className="h-10 w-10 text-white" strokeWidth={2.5} />
                    </motion.div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-800">Welcome back!</h2>
                      <p className="text-gray-500 mt-1 text-sm">
                        Logged in as{" "}
                        <span className="font-semibold text-green-700">{loginSuccess.username}</span>
                      </p>
                    </div>
                    {loginSuccess.location && loginSuccess.location !== "Unknown Location" && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="flex items-center gap-2 px-4 py-2 bg-green-50 border border-green-100 rounded-full text-sm text-green-700"
                      >
                        <MapPin className="h-4 w-4" />{loginSuccess.location}
                      </motion.div>
                    )}
                    <p className="text-xs text-gray-400 animate-pulse">Redirecting to dashboard...</p>
                  </motion.div>
                ) : (
                  <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <motion.div
                      initial={{ opacity: 0, y: -16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4 }}
                      className="mb-8"
                    >
                      <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-green-600 to-emerald-600 rounded-xl shadow-lg shadow-green-200 mb-4">
                        <Shield className="h-7 w-7 text-white" strokeWidth={2.5} />
                      </div>
                      <DialogHeader>
                        <DialogTitle className="text-3xl font-extrabold tracking-tight text-gray-900">
                          Welcome Back
                        </DialogTitle>
                        <p className="text-gray-500 mt-1 text-sm">Sign in to your ARROWGO Admin account</p>
                      </DialogHeader>
                    </motion.div>

                    <motion.form
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: 0.15 }}
                      onSubmit={handleLogin}
                      className="space-y-5"
                    >
                      {/* Username */}
                      <div className="space-y-1.5">
                        <Label htmlFor="username" className="text-sm font-semibold text-gray-700">
                          Username
                        </Label>
                        <div className="relative group">
                          <Input
                            id="username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Enter your username"
                            disabled={isLockedOut || accountDisabled}
                            className="pl-10 h-11 border-2 border-gray-100 bg-gray-50 focus:bg-white focus:border-green-500 rounded-xl transition-all duration-200 placeholder:text-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
                            required
                          />
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-green-500 transition-colors" />
                        </div>
                      </div>

                      {/* Password */}
                      <div className="space-y-1.5">
                        <Label htmlFor="password" className="text-sm font-semibold text-gray-700">
                          Password
                        </Label>
                        <div className="relative group">
                          <Input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter your password"
                            disabled={isLockedOut || accountDisabled}
                            className="pl-10 pr-11 h-11 border-2 border-gray-100 bg-gray-50 focus:bg-white focus:border-green-500 rounded-xl transition-all duration-200 placeholder:text-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
                            required
                          />
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-green-500 transition-colors" />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-1"
                          >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      </div>

                      {/* Alerts */}
                      <AnimatePresence>

                        {/* Account permanently disabled */}
                        {accountDisabled && (
                          <motion.div
                            key="disabled"
                            initial={{ opacity: 0, y: -8, height: 0 }}
                            animate={{ opacity: 1, y: 0, height: "auto" }}
                            exit={{ opacity: 0, y: -8, height: 0 }}
                            className="p-4 bg-red-50 border border-red-300 rounded-xl overflow-hidden"
                          >
                            <div className="flex items-center gap-2 mb-1">
                              <Lock className="h-4 w-4 text-red-700 flex-shrink-0" />
                              <p className="text-sm text-red-700 font-bold">Account Disabled</p>
                            </div>
                            <p className="text-xs text-red-600">
                              Your account has been disabled due to too many failed login attempts.
                              Please contact your administrator to regain access.
                            </p>
                          </motion.div>
                        )}

                        {/* Timed lockout with countdown */}
                        {isLockedOut && !accountDisabled && (
                          <motion.div
                            key="lockout"
                            initial={{ opacity: 0, y: -8, height: 0 }}
                            animate={{ opacity: 1, y: 0, height: "auto" }}
                            exit={{ opacity: 0, y: -8, height: 0 }}
                            className="p-4 bg-red-50 border border-red-200 rounded-xl overflow-hidden"
                          >
                            <div className="flex items-center gap-2 mb-2">
                              <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0" />
                              <p className="text-sm text-red-600 font-semibold">
                                Account locked
                                {rateLimitInfo?.tier && (
                                  <span className="ml-1 text-xs font-normal text-red-400">
                                    (phase {rateLimitInfo.tier} of 5)
                                  </span>
                                )}
                              </p>
                            </div>
                            <p className="text-xs text-red-500 mb-2">
                              Too many failed attempts. Try again in{" "}
                              {rateLimitInfo?.tier && (
                                <span className="font-semibold">{TIER_LABELS[rateLimitInfo.tier]}</span>
                              )}.
                            </p>
                            <div className="flex items-center justify-center py-1">
                              <span className="font-mono text-2xl font-bold text-red-600 tabular-nums">
                                {formatCountdown(rateLimitInfo.remaining)}
                              </span>
                            </div>
                            {/* Warning about next phase */}
                            {rateLimitInfo?.tier < 4 && NEXT_TIER_LABELS[rateLimitInfo.tier] && (
                              <p className="text-xs text-red-400 text-center mt-1">
                                Next lockout: <span className="font-medium">{NEXT_TIER_LABELS[rateLimitInfo.tier]}</span>
                              </p>
                            )}
                            {rateLimitInfo?.tier === 4 && (
                              <p className="text-xs text-red-500 text-center mt-1 font-medium">
                                ⚠ Next lockout: 1h 30min — then account may be disabled
                              </p>
                            )}
                            {rateLimitInfo?.tier === 5 && (
                              <p className="text-xs text-red-500 text-center mt-1 font-medium">
                                ⚠ Final warning — further attempts may permanently disable your account
                              </p>
                            )}
                          </motion.div>
                        )}

                        {/* Normal error with attempts-left warning */}
                        {error && !isLockedOut && !accountDisabled && (
                          <motion.div
                            key="error"
                            initial={{ opacity: 0, y: -8, height: 0 }}
                            animate={{ opacity: 1, y: 0, height: "auto" }}
                            exit={{ opacity: 0, y: -8, height: 0 }}
                            className="space-y-1 overflow-hidden"
                          >
                            <div className="flex items-center gap-2.5 p-3 bg-red-50 border border-red-200 rounded-xl">
                              <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0" />
                              <p className="text-sm text-red-600 font-medium">{error}</p>
                            </div>
                            {attemptsLeft !== null && attemptsLeft > 0 && (
                              <p className={`text-xs px-1 ${
                                attemptsLeft === 1
                                  ? "text-red-600 font-bold"
                                  : attemptsLeft === 2
                                  ? "text-red-500 font-semibold"
                                  : "text-amber-600"
                              }`}>
                                {attemptsLeft === 1
                                  ? "⚠ Last attempt — your account will be locked on the next fail!"
                                  : `⚠ ${attemptsLeft} attempt${attemptsLeft !== 1 ? "s" : ""} remaining before account lockout`}
                              </p>
                            )}
                          </motion.div>
                        )}

                      </AnimatePresence>

                      {/* Submit button */}
                      <Button
                        type="submit"
                        disabled={isLoading || isLockedOut || accountDisabled}
                        className="w-full h-11 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700
                          hover:to-emerald-700 text-white font-semibold rounded-xl shadow-md shadow-green-200
                          hover:shadow-lg hover:shadow-green-300 transition-all duration-200
                          flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {accountDisabled ? (
                          <><Lock className="h-4 w-4" />Account Disabled</>
                        ) : isLockedOut ? (
                          <><Lock className="h-4 w-4" />Locked — {formatCountdown(rateLimitInfo.remaining)}</>
                        ) : isLoading ? (
                          <>
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                              className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                            />
                            Authenticating...
                          </>
                        ) : (
                          <><LogIn className="h-4 w-4" />Sign In</>
                        )}
                      </Button>

                      <div className="flex items-center justify-center gap-2 pt-2">
                        <Wifi className="h-3.5 w-3.5 text-gray-300" />
                        <p className="text-xs text-gray-400">Your login location is recorded for security</p>
                      </div>
                    </motion.form>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* RIGHT — Visual Panel */}
          <div className="hidden md:block relative overflow-hidden bg-gray-900">
            <img src={loginImg} alt="Login Visual" className="absolute inset-0 h-full w-full object-cover opacity-40" />
            <div className="absolute inset-0 bg-gradient-to-br from-green-900/80 via-emerald-800/70 to-teal-900/80" />
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
                  ARROWGO Admin System
                </div>
                <h3 className="text-4xl font-black text-white mb-3 leading-tight">
                  Secure <br />Admin Access
                </h3>
                <p className="text-white/60 text-sm leading-relaxed mb-8 max-w-xs">
                  Manage employee IDs, approve registrations, and oversee the entire ID generation process.
                </p>
                <div className="space-y-3">
                  {features.map((feature, index) => (
                    <motion.div
                      key={feature}
                      initial={{ opacity: 0, x: 30 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.4, delay: 0.5 + index * 0.1 }}
                      className="flex items-center gap-3"
                    >
                      <div className="flex-shrink-0 w-7 h-7 bg-emerald-500/20 border border-emerald-400/30 rounded-lg flex items-center justify-center">
                        <CheckCircle className="h-4 w-4 text-emerald-400" strokeWidth={2.5} />
                      </div>
                      <span className="text-white/75 text-sm font-medium">{feature}</span>
                    </motion.div>
                  ))}
                </div>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1 }}
                  className="mt-10 flex items-start gap-3 p-3 bg-white/5 border border-white/10 rounded-xl"
                >
                  <MapPin className="h-4 w-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <p className="text-white/50 text-xs leading-relaxed">
                    Sessions are tracked with your login location for security monitoring.
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
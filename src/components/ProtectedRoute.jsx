import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children, allowedRoles }) {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));

  // 🔒 Not logged in
  if (!token || !user) {
    return <Navigate to="/" replace />;
  }

  // 🚫 Role not allowed
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Superadmin redirect
    if (user.role === "superadmin") {
      return <Navigate to="/developerRoutes/Dashboard" replace />;
    }

    // Admin redirect
    if (user.role === "admin") {
      return <Navigate to="/adminRoutes/Dashboard" replace />;
    }

    // Fallback
    return <Navigate to="/" replace />;
  }

  return children;
}

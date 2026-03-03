import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";

export default function RequireRegistrationToken({ children }) {
  const [isValid, setIsValid] = useState(null);

  useEffect(() => {
    const validateToken = () => {
      const tokenData = sessionStorage.getItem("registrationToken");
      
      if (!tokenData) {
        setIsValid(false);
        return;
      }

      try {
        const parsed = JSON.parse(tokenData);
        const now = Date.now();

        // Check if token exists and hasn't expired
        if (parsed.token && parsed.expiresAt > now) {
          setIsValid(true);
        } else {
          // Token expired - clean up
          sessionStorage.removeItem("registrationToken");
          setIsValid(false);
        }
      } catch (error) {
        sessionStorage.removeItem("registrationToken");
        setIsValid(false);
      }
    };

    validateToken();
  }, []);

  // Show loading state while validating
  if (isValid === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Validating access...</p>
        </div>
      </div>
    );
  }

  // Redirect if invalid
  if (!isValid) {
    return <Navigate to="/verify" replace />;
  }

  return children;
}
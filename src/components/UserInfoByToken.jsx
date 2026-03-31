// UserInfoByToken.jsx
import { useEffect, useState } from "react";
import { useParams, Navigate } from "react-router-dom";
import axios from "axios";

export default function UserInfoByToken() {
  const { token } = useParams();
  const [employeeId, setEmployeeId] = useState(null);
  const [notFound, setNotFound]     = useState(false);
  const api = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    axios.get(`${api}/api/employee-by-token/${token}`)
      .then(res => setEmployeeId(res.data.employee_id))
      .catch(() => setNotFound(true));
  }, [token]);

  if (notFound) return <div>Invalid QR code.</div>;
  if (!employeeId) return <div>Loading...</div>;

  // Redirect to existing /employee/:id route — reuses all existing logic
  return <Navigate to={`/employee/${employeeId}`} replace />;
}
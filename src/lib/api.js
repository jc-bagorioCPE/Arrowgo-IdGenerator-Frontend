import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
});

// ── Attach token to every request ────────────────────────────────────────────
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ── Central logout — calls backend FIRST, then clears local state ─────────────
export const performLogout = async () => {
  const token = localStorage.getItem("token");
  if (token) {
    try {
      // Fire-and-forget is intentional here: we don't want a failed API call
      // to block the user from being logged out locally.
      await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/api/auth/logout`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch {
      // Token may already be expired/invalid — that's fine, continue logout
    }
  }
  localStorage.clear();
  window.location.href = "/";
};

// ── Auto-logout on 401 (disabled account or expired token) ───────────────────
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await performLogout();
    }
    return Promise.reject(error);
  }
);

export default api;
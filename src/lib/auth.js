export const login = (username, password) => {
  // 🔴 hardcoded admin credentials
  if (username === "admin" && password === "admin123") {
    localStorage.setItem("isAdminLoggedIn", "true");
    return true;
  }
  return false;
};

export const logout = () => {
  localStorage.removeItem("isAdminLoggedIn");
};

export const isAuthenticated = () => {
  return localStorage.getItem("isAdminLoggedIn") === "true";
};

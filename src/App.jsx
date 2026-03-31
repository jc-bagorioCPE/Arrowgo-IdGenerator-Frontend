import IdCreator from "./pages/Admin/IDCreator";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import AdminLogin from "./components/LandingPage/Login";
import Admin from "./pages/Admin/Admin";
import AdminRoute from "./Routes/AdminRoute";
import AdminLayout from "./components/AdminLayout";
import Navbar from "./components/LandingPage/Navbar";
import Landing from "./pages/Public/Landing";
import EmployeeFillUpForm from "./pages/Public/FillupForm";
import UserInformationPage from "./pages/Public/UserInfo";
import IDGenerated from "./pages/Public/IDGenerated";
import Documentation from "./components/DocumentationPage"
import RecruitmentPage from "./components/RecruitmentPage";
import ApplicantsPage from "./pages/Admin/ApplicantPage";
import DeveloperRoute from "./Routes/DeveloperRoute";
import VerifyEmployee from "./pages/Public/VerifyEmployee";

import RequireAdmin from "./components/ProtectedRoute";
import RequireRegistrationToken from "./components/RequireRegistrationToken";

function App() {
  const location = useLocation();

  const hideNavbar =
  location.pathname.startsWith("/adminRoutes") ||
  location.pathname.startsWith("/developerRoutes");

  const hideBackground = location.pathname === "/"; // 👈 hide bg on landing

  return (
    <div className={hideBackground ? "min-h-screen" : "bg-[#A8DCD0] min-h-screen"}>
      {!hideNavbar && <Navbar />}

      <Routes>
        <Route path="/" element={<Landing />} />

        <Route
          path="/public"
          element={
            <AdminLayout>
              <IdCreator />
            </AdminLayout>
          }
        />

        <Route path="/login" element={<AdminLogin />} />

        {/* 🔒 PROTECTED ADMIN DASHBOARD */}
        <Route
          path="/admin"
          element={
            <RequireAdmin>
              <Admin />
            </RequireAdmin>
          }
        />

        {/* 🔒 PROTECTED ADMIN ROUTES */}
        <Route
          path="/adminRoutes/*"
          element={
            <RequireAdmin allowedRoles={["superadmin", "admin"]}>
              <AdminRoute />
            </RequireAdmin>
          }
        />

        {/* 🔒 PROTECTED DEVELOPER ROUTES */}
        <Route
          path="/developerRoutes/*"
          element={
            <RequireAdmin allowedRoles={["superadmin"]}>
              <DeveloperRoute />
            </RequireAdmin>
          }
        />

        <Route path="/Register" element={<RequireRegistrationToken><EmployeeFillUpForm /> </RequireRegistrationToken>} />
        <Route path="/employee/:id" element={<UserInformationPage />} />
        <Route path="/employee/token/:token"   element={<UserInformationPage />} />
        <Route path="/IDGenerated" element={<IDGenerated />} />
        <Route path="/Documentation" element={<Documentation />} />
        <Route path="/Recruitment" element={<RecruitmentPage />} /> 
        <Route path ="/verify" element={<VerifyEmployee />} />
      </Routes>
    </div>
  );
}

export default function Root() {
  return (
    <BrowserRouter>
      <App />
    </BrowserRouter>
  );
}

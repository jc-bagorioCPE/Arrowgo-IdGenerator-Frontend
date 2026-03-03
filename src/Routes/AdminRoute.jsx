import { Routes, Route } from "react-router-dom";
import Layout from "../components/Layout";
import Admin from "../pages/Admin/Admin";
import IdCreator from "../pages/Admin/IDCreator";
import EmployeeList from "../pages/Admin/EmployeeList";
import Claims from "../pages/Admin/claims";
import AdminApplications from "@/pages/Admin/ApplicantPage";
import CreateAccount from "@/pages/Admin/CreateAccount";
import ArchiveList from "@/pages/Admin/ArchiveList";

const AdminRoute = () => {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="Dashboard" element={<Admin />} />
        <Route path="idCreator" element={<IdCreator />} />
        <Route path="EmployeeList" element={<EmployeeList />} />
        <Route path="Claims" element={<Claims />} />
        <Route path="Applications" element={<AdminApplications />} />
      </Route>
    </Routes>
  );
};

export default AdminRoute;

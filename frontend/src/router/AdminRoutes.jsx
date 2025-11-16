import { Route } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoutes";
import RoleRoute from "./RoleRoutes";

import AdminLayout from "../pages/users/admin/AdminLayout.jsx";
import Dashboard from "../pages/users/admin/Dashboard";
import Users from "../pages/users/admin/Users";
import Salles from "../pages/users/admin/Salles";
import Exams from "../pages/users/admin/Exams";
import Matieres from "../pages/users/admin/Matieres";
import Calendrier from "../pages/users/admin/Calendriers";
import Affectation from "../pages/users/admin/Affectations";
import Supervision from "../pages/users/admin/Supervision.jsx";

export default (
  <Route element={<ProtectedRoute />}>
    <Route
      path="/admin"
      element={
        <RoleRoute role="admin">
          <AdminLayout />
        </RoleRoute>
      }
    >
      <Route index element={<Dashboard />} />
      <Route path="dashboard" element={<Dashboard />} />
      <Route path="users" element={<Users />} />
      <Route path="salles" element={<Salles />} />
      <Route path="exams" element={<Exams />} />
      <Route path="matieres" element={<Matieres />} />
      <Route path="calendrier" element={<Calendrier />} />
      <Route path="affectation" element={<Affectation />} />
      <Route path="supervision" element={<Supervision />} />
      <Route path="etudiants" element={<Users key="etudiants" userRole="etudiant" />} />
      <Route path="surveillants" element={<Users key="surveillants" userRole="surveillant" />} />
    </Route>

    <Route
      path="/admin/profile"
      element={
        <RoleRoute role="admin">
          {/* import a Profile page or reuse Users detail */}
          <div>Profile (à implémenter)</div>
        </RoleRoute>
      }
    />
  </Route>
);

import { Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoutes";
import RoleRoute from "./RoleRoutes";
import Profile from "../pages/users/etudiant/Profile.jsx";
import EtudiantLayout from "../pages/users/etudiant/EtudiantLayout";
import DashboardEtudiant from "../pages/users/etudiant/DashboardEtudiant";
// import other student pages when available, e.g. Calendar, Affectations

export default (
  <Route element={<ProtectedRoute />}>
    <Route
      path="/etudiant"
      element={
        <RoleRoute role="etudiant">
          <EtudiantLayout />
        </RoleRoute>
      }
    >
      <Route index element={<Navigate to="dashboard" replace />} />
      <Route path="profile" element={<Profile />} />
      <Route path="dashboard" element={<DashboardEtudiant />} />
    </Route>
  </Route>
);

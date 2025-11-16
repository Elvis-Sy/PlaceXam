import { Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoutes";
import RoleRoute from "./RoleRoutes";

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
      {/* default => redirect to dashboard */}
      <Route index element={<Navigate to="dashboard" replace />} />
      <Route path="dashboard" element={<DashboardEtudiant />} />
      {/* add /etudiant/calendrier and /etudiant/affectations when available */}
    </Route>
  </Route>
);

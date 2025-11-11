import { Route } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoutes";
import RoleRoute from "./RoleRoutes";

import DashboardEtudiant from "../pages/users/etudiant/DashboardEtudiant";

export default (
  <Route element={<ProtectedRoute />}>
    <Route
      path="/etudiant"
      element={
        <RoleRoute role="etudiant">
          <DashboardEtudiant />
        </RoleRoute>
      }
    />
  </Route>
);

import { Route } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoutes";
import RoleRoute from "./RoleRoutes";

import DashboardAdmin from "../pages/users/admin/DashboardAdmin";
import Profile from "../pages/users/admin/Profile";
import Students from "../pages/users/admin/Students";

export default (
  <Route element={<ProtectedRoute />}>
    <Route
      path="/admin/*"
      element={
        <RoleRoute role="admin">
          <DashboardAdmin />
        </RoleRoute>
      }
    />
    <Route
      path="/admin/dashboard"
      element={
        <RoleRoute role="admin">
          <DashboardAdmin />
        </RoleRoute>
      }
    />

    <Route
      path="/admin/profile"
      element={
        <RoleRoute role="admin">
          <Profile />
        </RoleRoute>
      }
    />

  <Route
      path="/admin/students"
      element={
        <RoleRoute role="admin">
          <Students />
        </RoleRoute>
      }
    />
  </Route>
);

import { Route } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoutes";
import RoleRoute from "./RoleRoutes";

import DashboardSurveillant from "../pages/users/surveillant/DashBoardSurveillant";

export default (
  <Route element={<ProtectedRoute />}>
    <Route
      path="/surveillant"
      element={
        <RoleRoute role="surveillant">
          <DashboardSurveillant />
        </RoleRoute>
      }
    />
  </Route>
);

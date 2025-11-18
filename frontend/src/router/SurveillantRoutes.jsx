import { Route } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoutes";
import RoleRoute from "./RoleRoutes";
import Profile from "../pages/users/admin/Profile";
import SurveillantLayout from "../pages/users/surveillant/SurveillantLayout";
import DashboardSurveillant from "../pages/users/surveillant/DashBoardSurveillant";
import CalendrierSurveillant from "../pages/users/surveillant/CalendrierSurveillant";
import SalleSurveillant from "../pages/users/surveillant/SalleSurveillant"

export default (
  <Route element={<ProtectedRoute />}>
    <Route
      path="/surveillant"
      element={
        <RoleRoute role="surveillant">
          <SurveillantLayout />
        </RoleRoute>
      }
    >
      <Route index element={<DashboardSurveillant />} />
      <Route path="dashboard" element={<DashboardSurveillant />} />
      <Route path="profile" element={<Profile />} />
      <Route path="calendriers" element={<CalendrierSurveillant />} />
      <Route path="salles" element={<SalleSurveillant />} />
    </Route>
  </Route>
);

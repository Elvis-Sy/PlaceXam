import { Route } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoutes";
import RoleRoute from "./RoleRoutes";
import CalendarsSurveillant from "../pages/users/surveillant/Calendriers";
import SurveillantLayout from "../pages/users/surveillant/SurveillantLayout";
import StudentsSurveillant from "../pages/users/surveillant/Etudiants";
import DashboardSurveillant from "../pages/users/surveillant/DashBoardSurveillant";

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
      <Route path="calendrier" element={<CalendarsSurveillant />} />
      <Route path="etudiants" element={<StudentsSurveillant />} />
    </Route>
  </Route>
);

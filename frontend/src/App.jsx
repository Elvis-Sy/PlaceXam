import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";

import AuthRoutes from "./router/AuthRoutes";
import AdminRoutes from "./router/AdminRoutes";
import SurveillantRoutes from "./router/SurveillantRoutes";
import EtudiantRoutes from "./router/EtudiantRoutes";
import ProtectedRoute from "./router/ProtectedRoutes";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Redirection par défaut */}
          <Route path="/" element={<Navigate to="/auth/login" />} />

          {/* ROUTES D'AUTHENTIFICATION */}
          {AuthRoutes}

          {/* ROUTES PROTEGEES */}
          {AdminRoutes}
          {SurveillantRoutes}
          {EtudiantRoutes}

          {/* ROUTES NON TROUVEES */}
          <Route path="*" element={<h1>404 - Page non trouvée</h1>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

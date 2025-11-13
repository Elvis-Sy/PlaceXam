import React from "react";
import { Route, Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

import Login from "../pages/Auth/Login.jsx";
import Signup from "../pages/Auth/Signup";
import ForgotPassword from "../pages/Auth/ForgotPassword";
import ResetPasswordPage from "../pages/Auth/ResetPassword.jsx";

/**
 * AuthGuard: si user connecté -> redirige vers son dashboard,
 * sinon rend <Outlet/> pour afficher les routes enfants (/auth/login, /auth/signup...)
 */
function AuthGuard() {
  const { user, loading } = useAuth();

  if (loading) return null; // ou un petit loader si tu veux

  if (user) {
    const mapping = {
      admin: "/admin/dashboard",
      surveillant: "/surveillant",
      etudiant: "/etudiant",
    };
    const target = mapping[user.role] || "/";
    return <Navigate to={target} replace />;
  }

  return <Outlet />;
}

/**
 * Exporte un fragment contenant des <Route> statiques.
 * Ces <Route> seront insérées directement dans <Routes> (donc validées).
 */
export default (
  <>
    <Route path="/auth" element={<AuthGuard />}>
      <Route path="login" element={<Login />} />
      <Route path="signup" element={<Signup />} />
      <Route path="forgot" element={<ForgotPassword />} />
      <Route path="reset-password/:token" element={<ResetPasswordPage />} />
    </Route>
  </>
);

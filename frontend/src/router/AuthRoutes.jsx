import React from "react";
import { Route, Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

import Login from "../pages/Auth/Login";
import Signup from "../pages/Auth/Signup";
import ForgotPassword from "../pages/Auth/ForgotPassword";
import ResetPassword from "../pages/Auth/ResetPassword";

export default function AuthRoutes() {
  const { user, loading } = useAuth();

  if (loading) {
    // On peut retourner null ou un petit loader si tu préfères
    return null;
  }

  // Si l'utilisateur est connecté, rediriger tous les /auth/* vers le dashboard adapté
  if (user) {
    const mapping = {
      admin: "/admin/dashboard",
      surveillant: "/surveillant",
      etudiant: "/etudiant",
    };
    const target = mapping[user.role] || "/";
    // Catch-all pour tout /auth/* -> redirection
    return <Route path="/auth/*" element={<Navigate to={target} replace />} />;
  }

  // Sinon exposer les routes d'authentification
  return (
    <>
      <Route path="/auth/login" element={<Login />} />
      <Route path="/auth/signup" element={<Signup />} />
      <Route path="/auth/forgot" element={<ForgotPassword />} />
      <Route path="/auth/reset" element={<ResetPassword />} />
    </>
  );
}

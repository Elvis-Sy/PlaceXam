import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

/**
 * ProtectedRoutes:
 * - Si loading -> retourne un loader
 * - Si pas authentifié -> redirige vers /auth/login et mémorise la destination
 * - Sinon -> rend <Outlet/> (les routes enfants)
 */
export default function ProtectedRoutes() {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    // Simple loader; remplace par ton composant Loader si besoin
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div role="status">Chargement...</div>
      </div>
    );
  }

  if (!user) {
    // Mémoriser la route demandée pour y revenir après login
    return <Navigate to="/auth/login" replace state={{ from: location }} />;
  }

  // L'utilisateur est connecté -> rendre les routes enfants
  return <Outlet />;
}

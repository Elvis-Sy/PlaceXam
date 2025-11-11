import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import Forbidden from "../Error/Forbiden";

/**
 * RoleRoutes
 * Props:
 * - role OR allowedRoles: string or array of strings
 * - children: component(s) à afficher si autorisé
 * - fallback: either "/403" (default) or another path string
 *
 * Examples:
 * <RoleRoutes role="admin"><AdminPage/></RoleRoutes>
 * <RoleRoutes allowedRoles={["admin","manager"]}><Page/></RoleRoutes>
 */
export default function RoleRoutes({ role, allowedRoles, children, fallback = "/403" }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Normalize to array of roles
  const roles = role
    ? Array.isArray(role)
      ? role
      : [role]
    : Array.isArray(allowedRoles)
    ? allowedRoles
    : allowedRoles
    ? [allowedRoles]
    : [];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div role="status">Chargement...</div>
      </div>
    );
  }

  // If a logged-in user visits any auth page, redirect them to their dashboard
  if (user && location.pathname.startsWith("/auth")) {
    const mapping = {
      admin: "/admin/dashboard",
      surveillant: "/surveillant",
      etudiant: "/etudiant",
    };
    const target = mapping[user.role] || "/";
    return <Navigate to={target} replace />;
  }

  if (!user) {
    return <Navigate to="/auth/login" replace state={{ from: location }} />;
  }

  if (roles.length === 0) {
    // Si aucune restriction définie, autoriser par défaut
    return children;
  }

  if (roles.includes(user.role)) {
    return children;
  }

  // Si fallback est "/403", afficher le composant Forbidden, sinon rediriger vers l'URL fournie
  if (fallback === "/403") {
    return <Forbidden />;
  }

  return <Navigate to={fallback} replace />;
}

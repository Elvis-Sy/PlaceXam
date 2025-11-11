import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation, Navigate } from "react-router-dom";
import NotFound from "./pages/NotFound";
import Etudiant from "./pages/Etudiant";
import Surveillant from "./pages/Surveillant";
import { SiteHeader } from "./components/layout/SiteHeader";
import { SiteFooter } from "./components/layout/SiteFooter";
import Students from "./pages/admin/Students";
import { AdminDashboard, AdminExamens, AdminMatieres, AdminSalles, AdminSurveillants } from "./pages/admin/Placeholders";
import Login from "./pages/Login";

const queryClient = new QueryClient();

const Shell = () => {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith("/admin");
  const isAuth = location.pathname.startsWith("/login");
  return (
    <div className="flex min-h-screen flex-col">
      {!isAdmin && !isAuth && <SiteHeader />}
      <div className="flex-1">
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/etudiant" element={<Etudiant />} />
          <Route path="/surveillant" element={<Surveillant />} />

          {/* Admin */}
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/etudiants" element={<Students />} />
          <Route path="/admin/salles" element={<AdminSalles />} />
          <Route path="/admin/matieres" element={<AdminMatieres />} />
          <Route path="/admin/examens" element={<AdminExamens />} />
          <Route path="/admin/surveillants" element={<AdminSurveillants />} />

          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
      {!isAdmin && !isAuth && <SiteFooter />}
    </div>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Shell />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

createRoot(document.getElementById("root")!).render(<App />);

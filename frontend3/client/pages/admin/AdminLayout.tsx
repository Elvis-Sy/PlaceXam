import { ReactNode, useEffect, useState } from "react";
import { NavLink, Link, useNavigate } from "react-router-dom";
import { LayoutDashboard, UsersRound, Building2, BookOpen, ClipboardList, Shield, LogOut, Menu, X, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const nav = [
  { to: "/admin/dashboard", label: "Tableau de bord", icon: LayoutDashboard },
  { to: "/admin/etudiants", label: "Étudiants", icon: UsersRound },
  { to: "/admin/salles", label: "Salles", icon: Building2 },
  { to: "/admin/matieres", label: "Matières", icon: BookOpen },
  { to: "/admin/examens", label: "Examens", icon: ClipboardList },
  { to: "/admin/surveillants", label: "Surveillants", icon: Shield },
];

export default function AdminLayout({ children, title }: { children: ReactNode; title?: string }) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [collapsed, setCollapsed] = useState<boolean>(() => {
    try { return localStorage.getItem("admin_sidebar_collapsed") === "1"; } catch { return false; }
  });
  useEffect(() => { try { localStorage.setItem("admin_sidebar_collapsed", collapsed ? "1" : "0"); } catch {} }, [collapsed]);
  function logout() {
    try { localStorage.removeItem("examrooms_current_user"); } catch {}
    navigate("/login");
  }
  function close() { setOpen(false); }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="grid min-h-screen grid-cols-12">
        {/* Desktop Sidebar */}
        <aside className={cn(
          "hidden md:block md:border-r md:bg-slate-900 md:text-slate-200",
          collapsed ? "md:col-span-1 md:max-w-16" : "md:col-span-2 md:max-w-64",
        )}>
          <div className="flex h-full flex-col">
            <Link to="/admin/dashboard" className={cn("flex h-14 items-center gap-2 border-b border-white/10 px-4 font-semibold", collapsed && "justify-center") }>
              <div className="flex h-8 w-8 items-center justify-center rounded bg-primary text-primary-foreground">ER</div>
              {!collapsed && <span>Administration</span>}
            </Link>
            <nav className="flex-1 space-y-1 p-2">
              {nav.map(({ to, label, icon: Icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium",
                      isActive ? "bg-white/10 text-white" : "text-slate-300 hover:bg-white/5 hover:text-white",
                      collapsed && "justify-center",
                    )
                  }
                  onClick={close}
                >
                  <Icon className="h-4 w-4" />
                  {!collapsed && <span>{label}</span>}
                </NavLink>
              ))}
            </nav>
            <div className={cn("border-t border-white/10 p-4 text-xs text-slate-400", collapsed && "flex justify-center p-3") }>
              {!collapsed ? (
                <div className="mb-2">
                  Connecté en tant que
                  <div className="font-medium text-slate-200">Administrateur Principal</div>
                  <div>Admin</div>
                </div>
              ) : null}
              <Button variant="secondary" size="sm" className={cn("w-full", collapsed && "w-9 px-0")} onClick={logout}>
                <LogOut className="h-4 w-4" />
                {!collapsed && <span>Déconnexion</span>}
              </Button>
            </div>
          </div>
        </aside>

        {/* Mobile Sidebar (drawer) */}
        <aside className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 translate-x-[-100%] bg-slate-900 text-slate-200 shadow-lg transition-transform md:hidden",
          open && "translate-x-0",
        )}>
          <div className="flex h-14 items-center justify-between border-b border-white/10 px-4 font-semibold">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded bg-primary text-primary-foreground">ER</div>
              Administration
            </div>
            <Button variant="ghost" size="icon" onClick={() => setOpen(false)}>
              <X className="h-5 w-5 text-white" />
            </Button>
          </div>
          <nav className="space-y-1 p-2">
            {nav.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium",
                    isActive ? "bg-white/10 text-white" : "text-slate-300 hover:bg-white/5 hover:text-white",
                  )
                }
                onClick={close}
              >
                <Icon className="h-4 w-4" /> {label}
              </NavLink>
            ))}
          </nav>
          <div className="mt-auto border-t border-white/10 p-4 text-xs text-slate-400">
            <div className="mb-2">
              Connecté en tant que
              <div className="font-medium text-slate-200">Administrateur Principal</div>
              <div>Admin</div>
            </div>
            <Button variant="secondary" size="sm" className="w-full" onClick={() => { close(); logout(); }}>
              <LogOut className="mr-2 h-4 w-4" /> Déconnexion
            </Button>
          </div>
        </aside>
        {open && <div className="fixed inset-0 z-40 bg-black/40 md:hidden" onClick={close} />}

        {/* Main */}
        <main className={cn("col-span-12 p-4 md:p-6", collapsed ? "md:col-span-11" : "md:col-span-10") }>
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" className="md:hidden" onClick={() => setOpen(true)}>
                <Menu className="h-5 w-5" />
              </Button>
              <Button variant="outline" size="icon" className="hidden md:inline-flex" onClick={() => setCollapsed((v) => !v)}>
                {collapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
              </Button>
              {title ? <span className="text-base font-semibold text-slate-800 md:hidden">{title}</span> : null}
            </div>
            <div />
          </div>
          {title ? (
            <h1 className="mb-4 hidden text-2xl font-semibold text-slate-800 md:block">{title}</h1>
          ) : null}
          {children}
        </main>
      </div>
    </div>
  );
}

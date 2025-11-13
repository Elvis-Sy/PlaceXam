import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { GraduationCap, Shield, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getCurrentUser } from "@/lib/localdb";

const navItems = [
  { to: "/etudiant", label: "Étudiant", icon: UserRound },
  { to: "/surveillant", label: "Surveillant", icon: Shield },
];

export function SiteHeader() {
  const [user, setUser] = useState(getCurrentUser());
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    setUser(getCurrentUser());
  }, [location.pathname]);

  function logout() {
    try { localStorage.removeItem("examrooms_current_user"); } catch {}
    setUser(null);
    navigate("/login");
  }

  const items = user?.role === "etudiant" ? [navItems[0]] : user?.role === "surveillant" ? [navItems[1]] : navItems;
  const homeTo = user?.role === "etudiant" ? "/etudiant" : user?.role === "surveillant" ? "/surveillant" : "/";

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-gradient-to-r from-primary/10 via-background to-secondary/10 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="container mx-auto flex h-16 items-center justify-between gap-4">
        <Link to={homeTo} className="flex items-center gap-2 text-lg font-bold">
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary text-primary-foreground shadow-md">
            <GraduationCap className="h-5 w-5" />
          </div>
          <span className="tracking-tight">ExamRooms</span>
        </Link>
        <nav className="hidden items-center gap-2 md:flex">
          {items.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                )
              }
            >
              <Icon className="h-4 w-4" />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          {user ? (
            <Button variant="secondary" size="sm" onClick={logout}>
              Déconnexion
            </Button>
          ) : (
            <Button asChild variant="secondary" size="sm">
              <Link to="/login">Connexion</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}

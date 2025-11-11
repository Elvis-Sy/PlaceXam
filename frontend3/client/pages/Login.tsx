import { FormEvent } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LogIn } from "lucide-react";
import { useNavigate } from "react-router-dom";

const DEMO_USERS = [
  { role: "admin", email: "admin@examrooms.com", password: "admin123", redirect: "/admin/etudiants" },
  { role: "surveillant", email: "surveillant@examrooms.com", password: "demo123", redirect: "/surveillant" },
  { role: "etudiant", email: "etudiant@examrooms.com", password: "demo123", redirect: "/etudiant" },
] as const;

export default function Login() {
  const navigate = useNavigate();

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const email = String(fd.get("email") || "").trim().toLowerCase();
    const password = String(fd.get("password") || "").trim();
    const user = DEMO_USERS.find((u) => u.email === email && u.password === password);
    if (user) {
      try { localStorage.setItem("examrooms_current_user", JSON.stringify({ role: user.role, email: user.email })); } catch {}
      navigate(user.redirect);
      return;
    }
    alert("Identifiants invalides");
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(ellipse_at_top_left,theme(colors.slate.900),theme(colors.slate.800),theme(colors.slate.900))]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,theme(colors.primary/20),transparent_50%)]" />
      <div className="container relative z-10 mx-auto flex min-h-screen items-center justify-center py-12">
        <Card className="w-full max-w-md border-white/10 bg-white p-0 shadow-xl">
          <CardContent className="p-6 sm:p-8">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-slate-900 text-white">
              <LogIn className="h-6 w-6" />
            </div>
            <h1 className="text-center text-2xl font-extrabold text-slate-900">Gestion des Examens</h1>
            <p className="mt-1 text-center text-sm text-muted-foreground">Connectez-vous pour accéder au système</p>

            <form className="mt-6 grid gap-4" onSubmit={onSubmit}>
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="votre.email@example.com"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">Mot de passe</Label>
                <Input id="password" name="password" type="password" required />
              </div>
              <Button type="submit" className="mt-2 h-11 w-full text-base">
                Se connecter
              </Button>
              <div className="pt-2 text-xs text-muted-foreground">
                Démo:
                <div>Admin: admin@examrooms.com / admin123</div>
                <div>Surveillant: surveillant@examrooms.com / demo123</div>
                <div>Étudiant: etudiant@examrooms.com / demo123</div>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
      <p className="relative z-10 pb-8 text-center text-xs text-slate-300">
        Système de gestion des places aux salles d’examen
      </p>
    </div>
  );
}

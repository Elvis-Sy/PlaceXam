import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowRight, BarChart3, CheckCircle2, FileDown, ListChecks, Shield, UserRound, Users } from "lucide-react";
import { Link } from "react-router-dom";

export default function Index() {
  return (
    <main className="min-h-[calc(100vh-8rem)] bg-gradient-to-b from-primary/5 via-background to-background">
      {/* Hero */}
      <section className="container mx-auto grid items-center gap-10 py-16 md:grid-cols-2">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
            Gestion de place aux salles d’examen
          </div>
          <h1 className="mt-4 text-4xl font-extrabold tracking-tight sm:text-5xl">
            Organisez vos examens avec précision, transparence et rapidité
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Application web pour planifier les épreuves, gérer étudiants/salles/surveillants, et affecter automatiquement les candidats selon la capacité et la disponibilité.
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Button asChild size="lg">
              <Link to="/dashboard">
                Démarrer maintenant <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="secondary" size="lg">
              <Link to="#features">Voir les fonctionnalités</Link>
            </Button>
          </div>
          <ul className="mt-6 grid gap-2 text-sm text-muted-foreground">
            <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-600" /> Affectation automatique selon les contraintes</li>
            <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-600" /> Export CSV/Impression, statistiques et rapports</li>
            <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-600" /> Accès sécurisé par rôles: Administrateur, Surveillant, Étudiant</li>
          </ul>
        </div>
        <Card className="border-primary/20 shadow-xl">
          <CardHeader>
            <CardTitle>Aperçu de l’affectation</CardTitle>
            <CardDescription>Exemple de répartition par salle</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Salle</TableHead>
                  <TableHead>Épreuve</TableHead>
                  <TableHead>Étudiants</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell>Amphi A</TableCell>
                  <TableCell>Algèbre (20/01 09:00)</TableCell>
                  <TableCell>60/60</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Salle 101</TableCell>
                  <TableCell>Réseaux (20/01 14:00)</TableCell>
                  <TableCell>28/30</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Salle 202</TableCell>
                  <TableCell>Analyse (21/01 09:00)</TableCell>
                  <TableCell>35/40</TableCell>
                </TableRow>
              </TableBody>
            </Table>
            <div className="mt-4 text-right">
              <Button asChild variant="outline" size="sm">
                <Link to="/dashboard">
                  Générer l'affectation <ListChecks className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Roles CTA */}
      <section className="container mx-auto grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg"><Shield className="h-5 w-5 text-primary" /> Administrateur</CardTitle>
            <CardDescription>Gérez étudiants, salles, examens et surveillants. Lancez l’affectation automatique.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="secondary" className="w-full">
              <Link to="/dashboard">Accéder au tableau de bord</Link>
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg"><Users className="h-5 w-5 text-primary" /> Surveillant</CardTitle>
            <CardDescription>Consultez vos salles et la liste des étudiants présents.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="secondary" className="w-full">
              <Link to="/surveillant">Espace Surveillant</Link>
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg"><UserRound className="h-5 w-5 text-primary" /> Étudiant</CardTitle>
            <CardDescription>Consultez votre salle d’examen par matière, date et heure.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="secondary" className="w-full">
              <Link to="/etudiant">Espace Étudiant</Link>
            </Button>
          </CardContent>
        </Card>
      </section>

      {/* Features */}
      <section id="features" className="container mx-auto grid gap-6 py-16 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Planification des épreuves</CardTitle>
            <CardDescription>Calendrier, sessions (normale, rattrapage) et durées.</CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Créez vos examens par matière avec date, heure et durée. Associez une ou plusieurs salles et les surveillants disponibles.
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Affectation intelligente</CardTitle>
            <CardDescription>Capacité, disponibilité, non-mixité, distribution équitable.</CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            L’algorithme répartit automatiquement les étudiants et garantit les contraintes: capacité, non chevauchement, une seule salle par étudiant.
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Rapports et exports</CardTitle>
            <CardDescription>Fiches par salle/étudiant/matière, statistiques et export.</CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Export CSV, impression, taux d’occupation des salles, nombre d’étudiants affectés et salles utilisées.
          </CardContent>
        </Card>
      </section>

      {/* Stats bar */}
      <section className="border-t bg-secondary/5 py-10">
        <div className="container mx-auto grid items-center gap-4 md:grid-cols-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <BarChart3 className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Occupation estimée</p>
              <p className="text-xl font-semibold">78%</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Étudiants affectés</p>
              <p className="text-xl font-semibold">1 245</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <FileDown className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Exports réalisés</p>
              <p className="text-xl font-semibold">312</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto py-16">
        <Card className="bg-gradient-to-r from-primary/10 via-background to-secondary/10">
          <CardContent className="flex flex-col items-center justify-between gap-6 p-8 text-center md:flex-row md:text-left">
            <div>
              <h2 className="text-2xl font-bold">Prêt à optimiser vos examens ?</h2>
              <p className="mt-1 text-muted-foreground">Générez vos plans de répartition et améliorez la communication entre administration, surveillants et étudiants.</p>
            </div>
            <Button asChild size="lg">
              <Link to="/dashboard">
                Ouvrir le tableau de bord <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}

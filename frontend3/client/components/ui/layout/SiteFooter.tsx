export function SiteFooter() {
  return (
    <footer className="border-t bg-background/60">
      <div className="container mx-auto flex flex-col items-center justify-between gap-6 py-8 md:h-20 md:flex-row">
        <p className="text-center text-sm text-muted-foreground md:text-left">
          © {new Date().getFullYear()} ExamRooms — Gestion des places aux salles d’examen.
        </p>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <a className="hover:text-foreground" href="#features">Fonctionnalités</a>
          <a className="hover:text-foreground" href="#affectation">Affectation</a>
          <a className="hover:text-foreground" href="#contact">Contact</a>
        </div>
      </div>
    </footer>
  );
}

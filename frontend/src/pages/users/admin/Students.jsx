import { useMemo, useState } from "react";
import { Download, Plus, Search } from "lucide-react";


export default function Students() {
  const [query, setQuery] = useState("");
  const [students, setStudents] = useState([]);

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return students.filter((s) =>
      [s.matricule, s.nom, s.prenom, s.filiere, s.niveau].some((v) =>
        String(v || "").toLowerCase().includes(q)
      )
    );
  }, [students, query]);

  function exportCSV() {
    const rows = ["MATRICULE,NOM,PRENOM,FILIERE,NIVEAU"];
    for (const s of filtered) rows.push([s.matricule, s.nom, s.prenom, s.filiere, s.niveau].join(","));
    const blob = new Blob([rows.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "etudiants.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <AdminLayout title="Gestion des Étudiants">
      <div className="rounded-xl border bg-white p-4 shadow-sm">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="relative w-full max-w-xl">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Rechercher un étudiant..."
              className="w-full pl-9"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <Button variant="secondary" onClick={exportCSV}>
              <Download className="mr-2 h-4 w-4" /> Exporter
            </Button>
            <Dialog>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" /> Ajouter
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Ajouter un étudiant</DialogTitle>
                  <DialogDescription>Renseignez les informations de l’étudiant.</DialogDescription>
                </DialogHeader>
                <form
                  className="grid gap-3"
                  onSubmit={(e) => {
                    e.preventDefault();
                    const fd = new FormData(e.currentTarget);
                    const s = {
                      matricule: String(fd.get("matricule") || "").trim(),
                      nom: String(fd.get("nom") || "").trim(),
                      prenom: String(fd.get("prenom") || "").trim(),
                      filiere: String(fd.get("filiere") || "").trim(),
                      niveau: String(fd.get("niveau") || "").trim(),
                    };
                    if (!s.matricule) return;
                    setStudents((prev) => [...prev, s]);
                    (document.querySelector("button[data-close]") || {}).click?.();
                  }}
                >
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="matricule">Matricule</Label>
                      <Input id="matricule" name="matricule" required />
                    </div>
                    <div>
                      <Label htmlFor="niveau">Niveau</Label>
                      <Input id="niveau" name="niveau" />
                    </div>
                    <div>
                      <Label htmlFor="nom">Nom</Label>
                      <Input id="nom" name="nom" />
                    </div>
                    <div>
                      <Label htmlFor="prenom">Prénom</Label>
                      <Input id="prenom" name="prenom" />
                    </div>
                    <div className="col-span-2">
                      <Label htmlFor="filiere">Filière</Label>
                      <Input id="filiere" name="filiere" />
                    </div>
                  </div>
                  <div className="mt-2 flex justify-end gap-2">
                    <Button type="button" variant="outline" data-close>
                      Annuler
                    </Button>
                    <Button type="submit">Enregistrer</Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="overflow-hidden rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50">
                <TableHead className="w-40">MATRICULE</TableHead>
                <TableHead>NOM COMPLET</TableHead>
                <TableHead>FILIÈRE</TableHead>
                <TableHead className="w-40">NIVEAU</TableHead>
                <TableHead className="w-32 text-right">ACTIONS</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-28 text-center text-muted-foreground">
                    Aucun étudiant trouvé
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((s) => (
                  <TableRow key={s.matricule}>
                    <TableCell className="font-mono text-xs">{s.matricule}</TableCell>
                    <TableCell>
                      {s.nom} {s.prenom}
                    </TableCell>
                    <TableCell className="text-muted-foreground">{s.filiere}</TableCell>
                    <TableCell className="text-muted-foreground">{s.niveau}</TableCell>
                    <TableCell className="text-right text-sm text-primary">Modifier</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </AdminLayout>
  );
}

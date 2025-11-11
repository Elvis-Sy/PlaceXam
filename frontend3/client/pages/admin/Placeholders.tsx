import { useMemo, useState } from "react";
import AdminLayout from "./AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Download, Plus, Trash2, Pencil, ClipboardList } from "lucide-react";
import { loadDB, saveDB, type Room, type Matiere, type Surveillant, type Exam } from "@/lib/localdb";

function uid(prefix: string) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

export function AdminDashboard() {
  const db = loadDB();
  const stats = [
    { label: "Étudiants", value: db.students.length },
    { label: "Salles", value: db.rooms.length },
    { label: "Matières", value: (db as any).matieres?.length ?? 0 },
    { label: "Surveillants", value: db.surveillants.length },
    { label: "Examens", value: db.exams.length },
  ];
  const upcoming = db.exams
    .slice()
    .sort((a, b) => new Date(a.dateISO).getTime() - new Date(b.dateISO).getTime())
    .slice(0, 5);

  return (
    <AdminLayout title="Tableau de bord">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {stats.map((s) => (
          <div key={s.label} className="rounded-xl border bg-white p-4 shadow-sm">
            <div className="text-sm text-muted-foreground">{s.label}</div>
            <div className="text-2xl font-semibold">{s.value}</div>
          </div>
        ))}
      </div>

      <div className="mt-6 rounded-xl border bg-white p-4 shadow-sm">
        <div className="mb-3 text-sm font-medium">Prochains examens</div>
        <div className="overflow-hidden rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50">
                <TableHead>MATIÈRE</TableHead>
                <TableHead>DATE</TableHead>
                <TableHead>DURÉE</TableHead>
                <TableHead>SESSION</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {upcoming.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">Aucun examen prévu</TableCell>
                </TableRow>
              ) : (
                upcoming.map((e) => (
                  <TableRow key={e.id}>
                    <TableCell>{e.matiere}</TableCell>
                    <TableCell>{new Date(e.dateISO).toLocaleString()}</TableCell>
                    <TableCell>{e.durationMin} min</TableCell>
                    <TableCell className="capitalize">{e.session}</TableCell>
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

export function AdminSalles() {
  const [db, setDb] = useState(loadDB());
  const [query, setQuery] = useState("");
  const rooms = useMemo(() => db.rooms.filter((r) => `${r.name} ${r.capacity}`.toLowerCase().includes(query.toLowerCase())), [db, query]);

  function addRoom(data: { name: string; capacity: number }) {
    const next: Room = { id: uid("r"), name: data.name.trim(), capacity: Number(data.capacity) || 0 };
    const newDb = { ...db, rooms: [...db.rooms, next] };
    saveDB(newDb); setDb(newDb);
  }
  function removeRoom(id: string) {
    const newDb = { ...db, rooms: db.rooms.filter((r) => r.id !== id) };
    saveDB(newDb); setDb(newDb);
  }

  return (
    <AdminLayout title="Gestion des Salles">
      <div className="rounded-xl border bg-white p-4 shadow-sm">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <Input placeholder="Rechercher une salle..." className="w-full max-w-md" value={query} onChange={(e) => setQuery(e.target.value)} />
          <Dialog>
            <DialogTrigger asChild>
              <Button><Plus className="mr-2 h-4 w-4" /> Ajouter</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Ajouter une salle</DialogTitle>
                <DialogDescription>Renseignez le nom et la capacité.</DialogDescription>
              </DialogHeader>
              <form
                className="grid gap-3"
                onSubmit={(e) => {
                  e.preventDefault();
                  const fd = new FormData(e.currentTarget as HTMLFormElement);
                  const name = String(fd.get("name") || "");
                  const capacity = Number(fd.get("capacity") || 0);
                  if (!name.trim()) return;
                  addRoom({ name, capacity });
                  (document.querySelector("button[data-close]") as HTMLButtonElement)?.click();
                }}
              >
                <div>
                  <Label htmlFor="name">Nom</Label>
                  <Input id="name" name="name" required />
                </div>
                <div>
                  <Label htmlFor="capacity">Capacité</Label>
                  <Input id="capacity" name="capacity" type="number" min={0} />
                </div>
                <div className="mt-2 flex justify-end gap-2">
                  <Button type="button" variant="outline" data-close>Annuler</Button>
                  <Button type="submit">Enregistrer</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="overflow-hidden rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50">
                <TableHead>NOM</TableHead>
                <TableHead className="w-40">CAPACITÉ</TableHead>
                <TableHead className="w-32 text-right">ACTIONS</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rooms.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="h-24 text-center text-muted-foreground">Aucune salle</TableCell>
                </TableRow>
              ) : (
                rooms.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell>{r.name}</TableCell>
                    <TableCell>{r.capacity}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" className="text-destructive" onClick={() => removeRoom(r.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
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

export function AdminMatieres() {
  const [db, setDb] = useState(loadDB());
  const [query, setQuery] = useState("");
  const list = useMemo(() => db.matieres.filter((m) => m.name.toLowerCase().includes(query.toLowerCase())), [db, query]);

  function addMatiere(name: string) {
    const next: Matiere = { id: uid("m"), name: name.trim() };
    const newDb = { ...db, matieres: [...db.matieres, next] };
    saveDB(newDb); setDb(newDb);
  }
  function removeMatiere(id: string) {
    const newDb = { ...db, matieres: db.matieres.filter((m) => m.id !== id) };
    saveDB(newDb); setDb(newDb);
  }

  return (
    <AdminLayout title="Gestion des Matières">
      <div className="rounded-xl border bg-white p-4 shadow-sm">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <Input placeholder="Rechercher une matière..." className="w-full max-w-md" value={query} onChange={(e) => setQuery(e.target.value)} />
          <Dialog>
            <DialogTrigger asChild>
              <Button><Plus className="mr-2 h-4 w-4" /> Ajouter</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Ajouter une matière</DialogTitle>
                <DialogDescription>Renseignez le libellé.</DialogDescription>
              </DialogHeader>
              <form
                className="grid gap-3"
                onSubmit={(e) => {
                  e.preventDefault();
                  const fd = new FormData(e.currentTarget as HTMLFormElement);
                  const name = String(fd.get("name") || "");
                  if (!name.trim()) return;
                  addMatiere(name);
                  (document.querySelector("button[data-close]") as HTMLButtonElement)?.click();
                }}
              >
                <div>
                  <Label htmlFor="name">Nom</Label>
                  <Input id="name" name="name" required />
                </div>
                <div className="mt-2 flex justify-end gap-2">
                  <Button type="button" variant="outline" data-close>Annuler</Button>
                  <Button type="submit">Enregistrer</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="overflow-hidden rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50">
                <TableHead>MATIÈRE</TableHead>
                <TableHead className="w-32 text-right">ACTIONS</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {list.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={2} className="h-24 text-center text-muted-foreground">Aucune matière</TableCell>
                </TableRow>
              ) : (
                list.map((m) => (
                  <TableRow key={m.id}>
                    <TableCell>{m.name}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" className="text-destructive" onClick={() => removeMatiere(m.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
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

export function AdminExamens() {
  const [db, setDb] = useState(loadDB());
  const exams = db.exams;

  function addExam(data: { matiere: string; dateISO: string; durationMin: number; session: "normale" | "rattrapage"; roomId?: string; surveillantId?: string }) {
    const rooms = data.roomId && data.surveillantId ? [{ roomId: data.roomId, surveillantId: data.surveillantId }] : [];
    const exam: Exam = { id: uid("ex"), matiere: data.matiere.trim(), dateISO: data.dateISO, durationMin: Number(data.durationMin) || 0, session: data.session, rooms };
    const newDb = { ...db, exams: [...db.exams, exam] };
    saveDB(newDb); setDb(newDb);
  }
  function removeExam(id: string) {
    const newDb = { ...db, exams: db.exams.filter((e) => e.id !== id) };
    saveDB(newDb); setDb(newDb);
  }

  return (
    <AdminLayout title="Gestion des Examens">
      <div className="rounded-xl border bg-white p-4 shadow-sm">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="text-sm text-muted-foreground">Planifiez des épreuves et affectez une salle/surveillant optionnels.</div>
          <Dialog>
            <DialogTrigger asChild>
              <Button><Plus className="mr-2 h-4 w-4" /> Nouveau</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Créer un examen</DialogTitle>
                <DialogDescription>Renseignez les informations de base.</DialogDescription>
              </DialogHeader>
              <form
                className="grid gap-3"
                onSubmit={(e) => {
                  e.preventDefault();
                  const fd = new FormData(e.currentTarget as HTMLFormElement);
                  const matiere = String(fd.get("matiere") || "").trim();
                  const custom = String(fd.get("matiere_custom") || "").trim();
                  const picked = custom || matiere;
                  if (!picked) return;
                  addExam({
                    matiere: picked,
                    dateISO: String(fd.get("dateISO") || new Date().toISOString()),
                    durationMin: Number(fd.get("durationMin") || 0),
                    session: (String(fd.get("session") || "normale") as "normale" | "rattrapage"),
                    roomId: String(fd.get("roomId") || "" ) || undefined,
                    surveillantId: String(fd.get("surveillantId") || "" ) || undefined,
                  });
                  (document.querySelector("button[data-close]") as HTMLButtonElement)?.click();
                }}
              >
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="matiere">Matière</Label>
                    <select id="matiere" name="matiere" className="mt-1 w-full rounded-md border px-3 py-2 text-sm">
                      <option value="">— Sélectionner —</option>
                      {db.matieres.map((m) => (
                        <option key={m.id} value={m.name}>{m.name}</option>
                      ))}
                    </select>
                    <div className="mt-2">
                      <Label htmlFor="matiere_custom">Ou saisir une matière</Label>
                      <Input id="matiere_custom" name="matiere_custom" placeholder="Ex: Mathématiques" />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="dateISO">Date et heure</Label>
                    <Input id="dateISO" name="dateISO" type="datetime-local" defaultValue={new Date().toISOString().slice(0,16)} />
                    <div className="mt-2 grid grid-cols-2 gap-3">
                      <div>
                        <Label htmlFor="durationMin">Durée (min)</Label>
                        <Input id="durationMin" name="durationMin" type="number" min={0} defaultValue={120} />
                      </div>
                      <div>
                        <Label htmlFor="session">Session</Label>
                        <select id="session" name="session" className="mt-1 w-full rounded-md border px-3 py-2 text-sm">
                          <option value="normale">Normale</option>
                          <option value="rattrapage">Rattrapage</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="roomId">Salle (optionnel)</Label>
                    <select id="roomId" name="roomId" className="mt-1 w-full rounded-md border px-3 py-2 text-sm">
                      <option value="">— Aucune —</option>
                      {db.rooms.map((r) => (
                        <option key={r.id} value={r.id}>{r.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="surveillantId">Surveillant (optionnel)</Label>
                    <select id="surveillantId" name="surveillantId" className="mt-1 w-full rounded-md border px-3 py-2 text-sm">
                      <option value="">— Aucun —</option>
                      {db.surveillants.map((s) => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="mt-2 flex justify-end gap-2">
                  <Button type="button" variant="outline" data-close>Annuler</Button>
                  <Button type="submit">Créer</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="overflow-hidden rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50">
                <TableHead>MATIÈRE</TableHead>
                <TableHead>DATE</TableHead>
                <TableHead className="w-28">DURÉE</TableHead>
                <TableHead>SESSION</TableHead>
                <TableHead>SALLE / SURVEILLANT</TableHead>
                <TableHead className="w-24 text-right">ACTIONS</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {exams.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">Aucun examen</TableCell>
                </TableRow>
              ) : (
                exams.map((e) => {
                  const assignment = e.rooms[0];
                  const room = assignment ? db.rooms.find((r) => r.id === assignment.roomId)?.name : undefined;
                  const surv = assignment ? db.surveillants.find((s) => s.id === assignment.surveillantId)?.name : undefined;
                  return (
                    <TableRow key={e.id}>
                      <TableCell>{e.matiere}</TableCell>
                      <TableCell>{new Date(e.dateISO).toLocaleString()}</TableCell>
                      <TableCell>{e.durationMin} min</TableCell>
                      <TableCell className="capitalize">{e.session}</TableCell>
                      <TableCell>{room ? `${room}${surv ? ` — ${surv}` : ""}` : "—"}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" className="text-destructive" onClick={() => removeExam(e.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </AdminLayout>
  );
}

export function AdminSurveillants() {
  const [db, setDb] = useState(loadDB());
  const [query, setQuery] = useState("");
  const list = useMemo(() => db.surveillants.filter((s) => `${s.name} ${s.email}`.toLowerCase().includes(query.toLowerCase())), [db, query]);

  function addSurv(data: { name: string; email: string }) {
    const next: Surveillant = { id: uid("sv"), name: data.name.trim(), email: data.email.trim() };
    const newDb = { ...db, surveillants: [...db.surveillants, next] };
    saveDB(newDb); setDb(newDb);
  }
  function removeSurv(id: string) {
    const newDb = { ...db, surveillants: db.surveillants.filter((s) => s.id !== id) };
    saveDB(newDb); setDb(newDb);
  }

  return (
    <AdminLayout title="Gestion des Surveillants">
      <div className="rounded-xl border bg-white p-4 shadow-sm">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <Input placeholder="Rechercher..." className="w-full max-w-md" value={query} onChange={(e) => setQuery(e.target.value)} />
          <Dialog>
            <DialogTrigger asChild>
              <Button><Plus className="mr-2 h-4 w-4" /> Ajouter</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Ajouter un surveillant</DialogTitle>
                <DialogDescription>Nom et e-mail.</DialogDescription>
              </DialogHeader>
              <form
                className="grid gap-3"
                onSubmit={(e) => {
                  e.preventDefault();
                  const fd = new FormData(e.currentTarget as HTMLFormElement);
                  const name = String(fd.get("name") || "");
                  const email = String(fd.get("email") || "");
                  if (!name.trim()) return;
                  addSurv({ name, email });
                  (document.querySelector("button[data-close]") as HTMLButtonElement)?.click();
                }}
              >
                <div>
                  <Label htmlFor="name">Nom</Label>
                  <Input id="name" name="name" required />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" name="email" type="email" />
                </div>
                <div className="mt-2 flex justify-end gap-2">
                  <Button type="button" variant="outline" data-close>Annuler</Button>
                  <Button type="submit">Enregistrer</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="overflow-hidden rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50">
                <TableHead>NOM</TableHead>
                <TableHead>EMAIL</TableHead>
                <TableHead className="w-32 text-right">ACTIONS</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {list.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="h-24 text-center text-muted-foreground">Aucun surveillant</TableCell>
                </TableRow>
              ) : (
                list.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell>{s.name}</TableCell>
                    <TableCell className="text-muted-foreground">{s.email}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" className="text-destructive" onClick={() => removeSurv(s.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
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

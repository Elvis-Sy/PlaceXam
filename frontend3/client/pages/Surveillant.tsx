import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { exportToCSV, formatDateTime, loadDB, getCurrentUser, saveDB } from "@/lib/localdb";

export default function Surveillant() {
  const db = loadDB();
  const user = getCurrentUser();
  const mySurveillant = db.surveillants.find((s) => s.email === user?.email);

  const myExamRooms = useMemo(() => {
    const list: { examId: string; roomId: string }[] = [];
    for (const ex of db.exams) {
      for (const r of ex.rooms) if (r.surveillantId === mySurveillant?.id) list.push({ examId: ex.id, roomId: r.roomId });
    }
    return list;
  }, [db, mySurveillant?.id]);

  const [active, setActive] = useState(myExamRooms[0] ?? null);
  const [q, setQ] = useState("");

  const rows = useMemo(() => {
    if (!active) return [] as { matricule: string; nom: string; prenom: string; present?: boolean }[];
    const assigns = db.assigns.filter((a) => a.examId === active.examId && a.roomId === active.roomId);
    return assigns
      .map((a) => {
        const s = db.students.find((x) => x.id === a.studentId)!;
        return { matricule: s.matricule, nom: s.nom, prenom: s.prenom, present: a.present };
      })
      .filter((r) => `${r.matricule} ${r.nom} ${r.prenom}`.toLowerCase().includes(q.toLowerCase()));
  }, [active, db, q]);

  function togglePresence(matricule: string) {
    if (!active) return;
    const student = db.students.find((s) => s.matricule === matricule);
    if (!student) return;
    const idx = db.assigns.findIndex((a) => a.examId === active.examId && a.roomId === active.roomId && a.studentId === student.id);
    if (idx >= 0) {
      db.assigns[idx].present = !db.assigns[idx].present;
      saveDB(db);
    }
  }

  function exportCsv() {
    if (!active) return;
    const exam = db.exams.find((e) => e.id === active.examId)!;
    const room = db.rooms.find((r) => r.id === active.roomId)!;
    exportToCSV(
      `presence_${exam.matiere}_${room.name}.csv`,
      ["MATRICULE", "NOM", "PRENOM", "PRESENT"],
      rows.map((r) => [r.matricule, r.nom, r.prenom, r.present ? "oui" : "non"]),
    );
  }

  return (
    <main className="container mx-auto py-10">
      <Card>
        <CardHeader>
          <CardTitle>Espace Surveillant</CardTitle>
          <CardDescription>Vos salles affectées et la présence des étudiants.</CardDescription>
        </CardHeader>
        <CardContent>
          {myExamRooms.length === 0 ? (
            <p className="text-muted-foreground">Aucune salle affectée.</p>
          ) : (
            <div className="grid gap-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  {myExamRooms.map((er) => {
                    const exam = db.exams.find((e) => e.id === er.examId)!;
                    const room = db.rooms.find((r) => r.id === er.roomId)!;
                    const label = `${exam.matiere} — ${room.name} — ${formatDateTime(exam.dateISO)}`;
                    const activeKey = `${active?.examId}-${active?.roomId}`;
                    const key = `${er.examId}-${er.roomId}`;
                    return (
                      <Button key={key} variant={key === activeKey ? "default" : "secondary"} onClick={() => setActive(er)}>
                        {label}
                      </Button>
                    );
                  })}
                </div>
                <div className="flex items-center gap-2">
                  <Input placeholder="Rechercher..." value={q} onChange={(e) => setQ(e.target.value)} className="w-56" />
                  <Button variant="secondary" onClick={exportCsv}>
                    <Download className="mr-2 h-4 w-4" /> Export CSV
                  </Button>
                </div>
              </div>

              <div className="overflow-hidden rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50">
                      <TableHead className="w-40">MATRICULE</TableHead>
                      <TableHead>NOM</TableHead>
                      <TableHead>PRÉNOM</TableHead>
                      <TableHead className="w-32 text-right">PRÉSENT</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rows.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                          Aucun étudiant
                        </TableCell>
                      </TableRow>
                    ) : (
                      rows.map((r) => (
                        <TableRow key={r.matricule}>
                          <TableCell className="font-mono text-xs">{r.matricule}</TableCell>
                          <TableCell>{r.nom}</TableCell>
                          <TableCell>{r.prenom}</TableCell>
                          <TableCell className="text-right">
                            <input
                              type="checkbox"
                              checked={!!r.present}
                              onChange={() => togglePresence(r.matricule)}
                            />
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  );
}

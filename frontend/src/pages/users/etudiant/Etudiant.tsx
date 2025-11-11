import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { exportToCSV, formatDateTime, loadDB, getCurrentUser } from "@/lib/localdb";

export default function Etudiant() {
  const db = loadDB();
  const user = getCurrentUser();
  const [mat, setMat] = useState(() => {
    const byEmail = db.students.find((s) => s.email && s.email.toLowerCase() === (user?.email || "").toLowerCase());
    return byEmail?.matricule ?? "";
  });

  const student = useMemo(() => db.students.find((s) => s.matricule === mat), [db, mat]);

  const rows = useMemo(() => {
    if (!student) return [] as { matiere: string; date: string; room: string }[];
    const myAssigns = db.assigns.filter((a) => a.studentId === student.id);
    return myAssigns.map((a) => {
      const exam = db.exams.find((e) => e.id === a.examId)!;
      const room = db.rooms.find((r) => r.id === a.roomId)!;
      return { matiere: exam.matiere, date: formatDateTime(exam.dateISO), room: room.name };
    });
  }, [db, student]);

  function exportCsv() {
    exportToCSV(
      `planning_${mat || "etudiant"}.csv`,
      ["MATIÈRE", "DATE", "SALLE"],
      rows.map((r) => [r.matiere, r.date, r.room]),
    );
  }

  return (
    <main className="container mx-auto py-10">
      <Card>
        <CardHeader>
          <CardTitle>Espace Étudiant</CardTitle>
          <CardDescription>Vos épreuves et salles par matière, date et heure.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Input
                placeholder="Saisissez votre matricule"
                value={mat}
                onChange={(e) => setMat(e.target.value.trim())}
                className="w-72"
              />
              <Button variant="secondary" onClick={exportCsv} disabled={!student || rows.length === 0}>
                <Download className="mr-2 h-4 w-4" /> Export CSV
              </Button>
            </div>
            {student ? (
              <div className="text-sm text-muted-foreground">{student.nom} {student.prenom} — {student.filiere} {student.niveau}</div>
            ) : (
              <div className="text-sm text-muted-foreground">Entrez votre matricule pour voir votre planning</div>
            )}
          </div>

          <div className="overflow-hidden rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50">
                  <TableHead>MATIÈRE</TableHead>
                  <TableHead>DATE</TableHead>
                  <TableHead>SALLE</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="h-24 text-center text-muted-foreground">
                      Aucun examen
                    </TableCell>
                  </TableRow>
                ) : (
                  rows.map((r, i) => (
                    <TableRow key={i}>
                      <TableCell>{r.matiere}</TableCell>
                      <TableCell>{r.date}</TableCell>
                      <TableCell>{r.room}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}

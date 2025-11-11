export type Student = { id: string; matricule: string; nom: string; prenom: string; email?: string; filiere: string; niveau: string };
export type Room = { id: string; name: string; capacity: number };
export type Surveillant = { id: string; name: string; email: string };
export type Matiere = { id: string; name: string };
export type ExamRoom = { roomId: string; surveillantId: string };
export type Exam = { id: string; matiere: string; dateISO: string; durationMin: number; session: "normale" | "rattrapage"; rooms: ExamRoom[] };
export type Assignment = { examId: string; roomId: string; studentId: string; present?: boolean };

export type DB = {
  students: Student[];
  rooms: Room[];
  surveillants: Surveillant[];
  matieres: Matiere[];
  exams: Exam[];
  assigns: Assignment[];
};

const KEY = "examrooms_local_db_v1";

const seed: DB = {
  students: [
    { id: "stu-1", matricule: "STU001", nom: "KONE", prenom: "Aïcha", email: "etudiant@examrooms.com", filiere: "Informatique", niveau: "L3" },
    { id: "stu-2", matricule: "STU002", nom: "N'DIAYE", prenom: "Moussa", filiere: "Réseaux", niveau: "M1" },
    { id: "stu-3", matricule: "STU003", nom: "DIALLO", prenom: "Fatou", filiere: "Maths", niveau: "L2" },
  ],
  rooms: [
    { id: "r1", name: "Amphi A", capacity: 60 },
    { id: "r2", name: "Salle 101", capacity: 30 },
    { id: "r3", name: "Salle 202", capacity: 40 },
  ],
  surveillants: [
    { id: "sv-1", name: "M. Traoré", email: "surveillant@examrooms.com" },
    { id: "sv-2", name: "Mme. Bah", email: "surv2@example.com" },
  ],
  matieres: [
    { id: "m1", name: "Algèbre" },
    { id: "m2", name: "Réseaux" },
    { id: "m3", name: "Analyse" },
  ],
  exams: [
    {
      id: "ex-1",
      matiere: "Algèbre",
      dateISO: new Date(new Date().setHours(9, 0, 0, 0)).toISOString(),
      durationMin: 120,
      session: "normale",
      rooms: [
        { roomId: "r1", surveillantId: "sv-1" },
        { roomId: "r2", surveillantId: "sv-2" },
      ],
    },
    {
      id: "ex-2",
      matiere: "Réseaux",
      dateISO: new Date(new Date().setDate(new Date().getDate() + 0)).toISOString(),
      durationMin: 90,
      session: "normale",
      rooms: [{ roomId: "r2", surveillantId: "sv-1" }],
    },
    {
      id: "ex-3",
      matiere: "Analyse",
      dateISO: new Date(new Date().setDate(new Date().getDate() + 1)).toISOString(),
      durationMin: 120,
      session: "rattrapage",
      rooms: [{ roomId: "r3", surveillantId: "sv-2" }],
    },
  ],
  assigns: [
    { examId: "ex-1", roomId: "r1", studentId: "stu-1", present: false },
    { examId: "ex-1", roomId: "r1", studentId: "stu-2", present: false },
    { examId: "ex-1", roomId: "r2", studentId: "stu-3", present: false },
    { examId: "ex-2", roomId: "r2", studentId: "stu-1", present: false },
  ],
};

export function loadDB(): DB {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) {
      localStorage.setItem(KEY, JSON.stringify(seed));
      return JSON.parse(JSON.stringify(seed));
    }
    const parsed = JSON.parse(raw) as any;
    if (!Array.isArray(parsed.matieres)) parsed.matieres = seed.matieres;
    if (!Array.isArray(parsed.students)) parsed.students = seed.students;
    if (!Array.isArray(parsed.rooms)) parsed.rooms = seed.rooms;
    if (!Array.isArray(parsed.surveillants)) parsed.surveillants = seed.surveillants;
    if (!Array.isArray(parsed.exams)) parsed.exams = seed.exams;
    if (!Array.isArray(parsed.assigns)) parsed.assigns = seed.assigns;
    return parsed as DB;
  } catch {
    return JSON.parse(JSON.stringify(seed));
  }
}

export function saveDB(db: DB) {
  localStorage.setItem(KEY, JSON.stringify(db));
}

export function getCurrentUser() {
  try {
    const raw = localStorage.getItem("examrooms_current_user");
    return raw ? JSON.parse(raw) as { role: "admin" | "surveillant" | "etudiant"; email: string } : null;
  } catch {
    return null;
  }
}

export function setCurrentUser(u: { role: "admin" | "surveillant" | "etudiant"; email: string }) {
  localStorage.setItem("examrooms_current_user", JSON.stringify(u));
}

export function exportToCSV(filename: string, headers: string[], rows: (string | number)[][]) {
  const content = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
  const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename; a.click(); URL.revokeObjectURL(url);
}

export function formatDateTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
}

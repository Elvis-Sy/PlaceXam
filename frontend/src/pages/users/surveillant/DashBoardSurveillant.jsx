import React, { useEffect, useState, useMemo } from "react";
import DataTable from "../../../components/ui/DataTable";
import { getAllSupervisions } from "../../../services/supervisions";
import axios from "../../../api/axios";
import { Calendar, Users } from "lucide-react";

export default function DashboardSurveillant() {
  const [supervisions, setSupervisions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        // try get profile to know current surveillant id
        const p = await axios.get("/auth/profile").then((r) => r.data || r);
        setUserId(p.id ?? null);
      } catch (_) {
        // ignore, fall back to filtering later (if prop passed or server returns surveillant in entries)
      }
      try {
        const data = await getAllSupervisions();
        setSupervisions(Array.isArray(data) ? data : data?.data ?? []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const mine = useMemo(() => {
    if (!userId) return supervisions.filter((s) => s.surveillant || s.Surveillant);
    return supervisions.filter(
      (s) => String(s.surveillant?.id ?? s.Surveillant?.id ?? s.surveillantId) === String(userId)
    );
  }, [supervisions, userId]);

  const salles = useMemo(() => {
    const set = new Set();
    for (const s of mine) {
      const lbl = s.salle?.label ?? s.Salle?.label ?? s.Place?.Salle?.label;
      if (lbl) set.add(lbl);
    }
    return Array.from(set);
  }, [mine]);

  const upcomingExams = useMemo(() => {
    const now = Date.now();
    return mine
      .filter((s) => s.Exam?.date && new Date(s.Exam.date).getTime() >= now)
      .sort((a, b) => new Date(a.Exam.date) - new Date(b.Exam.date))
      .map((s, i) => ({
        id: s.id ?? `s_${i}`,
        index: i + 1,
        examLabel: s.Exam?.Matiere?.label ?? `Exam ${s.examId ?? ""}`,
        date: s.Exam?.date ?? null,
        salle: s.salle?.label ?? s.Salle?.label ?? s.Place?.Salle?.label ?? "-",
      }));
  }, [mine]);

  const columns = useMemo(
    () => [
      { field: "index", headerName: "#", width: 60 },
      {
        field: "examLabel",
        headerName: "Examen",
        width: 320,
        renderCell: (r) => <div className="font-medium">{r.examLabel}</div>,
      },
      {
        field: "date",
        headerName: "Date & heure",
        width: 220,
        renderCell: (r) => (r.date ? new Date(r.date).toLocaleString("fr-FR") : "-"),
      },
      { field: "salle", headerName: "Salle", width: 140 },
    ],
    []
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-slate-800">Tableau de bord — Surveillant</h1>
          <p className="text-sm text-slate-500 mt-1">Résumé des salles et sessions que vous supervisez.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-white border rounded-lg shadow-sm">
          <div className="flex items-center gap-3">
            <Users />
            <div>
              <div className="text-sm text-slate-500">Salles surveillées</div>
              <div className="text-2xl font-semibold">{salles.length}</div>
            </div>
          </div>
        </div>

        <div className="p-4 bg-white border rounded-lg shadow-sm md:col-span-2">
          <div className="flex items-center justify-between mb-2">
            <div className="font-medium">Prochains examens</div>
            <div className="text-xs text-slate-400">{upcomingExams.length} à venir</div>
          </div>

          {loading ? (
            <div className="p-6 text-center">Chargement...</div>
          ) : (
            <DataTable columns={columns} rows={upcomingExams} initialPageSize={5} rowsPerPageOptions={[5, 10]} />
          )}
        </div>
      </div>
    </div>
  );
}
import React, { useEffect, useState, useMemo } from "react";
import DataTable from "../../../components/ui/DataTable";
import { getAllSupervisions } from "../../../services/supervisions";
import axios from "../../../api/axios";

export default function CalendarsSurveillant() {
  const [supervisions, setSupervisions] = useState([]);
  const [calendriers, setCalendriers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const p = await axios.get("/auth/profile").then((r) => r.data || r);
        setUserId(p.id ?? null);
      } catch (_) {}
      try {
        const s = await getAllSupervisions();
        setSupervisions(Array.isArray(s) ? s : s?.data ?? []);
      } catch (e) {
        console.error(e);
      }
      try {
        const c = await axios.get("/calendriers").then((r) => r.data || r);
        setCalendriers(Array.isArray(c) ? c : c?.data ?? []);
      } catch (e) {
        console.warn("calendriers fetch failed", e);
        setCalendriers([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const mySalleIds = useMemo(() => {
    const set = new Set();
    for (const s of supervisions) {
      const survId = s.surveillant?.id ?? s.Surveillant?.id ?? s.surveillantId;
      if (userId && String(survId) !== String(userId)) continue;
      const salleId = s.salleId ?? s.salle?.id ?? s.Salle?.id ?? s.Place?.Salle?.id;
      if (salleId) set.add(String(salleId));
    }
    return Array.from(set);
  }, [supervisions, userId]);

  const rows = useMemo(() => {
    return calendriers
      .filter((c) => mySalleIds.length === 0 || mySalleIds.includes(String(c.salleId)))
      .map((c, i) => ({
        id: c.id ?? `cal_${i}`,
        index: i + 1,
        salle: c.Salle?.label ?? c.salleLabel ?? c.salleId ?? "-",
        exam: c.Exam?.Matiere?.label ?? `Exam ${c.examId ?? ""}`,
        start: c.start_time ?? c.start ?? null,
        end: c.end_time ?? c.end ?? null,
      }));
  }, [calendriers, mySalleIds]);

  const columns = [
    { field: "index", headerName: "#", width: 60 },
    { field: "salle", headerName: "Salle", width: 160 },
    { field: "exam", headerName: "Examen", width: 260 },
    {
      field: "start",
      headerName: "Début",
      width: 200,
      renderCell: (r) => (r.start ? new Date(r.start).toLocaleString("fr-FR") : "-"),
    },
    {
      field: "end",
      headerName: "Fin",
      width: 200,
      renderCell: (r) => (r.end ? new Date(r.end).toLocaleString("fr-FR") : "-"),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-slate-800">Mes calendriers</h1>
          <p className="text-sm text-slate-500 mt-1">Créneaux pour les salles que vous surveillez.</p>
        </div>
      </div>

      <div className="bg-white border rounded-lg shadow-sm p-4">
        {loading ? (
          <div className="p-8 text-center">Chargement...</div>
        ) : (
          <DataTable columns={columns} rows={rows} initialPageSize={10} rowsPerPageOptions={[5, 10, 25]} />
        )}
      </div>
    </div>
  );
}
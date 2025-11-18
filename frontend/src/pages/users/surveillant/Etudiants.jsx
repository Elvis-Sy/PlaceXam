import React, { useEffect, useState, useMemo } from "react";
import DataTable from "../../../components/ui/DataTable";
import { getAllSupervisions } from "../../../services/supervisions";
import axios from "../../../api/axios";

export default function StudentsSurveillant() {
  const [supervisions, setSupervisions] = useState([]);
  const [affectations, setAffectations] = useState([]);
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
        const a = await axios.get("/affectations").then((r) => r.data || r);
        setAffectations(Array.isArray(a) ? a : a?.data ?? []);
      } catch (e) {
        console.warn("affectations fetch failed", e);
        setAffectations([]);
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
    return affectations
      .filter((a) => {
        const sid = a.Place?.Salle?.id ?? a.Place?.SalleId ?? a.salleId ?? a.salle?.id;
        if (!sid) return false;
        return mySalleIds.length === 0 || mySalleIds.includes(String(sid));
      })
      .map((a, i) => ({
        id: a.id ?? `aff_${i}`,
        index: i + 1,
        student: a.etudiant?.fullname ?? a.etudiantName ?? "-",
        email: a.etudiant?.email ?? "-",
        exam: a.Exam?.Matiere?.label ?? a.Exam?.id ?? "-",
        salle: a.Place?.Salle?.label ?? "-",
        place: a.Place?.numero ?? a.placeNumero ?? "-",
      }));
  }, [affectations, mySalleIds]);

  const columns = [
    { field: "index", headerName: "#", width: 60 },
    {
      field: "student",
      headerName: "Étudiant",
      width: 260,
      renderCell: (r) => <div className="font-medium">{r.student}</div>,
    },
    { field: "email", headerName: "Email", width: 240 },
    { field: "exam", headerName: "Examen", width: 220 },
    { field: "salle", headerName: "Salle", width: 120 },
    { field: "place", headerName: "Place", width: 100 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-slate-800">Étudiants — Mes salles</h1>
          <p className="text-sm text-slate-500 mt-1">Liste des étudiants affectés dans les salles que vous surveillez.</p>
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
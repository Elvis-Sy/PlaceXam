import React, { useEffect, useState, useMemo } from "react";
import DataTable from "../../../components/UI/DataTable";
import { getMySupervisions, getMySalles } from "../../../services/sideSurveillant";
import { Users } from "lucide-react";

export default function DashboardSurveillant() {
  const [supervisions, setSupervisions] = useState([]);
  const [salles, setSalles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const [sres, sal] = await Promise.all([getMySupervisions(), getMySalles()]);
        setSupervisions(Array.isArray(sres) ? sres : sres?.data ?? []);
        setSalles(Array.isArray(sal) ? sal : sal?.data ?? []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const upcoming = useMemo(() => {
    return (supervisions || [])
      .filter((s) => s.Exam && s.Exam.date)
      .map((s, i) => ({
        id: s.id ?? `s_${i}`,
        index: i + 1,
        examLabel: s.Exam?.Matiere?.label ?? "Examen",
        date: s.Exam?.date ?? null,
        salle: s.salle?.label ?? s.Salle?.label ?? "-",
      }))
      .sort((a, b) => new Date(a.date) - new Date(b.date));
  }, [supervisions]);

  const columns = useMemo(() => [
    { field: "index", headerName: "#", width: 60 },
    { field: "examLabel", headerName: "Examen", width: 320 },
    { field: "date", headerName: "Date", width: 220, renderCell: (r) => (r.date ? new Date(r.date).toLocaleString("fr-FR") : "-") },
    { field: "salle", headerName: "Salle", width: 140 },
  ], []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-slate-800">Dashboard Admin</h1>
          <p className="text-sm text-slate-500 mt-1">Salles que vous surveillez et prochains examens.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <div className="bg-white shadow rounded p-4 max-w-xs">
          <div className="flex items-center gap-3">
            <Users />
            <div className="text-center w-full">
              <div className="text-lg font-semibold text-slate-500">Salles surveillées</div>
              <div className="text-2xl font-semibold">{salles.length}</div>
            </div>
          </div>
        </div>

        <div className="p-4 bg-white">
          <div className="font-medium mb-4 text-xl text-slate-800">Prochains examens</div>
          {loading ? <div className="p-6 text-center">Chargement...</div> : <DataTable columns={columns} rows={upcoming} initialPageSize={5} />}
        </div>
      </div>
    </div>
  );
}
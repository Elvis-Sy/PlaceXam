import React, { useEffect, useState, useMemo } from "react";
import {
  getAllAffectations,
  getAffectationsByExam,
  getRoomOccupancy,
  autoAffectStudents,
} from "../../../services/affectations";
import { getAllExams } from "../../../services/exams";
import { Zap, Search, Eye, Calendar, AlertCircle } from "lucide-react";
import DataTable from "../../../components/ui/DataTable";

function IconButton({ children, className = "", ...props }) {
  return (
    <button
      {...props}
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium shadow-sm hover:shadow-md transition-shadow ${className}`}
    >
      {children}
    </button>
  );
}

function Modal({ open, onClose, title, children }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Background */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm animate-fadeIn"
        onClick={onClose}
      />

      {/* Container */}
      <div className="relative z-10 w-full max-w-2xl mx-4 animate-scaleIn">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-500/80 bg-slate-50">
            <h3 className="text-lg font-bold text-slate-800">{title}</h3>
            <button
              onClick={onClose}
              className="text-slate-600 hover:bg-slate-200 p-1 rounded transition"
            >
              ✕
            </button>
          </div>

          <div className="p-6">{children}</div>
        </div>
      </div>
      <style>{`
        @keyframes scaleIn { from { opacity: 0; transform: scale(0.95); } to { opacity:1; transform:scale(1); }}
        .animate-scaleIn { animation: scaleIn .18s ease-out; }
        @keyframes fadeIn { from { opacity:0;} to { opacity:1;} }
        .animate-fadeIn { animation: fadeIn .25s ease-out; }
      `}</style>

    </div>
  );
}

export default function Affectations() {
  const [affectations, setAffectations] = useState([]);
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);
  const [query, setQuery] = useState("");
  const [selectedExamId, setSelectedExamId] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [modalData, setModalData] = useState(null);
  const [autoAssigning, setAutoAssigning] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    setErr(null);
    try {
      // Récupérer les examens ET les affectations en parallèle
      const [affRes, exRes] = await Promise.all([
        getAllAffectations(),
        getAllExams(),
      ]);

      const affData = Array.isArray(affRes) ? affRes : affRes?.data ?? affRes ?? [];
      const exData = Array.isArray(exRes) ? exRes : exRes?.data ?? exRes ?? [];
      console.log(exData)
      
      setAffectations(affData);
      setExams(exData);
    } catch (e) {
      console.error("Erreur :", e);
      setErr(e?.message || "Impossible de récupérer les données");
    } finally {
      setLoading(false);
    }
  }

  const filtered = useMemo(() => {
    let result = affectations;

    if (selectedExamId) {
      result = result.filter((a) => String(a.Exam?.id) === String(selectedExamId));
    }

    if (query.trim()) {
      const q = query.toLowerCase();
      result = result.filter((a) => {
        const student = String(a.etudiant?.fullname ?? "").toLowerCase();
        const place = String(a.Place?.numero ?? "").toLowerCase();
        const salle = String(a.Place?.Salle?.label ?? "").toLowerCase();
        return (
          student.includes(q) ||
          place.includes(q) ||
          salle.includes(q)
        );
      });
    }

    return result;
  }, [affectations, query, selectedExamId]);

  const columns = useMemo(() => [
    { field: "index", headerName: "#", width: 60 },
    {
      field: "student",
      headerName: "Étudiant",
      width: 300,
      renderCell: (r) => (
        <div>
          <div className="font-medium">{r.etudiant?.fullname ?? "-"}</div>
          <div className="text-xs text-slate-400">{r.etudiant?.email ?? ""}</div>
        </div>
      ),
    },
    {
      field: "niveau",
      headerName: "Niveau",
      width: 110,
      renderCell: (r) => (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
          {r.etudiant?.niveau ?? "-"}
        </span>
      ),
    },
    {
      field: "salle",
      headerName: "Salle",
      width: 160,
      renderCell: (r) => r.Place?.Salle?.label ?? "-",
    },
    {
      field: "place",
      headerName: "Place",
      width: 110,
      renderCell: (r) => (
        <span className="inline-flex items-center px-2 py-1 rounded-md bg-slate-100 text-slate-700 text-xs font-semibold">
          Place {r.Place?.numero ?? "-"}
        </span>
      ),
    },
    {
      field: "exam",
      headerName: "Examen",
      width: 260,
      renderCell: (r) => (
        <>
          {r.Exam?.Matiere?.label ?? "-"}{" "}
          <span className="text-xs text-slate-500">({new Date(r.Exam?.date).toLocaleDateString("fr-FR")})</span>
        </>
      ),
    },
    {
      field: "actions",
      headerName: "Actions",
      align: "right",
      renderCell: (r) => (
        <div className="inline-flex gap-2">
          <button
            className="p-2 rounded-md bg-indigo-50 text-indigo-600 hover:bg-indigo-100"
            onClick={(e) => {
              e.stopPropagation();
              openOccupancyModal(r.Place?.Salle?.id);
            }}
            title="Voir l'occupation de la salle"
          >
            <Eye size={16} />
          </button>
        </div>
      ),
    },
  ], [openOccupancyModal]);

  const rowsForTable = filtered.map((a, i) => ({ ...a, index: i + 1 }));

  async function handleAutoAssign(examId) {
    if (!examId) {
      alert("Sélectionner un examen");
      return;
    }
    if (!confirm("Êtes-vous sûr de vouloir faire une affectation automatique ? Les affectations existantes seront remplacées.")) {
      return;
    }

    setAutoAssigning(true);
    try {
      const res = await autoAffectStudents(examId);
      alert(`✓ Affectation réussie ! ${res.count ?? 0} étudiants affectés.`);
      await fetchData();
      setSelectedExamId("");
    } catch (e) {
      console.error("Erreur auto-assign :", e);
      const errorMsg = e?.response?.data?.error ?? e?.message ?? "Erreur lors de l'affectation automatique";
      alert(`✗ ${errorMsg}`);
    } finally {
      setAutoAssigning(false);
    }
  }

  async function openOccupancyModal(salleId) {
    try {
      const date = new Date().toISOString().split("T")[0];
      const res = await getRoomOccupancy(salleId, date);
      setModalData(res);
      setModalOpen(true);
    } catch (e) {
      alert("Erreur lors du chargement de l'occupation : " + e?.message);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-slate-800">Affectations</h1>
          <p className="text-sm text-slate-500 mt-1">
            Affectation automatique des étudiants et visualisation des places.
          </p>
        </div>

        <IconButton
          onClick={() => handleAutoAssign(selectedExamId)}
          disabled={autoAssigning || !selectedExamId}
          className="bg-amber-600 text-white hover:bg-amber-700 disabled:opacity-50"
          title={!selectedExamId ? "Sélectionner un examen d'abord" : ""}
        >
          <Zap size={16} /> {autoAssigning ? "Traitement..." : "Affectation Auto"}
        </IconButton>
      </div>

      {/* Info Box */}
      {exams.length === 0 && !loading && (
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-center gap-3 text-yellow-800">
          <AlertCircle size={20} />
          <div>
            <div className="font-semibold">Aucun examen trouvé</div>
            <div className="text-sm">Créez un examen d'abord avant de faire une affectation automatique.</div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex items-center justify-end gap-3 p-4 rounded-lg">
        <div className="flex items-center gap-2 bg-white border border-gray-500/80 rounded-md shadow-sm px-3 py-2">
          <Search className="text-slate-400" />
          <input
            placeholder="Chercher un étudiant, une salle, une place..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="outline-none px-2 text-sm min-w-80"
          />
        </div>

        <select
          value={selectedExamId}
          onChange={(e) => setSelectedExamId(e.target.value)}
          className="px-3 py-2 rounded-md border border-gray-500/80 text-gray-700 text-sm font-medium"
        >
          <option value="">Sélectionner un examen</option>
          {exams.map((exam) => (
            <option key={exam.id} value={exam.id}>
              {exam?.Matiere?.label ?? "-"} - {exam?.Matiere?.niveau}{" "}
              <span className="text-xs text-slate-500">({new Date(exam?.date).toLocaleDateString("fr-FR")})</span>
            </option>
          ))}
        </select>
      </div>

      {err && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3 text-red-700">
          <AlertCircle size={20} />
          <div>
            <div className="font-semibold">Erreur</div>
            <div className="text-sm">{err}</div>
          </div>
        </div>
      )}

      {/* Table */}
      {loading ? (
          <div className="p-8 text-center">⏳ Chargement...</div>
        ) : (
          <DataTable
            columns={columns}
            rows={rowsForTable}
            initialPageSize={10}
            rowsPerPageOptions={[5, 10, 25]}
            dense={false}
            onRowClick={(row) => openOccupancyModal(row.Place?.Salle?.id)}
          />
      )}

      {/* Occupancy Modal */}
      <Modal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setModalData(null);
        }}
        title={`Occupation de la salle`}
      >
        {modalData && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <Calendar size={16} />
              <span>{new Date(modalData.date).toLocaleDateString("fr-FR")}</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-64 overflow-y-auto">
              {modalData.places.map((place) => (
                <div
                  key={place.id}
                  className={`p-3 rounded-lg border-2 ${
                    place.occupied
                      ? "bg-red-50 border-red-300"
                      : "bg-green-50 border-green-300"
                  }`}
                >
                  <div className="font-semibold text-sm">Place {place.numero}</div>
                  {place.occupied && place.occupant ? (
                    <>
                      <div className="text-xs text-slate-600 mt-1">
                        {place.occupant.fullname}
                      </div>
                      <div className="text-xs text-slate-500">
                        {place.occupant.email}
                      </div>
                    </>
                  ) : (
                    <div className="text-xs text-slate-500 italic">Libre</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
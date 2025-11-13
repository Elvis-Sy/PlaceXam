import React, { useEffect, useState, useMemo } from "react";
import {
  getAllAffectations,
  getAffectationsByExam,
  getRoomOccupancy,
  autoAffectStudents,
} from "../../../services/affectationService";
import { getAllExams } from "../../../services/exams";
import { Zap, Search, Eye, Calendar, AlertCircle } from "lucide-react";

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

function Modal({ open, onClose, children, title }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-2xl mx-4 max-h-96 overflow-y-auto">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3 border-b sticky top-0 bg-white">
            <h3 className="text-lg font-semibold">{title}</h3>
            <button onClick={onClose} className="p-1 rounded-md hover:bg-slate-100">
              ✕
            </button>
          </div>
          <div className="p-5">{children}</div>
        </div>
      </div>
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
        const student = a.etudiant?.fullname ?? "";
        const place = a.Place?.numero ?? "";
        const salle = a.Place?.Salle?.label ?? "";
        return (
          student.toLowerCase().includes(q) ||
          place.toLowerCase().includes(q) ||
          salle.toLowerCase().includes(q)
        );
      });
    }

    return result;
  }, [affectations, query, selectedExamId]);

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
          <h1 className="text-2xl font-bold">Gestion des affectations</h1>
          <p className="text-sm text-slate-500">
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
      <div className="flex items-center gap-3 bg-white p-4 rounded-lg border shadow-sm">
        <div className="flex items-center gap-2 flex-1 bg-slate-50 border rounded-md px-3 py-2">
          <Search size={16} className="text-slate-400" />
          <input
            placeholder="Chercher un étudiant, une salle, une place..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="outline-none bg-transparent px-2 py-1 text-sm flex-1"
          />
        </div>

        <select
          value={selectedExamId}
          onChange={(e) => setSelectedExamId(e.target.value)}
          className="px-3 py-2 rounded-md border text-sm font-medium"
        >
          <option value="">Sélectionner un examen</option>
          {exams.map((exam) => (
            <option key={exam.id} value={exam.id}>
              Examen {exam.id} - {new Date(exam.date).toLocaleDateString("fr-FR")}
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
      <div className="bg-white border rounded-lg shadow-sm overflow-hidden">
        <table className="min-w-full divide-y">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-slate-500">#</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-slate-500">Étudiant</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-slate-500">Niveau</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-slate-500">Salle</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-slate-500">Place</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-slate-500">Examen</th>
              <th className="px-4 py-3 text-right text-sm font-medium text-slate-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {loading ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-slate-400">
                  ⏳ Chargement...
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-slate-400">
                  {affectations.length === 0
                    ? "Aucune affectation. Cliquez sur 'Affectation Auto' pour en créer."
                    : "Aucune affectation correspondant aux critères."}
                </td>
              </tr>
            ) : (
              filtered.map((a, i) => (
                <tr
                  key={a.id}
                  className="hover:bg-slate-50 transition-colors"
                >
                  <td className="px-4 py-3 text-sm text-slate-600">{i + 1}</td>
                  <td className="px-4 py-3">
                    <div className="font-medium">{a.etudiant?.fullname ?? "-"}</div>
                    <div className="text-xs text-slate-400">{a.etudiant?.email ?? ""}</div>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                      {a.etudiant?.niveau ?? "-"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm font-medium">
                    {a.Place?.Salle?.label ?? "-"}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <span className="inline-flex items-center px-2 py-1 rounded-md bg-slate-100 text-slate-700 text-xs font-semibold">
                      Place {a.Place?.numero ?? "-"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-600">
                    {a.Exam?.id} ({new Date(a.Exam?.date).toLocaleDateString("fr-FR")})
                  </td>
                  <td className="px-4 py-3 text-right text-sm">
                    <IconButton
                      onClick={() => openOccupancyModal(a.Place?.Salle?.id)}
                      className="bg-indigo-50 text-indigo-600 hover:bg-indigo-100"
                      title="Voir l'occupation de la salle"
                    >
                      <Eye size={16} />
                    </IconButton>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

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
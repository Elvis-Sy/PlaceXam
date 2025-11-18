import React, { useEffect, useState, useMemo } from "react";
import DataTable from "../../../components/UI/DataTable";
import {
  getAllSupervisions,
  createSupervision,
  updateSupervision,
  deleteSupervision,
} from "../../../services/supervisions";
import { getAllExams } from "../../../services/exams";
import { getUsersByRole } from "../../../services/users";
import { Plus, Search, Download, AlertCircle } from "lucide-react";

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
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm animate-fadeIn" onClick={onClose} />
      <div className="relative z-10 w-full max-w-xl mx-4 animate-scaleIn">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-500/80 bg-slate-50">
            <h3 className="text-lg font-bold text-slate-800">{title}</h3>
            <button onClick={onClose} className="text-slate-600 hover:bg-slate-200 p-1 rounded transition">
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

export default function Supervision() {
  const [supervisions, setSupervisions] = useState([]);
  const [exams, setExams] = useState([]);
  const [surveillants, setSurveillants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);
  const [query, setQuery] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [editingSupervision, setEditingSupervision] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    setErr(null);
    try {
      const [supRes, exRes, surRes] = await Promise.all([
        getAllSupervisions(),
        getAllExams(),
        getUsersByRole("surveillant"),
      ]);

      const supData = Array.isArray(supRes) ? supRes : supRes?.data ?? supRes ?? [];
      const exData = Array.isArray(exRes) ? exRes : exRes?.data ?? exRes ?? [];
      const surData = Array.isArray(surRes) ? surRes : surRes?.data ?? surRes?.users ?? [];

      setSupervisions(supData);
      setExams(exData);
      setSurveillants(surData);
    } catch (e) {
      console.error("Erreur :", e);
      setErr(e?.message || "Impossible de récupérer les données");
    } finally {
      setLoading(false);
    }
  }

  const filtered = useMemo(() => {
    let result = supervisions;

    if (query.trim()) {
      const q = query.toLowerCase();
      result = result.filter((s) => {
        const examMatiere = s.Exam?.Matiere?.label ?? "";
        const surveillantName = s.surveillant?.fullname ?? "";
        return (
          examMatiere.toLowerCase().includes(q) ||
          surveillantName.toLowerCase().includes(q)
        );
      });
    }

    return result;
  }, [supervisions, query]);

  function openCreate() {
    setEditingSupervision({ examId: "", surveillantId: "" });
    setModalOpen(true);
  }

  function openEdit(s) {
    setEditingSupervision({ ...s });
    setModalOpen(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingSupervision.id) {
        await updateSupervision(editingSupervision.id, editingSupervision);
      } else {
        await createSupervision(editingSupervision);
      }
      setModalOpen(false);
      setEditingSupervision(null);
      await fetchData();
    } catch (e) {
      alert(e?.response?.data?.error ?? e?.message ?? "Erreur");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id) {
    try {
      await deleteSupervision(id);
      await fetchData();
    } catch (e) {
      alert(e?.response?.data?.error ?? e?.message ?? "Erreur suppression");
    } finally {
      setDeleteOpen(false);
      setDeleteTarget(null);
    }
  }

  const columns = [
    {
      field: "index",
      headerName: "#",
      width: 60,
      renderCell: (row, index) => index + 1,
    },
    {
      field: "Exam",
      headerName: "Examen",
      width: 200,
      renderCell: (row) => {
        const matiere = row.Exam?.Matiere?.label ?? "-";
        const date = row.Exam?.date ? new Date(row.Exam.date).toLocaleDateString("fr-FR") : "";
        return `${matiere} (${date})`;
      },
    },
    {
      field: "surveillant",
      headerName: "Surveillant",
      width: 220,
      renderCell: (row) => (
        <div>
          <div className="font-medium">{row.surveillant?.fullname ?? "-"}</div>
          <div className="text-xs text-slate-400">{row.surveillant?.email ?? ""}</div>
        </div>
      ),
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 120,
      align: "right",
      renderCell: (row) => (
        <div className="inline-flex gap-2">
          <button
            onClick={() => openEdit(row)}
            className="p-2 rounded-md hover:bg-slate-100 transition"
            title="Éditer"
          >
            ✏️
          </button>
          <button
            onClick={() => {
              setDeleteTarget(row);
              setDeleteOpen(true);
            }}
            className="p-2 rounded-md hover:bg-red-50 text-red-600 transition"
            title="Supprimer"
          >
            🗑️
          </button>
        </div>
      ),
    },
  ];

  const exportCSV = () => {
    const rows = [["Examen", "Surveillant", "Email"]];
    for (const s of filtered) {
      rows.push([
        s.Exam?.Matiere?.label ?? "",
        s.surveillant?.fullname ?? "",
        s.surveillant?.email ?? "",
      ]);
    }
    const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "supervisions.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-slate-800">Supervisions</h1>
          <p className="text-sm text-slate-500 mt-1">
            Gestion des supervisions des examens par les surveillants.
          </p>
        </div>

        <IconButton
          onClick={openCreate}
          className="bg-indigo-600 text-white hover:bg-indigo-700"
        >
          <Plus size={16} /> Créer
        </IconButton>
      </div>

      {/* Info Box */}
      {supervisions.length === 0 && !loading && (
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-center gap-3 text-yellow-800">
          <AlertCircle size={20} />
          <div>
            <div className="font-semibold">Aucune supervision trouvée</div>
            <div className="text-sm">Créez une supervision en cliquant sur "Créer".</div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex items-center justify-between gap-3 p-4 rounded-lg">
        <div className="flex items-center gap-2 bg-white border border-gray-500/80 rounded-md shadow-sm px-3 py-2">
          <Search className="text-slate-400" />
          <input
            placeholder="Chercher un examen ou surveillant..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="outline-none px-2 text-sm flex-1"
          />
        </div>

        <IconButton
          onClick={exportCSV}
          className="bg-slate-800 text-white hover:bg-slate-900"
          title="Exporter CSV"
        >
          <Download size={16} /> Exporter
        </IconButton>
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

      {/* DataTable */}
      <DataTable
        columns={columns}
        rows={loading ? [] : filtered}
        initialPageSize={5}
        rowsPerPageOptions={[5, 10, 25]}
      />

      {/* Modal create / edit */}
      <Modal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingSupervision(null);
        }}
        title={editingSupervision?.id ? "Modifier supervision" : "Créer supervision"}
      >
        {editingSupervision && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700">Examen</label>
              <select
                required
                value={editingSupervision.examId}
                onChange={(e) =>
                  setEditingSupervision({ ...editingSupervision, examId: e.target.value })
                }
                className="w-full border border-slate-300 px-4 py-2.5 rounded-xl
                          focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500/40
                          outline-none transition-all"
              >
                <option value="">--Choisir--</option>
                {exams.map((ex) => (
                  <option key={ex.id} value={ex.id}>
                    {ex.Matiere?.label} ({new Date(ex.date).toLocaleDateString("fr-FR")})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">Surveillant</label>
              <select
                required
                value={editingSupervision.surveillantId}
                onChange={(e) =>
                  setEditingSupervision({
                    ...editingSupervision,
                    surveillantId: e.target.value,
                  })
                }
                className="w-full border border-slate-300 px-4 py-2.5 rounded-xl
                          focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500/40
                          outline-none transition-all"
              >
                <option value="">--Choisir--</option>
                {surveillants.map((sur) => (
                  <option key={sur.id} value={sur.id}>
                    {sur.fullname} ({sur.email})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setModalOpen(false);
                  setEditingSupervision(null);
                }}
                className="px-4 py-2 rounded-md bg-slate-100"
              >
                Annuler
              </button>
              <button
                disabled={submitting}
                type="submit"
                className="px-4 py-2 rounded-md bg-indigo-600 text-white"
              >
                {submitting ? "Enregistrement..." : "Enregistrer"}
              </button>
            </div>
          </form>
        )}
      </Modal>

      {/* Delete modal */}
      <Modal
        open={deleteOpen}
        onClose={() => {
          setDeleteOpen(false);
          setDeleteTarget(null);
        }}
        title="Confirmer la suppression"
      >
        <div className="space-y-4">
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
            <p className="text-sm text-red-700">
              Voulez-vous vraiment supprimer cette supervision de :
              <span className="font-semibold"> « {deleteTarget?.surveillant?.fullname} »</span> ?
            </p>
            <p className="text-xs text-red-600 mt-1">
              ⚠️ Cette action est <span className="font-semibold">définitive</span>.
            </p>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => {
                setDeleteOpen(false);
                setDeleteTarget(null);
              }}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition shadow-sm"
            >
              Annuler
            </button>

            <button
              onClick={() => handleDelete(deleteTarget.id)}
              className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white shadow-sm transition"
            >
              Supprimer
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
import React, { useEffect, useState, useMemo } from "react";
import DataTable from "../../../components/ui/DataTable";
import {
  getAllSupervisions,
  createSupervision,
  updateSupervision,
  deleteSupervision,
  autoAffectSupervision,
} from "../../../services/supervisions";
import { getAllExams } from "../../../services/exams";
import { getUsersByRole } from "../../../services/users";
import { Plus, Trash2, Edit, X, Search, Download, AlertCircle, Zap } from "lucide-react";

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
  const [editing, setEditing] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [autoAssigning, setAutoAssigning] = useState(false);
  const [groupModalOpen, setGroupModalOpen] = useState(false);
  const [groupDetail, setGroupDetail] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    setErr(null);
    try {
      const [supRes, exRes, surRes] = await Promise.all([getAllSupervisions(), getAllExams(), getUsersByRole("surveillant")]);

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
    const q = query.trim().toLowerCase();
    if (!q) return supervisions;
    return supervisions.filter((s) => {
      const survName = String(s.surveillant?.fullname ?? s.Surveillant?.fullname ?? "").toLowerCase();
      const salleLabel = String(s.salle?.label ?? s.Salle?.label ?? s.Place?.Salle?.label ?? "").toLowerCase();
      return survName.includes(q) || salleLabel.includes(q);
    });
  }, [supervisions, query]);

  const uniqueSurveillants = useMemo(() => {
    const map = new Map();
    for (const s of supervisions) {
      const surv = s.surveillant ?? s.Surveillant ?? (s.surveillantId ? { id: s.surveillantId, fullname: s.surveillantName ?? `Surv ${s.surveillantId}`, email: s.surveillant?.email } : null);
      if (!surv) continue;
      const key = String(surv.id ?? surv.fullname);
      if (!map.has(key)) map.set(key, { id: surv.id ?? key, fullname: surv.fullname, email: surv.email });
    }
    return Array.from(map.values());
  }, [supervisions]);

  const uniqueSalles = useMemo(() => {
    const map = new Map();
    for (const s of supervisions) {
      const salleObj = s.salle ?? s.Salle ?? (s.salleId ? { id: s.salleId, label: s.salleLabel ?? `Salle ${s.salleId}` } : null);
      if (!salleObj || !salleObj.label) continue;
      const key = String(salleObj.id ?? salleObj.label);
      if (!map.has(key)) map.set(key, { id: salleObj.id ?? key, label: salleObj.label });
    }
    return Array.from(map.values());
  }, [supervisions]);

  const groupedRows = useMemo(() => {
    const map = new Map();
    for (const s of filtered) {
      const surv = s.surveillant ?? s.Surveillant ?? (s.surveillantId ? { id: s.surveillantId, fullname: s.surveillantName ?? `Surv ${s.surveillantId}` } : null);
      const salleLabel = s.salle?.label ?? s.Salle?.label ?? s.Place?.Salle?.label ?? null;
      if (!surv || !salleLabel) continue;
      const key = `${surv.id ?? surv.fullname}-${salleLabel}`;
      if (!map.has(key)) map.set(key, { id: key, surveillant: surv, salles: new Set(), exams: new Set() });
      const entry = map.get(key);
      entry.salles.add(salleLabel);
      const examLabel = s.Exam?.Matiere?.label
        ? `${s.Exam.Matiere.label} — ${s.Exam?.date ? new Date(s.Exam.date).toLocaleDateString("fr-FR") : ""}`
        : (s.examId ? `Exam #${s.examId}` : null);
      if (examLabel) entry.exams.add(examLabel);
    }
    return Array.from(map.values()).map((v, i) => ({
      id: v.id,
      surveillant: v.surveillant,
      salles: Array.from(v.salles),
      exams: Array.from(v.exams),
      index: i + 1,
    }));
  }, [filtered]);

  const groupColumns = useMemo(() => [
    { field: "index", headerName: "#", width: 60 },
    {
      field: "surveillant",
      headerName: "Surveillant",
      width: 300,
      renderCell: (r) => (
        <div>
          <div className="font-medium">{r.surveillant?.fullname ?? "-"}</div>
          <div className="text-xs text-slate-400">{r.surveillant?.email ?? ""}</div>
        </div>
      ),
    },
    {
      field: "salles",
      headerName: "Salle(s)",
      width: 220,
      renderCell: (r) => (r.salles && r.salles.length ? r.salles.join(", ") : "-"),
    },
    {
      field: "actions",
      headerName: "Actions",
      align: "right",
      renderCell: (r) => (
        <div className="inline-flex gap-2">
          <button
            className="p-2 rounded-lg hover:bg-slate-200 transition"
            onClick={(ev) => { ev.stopPropagation(); openEdit(r.representativeId ?? r); }}
            title="Modifier"
          >
            <Edit size={16} />
          </button>

          <button
            className="p-2 rounded-lg hover:bg-red-200 text-red-600 transition"
            onClick={(ev) => { ev.stopPropagation(); setDeleteTarget(r); setDeleteOpen(true); }}
            title="Supprimer"
          >
            <Trash2 size={16} />
          </button>
        </div>
      ),
    },
  ], []);

  const rowsForTable = groupedRows.map((g, i) => ({ ...g, index: i + 1 }));

  function openEdit(s) {
    if (!s) {
      setEditing(null);
      setModalOpen(true);
      return;
    }
    if (typeof s === "string" || typeof s === "number") {
      const sup = supervisions.find((x) => String(x.id ?? x._id) === String(s));
      setEditing(sup ? { ...sup } : { surveillantId: null, salleId: null });
      setModalOpen(true);
      return;
    }
    // s is likely a row object (group) or supervision object
    if (s.representativeId) {
      const sup = supervisions.find((x) => String(x.id ?? x._id) === String(s.representativeId));
      setEditing(sup ? { ...sup } : { surveillantId: s.surveillant?.id ?? s.surveillant?.fullname ?? null, salleId: s.salles?.[0] ?? null });
    } else {
      setEditing({ ...s });
    }
    setModalOpen(true);
  }

  async function submit(e) {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editing?.id) {
        await updateSupervision(editing.id, editing);
      } else {
        await createSupervision(editing);
      }
      setModalOpen(false);
      setEditing(null);
      await fetchData();
    } catch (err) {
      alert(err?.message ?? "Erreur");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id) {
    if (!id) {
      alert("ID manquant pour suppression");
      return;
    }
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

  const exportCSV = () => {
    const rows = [["Examen", "Surveillant", "Email"]];
    for (const s of filtered) {
      rows.push([s.Exam?.Matiere?.label ?? "", s.surveillant?.fullname ?? "", s.surveillant?.email ?? ""]);
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

  async function handleAutoAssign() {
    if (!confirm("Affecter automatiquement les surveillants ?")) return;
    setAutoAssigning(true);
    try {
      const res = await autoAffectSupervision();
      alert(`✓ Affectation automatique terminée. ${res?.count ?? ""}`);
      await fetchData();
    } catch (e) {
      alert(e?.message ?? "Erreur lors de l'affectation automatique");
    } finally {
      setAutoAssigning(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-slate-800">Supervision</h1>
          <p className="text-sm text-slate-500 mt-1">Gérer l'affectation des surveillants aux examens.</p>
        </div>

        <div className="flex items-center gap-3">
          <IconButton onClick={handleAutoAssign} className="bg-amber-600 text-white hover:bg-amber-700" title="">
            <Zap size={16} /> {autoAssigning ? "Traitement..." : "Affectation Auto"}
          </IconButton>

          <IconButton onClick={exportCSV} className="bg-slate-800 text-white hover:bg-slate-900" title="Exporter CSV">
            <Download size={16} /> Exporter
          </IconButton>
        </div>
      </div>

      <div className="flex items-center gap-3 justify-end">
        <div className="flex items-center gap-2 bg-white border border-gray-500/80 rounded-md shadow-sm px-3 py-2">
          <Search className="text-slate-400" />
          <input placeholder="Rechercher surveillant / salle..." value={query} onChange={(e) => setQuery(e.target.value)} className="outline-none px-2 text-sm w-64" />
        </div>
      </div>

      {loading ? (
        <div className="p-8 text-center">⏳ Chargement...</div>
      ) : (
        <DataTable
          columns={groupColumns}
          rows={rowsForTable}
          initialPageSize={10}
          rowsPerPageOptions={[5, 10, 25]}
          dense={false}
          onRowClick={(row) => { setGroupDetail(row); setGroupModalOpen(true); }}
        />
      )}

      <Modal open={modalOpen} onClose={() => { setModalOpen(false); setEditing(null); }} title={editing?.id ? "Modifier supervision" : "Créer supervision"}>
        {editing ? (
          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="block text-sm">Exam</label>
              <select required value={editing.examId ?? editing.Exam?.id ?? ""} onChange={(e) => setEditing((s) => ({ ...s, examId: e.target.value }))} className="w-full border border-slate-300 px-4 py-2.5 rounded-xl outline-none">
                <option value="">-- Choisir exam --</option>
                {exams.map((ex) => <option key={ex.id ?? ex._id} value={ex.id ?? ex._id}>{ex.Matiere?.label ?? ex.label}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm">Surveillant</label>
              <select required value={editing.surveillantId ?? ""} onChange={(e) => setEditing((s) => ({ ...s, surveillantId: e.target.value }))} className="w-full border border-slate-300 px-4 py-2.5 rounded-xl outline-none">
                <option value="">-- Choisir --</option>
                {uniqueSurveillants.map((u) => <option key={u.id} value={u.id}>{u.fullname}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm">Salle</label>
              <select required value={editing.salleId ?? ""} onChange={(e) => setEditing((s) => ({ ...s, salleId: e.target.value }))} className="w-full border border-slate-300 px-4 py-2.5 rounded-xl outline-none">
                <option value="">-- Choisir --</option>
                {uniqueSalles.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
              </select>
            </div>

            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => { setModalOpen(false); setEditing(null); }} className="px-4 py-2 bg-slate-100 rounded">Annuler</button>
              <button type="submit" disabled={submitting} className="px-4 py-2 bg-indigo-600 text-white rounded">{submitting ? "..." : "Enregistrer"}</button>
            </div>
          </form>
        ) : (
          <div className="p-4 text-sm text-slate-500">Sélectionnez une supervision pour modifier.</div>
        )}
      </Modal>

      <Modal open={groupModalOpen} onClose={() => { setGroupModalOpen(false); setGroupDetail(null); }} title="Détails du surveillant">
        {groupDetail && (
          <div className="space-y-3">
            <div className="font-medium">{groupDetail.surveillant?.fullname}</div>
            {groupDetail.surveillant?.email && <div className="text-xs text-slate-500">{groupDetail.surveillant.email}</div>}

            <div>
              <div className="text-sm font-semibold mt-2">Salles</div>
              <div className="text-sm">{groupDetail.salles.length ? groupDetail.salles.join(", ") : "Aucune"}</div>
            </div>

            <div>
              <div className="text-sm font-semibold mt-2">Examens</div>
              <div className="flex flex-col text-sm">
                {groupDetail.exams.length ? groupDetail.exams.map((e) => <div key={e} className="text-xs">{e}</div>) : <div className="text-xs">Aucun</div>}
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete modal */}
      <Modal open={deleteOpen} onClose={() => { setDeleteOpen(false); setDeleteTarget(null); }} title="Confirmer la suppression">
        <div className="space-y-4">
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
            <p className="text-sm text-red-700">
              Voulez-vous vraiment supprimer cette supervision de :
              <span className="font-semibold"> « {deleteTarget?.surveillant?.fullname ?? "-"} »</span> ?
            </p>
            <p className="text-xs text-red-600 mt-1">⚠️ Cette action est <span className="font-semibold">définitive</span>.</p>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => { setDeleteOpen(false); setDeleteTarget(null); }} className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition shadow-sm">Annuler</button>

            <button onClick={() => handleDelete(deleteTarget?.id)} className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white shadow-sm transition">Supprimer</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
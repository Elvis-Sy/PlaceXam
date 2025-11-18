import React, { useEffect, useState, useMemo } from "react";
import {
  getAllSupervisions,
  createSupervision,
  updateSupervision,
  deleteSupervision,
  autoAffectSupervision,
} from "../../../services/supervisions";
import { Plus, Trash2, Edit, Zap, Search, X } from "lucide-react";
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
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-xl mx-4">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200">
          <div className="flex items-center justify-between px-6 py-4 border-b bg-slate-50">
            <h3 className="text-lg font-bold text-slate-800">{title}</h3>
            <button onClick={onClose} className="text-slate-600 hover:bg-slate-200 p-1 rounded">
              ✕
            </button>
          </div>
          <div className="p-6">{children}</div>
        </div>
      </div>
    </div>
  );
}

export default function Supervision() {
  const [supervisions, setSupervisions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);
  const [query, setQuery] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [autoAssigning, setAutoAssigning] = useState(false);
  const [groupModalOpen, setGroupModalOpen] = useState(false);
  const [groupDetail, setGroupDetail] = useState(null);

  useEffect(() => {
    fetchSupervisions();
  }, []);

  async function fetchSupervisions() {
    setLoading(true);
    setErr(null);
    try {
      const res = await getAllSupervisions();
      const data = Array.isArray(res) ? res : res?.data ?? res ?? [];
      console.log(data);
      setSupervisions(data);
    } catch (e) {
      console.error(e);
      setErr(e?.message ?? "Impossible de récupérer les supervisions");
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
      // Normalise le surveillant et le label de la salle selon la structure renvoyée
      const surv = s.surveillant ?? s.Surveillant ?? (s.surveillantId ? { id: s.surveillantId, fullname: s.surveillantName ?? `Surv ${s.surveillantId}` } : null);
      const salleLabel = s.salle?.label ?? s.Salle?.label ?? s.Place?.Salle?.label ?? null;

      if (!surv || !salleLabel) continue; // ignore les entrées incomplètes

      // clé unique par surveillant + salle
      const key = `${surv.id ?? surv.fullname}-${salleLabel}`;

      if (!map.has(key)) map.set(key, { id: key, surveillant: surv, salles: new Set(), exams: new Set() });

      const entry = map.get(key);
      entry.salles.add(salleLabel);

      // construit un libellé lisible pour l'examen si disponible
      const examLabel = s.Exam?.Matiere?.label
        ? `${s.Exam.Matiere.label} — ${s.Exam?.date ? new Date(s.Exam.date).toLocaleDateString("fr-FR") : ""}`
        : (s.examId ? `Exam #${s.examId}` : null);
      if (examLabel) entry.exams.add(examLabel);
    }

    // retourne un tableau avec id unique et champs tables-ready
    return Array.from(map.values()).map((v, i) => ({
      id: v.id,
      surveillant: v.surveillant,
      salles: Array.from(v.salles),
      exams: Array.from(v.exams),
      index: i + 1,
    }));
  }, [filtered]);

  const columns = useMemo(() => [
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
            className="px-3 py-1.5 rounded-md bg-indigo-50 text-indigo-600 hover:bg-indigo-100 text-sm"
            onClick={(ev) => { ev.stopPropagation(); setGroupDetail(r); setGroupModalOpen(true); }}
          >
            Détails
          </button>
        </div>
      ),
    },
  ], []);

  const rowsForTable = groupedRows.map((g, i) => ({ ...g, index: i + 1 }));


  function openEdit(s) {
    setEditing({ ...s });
    setModalOpen(true);
  }

  async function submit(e) {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editing.id) {
        await updateSupervision(editing.id, editing);
      } else {
        await createSupervision(editing);
      }
      setModalOpen(false);
      setEditing(null);
      await fetchSupervisions();
    } catch (err) {
      alert(err?.message ?? "Erreur");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id) {
    if (!confirm("Supprimer cette supervision ? Cette action est irréversible.")) return;
    setDeletingId(id);
    try {
      await deleteSupervision(id);
      await fetchSupervisions();
    } catch (e) {
      alert(e?.message ?? "Erreur lors de la suppression");
    } finally {
      setDeletingId(null);
    }
  }

  async function handleAutoAssign() {
    if (!confirm("Affecter automatiquement les surveillants ?")) return;
    setAutoAssigning(true);
    try {
      const res = await autoAffectSupervision();
      alert(`✓ Affectation automatique terminée. ${res?.count ?? ""}`);
      await fetchSupervisions();
    } catch (e) {
      alert(e?.message ?? "Erreur lors de l'affectation automatique");
    } finally {
      setAutoAssigning(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-slate-800">Supervision</h1>
          <p className="text-sm text-slate-500 mt-1">Gérer l'affectation des surveillants aux examens.</p>
        </div>

        <div className="flex items-center gap-3">
          <IconButton onClick={handleAutoAssign} className="bg-amber-600 text-white hover:bg-amber-700" title="">
            <Zap size={16} /> {autoAssigning ? "Traitement..." : "Affectation Auto"}
          </IconButton>
        </div>
      </div>

      <div className="flex items-center gap-3 justify-end">
        <div className="flex items-center gap-2 bg-white border border-gray-500/80 rounded-md shadow-sm px-3 py-2">
          <Search className="text-slate-400" />
          <input
            placeholder="Rechercher exam / surveillant..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="outline-none px-2 text-sm w-64"
          />
        </div>
      </div>

      {loading ? (
        <div className="p-8 text-center">⏳ Chargement...</div>
      ) : (
        <DataTable
          columns={columns}
          rows={rowsForTable}
          initialPageSize={10}
          rowsPerPageOptions={[5, 10, 25]}
          dense={false}
          onRowClick={(row) => openEdit(row)}
        />
      )}

      <Modal open={modalOpen} onClose={() => { setModalOpen(false); setEditing(null); }} title="Modifier supervision">
        {editing?.id ? (
          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="block text-sm">Surveillant</label>
              <select
                required
                value={editing.surveillantId ?? ""}
                onChange={(e) => setEditing((s) => ({ ...s, surveillantId: e.target.value }))}
                className="w-full border border-slate-300 px-4 py-2.5 rounded-xl outline-none"
              >
                <option value="">-- Choisir --</option>
                {uniqueSurveillants.map((u) => (
                  <option key={u.id} value={u.id}>{u.fullname}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm">Salle</label>
              <select
                required
                value={editing.salleId ?? ""}
                onChange={(e) => setEditing((s) => ({ ...s, salleId: e.target.value }))}
                className="w-full border border-slate-300 px-4 py-2.5 rounded-xl outline-none"
              >
                <option value="">-- Choisir --</option>
                {uniqueSalles.map((s) => (
                  <option key={s.id} value={s.id}>{s.label}</option>
                ))}
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
              <div className="flex flex-col text-sm">
                {groupDetail.salles.length ? groupDetail.salles.map((s, idx) => <div key={s + "_" + idx} className="text-xs">{s}</div>) : <div className="text-xs">Aucune</div>}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
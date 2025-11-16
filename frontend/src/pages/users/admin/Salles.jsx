import React, { useEffect, useState, useMemo } from "react";
import { Plus, Edit, Trash2, Download, Search } from "lucide-react";
import {
  getAllSalles,
  createSalle,
  updateSalle,
  deleteSalle,
  getSalleOccupancy,
} from "../../../services/salles";

function IconButton({ children, className = "", ...props }) {
  return (
    <button
      {...props}
      className={
        "inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium shadow-sm hover:shadow-md transition-shadow " +
        className
      }
    >
      {children}
    </button>
  );
}

/* Small modal helper */
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
      <div className="relative z-10 w-full max-w-xl mx-4 animate-scaleIn">
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


export default function Salles() {
  const [salles, setSalles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  const [query, setQuery] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [planOpen, setPlanOpen] = useState(false);
  const [planSalle, setPlanSalle] = useState(null);
  const [planDate, setPlanDate] = useState(new Date().toISOString().slice(0, 10));
  const [occupancy, setOccupancy] = useState(null);
  const [hoveredPlaceId, setHoveredPlaceId] = useState(null);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    try {
      const res = await getAllSalles();
      const list = res?.data ?? res ?? [];
      setSalles(Array.isArray(list) ? list : list?.salles ?? []);
    } catch (e) {
      setErr(e.message || "Erreur");
    } finally {
      setLoading(false);
    }
  }

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return salles;
    return salles.filter((s) => (s.label || "").toLowerCase().includes(q));
  }, [salles, query]);

  function openCreate() {
    setEditing({ label: "", capacite: 30 });
    setModalOpen(true);
  }
  function openEdit(s) {
    setEditing({ ...s });
    setModalOpen(true);
  }
  async function submit(e) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = { label: editing.label, capacite: Number(editing.capacite) };
      if (editing.id) await updateSalle(editing.id, payload);
      else await createSalle(payload);
      setModalOpen(false);
      setEditing(null);
      await load();
    } catch (err) {
      alert(err?.response?.data?.message ?? err.message ?? "Erreur");
    } finally {
      setSubmitting(false);
    }
  }
  async function doDelete(id) {
    try {
      await deleteSalle(id);
      await load();
    } catch (e) {
      alert(e?.response?.data?.message ?? e.message ?? "Erreur");
    }
  }

  async function openPlan(salle) {
    setPlanSalle(salle);
    setPlanOpen(true);
    setHoveredPlaceId(null);
    await loadOccupancy(salle, planDate);
  }

  async function loadOccupancy(salle, date) {
    try {
      const res = await getSalleOccupancy(salle.id, date);
      console.log(res);
      setOccupancy(res);
    } catch (e) {
      alert(e?.response?.data?.error ?? e.message ?? "Erreur");
    }
  }

  const exportCSV = () => {
    const rows = [["label", "capacite"]];
    for (const s of filtered) rows.push([s.label, s.capacite]);
    const csv = rows.map(r => r.map(c => `"${String(c).replace(/"/g,'""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "salles.csv"; a.click(); URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-slate-800">Salles</h1>
          <p className="text-sm text-slate-500 mt-1">
            Gérer les salles : création, modification, suppression, plan.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-white border border-gray-500/80 rounded-md shadow-sm px-3 py-2">
            <Search className="text-slate-400" />
            <input
              placeholder="Rechercher..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="outline-none px-2 text-sm w-64"
            />
          </div>

          <IconButton
            onClick={exportCSV}
            className="bg-slate-800 text-white hover:bg-slate-900"
            title="Exporter CSV"
          >
            <Download size={16} /> Exporter
          </IconButton>

          <IconButton onClick={openCreate} className="bg-indigo-600 text-white hover:bg-indigo-700">
            <Plus size={16} /> Créer
          </IconButton>
        </div>
      </div>


      <div className="bg-white border border-gray-500/80 rounded-lg shadow-sm">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-100 border-b border-gray-500/80">
            <tr>
              <th className="px-4 py-3 text-left font-semibold text-slate-700">#</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-700">Label</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-700">Capacité</th>
              <th className="px-4 py-3 text-right font-semibold text-slate-700">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-200/80">
            {filtered.map((s, i) => (
              <tr key={s.id} className="hover:bg-slate-50 transition">
                <td className="px-4 py-3">{i + 1}</td>
                <td className="px-4 py-3 font-medium">{s.label}</td>
                <td className="px-4 py-3">{s.capacite}</td>
                <td className="px-4 py-3 text-right">
                  <div className="inline-flex gap-2">
                    <button className="p-2 rounded-lg hover:bg-slate-200 transition">
                      <Edit size={16} onClick={() => openEdit(s)} />
                    </button>
                    <button className="p-2 rounded-lg hover:bg-red-200 text-red-600 transition">
                      <Trash2 size={16} onClick={() => {
                        setDeleteTarget(s);
                        setDeleteOpen(true);
                      }} />
                    </button>
                    <button className="px-3 py-1.5 rounded-lg bg-slate-200 hover:bg-slate-300 text-sm transition"
                      onClick={() => openPlan(s)}>
                      Voir plan
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* create / edit modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing?.id ? "Modifier salle" : "Créer salle"}
      >
        {editing && (
          <form onSubmit={submit} className="space-y-6">
            
            {/* Champ label */}
            <div className="space-y-1">
              <label className="block text-sm font-semibold text-slate-700">
                Label
              </label>
              <input
                required
                value={editing.label}
                onChange={(e) => setEditing({ ...editing, label: e.target.value })}
                placeholder="Nom de la salle"
                className="w-full border border-slate-300 px-4 py-2.5 rounded-xl
                          focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500/40
                          outline-none transition-all"
              />
            </div>

            {/* Champ capacité */}
            <div className="space-y-1">
              <label className="block text-sm font-semibold text-slate-700">
                Capacité
              </label>
              <input
                required
                type="number"
                min="1"
                value={editing.capacite}
                onChange={(e) => setEditing({ ...editing, capacite: e.target.value })}
                className="w-40 border border-slate-300 px-4 py-2.5 rounded-xl
                          focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500/40
                          outline-none transition-all"
              />
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200
                          text-slate-700 shadow transition"
              >
                Annuler
              </button>

              <button
                disabled={submitting}
                type="submit"
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700
                          text-white shadow transition disabled:opacity-60"
              >
                {submitting ? "Enregistrement..." : "Enregistrer"}
              </button>
            </div>
          </form>
        )}
      </Modal>

      {/* delete modal */}
      <Modal
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        title="Confirmer la suppression"
      >
        <div className="space-y-4">

          <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
            <p className="text-sm text-red-700">
              Voulez-vous vraiment supprimer la salle :
              <span className="font-semibold"> « {deleteTarget?.label} »</span> ?
            </p>

            <p className="text-xs text-red-600 mt-1">
              ⚠️ Cette action est <span className="font-semibold">définitive</span> et supprimera toutes les places associées.
            </p>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setDeleteOpen(false)}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition shadow-sm"
            >
              Annuler
            </button>

            <button
              onClick={async () => {
                await doDelete(deleteTarget.id);
                setDeleteOpen(false);
              }}
              className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white shadow-sm transition"
            >
              Supprimer
            </button>
          </div>
        </div>
      </Modal>

      {/* Plan modal */}
      <Modal open={planOpen} onClose={() => {setPlanOpen(false); setOccupancy(null); setHoveredPlaceId(null);}} title={planSalle?.label ?? "Plan"}>
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <label className="text-sm">Date:</label>
            <input type="date" value={planDate} onChange={(e)=>{ setPlanDate(e.target.value); loadOccupancy(planSalle, e.target.value); }} className="px-3 py-2 border rounded" />
            <button onClick={() => loadOccupancy(planSalle, planDate)} className="px-3 py-2 rounded bg-indigo-600 text-white">Actualiser</button>
          </div>

          <div>
            {!occupancy && <div className="text-sm text-slate-500">Aucune donnée — actualiser pour charger l'occupation.</div>}
            {occupancy && (
              <div className="relative" style={{ gridTemplateColumns: `repeat(${Math.min(12, Math.ceil(Math.sqrt(planSalle.capacite || 1)))}, 1fr)` }}>
                <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(${Math.min(12, Math.ceil(Math.sqrt(planSalle.capacite || 1)))}, 1fr)` }}>
                  {occupancy.places.map((p) => (
                    <div
                      key={p.id}
                      onClick={() => setHoveredPlaceId(hoveredPlaceId === p.id ? null : p.id)}
                      onMouseEnter={() => hoveredPlaceId !== p.id && setHoveredPlaceId(null)}
                      onMouseLeave={() => hoveredPlaceId !== p.id && setHoveredPlaceId(null)}
                      className={`p-3 rounded-lg border shadow-sm text-center cursor-pointer transition-all duration-200 ${
                        hoveredPlaceId === p.id && p.occupied
                          ? "absolute z-20 h-full w-full shadow-2xl"
                          : `relative scale-100 hover:scale-105`
                      } ${
                        p.occupied
                          ? "bg-red-100 text-red-800 hover:bg-red-150"
                          : "bg-emerald-50 text-emerald-800 hover:bg-emerald-100"
                      }`}
                      style={hoveredPlaceId === p.id ? { inset: 0 } : {}}
                    >
                      <div className="text-lg font-bold">{p.numero}</div>
                      
                      {/* Affichage normal */}
                      {hoveredPlaceId !== p.id && (
                        <div className="text-xs mt-2">
                          {p.occupied ? (p.occupant?.fullname ?? p.occupant?.email ?? "Assigné") : "Libre"}
                        </div>
                      )}

                      {/* Affichage au hover (juste le niveau) */}
                      {p.occupied && p.occupant?.niveau && (
                        <div className="text-xs mt-2">
                          <div className="text-xs bg-red-900/40 px-2 py-1 rounded inline-block">
                            {p.occupant.niveau}
                          </div>
                        </div>
                      )}

                      {/* Affichage au click (tous les détails) */}
                      {hoveredPlaceId === p.id && p.occupied && p.occupant && (
                        <div className="flex text-gray-900 justify-between mt-4 gap-2 py-2 px-8">
                          <div className="text-left">
                            <div className="font-bold">Etudiant:</div>
                            <div className="text-sm font-medium">
                              <div>
                                <span className="opacity-80">Nom:</span>{" "}
                                {p.occupant.fullname}
                              </div>
                              <div>
                                <span className="opacity-80">E-mail:</span>{" "}
                                {p.occupant.email}
                              </div>
                            </div>
                          </div>
                          {p.exam && (
                            <div className="text-left">
                              <div className="font-bold">Examen:</div>
                              <div className="text-sm font-medium">
                                <div>
                                  <span className="opacity-80">Label:</span>{" "}
                                  {p.exam.Matiere.label}
                                </div>
                                <div>
                                  <span className="opacity-80">Duree:</span>{" "}
                                  {p.exam.duree} min
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {hoveredPlaceId === p.id && !p.occupied && (
                        <div className="text-xs mt-2 italic">Libre</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
}
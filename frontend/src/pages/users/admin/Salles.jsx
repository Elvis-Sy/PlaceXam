import React, { useEffect, useState, useMemo } from "react";
import { Plus, Edit, Trash2, Download } from "lucide-react";
import {
  getAllSalles,
  createSalle,
  updateSalle,
  deleteSalle,
  getSalleOccupancy,
} from "../../../services/salles";

/* Small modal helper */
function Modal({ open, onClose, title, children }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/30" onClick={onClose} />
      <div className="relative z-10 w-full max-w-2xl mx-4">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3 border-b">
            <h3 className="text-lg font-semibold">{title}</h3>
            <button onClick={onClose} className="px-2 py-1 rounded hover:bg-slate-100">Fermer</button>
          </div>
          <div className="p-5">{children}</div>
        </div>
      </div>
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
  const [submitting, setSubmitting] = useState(false);

  const [planOpen, setPlanOpen] = useState(false);
  const [planSalle, setPlanSalle] = useState(null);
  const [planDate, setPlanDate] = useState(new Date().toISOString().slice(0, 10));
  const [occupancy, setOccupancy] = useState(null);

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
    if (!confirm("Supprimer cette salle et ses places ?")) return;
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
    await loadOccupancy(salle, planDate);
  }

  async function loadOccupancy(salle, date) {
    try {
      const res = await getSalleOccupancy(salle.id, date);
      setOccupancy(res);
    } catch (e) {
      alert(e?.response?.data?.error ?? e.message ?? "Erreur");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Salles</h1>
          <p className="text-sm text-slate-500">CRUD des salles (liste, créer, modifier, supprimer).</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center bg-white border rounded px-3 py-2">
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Rechercher..." className="outline-none text-sm" />
          </div>

          <button onClick={openCreate} className="px-3 py-2 rounded bg-indigo-600 text-white flex items-center gap-2">
            <Plus size={16} /> Nouvelle
          </button>

          <button onClick={() => {
            // export filtered CSV
            const rows = [["label", "capacite"]];
            for (const s of filtered) rows.push([s.label, s.capacite]);
            const csv = rows.map(r => r.map(c => `"${String(c).replace(/"/g,'""')}"`).join(",")).join("\n");
            const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a"); a.href = url; a.download = "salles.csv"; a.click(); URL.revokeObjectURL(url);
          }} className="px-3 py-2 rounded bg-slate-100">
            <Download size={16} /> Export
          </button>
        </div>
      </div>

      <div className="bg-white border rounded shadow-sm">
        <table className="min-w-full">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-left">#</th>
              <th className="px-4 py-3 text-left">Label</th>
              <th className="px-4 py-3 text-left">Capacité</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={4} className="p-8 text-center">Chargement...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={4} className="p-8 text-center">Aucune salle</td></tr>
            ) : filtered.map((s, i) => (
              <tr key={s.id} className="hover:bg-slate-50">
                <td className="px-4 py-3 text-sm">{i+1}</td>
                <td className="px-4 py-3">{s.label}</td>
                <td className="px-4 py-3">{s.capacite}</td>
                <td className="px-4 py-3 text-right">
                  <div className="inline-flex gap-2">
                    <button onClick={() => openEdit(s)} className="p-2 rounded hover:bg-slate-100"><Edit size={16} /></button>
                    <button onClick={() => doDelete(s.id)} className="p-2 rounded hover:bg-red-50 text-red-600"><Trash2 size={16} /></button>
                    <button onClick={() => openPlan(s)} className="px-2 py-1 rounded bg-slate-100 text-sm">Voir plan</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* create / edit modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing?.id ? "Modifier salle" : "Créer salle"}>
        {editing && (
          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium">Label</label>
              <input required value={editing.label} onChange={(e) => setEditing({...editing, label: e.target.value})} className="mt-1 w-full border px-3 py-2 rounded" />
            </div>
            <div>
              <label className="block text-sm font-medium">Capacité</label>
              <input required type="number" min="1" value={editing.capacite} onChange={(e) => setEditing({...editing, capacite: e.target.value})} className="mt-1 w-40 border px-3 py-2 rounded" />
            </div>
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 rounded bg-slate-100">Annuler</button>
              <button disabled={submitting} type="submit" className="px-4 py-2 rounded bg-indigo-600 text-white">{submitting ? "..." : "Enregistrer"}</button>
            </div>
          </form>
        )}
      </Modal>

      {/* Plan modal */}
      <Modal open={planOpen} onClose={() => {setPlanOpen(false); setOccupancy(null);}} title={planSalle?.label ?? "Plan"}>
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <label className="text-sm">Date:</label>
            <input type="date" value={planDate} onChange={(e)=>{ setPlanDate(e.target.value); loadOccupancy(planSalle, e.target.value); }} className="px-3 py-2 border rounded" />
            <button onClick={() => loadOccupancy(planSalle, planDate)} className="px-3 py-2 rounded bg-indigo-600 text-white">Actualiser</button>
          </div>

          <div>
            {!occupancy && <div className="text-sm text-slate-500">Aucune donnée — actualiser pour charger l'occupation.</div>}
            {occupancy && (
              <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(${Math.min(12, Math.ceil(Math.sqrt(planSalle.capacite || 1)))}, 1fr)` }}>
                {occupancy.places.map((p) => (
                  <div key={p.id} className={`p-3 rounded-lg border shadow-sm text-center cursor-pointer ${p.occupied ? "bg-red-100 text-red-800" : "bg-emerald-50 text-emerald-800"}`}>
                    <div className="text-lg font-bold">{p.numero}</div>
                    <div className="text-xs mt-2">{p.occupied ? (p.occupant?.fullname ?? p.occupant?.email) : "Libre"}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
}
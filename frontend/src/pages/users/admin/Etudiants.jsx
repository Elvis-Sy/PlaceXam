import React, { useEffect, useState, useMemo } from "react";
import { Plus, Edit, Trash2, Download } from "lucide-react";
import { getEtudiants, createEtudiant, updateEtudiant, deleteEtudiant } from "../../../services/etudiants";

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

export default function Etudiants() {
  const [etudiants, setEtudiants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);
  const [query, setQuery] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    try {
      const res = await getEtudiants();
      const list = Array.isArray(res) ? res : res?.data ?? [];
      setEtudiants(list);
    } catch (e) {
      setErr(e.message || "Erreur");
    } finally {
      setLoading(false);
    }
  }

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return etudiants;
    return etudiants.filter((e) => 
      (e.fullname || "").toLowerCase().includes(q) ||
      (e.email || "").toLowerCase().includes(q) ||
      (e.niveau || "").toLowerCase().includes(q)
    );
  }, [etudiants, query]);

  function openCreate() {
    setEditing({ fullname: "", email: "", niveau: "L1" });
    setModalOpen(true);
  }

  function openEdit(e) {
    setEditing({ ...e });
    setModalOpen(true);
  }

  async function submit(e) {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editing.id) await updateEtudiant(editing.id, editing);
      else await createEtudiant(editing);
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
    if (!confirm("Supprimer cet étudiant ?")) return;
    try {
      await deleteEtudiant(id);
      await load();
    } catch (e) {
      alert(e?.response?.data?.message ?? e.message ?? "Erreur");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Étudiants</h1>
          <p className="text-sm text-slate-500">Gestion des étudiants (liste, créer, modifier, supprimer).</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center bg-white border rounded px-3 py-2">
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Rechercher..." className="outline-none text-sm" />
          </div>

          <button onClick={openCreate} className="px-3 py-2 rounded bg-indigo-600 text-white flex items-center gap-2">
            <Plus size={16} /> Nouveau
          </button>
        </div>
      </div>

      <div className="bg-white border rounded shadow-sm overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-left">#</th>
              <th className="px-4 py-3 text-left">Nom</th>
              <th className="px-4 py-3 text-left">Email</th>
              <th className="px-4 py-3 text-left">Niveau</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="p-8 text-center">Chargement...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={5} className="p-8 text-center">Aucun étudiant</td></tr>
            ) : filtered.map((e, i) => (
              <tr key={e.id} className="hover:bg-slate-50">
                <td className="px-4 py-3 text-sm">{i+1}</td>
                <td className="px-4 py-3">{e.fullname}</td>
                <td className="px-4 py-3 text-sm text-slate-600">{e.email}</td>
                <td className="px-4 py-3"><span className="px-2 py-1 rounded bg-blue-100 text-blue-800 text-xs font-semibold">{e.niveau}</span></td>
                <td className="px-4 py-3 text-right">
                  <div className="inline-flex gap-2">
                    <button onClick={() => openEdit(e)} className="p-2 rounded hover:bg-slate-100"><Edit size={16} /></button>
                    <button onClick={() => doDelete(e.id)} className="p-2 rounded hover:bg-red-50 text-red-600"><Trash2 size={16} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing?.id ? "Modifier étudiant" : "Créer étudiant"}>
        {editing && (
          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium">Nom complet</label>
              <input required value={editing.fullname} onChange={(e) => setEditing({...editing, fullname: e.target.value})} className="mt-1 w-full border px-3 py-2 rounded" />
            </div>
            <div>
              <label className="block text-sm font-medium">Email</label>
              <input required type="email" value={editing.email} onChange={(e) => setEditing({...editing, email: e.target.value})} className="mt-1 w-full border px-3 py-2 rounded" />
            </div>
            <div>
              <label className="block text-sm font-medium">Niveau</label>
              <select value={editing.niveau} onChange={(e) => setEditing({...editing, niveau: e.target.value})} className="mt-1 w-full border px-3 py-2 rounded">
                <option>L1</option>
                <option>L2</option>
                <option>L3</option>
                <option>M1</option>
                <option>M2</option>
              </select>
            </div>
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 rounded bg-slate-100">Annuler</button>
              <button disabled={submitting} type="submit" className="px-4 py-2 rounded bg-indigo-600 text-white">{submitting ? "..." : "Enregistrer"}</button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
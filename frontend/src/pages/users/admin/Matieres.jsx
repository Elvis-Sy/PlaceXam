import React, { useEffect, useState, useMemo } from "react";
import { Plus, Edit, Trash2, Download } from "lucide-react";
import { getAllMatieres, createMatiere, updateMatiere, deleteMatiere } from "../../../services/matieres";

function Modal({ open, onClose, title, children }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/30" onClick={onClose} />
      <div className="relative z-10 w-full max-w-xl mx-4">
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

export default function Matieres() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(()=>{ load(); }, []);
  async function load() {
    setLoading(true);
    try {
      const res = await getAllMatieres();
      const data = res?.data ?? res ?? [];
      setList(Array.isArray(data) ? data : data?.matieres ?? []);
    } catch (e) {
      console.error(e);
    } finally { setLoading(false); }
  }

  const filtered = useMemo(()=> {
    const q = query.trim().toLowerCase();
    if (!q) return list;
    return list.filter(m => (m.label || "").toLowerCase().includes(q) || (m.niveau||"").toLowerCase().includes(q));
  }, [list, query]);

  function openCreate() { setEditing({ label: "", niveau: "L1" }); setModalOpen(true); }
  function openEdit(m) { setEditing({...m}); setModalOpen(true); }

  async function submit(e) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = { label: editing.label, niveau: editing.niveau };
      if (editing.id) await updateMatiere(editing.id, payload);
      else await createMatiere(payload);
      setModalOpen(false);
      setEditing(null);
      await load();
    } catch (err) {
      alert(err?.response?.data?.message ?? err.message ?? "Erreur");
    } finally { setSubmitting(false); }
  }

  async function doDelete(id) {
    if (!confirm("Supprimer cette matière ?")) return;
    try {
      await deleteMatiere(id);
      await load();
    } catch (e) {
      alert(e?.response?.data?.message ?? e.message ?? "Erreur");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Matières</h1>
          <p className="text-sm text-slate-500">Liste des matières et niveaux.</p>
        </div>
        <div className="flex items-center gap-3">
          <input placeholder="Rechercher..." value={query} onChange={(e)=>setQuery(e.target.value)} className="px-3 py-2 border rounded" />
          <button onClick={openCreate} className="px-3 py-2 bg-indigo-600 text-white rounded flex items-center gap-2"><Plus size={16}/>Nouvelle</button>
          <button onClick={() => {
            const rows = [["label","niveau"], ...filtered.map(m=>[m.label,m.niveau])];
            const csv = rows.map(r=>r.map(c=>`"${String(c).replace(/"/g,'""')}"`).join(",")).join("\n");
            const blob = new Blob([csv], { type: "text/csv;charset=utf-8;"});
            const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href=url; a.download="matieres.csv"; a.click(); URL.revokeObjectURL(url);
          }} className="px-3 py-2 bg-slate-100 rounded"><Download size={16}/></button>
        </div>
      </div>

      <div className="bg-white border rounded shadow-sm">
        <table className="min-w-full">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-left">#</th>
              <th className="px-4 py-3 text-left">Label</th>
              <th className="px-4 py-3 text-left">Niveau</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? <tr><td colSpan={4} className="p-8 text-center">Chargement...</td></tr> :
            filtered.length === 0 ? <tr><td colSpan={4} className="p-8 text-center">Aucune matière</td></tr> :
            filtered.map((m,i)=>(
              <tr key={m.id} className="hover:bg-slate-50">
                <td className="px-4 py-3">{i+1}</td>
                <td className="px-4 py-3">{m.label}</td>
                <td className="px-4 py-3">{m.niveau}</td>
                <td className="px-4 py-3 text-right">
                  <div className="inline-flex gap-2">
                    <button onClick={()=>openEdit(m)} className="p-2 rounded hover:bg-slate-100"><Edit size={16}/></button>
                    <button onClick={()=>doDelete(m.id)} className="p-2 rounded hover:bg-red-50 text-red-600"><Trash2 size={16}/></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal open={modalOpen} onClose={()=>setModalOpen(false)} title={editing?.id ? "Modifier matière" : "Créer matière"}>
        {editing && (
          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="block text-sm">Label</label>
              <input required value={editing.label} onChange={(e)=>setEditing(s=>({...s,label:e.target.value}))} className="mt-1 w-full border px-3 py-2 rounded" />
            </div>
            <div>
              <label className="block text-sm">Niveau</label>
              <select required value={editing.niveau} onChange={(e)=>setEditing(s=>({...s,niveau:e.target.value}))} className="mt-1 border px-3 py-2 rounded">
                <option value="L1">L1</option>
                <option value="L2">L2</option>
                <option value="L3">L3</option>
                <option value="M1">M1</option>
                <option value="M2">M2</option>
              </select>
            </div>
            <div className="flex justify-end gap-2">
              <button type="button" onClick={()=>setModalOpen(false)} className="px-4 py-2 bg-slate-100 rounded">Annuler</button>
              <button type="submit" disabled={submitting} className="px-4 py-2 bg-indigo-600 text-white rounded">{submitting ? "..." : "Enregistrer"}</button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
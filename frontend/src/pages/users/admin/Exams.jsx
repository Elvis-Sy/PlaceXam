import React, { useEffect, useState, useMemo } from "react";
import { Plus, Edit, Trash2, Download } from "lucide-react";
import { getAllExams, createExam, updateExam, deleteExam } from "../../../services/exams";
import { getAllMatieres } from "../../../services/matieres";

function Modal({ open, onClose, title, children }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/30" onClick={onClose}/>
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

export default function Exams() {
  const [exams, setExams] = useState([]);
  const [matieres, setMatieres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(()=>{ load(); loadMatieres(); }, []);
  async function load() {
    setLoading(true);
    try {
      const res = await getAllExams();
      console.log("getAllExams response:", res);
      const data = res?.data ?? res ?? [];
      setExams(Array.isArray(data) ? data : data?.exams ?? []);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  }
  async function loadMatieres(){
    try {
      const res = await getAllMatieres();
      const data = res?.data ?? res ?? [];
      setMatieres(Array.isArray(data) ? data : data?.matieres ?? []);
    } catch(e){ console.error(e); }
  }

  // Utility to get a human label for the matiere with several fallbacks.
  function getMatiereLabel(exam) {
    if (!exam) return "";
    // support both lowercase and uppercase keys returned by the API
    const rel = exam?.matiere ?? exam?.Matiere;
    if (rel) return rel.label ?? rel.libelle ?? rel.name ?? "";
    // sometimes the API might return a matiere_label field
    if (exam?.matiere_label) return exam.matiere_label;
    if (exam?.Matiere_label) return exam.Matiere_label;
    // fallback: try to find the matiere from the loaded matieres list by id
    const id = exam?.matiereId ?? exam?.matiere_id ?? exam?.MatiereId ?? exam?.Matiere_id;
    if (id) {
      const found = matieres.find(m => String(m.id) === String(id));
      if (found) return found.label ?? found.libelle ?? found.name ?? String(id);
    }
    // final fallback: empty string or raw id
    return id ? String(id) : "";
  }

  const filtered = useMemo(()=> {
    const q = query.trim().toLowerCase();
    if (!q) return exams;
    return exams.filter(x => {
      const matLabel = (getMatiereLabel(x) || "").toLowerCase();
      return matLabel.includes(q) || (x.date||"").toLowerCase().includes(q);
    });
  }, [exams, query, matieres]);

  function openCreate() { setEditing({ date: new Date().toISOString().slice(0,16), duree: 90, matiereId: matieres[0]?.id ?? "" }); setModalOpen(true); }
  function openEdit(x) { setEditing({...x}); setModalOpen(true); }

  async function submit(e) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = { date: new Date(editing.date).toISOString(), duree: Number(editing.duree), matiereId: editing.matiereId };
      if (editing.id) await updateExam(editing.id, payload);
      else await createExam(payload);
      setModalOpen(false); setEditing(null); await load();
    } catch (err) {
      alert(err?.response?.data?.message ?? err.message ?? "Erreur");
    } finally { setSubmitting(false); }
  }

  async function doDelete(id) {
    if (!confirm("Supprimer cet examen ?")) return;
    try {
      await deleteExam(id);
      await load();
    } catch (e) { alert(e?.response?.data?.message ?? e.message ?? "Erreur"); }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Examens</h1>
          <p className="text-sm text-slate-500">Gérer les sessions d'examen.</p>
        </div>
        <div className="flex items-center gap-3">
          <input placeholder="Rechercher..." value={query} onChange={(e)=>setQuery(e.target.value)} className="px-3 py-2 border rounded" />
          <button onClick={openCreate} className="px-3 py-2 bg-indigo-600 text-white rounded flex items-center gap-2"><Plus size={16}/>Nouvel examen</button>
          <button onClick={()=>{
            const rows=[
              ["date","duree","matiere"],
              ...filtered.map(x=>[x.date,x.duree,getMatiereLabel(x)])
            ];
            const csv = rows.map(r=>r.map(c=>`"${String(c).replace(/"/g,'""')}"`).join(",")).join("\n");
            const blob=new Blob([csv],{type:"text/csv;charset=utf-8;"}); const url=URL.createObjectURL(blob); const a=document.createElement("a"); a.href=url; a.download="exams.csv"; a.click(); URL.revokeObjectURL(url);
          }} className="px-3 py-2 bg-slate-100 rounded"><Download size={16}/></button>
        </div>
      </div>

      <div className="bg-white border rounded shadow-sm">
        <table className="min-w-full">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-left">#</th>
              <th className="px-4 py-3 text-left">Date</th>
              <th className="px-4 py-3 text-left">Durée (min)</th>
              <th className="px-4 py-3 text-left">Matière</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? <tr><td colSpan={5} className="p-8 text-center">Chargement...</td></tr> :
            filtered.length === 0 ? <tr><td colSpan={5} className="p-8 text-center">Aucun examen</td></tr> :
            filtered.map((x,i)=>(
              <tr key={x.id} className="hover:bg-slate-50">
                <td className="px-4 py-3">{i+1}</td>
                <td className="px-4 py-3">{new Date(x.date).toLocaleString()}</td>
                <td className="px-4 py-3">{x.duree}</td>
                <td className="px-4 py-3">{getMatiereLabel(x)}</td>
                <td className="px-4 py-3 text-right">
                  <div className="inline-flex gap-2">
                    <button onClick={()=>openEdit(x)} className="p-2 rounded hover:bg-slate-100"><Edit size={16}/></button>
                    <button onClick={()=>doDelete(x.id)} className="p-2 rounded hover:bg-red-50 text-red-600"><Trash2 size={16}/></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal open={modalOpen} onClose={()=>setModalOpen(false)} title={editing?.id ? "Modifier examen" : "Créer examen"}>
        {editing && (
          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="block text-sm">Date & heure</label>
              <input required type="datetime-local" value={editing.date?.slice(0,16) ?? ""} onChange={(e)=>setEditing(s=>({...s, date: e.target.value}))} className="mt-1 w-full border px-3 py-2 rounded" />
            </div>
            <div>
              <label className="block text-sm">Durée (minutes)</label>
              <input required type="number" min="1" value={editing.duree} onChange={(e)=>setEditing(s=>({...s, duree: e.target.value}))} className="mt-1 w-40 border px-3 py-2 rounded" />
            </div>

            <div>
              <label className="block text-sm">Matière</label>
              <select required value={editing.matiereId} onChange={(e)=>setEditing(s=>({...s, matiereId: e.target.value}))} className="mt-1 w-full border px-3 py-2 rounded">
                <option value="">--Choisir--</option>
                {matieres.map(m => <option key={m.id} value={m.id}>{m.label} ({m.niveau})</option>)}
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
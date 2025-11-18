import React, { useEffect, useState, useMemo } from "react";
import { Plus, Edit, Trash2, Download, Search } from "lucide-react";
import { getAllExams, createExam, updateExam, deleteExam } from "../../../services/exams";
import { getAllMatieres } from "../../../services/matieres";
import DataTable from "../../../components/ui/DataTable";

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

export default function Exams() {
  const [exams, setExams] = useState([]);
  const [matieres, setMatieres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
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

  const columns = useMemo(() => [
    { field: "index", headerName: "#", width: 60 },
    { field: "date", headerName: "Date et heure", width: 240, renderCell: (r) => new Date(r.date).toLocaleString() },
    { field: "duree", headerName: "Durée (min)", width: 120 },
    { field: "matiere", headerName: "Matière", width: 220, renderCell: (r) => getMatiereLabel(r) },
    { field: "niveau", headerName: "Niveau", width: 120, renderCell: (r) => (r.Matiere?.niveau ?? r.matiere?.niveau ?? "") },
    {
      field: "actions",
      headerName: "Actions",
      align: "right",
      renderCell: (row) => (
        <div className="inline-flex gap-2">
          <button className="p-2 rounded hover:bg-slate-100" onClick={(e)=>{ e.stopPropagation(); openEdit(row); }}>
            <Edit size={16} />
          </button>
          <button className="p-2 rounded hover:bg-red-50 text-red-600" onClick={(e)=>{ e.stopPropagation(); setDeleteTarget(row); setDeleteOpen(true); }}>
            <Trash2 size={16} />
          </button>
        </div>
      ),
    },
  ], [openEdit, setDeleteTarget, setDeleteOpen, matieres, exams]);

  const rowsForTable = filtered.map((x, i) => ({ ...x, index: i + 1 }));

  function openCreate() { setEditing({ date: new Date().toISOString().slice(0,10), duree: 90, matiereId: "" }); setModalOpen(true); }
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
    try {
      await deleteExam(id);
      await load();
    } catch (e) { alert(e?.response?.data?.message ?? e.message ?? "Erreur"); }
  }

  const exportCSV = () => {
    const rows=[
        ["date","duree","matiere"],
        ...filtered.map(x=>[x.date,x.duree,getMatiereLabel(x)])
      ];
      const csv = rows.map(r=>r.map(c=>`"${String(c).replace(/"/g,'""')}"`).join(",")).join("\n");
      const blob=new Blob([csv],{type:"text/csv;charset=utf-8;"}); const url=URL.createObjectURL(blob); const a=document.createElement("a"); a.href=url; a.download="exams.csv"; a.click(); URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-semibold text-slate-800">Examens</h1>
          <p className="text-sm text-slate-500 mt-1">
            Gérer les sessions d'examens.
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

      {loading ? (
          <div className="p-8 text-center">Chargement...</div>
        ) : (
          <DataTable
            columns={columns}
            rows={rowsForTable}
            initialPageSize={5}
            rowsPerPageOptions={[5,10,25]}
            dense={false}
          />
      )}

      <Modal open={modalOpen} onClose={()=>setModalOpen(false)} title={editing?.id ? "Modifier examen" : "Créer examen"}>
        {editing && (
          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="block text-sm">Date et heure</label>
              <input required type="datetime-local" value={editing.date?.slice(0,16) ?? ""} onChange={(e)=>setEditing(s=>({...s, date: e.target.value}))}
                className="w-full border border-slate-300 px-4 py-2.5 rounded-xl
                          focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500/40
                          outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-sm">Durée (minutes)</label>
              <input required type="number" min="1" value={editing.duree} onChange={(e)=>setEditing(s=>({...s, duree: e.target.value}))}
                className="w-full border border-slate-300 px-4 py-2.5 rounded-xl
                          focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500/40
                          outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-sm">Matière</label>
              <select required value={editing.matiereId} onChange={(e)=>setEditing(s=>({...s, matiereId: e.target.value}))}
                className="w-full border border-slate-300 px-4 py-2.5 rounded-xl
                          focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500/40
                          outline-none transition-all"
              >
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

      {/* delete modal */}
      <Modal
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        title="Confirmer la suppression"
      >
        <div className="space-y-4">

          <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
            <p className="text-sm text-red-700">
              Voulez-vous vraiment supprimer cette examen :
              <span className="font-semibold"> « {deleteTarget?.Matiere?.label} »</span> ?
            </p>

            <p className="text-xs text-red-600 mt-1">
              ⚠️ Cette action est <span className="font-semibold">définitive</span>.
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
    </div>
  );
}
import React, { useEffect, useState, useMemo } from "react";
import { Plus, Edit, Trash2, Download, Search } from "lucide-react";
import { getAllMatieres, createMatiere, updateMatiere, deleteMatiere } from "../../../services/matieres";
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

export default function Matieres() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
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

  const columns = useMemo(() => [
    { field: "index", headerName: "#", width: 60 },
    { field: "label", headerName: "Label", width: 220 },
    { field: "niveau", headerName: "Niveau", width: 120 },
    {
      field: "actions",
      headerName: "Actions",
      align: "right",
      renderCell: (row) => (
        <div className="inline-flex gap-2">
          <button className="p-2 rounded hover:bg-slate-100" onClick={(e) => { e.stopPropagation(); openEdit(row); }}>
            <Edit size={16} />
          </button>
          <button className="p-2 rounded hover:bg-red-50 text-red-600" onClick={(e) => { e.stopPropagation(); setDeleteTarget(row); setDeleteOpen(true); }}>
            <Trash2 size={16} />
          </button>
        </div>
      ),
    },
  ], [openEdit, setDeleteTarget, setDeleteOpen, list]);

  const rowsForTable = filtered.map((m, i) => ({ ...m, index: i + 1 }));

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
    try {
      await deleteMatiere(id);
      await load();
    } catch (e) {
      alert(e?.response?.data?.message ?? e.message ?? "Erreur");
    }
  }

  const exportCSV = () => {
    const rows = [["label","niveau"], ...filtered.map(m=>[m.label,m.niveau])];
    const csv = rows.map(r=>r.map(c=>`"${String(c).replace(/"/g,'""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;"});
    const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href=url; a.download="matieres.csv"; a.click(); URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-semibold text-slate-800">Matières</h1>
          <p className="text-sm text-slate-500 mt-1">
            Liste des matières et niveaux.
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
            rowsPerPageOptions={[5, 10, 25]}
            dense={false}
            onRowClick={(row) => openEdit(row)}
          />
      )}

      <Modal open={modalOpen} onClose={()=>setModalOpen(false)} title={editing?.id ? "Modifier matière" : "Créer matière"}>
        {editing && (
          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="block text-sm">Label</label>
              <input required value={editing.label} onChange={(e)=>setEditing(s=>({...s,label:e.target.value}))} 
                className="w-full border border-slate-300 px-4 py-2.5 rounded-xl
                          focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500/40
                          outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-sm">Niveau</label>
              <select required value={editing.niveau} onChange={(e)=>setEditing(s=>({...s,niveau:e.target.value}))} 
                className="w-full border border-slate-300 px-4 py-2.5 rounded-xl
                          focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500/40
                          outline-none transition-all"
              >
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

      {/* delete modal */}
      <Modal
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        title="Confirmer la suppression"
      >
        <div className="space-y-4">

          <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
            <p className="text-sm text-red-700">
              Voulez-vous vraiment supprimer cette matières :
              <span className="font-semibold"> « {deleteTarget?.label} »</span> ?
            </p>

            <p className="text-xs text-red-600 mt-1">
              ⚠️ Cette action est <span className="font-semibold">définitive</span> et supprimera toutes les examens associées.
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
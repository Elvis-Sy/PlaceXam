import React, { useEffect, useState, useMemo } from "react";
import {
  getUsersByRole,
  createUser,
  updateUser,
  deleteUser,
  importUsers,
  // optional: searchUsers
} from "../../../services/users";
import { Plus, Download, Upload, Search, Trash2, Edit, X } from "lucide-react";
import DataTable from "../../../components/ui/DataTable";

/**
 * Admin Users CRUD page
 *
 * - client-side search + optional server search
 * - create / edit modal
 * - import (file upload)
 * - delete with confirm
 *
 * UX: Tailwind-based, subtle transitions
 */

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

export default function Users({userRole}) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  const [query, setQuery] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [editingUser, setEditingUser] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    fetch();
  }, [userRole]);

  async function fetch() {
    setLoading(true);
    setErr(null);
    try {
      const res = await getUsersByRole(userRole);
      const data = res?.data ?? res;
      const list = Array.isArray(data) ? data : data?.users ?? data?.data ?? [];
      setUsers(list);
    } catch (e) {
      setErr(e?.message || "Impossible de récupérer les utilisateurs");
    } finally {
      setLoading(false);
    }
  }

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return users;
    return users.filter((u) =>
      [u.fullname ?? u.full_name ?? "", u.email ?? "", u.role ?? ""]
        .join(" ")
        .toLowerCase()
        .includes(q)
    );
  }, [users, query]);

  const columns = useMemo(() => {
    const base = [
      { field: "index", headerName: "#", width: 60 },
      {
        field: "fullname",
        headerName: "Nom",
        width: 320,
        renderCell: (r) => (
          <div>
            <div className="font-medium">{r.fullname ?? r.full_name ?? "-"}</div>
            <div className="text-xs text-slate-400">{r.createdAt ? new Date(r.createdAt).toLocaleString().split(" ")[0] : ""}</div>
          </div>
        ),
      },
      {
        field: "email",
        headerName: "Email",
        width: 260,
        renderCell: (r) => <div className="text-sm text-slate-600">{r.email}</div>,
      },
      {
        field: "role",
        headerName: "Rôle",
        width: 120,
        renderCell: (r) => (
          <span className={
            "inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold " +
            (r.role === "admin" ? "bg-amber-100 text-amber-800" : r.role === "surveillant" ? "bg-blue-100 text-blue-800" : "bg-slate-100 text-slate-700")
          }>{r.role}</span>
        ),
      },
    ];

    if (userRole === "etudiant") {
      base.splice(2, 0, { // insert niveau before email
        field: "niveau",
        headerName: "Niveau",
        width: 110,
        renderCell: (r) => <div className="font-semibold text-sm text-slate-600">{r.niveau ?? ""}</div>,
      });
    }

    base.push({
      field: "actions",
      headerName: "Actions",
      align: "right",
      width: 120,
      renderCell: (r) => (
        <div className="inline-flex items-center gap-2">
          <button onClick={(e) => { e.stopPropagation(); openEdit(r); }} className="p-2 rounded-md hover:bg-slate-100 transition" title="Editer">
            <Edit size={16} />
          </button>
          <button onClick={(e) => { e.stopPropagation(); setDeleteTarget(r); setDeleteOpen(true); }} className="p-2 rounded-md hover:bg-red-50 text-red-600 transition" title="Supprimer" disabled={deletingId === (r.id ?? r.userId ?? r._id)}>
            <Trash2 size={16} />
          </button>
        </div>
      ),
    });

    return base;
  }, [userRole, openEdit, deletingId]);
  
  const rowsForTable = useMemo(() => {
    return filtered.map((u, i) => ({
      id: u.id ?? u.userId ?? u._id ?? `user_${i}`,
      index: i + 1,
      ...u,
    }));
  }, [filtered]);

  // Create / Edit handlers
  function openCreate() {
    setEditingUser({ fullname: "", email: "", niveau: "", role: "etudiant", password: "" });
    setModalOpen(true);
  }
  function openEdit(u) {
    setEditingUser({ ...u });
    setModalOpen(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        fullname: editingUser.fullname,
        email: editingUser.email,
        niveau: editingUser.niveau,
        role: editingUser.role,
        ...(editingUser.password ? { password: editingUser.password } : {}),
      };
      if (editingUser.id || editingUser.userId) {
        // update
        const id = editingUser.id ?? editingUser.userId ?? editingUser._id;
        await updateUser(id, payload);
      } else {
        // create
        await createUser(payload);
      }
      setModalOpen(false);
      setEditingUser(null);
      await fetch();
    } catch (e) {
      alert(e?.response?.data?.message ?? e?.message ?? "Erreur");
    } finally {
      setSubmitting(false);
    }
  }

  // Delete
  async function handleDelete(id) {
    try {
      await deleteUser(id);
      await fetch();
    } catch (e) {
      alert(e?.response?.data?.message ?? e?.message ?? "Erreur suppression");
    } finally {
      setDeletingId(null);
    }
  }

  // Import
  async function doImport(e) {
    e.preventDefault();
    if (!selectedFile) {
      alert("Choisir un fichier à importer");
      return;
    }
    const fd = new FormData();
    fd.append("file", selectedFile);
    try {
      setLoading(true);
      await importUsers(fd);
      setSelectedFile(null);
      await fetch();
      alert("Import terminé");
    } catch (e) {
      alert(e?.response?.data?.message ?? e?.message ?? "Erreur import");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-slate-800">Gestion des {userRole}s</h1>
          <p className="text-sm text-slate-500 mt-1">Créer, modifier, importer et gérer les utilisateurs.</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-white border border-gray-500/80 rounded-md shadow-sm px-3 py-2">
            <Search className="text-slate-400" />
            <input
              placeholder="Rechercher un nom, email ou rôle..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="outline-none px-2 text-sm w-64"
            />
          </div>

          <IconButton
            onClick={() => {
              // export CSV constructed from current filtered list
              const rows = [["fullname", "email", "role"]];
              for (const u of filtered) rows.push([u.fullname ?? "", u.email ?? "", u.role ?? ""]);
              const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
              const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = "users-export.csv";
              a.click();
              URL.revokeObjectURL(url);
            }}
            className="bg-slate-800 text-white hover:bg-slate-900"
            title="Exporter CSV"
          >
            <Download size={16} /> Exporter
          </IconButton>

          <label className="cursor-pointer inline-flex items-center">
            <input
              type="file"
              accept=".csv, .xlsx, .xls"
              className="hidden"
              onChange={(e) => setSelectedFile(e.target.files?.[0] ?? null)}
            />
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium shadow-sm hover:shadow-md transition-shadow bg-emerald-50 text-emerald-700 border border-emerald-100 hover:bg-emerald-100">
              <Upload size={16} /> Import
            </div>
          </label>

          <IconButton onClick={openCreate} className="bg-indigo-600 text-white hover:bg-indigo-700">
            <Plus size={16} /> Créer
          </IconButton>
        </div>
      </div>

      {/* Import action */}
      {selectedFile && (
        <form onSubmit={doImport} className="flex items-center gap-3">
          <div className="text-sm text-slate-700">Fichier sélectionné: {selectedFile.name}</div>
          <button className="px-3 py-1.5 rounded-md bg-emerald-600 text-white" type="submit">
            Lancer l'import
          </button>
          <button
            type="button"
            className="px-3 py-1.5 rounded-md bg-slate-100"
            onClick={() => setSelectedFile(null)}
          >
            Annuler
          </button>
        </form>
      )}

      {/* Table */}
      {loading ? (
          <div className="p-8 text-center">Chargement...</div>
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

      {/* Modal create / edit */}
      <Modal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingUser(null);
        }}
        title={editingUser && (editingUser.id || editingUser.userId) ? "Modifier utilisateur" : "Créer utilisateur"}
      >
        {editingUser && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700">Nom complet</label>
              <input
                required
                value={editingUser.fullname ?? ""}
                onChange={(e) => setEditingUser((s) => ({ ...s, fullname: e.target.value }))}
                className="w-full border border-slate-300 px-4 py-2.5 rounded-xl
                          focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500/40
                          outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">Email</label>
              <input
                required
                type="email"
                value={editingUser.email ?? ""}
                onChange={(e) => setEditingUser((s) => ({ ...s, email: e.target.value }))}
                className="w-full border border-slate-300 px-4 py-2.5 rounded-xl
                          focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500/40
                          outline-none transition-all"
              />
            </div>

            {userRole == "etudiant" && (<div>
              <label className="block text-sm font-medium text-slate-700">Niveau</label>
              <select
                value={editingUser.niveau ?? ""}
                onChange={(e) => setEditingUser((s) => ({ ...s, niveau: e.target.value }))}
                className="text-gray-600 w-full border border-slate-300 px-4 py-2.5 rounded-xl
                          focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500/40
                          outline-none transition-all"
              >
                <option value="L1">L1</option>
                <option value="L2">L2</option>
                <option value="L3">L3</option>
                <option value="M1">M1</option>
                <option value="M2">M2</option>
              </select>
            </div>)}

            <div>
              <label className="block text-sm font-medium text-slate-700">Rôle</label>
              <select
                value={editingUser.role ?? userRole}
                onChange={(e) => setEditingUser((s) => ({ ...s, role: e.target.value }))}
                className="text-gray-600 w-full border border-slate-300 px-4 py-2.5 rounded-xl
                          focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500/40
                          outline-none transition-all"
              >
                <option value="etudiant">Étudiant</option>
                <option value="surveillant">Surveillant</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            {/* Password only for creation or explicit change */}
            <div>
              <label className="block text-sm font-medium text-slate-700">Mot de passe (laisser vide pour ne pas modifier)</label>
              <input
                type="password"
                value={editingUser.password ?? ""}
                onChange={(e) => setEditingUser((s) => ({ ...s, password: e.target.value }))}
                className="w-full border border-slate-300 px-4 py-2.5 rounded-xl
                          focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500/40
                          outline-none transition-all"
              />
            </div>

            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => { setModalOpen(false); setEditingUser(null); }} className="px-4 py-2 rounded-md bg-slate-100">Annuler</button>
              <button disabled={submitting} type="submit" className="px-4 py-2 rounded-md bg-indigo-600 text-white">
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
              Voulez-vous vraiment supprimer {userRole == "etudiant" ? "l'etudiant(e)" : "le/la surveillant(e)"} :
              <span className="font-semibold"> « {deleteTarget?.fullname} »</span> ?
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
                await handleDelete(deleteTarget.id);
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
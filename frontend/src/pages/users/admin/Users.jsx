import React, { useEffect, useState, useMemo } from "react";
import {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
  importUsers,
  // optional: searchUsers
} from "../../../services/users";
import { Plus, Download, Upload, Search, Trash2, Edit, X } from "lucide-react";

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

function Modal({ open, onClose, children, title }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-xl mx-4">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden animate-fade-in">
          <div className="flex items-center justify-between px-5 py-3 border-b">
            <h3 className="text-lg font-semibold">{title}</h3>
            <button onClick={onClose} className="p-1 rounded-md hover:bg-slate-100">
              <X size={18} />
            </button>
          </div>
          <div className="p-5">{children}</div>
        </div>
      </div>
    </div>
  );
}

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  const [query, setQuery] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    fetch();
  }, []);

  async function fetch() {
    setLoading(true);
    setErr(null);
    try {
      const res = await getUsers();
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

  // Create / Edit handlers
  function openCreate() {
    setEditingUser({ fullname: "", email: "", role: "etudiant", password: "" });
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
    if (!confirm("Supprimer cet utilisateur ? Cette action est irréversible.")) return;
    setDeletingId(id);
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
          <h1 className="text-3xl font-semibold text-slate-800">Gestion des utilisateurs</h1>
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
      <div className="bg-white border border-gray-500/80 rounded-lg shadow-sm overflow-hidden">
        <table className="min-w-full divide-y">
          <thead className="bg-slate-50 border-b border-gray-500/80">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-slate-500">#</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-slate-500">Nom</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-slate-500">Email</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-slate-500">Rôle</th>
              <th className="px-4 py-3 text-right text-sm font-medium text-slate-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200/80">
            {loading ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-slate-400">
                  Chargement...
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-slate-400">
                  Aucun utilisateur trouvé
                </td>
              </tr>
            ) : (
              filtered.map((u, i) => (
                <tr
                  key={u.id ?? u.userId ?? u._id ?? i}
                  className="hover:bg-slate-50 transition-colors"
                  title={`Utilisateur ${u.fullname ?? u.email}`}
                >
                  <td className="px-4 py-3 text-sm text-slate-600">{i + 1}</td>
                  <td className="px-4 py-3">
                    <div className="font-medium">{u.fullname ?? u.full_name ?? "-"}</div>
                    <div className="text-xs text-slate-400">{u.createdAt ? new Date(u.createdAt).toLocaleString() : ""}</div>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-600">{u.email}</td>
                  <td className="px-4 py-3 text-sm">
                    <span className={
                      "inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold " +
                      (u.role === "admin" ? "bg-amber-100 text-amber-800" : u.role === "surveillant" ? "bg-blue-100 text-blue-800" : "bg-slate-100 text-slate-700")
                    }>
                      {u.role}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right text-sm">
                    <div className="inline-flex items-center gap-2">
                      <button
                        onClick={() => openEdit(u)}
                        className="p-2 rounded-md hover:bg-slate-100 transition"
                        title="Editer"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(u.id ?? u.userId ?? u._id)}
                        className="p-2 rounded-md hover:bg-red-50 text-red-600 transition"
                        title="Supprimer"
                        disabled={deletingId === (u.id ?? u.userId ?? u._id)}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

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
                className="mt-1 block w-full rounded-md border px-3 py-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">Email</label>
              <input
                required
                type="email"
                value={editingUser.email ?? ""}
                onChange={(e) => setEditingUser((s) => ({ ...s, email: e.target.value }))}
                className="mt-1 block w-full rounded-md border px-3 py-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">Rôle</label>
              <select
                value={editingUser.role ?? "etudiant"}
                onChange={(e) => setEditingUser((s) => ({ ...s, role: e.target.value }))}
                className="mt-1 block w-full rounded-md border px-3 py-2"
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
                className="mt-1 block w-full rounded-md border px-3 py-2"
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
    </div>
  );
}
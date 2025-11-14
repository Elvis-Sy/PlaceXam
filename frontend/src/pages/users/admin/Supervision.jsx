import React, { useEffect, useState, useMemo } from "react";
import {
  getAllSupervisions,
  createSupervision,
  updateSupervision,
  deleteSupervision,
} from "../../../services/supervisions";
import { Plus, Trash2, Edit, X } from "lucide-react";

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

function Modal({ open, onClose, children, title }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-xl mx-4">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
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

export default function Supervision() {
  const [supervisions, setSupervisions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSupervision, setEditingSupervision] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    fetchSupervisions();
  }, []);

  async function fetchSupervisions() {
    setLoading(true);
    setErr(null);
    try {
      const res = await getAllSupervisions();
      setSupervisions(res);
    } catch (e) {
      setErr(e?.message || "Unable to fetch supervisions");
    } finally {
      setLoading(false);
    }
  }

  function openCreate() {
    setEditingSupervision({ examId: "", surveillantId: "" });
    setModalOpen(true);
  }

  function openEdit(s) {
    setEditingSupervision(s);
    setModalOpen(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingSupervision.id) {
        await updateSupervision(editingSupervision.id, editingSupervision);
      } else {
        await createSupervision(editingSupervision);
      }
      setModalOpen(false);
      setEditingSupervision(null);
      await fetchSupervisions();
    } catch (e) {
      alert(e?.message || "Error");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id) {
    if (!confirm("Delete this supervision? This action is irreversible.")) return;
    setDeletingId(id);
    try {
      await deleteSupervision(id);
      await fetchSupervisions();
    } catch (e) {
      alert(e?.message || "Error deleting supervision");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Supervision Management</h1>
        <IconButton onClick={openCreate} className="bg-indigo-600 text-white hover:bg-indigo-700">
          <Plus size={16} /> Create
        </IconButton>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="bg-white border rounded-lg shadow-sm overflow-hidden">
          <table className="min-w-full divide-y">
            <thead>
              <tr>
                <th>#</th>
                <th>Exam ID</th>
                <th>Surveillant ID</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {supervisions.map((s, i) => (
                <tr key={s.id}>
                  <td>{i + 1}</td>
                  <td>{s.examId}</td>
                  <td>{s.surveillantId}</td>
                  <td>
                    <IconButton onClick={() => openEdit(s)}>
                      <Edit size={16} />
                    </IconButton>
                    <IconButton onClick={() => handleDelete(s.id)}>
                      <Trash2 size={16} />
                    </IconButton>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingSupervision(null);
        }}
        title={editingSupervision ? "Edit Supervision" : "Create Supervision"}
      >
        {editingSupervision && (
          <form onSubmit={handleSubmit}>
            <div>
              <label>Exam ID</label>
              <input
                required
                value={editingSupervision.examId}
                onChange={(e) => setEditingSupervision({ ...editingSupervision, examId: e.target.value })}
              />
            </div>
            <div>
              <label>Surveillant ID</label>
              <input
                required
                value={editingSupervision.surveillantId}
                onChange={(e) => setEditingSupervision({ ...editingSupervision, surveillantId: e.target.value })}
              />
            </div>
            <button type="submit" disabled={submitting}>
              {submitting ? "Saving..." : "Save"}
            </button>
          </form>
        )}
      </Modal>
    </div>
  );
}
import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import authService from "../../services/auth";

export default function ResetPasswordPage() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [info, setInfo] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setInfo("");

    if (!password) {
      setError("Entrez un nouveau mot de passe.");
      return;
    }
    if (password !== confirm) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }
    if (!token) {
      setError("Jeton manquant. Le lien est invalide.");
      return;
    }

    setLoading(true);
    try {
      const res = await authService.resetPassword(token, password);
      const msg = res?.message ?? "Mot de passe réinitialisé avec succès.";
      setInfo(msg);
      setTimeout(() => navigate("/auth/login"), 2500);
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Impossible de réinitialiser le mot de passe.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900">
      <div className="w-full max-w-sm bg-white p-6 rounded-lg shadow-lg border border-slate-200">
        <h2 className="text-center text-xl font-bold text-slate-900">Réinitialiser le mot de passe</h2>

        <p className="text-sm text-slate-500 mt-2">
          Entrez votre nouveau mot de passe.
        </p>

        <form className="mt-6 flex flex-col gap-4" onSubmit={handleSubmit}>
          <div className="flex flex-col gap-1">
            <label htmlFor="password" className="text-sm font-medium">Nouveau mot de passe</label>
            <input
              id="password"
              className="border rounded-md px-3 py-2 bg-slate-50 outline-none focus:ring-2 focus:ring-slate-500"
              type="password"
              placeholder="Nouveau mot de passe…"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="confirm" className="text-sm font-medium">Confirmez le mot de passe</label>
            <input
              id="confirm"
              className="border rounded-md px-3 py-2 bg-slate-50 outline-none focus:ring-2 focus:ring-slate-500"
              type="password"
              placeholder="Confirmez le mot de passe…"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
            />
          </div>

          {error && <p className="text-red-600 text-sm text-center">{error}</p>}
          {info && <p className="text-green-600 text-sm text-center">{info}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full h-11 bg-slate-900 text-white font-semibold rounded-md hover:bg-slate-800 transition disabled:opacity-50"
          >
            {loading ? "Réinitialisation..." : "Réinitialiser le mot de passe"}
          </button>

          <button
            type="button"
            onClick={() => navigate("/auth/login")}
            className="w-full h-11 text-slate-900 border rounded-md hover:bg-slate-50 transition"
          >
            Retour à la connexion
          </button>
        </form>
      </div>
    </div>
  );
}
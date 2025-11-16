import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import authService from "../../services/auth";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [info, setInfo] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setInfo("");
    setLoading(true);

    try {
      const res = await authService.forgotPassword(email);
      // server returns message; show it
      const msg = res?.message ?? "Vérifiez votre boîte e-mail pour le lien de réinitialisation.";
      setInfo(msg);
      // optionally redirect to login after a delay
      setTimeout(() => navigate("/auth/login"), 3500);
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Erreur lors de la demande.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900">
      <div className="w-full max-w-sm bg-white p-6 rounded-lg shadow-lg border border-slate-200">
        <h2 className="text-center text-xl font-bold text-slate-900">Mot de passe oublié</h2>

        <p className="text-sm text-slate-500 mt-2">
          Entrez votre adresse e-mail et nous vous enverrons un lien pour réinitialiser votre mot de passe.
        </p>

        <form className="mt-6 flex flex-col gap-4" onSubmit={handleSubmit}>
          <div className="flex flex-col gap-1">
            <label htmlFor="email" className="text-sm font-medium">Email</label>
            <input
              id="email"
              className="border rounded-md px-3 py-2 bg-slate-50 outline-none focus:ring-2 focus:ring-slate-500"
              type="email"
              placeholder="email@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
            {loading ? "Envoi..." : "Envoyer le lien"}
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
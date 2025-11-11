import { useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);

    try {
      const user = await login(email, password);

      if (!user) throw new Error("Utilisateur invalide");

      // Redirection selon le rôle
      if (user.role === "admin") navigate("/admin/dashboard");
      else if (user.role === "surveillant") navigate("/surveillant");
      else navigate("/etudiant");

    } catch (err) {
      setErrorMsg(err.message || "Erreur de connexion");
    } finally {
      setLoading(false);
    }
  }


  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900">
      <div className="w-full max-w-sm bg-white p-6 rounded-lg shadow-lg border border-slate-200">
        <h2 className="text-center text-xl font-bold text-slate-900">
          Connexion
        </h2>

        <form className="mt-6 flex flex-col gap-4" onSubmit={handleSubmit}>
          {/* Email */}
          <div className="flex flex-col gap-1">
            <label htmlFor="email" className="text-sm font-medium">
              Email
            </label>
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

          {/* Password */}
          <div className="flex flex-col gap-1">
            <label htmlFor="password" className="text-sm font-medium">
              Mot de passe
            </label>
            <input
              id="password"
              className="border rounded-md px-3 py-2 bg-slate-50 outline-none focus:ring-2 focus:ring-slate-500"
              type="password"
              placeholder="Votre mot de passe…"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {errorMsg && (
            <p className="text-red-600 text-sm text-center">{errorMsg}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full h-11 bg-slate-900 text-white font-semibold rounded-md hover:bg-slate-800 transition disabled:opacity-50"
          >
            {loading ? "Connexion…" : "Se connecter"}
          </button>
        </form>
      </div>
    </div>
  );
}

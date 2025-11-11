export default function Forbidden() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-900 text-white">
      <h1 className="text-6xl font-bold text-red-500">403</h1>
      <p className="mt-4 text-lg">Accès refusé – Vous n’avez pas la permission d’accéder à cette page.</p>
      <a
        href="/"
        className="mt-6 px-4 py-2 bg-slate-700 rounded-md hover:bg-slate-600 transition"
      >
        Retour à l’accueil
      </a>
    </div>
  );
}

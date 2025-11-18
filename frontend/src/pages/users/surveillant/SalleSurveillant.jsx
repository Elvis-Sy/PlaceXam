import React, { useEffect, useState } from "react";
import DataTable from "../../../components/UI/DataTable";
import { getMySalles, getSalleOccupancy } from "../../../services/sideSurveillant";
import { Search } from "lucide-react";

function Modal({ open, onClose, title, children }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/40" onClick={onClose} />
      <div className="relative z-10 w-full max-w-4xl mx-4">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200">
          <div className="flex items-center justify-between px-6 py-4 border-b bg-slate-50">
            <h3 className="text-lg font-bold text-slate-800">{title}</h3>
            <button onClick={onClose} className="text-slate-600 hover:bg-slate-200 p-1 rounded">✕</button>
          </div>
          <div className="p-6">{children}</div>
        </div>
      </div>
    </div>
  );
}

export default function SallesSurveillant() {
  const [salles, setSalles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

  const [planOpen, setPlanOpen] = useState(false);
  const [planSalle, setPlanSalle] = useState(null);
  const [planDate, setPlanDate] = useState(new Date().toISOString().slice(0, 10));
  const [occupancy, setOccupancy] = useState(null);
  const [hoveredPlaceId, setHoveredPlaceId] = useState(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await getMySalles();
        const list = Array.isArray(res) ? res : res?.data ?? [];
        setSalles(Array.isArray(list) ? list : []);
      } catch (e) {
        console.error(e);
        setSalles([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function loadOccupancy(salle, date) {
    try {
      setOccupancy(null);
      const res = await getSalleOccupancy(salle.id, date);
      const places =
        res?.places ?? res?.data?.places ?? res?.occupancy?.places ?? (Array.isArray(res) ? res : null) ?? [];
      setOccupancy({ places: Array.isArray(places) ? places : [] });
    } catch (e) {
      console.error("loadOccupancy:", e);
      setOccupancy({ places: [] });
    }
  }

  function openInspect(salle) {
    setPlanSalle(salle);
    setPlanOpen(true);
    setHoveredPlaceId(null);
    loadOccupancy(salle, planDate);
  }

  const filtered = salles.filter((s) =>
    (s.label ?? "").toString().toLowerCase().includes(query.trim().toLowerCase())
  );

  const rows = filtered.map((s, i) => ({
    id: s.id ?? `s_${i}`,
    index: i + 1,
    label: s.label,
    capacite: s.capacite ?? "-",
  }));

  const columns = [
    { field: "index", headerName: "#", width: 60 },
    { field: "label", headerName: "Label", width: 300 },
    { field: "capacite", headerName: "Capacité", width: 120 },
    {
      field: "actions",
      headerName: "Actions",
      align: "right",
      width: 160,
      renderCell: (r) => (
        <div className="inline-flex gap-2">
          <button
            onClick={(e) => { e.stopPropagation(); openInspect(r); }}
            className="px-3 py-1.5 rounded-md bg-slate-100 hover:bg-slate-200 text-sm"
            title="Inspecter"
          >
            Inspecter
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-slate-800">Mes salles</h1>
          <p className="text-sm text-slate-500 mt-1">Liste des salles dont vous êtes responsable.</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-white border border-gray-500/80 rounded-md shadow-sm px-3 py-2">
            <Search className="text-slate-400" />
            <input
              placeholder="Rechercher une salle..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="outline-none px-2 text-sm w-64"
            />
          </div>
        </div>
      </div>

      <div className="bg-white p-4">
        {loading ? (
          <div className="p-8 text-center">Chargement...</div>
        ) : (
          <DataTable columns={columns} rows={rows} initialPageSize={10} rowsPerPageOptions={[5,10,25]} onRowClick={(r)=> openInspect(r)} />
        )}
      </div>

      <Modal open={planOpen} onClose={() => { setPlanOpen(false); setOccupancy(null); setHoveredPlaceId(null); }} title={planSalle?.label ?? "Plan"}>
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <label className="text-sm">Date:</label>
            <input
              type="date"
              value={planDate}
              onChange={(e) => { setPlanDate(e.target.value); loadOccupancy(planSalle, e.target.value); }}
              className="px-3 py-2 border rounded"
            />
            <button onClick={() => loadOccupancy(planSalle, planDate)} className="px-3 py-2 rounded bg-indigo-600 text-white">Actualiser</button>
          </div>

          <div className="min-h-40">
            {!occupancy && <div className="text-sm text-slate-500">Chargement des places...</div>}
            {occupancy && occupancy.places.length === 0 && <div className="text-sm text-slate-500">Aucune place pour cette date.</div>}
            {occupancy && occupancy.places.length > 0 && (
              <div className="relative">
                {/* calcul du nombre de colonnes comme dans l'admin (sqrt(capacite) clamped à 12) */}
                {(() => {
                  const cols = Math.min(12, Math.ceil(Math.sqrt(occupancy?.places.length || 1)));
                  return (
                    <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
                      {occupancy.places.map((p) => (
                        <div
                          key={p.id ?? p.numero}
                          onClick={() => setHoveredPlaceId(hoveredPlaceId === p.id ? null : p.id)}
                          onMouseEnter={() => hoveredPlaceId !== p.id && setHoveredPlaceId(null)}
                          onMouseLeave={() => hoveredPlaceId !== p.id && setHoveredPlaceId(null)}
                          className={`p-3 rounded-lg border shadow-sm text-center cursor-pointer transition-all duration-200 ${
                            hoveredPlaceId === p.id && p.occupied
                              ? "absolute z-20 max-h-40 max-w-120 shadow-2xl"
                              : "relative scale-100 hover:scale-105"
                          } ${
                            p.occupied
                              ? "bg-red-100 text-red-800"
                              : "bg-emerald-50 text-emerald-800"
                          }`}
                          style={hoveredPlaceId === p.id ? { inset: 0 } : {}}
                        >
                          <div className="text-lg font-bold">{p.numero ?? p.placeNumero}</div>

                          {/* Affichage simple */}
                          {hoveredPlaceId !== p.id && (
                            <div className="text-xs mt-2">
                              {p.occupied ? (p.occupant?.fullname ?? p.occupant?.email ?? "Assigné") : "Libre"}
                            </div>
                          )}

                          {/* Détails au clic */}
                          {hoveredPlaceId === p.id && p.occupied && p.occupant && (
                            <div className="flex text-gray-900 justify-between mt-4 gap-2 py-2 px-4">
                              <div className="text-left">
                                <div className="font-bold">Étudiant:</div>
                                <div className="text-sm font-medium">
                                  <div><span className="opacity-80">Nom:</span> {p.occupant.fullname}</div>
                                  <div><span className="opacity-80">E-mail:</span> {p.occupant.email}</div>
                                </div>
                              </div>
                              {p.exam && (
                                <div className="text-left">
                                  <div className="font-bold">Examen:</div>
                                  <div className="text-sm font-medium">
                                    <div><span className="opacity-80">Label:</span> {p.exam.Matiere?.label}</div>
                                    <div><span className="opacity-80">Durée:</span> {p.exam.duree} min</div>
                                  </div>
                                </div>
                              )}
                            </div>
                          )}

                          {hoveredPlaceId === p.id && !p.occupied && (
                            <div className="text-xs mt-2 italic">Libre</div>
                          )}
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </div>
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
}
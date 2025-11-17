import React, { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { getAllCalendriers } from "../../../services/calendriers.js";

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

const MONTH_NAMES = [
  "Jan", "Fév", "Mar", "Avr", "Mai", "Juin",
  "Juil", "Aoû", "Sep", "Oct", "Nov", "Déc"
];

// Palette de couleurs par niveau
const NIVEAU_COLORS = {
  "L1": { bg: "bg-blue-100", border: "border-blue-400", text: "text-blue-900" },
  "L2": { bg: "bg-purple-100", border: "border-purple-400", text: "text-purple-900" },
  "L3": { bg: "bg-green-100", border: "border-green-400", text: "text-green-900" },
  "M1": { bg: "bg-orange-100", border: "border-orange-400", text: "text-orange-900" },
  "M2": { bg: "bg-red-100", border: "border-red-400", text: "text-red-900" },
  "default": { bg: "bg-slate-100", border: "border-slate-400", text: "text-slate-900" }
};

function getNiveauColor(niveau) {
  return NIVEAU_COLORS[niveau] || NIVEAU_COLORS["default"];
}

function startOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function addMonths(date, n) {
  return new Date(date.getFullYear(), date.getMonth() + n, 1);
}

function formatDateKey(d) {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function buildMonthMatrix(year, month) {
  const first = new Date(year, month, 1);
  const matrix = [];
  let week = [];
  let day = new Date(first);
  const startDow = day.getDay();
  for (let i = 0; i < startDow; i++) week.push(null);
  while (day.getMonth() === month) {
    week.push(new Date(day));
    if (week.length === 7) {
      matrix.push(week);
      week = [];
    }
    day.setDate(day.getDate() + 1);
  }
  while (week.length < 7) week.push(null);
  matrix.push(week);
  return matrix;
}

export default function Calendriers() {
  const [current, setCurrent] = useState(() => startOfMonth(new Date()));
  const [calendriers, setCalendriers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState(null);

  // States for creation modal
  const [creationModalOpen, setCreationModalOpen] = useState(false);
  const [dateToCreate, setDateToCreate] = useState(null);

  useEffect(() => {
    fetchCalendriers();
  }, []);

  async function fetchCalendriers() {
    setLoading(true);
    try {
      const res = await getAllCalendriers();
      const list = res?.data ?? res ?? [];
      setCalendriers(Array.isArray(list) ? list : list?.calendriers ?? []);
    } catch (err) {
      console.error("Calendrier fetch error:", err);
    } finally {
      setLoading(false);
    }
  }

  const eventsByDay = useMemo(() => {
    const map = {};
    for (const c of calendriers) {
      const exam = c.Exam ?? c.exam ?? null;

      let start = null;
      let end = null;

      if (c.start_time) {
        start = new Date(c.start_time);
        if (c.end_time) {
          end = new Date(c.end_time);
        } else if (exam?.duree != null) {
          end = new Date(start.getTime() + Number(exam.duree) * 60000);
        }
      } else if (exam?.date) {
        try {
          let d = new Date(exam.date);

          if (exam.time && typeof exam.time === "string") {
            const [hhRaw, mmRaw] = exam.time.split(":");
            const hh = Number(hhRaw);
            const mm = Number(mmRaw || 0);
            if (!Number.isNaN(hh)) {
              d.setHours(hh, Number.isNaN(mm) ? 0 : mm, 0, 0);
            }
          }

          start = d;
          if (exam?.duree != null) {
            end = new Date(start.getTime() + Number(exam.duree) * 60000);
          }
        } catch (e) {
          console.warn("Failed to parse exam.date/time", exam?.date, exam?.time, e);
          continue;
        }
      } else {
        continue;
      }

      if (!end && start) {
        end = new Date(start.getTime() + 60 * 60000);
      }

      if (!start || !end) continue;

      const key = formatDateKey(start);
      if (!map[key]) map[key] = [];
      map[key].push({
        id: c.id ?? (exam ? `exam-${exam.id}` : undefined),
        start,
        end,
        exam,
        raw: c,
        niveau: exam?.Matiere?.niveau || "default",
      });
    }

    for (const k of Object.keys(map)) {
      map[k].sort((a, b) => a.start - b.start);
    }
    return map;
  }, [calendriers]);

  // Fonction pour regrouper les examens par heure
  const getExamsPerHour = (day) => {
    const evts = eventsByDay[day] ?? [];
    if (!evts.length) return {};

    const hourMap = {};

    evts.forEach((evt) => {
      const startHour = evt.start.getHours();
      const endHour = evt.end.getHours();

      for (let h = startHour; h < endHour; h++) {
        if (!hourMap[h]) hourMap[h] = [];
        hourMap[h].push(evt);
      }
    });

    return hourMap;
  };

  const matrix = useMemo(() => buildMonthMatrix(current.getFullYear(), current.getMonth()), [current]);

  function prevMonth() {
    setCurrent((d) => addMonths(d, -1));
  }
  function nextMonth() {
    setCurrent((d) => addMonths(d, 1));
  }

  function handleDoubleClick(date) {
    if (!date) return;
    setDateToCreate(date);
    setCreationModalOpen(true);
    setSelectedDay(null);
  }

  const todayKey = formatDateKey(new Date());
  const monthAbbrev = MONTH_NAMES[current.getMonth()];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-slate-800">Calendrier</h1>
          <p className="text-sm text-slate-500 mt-1">
            Vue mensuelle — cliquez sur un jour pour voir l'emploi du temps.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button onClick={prevMonth} className="flex items-center gap-2 bg-white text-slate-700 px-3 py-2 rounded shadow hover:translate-x-0.5 transition">
            <ChevronLeft size={16} />
            <span className="font-medium">{MONTH_NAMES[addMonths(current, -1).getMonth()]}</span>
          </button>

          <div className="flex items-center bg-slate-800 text-white px-3 py-2 rounded shadow">
            <span className="mr-3 font-semibold">{monthAbbrev} {current.getFullYear()}</span>
            <button onClick={() => setCurrent(startOfMonth(new Date()))} className="text-sm opacity-80 hover:opacity-100">Aujourd'hui</button>
          </div>

          <button onClick={nextMonth} className="flex items-center gap-2 bg-white text-slate-700 px-3 py-2 rounded shadow hover:-translate-x-0.5 transition">
            <span className="font-medium">{MONTH_NAMES[addMonths(current, 1).getMonth()]}</span>
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      <div className="bg-white border border-gray-500/80 rounded-lg p-4 shadow-sm">
        <div className="grid grid-cols-7 gap-2 text-center text-xs uppercase text-slate-500 mb-3">
          <div>Dim</div><div>Lun</div><div>Mar</div><div>Mer</div><div>Jeu</div><div>Ven</div><div>Sam</div>
        </div>

        <div className="grid grid-cols-7 gap-3">
          {matrix.map((week, wi) =>
            week.map((date, di) => {
              const key = date ? formatDateKey(date) : `empty-${wi}-${di}`;
              const isToday = key === todayKey;
              const events = date ? eventsByDay[key] ?? [] : [];
              // comment utiliser ce events ?

              return (
                <div
                  key={key}
                  onClick={() => date && setSelectedDay((s) => (s === key ? null : key))}
                  onDoubleClick={() => handleDoubleClick(date)}
                  className={
                    "min-h-24 rounded-lg p-2 relative transition-transform transform " +
                    (date ? "cursor-pointer hover:scale-[1.02] " : "opacity-30 ") +
                    (isToday ? "ring-2 ring-indigo-200 " : "")
                  }
                >
                  <div className="flex justify-between items-start">
                    
                    <div className="text-sm font-medium">{date ? date.getDate() : ""}</div>
                  </div>

                  
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Modal De L'Emploi Du Temps */}
      {selectedDay && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white border rounded-lg shadow-lg w-full max-w-4xl max-h-[90vh] overflow-auto">
            <div className="sticky top-0 bg-white border-b flex items-center justify-between p-4">
              <h2 className="text-lg font-semibold">Emploi du temps — {selectedDay}</h2>
              <button onClick={() => setSelectedDay(null)} className="p-1 hover:bg-slate-100 rounded transition">
                <X size={20} />
              </button>
            </div>

            <div className="p-4">
              {(() => {
                const evts = eventsByDay[selectedDay] ?? [];
                const hourMap = getExamsPerHour(selectedDay);

                // Afficher toutes les heures de 7h à 18h
                const allHours = Array.from({ length: 12 }, (_, i) => 7 + i);

                return (
                  <div className="space-y-2 max-w-2.5xl">
                    {allHours.map((hour) => {
                      const examsAtHour = hourMap[hour] || [];
                      const uniqueExams = Array.from(
                        new Map(examsAtHour.map((e) => [e.id, e])).values()
                      );

                      // Si vide, afficher une ligne blanche avec bordure grise
                      if (!uniqueExams.length) {
                        return (
                          <div key={`hour-${hour}`} className="flex gap-2 items-stretch">
                            {/* Heure */}
                            <div className="w-16 bg-white border border-gray-300 rounded px-2 py-2 text-sm font-semibold text-slate-700 flex items-center justify-center flex-shrink-0">
                              {String(hour).padStart(2, "0")}:00
                            </div>

                            {/* Ligne vide */}
                            <div className="flex-1 bg-white border border-gray-300 rounded transition-transform hover:scale-y-110 origin-left" />
                          </div>
                        );
                      }

                      return (
                        <div key={`hour-${hour}`} className="flex gap-2 items-stretch">
                          {/* Heure */}
                          <div className="w-16 bg-slate-100 border border-slate-300 rounded px-2 py-2 text-sm font-semibold text-slate-700 flex items-center justify-center flex-shrink-0">
                            {String(hour).padStart(2, "0")}:00
                          </div>

                          {/* Examens côte à côte */}
                          <div className="flex gap-1 flex-1 transition-transform hover:scale-y-110 origin-left">
                            {uniqueExams.map((exam) => {
                              const color = getNiveauColor(exam.niveau);
                              const timeStr = `${String(exam.start.getHours()).padStart(2, "0")}:${String(exam.start.getMinutes()).padStart(2, "0")} - ${String(exam.end.getHours()).padStart(2, "0")}:${String(exam.end.getMinutes()).padStart(2, "0")}`;

                              return (
                                <div
                                  key={exam.id}
                                  className={`flex-1 ${color.bg} ${color.border} border-2 rounded px-3 py-2`}
                                >
                                  <div className={`${color.text} font-bold text-sm`}>
                                    {exam.exam?.Matiere?.label || "Examen"}
                                  </div>
                                  <div className={`${color.text} text-xs`}>
                                    {exam.niveau}
                                  </div>
                                  <div className={`${color.text} text-xs opacity-80`}>
                                    {timeStr}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {/* CREATION MODAL (unchanged) */}
      <Modal 
        open={creationModalOpen} 
        onClose={() => setCreationModalOpen(false)} 
        title={`Planifier un examen le ${dateToCreate ? dateToCreate.toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : ''}`}
      >
        <div className="space-y-4">
            <p className="text-sm text-slate-600">
                Examen du : 
                <strong className="ml-1 text-indigo-600">{dateToCreate?.toLocaleDateString('fr-FR')}</strong>.
            </p>
            <form className="space-y-4">
                <input 
                    type="text" 
                    placeholder="Nom de l'examen/événement" 
                    className="w-full border border-slate-300 px-4 py-2 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/40"
                />
                
                <input 
                    type="datetime-local" 
                    value={dateToCreate?.toISOString().slice(0, 16) ?? ''}
                    onChange={() => {}}
                    className="w-full border border-slate-300 px-4 py-2 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/40"
                />

                <div className="flex justify-end gap-2 pt-2">
                    <button type="button" onClick={() => setCreationModalOpen(false)} className="px-4 py-2 rounded bg-slate-100">Annuler</button>
                    <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded">Créer l'événement</button>
                </div>
            </form>
        </div>
      </Modal>

      {loading && <div className="text-sm text-slate-500">Chargement des calendriers...</div>}
    </div>
  );
}
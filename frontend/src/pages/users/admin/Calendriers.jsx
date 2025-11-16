import React, { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
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

function startOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}
function endOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
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
  const last = new Date(year, month + 1, 0);
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
  const [hoverDay, setHoverDay] = useState(null);

  // NOUVEAUX ÉTATS pour la modale de création
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
          // start from exam.date (could be full ISO or just date)
          let d = new Date(exam.date);

          // if exam.time is provided (like "08:30" or "8:30"), combine it
          if (exam.time && typeof exam.time === "string") {
            const [hhRaw, mmRaw] = exam.time.split(":");
            const hh = Number(hhRaw);
            const mm = Number(mmRaw || 0);
            if (!Number.isNaN(hh)) {
              d.setHours(hh, Number.isNaN(mm) ? 0 : mm, 0, 0);
            }
          }

          // if exam.date string is just a date (no time), `new Date('YYYY-MM-DD')` becomes midnight UTC —
          // it may shift depending on timezone. This is an unavoidable JS/date issue; see notes below.
          start = d;
          if (exam?.duree != null) {
            end = new Date(start.getTime() + Number(exam.duree) * 60000);
          }
        } catch (e) {
          // if parsing fails, skip this entry
          console.warn("Failed to parse exam.date/time", exam?.date, exam?.time, e);
          continue;
        }
      } else {
        // no start information; skip
        continue;
      }

      // Ensure we have an end time; default to 60 minutes if absent
      if (!end && start) {
        end = new Date(start.getTime() + 60 * 60000);
      }

      // If still no start or end, skip
      if (!start || !end) continue;

      const key = formatDateKey(start);
      if (!map[key]) map[key] = [];
      map[key].push({
        id: c.id ?? (exam ? `exam-${exam.id}` : undefined),
        start,
        end,
        exam,
        raw: c,
      });
    }

    // sort each day's events by start
    for (const k of Object.keys(map)) {
      map[k].sort((a, b) => a.start - b.start);
    }
    return map;
  }, [calendriers]);

  const matrix = useMemo(() => buildMonthMatrix(current.getFullYear(), current.getMonth()), [current]);

  function prevMonth() {
    setCurrent((d) => addMonths(d, -1));
  }
  function nextMonth() {
    setCurrent((d) => addMonths(d, 1));
  }

  // NOUVELLE FONCTION pour le double-clic
  function handleDoubleClick(date) {
    if (!date) return;
    setDateToCreate(date);
    setCreationModalOpen(true);
    setSelectedDay(null);
  }

  const HOURS = Array.from({ length: 12 }, (_, i) => 7 + i);

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
              return (
                <div
                  key={key}
                  onMouseEnter={() => setHoverDay(date ? key : null)}
                  onMouseLeave={() => setHoverDay(null)}
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
                    {/* 🔴 RED DOT for days with events */}
                    {events.length > 0 && (
                      <div className="w-2.5 h-2.5 rounded-full bg-red-600"></div>
                    )}
                  </div>

                  <div className="absolute left-2 right-2 bottom-2">
                    {events.length > 0 && (
                      <div className={`text-sm font-semibold truncate`}>
                        {events.slice(0, 2).map((ev, idx) => {
                          const now = new Date();
                          const passed = ev.end < now;
                          const color = passed ? "text-red-600" : "text-emerald-700";
                          return (
                            <div key={ev.id || idx} className={`text-xs ${color} font-bold`}>
                              {ev.exam?.label ?? ev.exam?.matiere?.label ?? "Examen"} {ev.start.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                            </div>
                          );
                        })}
                        {events.length > 2 && <div className="text-xs text-slate-400">+{events.length - 2} autres</div>}
                      </div>
                    )}
                  </div>

                  {events.length > 0 && (
                    <div className="absolute top-2 left-2">
                      <span className="inline-flex items-center justify-center bg-indigo-600 text-white text-xs px-2 py-0.5 rounded-full">{events.length}</span>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {selectedDay && (
        <div className="bg-white border border-gray-500/80 rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Emploi du temps — {selectedDay}</h2>
            <button onClick={() => setSelectedDay(null)} className="px-3 py-1 rounded bg-slate-100">Fermer</button>
          </div>

          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-2">
              {HOURS.map((h) => (
                <div key={h} className={`h-12 flex items-center ${h === 12 ? "text-center text-slate-400 italic" : ""}`}>
                  {h === 12 ? "12:00 - 13:00" : `${String(h).padStart(2, "0")}:00`}
                </div>
              ))}
            </div>

            <div className="col-span-10 relative">
              <div className="relative border border-gray-500/80 rounded-lg overflow-hidden" style={{ minHeight: "12 * 3rem" }}>
                <div className="grid" style={{ gridTemplateRows: `repeat(${HOURS.length}, 3rem)` }}>
                  {HOURS.map((h) => {
                    if (h === 12) {
                      return (
                        <div key={h} className="border-b flex items-center justify-center bg-yellow-50 text-slate-500">
                          Pause déjeuner (12:00 - 13:00)
                        </div>
                      );
                    }
                    return <div key={h} className="border-b border-gray-200/80" />;
                  })}
                </div>

                <div className="absolute inset-0 pointer-events-none">
                  {(() => {
                    const evts = eventsByDay[selectedDay] ?? [];
                    return evts.map((ev) => {
                      const startHour = ev.start.getHours() + ev.start.getMinutes() / 60;
                      const endHour = ev.end.getHours() + ev.end.getMinutes() / 60;
                      const topPercent = ((startHour - 7) / (HOURS.length)) * 100;
                      const heightPercent = ((endHour - startHour) / (HOURS.length)) * 100;
                      const now = new Date();
                      const passed = ev.end < now;
                      const colorBg = passed ? "bg-red-100" : "bg-emerald-100";
                      const colorText = passed ? "text-red-800" : "text-emerald-800";

                      return (
                        <div
                          key={ev.id}
                          className={`absolute left-2 right-2 rounded-md p-2 shadow pointer-events-auto transform hover:scale-[1.01] transition`}
                          style={{
                            top: `${topPercent}%`,
                            height: `${Math.max(2, heightPercent)}%`,
                          }}
                          title={`${ev.exam?.label ?? ev.exam?.matiere?.label ?? "Examen"} ${ev.start.toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})}`}
                        >
                          <div className={`${colorBg} ${colorText} px-2 py-1 rounded-md font-semibold`}>
                            <div className="text-sm">{ev.exam?.label ?? ev.exam?.matiere?.label ?? "Examen"}</div>
                            <div className="text-xs">{ev.start.toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})} - {ev.end.toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})}</div>
                          </div>
                        </div>
                      );
                    });
                  })()}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {loading && <div className="text-sm text-slate-500">Chargement des calendriers...</div>}

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
            {/* ⚠️ ICI IL FAUDRAIT AJOUTER VOTRE FORMULAIRE RÉEL */}
            <form className="space-y-4">
                <input 
                    type="text" 
                    placeholder="Nom de l'examen/événement" 
                    className="w-full border border-slate-300 px-4 py-2 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/40"
                />
                
                <input 
                    type="datetime-local" 
                    value={dateToCreate?.toISOString().slice(0, 16) ?? ''}
                    onChange={() => {}} // Lire seulement, ou ajouter la logique pour l'édition de l'heure
                    className="w-full border border-slate-300 px-4 py-2 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/40"
                />

                <div className="flex justify-end gap-2 pt-2">
                    <button type="button" onClick={() => setCreationModalOpen(false)} className="px-4 py-2 rounded bg-slate-100">Annuler</button>
                    <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded">Créer l'événement</button>
                </div>
            </form>
        </div>
      </Modal>
    </div>
  );
}
import React, { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { getAllCalendriers } from "../../../services/calendriers.js";
import { useAuth } from "../../../hooks/useAuth";

const MONTH_NAMES = [
  "Jan", "Fév", "Mar", "Avr", "Mai", "Juin",
  "Juil", "Aoû", "Sep", "Oct", "Nov", "Déc"
];

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

export default function DashboardEtudiant() {
  const { user } = useAuth();
  const [current, setCurrent] = useState(() => startOfMonth(new Date()));
  const [calendriers, setCalendriers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState(null);
  const [hoverDay, setHoverDay] = useState(null);

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

  // Build eventsByDay filtered by student's niveau (same logic you had)
  const eventsByDay = useMemo(() => {
    const map = {};
    for (const c of calendriers) {
      const examNiveau = c.Exam?.Matiere?.niveau ?? c.exam?.matiere?.niveau;
      if (examNiveau !== user?.niveau) continue;

      const start = new Date(c.start_time);
      const key = formatDateKey(start);
      if (!map[key]) map[key] = [];
      map[key].push({
        id: c.id,
        start: new Date(c.start_time),
        end: new Date(c.end_time),
        exam: c.Exam ?? c.exam ?? null,
        raw: c,
      });
    }
    for (const k of Object.keys(map)) {
      map[k].sort((a, b) => a.start - b.start);
    }
    return map;
  }, [calendriers, user?.niveau]);

  const matrix = useMemo(() => buildMonthMatrix(current.getFullYear(), current.getMonth()), [current]);

  function prevMonth() {
    setCurrent((d) => addMonths(d, -1));
    setSelectedDay(null);
  }
  function nextMonth() {
    setCurrent((d) => addMonths(d, 1));
    setSelectedDay(null);
  }

  const HOURS = Array.from({ length: 12 }, (_, i) => 7 + i);
  const todayKey = formatDateKey(new Date());
  const monthAbbrev = MONTH_NAMES[current.getMonth()];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dashboard Étudiant</h1>
          <p className="text-sm text-slate-500">
            Vos examens pour le niveau {user?.niveau} — cliquez sur un jour pour voir l'emploi du temps.
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

      {/* Month grid — identical to Calendriers.jsx */}
      <div className="bg-white border rounded-lg p-4 shadow-sm">
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
                  className={
                    "min-h-[96px] rounded-lg p-2 relative transition-transform transform " +
                    (date ? "cursor-pointer hover:scale-[1.02] " : "opacity-30 ") +
                    (isToday ? "ring-2 ring-indigo-200 " : "")
                  }
                >
                  <div className="flex justify-between items-start">
                    <div className="text-sm font-medium">{date ? date.getDate() : ""}</div>
                    {/* red dot for days with events */}
                    {events.length > 0 && (
                      <div className="w-2.5 h-2.5 rounded-full bg-red-600"></div>
                    )}
                  </div>

                  <div className="absolute left-2 right-2 bottom-2">
                    {events.length > 0 && (
                      <div className="text-sm font-semibold truncate">
                        {events.slice(0, 2).map((ev, idx) => {
                          const now = new Date();
                          const passed = ev.end < now;
                          const color = passed ? "text-red-600" : "text-emerald-700";
                          return (
                            <div key={ev.id || idx} className={`text-xs ${color} font-bold`}>
                              {ev.exam?.label ?? ev.exam?.Matiere?.label ?? "Examen"} {ev.start.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
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

      {/* modal ET above calendar */}
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
              <div className="grid grid-cols-12 gap-4">
                <div className="col-span-2">
                  {(() => {
                    const evts = eventsByDay[selectedDay] ?? [];
                    const startHours = evts.length ? evts.map((ev) => ev.start.getHours() + ev.start.getMinutes() / 60) : [];
                    const endHours = evts.length ? evts.map((ev) => ev.end.getHours() + ev.end.getMinutes() / 60) : [];

                    const minEvent = startHours.length ? Math.min(...startHours) : 7;
                    const maxEvent = endHours.length ? Math.max(...endHours) : 19;

                    const dayStart = Math.max(0, Math.floor(Math.min(minEvent, 7)));
                    const dayEnd = Math.min(24, Math.ceil(Math.max(maxEvent, 19)));
                    const totalHours = Math.max(1, dayEnd - dayStart);

                    const hoursArray = Array.from({ length: totalHours }, (_, i) => dayStart + i);

                    return hoursArray.map((h) => (
                      <div key={h} className={`h-12 flex items-center ${h === 12 ? "text-center text-slate-400 italic" : ""}`}>
                        {h === 12 ? "12:00 - 13:00" : `${String(h).padStart(2, "0")}:00`}
                      </div>
                    ));
                  })()}
                </div>

                <div className="col-span-10 relative">
                  {(() => {
                    const evts = eventsByDay[selectedDay] ?? [];
                    const startHours = evts.length ? evts.map((ev) => ev.start.getHours() + ev.start.getMinutes() / 60) : [];
                    const endHours = evts.length ? evts.map((ev) => ev.end.getHours() + ev.end.getMinutes() / 60) : [];

                    const minEvent = startHours.length ? Math.min(...startHours) : 7;
                    const maxEvent = endHours.length ? Math.max(...endHours) : 19;

                    const dayStart = Math.max(0, Math.floor(Math.min(minEvent, 7)));
                    const dayEnd = Math.min(24, Math.ceil(Math.max(maxEvent, 19)));
                    const totalHours = Math.max(1, dayEnd - dayStart);

                    return (
                      <div className="relative border rounded-lg overflow-hidden" style={{ minHeight: "12 * 3rem" }}>
                        <div className="grid" style={{ gridTemplateRows: `repeat(${totalHours}, 3rem)` }}>
                          {Array.from({ length: totalHours }, (_, i) => {
                            const h = dayStart + i;
                            if (h === 12) {
                              return (
                                <div key={h} className="border-b flex items-center justify-center bg-yellow-50 text-slate-500">
                                  Pause déjeuner (12:00 - 13:00)
                                </div>
                              );
                            }
                            return <div key={h} className="border-b" />;
                          })}
                        </div>

                        <div className="absolute inset-0 pointer-events-none">
                          {evts.map((ev) => {
                            const startHour = ev.start.getHours() + ev.start.getMinutes() / 60;
                            const endHour = ev.end.getHours() + ev.end.getMinutes() / 60;

                            const topPercent = ((startHour - dayStart) / totalHours) * 100;
                            const heightPercent = ((endHour - startHour) / totalHours) * 100;
                            const now = new Date();
                            const passed = ev.end < now;
                            const colorBg = passed ? "bg-red-100" : "bg-emerald-100";
                            const colorText = passed ? "text-red-800" : "text-emerald-800";

                            return (
                              <div key={ev.id} className={`absolute left-2 right-2 rounded-md p-2 shadow pointer-events-auto transform hover:scale-[1.01] transition`}
                                style={{ top: `${topPercent}%`, height: `${Math.max(2, heightPercent)}%` }}
                                title={`${ev.exam?.label ?? ev.exam?.Matiere?.label ?? "Examen"} ${ev.start.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`}>
                                <div className={`${colorBg} ${colorText} px-2 py-1 rounded-md font-semibold`}>
                                  <div className="text-sm">{ev.exam?.label ?? ev.exam?.Matiere?.label ?? "Examen"}</div>
                                  <div className="text-xs">
                                    {ev.start.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} - {ev.end.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {loading && <div className="text-sm text-slate-500">Chargement de vos examens...</div>}
    </div>
  );
}
import React, { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { getAllCalendriers } from "../../../services/calendriers";

/**
 * Calendriers.jsx
 * - Monthly calendar with prev/next
 * - Hover day -> enlarge and show exams summary at bottom (bold)
 * - Click day -> inline schedule (07:00 - 18:00), lunch 12:00-13:00 empty
 * - Exams color: red if finished, green if upcoming
 */

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
function toLocalISODate(date) {
  return formatDateKey(date);
}

// returns array of week arrays; each week is array of Date objects or null for padding
function buildMonthMatrix(year, month) {
  const first = new Date(year, month, 1);
  const last = new Date(year, month + 1, 0);
  const matrix = [];
  let week = [];
  // day of week: 0 Sun ... 6 Sat. We want Monday-first? We'll use Sunday-first for simplicity.
  let day = new Date(first);
  // pad leading days
  const startDow = day.getDay(); // 0..6
  for (let i = 0; i < startDow; i++) week.push(null);
  while (day.getMonth() === month) {
    week.push(new Date(day));
    if (week.length === 7) {
      matrix.push(week);
      week = [];
    }
    day.setDate(day.getDate() + 1);
  }
  // trailing pad
  while (week.length < 7) week.push(null);
  matrix.push(week);
  return matrix;
}

export default function Calendriers() {
  const [current, setCurrent] = useState(() => startOfMonth(new Date()));
  const [calendriers, setCalendriers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState(null); // 'YYYY-MM-DD' key
  const [hoverDay, setHoverDay] = useState(null);

  useEffect(() => {
    fetchCalendriers();
  }, []);

  async function fetchCalendriers() {
    setLoading(true);
    try {
      const res = await getAllCalendriers();
      // backend returns array of calendrier objects with start_time, end_time, Exam included
      const list = res?.data ?? res ?? [];
      setCalendriers(Array.isArray(list) ? list : list?.calendriers ?? []);
    } catch (err) {
      console.error("Calendrier fetch error:", err);
    } finally {
      setLoading(false);
    }
  }

  // map dateKey -> [events]
  const eventsByDay = useMemo(() => {
    const map = {};
    for (const c of calendriers) {
      // calendrier.start_time is a datetime; convert to local date key
      const start = new Date(c.start_time);
      const key = formatDateKey(start);
      if (!map[key]) map[key] = [];
      map[key].push({
        id: c.id,
        start: new Date(c.start_time),
        end: new Date(c.end_time),
        exam: c.Exam ?? c.exam ?? null, // backend includes exam
        raw: c,
      });
    }
    // sort events by start
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

  function dayHasEvents(date) {
    if (!date) return false;
    return !!eventsByDay[formatDateKey(date)];
  }

  // schedule grid hours
  const HOURS = Array.from({ length: 12 }, (_, i) => 7 + i); // 7..18

  // compute event style (gridRow start/end)
  function computeGridRow(event) {
    // grid rows start at 1 = hour 7
    const startHour = event.start.getHours() + event.start.getMinutes() / 60;
    const endHour = event.end.getHours() + event.end.getMinutes() / 60;
    const rowStart = Math.max(1, Math.floor((startHour - 7) + 1)); // 7 -> 1
    const span = Math.max(1, Math.ceil(endHour - startHour));
    const rowEnd = rowStart + span;
    return { rowStart, rowEnd };
  }

  const todayKey = formatDateKey(new Date());
  const monthAbbrev = MONTH_NAMES[current.getMonth()];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Calendrier</h1>
          <p className="text-sm text-slate-500">Vue mensuelle — cliquez sur un jour pour voir l'emploi du temps.</p>
        </div>

        <div className="flex items-center gap-3">
          <button onClick={prevMonth} className="flex items-center gap-2 bg-white text-slate-700 px-3 py-2 rounded shadow hover:translate-x-0.5 transition">
            <ChevronLeft size={16} />
            <span className="font-medium">{MONTH_NAMES[addMonths(current, -1).getMonth()]}</span>
          </button>

          <div className="flex items-center bg-slate-800 text-white px-3 py-2 rounded shadow">
            <span className="mr-3 font-semibold">{monthAbbrev} {current.getFullYear()}</span>
            <button onClick={() => setCurrent(startOfMonth(new Date()))} className="text-sm opacity-80 hover:opacity-100">Aujourd’hui</button>
          </div>

          <button onClick={nextMonth} className="flex items-center gap-2 bg-white text-slate-700 px-3 py-2 rounded shadow hover:-translate-x-0.5 transition">
            <span className="font-medium">{MONTH_NAMES[addMonths(current, 1).getMonth()]}</span>
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      <div className="bg-white border rounded-lg p-4 shadow-sm">
        {/* weekday header */}
        <div className="grid grid-cols-7 gap-2 text-center text-xs uppercase text-slate-500 mb-3">
          <div>Dim</div><div>Lun</div><div>Mar</div><div>Mer</div><div>Jeu</div><div>Ven</div><div>Sam</div>
        </div>

        {/* month matrix */}
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
                    <div className="text-xs text-slate-400">{date ? (date.getMonth() === current.getMonth() ? "" : "") : ""}</div>
                  </div>

                  {/* bottom summary (bold) shown on hover (or always small) */}
                  <div className="absolute left-2 right-2 bottom-2">
                    {events.length > 0 && (
                      <div className={`text-sm font-semibold truncate ${ (hoverDay === key || selectedDay === key) ? "text-ellipsis" : "text-ellipsis" }`}>
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

                  {/* subtle badge for event count top-right */}
                  {events.length > 0 && (
                    <div className="absolute top-2 right-2">
                      <span className="inline-flex items-center justify-center bg-indigo-600 text-white text-xs px-2 py-0.5 rounded-full">{events.length}</span>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Inline child: day's schedule */}
      {selectedDay && (
        <div className="bg-white border rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Emploi du temps — {selectedDay}</h2>
            <div>
              <button onClick={() => { setSelectedDay(null); }} className="px-3 py-1 rounded bg-slate-100">Fermer</button>
            </div>
          </div>

          <div className="grid grid-cols-12 gap-4">
            {/* left column: hour labels */}
            <div className="col-span-2">
              {HOURS.map((h) => (
                <div key={h} className={`h-12 flex items-center ${h === 12 ? "text-center text-slate-400 italic" : ""}`}>
                  {h === 12 ? "12:00 - 13:00" : `${String(h).padStart(2, "0")}:00`}
                </div>
              ))}
            </div>

            {/* schedule grid */}
            <div className="col-span-10 relative">
              <div className="relative border rounded-lg overflow-hidden" style={{ minHeight: "12 * 3rem" }}>
                {/* grid rows - each hour a row */}
                <div className="grid" style={{ gridTemplateRows: `repeat(${HOURS.length}, 3rem)` }}>
                  {HOURS.map((h) => {
                    // lunch row style
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

                {/* place events as absolutely positioned blocks using grid row calculation */}
                <div className="absolute inset-0 pointer-events-none">
                  {(() => {
                    const evts = eventsByDay[selectedDay] ?? [];
                    return evts.map((ev) => {
                      // calculate position
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

      {/* Loading indicator */}
      {loading && <div className="text-sm text-slate-500">Chargement des calendriers...</div>}
    </div>
  );
}
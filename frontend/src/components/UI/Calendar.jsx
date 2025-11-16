import React, { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import dayjs from "dayjs";
import Badge from "@mui/material/Badge";
import { styled } from "@mui/material/styles";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { PickersDay } from "@mui/x-date-pickers/PickersDay";
import { DateCalendar } from "@mui/x-date-pickers/DateCalendar";
import { DayCalendarSkeleton } from "@mui/x-date-pickers/DayCalendarSkeleton";

const Dot = styled("span")(({ theme }) => ({
  display: "block",
  width: 10,
  height: 10,
  borderRadius: 10,
  backgroundColor: theme.palette.error.main || "#ef4444",
  boxShadow: `0 0 0 2px ${theme.palette.background.paper || "#fff"}`,
}));

function ServerDay(props) {
  const { highlightedDatesSet = new Set(), day, outsideCurrentMonth, ...other } = props;
  const dayKey = props.day.format("YYYY-MM-DD");
  const isHighlighted = !outsideCurrentMonth && highlightedDatesSet.has(dayKey);

  return (
    <Badge
      key={props.day.toString()}
      overlap="circular"
      anchorOrigin={{ vertical: "top", horizontal: "right" }}
      badgeContent={isHighlighted ? <Dot /> : undefined}
    >
      <PickersDay {...other} outsideCurrentMonth={outsideCurrentMonth} day={day} />
    </Badge>
  );
}

const initialValue = dayjs();

// Styled wrapper to enlarge the entire calendar
const CalendarWrapper = styled("div")({
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  width: "100%",
  height: "100%",
  "& .MuiDateCalendar-root": {
    width: "100%",
    height: "100%",
    transform: "scale(2.5)", // enlarge by 2.5x
    transformOrigin: "top center",
  },
  "& .MuiPickersSlideTransition-root": {
    height: "100%",
  },
  "& .MuiDayCalendar-header": {
    padding: "16px 0",
  },
  "& .MuiDayCalendar-monthDayLabel": {
    fontSize: "1.1rem",
    fontWeight: 600,
  },
});

const MONTH_NAMES = [
  "Jan", "Fév", "Mar", "Avr", "Mai", "Juin",
  "Juil", "Aoû", "Sep", "Oct", "Nov", "Déc"
];

function formatDateKey(d) {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function addMonths(date, n) {
  return new Date(date.getFullYear(), date.getMonth() + n, 1);
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

/**
 * Calendar component - grid-based calendar with red dots for highlighted dates.
 *
 * Props:
 * - highlightedDates: array of YYYY-MM-DD strings to mark with red dot
 * - eventsByDay: (optional) object mapping YYYY-MM-DD to events array (for display in cells)
 * - selectedDay: currently selected day (YYYY-MM-DD)
 * - onSelectDay: callback when a day is clicked
 * - onMonthChange: (optional) callback when month changes
 */
export default function Calendar({
  highlightedDates = null,
  eventsByDay = {},
  selectedDay = null,
  onSelectDay = null,
  onMonthChange = null,
  loading: propLoading = false
}) {
  const requestAbortController = React.useRef(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [localHighlighted, setLocalHighlighted] = React.useState([]);
  const [current, setCurrent] = useState(() => {
    return new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  });

  const matrix = useMemo(
    () => buildMonthMatrix(current.getFullYear(), current.getMonth()),
    [current]
  );

  function prevMonth() {
    const newDate = addMonths(current, -1);
    setCurrent(newDate);
    onMonthChange?.(newDate);
  }

  function nextMonth() {
    const newDate = addMonths(current, 1);
    setCurrent(newDate);
    onMonthChange?.(newDate);
  }

  const todayKey = formatDateKey(new Date());
  const monthAbbrev = MONTH_NAMES[current.getMonth()];
  const highlightedSet = useMemo(() => new Set(highlightedDates), [highlightedDates]);

  React.useEffect(() => {
    if (Array.isArray(highlightedDates)) {
      setLocalHighlighted(highlightedDates);
      setIsLoading(!!propLoading);
      return;
    }

    const controller = new AbortController();
    setIsLoading(true);
    fakeFetch(initialValue, { signal: controller.signal })
      .then(({ daysToHighlight }) => {
        const month = initialValue.month();
        const year = initialValue.year();
        const dates = daysToHighlight.map((d) =>
          dayjs(new Date(year, month, d)).format("YYYY-MM-DD")
        );
        setLocalHighlighted(dates);
      })
      .catch((err) => {
        if (err.name !== "AbortError") console.error(err);
      })
      .finally(() => setIsLoading(false));

    requestAbortController.current = controller;
    return () => controller.abort();
  }, [highlightedDates, propLoading]);

  const highlightedDatesSet = React.useMemo(() => {
    return new Set((localHighlighted || []).map((d) => {
      try {
        return dayjs(d).format("YYYY-MM-DD");
      } catch {
        return d;
      }
    }));
  }, [localHighlighted]);

  function fakeFetch(date, { signal }) {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        const daysInMonth = date.daysInMonth();
        const daysToHighlight = [1, 2, 3].map(() => Math.round(Math.random() * (daysInMonth - 1) + 1));
        resolve({ daysToHighlight });
      }, 300);

      signal.onabort = () => {
        clearTimeout(timeout);
        reject(new DOMException("aborted", "AbortError"));
      };
    });
  }

  return (
    <CalendarWrapper>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <DateCalendar
          defaultValue={initialValue}
          loading={isLoading}
          renderLoading={() => <DayCalendarSkeleton />}
          slots={{
            day: ServerDay,
          }}
          slotProps={{
            day: {
              highlightedDatesSet,
            },
          }}
        />
      </LocalizationProvider>

      <div className="space-y-4">
        {/* Month navigation */}
        <div className="flex items-center justify-between">
          <button
            onClick={prevMonth}
            className="flex items-center gap-2 bg-white text-slate-700 px-3 py-2 rounded shadow hover:translate-x-0.5 transition"
          >
            <ChevronLeft size={16} />
            <span className="font-medium">{MONTH_NAMES[addMonths(current, -1).getMonth()]}</span>
          </button>

          <div className="flex items-center bg-slate-800 text-white px-4 py-2 rounded shadow">
            <span className="mr-3 font-semibold">
              {monthAbbrev} {current.getFullYear()}
            </span>
            <button
              onClick={() => {
                const today = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
                setCurrent(today);
                onMonthChange?.(today);
              }}
              className="text-sm opacity-80 hover:opacity-100"
            >
              Aujourd'hui
            </button>
          </div>

          <button
            onClick={nextMonth}
            className="flex items-center gap-2 bg-white text-slate-700 px-3 py-2 rounded shadow hover:-translate-x-0.5 transition"
          >
            <span className="font-medium">{MONTH_NAMES[addMonths(current, 1).getMonth()]}</span>
            <ChevronRight size={16} />
          </button>
        </div>

        {/* Calendar grid */}
        <div>
          <div className="grid grid-cols-7 gap-2 text-center text-xs uppercase text-slate-500 mb-3">
            <div>Dim</div>
            <div>Lun</div>
            <div>Mar</div>
            <div>Mer</div>
            <div>Jeu</div>
            <div>Ven</div>
            <div>Sam</div>
          </div>

          <div className="grid grid-cols-7 gap-3">
            {matrix.map((week, wi) =>
              week.map((date, di) => {
                const key = date ? formatDateKey(date) : `empty-${wi}-${di}`;
                const isToday = key === todayKey;
                const isSelected = key === selectedDay;
                const isHighlighted = highlightedSet.has(key);
                const events = date ? eventsByDay[key] ?? [] : [];

                return (
                  <div
                    key={key}
                    onClick={() => date && onSelectDay?.(key)}
                    className={
                      "min-h-[96px] rounded-lg p-2 relative transition-transform transform cursor-pointer " +
                      (date ? "hover:scale-[1.02] " : "opacity-30 ") +
                      (isToday ? "ring-2 ring-indigo-200 " : "") +
                      (isSelected ? "bg-indigo-100 ring-2 ring-indigo-400 " : "bg-white ")
                    }
                  >
                    <div className="flex justify-between items-start">
                      <div className="text-sm font-medium">{date ? date.getDate() : ""}</div>
                      {/* Red dot for days with events */}
                      {isHighlighted && (
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
                                {ev.exam?.label ?? ev.exam?.Matiere?.label ?? "Examen"}{" "}
                                {ev.start.toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </div>
                            );
                          })}
                          {events.length > 2 && (
                            <div className="text-xs text-slate-400">
                              +{events.length - 2} autres
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {events.length > 0 && (
                      <div className="absolute top-2 left-2">
                        <span className="inline-flex items-center justify-center bg-indigo-600 text-white text-xs px-2 py-0.5 rounded-full">
                          {events.length}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </CalendarWrapper>
  );
}

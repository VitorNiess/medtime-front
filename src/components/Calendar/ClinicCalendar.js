import React, { useMemo } from "react";
import PropTypes from "prop-types";
import cal from "./clinicCalendar.module.css";
import pills from "../../styles/primitives/pills.module.css";
import btn from "../../styles/primitives/buttons.module.css";
import surf from "../../styles/base/surfaces.module.css";
import typey from "../../styles/primitives/typography.module.css";
import utils from "../../styles/base/utilities.module.css";

/**
 * ClinicCalendar
 * - Controlled component
 * - Props:
 *   - view: 'month' | 'week' | 'year' (default 'month')
 *   - currentDate: Date | ISO string (default: today)
 *   - appointments: [{ id, title, start, end, status, doctor, clinic, color }]
 *   - onNavigate: (action: 'prev'|'next'|'today') => void
 *   - onViewChange: (view) => void
 *   - onEventClick: (event) => void
 *   - hoursRange: { start: number, end: number } // week view only
 *   - highlightToday: boolean
 *   - timezone: string IANA (default 'America/Sao_Paulo')
 */

const ptBR = {
  weekdaysShort: ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"],
  weekdaysLong: ["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado", "Domingo"],
  months: [
    "Janeiro","Fevereiro","Março","Abril","Maio","Junho",
    "Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"
  ]
};

// --------- date helpers (timezone-aware, sem libs externas)
const startOfDay = (d) => { const x = new Date(d); x.setHours(0,0,0,0); return x; };
const endOfDay = (d) => { const x = new Date(d); x.setHours(23,59,59,999); return x; };
const isSameDay = (a, b) => startOfDay(a).getTime() === startOfDay(b).getTime();
const isToday = (d) => isSameDay(d, new Date());
const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
const addMonths = (d, n) => { const x = new Date(d); x.setMonth(x.getMonth() + n); return x; };
const addYears = (d, n) => { const x = new Date(d); x.setFullYear(x.getFullYear() + n); return x; };
const startOfWeekMon = (d) => {
  const x = new Date(d);
  const day = x.getDay(); // 0(dom) .. 6(sab)
  const diff = (day === 0 ? -6 : 1 - day); // segunda como início
  x.setDate(x.getDate() + diff);
  x.setHours(0,0,0,0);
  return x;
};
const endOfWeekMon = (d) => addDays(startOfWeekMon(d), 6);
const startOfMonth = (d) => { const x = new Date(d); x.setDate(1); x.setHours(0,0,0,0); return x; };
const endOfMonth = (d) => { const x = new Date(d); x.setMonth(x.getMonth() + 1, 0); x.setHours(23,59,59,999); return x; };
const clamp = (n, min, max) => Math.max(min, Math.min(max, n));

const fmtDay = (d) => d.getDate();
const fmtHeader = (d) => `${ptBR.months[d.getMonth()]} de ${d.getFullYear()}`;
const hourLabel = (h) => `${String(h).padStart(2,"0")}:00`;

// monta matriz de 6 semanas (42 dias) para o mês
function buildMonthMatrix(baseDate) {
  const first = startOfMonth(baseDate);
  const firstGrid = startOfWeekMon(first);
  const days = [];
  for (let i = 0; i < 42; i++) days.push(addDays(firstGrid, i));
  return days;
}

// ---------- TZ parse helpers (iguais ao componente mobile)
function toDateTZ(input, tz = "America/Sao_Paulo") {
  if (input instanceof Date) return input;
  if (typeof input !== "string") return new Date(input);

  const m = input.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?$/);
  if (!m) return new Date(input);

  const [_, y, mo, d, h, mi, s = "0"] = m;
  return wallTimeInTZToDate(
    Number(y), Number(mo), Number(d),
    Number(h), Number(mi), Number(s),
    tz
  );
}

function wallTimeInTZToDate(year, month, day, hour, minute, second, timeZone) {
  const guess = Date.UTC(year, month - 1, day, hour, minute, second);
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    hour12: false,
    year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", second: "2-digit",
  }).formatToParts(new Date(guess));

  const get = (t) => Number(parts.find((p) => p.type === t).value);
  const tzY = get("year"), tzM = get("month"), tzD = get("day");
  const tzH = get("hour"), tzMin = get("minute"), tzS = get("second");

  const deltaMin =
    (Date.UTC(year, month - 1, day, hour, minute, second) -
     Date.UTC(tzY, tzM - 1, tzD, tzH, tzMin, tzS)) / 60000;

  return new Date(guess + deltaMin * 60000);
}

// eventos que intersectam um dia (00:00–23:59)
function eventsForDay(events, day) {
  const s = startOfDay(day).getTime();
  const e = endOfDay(day).getTime();
  return events.filter(ev => {
    const evS = ev.start.getTime();
    const evE = ev.end.getTime();
    return evS <= e && evE >= s;
  });
}

// normaliza appointments vindos da API (ISO locais/fusos) no timezone dado
function normalizeAppointments(appointments, timezone) {
  return (appointments || []).map(ev => ({
    ...ev,
    start: toDateTZ(ev.start, timezone),
    end:   toDateTZ(ev.end ?? ev.start, timezone),
  }));
}

export default function ClinicCalendar({
  view = "month",
  currentDate: currentDateProp,
  appointments = [],
  onNavigate,
  onViewChange,
  onEventClick,
  hoursRange = { start: 7, end: 20 },
  highlightToday = true,
  timezone = "America/Sao_Paulo",
}) {
  const currentDate = currentDateProp ? toDateTZ(currentDateProp, timezone) : new Date();
  const data = useMemo(() => normalizeAppointments(appointments, timezone), [appointments, timezone]);

  // Cabeçalho: título + botões
  const Header = (
    <div className={`${cal.header} ${utils.row} ${utils.between} ${utils.itemsCenter}`}>
      <div className={utils.row}>
        <button
          type="button"
          className={`${btn.btn} ${btn.btnSecondary}`}
          onClick={() => onNavigate?.("prev")}
          aria-label="Período anterior"
        >
          ◀
        </button>
        <button
          type="button"
          className={`${btn.btn} ${btn.btnSecondary}`}
          onClick={() => onNavigate?.("today")}
          aria-label="Ir para hoje"
          style={{ marginInline: ".4rem" }}
        >
          Hoje
        </button>
        <button
          type="button"
          className={`${btn.btn} ${btn.btnSecondary}`}
          onClick={() => onNavigate?.("next")}
          aria-label="Próximo período"
        >
          ▶
        </button>
      </div>

      <h2 className={typey.titleSm} aria-live="polite">
        {view === "year" ? currentDate.getFullYear() : fmtHeader(currentDate)}
      </h2>

      <div className={cal.viewSwitch} role="tablist" aria-label="Trocar visualização">
        {["week","month","year"].map(v => (
          <button
            key={v}
            type="button"
            role="tab"
            aria-selected={v === view}
            className={`${btn.btn} ${v===view ? btn.btnPrimary : btn.btnSecondary}`}
            onClick={() => onViewChange?.(v)}
          >
            {v === "week" ? "Semana" : v === "month" ? "Mês" : "Ano"}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <section className={`${surf.surface} ${cal.calendar}`} aria-label="Calendário de consultas">
      {Header}

      {view === "month" && (
        <MonthGrid
          baseDate={currentDate}
          events={data}
          onEventClick={onEventClick}
          highlightToday={highlightToday}
        />
      )}

      {view === "week" && (
        <WeekGrid
          baseDate={currentDate}
          events={data}
          hoursRange={hoursRange}
          onEventClick={onEventClick}
          highlightToday={highlightToday}
        />
      )}

      {view === "year" && (
        <YearGrid
          baseDate={currentDate}
          events={data}
          onEventClick={onEventClick}
          highlightToday={highlightToday}
        />
      )}
    </section>
  );
}

ClinicCalendar.propTypes = {
  view: PropTypes.oneOf(["week","month","year"]),
  currentDate: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]),
  appointments: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    title: PropTypes.string.isRequired,
    start: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]).isRequired,
    end: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]).isRequired,
    status: PropTypes.oneOf(["scheduled","confirmed","canceled","completed"]),
    doctor: PropTypes.string,
    clinic: PropTypes.string,
    color: PropTypes.string
  })),
  onNavigate: PropTypes.func,
  onViewChange: PropTypes.func,
  onEventClick: PropTypes.func,
  hoursRange: PropTypes.shape({ start: PropTypes.number, end: PropTypes.number }),
  highlightToday: PropTypes.bool,
  timezone: PropTypes.string,
};

// ---------------------- Month Grid
function MonthGrid({ baseDate, events, onEventClick, highlightToday }) {
  const days = buildMonthMatrix(baseDate);
  const monthIdx = baseDate.getMonth();

  return (
    <div className={cal.gridMonth} role="grid" aria-readonly>
      {/* cabeçalhos dos dias */}
      {ptBR.weekdaysShort.map((w, i) => (
        <div key={`whead-${i}`} className={cal.dayHeader} role="columnheader" aria-label={ptBR.weekdaysLong[i]}>{w}</div>
      ))}

      {/* células */}
      {days.map((d, i) => {
        const inMonth = d.getMonth() === monthIdx;
        const dayEvents = eventsForDay(events, d);
        const show = dayEvents.slice(0, 3);
        const more = dayEvents.length - show.length;
        return (
          <div
            key={`d-${i}`}
            className={[
              cal.day,
              !inMonth && cal.otherMonth,
              highlightToday && isToday(d) ? cal.today : ""
            ].filter(Boolean).join(" ")}
            role="gridcell"
            aria-selected={false}
            aria-label={`${fmtDay(d)} de ${ptBR.months[d.getMonth()]}`}
          >
            <div className={cal.dayNumber}>{fmtDay(d)}</div>
            <div className={cal.eventsStack}>
              {show.map(ev => (
                <button
                  key={ev.id}
                  type="button"
                  title={`${ev.title} • ${ev.doctor ?? ""} ${ev.clinic ? `@ ${ev.clinic}` : ""}`}
                  className={`${pills.pill} ${cal.eventPill}`}
                  style={{ borderColor: toneFor(ev), background: bgFor(ev) }}
                  onClick={() => onEventClick?.(ev)}
                >
                  <span className={cal.eventDot} style={{ background: toneFor(ev) }} aria-hidden />
                  <span className={cal.eventTitle}>{ev.title}</span>
                </button>
              ))}
              {more > 0 && (
                <div className={cal.moreCount} aria-label={`${more} eventos adicionais`}>+{more} mais</div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ---------------------- Week Grid
function WeekGrid({ baseDate, events, hoursRange, onEventClick, highlightToday }) {
  const weekStart = startOfWeekMon(baseDate);
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const hours = Array.from(
    { length: clamp(hoursRange.end, 1, 24) - clamp(hoursRange.start, 0, 23) },
    (_, i) => i + hoursRange.start
  );

  // agrupa eventos por dia
  const byDay = days.map(d => ({
    date: d,
    events: events.filter(ev =>
      ev.start <= endOfDay(d) && ev.end >= startOfDay(d)
    )
  }));

  // posiciona evento no dia (altura proporcional à duração)
  const renderEventBlock = (ev, day) => {
    const dayStart = startOfDay(day);
    const viewStart = new Date(dayStart); viewStart.setHours(hoursRange.start, 0, 0, 0);
    const viewEnd = new Date(dayStart); viewEnd.setHours(hoursRange.end, 0, 0, 0);

    const evStart = new Date(Math.max(ev.start, viewStart));
    const evEnd = new Date(Math.min(ev.end, viewEnd));
    const totalMs = viewEnd - viewStart;
    const topPct = ((evStart - viewStart) / totalMs) * 100;
    const heightPct = Math.max(6, ((evEnd - evStart) / totalMs) * 100); // min height

    return (
      <button
        key={ev.id}
        type="button"
        className={cal.eventBlock}
        style={{
          top: `${topPct}%`,
          height: `${heightPct}%`,
          borderLeftColor: toneFor(ev),
          background: bgFor(ev)
        }}
        title={`${ev.title} (${timeHHMM(ev.start)}–${timeHHMM(ev.end)})`}
        onClick={() => onEventClick?.(ev)}
      >
        <span className={cal.eventBlockTitle}>{ev.title}</span>
        <span className={cal.eventBlockMeta}>
          {ev.doctor ? `Dr(a). ${ev.doctor}` : ""}{ev.clinic ? ` • ${ev.clinic}` : ""}
        </span>
      </button>
    );
  };

  return (
    <div className={cal.gridWeek} role="grid" style={{ "--hours": hours.length }}>
      {/* Cabeçalho: canto vazio + dias com data */}
      <div className={cal.timeColHeader} />
      {days.map((d, i) => (
        <div key={`wh-${i}`} className={cal.dayColHeader} role="columnheader" aria-label={ptBR.weekdaysLong[i]}>
          <div className={cal.dayNameRow}>
            <span className={cal.dayName}>{ptBR.weekdaysShort[i]}</span>
            <span className={`${cal.dayBadge} ${highlightToday && isToday(d) ? cal.todayBadge : ""}`}>{d.getDate()}</span>
          </div>
        </div>
      ))}

      {/* Coluna de horários */}
      <div className={cal.timeCol} aria-hidden>
        {hours.map(h => (
          <div key={`h-${h}`} className={cal.hourRow}>
            <span className={cal.hourLabel}>{hourLabel(h)}</span>
          </div>
        ))}
      </div>

      {/* Colunas por dia com trilhas de horas e eventos posicionados */}
      {byDay.map((entry, idx) => (
        <div key={`wdc-${idx}`} className={cal.dayCol} role="gridcell" aria-selected={false}>
          {/* linhas de grade */}
          {hours.map(h => <div key={`g-${idx}-${h}`} className={cal.hourTrack} aria-hidden />)}
          {/* eventos */}
          <div className={cal.dayColEvents}>
            {entry.events.map(ev => renderEventBlock(ev, entry.date))}
          </div>
        </div>
      ))}
    </div>
  );
}

// ---------------------- Year Grid (mini-months)
function YearGrid({ baseDate, events, onEventClick, highlightToday }) {
  const y = baseDate.getFullYear();
  const months = Array.from({ length: 12 }, (_, m) => new Date(y, m, 1));

  return (
    <div className={cal.yearGrid}>
      {months.map((mDate, idx) => (
        <div key={`m-${idx}`} className={cal.miniMonth}>
          <div className={cal.miniHeader}>{ptBR.months[mDate.getMonth()]}</div>
          <MiniMonth
            baseDate={mDate}
            events={events}
            onEventClick={onEventClick}
            highlightToday={highlightToday}
          />
        </div>
      ))}
    </div>
  );
}

function MiniMonth({ baseDate, events, onEventClick, highlightToday }) {
  const days = buildMonthMatrix(baseDate);
  const monthIdx = baseDate.getMonth();
  return (
    <div className={cal.miniGrid} role="grid">
      {["S","T","Q","Q","S","S","D"].map((w, i) =>
        <div key={`mh-${i}`} className={cal.miniHead} aria-hidden>{w}</div>
      )}
      {days.map((d,i) => {
        const inMonth = d.getMonth() === monthIdx;
        const has = eventsForDay(events, d).length > 0;
        return (
          <button
            key={`mm-${i}`}
            type="button"
            className={[
              cal.miniCell,
              !inMonth && cal.otherMonth,
              highlightToday && isToday(d) ? cal.todayMini : "",
              has ? cal.miniHasEvent : ""
            ].filter(Boolean).join(" ")}
            aria-label={`${fmtDay(d)} de ${ptBR.months[d.getMonth()]}`}
            onClick={() => {
              const first = eventsForDay(events, d)[0];
              if (first) onEventClick?.(first);
            }}
          >
            {fmtDay(d)}
          </button>
        );
      })}
    </div>
  );
}

// ------------- visual helpers
function timeHHMM(d) {
  const x = d instanceof Date ? d : new Date(d);
  const hh = String(x.getHours()).padStart(2,"0");
  const mm = String(x.getMinutes()).padStart(2,"0");
  return `${hh}:${mm}`;
}
function toneFor(ev) {
  if (ev?.color) return ev.color;
  switch (ev?.status) {
    case "confirmed": return "var(--color-success)";
    case "canceled": return "var(--color-danger)";
    case "completed": return "var(--color-muted)";
    default: return "var(--color-primary)";
  }
}
function bgFor(ev) {
  return `color-mix(in oklab, ${toneFor(ev)}, white 85%)`;
}
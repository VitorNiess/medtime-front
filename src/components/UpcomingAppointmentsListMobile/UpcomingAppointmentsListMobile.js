import React, { useMemo, useState, useCallback } from "react";
import s from "./upcomingAppointmentsListMobile.module.css";
import btn from "../../styles/primitives/buttons.module.css";

/**
 * Props:
 * - appointments: [{ id, title, start, end, status, doctor, clinic, color }]
 * - timezone?: string (default: 'America/Sao_Paulo')
 * - locale?: string (default: 'pt-BR')
 * - emptyMessage?: string
 * - onOpenDetail?: (item) => void   // abre modal de detalhes (fornecido pelo pai)
 * - onCloseDetail?: () => void      // fecha modal de detalhes (opcional)
 */
export default function UpcomingAppointmentsListMobile({
  appointments = [],
  timezone = "America/Sao_Paulo",
  locale = "pt-BR",
  emptyMessage = "Você não tem próximas consultas.",
  onOpenDetail,
  onCloseDetail,
}) {
  // Janela de passadas: desativada (0) por padrão; quando ativa, começa em 7 dias
  const [pastWindowDays, setPastWindowDays] = useState(0);

  const now = useMemo(() => new Date(), []);
  const startOfToday = useMemo(() => {
    const d = new Date(now);
    d.setHours(0, 0, 0, 0);
    return d;
  }, [now]);

  const fmtDate = useMemo(
    () =>
      new Intl.DateTimeFormat(locale, {
        weekday: "long",
        day: "2-digit",
        month: "long",
        timeZone: timezone,
      }),
    [locale, timezone]
  );

  const fmtTime = useMemo(
    () =>
      new Intl.DateTimeFormat(locale, {
        hour: "2-digit",
        minute: "2-digit",
        timeZone: timezone,
      }),
    [locale, timezone]
  );

  const formatLongDate = useCallback(
    (d) => fmtDate.format(toDate(d, timezone)),
    [fmtDate, timezone]
  );
  const formatTime = useCallback(
    (d) => fmtTime.format(toDate(d, timezone)),
    [fmtTime, timezone]
  );

  // Rótulos de status alinhados com a página
  const statusLabel = (status) => {
    switch ((status || "").toLowerCase()) {
      case "confirmed":  return "Confirmada";
      case "scheduled":  return "Agendada";
      case "canceled":   return "Cancelada";
      case "completed":  return "Concluída";
      default:           return "—";
    }
  };

  // Classes CSS (usa .statusScheduled se existir; senão cai em .statusPending)
  const statusClass = (status) => {
    const key = (status || "").toLowerCase();
    if (key === "scheduled") {
      return s.statusScheduled || s.statusPending || s.statusNeutral;
    }
    const map = {
      confirmed: s.statusConfirmed,
      canceled: s.statusCanceled,
      completed: s.statusCompleted,
    };
    return map[key] || s.statusNeutral || "";
  };

  // Limite inferior: agora (padrão) ou hoje - N dias (quando pastWindowDays > 0)
  const lowerBound = useMemo(() => {
    if (pastWindowDays > 0) return addDays(startOfToday, -pastWindowDays);
    return now;
  }, [pastWindowDays, startOfToday, now]);

  // Normaliza, filtra pela janela (>= lowerBound) e ordena
  const normalized = useMemo(() => {
    return appointments
      .map((a) => ({
        ...a,
        start: toDate(a.start, timezone),
        end: toDate(a.end ?? a.start, timezone),
      }))
      .filter((a) => a.start.getTime() >= lowerBound.getTime())
      .sort((a, b) => a.start - b.start);
  }, [appointments, lowerBound, timezone]);

  // Agrupa por dia (YYYY-MM-DD no fuso dado)
    const sections = useMemo(() => {
        const group = new Map();
        for (const appt of normalized) {
            const key = ymd(appt.start, timezone);
            if (!group.has(key)) group.set(key, []);
            group.get(key).push(appt);
        }
        return Array.from(group.entries())
            .sort((a, b) => new Date(a[0]) - new Date(b[0]))
            .map(([key, items]) => ({
            key,
            label: dayLabel(new Date(key), fmtDate),
            label: dayLabel(toDate(`${key}T00:00:00`, timezone), fmtDate),
            items,
            }));
    }, [normalized, timezone, fmtDate]);

  const hasMorePast = useMemo(() => {
    const older = appointments
      .map((a) => toDate(a.start, timezone))
      .filter((d) => d.getTime() < lowerBound.getTime());
    return older.length > 0;
  }, [appointments, lowerBound, timezone]);

  const togglePast = useCallback(() => {
    setPastWindowDays((d) => (d > 0 ? 0 : 7));
  }, []);

  const showMorePast = useCallback(() => {
    setPastWindowDays((d) => d + 7);
  }, []);

  const handleOpenDetail = useCallback(
    (item) => {
      if (onOpenDetail) onOpenDetail(item);
    },
    [onOpenDetail]
  );

  return (
    <div className={s.wrapper}>
      {/* Controles de passadas */}
      <div className={s.controlsRow}>
        <button
          type="button"
          className={`${btn.btn} ${btn.btnSecondary || ""}`}
          onClick={togglePast}
        >
          {pastWindowDays > 0 ? "Ocultar passadas" : "Ver consultas passadas"}
        </button>

        {pastWindowDays > 0 && hasMorePast && (
          <button
            type="button"
            className={`${btn.btn} ${btn.btnGhost || ""}`}
            onClick={showMorePast}
          >
            Mostrar mais
          </button>
        )}
      </div>

      {/* Lista */}
      {sections.length === 0 ? (
        <div className={s.emptyState}>
          {pastWindowDays > 0 ? "Sem consultas no período selecionado." : emptyMessage}
        </div>
      ) : (
        sections.map((sec) => (
          <section className={s.daySection} key={sec.key}>
            <header className={s.dayHeader}>{sec.label}</header>
            <ul className={s.list} role="list">
              {sec.items.map((item) => (
                <li
                  key={item.id ?? `${item.title}-${item.start.toISOString()}`}
                  className={s.item}
                >
                  <button
                    className={s.itemBtn}
                    onClick={() => handleOpenDetail(item)}
                    aria-haspopup="dialog"
                    aria-label={`Abrir detalhes de ${item.title}`}
                  >
                    <div className={s.itemMain}>
                      <div className={s.itemTime}>
                        {formatTime(item.start)} – {formatTime(item.end)}
                      </div>
                      <div className={s.itemTitleRow}>
                        <span className={s.itemTitle}>{item.title}</span>
                        <span className={`${s.statusBadge} ${statusClass(item.status)}`}>
                          {statusLabel(item.status)}
                        </span>
                      </div>
                      <div className={s.itemMeta}>
                        <span className={s.itemDoctor}>
                          {item.doctor ? `Dr(a). ${item.doctor}` : "Profissional não definido"}
                        </span>
                        {item.clinic && <span className={s.dot} aria-hidden="true">•</span>}
                        <span className={s.itemClinic}>
                          {item.clinic ?? "Local não definido"}
                        </span>
                      </div>
                    </div>
                    <div
                      className={s.colorStripe}
                      style={{ background: item.color || "transparent" }}
                      aria-hidden="true"
                    />
                  </button>
                </li>
              ))}
            </ul>
          </section>
        ))
      )}
    </div>
  );
}

/* ===========================
   Utils (timezone-aware)
=========================== */

// Converte "YYYY-MM-DDTHH:MM:SS" (sem fuso) para um Date no instante correto,
// interpretando os números como tempo de parede do `tz` (ex.: America/Sao_Paulo).
function toDate(input, tz = "America/Sao_Paulo") {
  if (input instanceof Date) return input;
  if (typeof input !== "string") return new Date(input);

  // ISO local sem fuso
  const m = input.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?$/);
  if (!m) return new Date(input);

  const [_, y, mo, d, h, mi, s = "0"] = m;
  return wallTimeInTZToDate(
    Number(y),
    Number(mo),
    Number(d),
    Number(h),
    Number(mi),
    Number(s),
    tz
  );
}

// Converte um horário "de parede" (naquele timezone) em um Date (instante UTC correto)
function wallTimeInTZToDate(year, month, day, hour, minute, second, timeZone) {
  // 1) Chute em UTC com os mesmos números
  const guess = Date.UTC(year, month - 1, day, hour, minute, second);

  // 2) Qual horário o 'guess' mostra no timezone?
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    hour12: false,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).formatToParts(new Date(guess));

  const get = (t) => Number(parts.find((p) => p.type === t).value);
  const tzY = get("year");
  const tzM = get("month");
  const tzD = get("day");
  const tzH = get("hour");
  const tzMin = get("minute");
  const tzS = get("second");

  // 3) Delta entre o que queremos e o que o guess exibiu (em minutos)
  const deltaMin =
    (Date.UTC(year, month - 1, day, hour, minute, second) -
      Date.UTC(tzY, tzM - 1, tzD, tzH, tzMin, tzS)) / 60000;

  // 4) Ajusta o chute pelo delta para obter o instante correto
  return new Date(guess + deltaMin * 60000);
}

function addDays(d, n) { const x = new Date(d); x.setDate(x.getDate() + n); return x; }

function ymd(date, timeZone) {
  const fmt = new Intl.DateTimeFormat("en-CA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    timeZone,
  });
  return fmt.format(date); // "YYYY-MM-DD"
}

function dayLabel(dateObj, fmtDate) {
  return fmtDate.format(dateObj);
}
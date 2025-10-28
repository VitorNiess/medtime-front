import React from "react";
import btn from '../../styles/primitives/buttons.module.css';
import t from '../../styles/primitives/typography.module.css';
import pills from '../../styles/primitives/pills.module.css';
import surface from '../../styles/base/surfaces.module.css';
import s from './doctorcard.module.css';

import {
  PiMapPinBold,
  PiClockBold,
  PiVideoBold,
  PiHeartbeatBold,
  PiWheelchairBold,
  PiHandPalmBold,
  PiBabyBold
} from "react-icons/pi";

const ICONS = {
  telemedicina: <PiVideoBold aria-hidden="true" />,
  sus: <PiHeartbeatBold aria-hidden="true" />,
  rampa: <PiWheelchairBold aria-hidden="true" />,
  libras: <PiHandPalmBold aria-hidden="true" />,
  infantil: <PiBabyBold aria-hidden="true" />,
};

function initialsFromName(name = "") {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return parts.slice(0, 2).map(p => p[0]).join('').toUpperCase();
}

/* ===== Helpers de data (timezone-aware) ===== */
function toDateTZ(input, tz = "America/Sao_Paulo") {
  if (input instanceof Date) return input;
  if (typeof input !== "string") return new Date(input);
  const m = input.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?$/);
  if (!m) return new Date(input);
  const [_, y, mo, d, h, mi, s = "0"] = m;
  return wallTimeInTZToDate(+y, +mo, +d, +h, +mi, +s, tz);
}
function wallTimeInTZToDate(year, month, day, hour, minute, second, timeZone) {
  const guess = Date.UTC(year, month - 1, day, hour, minute, second);
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone, hour12: false,
    year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", second: "2-digit",
  }).formatToParts(new Date(guess));
  const get = (t) => Number(parts.find((p) => p.type === t).value);
  const tzY = get("year"), tzM = get("month"), tzD = get("day");
  const tzH = get("hour"), tzMin = get("minute"), tzS = get("second");
  const deltaMin = (Date.UTC(year, month - 1, day, hour, minute, second) -
    Date.UTC(tzY, tzM - 1, tzD, tzH, tzMin, tzS)) / 60000;
  return new Date(guess + deltaMin * 60000);
}

function formatTime(d, locale, tz) {
  return new Intl.DateTimeFormat(locale, {
    hour: "2-digit", minute: "2-digit", timeZone: tz
  }).format(toDateTZ(d, tz));
}
function formatLongDate(d, locale, tz) {
  return new Intl.DateTimeFormat(locale, {
    weekday: "long", year: "numeric", month: "long", day: "numeric", timeZone: tz
  }).format(toDateTZ(d, tz));
}
function formatTodayTomorrow(d, locale, tz) {
  const x = toDateTZ(d, tz);
  const now = new Date();
  const asLocal = toDateTZ(
    `${x.getFullYear()}-${String(x.getMonth()+1).padStart(2,"0")}-${String(x.getDate()).padStart(2,"0")}T00:00:00`, tz
  );
  const today = toDateTZ(
    `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,"0")}-${String(now.getDate()).padStart(2,"0")}T00:00:00`, tz
  );
  const tomorrow = new Date(today); tomorrow.setDate(today.getDate() + 1);

  const time = formatTime(x, "pt-BR", tz);
  if (asLocal.getTime() === today.getTime()) return `Hoje • ${time}`;
  if (asLocal.getTime() === tomorrow.getTime()) return `Amanhã • ${time}`;
  const day = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit", timeZone: tz }).format(x);
  return `${day} • ${time}`;
}

/* ===== Badge de status ===== */
function statusLabel(sv) {
  switch ((sv || "").toLowerCase()) {
    case "confirmed": return "Confirmada";
    case "scheduled": return "Agendada";
    case "canceled":  return "Cancelada";
    case "completed": return "Concluída";
    default: return "—";
  }
}
function statusClass(sv) {
  switch ((sv || "").toLowerCase()) {
    case "confirmed": return s.statusConfirmed;
    case "scheduled": return s.statusScheduled;
    case "canceled":  return s.statusCanceled;
    case "completed": return s.statusCompleted;
    default: return s.statusNeutral;
  }
}

/* ============= Componente ============= */
export default function DoctorCard({
  // base
  id,
  image,
  name,
  specialization,
  crm,
  clinic,
  badges = [],
  nextSlot,
  onViewDetails,
  onBook,
  viewDisabled = false,
  bookDisabled = false,
  variant = "default",
  timezone = "America/Sao_Paulo",
  locale = "pt-BR",
  appointment,
  onOpenDetail,
}) {
  if (variant === "next-appt" && appointment) {
    const handleOpen = () => { onOpenDetail?.(appointment); };

    const { title, start, end, status, doctor, clinic: apptClinic } = appointment;

    return (
      <article className={`${surface.surface} ${s.card} ${s.cardNextAppt}`} aria-label="Próxima consulta">
        <header className={s.nextHeader}>
          <PiClockBold aria-hidden="true" />
          <span className={s.nextKicker}>Próxima consulta</span>
        </header>

        <div className={s.nextBody}>
          <h3 className={s.nextTitle}>{title}</h3>

          <div className={s.nextRow}>
            <span className={s.nextLabel}>Data</span>
            <span className={s.nextValue}>
              {formatLongDate(start, locale, timezone)} &middot; {formatTime(start, locale, timezone)} – {formatTime(end, locale, timezone)}
            </span>
          </div>

          <div className={s.nextRow}>
            <span className={s.nextLabel}>Profissional</span>
            <span className={s.nextValue}>{doctor ? `Dr(a). ${doctor}` : "—"}</span>
          </div>

          <div className={s.nextRow}>
            <span className={s.nextLabel}>Local</span>
            <span className={s.nextValue}>{apptClinic ?? "—"}</span>
          </div>

          <div className={s.nextRow}>
            <span className={s.nextLabel}>Status</span>
            <span className={`${s.statusBadge} ${statusClass(status)}`}>{statusLabel(status)}</span>
          </div>
        </div>

        <footer className={s.nextFooter}>
          <button
            type="button"
            className={`${btn.btn} ${btn.btnPrimary}`}
            onClick={handleOpen}
          >
            Ver detalhes
          </button>
        </footer>
      </article>
    );
  }

  // ===== Card padrão =====
  const payload = { id, name, crm, specialization, clinic };

  const handleView = () => { onViewDetails?.(payload); };
  const handleBook = () => { onBook?.({ ...payload, nextSlot }); };

  return (
    <article className={`${surface.surface} ${s.card}`}>
      <header className={s.header}>
        {image
          ? <img src={image} alt={`Foto de ${name}`} className={s.avatarImg} loading="lazy" decoding="async" />
          : <div className={s.avatarFallback} aria-hidden="true">{initialsFromName(name)}</div>
        }
        <div className={s.meta}>
          <h3 className={s.name}>{name}</h3>
          <p className={s.spec}>{specialization} • CRM {crm}</p>
          <p className={s.unit}><PiMapPinBold aria-hidden="true" /> {clinic}</p>
        </div>
      </header>

      {/* Badges */}
      <div className={s.badges}>
        {badges.map((b, i) => {
          if (b.type === 'preco') {
            return <span key={i} className={`${pills.pill} ${s.pillPrice}`}>{b.value}</span>;
          }
          const icon = ICONS[b.type] ?? null;
          const variant = {
            telemedicina: s.pillTele,
            sus: s.pillSus,
            rampa: s.pillNeutral,
            libras: s.pillNeutral,
            infantil: s.pillNeutral
          }[b.type] || s.pillNeutral;

          const label = b.label ?? (b.type.charAt(0).toUpperCase() + b.type.slice(1));

          return (
            <span key={i} className={`${pills.pill} ${variant}`}>
              {icon} {label}
              {b.type === 'sus'}
            </span>
          );
        })}
      </div>

      <footer className={s.footer}>
        <div className={s.next}>
          <PiClockBold aria-hidden="true" /> <strong>{formatTodayTomorrow(nextSlot, "pt-BR", timezone)}</strong>
        </div>
        <div className={s.actions}>
          <button
            type="button"
            className={`${btn.btn} ${btn.btnSecondary}`}
            onClick={handleView}
            disabled={viewDisabled}
            aria-label={`Ver detalhes de ${name}`}
          >
            Ver detalhes
          </button>
          <button
            type="button"
            className={`${btn.btn} ${btn.btnPrimary}`}
            onClick={handleBook}
            disabled={bookDisabled}
            aria-label={`Agendar consulta com ${name}`}
          >
            Agendar
          </button>
        </div>
      </footer>
    </article>
  );
}

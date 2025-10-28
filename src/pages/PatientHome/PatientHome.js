import React, { useMemo, useState, useCallback } from "react";

// Componentes
import ClinicCalendar from "../../components/Calendar/ClinicCalendar";
import DoctorCard from "../../components/DoctorCard/DoctorCard";
import Modal from "../../components/Modal/Modal";
import UpcomingAppointmentsListMobile from "../../components/UpcomingAppointmentsListMobile/UpcomingAppointmentsListMobile";

// Estilos
import btn from "../../styles/primitives/buttons.module.css";
import typey from "../../styles/primitives/typography.module.css";
import utils from "../../styles/base/utilities.module.css";
import s from "./patienthome.module.css";

/**
 * Página do Paciente (pós-login)
 * - Desktop/Tablet: Calendário
 * - Mobile: Lista de próximas consultas
 * - Destaque: Card "Próxima consulta" (em ambos os layouts, com visibilidade responsiva)
 */
export default function PatientHome() {
  const timezone = "America/Sao_Paulo";
  const locale = "pt-BR";

  const [view, setView] = useState("month");
  const [currentDate, setCurrentDate] = useState(new Date());

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState(/** @type {'day'|'detail'|null} */(null));
  const [modalDate, setModalDate] = useState(null);
  const [modalDayEvents, setModalDayEvents] = useState([]);
  const [detailItem, setDetailItem] = useState(null);

  const appointments = useMemo(() => ([
    { id:"c1",  title:"Consulta Clínica",        start:"2025-10-27T09:00:00", end:"2025-10-27T09:45:00", status:"confirmed",  doctor:"Marina Duarte",   clinic:"Clínica Vida",    color:"#3E9C88" },
    { id:"c2",  title:"Retorno Exames",          start:"2025-10-28T14:00:00", end:"2025-10-28T14:30:00", status:"scheduled",  doctor:"Rafael Lima",     clinic:"Centro Médico Alfa" },
    { id:"c3",  title:"Dermatologia",            start:"2025-10-29T10:30:00", end:"2025-10-29T11:30:00", status:"scheduled",  doctor:"Beatriz N.",      clinic:"Derma+",          color:"#3E9C88" },
    { id:"c4",  title:"Odontologia",             start:"2025-10-31T16:00:00", end:"2025-10-31T17:00:00", status:"canceled",   doctor:"Carlos A.",       clinic:"Sorriso&Saúde" },
    { id:"c5",  title:"Cardiologia",             start:"2025-11-01T08:30:00", end:"2025-11-01T09:15:00", status:"confirmed",  doctor:"Ana Cardoso",     clinic:"CardioCare",      color:"#1E5AA6" },
    { id:"c6",  title:"Oftalmologia",            start:"2025-11-02T13:00:00", end:"2025-11-02T13:40:00", status:"scheduled",  doctor:"Bruno Oliveira",  clinic:"Visão Plena" },
    { id:"c7",  title:"Ortopedia",               start:"2025-11-05T15:00:00", end:"2025-11-05T15:45:00", status:"confirmed",  doctor:"Helena Prado",    clinic:"Orto+" },
    { id:"c8",  title:"Ginecologia",             start:"2025-11-07T11:00:00", end:"2025-11-07T11:50:00", status:"scheduled",  doctor:"Patrícia Gomes",  clinic:"Clínica Mulher",  color:"#D18292" },
    { id:"c9",  title:"Psicologia",              start:"2025-11-09T17:00:00", end:"2025-11-09T17:50:00", status:"scheduled",  doctor:"Thiago Peixoto",  clinic:"Mente Ser" },
    { id:"c10", title:"Nutrição",                start:"2025-11-10T09:30:00", end:"2025-11-10T10:10:00", status:"confirmed",  doctor:"Larissa Martins", clinic:"VivaBem" },
    { id:"c11", title:"Fisioterapia",            start:"2025-11-13T08:00:00", end:"2025-11-13T08:45:00", status:"scheduled",  doctor:"Pedro R.",        clinic:"Movimente" },
    { id:"c12", title:"Endocrinologia",          start:"2025-11-15T13:30:00", end:"2025-11-15T14:10:00", status:"scheduled",  doctor:"Juliana Torres",  clinic:"EndoVida" },
    { id:"c13", title:"Pediatria",               start:"2025-10-26T10:00:00", end:"2025-10-26T10:40:00", status:"completed",  doctor:"Letícia Ramos",   clinic:"Sorriso de Criança" },
    { id:"c14", title:"Otorrinolaringologia",    start:"2025-10-24T15:30:00", end:"2025-10-24T16:00:00", status:"completed",  doctor:"Marcelo T.",      clinic:"Oto&Saúde" },
    { id:"c15", title:"Urologia",                start:"2025-10-23T09:00:00", end:"2025-10-23T09:40:00", status:"canceled",   doctor:"Renato V.",       clinic:"UroCenter" },
    { id:"c16", title:"Gastroenterologia",       start:"2025-10-22T14:00:00", end:"2025-10-22T14:45:00", status:"completed",  doctor:"Camila Freitas",  clinic:"Gastro+" },
    { id:"c17", title:"Neurologia",              start:"2025-10-20T08:30:00", end:"2025-10-20T09:20:00", status:"completed",  doctor:"Eduardo N.",      clinic:"NeuroCare",       color:"#1E5AA6" },
    { id:"c18", title:"Reumatologia",            start:"2025-10-18T16:00:00", end:"2025-10-18T16:40:00", status:"completed",  doctor:"Sofia P.",        clinic:"Rheuma Lab" },
    { id:"c19", title:"Alergologia",             start:"2025-10-15T11:00:00", end:"2025-10-15T11:30:00", status:"completed",  doctor:"Ítalo M.",        clinic:"Alérgicos Bem" },
    { id:"c20", title:"Vacinação",               start:"2025-10-12T09:00:00", end:"2025-10-12T09:15:00", status:"completed",  doctor:"Enf. Paula",      clinic:"Imuniza+" },
  ]), []);

  // ===== Próxima consulta (timezone-aware)
  const nextAppointment = useMemo(() => {
    const now = new Date();
    return [...appointments]
      .map(a => ({ ...a, _start: toDateTZ(a.start, timezone) }))
      .filter(a => a._start.getTime() >= now.getTime())
      .sort((a, b) => a._start - b._start)[0] || null;
  }, [appointments, timezone]);

  const handleNavigate = useCallback((action) => {
    setCurrentDate(prev => {
      if (action === "today") return new Date();
      if (action === "prev") {
        if (view === "week") return addDays(prev, -7);
        if (view === "year") return addYears(prev, -1);
        return addMonths(prev, -1);
      }
      if (action === "next") {
        if (view === "week") return addDays(prev, 7);
        if (view === "year") return addYears(prev, 1);
        return addMonths(prev, 1);
      }
      return prev;
    });
  }, [view]);

  const handleViewChange = useCallback((v) => setView(v), []);

  // ====== CLICK EM EVENTO DO CALENDÁRIO ======
  const handleEventClick = useCallback((ev) => {
    const evDate = toDateTZ(ev.start, timezone);
    if (view === "week") {
      setDetailItem(ev);
      setModalMode("detail");
      setModalOpen(true);
      return;
    }
    const list = getEventsForDay(appointments, evDate);
    setModalDate(evDate);
    setModalDayEvents(list);
    setModalMode("day");
    setModalOpen(true);
  }, [view, appointments, timezone]);

  const closeModal = useCallback(() => {
    setModalOpen(false);
    setModalMode(null);
    setDetailItem(null);
    setModalDate(null);
    setModalDayEvents([]);
  }, []);

  const openDetailFromDay = useCallback((item) => {
    setDetailItem(item);
    setModalMode("detail");
  }, []);

  return (
    <main className={`${s.page} ${utils.withNavOffsetPadding}`}>

      {/* ===== Destaque: Próxima consulta (Mobile) ===== */}
      <section className={`container ${s.nextSection} ${s.mobileOnly}`} aria-label="Próxima consulta">
        <h2 className={typey.titleLg} style={{ marginBottom: 'var(--space-6)' }}>Próxima consulta</h2>
        <DoctorCard
          variant="next-appt"
          timezone={timezone}
          locale={locale}
          appointment={nextAppointment}
          onOpenDetail={(item) => { setDetailItem(item); setModalMode("detail"); setModalOpen(true); }}
        />
      </section>

      {/* ===== MOBILE: Lista de próximas consultas ===== */}
      <section className={`container ${s.mobileSection} ${s.mobileOnly}`} aria-label="Próximas consultas (mobile)">
        <header className={s.mobileHeader}>
          <h1 className={typey.titleLg}>Minhas Consultas</h1>
          <p className={typey.titleXSm}>Veja suas próximas consultas por dia</p>
        </header>

        <UpcomingAppointmentsListMobile
          appointments={appointments}
          timezone={timezone}
          locale={locale}
          onOpenDetail={(item) => { setDetailItem(item); setModalMode("detail"); setModalOpen(true); }}
          onCloseDetail={() => { setModalOpen(false); setModalMode(null); setDetailItem(null); }}
        />
      </section>

      {/* ===== Destaque: Próxima consulta (Desktop/Tablet) ===== */}
      <section className={`container ${s.nextSection} ${s.desktopOnly}`} aria-label="Próxima consulta">
        <h2 className={typey.titleLg} style={{ marginBottom: 'var(--space-6)' }}>Próxima consulta</h2>
        <DoctorCard
          variant="next-appt"
          timezone={timezone}
          locale={locale}
          appointment={nextAppointment}
          onOpenDetail={(item) => { setDetailItem(item); setModalMode("detail"); setModalOpen(true); }}
        />
      </section>

      {/* ===== DESKTOP/TABLET: Calendário ===== */}
      <section className={`container ${s.calendarSection} ${s.desktopOnly}`} aria-label="Calendário de consultas">
        <div className={s.calendarShell}>
          <header className={s.calendarHeader}>
            <div className={s.headerRow}>
              <h1 className={typey.titleLg}>Minhas Consultas</h1>
            </div>
          </header>

          <ClinicCalendar
            timezone={timezone}
            view={view}
            currentDate={currentDate}
            appointments={appointments}
            onNavigate={handleNavigate}
            onViewChange={handleViewChange}
            onEventClick={handleEventClick}
            hoursRange={{ start: 5, end: 22 }}
            highlightToday
          />
        </div>
      </section>

      {/* MODAL */}
      <Modal
        open={modalOpen}
        title={
          modalMode === "day"
            ? `Consultas em ${modalDate ? formatBRDate(modalDate) : ""}`
            : (detailItem ? `Detalhes da consulta` : "")
        }
        onClose={closeModal}
      >
        {modalMode === "day" && (
          <div className={s.eventList}>
            {modalDayEvents.length === 0 && (
              <p className={s.emptyText}>Nenhuma consulta neste dia.</p>
            )}
            {modalDayEvents.map((it) => (
              <div key={it.id} className={s.eventItem}>
                <div className={s.eventLeft}>
                  <span className={s.eventTime}>{formatTime(it.start)} – {formatTime(it.end)}</span>
                  <span className={s.eventTitle}>{it.title}</span>
                  <span className={s.eventMeta}>
                    {it.doctor ? `Dr(a). ${it.doctor}` : ""}{it.clinic ? ` • ${it.clinic}` : ""}
                  </span>
                </div>
                <div className={s.eventRight}>
                  <span className={`${s.statusBadge} ${statusClass(it.status)}`}>{statusLabel(it.status)}</span>
                  <button className={`${btn.btn} ${btn.btnPrimary}`} onClick={() => openDetailFromDay(it)}>
                    Ver detalhes
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {modalMode === "detail" && detailItem && (
          <div className={s.detailWrap}>
            <div className={s.detailRow}>
              <span className={s.detailLabel}>Título:</span>
              <span className={s.detailValue}>{detailItem.title}</span>
            </div>
            <div className={s.detailRow}>
              <span className={s.detailLabel}>Data:</span>
              <span className={s.detailValue}>
                {formatLongDate(detailItem.start)} &middot; {formatTime(detailItem.start)} - {formatTime(detailItem.end)}
              </span>
            </div>
            <div className={s.detailRow}>
              <span className={s.detailLabel}>Profissional:</span>
              <span className={s.detailValue}>{detailItem.doctor ? `Dr(a). ${detailItem.doctor}` : "—"}</span>
            </div>
            <div className={s.detailRow}>
              <span className={s.detailLabel}>Local:</span>
              <span className={s.detailValue}>{detailItem.clinic ?? "—"}</span>
            </div>
            <div className={s.detailRow}>
              <span className={s.detailLabel}>Status:</span>
              <span className={`${s.statusBadge} ${statusClass(detailItem.status)}`}>{statusLabel(detailItem.status)}</span>
            </div>

            <div className={s.detailActions}>
              <button className={`${btn.btn} ${btn.btnPrimary}`} onClick={() => alert("Ver detalhes / orientações (exemplo)")}>
                Abrir página da consulta
              </button>
            </div>
          </div>
        )}
      </Modal>
    </main>
  );
}

/* ===== helpers locais ===== */
function addDays(d, n) { const x = new Date(d); x.setDate(x.getDate() + n); return x; }
function addMonths(d, n) { const x = new Date(d); x.setMonth(x.getMonth() + n); return x; }
function addYears(d, n) { const x = new Date(d); x.setFullYear(x.getFullYear() + n); return x; }

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
    year:"numeric", month:"2-digit", day:"2-digit",
    hour:"2-digit", minute:"2-digit", second:"2-digit",
  }).formatToParts(new Date(guess));
  const get = (t) => Number(parts.find((p) => p.type === t).value);
  const tzY = get("year"), tzM = get("month"), tzD = get("day");
  const tzH = get("hour"), tzMin = get("minute"), tzS = get("second");
  const deltaMin = (Date.UTC(year, month - 1, day, hour, minute, second) -
    Date.UTC(tzY, tzM - 1, tzD, tzH, tzMin, tzS)) / 60000;
  return new Date(guess + deltaMin * 60000);
}

function toDate(d) { return d instanceof Date ? d : new Date(d); }
function startOfDay(d) { const x = new Date(d); x.setHours(0,0,0,0); return x; }
function endOfDay(d) { const x = new Date(d); x.setHours(23,59,59,999); return x; }
function getEventsForDay(appts, date) {
  const sDay = startOfDay(date).getTime();
  const eDay = endOfDay(date).getTime();
  return appts.filter(ev => {
    const evS = toDateTZ(ev.start).getTime();
    const evE = toDateTZ(ev.end).getTime();
    return evS <= eDay && evE >= sDay;
  });
}
function formatTime(d) {
  const x = toDate(d);
  const hh = String(x.getHours()).padStart(2,"0");
  const mm = String(x.getMinutes()).padStart(2,"0");
  return `${hh}:${mm}`;
}
function formatBRDate(d) {
  const x = toDate(d);
  const dd = String(x.getDate()).padStart(2,"0");
  const mm = String(x.getMonth()+1).padStart(2,"0");
  const yyyy = x.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}
function formatLongDate(d) {
  const x = toDate(d);
  const opts = { weekday: "long", year: "numeric", month: "long", day: "numeric" };
  return x.toLocaleDateString("pt-BR", opts);
}
function statusLabel(s) {
  switch (s) {
    case "confirmed": return "Confirmada";
    case "scheduled": return "Agendada";
    case "canceled":  return "Cancelada";
    case "completed": return "Concluída";
    default: return "—";
  }
}
function statusClass(sv) {
  switch (sv) {
    case "confirmed": return s.statusConfirmed;
    case "scheduled": return s.statusScheduled;
    case "canceled":  return s.statusCanceled;
    case "completed": return s.statusCompleted;
    default: return "";
  }
}

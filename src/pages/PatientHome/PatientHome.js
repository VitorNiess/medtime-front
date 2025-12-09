// src/pages/PatientHome/patienthome.jsx
import React, {
  useMemo,
  useState,
  useCallback,
  useEffect,
} from "react";

// Services
import { listMinhasConsultas } from "../../services/agenda";

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
 */
export default function PatientHome() {
  const timezone = "America/Sao_Paulo";
  const locale = "pt-BR";

  const [view, setView] = useState("month");
  const [currentDate, setCurrentDate] = useState(new Date());

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState(/** @type {'day'|'detail'|null} */ (null));
  const [modalDate, setModalDate] = useState(null);
  const [modalDayEvents, setModalDayEvents] = useState([]);
  const [detailItem, setDetailItem] = useState(null);

  // Consultas vindas da API
  const [appointments, setAppointments] = useState([]);
  const [loadingAppts, setLoadingAppts] = useState(true);
  const [errorAppts, setErrorAppts] = useState(null);

  // =======================
  // Carregar consultas do paciente
  // =======================
  useEffect(() => {
    let cancelled = false;

    async function fetchConsultas() {
      console.log("[PatientHome] Iniciando carregamento de consultas…");
      setLoadingAppts(true);
      setErrorAppts(null);

      try {
        const res = await listMinhasConsultas();
        console.log("[PatientHome] Resposta listMinhasConsultas:", res);

        if (cancelled) return;

        if (!res.ok) {
          console.warn("[PatientHome] listMinhasConsultas NÃO OK:", res.error);
          setErrorAppts(res.error || "Falha ao carregar consultas.");
          setAppointments([]);
          return;
        }

        const consultas = res.consultas || [];
        console.log("[PatientHome] Consultas brutas vindas da API:", consultas);

        // Mapeia e remove entradas inválidas (sem horário válido)
        const mapped = consultas
          .map((c, idx) => {
            const mappedItem = mapConsultaToAppointment(c, idx);
            return mappedItem;
          })
          .filter(Boolean);

        console.log("[PatientHome] Consultas mapeadas p/ appointments:", mapped);

        setAppointments(mapped);
      } catch (e) {
        console.error("[PatientHome] erro ao carregar consultas:", e);
        if (!cancelled) {
          setErrorAppts(
            "Erro ao carregar consultas. Verifique sua conexão ou tente novamente."
          );
        }
      } finally {
        if (!cancelled) {
          setLoadingAppts(false);
        }
      }
    }

    fetchConsultas();

    return () => {
      cancelled = true;
    };
  }, []);

  // ===== Próxima consulta (timezone-aware)
  const nextAppointment = useMemo(() => {
    console.log("[PatientHome] Recalculando nextAppointment. Lista:", appointments);
    if (!appointments || appointments.length === 0) return null;
    const now = new Date();

    const withStart = appointments.map((a) => {
      const _start = toDateTZ(a.start, timezone);
      return { ...a, _start };
    });

    console.log("[PatientHome] Appointments com _start calculado:", withStart);

    const future = withStart
      .filter((a) => !isNaN(a._start.getTime()) && a._start.getTime() >= now.getTime())
      .sort((a, b) => a._start - b._start);

    console.log("[PatientHome] Futuras (ordenadas):", future);

    const picked = future[0] || null;
    console.log("[PatientHome] nextAppointment escolhido:", picked);

    return picked;
  }, [appointments, timezone]);

  const handleNavigate = useCallback(
    (action) => {
      setCurrentDate((prev) => {
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
    },
    [view]
  );

  const handleViewChange = useCallback((v) => setView(v), []);

  // ====== CLICK EM EVENTO DO CALENDÁRIO ======
  const handleEventClick = useCallback(
    (ev) => {
      console.log("[PatientHome] Clique em evento no calendário:", ev);
      const evDate = toDateTZ(ev.start, timezone);
      if (view === "week") {
        setDetailItem(ev);
        setModalMode("detail");
        setModalOpen(true);
        return;
      }
      const list = getEventsForDay(appointments, evDate);
      console.log("[PatientHome] Eventos desse dia:", list);
      setModalDate(evDate);
      setModalDayEvents(list);
      setModalMode("day");
      setModalOpen(true);
    },
    [view, appointments, timezone]
  );

  const closeModal = useCallback(() => {
    setModalOpen(false);
    setModalMode(null);
    setDetailItem(null);
    setModalDate(null);
    setModalDayEvents([]);
  }, []);

  const openDetailFromDay = useCallback((item) => {
    console.log("[PatientHome] Abrindo detalhe a partir da lista do dia:", item);
    setDetailItem(item);
    setModalMode("detail");
  }, []);

  return (
    <main className={`${s.page} ${utils.withNavOffsetPadding}`}>
      {/* ===== Avisos de loading/erro globais ===== */}
      <section className="container" style={{ marginTop: "var(--space-4)" }}>
        {loadingAppts && (
          <p className={typey.bodyMd}>Carregando suas consultas…</p>
        )}
        {!loadingAppts && errorAppts && (
          <p className={typey.bodyMd} style={{ color: "var(--color-danger)" }}>
            {errorAppts}
          </p>
        )}
      </section>

      {/* ===== Destaque: Próxima consulta (Mobile) ===== */}
      <section
        className={`container ${s.nextSection} ${s.mobileOnly}`}
        aria-label="Próxima consulta"
      >
        <h2
          className={typey.titleLg}
          style={{ marginBottom: "var(--space-6)" }}
        >
          Próxima consulta
        </h2>

        {nextAppointment ? (
          <DoctorCard
            variant="next-appt"
            timezone={timezone}
            locale={locale}
            appointment={nextAppointment}
            onOpenDetail={(item) => {
              console.log("[PatientHome] onOpenDetail (mobile next):", item);
              setDetailItem(item);
              setModalMode("detail");
              setModalOpen(true);
            }}
          />
        ) : (
          <p className={typey.bodyMd}>Você ainda não tem consultas futuras.</p>
        )}
      </section>

      {/* ===== MOBILE: Lista de próximas consultas ===== */}
      <section
        className={`container ${s.mobileSection} ${s.mobileOnly}`}
        aria-label="Próximas consultas (mobile)"
      >
        <header className={s.mobileHeader}>
          <h1 className={typey.titleLg}>Minhas Consultas</h1>
          <p className={typey.titleXSm}>
            Veja suas próximas consultas por dia
          </p>
        </header>

        <UpcomingAppointmentsListMobile
          appointments={appointments}
          timezone={timezone}
          locale={locale}
          onOpenDetail={(item) => {
            console.log("[PatientHome] onOpenDetail (mobile list):", item);
            setDetailItem(item);
            setModalMode("detail");
            setModalOpen(true);
          }}
          onCloseDetail={() => {
            setModalOpen(false);
            setModalMode(null);
            setDetailItem(null);
          }}
        />
      </section>

      {/* ===== Destaque: Próxima consulta (Desktop/Tablet) ===== */}
      <section
        className={`container ${s.nextSection} ${s.desktopOnly}`}
        aria-label="Próxima consulta"
      >
        <h2
          className={typey.titleLg}
          style={{ marginBottom: "var(--space-6)" }}
        >
          Próxima consulta
        </h2>

        {nextAppointment ? (
          <DoctorCard
            variant="next-appt"
            timezone={timezone}
            locale={locale}
            appointment={nextAppointment}
            onOpenDetail={(item) => {
              console.log("[PatientHome] onOpenDetail (desktop next):", item);
              setDetailItem(item);
              setModalMode("detail");
              setModalOpen(true);
            }}
          />
        ) : (
          <p className={typey.bodyMd}>Você ainda não tem consultas futuras.</p>
        )}
      </section>

      {/* ===== DESKTOP/TABLET: Calendário ===== */}
      <section
        className={`container ${s.calendarSection} ${s.desktopOnly}`}
        aria-label="Calendário de consultas"
      >
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
            : detailItem
            ? `Detalhes da consulta`
            : ""
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
                  <span className={s.eventTime}>
                    {formatTime(it.start)} – {formatTime(it.end)}
                  </span>
                  <span className={s.eventTitle}>{it.title}</span>
                  <span className={s.eventMeta}>
                    {it.doctor ? `Dr(a). ${it.doctor}` : ""}
                    {it.clinic ? ` • ${it.clinic}` : ""}
                  </span>
                </div>
                <div className={s.eventRight}>
                  <span
                    className={`${s.statusBadge} ${statusClass(it.status)}`}
                  >
                    {statusLabel(it.status)}
                  </span>
                  <button
                    className={`${btn.btn} ${btn.btnPrimary}`}
                    onClick={() => openDetailFromDay(it)}
                  >
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
                {formatLongDate(detailItem.start)} &middot;{" "}
                {formatTime(detailItem.start)} - {formatTime(detailItem.end)}
              </span>
            </div>
            <div className={s.detailRow}>
              <span className={s.detailLabel}>Profissional:</span>
              <span className={s.detailValue}>
                {detailItem.doctor ? `Dr(a). ${detailItem.doctor}` : "—"}
              </span>
            </div>
            <div className={s.detailRow}>
              <span className={s.detailLabel}>Local:</span>
              <span className={s.detailValue}>{detailItem.clinic ?? "—"}</span>
            </div>
            <div className={s.detailRow}>
              <span className={s.detailLabel}>Status:</span>
              <span
                className={`${s.statusBadge} ${statusClass(
                  detailItem.status
                )}`}
              >
                {statusLabel(detailItem.status)}
              </span>
            </div>
          </div>
        )}
      </Modal>
    </main>
  );
}

/* ===== Mapear consulta -> appointment usado na UI ===== */
function mapConsultaToAppointment(consulta, index) {
  console.log("[PatientHome] mapConsultaToAppointment - entrada #", index, consulta);
  if (!consulta) return null;

  const cm = consulta.calendario_medico || {};
  const medico = cm.medico || {};
  const unidade = cm.unidade || {};

  // backend: tempo_consulta é a data/hora da consulta
  const rawStart = cm.horario_inicio || consulta.tempo_consulta;
  const rawEnd =
    cm.horario_fim ||
    cm.horario_inicio ||
    consulta.tempo_consulta ||
    rawStart;

  console.log("[PatientHome] rawStart/rawEnd da consulta #", index, {
    rawStart,
    rawEnd,
  });

  if (!rawStart) {
    console.warn(
      "[PatientHome] consulta sem horário início, ignorando (#",
      index,
      "):",
      consulta
    );
    return null;
  }

  const startDate = new Date(rawStart);
  const endDate = new Date(rawEnd);

  console.log("[PatientHome] startDate/endDate parsed #", index, {
    startDate,
    endDate,
    startValid: !isNaN(startDate.getTime()),
    endValid: !isNaN(endDate.getTime()),
  });

  if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
    console.warn("[PatientHome] datas inválidas em consulta, ignorando #", index, {
      consulta,
      rawStart,
      rawEnd,
    });
    return null;
  }

  const startISO = startDate.toISOString();
  const endISO = endDate.toISOString();

  const rawStatus = consulta.status || "agendado";
  const status = normalizeStatus(rawStatus);

  const mapped = {
    id: consulta.id_consulta ?? consulta.id,
    title: medico.especialidade || "Consulta",
    start: startISO,
    end: endISO,
    status,
    doctor: medico.nome || "",
    clinic: unidade.nome || "",
    color: status === "canceled" ? "#9CA3AF" : "#3E9C88",
    rawStatus,
  };

  console.log("[PatientHome] Appointment mapeado #", index, mapped);
  return mapped;
}

/* ===== helpers locais ===== */
function normalizeStatus(apiStatus) {
  if (!apiStatus) return "scheduled";
  const sVal = String(apiStatus).toLowerCase();

  if (sVal === "agendado" || sVal === "marcado" || sVal === "pendente")
    return "scheduled";
  if (sVal === "confirmado" || sVal === "confirmada") return "confirmed";
  if (sVal === "cancelado" || sVal === "cancelada") return "canceled";
  if (sVal === "concluido" || sVal === "concluida" || sVal === "finalizado")
    return "completed";

  return "scheduled";
}

function addDays(d, n) {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}
function addMonths(d, n) {
  const x = new Date(d);
  x.setMonth(x.getMonth() + n);
  return x;
}
function addYears(d, n) {
  const x = new Date(d);
  x.setFullYear(x.getFullYear() + n);
  return x;
}

function toDateTZ(input, tz = "America/Sao_Paulo") {
  if (input instanceof Date) return input;
  if (typeof input !== "string") return new Date(input);
  const m = input.match(
    /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?/
  );
  if (!m) return new Date(input);
  const [_, y, mo, d, h, mi, s = "0"] = m;
  return wallTimeInTZToDate(+y, +mo, +d, +h, +mi, +s, tz);
}
function wallTimeInTZToDate(
  year,
  month,
  day,
  hour,
  minute,
  second,
  timeZone
) {
  const guess = Date.UTC(year, month - 1, day, hour, minute, second);
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
  const tzY = get("year"),
    tzM = get("month"),
    tzD = get("day");
  const tzH = get("hour"),
    tzMin = get("minute"),
    tzS = get("second");
  const deltaMin =
    (Date.UTC(year, month - 1, day, hour, minute, second) -
      Date.UTC(tzY, tzM - 1, tzD, tzH, tzMin, tzS)) /
    60000;
  return new Date(guess + deltaMin * 60000);
}

function toDate(d) {
  return d instanceof Date ? d : new Date(d);
}
function startOfDay(d) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}
function endOfDay(d) {
  const x = new Date(d);
  x.setHours(23, 59, 59, 999);
  return x;
}
function getEventsForDay(appts, date) {
  const sDay = startOfDay(date).getTime();
  const eDay = endOfDay(date).getTime();
  return appts.filter((ev) => {
    const evS = toDateTZ(ev.start).getTime();
    const evE = toDateTZ(ev.end).getTime();
    return evS <= eDay && evE >= sDay;
  });
}
function formatTime(d) {
  const x = toDate(d);
  if (isNaN(x.getTime())) {
    console.warn("[PatientHome] formatTime recebeu data inválida:", d);
    return "--:--";
  }
  const hh = String(x.getHours()).padStart(2, "0");
  const mm = String(x.getMinutes()).padStart(2, "0");
  return `${hh}:${mm}`;
}
function formatBRDate(d) {
  const x = toDate(d);
  const dd = String(x.getDate()).padStart(2, "0");
  const mm = String(x.getMonth() + 1).padStart(2, "0");
  const yyyy = x.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}
function formatLongDate(d) {
  const x = toDate(d);
  const opts = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  };
  return x.toLocaleDateString("pt-BR", opts);
}
function statusLabel(sv) {
  switch (sv) {
    case "confirmed":
      return "Confirmada";
    case "scheduled":
      return "Agendada";
    case "canceled":
      return "Cancelada";
    case "completed":
      return "Concluída";
    default:
      return "—";
  }
}
function statusClass(sv) {
  switch (sv) {
    case "confirmed":
      return s.statusConfirmed;
    case "scheduled":
      return s.statusScheduled;
    case "canceled":
      return s.statusCanceled;
    case "completed":
      return s.statusCompleted;
    default:
      return "";
  }
}

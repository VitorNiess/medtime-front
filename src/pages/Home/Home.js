// src/pages/Home/Home.jsx

import React, { useMemo, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import DoctorCard from "../../components/DoctorCard/DoctorCard";
import UserInfoCard from "../../components/UserInfoCard/UserInfoCard";

import s from "./home.module.css";
import typey from "../../styles/primitives/typography.module.css";
import utils from "../../styles/base/utilities.module.css";
import btn from "../../styles/primitives/buttons.module.css";

// Contextos
import { useAuth } from "../../contexts/AuthContext";

// Services
import { listMinhasConsultas } from "../../services/agenda";

export default function Home() {
  const navigate = useNavigate();
  const timezone = "America/Sao_Paulo";
  const locale = "pt-BR";

  const { user } = useAuth();

  // ----- Mock de perfil (mantido por enquanto) -----
  const userMock = {
    id: "u_123",
    name: "Paciente Exemplo",
    email: "paciente@exemplo.com",
    avatarUrl: "",
    location: {
      city: "São João del-Rei",
      state: "MG",
      country: "Brasil",
    },
    health: {
      allergies: ["Dipirona", "Amendoim"],
      chronicConditions: ["Hipertensão", "Asma leve"],
      medications: ["Losartana 50mg (1x/dia)", "Salbutamol (SOS)"],
      bloodType: "O+",
      vaccinations: ["Influenza 2025", "COVID-19 (bivalente)"],
      emergencyContact: {
        name: "Maria Silva (mãe)",
        phone: "(32) 9 9999-0000",
      },
      lastCheckupDate: "2025-05-18",
      heightMeters: 1.75,
      weightKg: 72,
      lifestyleNotes: "Exercícios 3x/sem, não fumante, álcool social.",
    },
  };

  // ===== Consultas vindas da API =====
  const [appointments, setAppointments] = useState([]);
  const [loadingAppts, setLoadingAppts] = useState(true);
  const [errorAppts, setErrorAppts] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchConsultas() {
      console.log("[Home] Carregando consultas (listMinhasConsultas)...");
      setLoadingAppts(true);
      setErrorAppts(null);

      try {
        const res = await listMinhasConsultas();
        console.log("[Home] Resposta listMinhasConsultas:", res);

        if (cancelled) return;

        if (!res.ok) {
          setErrorAppts(res.error || "Falha ao carregar consultas.");
          setAppointments([]);
          return;
        }

        const consultas = res.consultas || [];
        console.log("[Home] Consultas brutas:", consultas);

        const mapped = consultas
          .map((c, idx) => mapConsultaToAppointment(c, idx))
          .filter(Boolean); // descarta consultas com datas inválidas

        console.log("[Home] Consultas mapeadas -> appointments:", mapped);
        setAppointments(mapped);
      } catch (e) {
        console.error("[Home] Erro ao carregar consultas:", e);
        if (!cancelled) {
          setErrorAppts(
            "Erro ao carregar consultas. Verifique sua conexão ou tente novamente."
          );
        }
      } finally {
        if (!cancelled) setLoadingAppts(false);
      }
    }

    fetchConsultas();
    return () => {
      cancelled = true;
    };
  }, []);

  // ===== Próxima consulta (timezone-aware, segura) =====
  const nextAppointment = useMemo(() => {
    console.log("[Home] Recalculando nextAppointment. Lista:", appointments);
    if (!appointments || appointments.length === 0) return null;

    const now = new Date();

    const withStart = appointments.map((a) => {
      const _start = toDateTZ(a.start, timezone);
      return { ...a, _start };
    });

    const future = withStart
      .filter((a) => !isNaN(a._start.getTime()) && a._start >= now)
      .sort((a, b) => a._start - b._start);

    const picked = future[0] || null;
    console.log("[Home] nextAppointment escolhido:", picked);
    return picked;
  }, [appointments, timezone]);

  return (
    <main className={`${s.page} ${utils.withNavOffsetPadding}`}>
      <section className={`container ${s.hero}`}>
        <div className={s.heroLeft}>
          <h1 className={typey.titleLg}>Olá, {user?.name ?? "Paciente"}</h1>
          <p className={s.sub}>
            Gerencie suas consultas e encontre atendimento perto de você.
          </p>

          <div className={s.quickActions}>
            <button
              className={`${btn.btn} ${btn.btnPrimary}`}
              onClick={() => navigate("/agenda")}
            >
              Ver agenda
            </button>
            <button
              className={`${btn.btn} ${btn.btnSecondary}`}
              onClick={() => navigate("/medicos")}
            >
              Buscar médico
            </button>
          </div>
        </div>
      </section>

      <section className={s.discover}>
        {/* Perfil rápido */}
        <div className="container">
          <h2 className={typey.titleSm}>Seu perfil</h2>
          <UserInfoCard
            name={userMock.name}
            email={userMock.email}
            avatarUrl={userMock.avatarUrl}
            locationLabel={`${userMock.location.city}/${userMock.location.state}`}
            allergies={userMock.health.allergies}
            chronicConditions={userMock.health.chronicConditions}
            medications={userMock.health.medications}
            bloodType={userMock.health.bloodType}
            vaccinations={userMock.health.vaccinations}
            emergencyContact={userMock.health.emergencyContact}
            lastCheckupDate={userMock.health.lastCheckupDate}
            heightMeters={userMock.health.heightMeters}
            weightKg={userMock.health.weightKg}
            lifestyleNotes={userMock.health.lifestyleNotes}
            onEdit={() => console.log("Editar perfil de saúde")}
          />
        </div>

        {/* Próxima consulta */}
        <div className="container">
          <h2 className={typey.titleSm}>Próxima consulta</h2>

          {loadingAppts && (
            <p className={typey.bodyMd}>Carregando suas consultas…</p>
          )}

          {!loadingAppts && errorAppts && (
            <p className={typey.bodyMd} style={{ color: "var(--color-danger)" }}>
              {errorAppts}
            </p>
          )}

          {!loadingAppts && !errorAppts && !nextAppointment && (
            <p className={typey.bodyMd}>
              Você ainda não tem consultas futuras agendadas.
            </p>
          )}

          {!loadingAppts && !errorAppts && nextAppointment && (
            <DoctorCard
              variant="next-appt"
              timezone={timezone}
              locale={locale}
              appointment={nextAppointment}
              onOpenDetail={(item) => navigate(`/consultas/${item.id}`)}
            />
          )}
        </div>

        {/* Clínicas próximas */}
        <div className="container">
          <h2 className={typey.titleSm}>Clínicas próximas</h2>
          <div className={s.card}>
            <p className={s.m0}>
              Ative sua localização para ver unidades próximas e agendar mais
              rápido.
            </p>
            <div className={s.mt2}>
              <button
                className={`${btn.btn} ${btn.btnSecondary}`}
                onClick={() => navigate("/unidades")}
              >
                Ver clínicas
              </button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

/* ===== Mapear consulta -> appointment usado pela UI (DoctorCard) ===== */

function mapConsultaToAppointment(consulta, index) {
  console.log("[Home] mapConsultaToAppointment #", index, consulta);
  if (!consulta) return null;

  const cm = consulta.calendario_medico || {};
  const medico = cm.medico || {};
  const unidade = cm.unidade || {};

  const rawStart = cm.horario_inicio || consulta.tempo_consulta;
  const rawEnd =
    cm.horario_fim ||
    cm.horario_inicio ||
    consulta.tempo_consulta ||
    rawStart;

  console.log("[Home] rawStart/rawEnd consulta #", index, { rawStart, rawEnd });

  if (!rawStart) {
    console.warn(
      "[Home] Consulta sem horário de início; ignorando (#",
      index,
      "):",
      consulta
    );
    return null;
  }

  const startDate = new Date(rawStart);
  const endDate = new Date(rawEnd);

  if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
    console.warn("[Home] Datas inválidas na consulta; ignorando #", index, {
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

  console.log("[Home] Appointment mapeado #", index, mapped);
  return mapped;
}

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

/* ===== Helpers de data/timezone (idênticos à PatientHome) ===== */

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
  const tzY = get("year");
  const tzM = get("month");
  const tzD = get("day");
  const tzH = get("hour");
  const tzMin = get("minute");
  const tzS = get("second");

  const deltaMin =
    (Date.UTC(year, month - 1, day, hour, minute, second) -
      Date.UTC(tzY, tzM - 1, tzD, tzH, tzMin, tzS)) /
    60000;

  return new Date(guess + deltaMin * 60000);
}
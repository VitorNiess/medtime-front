// src/pages/Home/Home.jsx

import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import DoctorCard from "../../components/DoctorCard/DoctorCard";
import UserInfoCard from "../../components/UserInfoCard/UserInfoCard";
import s from "./home.module.css";
import typey from "../../styles/primitives/typography.module.css";
import utils from "../../styles/base/utilities.module.css";
import btn from "../../styles/primitives/buttons.module.css";

// Contextos
import { useAuth } from "../../contexts/AuthContext";

export default function Home() {
    const navigate = useNavigate();
    const timezone = "America/Sao_Paulo";
    const locale = "pt-BR";

    const { user } = useAuth();

    const userMock = {
        id: "u_123",
        name: "Paciente Exemplo",
        email: "paciente@exemplo.com",
        avatarUrl: "",
        location: {
            city: "São João del-Rei",
            state: "MG",
            country: "Brasil"
        },
        health: {
            allergies: ["Dipirona", "Amendoim"],
            chronicConditions: ["Hipertensão", "Asma leve"],
            medications: ["Losartana 50mg (1x/dia)", "Salbutamol (SOS)"],
            bloodType: "O+",
            vaccinations: ["Influenza 2025", "COVID-19 (bivalente)"],
            emergencyContact: { name: "Maria Silva (mãe)", phone: "(32) 9 9999-0000" },
            lastCheckupDate: "2025-05-18",
            heightMeters: 1.75,
            weightKg: 72,
            lifestyleNotes: "Exercícios 3x/sem, não fumante, álcool social."
        }
    };

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

    const nextAppointment = useMemo(() => {
        const now = new Date();

    const toDateTZ = (input) => {
        if (input instanceof Date) return input;

        const m = String(input).match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?$/);

        if (!m) return new Date(input);

        const [_, y, mo, d, h, mi, s = "0"] = m;
        const guess = Date.UTC(+y, +mo - 1, +d, +h, +mi, +s);

        const parts = new Intl.DateTimeFormat("en-CA", {
            timeZone: timezone, hour12: false,
            year:"numeric", month:"2-digit", day:"2-digit",
            hour:"2-digit", minute:"2-digit", second:"2-digit",
        }).formatToParts(new Date(guess));

        const get = (t) => Number(parts.find((p) => p.type === t).value);

        const tzY = get("year"), tzM = get("month"), tzD = get("day");
        const tzH = get("hour"), tzMin = get("minute"), tzS = get("second");

        const deltaMin = (Date.UTC(+y, +mo - 1, +d, +h, +mi, +s) -
            Date.UTC(tzY, tzM - 1, tzD, tzH, tzMin, tzS)) / 60000;

        return new Date(guess + deltaMin * 60000);
    };

    return [...appointments]
        .map(a => ({ ...a, _start: toDateTZ(a.start) }))
        .filter(a => a._start.getTime() >= now.getTime())
        .sort((a, b) => a._start - b._start)[0] || null;
    }, [appointments]);

    return (
        <main className={`${s.page} ${utils.withNavOffsetPadding}`}>
            <section className={`container ${s.hero}`}>
                <div className={s.heroLeft}>
                    <h1 className={typey.titleLg}>Olá, {user.name}</h1>
                    <p className={s.sub}>Gerencie suas consultas e encontre atendimento perto de você.</p>

                    <div className={s.quickActions}>
                        <button className={`${btn.btn} ${btn.btnPrimary}`} onClick={() => navigate("/agenda")}>
                        Ver agenda
                        </button>
                        <button className={`${btn.btn} ${btn.btnSecondary}`} onClick={() => navigate("/medicos")}>
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
                    <DoctorCard
                        variant="next-appt"
                        timezone={timezone}
                        locale={locale}
                        appointment={nextAppointment}
                        onOpenDetail={(item) => navigate(`/consultas/${item.id}`)}
                    />
                </div>

                {/* Clínicas próximas */}
                <div className="container">
                    <h2 className={typey.titleSm}>Clínicas próximas</h2>
                    <div className={s.card}>
                        <p className={s.m0}>Ative sua localização para ver unidades próximas e agendar mais rápido.</p>
                        <div className={s.mt2}>
                        <button className={`${btn.btn} ${btn.btnSecondary}`} onClick={() => navigate("/unidades")}>
                            Ver clínicas
                        </button>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
}

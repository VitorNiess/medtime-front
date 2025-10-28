// src/pages/Home/Home.jsx
import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import DoctorCard from "../../components/DoctorCard/DoctorCard";
import UserInfoCard from "../../components/UserInfoCard/UserInfoCard";
import s from "./home.module.css";
import typey from "../../styles/primitives/typography.module.css";
import utils from "../../styles/base/utilities.module.css";
import btn from "../../styles/primitives/buttons.module.css";

export default function Home() {
    const navigate = useNavigate();
    const timezone = "America/Sao_Paulo";
    const locale = "pt-BR";

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
                    <h1 className={typey.titleLg}>Olá, Paciente</h1>
                    <p className={s.sub}>Gerencie suas consultas e encontre atendimento perto de você.</p>

                    <div className={s.quickActions}>
                        <button className={`${btn.btn} ${btn.btnPrimary}`} onClick={() => navigate("/agenda")}>
                        Ver agenda
                        </button>
                        <button className={`${btn.btn} ${btn.btnSecondary}`} onClick={() => navigate("/busca")}>
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

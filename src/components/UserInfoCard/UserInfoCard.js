import React, { useMemo } from "react";
import PropTypes from "prop-types";

// Estilos do design system
import t from "../../styles/primitives/typography.module.css";
import surface from "../../styles/base/surfaces.module.css";
import s from "./userinfocard.module.css";
import btn from "../../styles/primitives/buttons.module.css";

// Ícones (Phosphor via react-icons)
import {
  PiGearSixBold,
  PiUserBold,
  PiSyringeBold,
  PiHeartbeatBold,
  PiPillBold,
  PiFirstAidBold,
  PiDropBold,
  PiStethoscopeBold
} from "react-icons/pi";
import { RxHeight } from "react-icons/rx";
import { LuWeight } from "react-icons/lu";
import { MdOutlineScale, MdOutlinePermPhoneMsg } from "react-icons/md";
import { IoToday, IoBodyOutline, IoTodayOutline } from "react-icons/io5";

/** Utils */
function initialsFromName(name = "") {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "U";
  return parts.slice(0, 2).map(p => p[0]).join("").toUpperCase();
}
function formatDate(d, locale = "pt-BR") {
  if (!d) return "—";
  const _d = d instanceof Date ? d : new Date(d);
  if (Number.isNaN(+_d)) return "—";
  return _d.toLocaleDateString(locale, { day: "2-digit", month: "2-digit", year: "numeric" });
}
function asListText(v) {
  if (!v || (Array.isArray(v) && v.length === 0)) return "—";
  return Array.isArray(v) ? v.join(", ") : String(v);
}
function computeBMI(heightMeters, weightKg) {
  if (!heightMeters || !weightKg) return null;
  const h = Number(heightMeters);
  const w = Number(weightKg);
  if (!h || !w) return null;
  const bmi = w / (h * h);
  if (!Number.isFinite(bmi)) return null;
  return Math.round(bmi * 10) / 10; // 1 casa
}

/**
 * UserInfoCard
 * 
 * Props:
 * - name: string (obrigatório)
 * - email?: string
 * - avatarUrl?: string
 * - locationLabel?: string
 * - allergies?: string[]              (ex.: ["Dipirona", "Amendoim"])
 * - chronicConditions?: string[]      (ex.: ["Hipertensão"])
 * - medications?: string[]            (ex.: ["Losartana 50mg/dia"])
 * - bloodType?: string                (ex.: "O+")
 * - vaccinations?: string[]           (ex.: ["Influenza 2025", "Hepatite B (completo)"])
 * - emergencyContact?: { name: string, phone: string }
 * - lastCheckupDate?: string|Date
 * - heightMeters?: number             (ex.: 1.75)
 * - weightKg?: number                 (ex.: 72)
 * - lifestyleNotes?: string           (ex.: "Exercícios 3x/sem, não fumante")
 * - onEdit?: () => void
 * - rightExtra?: ReactNode
 */
export default function UserInfoCard({
  name,
  email,
  avatarUrl,
  locationLabel,
  allergies = [],
  chronicConditions = [],
  medications = [],
  bloodType,
  vaccinations = [],
  emergencyContact,
  lastCheckupDate,
  heightMeters,
  weightKg,
  lifestyleNotes,
  onEdit,
  rightExtra
}) {
  const bmi = useMemo(() => computeBMI(heightMeters, weightKg), [heightMeters, weightKg]);

    return (
        <article className={`${surface.surface} ${s.card}`} aria-label="Informações de saúde do usuário">
            {/* Header */}
            <header className={s.header}>
                {avatarUrl ? (
                <img
                    src={avatarUrl}
                    alt={`Foto de ${name}`}
                    className={s.avatar}
                    loading="lazy"
                    decoding="async"
                />
                ) : (
                <div className={s.avatarFallback} aria-hidden="true">
                    <span className={s.initials}>{initialsFromName(name)}</span>
                </div>
                )}

                <div className={s.idBlock}>
                <h3 className={`${t.titleSm} ${s.name}`}>{name}</h3>
                {email && <p className={s.subtle}>{email}</p>}
                {locationLabel && <p className={s.subtle}>{locationLabel}</p>}
                </div>
            </header>

            <div className={s.grid}>
                {/* Condições crônicas */}
                <section className={s.section}>
                    <h4 className={s.sectionTitle}><PiHeartbeatBold aria-hidden="true" /> Condições crônicas</h4>
                    <p className={s.value}>{asListText(chronicConditions)}</p>
                </section>

                {/* Alergias */}
                <section className={s.section}>
                    <h4 className={s.sectionTitle}><PiFirstAidBold aria-hidden="true" /> Alergias</h4>
                    <p className={s.value}>{asListText(allergies)}</p>
                </section>

                {/* Medicações em uso */}
                <section className={s.section}>
                    <h4 className={s.sectionTitle}><PiPillBold aria-hidden="true" /> Medicações em uso</h4>
                    <p className={s.value}>{asListText(medications)}</p>
                </section>

                {/* Vacinas */}
                <section className={s.sectionRow}>
                    <div className={s.itemHalf}>
                        <h4 className={s.sectionTitle}><PiSyringeBold aria-hidden="true" /> Vacinas</h4>
                        <p className={s.value}>{asListText(vaccinations)}</p>
                    </div>
                </section>

                {/* Altura, peso, IMC, tipo sanquíneo */}
                <section className={s.sectionRow}>
                    <div className={s.itemQuarter}>
                        <h4 className={s.sectionTitle}><RxHeight aria-hidden="true" />Altura</h4>
                        <p className={s.value}>{heightMeters ? `${heightMeters} m` : "—"}</p>
                    </div>
                    <div className={s.itemQuarter}>
                        <h4 className={s.sectionTitle}><LuWeight aria-hidden="true" />Peso</h4>
                        <p className={s.value}>{weightKg ? `${weightKg} kg` : "—"}</p>
                    </div>
                    <div className={s.itemQuarter}>
                        <h4 className={s.sectionTitle}><MdOutlineScale aria-hidden="true" />IMC</h4>
                        <p className={s.value}>{bmi ?? "—"}</p>
                    </div>
                    <div className={s.itemQuarter}>
                        <h4 className={s.sectionTitle}><PiDropBold aria-hidden="true" /> Tipo sanguíneo</h4>
                        <p className={s.value}>{bloodType || "—"}</p>
                    </div>
                </section>

                {/* Observações de estilo de vida */}
                <section className={s.section}>
                    <h4 className={s.sectionTitle}><IoBodyOutline aria-hidden="true" />Estilo de vida / Observações</h4>
                    <p className={s.value}>{lifestyleNotes || "—"}</p>
                </section>

                {/* Último checkup */}
                <section className={s.section}>
                    <h4 className={s.sectionTitle}><IoTodayOutline aria-hidden="true" />Último check-up</h4>
                    <p className={s.value}>{formatDate(lastCheckupDate)}</p>
                </section>

                {/* Contato de emergência */}
                <section className={s.section}>
                    <h4 className={s.sectionTitle}><MdOutlinePermPhoneMsg aria-hidden="true" />Contato de emergência</h4>
                    <p className={s.value}>
                        {emergencyContact?.name ? <strong>{emergencyContact.name}</strong> : "—"}
                        {emergencyContact?.phone ? ` • ${emergencyContact.phone}` : ""}
                    </p>
                </section>
            </div>

            <div className={s.actions}>
                <button
                    type="button"
                    className={`${btn.btn} ${btn.btnPrimary}`}
                    onClick={onEdit}
                >
                    Editar
                </button>
            </div>
        </article>
  );
}

UserInfoCard.propTypes = {
  name: PropTypes.string.isRequired,
  email: PropTypes.string,
  avatarUrl: PropTypes.string,
  locationLabel: PropTypes.string,
  allergies: PropTypes.arrayOf(PropTypes.string),
  chronicConditions: PropTypes.arrayOf(PropTypes.string),
  medications: PropTypes.arrayOf(PropTypes.string),
  bloodType: PropTypes.string,
  vaccinations: PropTypes.arrayOf(PropTypes.string),
  emergencyContact: PropTypes.shape({ name: PropTypes.string, phone: PropTypes.string }),
  lastCheckupDate: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]),
  heightMeters: PropTypes.number,
  weightKg: PropTypes.number,
  lifestyleNotes: PropTypes.string,
  onEdit: PropTypes.func,
  rightExtra: PropTypes.node,
};
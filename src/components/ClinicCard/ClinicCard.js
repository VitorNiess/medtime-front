import React from "react";
import PropTypes from "prop-types";

// Design system
import t from "../../styles/primitives/typography.module.css";
import surface from "../../styles/base/surfaces.module.css";
import btn from "../../styles/primitives/buttons.module.css";
import pills from "../../styles/primitives/pills.module.css";
import s from "./cliniccard.module.css";

import {
  PiMapPinBold,
  PiPhoneBold,
  PiClockBold,
  PiStarFill,
  PiVideoBold,
  PiWheelchairBold,
  PiCarBold
} from "react-icons/pi";

const TAG_ICONS = {
  telemedicina: <PiVideoBold aria-hidden="true" />,
  acessibilidade: <PiWheelchairBold aria-hidden="true" />,
  estacionamento: <PiCarBold aria-hidden="true" />,
};

function Stars({ value = 0 }) {
  const full = Math.floor(value);
  const half = value - full >= 0.5;
  const empty = 5 - full - (half ? 1 : 0);
  return (
    <span className={s.stars} aria-label={`${value.toFixed(1)} de 5`}>
      {Array.from({ length: full }).map((_, i) => <PiStarFill key={`f${i}`} />)}
      {half && <PiStarFill className={s.starHalf} />}
      {Array.from({ length: empty }).map((_, i) => <PiStarFill key={`e${i}`} className={s.starEmpty} />)}
    </span>
  );
}

export default function ClinicCard({
  id,
  name,
  logoUrl,
  addressLine,       // "Rua A, 123"
  district,          // "Centro"
  cityState,         // "São João del-Rei/MG"
  distanceKm,        // number (opcional)
  phone,             // "(32) 99999-0000"
  todayHours,        // "Hoje: 08:00–18:00" ou "Fechada"
  openNow,           // boolean
  tags = [],         // ["telemedicina","acessibilidade","estacionamento"]
  rating,            // 0..5
  reviewCount,       // número de avaliações
  onView,            // () => void
  onCall,            // () => void
  onDirections,      // () => void
}) {
  return (
    <article className={`${surface.surface} ${s.card}`} aria-label={`Clínica ${name}`}>
      <header className={s.header}>
        {logoUrl ? (
          <img
            src={logoUrl}
            alt=""
            className={s.logo}
            loading="lazy"
            decoding="async"
          />
        ) : (
          <div className={s.logoFallback} aria-hidden="true">{name?.[0]?.toUpperCase() || "C"}</div>
        )}

        <div className={s.titleWrap}>
          <h3 className={`${t.titleSm} ${s.name}`}>{name}</h3>
          <div className={s.ratingRow}>
            {typeof rating === "number" && (
              <>
                <Stars value={rating} />
                <span className={s.ratingText}>
                  {rating.toFixed(1)} {reviewCount ? `(${reviewCount})` : ""}
                </span>
              </>
            )}
          </div>
        </div>
      </header>

      <div className={s.infoGrid}>
        <div className={s.infoRow}>
          <PiMapPinBold aria-hidden="true" />
          <div className={s.infoText}>
            <span className={s.addrLine}>{addressLine}</span>
            <span className={s.addrSub}>
              {[district, cityState].filter(Boolean).join(" • ")}
              {typeof distanceKm === "number" && (
                <span className={s.dot} aria-hidden="true"> • </span>
              )}
              {typeof distanceKm === "number" && (
                <span className={s.muted}>{distanceKm.toFixed(1)} km</span>
              )}
            </span>
          </div>
        </div>

        <div className={s.infoRow}>
          <PiClockBold aria-hidden="true" />
          <div className={s.infoText}>
            <span className={s.hours}>
              <span className={`${s.badgeDot} ${openNow ? s.dotOpen : s.dotClosed}`} aria-hidden="true" />
              {todayHours ?? "—"}
            </span>
          </div>
        </div>

        {phone && (
          <div className={s.infoRow}>
            <PiPhoneBold aria-hidden="true" />
            <div className={s.infoText}>
              <a className={s.link} href={`tel:${phone.replace(/\D/g, "")}`} onClick={(e) => { e.preventDefault(); onCall?.(); }}>
                {phone}
              </a>
            </div>
          </div>
        )}
      </div>

      {tags.length > 0 && (
        <div className={s.tags}>
          {tags.map((tag, i) => (
            <span key={i} className={`${pills.pill} ${s.pill}`}>
              {TAG_ICONS[tag] ?? null} {tag.charAt(0).toUpperCase() + tag.slice(1)}
            </span>
          ))}
        </div>
      )}

      <footer className={s.footer}>
        <div className={s.actions}>
          <button
            type="button"
            className={`${btn.btn} ${btn.btnSecondary}`}
            onClick={onDirections}
            aria-label={`Ver rotas para ${name}`}
          >
            Rotas
          </button>
          <button
            type="button"
            className={`${btn.btn} ${btn.btnSecondary}`}
            onClick={onCall}
            aria-label={`Ligar para ${name}`}
          >
            Ligar
          </button>
        </div>
        <button
          type="button"
          className={`${btn.btn} ${btn.btnPrimary}`}
          onClick={onView}
          aria-label={`Ver detalhes de ${name}`}
        >
          Ver detalhes
        </button>
      </footer>
    </article>
  );
}

ClinicCard.propTypes = {
  id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  name: PropTypes.string.isRequired,
  logoUrl: PropTypes.string,
  addressLine: PropTypes.string,
  district: PropTypes.string,
  cityState: PropTypes.string,
  distanceKm: PropTypes.number,
  phone: PropTypes.string,
  todayHours: PropTypes.string,
  openNow: PropTypes.bool,
  tags: PropTypes.arrayOf(PropTypes.string),
  rating: PropTypes.number,
  reviewCount: PropTypes.number,
  onView: PropTypes.func,
  onCall: PropTypes.func,
  onDirections: PropTypes.func,
};
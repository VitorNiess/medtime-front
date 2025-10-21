import { useEffect, useMemo, useRef } from "react";
import s from "./footerskyline.module.css";

/**
 * FooterSkyline (mini)
 * - height: altura do cenário acima do piso (default: 90)
 * - speed: duração base de uma travessia dos carros (ms) (default: 20000)
 * - density: "low" | "medium" | "high" (vegetação) — default "medium"
 * - cars: quantidade de carros simultâneos (default: 3)
 * - theme: "brand" | "evening"
 * - background: "white" | "none" (default: "white")
 *
 * Piso = borda superior do footer (y=0). Tudo nasce no piso e cresce pra cima.
 */
export default function FooterSkyline({
  height = 90,
  speed = 20000,
  density = "medium",
  cars = 3,
  theme = "brand",
  background = "white",
}) {
  const root = useRef(null);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    el.style.setProperty("--scene-h", `${height}px`);
    el.style.setProperty("--speed", `${speed}ms`);
  }, [height, speed]);

  const densNum = useMemo(
    () => (density === "high" ? 1 : density === "low" ? 0.5 : 0.7),
    [density]
  );

  // plano dos carros (direção + variações)
  const carPlan = useMemo(() => {
    const dirs = ["ltr", "rtl"];
    const stops = ["stop1", "stop2", "stop3"];
    return Array.from({ length: cars }).map((_, i) => ({
      id: i,
      dir: dirs[Math.floor(Math.random() * dirs.length)],
      stop: stops[Math.floor(Math.random() * stops.length)],
      dur: speed * (0.75 + Math.random() * 0.5),
      delay: Math.floor(Math.random() * speed * 0.6),
      color: i % 3, // 0..2
    }));
  }, [cars, speed]);

  return (
    <div ref={root} className={`${s.wrap} ${s[theme]}`} aria-hidden="true">
      <div className={s.backdrop} />

      {/* viewBox “para cima” com piso no 0 */}
      <svg className={s.svg} viewBox="0 -90 1200 90" preserveAspectRatio="none">
        <g transform="translate(0,0) scale(1,-1)">
          {/* ======= fundo: prédios simples e identificados ======= */}
          <BackgroundBuildings x={0} />
          <BackgroundBuildings x={600} />
          <BackgroundBuildings x={1200} />

          {/* ======= vegetação (mini) ======= */}
          <Greenery x={0} dens={densNum} />
          <Greenery x={600} dens={densNum} />
          <Greenery x={1200} dens={densNum} />

          {/* ======= carros no piso ======= */}
          <g className={s.front}>
            {carPlan.map((c) => (
              <Car
                key={c.id}
                dir={c.dir}
                stop={c.stop}
                dur={c.dur}
                delay={c.delay}
                colorVar={c.color}
              />
            ))}
          </g>
        </g>
      </svg>
    </div>
  );
}

/* ==================== PEÇAS ==================== */

/** Prédios retangulares minimalistas + ícone central (clinic/hospital/pharmacy). */
function BackgroundBuildings({ x = 0 }) {
  return (
    <g transform={`translate(${x},0)`}>
      <Building x={70}  w={40} h={26} type="clinic" />
      <Building x={150} w={44} h={30} type="hospital" />
      <Building x={230} w={38} h={24} type="pharmacy" />
      <Building x={300} w={48} h={32} type="clinic" />
      <Building x={380} w={42} h={28} type="hospital" />
      <Building x={452} w={38} h={24} type="pharmacy" />
    </g>
  );
}

function Building({ x, w, h, type = "clinic" }) {
  const y = 0;         // piso
  const rx = 6;        // cantinho arredondado menor
  const iconX = x + w / 2;
  const iconY = y + h - 10;

  const fillClass =
    type === "clinic" ? "bClinic" : type === "hospital" ? "bHospital" : "bPharmacy";

  return (
    <g className={s[fillClass]}>
      {/* base */}
      <rect x={x - 1.5} y={y} width={w + 3} height="4" rx="2" className={s.bBase} />
      {/* corpo */}
      <rect x={x} y={y + 4} width={w} height={h - 4} rx={rx} className={s.bBody} />
      {/* ícone */}
      <g className={s.bIcon}>
        {type === "clinic" && (
          <>
            <rect x={iconX - 8} y={iconY - 8} width="16" height="16" rx="5" />
            <g stroke="#fff" strokeWidth="2.6" strokeLinecap="round">
              <line x1={iconX} y1={iconY - 5} x2={iconX} y2={iconY + 5} />
              <line x1={iconX - 5} y1={iconY} x2={iconX + 5} y2={iconY} />
            </g>
          </>
        )}
        {type === "hospital" && (
          <>
            <rect x={iconX - 8} y={iconY - 8} width="16" height="16" rx="5" />
            <text
              x={iconX}
              y={iconY + 4}
              textAnchor="middle"
              fontSize="10.5"
              fontWeight="700"
              fill="#fff"
            >
              H
            </text>
          </>
        )}
        {type === "pharmacy" && (
          <>
            <rect x={iconX - 8} y={iconY - 8} width="16" height="16" rx="5" />
            <g>
              <rect x={iconX - 6} y={iconY - 3} width="12" height="6" rx="3" fill="#fff" />
              <rect x={iconX - 2} y={iconY - 3} width="6" height="6" rx="3" fill="rgba(0,0,0,.18)" />
            </g>
          </>
        )}
      </g>
    </g>
  );
}

/** Vegetação (mini). */
function Greenery({ x = 0, dens = 0.7 }) {
  const trees = [110, 190, 270, 350, 430].map((v) => v + x);
  const bushesAll = [140, 220, 300, 380, 460].map((v) => v + x);
  const bushCount = Math.round(bushesAll.length * dens);

  return (
    <g>
      {trees.map((tx, i) => (
        <TreeRound key={`t${x}-${i}`} x={tx} />
      ))}
      {Array.from({ length: bushCount }).map((_, i) => (
        <Bush key={`b${x}-${i}`} x={bushesAll[i]} />
      ))}
    </g>
  );
}

function TreeRound({ x }) {
  const y = 0;
  return (
    <g>
      <rect x={x - 1.2} y={y} width="2.4" height="9" rx="1.2" className={s.trunk} />
      <circle cx={x} cy={y + 14} r="7.5" className={s.tree} />
      <circle cx={x - 5} cy={y + 13} r="5.5" className={s.treeSoft} />
      <circle cx={x + 5.5} cy={y + 12} r="4.8" className={s.treeSoft2} />
    </g>
  );
}
function Bush({ x }) {
  const y = 0;
  return (
    <g className={s.bush}>
      <circle cx={x - 3.5} cy={y + 7.5} r="4" />
      <circle cx={x + 2} cy={y + 7.5} r="4.5" />
      <circle cx={x + 7.5} cy={y + 7.5} r="4" />
    </g>
  );
}

/** Carro (mini) com paradas e direção. */
function Car({ dir = "ltr", stop = "stop1", dur = 20000, delay = 0, colorVar = 0 }) {
  const y = 0;
  const cls = `${s.car} ${s[dir]} ${s[stop]} ${s[`c${colorVar}`]}`;
  const style = { animationDuration: `${dur}ms`, animationDelay: `${delay}ms` };

  return (
    <g className={cls} style={style}>
      <rect x="-11" y={y + 4.5} width="22" height="6.5" rx="3.25" />
      <rect x="-8"  y={y + 9.5} width="14" height="5.5" rx="2.75" />
      <circle cx="-6" cy={y + 3.2} r="2.2" />
      <circle cx="6"  cy={y + 3.2} r="2.2" />
      <rect x="-9.5" y={y + 5.2} width="6.5" height="3.2" rx="1.6" fill="#fff" opacity=".9" />
    </g>
  );
}
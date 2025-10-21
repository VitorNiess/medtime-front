import { useEffect, useMemo, useRef, useState } from "react";
import styles from "./isometricClinic.module.css";

/**
 * IsometricClinic
 * Props:
 * - variant: "clinic" | "pharmacy" | "lab" | "minimal" | "crowd" | "interior" | "warning"
 * - theme: "day" | "evening" (default: "day")
 * - width: number | string (default: 520)
 * - background: "none" | "softShapes" (default: "none")
 * - floatingIcons: boolean (default: true)
 * - people: "none" | "few" | "standard" | "crowd" (default: "standard")
 * - peopleCount: number (override fino do total de carinhas)
 * - decorative: boolean (default: true) → aria-hidden
 */
export default function IsometricClinic({
  variant = "clinic",
  theme = "day",
  width = 520,
  background = "none",
  floatingIcons = true,
  people = "standard",
  peopleCount,
  decorative = true,
}) {
  const wrapRef = useRef(null);
  const [reduce, setReduce] = useState(false);

  const vec = useRef({ x: 0, y: 0 });
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduce(mq.matches);
    const cb = (e) => setReduce(e.matches);
    mq.addEventListener?.("change", cb);
    return () => mq.removeEventListener?.("change", cb);
  }, []);

  useEffect(() => {
    if (reduce) return;
    const el = wrapRef.current;
    if (!el) return;

    let raf = 0;
    const onMove = (e) => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const rect = el.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const nx = clamp((e.clientX - cx) / (rect.width / 2), -1, 1);
        const ny = clamp((e.clientY - cy) / (rect.height / 2), -1, 1);
        vec.current = { x: nx, y: ny };
        applyTransforms(el, vec.current);
      });
    };

    window.addEventListener("mousemove", onMove);
    applyTransforms(el, vec.current);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMove);
    };
  }, [reduce]);

  const cfg = useMemo(() => getVariantConfig(variant, theme), [variant, theme]);
  const vb = { w: 600, h: 360 };

  const peoplePlan = useMemo(() => {
    // calcula quantidade padrão por variant
    const presets = {
      minimal: 2,
      clinic: 2,
      pharmacy: 2,
      lab: 2,
      crowd: 6,
      interior: 5,
      warning: 0, // por padrão, sem pessoas na variação de aviso/404
    };
    const base = presets[variant] ?? 2;
    const mult = people === "few" ? 0.6 : people === "crowd" ? 1.8 : 1; // none tratado abaixo
    let total = Math.round(base * mult);
    if (people === "none") total = 0;
    if (typeof peopleCount === "number") total = peopleCount;
    return Math.max(0, total);
  }, [variant, people, peopleCount]);

  return (
    <div
      ref={wrapRef}
      className={styles.wrap}
      style={{ width: typeof width === "number" ? `${width}px` : width }}
      aria-hidden={decorative ? "true" : undefined}
    >
      <svg className={styles.svg} viewBox={`0 0 ${vb.w} ${vb.h}`} focusable="false">
        {/* opcional: shapes de fundo bem suaves */}
        {background === "softShapes" && (
          <SoftBackground cfg={cfg} vb={vb} />
        )}

        {/* Cena */}
        {variant === "interior" ? (
          <InteriorScene cfg={cfg} vb={vb} people={peoplePlan} />
        ) : (
          <FacadeScene
            cfg={cfg}
            vb={vb}
            variant={variant}
            floatingIcons={floatingIcons && !reduce}
            people={peoplePlan}
          />
        )}
      </svg>
    </div>
  );
}

/* =================== CENAS =================== */

function FacadeScene({ cfg, vb, variant, floatingIcons, people }) {
  return (
    <>
      {/* sombra do prédio (no fundo) */}
      <ellipse cx="300" cy="300" rx="200" ry="22" fill="rgba(0,0,0,.08)" data-parallax="1" />

      {/* bloco principal */}
      <g data-parallax="2">
        {/* base */}
        <polygon
          points="160,250 300,190 460,250 320,310"
          fill={cfg.base}
          stroke={cfg.stroke}
          strokeWidth="2"
        />
        {/* paredes */}
        <polygon
          points="160,250 160,200 300,140 300,190"
          fill={cfg.leftWall}
          stroke={cfg.stroke}
          strokeWidth="2"
        />
        <polygon
          points="300,190 300,140 460,200 460,250"
          fill={cfg.rightWall}
          stroke={cfg.stroke}
          strokeWidth="2"
        />
        {/* telhado */}
        <polygon
          points="160,200 300,140 460,200 320,260"
          fill={cfg.roof}
          stroke={cfg.stroke}
          strokeWidth="2"
        />
      </g>

      {/* porta + degraus */}
      <g data-parallax="3">
        <rect x="260" y="215" width="40" height="60" rx="6" fill={cfg.door} />
        <rect x="252" y="275" width="56" height="8" rx="4" fill={cfg.step} />
        <rect x="246" y="283" width="68" height="8" rx="4" fill={cfg.step} />
      </g>

      {/* menos janelas quando minimal; mais quando crowd */}
      <g data-parallax="3">
        {windowsForVariant(variant, cfg).map((w, i) => (
          <Window key={i} {...w} />
        ))}
      </g>

      {/* placa */}
      <g data-parallax="4">
        <Sign
          x={300}
          y={150}
          fill={cfg.signBg}
          stroke={cfg.stroke}
          icon={
            variant === "pharmacy"
              ? "pill"
              : variant === "lab"
              ? "flask"
              : variant === "warning"
              ? "warning"
              : "cross"
          }
        />
      </g>

      {/* pessoas nas janelas */}
      <g data-parallax="5">
        {facesForVariant(variant, people).map((p, i) => (
          <FaceWithEyes key={i} cx={p.cx} cy={p.cy} theme={cfg} small={p.small} />
        ))}
      </g>

      {/* ícones flutuantes */}
      {floatingIcons && (
        <g>
          {variant === "warning" ? (
            <>
              <FloatingIcon kind="warning" x={520} y={96} color={cfg.iconWarn} delay={0} amp={10} period={5200} />
              <FloatingIcon kind="exclaim" x={110} y={128} color={cfg.iconWarnSoft} delay={800} amp={9} period={5800} />
            </>
          ) : (
            <>
              <FloatingIcon kind="heart" x={120} y={120} color={cfg.icon1} delay={0} amp={10} period={5200} />
              <FloatingIcon kind="calendar" x={520} y={100} color={cfg.icon2} delay={700} amp={12} period={6000} />
              <FloatingIcon kind={variant === "lab" ? "microscope" : "pill"} x={520} y={240} color={cfg.icon3} delay={1200} amp={9} period={5600} />
            </>
          )}
        </g>
      )}
    </>
  );
}

function InteriorScene({ cfg, vb, people }) {
  // sala de espera simples: piso, parede, recepção, cadeiras e pessoas
  return (
    <>
      {/* piso */}
      <rect x="60" y="220" width="480" height="80" rx="12" fill="rgba(0,0,0,.05)" data-parallax="1" />
      {/* parede */}
      <rect x="40" y="80" width="520" height="140" rx="12" fill={cfg.wall} stroke={cfg.stroke} strokeWidth="2" data-parallax="2" />
      {/* logotipo/placa na parede */}
      <g data-parallax="3">
        <Sign x={180} y={120} fill={cfg.signBg} stroke={cfg.stroke} icon="cross" />
      </g>
      {/* balcão recepção */}
      <g data-parallax="3">
        <rect x="320" y="150" width="180" height="60" rx="10" fill={cfg.counter} stroke={cfg.stroke} strokeWidth="2" />
        {/* recepcionista */}
        <FaceWithEyes cx={380} cy={150} theme={cfg} />
      </g>
      {/* fileira de cadeiras */}
      <g data-parallax="4">
        {[0, 1, 2, 3].map((i) => (
          <Chair key={i} x={80 + i * 52} y={200} color={cfg.chair} stroke={cfg.stroke} />
        ))}
      </g>
      {/* pessoas sentadas (até 'people') */}
      <g data-parallax="5">
        {Array.from({ length: people }).slice(0, 4).map((_, i) => (
          <FaceWithEyes key={i} cx={80 + i * 52} cy={190} theme={cfg} small />
        ))}
      </g>
      {/* ícones flutuantes mais discretos */}
      <g>
        <FloatingIcon kind="calendar" x={520} y={90} color={cfg.icon2} delay={300} amp={8} period={6000} />
        <FloatingIcon kind="heart" x={100} y={90} color={cfg.icon1} delay={800} amp={7} period={5600} />
      </g>
    </>
  );
}

/* =============== PARTES REUTILIZÁVEIS =============== */

function SoftBackground({ cfg, vb }) {
  return (
    <g data-parallax="0.5" opacity=".14">
      <defs>
        <linearGradient id="bgGrad2" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={cfg.bgStart} />
          <stop offset="100%" stopColor={cfg.bgEnd} />
        </linearGradient>
      </defs>
      <rect x="0" y="0" width={vb.w} height={vb.h} fill="url(#bgGrad2)" />
      <circle cx="520" cy="44" r="120" fill={cfg.bgAccent} />
      <circle cx="80" cy="320" r="140" fill={cfg.bgAccent2} />
    </g>
  );
}

function Window({ x, y, w, h, c, s }) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx="4" fill={c} stroke={s} strokeWidth="1.5" />
      <rect x={x + 4} y={y + 4} width={w - 8} height={h - 8} rx="3" fill="white" opacity="0.5" />
    </g>
  );
}

function Sign({ x, y, fill, stroke, icon = "cross" }) {
  return (
    <g>
      <rect
        x={x - 22}
        y={y - 22}
        width="44"
        height="44"
        rx="10"
        fill={fill}
        stroke={stroke}
        strokeWidth="2"
      />
      {icon === "cross" && (
        <g stroke="white" strokeWidth="4" strokeLinecap="round">
          <line x1={x} y1={y - 10} x2={x} y2={y + 10} />
          <line x1={x - 10} y1={y} x2={x + 10} y2={y} />
        </g>
      )}
      {icon === "pill" && (
        <g>
          <rect x={x - 12} y={y - 6} width="24" height="12" rx="6" fill="white" />
          <rect x={x - 2} y={y - 6} width="12" height="12" rx="6" fill="rgba(0,0,0,.12)" />
        </g>
      )}
      {icon === "flask" && (
        <g stroke="white" strokeWidth="3" strokeLinecap="round" fill="none">
          <path d={`M ${x - 8},${y - 8} L ${x + 8},${y - 8}`} />
          <path d={`M ${x - 4},${y - 8} L ${x - 4},${y + 6} q 0 6 4 6 q 4 0 4 -6 L ${x + 4},${y - 8}`} />
        </g>
      )}
      {icon === "warning" && (
        <g>
          {/* triângulo de aviso */}
          <polygon
            points={`${x},${y - 11} ${x - 12},${y + 10} ${x + 12},${y + 10}`}
            fill="white"
            opacity="0.95"
          />
          {/* exclamação */}
          <rect x={x - 1.8} y={y - 2} width="3.6" height="8" rx="1.5" fill={fill} />
          <circle cx={x} cy={y + 7} r="2.2" fill={fill} />
        </g>
      )}
    </g>
  );
}

function FaceWithEyes({ cx, cy, theme, small = false }) {
  const headR = small ? 10 : 12;
  const eyeR = small ? 3.4 : 4;
  const pupilR = small ? 1.6 : 1.9;

  return (
    <g data-eyes="true">
      <circle cx={cx} cy={cy} r={headR} fill={theme.face} />
      <circle cx={cx - 4} cy={cy - 2} r={eyeR} fill="#fff" />
      <circle cx={cx + 4} cy={cy - 2} r={eyeR} fill="#fff" />
      <circle data-pupil="left" cx={cx - 4} cy={cy - 2} r={pupilR} fill={theme.pupil} />
      <circle data-pupil="right" cx={cx + 4} cy={cy - 2} r={pupilR} fill={theme.pupil} />
    </g>
  );
}

function Chair({ x, y, color, stroke }) {
  return (
    <g>
      <rect x={x - 14} y={y - 10} width="28" height="18" rx="4" fill={color} stroke={stroke} strokeWidth="2" />
      <rect x={x - 12} y={y + 8} width="24" height="6" rx="3" fill={color} stroke={stroke} strokeWidth="2" />
    </g>
  );
}

function FloatingIcon({ kind, x, y, color, delay = 0, amp = 10, period = 6000 }) {
  const style = {
    transformOrigin: `${x}px ${y}px`,
    animationDelay: `${delay}ms`,
    "--amp": `${amp}px`,
    "--period": `${period}ms`,
  };

  const icon = (() => {
    switch (kind) {
      case "calendar":
        return (
          <g fill={color}>
            <rect x={x - 14} y={y - 12} width="28" height="24" rx="6" />
            <rect x={x - 10} y={y - 4} width="20" height="2.5" rx="1.25" fill="white" />
            <rect x={x - 10} y={y + 2} width="16" height="2.5" rx="1.25" fill="white" opacity=".9" />
          </g>
        );
      case "pill":
        return (
          <g>
            <rect x={x - 14} y={y - 6} width="28" height="12" rx="6" fill={color} />
            <rect x={x - 2} y={y - 6} width="14" height="12" rx="6" fill="white" opacity=".9" />
          </g>
        );
      case "microscope":
        return (
          <g stroke={color} strokeWidth="2.5" fill="none" strokeLinecap="round">
            <path d={`M ${x - 8} ${y - 8} l 8 8`} />
            <path d={`M ${x - 2} ${y + 6} q 8 0 12 -6`} />
            <circle cx={x + 10} cy={y + 6} r="3" fill={color} />
          </g>
        );
      case "warning":
        return (
          <g>
            <polygon
              points={`${x},${y - 14} ${x - 14},${y + 12} ${x + 14},${y + 12}`}
              fill={color}
              opacity="0.95"
            />
            <rect x={x - 2.4} y={y - 2} width="4.8" height="9" rx="2" fill="white" />
            <circle cx={x} cy={y + 9} r="2.6" fill="white" />
          </g>
        );
      case "exclaim":
        return (
          <g>
            <rect x={x - 3} y={y - 12} width="6" height="18" rx="3" fill={color} />
            <circle cx={x} cy={y + 10} r="3" fill={color} />
          </g>
        );
      case "heart":
      default:
        return (
          <path
            d={`M ${x} ${y}
               c 0 -8, 12 -8, 12 0
               c 0 8, -12 14, -12 18
               c 0 -4, -12 -10, -12 -18
               c 0 -8, 12 -8, 12 0z`}
            fill={color}
          />
        );
    }
  })();

  return (
    <g className={styles.float} style={style}>
      {icon}
    </g>
  );
}

/* =============== HELPERS & CONFIG =============== */

function clamp(v, a, b) {
  return Math.max(a, Math.min(b, v));
}

function applyTransforms(rootEl, vec) {
  const { x, y } = vec;

  // Parallax
  rootEl.querySelectorAll("[data-parallax]").forEach((g) => {
    const depth = Number(g.getAttribute("data-parallax")) || 1;
    const tX = (x * depth * 2).toFixed(2);
    const tY = (y * depth * 2).toFixed(2);
    g.style.transform = `translate(${tX}px, ${tY}px)`;
  });

  // Pupilas
  rootEl.querySelectorAll("[data-pupil]").forEach((p) => {
    const max = 5.5;
    const tX = (x * max).toFixed(2);
    const tY = (y * max).toFixed(2);
    p.style.transform = `translate(${tX}px, ${tY}px)`;
  });
}

function getVariantConfig(variant, theme) {
  const primary = cssVar("--color-primary", "#2E7D6D");
  const support = cssVar("--color-support", "#A8D5BA");
  const accent = cssVar("--color-accent", "#D18292");
  const text = cssVar("--color-text", "#333333");

  // cores de aviso (amber)
  const warn = {
    amber: "#F0B429",
    amberDeep: "#D79500",
    amberSoft: "#F8D07A",
  };

  const day = {
    bgStart: "#ffffff",
    bgEnd: support,
    bgAccent: primary,
    bgAccent2: accent,
    base: "#f3faf6",
    roof: "#e9f5ef",
    leftWall: "#e6f1ec",
    rightWall: "#eef7f2",
    door: primary,
    step: "rgba(0,0,0,.06)",
    window: "#cfeae0",
    signBg: primary,
    stroke: "rgba(0,0,0,.12)",
    face: "#fff",
    pupil: text,
    wall: "#f7fbf9",
    counter: "#ffffff",
    chair: "#e8f3ee",
    icon1: primary,
    icon2: support,
    icon3: accent,
    // warning extras (default nulos; preenchidos no variant warning)
    iconWarn: warn.amberDeep,
    iconWarnSoft: warn.amber,
  };
  const evening = {
    ...day,
    bgStart: "#fefcf9",
    bgEnd: "#3A7CA5",
    roof: "#e6eef6",
    leftWall: "#e9f1fb",
    rightWall: "#eef5ff",
    window: "#d9e8ff",
    wall: "#f3f7ff",
    chair: "#e9effa",
  };
  const base = theme === "evening" ? evening : day;

  if (variant === "pharmacy") {
    return { ...base, signBg: accent, icon1: accent, icon2: primary, icon3: support };
  }
  if (variant === "lab") {
    return { ...base, signBg: "#3A7CA5", icon1: "#3A7CA5", icon2: support, icon3: accent };
  }
  if (variant === "warning") {
    return {
      ...base,
      // dar um leve tom amarelado ao fundo para diferenciar na 404
      bgEnd: "#fff7e1",
      base: "#fffaf0",
      leftWall: "#fff6e0",
      rightWall: "#fffaf0",
      roof: "#fff3d1",
      window: "#ffe9b3",
      signBg: warn.amberDeep,
      iconWarn: warn.amberDeep,
      iconWarnSoft: warn.amber,
    };
  }
  // minimal/crowd usam as cores da clínica
  return base;
}

function cssVar(name, fallback) {
  if (typeof window === "undefined") return fallback;
  const v = getComputedStyle(document.documentElement).getPropertyValue(name)?.trim();
  return v || fallback;
}

function windowsForVariant(variant, cfg) {
  // posições base
  const base = [
    { x: 185, y: 205, w: 34, h: 20, c: cfg.window, s: cfg.stroke },
    { x: 225, y: 188, w: 34, h: 20, c: cfg.window, s: cfg.stroke },
    { x: 365, y: 205, w: 34, h: 20, c: cfg.window, s: cfg.stroke },
    { x: 405, y: 188, w: 34, h: 20, c: cfg.window, s: cfg.stroke },
  ];
  if (variant === "minimal") return base.slice(0, 2);
  if (variant === "crowd") {
    return base.concat([
      { x: 205, y: 225, w: 30, h: 18, c: cfg.window, s: cfg.stroke },
      { x: 385, y: 225, w: 30, h: 18, c: cfg.window, s: cfg.stroke },
    ]);
  }
  if (variant === "warning") {
    return base.slice(0, 2);
  }
  return base;
}

function facesForVariant(variant, total) {
  const spotsBase = [
    { cx: 225, cy: 186 },
    { cx: 405, cy: 186 },
    { cx: 205, cy: 224, small: true },
    { cx: 385, cy: 224, small: true },
    { cx: 245, cy: 206, small: true },
    { cx: 365, cy: 206, small: true },
  ];
  let spots = spotsBase;
  if (variant === "minimal") spots = spotsBase.slice(0, 2);
  if (variant === "crowd") spots = spotsBase;
  if (variant === "warning") spots = [];
  // corta/ajusta ao total
  return spots.slice(0, total);
}
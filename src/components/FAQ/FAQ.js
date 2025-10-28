import React from "react";
import { IoIosArrowDown, IoIosArrowUp } from "react-icons/io";
import t from "../../styles/primitives/typography.module.css";
import s from "./faq.module.css";
import surface from "../../styles/base/surfaces.module.css";

/**
 * FAQ expansível
 * Props:
 * - items: Array<{ q: string, a: string }>
 * - title?: string
 * - id?: string
 * - theme?: "default" | "staff"  // "default" = verde; "staff" = azul
 */
export default function FAQ({
  items = [],
  title = "Perguntas frequentes",
  id = "faq",
  theme = "default",
}) {
  const rootClass = `${s.faq} ${theme === "staff" ? s.staff : ""}`;

  return (
    <section className={rootClass} aria-labelledby={`${id}-title`}>
      <h2 id={`${id}-title`} className={t.titleSm}>{title}</h2>

      <div className={s.list}>
        {items.map(({ q, a }, i) => (
          <details className={`${theme === "staff" ? surface.surfaceStaff : surface.surface} ${s.item}`} key={i}>
            <summary className={s.summary}>
              <span className={s.question}>{q}</span>

              <span className={s.iconWrap} aria-hidden="true">
                <IoIosArrowDown className={`${s.icon} ${s.iconDown}`} />
                <IoIosArrowUp className={`${s.icon} ${s.iconUp}`} />
              </span>
            </summary>

            <div className={s.answer}>
              <p>{a}</p>
            </div>
          </details>
        ))}
      </div>
    </section>
  );
}
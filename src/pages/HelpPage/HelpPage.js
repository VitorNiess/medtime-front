import React, { useMemo, useState, useCallback } from "react";

// Estilos do design system
import typey from "../../styles/primitives/typography.module.css";
import btn from "../../styles/primitives/buttons.module.css";
import utils from "../../styles/base/utilities.module.css";
import f from "../../styles/primitives/forms.module.css";

// CSS local
import s from "./helpPage.module.css";

// ====== MOCK DE CONTEÚDOS (adicione/edite aqui)
const helpSections = [
  {
    id: "conta",
    title: "Conta e Perfil",
    items: [
      {
        id: "editar-perfil",
        question: "Como edito meu perfil?",
        answer: `
Abra **Menu → Meu Perfil** e toque em **Editar** (ícone de engrenagem).
Você pode alterar nome, e-mail, telefone e preferências de contato.
        `,
      },
      {
        id: "notificacoes",
        question: "Não estou recebendo notificações",
        answer: `
Verifique se as notificações do app estão **permitidas** no seu sistema.
Em seguida, abra **Configurações → Notificações** e confirme se **WhatsApp** e **E-mail** estão habilitados.
        `,
      },
    ],
  },
  {
    id: "consultas",
    title: "Consultas",
    items: [
      {
        id: "marcar-consulta",
        question: "Como marcar uma consulta?",
        answer: `
Use a busca por **médicos** ou **clínicas**. No resultado, toque em **Agendar** para ver horários disponíveis.
        `,
      },
      {
        id: "cancelar-consulta",
        question: "Como cancelar uma consulta?",
        answer: `
Abra **Minhas Consultas**, selecione a consulta e toque em **Cancelar**.
Cancelamentos com menos de 24h podem estar sujeitos à política da clínica.
        `,
      },
    ],
  },
  {
    id: "pagamentos",
    title: "Pagamentos e Reembolsos",
    items: [
      {
        id: "formas-pagamento",
        question: "Quais formas de pagamento são aceitas?",
        answer: `
Aceitamos **cartão**, **PIX** e, quando disponível, pagamento **no local**.
Consulte a página da clínica para confirmar.
        `,
      },
      {
        id: "reembolso",
        question: "Como solicitar reembolso?",
        answer: `
Entre em **Minhas Consultas → Detalhes** e clique em **Solicitar reembolso** quando elegível.
        `,
      },
    ],
  },
];

// ====== Helpers
function norm(str = "") {
  return str.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();
}

export default function HelpPage() {
  const [query, setQuery] = useState("");
  const [openId, setOpenId] = useState(null); // controla um acordeão aberto por vez (simples)

  const flatIndex = useMemo(() => {
    // cria índice plano para busca e ancora
    const list = [];
    for (const sec of helpSections) {
      for (const it of sec.items) {
        list.push({
          sectionId: sec.id,
          sectionTitle: sec.title,
          id: it.id,
          question: it.question,
          answer: it.answer,
        });
      }
    }
    return list;
  }, []);

  const filtered = useMemo(() => {
    const q = norm(query.trim());
    if (!q) return helpSections;

    // filtra mantendo a estrutura por seções
    return helpSections
      .map((sec) => {
        const items = sec.items.filter((it) => {
          const hay = norm(`${sec.title} ${it.question} ${it.answer}`);
          return hay.includes(q);
        });
        return { ...sec, items };
      })
      .filter((sec) => sec.items.length > 0);
  }, [query]);

  const handleToggle = useCallback((id) => {
    setOpenId((curr) => (curr === id ? null : id));
  }, []);

  return (
    <main className={`container ${utils.withNavOffsetPadding} ${s.page}`}>
      {/* Cabeçalho */}
      <header className={s.header}>
        <h1 className={typey.titleLg}>Central de Ajuda</h1>
        <p className={typey.bodyMd}>
          Busque por um assunto ou navegue pelas categorias abaixo.
        </p>

        {/* Busca simples */}
        <div className={s.searchBar}>
          <div className={f.inputWrap}>
            <input
              type="search"
              className={f.input}
              placeholder="Ex.: cancelar consulta, editar perfil, reembolso…"
              aria-label="Pesquisar na ajuda"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <button
            type="button"
            className={`${btn.btn} ${btn.btnSecondary}`}
            onClick={() => setQuery("")}
            disabled={!query}
          >
            Limpar
          </button>
        </div>
      </header>

      <div className={s.layout}>
        {/* Índice (TOC) */}
        <nav className={s.toc} aria-label="Categorias">
          <strong className={typey.captionSm}>Categorias</strong>
          <ul className={s.tocList}>
            {helpSections.map((sec) => (
              <li key={sec.id}>
                <a className={s.tocLink} href={`#${sec.id}`}>{sec.title}</a>
              </li>
            ))}
          </ul>

          {/* Ajuda adicional */}
          <div className={s.helpBox}>
            <p className={typey.bodySm}>
              Não encontrou o que procurava?
            </p>
            <div className={s.helpActions}>
              <a href="/support" className={`${btn.btn} ${btn.btnPrimary}`}>Falar com suporte</a>
              <a href="/faq" className={`${btn.btn} ${btn.btnGhost || ""}`}>FAQ completo</a>
            </div>
          </div>
        </nav>

        {/* Conteúdo */}
        <section className={s.content} aria-live="polite">
          {filtered.length === 0 ? (
            <p className={typey.bodyMd}>Nenhum resultado para “{query}”.</p>
          ) : (
            filtered.map((sec) => (
              <article key={sec.id} id={sec.id} className={s.section}>
                <h2 className={typey.titleMd}>{sec.title}</h2>
                <ul className={s.accordion} role="list">
                  {sec.items.map((it) => {
                    const isOpen = openId === it.id;
                    return (
                      <li key={it.id} className={`${s.item} ${isOpen ? s.open : ""}`}>
                        <button
                          className={s.itemHeader}
                          aria-expanded={isOpen}
                          onClick={() => handleToggle(it.id)}
                        >
                          <span className={s.q}>{it.question}</span>
                          <span className={s.chev} aria-hidden>▾</span>
                        </button>
                        {isOpen && (
                          <div className={s.itemPanel}>
                            {/* simples: renderiza markdown leve (negrito/linhas) via <p> */}
                            {it.answer.trim().split("\n").map((line, i) => (
                              <p key={i} className={typey.bodySm}>{line}</p>
                            ))}
                          </div>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </article>
            ))
          )}
        </section>
      </div>
    </main>
  );
}

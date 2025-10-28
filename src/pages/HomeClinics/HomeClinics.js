import { useState } from 'react';

// Assets
import img from '../../assets/imgMainHomeClin.png';

// Genéricos
import t from '../../styles/primitives/typography.module.css';
import u from '../../styles/base/utilities.module.css';
import btn from '../../styles/primitives/buttons.module.css';

// Forms genéricos
import f from '../../styles/primitives/forms.module.css';
import fx from '../../styles/primitives/form-extras.module.css';

// Ícones
import {
  PiClockBold,
  PiShieldCheckBold,
  PiStethoscopeBold,
  PiChartBarBold,
  PiCalendarCheckBold,
  PiUsersThreeBold,
  PiCurrencyDollarBold,
  PiCaretRightBold,
  PiWhatsappLogoBold,
} from "react-icons/pi";

// Componentes reutilizados
import SearchBar from '../../components/SearchBar/SearchBar';
import FAQ from '../../components/FAQ/FAQ';

// Estilos desta página
import s from './homeclinics.module.css';

function HomeClinics() {
  // busca rápida do painel (paciente/agendamento)
  const [query, setQuery] = useState("");

  const handleSearch = (q) => {
    console.log("Buscar no painel (staff):", q);
  };

  const faqItems = [
    {
      q: "Como conectar o WhatsApp para lembretes automáticos?",
      a: "No painel, acesse Configurações → Integrações → WhatsApp. Siga o passo-a-passo para ativar lembretes e confirmação de presença."
    },
    {
      q: "Consigo bloquear horários da agenda?",
      a: "Sim. Em Agenda, selecione o profissional e clique em “Bloquear horário”. Você pode adicionar uma observação visível à recepção."
    },
    {
      q: "Como emitir relatórios financeiros?",
      a: "Vá em Financeiro → Relatórios. Exporte por período, unidade e convênio (SUS/particular/plano) em CSV ou PDF."
    }
  ];

  return (
    <main className={`${s.home} ${u.withNavOffsetPadding}`}>
      {/* Hero */}
      <div className={`container ${s.content}`}>
        <div className={s.mediaLeft}>
          <img
            src={img}
            alt="Ferramentas para gestão de clínicas"
            className={s.heroImage}
            loading="eager"
            decoding="async"
          />
        </div>

        <div className={s.textRight}>
          <h1 className={`${t.titleLg} ${s.title}`}>
            Organize agendas, reduza faltas e acelere o faturamento
          </h1>

          <p className={`${t.textBase} ${s.subtitle}`}>
            Uma central única para a equipe: confirmações por WhatsApp, triagem de solicitações,
            controle de salas e relatórios financeiros.
          </p>

          <div className={s.ctaRow}>
            <a href="/clinics/agenda" className={`${btn.btn} ${btn.btnPrimary} ${s.cta}`}>
              Ver agenda
            </a>
            <a href="/clinics/relatorios" className={`${btn.btn} ${btn.btnSecondary}`}>
              Relatórios
            </a>
          </div>

          <ul className={s.badges} aria-label="Diferenciais do painel">
            <li className={s.badge}>
              <PiCalendarCheckBold className={s.badgeIcon} aria-hidden="true" />
              <span>Confirmação automática</span>
            </li>
            <li className={s.badge}>
              <PiUsersThreeBold className={s.badgeIcon} aria-hidden="true" />
              <span>Fila & salas em tempo real</span>
            </li>
            <li className={s.badge}>
              <PiCurrencyDollarBold className={s.badgeIcon} aria-hidden="true" />
              <span>Faturamento SUS/particular</span>
            </li>
            <li className={s.badge}>
              <PiShieldCheckBold className={s.badgeIcon} aria-hidden="true" />
              <span>LGPD & auditoria</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Transição do degradê */}
      <div className={s.sectionTransition} aria-hidden="true">
        <svg className={s.wave} viewBox="0 0 1440 120" preserveAspectRatio="none">
          <path d="M0,40 C240,100 480,0 720,40 C960,80 1200,10 1440,40 L1440,120 L0,120 Z" />
        </svg>
      </div>

      {/* Seções extras */}
      <section id="beneficios" className={s.extras}>
        <div className="container">
          {/* KPIs rápidos */}
          <div className={s.kpis}>
            <div className={s.kpiCard}>
              <strong className={s.kpiValue}>-32%</strong>
              <span className={s.kpiLabel}>No-show após confirmação via WhatsApp <PiWhatsappLogoBold aria-hidden="true" /></span>
            </div>
            <div className={s.kpiCard}>
              <strong className={s.kpiValue}>+18%</strong>
              <span className={s.kpiLabel}>Taxa de ocupação das agendas</span>
            </div>
            <div className={s.kpiCard}>
              <strong className={s.kpiValue}>2x</strong>
              <span className={s.kpiLabel}>Mais rápido para fechar o caixa</span>
            </div>
          </div>

          {/* Benefícios (voltados ao staff) */}
          <div className={s.features}>
            <article className={s.featureCard}>
              <div className={s.featureIconWrap}><PiClockBold /></div>
              <h3 className={t.titleSm}>Confirmação & lembretes</h3>
              <p className={s.featureText}>Fluxo automatizado por WhatsApp e SMS para reduzir faltas e atrasos.</p>
            </article>
            <article className={s.featureCard}>
              <div className={s.featureIconWrap}><PiStethoscopeBold /></div>
              <h3 className={t.titleSm}>Gestão de agenda</h3>
              <p className={s.featureText}>Bloqueios, encaixes e salas com visual ao vivo por unidade.</p>
            </article>
            <article className={s.featureCard}>
              <div className={s.featureIconWrap}><PiChartBarBold /></div>
              <h3 className={t.titleSm}>Financeiro & relatórios</h3>
              <p className={s.featureText}>Repasse, convênios e SUS, com exportação CSV/PDF e auditoria.</p>
            </article>
          </div>

          {/* Passo a passo do staff */}
          <div className={s.steps}>
            <div className={s.step}>
              <span className={s.stepNum}>1</span>
              <div>
                <h4 className={s.stepTitle}>Receba solicitações</h4>
                <p className={s.stepText}>Valide dados e direcione para agendas corretas.</p>
              </div>
            </div>

            <PiCaretRightBold className={s.stepArrow} aria-hidden="true" />

            <div className={s.step}>
              <span className={s.stepNum}>2</span>
              <div>
                <h4 className={s.stepTitle}>Confirme & lembre</h4>
                <p className={s.stepText}>Automatize confirmações e reduza no-show.</p>
              </div>
            </div>

            <PiCaretRightBold className={s.stepArrow} aria-hidden="true" />

            <div className={s.step}>
              <span className={s.stepNum}>3</span>
              <div>
                <h4 className={s.stepTitle}>Atenda & registre</h4>
                <p className={s.stepText}>Controle salas, fila e informações essenciais.</p>
              </div>
            </div>

            <PiCaretRightBold className={s.stepArrow} aria-hidden="true" />

            <div className={s.step}>
              <span className={s.stepNum}>4</span>
              <div>
                <h4 className={s.stepTitle}>Fature & analise</h4>
                <p className={s.stepText}>Fechamento diário e relatórios de desempenho.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className={s.discover}>
        <div className="container">
            <h2 id="atalhosTitle" className={t.titleSm}>Atalhos rápidos</h2>

            <div className={s.quickLinks}>
                <a href="/clinics/pros" className={`${btn.btn} ${btn.btnSecondary}`}>Profissionais</a>
                <a href="/clinics/unidades" className={`${btn.btn} ${btn.btnSecondary}`}>Unidades</a>
                <a href="/clinics/relatorios" className={`${btn.btn} ${btn.btnSecondary}`}>Relatórios</a>
                <a href="/clinics/financeiro" className={`${btn.btn} ${btn.btnSecondary}`}>Financeiro</a>
            </div>
        </div>
      </section>

      <section className={s.discover} aria-labelledby="atalhosTitle">
        <div className="container">
          <h2 id="atalhosTitle" className={t.titleSm}>Busque no painel</h2>

          {/* Busca rápida (paciente, prontuário, agendamento) */}
          <SearchBar
            query={query}
            setQuery={setQuery}
            onSubmit={handleSearch}
            placeholder="Buscar paciente, prontuário ou ID do agendamento…"
            ariaLabel="Buscar no painel"
            submitLabel="Buscar"
          />

          <FAQ items={faqItems} title="Perguntas frequentes" id="faq-clinics" theme="staff" />
        </div>
      </section>
    </main>
  );
}

export default HomeClinics;
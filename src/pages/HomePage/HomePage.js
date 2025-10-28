import { useState } from 'react';

// Assets
import img from '../../assets/imgMainHomeVer2.png';
import { PiBuildingsBold } from "react-icons/pi";

// Genéricos
import t from '../../styles/primitives/typography.module.css';
import u from '../../styles/base/utilities.module.css';
import btn from '../../styles/primitives/buttons.module.css';

// Forms genéricos
import fl from '../../styles/primitives/form-layout.module.css';
import f from '../../styles/primitives/forms.module.css';
import fx from '../../styles/primitives/form-extras.module.css';

// Ícones
import {
  PiShieldCheckBold,
  PiClockBold,
  PiStethoscopeBold,
  PiCaretRightBold,
  PiHeartbeatBold,
  PiWhatsappLogoBold,
} from "react-icons/pi";

// Estilos
import s from './homepage.module.css';

// Componentes
import DoctorCard from '../../components/DoctorCard/DoctorCard';
import SearchBar from '../../components/SearchBar/SearchBar';
import FAQ from '../../components/FAQ/FAQ';

function HomePage() {
  const chips = ["Dermatite", "Dor lombar", "Retorno", "Pediatria hoje"]; // Deve vir da API

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedChips, setSelectedChips] = useState(() => new Set());

  const toggleChip = (label) => {
    setSelectedChips(prev => {
      const next = new Set(prev);
      if (next.has(label)) next.delete(label);
      else next.add(label);
      return next;
    });
  };

  const handleSearch = (q) => {
    console.log("buscar por:", q, "chips:", Array.from(selectedChips));
  };

  function scrollToAndFlash(
    targetId,
    {
      selector = '[data-flash-target]',
      className = s.flashFocus,
      duration = 2000,
      threshold = 0.55,
      rootMargin = '0px 0px -10% 0px',
    } = {}
  ) {
    const section = document.getElementById(targetId);
    if (!section) return;

    const prefersReduced = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;

    const target = section.querySelector(selector) || section;

    const applyFlash = () => {
      target.classList.remove(className);
      void target.offsetWidth;
      target.classList.add(className);

      const remove = () => target.classList.remove(className);
      target.addEventListener('animationend', remove, { once: true });
      window.setTimeout(remove, duration + 150);
    };

    const isVisibleEnough = (el) => {
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight || document.documentElement.clientHeight;
      const vw = window.innerWidth || document.documentElement.clientWidth;
      if (r.width === 0 || r.height === 0) return false;

      const vertVisible = Math.max(0, Math.min(r.bottom, vh) - Math.max(r.top, 0));
      const horzVisible = Math.max(0, Math.min(r.right, vw) - Math.max(r.left, 0));
      const areaVisible = vertVisible * horzVisible;
      const area = r.width * r.height;
      return area > 0 && areaVisible / area >= threshold;
    };

    if (isVisibleEnough(section)) {
      applyFlash();
      return;
    }

    let observer;
    let pollId;

    const onVisible = () => {
      if (observer) observer.disconnect();
      if (pollId) cancelAnimationFrame(pollId);
      applyFlash();
    };

    const setupFallbackPoll = () => {
      const poll = () => {
        if (isVisibleEnough(section)) return onVisible();
        pollId = requestAnimationFrame(poll);
      };
      pollId = requestAnimationFrame(poll);
    };

    if ('IntersectionObserver' in window) {
      observer = new IntersectionObserver(
        (entries) => {
          const e = entries[0];
          if (e && e.isIntersecting && e.intersectionRatio >= threshold) {
            onVisible();
          }
        },
        { root: null, rootMargin, threshold }
      );
      observer.observe(section);
    } else {
      setupFallbackPoll();
    }

    section.scrollIntoView({
      behavior: prefersReduced ? 'auto' : 'smooth',
      block: 'start',
      inline: 'nearest',
    });
  }

  const doctors = [
    {
      image: "",
      name: "Dra. Ana Beatriz F.",
      specialization: "Dermatologia",
      crm: "12345",
      clinic: "Clínica Vida • Centro",
      badges: [
        { type: "telemedicina" },
        { type: "preco", value: "R$ 220" },
        { type: "rampa" }
      ],
      nextSlot: new Date()
    },
    {
      image: "",
      name: "Dr. Marcos S.",
      specialization: "Ortopedia",
      crm: "99887",
      clinic: "OrtoPlus • Savassi",
      badges: [
        { type: "sus" },
        { type: "rampa" },
        { type: "libras" },
        { type: "infantil" }
      ],
      nextSlot: new Date(Date.now() + 24 * 60 * 60 * 1000 + 9 * 60 * 60 * 1000 + 10 * 60 * 1000)
    },
    {
      image: "",
      name: "Dra. Júlia R.",
      specialization: "Pediatria",
      crm: "55661",
      clinic: "Santa Maria • Funcionários",
      badges: [
        { type: "telemedicina" },
        { type: "preco", value: "R$ 180" },
        { type: "libras" },
        { type: "infantil" }
      ],
      nextSlot: (() => {
        const d = new Date();
        d.setHours(18, 0, 0, 0);
        return d;
      })()
    }
  ];

  const faqItems = [
    {
      q: "Como funciona para consultas pelo SUS?",
      a: "Você pode buscar por unidades que atendem SUS e seguir a triagem guiada. Em alguns casos é necessário encaminhamento da sua unidade de referência."
    },
    {
      q: "Meus dados estão protegidos?",
      a: "Sim. Utilizamos práticas alinhadas à LGPD e criptografia em trânsito. Você controla lembretes por e-mail/WhatsApp."
    },
    {
      q: "Posso cancelar ou remarcar?",
      a: "Sim. Até X horas antes do horário marcado, sem custo. Após esse prazo, verifique a política do profissional."
    }
  ];

  return (
    <main className={`${s.home} ${u.withNavOffsetPadding}`}>
      {/* Hero */}
      <div className={`container ${s.content}`}>
        <div className={s.left}>
          <h1 className={`${t.titleLg} ${s.title}`}>
            Agende consultas médicas de forma rápida e prática
          </h1>

          <p className={`${t.textBase} ${s.subtitle}`}>
            Encontre médicos, especializações e unidades em segundos.
          </p>

          <a href="#beneficios" className={`${btn.btn} ${btn.btnPrimary} ${s.cta}`}>
            Agendar agora
          </a>

          <ul className={s.badges} aria-label="Diferenciais do MedTime">
            <li className={s.badge}>
              <PiClockBold className={s.badgeIcon} aria-hidden="true" />
              <span>Agendamento em minutos</span>
            </li>
            <li className={s.badge}>
              <PiShieldCheckBold className={s.badgeIcon} aria-hidden="true" />
              <span>Dados protegidos</span>
            </li>
            <li className={s.badge}>
              <PiStethoscopeBold className={s.badgeIcon} aria-hidden="true" />
              <span>Rede com várias especialidades</span>
            </li>
            <li className={s.badge}>
              <PiHeartbeatBold className={s.badgeIcon} aria-hidden="true" />
              <span>CRM verificado</span>
            </li>
          </ul>
        </div>

        <div className={s.right}>
          <img
            src={img}
            alt="Ilustração médica"
            className={s.heroImage}
            loading="eager"
            decoding="async"
          />
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
          {/* Benefícios */}
          <div className={s.features}>
            <article className={s.featureCard}>
              <div className={s.featureIconWrap}><PiClockBold /></div>
              <h3 className={t.titleSm}>Rápido</h3>
              <p className={s.featureText}>Compare horários e confirme seu atendimento em poucos cliques.</p>
            </article>
            <article className={s.featureCard}>
              <div className={s.featureIconWrap}><PiShieldCheckBold /></div>
              <h3 className={t.titleSm}>Seguro</h3>
              <p className={s.featureText}>Segurança de ponta para proteger suas informações e histórico.</p>
            </article>
            <article className={s.featureCard}>
              <div className={s.featureIconWrap}><PiStethoscopeBold /></div>
              <h3 className={t.titleSm}>Completo</h3>
              <p className={s.featureText}>Médicos, especialidades e unidades em uma única plataforma.</p>
            </article>
          </div>

          {/* Passo a passo */}
          <div className={s.steps}>
            <div className={s.step}>
              <span className={s.stepNum}>1</span>
              <div>
                <h4 className={s.stepTitle}>Busque</h4>
                <p className={s.stepText}>Digite especialidade, médico ou unidade mais próxima.</p>
              </div>
            </div>

            <PiCaretRightBold className={s.stepArrow} aria-hidden="true" />

            <div className={s.step}>
              <span className={s.stepNum}>2</span>
              <div>
                <h4 className={s.stepTitle}>Escolha</h4>
                <p className={s.stepText}>Veja horários disponíveis e selecione o melhor para você.</p>
              </div>
            </div>

            <PiCaretRightBold className={s.stepArrow} aria-hidden="true" />

            <div className={s.step}>
              <span className={s.stepNum}>3</span>
              <div>
                <h4 className={s.stepTitle}>Confirme</h4>
                <p className={s.stepText}>Finalize o agendamento e receba as informações por e-mail.</p>
              </div>
            </div>

            <PiCaretRightBold className={s.stepArrow} aria-hidden="true" />

            <div className={s.step}>
              <span className={s.stepNum}>4</span>
              <div>
                <h4 className={s.stepTitle}>Lembrete</h4>
                <p className={s.stepText}>
                  Ative lembretes no <strong>WhatsApp</strong> para não perder sua consulta <PiWhatsappLogoBold aria-hidden="true" style={{ verticalAlign: 'text-bottom' }} />.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ======= Descoberta ======= */}
      <section className={s.discover} aria-labelledby="descobertaTitle">
        <div className="container">
          <h2 id="descobertaTitle" className={t.titleSm}>Descobrir</h2>

          {/* Barra de pesquisa */}
          <SearchBar
            query={searchQuery}
            setQuery={setSearchQuery}
            onSubmit={handleSearch}
          />

          {/* Chips dentro da superfície */}
          <div className={fx.chipSurface}>
            <div className={fx.chipGroup} role="group" aria-label="Condições comuns">
              {chips.map((c) => {
                const isOn = selectedChips.has(c);
                return (
                  <button
                    key={c}
                    type="button"
                    className={`${fx.chip} ${isOn ? 'isOn' : ''}`}
                    aria-pressed={isOn}
                    onClick={() => toggleChip(c)}
                  >
                    {c}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Cards */}
          <div className={s.cards}>
            {doctors.map((d, i) => (
              <DoctorCard
                key={i}
                image={d.image}
                name={d.name}
                specialization={d.specialization}
                crm={d.crm}
                clinic={d.clinic}
                badges={d.badges}
                nextSlot={d.nextSlot}
                onViewDetails={(doc) => console.log('DETALHES:', doc)}
                onBook={(doc) => console.log('AGENDAR:', doc)}
              />
            ))}
          </div>
        </div>

        <div className="container">
          <FAQ items={faqItems} title="Perguntas frequentes" id="faq-home" />
        </div>
      </section>

      {/* ======= Promo Clínicas (staff) ======= */}
      <section id='clinicPromo' className={s.clinicsPromo} aria-labelledby="clinicsPromoTitle">
        <div className="container">
          <div className={s.clinicsPromoCard} data-flash-target>
            <div className={s.clinicsPromoText}>
              <h2 id="clinicsPromoTitle" className={t.titleSm}>MedTime para Clínicas</h2>
              <p className={t.textBase}>
                Organize agendas, reduza faltas e acelere o faturamento — tudo em um único painel para sua equipe.
              </p>
            </div>

            <div className={s.clinicsPromoActions}>
              <a href="/clinics" className={`${btn.btn} ${btn.btnPrimary} ${s.clinicsPromoCta}`}>
                Conhecer painel
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Botão flutuante */}
      <a
        href="#clinicPromo"
        className={`${btn.fab} ${btn.fabBR} ${btn.fabStaff}`}
        onClick={(e) => { e.preventDefault(); scrollToAndFlash('clinicPromo'); }}
      >
        <PiBuildingsBold className={btn.fabIcon}/>
        <span className={btn.fabLabel}>Quer cadastrar uma clínica? Clique aqui!</span>
      </a>
    </main>
  );
}

export default HomePage;
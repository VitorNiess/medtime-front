// Componentes

// Assets
import img from '../../assets/imgMainHomeVer2.png';

// Genéricos
import t from '../../styles/primitives/typography.module.css';
import u from '../../styles/base/utilities.module.css';
import btn from '../../styles/primitives/buttons.module.css';

// Ícones
import { PiShieldCheckBold, PiClockBold, PiStethoscopeBold, PiCaretRightBold } from "react-icons/pi";

// Página (específico)
import s from './homepage.module.css';

function HomePage() {
  return (
    <main className={`${s.home} ${u.withNavOffset}`}>
      {/* Hero */}
      <div className={`container ${s.content}`}>
        <div className={s.left}>
          <h1 className={`${t.titleLg} ${s.title}`}>
            Agende consultas médicas de forma rápida e prática
          </h1>

          <p className={`${t.textBase} ${s.subtitle}`}>
            Encontre médicos, especializações e unidades em segundos.
          </p>

          <div className={s.quickActions} role="search">
            <input
              className={s.searchInput}
              type="text"
              placeholder="Busque por especialidade, médico ou unidade…"
              aria-label="Buscar especialidade, médico ou unidade"
            />
            <button className={`${btn.btn} ${btn.btnPrimary} ${s.cta}`}>
              Agendar agora
            </button>
          </div>

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
          </ul>
        </div>

        <div className={s.right}>
          <img src={img} alt="Ilustração médica" className={s.heroImage} />
        </div>
      </div>

      {/* Seções extras */}
      <section className={s.extras}>
        <div className="container">
          {/* Benefícios */}
          <div className={s.features}>
            <article className={s.featureCard}>
              <div className={s.featureIconWrap}><PiClockBold /></div>
              <h3 className={t.titleXs}>Rápido</h3>
              <p className={s.featureText}>Compare horários e confirme seu atendimento em poucos cliques.</p>
            </article>
            <article className={s.featureCard}>
              <div className={s.featureIconWrap}><PiShieldCheckBold /></div>
              <h3 className={t.titleXs}>Seguro</h3>
              <p className={s.featureText}>Segurança de ponta para proteger suas informações e histórico.</p>
            </article>
            <article className={s.featureCard}>
              <div className={s.featureIconWrap}><PiStethoscopeBold /></div>
              <h3 className={t.titleXs}>Completo</h3>
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
          </div>
        </div>
      </section>
    </main>
  );
}

export default HomePage;
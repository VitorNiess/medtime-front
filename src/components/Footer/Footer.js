import FooterSkyline from '../FooterSkyline/FooterSkyline';

// Constantes
import navItems from '../../constants/navbarLinks';

// Estilos genéricos
import t from '../../styles/primitives/typography.module.css';
import l from '../../styles/primitives/links.module.css';
import u from '../../styles/base/utilities.module.css';

// Estilo específico do Footer
import s from './footer.module.css';

// Assets
import icon from '../../assets/iconeMedTime.png';

// Router
import { Link } from 'react-router-dom';

function Footer() {
  return (
    <footer className={s.footer}>

      <div className={`${u.containerFull} ${s.inner}`}>
        {/* Brand */}
        <div className={s.brand}>
          <img className={s.logo} src={icon} alt="MedTime" />
          <h1 className={`${t.titleLg} ${s.brandName}`}>MedTime</h1>
        </div>

        {/* Conteúdo */}
        <div className={s.content}>
          {/* Links úteis */}
          <div className={s.linksCol}>
            <h2 className={`${t.titleSm} ${s.sectionTitle}`}>Links úteis</h2>
            {navItems.map((link) => (
              <Link
                key={link.id}
                to={link.path}
                className={`${l.linkOnDark} ${s.linkItem}`}
              >
                <span>{link.label}</span>
              </Link>
            ))}
          </div>

          {/* Sobre nós */}
          <div className={s.linksCol}>
            <h2 className={`${t.titleSm} ${s.sectionTitle}`}>Sobre nós</h2>
            <p className={`${t.textBase} ${s.about}`}>
              O MedTime é uma plataforma desenvolvida para facilitar o acesso à saúde.
              Conectamos pacientes a médicos, especialidades e unidades de forma simples,
              rápida e segura, oferecendo praticidade no agendamento de consultas e
              promovendo mais cuidado com o seu bem-estar.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

// Contextos
import { useAuth } from '../../contexts/AuthContext';

// Constantes
import navItems from '../../constants/navbarLinks';

// Assets
import logo from '../../assets/logoMedTimeBg.png';

// Genéricos
import btn from '../../styles/primitives/buttons.module.css';
import nv from '../../styles/primitives/nav.module.css';

// Específico da Navbar
import s from './navbar.module.css';

function Navbar() {
  const [isTop, setIsTop] = useState(true);
  const navigate = useNavigate();

  const { isAuthenticated, logout, busy, user } = useAuth();

  function handleSignUp() {
    navigate('/cadastro');
  }

  function handleSignIn() {
    navigate('/login');
  }

  function handleHome() {
    navigate('/');
  }

  async function handleSignOut() {
    await logout();
    navigate('/');
  }

  useEffect(() => {
    const handleScroll = () => setIsTop(window.scrollY === 0);
    window.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`${s.navbar} ${isTop ? s.transparent : s.solid}`}>
      <img onClick={handleHome} className={s.logo} src={logo} alt="MedTime Logo" />

      <div className={`${nv.navList} ${s.links}`}>
        {navItems.map((link) => (
          <Link key={link.id} to={link.path} className={nv.navItem}>
            {link.icon && <span className={nv.navIcon}>{link.icon}</span>}
            <span>{link.label}</span>
          </Link>
        ))}
      </div>

      <div className={`${nv.navActions} ${s.actions}`}>
        {!isAuthenticated ? (
          <>
            <button className={`${btn.btn} ${btn.btnSecondary}`} onClick={handleSignUp}>
              Cadastre-se
            </button>
            <button className={`${btn.btn} ${btn.btnPrimary}`} onClick={handleSignIn}>
              Entrar
            </button>
          </>
        ) : (
          <>
            {user?.name && <span className={nv.navGreeting}>Olá, {user.name}</span>}
            <button
              className={`${btn.btn} ${btn.btnSecondary}`}
              onClick={handleSignOut}
              disabled={busy}
              aria-label="Sair da conta"
            >
              {busy ? 'Saindo…' : 'Sair'}
            </button>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
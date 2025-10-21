import { useNavigate, useLocation } from 'react-router-dom';

// Ilustração (opcional)
import IsometricClinic from '../../components/IsometricClinic/IsometricClinic';

// Genéricos
import u from '../../styles/base/utilities.module.css';
import t from '../../styles/primitives/typography.module.css';
import btn from '../../styles/primitives/buttons.module.css';

// Específico
import s from './notfound.module.css';

export default function NotFoundPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const goHome = () => navigate('/');
  const goLogin = () => navigate('/login');
  const goSignup = () => navigate('/cadastro');

  return (
    <main className={`${s.page} ${u.withNavOffset}`}>
      <div className={`container ${s.content}`}>
        <section className={s.left}>
          <p className={s.code} aria-hidden="true">404</p>
          <h1 className={`${t.titleLg} ${s.title}`}>Página não encontrada</h1>
          <p className={s.lead}>
            A rota <code className={s.path}>{location.pathname}</code> não existe.
            Você pode voltar para a página inicial, acessar sua conta ou criar uma nova.
          </p>

          <div className={s.actions}>
            <button className={`${btn.btn} ${btn.btnPrimary}`} onClick={goHome}>
              Ir para a Home
            </button>
            <button className={`${btn.btn} ${btn.btnSecondary}`} onClick={goLogin}>
              Entrar
            </button>
            <button className={`${btn.btn} ${btn.btnSecondary}`} onClick={goSignup}>
              Criar conta
            </button>
          </div>
        </section>

        <section className={s.right} aria-hidden="true">
          <IsometricClinic variant="warning" theme="day" width={480} />
        </section>
      </div>
    </main>
  );
}
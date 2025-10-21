import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

/**
 * Impede acesso a rotas públicas (login/signup) quando já autenticado
 */
export default function RedirectIfAuth() {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) return <AuthSplash />;

  if (isAuthenticated) {
    const to = location.state?.from?.pathname || '/';
    return <Navigate to={to} replace />;
  }

  return <Outlet />;
}

function AuthSplash() {
  return (
    <div style={{
      minHeight: '60vh',
      display: 'grid',
      placeItems: 'center',
      color: 'var(--color-text)'
    }}>
      <span>Carregando…</span>
    </div>
  );
}
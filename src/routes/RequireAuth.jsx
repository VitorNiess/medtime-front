import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

/**
 * Protege rotas privadas.
 * - Se ainda carregando a sessão: mostra um splash.
 * - Se autenticado: renderiza a rota.
 * - Se não autenticado: redireciona para /login, preservando a rota pretendida.
 */
export default function RequireAuth() {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) return <AuthSplash />;

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
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
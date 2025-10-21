// src/contexts/AuthContext.jsx
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { apiLogin, apiSignup, apiLogout } from '../services/auth';

const STORAGE_KEY = 'auth:session:v1';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        setUser(parsed.user || null);
        setToken(parsed.token || null);
        console.log('[Auth] sessão restaurada do localStorage:', parsed);
      }
    } catch (e) {
      console.warn('[Auth] erro ao ler sessão do storage:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const saveSession = useCallback((data, remember) => {
    setUser(data.user);
    setToken(data.token);
    if (remember) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  const clearSession = useCallback(() => {
    setUser(null);
    setToken(null);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  /* Login */
  const login = useCallback(async ({ login, senha, remember = true }) => {
    setBusy(true);
    setError(null);
    try {
      const res = await apiLogin({ login, senha, remember });
      saveSession({ user: res.user, token: res.token }, remember);
      return { ok: true, user: res.user };
    } catch (e) {
      console.error('❌ [Auth] erro no login:', e);
      setError('Falha ao entrar. Tente novamente.');
      return { ok: false, error: e };
    } finally {
      setBusy(false);
    }
  }, [saveSession]);

  /* Signup */
  const signup = useCallback(async (payload, remember = true) => {
    setBusy(true);
    setError(null);
    try {
      const res = await apiSignup(payload);
      saveSession({ user: res.user, token: res.token }, remember);
      return { ok: true, user: res.user };
    } catch (e) {
      console.error('❌ [Auth] erro no cadastro:', e);
      setError('Falha ao cadastrar. Tente novamente.');
      return { ok: false, error: e };
    } finally {
      setBusy(false);
    }
  }, [saveSession]);

  /* Logout */
  const logout = useCallback(async () => {
    setBusy(true);
    setError(null);
    try {
      await apiLogout();
    } finally {
      clearSession();
      setBusy(false);
    }
  }, [clearSession]);

  const value = useMemo(() => ({
    user,
    token,
    isAuthenticated: Boolean(user && token),
    loading,
    busy,
    error,

    // actions
    login,
    signup,
    logout,
    setError,
  }), [user, token, loading, busy, error, login, signup, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/* Hook de uso */
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth precisa estar dentro de <AuthProvider>');
  return ctx;
}
// src/contexts/AuthContext.jsx
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { apiLogin, apiSignup, apiLogout } from '../services/auth';

const STORAGE_KEY = 'auth:session:v1';
const SERVICE_TOKEN_KEY = 'auth_token';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    try {
      const rawLocal = localStorage.getItem(STORAGE_KEY);
      const rawSession = !rawLocal ? sessionStorage.getItem(STORAGE_KEY) : null;
      const raw = rawLocal || rawSession;
      if (raw) {
        const parsed = JSON.parse(raw);
        setUser(parsed.user || null);
        setToken(parsed.token || null);
        console.log('[Auth] sessão restaurada do storage:', parsed, rawLocal ? '(local)' : '(session)');
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
    try {
      const json = JSON.stringify(data);
      if (remember) {
        localStorage.setItem(STORAGE_KEY, json);
        sessionStorage.removeItem(STORAGE_KEY);
      } else {
        sessionStorage.setItem(STORAGE_KEY, json);
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch (e) {
      console.warn('[Auth] falha ao salvar sessão:', e);
    }
  }, []);

  const clearSessionStorages = () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      sessionStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(SERVICE_TOKEN_KEY);
      sessionStorage.removeItem(SERVICE_TOKEN_KEY);
    } catch {}
  };

  const clearSession = useCallback(() => {
    setUser(null);
    setToken(null);
    clearSessionStorages();
  }, []);

  /* Login */
  const login = useCallback(
    async ({ login, cpf, senha, remember = true }) => {
      setBusy(true);
      setError(null);
      try {
        const res = await apiLogin({ login: login ?? cpf, cpf, senha, remember });

        if (!res?.success) {
          const message = res?.error || 'Falha ao entrar. Verifique CPF e senha.';
          setError(message);
          return { ok: false, error: message };
        }

        saveSession({ user: res.user, token: res.token }, remember);
        return { ok: true, user: res.user };
      } catch (e) {
        console.error('❌ [Auth] erro no login:', e);
        const message = 'Falha ao entrar. Tente novamente.';
        setError(message);
        return { ok: false, error: message };
      } finally {
        setBusy(false);
      }
    },
    [saveSession]
  );

  /* Signup */
  const signup = useCallback(
    async (payload, remember = true) => {
      setBusy(true);
      setError(null);
      try {
        const res = await apiSignup(payload);

        const loginCpf = payload?.cpf ?? payload?.login;
        const loginSenha = payload?.senha;

        if (loginCpf && loginSenha) {
          const loginRes = await apiLogin({
            cpf: loginCpf,
            senha: loginSenha,
            remember,
          });

          if (loginRes?.success && loginRes?.user && loginRes?.token) {
            saveSession({ user: loginRes.user, token: loginRes.token }, remember);
            return { ok: true, user: loginRes.user };
          }
        }

        if (res?.user && res?.token) {
          saveSession({ user: res.user, token: res.token }, remember);
          return { ok: true, user: res.user };
        }

        const message = 'Falha ao cadastrar. Tente novamente.';
        setError(message);
        return { ok: false, error: message };
      } catch (e) {
        console.error('❌ [Auth] erro no cadastro:', e);
        const message = 'Falha ao cadastrar. Tente novamente.';
        setError(message);
        return { ok: false, error: message };
      } finally {
        setBusy(false);
      }
    },
    [saveSession]
  );

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

  const value = useMemo(
    () => ({
      user,
      token,
      isAuthenticated: Boolean(user && token),
      loading,
      busy,
      error,

      login,
      signup,
      logout,
      setError,
    }),
    [user, token, loading, busy, error, login, signup, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/* Hook de uso */
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth precisa estar dentro de <AuthProvider>');
  return ctx;
}
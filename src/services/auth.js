// src/services/auth.js

const makeToken = () => `fake-${Math.random().toString(36).slice(2)}-${Date.now()}`;

/**
 * Login
 * payload: { login, senha, remember }
 */
export function apiLogin(payload) {
  console.log('🔐 [apiLogin] payload recebido:', payload);

  return new Promise((resolve) => {
    setTimeout(() => {
      const user = {
        id: cryptoRandomId(),
        name: guessNameFromLogin(payload.login),
        login: payload.login,
      };
      const token = makeToken();

      console.log('✅ [apiLogin] sucesso -> gerando token/user fake:', { user, token });
      resolve({ success: true, user, token });
    }, 600);
  });
}

/**
 * Signup
 * payload: { nome, cpf, endereco, telefone, senha }
 */
export function apiSignup(payload) {
  console.log('📝 [apiSignup] payload recebido:', payload);

  return new Promise((resolve) => {
    setTimeout(() => {
      const user = {
        id: cryptoRandomId(),
        name: payload?.nome || 'Usuário',
        login: payload?.cpf || payload?.email || 'sem-login',
      };
      const token = makeToken();

      console.log('🎉 [apiSignup] conta criada (fake):', { user, token });
      resolve({ success: true, user, token });
    }, 800);
  });
}

/**
 * Logout
 */
export function apiLogout() {
  console.log('👋 [apiLogout] efetuando logout (fake)');
  return Promise.resolve({ success: true });
}

function cryptoRandomId() {
  try {
    return crypto.randomUUID();
  } catch {
    return `u_${Math.random().toString(36).slice(2)}${Math.random().toString(36).slice(2)}`;
  }
}

function guessNameFromLogin(login = '') {
  if (!login) return 'Usuário';
  if (login.includes('@')) return login.split('@')[0];
  return `Usuário ${login.toString().slice(-4)}`;
}
// src/services/auth.js
import { URLS } from "../utils/urls";

const STORAGE_KEY = "auth_token";

/** salva o token conforme a escolha "lembrar" */
function saveToken(token, remember) {
  try {
    const store = remember ? window.localStorage : window.sessionStorage;
    store.setItem(STORAGE_KEY, token);
  } catch (e) {
    console.warn("⚠️ [auth] falha ao salvar token:", e);
  }
}

function clearToken() {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
    window.sessionStorage.removeItem(STORAGE_KEY);
  } catch {}
}

export function getAuthToken() {
  try {
    return (
      window.localStorage.getItem(STORAGE_KEY) ||
      window.sessionStorage.getItem(STORAGE_KEY) ||
      null
    );
  } catch {
    return null;
  }
}

export function getAuthHeader() {
  const t = getAuthToken();
  return t ? { Authorization: `Bearer ${t}` } : {};
}

/**
 * Login REAL
 * payload esperado no app: { login? (cpf), cpf?, senha, remember? }
 * Envia para API: { cpf, senha }
 * Normaliza retorno para: { success, user: { name, role }, token }
 */
export async function apiLogin(payload = {}) {
  const cpf = payload.cpf ?? payload.login;
  const senha = payload.senha;

  console.log("🔐 [apiLogin] enviando para API:", {
    url: URLS.LOGIN_PACIENTE,
    cpf: cpf ? `${cpf}`.replace(/\D/g, "") : undefined,
  });

  if (!cpf || !senha) {
    return { success: false, error: "CPF e senha são obrigatórios." };
  }

  try {
    const res = await fetch(URLS.LOGIN_PACIENTE, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cpf: String(cpf), senha: String(senha) }),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      const msg =
        text ||
        `Falha ao autenticar. HTTP ${res.status} ${res.statusText || ""}`.trim();
      return { success: false, error: msg };
    }

    // estrutura esperada:
    // { status: true, data: { token, nome, role } }
    const json = await res.json();

    if (!json?.status) {
      const errMsg =
        json?.message ||
        json?.error ||
        "Credenciais inválidas ou resposta inesperada do servidor.";
      return { success: false, error: errMsg };
    }

    const token = json?.data?.token;
    const name = json?.data?.nome ?? "Usuário";
    const role = json?.data?.role ?? "paciente";

    if (!token) {
      return { success: false, error: "Token ausente na resposta da API." };
    }

    saveToken(token, !!payload.remember);

    const user = {
      name,
      role,
      login: cpf,
    };

    console.log("✅ [apiLogin] autenticado:", { user });
    return { success: true, user, token };
  } catch (e) {
    console.error("❌ [apiLogin] erro de rede:", e);
    return {
      success: false,
      error:
        "Não foi possível conectar ao servidor. Verifique sua internet ou tente novamente.",
    };
  }
}

/**
 * Signup REAL
 * payload esperado: {
 *   nome, cpf, senha, email, endereco, telefone
 * }
 * Envia para API: exatamente o payload acima.
 * Retorno normalizado: { success, user, token: null }
 * (o token será obtido pelo login pós-cadastro no AuthContext)
 */
export async function apiSignup(payload = {}) {
  const required = ["nome", "cpf", "senha", "email", "endereco", "telefone"];
  const missing = required.filter((k) => !payload?.[k]);
  if (missing.length) {
    return {
      success: false,
      error: `Campos obrigatórios ausentes: ${missing.join(", ")}.`,
    };
  }

  try {
    console.log("📝 [apiSignup] enviando para API:", {
      url: URLS.CADASTRO_PACIENTE,
      cpf: `${payload.cpf}`.replace(/\D/g, ""),
      email: payload.email,
    });

    const res = await fetch(URLS.CADASTRO_PACIENTE, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nome: String(payload.nome),
        cpf: String(payload.cpf),
        senha: String(payload.senha),
        email: String(payload.email),
        endereco: String(payload.endereco),
        telefone: String(payload.telefone),
      }),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      const msg =
        text ||
        `Falha ao cadastrar. HTTP ${res.status} ${res.statusText || ""}`.trim();
      return { success: false, error: msg };
    }

    // retorno:
    // {
    //   "id_usuario": 1, "cpf": "...", "nome": "...", "email": "...",
    //   "paciente": { "id_usuario": 1, "endereco": "...", "telefone": "...", "ficha_medica": {...} }
    // }
    const data = await res.json();

    const user = {
      id: data?.id_usuario ?? undefined,
      name: data?.nome ?? "Usuário",
      role: "paciente",
      login: data?.cpf ?? payload.cpf,
      email: data?.email ?? payload.email,
      paciente: data?.paciente ?? null,
    };

    console.log("🎉 [apiSignup] cadastro ok:", { user });

    return { success: true, user, token: null };
  } catch (e) {
    console.error("❌ [apiSignup] erro de rede:", e);
    return {
      success: false,
      error:
        "Não foi possível conectar ao servidor. Verifique sua internet ou tente novamente.",
    };
  }
}

/**
 * Logout
 */
export async function apiLogout() {
  try {
    clearToken();
    console.log("👋 [apiLogout] sessão local encerrada.");
    return { success: true };
  } catch (e) {
    console.warn("⚠️ [apiLogout] falha ao limpar token:", e);
    return { success: false, error: "Falha ao encerrar sessão local." };
  }
}
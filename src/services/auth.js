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
 * payload esperado no app: { login? (cpf), cpf?, senha, remember?, mode? }
 *   mode: 'paciente' | 'funcionario' (default: 'paciente')
 * Envia para API: { cpf, senha }
 * Normaliza retorno para: { success, user: { name, role }, token }
 */
export async function apiLogin(payload = {}) {
  const cpf = payload.cpf ?? payload.login;
  const senha = payload.senha;
  const mode = payload.mode ?? "paciente";
  const isFuncionario = mode === "funcionario";

  const url = isFuncionario ? URLS.LOGIN_FUNCIONARIO : URLS.LOGIN_PACIENTE;

  console.log("🔐 [apiLogin] enviando para API:", {
    url,
    mode,
    cpf: cpf ? `${cpf}`.replace(/\D/g, "") : undefined,
  });

  if (!cpf || !senha) {
    return { success: false, error: "CPF e senha são obrigatórios." };
  }

  try {
    const res = await fetch(url, {
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
    // { status: true, data: { token, nome, role, expiresAt? } }
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
    const role =
      json?.data?.role ?? (isFuncionario ? "funcionario" : "paciente");

    if (!token) {
      return { success: false, error: "Token ausente na resposta da API." };
    }

    saveToken(token, !!payload.remember);

    const user = {
      name,
      role,
      login: cpf,
      // expiresAt: json?.data?.expiresAt ?? null, // se quiser usar depois
    };

    console.log("✅ [apiLogin] autenticado:", { user, mode });
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
 * Signup REAL (paciente ou funcionário)
 * payload esperado:
 *   {
 *     nome, cpf, senha, email, endereco, telefone,
 *     mode?: 'paciente' | 'funcionario',
 *     id_unidade?: number (para funcionário, se houver vínculo com unidade)
 *   }
 *
 * Para paciente:
 *   - Envia para: URLS.CADASTRO_PACIENTE
 *
 * Para funcionário:
 *   - Envia para: URLS.FUNCIONARIOS
 *
 * Em ambos os casos:
 *   - Campos obrigatórios: nome, cpf, senha, email, endereco, telefone
 *   - Se id_unidade vier no payload, é enviado junto.
 *
 * Retorno normalizado: { success, user, token: null }
 * (token é obtido depois via login, no AuthContext)
 */
export async function apiSignup(payload = {}) {
  const mode = payload.mode ?? "paciente";
  const isFuncionario = mode === "funcionario";

  // mesma lista de obrigatórios para paciente e funcionário
  const required = ["nome", "cpf", "senha", "email", "endereco", "telefone"];
  const missing = required.filter((k) => !payload?.[k]);

  if (missing.length) {
    return {
      success: false,
      error: `Campos obrigatórios ausentes: ${missing.join(", ")}.`,
    };
  }

  const url = isFuncionario ? URLS.FUNCIONARIOS : URLS.CADASTRO_PACIENTE;

  try {
    console.log("📝 [apiSignup] enviando para API:", {
      url,
      mode,
      cpf: `${payload.cpf}`.replace(/\D/g, ""),
      email: payload.email,
    });

    // Monta o body com os campos relevantes (iguais para paciente e funcionário)
    const body = {
      nome: String(payload.nome),
      cpf: String(payload.cpf),
      senha: String(payload.senha),
      email: String(payload.email),
      endereco: String(payload.endereco),
      telefone: String(payload.telefone),
    };

    // se vier id_unidade (cadastro de funcionário com unidade), envia também
    if (payload.id_unidade != null) {
      body.id_unidade = payload.id_unidade;
      body.is_admin = false;
    }

    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      const msg =
        text ||
        `Falha ao cadastrar. HTTP ${res.status} ${res.statusText || ""}`.trim();
      return { success: false, error: msg };
    }

    // Exemplo esperado p/ paciente:
    // {
    //   "id_usuario": 1, "cpf": "...", "nome": "...", "email": "...",
    //   "paciente": { "id_usuario": 1, "endereco": "...", "telefone": "...", "ficha_medica": {...} }
    // }
    //
    // Para funcionário, assumimos algo semelhante ou ao menos nome/cpf/email.
    const data = await res.json();

    const role = isFuncionario ? "funcionario" : "paciente";

    const user = {
      id: data?.id_usuario ?? data?.id ?? undefined,
      name: data?.nome ?? payload.nome ?? "Usuário",
      role,
      login: data?.cpf ?? payload.cpf,
      email: data?.email ?? payload.email,
      paciente: !isFuncionario ? data?.paciente ?? null : null,
      funcionario: isFuncionario ? data?.funcionario ?? null : null,
    };

    console.log("🎉 [apiSignup] cadastro ok:", { user, mode });

    // não fazemos login automático aqui (token null)
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
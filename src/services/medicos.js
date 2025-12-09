// src/services/medicos.js
import { URLS } from "../utils/urls";
import { getAuthHeader } from "./auth";

/**
 * Helper para lidar com os formatos:
 *
 * 1) Novo formato (sucesso = objeto direto / array):
 *    - Sucesso: { id_medico, crm, nome, especialidade }
 *    - Erro:    { error: "...", status?: number }
 *
 * 2) Formato antigo:
 *    - Sucesso: { success: true, data: ... }
 *    - Erro:    { success: false, error: "...", status?: number }
 */
function normalizeApiResponse(json, defaultErrorMsg) {
  if (json == null) {
    return { ok: false, error: defaultErrorMsg || "Resposta vazia da API." };
  }

  // Se vier explícito que deu erro (novo formato ou antigo)
  if (typeof json === "object" && "error" in json && json.error) {
    const msg = json.error || defaultErrorMsg || "Falha na operação.";
    return { ok: false, error: msg, status: json.status };
  }

  // Se vier no formato antigo com success === true
  if (json && json.success === true) {
    return { ok: true, data: json.data ?? null };
  }

  // Se vier no formato antigo com success === false
  if (json && json.success === false) {
    const msg = json.error || defaultErrorMsg || "Falha na operação.";
    return { ok: false, error: msg, status: json.status };
  }

  // Caso padrão:
  // - Não tem "error"
  // - Não tem "success"
  // => consideramos sucesso e o próprio json é o "data"
  return { ok: true, data: json };
}

/**
 * Lista todos os médicos.
 * Retorno: Promise<{ ok: boolean, medicos?: any[], error?: string }>
 */
export async function listMedicos() {
  console.log("[medicos.api] listMedicos()");

  try {
    const res = await fetch(URLS.MEDICOS, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeader(),
      },
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      const msg =
        text ||
        `Falha ao listar médicos. HTTP ${res.status} ${res.statusText || ""}`.trim();
      console.error("[medicos.api] listMedicos() erro HTTP:", msg);
      return { ok: false, error: msg };
    }

    const json = await res.json().catch(() => null);
    const normalized = normalizeApiResponse(
      json,
      "Erro ao listar médicos."
    );

    if (!normalized.ok) return normalized;

    let data = normalized.data;

    // Novo backend pode retornar diretamente um array:
    //   [ {id_medico, ...}, ... ]
    // ou algo como { medicos: [...] }
    if (!Array.isArray(data) && json && Array.isArray(json)) {
      data = json;
    }

    if (!Array.isArray(data)) {
      console.warn("[medicos.api] listMedicos() data não é array:", data);
      return {
        ok: false,
        error: "Resposta da API não é uma lista de médicos.",
      };
    }

    return { ok: true, medicos: data };
  } catch (e) {
    console.error("❌ [medicos.api] listMedicos() erro de rede:", e);
    return {
      ok: false,
      error:
        "Não foi possível conectar ao servidor. Verifique sua internet ou tente novamente.",
    };
  }
}

/**
 * Busca médico por ID.
 * Retorno: Promise<{ ok: boolean, medico?: any, error?: string }>
 */
export async function getMedicoById(id) {
  console.log("[medicos.api] getMedicoById()", id);

  try {
    const res = await fetch(URLS.MEDICO(id), {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeader(),
      },
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      const msg =
        text ||
        `Falha ao buscar médico. HTTP ${res.status} ${res.statusText || ""}`.trim();
      console.error("[medicos.api] getMedicoById() erro HTTP:", msg);
      return { ok: false, error: msg };
    }

    const json = await res.json().catch(() => null);
    const normalized = normalizeApiResponse(
      json,
      "Erro ao buscar médico."
    );

    if (!normalized.ok) return normalized;

    // No novo formato, normalized.data será o próprio médico:
    // { id_medico, crm, nome, especialidade }
    return { ok: true, medico: normalized.data };
  } catch (e) {
    console.error("❌ [medicos.api] getMedicoById() erro de rede:", e);
    return {
      ok: false,
      error:
        "Não foi possível conectar ao servidor. Verifique sua internet ou tente novamente.",
    };
  }
}

/**
 * Cria um novo médico.
 * Espera pelo menos: { nome, crm, especialidade }
 *
 * Retorno: Promise<{ ok: boolean, medico?: any, error?: string }>
 */
export async function createMedico(data) {
  console.log("[medicos.api] createMedico()", data);

  try {
    const res = await fetch(URLS.MEDICOS, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeader(),
      },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      const msg =
        text ||
        `Falha ao criar médico. HTTP ${res.status} ${res.statusText || ""}`.trim();
      console.error("[medicos.api] createMedico() erro HTTP:", msg);
      return { ok: false, error: msg };
    }

    const json = await res.json().catch(() => null);
    const normalized = normalizeApiResponse(
      json,
      "Erro ao criar médico."
    );

    if (!normalized.ok) return normalized;

    // Cenário 1 (novo formato):
    //   json = { id_medico, crm, nome, especialidade }
    // -> normalized.data = json (objeto do médico)
    //
    // Cenário 2 (antigo):
    //   json = { success: true, data: { ...medico } }
    // -> normalized.data = { ...medico }
    return { ok: true, medico: normalized.data };
  } catch (e) {
    console.error("❌ [medicos.api] createMedico() erro de rede:", e);
    return {
      ok: false,
      error:
        "Não foi possível conectar ao servidor. Verifique sua internet ou tente novamente.",
    };
  }
}

/**
 * Atualiza um médico existente.
 * patch: campos a atualizar (nome, especialidade, opcionalmente crm)
 *
 * Retorno: Promise<{ ok: boolean, medico?: any, error?: string }>
 */
export async function updateMedico(id, patch) {
  console.log("[medicos.api] updateMedico()", id, patch);

  try {
    const res = await fetch(URLS.MEDICO(id), {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeader(),
      },
      body: JSON.stringify(patch),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      const msg =
        text ||
        `Falha ao atualizar médico. HTTP ${res.status} ${res.statusText || ""}`.trim();
      console.error("[medicos.api] updateMedico() erro HTTP:", msg);
      return { ok: false, error: msg };
    }

    const json = await res.json().catch(() => null);
    const normalized = normalizeApiResponse(
      json,
      "Erro ao atualizar médico."
    );

    if (!normalized.ok) return normalized;

    // Igual ao createMedico: normalized.data é o médico atualizado
    return { ok: true, medico: normalized.data };
  } catch (e) {
    console.error("❌ [medicos.api] updateMedico() erro de rede:", e);
    return {
      ok: false,
      error:
        "Não foi possível conectar ao servidor. Verifique sua internet ou tente novamente.",
    };
  }
}

/**
 * Exclui um médico.
 *
 * Retorno: Promise<{ ok: boolean, error?: string }>
 */
export async function deleteMedico(id) {
  console.log("[medicos.api] deleteMedico()", id);

  try {
    const res = await fetch(URLS.MEDICO(id), {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeader(),
      },
    });

    // Erro de HTTP (404, 500, etc.)
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      const msg =
        text ||
        `Falha ao deletar médico. HTTP ${res.status} ${res.statusText || ""}`.trim();
      console.error("[medicos.api] deleteMedico() erro HTTP:", msg);
      return { ok: false, error: msg };
    }

    // Tenta ler JSON (pode ser vazio, {}, ou com error)
    const json = await res.json().catch(() => null);

    // Se o backend mandar { error: "...", status?: number }
    if (json && typeof json === "object" && "error" in json && json.error) {
      console.error("[medicos.api] deleteMedico() erro de aplicação:", json);
      return {
        ok: false,
        error: json.error || "Erro ao deletar médico.",
        status: json.status,
      };
    }

    // Se chegou aqui, não há campo error -> consideramos sucesso
    return { ok: true };
  } catch (e) {
    console.error("❌ [medicos.api] deleteMedico() erro de rede:", e);
    return {
      ok: false,
      error:
        "Não foi possível conectar ao servidor. Verifique sua internet ou tente novamente.",
    };
  }
}
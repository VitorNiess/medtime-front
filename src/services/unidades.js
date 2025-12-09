// src/services/unidades.js
import { URLS } from "../utils/urls";
import { getAuthHeader } from "./auth";

/**
 * Normaliza resposta da API no formato:
 *   { status: true, data: ... }
 * ou já direto: { ... } / [ ... ]
 */
function extractData(json) {
  if (!json) return null;
  if (Object.prototype.hasOwnProperty.call(json, "data")) {
    return json.data;
  }
  return json;
}

/**
 * Lista todas as unidades.
 * Retorno: Promise<Unidade[]>
 */
export async function listUnidades() {
  console.log("[unidades.api] listUnidades()");

  try {
    const res = await fetch(URLS.UNIDADES, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeader(),
      },
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      console.error(
        "[unidades.api] listUnidades() erro HTTP:",
        res.status,
        res.statusText,
        text
      );
      return [];
    }

    const json = await res.json().catch(() => null);
    const data = extractData(json);

    if (!Array.isArray(data)) {
      console.warn("[unidades.api] listUnidades() resposta não é array:", data);
      return [];
    }

    return data;
  } catch (e) {
    console.error("❌ [unidades.api] listUnidades() erro de rede:", e);
    return [];
  }
}

/**
 * Cria uma nova unidade.
 * data esperado: { nome, endereco, ... }
 * Retorno: Promise<{ ok: boolean, unidade?: any, error?: string }>
 */
export async function createUnidade(data) {
  console.log("[unidades.api] createUnidade()", data);

  try {
    const res = await fetch(URLS.UNIDADES, {
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
        `Falha ao criar unidade. HTTP ${res.status} ${res.statusText || ""}`.trim();
      console.error("[unidades.api] createUnidade() erro HTTP:", msg);
      return { ok: false, error: msg };
    }

    const json = await res.json().catch(() => null);
    const unidade = extractData(json);

    if (!unidade) {
      const msg = "Resposta da API não contém dados da unidade criada.";
      console.warn("[unidades.api] createUnidade()", msg, json);
      return { ok: false, error: msg };
    }

    return { ok: true, unidade };
  } catch (e) {
    console.error("❌ [unidades.api] createUnidade() erro de rede:", e);
    return {
      ok: false,
      error:
        "Não foi possível conectar ao servidor. Verifique sua internet ou tente novamente.",
    };
  }
}

/**
 * Atualiza uma unidade existente.
 * patch: campos a serem atualizados, ex: { nome, endereco }
 * Retorno: Promise<{ ok: boolean, unidade?: any, error?: string }>
 */
export async function updateUnidade(id, patch) {
  console.log("[unidades.api] updateUnidade()", id, patch);

  try {
    const res = await fetch(URLS.UNIDADE(id), {
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
        `Falha ao atualizar unidade. HTTP ${res.status} ${res.statusText || ""}`.trim();
      console.error("[unidades.api] updateUnidade() erro HTTP:", msg);
      return { ok: false, error: msg };
    }

    const json = await res.json().catch(() => null);
    const unidade = extractData(json);

    if (!unidade) {
      const msg = "Resposta da API não contém dados da unidade atualizada.";
      console.warn("[unidades.api] updateUnidade()", msg, json);
      return { ok: false, error: msg };
    }

    return { ok: true, unidade };
  } catch (e) {
    console.error("❌ [unidades.api] updateUnidade() erro de rede:", e);
    return {
      ok: false,
      error:
        "Não foi possível conectar ao servidor. Verifique sua internet ou tente novamente.",
    };
  }
}

/**
 * Exclui uma unidade.
 * Retorno: Promise<{ ok: boolean, error?: string }>
 */
export async function deleteUnidade(id) {
  console.log("[unidades.api] deleteUnidade()", id);

  try {
    const res = await fetch(URLS.UNIDADE(id), {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeader(),
      },
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      const msg =
        text ||
        `Falha ao excluir unidade. HTTP ${res.status} ${res.statusText || ""}`.trim();
      console.error("[unidades.api] deleteUnidade() erro HTTP:", msg);
      return { ok: false, error: msg };
    }

    // se a API não devolver JSON, está tudo bem: consideramos ok
    let json = null;
    try {
      json = await res.json();
    } catch {
      // provavelmente HTTP 204 No Content; ignorar
    }

    if (json && json.status === false) {
      const msg =
        json.message ||
        json.error ||
        "Falha ao excluir unidade (status false na resposta).";
      return { ok: false, error: msg };
    }

    return { ok: true };
  } catch (e) {
    console.error("❌ [unidades.api] deleteUnidade() erro de rede:", e);
    return {
      ok: false,
      error:
        "Não foi possível conectar ao servidor. Verifique sua internet ou tente novamente.",
    };
  }
}

/**
 * Obtém a unidade associada ao funcionário logado.
 * GET URLS.GET_UNIDADE_FUNCIONARIO
 *
 * Retorno esperado da API:
 * {
 *   "id_unidade": 1,
 *   "endereco": "Av. Paulista, 1000 - São Paulo, SP",
 *   "nome": "Hospital Central"
 * }
 *
 * Retorno: Promise<{ ok: boolean, unidade?: any, error?: string }>
 */
export async function getUnidadeFuncionario() {
  console.log("[unidades.api] getUnidadeFuncionario()");

  try {
    const res = await fetch(URLS.GET_UNIDADE_FUNCIONARIO, {
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
        `Falha ao obter unidade do funcionário. HTTP ${res.status} ${res.statusText || ""}`.trim();
      console.error("[unidades.api] getUnidadeFuncionario() erro HTTP:", msg);
      return { ok: false, error: msg };
    }

    const json = await res.json().catch(() => null);
    const data = extractData(json);

    if (!data) {
      const msg = "Resposta da API não contém dados da unidade.";
      console.warn("[unidades.api] getUnidadeFuncionario()", msg, json);
      return { ok: false, error: msg };
    }

    return { ok: true, unidade: data };
  } catch (e) {
    console.error("❌ [unidades.api] getUnidadeFuncionario() erro de rede:", e);
    return {
      ok: false,
      error:
        "Não foi possível conectar ao servidor. Verifique sua internet ou tente novamente.",
    };
  }
}

/**
 * Alias semântico para usar em telas:
 * "minha unidade" do funcionário logado.
 */
export const getMinhaUnidade = getUnidadeFuncionario;

/**
 * Lista médicos de uma unidade específica.
 * GET URLS.LISTAR_MEDICOS_BY_UNIDADE(id)
 *
 * Retorno esperado da API:
 * [
 *   {
 *     "id_medico": 1,
 *     "crm": 12345,
 *     "nome": "Dr. Roberto House",
 *     "especialidade": "Infectologia"
 *   }
 * ]
 *
 * Retorno: Promise<{ ok: boolean, medicos?: any[], error?: string }>
 */
export async function listMedicosByUnidade(id) {
  console.log("[unidades.api] listMedicosByUnidade()", id);

  try {
    const res = await fetch(URLS.LISTAR_MEDICOS_BY_UNIDADE(id), {
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
        `Falha ao listar médicos da unidade. HTTP ${res.status} ${res.statusText || ""}`.trim();
      console.error(
        "[unidades.api] listMedicosByUnidade() erro HTTP:",
        msg
      );
      return { ok: false, error: msg };
    }

    const json = await res.json().catch(() => null);
    const data = extractData(json);

    if (!Array.isArray(data)) {
      const msg = "Resposta da API não é um array de médicos.";
      console.warn("[unidades.api] listMedicosByUnidade()", msg, json);
      return { ok: false, error: msg };
    }

    return { ok: true, medicos: data };
  } catch (e) {
    console.error("❌ [unidades.api] listMedicosByUnidade() erro de rede:", e);
    return {
      ok: false,
      error:
        "Não foi possível conectar ao servidor. Verifique sua internet ou tente novamente.",
    };
  }
}
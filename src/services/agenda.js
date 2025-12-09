// src/services/agenda.js
import { URLS } from "../utils/urls";
import { getAuthHeader } from "./auth";

/**
 * Helper para lidar com os formatos:
 *
 * 1) Novo formato:
 *    - Sucesso: { ...consulta }  (objeto direto)
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

  // Se veio um erro explícito (novo ou antigo)
  if (typeof json === "object" && "error" in json && json.error) {
    const msg = json.error || defaultErrorMsg || "Falha na operação.";
    return { ok: false, error: msg, status: json.status };
  }

  // Formato antigo: success === true
  if (json && json.success === true) {
    return { ok: true, data: json.data ?? null };
  }

  // Formato antigo: success === false
  if (json && json.success === false) {
    const msg = json.error || defaultErrorMsg || "Falha na operação.";
    return { ok: false, error: msg, status: json.status };
  }

  // Caso padrão:
  // - não tem "error"
  // - não tem "success"
  // => consideramos sucesso e json é o próprio data
  return { ok: true, data: json };
}

/**
 * POST /agendas
 * Agendar consulta para o paciente logado (id do paciente vem do token).
 *
 * Espera no mínimo:
 *   { id_calendario_medico }
 *
 * Retorno:
 *   Promise<{ ok: boolean, consulta?: any, error?: string, status?: number }>
 */
export async function agendarConsulta(dados) {
  console.log("[agenda.api] agendarConsulta()", dados);

  // Aceita tanto um número/ string quanto um objeto
  const payload =
    typeof dados === "object"
      ? dados
      : { id_calendario_medico: dados };

  try {
    const res = await fetch(URLS.AGENDAS, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeader(),
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      const msg =
        text ||
        `Falha ao agendar consulta. HTTP ${res.status} ${
          res.statusText || ""
        }`.trim();
      console.error("[agenda.api] agendarConsulta() erro HTTP:", msg);
      return { ok: false, error: msg, status: res.status };
    }

    const json = await res.json().catch(() => null);
    const normalized = normalizeApiResponse(
      json,
      "Erro ao agendar consulta."
    );

    if (!normalized.ok) return normalized;

    // No sucesso, normalized.data é o objeto da consulta
    return { ok: true, consulta: normalized.data };
  } catch (e) {
    console.error("❌ [agenda.api] agendarConsulta() erro de rede:", e);
    return {
      ok: false,
      error:
        "Não foi possível conectar ao servidor. Verifique sua internet ou tente novamente.",
    };
  }
}

/**
 * GET /agendas/{id}
 * Buscar consulta pelo ID.
 *
 * Retorno:
 *   Promise<{ ok: boolean, consulta?: any, error?: string, status?: number }>
 */
export async function getConsultaById(id) {
  console.log("[agenda.api] getConsultaById()", id);

  try {
    const res = await fetch(URLS.AGENDA(id), {
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
        `Falha ao buscar consulta. HTTP ${res.status} ${
          res.statusText || ""
        }`.trim();
      console.error("[agenda.api] getConsultaById() erro HTTP:", msg);
      return { ok: false, error: msg, status: res.status };
    }

    const json = await res.json().catch(() => null);
    const normalized = normalizeApiResponse(
      json,
      "Erro ao buscar consulta."
    );

    if (!normalized.ok) return normalized;

    return { ok: true, consulta: normalized.data };
  } catch (e) {
    console.error("❌ [agenda.api] getConsultaById() erro de rede:", e);
    return {
      ok: false,
      error:
        "Não foi possível conectar ao servidor. Verifique sua internet ou tente novamente.",
    };
  }
}

/**
 * GET /agendas
 * Listar todas as consultas, opcionalmente filtrando por intervalo de datas.
 *
 * dataInicio / dataFim no formato aceito pelo backend (ex: "2025-11-01").
 *
 * Retorno:
 *   Promise<{ ok: boolean, consultas?: any[], error?: string, status?: number }>
 */
export async function listConsultas({ dataInicio, dataFim } = {}) {
  console.log("[agenda.api] listConsultas()", { dataInicio, dataFim });

  const params = new URLSearchParams();

  if (dataInicio) params.append("dataInicio", dataInicio);
  if (dataFim) params.append("dataFim", dataFim);

  const url =
    params.toString().length > 0
      ? `${URLS.AGENDAS}?${params.toString()}`
      : URLS.AGENDAS;

  try {
    const res = await fetch(url, {
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
        `Falha ao listar consultas. HTTP ${res.status} ${
          res.statusText || ""
        }`.trim();
      console.error("[agenda.api] listConsultas() erro HTTP:", msg);
      return { ok: false, error: msg, status: res.status };
    }

    const json = await res.json().catch(() => null);
    const normalized = normalizeApiResponse(
      json,
      "Erro ao listar consultas."
    );

    if (!normalized.ok) return normalized;

    let data = normalized.data;

    // Garantir que é array
    if (!Array.isArray(data) && Array.isArray(json)) {
      data = json;
    }

    if (!Array.isArray(data)) {
      console.warn("[agenda.api] listConsultas() data não é array:", data);
      return {
        ok: false,
        error: "Resposta da API não é uma lista de consultas.",
      };
    }

    return { ok: true, consultas: data };
  } catch (e) {
    console.error("❌ [agenda.api] listConsultas() erro de rede:", e);
    return {
      ok: false,
      error:
        "Não foi possível conectar ao servidor. Verifique sua internet ou tente novamente.",
    };
  }
}

/**
 * GET /agendas/minhas-consultas
 * Listar consultas do paciente logado.
 *
 * Retorno:
 *   Promise<{ ok: boolean, consultas?: any[], error?: string, status?: number }>
 */
export async function listMinhasConsultas() {
  console.log("[agenda.api] listMinhasConsultas()");

  try {
    const res = await fetch(URLS.AGENDAS_MINHAS_CONSULTAS, {
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
        `Falha ao listar minhas consultas. HTTP ${res.status} ${
          res.statusText || ""
        }`.trim();
      console.error("[agenda.api] listMinhasConsultas() erro HTTP:", msg);
      return { ok: false, error: msg, status: res.status };
    }

    const json = await res.json().catch(() => null);
    const normalized = normalizeApiResponse(
      json,
      "Erro ao listar minhas consultas."
    );

    if (!normalized.ok) return normalized;

    let data = normalized.data;

    if (!Array.isArray(data) && Array.isArray(json)) {
      data = json;
    }

    if (!Array.isArray(data)) {
      console.warn(
        "[agenda.api] listMinhasConsultas() data não é array:",
        data
      );
      return {
        ok: false,
        error: "Resposta da API não é uma lista de consultas.",
      };
    }

    return { ok: true, consultas: data };
  } catch (e) {
    console.error(
      "❌ [agenda.api] listMinhasConsultas() erro de rede:",
      e
    );
    return {
      ok: false,
      error:
        "Não foi possível conectar ao servidor. Verifique sua internet ou tente novamente.",
    };
  }
}

/**
 * PATCH /agendas/{id}
 * Atualizar status da consulta.
 *
 * status: string ('agendado', 'cancelado', 'concluido', etc. conforme seu modelo)
 *
 * Retorno:
 *   Promise<{ ok: boolean, consulta?: any, error?: string, status?: number }>
 */
export async function updateStatusConsulta(id, status) {
  console.log("[agenda.api] updateStatusConsulta()", id, status);

  try {
    const res = await fetch(URLS.AGENDA(id), {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeader(),
      },
      body: JSON.stringify({ status }),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      const msg =
        text ||
        `Falha ao atualizar status da consulta. HTTP ${res.status} ${
          res.statusText || ""
        }`.trim();
      console.error("[agenda.api] updateStatusConsulta() erro HTTP:", msg);
      return { ok: false, error: msg, status: res.status };
    }

    const json = await res.json().catch(() => null);
    const normalized = normalizeApiResponse(
      json,
      "Erro ao atualizar status da consulta."
    );

    if (!normalized.ok) return normalized;

    return { ok: true, consulta: normalized.data };
  } catch (e) {
    console.error(
      "❌ [agenda.api] updateStatusConsulta() erro de rede:",
      e
    );
    return {
      ok: false,
      error:
        "Não foi possível conectar ao servidor. Verifique sua internet ou tente novamente.",
    };
  }
}

/**
 * DELETE /agendas/{id}
 * Cancelar/excluir consulta.
 *
 * Retorno:
 *   Promise<{ ok: boolean, error?: string, status?: number }>
 */
export async function cancelarConsulta(id) {
  console.log("[agenda.api] cancelarConsulta()", id);

  try {
    const res = await fetch(URLS.AGENDA(id), {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeader(),
      },
    });

    // Pode ser 204 sem corpo, ou 200/400 com JSON
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      let json = null;
      try {
        json = JSON.parse(text);
      } catch {
        // não era JSON
      }

      if (json && json.error) {
        console.error("[agenda.api] cancelarConsulta() erro API:", json);
        return {
          ok: false,
          error: json.error || "Erro ao cancelar consulta.",
          status: json.status ?? res.status,
        };
      }

      const msg =
        text ||
        `Falha ao cancelar consulta. HTTP ${res.status} ${
          res.statusText || ""
        }`.trim();
      console.error("[agenda.api] cancelarConsulta() erro HTTP:", msg);
      return { ok: false, error: msg, status: res.status };
    }

    // Sucesso: pode não ter corpo (204) ou vir algo como { success: true, data: null }
    let json = null;
    try {
      json = await res.json();
    } catch {
      // sem corpo
    }

    if (json && json.error) {
      console.error("[agenda.api] cancelarConsulta() erro API:", json);
      return {
        ok: false,
        error: json.error || "Erro ao cancelar consulta.",
        status: json.status,
      };
    }

    return { ok: true };
  } catch (e) {
    console.error("❌ [agenda.api] cancelarConsulta() erro de rede:", e);
    return {
      ok: false,
      error:
        "Não foi possível conectar ao servidor. Verifique sua internet ou tente novamente.",
    };
  }
}
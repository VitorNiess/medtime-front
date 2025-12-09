// src/services/calendario.js
import { URLS } from "../utils/urls";

async function jsonFetch(url, options = {}) {
  const finalOptions = {
    method: 'GET',
    // credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  };

  const res = await fetch(url, finalOptions);

  let data = null;
  try {
    data = await res.json();
  } catch (e) {
    // sem corpo JSON, deixa data = null
  }

  // Se HTTP deu erro:
  if (!res.ok) {
    // Se o backend já mandou um objeto de erro, com "error"
    if (data && typeof data === 'object') {
      return data; // ex.: { error: '...', status: 400 }
    }

    // Caso não haja JSON, criamos um objeto de erro genérico
    return {
      error: `Erro HTTP ${res.status}`,
      status: res.status,
    };
  }

  // HTTP ok -> devolve o JSON puro (objeto de sucesso, array, etc.)
  return data;
}

/**
 * Criar um único registro de calendário
 * POST /calendarios
 */
export async function criarCalendario(dados) {
  return jsonFetch(URLS.CALENDARIOS, {
    method: 'POST',
    body: JSON.stringify(dados),
  });
}

/**
 * Gerar horários por período
 * POST /calendarios/gerar-periodo
 */
export async function gerarHorariosPorPeriodo(dados) {
  return jsonFetch(URLS.CALENDARIOS_GERAR_HORARIO, {
    method: 'POST',
    body: JSON.stringify(dados),
  });
}

/**
 * Buscar calendário por ID
 * GET /calendarios/{id}
 */
export async function buscarCalendarioPorId(id) {
  return jsonFetch(URLS.CALENDARIO(id));
}

/**
 * Listar todos
 * GET /calendarios
 */
export async function listarTodosCalendarios() {
  return jsonFetch(URLS.CALENDARIOS);
}

/**
 * Atualizar calendário
 * PUT /calendarios/{id}
 */
export async function atualizarCalendario(id, dados) {
  return jsonFetch(URLS.CALENDARIO(id), {
    method: 'PUT',
    body: JSON.stringify(dados),
  });
}

/**
 * Deletar calendário
 * DELETE /calendarios/{id}
 */
export async function deleteCalendario(id) {
  return jsonFetch(URLS.CALENDARIO(id), {
    method: 'DELETE',
  });
}

/**
 * Listar horários disponíveis
 * GET /calendarios/disponiveis?id_medico=...&id_unidade=...
 */
export async function listarHorariosDisponiveis(id_medico, id_unidade) {
  return jsonFetch(URLS.GET_HORARIOS(id_medico, id_unidade));
}
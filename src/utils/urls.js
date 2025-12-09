// const SERVER_URL = 'https://dominio.com';
const LOCAL_URL = 'http://localhost:3333/api';

const BASE_URL = LOCAL_URL;

export const URLS = {
    // ----------------- Autenticação -----------------
    LOGIN_PACIENTE: `${BASE_URL}/login/paciente`,
    LOGIN_FUNCIONARIO: `${BASE_URL}/login/funcionario`,

    // ----------------- Paciente - Cadastro Público -----------------
    CADASTRO_PACIENTE: `${BASE_URL}/usuarios/pacientes`,

    // ----------------- Unidades -----------------
    // GET/POST: /unidades
    UNIDADES: `${BASE_URL}/unidades`,
    // GET/PUT/DELETE: /unidades/{id}
    UNIDADE: (id) => `${BASE_URL}/unidades/${id}`,
    LISTAR_MEDICOS_BY_UNIDADE: (id) => `${BASE_URL}/unidades/${id}/medicos`,

    // ----------------- Médicos -----------------
    // GET/POST: /medicos
    MEDICOS: `${BASE_URL}/medicos`,
    // GET/PUT/DELETE: /medicos/{id}
    MEDICO: (id) => `${BASE_URL}/medicos/${id}`,

    // ----------------- Agendas (Consultas) -----------------
    // POST (agendar) /agendas  |  GET (listar) /agendas
    AGENDAS: `${BASE_URL}/agendas`,
    // GET: /agendas/minhas-consultas (Paciente)
    AGENDAS_MINHAS_CONSULTAS: `${BASE_URL}/agendas/minhas-consultas`,
    // GET/PATCH/DELETE: /agendas/{id}
    AGENDA: (id) => `${BASE_URL}/agendas/${id}`,

    // ----------------- Calendários -----------------
    // GET/POST: /calendarios
    CALENDARIOS: `${BASE_URL}/calendarios`,
    // GET/PUT/DELETE: /calendarios/{id}
    CALENDARIO: (id) => `${BASE_URL}/calendarios/${id}`,
    CALENDARIOS_GERAR_HORARIO: `${BASE_URL}/calendarios/gerar-periodo`,
    GET_HORARIOS: (id_medico, id_unidade) => `${BASE_URL}/calendarios/disponiveis?id_medico=${id_medico}&id_unidade=${id_unidade}`,

    // ----------------- Funcionários - Área do Usuário -----------------
    // GET/PUT/DELETE: /usuarios/funcionarios/me
    FUNCIONARIO_ME: `${BASE_URL}/usuarios/funcionarios/me`,
    GET_UNIDADE_FUNCIONARIO: `${BASE_URL}/usuarios/funcionarios/me/unidade`,

    // ----------------- Funcionários - Admin -----------------
    // GET/POST: /usuarios/funcionarios
    FUNCIONARIOS: `${BASE_URL}/usuarios/funcionarios`,
    // GET/PUT/DELETE: /usuarios/funcionarios/{id}
    FUNCIONARIO: (id) => `${BASE_URL}/usuarios/funcionarios/${id}`,

    // ----------------- Pacientes - Admin -----------------
    // GET: /usuarios/pacientes  (listagem)
    PACIENTES: `${BASE_URL}/usuarios/pacientes`,
    // GET/PUT/DELETE: /usuarios/pacientes/{id}
    PACIENTE: (id) => `${BASE_URL}/usuarios/pacientes/${id}`,
    // GET/PUT: /usuarios/pacientes/{id}/ficha-medica
    PACIENTE_FICHA_MEDICA: (id) => `${BASE_URL}/usuarios/pacientes/${id}/ficha-medica`,

    // ----------------- Pacientes - Área do Usuário -----------------
    // GET/PUT/DELETE: /usuarios/pacientes/me
    PACIENTE_ME: `${BASE_URL}/usuarios/pacientes/me`,
    // GET/PUT: /usuarios/pacientes/me/ficha-medica
    PACIENTE_ME_FICHA_MEDICA: `${BASE_URL}/usuarios/pacientes/me/ficha-medica`,

    // ----------------- Relatórios -----------------
    // GET: /relatorios/quantidade/especialidades
    RELATORIOS_QTD_ESPECIALIDADES: `${BASE_URL}/relatorios/quantidade/especialidades`,
    // GET: /relatorios/quantidade/unidades
    RELATORIOS_QTD_UNIDADES: `${BASE_URL}/relatorios/quantidade/unidades`,
};
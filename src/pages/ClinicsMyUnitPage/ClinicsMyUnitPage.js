// src/pages/ClinicsMyUnitPage/ClinicsMyUnitPage.jsx
import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';

import {
  getMinhaUnidade,
  updateUnidade,
  listMedicosByUnidade,
} from '../../services/unidades';
import {
  createMedico,
  updateMedico,
  deleteMedico,
} from '../../services/medicos';
import {
  criarCalendario,
  gerarHorariosPorPeriodo,
} from '../../services/calendario';

import u from '../../styles/base/utilities.module.css';
import t from '../../styles/primitives/typography.module.css';
import f from '../../styles/primitives/forms.module.css';
import fl from '../../styles/primitives/form-layout.module.css';
import btn from '../../styles/primitives/buttons.module.css';
import s from './clinics-my-unit.module.css';

import {
  PiStethoscopeBold,
  PiPlusCircle,
  PiPencilSimple,
  PiTrashSimple,
} from 'react-icons/pi';

const DEBUG_CLINICS_UNIT = false;

const UNIT_NAME_MIN = 3;
const UNIT_NAME_MAX = 80;
const UNIT_ADDR_MIN = 5;
const UNIT_ADDR_MAX = 120;

const DOC_NAME_MIN = 3;
const DOC_NAME_MAX = 80;
const DOC_CRM_MIN = 3;
const DOC_CRM_MAX = 20;
const DOC_SPEC_MIN = 3;
const DOC_SPEC_MAX = 60;

// ========================
// Helpers de datas
// ========================

// monta "YYYY-MM-DDTHH:MM:00.000Z"
function buildIsoDateTime(dateStr, timeStr) {
  if (!dateStr || !timeStr) return null;
  return `${dateStr}T${timeStr}:00.000Z`;
}

function ClinicsMyUnitPage() {
  const { user } = useAuth();

  const [unit, setUnit] = useState(null);
  const [doctors, setDoctors] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [savingUnit, setSavingUnit] = useState(false);
  const [savingDoctor, setSavingDoctor] = useState(false);

  // edição da unidade
  const [unitForm, setUnitForm] = useState({ nome: '', endereco: '' });
  const [isEditingUnit, setIsEditingUnit] = useState(false);

  // criação/edição de médico
  const [doctorForm, setDoctorForm] = useState({
    crm: '',
    nome: '',
    especialidade: '',
  });
  const [editingDoctorId, setEditingDoctorId] = useState(null);
  const [isDoctorEditorOpen, setIsDoctorEditorOpen] = useState(false);

  // criação do calendário para o médico
  const [calendarForm, setCalendarForm] = useState({
    dataInicio: '',
    dataFim: '',
    horaInicioDia: '08:00',
    horaFimDia: '18:00',
    tempoConsultaMinutos: 30,
  });

  // ========================
  // Helpers internos
  // ========================
  function getUnitId(u) {
    return u?.id_unidade ?? u?.id;
  }

  function getDoctorId(d) {
    return d?.id_medico ?? d?.id;
  }

  // validações unidade
  const unitNameTrim = unitForm.nome.trim();
  const unitAddrTrim = unitForm.endereco.trim();

  const unitNameValid =
    unitNameTrim.length >= UNIT_NAME_MIN &&
    unitNameTrim.length <= UNIT_NAME_MAX;
  const unitAddrLen = unitAddrTrim.length;
  const unitAddrValid =
    unitAddrLen >= UNIT_ADDR_MIN && unitAddrLen <= UNIT_ADDR_MAX;

  const canSubmitUnit = unitNameValid && unitAddrValid && !savingUnit;

  // validações médico
  const docNameTrim = doctorForm.nome.trim();
  const docCrmTrim = doctorForm.crm.trim();
  const docSpecTrim = doctorForm.especialidade.trim();

  const docNameValid =
    docNameTrim.length >= DOC_NAME_MIN &&
    docNameTrim.length <= DOC_NAME_MAX;
  const docCrmValid =
    docCrmTrim.length >= DOC_CRM_MIN && docCrmTrim.length <= DOC_CRM_MAX;
  const docSpecValid =
    docSpecTrim.length >= DOC_SPEC_MIN &&
    docSpecTrim.length <= DOC_SPEC_MAX;

  const isNewDoctor = editingDoctorId == null;

  // validações calendário (obrigatório só na criação)
  const calDataInicioTrim = calendarForm.dataInicio.trim();
  const calDataFimTrim = calendarForm.dataFim.trim();
  const calHoraInicioTrim = calendarForm.horaInicioDia.trim();
  const calHoraFimTrim = calendarForm.horaFimDia.trim();
  const calTempo = Number(calendarForm.tempoConsultaMinutos) || 0;

  const calendarValidForNew =
    !isNewDoctor ||
    (calDataInicioTrim &&
      calDataFimTrim &&
      calHoraInicioTrim &&
      calHoraFimTrim &&
      calTempo > 0);

  const canSubmitDoctor =
    docNameValid &&
    docCrmValid &&
    docSpecValid &&
    !savingDoctor &&
    !!unit &&
    calendarValidForNew;

  // ========================
  // Carregar unidade + médicos
  // ========================
  useEffect(() => {
    let cancelled = false;

    async function fetchAll() {
      setLoading(true);
      setError(null);

      try {
        const resUnit = await getMinhaUnidade();

        if (DEBUG_CLINICS_UNIT) {
          console.log('[ClinicsMyUnitPage] getMinhaUnidade ->', resUnit);
        }

        if (!resUnit?.ok || !resUnit?.unidade) {
          if (!cancelled) {
            setError(
              resUnit?.error ||
                'Não foi possível carregar a unidade associada a este colaborador.'
            );
          }
          return;
        }

        const uData = resUnit.unidade;
        const medicosInicial =
          resUnit.medicos || resUnit.medicos_da_unidade || [];

        if (cancelled) return;

        setUnit(uData);
        setUnitForm({
          nome: uData.nome || '',
          endereco: uData.endereco || '',
        });

        if (Array.isArray(medicosInicial) && medicosInicial.length > 0) {
          setDoctors(medicosInicial);
        } else {
          const idUnidade = getUnitId(uData);
          if (idUnidade) {
            const resDocs = await listMedicosByUnidade(idUnidade);

            if (DEBUG_CLINICS_UNIT) {
              console.log(
                '[ClinicsMyUnitPage] listMedicosByUnidade ->',
                resDocs
              );
            }

            if (cancelled) return;

            if (resDocs?.error) {
              setError(
                resDocs.error || 'Falha ao carregar médicos da unidade.'
              );
              return;
            }

            const docs = Array.isArray(resDocs)
              ? resDocs
              : Array.isArray(resDocs?.medicos)
              ? resDocs.medicos
              : [];

            if (Array.isArray(docs)) {
              setDoctors(docs);
            }
          }
        }
      } catch (e) {
        console.error('❌ [ClinicsMyUnitPage] erro ao carregar dados:', e);
        if (!cancelled) {
          setError('Erro ao carregar dados da unidade. Tente novamente.');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchAll();
    return () => {
      cancelled = true;
    };
  }, []);

  // ========================
  // Edição da unidade
  // ========================
  function handleUnitChange(e) {
    const { name, value } = e.target;
    setUnitForm((p) => ({ ...p, [name]: value }));
    if (error) setError(null);
  }

  function startEditUnit() {
    if (!unit) return;
    setUnitForm({
      nome: unit.nome || '',
      endereco: unit.endereco || '',
    });
    setIsEditingUnit(true);
  }

  function cancelEditUnit() {
    setIsEditingUnit(false);
    if (unit) {
      setUnitForm({
        nome: unit.nome || '',
        endereco: unit.endereco || '',
      });
    }
  }

  async function handleSubmitUnit(e) {
    e.preventDefault();
    if (!canSubmitUnit || !unit) return;

    const idUnidade = getUnitId(unit);
    if (!idUnidade) return;

    setSavingUnit(true);
    setError(null);

    const payload = {
      nome: unitNameTrim,
      endereco: unitAddrTrim,
    };

    try {
      if (DEBUG_CLINICS_UNIT) {
        console.log('[ClinicsMyUnitPage] updateUnidade payload:', {
          idUnidade,
          payload,
        });
      }

      const res = await updateUnidade(idUnidade, payload);

      if (!res?.ok) {
        setError(res?.error || 'Falha ao atualizar unidade.');
        return;
      }

      const updated = res.unidade || res.data || { ...unit, ...payload };
      setUnit(updated);
      setIsEditingUnit(false);
    } catch (e) {
      console.error('❌ [ClinicsMyUnitPage] erro ao salvar unidade:', e);
      setError('Erro ao salvar unidade. Tente novamente.');
    } finally {
      setSavingUnit(false);
    }
  }

  // ========================
  // Médicos – criação / edição / remoção
  // ========================
  function handleDoctorChange(e) {
    const { name, value } = e.target;
    setDoctorForm((p) => ({ ...p, [name]: value }));
    if (error) setError(null);
  }

  function handleCalendarChange(e) {
    const { name, value } = e.target;
    setCalendarForm((p) => ({ ...p, [name]: value }));
    if (error) setError(null);
  }

  function startCreateDoctor() {
    setEditingDoctorId(null);
    setDoctorForm({
      crm: '',
      nome: '',
      especialidade: '',
    });
    setCalendarForm({
      dataInicio: '',
      dataFim: '',
      horaInicioDia: '08:00',
      horaFimDia: '18:00',
      tempoConsultaMinutos: 30,
    });
    setIsDoctorEditorOpen(true);
  }

  function startEditDoctor(doc) {
    setEditingDoctorId(getDoctorId(doc));
    setDoctorForm({
      crm: String(doc.crm ?? ''),
      nome: doc.nome || '',
      especialidade: doc.especialidade || '',
    });
    setIsDoctorEditorOpen(true);
  }

  function cancelEditDoctor() {
    setEditingDoctorId(null);
    setDoctorForm({
      crm: '',
      nome: '',
      especialidade: '',
    });
    setCalendarForm({
      dataInicio: '',
      dataFim: '',
      horaInicioDia: '08:00',
      horaFimDia: '18:00',
      tempoConsultaMinutos: 30,
    });
    setIsDoctorEditorOpen(false);
  }

  async function handleSubmitDoctor(e) {
    e.preventDefault();
    if (!unit || !canSubmitDoctor) return;

    const idUnidade = getUnitId(unit);
    if (!idUnidade) return;

    setSavingDoctor(true);
    setError(null);

    const payload = {
      crm: docCrmTrim,
      nome: docNameTrim,
      especialidade: docSpecTrim,
    };

    try {
      if (editingDoctorId == null) {
        // ========== CRIAR MÉDICO ==========
        if (DEBUG_CLINICS_UNIT) {
          console.log('[ClinicsMyUnitPage] createMedico payload:', payload);
        }

        const res = await createMedico(payload);

        if (!res?.ok) {
          setError(res?.error || 'Falha ao cadastrar médico.');
          return;
        }

        const created = res.medico;
        if (!created || !created.id_medico) {
          setError('Médico criado, mas resposta inválida do servidor.');
          return;
        }

        setDoctors((prev) => [created, ...prev]);

        // ========== CRIAR CALENDÁRIO BASE ==========
        try {
          // Garantir os campos
          const dia_semana_iso = `${calDataInicioTrim}T00:00:00.000Z`;
          const horario_inicio_iso = buildIsoDateTime(
            calDataInicioTrim,
            calHoraInicioTrim
          );
          const horario_fim_iso = buildIsoDateTime(
            calDataInicioTrim,
            calHoraFimTrim
          );

          const calendarioPayload = {
            id_medico: created.id_medico,
            id_unidade: idUnidade,
            dia_semana: dia_semana_iso,
            horario_inicio: horario_inicio_iso,
            horario_fim: horario_fim_iso,
          };

          if (DEBUG_CLINICS_UNIT) {
            console.log(
              '[ClinicsMyUnitPage] criarCalendario payload:',
              calendarioPayload
            );
          }

          const resCal = await criarCalendario(calendarioPayload);

          // SUCESSO: qualquer resposta que NÃO tenha "error"
          if (resCal && !resCal.error) {
            if (DEBUG_CLINICS_UNIT) {
              console.log(
                '[ClinicsMyUnitPage] criarCalendario sucesso:',
                resCal
              );
            }
          } else {
            console.error(
              '❌ [ClinicsMyUnitPage] erro ao criar calendário base:',
              resCal
            );
            setError(
              resCal?.error ||
                'Médico criado, mas houve erro ao criar o calendário base.'
            );
          }
        } catch (errCal) {
          console.error(
            '❌ [ClinicsMyUnitPage] exceção ao criar calendário base:',
            errCal
          );
          setError(
            'Médico criado, mas ocorreu um erro ao criar o calendário base.'
          );
        }

        // ========== GERAR PERÍODO DA AGENDA ==========
        try {
          const periodoPayload = {
            id_medico: created.id_medico,
            id_unidade: idUnidade,
            dataInicio: calDataInicioTrim,
            dataFim: calDataFimTrim,
            horaInicioDia: calHoraInicioTrim,
            horaFimDia: calHoraFimTrim,
            tempoConsultaMinutos: calTempo,
          };

          if (DEBUG_CLINICS_UNIT) {
            console.log(
              '[ClinicsMyUnitPage] gerarHorariosPorPeriodo payload:',
              periodoPayload
            );
          }

          const resPeriodo = await gerarHorariosPorPeriodo(periodoPayload);

          // gerarHorariosPorPeriodo do backend retorna:
          // { success: true/false, data?, error? }
          if (
            resPeriodo &&
            resPeriodo.success !== false &&
            !resPeriodo.error
          ) {
            if (DEBUG_CLINICS_UNIT) {
              console.log(
                '[ClinicsMyUnitPage] gerarHorariosPorPeriodo sucesso:',
                resPeriodo
              );
            }
          } else {
            console.error(
              '❌ [ClinicsMyUnitPage] erro ao gerar horários por período:',
              resPeriodo
            );
            setError(
              resPeriodo?.error ||
                'Médico criado, mas houve erro ao gerar os horários da agenda.'
            );
          }
        } catch (errPeriodo) {
          console.error(
            '❌ [ClinicsMyUnitPage] exceção ao gerar horários da agenda:',
            errPeriodo
          );
          setError(
            'Médico criado, mas ocorreu um erro ao gerar os horários da agenda.'
          );
        }

        cancelEditDoctor();
      } else {
        // ========== ATUALIZAR MÉDICO ==========
        if (DEBUG_CLINICS_UNIT) {
          console.log('[ClinicsMyUnitPage] updateMedico payload:', {
            id: editingDoctorId,
            payload,
          });
        }

        const res = await updateMedico(editingDoctorId, payload);

        if (!res?.ok) {
          setError(res?.error || 'Falha ao atualizar médico.');
          return;
        }

        const updated = res.medico || {
          ...payload,
          id_medico: editingDoctorId,
        };

        setDoctors((prev) =>
          prev.map((d) =>
            getDoctorId(d) === editingDoctorId ? { ...d, ...updated } : d
          )
        );
        cancelEditDoctor();
      }
    } catch (e) {
      console.error('❌ [ClinicsMyUnitPage] erro ao salvar médico:', e);
      setError('Erro ao salvar médico. Tente novamente.');
    } finally {
      setSavingDoctor(false);
    }
  }

  async function handleDeleteDoctor(doc) {
    const id = getDoctorId(doc);
    if (!id) return;

    const sure = window.confirm(
      `Remover o médico "${doc.nome}" dessa unidade?`
    );
    if (!sure) return;

    try {
      if (DEBUG_CLINICS_UNIT) {
        console.log('[ClinicsMyUnitPage] deleteMedico id:', id);
      }

      const res = await deleteMedico(id);

      if (!res?.ok) {
        alert(res.error || 'Falha ao remover médico.');
        return;
      }

      setDoctors((prev) => prev.filter((d) => getDoctorId(d) !== id));
      if (editingDoctorId === id) cancelEditDoctor();
    } catch (e) {
      console.error('❌ [ClinicsMyUnitPage] erro ao deletar médico:', e);
      alert('Erro ao remover médico. Tente novamente.');
    }
  }

  // ========================
  // Render
  // ========================
  return (
    <main className={`${s.page} ${u.withNavOffsetPadding}`}>
      <div className={`container ${s.pageInner}`}>
        <header className={s.header}>
          <div>
            <h1 className={t.titleLg}>Minha unidade</h1>
            <p className={s.subtitle}>
              Gerencie os dados da unidade e os médicos vinculados a ela.
            </p>
            {user?.name && (
              <p className={s.userInfo}>
                Logado como <strong>{user.name}</strong>
                {user?.role && ` · ${user.role}`}
              </p>
            )}
          </div>
        </header>

        {loading && (
          <p className={s.infoText}>Carregando dados da unidade…</p>
        )}

        {!loading && !unit && (
          <p className={s.infoText}>
            Nenhuma unidade associada a este colaborador foi encontrada.
          </p>
        )}

        {!loading && unit && (
          <>
            {/* Card da unidade */}
            <section className={s.unitSection}>
              <div className={s.unitCard}>
                <div className={s.unitHeader}>
                  <h2 className={t.titleSm}>Dados da unidade</h2>
                  {!isEditingUnit && (
                    <button
                      type="button"
                      className={`${btn.btn} ${btn.btnGhost}`}
                      onClick={startEditUnit}
                    >
                      <PiPencilSimple className={s.unitIcon} />
                      Editar unidade
                    </button>
                  )}
                </div>

                {!isEditingUnit && (
                  <div className={s.unitBody}>
                    <p className={s.unitName}>{unit.nome}</p>
                    <p className={s.unitAddress}>{unit.endereco}</p>
                  </div>
                )}

                {isEditingUnit && (
                  <form
                    className={fl.form}
                    onSubmit={handleSubmitUnit}
                    noValidate
                  >
                    {/* Nome */}
                    <div className={`${fl.group} ${f.float}`}>
                      <div className={f.inputWrap}>
                        <input
                          id="unidadeNome"
                          name="nome"
                          type="text"
                          placeholder=" "
                          className={`${f.input} ${
                            !unitNameValid && unitForm.nome ? f.invalid : ''
                          }`}
                          value={unitForm.nome}
                          onChange={handleUnitChange}
                          required
                          maxLength={UNIT_NAME_MAX}
                        />
                        <label
                          htmlFor="unidadeNome"
                          className={f.labelFloat}
                        >
                          Nome da unidade
                        </label>
                      </div>
                      <div className={fl.msgRow}>
                        {!unitForm.nome && (
                          <span className={fl.hint}>
                            Mínimo {UNIT_NAME_MIN} caracteres.
                          </span>
                        )}
                        {!!unitForm.nome && !unitNameValid && (
                          <span className={fl.warn}>
                            Entre {UNIT_NAME_MIN} e {UNIT_NAME_MAX}{' '}
                            caracteres.
                          </span>
                        )}
                        {!!unitForm.nome && unitNameValid && (
                          <span className={fl.success}>Ok.</span>
                        )}
                        <span className={fl.count}>
                          {unitNameTrim.length}/{UNIT_NAME_MAX}
                        </span>
                      </div>
                    </div>

                    {/* Endereço */}
                    <div className={`${fl.group} ${f.float}`}>
                      <div className={f.inputWrap}>
                        <input
                          id="unidadeEndereco"
                          name="endereco"
                          type="text"
                          placeholder=" "
                          className={`${f.input} ${f.lg} ${
                            !unitAddrValid && unitForm.endereco
                              ? f.invalid
                              : ''
                          }`}
                          value={unitForm.endereco}
                          onChange={handleUnitChange}
                          required
                          maxLength={UNIT_ADDR_MAX}
                        />
                        <label
                          htmlFor="unidadeEndereco"
                          className={f.labelFloat}
                        >
                          Endereço da unidade
                        </label>
                      </div>
                      <div className={fl.msgRow}>
                        {!unitForm.endereco && (
                          <span className={fl.hint}>
                            Ex.: Av. Principal, 1000, Centro
                          </span>
                        )}
                        {!!unitForm.endereco && !unitAddrValid && (
                          <span className={fl.warn}>
                            Entre {UNIT_ADDR_MIN} e {UNIT_ADDR_MAX}{' '}
                            caracteres.
                          </span>
                        )}
                        {!!unitForm.endereco && unitAddrValid && (
                          <span className={fl.success}>Ok.</span>
                        )}
                        <span className={fl.count}>
                          {unitAddrLen}/{UNIT_ADDR_MAX}
                        </span>
                      </div>
                    </div>

                    <div className={s.unitActions}>
                      <button
                        type="button"
                        className={`${btn.btn} ${btn.btnGhost}`}
                        onClick={cancelEditUnit}
                        disabled={savingUnit}
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        className={`${btn.btn} ${btn.btnPrimary}`}
                        disabled={!canSubmitUnit}
                      >
                        {savingUnit ? 'Salvando…' : 'Salvar alterações'}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </section>

            {/* Médicos */}
            <section className={s.doctorsSection}>
              <div className={s.doctorsHeader}>
                <div className={s.doctorsTitle}>
                  <PiStethoscopeBold className={s.doctorsIcon} />
                  <h2 className={t.titleSm}>Médicos da unidade</h2>
                </div>

                <button
                  type="button"
                  className={`${btn.btn} ${btn.btnPrimary}`}
                  onClick={startCreateDoctor}
                >
                  <PiPlusCircle className={s.doctorsIcon} />
                  Novo médico
                </button>
              </div>

              {doctors.length === 0 && (
                <p className={s.infoText}>
                  Nenhum médico cadastrado nesta unidade ainda.
                </p>
              )}

              {doctors.length > 0 && (
                <ul className={s.doctorsList} aria-label="Médicos">
                  {doctors.map((d) => {
                    const id = getDoctorId(d);
                    return (
                      <li key={id} className={s.doctorCard}>
                        <div className={s.doctorInfo}>
                          <p className={s.doctorName}>{d.nome}</p>
                          <p className={s.doctorMeta}>
                            {d.especialidade && (
                              <span>{d.especialidade}</span>
                            )}
                            {d.crm && (
                              <span>
                                CRM <strong>{d.crm}</strong>
                              </span>
                            )}
                          </p>
                        </div>
                        <div className={s.doctorActions}>
                          <button
                            type="button"
                            className={`${btn.btn} ${btn.btnGhost} ${s.iconBtn}`}
                            onClick={() => startEditDoctor(d)}
                            aria-label={`Editar médico ${d.nome}`}
                          >
                            <PiPencilSimple />
                          </button>
                          <button
                            type="button"
                            className={`${btn.btn} ${btn.btnGhost} ${s.iconBtn} ${s.deleteBtn}`}
                            onClick={() => handleDeleteDoctor(d)}
                            aria-label={`Remover médico ${d.nome}`}
                          >
                            <PiTrashSimple />
                          </button>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}

              {isDoctorEditorOpen && (
                <section className={s.doctorEditor}>
                  <h3 className={t.titleSm}>
                    {editingDoctorId == null ? 'Novo médico' : 'Editar médico'}
                  </h3>

                  <form
                    className={fl.formInline}
                    onSubmit={handleSubmitDoctor}
                    noValidate
                  >
                    {/* CRM */}
                    <div className={`${fl.group} ${f.float} ${s.fieldSm}`}>
                      <div className={f.inputWrap}>
                        <input
                          id="doctorCrm"
                          name="crm"
                          type="text"
                          placeholder=" "
                          className={`${f.input} ${
                            !docCrmValid && doctorForm.crm ? f.invalid : ''
                          }`}
                          value={doctorForm.crm}
                          onChange={handleDoctorChange}
                          required
                          maxLength={DOC_CRM_MAX}
                        />
                        <label
                          htmlFor="doctorCrm"
                          className={f.labelFloat}
                        >
                          CRM
                        </label>
                      </div>
                    </div>

                    {/* Nome */}
                    <div className={`${fl.group} ${f.float} ${s.fieldSm}`}>
                      <div className={f.inputWrap}>
                        <input
                          id="doctorNome"
                          name="nome"
                          type="text"
                          placeholder=" "
                          className={`${f.input} ${
                            !docNameValid && doctorForm.nome
                              ? f.invalid
                              : ''
                          }`}
                          value={doctorForm.nome}
                          onChange={handleDoctorChange}
                          required
                          maxLength={DOC_NAME_MAX}
                        />
                        <label
                          htmlFor="doctorNome"
                          className={f.labelFloat}
                        >
                          Nome
                        </label>
                      </div>
                    </div>

                    {/* Especialidade */}
                    <div className={`${fl.group} ${f.float} ${s.fieldMd}`}>
                      <div className={f.inputWrap}>
                        <input
                          id="doctorEspecialidade"
                          name="especialidade"
                          type="text"
                          placeholder=" "
                          className={`${f.input} ${
                            !docSpecValid && doctorForm.especialidade
                              ? f.invalid
                              : ''
                          }`}
                          value={doctorForm.especialidade}
                          onChange={handleDoctorChange}
                          required
                          maxLength={DOC_SPEC_MAX}
                        />
                        <label
                          htmlFor="doctorEspecialidade"
                          className={f.labelFloat}
                        >
                          Especialidade
                        </label>
                      </div>
                    </div>

                    {/* Configuração de calendário - criação */}
                    {editingDoctorId == null && (
                      <>
                        <div className={fl.group}>
                          <h4 className={t.titleXs}>Configuração da agenda</h4>
                          <p className={s.infoText}>
                            Defina período, horários diários e duração das
                            consultas.
                          </p>
                        </div>

                        {/* Data início */}
                        <div className={`${fl.group} ${f.float} ${s.fieldSm}`}>
                          <div className={f.inputWrap}>
                            <input
                              id="calDataInicio"
                              name="dataInicio"
                              type="date"
                              className={f.input}
                              value={calendarForm.dataInicio}
                              onChange={handleCalendarChange}
                              required
                            />
                            <label
                              htmlFor="calDataInicio"
                              className={f.labelFloat}
                            >
                              Data início
                            </label>
                          </div>
                        </div>

                        {/* Data fim */}
                        <div className={`${fl.group} ${f.float} ${s.fieldSm}`}>
                          <div className={f.inputWrap}>
                            <input
                              id="calDataFim"
                              name="dataFim"
                              type="date"
                              className={f.input}
                              value={calendarForm.dataFim}
                              onChange={handleCalendarChange}
                              required
                            />
                            <label
                              htmlFor="calDataFim"
                              className={f.labelFloat}
                            >
                              Data fim
                            </label>
                          </div>
                        </div>

                        {/* Hora início do dia */}
                        <div className={`${fl.group} ${f.float} ${s.fieldSm}`}>
                          <div className={f.inputWrap}>
                            <input
                              id="calHoraInicioDia"
                              name="horaInicioDia"
                              type="time"
                              className={f.input}
                              value={calendarForm.horaInicioDia}
                              onChange={handleCalendarChange}
                              required
                            />
                            <label
                              htmlFor="calHoraInicioDia"
                              className={f.labelFloat}
                            >
                              Início do dia
                            </label>
                          </div>
                        </div>

                        {/* Hora fim do dia */}
                        <div className={`${fl.group} ${f.float} ${s.fieldSm}`}>
                          <div className={f.inputWrap}>
                            <input
                              id="calHoraFimDia"
                              name="horaFimDia"
                              type="time"
                              className={f.input}
                              value={calendarForm.horaFimDia}
                              onChange={handleCalendarChange}
                              required
                            />
                            <label
                              htmlFor="calHoraFimDia"
                              className={f.labelFloat}
                            >
                              Fim do dia
                            </label>
                          </div>
                        </div>

                        {/* Tempo da consulta */}
                        <div className={`${fl.group} ${f.float} ${s.fieldSm}`}>
                          <div className={f.inputWrap}>
                            <input
                              id="calTempoConsultaMinutos"
                              name="tempoConsultaMinutos"
                              type="number"
                              min="5"
                              step="5"
                              className={f.input}
                              value={calendarForm.tempoConsultaMinutos}
                              onChange={handleCalendarChange}
                              required
                            />
                            <label
                              htmlFor="calTempoConsultaMinutos"
                              className={f.labelFloat}
                            >
                              Duração (min)
                            </label>
                          </div>
                        </div>
                      </>
                    )}

                    {error && <span className={fl.error}>{error}</span>}

                    <div className={s.doctorEditorActions}>
                      <button
                        type="button"
                        className={`${btn.btn} ${btn.btnGhost}`}
                        onClick={cancelEditDoctor}
                        disabled={savingDoctor}
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        className={`${btn.btn} ${btn.btnPrimary}`}
                        disabled={!canSubmitDoctor}
                      >
                        {savingDoctor
                          ? editingDoctorId == null
                            ? 'Cadastrando…'
                            : 'Salvando…'
                          : editingDoctorId == null
                          ? 'Cadastrar médico'
                          : 'Salvar alterações'}
                      </button>
                    </div>
                  </form>
                </section>
              )}
            </section>
          </>
        )}
      </div>
    </main>
  );
}

export default ClinicsMyUnitPage;
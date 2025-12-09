import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

import { useAuth } from '../../contexts/AuthContext';
import { createUnidade } from '../../services/unidades';

import IsometricClinic from '../../components/IsometricClinic/IsometricClinic';

import u from '../../styles/base/utilities.module.css';
import t from '../../styles/primitives/typography.module.css';
import f from '../../styles/primitives/forms.module.css';
import fl from '../../styles/primitives/form-layout.module.css';
import btn from '../../styles/primitives/buttons.module.css';
import s from './signup.module.css';

import { onlyDigits, maskCPF, maskPhoneBR, isEmailBasic } from '../../utils/format';
import { PiEye, PiEyeClosed } from "react-icons/pi";

// =======================
// Debug global (ligar/desligar logs)
// =======================
const SIGNUP_DEBUG = true;
const debugLog = (...args) => {
  if (SIGNUP_DEBUG) {
    console.log('[SignUpPage]', ...args);
  }
};

// Constantes (signup)
const NAME_MIN = 3, NAME_MAX = 80;
const ADDR_MIN = 5, ADDR_MAX = 120;
const PWD_MIN = 6, PWD_MAX = 64;
const CPF_MIN = 11, CPF_MAX = 11;
const PHONE_MIN = 11, PHONE_MAX = 11;

export default function SignUpPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { signup, busy, error, setError } = useAuth();

  const [showPass, setShowPass] = useState(false);

  // clinics = funcionário
  const isClinics = location.pathname === '/clinics' || location.pathname.startsWith('/clinics/');
  const mode = isClinics ? 'funcionario' : 'paciente';

  debugLog('init', { pathname: location.pathname, isClinics, mode });

  // passo atual do fluxo (clinics = 2 etapas; paciente = 1 etapa)
  const [step, setStep] = useState(isClinics ? 1 : 2);

  // estado para criação de unidade (etapa 1, clinics)
  const [unitForm, setUnitForm] = useState({
    nome: '',
    endereco: '',
  });
  const [unitBusy, setUnitBusy] = useState(false);
  const [unitError, setUnitError] = useState(null);

  // id da unidade criada (usado no cadastro de funcionário)
  const [unitId, setUnitId] = useState(null);

  // estado do usuário (paciente/funcionário)
  const [form, setForm] = useState({
    nome: '',
    cpf: '',
    endereco: '',
    telefone: '',
    email: '',
    senha: '',
  });

  // === Validações unidade (apenas quando isClinics) ===
  const unitNameTrim = unitForm.nome.trim();
  const unitNameValid = !isClinics || (unitNameTrim.length >= NAME_MIN && unitNameTrim.length <= NAME_MAX);

  const unitAddrTrim = unitForm.endereco.trim();
  const unitAddrLen = unitAddrTrim.length;
  const unitAddrValid = !isClinics || (unitAddrLen >= ADDR_MIN && unitAddrLen <= ADDR_MAX);

  const canSubmitUnit = isClinics ? (unitNameValid && unitAddrValid) : true;

  // === Validações usuário (funcionário/paciente) ===
  const nameTrim = form.nome.trim();
  const nameValid = nameTrim.length >= NAME_MIN && nameTrim.length <= NAME_MAX;

  const cpfDigits = onlyDigits(form.cpf);
  const cpfValid = cpfDigits.length === CPF_MAX;

  const addrTrim = form.endereco.trim();
  const addrLen = addrTrim.length;
  // endereço obrigatório para ambos (coerente com apiSignup)
  const addrValid = addrLen >= ADDR_MIN && addrLen <= ADDR_MAX;

  const phoneDigits = onlyDigits(form.telefone);
  // telefone obrigatório para ambos
  const phoneValid = phoneDigits.length >= PHONE_MIN && phoneDigits.length <= PHONE_MAX;

  const emailValid = isEmailBasic(form.email);
  const pwdValid = form.senha.length >= PWD_MIN && form.senha.length <= PWD_MAX;

  const canSubmitUser =
    nameValid && cpfValid && addrValid && phoneValid && emailValid && pwdValid;

  function handleChange(e) {
    const { name, value } = e.target;

    // campos da unidade (etapa 1, clinics)
    if (name === 'unidadeNome') {
      if (unitError) setUnitError(null);
      setUnitForm((p) => ({ ...p, nome: value }));
      return;
    }

    if (name === 'unidadeEndereco') {
      if (unitError) setUnitError(null);
      setUnitForm((p) => ({ ...p, endereco: value }));
      return;
    }

    // campos do usuário (etapa 2 / paciente normal)
    if (error) setError(null);

    if (name === 'cpf') {
      return setForm((p) => ({ ...p, cpf: onlyDigits(value).slice(0, CPF_MAX) }));
    }

    if (name === 'telefone') {
      return setForm((p) => ({ ...p, telefone: onlyDigits(value).slice(0, PHONE_MAX) }));
    }

    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();

    // === Etapa 1: criação da unidade (apenas clinics) ===
    if (isClinics && step === 1) {
      if (!canSubmitUnit) {
        debugLog('submit unidade bloqueado, validação falhou', {
          unitNameValid,
          unitAddrValid,
        });
        return;
      }

      setUnitBusy(true);
      setUnitError(null);

      const unidadePayload = {
        nome: unitNameTrim,
        endereco: unitAddrTrim,
      };

      debugLog('criando unidade...', unidadePayload);

      try {
        const res = await createUnidade(unidadePayload);

        debugLog('createUnidade resposta bruta', res);

        if (!res.ok) {
          setUnitError(res.error || 'Falha ao criar unidade. Tente novamente.');
          return;
        }

        const created = res.unidade;

        // tenta pegar id em "id" ou "id_unidade"
        const newId = created?.id ?? created?.id_unidade;

        if (!created || typeof newId === 'undefined') {
          console.warn('[SignUpPage] unidade criada, mas sem id conhecido:', created);
          setUnitError('Unidade criada, mas a resposta não retornou um ID válido.');
          return;
        }

        debugLog('unidade criada com sucesso', { created, newId });

        // guarda id da unidade para usar no cadastro do funcionário
        setUnitId(newId);

        // avança para etapa 2
        setStep(2);
      } catch (err) {
        console.error('❌ [SignUpPage] erro ao criar unidade:', err);
        setUnitError('Falha ao criar unidade. Verifique sua conexão e tente novamente.');
      } finally {
        setUnitBusy(false);
      }

      return;
    }

    // === Etapa 2 (clinics) ou fluxo único (paciente) ===
    if (!canSubmitUser) {
      debugLog('submit usuário bloqueado, validação falhou', {
        nameValid,
        cpfValid,
        addrValid,
        phoneValid,
        emailValid,
        pwdValid,
      });
      return;
    }

    const payload = {
      nome: nameTrim,
      cpf: cpfDigits,
      endereco: addrTrim,
      telefone: phoneDigits,
      email: form.email.trim(),
      senha: form.senha,
      mode, // 'paciente' ou 'funcionario'
    };

    // Se for clinics, inclui o vínculo com a unidade + flag is_admin
    if (isClinics && unitId) {
      payload.id_unidade = unitId;
      // a API espera funcionario.is_admin → mandamos explícito
      payload.is_admin = false; // ajuste se quiser criar admin
    }

    debugLog('enviando signup...', { payload });

    const res = await signup(payload, true); // remember = true

    debugLog('signup resposta', res);

    if (res.ok) {
      navigate(isClinics ? '/clinics' : '/'); // volta para home correspondente
    }
  }

  const isStep1Clinics = isClinics && step === 1;
  const isStep2Clinics = isClinics && step === 2;

  return (
    <main className={`${s.page} ${u.withNavOffsetPadding} ${isClinics ? s.staff : ''}`}>
      <div className={`container ${s.content}`}>
        <section className={s.left}>
          <h1 className={`${t.titleLg} ${s.title}`}>
            {isClinics ? 'Crie a conta da clínica' : 'Crie sua conta'}
          </h1>
          <p className={s.lead}>
            Cadastre-se para{' '}
            {isClinics
              ? 'gerenciar sua clínica com eficiência.'
              : 'agendar consultas com praticidade e segurança.'}
          </p>

          <IsometricClinic variant="clinic" theme="day" width={520} isClinics={isClinics} />
        </section>

        <section className={s.card}>
          <header className={s.cardHeader}>
            <h2 className={t.titleSm}>
              {isClinics
                ? (isStep1Clinics ? 'Cadastro da clínica' : 'Cadastro de colaborador')
                : 'Cadastro de usuário'}
            </h2>
            <p className={s.sub}>
              {isClinics
                ? (isStep1Clinics
                    ? 'Etapa 1 de 2 · Informe os dados da unidade.'
                    : 'Etapa 2 de 2 · Informe os dados do responsável/colaborador.')
                : 'Preencha os campos abaixo.'}
            </p>
          </header>

          <form className={fl.form} onSubmit={handleSubmit} noValidate>
            {/* =========================
                ETAPA 1: UNIDADE (clinics)
                ========================= */}
            {isStep1Clinics && (
              <>
                {/* Nome da unidade */}
                <div className={`${fl.group} ${f.float}`}>
                  <div className={f.inputWrap}>
                    <input
                      id="unidadeNome"
                      name="unidadeNome"
                      type="text"
                      placeholder=" "
                      className={`${f.input} ${!unitNameValid && unitForm.nome ? f.invalid : ''}`}
                      value={unitForm.nome}
                      onChange={handleChange}
                      required
                      maxLength={NAME_MAX}
                    />
                    <label htmlFor="unidadeNome" className={f.labelFloat}>
                      Nome da unidade
                    </label>
                  </div>
                  <div className={fl.msgRow}>
                    {!unitForm.nome && (
                      <span className={fl.hint}>Ex.: Hospital Central, Clínica Vida, etc.</span>
                    )}
                    {!!unitForm.nome && !unitNameValid && (
                      <span className={fl.warn}>
                        Entre {NAME_MIN} e {NAME_MAX} caracteres.
                      </span>
                    )}
                    {!!unitForm.nome && unitNameValid && (
                      <span className={fl.success}>Ok.</span>
                    )}
                    <span className={fl.count}>{unitNameTrim.length}/{NAME_MAX}</span>
                  </div>
                </div>

                {/* Endereço da unidade */}
                <div className={`${fl.group} ${f.float}`}>
                  <div className={f.inputWrap}>
                    <input
                      id="unidadeEndereco"
                      name="unidadeEndereco"
                      type="text"
                      placeholder=" "
                      className={`${f.input} ${f.lg} ${!unitAddrValid && unitForm.endereco ? f.invalid : ''}`}
                      value={unitForm.endereco}
                      onChange={handleChange}
                      required
                      maxLength={ADDR_MAX}
                    />
                    <label htmlFor="unidadeEndereco" className={f.labelFloat}>
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
                        Entre {ADDR_MIN} e {ADDR_MAX} caracteres.
                      </span>
                    )}
                    {!!unitForm.endereco && unitAddrValid && (
                      <span className={fl.success}>Ok.</span>
                    )}
                    <span className={fl.count}>{unitAddrLen}/{ADDR_MAX}</span>
                  </div>
                </div>

                {unitError && <span className={fl.error}>{unitError}</span>}

                <div className={fl.actions}>
                  <button
                    type="submit"
                    className={`${btn.btn} ${btn.btnPrimary}`}
                    disabled={unitBusy || !canSubmitUnit}
                  >
                    {unitBusy ? 'Criando unidade…' : 'Continuar'}
                  </button>
                </div>
              </>
            )}

            {/* =========================
                ETAPA 2 (clinics) OU FLUXO ÚNICO (paciente)
                ========================= */}
            {!isStep1Clinics && (
              <>
                {/* Nome */}
                <div className={`${fl.group} ${f.float}`}>
                  <div className={f.inputWrap}>
                    <input
                      id="nome"
                      name="nome"
                      type="text"
                      placeholder=" "
                      className={`${f.input} ${!nameValid && form.nome ? f.invalid : ''}`}
                      value={form.nome}
                      onChange={handleChange}
                      autoComplete="name"
                      required
                      maxLength={NAME_MAX}
                    />
                    <label htmlFor="nome" className={f.labelFloat}>Nome completo</label>
                  </div>
                  <div className={fl.msgRow}>
                    {!form.nome && (
                      <span className={fl.hint}>Mínimo {NAME_MIN} caracteres.</span>
                    )}
                    {!!form.nome && !nameValid && (
                      <span className={fl.warn}>
                        Entre {NAME_MIN} e {NAME_MAX} caracteres.
                      </span>
                    )}
                    {!!form.nome && nameValid && (
                      <span className={fl.success}>Ok.</span>
                    )}
                    <span className={fl.count}>{nameTrim.length}/{NAME_MAX}</span>
                  </div>
                </div>

                {/* CPF */}
                <div className={`${fl.group} ${f.float}`}>
                  <div className={f.inputWrap}>
                    <input
                      id="cpf"
                      name="cpf"
                      type="text"
                      placeholder=" "
                      className={`${f.input} ${!cpfValid && form.cpf ? f.invalid : ''}`}
                      value={maskCPF(form.cpf)}
                      onChange={handleChange}
                      autoComplete="off"
                      required
                    />
                    <label htmlFor="cpf" className={f.labelFloat}>CPF</label>
                  </div>
                  <div className={fl.msgRow}>
                    {!form.cpf && (
                      <span className={fl.hint}>Formato: 000.000.000-00</span>
                    )}
                    {!!form.cpf && !cpfValid && (
                      <span className={fl.warn}>
                        CPF precisa de {CPF_MIN} dígitos.
                      </span>
                    )}
                    {!!form.cpf && cpfValid && (
                      <span className={fl.success}>Ok.</span>
                    )}
                    <span className={fl.count}>{cpfDigits.length}/{CPF_MAX}</span>
                  </div>
                </div>

                {/* Endereço */}
                <div className={`${fl.group} ${f.float}`}>
                  <div className={f.inputWrap}>
                    <input
                      id="endereco"
                      name="endereco"
                      type="text"
                      placeholder=" "
                      className={`${f.input} ${f.lg} ${!addrValid && form.endereco ? f.invalid : ''}`}
                      value={form.endereco}
                      onChange={handleChange}
                      autoComplete="street-address"
                      required
                      maxLength={ADDR_MAX}
                    />
                    <label htmlFor="endereco" className={f.labelFloat}>Endereço</label>
                  </div>
                  <div className={fl.msgRow}>
                    {!form.endereco && (
                      <span className={fl.hint}>
                        Ex.: Rua Exemplo, 123 - Bairro
                      </span>
                    )}
                    {!!form.endereco && !addrValid && (
                      <span className={fl.warn}>
                        Entre {ADDR_MIN} e {ADDR_MAX} caracteres.
                      </span>
                    )}
                    {!!form.endereco && addrValid && (
                      <span className={fl.success}>Ok.</span>
                    )}
                    <span className={fl.count}>{addrLen}/{ADDR_MAX}</span>
                  </div>
                </div>

                {/* Telefone */}
                <div className={`${fl.group} ${f.float}`}>
                  <div className={f.inputWrap}>
                    <input
                      id="telefone"
                      name="telefone"
                      type="tel"
                      placeholder=" "
                      className={`${f.input} ${!phoneValid && form.telefone ? f.invalid : ''}`}
                      value={maskPhoneBR(form.telefone)}
                      onChange={handleChange}
                      autoComplete="tel"
                      required
                    />
                    <label htmlFor="telefone" className={f.labelFloat}>Telefone</label>
                  </div>
                  <div className={fl.msgRow}>
                    {!form.telefone && (
                      <span className={fl.hint}>
                        Formato: (11) 99999-9999
                      </span>
                    )}
                    {!!form.telefone && !phoneValid && (
                      <span className={fl.warn}>
                        Use {PHONE_MAX} dígitos (DDD + número).
                      </span>
                    )}
                    {!!form.telefone && phoneValid && (
                      <span className={fl.success}>Ok.</span>
                    )}
                    <span className={fl.count}>{phoneDigits.length}/{PHONE_MAX}</span>
                  </div>
                </div>

                {/* E-mail */}
                <div className={`${fl.group} ${f.float}`}>
                  <div className={f.inputWrap}>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      placeholder=" "
                      className={`${f.input} ${!emailValid && form.email ? f.invalid : ''}`}
                      value={form.email}
                      onChange={handleChange}
                      autoComplete="email"
                      required
                    />
                    <label htmlFor="email" className={f.labelFloat}>E-mail</label>
                  </div>
                  <div className={fl.msgRow}>
                    {!form.email && (
                      <span className={fl.hint}>Ex.: voce@dominio.com</span>
                    )}
                    {!!form.email && !emailValid && (
                      <span className={fl.warn}>
                        E-mail inválido (precisa conter @ e .algo).
                      </span>
                    )}
                    {!!form.email && emailValid && (
                      <span className={fl.success}>Ok.</span>
                    )}
                  </div>
                </div>

                {/* Senha */}
                <div className={`${fl.group} ${f.float}`}>
                  <div className={f.inputWrap}>
                    <input
                      id="senha"
                      name="senha"
                      type={showPass ? 'text' : 'password'}
                      placeholder=" "
                      className={`${f.input} ${!pwdValid && form.senha ? f.invalid : ''}`}
                      value={form.senha}
                      onChange={handleChange}
                      autoComplete="new-password"
                      required
                      minLength={PWD_MIN}
                      maxLength={PWD_MAX}
                    />
                    <label htmlFor="senha" className={f.labelFloat}>Senha</label>

                    <button
                      type="button"
                      className={f.affixButton}
                      aria-label={showPass ? 'Ocultar senha' : 'Mostrar senha'}
                      onClick={() => setShowPass(v => !v)}
                    >
                      {showPass ? <PiEyeClosed /> : <PiEye />}
                    </button>
                  </div>
                  <div className={fl.msgRow}>
                    {!form.senha && (
                      <span className={fl.hint}>Mínimo {PWD_MIN} caracteres.</span>
                    )}
                    {!!form.senha && !pwdValid && (
                      <span className={fl.warn}>
                        Entre {PWD_MIN} e {PWD_MAX} caracteres.
                      </span>
                    )}
                    {!!form.senha && pwdValid && (
                      <span className={fl.success}>Ok.</span>
                    )}
                    <span className={fl.count}>{form.senha.length}/{PWD_MAX}</span>
                  </div>
                </div>

                {error && <span className={fl.error}>{error}</span>}

                <div className={fl.actions}>
                  <button
                    type="submit"
                    className={`${btn.btn} ${btn.btnPrimary}`}
                    disabled={busy || unitBusy || !canSubmitUser || (isClinics && !unitId)}
                  >
                    {busy ? 'Criando…' : 'Criar conta'}
                  </button>
                </div>
              </>
            )}
          </form>
        </section>
      </div>
    </main>
  );
}

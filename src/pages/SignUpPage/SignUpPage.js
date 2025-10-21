import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

import IsometricClinic from '../../components/IsometricClinic/IsometricClinic';

import u from '../../styles/base/utilities.module.css';
import t from '../../styles/primitives/typography.module.css';
import f from '../../styles/primitives/forms.module.css';
import fl from '../../styles/primitives/form-layout.module.css';
import btn from '../../styles/primitives/buttons.module.css';
import s from './signup.module.css';

import { onlyDigits, maskCPF, maskPhoneBR, isEmailBasic } from '../../utils/format';

// Constantes (signup)
const NAME_MIN = 3, NAME_MAX = 80;
const ADDR_MIN = 5, ADDR_MAX = 120;
const PWD_MIN = 6, PWD_MAX = 64;
const CPF_MIN = 11, CPF_MAX = 11;      // dígitos
const PHONE_MIN = 11, PHONE_MAX = 11;  // dígitos (formato (00) 00000-0000)

export default function SignUpPage() {
  const navigate = useNavigate();
  const { signup, busy, error, setError } = useAuth();

  // guardo valores crus (sem máscara) para cpf/telefone; renderizo mascarado
  const [form, setForm] = useState({
    nome: '',
    cpf: '',
    endereco: '',
    telefone: '',
    email: '',
    senha: '',
  });

    // Validações
    const nameValid = form.nome.trim().length >= NAME_MIN && form.nome.trim().length <= NAME_MAX;
    const cpfDigits = onlyDigits(form.cpf);
    const cpfValid = cpfDigits.length === CPF_MAX;
    const addrLen = form.endereco.trim().length;
    const addrValid = addrLen >= ADDR_MIN && addrLen <= ADDR_MAX;
    const phoneDigits = onlyDigits(form.telefone);
    const phoneValid = phoneDigits.length >= PHONE_MIN && phoneDigits.length <= PHONE_MAX;
    const emailValid = isEmailBasic(form.email);
    const pwdValid = form.senha.length >= PWD_MIN && form.senha.length <= PWD_MAX;

    const canSubmit = nameValid && cpfValid && addrValid && phoneValid && emailValid && pwdValid;

  function handleChange(e) {
    const { name, value } = e.target;
    if (error) setError(null);

    if (name === 'cpf') return setForm((p) => ({ ...p, cpf: onlyDigits(value).slice(0, CPF_MAX) }));
    if (name === 'telefone') return setForm((p) => ({ ...p, telefone: onlyDigits(value).slice(0, PHONE_MAX) }));

    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!canSubmit) return;

    const res = await signup({
      nome: form.nome.trim(),
      cpf: cpfDigits,
      endereco: form.endereco.trim(),
      telefone: phoneDigits,
      email: form.email.trim(),
      senha: form.senha,
    }, true);

    if (res.ok) navigate('/');
  }

  return (
    <main className={`${s.page} ${u.withNavOffsetPadding}`}>
      <div className={`container ${s.content}`}>
        <section className={s.left}>
          <h1 className={`${t.titleLg} ${s.title}`}>Crie sua conta</h1>
          <p className={s.lead}>Cadastre-se para agendar consultas com praticidade e segurança.</p>
          <IsometricClinic variant="clinic" theme="day" width={520} />
        </section>

        <section className={s.card}>
          <header className={s.cardHeader}>
            <h2 className={t.titleSm}>Cadastro de usuário</h2>
            <p className={s.sub}>Preencha os campos abaixo.</p>
          </header>

          <form className={fl.form} onSubmit={handleSubmit} noValidate>
            {/* Nome */}
            <div className={`${fl.group} ${f.float}`}>
              <div className={f.inputWrap}>
                <input id="nome" name="nome" type="text" placeholder=" "
                  className={`${f.input} ${!nameValid && form.nome ? f.invalid : ''}`}
                  value={form.nome} onChange={handleChange} autoComplete="name" required maxLength={NAME_MAX} />
                <label htmlFor="nome" className={f.labelFloat}>Nome completo</label>
              </div>
              <div className={fl.msgRow}>
                {!form.nome && <span className={fl.hint}>Mínimo {NAME_MIN} caracteres.</span>}
                {!!form.nome && !nameValid && <span className={fl.warn}>Entre {NAME_MIN} e {NAME_MAX} caracteres.</span>}
                {!!form.nome && nameValid && <span className={fl.success}>Ok.</span>}
                <span className={fl.count}>{form.nome.trim().length}/{NAME_MAX}</span>
              </div>
            </div>

            {/* CPF */}
            <div className={`${fl.group} ${f.float}`}>
              <div className={f.inputWrap}>
                <input id="cpf" name="cpf" type="text" placeholder=" "
                  className={`${f.input} ${!cpfValid && form.cpf ? f.invalid : ''}`}
                  value={maskCPF(form.cpf)} onChange={handleChange} autoComplete="off" required />
                <label htmlFor="cpf" className={f.labelFloat}>CPF</label>
              </div>
              <div className={fl.msgRow}>
                {!form.cpf && <span className={fl.hint}>Formato: 000.000.000-00</span>}
                {!!form.cpf && !cpfValid && <span className={fl.warn}>CPF precisa de {CPF_MIN} dígitos.</span>}
                {!!form.cpf && cpfValid && <span className={fl.success}>Ok.</span>}
                <span className={fl.count}>{cpfDigits.length}/{CPF_MAX}</span>
              </div>
            </div>

            {/* Endereço */}
            <div className={`${fl.group} ${f.float}`}>
              <div className={f.inputWrap}>
                <input id="endereco" name="endereco" type="text" placeholder=" "
                  className={`${f.input} ${f.lg} ${!addrValid && form.endereco ? f.invalid : ''}`}
                  value={form.endereco} onChange={handleChange} autoComplete="street-address" required maxLength={ADDR_MAX} />
                <label htmlFor="endereco" className={f.labelFloat}>Endereço</label>
              </div>
              <div className={fl.msgRow}>
                {!form.endereco && <span className={fl.hint}>Ex.: Rua Exemplo, 123 - Bairro</span>}
                {!!form.endereco && !addrValid && <span className={fl.warn}>Entre {ADDR_MIN} e {ADDR_MAX} caracteres.</span>}
                {!!form.endereco && addrValid && <span className={fl.success}>Ok.</span>}
                <span className={fl.count}>{addrLen}/{ADDR_MAX}</span>
              </div>
            </div>

            {/* Telefone */}
            <div className={`${fl.group} ${f.float}`}>
              <div className={f.inputWrap}>
                <input id="telefone" name="telefone" type="tel" placeholder=" "
                  className={`${f.input} ${!phoneValid && form.telefone ? f.invalid : ''}`}
                  value={maskPhoneBR(form.telefone)} onChange={handleChange} autoComplete="tel" required />
                <label htmlFor="telefone" className={f.labelFloat}>Telefone</label>
              </div>
              <div className={fl.msgRow}>
                {!form.telefone && <span className={fl.hint}>Formato: (11) 99999-9999</span>}
                {!!form.telefone && !phoneValid && <span className={fl.warn}>Use {PHONE_MAX} dígitos (DDD + número).</span>}
                {!!form.telefone && phoneValid && <span className={fl.success}>Ok.</span>}
                <span className={fl.count}>{phoneDigits.length}/{PHONE_MAX}</span>
              </div>
            </div>

            {/* E-mail */}
            <div className={`${fl.group} ${f.float}`}>
              <div className={f.inputWrap}>
                <input id="email" name="email" type="email" placeholder=" "
                  className={`${f.input} ${!emailValid && form.email ? f.invalid : ''}`}
                  value={form.email} onChange={handleChange} autoComplete="email" required />
                <label htmlFor="email" className={f.labelFloat}>E-mail</label>
              </div>
              <div className={fl.msgRow}>
                {!form.email && <span className={fl.hint}>Ex.: voce@dominio.com</span>}
                {!!form.email && !emailValid && <span className={fl.warn}>E-mail inválido (precisa conter @ e .algo).</span>}
                {!!form.email && emailValid && <span className={fl.success}>Ok.</span>}
              </div>
            </div>

            {/* Senha */}
            <div className={`${fl.group} ${f.float}`}>
              <div className={f.inputWrap}>
                <input id="senha" name="senha" type="password" placeholder=" "
                  className={`${f.input} ${!pwdValid && form.senha ? f.invalid : ''}`}
                  value={form.senha} onChange={handleChange}
                  autoComplete="new-password" required minLength={PWD_MIN} maxLength={PWD_MAX} />
                <label htmlFor="senha" className={f.labelFloat}>Senha</label>
              </div>
              <div className={fl.msgRow}>
                {!form.senha && <span className={fl.hint}>Mínimo {PWD_MIN} caracteres.</span>}
                {!!form.senha && !pwdValid && <span className={fl.warn}>Entre {PWD_MIN} e {PWD_MAX} caracteres.</span>}
                {!!form.senha && pwdValid && <span className={fl.success}>Ok.</span>}
                <span className={fl.count}>{form.senha.length}/{PWD_MAX}</span>
              </div>
            </div>

            {error && <span className={fl.error}>{error}</span>}

            <div className={fl.actions}>
              <button type="submit" className={`${btn.btn} ${btn.btnPrimary}`} disabled={busy || !canSubmit}>
                {busy ? 'Criando…' : 'Criar conta'}
              </button>
            </div>
          </form>
        </section>
      </div>
    </main>
  );
}
import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

import IsometricClinic from '../../components/IsometricClinic/IsometricClinic';

import u from '../../styles/base/utilities.module.css';
import t from '../../styles/primitives/typography.module.css';
import f from '../../styles/primitives/forms.module.css';
import fl from '../../styles/primitives/form-layout.module.css';
import btn from '../../styles/primitives/buttons.module.css';
import s from './loginpage.module.css';

import { PiEye, PiEyeClosed } from "react-icons/pi";

import { onlyDigits, maskCPF } from '../../utils/format';

// Constantes (login)
const PWD_MIN = 6;
const PWD_MAX = 64;
const CPF_MIN = 11; // dígitos
const CPF_MAX = 11;

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';

  const { login, busy, error, setError } = useAuth();

  const [showPass, setShowPass] = useState(false);
  const [form, setForm] = useState({
    loginRaw: '',  // CPF (somente dígitos)
    senha: '',
    remember: true,
  });

  // Derivados (determinísticos)
  const loginDigits = onlyDigits(form.loginRaw);
  const loginMasked = maskCPF(loginDigits);
  const loginValid = loginDigits.length === CPF_MAX;
  const pwdValid = form.senha.length >= PWD_MIN && form.senha.length <= PWD_MAX;

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    if (error) setError(null);

    if (name === 'loginRaw') {
      const next = onlyDigits(value).slice(0, CPF_MAX);
      setForm(p => ({ ...p, loginRaw: next }));
      return;
    }

    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  }

  function handleKeyDownCPF(e) {
    const allowed = ['Backspace','Delete','ArrowLeft','ArrowRight','Tab','Home','End'];
    if (allowed.includes(e.key)) return;
    if (!/^\d$/.test(e.key)) e.preventDefault();
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!loginValid || !pwdValid) return;

    const res = await login({
      login: loginDigits,
      senha: form.senha,
      remember: form.remember
    });

    if (res.ok) navigate(from, { replace: true });
  }

  return (
    <main className={`${s.page} ${u.withNavOffset}`}>
      <div className={`container ${s.content}`}>
        {/* Lado esquerdo (mensagem + ilustração) */}
        <section className={s.left}>
          <h1 className={`${t.titleLg} ${s.title}`}>Bem-vindo de volta</h1>
          <p className={s.lead}>
            Acesse sua conta para gerenciar agendamentos e acompanhar seus atendimentos.
          </p>
          <IsometricClinic variant="pharmacy" theme="evening" width={520} />
        </section>

        {/* Card do formulário */}
        <section className={s.card}>
          <header className={s.cardHeader}>
            <h2 className={t.titleSm}>Entrar</h2>
            <p className={s.sub}>Use seu CPF e sua senha.</p>
          </header>

          <form className={fl.form} onSubmit={handleSubmit} noValidate>
            {/* CPF */}
            <div className={`${fl.group} ${f.float}`}>
              <div className={f.inputWrap}>
                <input
                  id="loginRaw"
                  name="loginRaw"
                  type="text"
                  placeholder=" "
                  className={`${f.input} ${!loginValid && form.loginRaw ? f.invalid : ''}`}
                  value={loginMasked}
                  onChange={handleChange}
                  onKeyDown={handleKeyDownCPF}
                  autoComplete="username"
                  inputMode="numeric"
                  pattern="^\d{3}\.\d{3}\.\d{3}-\d{2}$"
                  required
                />
                <label htmlFor="loginRaw" className={f.labelFloat}>CPF</label>
              </div>
              <div className={fl.msgRow}>
                {!form.loginRaw && <span className={fl.hint}>Formato: 000.000.000-00</span>}
                {!!form.loginRaw && !loginValid && (
                  <span className={fl.warn}>CPF precisa de {CPF_MIN} dígitos.</span>
                )}
                {!!form.loginRaw && loginValid && <span className={fl.success}>Ok.</span>}
                <span className={fl.count}>{loginDigits.length}/{CPF_MAX}</span>
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
                  autoComplete="current-password"
                  required
                  minLength={PWD_MIN}
                  maxLength={PWD_MAX}
                />
                <label htmlFor="senha" className={f.labelFloat}>Senha</label>

                <button
                  type="button"
                  className={f.affixButton}
                  aria-label={showPass ? 'Ocultar senha' : 'Mostrar senha'}
                  onClick={() => setShowPass((v) => !v)}
                >
                  {showPass ? <PiEyeClosed /> : <PiEye />}
                </button>
              </div>
              <div className={fl.msgRow}>
                {!form.senha && <span className={fl.hint}>Mínimo {PWD_MIN} caracteres.</span>}
                {!!form.senha && !pwdValid && (
                  <span className={fl.warn}>A senha deve ter entre {PWD_MIN} e {PWD_MAX} caracteres.</span>
                )}
                {!!form.senha && pwdValid && <span className={fl.success}>Ok.</span>}
                <span className={fl.count}>{form.senha.length}/{PWD_MAX}</span>
              </div>
            </div>

            <div className={fl.helpRow}>
              <label className={f.checkRow} htmlFor="remember">
                <input
                  id="remember"
                  name="remember"
                  type="checkbox"
                  className={f.checkbox}
                  checked={form.remember}
                  onChange={handleChange}
                />
                Lembrar-me
              </label>
              <a className={s.linkInline} href="/forgot-password">Esqueci minha senha</a>
            </div>

            {error && <span className={fl.error}>{error}</span>}

            <div className={fl.actions}>
              <button
                type="submit"
                className={`${btn.btn} ${btn.btnPrimary}`}
                disabled={busy || !loginValid || !pwdValid}
              >
                {busy ? 'Entrando…' : 'Entrar'}
              </button>
            </div>
          </form>

          <footer className={s.footerNote}>
            Não tem conta? <a className={s.linkInline} href="/signup">Crie sua conta</a>
          </footer>
        </section>
      </div>
    </main>
  );
}
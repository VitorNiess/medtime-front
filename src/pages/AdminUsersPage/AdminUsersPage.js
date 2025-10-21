import { useEffect, useMemo, useState } from "react";
import DataTable from "../../components/DataTable/DataTable";
import Modal from "../../components/Modal/Modal";

import u from "../../styles/base/utilities.module.css";
import t from "../../styles/primitives/typography.module.css";
import btn from "../../styles/primitives/buttons.module.css";
import f from "../../styles/primitives/forms.module.css";
import fl from "../../styles/primitives/form-layout.module.css";
import s from "./admin-users.module.css";

import { onlyDigits, maskCPF, maskPhoneBR, isEmailBasic } from "../../utils/format";
import { listUsers, createUser, updateUser, deleteUser, ROLES } from "../../services/users";

const NAME_MIN = 3, NAME_MAX = 80;
const CPF_MAX = 11;
const PHONE_MAX = 11;
const EMAIL_REQ = true;

function useUsers() {
  const [rows, setRows] = useState([]);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState(null);

  async function load() {
    setBusy(true);
    setErr(null);
    try {
      const data = await listUsers();
      setRows(data);
    } catch (e) {
      setErr("Falha ao carregar usuários.");
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => { load(); }, []);

  return { rows, setRows, load, busy, err, setErr };
}

export default function AdminUsersPage() {
  const { rows, setRows, load, busy, err } = useUsers();

  const [createOpen, setCreateOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [formNew, setFormNew] = useState({
    nome: "", cpf: "", email: "", telefone: "", role: "usuario",
  });

  // validações
  const nameValidNew = formNew.nome.trim().length >= NAME_MIN && formNew.nome.trim().length <= NAME_MAX;
  const cpfDigitsNew = onlyDigits(formNew.cpf);
  const cpfValidNew = cpfDigitsNew.length === CPF_MAX;
  const phoneDigitsNew = onlyDigits(formNew.telefone);
  const phoneValidNew = phoneDigitsNew.length === PHONE_MAX;
  const emailValidNew = isEmailBasic(formNew.email);
  const canCreate = nameValidNew && cpfValidNew && phoneValidNew && (!EMAIL_REQ || emailValidNew);

  function handleNewChange(e) {
    const { name, value } = e.target;
    if (name === "cpf") {
      return setFormNew(p => ({ ...p, cpf: onlyDigits(value).slice(0, CPF_MAX) }));
    }
    if (name === "telefone") {
      return setFormNew(p => ({ ...p, telefone: onlyDigits(value).slice(0, PHONE_MAX) }));
    }
    setFormNew(p => ({ ...p, [name]: value }));
  }

  async function handleCreate(e) {
    e.preventDefault();
    if (!canCreate) return;
    setCreating(true);
    const payload = {
      nome: formNew.nome.trim(),
      cpf: cpfDigitsNew,
      email: formNew.email.trim(),
      telefone: phoneDigitsNew,
      role: formNew.role,
    };
    const res = await createUser(payload);
    if (res.ok) {
      setRows(list => [res.user, ...list]);
      setFormNew({ nome: "", cpf: "", email: "", telefone: "", role: "usuario" });
      setCreateOpen(false);
    }
    setCreating(false);
  }

  const [editOpen, setEditOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [current, setCurrent] = useState(null);
  const [formEdit, setFormEdit] = useState({
    nome: "", cpf: "", email: "", telefone: "", role: "usuario",
  });

  function openEditModal(user) {
    setCurrent(user);
    setFormEdit({
      nome: user.nome || "",
      cpf: onlyDigits(user.cpf || "").slice(0, CPF_MAX),
      email: user.email || "",
      telefone: onlyDigits(user.telefone || "").slice(0, PHONE_MAX),
      role: user.role || "usuario",
    });
    setEditOpen(true);
  }

  const nameValidEdit = formEdit.nome.trim().length >= NAME_MIN && formEdit.nome.trim().length <= NAME_MAX;
  const cpfDigitsEdit = onlyDigits(formEdit.cpf);
  const cpfValidEdit = cpfDigitsEdit.length === CPF_MAX;
  const phoneDigitsEdit = onlyDigits(formEdit.telefone);
  const phoneValidEdit = phoneDigitsEdit.length === PHONE_MAX;
  const emailValidEdit = isEmailBasic(formEdit.email);
  const canEdit = nameValidEdit && cpfValidEdit && phoneValidEdit && (!EMAIL_REQ || emailValidEdit);

  function handleEditChange(e) {
    const { name, value } = e.target;
    if (name === "cpf") {
      return setFormEdit(p => ({ ...p, cpf: onlyDigits(value).slice(0, CPF_MAX) }));
    }
    if (name === "telefone") {
      return setFormEdit(p => ({ ...p, telefone: onlyDigits(value).slice(0, PHONE_MAX) }));
    }
    setFormEdit(p => ({ ...p, [name]: value }));
  }

  async function handleSaveEdit(e) {
    e.preventDefault();
    if (!current || !canEdit) return;
    setEditing(true);
    const res = await updateUser(current.id, {
      nome: formEdit.nome.trim(),
      cpf: cpfDigitsEdit,
      email: formEdit.email.trim(),
      telefone: phoneDigitsEdit,
      role: formEdit.role,
    });
    if (res.ok) {
      setRows(list => list.map(u => (u.id === current.id ? res.user : u)));
      setEditOpen(false);
      setCurrent(null);
    }
    setEditing(false);
  }

  const [toDelete, setToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  async function confirmDelete() {
    if (!toDelete) return;
    setDeleting(true);
    const res = await deleteUser(toDelete.id);
    if (res.ok) {
      setRows(list => list.filter(u => u.id !== toDelete.id));
      setToDelete(null);
    }
    setDeleting(false);
  }

  const columns = useMemo(() => ([
    { key: "nome", header: "Nome" },
    { key: "cpf", header: "CPF", render: (r) => maskCPF(r.cpf) },
    { key: "email", header: "E-mail" },
    { key: "telefone", header: "Telefone", render: (r) => maskPhoneBR(r.telefone) },
    {
      key: "role", header: "Função", width: "160px",
      render: (r) => <span className={s.role + " " + s["role--" + r.role]}>{r.role}</span>
    },
  ]), []);

  function rowActions(r) {
    return (
      <div className="rowActions">
        <button className={`${btn.btn} ${btn.btnSecondary} ${s.sm}`} onClick={() => openEditModal(r)}>Editar</button>
        <button className={`${btn.btn} ${btn.btnDanger} ${s.sm}`} onClick={() => setToDelete(r)}>Excluir</button>
      </div>
    );
  }

  return (
    <main className={`${s.page} ${u.withNavOffset}`}>
      <div className="container">
        <header className={s.header}>
          <div>
            <h1 className={t.titleMd}>Administração de Usuários</h1>
            <p className={s.sub}>Gerencie contas e permissões na plataforma.</p>
          </div>
          <div className={s.headerActions}>
            <button className={`${btn.btn} ${btn.btnPrimary}`} onClick={() => setCreateOpen(true)}>Novo usuário</button>
            <button className={`${btn.btn} ${btn.btnGhost}`} onClick={load} disabled={busy}>{busy ? "Atualizando…" : "Recarregar"}</button>
          </div>
        </header>

        {err && <div className={s.error}>{err}</div>}

        <DataTable
          columns={columns}
          rows={rows}
          actions={rowActions}
          emptyMessage="Sem usuários cadastrados."
        />
      </div>

      {/* ===== Modal: Criar ===== */}
      <Modal open={createOpen} title="Novo usuário" onClose={() => setCreateOpen(false)}>
        <form className={fl.form} onSubmit={handleCreate} noValidate>
          {/* Nome */}
          <div className={`${fl.group} ${f.float}`}>
            <div className={f.inputWrap}>
              <input
                id="new-nome"
                name="nome"
                type="text"
                placeholder=" "
                className={`${f.input} ${!nameValidNew && formNew.nome ? f.invalid : ''}`}
                value={formNew.nome}
                onChange={handleNewChange}
                required
                maxLength={NAME_MAX}
              />
              <label htmlFor="new-nome" className={f.labelFloat}>Nome completo</label>
            </div>
            <div className={fl.msgRow}>
              {!formNew.nome && <span className={fl.hint}>Mínimo {NAME_MIN} caracteres.</span>}
              {!!formNew.nome && !nameValidNew && <span className={fl.warn}>Entre {NAME_MIN} e {NAME_MAX} caracteres.</span>}
              {!!formNew.nome && nameValidNew && <span className={fl.success}>Ok.</span>}
              <span className={fl.count}>{formNew.nome.trim().length}/{NAME_MAX}</span>
            </div>
          </div>

          {/* CPF */}
          <div className={`${fl.group} ${f.float}`}>
            <div className={f.inputWrap}>
              <input
                id="new-cpf"
                name="cpf"
                type="text"
                placeholder=" "
                className={`${f.input} ${!cpfValidNew && formNew.cpf ? f.invalid : ''}`}
                value={maskCPF(formNew.cpf)}
                onChange={handleNewChange}
                inputMode="numeric"
                required
              />
              <label htmlFor="new-cpf" className={f.labelFloat}>CPF</label>
            </div>
            <div className={fl.msgRow}>
              {!formNew.cpf && <span className={fl.hint}>Formato: 000.000.000-00</span>}
              {!!formNew.cpf && !cpfValidNew && <span className={fl.warn}>CPF precisa de {CPF_MAX} dígitos.</span>}
              {!!formNew.cpf && cpfValidNew && <span className={fl.success}>Ok.</span>}
              <span className={fl.count}>{cpfDigitsNew.length}/{CPF_MAX}</span>
            </div>
          </div>

          {/* Telefone */}
          <div className={`${fl.group} ${f.float}`}>
            <div className={f.inputWrap}>
              <input
                id="new-telefone"
                name="telefone"
                type="tel"
                placeholder=" "
                className={`${f.input} ${!phoneValidNew && formNew.telefone ? f.invalid : ''}`}
                value={maskPhoneBR(formNew.telefone)}
                onChange={handleNewChange}
                inputMode="tel"
                required
              />
              <label htmlFor="new-telefone" className={f.labelFloat}>Telefone</label>
            </div>
            <div className={fl.msgRow}>
              {!formNew.telefone && <span className={fl.hint}>Formato: (11) 99999-9999</span>}
              {!!formNew.telefone && !phoneValidNew && <span className={fl.warn}>Use {PHONE_MAX} dígitos (DDD + número).</span>}
              {!!formNew.telefone && phoneValidNew && <span className={fl.success}>Ok.</span>}
              <span className={fl.count}>{phoneDigitsNew.length}/{PHONE_MAX}</span>
            </div>
          </div>

          {/* E-mail */}
          <div className={`${fl.group} ${f.float}`}>
            <div className={f.inputWrap}>
              <input
                id="new-email"
                name="email"
                type="email"
                placeholder=" "
                className={`${f.input} ${!emailValidNew && formNew.email ? f.invalid : ''}`}
                value={formNew.email}
                onChange={handleNewChange}
                required={EMAIL_REQ}
              />
              <label htmlFor="new-email" className={f.labelFloat}>E-mail</label>
            </div>
            <div className={fl.msgRow}>
              {!formNew.email && <span className={fl.hint}>Ex.: voce@dominio.com</span>}
              {!!formNew.email && !emailValidNew && <span className={fl.warn}>E-mail inválido (precisa conter @ e .algo).</span>}
              {!!formNew.email && emailValidNew && <span className={fl.success}>Ok.</span>}
            </div>
          </div>

          {/* Role */}
          <div className={fl.group}>
            <label htmlFor="new-role" className={f.label}>Função</label>
            <select
              id="new-role"
              name="role"
              className={f.input}
              value={formNew.role}
              onChange={handleNewChange}
            >
              {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>

          <div className={fl.actions}>
            <button className={`${btn.btn} ${btn.btnPrimary}`} disabled={creating || !canCreate}>
              {creating ? "Criando…" : "Salvar"}
            </button>
            <button type="button" className={`${btn.btn} ${btn.btnGhost}`} onClick={() => setCreateOpen(false)}>Cancelar</button>
          </div>
        </form>
      </Modal>

      {/* ===== Modal: Editar ===== */}
      <Modal open={editOpen} title="Editar usuário" onClose={() => setEditOpen(false)}>
        <form className={fl.form} onSubmit={handleSaveEdit} noValidate>
          {/* Nome */}
          <div className={`${fl.group} ${f.float}`}>
            <div className={f.inputWrap}>
              <input
                id="edit-nome"
                name="nome"
                type="text"
                placeholder=" "
                className={`${f.input} ${!nameValidEdit && formEdit.nome ? f.invalid : ''}`}
                value={formEdit.nome}
                onChange={handleEditChange}
                required
                maxLength={NAME_MAX}
              />
              <label htmlFor="edit-nome" className={f.labelFloat}>Nome completo</label>
            </div>
            <div className={fl.msgRow}>
              {!formEdit.nome && <span className={fl.hint}>Mínimo {NAME_MIN} caracteres.</span>}
              {!!formEdit.nome && !nameValidEdit && <span className={fl.warn}>Entre {NAME_MIN} e {NAME_MAX} caracteres.</span>}
              {!!formEdit.nome && nameValidEdit && <span className={fl.success}>Ok.</span>}
              <span className={fl.count}>{formEdit.nome.trim().length}/{NAME_MAX}</span>
            </div>
          </div>

          {/* CPF */}
          <div className={`${fl.group} ${f.float}`}>
            <div className={f.inputWrap}>
              <input
                id="edit-cpf"
                name="cpf"
                type="text"
                placeholder=" "
                className={`${f.input} ${!cpfValidEdit && formEdit.cpf ? f.invalid : ''}`}
                value={maskCPF(formEdit.cpf)}
                onChange={handleEditChange}
                inputMode="numeric"
                required
              />
              <label htmlFor="edit-cpf" className={f.labelFloat}>CPF</label>
            </div>
            <div className={fl.msgRow}>
              {!formEdit.cpf && <span className={fl.hint}>Formato: 000.000.000-00</span>}
              {!!formEdit.cpf && !cpfValidEdit && <span className={fl.warn}>CPF precisa de {CPF_MAX} dígitos.</span>}
              {!!formEdit.cpf && cpfValidEdit && <span className={fl.success}>Ok.</span>}
              <span className={fl.count}>{cpfDigitsEdit.length}/{CPF_MAX}</span>
            </div>
          </div>

          {/* Telefone */}
          <div className={`${fl.group} ${f.float}`}>
            <div className={f.inputWrap}>
              <input
                id="edit-telefone"
                name="telefone"
                type="tel"
                placeholder=" "
                className={`${f.input} ${!phoneValidEdit && formEdit.telefone ? f.invalid : ''}`}
                value={maskPhoneBR(formEdit.telefone)}
                onChange={handleEditChange}
                inputMode="tel"
                required
              />
              <label htmlFor="edit-telefone" className={f.labelFloat}>Telefone</label>
            </div>
            <div className={fl.msgRow}>
              {!formEdit.telefone && <span className={fl.hint}>Formato: (11) 99999-9999</span>}
              {!!formEdit.telefone && !phoneValidEdit && <span className={fl.warn}>Use {PHONE_MAX} dígitos (DDD + número).</span>}
              {!!formEdit.telefone && phoneValidEdit && <span className={fl.success}>Ok.</span>}
              <span className={fl.count}>{phoneDigitsEdit.length}/{PHONE_MAX}</span>
            </div>
          </div>

          {/* E-mail */}
          <div className={`${fl.group} ${f.float}`}>
            <div className={f.inputWrap}>
              <input
                id="edit-email"
                name="email"
                type="email"
                placeholder=" "
                className={`${f.input} ${!emailValidEdit && formEdit.email ? f.invalid : ''}`}
                value={formEdit.email}
                onChange={handleEditChange}
                required={EMAIL_REQ}
              />
              <label htmlFor="edit-email" className={f.labelFloat}>E-mail</label>
            </div>
            <div className={fl.msgRow}>
              {!formEdit.email && <span className={fl.hint}>Ex.: voce@dominio.com</span>}
              {!!formEdit.email && !emailValidEdit && <span className={fl.warn}>E-mail inválido (precisa conter @ e .algo).</span>}
              {!!formEdit.email && emailValidEdit && <span className={fl.success}>Ok.</span>}
            </div>
          </div>

          {/* Role */}
          <div className={fl.group}>
            <label htmlFor="edit-role" className={f.label}>Função</label>
            <select
              id="edit-role"
              name="role"
              className={f.input}
              value={formEdit.role}
              onChange={handleEditChange}
            >
              {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>

          <div className={fl.actions}>
            <button className={`${btn.btn} ${btn.btnPrimary}`} disabled={editing || !canEdit}>
              {editing ? "Salvando…" : "Salvar"}
            </button>
            <button type="button" className={`${btn.btn} ${btn.btnGhost}`} onClick={() => setEditOpen(false)}>Cancelar</button>
          </div>
        </form>
      </Modal>

      {/* ===== Modal: Delete ===== */}
      <Modal open={!!toDelete} title="Excluir usuário" onClose={() => setToDelete(null)}>
        <p>Tem certeza que deseja excluir <strong>{toDelete?.nome}</strong>? Esta ação não pode ser desfeita.</p>
        <div className={s.modalActions}>
          <button className={`${btn.btn} ${btn.btnDanger}`} onClick={confirmDelete} disabled={deleting}>
            {deleting ? "Excluindo…" : "Excluir"}
          </button>
          <button className={`${btn.btn} ${btn.btnGhost}`} onClick={() => setToDelete(null)}>Cancelar</button>
        </div>
      </Modal>
    </main>
  );
}

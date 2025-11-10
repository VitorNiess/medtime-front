import { URLS } from "../utils/urls";

// API FAKE: CRUD de usuários (só console + timeout)
const DEMO_LATENCY = 400;

// banco em memória (apenas para demo)
let USERS = [
  { id: "u1",  nome: "Ana Souza",         cpf: "12345678901", email: "ana@demo.com",         telefone: "(31) 98888-1111", role: "administrador" },
  { id: "u2",  nome: "Bruno Lima",        cpf: "98765432100", email: "bruno@demo.com",       telefone: "(11) 97777-2222", role: "medico" },
  { id: "u3",  nome: "Clara Nogueira",    cpf: "11122233344", email: "clara@demo.com",       telefone: "(21) 96666-3333", role: "funcionario" },
  { id: "u4",  nome: "Diego Alves",       cpf: "55566677788", email: "diego@demo.com",       telefone: "(41) 95555-4444", role: "usuario" },

  { id: "u5",  nome: "Elisa Martins",     cpf: "20130450678", email: "elisa@demo.com",       telefone: "(31) 98765-4321", role: "usuario" },
  { id: "u6",  nome: "Felipe Rocha",      cpf: "31415926535", email: "felipe@demo.com",      telefone: "(11) 99654-3210", role: "medico" },
  { id: "u7",  nome: "Gabriela Torres",   cpf: "74628190512", email: "gabriela@demo.com",    telefone: "(21) 99876-5432", role: "funcionario" },
  { id: "u8",  nome: "Henrique Pires",    cpf: "85274196300", email: "henrique@demo.com",    telefone: "(41) 99444-2211", role: "administrador" },

  { id: "u9",  nome: "Isabela Duarte",    cpf: "36925814700", email: "isabela@demo.com",     telefone: "(31) 99111-2233", role: "usuario" },
  { id: "u10", nome: "João Pedro Araújo", cpf: "75315984266", email: "joao@demo.com",        telefone: "(11) 99555-6677", role: "medico" },
  { id: "u11", nome: "Karen Barros",      cpf: "62831415927", email: "karen@demo.com",       telefone: "(21) 99222-3344", role: "funcionario" },
  { id: "u12", nome: "Lucas Teixeira",    cpf: "41725836914", email: "lucas@demo.com",       telefone: "(41) 99777-8899", role: "administrador" },

  { id: "u13", nome: "Mariana Castro",    cpf: "13579246810", email: "mariana@demo.com",     telefone: "(31) 98444-5566", role: "usuario" },
  { id: "u14", nome: "Natan Oliveira",    cpf: "24680135792", email: "natan@demo.com",       telefone: "(11) 99333-4455", role: "medico" },
  { id: "u15", nome: "Olívia Mendes",     cpf: "86420975311", email: "olivia@demo.com",      telefone: "(21) 98770-1122", role: "funcionario" },
  { id: "u16", nome: "Paulo Ribeiro",     cpf: "90234567123", email: "paulo@demo.com",       telefone: "(41) 98989-0001", role: "usuario" },

  { id: "u17", nome: "Queila Fernandes",  cpf: "23098765431", email: "queila@demo.com",      telefone: "(31) 98686-2244", role: "medico" },
  { id: "u18", nome: "Renan Cardoso",     cpf: "56273849501", email: "renan@demo.com",       telefone: "(11) 98123-4567", role: "administrador" },
  { id: "u19", nome: "Sabrina Moraes",    cpf: "70918263455", email: "sabrina@demo.com",     telefone: "(21) 98812-3434", role: "usuario" },
  { id: "u20", nome: "Thiago Moreira",    cpf: "81927364550", email: "thiago@demo.com",      telefone: "(41) 98712-5656", role: "medico" },
];

export const ROLES = ["usuario", "funcionario", "medico", "administrador"];

export function listUsers() {
  console.log("[users.api] listUsers()");
  return new Promise((res) => setTimeout(() => res([...USERS]), DEMO_LATENCY));
}

export function createUser(data) {
  console.log("[users.api] createUser()", data);
  return new Promise((res) =>
    setTimeout(() => {
      const id = "u" + (Math.floor(Math.random() * 9000) + 1000);
      const user = { id, ...data };
      USERS = [user, ...USERS];
      res({ ok: true, user });
    }, DEMO_LATENCY)
  );
}

export function updateUser(id, patch) {
  console.log("[users.api] updateUser()", id, patch);
  return new Promise((res) =>
    setTimeout(() => {
      USERS = USERS.map((u) => (u.id === id ? { ...u, ...patch } : u));
      const updated = USERS.find((u) => u.id === id);
      res({ ok: true, user: updated });
    }, DEMO_LATENCY)
  );
}

export function deleteUser(id) {
  console.log("[users.api] deleteUser()", id);
  return new Promise((res) =>
    setTimeout(() => {
      USERS = USERS.filter((u) => u.id !== id);
      res({ ok: true });
    }, DEMO_LATENCY)
  );
}
import React, { useMemo, useState, useCallback } from "react";

// Estilos
import s from "./doctorsSearchPage.module.css";
import typey from "../../styles/primitives/typography.module.css";
import btn from "../../styles/primitives/buttons.module.css";
import fx from "../../styles/primitives/form-extras.module.css";
import utils from "../../styles/base/utilities.module.css";

// Componentes
import SearchBar from "../../components/SearchBar/SearchBar";
import DoctorCard from "../../components/DoctorCard/DoctorCard";

// ====== Mock de Médicos
const doctorsMock = [
  {
    id: "dr001",
    image: "",
    name: "Dra. Ana Beatriz F.",
    specialization: "Dermatologia",
    crm: "12345",
    clinic: "Clínica Vida • Centro",
    badges: [
      { type: "telemedicina" },
      { type: "preco", value: "R$ 220" },
      { type: "rampa" },
    ],
    nextSlot: (() => {
      const d = new Date(); d.setHours(15, 30, 0, 0); return d;
    })(),
    distanceKm: 1.3,
  },
  {
    id: "dr002",
    image: "",
    name: "Dr. Marcos S.",
    specialization: "Ortopedia",
    crm: "99887",
    clinic: "OrtoPlus • Savassi",
    badges: [
      { type: "sus" },
      { type: "rampa" },
      { type: "libras" },
      { type: "infantil" },
    ],
    nextSlot: new Date(Date.now() + 24 * 60 * 60 * 1000 + 9 * 60 * 60 * 1000 + 10 * 60 * 1000),
    distanceKm: 4.0,
  },
  {
    id: "dr003",
    image: "",
    name: "Dra. Júlia R.",
    specialization: "Pediatria",
    crm: "55661",
    clinic: "Santa Maria • Funcionários",
    badges: [
      { type: "telemedicina" },
      { type: "preco", value: "R$ 180" },
      { type: "libras" },
      { type: "infantil" },
    ],
    nextSlot: (() => {
      const d = new Date(); d.setHours(18, 0, 0, 0); return d;
    })(),
    distanceKm: 2.2,
  },
  {
    id: "dr004",
    image: "",
    name: "Dr. Henrique T.",
    specialization: "Cardiologia",
    crm: "44121",
    clinic: "CardioCare • Colônia",
    badges: [
      { type: "sus" },
      { type: "rampa" },
    ],
    nextSlot: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000 + 10 * 60 * 60 * 1000),
    distanceKm: 5.6,
  },
  {
    id: "dr005",
    image: "",
    name: "Dra. Patrícia G.",
    specialization: "Ginecologia",
    crm: "77412",
    clinic: "Clínica Mulher • Centro",
    badges: [
      { type: "telemedicina" },
      { type: "preco", value: "R$ 250" },
      { type: "rampa" },
    ],
    nextSlot: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000 + 14 * 60 * 60 * 1000), // +3 dias 14:00
    distanceKm: 0.9,
  },
  {
    id: "dr006",
    image: "",
    name: "Dr. Thiago P.",
    specialization: "Psicologia",
    crm: "PSI-33221",
    clinic: "Mente Ser • Centro",
    badges: [
      { type: "telemedicina" },
      { type: "preco", value: "R$ 160" },
    ],
    nextSlot: new Date(Date.now() + 6 * 60 * 60 * 1000),
    distanceKm: 1.1,
  },
];

// ====== Helpers
function norm(str = "") {
  return str
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase();
}

function isSameDay(a, b) {
  const da = new Date(a); const db = new Date(b);
  return da.getFullYear() === db.getFullYear() &&
         da.getMonth() === db.getMonth() &&
         da.getDate() === db.getDate();
}

export default function DoctorsSearchPage() {
  const [query, setQuery] = useState("");
  const [submittedQuery, setSubmittedQuery] = useState("");

  const [nearMe, setNearMe] = useState(false);
  const [tele, setTele] = useState(false);
  const [sus, setSus] = useState(false);
  const [rampa, setRampa] = useState(false);
  const [libras, setLibras] = useState(false);
  const [infantil, setInfantil] = useState(false);
  const [withPrice, setWithPrice] = useState(false);
  const [availableToday, setAvailableToday] = useState(false);

  const handleSubmit = useCallback((q) => {
    setSubmittedQuery(q.trim());
  }, []);

  const filtered = useMemo(() => {
    const q = norm(submittedQuery);
    let list = doctorsMock.filter((d) => {
      const hay = [
        d.name,
        d.specialization,
        d.crm,
        d.clinic,
        ...(d.badges || []).map((b) => [b.type, b.value].filter(Boolean).join(" ")),
      ]
        .filter(Boolean)
        .map(norm)
        .join(" ");

      if (q && !hay.includes(q)) return false;

      const tags = (d.badges || []).map((b) => b.type);
      const hasPrice = (d.badges || []).some((b) => b.type === "preco");

      if (tele && !tags.includes("telemedicina")) return false;
      if (sus && !tags.includes("sus")) return false;
      if (rampa && !tags.includes("rampa")) return false;
      if (libras && !tags.includes("libras")) return false;
      if (infantil && !tags.includes("infantil")) return false;
      if (withPrice && !hasPrice) return false;
      if (availableToday && !isSameDay(d.nextSlot, new Date())) return false;

      return true;
    });

    if (nearMe) {
      list = list
        .slice()
        .sort((a, b) => (a.distanceKm ?? 999) - (b.distanceKm ?? 999));
    } else {
      list = list
        .slice()
        .sort((a, b) => new Date(a.nextSlot) - new Date(b.nextSlot));
    }
    return list;
  }, [submittedQuery, nearMe, tele, sus, rampa, libras, infantil, withPrice, availableToday]);

  return (
    <main className={`container stack-lg ${s.page} ${utils.withNavOffsetPadding}`} aria-labelledby="doctors-title">
      <header className="stack">
        <h1 id="doctors-title" className={typey.titleLg}>Buscar médicos</h1>
        <p className={typey.bodyMd}>
          Encontre profissionais por nome, especialidade ou unidade. Use os filtros rápidos para refinar.
        </p>
      </header>

      {/* Barra de pesquisa */}
      <SearchBar
        query={query}
        setQuery={setQuery}
        onSubmit={handleSubmit}
        placeholder="Ex.: Dermatologia Centro, Marcos S., pediatra…"
        submitLabel="Buscar"
        theme="default"
      />

      {/* Chips rápidos */}
      <section className={fx.chipSurface} aria-label="Filtros rápidos">
        <div className={fx.chipGroup} role="group" aria-label="Filtros rápidos">
          <button type="button" className={fx.chip} aria-pressed={nearMe} onClick={() => setNearMe(v => !v)}>
            Próximos de mim
          </button>
          <button type="button" className={fx.chip} aria-pressed={tele} onClick={() => setTele(v => !v)}>
            Telemedicina
          </button>
          <button type="button" className={fx.chip} aria-pressed={sus} onClick={() => setSus(v => !v)}>
            Atende SUS
          </button>
          <button type="button" className={fx.chip} aria-pressed={rampa} onClick={() => setRampa(v => !v)}>
            Rampa
          </button>
          <button type="button" className={fx.chip} aria-pressed={libras} onClick={() => setLibras(v => !v)}>
            Libras
          </button>
          <button type="button" className={fx.chip} aria-pressed={infantil} onClick={() => setInfantil(v => !v)}>
            Atende infantil
          </button>
          <button type="button" className={fx.chip} aria-pressed={withPrice} onClick={() => setWithPrice(v => !v)}>
            Com preço
          </button>
          <button type="button" className={fx.chip} aria-pressed={availableToday} onClick={() => setAvailableToday(v => !v)}>
            Disponíveis hoje
          </button>
        </div>
      </section>

      {/* Resultado */}
      <div aria-live="polite" className="stack">
        <p className={typey.captionSm}>
          {filtered.length} {filtered.length === 1 ? "resultado" : "resultados"}
          {submittedQuery ? ` para “${submittedQuery}”` : ""}
          {nearMe ? " • ordenado por distância" : " • ordenado por disponibilidade"}
        </p>

        <div className="stack">
          {filtered.length === 0 ? (
            <div className="stack">
              <p className={typey.bodyMd}>
                Nenhum médico encontrado. Ajuste os filtros ou tente outro termo.
              </p>
              <button
                type="button"
                className={`${btn.btn} ${btn.btnGhost || ""}`}
                onClick={() => {
                  setQuery("");
                  setSubmittedQuery("");
                  setNearMe(false);
                  setTele(false);
                  setSus(false);
                  setRampa(false);
                  setLibras(false);
                  setInfantil(false);
                  setWithPrice(false);
                  setAvailableToday(false);
                }}
              >
                Limpar filtros
              </button>
            </div>
          ) : (
            filtered.map((d) => (
              <DoctorCard
                key={d.id}
                {...d}
                onViewDetails={(payload) => console.log("Ver detalhes:", payload)}
                onBook={(payload) => console.log("Agendar:", payload)}
                viewDisabled={false}
                bookDisabled={false}
              />
            ))
          )}
        </div>
      </div>
    </main>
  );
}
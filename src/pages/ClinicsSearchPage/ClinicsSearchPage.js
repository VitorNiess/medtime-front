import React, { useMemo, useState, useCallback } from "react";

// Estilos
import s from "./clinicsSearchPage.module.css";
import typey from "../../styles/primitives/typography.module.css";
import btn from "../../styles/primitives/buttons.module.css";
import fx from "../../styles/primitives/form-extras.module.css";
import utils from "../../styles/base/utilities.module.css";

// Componentes existentes
import SearchBar from "../../components/SearchBar/SearchBar";
import ClinicCard from "../../components/ClinicCard/ClinicCard";

// ====== Mock de Clínicas
const mockClinics = [
  {
    id: "cl001",
    name: "Clínica Vida",
    logoUrl: "",
    addressLine: "Rua Dr. João, 123",
    district: "Centro",
    cityState: "São João del-Rei/MG",
    distanceKm: 1.8,
    phone: "(32) 98888-0000",
    todayHours: "Hoje: 08:00–18:00",
    openNow: true,
    tags: ["telemedicina", "acessibilidade", "estacionamento"],
    rating: 4.6,
    reviewCount: 128,
  },
  {
    id: "cl002",
    name: "CardioCare",
    logoUrl: "",
    addressLine: "Av. Tiradentes, 450",
    district: "Colônia",
    cityState: "São João del-Rei/MG",
    distanceKm: 4.2,
    phone: "(32) 97777-1111",
    todayHours: "Hoje: 07:30–17:30",
    openNow: false,
    tags: ["acessibilidade"],
    rating: 4.8,
    reviewCount: 312,
  },
  {
    id: "cl003",
    name: "Orto+",
    logoUrl: "",
    addressLine: "Rua das Palmeiras, 55",
    district: "Bonfim",
    cityState: "São João del-Rei/MG",
    distanceKm: 2.7,
    phone: "(32) 96666-2222",
    todayHours: "Hoje: 09:00–19:00",
    openNow: true,
    tags: ["estacionamento"],
    rating: 4.3,
    reviewCount: 89,
  },
  {
    id: "cl004",
    name: "Clínica Mulher",
    logoUrl: "",
    addressLine: "Rua das Flores, 800",
    district: "Centro",
    cityState: "São João del-Rei/MG",
    distanceKm: 0.9,
    phone: "(32) 95555-3333",
    todayHours: "Hoje: 08:00–18:00",
    openNow: true,
    tags: ["telemedicina", "acessibilidade"],
    rating: 4.7,
    reviewCount: 154,
  },
  {
    id: "cl005",
    name: "Visão Plena",
    logoUrl: "",
    addressLine: "Alameda Minas, 200",
    district: "Água Limpa",
    cityState: "São João del-Rei/MG",
    distanceKm: 6.1,
    phone: "(32) 94444-4444",
    todayHours: "Hoje: 10:00–16:00",
    openNow: false,
    tags: [],
    rating: 4.1,
    reviewCount: 65,
  },
  {
    id: "cl006",
    name: "Mente Ser",
    logoUrl: "",
    addressLine: "Rua do Carmo, 12",
    district: "Centro",
    cityState: "São João del-Rei/MG",
    distanceKm: 1.1,
    phone: "(32) 93333-5555",
    todayHours: "Hoje: 08:00–20:00",
    openNow: true,
    tags: ["telemedicina"],
    rating: 4.9,
    reviewCount: 420,
  },
  {
    id: "cl007",
    name: "EndoVida",
    logoUrl: "",
    addressLine: "Av. Leite de Castro, 1030",
    district: "Fábricas",
    cityState: "São João del-Rei/MG",
    distanceKm: 3.5,
    phone: "(32) 92222-6666",
    todayHours: "Hoje: 07:00–15:00",
    openNow: false,
    tags: ["acessibilidade", "estacionamento"],
    rating: 4.0,
    reviewCount: 38,
  },
  {
    id: "cl008",
    name: "NeuroCare",
    logoUrl: "",
    addressLine: "Rua Direita, 400",
    district: "Centro",
    cityState: "São João del-Rei/MG",
    distanceKm: 2.2,
    phone: "(32) 91111-7777",
    todayHours: "Hoje: 08:00–18:00",
    openNow: true,
    tags: ["telemedicina", "estacionamento"],
    rating: 4.5,
    reviewCount: 97,
  },
];

// ====== Helpers
function norm(str = "") {
  return str
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase();
}

export default function ClinicsSearchPage() {
  const [query, setQuery] = useState("");
  const [submittedQuery, setSubmittedQuery] = useState("");

  const [nearMe, setNearMe] = useState(false);
  const [tele, setTele] = useState(false);
  const [acess, setAcess] = useState(false);
  const [park, setPark] = useState(false);
  const [openNow, setOpenNow] = useState(false);

  const handleSubmit = useCallback((q) => {
    setSubmittedQuery(q.trim());
  }, []);

  // Filtro principal
  const filtered = useMemo(() => {
    const q = norm(submittedQuery);
    let list = mockClinics.filter((c) => {
      const hay = [
        c.name,
        c.addressLine,
        c.district,
        c.cityState,
        ...(c.tags || []),
      ]
        .filter(Boolean)
        .map(norm)
        .join(" ");

      if (q && !hay.includes(q)) return false;

      // chips
      if (tele && !(c.tags || []).includes("telemedicina")) return false;
      if (acess && !(c.tags || []).includes("acessibilidade")) return false;
      if (park && !(c.tags || []).includes("estacionamento")) return false;
      if (openNow && !c.openNow) return false;

      return true;
    });

    if (nearMe) {
      list = list.slice().sort((a, b) => (a.distanceKm ?? 999) - (b.distanceKm ?? 999));
    } else {
      list = list
        .slice()
        .sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0) || (a.distanceKm ?? 999) - (b.distanceKm ?? 999));
    }

    return list;
  }, [submittedQuery, nearMe, tele, acess, park, openNow]);

  return (
    <main className={`container stack-lg ${s.page} ${utils.withNavOffsetPadding}`} aria-labelledby="clinics-title">
      {/* Título/Subtítulo */}
      <header className="stack">
        <h1 id="clinics-title" className={typey.titleLg}>Buscar clínicas</h1>
        <p className={typey.bodyMd}>
          Encontre unidades por nome, endereço ou especialidade. Use os filtros rápidos para refinar.
        </p>
      </header>

      {/* Barra de pesquisa */}
      <SearchBar
        query={query}
        setQuery={setQuery}
        onSubmit={handleSubmit}
        placeholder="Ex.: Clínica Vida, cardiologia Centro, telemedicina…"
        submitLabel="Buscar"
      />

      {/* Chips rápidos */}
      <section className={fx.chipSurface} aria-label="Filtros rápidos">
        <div className={fx.chipGroup} role="group" aria-label="Filtros rápidos">
          <button
            type="button"
            className={fx.chip}
            aria-pressed={nearMe}
            onClick={() => setNearMe((v) => !v)}
          >
            Próximas de mim
          </button>
          <button
            type="button"
            className={fx.chip}
            aria-pressed={tele}
            onClick={() => setTele((v) => !v)}
          >
            Telemedicina
          </button>
          <button
            type="button"
            className={fx.chip}
            aria-pressed={acess}
            onClick={() => setAcess((v) => !v)}
          >
            Acessibilidade
          </button>
          <button
            type="button"
            className={fx.chip}
            aria-pressed={park}
            onClick={() => setPark((v) => !v)}
          >
            Estacionamento
          </button>
          <button
            type="button"
            className={fx.chip}
            aria-pressed={openNow}
            onClick={() => setOpenNow((v) => !v)}
          >
            Aberto agora
          </button>
        </div>
      </section>

      {/* Resultado */}
      <div aria-live="polite" className="stack">
        <p className={typey.captionSm}>
          {filtered.length} {filtered.length === 1 ? "resultado" : "resultados"}
          {submittedQuery ? ` para “${submittedQuery}”` : ""}
          {nearMe ? " • ordenado por distância" : " • ordenado por avaliação"}
        </p>

        {/* Lista de cards */}
        <div className="stack">
          {filtered.length === 0 ? (
            <div className="stack">
              <p className={typey.bodyMd}>
                Nenhuma clínica encontrada. Ajuste os filtros ou tente outro termo.
              </p>
              <button
                type="button"
                className={`${btn.btn} ${btn.btnGhost || ""}`}
                onClick={() => {
                  setQuery("");
                  setSubmittedQuery("");
                  setNearMe(false);
                  setTele(false);
                  setAcess(false);
                  setPark(false);
                  setOpenNow(false);
                }}
              >
                Limpar filtros
              </button>
            </div>
          ) : (
            filtered.map((c) => (
              <ClinicCard
                key={c.id}
                {...c}
                onView={() => console.log("Ver detalhes:", c.id)}
                onCall={() => console.log("Ligar:", c.phone)}
                onDirections={() => console.log("Rotas para:", c.name)}
              />
            ))
          )}
        </div>
      </div>
    </main>
  );
}
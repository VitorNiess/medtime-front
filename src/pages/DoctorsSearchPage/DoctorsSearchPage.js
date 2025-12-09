// src/pages/DoctorsSearchPage/DoctorsSearchPage.jsx
import React, {
  useState,
  useMemo,
  useCallback,
  useEffect,
} from "react";

import { listMedicos } from "../../services/medicos";
import { listarHorariosDisponiveis } from "../../services/calendario";
import { agendarConsulta } from "../../services/agenda";

// Estilos
import s from "./doctorsSearchPage.module.css";
import typey from "../../styles/primitives/typography.module.css";
import btn from "../../styles/primitives/buttons.module.css";
import fx from "../../styles/primitives/form-extras.module.css";
import utils from "../../styles/base/utilities.module.css";

// Componentes
import SearchBar from "../../components/SearchBar/SearchBar";
import DoctorCard from "../../components/DoctorCard/DoctorCard";

// ====== Helpers
function norm(str = "") {
  return str
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase();
}

function isSameDay(a, b) {
  if (!a || !b) return false;
  const da = new Date(a);
  const db = new Date(b);
  if (isNaN(da.getTime()) || isNaN(db.getTime())) return false;

  return (
    da.getFullYear() === db.getFullYear() &&
    da.getMonth() === db.getMonth() &&
    da.getDate() === db.getDate()
  );
}

function formatSlotDate(slot) {
  if (!slot?.horario_inicio) return "";
  const d = new Date(slot.horario_inicio);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleDateString("pt-BR", {
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
  });
}

function formatSlotTimeRange(slot) {
  if (!slot?.horario_inicio || !slot?.horario_fim) return "";
  const ini = new Date(slot.horario_inicio);
  const fim = new Date(slot.horario_fim);
  if (isNaN(ini.getTime()) || isNaN(fim.getTime())) return "";
  const hIni = ini.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });
  const hFim = fim.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });
  return `${hIni} – ${hFim}`;
}

function DoctorsSearchPage() {
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

  // Dados vindos da API
  const [doctorsApi, setDoctorsApi] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Estado do modal de agendamento
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [slotsError, setSlotsError] = useState(null);
  const [slots, setSlots] = useState([]);

  // Estado de agendamento dentro do modal
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [bookingSaving, setBookingSaving] = useState(false);
  const [bookingMessage, setBookingMessage] = useState(null);
  const [bookingError, setBookingError] = useState(null);

  // ===========================
  // Carregar médicos da API
  // ===========================
  useEffect(() => {
    let cancelled = false;

    async function fetchDoctors() {
      setLoading(true);
      setError(null);

      try {
        const res = await listMedicos();

        if (cancelled) return;

        if (!res.ok) {
          setError(res.error || "Falha ao carregar lista de médicos.");
          setDoctorsApi([]);
          return;
        }

        const medicos = res.medicos || [];
        setDoctorsApi(Array.isArray(medicos) ? medicos : []);
      } catch (e) {
        console.error("[DoctorsSearchPage] erro ao listar médicos:", e);
        if (!cancelled) {
          setError(
            "Erro ao carregar médicos. Verifique sua conexão ou tente novamente."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchDoctors();

    return () => {
      cancelled = true;
    };
  }, []);

  const handleSubmit = useCallback((q) => {
    setSubmittedQuery(q.trim());
  }, []);

  // ===========================
  // Normalização p/ DoctorCard
  // ===========================
  const normalizedDoctors = useMemo(() => {
    // Backend retorna:
    // { id_medico, crm, nome, especialidade }
    return (doctorsApi || []).map((m) => ({
      id: m.id_medico ?? m.id,
      id_medico: m.id_medico ?? m.id,
      image: "",
      name: m.nome || "",
      specialization: m.especialidade || "",
      crm: String(m.crm ?? ""),
      clinic: "",
      badges: [],
      nextSlot: null,
      distanceKm: null,
    }));
  }, [doctorsApi]);

  // ===========================
  // Buscar horários ao abrir modal
  // ===========================
  async function handleOpenBooking(doctor) {
    setSelectedDoctor(doctor);
    setBookingModalOpen(true);
    setSlots([]);
    setSlotsError(null);
    setSlotsLoading(true);
    setSelectedSlot(null);
    setBookingMessage(null);
    setBookingError(null);

    try {
      const idMedico = doctor.id_medico ?? doctor.id;
      // Não temos id_unidade aqui, então passamos string vazia.
      const res = await listarHorariosDisponiveis(idMedico, "");

      // listarHorariosDisponiveis, no sucesso, retorna diretamente o array de slots.
      // Em erro, retorna { error: "...", status? }.
      if (Array.isArray(res)) {
        setSlots(res);
      } else if (res && res.error) {
        setSlotsError(res.error || "Erro ao carregar horários disponíveis.");
      } else {
        setSlotsError("Resposta inesperada ao carregar horários.");
      }
    } catch (e) {
      console.error("[DoctorsSearchPage] erro ao buscar horários:", e);
      setSlotsError("Erro ao carregar horários. Tente novamente.");
    } finally {
      setSlotsLoading(false);
    }
  }

  function handleCloseBookingModal() {
    setBookingModalOpen(false);
    setSelectedDoctor(null);
    setSlots([]);
    setSlotsError(null);
    setSlotsLoading(false);
    setSelectedSlot(null);
    setBookingMessage(null);
    setBookingError(null);
  }

  function handleSelectSlot(slot) {
    setSelectedSlot(slot);
    setBookingMessage(null);
    setBookingError(null);
  }

  // Confirma o agendamento de fato
  async function handleConfirmBooking() {
    if (!selectedSlot) return;

    setBookingSaving(true);
    setBookingError(null);
    setBookingMessage(null);

    try {
      const res = await agendarConsulta({
        id_calendario_medico: selectedSlot.id_calendario_medico,
      });

      if (!res.ok) {
        setBookingError(
          res.error || "Falha ao agendar consulta. Tente novamente."
        );
        return;
      }

      // Sucesso!
      setBookingMessage("Consulta agendada com sucesso!");

      // Remove o slot agendado da lista para não aparecer mais como disponível
      setSlots((prev) =>
        prev.filter(
          (s) =>
            s.id_calendario_medico !== selectedSlot.id_calendario_medico
        )
      );

      setSelectedSlot(null);
    } catch (e) {
      console.error("[DoctorsSearchPage] erro ao agendar consulta:", e);
      setBookingError("Erro ao agendar consulta. Tente novamente.");
    } finally {
      setBookingSaving(false);
    }
  }

  // ===========================
  // Filtro de busca + chips
  // ===========================
  const filtered = useMemo(() => {
    const q = norm(submittedQuery);

    let list = normalizedDoctors.filter((d) => {
      const hay = [
        d.name,
        d.specialization,
        d.crm,
        d.clinic,
        ...(d.badges || []).map((b) =>
          [b.type, b.value].filter(Boolean).join(" ")
        ),
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
        .sort(
          (a, b) =>
            (a.distanceKm ?? Number.POSITIVE_INFINITY) -
            (b.distanceKm ?? Number.POSITIVE_INFINITY)
        );
    } else {
      list = list
        .slice()
        .sort(
          (a, b) =>
            new Date(a.nextSlot || 0).getTime() -
            new Date(b.nextSlot || 0).getTime()
        );
    }

    return list;
  }, [
    submittedQuery,
    nearMe,
    tele,
    sus,
    rampa,
    libras,
    infantil,
    withPrice,
    availableToday,
    normalizedDoctors,
  ]);

  const resultsLabel =
    filtered.length === 1 ? "1 resultado" : `${filtered.length} resultados`;

  // ===========================
  // Render
  // ===========================
  return (
    <main
      className={`container stack-lg ${s.page} ${utils.withNavOffsetPadding}`}
      aria-labelledby="doctors-title"
    >
      <header className="stack">
        <h1 id="doctors-title" className={typey.titleLg}>
          Buscar médicos
        </h1>
        <p className={typey.bodyMd}>
          Encontre profissionais por nome, CRM ou especialidade.
        </p>
      </header>

      {/* Barra de pesquisa */}
      <SearchBar
        query={query}
        setQuery={setQuery}
        onSubmit={handleSubmit}
        placeholder="Ex.: Dermatologia, Renato, CRM 123..."
        submitLabel="Buscar"
        theme="default"
      />

      {/* Chips rápidos */}
      <section className={fx.chipSurface} aria-label="Filtros rápidos">
        <div
          className={fx.chipGroup}
          role="group"
          aria-label="Filtros rápidos"
        >
          <button
            type="button"
            className={fx.chip}
            aria-pressed={nearMe}
            onClick={() => setNearMe((v) => !v)}
          >
            Próximos de mim
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
            aria-pressed={sus}
            onClick={() => setSus((v) => !v)}
          >
            Atende SUS
          </button>
          <button
            type="button"
            className={fx.chip}
            aria-pressed={rampa}
            onClick={() => setRampa((v) => !v)}
          >
            Rampa
          </button>
          <button
            type="button"
            className={fx.chip}
            aria-pressed={libras}
            onClick={() => setLibras((v) => !v)}
          >
            Libras
          </button>
          <button
            type="button"
            className={fx.chip}
            aria-pressed={infantil}
            onClick={() => setInfantil((v) => !v)}
          >
            Atende infantil
          </button>
          <button
            type="button"
            className={fx.chip}
            aria-pressed={withPrice}
            onClick={() => setWithPrice((v) => !v)}
          >
            Com preço
          </button>
          <button
            type="button"
            className={fx.chip}
            aria-pressed={availableToday}
            onClick={() => setAvailableToday((v) => !v)}
          >
            Disponíveis hoje
          </button>
        </div>
      </section>

      {/* Resultado */}
      <div aria-live="polite" className="stack">
        {loading && <p className={typey.bodyMd}>Carregando médicos…</p>}

        {!loading && error && (
          <p
            className={typey.bodyMd}
            style={{ color: "var(--color-danger)" }}
          >
            {error}
          </p>
        )}

        {!loading && !error && (
          <>
            <p className={typey.captionSm}>
              {resultsLabel}
              {submittedQuery ? ` para “${submittedQuery}”` : ""}
              {nearMe
                ? " • ordenado por distância (quando disponível)"
                : " • ordenado por disponibilidade (quando disponível)"}
            </p>

            <div className="stack">
              {filtered.length === 0 ? (
                <div className="stack">
                  <p className={typey.bodyMd}>
                    Nenhum médico encontrado. Ajuste os filtros ou tente outro
                    termo.
                  </p>
                  <button
                    type="button"
                    className={`${btn.btn} ${btn.btnGhost}`}
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
                    onViewDetails={(payload) =>
                      console.log("Ver detalhes:", payload)
                    }
                    onBook={() => handleOpenBooking(d)}
                    viewDisabled={false}
                    bookDisabled={false}
                  />
                ))
              )}
            </div>
          </>
        )}
      </div>

      {/* Modal de horários disponíveis */}
      {bookingModalOpen && (
        <div
          className={s.modalOverlay}
          role="dialog"
          aria-modal="true"
          aria-label="Horários disponíveis"
          onClick={handleCloseBookingModal}
        >
          <div
            className={s.modal}
            onClick={(e) => e.stopPropagation()}
          >
            <header className={s.modalHeader}>
              <h2 className={typey.titleSm}>
                Horários disponíveis
                {selectedDoctor ? ` – ${selectedDoctor.name}` : ""}
              </h2>
            </header>

            <div className={s.modalBody}>
              {slotsLoading && (
                <p className={typey.bodyMd}>Carregando horários…</p>
              )}

              {!slotsLoading && slotsError && (
                <p
                  className={typey.bodyMd}
                  style={{ color: "var(--color-danger)" }}
                >
                  {slotsError}
                </p>
              )}

              {!slotsLoading && !slotsError && slots.length === 0 && (
                <p className={typey.bodyMd}>
                  Nenhum horário disponível para este médico.
                </p>
              )}

              {!slotsLoading && !slotsError && slots.length > 0 && (
                <div className={s.slotList}>
                  {slots.map((slot) => {
                    const isSelected =
                      selectedSlot &&
                      selectedSlot.id_calendario_medico ===
                        slot.id_calendario_medico;

                    return (
                      <button
                        key={slot.id_calendario_medico}
                        type="button"
                        className={`${s.slotItem} ${
                          isSelected ? s.slotItemSelected || "" : ""
                        }`}
                        onClick={() => handleSelectSlot(slot)}
                      >
                        <span className={s.slotDate}>
                          {formatSlotDate(slot)}
                        </span>
                        <span className={s.slotTime}>
                          {formatSlotTimeRange(slot)}
                        </span>
                        {slot.unidade?.nome && (
                          <span className={s.slotClinic}>
                            {slot.unidade.nome}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}

              {bookingMessage && (
                <p
                  className={typey.bodySm}
                  style={{ color: "var(--color-success, #16a34a)", marginTop: "0.75rem" }}
                >
                  {bookingMessage}
                </p>
              )}
              {bookingError && (
                <p
                  className={typey.bodySm}
                  style={{ color: "var(--color-danger)", marginTop: "0.75rem" }}
                >
                  {bookingError}
                </p>
              )}
            </div>

            <footer className={s.modalFooter}>
              <button
                type="button"
                className={`${btn.btn} ${btn.btnGhost}`}
                onClick={handleCloseBookingModal}
                disabled={bookingSaving}
              >
                Fechar
              </button>

              {slots.length > 0 && (
                <button
                  type="button"
                  className={`${btn.btn} ${btn.btnPrimary}`}
                  onClick={handleConfirmBooking}
                  disabled={!selectedSlot || bookingSaving}
                >
                  {bookingSaving ? "Agendando…" : "Confirmar agendamento"}
                </button>
              )}
            </footer>
          </div>
        </div>
      )}
    </main>
  );
}

export default DoctorsSearchPage;
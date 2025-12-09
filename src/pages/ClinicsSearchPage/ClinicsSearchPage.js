// src/pages/ClinicsSearchPage/ClinicsSearchPage.jsx
import React, {
  useMemo,
  useState,
  useCallback,
  useEffect,
} from "react";

// Services
import {
  listUnidades,
  listMedicosByUnidade,
} from "../../services/unidades";
import { listarHorariosDisponiveis } from "../../services/calendario";
import { agendarConsulta } from "../../services/agenda";

// Estilos
import s from "./clinicsSearchPage.module.css";
import typey from "../../styles/primitives/typography.module.css";
import btn from "../../styles/primitives/buttons.module.css";
import fx from "../../styles/primitives/form-extras.module.css";
import utils from "../../styles/base/utilities.module.css";

// Componentes existentes
import SearchBar from "../../components/SearchBar/SearchBar";
import ClinicCard from "../../components/ClinicCard/ClinicCard";

// ====== Helpers
function norm(str = "") {
  return str
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase();
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

export default function ClinicsSearchPage() {
  const [query, setQuery] = useState("");
  const [submittedQuery, setSubmittedQuery] = useState("");

  const [nearMe, setNearMe] = useState(false);
  const [tele, setTele] = useState(false);
  const [acess, setAcess] = useState(false);
  const [park, setPark] = useState(false);
  const [openNow, setOpenNow] = useState(false);

  // ==== Unidades vindas da API ====
  const [clinics, setClinics] = useState([]);
  const [loadingClinics, setLoadingClinics] = useState(true);
  const [errorClinics, setErrorClinics] = useState(null);

  // ==== Modal de médicos da unidade ====
  const [clinicModalOpen, setClinicModalOpen] = useState(false);
  const [selectedClinic, setSelectedClinic] = useState(null);
  const [clinicDoctors, setClinicDoctors] = useState([]);
  const [clinicDoctorsLoading, setClinicDoctorsLoading] = useState(false);
  const [clinicDoctorsError, setClinicDoctorsError] = useState(null);

  // ==== Horários do médico ====
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [slots, setSlots] = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [slotsError, setSlotsError] = useState(null);

  // ==== Estado do agendamento do slot ====
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState(null);
  const [bookingSuccess, setBookingSuccess] = useState(null);

  // ===============================
  // Carregar unidades da API
  // ===============================
  useEffect(() => {
    let cancelled = false;

    async function fetchUnidades() {
      console.log("[ClinicsSearchPage] listUnidades()…");
      setLoadingClinics(true);
      setErrorClinics(null);

      try {
        const data = await listUnidades(); // retorna [] em erro
        if (cancelled) return;

        console.log("[ClinicsSearchPage] unidades brutas:", data);

        const mapped = (data || []).map((u, idx) => {
          const id = u.id_unidade ?? u.id ?? idx;
          return {
            id,
            id_unidade: u.id_unidade ?? u.id ?? id,
            name: u.nome || "Unidade",
            logoUrl: "",
            addressLine: u.endereco || "",
            district: "",
            cityState: "",
            distanceKm: null,
            phone: u.telefone || "",
            todayHours: "",
            openNow: true,
            tags: [],
            rating: null,
            reviewCount: null,
            _raw: u,
          };
        });

        console.log("[ClinicsSearchPage] unidades mapeadas:", mapped);
        setClinics(mapped);
      } catch (e) {
        console.error("[ClinicsSearchPage] erro ao carregar unidades:", e);
        if (!cancelled) {
          setErrorClinics(
            "Erro ao carregar unidades. Verifique sua conexão ou tente novamente."
          );
          setClinics([]);
        }
      } finally {
        if (!cancelled) setLoadingClinics(false);
      }
    }

    fetchUnidades();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleSubmit = useCallback((q) => {
    setSubmittedQuery(q.trim());
  }, []);

  // ===============================
  // Filtro principal (clínicas)
  // ===============================
  const filtered = useMemo(() => {
    const q = norm(submittedQuery);

    let list = (clinics || []).filter((c) => {
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

      if (tele && !(c.tags || []).includes("telemedicina")) return false;
      if (acess && !(c.tags || []).includes("acessibilidade")) return false;
      if (park && !(c.tags || []).includes("estacionamento")) return false;
      if (openNow && c.openNow === false) return false;

      return true;
    });

    if (nearMe) {
      list = list
        .slice()
        .sort(
          (a, b) => (a.distanceKm ?? 999) - (b.distanceKm ?? 999)
        );
    } else {
      list = list
        .slice()
        .sort(
          (a, b) =>
            (b.rating ?? 0) - (a.rating ?? 0) ||
            (a.distanceKm ?? 999) - (b.distanceKm ?? 999)
        );
    }

    return list;
  }, [submittedQuery, nearMe, tele, acess, park, openNow, clinics]);

  // ===============================
  // Abrir modal de médicos da unidade
  // ===============================
  const handleOpenClinicDoctors = useCallback(async (clinic) => {
    console.log("[ClinicsSearchPage] abrir modal unidade:", clinic);
    setSelectedClinic(clinic);
    setClinicModalOpen(true);

    setClinicDoctors([]);
    setClinicDoctorsError(null);
    setSelectedDoctor(null);
    setSlots([]);
    setSlotsError(null);
    setSlotsLoading(false);
    setBookingError(null);
    setBookingSuccess(null);
    setBookingLoading(false);

    setClinicDoctorsLoading(true);
    try {
      const idUnidade = clinic.id_unidade ?? clinic.id;
      console.log("[ClinicsSearchPage] listMedicosByUnidade id:", idUnidade);

      const res = await listMedicosByUnidade(idUnidade);

      console.log("[ClinicsSearchPage] resultado listMedicosByUnidade:", res);

      if (!res.ok) {
        setClinicDoctorsError(res.error || "Falha ao carregar médicos.");
        setClinicDoctors([]);
        return;
      }

      const medicos = res.medicos || [];
      setClinicDoctors(medicos);
    } catch (e) {
      console.error("[ClinicsSearchPage] erro ao carregar médicos:", e);
      setClinicDoctorsError(
        "Erro ao carregar médicos. Tente novamente."
      );
      setClinicDoctors([]);
    } finally {
      setClinicDoctorsLoading(false);
    }
  }, []);

  const handleCloseClinicModal = useCallback(() => {
    setClinicModalOpen(false);
    setSelectedClinic(null);
    setClinicDoctors([]);
    setClinicDoctorsError(null);
    setClinicDoctorsLoading(false);
    setSelectedDoctor(null);
    setSlots([]);
    setSlotsError(null);
    setSlotsLoading(false);
    setBookingError(null);
    setBookingSuccess(null);
    setBookingLoading(false);
  }, []);

  // ===============================
  // Abrir horários disponíveis do médico
  // ===============================
  const handleOpenDoctorSlots = useCallback(
    async (doctor) => {
      if (!selectedClinic) return;

      console.log("[ClinicsSearchPage] abrir horários para médico:", doctor);
      setSelectedDoctor(doctor);
      setSlots([]);
      setSlotsError(null);
      setSlotsLoading(true);
      setBookingError(null);
      setBookingSuccess(null);
      setBookingLoading(false);

      try {
        const idMedico = doctor.id_medico ?? doctor.id;
        const idUnidade = selectedClinic.id_unidade ?? selectedClinic.id;

        console.log(
          "[ClinicsSearchPage] listarHorariosDisponiveis medico/unidade:",
          idMedico,
          idUnidade
        );

        const res = await listarHorariosDisponiveis(idMedico, idUnidade);

        console.log("[ClinicsSearchPage] resposta listarHorariosDisponiveis:", res);

        if (Array.isArray(res)) {
          setSlots(res);
        } else if (res && res.error) {
          setSlotsError(res.error || "Erro ao carregar horários.");
        } else {
          setSlotsError("Resposta inesperada ao carregar horários.");
        }
      } catch (e) {
        console.error("[ClinicsSearchPage] erro ao buscar horários:", e);
        setSlotsError("Erro ao carregar horários. Tente novamente.");
      } finally {
        setSlotsLoading(false);
      }
    },
    [selectedClinic]
  );

  const handleBackToDoctors = useCallback(() => {
    setSelectedDoctor(null);
    setSlots([]);
    setSlotsError(null);
    setSlotsLoading(false);
    setBookingError(null);
    setBookingSuccess(null);
    setBookingLoading(false);
  }, []);

  // ===============================
  // Selecionar slot -> AGENDAR de fato
  // ===============================
  const handleSelectSlot = useCallback(async (slot) => {
    if (!slot?.id_calendario_medico) return;

    console.log("[ClinicsSearchPage] agendar slot:", slot);
    setBookingError(null);
    setBookingSuccess(null);
    setBookingLoading(true);

    try {
      const res = await agendarConsulta({
        id_calendario_medico: slot.id_calendario_medico,
      });

      console.log("[ClinicsSearchPage] resposta agendarConsulta:", res);

      if (!res.ok) {
        setBookingError(
          res.error || "Falha ao agendar consulta. Tente novamente."
        );
        return;
      }

      // Sucesso
      setBookingSuccess("Consulta agendada com sucesso!");
      // Remove o slot da lista (já ficou ocupado)
      setSlots((prev) =>
        Array.isArray(prev)
          ? prev.filter(
              (s) => s.id_calendario_medico !== slot.id_calendario_medico
            )
          : prev
      );
    } catch (e) {
      console.error("[ClinicsSearchPage] erro ao agendar consulta:", e);
      setBookingError(
        "Erro ao agendar consulta. Verifique sua conexão e tente novamente."
      );
    } finally {
      setBookingLoading(false);
    }
  }, []);

  // ===============================
  // Render
  // ===============================
  const resultsLabel =
    filtered.length === 1
      ? "1 resultado"
      : `${filtered.length} resultados`;

  return (
    <main
      className={`container stack-lg ${s.page} ${utils.withNavOffsetPadding}`}
      aria-labelledby="clinics-title"
    >
      {/* Título/Subtítulo */}
      <header className="stack">
        <h1 id="clinics-title" className={typey.titleLg}>
          Buscar clínicas
        </h1>
        <p className={typey.bodyMd}>
          Encontre unidades por nome, endereço ou especialidade. Use os
          filtros rápidos para refinar.
        </p>
      </header>

      {/* Barra de pesquisa */}
      <SearchBar
        query={query}
        setQuery={setQuery}
        onSubmit={handleSubmit}
        placeholder="Ex.: Unidade Central, pronto atendimento, cardiologia…"
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
        {loadingClinics && (
          <p className={typey.bodyMd}>Carregando unidades…</p>
        )}

        {!loadingClinics && errorClinics && (
          <p className={typey.bodyMd} style={{ color: "var(--color-danger)" }}>
            {errorClinics}
          </p>
        )}

        {!loadingClinics && !errorClinics && (
          <>
            <p className={typey.captionSm}>
              {resultsLabel}
              {submittedQuery ? ` para “${submittedQuery}”` : ""}
              {nearMe
                ? " • ordenado por distância"
                : " • ordenado por avaliação"}
            </p>

            {/* Lista de cards */}
            <div className="stack">
              {filtered.length === 0 ? (
                <div className="stack">
                  <p className={typey.bodyMd}>
                    Nenhuma clínica encontrada. Ajuste os filtros ou tente
                    outro termo.
                  </p>
                  <button
                    type="button"
                    className={`${btn.btn} ${btn.btnGhost}`}
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
                    onView={() => handleOpenClinicDoctors(c)}
                    onCall={() =>
                      c.phone
                        ? window.open(`tel:${c.phone}`, "_self")
                        : console.log("Sem telefone para:", c)
                    }
                    onDirections={() =>
                      console.log("Rotas para:", c.name, c.addressLine)
                    }
                  />
                ))
              )}
            </div>
          </>
        )}
      </div>

      {/* Modal: Médicos da unidade + horários do médico */}
      {clinicModalOpen && (
        <div
          className={s.modalOverlay}
          role="dialog"
          aria-modal="true"
          aria-label="Médicos e horários da unidade"
          onClick={handleCloseClinicModal}
        >
          <div
            className={s.modal}
            onClick={(e) => e.stopPropagation()}
          >
            <header className={s.modalHeader}>
              <h2 className={typey.titleSm}>
                {selectedClinic
                  ? `Unidade: ${selectedClinic.name}`
                  : "Unidade"}
              </h2>
            </header>

            <div className={s.modalBody}>
              {/* Estado 1: Lista de médicos da unidade */}
              {!selectedDoctor && (
                <>
                  {clinicDoctorsLoading && (
                    <p className={typey.bodyMd}>Carregando médicos…</p>
                  )}

                  {!clinicDoctorsLoading && clinicDoctorsError && (
                    <p
                      className={typey.bodyMd}
                      style={{ color: "var(--color-danger)" }}
                    >
                      {clinicDoctorsError}
                    </p>
                  )}

                  {!clinicDoctorsLoading &&
                    !clinicDoctorsError &&
                    clinicDoctors.length === 0 && (
                      <p className={typey.bodyMd}>
                        Nenhum médico cadastrado para esta unidade.
                      </p>
                    )}

                  {!clinicDoctorsLoading &&
                    !clinicDoctorsError &&
                    clinicDoctors.length > 0 && (
                      <ul className={s.doctorList}>
                        {clinicDoctors.map((m) => (
                          <li key={m.id_medico ?? m.id} className={s.doctorItem}>
                            <div className={s.doctorInfo}>
                              <strong>{m.nome}</strong>
                              <span>{m.especialidade}</span>
                              {m.crm && (
                                <span className={s.doctorCrm}>
                                  CRM {m.crm}
                                </span>
                              )}
                            </div>
                            <button
                              type="button"
                              className={`${btn.btn} ${btn.btnPrimary}`}
                              onClick={() => handleOpenDoctorSlots(m)}
                            >
                              Ver horários
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                </>
              )}

              {/* Estado 2: Horários disponíveis do médico selecionado */}
              {selectedDoctor && (
                <div className="stack">
                  <p className={typey.bodyMd}>
                    Horários disponíveis –{" "}
                    <strong>{selectedDoctor.nome}</strong>
                    {selectedDoctor.especialidade
                      ? ` (${selectedDoctor.especialidade})`
                      : ""}
                  </p>

                  {bookingError && (
                    <p
                      className={typey.bodySm}
                      style={{ color: "var(--color-danger)" }}
                    >
                      {bookingError}
                    </p>
                  )}

                  {bookingSuccess && (
                    <p
                      className={typey.bodySm}
                      style={{
                        color: "var(--color-success, #15803d)",
                      }}
                    >
                      {bookingSuccess}
                    </p>
                  )}

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
                      {slots.map((slot) => (
                        <button
                          key={slot.id_calendario_medico}
                          type="button"
                          className={s.slotItem}
                          onClick={() => handleSelectSlot(slot)}
                          disabled={bookingLoading}
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
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            <footer className={s.modalFooter}>
              {selectedDoctor && (
                <button
                  type="button"
                  className={`${btn.btn} ${btn.btnGhost}`}
                  onClick={handleBackToDoctors}
                  disabled={bookingLoading}
                >
                  Voltar para médicos
                </button>
              )}
              <button
                type="button"
                className={`${btn.btn} ${btn.btnPrimary}`}
                onClick={handleCloseClinicModal}
                disabled={bookingLoading}
              >
                Fechar
              </button>
            </footer>
          </div>
        </div>
      )}
    </main>
  );
}
import React from "react";
import { useLocation } from "react-router-dom";
import btn from '../../styles/primitives/buttons.module.css';
import f from '../../styles/primitives/forms.module.css';
import fx from '../../styles/primitives/form-extras.module.css';
import sb from './searchbar.module.css'; // << novo CSS local
import { PiMagnifyingGlassBold } from "react-icons/pi";

/**
 * Barra de pesquisa reutilizável
 *
 * Props:
 * - query: string (valor do input)
 * - setQuery: (v: string) => void  (setter controlado pelo pai)
 * - onSubmit?: (q: string) => void (callback no submit)
 * - placeholder?: string
 * - submitLabel?: string
 * - ariaLabel?: string
 * - theme?: "auto" | "default" | "staff"  (padrão: "auto")
 *    - "auto": usa a rota; se começar com /clinics, aplica staff
 *    - "default": usa o tema padrão (verde)
 *    - "staff": força o tema azul (staff)
 */
export default function SearchBar({
  query,
  setQuery,
  onSubmit,
  placeholder = "Ex.: Dermatite, Ortopedia Savassi, Clínica da Família…",
  submitLabel = "Buscar",
  ariaLabel = "Pesquisar condições, médicos ou unidades",
  theme = "auto",
}) {
  const location = useLocation();
  const isClinicsRoute = location.pathname === '/clinics' || location.pathname.startsWith('/clinics/');
  const isStaff = theme === 'staff' || (theme === 'auto' && isClinicsRoute);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit?.(query);
  };

  return (
    <form
      className={`${fx.searchBar} ${sb.root} ${isStaff ? sb.staff : ''}`}
      role="search"
      aria-label={ariaLabel}
      onSubmit={handleSubmit}
    >
      <div className={`${f.inputWrap} ${fx.searchField}`}>
        <PiMagnifyingGlassBold className={`${f.iconLeft} ${sb.icon}`} aria-hidden="true" />
        <input
          type="search"
          className={`${f.input} ${f.withIconLeft}`}
          placeholder={placeholder}
          aria-label="Pesquisar"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      <button
        type="submit"
        className={`${btn.btn} ${btn.btnPrimary} ${fx.searchBtn}`}
      >
        {submitLabel}
      </button>
    </form>
  );
}
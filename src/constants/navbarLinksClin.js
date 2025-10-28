// src/constants/navbarLinksClin.js
import {
  PiHouseBold,
  PiCalendarBold,
  PiUsersBold,
  PiStethoscopeBold,
  PiBuildingsBold,
  PiCurrencyDollarBold,
  PiChartBarBold,
  PiGearSixBold,
  PiQuestionBold
} from "react-icons/pi";

const navbarLinksClin = [
  { id: 'profissionais', path: '/clinics/pros',      label: 'Profissionais', icon: <PiStethoscopeBold /> },
  { id: 'unidades',    path: '/clinics/unidades',    label: 'Unidades',      icon: <PiBuildingsBold /> },
  { id: 'financeiro',  path: '/clinics/financeiro',  label: 'Financeiro',    icon: <PiCurrencyDollarBold /> },
  { id: 'relatorios',  path: '/clinics/relatorios',  label: 'Relatórios',    icon: <PiChartBarBold /> },
  { id: 'config',      path: '/clinics/config',      label: 'Configurações', icon: <PiGearSixBold /> },
  { id: 'ajuda',       path: '/clinics/ajuda',       label: 'Ajuda',         icon: <PiQuestionBold /> },
];

export default navbarLinksClin;

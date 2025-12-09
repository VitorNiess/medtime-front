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
  { id: 'unidades',    path: '/clinics/unidades',    label: 'Unidades',      icon: <PiBuildingsBold /> },
  { id: 'relatorios',  path: '/clinics/relatorios',  label: 'Relatórios',    icon: <PiChartBarBold /> },
];

export default navbarLinksClin;

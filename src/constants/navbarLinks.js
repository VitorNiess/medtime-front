import {
  PiQuestionBold,
  PiBuildingsBold,
  PiCalendarBold,
  PiMagnifyingGlassBold,
  PiHouse,
} from "react-icons/pi";

import { FaUserDoctor } from "react-icons/fa6";

const navItems = [
  {
    id: "inicio",
    label: "Início",
    path: "/home",
    icon: <PiHouse />,
  },
  {
    id: "agenda",
    label: "Agenda",
    path: "/agenda",
    icon: <PiCalendarBold />,
  },
  {
    id: "medicos",
    label: "Médicos",
    path: "/medicos",
    icon: <FaUserDoctor />,
  },
  {
    id: "unidades",
    label: "Clínicas",
    path: "/unidades",
    icon: <PiBuildingsBold />,
  },
  {
    id: 'ajuda',
    path: '/ajuda',
    label: 'Ajuda',
    icon: <PiQuestionBold /> },
];

export default navItems;
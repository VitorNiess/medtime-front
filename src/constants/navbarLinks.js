import { LuHospital } from "react-icons/lu";
import { GiHealthNormal } from "react-icons/gi";
import { FaUserDoctor } from "react-icons/fa6";

const navItems = [
  {
    id: "medicos",
    label: "Médicos",
    path: "/medicos",
    icon: <FaUserDoctor />,
  },
  {
    id: "esp",
    label: "Especializações",
    path: "/esp",
    icon: <GiHealthNormal />,
  },
  {
    id: "unidades",
    label: "Unidades",
    path: "/unidades",
    icon: <LuHospital />,
  },
];

export default navItems;
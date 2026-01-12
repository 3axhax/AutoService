import { Link } from "react-router-dom";
import {Tire} from "@shared/ui/Icons/Tire.tsx";

export const Logo = () => {
  return (
    <Link to={"/"} title={"Главная"} className={"logo"}>
      <Tire className="h-10 w-10 text-green-800 dark:text-white" />
        <span className={"uppercase text-3xl tracking-tight"}>Tire service</span>
    </Link>
  );
};

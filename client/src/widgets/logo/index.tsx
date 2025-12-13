import { Cog6ToothIcon } from "@heroicons/react/24/outline";
import { Link } from "react-router-dom";

export const Logo = () => {
  return (
    <Link to={"/"} title={"Главная"} className={"logo"}>
      <Cog6ToothIcon className="h-10 w-10 text-green-800 mr-2" />
      <p className={"logo__text"}>
        <span className={"text-nowrap text-base tracking-wider"}>
          Auto Service
        </span>
        <span className={"uppercase text-lg/4"}>Tire service</span>
      </p>
    </Link>
  );
};

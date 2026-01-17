import { Link } from "react-router-dom";
import { Tire } from "@shared/ui/Icons/Tire.tsx";

export const Logo = () => {
  return (
    <Link to={"/"} title={"Главная"} className={"logo"}>
      <Tire className="h-8 w-8 mr-1 text-green-800 dark:text-white" />
      <span
        className={
          "uppercase font-bold text-4xl/7 tracking-wide outlined-heading"
        }
      >
        Tire service
      </span>
    </Link>
  );
};

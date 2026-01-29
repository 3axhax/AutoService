import { Link } from "react-router-dom";
import { Tire } from "@shared/ui/Icons/Tire.tsx";

export const Logo = () => {
  return (
    <Link to={"/"} title={"Главная"} className={"flex items-center lg:mr-8"}>
      <Tire className="h-8 w-8 mr-1 text-white dark:text-white" />
      <span
        className={
          "font-sans uppercase font-medium text/8 lg:text-3xl/7 blue-dark outlined-heading"
        }
      >
        Tire service
      </span>
    </Link>
  );
};

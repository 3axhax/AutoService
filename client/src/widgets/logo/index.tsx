import { Link } from "react-router-dom";
import { Tire } from "@shared/ui/Icons/Tire.tsx";

export const Logo = () => {
  return (
    <Link to={"/"} title={"Главная"} className={"flex items-center mr-8"}>
      <Tire className="h-8 w-8 mr-1 blue-dark dark:text-white" />
      <span
        className={
          "font-sans uppercase font-bold text/7 lg:text-4xl/7 tracking-wide outlined-heading"
        }
      >
        Tire service
      </span>
    </Link>
  );
};

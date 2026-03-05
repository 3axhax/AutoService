import { LoginForm } from "@features/loginForm";
import { useInfoModalData } from "@app/providers/infoModalProvider";
import { useEffect, useState } from "react";
import { RegistrationForm } from "@features/registrationForm";

export const LoginRegistration = () => {
  const { setTitle } = useInfoModalData();
  const [mode, setMode] = useState<"login" | "registration">("login");

  useEffect(() => {
    setTitle(mode === "login" ? "Войти" : "Зарегистрироваться");
  }, [setTitle, mode]);

  return (
    <>
      {mode === "login" ? <LoginForm /> : <RegistrationForm />}
      <div className={"flex justify-start"}>
        <button
          className={
            "text-blue-500 cursor-pointer hover:text-blue-700 transition-all duration-200 bg-underline text-sm"
          }
          onClick={() => setMode(mode === "login" ? "registration" : "login")}
        >
          {mode === "login" ? "зарегистрироваться" : "авторизоваться"}
        </button>
      </div>
    </>
  );
};

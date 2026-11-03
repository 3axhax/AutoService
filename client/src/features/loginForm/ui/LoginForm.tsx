import React, { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@shared/store/hooks.ts";
import {
  loginUser,
  resetError,
  selectErrorUser,
  selectPendingUser,
} from "@entities/user";
import { InputWithLabel } from "@shared/ui/InputWithLabel";

export const LoginForm = () => {
  const dispatch = useAppDispatch();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const pending = useAppSelector(selectPendingUser);
  const error = useAppSelector(selectErrorUser);

  const handlerSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    dispatch(loginUser({ email, password }));
  };

  useEffect(() => {
    dispatch(resetError());
  }, [dispatch]);

  return (
    <form className="space-y-2 text-gray-900" onSubmit={handlerSubmit}>
      <InputWithLabel
        type={"email"}
        name={"email"}
        placeholder={"mail@mail.com"}
        value={email}
        onChange={setEmail}
        label={"Почта"}
      />
      <InputWithLabel
        type={"password"}
        name={"password"}
        placeholder={"*****"}
        value={password}
        onChange={setPassword}
        label={"Пароль"}
        className={"mt-3"}
      />

      {error && (
        <div
          className={
            "bg-red-600/20 outline-1 outline-red-600 rounded-md px-4 py-2"
          }
        >
          {error}
        </div>
      )}

      <button
        type={"submit"}
        className={"btn btn-blue-dark w-full mt-5 mb-5 h-12"}
        disabled={pending}
      >
        Войти
      </button>
    </form>
  );
};

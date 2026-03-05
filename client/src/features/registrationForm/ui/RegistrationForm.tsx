import React, { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@shared/store/hooks.ts";
import { useNavigate } from "react-router-dom";
import {
  registerUser,
  resetError,
  selectErrorUser,
  selectIsUserAuthorized,
  selectPendingUser,
} from "@entities/user";
import { useInfoModalData } from "@app/providers/infoModalProvider";
import { InputWithLabel } from "@shared/ui/InputWithLabel";

export const RegistrationForm = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [email, setEmail] = useState<string>("");
  const [name, setName] = useState<string>("");
  const [companyName, setCompanyName] = useState<string>("");

  const minPasswordLength = 5;
  const [password, setPassword] = useState<string>("");
  const [confirmedPassword, setConfirmedPassword] = useState<string>("");

  const pending = useAppSelector(selectPendingUser);
  const error = useAppSelector(selectErrorUser);
  const isUserAuthorized = useAppSelector(selectIsUserAuthorized);
  const { closeModal } = useInfoModalData();

  const [validateError, setValidateError] = useState<string>("");

  const handlerSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (password.length < minPasswordLength) {
      setValidateError(
        `Слишком короткий пароль, минимальная длина - ${minPasswordLength}`,
      );
    } else if (password !== confirmedPassword) {
      setValidateError("Несовпадение паролей");
    } else {
      dispatch(
        registerUser({
          email,
          name,
          companyName,
          password,
          confirmedPassword,
        }),
      );
      setValidateError("");
    }
  };

  useEffect(() => {
    dispatch(resetError());
  }, [dispatch]);

  useEffect(() => {
    if (isUserAuthorized) {
      navigate("/");
      closeModal();
    }
  }, [navigate, isUserAuthorized, closeModal]);

  useEffect(() => {
    setValidateError("");
  }, [email, name, companyName, password, confirmedPassword]);

  return (
    <form className="space-y-2 text-gray-900" onSubmit={handlerSubmit}>
      <InputWithLabel
        type={"email"}
        name={"email"}
        placeholder={"mail@mail.com"}
        value={email}
        onChange={setEmail}
        label={"Почта"}
        required={true}
      />
      <InputWithLabel
        name={"name"}
        placeholder={"Администратор"}
        value={name}
        onChange={setName}
        label={"Имя"}
        required={true}
      />
      <InputWithLabel
        name={"companyName"}
        placeholder={"Компания"}
        value={companyName}
        onChange={setCompanyName}
        label={"Наименование компании"}
        required={true}
      />
      <InputWithLabel
        type={"password"}
        name={"password"}
        placeholder={"*****"}
        value={password}
        onChange={setPassword}
        label={"Пароль"}
        className={"mt-3"}
        required={true}
        hint={`Длина пароля минимум ${minPasswordLength} символов`}
      />
      <InputWithLabel
        type={"password"}
        name={"password"}
        placeholder={"*****"}
        value={confirmedPassword}
        onChange={setConfirmedPassword}
        label={"Подтверждение пароля"}
        className={"mt-3"}
        required={true}
      />

      {(error || validateError) && (
        <div
          className={
            "bg-red-600/20 outline-1 outline-red-600 rounded-md px-4 py-2"
          }
        >
          {error || validateError || null}
        </div>
      )}

      <button
        type={"submit"}
        className={"btn btn-blue-dark w-full mt-5 mb-5 h-12"}
        disabled={!!(pending || validateError)}
      >
        Регистрация
      </button>
    </form>
  );
};

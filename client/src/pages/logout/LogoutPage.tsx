import { useEffect } from "react";
import useDocumentTitle from "@shared/hooks/useDocumentTitle.tsx";
import { useAppDispatch } from "@shared/store/hooks.ts";
import { logoutUser } from "@entities/user";
import { useNavigate } from "react-router-dom";

export const LogoutPage = () => {
  useDocumentTitle("Выйти");
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    dispatch(logoutUser());
    navigate("/");
  }, [dispatch, navigate]);

  return (
    <div className="app">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          Выйти
        </h1>
      </div>
    </div>
  );
};

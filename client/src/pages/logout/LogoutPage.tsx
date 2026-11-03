import { useEffect } from "react";
import useDocumentTitle from "@shared/hooks/useDocumentTitle.tsx";
import { useAppDispatch } from "@shared/store/hooks.ts";
import { logoutCurrentSession } from "@entities/user";
import { useNavigate } from "react-router-dom";

export const LogoutPage = () => {
  useDocumentTitle("Выйти");
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;
    dispatch(logoutCurrentSession()).then((result) => {
      if (mounted && result.meta.requestStatus === "fulfilled") navigate("/");
    });
    return () => {
      mounted = false;
    };
  }, [dispatch, navigate]);

  return (
    <div className="app relative">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          Выйти
        </h1>
      </div>
    </div>
  );
};

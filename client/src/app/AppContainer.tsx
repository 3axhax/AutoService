import { useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import { useAppDispatch } from "@shared/store/hooks.ts";
import { InfoModal } from "@features/infoModal";
import { Navigation } from "@widgets/navigation";
import { MainPage } from "@pages/main";
import { checkLSUser } from "@entities/user";
import {LogoutPage} from "@pages/logout";
import {NotFoundPage} from "@pages/404";

function AppContainer() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(checkLSUser());
  }, [dispatch]);

  return (
    <div className="app">
      <Navigation />
      <Routes>
        <Route path="/" element={<MainPage />} />
          <Route path="/logout" element={<LogoutPage />} />
          <Route path="*" element={<NotFoundPage />} />
      </Routes>
      <InfoModal />
    </div>
  );
}

export default AppContainer;

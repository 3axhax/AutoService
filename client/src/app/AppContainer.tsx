import { useCallback, useEffect } from "react";
import { Route, Routes } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "@shared/store/hooks.ts";
import { InfoModal } from "@features/infoModal";
import { Navigation } from "@widgets/navigation";
import { MainPage } from "@pages/main";
import { userSlice, checkLSUser } from "@entities/user";
import { checkLSAppSettings, setDeviceType } from "@entities/app";
import { LogoutPage } from "@pages/logout";
import { NotFoundPage } from "@pages/404";
import { WorkerOrderPage } from "@pages/workerOrder";
import { OrdersPage } from "@pages/orders";
import { WorkerShiftsHistoryPage } from "@pages/workerShiftsHistory";
import { USER_LS_KEY } from "@entities/user/model/constants";
import { matchesStoredSession } from "@shared/transport/session";
import { synchronizeSession } from "@shared/store/session";
import { DeviceType } from "@shared/hooks/useDeviceType.tsx";
import { useUserType } from "@shared/hooks/useUserType.tsx";

function AppContainer() {
  const { isAdmin: isUserAdmin, isWorker: isUserWorker } = useUserType();
  const dispatch = useAppDispatch();
  const logoutWarning = useAppSelector((state) => state.user.logoutWarning);
  const token = useAppSelector((state) => state.user.token);

  useEffect(() => {
    const sync = () => {
      if (!matchesStoredSession(token)) dispatch(synchronizeSession());
    };
    const onStorage = (event: StorageEvent) => {
      if (event.key === USER_LS_KEY || event.key === null) sync();
    };
    window.addEventListener("storage", onStorage);
    window.addEventListener("focus", sync);
    sync();
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("focus", sync);
    };
  }, [dispatch, token]);

  const handlerResize = useCallback(() => {
    if (window.innerWidth < 1024) {
      dispatch(setDeviceType(DeviceType.mobile));
    } else {
      dispatch(setDeviceType(DeviceType.desktop));
    }
  }, [dispatch]);

  useEffect(() => {
    dispatch(checkLSUser());
    dispatch(checkLSAppSettings());
  }, [dispatch]);

  useEffect(() => {
    window.addEventListener("resize", handlerResize);
    return () => {
      window.removeEventListener("resize", handlerResize);
    };
  }, [handlerResize]);

  return (
    <div className="app">
      <Navigation />
      {logoutWarning && (
        <div role="alert">
          <p>{logoutWarning}</p>
          <button
            type="button"
            onClick={() => dispatch(userSlice.actions.setLogoutWarning(""))}
          >
            Закрыть сообщение
          </button>
        </div>
      )}
      <Routes>
        <Route
          path="/"
          element={
            isUserAdmin ? (
              <OrdersPage />
            ) : isUserWorker ? (
              <WorkerOrderPage />
            ) : (
              <MainPage />
            )
          }
        />
        <Route path={"/shiftsHistory"} element={<WorkerShiftsHistoryPage />} />
        <Route path="/logout" element={<LogoutPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      <InfoModal />
    </div>
  );
}

export default AppContainer;

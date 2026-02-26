import { useCallback, useEffect } from "react";
import { Route, Routes } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "@shared/store/hooks.ts";
import { InfoModal } from "@features/infoModal";
import { Navigation } from "@widgets/navigation";
import { MainPage } from "@pages/main";
import {
  checkLSUser,
  selectIsUserAdmin,
  selectIsUserWorker,
} from "@entities/user";
import { checkLSAppSettings, setDeviceType } from "@entities/app";
import { LogoutPage } from "@pages/logout";
import { NotFoundPage } from "@pages/404";
import { WorkerOrderPage } from "@pages/workerOrder";
import { OrdersPage } from "@pages/orders";
import { WorkerShiftsHistoryPage } from "@pages/workerShiftsHistory";
import { DeviceType } from "@shared/hooks/useDeviceType.tsx";

function AppContainer() {
  const isUserAdmin = useAppSelector(selectIsUserAdmin);
  const isUserWorker = useAppSelector(selectIsUserWorker);
  const dispatch = useAppDispatch();

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

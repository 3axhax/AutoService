import { useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "@shared/store/hooks.ts";
import { InfoModal } from "@features/infoModal";
import { Navigation } from "@widgets/navigation";
import { MainPage } from "@pages/main";
import {
  checkLSUser,
  selectIsUserAdmin,
  selectIsUserWorker,
} from "@entities/user";
import { checkLSAppSettings } from "@entities/app";
import { LogoutPage } from "@pages/logout";
import { NotFoundPage } from "@pages/404";
import { WorkerOrderPage } from "@pages/workerOrder";
import { OrdersPage } from "@pages/orders";
import { WorkerShiftsHistoryPage } from "@pages/workerShiftsHistory";

function AppContainer() {
  const isUserAdmin = useAppSelector(selectIsUserAdmin);
  const isUserWorker = useAppSelector(selectIsUserWorker);
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(checkLSUser());
    dispatch(checkLSAppSettings());
  }, [dispatch]);

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

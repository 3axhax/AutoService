import { ActionBlock } from "./ActionBlock";
import { useAppDispatch } from "@shared/store/hooks.ts";
import { useEffect } from "react";
import { getActiveShift } from "@entities/shifts";
import { OrderActiveList } from "@widgets/workerShift/ui/OrderActiveList.tsx";
import { ClosedOrdersList } from "@widgets/workerShift/ui/ClosedOrdersList.tsx";

export const WorkerShift = () => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(getActiveShift());
  }, [dispatch]);

  return (
    <div>
      <ActionBlock />
      <OrderActiveList />
      <ClosedOrdersList />
    </div>
  );
};

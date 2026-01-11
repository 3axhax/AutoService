import { ActionBlock } from "./ActionBlock";
import { useAppDispatch, useAppSelector } from "@shared/store/hooks.ts";
import { useEffect } from "react";
import { getActiveShift, SelectWorkerActiveShift } from "@entities/shifts";
import { OrderActiveList } from "@widgets/workerShift/ui/OrderActiveList.tsx";
import { ClosedOrdersList } from "@widgets/workerShift/ui/ClosedOrdersList.tsx";
import { getOrdersFromActiveShift } from "@entities/order";

export const WorkerShift = () => {
  const isActiveShift = useAppSelector(SelectWorkerActiveShift);

  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(getActiveShift());
    dispatch(getOrdersFromActiveShift());
  }, [dispatch]);

  return (
    <div>
      <ActionBlock />
      {isActiveShift ? (
        <>
          <OrderActiveList />
          <ClosedOrdersList />{" "}
        </>
      ) : null}
    </div>
  );
};

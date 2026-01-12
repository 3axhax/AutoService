import { useEffect } from "react";
import { ActionBlock } from "./ActionBlock";
import { useAppDispatch, useAppSelector } from "@shared/store/hooks.ts";
import { getActiveShift, SelectWorkerActiveShift } from "@entities/shifts";
import { getAdditionalWorksFromActiveShift } from "@entities/additionalWorks";
import { getOrdersFromActiveShift } from "@entities/order";
import { OrderActiveList } from "./OrderActiveList.tsx";
import { ClosedOrdersList } from "./ClosedOrdersList.tsx";
import { AdditionalWorksActiveList } from "./AdditionalWorksActiveList.tsx";
import { ClosedAdditionalWorksList } from "@widgets/workerShift/ui/ClosedAdditionalWorksList.tsx";

export const WorkerShift = () => {
  const isActiveShift = useAppSelector(SelectWorkerActiveShift);

  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(getActiveShift());
    dispatch(getOrdersFromActiveShift());
    dispatch(getAdditionalWorksFromActiveShift());
  }, [dispatch]);

  return (
    <div>
      <ActionBlock />
      {isActiveShift ? (
        <>
          <OrderActiveList />
          <AdditionalWorksActiveList />
          <ClosedOrdersList />
          <ClosedAdditionalWorksList />
        </>
      ) : null}
    </div>
  );
};

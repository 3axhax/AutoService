import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@shared/store/hooks.ts";
import { getActiveShift, SelectWorkerActiveShift } from "@entities/shifts";
import { getAdditionalWorksFromActiveShift } from "@entities/additionalWorks";
import { getOrdersFromActiveShift } from "@entities/order";
import { ActionBlock } from "./ActionBlock";
import { OrderActiveList } from "./OrderActiveList";
import { ClosedOrdersList } from "./ClosedOrdersList";
import { AdditionalWorksActiveList } from "./AdditionalWorksActiveList";
import { ClosedAdditionalWorksList } from "./ClosedAdditionalWorksList";

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

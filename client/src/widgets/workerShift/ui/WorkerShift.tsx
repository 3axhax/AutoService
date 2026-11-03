import { OperationErrors } from "@features/operationErrors/OperationErrors";
import { ListReadStatus } from "@shared/store/ListReadStatus";
import { useListView } from "@shared/store/useListView";
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
  useListView("orders", "active");
  useListView("additionalWorks", "active");

  useEffect(() => {
    dispatch(getActiveShift());
    dispatch(getOrdersFromActiveShift());
    dispatch(getAdditionalWorksFromActiveShift());
  }, [dispatch]);

  return (
    <>
      <div
        className={
          "shadow-lg w-full py-4 lg:py-5 sticky top-0 bg-stone-200/75 dark:bg-gray-950/75 z-10"
        }
      >
        <div className={"container px-4 lg:px-8 mx-auto"}>
          <ActionBlock />
        </div>
      </div>
      <OperationErrors />
      <ListReadStatus resource="orders" />
      <ListReadStatus resource="additionalWorks" />
      {isActiveShift ? (
        <>
          <OrderActiveList />

          <AdditionalWorksActiveList />

          <ClosedOrdersList />

          <ClosedAdditionalWorksList />
        </>
      ) : null}
    </>
  );
};

import { Filters, ShiftsList } from "@widgets/workerShiftsHistory";
import { useAppDispatch } from "@shared/store/hooks.ts";
import { useEffect } from "react";
import { getShiftsList } from "@entities/shifts";

export const WorkerShiftsHistoryPage = () => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(getShiftsList());
  }, [dispatch]);

  return (
    <div className={"container px-4 lg:px-8"}>
      <h3 className={"text-2xl mb-6 text-gray-700"}>Смены</h3>
      <Filters />
      <ShiftsList />
    </div>
  );
};

import { ShiftsList } from "@widgets/workerShiftsHistory";
import { useAppDispatch } from "@shared/store/hooks.ts";
import { useEffect } from "react";
import { getShiftsList } from "@entities/shifts";
import { WorkerShiftsHistoryPagination } from "@features/workerShiftsHistory/workerShiftsHistoryPagination";
import { WorkerShiftsHistoryFilters } from "@features/workerShiftsHistory/workerShiftsHistoryFilters";

export const WorkerShiftsHistoryPage = () => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(getShiftsList());
  }, [dispatch]);

  return (
    <div className={"container px-4 lg:px-8"}>
      <h3
        className={
          "text-2xl mb-3 lg:mb-6 text-gray-700 text-left lg:text-center"
        }
      >
        Смены
      </h3>
      <WorkerShiftsHistoryFilters />
      <ShiftsList />
      <WorkerShiftsHistoryPagination />
    </div>
  );
};

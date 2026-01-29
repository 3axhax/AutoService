import { ShiftsList } from "@widgets/workerShiftsHistory";
import { useAppDispatch } from "@shared/store/hooks.ts";
import { useEffect } from "react";
import { getShiftsList } from "@entities/shifts";
import { WorkerShiftsHistoryPagination } from "@features/workerShiftsHistory/workerShiftsHistoryPagination";
import { WorkerShiftsHistoryFilters } from "@features/workerShiftsHistory/workerShiftsHistoryFilters";
import { ShiftIcon } from "@shared/ui/Icons/Shift.tsx";

export const WorkerShiftsHistoryPage = () => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(getShiftsList());
  }, [dispatch]);

  return (
    <div className={"container px-4 lg:px-8"}>
      <h2
        className={
          "text-2xl mt-5 mb-3 lg:mb-6 text-gray-700 text-left lg:text-center"
        }
      >
        <ShiftIcon className={"h6 w-6 inline-flex mr-2 text-gray-600"} />
        Смены
      </h2>
      <WorkerShiftsHistoryFilters />
      <ShiftsList />
      <WorkerShiftsHistoryPagination />
    </div>
  );
};

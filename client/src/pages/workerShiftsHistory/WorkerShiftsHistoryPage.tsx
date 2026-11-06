import { OperationErrors } from "@features/operationErrors/OperationErrors";
import { ShiftsList } from "@widgets/workerShiftsHistory";
import { useAppDispatch } from "@shared/store/hooks.ts";
import { useEffect } from "react";
import { getShiftsList } from "@entities/shifts";
import { WorkerShiftsHistoryPagination } from "@features/workerShiftsHistory/workerShiftsHistoryPagination";
import { WorkerShiftsHistoryFilters } from "@features/workerShiftsHistory/workerShiftsHistoryFilters";
import { downloadWorkerOrders } from "@entities/order/model/extraReducers";
import { ArrowDownTrayIcon } from "@heroicons/react/24/outline";
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
          "text-2xl mt-5 mb-3 lg:mb-6 text-gray-700 dark:text-white text-left lg:text-center"
        }
      >
        <ShiftIcon
          className={"h6 w-6 inline-flex mr-2 text-gray-600 dark:text-white/80"}
        />
        Смены
      </h2>
      <OperationErrors />
      <div className="flex justify-between items-start gap-4 flex-wrap">
        <WorkerShiftsHistoryFilters />
        <button type="button" className="text-blue-500 cursor-pointer hover:text-blue-700 transition-all duration-200" onClick={() => dispatch(downloadWorkerOrders(undefined))}>
          <ArrowDownTrayIcon className="w-5 h-5 inline-flex mr-1" /><span className="bg-underline">Скачать Excel</span>
        </button>
      </div>
      <ShiftsList />
      <WorkerShiftsHistoryPagination />
    </div>
  );
};

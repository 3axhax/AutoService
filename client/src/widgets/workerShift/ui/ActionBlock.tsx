import { useAppSelector } from "@shared/store/hooks.ts";
import { SelectWorkerActiveShift } from "@entities/shifts";
import {
  CloseShift,
  CreateNewAdditionalWork,
  CreateNewOrder,
  CreateNewShift,
  TotalShiftValue,
} from "@features/shift";

export const ActionBlock = () => {
  const isActiveShift = useAppSelector(SelectWorkerActiveShift);
  return (
    <div className={"flex flex-col lg:flex-row justify-between gap-y-5"}>
      <div className={"flex justify-stretch lg:justify-start gap-3"}>
        {!isActiveShift ? (
          <>
            <CreateNewShift />
          </>
        ) : (
          <>
            <CreateNewOrder />
            <CreateNewAdditionalWork />
          </>
        )}
      </div>
      <div className={"flex justify-stretch lg:justify-end items-center gap-3"}>
        {isActiveShift && (
          <>
            <CloseShift />
            <TotalShiftValue />
          </>
        )}
      </div>
    </div>
  );
};

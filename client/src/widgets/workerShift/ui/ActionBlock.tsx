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
    <div className={"flex justify-between"}>
      <div className={"flex justify-start gap-3"}>
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
      <div className={"flex justify-end items-center gap-3"}>
        {isActiveShift && (
          <>
            <TotalShiftValue />
            <CloseShift />
          </>
        )}
      </div>
    </div>
  );
};

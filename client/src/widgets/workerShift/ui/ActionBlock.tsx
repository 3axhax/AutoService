import { useAppSelector } from "@shared/store/hooks.ts";
import { SelectWorkerActiveShift } from "@entities/shifts";
import { CloseShift, CreateNewOrder, CreateNewShift } from "@features/shift";
import { CreateNewAdditionalWork } from "@features/shift/actionBlock/CreateNewAdditionalWork.tsx";

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
      <div className={"flex justify-end gap-3"}>
        {isActiveShift && <CloseShift />}
      </div>
    </div>
  );
};

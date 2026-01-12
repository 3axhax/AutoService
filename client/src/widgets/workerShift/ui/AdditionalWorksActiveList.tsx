import { useAppDispatch, useAppSelector } from "@shared/store/hooks.ts";
import {
  activeAdditionalWorksListSelect,
  getAdditionalWorksFromActiveShift,
} from "@entities/additionalWorks";
import { EditAdditionalWorkForm } from "@features/editAdditionalWorkForm";

export const AdditionalWorksActiveList = () => {
  const additionalWorksList = useAppSelector(activeAdditionalWorksListSelect);
  const dispatch = useAppDispatch();
  return (
    <>
      {additionalWorksList.length > 0
        ? additionalWorksList.map((additionalWork) => (
            <EditAdditionalWorkForm
              key={additionalWork.id}
              additionalWorkId={additionalWork.id}
              onSuccess={() => dispatch(getAdditionalWorksFromActiveShift())}
            />
          ))
        : null}
    </>
  );
};

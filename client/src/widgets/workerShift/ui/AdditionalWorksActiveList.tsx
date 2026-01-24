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
            <div className={"colored w-full"}>
              <div className={"container mx-auto px-4 lg:px-8"}>
                <EditAdditionalWorkForm
                  key={additionalWork.id}
                  additionalWorkId={additionalWork.id}
                  onSuccess={() =>
                    dispatch(getAdditionalWorksFromActiveShift())
                  }
                />
              </div>
            </div>
          ))
        : null}
    </>
  );
};

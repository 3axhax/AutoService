import { useAppSelector } from "@shared/store/hooks.ts";
import { activeAdditionalWorksListSelect } from "@entities/additionalWorks";
import { EditAdditionalWorkForm } from "@features/editAdditionalWorkForm";

export const AdditionalWorksActiveList = () => {
  const additionalWorksList = useAppSelector(activeAdditionalWorksListSelect);
  return (
    <>
      {additionalWorksList.length > 0
        ? additionalWorksList.map((additionalWork) => (
            <div className={"colored w-full"} key={additionalWork.id}>
              <div className={"container mx-auto px-4 lg:px-8"}>
                <EditAdditionalWorkForm additionalWorkId={additionalWork.id} />
              </div>
            </div>
          ))
        : null}
    </>
  );
};

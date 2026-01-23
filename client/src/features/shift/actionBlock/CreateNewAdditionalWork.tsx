import { useAppDispatch } from "@shared/store/hooks.ts";
import { addNewActiveAdditionalWork } from "@entities/additionalWorks";
import { ExtraIcon } from "@shared/ui/Icons/Extra.tsx";

export const CreateNewAdditionalWork = () => {
  const dispatch = useAppDispatch();

  const clickHandler = () => {
    dispatch(addNewActiveAdditionalWork());
  };

  return (
    <button className={"btn btn-orange btn-blue-dark"} onClick={clickHandler}>
      <ExtraIcon className={"h-5 w-5 inline-flex mr-1 -ml-1 text-white"} />
      Дополнительные работы
    </button>
  );
};

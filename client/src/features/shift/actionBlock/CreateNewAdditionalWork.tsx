import { useAppDispatch } from "@shared/store/hooks.ts";
import { addNewActiveAdditionalWork } from "@entities/additionalWorks";
import { ExtraIcon } from "@shared/ui/Icons/Extra.tsx";

export const CreateNewAdditionalWork = () => {
  const dispatch = useAppDispatch();

  const clickHandler = () => {
    dispatch(addNewActiveAdditionalWork());
  };

  return (
    <button
      className={"btn btn-orange btn-blue-dark w-1/2 lg:w-fit"}
      onClick={clickHandler}
    >
      <ExtraIcon className={"h-5 w-5 inline-flex mr-1 -ml-1 text-white"} />
      <span className={"hidden lg:inline"}>Дополнительные работы</span>
      <span className={"inline lg:hidden"}>Доп. работы</span>
    </button>
  );
};

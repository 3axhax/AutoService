import { useAppDispatch } from "@shared/store/hooks.ts";
import { addNewActiveAdditionalWork } from "@entities/additionalWorks";

export const CreateNewAdditionalWork = () => {
  const dispatch = useAppDispatch();

  const clickHandler = () => {
    dispatch(addNewActiveAdditionalWork());
  };

  return (
    <button className={"btn btn-orange btn-blue-dark"} onClick={clickHandler}>
      Дополнительные работы
    </button>
  );
};

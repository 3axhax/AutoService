import { useAppDispatch } from "@shared/store/hooks.ts";
import { addNewActiveAdditionalWork } from "@entities/additionalWorks";

export const CreateNewAdditionalWork = () => {
  const dispatch = useAppDispatch();

  const clickHandler = () => {
    console.log("add work");
    dispatch(addNewActiveAdditionalWork());
  };

  return (
    <button className={"btn"} onClick={clickHandler}>
      Дополнительные работы
    </button>
  );
};

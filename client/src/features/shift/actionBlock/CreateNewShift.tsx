import { useAppDispatch } from "@shared/store/hooks.ts";
import { createActiveShift } from "@entities/shifts";

export const CreateNewShift = () => {
  const dispatch = useAppDispatch();

  const clickHandler = () => {
    dispatch(createActiveShift());
  };

  return (
    <button className={"btn"} onClick={clickHandler}>
      Начать смену
    </button>
  );
};

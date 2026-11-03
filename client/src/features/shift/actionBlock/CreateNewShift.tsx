import { useAppDispatch, useAppSelector } from "@shared/store/hooks.ts";
import { createActiveShift } from "@entities/shifts";

export const CreateNewShift = () => {
  const dispatch = useAppDispatch();
  const disabled = useAppSelector(
    (state) =>
      state.shifts.pending ||
      state.order.pending ||
      state.additionalWorks.pending,
  );

  const clickHandler = () => {
    dispatch(createActiveShift());
  };

  return (
    <button disabled={disabled} className={"btn"} onClick={clickHandler}>
      Начать смену
    </button>
  );
};

import { useAppDispatch } from "@shared/store/hooks.ts";
import { clearShiftsList, closeActiveShift } from "@entities/shifts";
import { useInfoModalData } from "@app/providers/infoModalProvider";

export const CloseShift = () => {
  const dispatch = useAppDispatch();

  const { openModal } = useInfoModalData();

  const clickHandler = () => {
    openModal({
      onAccess: () => {
        dispatch(closeActiveShift()).then((res) => {
          if (res.payload) {
            dispatch(clearShiftsList());
          }
        });
      },
      title: `Уверены, что хотите закрыть смену?`,
    });
  };

  return (
    <button className={"btn"} onClick={clickHandler}>
      Закончить смену
    </button>
  );
};

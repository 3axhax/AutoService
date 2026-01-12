import { useAppDispatch } from "@shared/store/hooks.ts";
import { clearShiftsList, closeActiveShift } from "@entities/shifts";
import { useInfoModalData } from "@app/providers/infoModalProvider";
import { clearOrdersList } from "@entities/order";

export const CloseShift = () => {
  const dispatch = useAppDispatch();

  const { openModal } = useInfoModalData();

  const clickHandler = () => {
    openModal({
      onAccess: () => {
        dispatch(closeActiveShift()).then((res) => {
          if (res.payload) {
            dispatch(clearShiftsList());
            dispatch(clearOrdersList());
          }
        });
      },
      title: `Уверены, что хотите закрыть смену?`,
      body: `Внесение исправлений по смене будет недоступно`,
    });
  };

  return (
    <button className={"btn"} onClick={clickHandler}>
      Закончить смену
    </button>
  );
};

import { useAppDispatch } from "@shared/store/hooks.ts";
import { clearShiftsList, closeActiveShift } from "@entities/shifts";
import { clearOrdersList } from "@entities/order";
import { clearAdditionalWorksList } from "@entities/additionalWorks";
import { useInfoModalData } from "@app/providers/infoModalProvider";
import { ArrowTopRightOnSquareIcon } from "@heroicons/react/24/outline";

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
            dispatch(clearAdditionalWorksList());
          }
        });
      },
      title: `Уверены, что хотите закрыть смену?`,
      body: `Внесение исправлений по смене будет недоступно`,
    });
  };

  return (
    <button className={"btn btn-orange"} onClick={clickHandler}>
      <ArrowTopRightOnSquareIcon className={"h-5 w-5 inline-flex mr-1 -ml-1 text-white"} />
      Закончить смену
    </button>
  );
};

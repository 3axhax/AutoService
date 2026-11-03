import { useAppDispatch, useAppSelector } from "@shared/store/hooks.ts";
import { closeActiveShift } from "@entities/shifts";
import { useInfoModalData } from "@app/providers/infoModalProvider";
import { ArrowTopRightOnSquareIcon } from "@heroicons/react/24/outline";

export const CloseShift = () => {
  const dispatch = useAppDispatch();
  const disabled = useAppSelector(
    (state) =>
      state.shifts.pending ||
      state.order.pending ||
      state.additionalWorks.pending,
  );

  const { openModal } = useInfoModalData();

  const clickHandler = () => {
    openModal({
      onAccess: () => {
        dispatch(closeActiveShift());
      },
      title: `Уверены, что хотите закрыть смену?`,
      body: `Внесение исправлений по смене будет недоступно`,
    });
  };

  return (
    <button
      disabled={disabled}
      className={"btn btn-orange whitespace-pre"}
      onClick={clickHandler}
    >
      <ArrowTopRightOnSquareIcon
        className={"h-5 w-5 inline-flex mr-1 -ml-1 text-white"}
      />
      Закончить смену
    </button>
  );
};

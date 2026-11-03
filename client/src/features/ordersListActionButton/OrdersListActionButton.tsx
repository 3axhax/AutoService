import { PencilSquareIcon, TrashIcon } from "@heroicons/react/24/outline";
import { useInfoModalData } from "@app/providers/infoModalProvider";
import { useAppDispatch, useAppSelector } from "@shared/store/hooks.ts";
import { EditOrderForm } from "@features/editOrderForm";
import { deleteOrder } from "@entities/order";

interface OrdersListActionButtonProps {
  orderId: number;
}
export const OrdersListActionButton = ({
  orderId,
}: OrdersListActionButtonProps) => {
  const dispatch = useAppDispatch();
  const disabled = useAppSelector(
    (state) =>
      state.order.pending || state.order.loading || !!state.order.readError || state.shifts.pending,
  );

  const { openModal, closeModal } = useInfoModalData();

  const handlerDelete = () => {
    openModal({
      onAccess: () => {
        dispatch(deleteOrder(orderId));
      },
      title: `Уверены, что хотите удалить заказ?`,
    });
  };

  const handlerEdit = () => {
    openModal({
      title: `Редактирование заказа #${orderId}`,
      body: (
        <EditOrderForm
          orderId={orderId}
          edit={true}
          onSuccess={closeModal}
          carouselMaxItems={3}
        />
      ),
      className: "min-w-auto md:min-w-[90%]",
    });
  };
  return (
    <div className={"inline-flex lg:flex lg:w-full justify-center gap-3"}>
      <button
        type={"button"}
        onClick={handlerEdit}
        disabled={disabled}
        className={
          "w-8 h-8 inline-flex justify-center items-center text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-600 transition-colors cursor-pointer"
        }
      >
        <span className={"sr-only"}>Редактировать</span>
        <PencilSquareIcon className="w-5 h-5" />
      </button>
      <button
        type={"button"}
        onClick={handlerDelete}
        disabled={disabled}
        className={
          "w-8 h-8 inline-flex justify-center items-center text-red-600 shadow-red-600/75 hover:text-red-800 transition-colors cursor-pointer"
        }
      >
        <span className={"sr-only"}>Удалить</span>
        <TrashIcon className="w-5 h-5" />
      </button>
    </div>
  );
};

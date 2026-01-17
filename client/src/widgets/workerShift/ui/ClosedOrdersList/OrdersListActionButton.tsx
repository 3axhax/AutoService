import { PencilSquareIcon, TrashIcon } from "@heroicons/react/16/solid";
import { useInfoModalData } from "@app/providers/infoModalProvider";
import { useAppDispatch } from "@shared/store/hooks.ts";
import { EditOrderForm } from "@features/editOrderForm";
import { deleteOrder, getOrdersFromActiveShift } from "@entities/order";

export const OrdersListActionButton = ({ orderId }: { orderId: number }) => {
  const dispatch = useAppDispatch();

  const { openModal, closeModal } = useInfoModalData();

  const handlerDelete = () => {
    openModal({
      onAccess: () => {
        dispatch(deleteOrder(orderId)).then((res) => {
          if (res.payload) {
            dispatch(getOrdersFromActiveShift());
          }
        });
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
          onSuccess={() =>
            dispatch(getOrdersFromActiveShift()).then(() => closeModal())
          }
          col={true}
        />
      ),
    });
  };
  return (
    <div className={"flex justify-center gap-3"}>
      <button
        type={"button"}
        onClick={handlerEdit}
        className={
          "text-blue-600 hover:text-blue-700 transition-colors cursor-pointer"
        }
      >
        <PencilSquareIcon className="w-5 h-5" />
      </button>
      <button
        type={"button"}
        onClick={handlerDelete}
        className={
          "text-red-600 hover:text-red-700 transition-colors cursor-pointer"
        }
      >
        <TrashIcon className="w-5 h-5" />
      </button>
    </div>
  );
};

import { PencilSquareIcon, TrashIcon } from "@heroicons/react/24/outline";
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
          carouselMaxItems={3}
        />
      ),
      className: "min-w-auto md:min-w-[90%]",
    });
  };
  return (
    <div className={"flex justify-center gap-3"}>
      <button
        type={"button"}
        onClick={handlerEdit}
        className={
          "w-8 h-8 inline-flex text-blue-600 hover:text-blue-800 transition-colors cursor-pointer"
        }
      ><span className={'sr-only'}>Редактировать</span>
        <PencilSquareIcon className="w-5 h-5" />
      </button>
        <button
            type={"button"}
            onClick={handlerDelete}
            className={
                "w-8 h-8 inline-flex text-red-600 shadow-red-600/75 hover:text-red-800 transition-colors cursor-pointer"
            }
        >
            <span className={'sr-only'}>Удалить</span>
            <TrashIcon className="w-5 h-5"/>
        </button>
    </div>
  );
};

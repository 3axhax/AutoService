import { useAppDispatch, useAppSelector } from "@shared/store/hooks.ts";
import {
  activeOrdersListSelect,
  getOrdersFromActiveShift,
} from "@entities/order";
import { EditOrderForm } from "@features/editOrderForm";

export const OrderActiveList = () => {
  const orderList = useAppSelector(activeOrdersListSelect);
  const dispatch = useAppDispatch();
  return (
    <>
      {orderList.length > 0
        ? orderList.map((order) => (
            <div className={"colored w-full"} key={order.id}>
              <h2 className={"text-2xl mb-6 text-gray-700"}>
                Оформление нового заказа
              </h2>
              <EditOrderForm
                orderId={order.id}
                onSuccess={() => dispatch(getOrdersFromActiveShift())}
              />
            </div>
          ))
        : null}
    </>
  );
};

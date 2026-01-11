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
            <EditOrderForm
              key={order.id}
              orderId={order.id}
              onSuccess={() => dispatch(getOrdersFromActiveShift())}
            />
          ))
        : null}
    </>
  );
};

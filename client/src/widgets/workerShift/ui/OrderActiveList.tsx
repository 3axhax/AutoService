import { useAppSelector } from "@shared/store/hooks.ts";
import { activeOrdersListSelect } from "@entities/order";
import { EditOrderForm } from "@features/editOrderForm";

export const OrderActiveList = () => {
  const orderList = useAppSelector(activeOrdersListSelect);
  console.log(orderList);
  return (
    <>
      {orderList.length > 0
        ? orderList.map((order) => (
            <EditOrderForm key={order.id} orderId={order.id} />
          ))
        : null}
    </>
  );
};

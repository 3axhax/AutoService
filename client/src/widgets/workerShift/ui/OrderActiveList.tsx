import { useAppSelector } from "@shared/store/hooks.ts";
import { activeOrdersListSelect } from "@entities/order";
import { EditOrderForm } from "@features/editOrderForm";

export const OrderActiveList = () => {
  const orderList = useAppSelector(activeOrdersListSelect);
  return (
    <>
      {orderList.length > 0
        ? orderList.map((order) => (
            <div className={"colored w-full"} key={order.id}>
              <h2
                className={
                  "text-2xl mb-3 lg:mb-6 text-gray-700 dark:text-gray-50 text-left lg:text-center px-4 lg:px-8"
                }
              >
                Оформление нового заказа
              </h2>
              <EditOrderForm orderId={order.id} />
            </div>
          ))
        : null}
    </>
  );
};

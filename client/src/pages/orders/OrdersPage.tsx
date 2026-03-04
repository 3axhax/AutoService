import { useAppDispatch, useAppSelector } from "@shared/store/hooks.ts";
import {
  getOrderParametersList,
  selectErrorOrderParameters,
} from "@entities/orderParameters";
import { useEffect } from "react";
import { AdminOrdersList } from "@widgets/adminOrdersList";
import { AdminOrdersListPagination } from "@features/adminOrdersList";
import { getPriceList } from "@entities/price/model/slice.ts";
import { downloadOrdersList } from "@entities/order";
import { OrdersListFilters } from "@features/ordersListFilters";
import { getUsersList } from "@entities/users";
import { ArrowDownTrayIcon } from "@heroicons/react/24/outline";

export const OrdersPage = () => {
  const dispatch = useAppDispatch();

  const error = useAppSelector(selectErrorOrderParameters);

  useEffect(() => {
    dispatch(getOrderParametersList());
    dispatch(getPriceList());
    dispatch(getUsersList());
  }, [dispatch]);

  return (
    <>
      <div className="container px-4 lg:px-8">
        {error !== "" ? (
          <div className={"bg-red-300 mb-2 p-2 rounded-lg"}>{error}</div>
        ) : null}
      </div>
      <div className={"w-full"}>
        <div className={"container mx-auto px-4 lg:px-8"}>
          <div className={"flex justify-between my-2"}>
            <OrdersListFilters />
            <button
              type={"button"}
              className={
                "text-blue-500 cursor-pointer hover:text-blue-700 transition-all duration-200"
              }
              onClick={() => dispatch(downloadOrdersList())}
            >
              <ArrowDownTrayIcon className={"w-5 h-5 inline-flex mr-1"} />
              <span className={"bg-underline"}>Скачать Excel</span>
            </button>
          </div>
          <AdminOrdersList />
          <AdminOrdersListPagination />
        </div>
      </div>
    </>
  );
};

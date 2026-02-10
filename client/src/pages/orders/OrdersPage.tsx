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

export const OrdersPage = () => {
  const dispatch = useAppDispatch();

  const error = useAppSelector(selectErrorOrderParameters);

  useEffect(() => {
    dispatch(getOrderParametersList());
    dispatch(getPriceList());
  }, [dispatch]);

  return (
    <>
      <div className="container px-4 lg:px-8">
        {error !== "" ? (
          <div className={"bg-red-300 mb-2 p-2 rounded-lg"}>{error}</div>
        ) : null}
      </div>
      <button
        type={"button"}
        className={"btn"}
        onClick={() => dispatch(downloadOrdersList())}
      >
        Скачать
      </button>
      <AdminOrdersList />
      <AdminOrdersListPagination />
    </>
  );
};

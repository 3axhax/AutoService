import { useAppDispatch, useAppSelector } from "@shared/store/hooks.ts";
import {
  getOrderParametersList,
  selectErrorOrderParameters,
} from "@entities/orderParameters";
import { useEffect } from "react";

export const OrdersPage = () => {
  const dispatch = useAppDispatch();

  const error = useAppSelector(selectErrorOrderParameters);

  useEffect(() => {
    dispatch(getOrderParametersList());
  }, [dispatch]);

  return (
    <div className="app">
      <div className="container px-4 lg:px-8">
        <h1 className="text-4xl font-sans  text-gray-900 dark:text-white mb-4">
          OrdersPage
        </h1>
        {error !== "" ? (
          <div className={"bg-red-300 mb-2 p-2 rounded-lg"}>{error}</div>
        ) : null}
      </div>
    </div>
  );
};

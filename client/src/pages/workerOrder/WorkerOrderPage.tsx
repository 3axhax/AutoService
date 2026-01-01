import { useAppDispatch, useAppSelector } from "@shared/store/hooks.ts";
import { useEffect } from "react";
import {
  getOrderParametersList,
  selectErrorOrderParameters,
} from "@entities/orderParameters";
import { EditOrderForm } from "@features/editOrderForm";

export const WorkerOrderPage = () => {
  const dispatch = useAppDispatch();

  const error = useAppSelector(selectErrorOrderParameters);

  useEffect(() => {
    dispatch(getOrderParametersList());
  }, [dispatch]);

  return (
    <div className="app">
      <div className="container">
        {error !== "" ? (
          <div className={"bg-red-300 mb-2 p-2 rounded-lg"}>{error}</div>
        ) : null}
        <EditOrderForm />
      </div>
    </div>
  );
};

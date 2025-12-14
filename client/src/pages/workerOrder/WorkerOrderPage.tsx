import { useAppDispatch, useAppSelector } from "@shared/store/hooks.ts";
import { useEffect } from "react";
import {
  getOrderParametersList,
  selectErrorOrderParameters,
} from "@entities/orderParameters";

export const WorkerOrderPage = () => {
  const dispatch = useAppDispatch();

  const error = useAppSelector(selectErrorOrderParameters);

  useEffect(() => {
    dispatch(getOrderParametersList());
  }, [dispatch]);

  return (
    <div className="app">
      <div className="container">
        <h1 className="text-4xl font-sans  text-gray-900 dark:text-white mb-4">
          WorkerOrderPage
        </h1>
        {error !== "" ? (
          <div className={"bg-red-300 mb-2 p-2 rounded-lg"}>{error}</div>
        ) : null}
      </div>
    </div>
  );
};

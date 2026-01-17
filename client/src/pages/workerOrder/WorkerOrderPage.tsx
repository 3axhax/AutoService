import { useAppDispatch, useAppSelector } from "@shared/store/hooks.ts";
import { useEffect } from "react";
import {
  getOrderParametersList,
  selectErrorOrderParameters,
} from "@entities/orderParameters";
import { getPriceList } from "@entities/price/model/slice.ts";
import { WorkerShift } from "@widgets/workerShift";

export const WorkerOrderPage = () => {
  const dispatch = useAppDispatch();

  const error = useAppSelector(selectErrorOrderParameters);

  useEffect(() => {
    dispatch(getOrderParametersList());
    dispatch(getPriceList());
  }, [dispatch]);

  return (
    <div className="container px-4 lg:px-8">
      {error !== "" ? (
        <div className={"bg-red-300 mb-2 p-2 rounded-lg"}>{error}</div>
      ) : null}
      <WorkerShift />
    </div>
  );
};

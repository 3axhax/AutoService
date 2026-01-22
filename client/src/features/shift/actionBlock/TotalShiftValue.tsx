import { useAppSelector } from "@shared/store/hooks.ts";
import { workerActiveShiftClosedAdditionalWorksTotalValueSelect } from "@entities/additionalWorks";
import { workerActiveShiftClosedOrdersTotalValueSelect } from "@entities/order";

export const TotalShiftValue = () => {
  const total =
    useAppSelector(workerActiveShiftClosedAdditionalWorksTotalValueSelect) +
    useAppSelector(workerActiveShiftClosedOrdersTotalValueSelect);

  return (
    <div className={"text-base"}>
      Общая сумма за смену:{" "}
      <span className={"font-medium text-xl"}>{total}&nbsp;₽</span>
    </div>
  );
};

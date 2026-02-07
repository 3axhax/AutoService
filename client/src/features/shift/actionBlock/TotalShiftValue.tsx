import { useAppSelector } from "@shared/store/hooks.ts";
import { workerActiveShiftClosedAdditionalWorksTotalValueSelect } from "@entities/additionalWorks";
import {
  workerActiveShiftClosedOrdersTotalValueSelect,
  workerActiveShiftClosedOrdersTotalValueWithDiscountSelect,
} from "@entities/order";

export const TotalShiftValue = () => {
  const total =
    useAppSelector(workerActiveShiftClosedAdditionalWorksTotalValueSelect) +
    useAppSelector(workerActiveShiftClosedOrdersTotalValueSelect);
  const totalWithDiscount =
    useAppSelector(workerActiveShiftClosedAdditionalWorksTotalValueSelect) +
    useAppSelector(workerActiveShiftClosedOrdersTotalValueWithDiscountSelect);

  return (
    <div
      className={
        "flex-grow text-base/5 flex items-baseline justify-end rounded-lg px-3 py-1.5 lg:py-1 border-1 border-stone-400 bg-beige whitespace-pre"
      }
    >
      <span className={"hidden lg:inline"}>Общая сумма</span>
      <span className={"inline lg:hidden text-xl font-bold"}>&sum;&nbsp;</span>
      &nbsp;за смену:&nbsp;
      <span className={"font-medium text-xl"}>{totalWithDiscount}&nbsp;₽</span>
      {totalWithDiscount !== total ? (
        <span className={"ml-2 text-sm"}>(без скидки {total} ₽)</span>
      ) : null}
    </div>
  );
};

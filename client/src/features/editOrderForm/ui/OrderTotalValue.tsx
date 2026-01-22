import { useAppSelector } from "@shared/store/hooks.ts";
import { orderTotalValue } from "@entities/orderParameters";

export const OrderTotalValue = ({
  orderId,
  className,
}: {
  orderId: number;
  className?: string;
}) => {
  const total = useAppSelector((state) => orderTotalValue(state, orderId));
  return (
    <div
      className={`flex ml-auto text-base mt-2 ${className ? ` ${className}` : ""}`}
    >
      <span>Сумма по текущему заказу:</span>&nbsp;
      <span className={"font-medium text-xl"}>{total} ₽</span>
    </div>
  );
};

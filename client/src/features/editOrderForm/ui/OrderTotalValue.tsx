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
      className={`text-base/5 flex items-baseline rounded-lg px-3 py-1.5 lg:py-1 border-1 border-stone-400 bg-beige ${className ? ` ${className}` : ""}`}
    >
      <span>Сумма по текущему заказу:</span>&nbsp;
      <span className={"font-medium text-xl"}>{total} ₽</span>
    </div>
  );
};

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
      className={`flex gap-2 mb-2 text-xl${className ? ` ${className}` : ""}`}
    >
      <span>Итого:</span>
      <span>{total} ₽</span>
    </div>
  );
};

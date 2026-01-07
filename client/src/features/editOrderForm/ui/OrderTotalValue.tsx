import { useAppSelector } from "@shared/store/hooks.ts";
import { orderTotalValue } from "@entities/orderParameters";

export const OrderTotalValue = ({ orderId }: { orderId: number }) => {
  const total = useAppSelector((state) => orderTotalValue(state, orderId));
  return (
    <div className={"self-center flex justify-center gap-2 text-xl"}>
      <span>Итого:</span>
      <span>{total} ₽</span>
    </div>
  );
};

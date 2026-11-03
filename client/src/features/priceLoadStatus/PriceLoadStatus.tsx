import { getPriceList } from "@entities/price/model/slice";
import { useAppDispatch, useAppSelector } from "@shared/store/hooks";

export const PriceLoadStatus = () => {
  const dispatch = useAppDispatch();
  const { pending, loaded, error } = useAppSelector((state) => state.price);
  if (pending) return <p role="status">Загрузка цен…</p>;
  if (loaded && !error) return null;
  return (
    <div role="alert" className="bg-red-200 rounded-md px-4 py-2">
      <p>Цены недоступны. Загрузите цены, чтобы продолжить работу с заказом.</p>
      <button type="button" className="btn btn-blue-light"
        onClick={() => dispatch(getPriceList())}>
        Загрузить цены повторно
      </button>
    </div>
  );
};

import { useAppDispatch, useAppSelector } from "./hooks";
import { retryListRead, type ListResource } from "./listView";

export function ListReadStatus({ resource }: { resource: ListResource }) {
  const dispatch = useAppDispatch();
  const { readError, loading } = useAppSelector((state) =>
    resource === "orders" ? state.order : state.additionalWorks,
  );
  if (!readError) return null;
  return (
    <div role="alert">
      <p>{resource === "orders" ? "Заказы: " : "Дополнительные работы: "}{readError}</p>
      <button type="button" disabled={loading}
        onClick={() => dispatch(retryListRead(resource))}>
        Повторить загрузку
      </button>
    </div>
  );
}

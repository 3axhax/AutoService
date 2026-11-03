import { useAppDispatch, useAppSelector } from "@shared/store/hooks";
import { orderSlice } from "@entities/order";
import { additionalWorksSlice } from "@entities/additionalWorks";
import { shiftsSlice } from "@entities/shifts";

type Resource = "order" | "additionalWorks" | "shifts";
const resources = {
  order: { label: "Заказы", reset: orderSlice.actions.resetError },
  additionalWorks: {
    label: "Дополнительные работы",
    reset: additionalWorksSlice.actions.resetError,
  },
  shifts: { label: "Смены", reset: shiftsSlice.actions.resetError },
};

export function OperationErrors({
  only = ["order", "additionalWorks", "shifts"],
}: {
  only?: Resource[];
}) {
  const dispatch = useAppDispatch();
  const order = useAppSelector((state) => state.order.error);
  const additionalWorks = useAppSelector(
    (state) => state.additionalWorks.error,
  );
  const shifts = useAppSelector((state) => state.shifts.error);
  const errors = { order, additionalWorks, shifts };
  return only.map((resource) =>
    errors[resource] ? (
      <div
        role="alert"
        className="bg-red-200 rounded-md px-4 py-2 my-2"
        key={resource}
      >
        <p>
          {resources[resource].label}: {errors[resource]}
        </p>
        <p>
          Действие не выполнено. Проверьте данные и повторите действие при
          необходимости.
        </p>
        <button
          type="button"
          onClick={() => dispatch(resources[resource].reset())}
        >
          Закрыть сообщение
        </button>
      </div>
    ) : null,
  );
}

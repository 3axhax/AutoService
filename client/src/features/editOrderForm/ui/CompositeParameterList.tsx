import type { CompositeOperation } from "@entities/order";
import { setOrdersValue } from "@entities/order";
import {
  type ParametersItem,
  selectOrderParametersOrdersValue,
} from "@entities/orderParameters";
import { useAppDispatch, useAppSelector } from "@shared/store/hooks.ts";
import { TrashIcon } from "@heroicons/react/16/solid";
import { SelectUI } from "@shared/ui";

interface OptionGroup {
  key: string;
  label: string;
  order: number;
  options: ParametersItem["options"];
}

export const CompositeParameterList = ({
  parameter,
  orderId,
}: {
  parameter: ParametersItem;
  orderId: number;
}) => {
  const dispatch = useAppDispatch();
  const priceList = useAppSelector((state) => state.price.priceList);
  const orderValues = useAppSelector((state) =>
    selectOrderParametersOrdersValue(state, orderId),
  );
  const operations =
    (orderValues[parameter.name] as CompositeOperation[] | undefined) ?? [];
  const baseOptionIds = Object.entries(orderValues).flatMap(([name, value]) => {
    if (name === parameter.name || Array.isArray(value)) return [];
    if (
      (typeof value === "string" || typeof value === "number") &&
      Number.isFinite(Number(value))
    ) {
      return [Number(value)];
    }
    if (value && typeof value === "object") {
      return Object.keys(value).map(Number).filter(Number.isFinite);
    }
    return [];
  });

  const groups = parameter.options
    .reduce<OptionGroup[]>((result, option) => {
      if (!option.optionGroup) return result;
      const existing = result.find((group) => group.key === option.optionGroup);
      if (existing) {
        existing.options.push(option);
        return result;
      }
      return [
        ...result,
        {
          key: option.optionGroup,
          label: option.optionGroupTranslationRu ?? option.optionGroup,
          order: option.optionGroupOrder ?? 0,
          options: [option],
        },
      ];
    }, [])
    .sort((left, right) => left.order - right.order);

  const setOperations = (value: CompositeOperation[]) =>
    dispatch(setOrdersValue({ orderId, name: parameter.name, value }));

  const hasPrice = (optionId: number, selectedOptionIds: number[]) =>
    priceList.some(
      (price) =>
        price.mainOptionId === optionId &&
        price.conditions.every((condition) =>
          [...baseOptionIds, ...selectedOptionIds].includes(condition.id),
        ),
    );

  const buildOptionIds = ({
    current = [],
    changedGroupIndex,
    changedOptionId,
  }: {
    current?: number[];
    changedGroupIndex?: number;
    changedOptionId?: number;
  }) => {
    const selected: number[] = [];
    for (const [groupIndex, group] of groups.entries()) {
      const currentOption = group.options.find((option) =>
        current.includes(option.id),
      )?.id;
      const requestedOption =
        groupIndex === changedGroupIndex ? changedOptionId : currentOption;
      const candidateIds = [
        ...(requestedOption ? [requestedOption] : []),
        ...group.options
          .map((option) => option.id)
          .filter((id) => id !== requestedOption),
      ];
      const available = candidateIds.find((optionId) =>
        hasPrice(optionId, [...selected, optionId]),
      );
      if (!available) return [];
      selected.push(available);
    }
    return selected;
  };

  const update = (
    operation: CompositeOperation,
    changes: Partial<CompositeOperation>,
  ) =>
    setOperations(
      operations.map((item) =>
        item.id === operation.id ? { ...item, ...changes } : item,
      ),
    );

  const add = () => {
    const optionIds = buildOptionIds({});
    if (optionIds.length !== groups.length) return;
    setOperations([
      ...operations,
      {
        id: `composite-${Date.now()}-${operations.length + 1}`,
        optionIds,
        count: 1,
      },
    ]);
  };

  if (groups.length === 0) return null;

  return (
    <div className="flex h-full flex-col gap-3">
      <span className="text-lg font-medium text-gray-800 dark:text-white">
        {parameter.translationRu}
      </span>
      <div className="flex flex-col gap-3">
        {operations.map((operation, operationIndex) => (
          <div
            key={operation.id}
            className="rounded-lg border border-gray-300 p-3 dark:border-gray-700"
          >
            <div className="mb-2 flex items-center justify-between">
              <span>
                {parameter.translationRu} {operationIndex + 1}
              </span>
              <button
                type="button"
                aria-label={`Удалить ${parameter.translationRu.toLowerCase()} ${operationIndex + 1}`}
                className="text-red-600"
                onClick={() =>
                  setOperations(
                    operations.filter((item) => item.id !== operation.id),
                  )
                }
              >
                <TrashIcon className="h-5 w-5" />
              </button>
            </div>
            {groups.map((group, groupIndex) => {
              const selectedOptionId = group.options.find((option) =>
                operation.optionIds.includes(option.id),
              )?.id;
              const priorOptionIds = operation.optionIds.filter((optionId) =>
                groups
                  .slice(0, groupIndex)
                  .some((priorGroup) =>
                    priorGroup.options.some((option) => option.id === optionId),
                  ),
              );
              return (
                <SelectUI<number>
                  key={group.key}
                  className="mb-2 text-left"
                  label={group.label}
                  name={`${parameter.name}-${operation.id}-${group.key}`}
                  placeholder={`Выберите: ${group.label.toLowerCase()}`}
                  value={selectedOptionId ?? 0}
                  options={group.options
                    .filter((option) =>
                      hasPrice(option.id, [...priorOptionIds, option.id]),
                    )
                    .map((option) => ({
                      value: option.id,
                      label: option.translationRu,
                    }))}
                  onChange={(optionId) => {
                    const optionIds = buildOptionIds({
                      current: operation.optionIds,
                      changedGroupIndex: groupIndex,
                      changedOptionId: optionId,
                    });
                    if (optionIds.length === groups.length) {
                      update(operation, { optionIds });
                    }
                  }}
                />
              );
            })}
            <label className="block">
              <span className="mb-1 block text-sm">Количество</span>
              <input
                type="number"
                min={1}
                step={1}
                className="form-control w-20"
                value={operation.count}
                onChange={(event) =>
                  update(operation, {
                    count: Math.max(
                      1,
                      Number.parseInt(event.target.value, 10) || 1,
                    ),
                  })
                }
              />
            </label>
          </div>
        ))}
      </div>
      <button type="button" className="btn btn-orange mt-auto" onClick={add}>
        Добавить
      </button>
    </div>
  );
};

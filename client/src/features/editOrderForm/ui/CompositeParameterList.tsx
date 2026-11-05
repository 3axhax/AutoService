import { getBaseOptionIds } from "@entities/orderParameters/model/selectedOptions";
import type { CompositeOperation } from "@entities/order";
import { setOrdersValue } from "@entities/order";
import {
  type ParametersItem,
  selectOrderParametersList,
  selectOrderParametersOrdersValue,
} from "@entities/orderParameters";
import { useAppDispatch, useAppSelector } from "@shared/store/hooks.ts";
import { PencilSquareIcon, TrashIcon } from "@heroicons/react/24/outline";
import { SelectOrRadio } from "@shared/ui/SelectOrRadio";
import { Modal } from "@shared/ui/Modal.tsx";
import { useState } from "react";

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
  const { priceList, pending, loaded, error } = useAppSelector((state) => state.price);
  const writing = useAppSelector((state) => state.order.pending || state.shifts.pending);
  const pricesUnavailable = pending || !loaded || !!error || writing;
  const orderValues = useAppSelector((state) =>
    selectOrderParametersOrdersValue(state, orderId),
  );
  const operations =
    (orderValues[parameter.name] as CompositeOperation[] | undefined) ?? [];
  const [modalOpen, setModalOpen] = useState(false);
  const [editingOperationId, setEditingOperationId] = useState<string | null>(
    null,
  );
  const [draftOperation, setDraftOperation] =
    useState<CompositeOperation | null>(null);
  const parameters = useAppSelector(selectOrderParametersList);
  const dependencies = useAppSelector((state) => state.orderParameters.optionOptionDependence);
  const baseOptionIds = getBaseOptionIds(orderValues, parameters);

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

  const usesMappedOptions = groups.some((group) =>
    group.options.some((option) => dependencies[option.id]?.[parameter.id]),
  );

  const setOperations = (value: CompositeOperation[]) => {
    if (!pricesUnavailable)
      dispatch(setOrdersValue({ orderId, name: parameter.name, value }));
  };

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

  const openAddModal = () => {
    if (pricesUnavailable) return;
    const optionIds = usesMappedOptions ? [] : buildOptionIds({});
    if (!usesMappedOptions && optionIds.length !== groups.length) return;
    setEditingOperationId(null);
    setDraftOperation({ id: "", optionIds, count: 1 });
    setModalOpen(true);
  };

  const openEditModal = (operation: CompositeOperation) => {
    if (pricesUnavailable) return;
    setEditingOperationId(operation.id);
    setDraftOperation({ ...operation, optionIds: [...operation.optionIds] });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingOperationId(null);
    setDraftOperation(null);
  };

  const applyDraft = () => {
    if (pricesUnavailable || !draftOperation || draftOperation.optionIds.length !== groups.length) {
      return;
    }
    if (editingOperationId) {
      setOperations(
        operations.map((operation) =>
          operation.id === editingOperationId
            ? { ...draftOperation, id: editingOperationId }
            : operation,
        ),
      );
      return;
    }
    setOperations([
      ...operations,
      {
        ...draftOperation,
        id: `composite-${Date.now()}-${operations.length + 1}`,
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
            <div className="flex items-center justify-between gap-3">
              <span>
                {parameter.translationRu} {operationIndex + 1}
              </span>
              <div className="flex items-center gap-2">
                <button
                  disabled={pricesUnavailable}
                  type="button"
                  aria-label={`Редактировать ${parameter.translationRu.toLowerCase()} ${operationIndex + 1}`}
                  className="text-gray-600 hover:text-purple-600 dark:text-gray-300 cursor-pointer"
                  onClick={() => openEditModal(operation)}
                >
                  <PencilSquareIcon className="h-5 w-5" />
                </button>
                <button
                  disabled={pricesUnavailable}
                  type="button"
                  aria-label={`Удалить ${parameter.translationRu.toLowerCase()} ${operationIndex + 1}`}
                  className="text-red-600 cursor-pointer"
                  onClick={() =>
                    setOperations(
                      operations.filter((item) => item.id !== operation.id),
                    )
                  }
                >
                  <TrashIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
            <div className="mt-2 text-sm text-gray-600 dark:text-gray-300">
              {groups.map((group) => {
                const selectedOption = group.options.find((option) =>
                  operation.optionIds.includes(option.id),
                );
                return (
                  <div key={group.key}>
                    {group.label}: {selectedOption?.translationRu ?? "—"}
                  </div>
                );
              })}
              <div>Количество: {operation.count}</div>
            </div>
          </div>
        ))}
      </div>
      <button
        type="button"
        className="btn btn-orange mt-auto"
        disabled={pricesUnavailable}
        onClick={openAddModal}
      >
        Добавить
      </button>
      {draftOperation ? (
        <Modal
          open={modalOpen}
          setOpen={(open) => {
            if (!open) closeModal();
          }}
          title={
            editingOperationId
              ? `Редактировать: ${parameter.translationRu.toLowerCase()}`
              : `Добавить: ${parameter.translationRu.toLowerCase()}`
          }
          body={
            <div className="flex flex-col gap-3 pt-2">
              {groups.map((group, groupIndex) => {
                const selectedOptionId = group.options.find((option) =>
                  draftOperation.optionIds.includes(option.id),
                )?.id;
                const priorOptionIds = draftOperation.optionIds.filter(
                  (optionId) =>
                    groups
                      .slice(0, groupIndex)
                      .some((priorGroup) =>
                        priorGroup.options.some(
                          (option) => option.id === optionId,
                        ),
                      ),
                );
                return (
                  <SelectOrRadio
                    key={group.key}
                    label={group.label}
                    name={`${parameter.name}-draft-${group.key}`}
                    placeholder={`Выберите: ${group.label.toLowerCase()}`}
                    value={selectedOptionId?.toString() ?? ""}
                    disabled={usesMappedOptions && groupIndex > 0 && priorOptionIds.length < groupIndex}
                    options={group.options
                      .filter((option) => {
                        if (!usesMappedOptions) return hasPrice(option.id, [...priorOptionIds, option.id]);
                        if (groupIndex === 0) {
                          const allowed = dependencies[option.id]?.[parameter.id] ?? [];
                          return groups.slice(1).every((nextGroup) => nextGroup.options.some((child) =>
                            allowed.includes(child.id) &&
                            hasPrice(option.id, [option.id, child.id]) &&
                            hasPrice(child.id, [option.id, child.id]),
                          ));
                        }
                        const parent = priorOptionIds[0];
                        const allowed = dependencies[parent]?.[parameter.id] ?? [];
                        const selected = [...priorOptionIds, option.id];
                        return allowed.includes(option.id) && selected.every((id) => hasPrice(id, selected));
                      })
                      .map((option) => ({
                        value: option.id.toString(),
                        label: option.translationRu,
                      }))}
                    onChange={(value) => {
                      const optionId = Number(value);
                      if (usesMappedOptions) {
                        const optionIds = groupIndex === 0
                          ? [optionId, ...draftOperation.optionIds.filter((id) =>
                              (dependencies[optionId]?.[parameter.id] ?? []).includes(id),
                            )]
                          : [...priorOptionIds, optionId];
                        setDraftOperation({ ...draftOperation, optionIds });
                      } else {
                        const optionIds = buildOptionIds({
                          current: draftOperation.optionIds,
                          changedGroupIndex: groupIndex,
                          changedOptionId: optionId,
                        });
                        if (optionIds.length === groups.length) {
                          setDraftOperation({ ...draftOperation, optionIds });
                        }
                      }
                    }}
                  />
                );
              })}
              <label className="block text-left">
                <span className="mb-1 block text-sm">Количество</span>
                <input
                  type="number"
                  min={1}
                  step={1}
                  className="form-control w-20"
                  value={draftOperation.count}
                  onChange={(event) =>
                    setDraftOperation({
                      ...draftOperation,
                      count: Math.max(
                        1,
                        Number.parseInt(event.target.value, 10) || 1,
                      ),
                    })
                  }
                />
              </label>
            </div>
          }
          buttons={[{ label: "Применить", onClick: applyDraft, disabled: draftOperation.optionIds.length !== groups.length }]}
        />
      ) : null}
    </div>
  );
};

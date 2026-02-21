import { RootState } from "@shared/store";
import { createSelector } from "@reduxjs/toolkit";
import { FilterItem, OrderValue } from "@entities/order/model/types.ts";
import { formatOrderValueFromOrderItemList } from "@entities/order/model/slice.ts";
import { ParametersType } from "@entities/orderParameters";

const EMPTY_OBJECT = {} as OrderValue;

export const selectPendingOrderParameters = (state: RootState) =>
  state.orderParameters.pending;
export const selectErrorOrderParameters = (state: RootState) =>
  state.orderParameters.error;

const selectOrdersListValue = (state: RootState, orderId: number) =>
  state.order.ordersList[orderId] ?? EMPTY_OBJECT;

const selectOrderValue = (state: RootState, orderId: number) =>
  state.order.ordersValue[orderId] ?? EMPTY_OBJECT;

export const selectOrderParametersList = (state: RootState) =>
  state.orderParameters.parametersList;

export const selectOrderParametersOrdersValue = createSelector(
  [selectOrderValue, selectOrdersListValue],
  (orderValue, listItem) => {
    if (Object.keys(orderValue).length > 0) {
      return orderValue;
    }
    if (Object.keys(listItem.optionValues).length > 0) {
      return formatOrderValueFromOrderItemList(listItem);
    }
    return EMPTY_OBJECT;
  },
);

const selectParameterOptionDependence = (state: RootState) =>
  state.orderParameters.parameterOptionDependence;

const selectOptionOptionDependence = (state: RootState) =>
  state.orderParameters.optionOptionDependence;

export const usefulOrderValuesWithOptions = createSelector(
  [selectOrderParametersOrdersValue, selectOrderParametersList],
  (orderValues, parametersList) => {
    const { id: _id, active: _active, ...usefulOrderValues } = orderValues;

    const parametersListWithOptions = parametersList
      .filter((parameter) => parameter.options.length > 0)
      .map((parameter) => parameter.name);

    const filteredEntries = Object.entries(usefulOrderValues).filter(([key]) =>
      parametersListWithOptions.includes(key),
    );

    return Object.fromEntries(filteredEntries);
  },
);

export const formatedOrderParametersList = createSelector(
  [
    selectOrderParametersList,
    selectParameterOptionDependence,
    selectOptionOptionDependence,
    usefulOrderValuesWithOptions,
  ],
  (
    parametersList,
    parameterOptionDependence,
    optionOptionDependence,
    ordersValue,
  ) => {
    const values = Object.values(ordersValue).map((value) => +value);
    const parameterDependenceIds = Object.keys(parameterOptionDependence).map(
      (id) => parseInt(id),
    );

    const optionDependenceIds = Object.keys(optionOptionDependence)
      .map((id) => parseInt(id))
      .filter((id) => values.includes(id));

    return parametersList
      .filter((parameter) => {
        if (parameterDependenceIds.includes(parameter.id)) {
          return parameterOptionDependence[parameter.id].every((id) =>
            values.includes(id),
          );
        }
        return true;
      })
      .map((parameter) => {
        const parameterDependenceId = optionDependenceIds.find((optionId) =>
          Object.keys(optionOptionDependence[optionId])
            .map((id) => parseInt(id))
            .includes(parameter.id),
        );
        if (parameterDependenceId) {
          return {
            ...parameter,
            options: parameter.options.filter((option) =>
              optionOptionDependence[parameterDependenceId][
                parameter.id
              ].includes(option.id),
            ),
          };
        }
        return parameter;
      })
      .sort((a, b) => ((a.order ?? 0) > (b.order ?? 0) ? 1 : -1));
  },
);

export const selectFormatedParameterForFilter = createSelector(
  [selectOrderParametersList, (_, filterItem: FilterItem) => filterItem],
  (
    parameterList,
    filterItem,
  ): { parameterName: string; value: string } | null => {
    if (!parameterList || !filterItem) return null;
    const parameter = parameterList.find(
      (p) => p.name === filterItem.filterName,
    );
    if (!parameter) return null;
    const parameterName = parameter.translationRu;
    const value =
      parameter.type === ParametersType.INPUT
        ? filterItem.filterValue.toString()
        : "";
    return {
      parameterName,
      value,
    };
  },
);

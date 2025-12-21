import { RootState } from "@shared/store";
import { createSelector } from "@reduxjs/toolkit";

const EMPTY_OBJECT = {};

export const selectPendingOrderParameters = (state: RootState) =>
  state.orderParameters.pending;
export const selectErrorOrderParameters = (state: RootState) =>
  state.orderParameters.error;

export const selectOrderParametersOrdersValue = (
  state: RootState,
  orderId: number,
) => state.orderParameters.ordersValue[orderId] ?? EMPTY_OBJECT;

const selectOrderParametersList = (state: RootState) =>
  state.orderParameters.parametersList;

const selectParameterOptionDependence = (state: RootState) =>
  state.orderParameters.parameterOptionDependence;

const selectOptionOptionDependence = (state: RootState) =>
  state.orderParameters.optionOptionDependence;

export const formatedOrderParametersList = createSelector(
  [
    selectOrderParametersList,
    selectParameterOptionDependence,
    selectOptionOptionDependence,
    selectOrderParametersOrdersValue,
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
      });
  },
);

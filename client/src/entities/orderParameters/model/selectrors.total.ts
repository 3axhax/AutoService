import { createSelector } from "@reduxjs/toolkit";
import {
  selectOrderParametersList,
  usefulOrderValuesWithOptions,
} from "./selectors";
import { RootState } from "@shared/store";
import { calculateOrderPrice } from "@autoservice/pricing";

const priceList = (state: RootState) => state.price.priceList;

export const orderTotalValue = createSelector(
  [usefulOrderValuesWithOptions, priceList, selectOrderParametersList],
  (
    parametersValues,
    priceList,
    parametersList,
  ) =>
    calculateOrderPrice({
      orderValues: parametersValues,
      priceList,
      parameters: parametersList,
    }),
);

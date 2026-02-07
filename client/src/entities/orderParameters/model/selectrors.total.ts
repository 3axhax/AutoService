import { createSelector } from "@reduxjs/toolkit";
import {
  selectOrderParametersList,
  usefulOrderValuesWithOptions,
} from "./selectors";
import { RootState } from "@shared/store";

interface PriceItem {
  value: number;
  conditions: { id: number }[];
  discountImpact: boolean;
}

const priceList = (state: RootState) => state.price.priceList;

export const orderTotalValue = createSelector(
  [usefulOrderValuesWithOptions, priceList, selectOrderParametersList],
  (
    parametersValues,
    priceList,
    parametersList,
  ): { totalValue: number; totalValueWithDiscount: number } => {
    let total = 0;
    let totalWithDiscount = 0;
    let discount = 1;

    const selectedValues = Object.values(parametersValues).reduce(
      (acc: Record<number, number>, value) => {
        if (typeof value === "object" && value !== null) {
          let values = {};
          for (const k in value) {
            if (+value[k] > 0) {
              values = { ...values, [+k]: +value[k] };
            }
          }
          return { ...acc, ...values };
        }
        return { ...acc, [+value]: 1 };
      },
      {},
    );

    const selectedParameters = Object.values(parametersValues).reduce(
      (acc: number[], value) => {
        if (typeof value === "object" && value !== null) {
          const values = [];
          for (const k in value) {
            if (+value[k] > 0) {
              values.push(+k);
            }
          }
          return [...acc, ...values];
        }
        return [...acc, +value];
      },
      [],
    );

    const discountParameter = parametersList.find(
      (parameter) => parameter.name === "discount",
    );

    if (discountParameter) {
      const selectedDiscount = discountParameter.options.find((option) =>
        selectedParameters.includes(option.id),
      );
      if (selectedDiscount) {
        discount = 1 - parseInt(selectedDiscount.translationRu) / 100;
      }
    }

    const relatedPrice = priceList.reduce((acc: PriceItem[], price) => {
      if (
        price.conditions
          .map((item) => item.id)
          .every((item) => selectedParameters.includes(item))
      ) {
        let result = [...acc];
        for (const k in result) {
          if (
            result[k].conditions
              .map((item) => item.id)
              .every((item) =>
                price.conditions.map((item) => item.id).includes(item),
              )
          ) {
            delete result[k];
          }
        }
        result = Object.values(result);
        return [...result, price];
      }
      return acc;
    }, []);

    relatedPrice.forEach((price) => {
      totalWithDiscount +=
        price.value *
        price.conditions.reduce((acc: number, condition) => {
          return acc * (selectedValues[condition.id] ?? 1);
        }, 1) *
        (price.discountImpact ? discount : 1);
      total +=
        price.value *
        price.conditions.reduce((acc: number, condition) => {
          return acc * (selectedValues[condition.id] ?? 1);
        }, 1);
    });

    return { totalValue: total, totalValueWithDiscount: totalWithDiscount };
  },
);

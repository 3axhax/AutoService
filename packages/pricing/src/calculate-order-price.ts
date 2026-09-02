import {
  PriceCalculationInput,
  PriceCalculationResult,
  PricingItem,
} from './types';

const DEFAULT_DISCOUNT_PARAMETER_NAME = 'discount';

const isQuantityMap = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

export const calculateOrderPrice = ({
  orderValues,
  priceList,
  parameters,
}: PriceCalculationInput): PriceCalculationResult => {
  const parameterNamesWithOptions = new Set(
    parameters
      .filter((parameter) => parameter.options.length > 0)
      .map((parameter) => parameter.name),
  );

  const selectedValues: Record<number, number> = {};

  Object.entries(orderValues).forEach(([parameterName, value]) => {
    if (!parameterNamesWithOptions.has(parameterName)) {
      return;
    }

    if (isQuantityMap(value)) {
      Object.entries(value).forEach(([optionId, count]) => {
        const numericOptionId = Number(optionId);
        const numericCount = Number(count);

        if (
          Number.isFinite(numericOptionId) &&
          Number.isFinite(numericCount) &&
          numericCount > 0
        ) {
          selectedValues[numericOptionId] = numericCount;
        }
      });
      return;
    }

    const optionId = Number(value);
    if (Number.isFinite(optionId)) {
      selectedValues[optionId] = 1;
    }
  });

  const selectedOptionIds = Object.keys(selectedValues).map(Number);
  let discount = 1;

  const discountParameter = parameters.find(
    (parameter) => parameter.name === DEFAULT_DISCOUNT_PARAMETER_NAME,
  );
  const selectedDiscount = discountParameter?.options.find((option) =>
    selectedOptionIds.includes(option.id),
  );

  if (selectedDiscount) {
    const discountPercent = Number.parseInt(selectedDiscount.translationRu, 10);
    if (Number.isFinite(discountPercent)) {
      discount = 1 - discountPercent / 100;
    }
  }

  const relatedPrice = priceList.reduce<PricingItem[]>((result, price) => {
    const conditionIds = price.conditions.map((condition) => condition.id);
    const matches = conditionIds.every((conditionId) =>
      selectedOptionIds.includes(conditionId),
    );

    if (!matches) {
      return result;
    }

    const pricesWithoutLessSpecificMatches = result.filter(
      (existingPrice) =>
        !existingPrice.conditions
          .map((condition) => condition.id)
          .every((conditionId) => conditionIds.includes(conditionId)),
    );

    return [...pricesWithoutLessSpecificMatches, price];
  }, []);

  return relatedPrice.reduce<PriceCalculationResult>(
    (totals, price) => {
      const quantity = price.conditions.reduce(
        (result, condition) =>
          result * (selectedValues[condition.id] ?? 1),
        1,
      );
      const priceValue = price.value * quantity;

      return {
        totalValue: totals.totalValue + priceValue,
        totalValueWithDiscount:
          totals.totalValueWithDiscount +
          priceValue * (price.discountImpact ? discount : 1),
      };
    },
    { totalValue: 0, totalValueWithDiscount: 0 },
  );
};

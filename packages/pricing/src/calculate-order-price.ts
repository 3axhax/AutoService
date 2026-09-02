import {
  PriceCalculationInput,
  PriceCalculationResult,
  PricingItem,
} from './types';

const DEFAULT_DISCOUNT_PARAMETER_NAME = 'discount';

const isQuantityMap = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const getMatchingPrices = (
  priceList: PricingItem[],
  selectedOptionIds: number[],
): PricingItem[] =>
  priceList.reduce<PricingItem[]>((result, price) => {
    const conditionIds = price.conditions.map((condition) => condition.id);
    const matches = conditionIds.every((conditionId) =>
      selectedOptionIds.includes(conditionId),
    );

    if (!matches) {
      return result;
    }

    const pricesWithoutLessSpecificMatches = result.filter(
      (existingPrice) =>
        existingPrice.mainOptionId !== price.mainOptionId ||
        !existingPrice.conditions
          .map((condition) => condition.id)
          .every((conditionId) => conditionIds.includes(conditionId)),
    );

    return [...pricesWithoutLessSpecificMatches, price];
  }, []);

const sumPrices = ({
  prices,
  selectedValues,
  discount,
}: {
  prices: PricingItem[];
  selectedValues: Record<number, number>;
  discount: number;
}): PriceCalculationResult =>
  prices.reduce<PriceCalculationResult>(
    (totals, price) => {
      const quantity = price.mainOptionId
        ? (selectedValues[price.mainOptionId] ?? 1)
        : price.conditions.reduce(
            (result, condition) => result * (selectedValues[condition.id] ?? 1),
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
  const compositeParameterNames = new Set(
    parameters
      .filter((parameter) => parameter.type === 'COMPOSITE_LIST')
      .map((parameter) => parameter.name),
  );

  const selectedValues: Record<number, number> = {};
  const compositeOperations = [...compositeParameterNames].flatMap(
    (parameterName) => {
      const value = orderValues[parameterName];
      return Array.isArray(value) ? value : [];
    },
  );

  Object.entries(orderValues).forEach(([parameterName, value]) => {
    if (compositeParameterNames.has(parameterName)) {
      return;
    }
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

  const compositeOptionIds = new Set<number>();
  compositeOperations.forEach((operation) => {
    if (!isQuantityMap(operation) || !Array.isArray(operation.optionIds))
      return;
    operation.optionIds.forEach((optionId) =>
      compositeOptionIds.add(Number(optionId)),
    );
  });

  compositeOptionIds.forEach((optionId) => delete selectedValues[optionId]);
  const baseSelectedOptionIds = Object.keys(selectedValues).map(Number);
  const basePrices = getMatchingPrices(priceList, baseSelectedOptionIds);
  const total = sumPrices({ prices: basePrices, selectedValues, discount });

  compositeOperations.forEach((operation) => {
    if (!isQuantityMap(operation) || !Array.isArray(operation.optionIds)) {
      return;
    }
    const selectedOperationOptionIds = operation.optionIds.map(Number);
    const count = Number(operation.count ?? 1);
    if (
      selectedOperationOptionIds.length === 0 ||
      selectedOperationOptionIds.some(
        (optionId) => !Number.isFinite(optionId),
      ) ||
      !Number.isFinite(count) ||
      count <= 0
    ) {
      return;
    }

    const operationValues = selectedOperationOptionIds.reduce(
      (result, optionId) => ({ ...result, [optionId]: count }),
      { ...selectedValues },
    );
    const operationOptionIds = [
      ...baseSelectedOptionIds,
      ...selectedOperationOptionIds,
    ];
    const operationPrices = getMatchingPrices(
      priceList.filter(
        (price) =>
          price.mainOptionId !== undefined &&
          selectedOperationOptionIds.includes(price.mainOptionId),
      ),
      operationOptionIds,
    );
    const operationTotal = sumPrices({
      prices: operationPrices,
      selectedValues: operationValues,
      discount,
    });
    total.totalValue += operationTotal.totalValue;
    total.totalValueWithDiscount += operationTotal.totalValueWithDiscount;
  });

  return total;
};

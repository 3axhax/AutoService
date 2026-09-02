export interface PricingCondition {
  id: number;
}

export interface PricingItem {
  value: number;
  conditions: PricingCondition[];
  discountImpact: boolean;
}

export interface PricingParameterOption {
  id: number;
  translationRu: string;
}

export interface PricingParameter {
  name: string;
  options: PricingParameterOption[];
}

export type PricingOrderValues = Record<string, unknown>;

export interface PriceCalculationInput {
  orderValues: PricingOrderValues;
  priceList: PricingItem[];
  parameters: PricingParameter[];
}

export interface PriceCalculationResult {
  totalValue: number;
  totalValueWithDiscount: number;
}

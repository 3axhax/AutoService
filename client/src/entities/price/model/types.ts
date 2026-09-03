export interface PriceItem {
  value: number;
  conditions: { id: number }[];
  discountImpact: boolean;
  mainOptionId: number;
}

export interface PriceState {
  pending: boolean;
  error: string;
  priceList: PriceItem[];
}

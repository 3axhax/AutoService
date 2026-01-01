export interface PriceItem {
  value: number;
  condition: number[];
  discountImpact: boolean;
}

export interface PriceState {
  pending: boolean;
  error: string;
  priceList: PriceItem[];
}

export interface PriceResponse {
  list: PriceItem[];
}

export interface OrderValue {
  id: number;
  [key: string]: boolean | number | string | Record<number | string, number>;
}

export interface OrderItem {
  id: number;
  totalValue: number;
  totalValueWithDiscount: number;
  createdAt: string;
  shiftId?: number;
  optionValues: {
    parameterId: number;
    value: string;
    count: number;
    parameter: { name: string; type: string };
    option?: { translationRu: string };
  }[];
}

export interface OrderState {
  pending: boolean;
  error: string;
  ordersValue: Record<number, OrderValue>;
  ordersList: Record<number, OrderItem>;
}

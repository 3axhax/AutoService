export interface OrderValue {
  id: number;
  [key: string]: boolean | number | string | Record<number | string, number>;
}

export interface OrderState {
  pending: boolean;
  error: string;
  ordersValue: Record<number, OrderValue>;
}

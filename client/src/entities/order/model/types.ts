export interface OrderState {
  pending: boolean;
  error: string;
  ordersValue: Record<
    number,
    Record<string, number | string | Record<number | string, number>>
  >;
}

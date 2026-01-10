interface ShiftOrderItem {
  id: number;
  totalValue: number;
  createdAt: string;
}

export interface ShiftItem {
  id: number;
  active: boolean;
  orders: ShiftOrderItem[];
}

export interface ShiftsState {
  pending: boolean;
  error: string;
  shiftsList: Record<number, ShiftItem>;
}

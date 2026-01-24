export interface ShiftItem {
  id: number;
  active: boolean;
  createdAt: string;
  closedAt: string | null;
  totalOrdersSum: number;
}

export interface ShiftsState {
  pending: boolean;
  error: string;
  shiftsList: Record<number, ShiftItem>;
}

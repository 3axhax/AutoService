export interface ShiftItem {
  id: number;
  active: boolean;
}

export interface ShiftsState {
  pending: boolean;
  error: string;
  shiftsList: Record<number, ShiftItem>;
}

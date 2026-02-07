export interface ShiftItem {
  id: number;
  active: boolean;
  createdAt: string;
  closedAt: string | null;
  totalOrdersSum: number;
  totalOrdersSumWithDiscount: number;
  totalAdditionalWorksSum: number;
}

export interface ShiftsFilters {
  closedAtStart?: string | null;
  closedAtEnd?: string | null;
}

export interface ShiftsState {
  pending: boolean;
  error: string;
  shiftsList: Record<number, ShiftItem>;
  pagination: {
    currentPage: number;
    recordPerPage: number;
    totalRecord: number;
  };
  filters: ShiftsFilters;
}

import { RootState } from "@shared/store";
import { createSelector } from "@reduxjs/toolkit";

export const SelectWorkerActiveShift = (state: RootState) =>
  Object.values(state.shifts.shiftsList).find((shift) => shift.active);

export const SelectWorkerActiveShiftClosedOrdersList = createSelector(
  [SelectWorkerActiveShift],
  (shift) =>
    shift && shift.orders
      ? [...shift.orders].sort((a, b) =>
          Date.parse(a.createdAt) > Date.parse(b.createdAt) ? -1 : 1,
        )
      : [],
);

export const SelectWorkerActiveShiftClosedOrdersTotalValue = createSelector(
  [SelectWorkerActiveShiftClosedOrdersList],
  (ordersList) =>
    ordersList.reduce((total, order) => total + order.totalValue, 0),
);

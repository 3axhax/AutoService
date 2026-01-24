import { RootState } from "@shared/store";
import { createSelector } from "@reduxjs/toolkit";

const SelectShiftList = (state: RootState) => state.shifts.shiftsList;

export const SelectShiftListSortByCreated = createSelector(
  [SelectShiftList],
  (list) =>
    Object.values(list).sort((a, b) => (a.createdAt > b.createdAt ? -1 : 1)),
);

export const SelectWorkerActiveShift = (state: RootState) =>
  Object.values(state.shifts.shiftsList).find((shift) => shift.active);

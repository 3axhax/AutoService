import { RootState } from "@shared/store";

export const SelectWorkerActiveShift = (state: RootState) =>
  Object.values(state.shifts.shiftsList).find((shift) => shift.active);

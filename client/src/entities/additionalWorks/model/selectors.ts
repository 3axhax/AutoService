import { RootState } from "@shared/store";
import { createSelector } from "@reduxjs/toolkit";

const EMPTY_OBJECT = {};
export const additionalWorkErrorSelect = (state: RootState) =>
  state.additionalWorks.error;

const additionalWorksValuesSelect = (state: RootState) =>
  state.additionalWorks.additionalWorksValue;

export const activeAdditionalWorksListSelect = createSelector(
  [additionalWorksValuesSelect],
  (additionalWorksValue) =>
    Object.values(additionalWorksValue).filter(
      (additionalWork) => additionalWork.active,
    ),
);

export const selectAdditionalWorkParametersAdditionalWorksValue = (
  state: RootState,
  workId: number,
) => state.additionalWorks.additionalWorksValue[workId] ?? EMPTY_OBJECT;

const additionalWorkListSelect = (state: RootState) =>
  state.additionalWorks.additionalWorksList;

export const workerActiveShiftClosedAdditionalWorksListSelect = createSelector(
  [additionalWorkListSelect],
  (additionalWorks) =>
    additionalWorks
      ? [...Object.values(additionalWorks)].sort((a, b) =>
          Date.parse(a.createdAt) > Date.parse(b.createdAt) ? -1 : 1,
        )
      : [],
);

export const workerActiveShiftClosedAdditionalWorksTotalValueSelect =
  createSelector(
    [workerActiveShiftClosedAdditionalWorksListSelect],
    (additionalWorksList) =>
      additionalWorksList.reduce(
        (total, additionalWork) => total + (additionalWork.totalValue ?? 0),
        0,
      ),
  );

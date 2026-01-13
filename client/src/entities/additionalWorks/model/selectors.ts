import { RootState } from "@shared/store";
import { createSelector } from "@reduxjs/toolkit";
import { AdditionalWorkValue } from "./types";

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

const selectAdditionalWorksListWork = (state: RootState, workId: number) =>
  state.additionalWorks.additionalWorksList[workId] ?? EMPTY_OBJECT;

const selectAdditionalWorksValue = (state: RootState, workId: number) =>
  state.additionalWorks.additionalWorksValue[workId] ?? EMPTY_OBJECT;

export const selectAdditionalWorkValue = createSelector(
  [selectAdditionalWorksValue, selectAdditionalWorksListWork],
  (valuesItem, listItem): AdditionalWorkValue => {
    if (Object.keys(valuesItem).length > 0) {
      return valuesItem;
    }
    if (Object.keys(listItem).length > 0) {
      return listItem;
    }
    return EMPTY_OBJECT as AdditionalWorkValue;
  },
);

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

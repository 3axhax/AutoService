import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { WritableDraft } from "immer";
import { AdditionalWorkItem, AdditionalWorksState } from "./types";
import { ErrorActionType } from "@shared/types";
import {
  addAdditionalWork,
  getAdditionalWorksByShiftId,
  getAdditionalWorksFromActiveShift,
} from "@entities/additionalWorks";

const initialState: AdditionalWorksState = {
  pending: false,
  loading: false,
  readError: "",
  error: "",
  additionalWorksValue: {},
  additionalWorksList: {},
};

export const additionalWorksSlice = createSlice({
  name: "additionalWorks",
  initialState,
  reducers: {
    beginEditAdditionalWork: (
      state: WritableDraft<AdditionalWorksState>,
      action: PayloadAction<number>,
    ) => {
      if (state.loading || state.readError) return;
      state.error = "";
      const work = state.additionalWorksList[action.payload];
      if (work) state.additionalWorksValue[action.payload] = { ...work };
    },
    resetError: (state: WritableDraft<AdditionalWorksState>) => {
      state.error = "";
    },
    setPending: (
      state: WritableDraft<AdditionalWorksState>,
      action: PayloadAction<boolean>,
    ) => {
      state.pending = action.payload;
    },
    setAdditionalWorksValue: (
      state: WritableDraft<AdditionalWorksState>,
      action: PayloadAction<{
        additionalWorkId: number;
        name: string;
        value: string | number;
      }>,
    ) => {
      if (state.pending) return;
      if (action.payload.name) {
        if (
          !state.additionalWorksValue[action.payload.additionalWorkId] &&
          state.additionalWorksList[action.payload.additionalWorkId]
        ) {
          state.additionalWorksValue[action.payload.additionalWorkId] = {
            ...state.additionalWorksList[action.payload.additionalWorkId],
          };
        }
        if (state.additionalWorksValue[action.payload.additionalWorkId]) {
          state.additionalWorksValue[action.payload.additionalWorkId][
            action.payload.name
          ] = action.payload.value;
        }
      }
    },
    addNewActiveAdditionalWork: (
      state: WritableDraft<AdditionalWorksState>,
    ) => {
      state.error = "";
      const id =
        Object.values(state.additionalWorksValue).length > 0
          ? Math.min(
              0,
              ...Object.keys(state.additionalWorksValue).map((key) =>
                parseInt(key),
              ),
            ) - 1
          : -1;
      state.additionalWorksValue[id] = {
        id,
        active: true,
        description: "",
        totalValue: null,
      };
    },
    deleteActiveAdditionalWork: (
      state: WritableDraft<AdditionalWorksState>,
      action: PayloadAction<number>,
    ) => {
      if (state.additionalWorksValue[action.payload]) {
        delete state.additionalWorksValue[action.payload];
      }
    },
    clearAdditionalWorksList: (state: WritableDraft<AdditionalWorksState>) => {
      state.additionalWorksList = {};
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(
        addAdditionalWork.fulfilled,
        (
          state: WritableDraft<AdditionalWorksState>,
          action: PayloadAction<AdditionalWorkItem & { internalId: number }>,
        ) => {
          if (!action.payload) return;
          state.pending = false;
          const { internalId: _internalId, ...work } = action.payload;
          state.additionalWorksList[work.id] = work;
          if (
            action.payload.internalId &&
            state.additionalWorksValue[action.payload.internalId]
          ) {
            state.additionalWorksValue[action.payload.internalId].active =
              false;
          }
        },
      )
      .addCase(
        getAdditionalWorksFromActiveShift.fulfilled,
        (
          state: WritableDraft<AdditionalWorksState>,
          action: PayloadAction<AdditionalWorkItem[]>,
        ) => {
          if (action.payload) {
            state.additionalWorksList = mapAdditionalWorksResponseList(
              action.payload,
            );
          }
        },
      )
      .addCase(
        getAdditionalWorksByShiftId.fulfilled,
        (
          state: WritableDraft<AdditionalWorksState>,
          action: PayloadAction<AdditionalWorkItem[]>,
        ) => {
          if (action.payload) {
            state.additionalWorksList = mapAdditionalWorksResponseList(
              action.payload,
            );
          }
        },
      )
      .addMatcher(
        (action) =>
          [
            "additionalWorks/fromActiveShift",
            "additionalWorks/getByShiftId",
          ].some((type) => action.type === `${type}/pending`),
        (state) => {
          state.loading = true;
        },
      )
      .addMatcher(
        (action) =>
          [
            "additionalWorks/fromActiveShift",
            "additionalWorks/getByShiftId",
          ].some(
            (type) =>
              action.type === `${type}/fulfilled` ||
              action.type === `${type}/rejected`,
          ),
        (state, action) => {
          state.loading = false;
          state.readError = action.type.endsWith("/rejected")
            ? "Не удалось обновить список. Повторите загрузку перед редактированием."
            : "";
        },
      )
      .addMatcher(
        (action) =>
          action.type.endsWith("/rejected") &&
          action.type.startsWith("additionalWorks") &&
          !/^additionalWorks\/(fromActiveShift|getByShiftId|getForAdmin)\//.test(action.type),
        (
          state: WritableDraft<AdditionalWorksState>,
          action: ErrorActionType,
        ) => {
          state.error = action.error.message ? action.error.message : "";
        },
      )
      .addMatcher(
        (action) =>
          action.type.endsWith("/pending") &&
          action.type.startsWith("additionalWorks") &&
          !/^additionalWorks\/(fromActiveShift|getByShiftId|getForAdmin)\//.test(action.type),
        (state: WritableDraft<AdditionalWorksState>) => {
          state.error = "";
        },
      );
  },
});

export const {
  resetError,
  setPending,
  setAdditionalWorksValue,
  beginEditAdditionalWork,
  addNewActiveAdditionalWork,
  deleteActiveAdditionalWork,
  clearAdditionalWorksList,
} = additionalWorksSlice.actions;

export default additionalWorksSlice.reducer;

const mapAdditionalWorksResponseList = (list: AdditionalWorkItem[]) =>
  list.reduce(
    (acc, additionalWork) => ({ ...acc, [additionalWork.id]: additionalWork }),
    {},
  );

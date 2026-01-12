import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { WritableDraft } from "immer";
import {
  AdditionalWorkItem,
  AdditionalWorksState,
  AdditionalWorkValue,
} from "./types";
import { ErrorActionType } from "@shared/types";
import {
  addAdditionalWork,
  getAdditionalWorksFromActiveShift,
} from "@entities/additionalWorks";

const initialState: AdditionalWorksState = {
  pending: false,
  error: "",
  additionalWorksValue: {},
  additionalWorksList: {},
};

export const additionalWorksSlice = createSlice({
  name: "additionalWorks",
  initialState,
  reducers: {
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
      if (
        action.payload.name &&
        state.additionalWorksValue[action.payload.additionalWorkId]
      ) {
        state.additionalWorksValue[action.payload.additionalWorkId][
          action.payload.name
        ] = action.payload.value;
      }
    },
    addNewActiveAdditionalWork: (
      state: WritableDraft<AdditionalWorksState>,
    ) => {
      state.error = "";
      const id =
        Object.values(state.additionalWorksValue).length > 0
          ? Math.min(
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
          action: PayloadAction<AdditionalWorkValue & { internalId: number }>,
        ) => {
          state.pending = false;
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
          state.pending = false;
          if (action.payload) {
            state.additionalWorksList = action.payload.reduce(
              (acc, additionalWork) => ({
                ...acc,
                [additionalWork.id]: additionalWork,
              }),
              {},
            );
          }
        },
      )
      .addMatcher(
        (action) =>
          action.type.endsWith("/rejected") &&
          action.type.startsWith("additionalWorks"),
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
          action.type.startsWith("additionalWorks"),
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
  addNewActiveAdditionalWork,
  deleteActiveAdditionalWork,
  clearAdditionalWorksList,
} = additionalWorksSlice.actions;

export default additionalWorksSlice.reducer;

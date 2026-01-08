import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { WritableDraft } from "immer";
import { ShiftItem, ShiftsState } from "./types.ts";
import { ErrorActionType } from "@shared/types";
import { getActiveShift } from "@entities/shifts";

const initialState: ShiftsState = {
  pending: false,
  error: "",
  shiftsList: {},
};

export const shiftsSlice = createSlice({
  name: "shifts",
  initialState,
  reducers: {
    resetError: (state: WritableDraft<ShiftsState>) => {
      state.error = "";
    },
    setPending: (
      state: WritableDraft<ShiftsState>,
      action: PayloadAction<boolean>,
    ) => {
      state.pending = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(
        getActiveShift.fulfilled,
        (
          state: WritableDraft<ShiftsState>,
          action: PayloadAction<ShiftItem>,
        ) => {
          state.pending = false;
          if (action.payload) {
            state.shiftsList[action.payload.id] = action.payload;
          }
        },
      )
      .addMatcher(
        (action) =>
          action.type.endsWith("/rejected") && action.type.startsWith("shifts"),
        (state: WritableDraft<ShiftsState>, action: ErrorActionType) => {
          state.error = action.error.message ? action.error.message : "";
        },
      )
      .addMatcher(
        (action) =>
          action.type.endsWith("/pending") && action.type.startsWith("shifts"),
        (state: WritableDraft<ShiftsState>) => {
          state.error = "";
        },
      );
  },
});

export const { resetError, setPending } = shiftsSlice.actions;

export default shiftsSlice.reducer;

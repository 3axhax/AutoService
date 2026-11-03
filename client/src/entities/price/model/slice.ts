import type { RootState } from "@shared/store";
import {
  createAsyncThunk,
  createSlice,
  type PayloadAction,
} from "@reduxjs/toolkit";
import Request from "@shared/transport/RestAPI.ts";
import { HandlerAxiosError } from "@shared/transport/RequestHandlersError.ts";
import type { WritableDraft } from "immer";
import { ErrorActionType } from "@shared/types";
import { PriceState, PriceItem } from "./types";

export const getPriceList = createAsyncThunk(
  "price/getList",
  async (_, { getState }) => {
    const state = getState() as RootState;
    try {
      const response = await Request.forSession(state.user.token).get("/price");
      return response.data;
    } catch (e) {
      HandlerAxiosError(e);
    }
  },
);

const initialState: PriceState = {
  pending: false,
  loaded: false,
  error: "",
  priceList: [],
};

export const priceSlice = createSlice({
  name: "price",
  initialState,
  reducers: {
    resetError: (state: WritableDraft<PriceState>) => {
      state.error = "";
    },
    setPending: (
      state: WritableDraft<PriceState>,
      action: PayloadAction<boolean>,
    ) => {
      state.pending = action.payload;
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(
        getPriceList.fulfilled,
        (
          state: WritableDraft<PriceState>,
          action: PayloadAction<PriceItem[]>,
        ) => {
          state.pending = false;
          state.loaded = true;
          state.error = "";
          if (action.payload) {
            state.priceList = action.payload;
          }
        },
      )
      .addMatcher(
        (action) =>
          action.type.endsWith("/rejected") && action.type.startsWith("price"),
        (state: WritableDraft<PriceState>, action: ErrorActionType) => {
          state.pending = false;
          state.error = action.error.message ? action.error.message : "";
        },
      )
      .addMatcher(
        (action) =>
          action.type.endsWith("/pending") && action.type.startsWith("price"),
        (state: WritableDraft<PriceState>) => {
          state.pending = true;
          state.error = "";
        },
      );
  },
});

export const { resetError, setPending } = priceSlice.actions;

export default priceSlice.reducer;

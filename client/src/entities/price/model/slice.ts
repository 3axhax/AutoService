import {
  createAsyncThunk,
  createSlice,
  type PayloadAction,
} from "@reduxjs/toolkit";
import Request from "@shared/transport/RestAPI.ts";
import { HandlerAxiosError } from "@shared/transport/RequestHandlersError.ts";
import type { WritableDraft } from "immer";
import { RootState } from "@shared/store";
import { ErrorActionType } from "@shared/types";
import { PriceState, PriceItem } from "./types";

export const getPriceList = createAsyncThunk(
  "price/getList",
  async (_, { getState, dispatch }) => {
    const state = getState() as RootState;
    if (!state.price.pending) {
      dispatch(setPending(true));
      try {
        const response = await Request.get("/price");
        return response.data;
      } catch (e) {
        HandlerAxiosError(e);
      } finally {
        dispatch(setPending(false));
      }
    }
  },
);

const initialState: PriceState = {
  pending: false,
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
          if (action.payload) {
            state.priceList = action.payload;
          }
        },
      )
      .addMatcher(
        (action) =>
          action.type.endsWith("/rejected") && action.type.startsWith("price"),
        (state: WritableDraft<PriceState>, action: ErrorActionType) => {
          state.error = action.error.message ? action.error.message : "";
        },
      )
      .addMatcher(
        (action) =>
          action.type.endsWith("/pending") && action.type.startsWith("price"),
        (state: WritableDraft<PriceState>) => {
          state.error = "";
        },
      );
  },
});

export const { resetError, setPending } = priceSlice.actions;

export default priceSlice.reducer;

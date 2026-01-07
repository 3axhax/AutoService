import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { WritableDraft } from "immer";
import { OrderState } from "./types";
import { RootState } from "@shared/store";
import { ErrorActionType } from "@shared/types";

const initialState: OrderState = {
  pending: false,
  error: "",
  ordersValue: {},
};

export const orderSlice = createSlice({
  name: "order",
  initialState,
  reducers: {
    resetError: (state: WritableDraft<OrderState>) => {
      state.error = "";
    },
    setPending: (
      state: WritableDraft<OrderState>,
      action: PayloadAction<boolean>,
    ) => {
      state.pending = action.payload;
    },
    setOrdersValue: (
      state: WritableDraft<OrderState>,
      action: PayloadAction<{
        orderId: number;
        name: string;
        value: string | number | Record<string | number, number>;
      }>,
    ) => {
      if (!state.ordersValue[action.payload.orderId]) {
        state.ordersValue[action.payload.orderId] = {};
      }
      state.ordersValue[action.payload.orderId][action.payload.name] =
        action.payload.value;
    },
  },
  extraReducers: (builder) => {
    builder
      .addMatcher(
        (action) =>
          action.type.endsWith("/rejected") && action.type.startsWith("orders"),
        (state: WritableDraft<OrderState>, action: ErrorActionType) => {
          state.error = action.error.message ? action.error.message : "";
        },
      )
      .addMatcher(
        (action) =>
          action.type.endsWith("/pending") && action.type.startsWith("orders"),
        (state: WritableDraft<OrderState>) => {
          state.error = "";
        },
      );
  },
});

export const { resetError, setPending, setOrdersValue } = orderSlice.actions;

export default orderSlice.reducer;

export const orderErrorSelect = (state: RootState) => state.order.error;

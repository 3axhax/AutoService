import {
  createSelector,
  createSlice,
  type PayloadAction,
} from "@reduxjs/toolkit";
import type { WritableDraft } from "immer";
import { OrderState, OrderValue } from "./types";
import { RootState } from "@shared/store";
import { ErrorActionType } from "@shared/types";
import { addOrder } from "@entities/order";

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
        state.ordersValue[action.payload.orderId] = {
          id: action.payload.orderId,
        };
      }
      state.ordersValue[action.payload.orderId][action.payload.name] =
        action.payload.value;
    },
    addNewActiveOrder: (state: WritableDraft<OrderState>) => {
      const id =
        Object.values(state.ordersValue).length > 0
          ? Math.min(
              ...Object.keys(state.ordersValue).map((key) => parseInt(key)),
            ) - 1
          : -1;
      state.ordersValue[id] = {
        id,
        active: true,
      };
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(
        addOrder.fulfilled,
        (
          state: WritableDraft<OrderState>,
          action: PayloadAction<OrderValue & { internalId: number }>,
        ) => {
          state.pending = false;
          if (
            action.payload.internalId &&
            state.ordersValue[action.payload.internalId]
          ) {
            state.ordersValue[action.payload.internalId].active = false;
          }
        },
      )
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

export const { resetError, setPending, setOrdersValue, addNewActiveOrder } =
  orderSlice.actions;

export default orderSlice.reducer;

export const orderErrorSelect = (state: RootState) => state.order.error;

const ordersValuesSelect = (state: RootState) => state.order.ordersValue;

export const activeOrdersListSelect = createSelector(
  [ordersValuesSelect],
  (ordersValue) => {
    return Object.values(ordersValue).filter((order) => order.active);
  },
);

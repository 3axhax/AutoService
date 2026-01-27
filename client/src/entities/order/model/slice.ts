import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { WritableDraft } from "immer";
import { OrderItem, OrderState, OrderValue } from "./types";
import { ErrorActionType } from "@shared/types";
import {
  addOrder,
  getOrderByShiftId,
  getOrdersFromActiveShift,
} from "@entities/order";

const initialState: OrderState = {
  pending: false,
  error: "",
  ordersValue: {},
  ordersList: {},
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
      if (
        !state.ordersValue[action.payload.orderId] &&
        state.ordersList[action.payload.orderId]
      ) {
        state.ordersValue[action.payload.orderId] = {
          ...formatOrderValueFromOrderItemList(
            state.ordersList[action.payload.orderId],
          ),
          id: action.payload.orderId,
        };
      }
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
    deleteActiveOrder: (
      state: WritableDraft<OrderState>,
      action: PayloadAction<number>,
    ) => {
      if (state.ordersValue[action.payload]) {
        delete state.ordersValue[action.payload];
      }
    },
    clearOrdersList: (state: WritableDraft<OrderState>) => {
      state.ordersList = {};
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
      .addCase(
        getOrdersFromActiveShift.fulfilled,
        (
          state: WritableDraft<OrderState>,
          action: PayloadAction<OrderItem[]>,
        ) => {
          state.pending = false;
          if (action.payload) {
            state.ordersList = mapOrdersResponceList(action.payload);
          }
        },
      )
      .addCase(
        getOrderByShiftId.fulfilled,
        (
          state: WritableDraft<OrderState>,
          action: PayloadAction<OrderItem[]>,
        ) => {
          state.pending = false;
          if (action.payload) {
            state.ordersList = mapOrdersResponceList(action.payload);
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

export const {
  resetError,
  setPending,
  setOrdersValue,
  addNewActiveOrder,
  deleteActiveOrder,
  clearOrdersList,
} = orderSlice.actions;

export default orderSlice.reducer;

export const formatOrderValueFromOrderItemList = (listItem: OrderItem) => {
  const values = {} as OrderValue;
  listItem.optionValues.forEach((item) => {
    const parameter = item.parameter;
    if (parameter) {
      if (Object.prototype.hasOwnProperty.call(values, parameter.name)) {
        if (typeof values[parameter.name] === "string") {
          const valueId = values[parameter.name] as string;
          values[parameter.name] = { [valueId]: 1, [item.value]: item.count };
        } else if (typeof values[parameter.name] === "object") {
          const valueObject = values[parameter.name] as object;
          values[parameter.name] = { ...valueObject, [item.value]: item.count };
        }
      } else {
        if (item.count > 1 || parameter.type === "SELECT_LIST") {
          values[parameter.name] = { [item.value]: item.count };
        } else {
          values[parameter.name] = item.value;
        }
      }
    }
  });
  return values;
};

const mapOrdersResponceList = (orderList: OrderItem[]) => {
  return orderList.reduce((acc, order) => ({ ...acc, [order.id]: order }), {});
};

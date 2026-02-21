import type { WritableDraft } from "immer";
import { FilterItem, OrderState } from "./types";
import type { PayloadAction } from "@reduxjs/toolkit";
import { formatOrderValueFromOrderItemList } from "./slice.ts";

export const reducers = {
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
  setCurrentPage: (
    state: WritableDraft<OrderState>,
    action: PayloadAction<number>,
  ) => {
    state.ordersListPagination.currentPage =
      action.payload > 0 ? action.payload : 1;
  },
  addFilter: (
    state: WritableDraft<OrderState>,
    action: PayloadAction<FilterItem>,
  ) => {
    const filters = state.filters.filter(
      (filter) => filter.filterName !== action.payload.filterName,
    );
    state.filters = [...filters, action.payload];
  },
  removeFilter: (
    state: WritableDraft<OrderState>,
    action: PayloadAction<string>,
  ) => {
    state.filters = [
      ...state.filters.filter((filter) => filter.filterName !== action.payload),
    ];
  },
};

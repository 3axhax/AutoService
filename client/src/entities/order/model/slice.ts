import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { WritableDraft } from "immer";
import { OrderItem, OrderState, OrderValue } from "./types";
import { ErrorActionType } from "@shared/types";
import {
  addOrder,
  getOrderByShiftId,
  getOrdersFromActiveShift,
  getOrdersListForAdmin,
} from "@entities/order";
import { reducers } from "./reducers";

const initialState: OrderState = {
  pending: false,
  error: "",
  ordersValue: {},
  ordersList: {},
  ordersListPagination: {
    currentPage: 1,
    recordPerPage: 3,
    totalRecord: 0,
  },
  filters: [],
};

export const orderSlice = createSlice({
  name: "order",
  initialState,
  reducers: reducers,
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
            state.ordersList = mapOrdersResponseList(action.payload);
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
            state.ordersList = mapOrdersResponseList(action.payload);
          }
        },
      )
      .addCase(
        getOrdersListForAdmin.fulfilled,
        (
          state: WritableDraft<OrderState>,
          action: PayloadAction<{
            totalRecord: number;
            currentPage: number;
            rows: OrderItem[] | null;
          }>,
        ) => {
          state.pending = false;
          if (
            action.payload &&
            action.payload.currentPage ===
              state.ordersListPagination.currentPage
          ) {
            state.ordersListPagination.totalRecord = action.payload.totalRecord;
            state.ordersList = action.payload.rows
              ? mapOrdersResponseList(action.payload.rows)
              : {};
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
  setCurrentPage,
  addFilter,
  removeFilter,
} = orderSlice.actions;

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

const mapOrdersResponseList = (list: OrderItem[]) =>
  list.reduce((acc, order) => ({ ...acc, [order.id]: order }), {});

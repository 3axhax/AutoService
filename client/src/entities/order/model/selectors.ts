import { RootState } from "@shared/store";
import { createSelector } from "@reduxjs/toolkit";

export const orderErrorSelect = (state: RootState) => state.order.error;

const ordersValuesSelect = (state: RootState) => state.order.ordersValue;

export const activeOrdersListSelect = createSelector(
  [ordersValuesSelect],
  (ordersValue) => {
    return Object.values(ordersValue).filter((order) => order.active);
  },
);

const orderListSelect = (state: RootState) => state.order.ordersList;

export const workerActiveShiftClosedOrdersListSelect = createSelector(
  [orderListSelect],
  (orders) =>
    orders
      ? [...Object.values(orders)].sort((a, b) =>
          Date.parse(a.createdAt) > Date.parse(b.createdAt) ? -1 : 1,
        )
      : [],
);

export const workerActiveShiftClosedOrdersTotalValueSelect = createSelector(
  [workerActiveShiftClosedOrdersListSelect],
  (ordersList) =>
    ordersList.reduce((total, order) => total + order.totalValue, 0),
);

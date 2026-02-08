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

export const workerActiveShiftClosedOrdersTotalValueWithDiscountSelect =
  createSelector([workerActiveShiftClosedOrdersListSelect], (ordersList) =>
    ordersList.reduce(
      (total, order) => total + order.totalValueWithDiscount,
      0,
    ),
  );

export const ordersListByShiftIdSelect = createSelector(
  [orderListSelect, (_: RootState, shiftId: number) => shiftId],
  (ordersList, shiftId) =>
    ordersList
      ? [...Object.values(ordersList)]
          .filter((order) => order.shiftId === shiftId)
          .sort((a, b) =>
            Date.parse(a.createdAt) > Date.parse(b.createdAt) ? -1 : 1,
          )
      : [],
);

export const SelectOrdersPaginationCurrentPage = (state: RootState) =>
  state.order.ordersListPagination.currentPage;

export const SelectOrdersPaginationTotalPage = (state: RootState) =>
  Math.ceil(
    state.order.ordersListPagination.totalRecord /
      state.order.ordersListPagination.recordPerPage,
  );

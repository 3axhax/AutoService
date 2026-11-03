import { createAsyncThunk } from "@reduxjs/toolkit";
import { RootState } from "@shared/store";
import Request from "@shared/transport/RestAPI.ts";
import { HandlerAxiosError } from "@shared/transport/RequestHandlersError.ts";
import { setPending } from "./slice";
import { downloadExcel } from "@shared/utils";
import type { RequestLifecycle } from "@shared/transport/session";
import { FilterItem } from "@entities/order";

export const getOrdersFromActiveShift = createAsyncThunk(
  "orders/fromActiveShift",
  async (_, { getState }) => {
    const state = getState() as RootState;
    try {
      const response = await Request.forSession(state.user.token).get(
        "/orders/fromActiveShift",
      );
      return response.data;
    } catch (e) {
      HandlerAxiosError(e);
    }
  },
);

export const addOrder = createAsyncThunk(
  "orders/add",
  async (orderId: number, { getState, dispatch, requestId }) => {
    const state = getState() as RootState;
    if (
      !state.shifts.pending &&
      !state.order.pending &&
      state.order.ordersValue[orderId]
    ) {
      dispatch(setPending(true));
      try {
        const {
          id: _id,
          active: _active,
          ...usefulValues
        } = state.order.ordersValue[orderId];
        const response = await Request.forSession(state.user.token).post(
          "/orders/add",
          usefulValues,
        );
        return { internalId: orderId, ...response.data };
      } catch (e) {
        HandlerAxiosError(e);
      } finally {
        dispatch({ ...setPending(false), meta: { requestId } });
      }
    }
    throw new Error(
      "Дождитесь завершения текущей операции со сменой или записью.",
    );
  },
);

export const editOrder = createAsyncThunk(
  "orders/edit",
  async (orderId: number, { getState, dispatch, requestId }) => {
    const state = getState() as RootState;
    if (
      !state.shifts.pending &&
      !state.order.pending &&
      !state.order.loading &&
      !state.order.readError &&
      state.order.ordersValue[orderId]
    ) {
      dispatch(setPending(true));
      try {
        const { active: _active, ...usefulValues } =
          state.order.ordersValue[orderId];
        const response = await Request.forSession(state.user.token).post(
          "/orders/edit",
          usefulValues,
        );
        return response.data;
      } catch (e) {
        HandlerAxiosError(e);
      } finally {
        dispatch({ ...setPending(false), meta: { requestId } });
      }
    }
    throw new Error(
      "Дождитесь завершения текущей операции со сменой или записью.",
    );
  },
);

export const deleteOrder = createAsyncThunk(
  "orders/delete",
  async (orderId: number, { getState, dispatch, requestId }) => {
    const state = getState() as RootState;
    if (!state.shifts.pending && !state.order.pending) {
      dispatch(setPending(true));
      try {
        const response = await Request.forSession(state.user.token).post(
          "/orders/delete",
          { id: orderId },
        );
        return response.data;
      } catch (e) {
        HandlerAxiosError(e);
      } finally {
        dispatch({ ...setPending(false), meta: { requestId } });
      }
    }
    throw new Error(
      "Дождитесь завершения текущей операции со сменой или записью.",
    );
  },
);

export const getOrderByShiftId = createAsyncThunk(
  "orders/getByShiftId",
  async (shiftId: number, { getState }) => {
    const state = getState() as RootState;
    try {
      const response = await Request.forSession(state.user.token).get(
        "/orders/getByShiftId",
        { shiftId },
      );
      return response.data;
    } catch (e) {
      HandlerAxiosError(e);
    }
  },
);

export const getOrdersListForAdmin = createAsyncThunk(
  "orders/getForAdmin",
  async (_, { getState }) => {
    const state = getState() as RootState;
    try {
      const sendData: {
        currentPage: number;
        recordPerPage: number;
        filters: FilterItem[];
      } = {
        currentPage: state.order.ordersListPagination.currentPage,
        recordPerPage: state.order.ordersListPagination.recordPerPage,
        filters: state.order.filters,
      };
      const response = await Request.forSession(state.user.token).post(
        "/orders/getForAdmin",
        sendData,
      );
      return response.data;
    } catch (e) {
      HandlerAxiosError(e);
    }
  },
);

export const downloadOrdersList = createAsyncThunk(
  "orders/downloadList",
  async (_, { getState, dispatch, requestId, extra }) => {
    const state = getState() as RootState;
    if (!state.shifts.pending && !state.order.pending) {
      dispatch(setPending(true));
      try {
        const sendData: {
          closedAtStart?: string;
          closedAtEnd?: string;
          filters: FilterItem[];
        } = {
          filters: state.order.filters,
        };
        const response = await Request.forSession(state.user.token).post(
          "/orders/downloadList",
          sendData,
          "blob",
        );
        if (!(extra as RequestLifecycle).isRequestActive(requestId)) return;
        const fileName = `orders_list_${new Date().toLocaleDateString("ru-RU")}.xlsx`;
        downloadExcel(response.data, fileName);
        return { success: true };
      } catch (e) {
        HandlerAxiosError(e);
      } finally {
        dispatch({ ...setPending(false), meta: { requestId } });
      }
    }
  },
);

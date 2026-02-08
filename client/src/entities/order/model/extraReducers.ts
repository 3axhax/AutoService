import { createAsyncThunk } from "@reduxjs/toolkit";
import { RootState } from "@shared/store";
import Request from "@shared/transport/RestAPI.ts";
import { HandlerAxiosError } from "@shared/transport/RequestHandlersError.ts";
import { setPending } from "./slice";

export const getOrdersFromActiveShift = createAsyncThunk(
  "orders/fromActiveShift",
  async (_, { getState, dispatch }) => {
    const state = getState() as RootState;
    if (!state.order.pending) {
      dispatch(setPending(true));
      try {
        const response = await Request.get("/orders/fromActiveShift");
        return response.data;
      } catch (e) {
        HandlerAxiosError(e);
      } finally {
        dispatch(setPending(false));
      }
    }
  },
);

export const addOrder = createAsyncThunk(
  "orders/add",
  async (orderId: number, { getState, dispatch }) => {
    const state = getState() as RootState;
    if (!state.order.pending && state.order.ordersValue[orderId]) {
      dispatch(setPending(true));
      try {
        const {
          id: _id,
          active: _active,
          ...usefulValues
        } = state.order.ordersValue[orderId];
        const response = await Request.post("/orders/add", usefulValues);
        return { internalId: orderId, ...response.data };
      } catch (e) {
        HandlerAxiosError(e);
      } finally {
        dispatch(setPending(false));
      }
    }
  },
);

export const editOrder = createAsyncThunk(
  "orders/edit",
  async (orderId: number, { getState, dispatch }) => {
    const state = getState() as RootState;
    if (!state.order.pending && state.order.ordersValue[orderId]) {
      dispatch(setPending(true));
      try {
        const { active: _active, ...usefulValues } =
          state.order.ordersValue[orderId];
        const response = await Request.post("/orders/edit", usefulValues);
        return response.data;
      } catch (e) {
        HandlerAxiosError(e);
      } finally {
        dispatch(setPending(false));
      }
    }
  },
);

export const deleteOrder = createAsyncThunk(
  "orders/delete",
  async (orderId: number, { getState, dispatch }) => {
    const state = getState() as RootState;
    if (!state.order.pending) {
      dispatch(setPending(true));
      try {
        const response = await Request.post("/orders/delete", { id: orderId });
        return response.data;
      } catch (e) {
        HandlerAxiosError(e);
      } finally {
        dispatch(setPending(false));
      }
    }
  },
);

export const getOrderByShiftId = createAsyncThunk(
  "orders/getByShiftId",
  async (shiftId: number, { getState, dispatch }) => {
    const state = getState() as RootState;
    if (!state.order.pending) {
      dispatch(setPending(true));
      try {
        const response = await Request.get("/orders/getByShiftId", { shiftId });
        return response.data;
      } catch (e) {
        HandlerAxiosError(e);
      } finally {
        dispatch(setPending(false));
      }
    }
  },
);

export const getOrdersListForAdmin = createAsyncThunk(
  "orders/getForAdmin",
  async (_, { getState, dispatch }) => {
    const state = getState() as RootState;
    if (!state.order.pending) {
      dispatch(setPending(true));
      try {
        const sendData: {
          currentPage: number;
          recordPerPage: number;
          closedAtStart?: string;
          closedAtEnd?: string;
        } = {
          currentPage: state.order.ordersListPagination.currentPage,
          recordPerPage: state.order.ordersListPagination.recordPerPage,
        };
        const response = await Request.get("/orders/getForAdmin", sendData);
        return response.data;
      } catch (e) {
        HandlerAxiosError(e);
      } finally {
        dispatch(setPending(false));
      }
    }
  },
);

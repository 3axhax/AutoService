import { createAsyncThunk } from "@reduxjs/toolkit";
import { RootState } from "@shared/store";
import Request from "@shared/transport/RestAPI.ts";
import { HandlerAxiosError } from "@shared/transport/RequestHandlersError.ts";
import { setPending } from "./slice";

export const getActiveShift = createAsyncThunk(
  "shifts/getActive",
  async (_, { getState }) => {
    const state = getState() as RootState;
    try {
      const response = await Request.forSession(state.user.token).get(
        "/shifts/getActive",
      );
      return response.data;
    } catch (e) {
      HandlerAxiosError(e);
    }
  },
);

export const createActiveShift = createAsyncThunk(
  "shifts/createActive",
  async (_, { getState, dispatch, requestId }) => {
    const state = getState() as RootState;
    if (
      !state.shifts.pending &&
      !state.order.pending &&
      !state.additionalWorks.pending
    ) {
      dispatch(setPending(true));
      try {
        const response = await Request.forSession(state.user.token).get(
          "/shifts/createActive",
        );
        return response.data;
      } catch (e) {
        HandlerAxiosError(e);
      } finally {
        dispatch({ ...setPending(false), meta: { requestId } });
      }
    }
    throw new Error(
      "Дождитесь завершения сохранения заказов и дополнительных работ.",
    );
  },
);

export const closeActiveShift = createAsyncThunk(
  "shifts/closeActive",
  async (_, { getState, dispatch, requestId }) => {
    const state = getState() as RootState;
    if (
      !state.shifts.pending &&
      !state.order.pending &&
      !state.additionalWorks.pending
    ) {
      dispatch(setPending(true));
      try {
        const response = await Request.forSession(state.user.token).get(
          "/shifts/closeAllActive",
        );
        return response.data;
      } catch (e) {
        HandlerAxiosError(e);
      } finally {
        dispatch({ ...setPending(false), meta: { requestId } });
      }
    }
    throw new Error(
      "Дождитесь завершения сохранения заказов и дополнительных работ.",
    );
  },
);

export const getShiftsList = createAsyncThunk(
  "shifts/getList",
  async (_, { getState }) => {
    const state = getState() as RootState;
    try {
      const sendData: {
        currentPage: number;
        recordPerPage: number;
        closedAtStart?: string;
        closedAtEnd?: string;
      } = {
        currentPage: state.shifts.pagination.currentPage,
        recordPerPage: state.shifts.pagination.recordPerPage,
      };
      if (state.shifts.filters.closedAtStart) {
        sendData.closedAtStart = state.shifts.filters.closedAtStart;
      }
      if (state.shifts.filters.closedAtEnd) {
        sendData.closedAtEnd = state.shifts.filters.closedAtEnd;
      }
      const response = await Request.forSession(state.user.token).get(
        "/shifts/getList",
        sendData,
      );
      return response.data;
    } catch (e) {
      HandlerAxiosError(e);
    }
  },
);

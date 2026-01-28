import { createAsyncThunk } from "@reduxjs/toolkit";
import { RootState } from "@shared/store";
import Request from "@shared/transport/RestAPI.ts";
import { HandlerAxiosError } from "@shared/transport/RequestHandlersError.ts";
import { clearShiftsList, setPending } from "./slice";

export const getActiveShift = createAsyncThunk(
  "shifts/getActive",
  async (_, { getState, dispatch }) => {
    const state = getState() as RootState;
    if (!state.shifts.pending) {
      dispatch(setPending(true));
      try {
        const response = await Request.get("/shifts/getActive");
        return response.data;
      } catch (e) {
        HandlerAxiosError(e);
      } finally {
        dispatch(setPending(false));
      }
    }
  },
);

export const createActiveShift = createAsyncThunk(
  "shifts/createActive",
  async (_, { getState, dispatch }) => {
    const state = getState() as RootState;
    if (!state.shifts.pending) {
      dispatch(setPending(true));
      try {
        const response = await Request.get("/shifts/createActive");
        return response.data;
      } catch (e) {
        HandlerAxiosError(e);
      } finally {
        dispatch(setPending(false));
      }
    }
  },
);

export const closeActiveShift = createAsyncThunk(
  "shifts/closeActive",
  async (_, { getState, dispatch }) => {
    const state = getState() as RootState;
    if (!state.shifts.pending) {
      dispatch(setPending(true));
      try {
        const response = await Request.get("/shifts/closeAllActive");
        return response.data;
      } catch (e) {
        HandlerAxiosError(e);
      } finally {
        dispatch(setPending(false));
      }
    }
  },
);

export const getShiftsList = createAsyncThunk(
  "shifts/getList",
  async (_, { getState, dispatch }) => {
    const state = getState() as RootState;
    if (!state.shifts.pending) {
      dispatch(setPending(true));
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
        const response = await Request.get("/shifts/getList", sendData);
        dispatch(clearShiftsList());
        return response.data;
      } catch (e) {
        HandlerAxiosError(e);
      } finally {
        dispatch(setPending(false));
      }
    }
  },
);

import { createAsyncThunk } from "@reduxjs/toolkit";
import { RootState } from "@shared/store";
import Request from "@shared/transport/RestAPI.ts";
import { HandlerAxiosError } from "@shared/transport/RequestHandlersError.ts";
import { setPending } from "./slice";

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
        const response = await Request.get("/shifts/getList");
        return response.data;
      } catch (e) {
        HandlerAxiosError(e);
      } finally {
        dispatch(setPending(false));
      }
    }
  },
);

import { createAsyncThunk } from "@reduxjs/toolkit";
import { RootState } from "@shared/store";
import Request from "@shared/transport/RestAPI.ts";
import { HandlerAxiosError } from "@shared/transport/RequestHandlersError.ts";
import { setPending } from "./slice";

export const getAdditionalWorksFromActiveShift = createAsyncThunk(
  "additionalWorks/fromActiveShift",
  async (_, { getState, dispatch }) => {
    const state = getState() as RootState;
    if (!state.additionalWorks.pending) {
      dispatch(setPending(true));
      try {
        const response = await Request.get("/additionalWorks/fromActiveShift");
        return response.data;
      } catch (e) {
        HandlerAxiosError(e);
      } finally {
        dispatch(setPending(false));
      }
    }
  },
);

export const addAdditionalWork = createAsyncThunk(
  "additionalWorks/add",
  async (additionalWorkId: number, { getState, dispatch }) => {
    const state = getState() as RootState;
    if (
      !state.additionalWorks.pending &&
      state.additionalWorks.additionalWorksValue[additionalWorkId]
    ) {
      dispatch(setPending(true));
      try {
        const {
          id: _id,
          active: _active,
          ...usefulValues
        } = state.additionalWorks.additionalWorksValue[additionalWorkId];
        const response = await Request.post(
          "/additionalWorks/add",
          usefulValues,
        );
        return { internalId: additionalWorkId, ...response.data };
      } catch (e) {
        HandlerAxiosError(e);
      } finally {
        dispatch(setPending(false));
      }
    }
  },
);

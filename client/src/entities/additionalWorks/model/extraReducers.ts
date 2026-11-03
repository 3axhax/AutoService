import { createAsyncThunk } from "@reduxjs/toolkit";
import { RootState } from "@shared/store";
import Request from "@shared/transport/RestAPI.ts";
import { HandlerAxiosError } from "@shared/transport/RequestHandlersError.ts";
import { setPending } from "./slice";

export const getAdditionalWorksFromActiveShift = createAsyncThunk(
  "additionalWorks/fromActiveShift",
  async (_, { getState }) => {
    const state = getState() as RootState;
    try {
      const response = await Request.forSession(state.user.token).get(
        "/additionalWorks/fromActiveShift",
      );
      return response.data;
    } catch (e) {
      HandlerAxiosError(e);
    }
  },
);

export const addAdditionalWork = createAsyncThunk(
  "additionalWorks/add",
  async (additionalWorkId: number, { getState, dispatch, requestId }) => {
    const state = getState() as RootState;
    if (
      !state.shifts.pending &&
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
        const response = await Request.forSession(state.user.token).post(
          "/additionalWorks/add",
          usefulValues,
        );
        return { internalId: additionalWorkId, ...response.data };
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

export const editAdditionalWork = createAsyncThunk(
  "additionalWorks/edit",
  async (additionalWorkId: number, { getState, dispatch, requestId }) => {
    const state = getState() as RootState;
    if (
      !state.shifts.pending &&
      !state.additionalWorks.pending &&
      !state.additionalWorks.loading &&
      !state.additionalWorks.readError &&
      state.additionalWorks.additionalWorksValue[additionalWorkId]
    ) {
      dispatch(setPending(true));
      try {
        const { active: _active, ...usefulValues } =
          state.additionalWorks.additionalWorksValue[additionalWorkId];
        const response = await Request.forSession(state.user.token).post(
          "/additionalWorks/edit",
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

export const deleteAdditionalWork = createAsyncThunk(
  "additionalWorks/delete",
  async (additionalWorkId: number, { getState, dispatch, requestId }) => {
    const state = getState() as RootState;
    if (!state.shifts.pending && !state.additionalWorks.pending) {
      dispatch(setPending(true));
      try {
        const response = await Request.forSession(state.user.token).post(
          "/additionalWorks/delete",
          {
            id: additionalWorkId,
          },
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

export const getAdditionalWorksByShiftId = createAsyncThunk(
  "additionalWorks/getByShiftId",
  async (shiftId: number, { getState }) => {
    const state = getState() as RootState;
    try {
      const response = await Request.forSession(state.user.token).get(
        "/additionalWorks/getByShiftId",
        {
          shiftId,
        },
      );
      return response.data;
    } catch (e) {
      HandlerAxiosError(e);
    }
  },
);

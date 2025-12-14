import {
  createAsyncThunk,
  createSlice,
  type PayloadAction,
} from "@reduxjs/toolkit";
import Request from "@shared/transport/RestAPI.ts";
import { HandlerAxiosError } from "@shared/transport/RequestHandlersError.ts";
import type { WritableDraft } from "immer";
import { RootState } from "@shared/store";
import { ErrorActionType } from "@shared/types";

export const getOrderParametersList = createAsyncThunk(
  "orderParameters/getList",
  async (_, { getState, dispatch }) => {
    const state = getState() as RootState;
    if (!state.orderParameters.pending) {
      dispatch(setPending(true));
      try {
        const response = await Request.get("/orderParameters");
        return response.data;
      } catch (e) {
        HandlerAxiosError(e);
      } finally {
        dispatch(setPending(false));
      }
    }
  },
);

interface OrderParametersState {
  pending: boolean;
  error: string;
}

const initialState: OrderParametersState = {
  pending: false,
  error: "",
};

export const orderParametersSlice = createSlice({
  name: "orderParameters",
  initialState,
  reducers: {
    resetError: (state: WritableDraft<OrderParametersState>) => {
      state.error = "";
    },
    setPending: (
      state: WritableDraft<OrderParametersState>,
      action: PayloadAction<boolean>,
    ) => {
      state.pending = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(
        getOrderParametersList.fulfilled,
        (
          state: WritableDraft<OrderParametersState>,
          action: PayloadAction<any>,
        ) => {
          console.log(action.payload);
          state.pending = false;
        },
      )
      .addMatcher(
        (action) =>
          action.type.endsWith("/rejected") &&
          action.type.startsWith("orderParameters"),
        (
          state: WritableDraft<OrderParametersState>,
          action: ErrorActionType,
        ) => {
          state.error = action.error.message ? action.error.message : "";
        },
      )
      .addMatcher(
        (action) =>
          action.type.endsWith("/pending") &&
          action.type.startsWith("orderParameters"),
        (state: WritableDraft<OrderParametersState>) => {
          state.error = "";
        },
      );
  },
});

export const { resetError, setPending } = orderParametersSlice.actions;

export const selectPendingOrderParameters = (state: RootState) =>
  state.orderParameters.pending;
export const selectErrorOrderParameters = (state: RootState) =>
  state.orderParameters.error;

export default orderParametersSlice.reducer;

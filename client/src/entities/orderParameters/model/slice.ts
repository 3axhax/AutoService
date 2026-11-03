import type { RootState } from "@shared/store";
import {
  createAsyncThunk,
  createSlice,
  type PayloadAction,
} from "@reduxjs/toolkit";
import Request from "@shared/transport/RestAPI.ts";
import { HandlerAxiosError } from "@shared/transport/RequestHandlersError.ts";
import type { WritableDraft } from "immer";
import { ErrorActionType } from "@shared/types";
import { OrderParametersResponse, OrderParametersState } from "./types.ts";
import { parseJSONSafely } from "@shared/utils";

export const getOrderParametersList = createAsyncThunk(
  "orderParameters/getList",
  async (_, { getState }) => {
    const state = getState() as RootState;
    try {
      const response = await Request.forSession(state.user.token).get(
        "/orderParameters",
      );
      return response.data;
    } catch (e) {
      HandlerAxiosError(e);
    }
  },
);

const initialState: OrderParametersState = {
  pending: false,
  error: "",
  parametersList: [],
  parameterOptionDependence: {},
  optionOptionDependence: {},
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
          action: PayloadAction<OrderParametersResponse>,
        ) => {
          state.pending = false;
          if (action.payload) {
            state.parametersList = action.payload.parameters;
            const parameterOptionDependence = parseJSONSafely(
              action.payload.options.parameterOptionDependence,
            );
            if (parameterOptionDependence) {
              state.parameterOptionDependence = parameterOptionDependence;
            }
            const optionOptionDependence = parseJSONSafely(
              action.payload.options.optionOptionDependence,
            );
            if (optionOptionDependence) {
              state.optionOptionDependence = optionOptionDependence;
            }
          }
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

export default orderParametersSlice.reducer;

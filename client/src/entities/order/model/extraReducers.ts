import { createAsyncThunk } from "@reduxjs/toolkit";
import { RootState } from "@shared/store";
import Request from "@shared/transport/RestAPI.ts";
import { HandlerAxiosError } from "@shared/transport/RequestHandlersError.ts";
import { setPending } from "./slice";

export const addOrder = createAsyncThunk(
  "order/add",
  async (orderId: number, { getState, dispatch }) => {
    const state = getState() as RootState;
    if (!state.order.pending && state.order.ordersValue[orderId]) {
      dispatch(setPending(true));
      try {
        const response = await Request.post(
          "/order/add",
          state.order.ordersValue[orderId],
        );
        return response.data;
      } catch (e) {
        HandlerAxiosError(e);
      } finally {
        dispatch(setPending(false));
      }
    }
  },
);

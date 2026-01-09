import { createAsyncThunk } from "@reduxjs/toolkit";
import { RootState } from "@shared/store";
import Request from "@shared/transport/RestAPI.ts";
import { HandlerAxiosError } from "@shared/transport/RequestHandlersError.ts";
import { setPending } from "./slice";

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
        console.log(response.data);
        return { internalId: orderId, ...response.data };
      } catch (e) {
        HandlerAxiosError(e);
      } finally {
        dispatch(setPending(false));
      }
    }
  },
);

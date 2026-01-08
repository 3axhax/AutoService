import { configureStore } from "@reduxjs/toolkit";
import { userSlice } from "@entities/user";
import { orderParametersSlice } from "@entities/orderParameters";
import { orderSlice } from "@entities/order";
import { priceSlice } from "@entities/price";
import { shiftsSlice } from "@entities/shifts";

export const store = configureStore({
  reducer: {
    user: userSlice.reducer,
    orderParameters: orderParametersSlice.reducer,
    order: orderSlice.reducer,
    price: priceSlice.reducer,
    shifts: shiftsSlice.reducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

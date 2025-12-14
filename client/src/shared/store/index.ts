import { configureStore } from "@reduxjs/toolkit";
import { userSlice } from "@entities/user";
import { orderParametersSlice } from "@entities/orderParameters";

export const store = configureStore({
  reducer: {
    user: userSlice.reducer,
    orderParameters: orderParametersSlice.reducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

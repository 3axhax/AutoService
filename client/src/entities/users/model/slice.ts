import {
  createAsyncThunk,
  createSlice,
  type PayloadAction,
} from "@reduxjs/toolkit";
import Request from "@shared/transport/RestAPI.ts";
import { HandlerAxiosError } from "@shared/transport/RequestHandlersError.ts";
import type { WritableDraft } from "immer";
import { User, UsersSlice } from "./types";
import { RootState } from "@shared/store";

export const getUsersList = createAsyncThunk(
  "users/getList",
  async (_, { getState, dispatch }) => {
    const state = getState() as RootState;
    if (!state.users.pending) {
      dispatch(setPending(true));
      try {
        const response = await Request.get("/users");
        return response.data;
      } catch (e) {
        HandlerAxiosError(e);
      } finally {
        setPending(false);
      }
    }
  },
);

const initialState: UsersSlice = {
  pending: false,
  error: "",
  users: [],
};

export const usersSlice = createSlice({
  name: "users",
  initialState,
  reducers: {
    resetError: (state: WritableDraft<UsersSlice>) => {
      state.error = "";
    },
    setPending: (
      state: WritableDraft<UsersSlice>,
      action: PayloadAction<boolean>,
    ) => {
      state.pending = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(
        getUsersList.fulfilled,
        (state: WritableDraft<UsersSlice>, action: PayloadAction<User[]>) => {
          state.users = action.payload;
        },
      )
      .addCase(
        getUsersList.rejected,
        (state: WritableDraft<UsersSlice>, action) => {
          state.error = action.error.message ? action.error.message : "";
        },
      )
      .addCase(getUsersList.pending, (state: WritableDraft<UsersSlice>) => {
        state.error = "";
      });
  },
});

export const { resetError, setPending } = usersSlice.actions;

export default usersSlice.reducer;

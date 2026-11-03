import type { RootState } from "@shared/store";
import {
  createAsyncThunk,
  createSlice,
  type PayloadAction,
} from "@reduxjs/toolkit";
import Request from "@shared/transport/RestAPI.ts";
import { HandlerAxiosError } from "@shared/transport/RequestHandlersError.ts";
import type { WritableDraft } from "immer";
import { User, UsersSlice } from "./types";

export const getUsersList = createAsyncThunk(
  "users/getList",
  async (_, { getState }) => {
    const state = getState() as RootState;
    try {
      const response = await Request.forSession(state.user.token).get("/users");
      return response.data;
    } catch (e) {
      HandlerAxiosError(e);
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
          state.pending = false;
          if (action.payload) state.users = action.payload;
        },
      )
      .addCase(
        getUsersList.rejected,
        (state: WritableDraft<UsersSlice>, action) => {
          state.pending = false;
          state.error = action.error.message ? action.error.message : "";
        },
      )
      .addCase(getUsersList.pending, (state: WritableDraft<UsersSlice>) => {
        state.pending = true;
        state.error = "";
      });
  },
});

export const { resetError, setPending } = usersSlice.actions;

export default usersSlice.reducer;

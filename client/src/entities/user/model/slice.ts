import {
  createAsyncThunk,
  createSlice,
  type PayloadAction,
} from "@reduxjs/toolkit";
import {
  type UserAuthorizationType,
  type userSliceInitialType,
  type userType,
} from "./types.ts";
import Request from "@shared/transport/RestAPI.ts";
import { HandlerAxiosError } from "@shared/transport/RequestHandlersError.ts";
import type { WritableDraft } from "immer";
import { saveUser } from "./helpers.ts";
import { USER_LS_KEY } from "./constants.ts";
import { RootState } from "@shared/store";

export const loginUser = createAsyncThunk(
  "user/login",
  async (userData: UserAuthorizationType) => {
    try {
      const response = await Request.post("/auth/login", userData);
      return response.data;
    } catch (e) {
      HandlerAxiosError(e);
    }
  },
);

const initialState: userSliceInitialType = {
  id: 0,
  name: "",
  token: "",
  pending: false,
  error: "",
  roles: [],
};

export const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    resetError: (state: WritableDraft<userSliceInitialType>) => {
      state.error = "";
    },
    logoutUser: (state: WritableDraft<userSliceInitialType>) => {
      state.name = "";
      state.token = "";
      state.roles = [];
      state.id = 0;
      localStorage.removeItem(USER_LS_KEY);
    },
    checkLSUser: (state: WritableDraft<userSliceInitialType>) => {
      const ls = localStorage.getItem(USER_LS_KEY);
      if (ls) {
        const user = JSON.parse(ls);
        if (user) {
          state.name = user.name;
          state.roles = user.roles;
          state.token = user.token;
          state.id = user.id;
        }
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(
        loginUser.fulfilled,
        (
          state: WritableDraft<userSliceInitialType>,
          action: PayloadAction<userType>,
        ) => {
          if (action.payload.token) {
            saveUser(state, action.payload);
          }
          state.pending = false;
        },
      )
      .addCase(
        loginUser.rejected,
        (state: WritableDraft<userSliceInitialType>, action) => {
          state.pending = false;
          state.error = action.error.message ? action.error.message : "";
        },
      )
      .addCase(
        loginUser.pending,
        (state: WritableDraft<userSliceInitialType>) => {
          state.pending = true;
          state.error = "";
        },
      );
  },
});

export const { resetError, checkLSUser, logoutUser } = userSlice.actions;

export const selectPendingUser = (state: RootState) => state.user.pending;
export const selectErrorUser = (state: RootState) => state.user.error;
export const selectUserName = (state: RootState) => state.user.name;
export const selectIsUserAuthorized = (state: RootState) =>
  !!(state.user.token && state.user.name);

export const selectIsUserAdmin = (state: RootState) =>
  state.user.roles.includes("ADMIN");

export const selectIsUserManager = (state: RootState) =>
  state.user.roles.includes("MANAGER");

export const selectIsUserWorker = (state: RootState) =>
  state.user.roles.includes("WORKER");

export default userSlice.reducer;

import {
  createAsyncThunk,
  createSlice,
  type PayloadAction,
} from "@reduxjs/toolkit";
import {
  UserAuthorizationType,
  UserRegistrationType,
  userSliceInitialType,
  userType,
} from "./types.ts";
import Request from "@shared/transport/RestAPI.ts";
import { HandlerAxiosError } from "@shared/transport/RequestHandlersError.ts";
import type { WritableDraft } from "immer";
import { saveUser } from "./helpers.ts";
import { USER_LS_KEY } from "./constants.ts";
import { RootState } from "@shared/store";
import { ErrorActionType } from "@shared/types";

export const loginUser = createAsyncThunk(
  "user/login",
  async (userData: UserAuthorizationType, { getState, dispatch }) => {
    const state = getState() as RootState;
    if (!state.shifts.pending) {
      dispatch(setPending(true));
      try {
        const response = await Request.post("/auth/login", userData);
        return response.data;
      } catch (e) {
        HandlerAxiosError(e);
      } finally {
        dispatch(setPending(false));
      }
    }
  },
);

export const registerUser = createAsyncThunk(
  "user/register",
  async (userData: UserRegistrationType, { getState, dispatch }) => {
    const state = getState() as RootState;
    if (!state.shifts.pending) {
      dispatch(setPending(true));
      try {
        const response = await Request.post("/auth/register", userData);
        return response.data;
      } catch (e) {
        HandlerAxiosError(e);
      } finally {
        dispatch(setPending(false));
      }
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
    setPending: (
      state: WritableDraft<userSliceInitialType>,
      action: PayloadAction<boolean>,
    ) => {
      state.pending = action.payload;
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
        },
      )
      .addCase(
        registerUser.fulfilled,
        (
          state: WritableDraft<userSliceInitialType>,
          action: PayloadAction<userType>,
        ) => {
          if (action.payload.token) {
            saveUser(state, action.payload);
          }
        },
      )
      .addMatcher(
        (action) =>
          action.type.endsWith("/rejected") && action.type.startsWith("user"),
        (
          state: WritableDraft<userSliceInitialType>,
          action: ErrorActionType,
        ) => {
          state.error = action.error.message ? action.error.message : "";
        },
      )
      .addMatcher(
        (action) =>
          action.type.endsWith("/pending") && action.type.startsWith("user"),
        (state: WritableDraft<userSliceInitialType>) => {
          state.error = "";
        },
      );
  },
});

export const { resetError, checkLSUser, logoutUser, setPending } =
  userSlice.actions;

export const selectPendingUser = (state: RootState) => state.user.pending;
export const selectErrorUser = (state: RootState) => state.user.error;
export const selectUserName = (state: RootState) => state.user.name;
export const selectIsUserAuthorized = (state: RootState) =>
  !!(state.user.token && state.user.name);

export const selectUserRoles = (state: RootState) => state.user.roles;

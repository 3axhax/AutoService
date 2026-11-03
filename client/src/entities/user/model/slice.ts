import { isAxiosError } from "axios";
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
import { matchesStoredSession, getStoredUser } from "@shared/transport/session";
import { saveUser } from "./helpers.ts";
import { USER_LS_KEY } from "./constants.ts";
import { RootState } from "@shared/store";
import { ErrorActionType } from "@shared/types";

// A condition rejection is not dispatched: it must not alter the running request.
const authRequestOptions = {
  condition: (_: unknown, { getState }: { getState: () => unknown }) => {
    const state = getState() as RootState;
    return (
      !state.user.pending && !state.user.logoutPending && !state.shifts.pending
    );
  },
};

export const loginUser = createAsyncThunk(
  "user/login",
  async (
    userData: UserAuthorizationType,
    { getState, dispatch, requestId },
  ) => {
    const state = getState() as RootState;
    dispatch(setPending(true));
    try {
      const response = await Request.forSession(state.user.token).post(
        "/auth/login",
        userData,
      );
      return response.data;
    } catch (e) {
      HandlerAxiosError(e);
    } finally {
      dispatch({ ...setPending(false), meta: { requestId } });
    }
  },
  authRequestOptions,
);

export const registerUser = createAsyncThunk(
  "user/register",
  async (userData: UserRegistrationType, { getState, dispatch, requestId }) => {
    const state = getState() as RootState;
    dispatch(setPending(true));
    try {
      const response = await Request.forSession(state.user.token).post(
        "/auth/register",
        userData,
      );
      return response.data;
    } catch (e) {
      HandlerAxiosError(e);
    } finally {
      dispatch({ ...setPending(false), meta: { requestId } });
    }
  },
  authRequestOptions,
);

export const logoutCurrentSession = createAsyncThunk(
  "user/logoutSession",
  async (_, { getState, dispatch }) => {
    const state = getState() as RootState;
    const token = state.user.token;
    if (!token) {
      if (state.user.pending) dispatch(logoutUser());
      return { revoked: true };
    }
    dispatch(userSlice.actions.setLogoutPending(true));
    let revoked = true;
    try {
      await Request.forSession(token)
        .withTimeout(10000)
        .post("/auth/logout", {});
    } catch (error) {
      revoked = isAxiosError(error) && error.response?.status === 401;
    }
    if (
      (getState() as RootState).user.token === token &&
      matchesStoredSession(token)
    ) {
      dispatch(logoutUser());
      if (!revoked)
        dispatch(
          userSlice.actions.setLogoutWarning(
            "Локальный выход выполнен, но сервер не подтвердил отзыв сессии. Сохранённый токен может оставаться действующим.",
          ),
        );
    }
    return { revoked };
  },
  {
    condition: (_, { getState }) =>
      !(getState() as RootState).user.logoutPending,
  },
);

const initialState: userSliceInitialType = {
  id: 0,
  name: "",
  token: "",
  pending: false,
  logoutPending: false,
  logoutWarning: "",
  authRedirectPending: false,
  error: "",
  roles: [],
};

export const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setLogoutPending: (state, action: PayloadAction<boolean>) => {
      state.logoutPending = action.payload;
    },
    setLogoutWarning: (state, action: PayloadAction<string>) => {
      state.logoutWarning = action.payload;
    },
    authRedirected: (state) => {
      state.authRedirectPending = false;
    },
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
      const user = getStoredUser();
      if (user) {
        state.name = user.name;
        state.roles = user.roles;
        state.token = user.token;
        state.id = user.id;
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
            state.authRedirectPending = true;
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
            state.authRedirectPending = true;
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

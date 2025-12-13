import { USER_LS_KEY } from "./constants.ts";
import type { userSliceInitialType, userType } from "./types.ts";

export const updateUserLocalStorage = (
  key: string,
  value: string | number | string[],
) => {
  const ls = localStorage.getItem(USER_LS_KEY);
  const user = ls ? JSON.parse(ls) : {};
  user[key] = value;
  localStorage.setItem(USER_LS_KEY, JSON.stringify(user));
};

export const saveUser = (state: userSliceInitialType, user: userType) => {
  state.token = user.token;
  updateUserLocalStorage("token", state.token);
  state.name = user.name;
  updateUserLocalStorage("name", state.name);
  state.id = user.id;
  updateUserLocalStorage("id", state.id);
  state.roles = user.roles;
  updateUserLocalStorage("roles", state.roles);
};

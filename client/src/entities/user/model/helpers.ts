import { USER_LS_KEY } from "./constants.ts";
import type { userSliceInitialType, userType } from "./types.ts";

export const saveUser = (state: userSliceInitialType, user: userType) => {
  state.token = user.token;
  state.name = user.name;
  state.id = user.id;
  state.roles = user.roles;
  // One storage event must contain a complete, consistent user snapshot.
  localStorage.setItem(
    USER_LS_KEY,
    JSON.stringify({
      id: user.id,
      name: user.name,
      token: user.token,
      roles: user.roles,
    }),
  );
};

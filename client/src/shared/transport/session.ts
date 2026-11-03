import { USER_LS_KEY } from "@entities/user/model/constants";
import type { userType } from "@entities/user/model/types";

export function getStoredUser(): userType | null {
  try {
    const value = JSON.parse(localStorage.getItem(USER_LS_KEY) ?? "null");
    if (
      value &&
      typeof value.token === "string" &&
      typeof value.name === "string" &&
      typeof value.id === "number" &&
      Array.isArray(value.roles) &&
      value.roles.every((role: unknown) => typeof role === "string")
    )
      return value;
  } catch {
    /* A malformed saved session is treated as signed out. */
  }
  return null;
}

export const matchesStoredSession = (token: string) =>
  token === (getStoredUser()?.token ?? "");

export interface RequestLifecycle {
  isRequestActive: (requestId: string) => boolean;
}

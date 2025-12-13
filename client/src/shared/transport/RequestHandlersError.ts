import { AxiosError } from "axios";

type errorType = string | AxiosError | Error | unknown;
export const HandlerAxiosError = (e: errorType) => {
  if (typeof e === "string") {
    throw new Error(e.toUpperCase());
  } else if (e instanceof AxiosError) {
    throw new Error(e?.response?.data.message || `Error in request`);
  } else if (e instanceof Error) {
    throw new Error(`Error in request`);
  }
};

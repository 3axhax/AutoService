import { Action } from "@reduxjs/toolkit";
export interface ErrorActionType extends Action {
  error: { message: string };
}

import { createAction } from "@reduxjs/toolkit";

export type ListResource = "orders" | "additionalWorks";
export interface ListView {
  resource: ListResource;
  kind: "active" | "admin" | "shift";
  shiftId?: number;
  owner: string;
}
export const listViewOpened = createAction<ListView>("listView/opened");
export const listViewClosed = createAction<{
  resource: ListResource;
  owner: string;
}>("listView/closed");

export const retryListRead = createAction<ListResource>("listView/retry");

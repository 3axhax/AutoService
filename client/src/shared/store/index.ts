import {
  combineReducers,
  configureStore,
  type Middleware,
  type ThunkDispatch,
  type UnknownAction,
} from "@reduxjs/toolkit";
import { userSlice, loginUser, registerUser } from "@entities/user";
import { orderParametersSlice } from "@entities/orderParameters";
import {
  orderSlice,
  setCurrentPage,
  setOrdersValue,
  beginEditOrder,
  getOrdersFromActiveShift,
  getOrdersListForAdmin,
  getOrderByShiftId,
} from "@entities/order";
import { priceSlice } from "@entities/price";
import {
  shiftsSlice,
  closeActiveShift,
  getActiveShift,
  createActiveShift,
} from "@entities/shifts";
import {
  additionalWorksSlice,
  getAdditionalWorksFromActiveShift,
  getAdditionalWorksByShiftId,
} from "@entities/additionalWorks";
import { appSlice } from "@entities/app";
import { usersSlice } from "@entities/users";
import {
  matchesStoredSession,
  type RequestLifecycle,
} from "@shared/transport/session";
import {
  retryListRead,
  listViewOpened,
  listViewClosed,
  type ListResource,
  type ListView,
} from "./listView";
import { synchronizeSession } from "./session";
import { normalizeOrderValues } from "@entities/order/model/normalizeValues";

const combinedReducer = combineReducers({
  user: userSlice.reducer,
  orderParameters: orderParametersSlice.reducer,
  order: orderSlice.reducer,
  price: priceSlice.reducer,
  shifts: shiftsSlice.reducer,
  additionalWorks: additionalWorksSlice.reducer,
  app: appSlice.reducer,
  users: usersSlice.reducer,
});
export type RootState = ReturnType<typeof combinedReducer>;

const readScopes: Record<string, string> = {
  "orders/fromActiveShift": "orders",
  "orders/getByShiftId": "orders",
  "orders/getForAdmin": "orders",
  "additionalWorks/fromActiveShift": "additionalWorks",
  "additionalWorks/getByShiftId": "additionalWorks",
  "shifts/getActive": "activeShift",
  "shifts/getList": "shifts",
  "users/getList": "users",
  "price/getList": "price",
  "orderParameters/getList": "orderParameters",
};

export function createAppStore() {
  const requests = new Map<
    string,
    { resource: string; token: string; type: string }
  >();
  const latest = new Map<string, string>();
  const views = new Map<ListResource, ListView>();

  const resetActiveData = (state: RootState): RootState => ({
    ...state,
    order: state.order.pending
      ? state.order
      : {
          ...state.order,
          ordersValue: {},
          ...(views.get("orders")?.kind === "active"
            ? { ordersList: {}, loading: false, readError: "", error: "" }
            : {}),
        },
    additionalWorks: state.additionalWorks.pending
      ? state.additionalWorks
      : {
          ...state.additionalWorks,
          additionalWorksValue: {},
          ...(views.get("additionalWorks")?.kind === "active"
            ? { additionalWorksList: {}, loading: false, readError: "", error: "" }
            : {}),
        },
  });
  const invalidateActiveReads = () => {
    for (const [id, request] of requests) {
      if (
        ["orders/fromActiveShift", "additionalWorks/fromActiveShift"].includes(
          request.type,
        )
      )
        requests.delete(id);
    }
    for (const resource of ["orders", "additionalWorks"] as const) {
      if (views.get(resource)?.kind === "active") latest.delete(resource);
    }
  };

  const requestLifecycle: Middleware<
    object,
    RootState,
    ThunkDispatch<RootState, RequestLifecycle, UnknownAction>
  > = (api) => (next) => (unknownAction) => {
    const action = unknownAction as {
      type: string;
      payload?: unknown;
      meta?: { requestId?: string; requestStatus?: string };
    };
    const id = action.meta?.requestId;
    const status = action.meta?.requestStatus;
    // Let a pending thunk capture its original session; transport must reject,
    // rather than retarget, a write if another tab has changed the saved token.
    if (
      action.type !== synchronizeSession.type &&
      status !== "pending" &&
      !matchesStoredSession((api.getState() as RootState).user.token)
    ) {
      api.dispatch(synchronizeSession());
      return action;
    }
    if (id && action.type.endsWith("/setPending") && !requests.has(id))
      return action;

    if (listViewOpened.match(unknownAction)) {
      views.set(unknownAction.payload.resource, unknownAction.payload);
      latest.delete(unknownAction.payload.resource);
    }
    if (
      listViewClosed.match(unknownAction) &&
      views.get(unknownAction.payload.resource)?.owner ===
        unknownAction.payload.owner
    ) {
      views.delete(unknownAction.payload.resource);
      latest.delete(unknownAction.payload.resource);
    }
    const type = action.type.replace(/\/(pending|fulfilled|rejected)$/, "");
    const scope = readScopes[type];
    if (id && status === "pending") {
      requests.set(id, {
        resource: action.type.split("/")[0],
        token: (api.getState() as RootState).user.token,
        type,
      });
      if (scope) latest.set(scope, id);
    } else if (id && (status === "fulfilled" || status === "rejected")) {
      const known = requests.delete(id);
      if (!known || (scope && latest.get(scope) !== id)) return action;
    }
    if (
      synchronizeSession.match(unknownAction) ||
      userSlice.actions.logoutUser.match(unknownAction) ||
      ((loginUser.fulfilled.match(unknownAction) ||
        registerUser.fulfilled.match(unknownAction)) &&
        unknownAction.payload?.token)
    ) {
      requests.clear();
      latest.clear();
      views.clear();
    }
    if (
      closeActiveShift.fulfilled.match(unknownAction) &&
      unknownAction.payload
    ) {
      for (const [requestId, { resource }] of requests) {
        if (["orders", "shifts", "additionalWorks"].includes(resource))
          requests.delete(requestId);
      }
      for (const resource of [
        "orders",
        "shifts",
        "activeShift",
        "additionalWorks",
      ])
        latest.delete(resource);
    }
    if (getActiveShift.fulfilled.match(unknownAction) && !unknownAction.payload)
      invalidateActiveReads();
    if (
      createActiveShift.fulfilled.match(unknownAction) &&
      unknownAction.payload
    ) {
      latest.delete("activeShift");
      invalidateActiveReads();
    }
    const previousShift = (api.getState() as RootState).shifts.activeShift?.id;
    const result = next(unknownAction);

    const refresh = (resource: ListResource) => {
      const view = views.get(resource);
      if (!view) return;
      if (resource === "orders") {
        if (view.kind === "active") api.dispatch(getOrdersFromActiveShift());
        else if (view.kind === "admin") api.dispatch(getOrdersListForAdmin());
        else if (view.shiftId !== undefined)
          api.dispatch(getOrderByShiftId(view.shiftId));
      } else {
        if (view.kind === "active")
          api.dispatch(getAdditionalWorksFromActiveShift());
        else if (view.kind === "shift" && view.shiftId !== undefined)
          api.dispatch(getAdditionalWorksByShiftId(view.shiftId));
      }
    };
    if (
      /^(orders|additionalWorks)\/(add|edit|delete)\/fulfilled$/.test(
        action.type,
      ) &&
      action.payload
    ) {
      const resource: ListResource = action.type.startsWith("orders/")
        ? "orders"
        : "additionalWorks";
      refresh(resource);
      if (
        views.get(resource)?.kind === "active" &&
        !(api.getState() as RootState).shifts.activeShift
      ) {
        api.dispatch(getActiveShift());
      }
    }
    if (retryListRead.match(unknownAction)) refresh(unknownAction.payload);
    if (getOrdersListForAdmin.fulfilled.match(unknownAction) && unknownAction.payload) {
      const page = (api.getState() as RootState).order.ordersListPagination;
      const lastPage = Math.max(1, Math.ceil(page.totalRecord / page.recordPerPage));
      if (unknownAction.payload.currentPage === page.currentPage && page.currentPage > lastPage) {
        api.dispatch(setCurrentPage(lastPage));
        api.dispatch(getOrdersListForAdmin());
      }
    }
    const shiftCreated =
      createActiveShift.fulfilled.match(unknownAction) && unknownAction.payload;
    const shiftChanged =
      getActiveShift.fulfilled.match(unknownAction) &&
      unknownAction.payload &&
      previousShift !== undefined &&
      previousShift !== unknownAction.payload.id;
    if (shiftCreated || shiftChanged) {
      for (const resource of ["orders", "additionalWorks"] as const) {
        if (views.get(resource)?.kind === "active") refresh(resource);
      }
    }
    return result;
  };
  return configureStore({
    reducer: (state: RootState | undefined, action): RootState => {
      if (
        synchronizeSession.match(action) ||
        userSlice.actions.logoutUser.match(action) ||
        ((loginUser.fulfilled.match(action) ||
          registerUser.fulfilled.match(action)) &&
          action.payload?.token)
      ) {
        const initial = combinedReducer(undefined, { type: "@@init" });
        const reset = { ...initial, app: state?.app ?? initial.app };
        state = synchronizeSession.match(action)
          ? combinedReducer(reset, userSlice.actions.checkLSUser())
          : reset;
      }
      if (closeActiveShift.fulfilled.match(action) && action.payload) {
        const initial = combinedReducer(undefined, { type: "@@init" });
        state = state
          ? {
              ...state,
              shifts: initial.shifts,
              order: initial.order,
              additionalWorks: initial.additionalWorks,
            }
          : initial;
      }
      if (
        state &&
        getActiveShift.fulfilled.match(action) &&
        (!action.payload ||
          (state.shifts.activeShift &&
            state.shifts.activeShift.id !== action.payload.id))
      ) {
        state = resetActiveData(state);
      }
      if (
        state &&
        createActiveShift.fulfilled.match(action) &&
        action.payload &&
        state.shifts.activeShift?.id !== action.payload.id
      ) {
        state = resetActiveData(state);
      }
      if (state && listViewOpened.match(action)) {
        state =
          action.payload.resource === "orders"
            ? {
                ...state,
                order: {
                  ...state.order,
                  ordersList: {},
                  loading: false,
                  readError: "",
                  error: "",
                },
              }
            : {
                ...state,
                additionalWorks: {
                  ...state.additionalWorks,
                  additionalWorksList: {},
                  loading: false,
                  readError: "",
                  error: "",
                },
              };
      }
      let next = combinedReducer(state, action);
      if (setOrdersValue.match(action) || beginEditOrder.match(action)) {
        const id = beginEditOrder.match(action)
          ? action.payload
          : action.payload.orderId;
        if (next.order.ordersValue[id]) {
          next = {
            ...next,
            order: {
              ...next.order,
              ordersValue: {
                ...next.order.ordersValue,
                [id]: normalizeOrderValues(
                  next.order.ordersValue[id],
                  next.orderParameters,
                  next.price.priceList,
                ),
              },
            },
          };
        }
      }
      return next;
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        thunk: {
          extraArgument: {
            isRequestActive: (id: string) => {
              const request = requests.get(id);
              return !!request && matchesStoredSession(request.token);
            },
          },
        },
      }).concat(requestLifecycle),
  });
}
export const store = createAppStore();
export type AppDispatch = typeof store.dispatch;

import assert from "node:assert/strict";
import axios from "axios";
import { createAppStore } from "../src/shared/store/index.ts";
import {
  checkLSUser,
  logoutUser,
  logoutCurrentSession,
  loginUser,
  registerUser,
  userSlice,
} from "../src/entities/user/index.ts";
import { getUsersList } from "../src/entities/users/model/slice.ts";
import {
  getOrdersListForAdmin,
  setCurrentPage,
  addNewActiveOrder,
  setOrdersValue,
  beginEditOrder,
  deleteActiveOrder,
  editOrder,
  addOrder,
  deleteOrder,
  downloadOrdersList,
  getOrdersFromActiveShift,
  getOrderByShiftId,
} from "../src/entities/order/index.ts";
import {
  closeActiveShift,
  getShiftsList,
  getActiveShift,
  createActiveShift,
  SelectWorkerActiveShift,
} from "../src/entities/shifts/index.ts";
import { getOrderParametersList } from "../src/entities/orderParameters/index.ts";
import {
  selectOrderParametersListForFilter,
  selectOrderParametersOrdersValue,
} from "../src/entities/orderParameters/model/selectors.ts";
import {
  addNewActiveAdditionalWork,
  setAdditionalWorksValue,
  getAdditionalWorksFromActiveShift,
  beginEditAdditionalWork,
  deleteActiveAdditionalWork,
  editAdditionalWork,
  deleteAdditionalWork,
  getAdditionalWorksByShiftId,
  addAdditionalWork,
} from "../src/entities/additionalWorks/index.ts";
import { AddNewFilterParameterOptions } from "../src/features/ordersListFilters/ui/AddNewFilterParameterOptions.tsx";
import {
  retryListRead,
  listViewOpened,
  listViewClosed,
} from "../src/shared/store/listView.ts";
import { synchronizeSession } from "../src/shared/store/session.ts";
import { normalizeOrderValues } from "../src/entities/order/model/normalizeValues.ts";

const storage = new Map();
globalThis.localStorage = {
  getItem: (key) => storage.get(key) ?? null,
  setItem: (key, value) => storage.set(key, value),
  removeItem: (key) => storage.delete(key),
};
const respond = (config, data) => ({
  data,
  config,
  status: 200,
  statusText: "OK",
  headers: {},
});
const order = (number = "SERVER") => ({
  id: 71,
  optionValues: [
    {
      parameterId: 4,
      parameter: { name: "car_number", type: "INPUT" },
      value: number,
      count: 1,
    },
  ],
});
let count = 0;
async function check(name, run) {
  storage.clear();
  await run();
  console.log(`PASS ${++count}: ${name}`);
}

await check("users reload after success and after failure", async () => {
  const store = createAppStore();
  let calls = 0;
  axios.defaults.adapter = async (config) => {
    calls++;
    return respond(config, []);
  };
  await store.dispatch(getUsersList());
  await store.dispatch(getUsersList());
  assert.equal(calls, 2);
  assert.equal(store.getState().users.pending, false);
  assert.deepEqual(store.getState().users.users, []);
  axios.defaults.adapter = async () => {
    throw new Error("offline");
  };
  await store.dispatch(getUsersList());
  assert.equal(store.getState().users.pending, false);
  axios.defaults.adapter = async (config) => respond(config, []);
  await store.dispatch(getUsersList());
  assert.deepEqual(store.getState().users.users, []);
});
await check(
  "logout removes drafts and ignores the previous session response",
  async () => {
    const store = createAppStore();
    let finish;
    axios.defaults.adapter = (config) =>
      new Promise((resolve) => {
        finish = () => resolve(respond(config, [order()]));
      });
    store.dispatch(addNewActiveOrder());
    store.dispatch(
      setOrdersValue({ orderId: -1, name: "car_number", value: "PRIVATE" }),
    );
    const request = store.dispatch(getOrdersFromActiveShift());
    store.dispatch(logoutUser());
    finish();
    await request;
    assert.deepEqual(store.getState().order.ordersValue, {});
    assert.deepEqual(store.getState().order.ordersList, {});
  },
);
await check(
  "closing shift removes drafts without discarding a pending dictionary",
  async () => {
    const store = createAppStore();
    let finish;
    axios.defaults.adapter = async (config) =>
      config.url.endsWith("/orderParameters")
        ? new Promise((resolve) => {
            finish = () =>
              resolve(
                respond(config, {
                  parameters: [
                    { id: 4, name: "car_number", type: "INPUT", options: [] },
                  ],
                  options: {},
                }),
              );
          })
        : respond(config, true);
    const dictionary = store.dispatch(getOrderParametersList());
    store.dispatch(addNewActiveOrder());
    await store.dispatch(closeActiveShift());
    finish();
    await dictionary;
    assert.deepEqual(store.getState().order.ordersValue, {});
    assert.equal(store.getState().orderParameters.error, "");
    assert.equal(
      store.getState().orderParameters.parametersList[0].name,
      "car_number",
    );
  },
);
await check(
  "latest page/filter wins even when responses finish out of order",
  async () => {
    const store = createAppStore();
    const finish = [];
    axios.defaults.adapter = (config) =>
      new Promise((resolve) =>
        finish.push((data) => resolve(respond(config, data))),
      );
    const first = store.dispatch(getOrdersListForAdmin());
    store.dispatch(setCurrentPage(2));
    const second = store.dispatch(getOrdersListForAdmin());
    assert.equal(finish.length, 2);
    finish[1]({ currentPage: 2, totalRecord: 20, rows: [order("LATEST")] });
    await second;
    finish[0]({ currentPage: 1, totalRecord: 1, rows: [] });
    await first;
    assert.equal(
      store.getState().order.ordersList[71].optionValues[0].value,
      "LATEST",
    );
    const third = store.dispatch(getOrdersListForAdmin());
    const fourth = store.dispatch(getOrdersListForAdmin());
    finish[3]({ currentPage: 2, totalRecord: 5, rows: [order("NEW_FILTER")] });
    await fourth;
    finish[2]({ currentPage: 2, totalRecord: 99, rows: [] });
    await third;
    assert.equal(store.getState().order.ordersListPagination.totalRecord, 5);
  },
);
await check("latest history page wins", async () => {
  const store = createAppStore();
  const finish = [];
  axios.defaults.adapter = (config) =>
    new Promise((resolve) =>
      finish.push((data) => resolve(respond(config, data))),
    );
  const first = store.dispatch(getShiftsList());
  const second = store.dispatch(getShiftsList());
  finish[1]({ currentPage: 1, totalRecord: 1, rows: [{ id: 2 }] });
  await second;
  finish[0]({ currentPage: 1, totalRecord: 1, rows: [{ id: 1 }] });
  await first;
  assert.deepEqual(Object.keys(store.getState().shifts.shiftsList), ["2"]);
});
await check(
  "cancel and reopen use server values; failed save keeps draft",
  async () => {
    const store = createAppStore();
    axios.defaults.adapter = async (config) => respond(config, [order()]);
    await store.dispatch(getOrdersFromActiveShift());
    store.dispatch(beginEditOrder(71));
    store.dispatch(
      setOrdersValue({ orderId: 71, name: "car_number", value: "CANCELLED" }),
    );
    store.dispatch(deleteActiveOrder(71));
    store.dispatch(beginEditOrder(71));
    assert.equal(
      selectOrderParametersOrdersValue(store.getState(), 71).car_number,
      "SERVER",
    );
    store.dispatch(
      setOrdersValue({ orderId: 71, name: "car_number", value: "RETRY" }),
    );
    axios.defaults.adapter = async () => {
      throw new Error("offline");
    };
    const result = await store.dispatch(editOrder(71));
    assert.equal(result.meta.requestStatus, "rejected");
    assert.equal(store.getState().order.pending, false);
    assert.equal(store.getState().order.ordersValue[71].car_number, "RETRY");
  },
);
await check(
  "normalization removes hidden fields, unavailable options and composite operations",
  () => {
    const settings = {
      parametersList: [
        { id: 5, name: "car_type", type: "SELECT", options: [{ id: 12 }, { id: 13 }] },
        { id: 7, name: "wheel_diameter", type: "SELECT", options: [{ id: 14 }, { id: 18 }] },
        { id: 2, name: "legal_list", type: "INPUT", options: [] },
        { id: 8, name: "works", type: "SELECT_LIST", options: [{ id: 20 }, { id: 21 }] },
        { id: 9, name: "operations", type: "COMPOSITE_LIST", options: [{ id: 30 }] },
      ],
      parameterOptionDependence: { 2: [12] },
      optionOptionDependence: { 13: { 7: [14], 8: [20] } },
    };
    const result = normalizeOrderValues(
      {
        id: -1,
        car_type: 13,
        wheel_diameter: 18,
        legal_list: "hidden",
        works: { 20: 2, 21: 1 },
        operations: [{ id: "a", optionIds: [30], count: 1 }],
      },
      settings,
      [{ mainOptionId: 30, conditions: [{ id: 12 }] }],
    );
    assert.equal(result.wheel_diameter, undefined);
    assert.equal(result.legal_list, undefined);
    assert.deepEqual(result.works, { 20: 2 });
    assert.deepEqual(result.operations, []);
  },
);
await check(
  "additional work cancel, failure and logout isolate its buffer",
  async () => {
    const store = createAppStore();
    axios.defaults.adapter = async (config) =>
      respond(config, [{ id: 12, description: "SERVER", totalValue: 100 }]);
    await store.dispatch(getAdditionalWorksFromActiveShift());
    store.dispatch(beginEditAdditionalWork(12));
    store.dispatch(
      setAdditionalWorksValue({
        additionalWorkId: 12,
        name: "description",
        value: "CANCELLED",
      }),
    );
    store.dispatch(deleteActiveAdditionalWork(12));
    store.dispatch(beginEditAdditionalWork(12));
    assert.equal(
      store.getState().additionalWorks.additionalWorksValue[12].description,
      "SERVER",
    );
    axios.defaults.adapter = async () => {
      throw new Error("offline");
    };
    assert.equal(
      (await store.dispatch(editAdditionalWork(12))).meta.requestStatus,
      "rejected",
    );
    assert.equal(store.getState().additionalWorks.pending, false);
    store.dispatch(addNewActiveAdditionalWork());
    store.dispatch(logoutUser());
    assert.deepEqual(store.getState().additionalWorks.additionalWorksValue, {});
    assert.deepEqual(store.getState().additionalWorks.additionalWorksList, {});
  },
);
await check("signature No uses the API null representation", () => {
  let selected = 1;
  const element = AddNewFilterParameterOptions({
    parameter: {
      id: 11,
      name: "signature",
      type: "GRAPH_INPUT",
      translationRu: "Signature",
      options: [],
    },
    value: 1,
    setValue: (value) => {
      selected = value;
    },
  });
  element.props.children.props.onChange(0);
  assert.equal(selected, null);
  element.props.children.props.onChange(1);
  assert.equal(selected, 1);
});
await check(
  "old mutation cannot clear the next session's pending save",
  async () => {
    const store = createAppStore();
    const finish = [];
    storage.set(
      "user",
      JSON.stringify({
        id: 1,
        name: "A",
        token: "session-a",
        roles: ["WORKER"],
      }),
    );
    store.dispatch(checkLSUser());
    axios.defaults.adapter = async (config) => respond(config, [order()]);
    await store.dispatch(getOrdersFromActiveShift());
    store.dispatch(beginEditOrder(71));
    axios.defaults.adapter = (config) =>
      new Promise((resolve) =>
        finish.push(() => resolve(respond(config, { id: 71 }))),
      );
    const oldSave = store.dispatch(editOrder(71));
    store.dispatch(logoutUser());
    storage.set(
      "user",
      JSON.stringify({
        id: 2,
        name: "B",
        token: "session-b",
        roles: ["WORKER"],
      }),
    );
    store.dispatch(checkLSUser());
    store.dispatch(
      setOrdersValue({ orderId: 71, name: "car_number", value: "B" }),
    );
    const newSave = store.dispatch(editOrder(71));
    finish[0]();
    await oldSave;
    assert.equal(store.getState().order.pending, true);
    assert.equal(store.getState().order.ordersValue[71].car_number, "B");
    finish[1]();
    await newSave;
    assert.equal(store.getState().order.pending, false);
  },
);
await check(
  "created order preserves existing rows with either snapshot completion order",
  async () => {
    for (const oldFirst of [true, false]) {
      const store = createAppStore();
      const reads = [];
      const existing = {
        ...order("EXISTING"),
        id: 70,
        totalValue: 200,
        totalValueWithDiscount: 200,
      };
      const saved = {
        ...order("CREATED"),
        totalValue: 100,
        totalValueWithDiscount: 100,
      };
      axios.defaults.adapter = async (config) =>
        config.url.endsWith("/shifts/getActive")
          ? respond(config, { id: 1, active: true })
          : config.url.endsWith("/orders/add")
            ? respond(config, saved)
            : new Promise((resolve) =>
                reads.push((data) => resolve(respond(config, data))),
              );
      store.dispatch(
        listViewOpened({ resource: "orders", kind: "active", owner: "worker" }),
      );
      await store.dispatch(getActiveShift());
      const oldRead = store.dispatch(getOrdersFromActiveShift());
      store.dispatch(addNewActiveOrder());
      await store.dispatch(addOrder(-1));
      assert.equal(reads.length, 2);
      assert.equal(store.getState().order.ordersValue[-1].active, false);
      if (oldFirst) {
        reads[0]([existing]);
        await oldRead;
      }
      reads[1]([existing, saved]);
      await new Promise((resolve) => setImmediate(resolve));
      if (!oldFirst) {
        reads[0]([existing]);
        await oldRead;
      }
      assert.deepEqual(Object.keys(store.getState().order.ordersList), [
        "70",
        "71",
      ]);
      assert.equal(
        Object.values(store.getState().order.ordersList).reduce(
          (sum, row) => sum + row.totalValueWithDiscount,
          0,
        ),
        300,
      );
    }
  },
);
await check(
  "created additional work preserves old works with either response order",
  async () => {
    for (const oldFirst of [true, false]) {
      const store = createAppStore();
      const reads = [];
      const existing = { id: 80, description: "EXISTING", totalValue: 200 };
      const saved = { id: 81, description: "NEW", totalValue: 100 };
      axios.defaults.adapter = async (config) =>
        config.url.endsWith("/shifts/getActive")
          ? respond(config, { id: 1, active: true })
          : config.url.endsWith("/additionalWorks/add")
            ? respond(config, saved)
            : new Promise((resolve) =>
                reads.push((data) => resolve(respond(config, data))),
              );
      store.dispatch(
        listViewOpened({
          resource: "additionalWorks",
          kind: "active",
          owner: "worker",
        }),
      );
      await store.dispatch(getActiveShift());
      const oldRead = store.dispatch(getAdditionalWorksFromActiveShift());
      store.dispatch(addNewActiveAdditionalWork());
      await store.dispatch(addAdditionalWork(-1));
      assert.equal(reads.length, 2);
      if (oldFirst) {
        reads[0]([existing]);
        await oldRead;
      }
      reads[1]([existing, saved]);
      await new Promise((resolve) => setImmediate(resolve));
      if (!oldFirst) {
        reads[0]([existing]);
        await oldRead;
      }
      assert.deepEqual(
        Object.keys(store.getState().additionalWorks.additionalWorksList),
        ["80", "81"],
      );
      assert.equal(
        Object.values(
          store.getState().additionalWorks.additionalWorksList,
        ).reduce((sum, row) => sum + row.totalValue, 0),
        300,
      );
    }
  },
);
const storedUser = (name) => ({
  id: name === "A" ? 1 : 2,
  name,
  token: `synthetic-${name}`,
  roles: ["WORKER"],
});
await check(
  "another tab cannot retarget either a draft save or a deletion to its user",
  async () => {
    for (const operation of [addOrder(-1), deleteOrder(71)]) {
      storage.set("user", JSON.stringify(storedUser("A")));
      const store = createAppStore();
      store.dispatch(checkLSUser());
      store.dispatch(addNewActiveOrder());
      store.dispatch(
        setOrdersValue({ orderId: -1, name: "car_number", value: "A-DRAFT" }),
      );
      storage.set("user", JSON.stringify(storedUser("B")));
      let calls = 0;
      axios.defaults.adapter = async (config) => {
        calls++;
        return respond(config, { id: 71 });
      };
      await store.dispatch(operation);
      assert.equal(calls, 0);
      assert.equal(store.getState().user.name, "B");
      assert.deepEqual(store.getState().order.ordersValue, {});
      assert.equal(JSON.parse(storage.get("user")).name, "B");
    }
  },
);
await check(
  "synchronizing another tab discards old responses and drafts without deleting its session",
  async () => {
    storage.set("user", JSON.stringify(storedUser("A")));
    const store = createAppStore();
    store.dispatch(checkLSUser());
    let finish;
    axios.defaults.adapter = (config) =>
      new Promise((resolve) => {
        finish = () => resolve(respond(config, [order()]));
      });
    const old = store.dispatch(getOrdersFromActiveShift());
    store.dispatch(addNewActiveOrder());
    storage.set("user", JSON.stringify(storedUser("B")));
    store.dispatch(synchronizeSession());
    finish();
    await old;
    assert.equal(store.getState().user.name, "B");
    assert.deepEqual(store.getState().order.ordersList, {});
    assert.deepEqual(store.getState().order.ordersValue, {});
    assert.equal(JSON.parse(storage.get("user")).name, "B");
  },
);
await check(
  "late closeShift result leaves the next session lists intact",
  async () => {
    storage.set("user", JSON.stringify(storedUser("A")));
    const store = createAppStore();
    store.dispatch(checkLSUser());
    let finish;
    axios.defaults.adapter = (config) =>
      new Promise((resolve) => {
        finish = () => resolve(respond(config, true));
      });
    const closing = store.dispatch(closeActiveShift());
    store.dispatch(logoutUser());
    storage.set("user", JSON.stringify(storedUser("B")));
    store.dispatch(checkLSUser());
    axios.defaults.adapter = async (config) =>
      respond(
        config,
        config.url.endsWith("getActive")
          ? { id: 2, active: true }
          : [order("B")],
      );
    await store.dispatch(getActiveShift());
    await store.dispatch(getOrdersFromActiveShift());
    finish();
    await closing;
    assert.equal(store.getState().shifts.activeShift.active, true);
    assert.equal(
      store.getState().order.ordersList[71].optionValues[0].value,
      "B",
    );
  },
);
await check("export downloads only for its still active session", async () => {
  let downloads = 0;
  globalThis.window = {
    URL: { createObjectURL: () => "blob:synthetic", revokeObjectURL: () => {} },
  };
  globalThis.document = {
    createElement: () => ({
      click: () => {
        downloads++;
      },
    }),
    body: { appendChild: () => {}, removeChild: () => {} },
  };
  for (const change of ["logout", "other-tab", "unchanged"]) {
    storage.set("user", JSON.stringify(storedUser("A")));
    const store = createAppStore();
    store.dispatch(checkLSUser());
    let finish;
    axios.defaults.adapter = (config) =>
      new Promise((resolve) => {
        finish = () => resolve(respond(config, "synthetic-export"));
      });
    const exporting = store.dispatch(downloadOrdersList());
    if (change === "logout") store.dispatch(logoutUser());
    if (change === "other-tab")
      storage.set("user", JSON.stringify(storedUser("B")));
    finish();
    await exporting;
    assert.equal(downloads, change === "unchanged" ? 1 : 0);
  }
  delete globalThis.window;
  delete globalThis.document;
});
await check(
  "finishing a create refreshes only the newly opened history",
  async () => {
    const store = createAppStore();
    let finishSave;
    const reads = [];
    let activeReads = 0;
    axios.defaults.adapter = (config) => {
      if (config.url.endsWith("/orders/add"))
        return new Promise((resolve) => {
          finishSave = () =>
            resolve(respond(config, { ...order("NEW"), id: 81, shiftId: 2 }));
        });
      if (config.url.includes("/orders/getByShiftId"))
        return new Promise((resolve) =>
          reads.push((data) => resolve(respond(config, data))),
        );
      activeReads++;
      return Promise.resolve(respond(config, []));
    };
    store.dispatch(addNewActiveOrder());
    const saving = store.dispatch(addOrder(-1));
    store.dispatch(
      listViewOpened({
        resource: "orders",
        kind: "shift",
        shiftId: 1,
        owner: "history",
      }),
    );
    const history = store.dispatch(getOrderByShiftId(1));
    finishSave();
    await saving;
    assert.equal(reads.length, 2);
    const rows = [{ ...order("HISTORY"), shiftId: 1 }];
    reads[1](rows);
    await new Promise((resolve) => setImmediate(resolve));
    reads[0](rows);
    await history;
    assert.equal(
      store.getState().order.ordersList[71].optionValues[0].value,
      "HISTORY",
    );
    assert.equal(store.getState().order.ordersList[81], undefined);
    assert.equal(activeReads, 0);
  },
);
await check(
  "filter chooser offers only types supported by both UI and API",
  async () => {
    const store = createAppStore();
    const parameters = [
      "INPUT",
      "SELECT",
      "SELECT_LIST",
      "GRAPH_INPUT",
      "COMPOSITE_LIST",
    ].map((type, id) => ({ id, name: type, type, options: [] }));
    axios.defaults.adapter = async (config) =>
      respond(config, {
        parameters,
        options: {
          parameterOptionDependence: "{}",
          optionOptionDependence: "{}",
        },
      });
    await store.dispatch(getOrderParametersList());
    assert.deepEqual(
      selectOrderParametersListForFilter(store.getState()).map((p) => p.name),
      ["userId", "INPUT", "SELECT", "SELECT_LIST", "GRAPH_INPUT"],
    );
  },
);
await check(
  "successful login and registration request navigation outside their unmounting form",
  async () => {
    for (const authenticate of [loginUser, registerUser]) {
      storage.clear();
      const store = createAppStore();
      axios.defaults.adapter = async (config) =>
        respond(config, {
          id: 1,
          name: "Synthetic",
          token: "synthetic-auth",
          roles: ["ADMIN"],
        });
      const result = await store.dispatch(
        authenticate({
          email: "synthetic@example.test",
          password: "synthetic-only",
        }),
      );
      assert.equal(result.meta.requestStatus, "fulfilled");
      assert.equal(store.getState().user.authRedirectPending, true);
      store.dispatch(userSlice.actions.authRedirected());
      assert.equal(store.getState().user.authRedirectPending, false);
      assert.equal(
        JSON.parse(storage.get("user")).authRedirectPending,
        undefined,
      );
    }
  },
);
await check(
  "restoring, syncing, failing or completing an obsolete login does not redirect",
  async () => {
    const store = createAppStore();
    storage.set("user", JSON.stringify(storedUser("A")));
    store.dispatch(checkLSUser());
    assert.equal(store.getState().user.authRedirectPending, false);
    storage.set("user", JSON.stringify(storedUser("B")));
    store.dispatch(synchronizeSession());
    assert.equal(store.getState().user.authRedirectPending, false);
    axios.defaults.adapter = async () => {
      throw new Error("offline");
    };
    await store.dispatch(
      loginUser({
        email: "synthetic@example.test",
        password: "synthetic-only",
      }),
    );
    assert.equal(store.getState().user.authRedirectPending, false);
    let finish;
    axios.defaults.adapter = (config) =>
      new Promise((resolve) => {
        finish = () => resolve(respond(config, storedUser("A")));
      });
    const login = store.dispatch(
      loginUser({
        email: "synthetic@example.test",
        password: "synthetic-only",
      }),
    );
    store.dispatch(logoutUser());
    finish();
    await login;
    assert.equal(store.getState().user.authRedirectPending, false);
    assert.equal(store.getState().user.token, "");
  },
);
const mutations = [
  { name: "add order", run: () => addOrder(-1) },
  { name: "edit order", run: () => editOrder(-1) },
  { name: "delete order", run: () => deleteOrder(71) },
  { name: "add work", run: () => addAdditionalWork(-1) },
  { name: "edit work", run: () => editAdditionalWork(-1) },
  { name: "delete work", run: () => deleteAdditionalWork(81) },
];
const prepareDrafts = (store) => {
  store.dispatch(addNewActiveOrder());
  store.dispatch(addNewActiveAdditionalWork());
};
await check(
  "closing and all six record mutations exclude each other in both directions",
  async () => {
    for (const operation of mutations) {
      for (const closeFirst of [true, false]) {
        const store = createAppStore();
        prepareDrafts(store);
        let finish;
        let calls = 0;
        axios.defaults.adapter = (config) => {
          calls++;
          return new Promise((resolve) => {
            finish = () =>
              resolve(
                respond(
                  config,
                  config.url.endsWith("closeAllActive")
                    ? [1]
                    : { ...order(), id: 71 },
                ),
              );
          });
        };
        const first = store.dispatch(
          closeFirst ? closeActiveShift() : operation.run(),
        );
        const blocked = await store.dispatch(
          closeFirst ? operation.run() : closeActiveShift(),
        );
        assert.equal(blocked.meta.requestStatus, "rejected", operation.name);
        assert.equal(calls, 1, operation.name);
        assert.equal(
          closeFirst
            ? store.getState().shifts.pending
            : store.getState().order.pending ||
                store.getState().additionalWorks.pending,
          true,
        );
        finish();
        await first;
        assert.equal(store.getState().shifts.pending, false);
        assert.equal(store.getState().order.pending, false);
        assert.equal(store.getState().additionalWorks.pending, false);
      }
    }
  },
);
await check(
  "failure releases guards, retains unsaved drafts and permits a retry",
  async () => {
    const store = createAppStore();
    prepareDrafts(store);
    axios.defaults.adapter = async () => {
      throw new Error("offline");
    };
    assert.equal(
      (await store.dispatch(closeActiveShift())).meta.requestStatus,
      "rejected",
    );
    assert.equal(store.getState().shifts.pending, false);
    assert.equal(store.getState().order.ordersValue[-1].active, true);
    assert.equal(
      (await store.dispatch(addOrder(-1))).meta.requestStatus,
      "rejected",
    );
    assert.equal(store.getState().order.pending, false);
    assert.equal(store.getState().order.ordersValue[-1].active, true);
    axios.defaults.adapter = async (config) =>
      respond(config, { ...order(), id: 71 });
    assert.equal(
      (await store.dispatch(addOrder(-1))).meta.requestStatus,
      "fulfilled",
    );
    assert.equal(store.getState().order.ordersValue[-1].active, false);
  },
);
await check(
  "late deletes refresh the visible historical view for orders and works",
  async () => {
    for (const resource of ["orders", "additionalWorks"]) {
      const store = createAppStore();
      let finishDelete;
      const reads = [];
      let activeReads = 0;
      const deletingAction =
        resource === "orders" ? deleteOrder(71) : deleteAdditionalWork(81);
      axios.defaults.adapter = (config) => {
        if (config.url.endsWith("/delete"))
          return new Promise((resolve) => {
            finishDelete = () => resolve(respond(config, true));
          });
        if (config.url.includes("getByShiftId"))
          return new Promise((resolve) =>
            reads.push((data) => resolve(respond(config, data))),
          );
        activeReads++;
        return Promise.resolve(respond(config, []));
      };
      store.dispatch(
        listViewOpened({ resource, kind: "active", owner: "old" }),
      );
      const deleting = store.dispatch(deletingAction);
      store.dispatch(
        listViewOpened({
          resource,
          kind: "shift",
          shiftId: 5,
          owner: "history",
        }),
      );
      store.dispatch(listViewClosed({ resource, owner: "old" }));
      const loading = store.dispatch(
        resource === "orders"
          ? getOrderByShiftId(5)
          : getAdditionalWorksByShiftId(5),
      );
      finishDelete();
      await deleting;
      assert.equal(reads.length, 2);
      assert.equal(activeReads, 0);
      const rows = [
        { ...order("HISTORY"), id: 1, shiftId: 5, description: "HISTORY" },
      ];
      reads[1](rows);
      await new Promise((resolve) => setImmediate(resolve));
      reads[0](rows);
      await loading;
      const list =
        resource === "orders"
          ? store.getState().order.ordersList
          : store.getState().additionalWorks.additionalWorksList;
      assert.equal(list[1].shiftId, 5);
      assert.deepEqual(Object.keys(list), ["1"]);
    }
  },
);
await check(
  "closing a list prevents late mutations from issuing an obsolete reload",
  async () => {
    const store = createAppStore();
    let finish;
    let reads = 0;
    axios.defaults.adapter = (config) => {
      if (config.url.endsWith("delete"))
        return new Promise((resolve) => {
          finish = () => resolve(respond(config, true));
        });
      reads++;
      return Promise.resolve(respond(config, []));
    };
    store.dispatch(
      listViewOpened({ resource: "orders", kind: "active", owner: "worker" }),
    );
    const deleting = store.dispatch(deleteOrder(71));
    store.dispatch(listViewClosed({ resource: "orders", owner: "worker" }));
    finish();
    await deleting;
    assert.equal(reads, 0);
  },
);
await check(
  "closed order editor still refreshes active and admin lists before reopening",
  async () => {
    for (const kind of ["active", "admin"]) {
      const store = createAppStore();
      let finish;
      let saved = false;
      let reads = 0;
      const row = () => ({
        ...order(saved ? "UPDATED" : "ORIGINAL"),
        totalValue: 100,
        totalValueWithDiscount: 100,
      });
      axios.defaults.adapter = async (config) => {
        if (config.url.endsWith("/shifts/getActive"))
          return respond(config, { id: 1, active: true });
        if (config.url.endsWith("/orders/edit"))
          return new Promise((resolve) => {
            finish = () => {
              saved = true;
              resolve(respond(config, { id: 71 }));
            };
          });
        reads++;
        return respond(
          config,
          kind === "admin"
            ? { currentPage: 1, totalRecord: 1, rows: [row()] }
            : [row()],
        );
      };
      store.dispatch(
        listViewOpened({ resource: "orders", kind, owner: "list" }),
      );
      await store.dispatch(getActiveShift());
      await store.dispatch(
        kind === "admin" ? getOrdersListForAdmin() : getOrdersFromActiveShift(),
      );
      store.dispatch(beginEditOrder(71));
      store.dispatch(
        setOrdersValue({ orderId: 71, name: "car_number", value: "UPDATED" }),
      );
      const saving = store.dispatch(editOrder(71));
      store.dispatch(deleteActiveOrder(71));
      finish();
      await saving;
      await new Promise((resolve) => setImmediate(resolve));
      assert.equal(reads, 2);
      assert.equal(store.getState().order.loading, false);
      assert.equal(
        store.getState().order.ordersList[71].optionValues[0].value,
        "UPDATED",
      );
      store.dispatch(beginEditOrder(71));
      assert.equal(
        store.getState().order.ordersValue[71].car_number,
        "UPDATED",
      );
    }
  },
);
await check(
  "closed additional work editor refreshes its list independently of callbacks",
  async () => {
    const store = createAppStore();
    let finish;
    let saved = false;
    axios.defaults.adapter = async (config) => {
      if (config.url.endsWith("/shifts/getActive"))
        return respond(config, { id: 1, active: true });
      if (config.url.endsWith("/additionalWorks/edit"))
        return new Promise((resolve) => {
          finish = () => {
            saved = true;
            resolve(respond(config, { id: 81 }));
          };
        });
      return respond(config, [
        {
          id: 81,
          description: saved ? "UPDATED" : "ORIGINAL",
          totalValue: 100,
        },
      ]);
    };
    store.dispatch(
      listViewOpened({
        resource: "additionalWorks",
        kind: "active",
        owner: "list",
      }),
    );
    await store.dispatch(getActiveShift());
    await store.dispatch(getAdditionalWorksFromActiveShift());
    store.dispatch(beginEditAdditionalWork(81));
    const saving = store.dispatch(editAdditionalWork(81));
    store.dispatch(deleteActiveAdditionalWork(81));
    finish();
    await saving;
    await new Promise((resolve) => setImmediate(resolve));
    assert.equal(
      store.getState().additionalWorks.additionalWorksList[81].description,
      "UPDATED",
    );
    assert.equal(store.getState().additionalWorks.loading, false);
  },
);
await check(
  "null active shift clears operational data and ignores old active-list responses",
  async () => {
    const store = createAppStore();
    let finish;
    store.dispatch(
      listViewOpened({ resource: "orders", kind: "active", owner: "worker" }),
    );
    store.dispatch(
      listViewOpened({
        resource: "additionalWorks",
        kind: "active",
        owner: "worker",
      }),
    );
    axios.defaults.adapter = async (config) =>
      respond(config, { id: 1, active: true });
    await store.dispatch(getActiveShift());
    prepareDrafts(store);
    axios.defaults.adapter = (config) =>
      new Promise((resolve) => {
        finish = () => resolve(respond(config, [order("OLD SHIFT")]));
      });
    const oldRead = store.dispatch(getOrdersFromActiveShift());
    axios.defaults.adapter = async (config) => respond(config, null);
    await store.dispatch(getActiveShift());
    finish();
    await oldRead;
    assert.equal(SelectWorkerActiveShift(store.getState()), null);
    assert.deepEqual(store.getState().order.ordersList, {});
    assert.deepEqual(store.getState().order.ordersValue, {});
    assert.deepEqual(store.getState().additionalWorks.additionalWorksValue, {});
    assert.equal(store.getState().order.loading, false);
  },
);
await check(
  "historical active flags cannot select a live shift and history survives a null live result",
  async () => {
    const store = createAppStore();
    axios.defaults.adapter = async (config) =>
      respond(config, {
        currentPage: 1,
        totalRecord: 1,
        rows: [{ id: 99, active: true }],
      });
    await store.dispatch(getShiftsList());
    assert.equal(SelectWorkerActiveShift(store.getState()), null);
    axios.defaults.adapter = async (config) =>
      respond(config, { id: 1, active: true });
    await store.dispatch(getActiveShift());
    store.dispatch(
      listViewOpened({
        resource: "orders",
        kind: "shift",
        shiftId: 5,
        owner: "history",
      }),
    );
    axios.defaults.adapter = async (config) =>
      respond(config, [{ ...order("HISTORY"), shiftId: 5 }]);
    await store.dispatch(getOrderByShiftId(5));
    axios.defaults.adapter = async (config) => respond(config, null);
    await store.dispatch(getActiveShift());
    assert.equal(SelectWorkerActiveShift(store.getState()), null);
    assert.equal(store.getState().order.ordersList[71].shiftId, 5);
  },
);
await check(
  "starting a shift reloads its lists and cannot be undone by an old null response",
  async () => {
    const store = createAppStore();
    let finish;
    const calls = [];
    store.dispatch(
      listViewOpened({ resource: "orders", kind: "active", owner: "worker" }),
    );
    store.dispatch(
      listViewOpened({
        resource: "additionalWorks",
        kind: "active",
        owner: "worker",
      }),
    );
    axios.defaults.adapter = async (config) => {
      calls.push(config.url);
      if (config.url.endsWith("getActive"))
        return new Promise((resolve) => {
          finish = () => resolve(respond(config, null));
        });
      if (config.url.endsWith("createActive"))
        return respond(config, { id: 2, active: true });
      return respond(
        config,
        config.url.includes("orders/")
          ? [{ ...order("NEW SHIFT"), shiftId: 2 }]
          : [],
      );
    };
    const old = store.dispatch(getActiveShift());
    await store.dispatch(createActiveShift());
    await new Promise((resolve) => setImmediate(resolve));
    finish();
    await old;
    assert.equal(SelectWorkerActiveShift(store.getState()).id, 2);
    assert.equal(store.getState().order.ordersList[71].shiftId, 2);
    assert.equal(calls.length, 4);
  },
);
await check("failed post-save reload blocks stale editors and retry restores both resources", async () => {
  for (const works of [false, true]) {
    const store = createAppStore();
    const resource = works ? "additionalWorks" : "orders";
    store.dispatch(listViewOpened({resource, kind: "active", owner: "test"}));
    let saved = false, offline = false;
    const read = works ? getAdditionalWorksFromActiveShift : getOrdersFromActiveShift;
    const begin = works ? beginEditAdditionalWork : beginEditOrder;
    const edit = works ? editAdditionalWork : editOrder;
    const remove = works ? deleteActiveAdditionalWork : deleteActiveOrder;
    axios.defaults.adapter = async config => {
      if (config.url.endsWith("/edit")) { saved = true; offline = true; return respond(config, {id:71}); }
      if (offline) throw new Error("offline");
      return respond(config, works ? [{id:71, description: saved ? "UPDATED" : "OLD", totalValue:100}] : [order(saved ? "UPDATED" : "OLD")]);
    };
    await store.dispatch(read());
    store.dispatch(begin(71));
    assert.equal((await store.dispatch(edit(71))).meta.requestStatus, "fulfilled");
    await new Promise(resolve => setImmediate(resolve));
    const state = () => works ? store.getState().additionalWorks : store.getState().order;
    assert.ok(state().readError);
    assert.equal(state().error, "");
    store.dispatch(remove(71));
    store.dispatch(begin(71));
    assert.equal((works ? state().additionalWorksValue : state().ordersValue)[71], undefined);
    assert.equal((await store.dispatch(edit(71))).meta.requestStatus, "rejected");
    offline = false;
    store.dispatch(retryListRead(resource));
    await new Promise(resolve => setImmediate(resolve));
    assert.equal(state().readError, "");
    store.dispatch(begin(71));
    assert.equal(works ? state().additionalWorksValue[71].description : state().ordersValue[71].car_number, "UPDATED");
  }
});
await check("deleting final page refetches the last valid page including empty results", async () => {
  for (const remaining of [3, 0]) {
    const store = createAppStore();
    store.dispatch(listViewOpened({resource:"orders", kind:"admin", owner:"test"}));
    store.dispatch(setCurrentPage(2));
    let deleted = false;
    const pages = [];
    axios.defaults.adapter = async config => {
      if (config.url.endsWith("/delete")) { deleted = true; return respond(config, {id:71}); }
      const {currentPage} = JSON.parse(config.data);
      pages.push(currentPage);
      return respond(config, {currentPage, totalRecord:deleted ? remaining : 4, rows:currentPage === 2 && deleted ? [] : remaining === 0 && deleted ? [] : [order()]});
    };
    await store.dispatch(getOrdersListForAdmin());
    await store.dispatch(deleteOrder(71));
    await new Promise(resolve => setImmediate(resolve));
    assert.deepEqual(pages, [2,2,1]);
    assert.equal(store.getState().order.ordersListPagination.currentPage, 1);
    assert.equal(Object.keys(store.getState().order.ordersList).length, remaining ? 1 : 0);
  }
});
await check("composite base conditions exclude record IDs, input values and zero quantities", async () => {
  const {getBaseOptionIds} = await import("../src/entities/orderParameters/model/selectedOptions.ts");
  const parameters = [
    {name:"car_type", type:"SELECT", options:[{id:12},{id:13}]},
    {name:"numeric_input", type:"INPUT", options:[]},
    {name:"works", type:"SELECT_LIST", options:[{id:14},{id:15}]},
    {name:"composite", type:"COMPOSITE_LIST", options:[{id:30}]},
  ];
  assert.deepEqual(getBaseOptionIds({id:12, numeric_input:12, car_type:13, works:{14:0,15:2}, composite:[{optionIds:[30]}]}, parameters), [13,15]);
});
await check("price loading distinguishes initial, pending, failed and loaded empty dictionaries", async () => {
  const { getPriceList } = await import("../src/entities/price/model/slice.ts");
  const store = createAppStore();
  assert.equal(store.getState().price.loaded, false);
  let finish;
  axios.defaults.adapter = config => new Promise(resolve => { finish = () => resolve(respond(config, [])); });
  const request = store.dispatch(getPriceList());
  assert.equal(store.getState().price.pending, true);
  finish();
  await request;
  assert.equal(store.getState().price.pending, false);
  assert.equal(store.getState().price.loaded, true);
  axios.defaults.adapter = async () => { throw new Error("offline"); };
  await store.dispatch(getPriceList());
  assert.equal(store.getState().price.pending, false);
  assert.ok(store.getState().price.error);
  axios.defaults.adapter = async config => respond(config, [{mainOptionId:30,value:100,conditions:[{id:30}],discountImpact:false}]);
  await store.dispatch(getPriceList());
  assert.equal(store.getState().price.error, "");
  assert.equal(store.getState().price.priceList[0].value, 100);
  store.dispatch(logoutUser());
  assert.equal(store.getState().price.loaded, false);
});
await check("price failure and retry status disable composite actions until prices return", async () => {
  const React = await import("react");
  const { renderToStaticMarkup } = await import("react-dom/server");
  const { Provider } = await import("react-redux");
  const { PriceLoadStatus } = await import("../src/features/priceLoadStatus/PriceLoadStatus.tsx");
  const { CompositeParameterList } = await import("../src/features/editOrderForm/ui/CompositeParameterList.tsx");
  const { getPriceList } = await import("../src/entities/price/model/slice.ts");
  const store = createAppStore();
  const parameter = {id:15,name:"repair",translationRu:"Repair",type:"COMPOSITE_LIST",options:[{id:30,translationRu:"Work",optionGroup:"work"}]};
  const render = () => renderToStaticMarkup(React.createElement(Provider, {store}, React.createElement(React.Fragment, null,
    React.createElement(PriceLoadStatus), React.createElement(CompositeParameterList, {parameter, orderId:-1}))));
  assert.match(render(), /disabled=""/);
  axios.defaults.adapter = async () => { throw new Error("offline"); };
  await store.dispatch(getPriceList());
  assert.match(render(), /role="alert"/);
  assert.match(render(), /disabled=""/);
  axios.defaults.adapter = async config => respond(config, [{mainOptionId:30,value:100,conditions:[],discountImpact:false}]);
  await store.dispatch(getPriceList());
  assert.doesNotMatch(render(), /disabled=""|role="alert"/);
});
await check("in-flight creates and edits freeze order and work buffers until completion", async () => {
  for (const works of [false, true]) for (const edit of [false, true]) {
    const store = createAppStore();
    axios.defaults.adapter = async config => respond(config, works ? [{id:71,description:"ORIGINAL",totalValue:100}] : [order("ORIGINAL")]);
    if (edit) {
      await store.dispatch(works ? getAdditionalWorksFromActiveShift() : getOrdersFromActiveShift());
      store.dispatch(works ? beginEditAdditionalWork(71) : beginEditOrder(71));
    } else store.dispatch(works ? addNewActiveAdditionalWork() : addNewActiveOrder());
    const id = edit ? 71 : -1;
    const set = value => works
      ? setAdditionalWorksValue({additionalWorkId:id,name:"description",value})
      : setOrdersValue({orderId:id,name:"car_number",value});
    const values = () => works ? store.getState().additionalWorks.additionalWorksValue[id] : store.getState().order.ordersValue[id];
    store.dispatch(set("BEFORE"));
    let finish;
    axios.defaults.adapter = config => new Promise(resolve => { finish = () => resolve(respond(config, works ? {id:71,description:"BEFORE",totalValue:100} : order("BEFORE"))); });
    const operation = store.dispatch(works ? edit ? editAdditionalWork(id) : addAdditionalWork(id) : edit ? editOrder(id) : addOrder(id));
    store.dispatch(set("DURING"));
    assert.equal(works ? values().description : values().car_number, "BEFORE");
    finish();
    await operation;
    store.dispatch(set("AFTER"));
    assert.equal(works ? values().description : values().car_number, "AFTER");
  }
});
await check("operation errors remain visible outside editors and can be dismissed without retrying writes", async () => {
  const React = await import("react");
  const {renderToStaticMarkup} = await import("react-dom/server");
  const {Provider} = await import("react-redux");
  const {OperationErrors} = await import("../src/features/operationErrors/OperationErrors.tsx");
  const store = createAppStore();
  let requests = 0;
  axios.defaults.adapter = async () => { requests++; throw new Error("offline"); };
  await store.dispatch(closeActiveShift());
  await store.dispatch(deleteOrder(71));
  await store.dispatch(deleteAdditionalWork(81));
  const render = () => renderToStaticMarkup(React.createElement(Provider,{store},React.createElement(OperationErrors)));
  assert.equal((render().match(/role="alert"/g) ?? []).length, 3);
  assert.equal(requests, 3);
  store.dispatch({type:"shifts/resetError"});
  store.dispatch({type:"order/resetError"});
  store.dispatch({type:"additionalWorks/resetError"});
  assert.equal(render(), "");
  assert.equal(requests, 3);
});
await check("obsolete auth cleanup cannot release the new login or registration after logout or sync", async () => {
  for (const oldAuth of [loginUser, registerUser])
  for (const currentAuth of [loginUser, registerUser])
  for (const fails of [false, true])
  for (const sync of [false, true]) {
    storage.clear();
    const store = createAppStore();
    const finish = [];
    axios.defaults.adapter = config => new Promise((resolve, reject) => finish.push((failure = false) => failure
      ? reject(new Error("offline"))
      : resolve(respond(config, {token:"synthetic-new",id:2,name:"Current",roles:[]}))));
    const credentials = {email:"test@example.test",password:"synthetic",name:"Test"};
    const old = store.dispatch(oldAuth(credentials));
    store.dispatch(sync ? synchronizeSession() : logoutUser());
    const current = store.dispatch(currentAuth(credentials));
    assert.equal(store.getState().user.pending, true);
    finish[0](fails);
    await old;
    assert.equal(store.getState().user.pending, true);
    assert.equal(store.getState().user.token, "");
    assert.equal(store.getState().user.error, "");
    assert.equal(store.getState().user.authRedirectPending, false);
    const duplicate = await store.dispatch(oldAuth(credentials));
    assert.equal(duplicate.meta.condition, true);
    assert.equal(finish.length, 2);
    assert.equal(store.getState().user.pending, true);
    finish[1]();
    await current;
    assert.equal(store.getState().user.pending, false);
    assert.equal(store.getState().user.token, "synthetic-new");
    assert.equal(store.getState().user.authRedirectPending, true);
  }
});
await check("failed current auth releases its guard and permits a retry without competing requests", async () => {
  for (const authenticate of [loginUser, registerUser]) {
    storage.clear();
    const store = createAppStore();
    const credentials = {email:"test@example.test",password:"synthetic",name:"Test"};
    let fail;
    axios.defaults.adapter = () => new Promise((_, reject) => {fail = () => reject(new Error("offline"));});
    const current = store.dispatch(authenticate(credentials));
    const duplicate = await store.dispatch(authenticate(credentials));
    assert.equal(duplicate.meta.condition, true);
    assert.equal(store.getState().user.pending, true);
    assert.equal(store.getState().user.error, "");
    fail();
    await current;
    assert.equal(store.getState().user.pending, false);
    assert.ok(store.getState().user.error);
    axios.defaults.adapter = async config => respond(config, {token:"synthetic-retry",id:1,name:"Retry",roles:[]});
    await store.dispatch(authenticate(credentials));
    assert.equal(store.getState().user.pending, false);
    assert.equal(store.getState().user.error, "");
    assert.equal(store.getState().user.token, "synthetic-retry");
  }
});
await check("logout revokes the captured token before clearing the local session", async () => {
  const store=createAppStore();
  storage.set("user",JSON.stringify({id:1,name:"A",roles:["WORKER"],token:"synthetic-A"}));
  store.dispatch(synchronizeSession());
  let calls=0;
  axios.defaults.adapter=async config=>{
    calls++;assert.ok(config.url.endsWith("/auth/logout"));
    assert.equal(config.headers.Authorization,"Bearer synthetic-A");
    assert.equal(config.timeout,10000);
    assert.equal(store.getState().user.token,"synthetic-A");
    return respond(config,{success:true});
  };
  const result=await store.dispatch(logoutCurrentSession());
  assert.equal(result.payload.revoked,true);assert.equal(calls,1);
  assert.equal(store.getState().user.token,"");assert.equal(storage.get("user"),undefined);
  assert.equal(store.getState().user.logoutWarning,"");
});
await check("offline logout clears locally and preserves a warning across logout-page remount", async () => {
  const store=createAppStore();
  storage.set("user",JSON.stringify({id:1,name:"A",roles:["WORKER"],token:"synthetic-A"}));store.dispatch(synchronizeSession());
  axios.defaults.adapter=async()=>{throw new Error("offline")};
  const result=await store.dispatch(logoutCurrentSession());
  assert.equal(result.payload.revoked,false);assert.equal(store.getState().user.token,"");
  assert.ok(store.getState().user.logoutWarning);
  await store.dispatch(logoutCurrentSession());
  assert.ok(store.getState().user.logoutWarning);
  store.dispatch(userSlice.actions.setLogoutWarning(""));
  assert.equal(store.getState().user.logoutWarning,"");
});
await check("late logout cannot clear the next session or revoke its bearer", async () => {
  for(const fails of [false,true]) {
    const store=createAppStore();
    storage.set("user",JSON.stringify({id:1,name:"A",roles:["WORKER"],token:"synthetic-A"}));store.dispatch(synchronizeSession());
    let finish;
    axios.defaults.adapter=config=>new Promise((resolve,reject)=>{assert.equal(config.headers.Authorization,"Bearer synthetic-A");finish=()=>fails?reject(new Error("offline")):resolve(respond(config,{success:true}));});
    const old=store.dispatch(logoutCurrentSession());
    storage.set("user",JSON.stringify({id:2,name:"B",roles:["WORKER"],token:"synthetic-B"}));store.dispatch(synchronizeSession());
    finish();await old;
    assert.equal(store.getState().user.token,"synthetic-B");
    assert.equal(JSON.parse(storage.get("user")).token,"synthetic-B");
    assert.equal(store.getState().user.logoutWarning,"");
  }
});
await check("logout excludes duplicate logout and competing authentication requests", async () => {
  const store=createAppStore();
  storage.set("user",JSON.stringify({id:1,name:"A",roles:["WORKER"],token:"synthetic-A"}));store.dispatch(synchronizeSession());
  let finish,calls=0;
  axios.defaults.adapter=config=>new Promise(resolve=>{calls++;finish=()=>resolve(respond(config,{success:true}));});
  const current=store.dispatch(logoutCurrentSession());
  assert.equal(store.getState().user.logoutPending,true);
  assert.equal((await store.dispatch(logoutCurrentSession())).meta.condition,true);
  assert.equal((await store.dispatch(loginUser({email:"test@example.test",password:"synthetic"}))).meta.condition,true);
  assert.equal((await store.dispatch(registerUser({email:"test@example.test",password:"synthetic",name:"Test",companyName:"Test",confirmedPassword:"synthetic"}))).meta.condition,true);
  assert.equal(calls,1);finish();await current;
  assert.equal(store.getState().user.logoutPending,false);
});
await check("an already revoked bearer completes logout without a false network warning",async()=>{
  const store=createAppStore();
  storage.set("user",JSON.stringify({id:1,name:"A",roles:["WORKER"],token:"synthetic-A"}));store.dispatch(synchronizeSession());
  axios.defaults.adapter=async config=>{throw new axios.AxiosError("Unauthorized","ERR_BAD_REQUEST",config,undefined,{...respond(config,{}),status:401});};
  const result=await store.dispatch(logoutCurrentSession());
  assert.equal(result.payload.revoked,true);assert.equal(store.getState().user.logoutWarning,"");
  assert.equal(store.getState().user.token,"");
});
console.log(`${count} regression scenarios passed`);

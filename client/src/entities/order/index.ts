export {
  orderSlice,
  setOrdersValue,
  addOrder,
  getOrdersFromActiveShift,
  orderErrorSelect,
  activeOrdersListSelect,
  workerActiveShiftClosedOrdersListSelect,
  workerActiveShiftClosedOrdersTotalValueSelect,
  workerActiveShiftClosedOrdersTotalValueWithDiscountSelect,
  ordersListByShiftIdSelect,
  addNewActiveOrder,
  deleteActiveOrder,
  clearOrdersList,
  setCurrentPage,
  editOrder,
  deleteOrder,
  getOrderByShiftId,
  getOrdersListForAdmin,
  downloadOrdersList,
  SelectOrdersPaginationCurrentPage,
  SelectOrdersPaginationTotalPage,
  addFilter,
  removeFilter,
  SelectOrdersFiltersList,
} from "./model";

export type { OrderItem, FilterItem } from "./model";

export {
  formatVehicleName,
  formatClientType,
  formatWorkList,
  formatTotalValue,
} from "./order.formatData";

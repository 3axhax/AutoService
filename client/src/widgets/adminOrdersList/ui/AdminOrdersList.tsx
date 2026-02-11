import { useAppDispatch, useAppSelector } from "@shared/store/hooks.ts";
import { useEffect } from "react";
import {
  formatClientType,
  formatTotalValue,
  formatVehicleName,
  formatWorkList,
  getOrdersListForAdmin,
  OrderItem,
  workerActiveShiftClosedOrdersListSelect,
} from "@entities/order";
import { Table, TableData, TableDataRow } from "@shared/ui";
import { OrdersListActionButton } from "@features/ordersListActionButton";

export const AdminOrdersList = () => {
  const dispatch = useAppDispatch();
  const ordersList = useAppSelector(workerActiveShiftClosedOrdersListSelect);
  useEffect(() => {
    dispatch(getOrdersListForAdmin());
  }, [dispatch]);

  const tableData: TableData = {
    header: [
      { name: "id", label: "ID" },
      { name: "worker", label: "Сотрудник" },
      { name: "createdAt", label: "Дата создания" },
      { name: "clientType", label: "Тип клиента" },
      { name: "vehicle", label: "Автомобиль" },
      { name: "workList", label: "Работы и материалы" },
      { name: "totalValue", label: "Сумма" },
      { name: "actions", label: "" },
    ],
    rows: [] as TableDataRow[][],
  };

  if (ordersList?.length > 0) {
    tableData.rows = ordersList.map((row: OrderItem) => [
      {
        name: "id",
        data: row.id.toString(),
      },
      {
        name: "worker",
        data: row.shift ? row.shift.user.name.toString() : "",
      },
      {
        name: "createdAt",
        data: new Date(row.createdAt).toLocaleString("ru-RU"),
      },
      {
        name: "clientType",
        data: formatClientType(row),
      },
      {
        name: "vehicle",
        data: formatVehicleName(row),
      },
      {
        name: "workList",
        data: formatWorkList(row),
      },
      {
        name: "totalValue",
        data: formatTotalValue(row),
      },
      {
        name: "action",
        data: (
          <OrdersListActionButton
            orderId={row.id}
            onReload={() => dispatch(getOrdersListForAdmin())}
          />
        ),
      },
    ]);
  }

  return <Table tableData={tableData} className={"overflow-hidden w-full"} />;
};

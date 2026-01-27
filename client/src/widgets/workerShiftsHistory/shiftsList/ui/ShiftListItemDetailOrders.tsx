import { useAppDispatch, useAppSelector } from "@shared/store/hooks.ts";
import { useEffect } from "react";
import {
  formatClientType,
  formatVehicleName,
  formatWorkList,
  getOrderByShiftId,
  ordersListByShiftIdSelect,
} from "@entities/order";
import { Table, TableData, TableDataRow } from "@shared/ui";

export const ShiftListItemDetailOrders = ({ id }: { id: number }) => {
  const dispatch = useAppDispatch();

  const ordersList = useAppSelector((state) =>
    ordersListByShiftIdSelect(state, id),
  );

  useEffect(() => {
    dispatch(getOrderByShiftId(id));
  }, [id, dispatch]);

  const tableData: TableData = {
    header: [
      { name: "id", label: "ID" },
      { name: "createdAt", label: "Дата создания" },
      { name: "clientType", label: "Тип клиента" },
      { name: "vehicle", label: "Автомобиль" },
      { name: "workList", label: "Работы и материалы" },
      { name: "totalValue", label: "Сумма" },
    ],
    rows: [] as TableDataRow[][],
  };

  if (ordersList?.length > 0) {
    tableData.rows = ordersList.map((row) => [
      { name: "id", data: row.id.toString() },
      {
        name: "createdAt",
        data: new Date(row.createdAt).toLocaleString("ru-RU"),
      },
      { name: "clientType", data: formatClientType(row) },
      { name: "vehicle", data: formatVehicleName(row) },
      { name: "workList", data: formatWorkList(row) },
      { name: "totalValue", data: `${row.totalValue.toString()} ₽` },
    ]);
  }

  return (
    <div>
      <h3
        className={
          "text-xl mb-1 lg:mb-1 text-gray-700 text-left lg:text-center"
        }
      >
        Список заказов
      </h3>
      <Table tableData={tableData} className={"w-full max-w-full"} />
    </div>
  );
};

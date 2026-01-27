import { useAppSelector } from "@shared/store/hooks.ts";
import { Table, TableData, TableDataRow } from "@shared/ui";
import {
  formatClientType,
  formatVehicleName,
  formatWorkList,
  workerActiveShiftClosedOrdersListSelect,
  workerActiveShiftClosedOrdersTotalValueSelect,
} from "@entities/order";
import { OrdersListActionButton } from "./OrdersListActionButton";

export const ClosedOrdersList = () => {
  const ordersList = useAppSelector(workerActiveShiftClosedOrdersListSelect);
  const shiftTotalValue = useAppSelector(
    workerActiveShiftClosedOrdersTotalValueSelect,
  );

  const tableData: TableData = {
    header: [
      { name: "id", label: "ID" },
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
      { name: "action", data: <OrdersListActionButton orderId={row.id} /> },
    ]);
  }

  return (
    <>
      {ordersList.length > 0 ? (
        <div className={"colored w-full"}>
          <div className={"container mx-auto px-4 lg:px-8"}>
            <h3
              className={
                "text-2xl mb-3 lg:mb-6 text-gray-700 text-left lg:text-center"
              }
            >
              Список выполненных заказов
            </h3>
            <Table tableData={tableData} className={"w-full max-w-full"} />
            <div
              className={
                "mt-5 lg:mt-10 text-base/5 flex w-fit items-baseline rounded-lg px-3 py-1.5 lg:py-1 border-1 border-stone-400 bg-beige ml-auto"
              }
            >
              Итоговая сумма по заказам:&nbsp;
              <span className={"font-medium text-xl"}>
                {shiftTotalValue}&nbsp;₽
              </span>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
};

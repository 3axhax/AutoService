import { useAppSelector } from "@shared/store/hooks.ts";
import { Table, TableData, TableDataRow } from "@shared/ui";
import {
  workerActiveShiftClosedOrdersListSelect,
  workerActiveShiftClosedOrdersTotalValueSelect,
} from "@entities/order";
import { OrdersListActionButton } from "./OrdersListActionButton";
import {
  formatClientType,
  formatVehicleName,
  formatWorkList,
} from "./ClosedOrdersList.utils";

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
      { name: "id", data: row.id.toString(), label: "ID" },
      {
        name: "createdAt",
        data: new Date(row.createdAt).toLocaleString("ru-RU"),
        label: "Дата создания",
      },
      { name: "clientType", data: formatClientType(row), label: "Тип клиента" },
      { name: "vehicle", data: formatVehicleName(row), label: "Автомобиль" },
      { name: "workList", data: formatWorkList(row), label: "Работы и материалы", className: "col-span-3 lg:col-span-1" },
      { name: "totalValue", data: `${row.totalValue.toString()} ₽`, label: "Сумма", className: "col-start-2 row-start-2 lg:row-start-1 lg:col-start-6" },
      { name: "action", data: <OrdersListActionButton orderId={row.id} />, label: "Кнопки", className: "col-start-3 row-start-2 lg:row-start-1 lg:col-start-7" },
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
            <Table tableData={tableData} className={"w-full max-w-full grid-cols-3 lg:grid-cols-7 [grid-template-areas:'id_createdAt_action''clientType_vehicle_totalValue''workList_workList_workList'] lg:grid-rows-1 lg:[grid-template-areas:'id_createdAt_clientType_vehicle_workList_totalValue_action']"} />
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

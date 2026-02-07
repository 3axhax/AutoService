import { useAppSelector } from "@shared/store/hooks.ts";
import { Table, TableData, TableDataRow } from "@shared/ui";
import {
  formatClientType,
  formatTotalValue,
  formatVehicleName,
  formatWorkList,
  workerActiveShiftClosedOrdersListSelect,
  workerActiveShiftClosedOrdersTotalValueSelect,
  workerActiveShiftClosedOrdersTotalValueWithDiscountSelect,
} from "@entities/order";
import { OrdersListActionButton } from "./OrdersListActionButton";

export const ClosedOrdersList = () => {
  const ordersList = useAppSelector(workerActiveShiftClosedOrdersListSelect);
  const shiftTotalValue = useAppSelector(
    workerActiveShiftClosedOrdersTotalValueSelect,
  );
  const shiftTotalValueWithDiscount = useAppSelector(
    workerActiveShiftClosedOrdersTotalValueWithDiscountSelect,
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
      {
        name: "id",
        data: row.id.toString(),
        label: "Заказ номер:",
      },
      {
        name: "createdAt",
        data: new Date(row.createdAt).toLocaleString("ru-RU"),
        label: "Дата создания:",
      },
      {
        name: "clientType",
        data: formatClientType(row),
        label: "Тип клиента:",
      },
      {
        name: "vehicle",
        data: formatVehicleName(row),
        label: "Автомобиль:",
      },
      {
        name: "workList",
        data: formatWorkList(row),
        label: "Работы:",
      },
      {
        name: "totalValue",
        data: formatTotalValue(row),
        label: "Сумма",
      },
      {
        name: "action",
        data: <OrdersListActionButton orderId={row.id} />,
      },
    ]);
  }

  return (
    <>
      {ordersList.length > 0 ? (
        <div className={"colored w-full"}>
          <div className={"container mx-auto px-4 lg:px-8"}>
            <h3
              className={
                "text-2xl mb-3 lg:mb-6 text-gray-700 dark:text-gray-50 text-left lg:text-center"
              }
            >
              Список выполненных заказов
            </h3>
            <Table tableData={tableData} className={"overflow-hidden w-full"} />
            <div
              className={
                "mt-5 lg:mt-10 text-base/5 flex w-fit items-baseline rounded-lg px-3 py-1.5 lg:py-1 border-1 border-stone-400 bg-beige ml-auto"
              }
            >
              Итоговая сумма по заказам:&nbsp;
              <span className={"font-medium text-xl"}>
                {shiftTotalValueWithDiscount}&nbsp;₽
              </span>
              {shiftTotalValueWithDiscount !== shiftTotalValue ? (
                <span className={"ml-2 text-sm"}>
                  (без скидки {shiftTotalValue} ₽)
                </span>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
};

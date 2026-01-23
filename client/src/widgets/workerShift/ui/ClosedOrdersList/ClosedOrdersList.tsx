import { useAppSelector } from "@shared/store/hooks.ts";
import { Table, TableData, TableDataRow } from "@shared/ui";
import {
  workerActiveShiftClosedOrdersListSelect,
  workerActiveShiftClosedOrdersTotalValueSelect,
  OrderItem,
} from "@entities/order";
import { OrdersListActionButton } from "@widgets/workerShift/ui/ClosedOrdersList/OrdersListActionButton.tsx";

export const ClosedOrdersList = () => {
  const ordersList = useAppSelector(workerActiveShiftClosedOrdersListSelect);
  const shiftTotalValue = useAppSelector(
    workerActiveShiftClosedOrdersTotalValueSelect,
  );

  const formatVehicleName = (order: OrderItem) => {
    const car_number = order.optionValues.find(
      (value) => value.parameter.name === "car_number",
    );
    const car_make = order.optionValues.find(
      (value) => value.parameter.name === "car_make",
    );
    const car_make_name =
      car_make && car_make.option ? car_make.option.translationRu : null;
    return `${car_make_name ? car_make_name : ""}${car_make_name ? " " : ""}${car_number?.value ?? ""}`;
  };

  const tableData: TableData = {
    header: [
      { name: "id", label: "ID" },
      { name: "createdAt", label: "Дата создания" },
      { name: "vehicle", label: "Автомобиль" },
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
      { name: "vehicle", data: formatVehicleName(row) },
      { name: "totalValue", data: `${row.totalValue.toString()} ₽` },
      { name: "action", data: <OrdersListActionButton orderId={row.id} /> },
    ]);
  }

  return (
    <>
      {ordersList.length > 0 ? (
        <>
          <Table tableData={tableData} className={"w-full mt-6"} />
          <div className={"text-end text-base mt-2"}>
            Итого по заказам:{" "}
            <span className={"font-medium text-xl"}>{shiftTotalValue} ₽</span>
          </div>
        </>
      ) : null}
    </>
  );
};

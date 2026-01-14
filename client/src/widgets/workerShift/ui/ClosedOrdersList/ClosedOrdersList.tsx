import { useAppSelector } from "@shared/store/hooks.ts";
import { Table, TableData, TableDataRow } from "@shared/ui";
import {
  workerActiveShiftClosedOrdersListSelect,
  workerActiveShiftClosedOrdersTotalValueSelect,
} from "@entities/order";
import { OrdersListActionButton } from "@widgets/workerShift/ui/ClosedOrdersList/OrdersListActionButton.tsx";

export const ClosedOrdersList = () => {
  const ordersList = useAppSelector(workerActiveShiftClosedOrdersListSelect);
  const shiftTotalValue = useAppSelector(
    workerActiveShiftClosedOrdersTotalValueSelect,
  );
  const tableData: TableData = {
    header: [
      { name: "id", label: "ID" },
      { name: "createdAt", label: "Дата создания" },
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
      { name: "totalValue", data: `${row.totalValue.toString()} ₽` },
      { name: "action", data: <OrdersListActionButton orderId={row.id} /> },
    ]);
  }

  return (
    <>
      {ordersList.length > 0 ? (
        <>
          <Table tableData={tableData} className={"w-[100%] mt-3"} />
          <div className={"text-end text-xl mt-2"}>
            Итого по заказам: {shiftTotalValue} ₽
          </div>
        </>
      ) : null}
    </>
  );
};

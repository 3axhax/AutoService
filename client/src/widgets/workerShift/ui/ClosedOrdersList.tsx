import { useAppSelector } from "@shared/store/hooks.ts";
import {
  SelectWorkerActiveShiftClosedOrdersList,
  SelectWorkerActiveShiftClosedOrdersTotalValue,
} from "@entities/shifts";
import { Table, TableData, TableDataRow } from "@shared/ui";

export const ClosedOrdersList = () => {
  const ordersList = useAppSelector(SelectWorkerActiveShiftClosedOrdersList);
  const shiftTotalValue = useAppSelector(
    SelectWorkerActiveShiftClosedOrdersTotalValue,
  );
  const tableData: TableData = {
    header: [
      { name: "id", label: "ID" },
      { name: "createdAt", label: "Дата создания" },
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
      { name: "totalValue", data: row.totalValue.toString() },
    ]);
  }

  return (
    <>
      {ordersList.length > 0 ? (
        <>
          <Table tableData={tableData} className={"w-[100%] mt-3"} />
          <div className={"text-end text-xl mt-2"}>
            Итого: {shiftTotalValue}
          </div>
        </>
      ) : null}
    </>
  );
};

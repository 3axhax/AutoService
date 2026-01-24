import { useAppSelector } from "@shared/store/hooks.ts";
import { SelectShiftListSortByCreated } from "@entities/shifts";
import { Table, TableData, TableDataRow } from "@shared/ui";

export const ShiftsList = () => {
  const shiftsList = useAppSelector(SelectShiftListSortByCreated);
  const tableData: TableData = {
    header: [
      { name: "id", label: "ID" },
      { name: "createdAt", label: "Начало смены" },
      { name: "closedAt", label: "Окончание смены" },
      { name: "totalValue", label: "Сумма" },
    ],
    rows: [] as TableDataRow[][],
  };

  if (shiftsList?.length > 0) {
    tableData.rows = shiftsList.map((row) => [
      { name: "id", data: row.id.toString() },
      {
        name: "createdAt",
        data: new Date(row.createdAt).toLocaleString("ru-RU"),
      },
      {
        name: "closedAt",
        data: row.closedAt ? (
          new Date(row.createdAt).toLocaleString("ru-RU")
        ) : (
          <span className={"text-green-600"}>Смена не закрыта</span>
        ),
      },
      {
        name: "totalValue",
        data: `${row.totalOrdersSum ? row.totalOrdersSum.toString() : "0"} ₽`,
      },
    ]);
  }

  return <Table tableData={tableData} className={"w-full max-w-full"} />;
};

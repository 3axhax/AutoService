import { useAppSelector } from "@shared/store/hooks.ts";
import { Table, TableData, TableDataRow } from "@shared/ui";
import {
  workerActiveShiftClosedAdditionalWorksListSelect,
  workerActiveShiftClosedAdditionalWorksTotalValueSelect,
} from "@entities/additionalWorks";

export const ClosedAdditionalWorksList = () => {
  const additionalWorksList = useAppSelector(
    workerActiveShiftClosedAdditionalWorksListSelect,
  );
  const shiftTotalValue = useAppSelector(
    workerActiveShiftClosedAdditionalWorksTotalValueSelect,
  );
  const tableData: TableData = {
    header: [
      { name: "id", label: "ID" },
      { name: "createdAt", label: "Дата создания" },
      { name: "description", label: "Описание" },
      { name: "totalValue", label: "Сумма" },
    ],
    rows: [] as TableDataRow[][],
  };

  if (additionalWorksList?.length > 0) {
    tableData.rows = additionalWorksList.map((row) => [
      { name: "id", data: row.id.toString() },
      {
        name: "createdAt",
        data: new Date(row.createdAt).toLocaleString("ru-RU"),
      },
      {
        name: "description",
        data: row.description,
      },
      {
        name: "totalValue",
        data: `${row.totalValue ? row.totalValue.toString() : "0"} ₽`,
      },
    ]);
  }

  return (
    <>
      {additionalWorksList.length > 0 ? (
        <>
          <Table tableData={tableData} className={"w-[100%] mt-3"} />
          <div className={"text-end text-xl mt-2"}>
            Итого по дополнительным работам: {shiftTotalValue} ₽
          </div>
        </>
      ) : null}
    </>
  );
};

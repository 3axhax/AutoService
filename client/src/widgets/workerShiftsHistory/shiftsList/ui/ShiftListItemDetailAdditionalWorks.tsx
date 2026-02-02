import { useAppDispatch, useAppSelector } from "@shared/store/hooks.ts";
import { useEffect } from "react";
import { Table, TableData, TableDataRow } from "@shared/ui";
import { getAdditionalWorksByShiftId } from "@entities/additionalWorks";
import { additionalWorksListByShiftIdSelect } from "@entities/additionalWorks/model/selectors.ts";

export const ShiftListItemDetailAdditionalWorks = ({ id }: { id: number }) => {
  const dispatch = useAppDispatch();

  const additionalWorksList = useAppSelector((state) =>
    additionalWorksListByShiftIdSelect(state, id),
  );

  useEffect(() => {
    dispatch(getAdditionalWorksByShiftId(id));
  }, [id, dispatch]);

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
    <div>
      <h3
        className={
          "text-xl mb-1 lg:mb-2 text-gray-700 dark:text-white text-left lg:text-center"
        }
      >
        Список дополнительных работ
      </h3>
      <Table tableData={tableData} className={"w-full max-w-full"} />
    </div>
  );
};

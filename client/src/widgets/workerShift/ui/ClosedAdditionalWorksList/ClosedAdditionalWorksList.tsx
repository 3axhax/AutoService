import { useAppSelector } from "@shared/store/hooks.ts";
import { Table, TableData, TableDataRow } from "@shared/ui";
import {
  workerActiveShiftClosedAdditionalWorksListSelect,
  workerActiveShiftClosedAdditionalWorksTotalValueSelect,
} from "@entities/additionalWorks";
import { AdditionalWorksListActionButton } from "./AdditionalWorksListActionButton";

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
      { name: "actions", label: "" },
    ],
    rows: [] as TableDataRow[][],
  };

  if (additionalWorksList?.length > 0) {
    tableData.rows = additionalWorksList.map((row) => [
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
        name: "description",
        data: row.description,
        label: "Описание:",
      },
      {
        name: "totalValue",
        data: `${row.totalValue ? row.totalValue.toString() : "0"} ₽`,
        label: "Сумма",
      },
      {
        name: "action",
        data: <AdditionalWorksListActionButton workId={row.id} />,
      },
    ]);
  }

  return (
    <>
      {additionalWorksList.length > 0 ? (
        <div className={"colored w-full"}>
          <div className={"container mx-auto px-4 lg:px-8"}>
            <h3
              className={
                "text-2xl mb-3 lg:mb-6 text-gray-700 dark:text-gray-50 text-left lg:text-center"
              }
            >
              Список <span className={"hidden lg:inline"}>дополнительныx</span>
              <span className={"inline lg:hidden"}>доп.</span> работ
            </h3>
            <Table tableData={tableData} className={"overflow-hidden w-full"} />
            <div
              className={
                "mt-5 lg:mt-10 text-base/5 flex w-fit items-baseline rounded-lg px-3 py-1.5 lg:py-1 border-1 border-stone-400 bg-beige ml-auto"
              }
            >
              Итого по&nbsp;
              <span className={"hidden lg:inline"}>дополнительным&nbsp;</span>
              <span className={"inline lg:hidden"}>доп.</span> работам:&nbsp;
              <span className={"font-medium text-xl"}>{shiftTotalValue} ₽</span>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
};

import { JSX } from "react";

export type TableDataRow = {
  name: string;
  data: string | JSX.Element;
  label?: string | JSX.Element;
  className?: string;
};

export interface TableData {
  header: { name: string; label: string | JSX.Element; className?: string }[];
  rows: TableDataRow[][];
}

interface TableProps {
  tableData: TableData;
  className?: string;
}

export const Table = ({ tableData, className }: TableProps) => {
  return (
    <>
      <div
        className={`hidden lg:flex rounded-t-lg shadow-sm bg-blue-dark text-white border border-blue-900${className ? ` ${className}` : ""}`}
      >
        {tableData.header.map((th) => (
          <div
            key={th.name}
            className={`flex-1 border-r border-blue-200 last:border-0 px-4 py-3 text-center text-sm font-medium${th.className ? ` ${th.className}` : ``}`}
          >
            {th.label}
          </div>
        ))}
      </div>

      {tableData.rows.length > 0 ? (
        tableData.rows.map((row: TableDataRow[], index: number) => (
          <div
            key={index}
            className={`relative flex flex-col lg:flex-row last:mt-4 lg:last:mt-0 lg:mb-0 rounded-lg lg:rounded-none border-1 lg:border-t-0 border-blue-900 bg-white dark:bg-gray-950 hover:bg-blue-light lg:odd:bg-stone-200/50 dark:lg:odd:bg-gray-950/50 ${index === tableData.rows.length - 1 ? ` lg:rounded-b-lg` : ""} ${className ? ` ${className}` : ""}`}
          >
            {row.map((cell: TableDataRow) => (
              <div
                key={cell.name}
                className={`flex-1 text-left lg:text-center first:bg-stone-200/50 lg:first:bg-transparent first:font-normal border-t-1 lg:border-t-0 first:border-t-0 border-stone-400 px-3 py-1 lg:py-2 text-lg lg:text-base text-gray-900 dark:text-white lg:border-r-1 last:border-r-0 lg:border-blue-900 ${cell.className ? ` ${cell.className}` : ``} ${cell.name === "action" ? `absolute lg:relative top-0 right-0 !border-t-0` : ""}`}
              >
                {cell.label ? (
                  <span
                    className={`inline-flex lg:hidden w-2/5 self-start text-base/7 ml-0`}
                  >
                    {cell.label}
                  </span>
                ) : (
                  ""
                )}
                {cell.data}
              </div>
            ))}
          </div>
        ))
      ) : (
        <div
          className={
            "px-3 py-2 text-lg lg:text-base text-blue-950 text-center font-normal mb-4 lg:mb-0 rounded-lg lg:rounded-none lg:rounded-b-lg border-1 lg:border-t-0 border-blue-900 bg-white"
          }
        >
          Нет записей
        </div>
      )}
    </>
  );
};

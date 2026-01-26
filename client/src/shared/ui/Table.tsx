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
    <div className="w-full overflow-x-auto">
      <div
        className={`hidden lg:grid rounded-t-lg shadow-sm bg-blue-dark text-white border border-blue-900${className ? ` ${className}` : ""}`}
      >
        {tableData.header.map((th) => (
          <div
            key={th.name}
            className={`border-r border-blue-200 last:border-0 px-4 py-3 text-center text-sm font-medium${th.className ? ` ${th.className}` : ``}`}
          >
            {th.label}
          </div>
        ))}
      </div>

      {tableData.rows.length > 0 ? (
        tableData.rows.map((row: TableDataRow[], index: number) => (
          <div
            key={index}
            className={`grid mb-4 lg:mb-0 rounded-lg lg:rounded-none border-1 bg-white border-blue-900 hover:bg-blue-light even:bg-stone-200/25 last:rounded-b-lg ${className ? ` ${className}` : ""}`}
          >
            {row.map((cell: TableDataRow) => (
              <div
                key={cell.name}
                className={`px-3 py-1 lg:py-2 text-lg lg:text-base text-gray-900 border-blue-900 [grid-area:${cell.name}] ${cell.className ? ` ${cell.className}` : ``}`}
              >
                <span className={`inline-flex lg:hidden w-2/5 text-base/7`}>
                  {cell.label}
                </span>
                {cell.data}
              </div>
            ))}
          </div>
        ))
      ) : (
        <div>Нет записей</div>
      )}
    </div>
  );
};

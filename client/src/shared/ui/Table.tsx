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
                      className={`grid border-1 border-t-0 bg-white border-blue-900 hover:bg-blue-light even:bg-stone-200/25 last:rounded-b-lg ${className ? ` ${className}` : ""}`}
                  >
                    {row.map((cell: TableDataRow, cellIndex: number) => (
                        <div
                            key={cell.name}
                            className={`lg:px-3 lg:py-2 text-base text-gray-900 [grid-area:${cell.name}]${cellIndex + 1 < Object.keys(row).length ? ` border-r border-blue-900` : ``}${cell.className ? ` ${cell.className}` : ``}`}
                        >
                           <span className={'block bg-blue-dark text-white lg:hidden'}>{cell.label}</span>
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

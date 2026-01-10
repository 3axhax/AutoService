import { JSX } from "react";

export type TableDataRow = {
  name: string;
  data: string | JSX.Element;
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
    <table
      className={`m-auto border border-gray-300${className ? ` ${className}` : ""}`}
    >
      <thead>
        <tr className="bg-gray-800 text-white">
          {tableData.header.map((th) => (
            <th
              key={th.name}
              className={`border-r border-gray-600 px-4 py-3 text-center text-sm font-medium${th.className ? ` ${th.className}` : ``}`}
            >
              {th.label}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {tableData.rows.length > 0 ? (
          tableData.rows.map((row: TableDataRow[], index: number) => (
            <tr
              key={index}
              className="border-t border-gray-300 hover:bg-gray-50"
            >
              {row.map((cell: TableDataRow, cellIndex: number) => (
                <td
                  key={cell.name}
                  className={`px-4 py-3 text-sm text-gray-900${cellIndex + 1 < Object.keys(row).length ? ` border-r border-gray-300` : ``}${cell.className ? ` ${cell.className}` : ``}`}
                >
                  {cell.data}
                </td>
              ))}
            </tr>
          ))
        ) : (
          <tr>
            <td colSpan={tableData.header.length}>Нет записей</td>
          </tr>
        )}
      </tbody>
    </table>
  );
};

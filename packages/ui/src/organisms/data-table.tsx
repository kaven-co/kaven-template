import * as React from 'react';
import { Typography } from '../atoms/typography';

export interface DataTableColumn<T> {
  key: keyof T;
  label: string;
}

export interface DataTableProps<T extends Record<string, unknown>> {
  columns: DataTableColumn<T>[];
  rows: T[];
}

export function DataTable<T extends Record<string, unknown>>({ columns, rows }: DataTableProps<T>) {
  return (
    <div className="overflow-x-auto rounded-lg border border-[#E5E5E5] bg-white">
      <table className="min-w-full divide-y divide-[#E5E5E5]">
        <thead className="bg-[#F9F9F9]">
          <tr>
            {columns.map((column) => (
              <th key={String(column.key)} className="px-4 py-3 text-left text-xs font-semibold uppercase text-[#4A4A4A]">{column.label}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-[#E5E5E5]">
          {rows.map((row, index) => (
            <tr key={index}>
              {columns.map((column) => (
                <td key={String(column.key)} className="px-4 py-3">
                  <Typography variant="body-sm" className="text-[#2A2A2A]">{String(row[column.key] ?? '')}</Typography>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// OWNER: FE-1
// PURPOSE: Server-side paginated data table with loading skeleton, filters reactivity, and row selection
// USAGE: <DataTable<T> columns={columns} fetcher={fetchData} filters={{ search, status }} onRowClick={handleRow} />

'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { Paginated } from '../../types';
import { Spinner } from '../ui/Spinner';

export interface Column<T> {
  header: string;
  accessor: keyof T | ((row: T) => React.ReactNode);
  className?: string;
}

export interface DataTableProps<T> {
  columns: Column<T>[];
  fetcher: (params: { page: number; limit: number; [key: string]: any }) => Promise<Paginated<T>>;
  filters?: Record<string, any>;
  pageSize?: number;
  onRowClick?: (row: T) => void;
  emptyMessage?: string;
  className?: string;
}

export function DataTable<T extends { id?: string | number }>({
  columns,
  fetcher,
  filters = {},
  pageSize = 10,
  onRowClick,
  emptyMessage = 'No records found.',
  className = '',
}: DataTableProps<T>) {
  const [data, setData] = useState<T[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetcher({
        page,
        limit: pageSize,
        ...filters,
      });
      setData(res.items || []);
      setTotal(res.total || 0);
      setTotalPages(res.totalPages || Math.ceil((res.total || 0) / pageSize) || 1);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  }, [fetcher, page, pageSize, JSON.stringify(filters)]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setPage(1);
  }, [JSON.stringify(filters)]);

  return (
    <div className={`w-full bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden ${className}`}>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
          <thead className="bg-slate-50 text-slate-500 font-medium">
            <tr>
              {columns.map((col, idx) => (
                <th key={idx} scope="col" className={`px-6 py-3 text-xs tracking-wider uppercase ${col.className || ''}`}>
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 bg-white">
            {loading && data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-6 py-12 text-center text-slate-400">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Spinner size="md" />
                    <span className="text-xs">Loading records...</span>
                  </div>
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan={columns.length} className="px-6 py-8 text-center text-red-500 text-xs">
                  {error}
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-6 py-12 text-center text-slate-400 text-xs">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((row, rowIdx) => (
                <tr
                  key={row.id || rowIdx}
                  onClick={() => onRowClick && onRowClick(row)}
                  className={`transition-colors ${
                    onRowClick ? 'cursor-pointer hover:bg-slate-50/80' : ''
                  }`}
                >
                  {columns.map((col, colIdx) => (
                    <td key={colIdx} className={`px-6 py-4 whitespace-nowrap text-slate-700 ${col.className || ''}`}>
                      {typeof col.accessor === 'function'
                        ? col.accessor(row)
                        : (row[col.accessor] as any)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="flex items-center justify-between px-6 py-3 bg-slate-50/50 border-t border-slate-200 text-xs text-slate-500">
        <div>
          Showing {data.length > 0 ? (page - 1) * pageSize + 1 : 0} to{' '}
          {Math.min(page * pageSize, total)} of {total} records
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1 || loading}
            className="px-2.5 py-1 rounded border border-slate-300 bg-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors"
          >
            Previous
          </button>
          <span>
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages || loading}
            className="px-2.5 py-1 rounded border border-slate-300 bg-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}

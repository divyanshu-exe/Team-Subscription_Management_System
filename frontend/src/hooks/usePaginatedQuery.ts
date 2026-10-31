// OWNER: FE-1
// PURPOSE: Hook managing server-side pagination, params reactivity, and refetching

'use client';

import { useState, useEffect, useCallback } from 'react';
import { Paginated } from '../types';

export function usePaginatedQuery<T>(
  fetcher: (params: { page: number; limit: number; [key: string]: any }) => Promise<Paginated<T>>,
  initialParams: Record<string, any> = {},
  pageSize: number = 10
) {
  const [items, setItems] = useState<T[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetcher({
        page,
        limit: pageSize,
        ...initialParams,
      });
      setItems(res.items || []);
      setTotal(res.total || 0);
      setTotalPages(res.totalPages || Math.ceil((res.total || 0) / pageSize) || 1);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch items');
    } finally {
      setLoading(false);
    }
  }, [fetcher, page, pageSize, JSON.stringify(initialParams)]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    items,
    total,
    page,
    totalPages,
    setPage,
    loading,
    error,
    refetch: fetchData,
  };
}

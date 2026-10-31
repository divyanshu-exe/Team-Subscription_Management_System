// OWNER: FE-1
// PURPOSE: Search & filter bar with 400ms debounced text input, status selector, and clear action

'use client';

import React, { useState, useEffect } from 'react';

export interface FilterOption {
  label: string;
  value: string;
}

export interface FiltersBarProps {
  onFilterChange: (filters: Record<string, any>) => void;
  statusOptions?: FilterOption[];
  showDateRange?: boolean;
  searchPlaceholder?: string;
}

export const FiltersBar: React.FC<FiltersBarProps> = ({
  onFilterChange,
  statusOptions = [],
  showDateRange = false,
  searchPlaceholder = 'Search records...',
}) => {
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [status, setStatus] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');

  // 400ms debounce for search query
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 400);
    return () => clearTimeout(handler);
  }, [search]);

  // Emit filter changes
  useEffect(() => {
    const filters: Record<string, any> = {};
    if (debouncedSearch) filters.search = debouncedSearch;
    if (status) filters.status = status;
    if (from) filters.from = from;
    if (to) filters.to = to;
    onFilterChange(filters);
  }, [debouncedSearch, status, from, to, onFilterChange]);

  const handleClear = () => {
    setSearch('');
    setDebouncedSearch('');
    setStatus('');
    setFrom('');
    setTo('');
  };

  const hasActiveFilters = Boolean(search || status || from || to);

  return (
    <div className="flex flex-wrap items-center gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-sm text-sm">
      <div className="flex-1 min-w-[200px]">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={searchPlaceholder}
          className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500"
        />
      </div>

      {statusOptions.length > 0 && (
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="px-3 py-1.5 border border-slate-300 rounded-lg text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500"
        >
          <option value="">All Statuses</option>
          {statusOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      )}

      {showDateRange && (
        <div className="flex items-center gap-2">
          <input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="px-2 py-1.5 border border-slate-300 rounded-lg text-xs text-slate-700 bg-white"
          />
          <span className="text-slate-400 text-xs">&rarr;</span>
          <input
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="px-2 py-1.5 border border-slate-300 rounded-lg text-xs text-slate-700 bg-white"
          />
        </div>
      )}

      {hasActiveFilters && (
        <button
          onClick={handleClear}
          className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
        >
          Clear
        </button>
      )}
    </div>
  );
};

// OWNER: FE-2
// PURPOSE: Subscriptions list view with status filter, customer filter, search, and server-side pagination

'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { listSubscriptions } from '../../../services/subscriptions.service';
import { Subscription } from '../../../types';
import { DataTable, Column } from '../../../components/tables/DataTable';
import { FiltersBar } from '../../../components/tables/FiltersBar';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { formatDate } from '../../../lib/format';

export default function SubscriptionsPage() {
  const router = useRouter();
  const [filters, setFilters] = useState<Record<string, any>>({});

  const columns: Column<Subscription>[] = [
    {
      header: 'Subscription #',
      accessor: (s) => <span className="font-bold text-indigo-600">{s.number}</span>,
    },
    {
      header: 'Customer',
      accessor: (s) => (
        <div>
          <span className="font-semibold text-slate-900">{s.customer?.name}</span>
          <p className="text-xs text-slate-400">{s.customer?.email}</p>
        </div>
      ),
    },
    {
      header: 'Plan',
      accessor: (s) => (
        <div>
          <span className="font-medium text-slate-800">{s.plan?.name}</span>
          <span className="text-xs text-slate-400 block">{s.plan?.period}</span>
        </div>
      ),
    },
    {
      header: 'Status',
      accessor: (s) => (
        <div className="flex items-center gap-1.5">
          <Badge status={s.status} label={s.status} size="sm" />
          {s.isPaused && (
            <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded">
              PAUSED
            </span>
          )}
        </div>
      ),
    },
    {
      header: 'Period Dates',
      accessor: (s) => (
        <span className="text-xs text-slate-600">
          {formatDate(s.startDate)} &rarr; {formatDate(s.expiryDate)}
        </span>
      ),
    },
    {
      header: 'Next Billing',
      accessor: (s) => (
        <span className="text-xs font-medium text-slate-700">
          {s.nextInvoiceDate ? formatDate(s.nextInvoiceDate) : '—'}
        </span>
      ),
    },
    {
      header: 'Actions',
      accessor: (s) => (
        <Link
          href={`/subscriptions/${s.id}`}
          onClick={(e) => e.stopPropagation()}
          className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
        >
          View &rarr;
        </Link>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Subscriptions</h1>
          <p className="text-sm text-slate-500">Track and manage customer recurring contracts and billing lifecycles</p>
        </div>

        <Link href="/subscriptions/new">
          <Button variant="primary">+ New Subscription</Button>
        </Link>
      </div>

      <FiltersBar
        searchPlaceholder="Search by number or customer name..."
        onFilterChange={setFilters}
        statusOptions={[
          { value: 'DRAFT', label: 'Draft' },
          { value: 'QUOTATION', label: 'Quotation' },
          { value: 'CONFIRMED', label: 'Confirmed' },
          { value: 'ACTIVE', label: 'Active' },
          { value: 'CLOSED', label: 'Closed' },
        ]}
      />

      <DataTable<Subscription>
        columns={columns}
        fetcher={listSubscriptions}
        filters={filters}
        pageSize={15}
        onRowClick={(s) => router.push(`/subscriptions/${s.id}`)}
      />
    </div>
  );
}

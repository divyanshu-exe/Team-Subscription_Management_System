// OWNER: FE-2
// PURPOSE: Invoices list page with status tabs, customer filter, overdue highlighting, and server pagination

'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { listInvoices } from '../../../services/invoices.service';
import { Invoice } from '../../../types';
import { DataTable, Column } from '../../../components/tables/DataTable';
import { formatMoney, formatDate } from '../../../lib/format';
import { Badge } from '../../../components/ui/Badge';

export default function InvoicesPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'ALL' | 'DRAFT' | 'CONFIRMED' | 'PAID' | 'OVERDUE'>('ALL');
  const [search, setSearch] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');

  const todayTime = new Date().setHours(0, 0, 0, 0);

  const columns: Column<Invoice>[] = [
    {
      header: 'Invoice #',
      accessor: (inv) => {
        const isOverdue =
          inv.status === 'CONFIRMED' &&
          new Date(inv.dueDate).getTime() < todayTime &&
          (inv.balance || Number(inv.total) - Number(inv.amountPaid || 0)) > 0;

        return (
          <div>
            <span className="font-semibold text-slate-900">{inv.number}</span>
            {isOverdue && (
              <span className="block text-[10px] font-bold text-red-600 uppercase tracking-wider">
                Overdue
              </span>
            )}
          </div>
        );
      },
    },
    {
      header: 'Customer',
      accessor: (inv) => (
        <div>
          <span className="font-medium text-slate-900">{inv.customer?.name || 'Customer'}</span>
          {inv.customer?.company && (
            <p className="text-xs text-slate-400">{inv.customer.company}</p>
          )}
        </div>
      ),
    },
    {
      header: 'Period',
      accessor: (inv) => (
        <span className="text-xs text-slate-600">
          {formatDate(inv.periodStart)} &rarr; {formatDate(inv.periodEnd)}
        </span>
      ),
    },
    {
      header: 'Due Date',
      accessor: (inv) => <span className="text-xs text-slate-700">{formatDate(inv.dueDate)}</span>,
    },
    {
      header: 'Total',
      accessor: (inv) => <span className="font-medium text-slate-900">{formatMoney(inv.total)}</span>,
    },
    {
      header: 'Paid',
      accessor: (inv) => (
        <span className="text-xs text-slate-600">{formatMoney(inv.amountPaid)}</span>
      ),
    },
    {
      header: 'Balance',
      accessor: (inv) => {
        const bal = inv.balance !== undefined ? inv.balance : Number(inv.total) - Number(inv.amountPaid || 0);
        return (
          <span className={`font-semibold text-xs ${bal > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
            {formatMoney(bal)}
          </span>
        );
      },
    },
    {
      header: 'Status',
      accessor: (inv) => {
        const variant =
          inv.status === 'PAID'
            ? 'success'
            : inv.status === 'CONFIRMED'
            ? 'info'
            : inv.status === 'DRAFT'
            ? 'default'
            : 'danger';

        return <Badge variant={variant}>{inv.status}</Badge>;
      },
    },
  ];

  // Filters computed based on tab
  const computedFilters: Record<string, any> = {};
  if (activeTab === 'OVERDUE') {
    computedFilters.overdue = 'true';
  } else if (activeTab !== 'ALL') {
    computedFilters.status = activeTab;
  }
  if (from) computedFilters.from = from;
  if (to) computedFilters.to = to;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Invoices</h1>
          <p className="text-sm text-slate-500">
            Automated billing invoices, payment statuses, and collections
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3">
        {(['ALL', 'DRAFT', 'CONFIRMED', 'PAID', 'OVERDUE'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              activeTab === tab
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            {tab === 'CONFIRMED' ? 'Confirmed (Outstanding)' : tab.charAt(0) + tab.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      {/* Date filter bar */}
      <div className="flex items-center gap-3 bg-white p-3 rounded-xl border border-slate-200 text-xs text-slate-600">
        <span>Issue Date Filter:</span>
        <input
          type="date"
          value={from}
          onChange={(e) => setFrom(e.target.value)}
          className="px-2 py-1 border border-slate-300 rounded text-xs bg-white"
        />
        <span>&rarr;</span>
        <input
          type="date"
          value={to}
          onChange={(e) => setTo(e.target.value)}
          className="px-2 py-1 border border-slate-300 rounded text-xs bg-white"
        />
        {(from || to) && (
          <button
            onClick={() => {
              setFrom('');
              setTo('');
            }}
            className="text-indigo-600 hover:underline"
          >
            Clear dates
          </button>
        )}
      </div>

      <DataTable<Invoice>
        columns={columns}
        fetcher={listInvoices}
        filters={computedFilters}
        onRowClick={(inv) => router.push(`/invoices/${inv.id}`)}
        emptyMessage="No invoices found matching current filters."
      />
    </div>
  );
}

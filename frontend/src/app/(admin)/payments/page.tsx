// OWNER: FE-2
// PURPOSE: Payments ledger list page with method and date filters

'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { listPayments } from '../../../services/payments.service';
import { Payment } from '../../../types';
import { DataTable, Column } from '../../../components/tables/DataTable';
import { formatMoney, formatDateTime } from '../../../lib/format';

export default function PaymentsPage() {
  const [method, setMethod] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');

  const columns: Column<Payment>[] = [
    {
      header: 'Date & Time',
      accessor: (p) => <span className="text-xs text-slate-700">{formatDateTime(p.paymentDate)}</span>,
    },
    {
      header: 'Invoice #',
      accessor: (p) => (
        <Link
          href={`/invoices/${p.invoiceId}`}
          className="font-medium text-indigo-600 hover:text-indigo-800"
          onClick={(e) => e.stopPropagation()}
        >
          {p.invoice?.number || `INV #${p.invoiceId}`}
        </Link>
      ),
    },
    {
      header: 'Customer',
      accessor: (p) => (
        <span className="font-medium text-slate-800">
          {p.invoice?.customer?.name || 'Customer'}
        </span>
      ),
    },
    {
      header: 'Method',
      accessor: (p) => (
        <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-800">
          {p.method}
        </span>
      ),
    },
    {
      header: 'Amount',
      accessor: (p) => (
        <span className="font-semibold text-emerald-700">{formatMoney(p.amount)}</span>
      ),
    },
    {
      header: 'Recorded By',
      accessor: (p) => <span className="text-xs text-slate-500">{p.recordedBy?.name || '—'}</span>,
    },
    {
      header: 'Note',
      accessor: (p) => <span className="text-xs text-slate-400 truncate max-w-xs">{p.note || '—'}</span>,
    },
  ];

  const computedFilters: Record<string, any> = {};
  if (method) computedFilters.method = method;
  if (from) computedFilters.from = from;
  if (to) computedFilters.to = to;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Payments Ledger</h1>
          <p className="text-sm text-slate-500">Audit trail of all settled collections and transactions</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 bg-white p-3 rounded-xl border border-slate-200 text-xs shadow-sm">
        <select
          value={method}
          onChange={(e) => setMethod(e.target.value)}
          className="px-3 py-1.5 border border-slate-300 rounded-lg text-slate-700 bg-white"
        >
          <option value="">All Payment Methods</option>
          <option value="CARD">Credit / Debit Card</option>
          <option value="BANK_TRANSFER">Bank Transfer (Wire)</option>
          <option value="UPI">UPI</option>
          <option value="CASH">Cash</option>
          <option value="CHEQUE">Cheque</option>
        </select>

        <div className="flex items-center gap-2">
          <span>Date:</span>
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
        </div>

        {(method || from || to) && (
          <button
            onClick={() => {
              setMethod('');
              setFrom('');
              setTo('');
            }}
            className="text-indigo-600 hover:underline ml-auto"
          >
            Clear filters
          </button>
        )}
      </div>

      <DataTable<Payment>
        columns={columns}
        fetcher={listPayments}
        filters={computedFilters}
        emptyMessage="No payment transactions recorded yet."
      />
    </div>
  );
}

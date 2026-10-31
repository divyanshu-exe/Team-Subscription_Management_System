// OWNER: FE-2
// PURPOSE: Server-paginated overdue invoices table for the finance dashboard

'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { getOverdueInvoices } from '../../services/dashboard.service';
import { Invoice } from '../../types';
import { DataTable, Column } from '../tables/DataTable';
import { formatMoney, formatDate } from '../../lib/format';

export interface OverdueTableProps {
  filters?: { customerId?: string };
}

export const OverdueTable: React.FC<OverdueTableProps> = ({ filters = {} }) => {
  const router = useRouter();

  const columns: Column<Invoice>[] = [
    {
      header: 'Invoice #',
      accessor: (inv) => <span className="font-semibold text-slate-900">{inv.number}</span>,
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
      header: 'Due Date',
      accessor: (inv) => <span className="text-xs text-slate-600">{formatDate(inv.dueDate)}</span>,
    },
    {
      header: 'Days Overdue',
      accessor: (inv) => (
        <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-full border border-red-200">
          {inv.daysOverdue || 0} days
        </span>
      ),
    },
    {
      header: 'Total',
      accessor: (inv) => <span className="text-xs text-slate-600">{formatMoney(inv.total)}</span>,
    },
    {
      header: 'Balance Due',
      accessor: (inv) => (
        <span className="font-bold text-xs text-red-600">
          {formatMoney(inv.balance || Number(inv.total) - Number(inv.amountPaid || 0))}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-bold text-slate-900">Overdue Invoices Requiring Follow-up</h3>
        <span className="text-xs text-slate-400">Sorted by oldest due date</span>
      </div>

      <DataTable<Invoice>
        columns={columns}
        fetcher={getOverdueInvoices}
        filters={filters}
        pageSize={5}
        onRowClick={(inv) => router.push(`/invoices/${inv.id}`)}
        emptyMessage="No overdue invoices! All payments are up to date."
      />
    </div>
  );
};

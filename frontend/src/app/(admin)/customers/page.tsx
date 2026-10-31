// OWNER: FE-1
// PURPOSE: Customers directory list page with search and server pagination

'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { listCustomers } from '../../../services/customers.service';
import { Customer } from '../../../types';
import { DataTable, Column } from '../../../components/tables/DataTable';
import { formatDate } from '../../../lib/format';
import { Button } from '../../../components/ui/Button';

export default function CustomersPage() {
  const router = useRouter();

  const columns: Column<Customer>[] = [
    {
      header: 'Customer',
      accessor: (c) => (
        <div>
          <span className="font-semibold text-slate-900">{c.name}</span>
          <p className="text-xs text-slate-400">{c.email}</p>
        </div>
      ),
    },
    {
      header: 'Company',
      accessor: (c) => <span className="text-slate-700">{c.company || '—'}</span>,
    },
    {
      header: 'Phone',
      accessor: (c) => <span className="text-slate-600">{c.phone || '—'}</span>,
    },
    {
      header: 'Created',
      accessor: (c) => <span className="text-xs text-slate-600">{formatDate(c.createdAt)}</span>,
    },
    {
      header: 'Actions',
      accessor: (c) => (
        <Link
          href={`/customers/${c.id}`}
          onClick={(e) => e.stopPropagation()}
          className="text-xs font-medium text-indigo-600 hover:text-indigo-800"
        >
          Edit
        </Link>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Customers</h1>
          <p className="text-sm text-slate-500">Manage client accounts and billing contact details</p>
        </div>
        <Link href="/customers/new">
          <Button variant="primary">Add Customer</Button>
        </Link>
      </div>

      <DataTable<Customer>
        columns={columns}
        fetcher={listCustomers}
        onRowClick={(c) => router.push(`/customers/${c.id}`)}
        emptyMessage="No customers found."
      />
    </div>
  );
}

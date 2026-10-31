// OWNER: FE-1
// PURPOSE: Discounts catalog list page (ADMIN only)

'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { listDiscounts, deleteDiscount } from '../../../services/discounts.service';
import { Discount } from '../../../types';
import { DataTable, Column } from '../../../components/tables/DataTable';
import { formatDate } from '../../../lib/format';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { RoleGuard } from '../../../components/layout/RoleGuard';
import { useToast } from '../../../components/ui/Toast';

export default function DiscountsPage() {
  const router = useRouter();
  const { addToast } = useToast();

  const columns: Column<Discount>[] = [
    {
      header: 'Discount Name',
      accessor: (d) => (
        <div>
          <span className="font-semibold text-slate-900">{d.name}</span>
          <p className="text-xs text-slate-400">Applies to: {d.appliesTo}</p>
        </div>
      ),
    },
    {
      header: 'Type & Value',
      accessor: (d) => (
        <span className="font-medium text-slate-900">
          {d.type === 'PERCENT' ? `${d.value}%` : `$${d.value}`}
        </span>
      ),
    },
    {
      header: 'Validity Window',
      accessor: (d) => (
        <span className="text-xs text-slate-600">
          {formatDate(d.startDate)} &rarr; {formatDate(d.endDate)}
        </span>
      ),
    },
    {
      header: 'Usage',
      accessor: (d) => (
        <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
          {d.usedCount} / {d.usageLimit} used
        </span>
      ),
    },
    {
      header: 'Status',
      accessor: (d) => (
        <Badge variant={d.isActive ? 'success' : 'default'}>
          {d.isActive ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
    {
      header: 'Actions',
      accessor: (d) => (
        <div className="flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
          <Link
            href={`/discounts/${d.id}`}
            className="text-xs font-medium text-indigo-600 hover:text-indigo-800"
          >
            Edit
          </Link>
          <button
            onClick={async () => {
              if (confirm(`Are you sure you want to delete discount "${d.name}"?`)) {
                try {
                  await deleteDiscount(d.id);
                  addToast('Discount deleted successfully', 'success');
                  router.refresh();
                } catch (err: any) {
                  addToast(err.message || 'Failed to delete discount', 'error');
                }
              }
            }}
            className="text-xs font-medium text-red-600 hover:text-red-800"
          >
            Delete
          </button>
        </div>
      ),
    },
  ];

  return (
    <RoleGuard roles={['ADMIN']}>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Promotions & Discounts</h1>
            <p className="text-sm text-slate-500">Configure percentage and fixed price discount rules</p>
          </div>
          <Link href="/discounts/new">
            <Button variant="primary">Create Discount</Button>
          </Link>
        </div>

        <DataTable<Discount>
          columns={columns}
          fetcher={async () => {
            const items = await listDiscounts();
            return { items, total: items.length, page: 1, limit: items.length, totalPages: 1 };
          }}
          onRowClick={(d) => router.push(`/discounts/${d.id}`)}
          emptyMessage="No discount rules configured yet."
        />
      </div>
    </RoleGuard>
  );
}

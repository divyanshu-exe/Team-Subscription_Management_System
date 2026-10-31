// OWNER: FE-1
// PURPOSE: Products catalog list page with server pagination and role-guarded creation

'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { listProducts } from '../../../services/products.service';
import { Product } from '../../../types';
import { DataTable, Column } from '../../../components/tables/DataTable';
import { formatMoney } from '../../../lib/format';
import { Button } from '../../../components/ui/Button';
import { useAuth } from '../../../hooks/useAuth';

export default function ProductsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  const columns: Column<Product>[] = [
    {
      header: 'Product Name',
      accessor: (p) => (
        <div>
          <span className="font-semibold text-slate-900">{p.name}</span>
          {p.notes && <p className="text-xs text-slate-400 truncate max-w-xs">{p.notes}</p>}
        </div>
      ),
    },
    {
      header: 'Type',
      accessor: 'type',
    },
    {
      header: 'Sales Price',
      accessor: (p) => <span className="font-medium text-slate-900">{formatMoney(p.salesPrice)}</span>,
    },
    {
      header: 'Cost Price',
      accessor: (p) => <span className="text-slate-600">{formatMoney(p.costPrice)}</span>,
    },
    {
      header: 'Variants',
      accessor: (p) => (
        <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
          {p.variants?.length || 0} variants
        </span>
      ),
    },
    {
      header: 'Actions',
      accessor: (p) => (
        <Link
          href={`/products/${p.id}`}
          onClick={(e) => e.stopPropagation()}
          className="text-xs font-medium text-indigo-600 hover:text-indigo-800"
        >
          {isAdmin ? 'Edit' : 'View'}
        </Link>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Products Catalog</h1>
          <p className="text-sm text-slate-500">Manage catalog products and attribute pricing variants</p>
        </div>

        {isAdmin && (
          <Link href="/products/new">
            <Button variant="primary">+ New Product</Button>
          </Link>
        )}
      </div>

      <DataTable<Product>
        columns={columns}
        fetcher={listProducts}
        pageSize={15}
        onRowClick={(p) => router.push(`/products/${p.id}`)}
      />
    </div>
  );
}

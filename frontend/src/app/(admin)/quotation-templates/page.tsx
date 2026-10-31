// OWNER: FE-2
// PURPOSE: Quotation templates list page

'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  listQuotationTemplates,
  deleteQuotationTemplate,
} from '../../../services/quotation-templates.service';
import { QuotationTemplate } from '../../../types';
import { DataTable, Column } from '../../../components/tables/DataTable';
import { Button } from '../../../components/ui/Button';
import { useToast } from '../../../components/ui/Toast';

export default function QuotationTemplatesPage() {
  const router = useRouter();
  const { addToast } = useToast();

  const columns: Column<QuotationTemplate>[] = [
    {
      header: 'Template Name',
      accessor: (t) => (
        <div>
          <span className="font-semibold text-slate-900">{t.name}</span>
          <p className="text-xs text-slate-400">Validity: {t.validityDays} days</p>
        </div>
      ),
    },
    {
      header: 'Linked Plan',
      accessor: (t) => (
        <span className="font-medium text-slate-800">
          {t.plan ? t.plan.name : `Plan #${t.planId}`}
        </span>
      ),
    },
    {
      header: 'Line Items',
      accessor: (t) => (
        <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
          {t.lines?.length || 0} items
        </span>
      ),
    },
    {
      header: 'Actions',
      accessor: (t) => (
        <div className="flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
          <Link
            href={`/quotation-templates/${t.id}`}
            className="text-xs font-medium text-indigo-600 hover:text-indigo-800"
          >
            Edit
          </Link>
          <button
            onClick={async () => {
              if (confirm(`Are you sure you want to delete template "${t.name}"?`)) {
                try {
                  await deleteQuotationTemplate(t.id);
                  addToast('Template deleted successfully', 'success');
                  router.refresh();
                } catch (err: any) {
                  addToast(err.message || 'Failed to delete template', 'error');
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
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Quotation Templates</h1>
          <p className="text-sm text-slate-500">
            Standard preset packages for fast subscription quotation generation
          </p>
        </div>
        <Link href="/quotation-templates/new">
          <Button variant="primary">Create Template</Button>
        </Link>
      </div>

      <DataTable<QuotationTemplate>
        columns={columns}
        fetcher={async () => {
          const items = await listQuotationTemplates();
          return { items, total: items.length, page: 1, limit: items.length, totalPages: 1 };
        }}
        onRowClick={(t) => router.push(`/quotation-templates/${t.id}`)}
        emptyMessage="No quotation templates configured yet."
      />
    </div>
  );
}

// OWNER: FE-2
// PURPOSE: Invoice detail page with InvoiceView, InvoiceActions, recorded Payments list, and StatusHistory

'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { getInvoice } from '../../../../services/invoices.service';
import { Invoice } from '../../../../types';
import { InvoiceView } from '../../../../components/invoices/InvoiceView';
import { InvoiceActions } from '../../../../components/invoices/InvoiceActions';
import { formatMoney, formatDateTime } from '../../../../lib/format';
import { Spinner } from '../../../../components/ui/Spinner';
import { useToast } from '../../../../components/ui/Toast';

export default function InvoiceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { addToast } = useToast();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);

  const loadInvoice = useCallback(async () => {
    try {
      const data = await getInvoice(params.id as string);
      setInvoice(data);
    } catch (err: any) {
      addToast(err.message || 'Failed to load invoice', 'error');
      router.push('/invoices');
    } finally {
      setLoading(false);
    }
  }, [params.id, router, addToast]);

  useEffect(() => {
    if (params.id) loadInvoice();
  }, [params.id, loadInvoice]);

  if (loading || !invoice) {
    return (
      <div className="flex justify-center p-12">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Header & Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <Link href="/invoices" className="text-xs text-indigo-600 hover:underline">
            &larr; Back to Invoices
          </Link>
          <h1 className="text-2xl font-bold text-slate-900 mt-1">Invoice {invoice.number}</h1>
        </div>

        <InvoiceActions invoice={invoice} onRefresh={loadInvoice} />
      </div>

      {/* Main Formatted Invoice */}
      <InvoiceView invoice={invoice} />

      {/* Payments History Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-4">
        <h3 className="text-base font-bold text-slate-900">Recorded Payments</h3>
        {invoice.payments && invoice.payments.length > 0 ? (
          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-medium">
                <tr>
                  <th className="px-4 py-2.5">Date</th>
                  <th className="px-4 py-2.5">Method</th>
                  <th className="px-4 py-2.5">Amount</th>
                  <th className="px-4 py-2.5">Recorded By</th>
                  <th className="px-4 py-2.5">Note</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {invoice.payments.map((p) => (
                  <tr key={p.id}>
                    <td className="px-4 py-2.5 text-slate-700">{formatDateTime(p.paymentDate)}</td>
                    <td className="px-4 py-2.5 font-medium text-slate-900">{p.method}</td>
                    <td className="px-4 py-2.5 font-semibold text-emerald-700">{formatMoney(p.amount)}</td>
                    <td className="px-4 py-2.5 text-slate-600">{p.recordedBy?.name || '—'}</td>
                    <td className="px-4 py-2.5 text-slate-500">{p.note || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-xs text-slate-400">No payments recorded for this invoice yet.</p>
        )}
      </div>

      {/* Status History Timeline */}
      {invoice.history && invoice.history.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-4">
          <h3 className="text-base font-bold text-slate-900">Status History</h3>
          <div className="space-y-3">
            {invoice.history.map((h) => (
              <div key={h.id} className="flex items-start gap-3 text-xs">
                <div className="w-2 h-2 rounded-full bg-indigo-600 mt-1.5" />
                <div className="flex-1">
                  <span className="font-semibold text-slate-800">
                    {h.fromStatus} &rarr; {h.toStatus}
                  </span>
                  <span className="text-slate-400 ml-2">by {h.changedBy?.name || 'System'}</span>
                  <p className="text-slate-400 text-[11px]">{formatDateTime(h.changedAt)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

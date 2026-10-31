// OWNER: FE-2
// PURPOSE: Automated recurring billing control center (ADMIN only)

'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { runBilling } from '../../../services/billing.service';
import { BillingRunResult } from '../../../types';
import { RoleGuard } from '../../../components/layout/RoleGuard';
import { Button } from '../../../components/ui/Button';
import { Modal } from '../../../components/ui/Modal';
import { useToast } from '../../../components/ui/Toast';

export default function BillingPage() {
  const { addToast } = useToast();
  const [asOfDate, setAsOfDate] = useState(new Date().toISOString().split('T')[0]);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<BillingRunResult | null>(null);

  const handleExecute = async () => {
    setIsConfirmOpen(false);
    setLoading(true);
    try {
      const res = await runBilling(asOfDate);
      setResult(res);
      addToast(`Billing executed: ${res.created} invoices created`, 'success');
    } catch (err: any) {
      addToast(err.message || 'Billing run failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <RoleGuard roles={['ADMIN']}>
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Recurring Billing Engine</h1>
          <p className="text-sm text-slate-500">
            Execute batch invoice generation for active subscriptions due on or before target date
          </p>
        </div>

        {/* Action Panel */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <label className="block text-sm font-semibold text-slate-900">Billing As-Of Date</label>
              <p className="text-xs text-slate-500">
                All active subscriptions with billing date &le; this date will be invoiced
              </p>
              <input
                type="date"
                value={asOfDate}
                onChange={(e) => setAsOfDate(e.target.value)}
                className="mt-2 px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-800 bg-white focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500"
              />
            </div>

            <div className="sm:self-end">
              <Button
                variant="primary"
                size="lg"
                onClick={() => setIsConfirmOpen(true)}
                isLoading={loading}
              >
                Run Billing Now
              </Button>
            </div>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 flex items-center justify-between">
            <span>
              ℹ️ <strong>System Note:</strong> Billing is also scheduled automatically every day at 01:00 UTC via background cron job.
            </span>
          </div>
        </div>

        {/* Results Section */}
        {result && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900">Execution Results</h2>
              <Link
                href="/invoices"
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
              >
                View Draft Invoices &rarr;
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                <span className="text-xs text-slate-500 uppercase font-semibold">Total Evaluated</span>
                <p className="text-2xl font-bold text-slate-900 mt-1">{result.total}</p>
                <span className="text-[11px] text-slate-400">subscriptions due</span>
              </div>

              <div className="bg-white p-5 rounded-xl border border-emerald-200 shadow-sm bg-emerald-50/20">
                <span className="text-xs text-emerald-700 uppercase font-semibold">Invoices Created</span>
                <p className="text-2xl font-bold text-emerald-700 mt-1">{result.created}</p>
                <span className="text-[11px] text-emerald-600">new draft invoices</span>
              </div>

              <div className="bg-white p-5 rounded-xl border border-blue-200 shadow-sm bg-blue-50/20">
                <span className="text-xs text-blue-700 uppercase font-semibold">Skipped (Existing)</span>
                <p className="text-2xl font-bold text-blue-700 mt-1">{result.skippedExisting}</p>
                <span className="text-[11px] text-blue-600">idempotent no-op</span>
              </div>

              <div className="bg-white p-5 rounded-xl border border-red-200 shadow-sm bg-red-50/20">
                <span className="text-xs text-red-700 uppercase font-semibold">Errors</span>
                <p className="text-2xl font-bold text-red-700 mt-1">{result.errors.length}</p>
                <span className="text-[11px] text-red-600">exceptions captured</span>
              </div>
            </div>

            {result.errors.length > 0 && (
              <div className="bg-red-50 p-4 rounded-xl border border-red-200 space-y-2">
                <h3 className="text-xs font-bold text-red-800">Error Details:</h3>
                <ul className="text-xs text-red-700 space-y-1">
                  {result.errors.map((e, idx) => (
                    <li key={idx}>
                      Subscription #{e.subscriptionId}: {e.error}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Confirmation Modal */}
        <Modal
          isOpen={isConfirmOpen}
          onClose={() => setIsConfirmOpen(false)}
          title="Confirm Billing Run"
          description={`Execute recurring billing calculations up to ${asOfDate}?`}
          maxWidth="sm"
        >
          <div className="space-y-4 pt-2">
            <p className="text-xs text-slate-600">
              This will evaluate all active subscriptions, apply discounts, generate DRAFT invoices, and advance the next billing dates.
            </p>
            <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
              <Button variant="outline" onClick={() => setIsConfirmOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" onClick={handleExecute}>
                Proceed
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </RoleGuard>
  );
}

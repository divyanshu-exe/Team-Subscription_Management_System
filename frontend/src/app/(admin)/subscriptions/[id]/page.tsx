// OWNER: FE-2
// PURPOSE: Subscription detail screen: legal action buttons, plan policy enforcement, linked invoices & history timeline

'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  getSubscription,
  transitionSubscription,
  pauseSubscription,
  resumeSubscription,
  renewSubscription,
  closeSubscription,
} from '../../../../services/subscriptions.service';
import { Subscription, SubscriptionStatus } from '../../../../types';
import { StatusStepper } from '../../../../components/subscriptions/StatusStepper';
import { Spinner } from '../../../../components/ui/Spinner';
import { Button } from '../../../../components/ui/Button';
import { Badge } from '../../../../components/ui/Badge';
import { Modal } from '../../../../components/ui/Modal';
import { useToast } from '../../../../components/ui/Toast';
import { formatDate, formatMoney } from '../../../../lib/format';

export default function SubscriptionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { success, error } = useToast();
  const subId = params.id as string;

  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Modal confirmation states
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    action: () => Promise<void>;
  }>({
    isOpen: false,
    title: '',
    description: '',
    action: async () => {},
  });

  const loadData = useCallback(async () => {
    try {
      const data = await getSubscription(subId);
      setSubscription(data);
    } catch (err: any) {
      error(err.message || 'Subscription not found');
      router.push('/subscriptions');
    } finally {
      setLoading(false);
    }
  }, [subId, router, error]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const executeAction = async (fn: () => Promise<any>, successMsg: string) => {
    setActionLoading(true);
    try {
      await fn();
      success(successMsg);
      await loadData();
    } catch (err: any) {
      error(err.message || 'Action failed');
    } finally {
      setActionLoading(false);
      setConfirmModal((prev) => ({ ...prev, isOpen: false }));
    }
  };

  const handleTransition = (to: SubscriptionStatus) => {
    setConfirmModal({
      isOpen: true,
      title: `Confirm Transition to ${to}`,
      description: `Are you sure you want to transition this subscription from ${subscription?.status} to ${to}?`,
      action: () => executeAction(() => transitionSubscription(subId, to), `Subscription moved to ${to}`),
    });
  };

  const handlePause = () => {
    setConfirmModal({
      isOpen: true,
      title: 'Pause Subscription',
      description: 'Recurring invoice generation will be halted while the subscription is paused.',
      action: () => executeAction(() => pauseSubscription(subId), 'Subscription paused'),
    });
  };

  const handleResume = () => {
    setConfirmModal({
      isOpen: true,
      title: 'Resume Subscription',
      description: 'Active recurring billing will resume on next scheduled cycle.',
      action: () => executeAction(() => resumeSubscription(subId), 'Subscription resumed'),
    });
  };

  const handleRenew = () => {
    setConfirmModal({
      isOpen: true,
      title: 'Renew Subscription',
      description: `Extend the subscription expiry date by one ${subscription?.plan?.period.toLowerCase()} period.`,
      action: () => executeAction(() => renewSubscription(subId), 'Subscription renewed successfully'),
    });
  };

  const handleClose = () => {
    setConfirmModal({
      isOpen: true,
      title: 'Close Subscription Early',
      description: 'This will terminate the subscription permanently. No further recurring invoices will generate.',
      action: () => executeAction(() => closeSubscription(subId), 'Subscription closed'),
    });
  };

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Spinner size="lg" className="text-indigo-600" />
      </div>
    );
  }

  if (!subscription) return null;

  const status = subscription.status;
  const plan = subscription.plan;

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header with Title and Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <Link href="/subscriptions" className="text-sm font-medium text-slate-500 hover:text-slate-800">
              &larr; Subscriptions
            </Link>
            <span className="text-slate-300">/</span>
            <h1 className="text-2xl font-bold text-slate-900">{subscription.number}</h1>
            <Badge status={status} label={status} />
            {subscription.isPaused && (
              <span className="text-xs font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded">
                PAUSED
              </span>
            )}
          </div>
          <p className="mt-1 text-xs text-slate-400">
            Created on {formatDate(subscription.createdAt)} by {subscription.createdBy?.name || 'Staff'}
          </p>
        </div>

        {/* Action Buttons: Strict State Machine & Plan Flags Enforcement */}
        <div className="flex flex-wrap items-center gap-2">
          {/* DRAFT actions */}
          {status === 'DRAFT' && (
            <>
              <Button
                variant="primary"
                size="sm"
                onClick={() => handleTransition('QUOTATION')}
                isLoading={actionLoading}
              >
                Send Quotation
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleTransition('CLOSED')}
                isLoading={actionLoading}
              >
                Cancel
              </Button>
            </>
          )}

          {/* QUOTATION actions */}
          {status === 'QUOTATION' && (
            <>
              <Button
                variant="primary"
                size="sm"
                onClick={() => handleTransition('CONFIRMED')}
                isLoading={actionLoading}
              >
                Confirm Order
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleTransition('DRAFT')}
                isLoading={actionLoading}
              >
                Back to Draft
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={() => handleTransition('CLOSED')}
                isLoading={actionLoading}
              >
                Close
              </Button>
            </>
          )}

          {/* CONFIRMED actions */}
          {status === 'CONFIRMED' && (
            <>
              <Button
                variant="primary"
                size="sm"
                onClick={() => handleTransition('ACTIVE')}
                isLoading={actionLoading}
              >
                Activate Subscription
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={() => handleTransition('CLOSED')}
                isLoading={actionLoading}
              >
                Close
              </Button>
            </>
          )}

          {/* ACTIVE actions & Plan Policy Flags */}
          {status === 'ACTIVE' && (
            <>
              {plan?.pausable && (
                subscription.isPaused ? (
                  <Button variant="primary" size="sm" onClick={handleResume} isLoading={actionLoading}>
                    Resume Billing
                  </Button>
                ) : (
                  <Button variant="outline" size="sm" onClick={handlePause} isLoading={actionLoading}>
                    Pause
                  </Button>
                )
              )}

              {plan?.renewable && (
                <Button variant="outline" size="sm" onClick={handleRenew} isLoading={actionLoading}>
                  Renew Term (+1 {plan.period.toLowerCase()})
                </Button>
              )}

              {plan?.closableEarly && (
                <Button variant="danger" size="sm" onClick={handleClose} isLoading={actionLoading}>
                  Close Early
                </Button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Visual State Stepper */}
      <StatusStepper currentStatus={status} />

      {/* Customer and Plan Details Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Customer Details */}
        <div className="bg-white p-5 rounded-xl border border-slate-200">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Customer Details</h3>
          <div className="text-sm font-semibold text-slate-900">{subscription.customer?.name}</div>
          <div className="text-xs text-slate-500 mt-1">{subscription.customer?.email}</div>
          {subscription.customer?.company && (
            <div className="text-xs text-slate-500 mt-0.5">Company: {subscription.customer.company}</div>
          )}
          {subscription.customer?.phone && (
            <div className="text-xs text-slate-500 mt-0.5">Phone: {subscription.customer.phone}</div>
          )}
          {subscription.customer?.address && (
            <div className="text-xs text-slate-500 mt-0.5">{subscription.customer.address}</div>
          )}
        </div>

        {/* Subscription Plan & Schedule */}
        <div className="bg-white p-5 rounded-xl border border-slate-200">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Plan & Billing Terms</h3>
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-slate-900">{plan?.name}</span>
            <span className="text-xs font-bold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded">
              ${Number(plan?.price).toFixed(2)} / {plan?.period.toLowerCase()}
            </span>
          </div>
          <div className="text-xs text-slate-600 mt-2 space-y-1">
            <div>Contract Period: <span className="font-medium text-slate-800">{formatDate(subscription.startDate)}</span> &rarr; <span className="font-medium text-slate-800">{formatDate(subscription.expiryDate)}</span></div>
            <div>Payment Terms: <span className="font-medium text-slate-800">{subscription.paymentTermsLabel} ({subscription.paymentTermsDays} days)</span></div>
            <div>Next Billing Date: <span className="font-bold text-indigo-600">{subscription.nextInvoiceDate ? formatDate(subscription.nextInvoiceDate) : 'None / Inactive'}</span></div>
          </div>
        </div>
      </div>

      {/* Lines Table */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Contract Line Items</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-700">
            <thead className="bg-slate-50 text-xs font-semibold uppercase text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-4 py-2.5">Product</th>
                <th className="px-4 py-2.5">Variant</th>
                <th className="px-4 py-2.5">Quantity</th>
                <th className="px-4 py-2.5">Unit Price</th>
                <th className="px-4 py-2.5">Tax Rule</th>
                <th className="px-4 py-2.5 text-right">Line Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {subscription.lines?.map((line) => (
                <tr key={line.id}>
                  <td className="px-4 py-2.5 font-medium text-slate-900">{line.product?.name}</td>
                  <td className="px-4 py-2.5 text-xs text-slate-500">
                    {line.variant ? `${line.variant.attribute}: ${line.variant.value}` : '—'}
                  </td>
                  <td className="px-4 py-2.5">{line.quantity}</td>
                  <td className="px-4 py-2.5">{formatMoney(line.unitPrice)}</td>
                  <td className="px-4 py-2.5 text-xs text-slate-500">
                    {line.tax ? `${line.tax.name} (${line.tax.type === 'PERCENT' ? `${line.tax.value}%` : `$${line.tax.value}`})` : '—'}
                  </td>
                  <td className="px-4 py-2.5 text-right font-semibold text-slate-900">{formatMoney(line.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Linked Invoices Section */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Generated Invoices</h3>
        {!subscription.invoices || subscription.invoices.length === 0 ? (
          <p className="text-xs text-slate-400 italic">No invoices generated yet for this subscription.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-700">
              <thead className="bg-slate-50 text-xs font-semibold uppercase text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-2.5">Invoice #</th>
                  <th className="px-4 py-2.5">Status</th>
                  <th className="px-4 py-2.5">Due Date</th>
                  <th className="px-4 py-2.5">Total</th>
                  <th className="px-4 py-2.5">Paid</th>
                  <th className="px-4 py-2.5">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {subscription.invoices.map((inv) => (
                  <tr key={inv.id}>
                    <td className="px-4 py-2.5 font-bold text-indigo-600">{inv.number}</td>
                    <td className="px-4 py-2.5">
                      <Badge status={inv.status} label={inv.status} size="sm" />
                    </td>
                    <td className="px-4 py-2.5 text-xs text-slate-600">{formatDate(inv.dueDate)}</td>
                    <td className="px-4 py-2.5 font-semibold text-slate-900">{formatMoney(inv.total)}</td>
                    <td className="px-4 py-2.5 text-emerald-700 font-medium">{formatMoney(inv.amountPaid)}</td>
                    <td className="px-4 py-2.5">
                      <Link href={`/invoices/${inv.id}`} className="text-xs font-semibold text-indigo-600 hover:text-indigo-800">
                        View &rarr;
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Status History Timeline */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Status Audit History</h3>
        {!subscription.history || subscription.history.length === 0 ? (
          <p className="text-xs text-slate-400 italic">No history records logged.</p>
        ) : (
          <ol className="relative border-l border-slate-200 ml-3 space-y-4">
            {subscription.history.map((h) => (
              <li key={h.id} className="ml-4">
                <div className="absolute -left-1.5 mt-1.5 h-3 w-3 rounded-full border border-white bg-indigo-600" />
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-800">
                    {h.fromStatus === 'NONE' ? 'Created' : `${h.fromStatus} → ${h.toStatus}`}
                  </span>
                  <span className="text-[10px] text-slate-400">by {h.changedBy?.name || 'System'}</span>
                </div>
                <time className="text-[10px] text-slate-400 block">{formatDate(h.changedAt)}</time>
              </li>
            ))}
          </ol>
        )}
      </div>

      {/* Confirmation Modal */}
      <Modal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
        title={confirmModal.title}
        description={confirmModal.description}
      >
        <div className="flex justify-end gap-3 mt-6">
          <Button
            variant="secondary"
            onClick={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
            disabled={actionLoading}
          >
            Cancel
          </Button>
          <Button variant="primary" isLoading={actionLoading} onClick={confirmModal.action}>
            Confirm Action
          </Button>
        </div>
      </Modal>
    </div>
  );
}

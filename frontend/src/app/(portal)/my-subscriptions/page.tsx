// OWNER: FE-2
// PURPOSE: Customer view of active and past subscriptions with detail drawer

'use client';

import React, { useState } from 'react';
import { listPortalSubscriptions, getPortalSubscription } from '../../../services/portal.service';
import { Subscription } from '../../../types';
import { DataTable, Column } from '../../../components/tables/DataTable';
import { formatMoney, formatDate } from '../../../lib/format';
import { Badge } from '../../../components/ui/Badge';
import { Modal } from '../../../components/ui/Modal';
import { Spinner } from '../../../components/ui/Spinner';

export default function MySubscriptionsPage() {
  const [selectedSub, setSelectedSub] = useState<Subscription | null>(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSelect = async (sub: Subscription) => {
    setIsModalOpen(true);
    setModalLoading(true);
    try {
      const full = await getPortalSubscription(sub.id);
      setSelectedSub(full);
    } catch (_) {
      setSelectedSub(sub);
    } finally {
      setModalLoading(false);
    }
  };

  const columns: Column<Subscription>[] = [
    {
      header: 'Subscription #',
      accessor: (s) => <span className="font-semibold text-slate-900">{s.number}</span>,
    },
    {
      header: 'Plan',
      accessor: (s) => (
        <div>
          <span className="font-medium text-slate-900">{s.plan?.name || 'Custom'}</span>
          <p className="text-xs text-slate-400 capitalize">{s.plan?.period?.toLowerCase()} billing</p>
        </div>
      ),
    },
    {
      header: 'Term Dates',
      accessor: (s) => (
        <span className="text-xs text-slate-600">
          {formatDate(s.startDate)} &rarr; {formatDate(s.expiryDate)}
        </span>
      ),
    },
    {
      header: 'Next Invoice',
      accessor: (s) => (
        <span className="text-xs text-slate-700">
          {s.nextInvoiceDate ? formatDate(s.nextInvoiceDate) : '—'}
        </span>
      ),
    },
    {
      header: 'Status',
      accessor: (s) => {
        const variant =
          s.status === 'ACTIVE'
            ? 'success'
            : s.status === 'CONFIRMED'
            ? 'info'
            : s.status === 'QUOTATION'
            ? 'purple'
            : s.status === 'CLOSED'
            ? 'danger'
            : 'default';

        return <Badge variant={variant}>{s.status}</Badge>;
      },
    },
    {
      header: 'Details',
      accessor: () => <span className="text-xs text-indigo-600 font-medium hover:underline">View</span>,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">My Subscriptions</h1>
        <p className="text-sm text-slate-500">Manage your active service plans and billing terms</p>
      </div>

      <DataTable<Subscription>
        columns={columns}
        fetcher={listPortalSubscriptions}
        onRowClick={handleSelect}
        emptyMessage="You do not have any active or past subscriptions."
      />

      {/* Subscription Detail Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedSub ? `Subscription ${selectedSub.number}` : 'Subscription Details'}
        description={selectedSub?.plan?.name}
        maxWidth="lg"
      >
        {modalLoading ? (
          <div className="flex justify-center p-8">
            <Spinner size="md" />
          </div>
        ) : selectedSub ? (
          <div className="space-y-6 mt-3 text-sm">
            {/* Status and dates banner */}
            <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div>
                <span className="text-xs text-slate-400 block">Status</span>
                <span className="font-semibold text-slate-900">{selectedSub.status}</span>
              </div>
              <div>
                <span className="text-xs text-slate-400 block">Billing Period</span>
                <span className="font-medium text-slate-800 capitalize">
                  {selectedSub.plan?.period?.toLowerCase()}
                </span>
              </div>
              <div>
                <span className="text-xs text-slate-400 block">Active Since</span>
                <span className="text-slate-800">{formatDate(selectedSub.startDate)}</span>
              </div>
              <div>
                <span className="text-xs text-slate-400 block">Expiry Date</span>
                <span className="text-slate-800">{formatDate(selectedSub.expiryDate)}</span>
              </div>
            </div>

            {/* Subscribed Products & Lines */}
            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Included Services
              </h4>
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="min-w-full divide-y divide-slate-200 text-xs">
                  <thead className="bg-slate-50 text-slate-500 font-medium">
                    <tr>
                      <th className="px-4 py-2 text-left">Service / Product</th>
                      <th className="px-4 py-2 text-right">Qty</th>
                      <th className="px-4 py-2 text-right">Unit Price</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 bg-white">
                    {selectedSub.lines && selectedSub.lines.length > 0 ? (
                      selectedSub.lines.map((line) => (
                        <tr key={line.id}>
                          <td className="px-4 py-2.5 font-medium text-slate-900">
                            {line.product?.name}
                            {line.variant && (
                              <span className="text-slate-400 font-normal ml-1">
                                ({line.variant.attribute}: {line.variant.value})
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-2.5 text-right text-slate-700">{line.quantity}</td>
                          <td className="px-4 py-2.5 text-right text-slate-700">
                            {formatMoney(line.unitPrice)}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={3} className="px-4 py-4 text-center text-slate-400">
                          No service items.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  );
}

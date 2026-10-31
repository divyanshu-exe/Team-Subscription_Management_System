// OWNER: FE-2
// PURPOSE: Customer view of billing invoices, balances, and PDF invoice downloads

'use client';

import React, { useState } from 'react';
import { listPortalInvoices, getPortalInvoice, printPortalInvoice } from '../../../services/portal.service';
import { Invoice } from '../../../types';
import { DataTable, Column } from '../../../components/tables/DataTable';
import { formatMoney, formatDate } from '../../../lib/format';
import { Badge } from '../../../components/ui/Badge';
import { Modal } from '../../../components/ui/Modal';
import { Button } from '../../../components/ui/Button';
import { Spinner } from '../../../components/ui/Spinner';
import { useToast } from '../../../components/ui/Toast';

export default function MyInvoicesPage() {
  const { addToast } = useToast();
  const [selectedInv, setSelectedInv] = useState<Invoice | null>(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSelect = async (inv: Invoice) => {
    setIsModalOpen(true);
    setModalLoading(true);
    try {
      const full = await getPortalInvoice(inv.id);
      setSelectedInv(full);
    } catch (_) {
      setSelectedInv(inv);
    } finally {
      setModalLoading(false);
    }
  };

  const handleDownloadPdf = async (id: number | string, number: string) => {
    try {
      await printPortalInvoice(id, number);
      addToast('Invoice PDF downloaded', 'info');
    } catch (err: any) {
      addToast(err.message || 'Failed to download PDF', 'error');
    }
  };

  const columns: Column<Invoice>[] = [
    {
      header: 'Invoice #',
      accessor: (inv) => <span className="font-semibold text-slate-900">{inv.number}</span>,
    },
    {
      header: 'Issue Date',
      accessor: (inv) => <span className="text-xs text-slate-600">{formatDate(inv.issueDate)}</span>,
    },
    {
      header: 'Due Date',
      accessor: (inv) => <span className="text-xs text-slate-700">{formatDate(inv.dueDate)}</span>,
    },
    {
      header: 'Total',
      accessor: (inv) => <span className="font-medium text-slate-900">{formatMoney(inv.total)}</span>,
    },
    {
      header: 'Balance Due',
      accessor: (inv) => {
        const bal = inv.balance !== undefined ? inv.balance : Number(inv.total) - Number(inv.amountPaid || 0);
        return (
          <span className={`font-semibold text-xs ${bal > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
            {formatMoney(bal)}
          </span>
        );
      },
    },
    {
      header: 'Status',
      accessor: (inv) => {
        const variant =
          inv.status === 'PAID'
            ? 'success'
            : inv.status === 'CONFIRMED'
            ? 'info'
            : inv.status === 'DRAFT'
            ? 'default'
            : 'danger';

        return <Badge variant={variant}>{inv.status}</Badge>;
      },
    },
    {
      header: 'Actions',
      accessor: (inv) => (
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleDownloadPdf(inv.id, inv.number);
          }}
          className="text-xs text-indigo-600 font-medium hover:text-indigo-800"
        >
          Download PDF
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">My Invoices</h1>
        <p className="text-sm text-slate-500">View and download your billing statements and payment history</p>
      </div>

      <DataTable<Invoice>
        columns={columns}
        fetcher={listPortalInvoices}
        onRowClick={handleSelect}
        emptyMessage="No billing statements found."
      />

      {/* Invoice Detail Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedInv ? `Invoice ${selectedInv.number}` : 'Invoice Details'}
        description={`Due: ${selectedInv ? formatDate(selectedInv.dueDate) : ''}`}
        maxWidth="lg"
      >
        {modalLoading ? (
          <div className="flex justify-center p-8">
            <Spinner size="md" />
          </div>
        ) : selectedInv ? (
          <div className="space-y-6 mt-3 text-sm">
            {/* Status & Summary */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
              <div>
                <span className="text-slate-400 block">Status</span>
                <span className="font-semibold text-slate-900">{selectedInv.status}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Invoice Total</span>
                <span className="font-bold text-slate-900">{formatMoney(selectedInv.total)}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Paid to Date</span>
                <span className="font-medium text-emerald-700">{formatMoney(selectedInv.amountPaid)}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Balance Due</span>
                <span className="font-bold text-red-600">
                  {formatMoney(selectedInv.balance ?? Number(selectedInv.total) - Number(selectedInv.amountPaid || 0))}
                </span>
              </div>
            </div>

            {/* Line Items */}
            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Billed Services
              </h4>
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="min-w-full divide-y divide-slate-200 text-xs">
                  <thead className="bg-slate-50 text-slate-500 font-medium">
                    <tr>
                      <th className="px-4 py-2 text-left">Description</th>
                      <th className="px-4 py-2 text-right">Qty</th>
                      <th className="px-4 py-2 text-right">Unit Price</th>
                      <th className="px-4 py-2 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 bg-white">
                    {selectedInv.lines && selectedInv.lines.length > 0 ? (
                      selectedInv.lines.map((line) => (
                        <tr key={line.id}>
                          <td className="px-4 py-2.5 font-medium text-slate-900">{line.description}</td>
                          <td className="px-4 py-2.5 text-right text-slate-700">{line.quantity}</td>
                          <td className="px-4 py-2.5 text-right text-slate-700">{formatMoney(line.unitPrice)}</td>
                          <td className="px-4 py-2.5 text-right font-semibold text-slate-900">
                            {formatMoney(line.amount)}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="px-4 py-4 text-center text-slate-400">
                          No lines found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Modal Footer Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDownloadPdf(selectedInv.id, selectedInv.number)}
              >
                Download PDF
              </Button>
              <Button variant="primary" size="sm" onClick={() => setIsModalOpen(false)}>
                Close
              </Button>
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  );
}

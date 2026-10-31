// OWNER: FE-2
// PURPOSE: State-dependent action buttons for invoices (Confirm, Cancel, Send, Print, Record Payment)

'use client';

import React, { useState } from 'react';
import { Invoice } from '../../types';
import { confirmInvoice, cancelInvoice, sendInvoice, printInvoice } from '../../services/invoices.service';
import { useToast } from '../ui/Toast';
import { Button } from '../ui/Button';
import { PaymentModal } from './PaymentModal';

export interface InvoiceActionsProps {
  invoice: Invoice;
  onRefresh: () => void;
}

export const InvoiceActions: React.FC<InvoiceActionsProps> = ({ invoice, onRefresh }) => {
  const { addToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);

  const hasPayments = invoice.payments && invoice.payments.length > 0;
  const balance = invoice.balance !== undefined ? invoice.balance : Number(invoice.total) - Number(invoice.amountPaid || 0);

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await confirmInvoice(invoice.id);
      addToast('Invoice confirmed successfully', 'success');
      onRefresh();
    } catch (err: any) {
      addToast(err.message || 'Failed to confirm invoice', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    if (confirm(`Are you sure you want to cancel invoice ${invoice.number}?`)) {
      setLoading(true);
      try {
        await cancelInvoice(invoice.id);
        addToast('Invoice cancelled', 'success');
        onRefresh();
      } catch (err: any) {
        addToast(err.message || 'Failed to cancel invoice', 'error');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSend = async () => {
    setLoading(true);
    try {
      await sendInvoice(invoice.id);
      addToast(`Invoice emailed to ${invoice.customer?.email || 'customer'}`, 'success');
    } catch (err: any) {
      addToast(err.message || 'Failed to send invoice email', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = async () => {
    try {
      await printInvoice(invoice.id, invoice.number);
      addToast('Invoice PDF downloaded', 'info');
    } catch (err: any) {
      addToast(err.message || 'Failed to generate PDF', 'error');
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* DRAFT Actions */}
      {invoice.status === 'DRAFT' && (
        <>
          <Button variant="primary" onClick={handleConfirm} isLoading={loading}>
            Confirm Invoice
          </Button>
          <Button variant="danger" onClick={handleCancel} isLoading={loading}>
            Cancel Invoice
          </Button>
        </>
      )}

      {/* CONFIRMED Actions */}
      {invoice.status === 'CONFIRMED' && (
        <>
          {balance > 0 && (
            <Button variant="primary" onClick={() => setIsPaymentOpen(true)}>
              Record Payment
            </Button>
          )}
          <Button variant="outline" onClick={handleSend} isLoading={loading}>
            Send via Email
          </Button>
          <Button variant="outline" onClick={handlePrint}>
            Download PDF
          </Button>
          {!hasPayments && (
            <Button variant="ghost" onClick={handleCancel} isLoading={loading} className="text-red-600 hover:text-red-800">
              Cancel
            </Button>
          )}
        </>
      )}

      {/* PAID Actions */}
      {invoice.status === 'PAID' && (
        <>
          <Button variant="outline" onClick={handleSend} isLoading={loading}>
            Email Receipt
          </Button>
          <Button variant="outline" onClick={handlePrint}>
            Download PDF
          </Button>
        </>
      )}

      {/* CANCELLED */}
      {invoice.status === 'CANCELLED' && (
        <span className="text-xs text-red-500 font-medium">This invoice is cancelled.</span>
      )}

      {isPaymentOpen && (
        <PaymentModal
          invoice={invoice}
          isOpen={isPaymentOpen}
          onClose={() => setIsPaymentOpen(false)}
          onSuccess={onRefresh}
        />
      )}
    </div>
  );
};

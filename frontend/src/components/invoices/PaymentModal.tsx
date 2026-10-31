// OWNER: FE-2
// PURPOSE: Modal to record payments against confirmed invoices with balance clamping

'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Invoice, PaymentMethod } from '../../types';
import { recordPayment } from '../../services/payments.service';
import { useToast } from '../ui/Toast';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';
import { formatMoney } from '../../lib/format';

export interface PaymentModalProps {
  invoice: Invoice;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  invoice,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { addToast } = useToast();
  const [loading, setLoading] = useState(false);

  const balance = invoice.balance !== undefined ? invoice.balance : Number(invoice.total) - Number(invoice.amountPaid || 0);

  const paymentSchema = z.object({
    method: z.enum(['CASH', 'CARD', 'BANK_TRANSFER', 'UPI', 'CHEQUE']),
    amount: z.coerce
      .number()
      .min(0.01, 'Amount must be at least 0.01')
      .max(balance, `Amount cannot exceed balance of ${formatMoney(balance)}`),
    paymentDate: z.string().min(1, 'Date is required'),
    note: z.string().optional(),
  });

  type PaymentFormData = z.infer<typeof paymentSchema>;

  const todayStr = new Date().toISOString().split('T')[0];

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<PaymentFormData>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      method: 'CARD',
      amount: balance,
      paymentDate: todayStr,
      note: '',
    },
  });

  const onSubmit = async (data: PaymentFormData) => {
    setLoading(true);
    try {
      await recordPayment({
        invoiceId: invoice.id,
        method: data.method as PaymentMethod,
        amount: data.amount,
        paymentDate: data.paymentDate,
        note: data.note || null,
      });
      addToast('Payment recorded successfully', 'success');
      reset();
      onSuccess();
      onClose();
    } catch (err: any) {
      addToast(err.message || 'Failed to record payment', 'error');
    } finally {
      setLoading(false);
    }
  };

  const methodOptions = [
    { label: 'Credit / Debit Card', value: 'CARD' },
    { label: 'Bank Transfer (Wire)', value: 'BANK_TRANSFER' },
    { label: 'UPI / Fast Payment', value: 'UPI' },
    { label: 'Cash', value: 'CASH' },
    { label: 'Cheque', value: 'CHEQUE' },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Record Payment for ${invoice.number}`}
      description={`Remaining balance: ${formatMoney(balance)}`}
      maxWidth="md"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-2">
        <Select
          label="Payment Method"
          options={methodOptions}
          error={errors.method?.message}
          {...register('method')}
        />

        <Input
          label="Amount ($)"
          type="number"
          step="0.01"
          error={errors.amount?.message}
          {...register('amount')}
        />

        <Input
          label="Payment Date"
          type="date"
          error={errors.paymentDate?.message}
          {...register('paymentDate')}
        />

        <Input
          label="Reference / Note"
          placeholder="Check #, Transaction ID, etc."
          error={errors.note?.message}
          {...register('note')}
        />

        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
          <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" isLoading={loading}>
            Confirm Payment
          </Button>
        </div>
      </form>
    </Modal>
  );
};

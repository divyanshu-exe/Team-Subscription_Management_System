// OWNER: FE-2
// PURPOSE: Formatted printable invoice layout showing customer info, subscription ref, line items, and totals

import React from 'react';
import { Invoice } from '../../types';
import { formatMoney, formatDate } from '../../lib/format';
import { Badge } from '../ui/Badge';

export interface InvoiceViewProps {
  invoice: Invoice;
}

export const InvoiceView: React.FC<InvoiceViewProps> = ({ invoice }) => {
  const customer = invoice.customer;
  const balance = invoice.balance !== undefined ? invoice.balance : Number(invoice.total) - Number(invoice.amountPaid || 0);

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'PAID':
        return 'success';
      case 'CONFIRMED':
        return 'info';
      case 'DRAFT':
        return 'default';
      case 'CANCELLED':
        return 'danger';
      default:
        return 'default';
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Brightloop Software</h2>
          <p className="text-xs text-slate-500 mt-1">Subscription Billing Services</p>
          <p className="text-xs text-slate-400">billing@brightloop.test</p>
        </div>
        <div className="sm:text-right space-y-1">
          <div className="flex items-center sm:justify-end gap-2">
            <h1 className="text-xl font-bold text-slate-900">{invoice.number}</h1>
            <Badge variant={getStatusBadgeVariant(invoice.status)}>{invoice.status}</Badge>
          </div>
          <p className="text-xs text-slate-500">
            Issue Date: <span className="font-medium text-slate-800">{formatDate(invoice.issueDate)}</span>
          </p>
          <p className="text-xs text-slate-500">
            Due Date: <span className="font-medium text-slate-800">{formatDate(invoice.dueDate)}</span>
          </p>
        </div>
      </div>

      {/* Parties & Reference */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Billed To</h3>
          <p className="font-semibold text-slate-900 text-base">{customer?.name || 'Customer'}</p>
          {customer?.company && <p className="text-slate-600">{customer.company}</p>}
          {customer?.email && <p className="text-slate-600 text-xs">{customer.email}</p>}
          {customer?.phone && <p className="text-slate-600 text-xs">{customer.phone}</p>}
          {customer?.address && <p className="text-slate-500 text-xs mt-1">{customer.address}</p>}
        </div>

        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Subscription Details</h3>
          {invoice.subscription ? (
            <div className="space-y-1 text-xs">
              <p className="text-slate-700">
                Plan: <span className="font-semibold text-slate-900">{invoice.subscription.plan?.name || '—'}</span>
              </p>
              <p className="text-slate-700">
                Subscription Ref: <span className="font-mono text-indigo-600">{invoice.subscription.number}</span>
              </p>
              <p className="text-slate-700">
                Billing Period:{' '}
                <span className="font-medium">
                  {formatDate(invoice.periodStart)} &rarr; {formatDate(invoice.periodEnd)}
                </span>
              </p>
            </div>
          ) : (
            <p className="text-xs text-slate-500">Ad-hoc Subscription Invoice</p>
          )}
        </div>
      </div>

      {/* Line Items Table */}
      <div className="overflow-x-auto border border-slate-200 rounded-xl">
        <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
          <thead className="bg-slate-50 text-slate-500 font-medium">
            <tr>
              <th className="px-4 py-3 text-xs tracking-wider uppercase">Item Description</th>
              <th className="px-4 py-3 text-xs tracking-wider uppercase text-right">Qty</th>
              <th className="px-4 py-3 text-xs tracking-wider uppercase text-right">Unit Price</th>
              <th className="px-4 py-3 text-xs tracking-wider uppercase text-right">Discount</th>
              <th className="px-4 py-3 text-xs tracking-wider uppercase text-right">Tax</th>
              <th className="px-4 py-3 text-xs tracking-wider uppercase text-right">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 bg-white">
            {invoice.lines && invoice.lines.length > 0 ? (
              invoice.lines.map((line) => (
                <tr key={line.id}>
                  <td className="px-4 py-3 font-medium text-slate-900">{line.description}</td>
                  <td className="px-4 py-3 text-right text-slate-700">{line.quantity}</td>
                  <td className="px-4 py-3 text-right text-slate-700">{formatMoney(line.unitPrice)}</td>
                  <td className="px-4 py-3 text-right text-emerald-600">
                    {Number(line.discountAmount) > 0 ? `-${formatMoney(line.discountAmount)}` : '—'}
                  </td>
                  <td className="px-4 py-3 text-right text-slate-700">{formatMoney(line.taxAmount)}</td>
                  <td className="px-4 py-3 text-right font-semibold text-slate-900">{formatMoney(line.amount)}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-xs text-slate-400">
                  No line items on this invoice.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Totals & Balance Breakdown */}
      <div className="flex flex-col sm:flex-row justify-end text-sm">
        <div className="w-full sm:w-72 space-y-2">
          <div className="flex justify-between text-slate-600 text-xs">
            <span>Subtotal</span>
            <span>{formatMoney(invoice.subtotal)}</span>
          </div>
          {Number(invoice.discountTotal) > 0 && (
            <div className="flex justify-between text-emerald-600 text-xs font-medium">
              <span>Discount Total</span>
              <span>-{formatMoney(invoice.discountTotal)}</span>
            </div>
          )}
          <div className="flex justify-between text-slate-600 text-xs">
            <span>Tax Total</span>
            <span>{formatMoney(invoice.taxTotal)}</span>
          </div>
          <div className="border-t border-slate-200 pt-2 flex justify-between font-bold text-slate-900 text-base">
            <span>Total</span>
            <span>{formatMoney(invoice.total)}</span>
          </div>
          <div className="flex justify-between text-slate-600 text-xs pt-1">
            <span>Amount Paid</span>
            <span>{formatMoney(invoice.amountPaid)}</span>
          </div>
          <div className="flex justify-between font-bold text-sm pt-1 border-t border-slate-100">
            <span>Balance Due</span>
            <span className={balance > 0 ? 'text-red-600' : 'text-emerald-600'}>
              {formatMoney(balance)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

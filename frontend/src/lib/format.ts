// OWNER: FE-1
// PURPOSE: Formatting utilities for currency, dates, and status color badges

import { SubscriptionStatus, InvoiceStatus } from '../types';

/**
 * Formats a numeric value into currency string (USD or INR default)
 * @param amount
 * @param currency
 */
export function formatMoney(amount: number | string, currency: string = 'USD'): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(num)) return '$0.00';

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);
}

/**
 * Formats an ISO date string into readable local/UTC date
 * @param isoString
 */
export function formatDate(isoString?: string | null): string {
  if (!isoString) return '—';
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return '—';
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return '—';
  }
}

/**
 * Returns Tailwind color classes based on subscription or invoice status
 * @param status
 */
export function statusColor(
  status: SubscriptionStatus | InvoiceStatus | string
): { bg: string; text: string; border: string } {
  switch (status) {
    // Subscription statuses
    case 'DRAFT':
      return { bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-300' };
    case 'QUOTATION':
      return { bg: 'bg-amber-100', text: 'text-amber-800', border: 'border-amber-300' };
    case 'CONFIRMED':
      return { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-300' };
    case 'ACTIVE':
    case 'PAID':
      return { bg: 'bg-emerald-100', text: 'text-emerald-800', border: 'border-emerald-300' };
    case 'CLOSED':
    case 'CANCELLED':
      return { bg: 'bg-rose-100', text: 'text-rose-800', border: 'border-rose-300' };
    case 'OVERDUE':
      return { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-300' };
    default:
      return { bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-300' };
  }
}

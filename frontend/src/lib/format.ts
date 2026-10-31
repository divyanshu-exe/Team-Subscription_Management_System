// OWNER: FE-1
// PURPOSE: Currency, date, and status color formatting utilities

export function formatMoney(amount: number | string | null | undefined): string {
  const num = Number(amount || 0);
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);
}

export function formatDate(date: string | Date | null | undefined): string {
  if (!date) return '—';
  const d = new Date(date);
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatDateTime(date: string | Date | null | undefined): string {
  if (!date) return '—';
  const d = new Date(date);
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function statusColor(
  status: string | null | undefined
): { bg: string; text: string; border: string } {
  switch (status?.toUpperCase()) {
    case 'ACTIVE':
    case 'PAID':
      return { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' };
    case 'CONFIRMED':
      return { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' };
    case 'QUOTATION':
      return { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' };
    case 'DRAFT':
      return { bg: 'bg-slate-50', text: 'text-slate-700', border: 'border-slate-200' };
    case 'CLOSED':
    case 'CANCELLED':
      return { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' };
    default:
      return { bg: 'bg-slate-50', text: 'text-slate-600', border: 'border-slate-200' };
  }
}

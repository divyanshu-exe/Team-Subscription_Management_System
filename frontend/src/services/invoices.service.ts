// OWNER: FE-2
// PURPOSE: Typed API client for invoices, confirmation, cancellation, email delivery and PDF download

import api from '../lib/api';
import { Invoice, Paginated } from '../types';

export async function listInvoices(params?: {
  status?: string;
  customerId?: number | string;
  overdue?: boolean | string;
  from?: string;
  to?: string;
  page?: number;
  limit?: number;
}): Promise<Paginated<Invoice>> {
  return await api.get('/invoices', { params });
}

export async function getInvoice(id: number | string): Promise<Invoice> {
  return await api.get(`/invoices/${id}`);
}

export async function confirmInvoice(id: number | string): Promise<Invoice> {
  return await api.post(`/invoices/${id}/confirm`);
}

export async function cancelInvoice(id: number | string): Promise<Invoice> {
  return await api.post(`/invoices/${id}/cancel`);
}

export async function sendInvoice(id: number | string): Promise<{ sent: boolean; recipient: string }> {
  return await api.post(`/invoices/${id}/send`);
}

export async function printInvoice(id: number | string, invoiceNumber?: string): Promise<void> {
  const blob: Blob = await api.get(`/invoices/${id}/print`, {
    responseType: 'blob',
  });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.target = '_blank';
  a.download = `${invoiceNumber || `invoice-${id}`}.pdf`;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
}

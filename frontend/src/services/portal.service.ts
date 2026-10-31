// OWNER: FE-2
// PURPOSE: Typed API client for customer self-service portal

import api from '../lib/api';
import { Subscription, Invoice, Paginated } from '../types';

export async function listPortalSubscriptions(params?: {
  page?: number;
  limit?: number;
  status?: string;
}): Promise<Paginated<Subscription>> {
  return await api.get('/portal/subscriptions', { params });
}

export async function getPortalSubscription(id: number | string): Promise<Subscription> {
  return await api.get(`/portal/subscriptions/${id}`);
}

export async function listPortalInvoices(params?: {
  page?: number;
  limit?: number;
  status?: string;
}): Promise<Paginated<Invoice>> {
  return await api.get('/portal/invoices', { params });
}

export async function getPortalInvoice(id: number | string): Promise<Invoice> {
  return await api.get(`/portal/invoices/${id}`);
}

export async function printPortalInvoice(id: number | string, invoiceNumber?: string): Promise<void> {
  const blob: Blob = await api.get(`/portal/invoices/${id}/print`, {
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

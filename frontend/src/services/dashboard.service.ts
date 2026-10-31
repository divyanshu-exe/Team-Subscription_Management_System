// OWNER: FE-2
// PURPOSE: Typed API client for finance dashboard metrics and overdue telemetry

import api from '../lib/api';
import { DashboardSummary, Invoice, Paginated } from '../types';

export async function getDashboardSummary(params?: {
  from?: string;
  to?: string;
  customerId?: number | string;
  planId?: number | string;
}): Promise<DashboardSummary> {
  return await api.get('/dashboard/summary', { params });
}

export async function getOverdueInvoices(params?: {
  customerId?: number | string;
  page?: number;
  limit?: number;
}): Promise<Paginated<Invoice>> {
  return await api.get('/dashboard/overdue', { params });
}

export async function getSubscriptionsByStatus(): Promise<Record<string, number>> {
  return await api.get('/dashboard/subscriptions-by-status');
}

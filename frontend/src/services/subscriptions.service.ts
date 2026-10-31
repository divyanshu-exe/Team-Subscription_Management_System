// OWNER: FE-2
// PURPOSE: Typed API client for subscription lifecycle, transitions, and status actions

import api from '../lib/api';
import { Subscription, Paginated, SubscriptionStatus } from '../types';

export interface CreateSubscriptionLineInput {
  productId: number;
  variantId?: number | null;
  quantity: number;
  taxId?: number | null;
}

export interface CreateSubscriptionInput {
  customerId: number;
  planId: number;
  templateId?: number | null;
  startDate: string;
  expiryDate: string;
  paymentTermsDays?: number;
  paymentTermsLabel?: string;
  lines?: CreateSubscriptionLineInput[];
}

export async function listSubscriptions(params?: {
  status?: string;
  customerId?: number | string;
  search?: string;
  page?: number;
  limit?: number;
}): Promise<Paginated<Subscription>> {
  return await api.get('/subscriptions', { params });
}

export async function getSubscription(id: number | string): Promise<Subscription> {
  return await api.get(`/subscriptions/${id}`);
}

export async function createSubscription(data: CreateSubscriptionInput): Promise<Subscription> {
  return await api.post('/subscriptions', data);
}

export async function updateSubscription(
  id: number | string,
  data: Partial<CreateSubscriptionInput>
): Promise<Subscription> {
  return await api.put(`/subscriptions/${id}`, data);
}

export async function transitionSubscription(
  id: number | string,
  to: SubscriptionStatus
): Promise<Subscription> {
  return await api.post(`/subscriptions/${id}/transition`, { to });
}

export async function pauseSubscription(id: number | string): Promise<Subscription> {
  return await api.post(`/subscriptions/${id}/pause`);
}

export async function resumeSubscription(id: number | string): Promise<Subscription> {
  return await api.post(`/subscriptions/${id}/resume`);
}

export async function renewSubscription(id: number | string): Promise<Subscription> {
  return await api.post(`/subscriptions/${id}/renew`);
}

export async function closeSubscription(id: number | string): Promise<Subscription> {
  return await api.post(`/subscriptions/${id}/close`);
}

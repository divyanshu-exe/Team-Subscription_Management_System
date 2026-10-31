// OWNER: FE-2
// PURPOSE: Typed API client for payment recording and listing

import api from '../lib/api';
import { Payment, Paginated, PaymentMethod } from '../types';

export interface CreatePaymentInput {
  invoiceId: number;
  method: PaymentMethod;
  amount: number;
  paymentDate?: string;
  note?: string | null;
}

export async function listPayments(params?: {
  invoiceId?: number | string;
  method?: PaymentMethod;
  from?: string;
  to?: string;
  page?: number;
  limit?: number;
}): Promise<Paginated<Payment>> {
  return await api.get('/payments', { params });
}

export async function recordPayment(data: CreatePaymentInput): Promise<Payment> {
  return await api.post('/payments', data);
}

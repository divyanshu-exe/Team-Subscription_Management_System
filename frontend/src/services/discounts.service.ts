// OWNER: FE-1
// PURPOSE: Typed API client for discounts (ADMIN only)

import api from '../lib/api';
import { Discount, DiscountType, DiscountAppliesTo } from '../types';

export interface CreateDiscountInput {
  name: string;
  type: DiscountType;
  value: number;
  minPurchase?: number | null;
  minQuantity?: number | null;
  startDate: string;
  endDate: string;
  usageLimit: number;
  appliesTo: DiscountAppliesTo;
  productIds?: number[];
  isActive?: boolean;
}

export interface UpdateDiscountInput extends Partial<CreateDiscountInput> {}

export async function listDiscounts(): Promise<Discount[]> {
  return await api.get('/discounts');
}

export async function getDiscount(id: number | string): Promise<Discount> {
  return await api.get(`/discounts/${id}`);
}

export const getDiscountById = getDiscount;

export async function createDiscount(data: CreateDiscountInput): Promise<Discount> {
  return await api.post('/discounts', data);
}

export async function updateDiscount(id: number | string, data: UpdateDiscountInput): Promise<Discount> {
  return await api.put(`/discounts/${id}`, data);
}

export async function deleteDiscount(id: number | string): Promise<{ success: boolean; message: string }> {
  return await api.delete(`/discounts/${id}`);
}

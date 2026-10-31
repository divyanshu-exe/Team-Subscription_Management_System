// OWNER: FE-1
// PURPOSE: Typed API client for tax rules

import api from '../lib/api';
import { Tax, TaxType } from '../types';

export interface CreateTaxInput {
  name: string;
  type: TaxType;
  value: number;
  isActive?: boolean;
}

export interface UpdateTaxInput extends Partial<CreateTaxInput> {}

export async function listTaxes(): Promise<Tax[]> {
  return await api.get('/taxes');
}

export async function getTax(id: number | string): Promise<Tax> {
  return await api.get(`/taxes/${id}`);
}

export async function createTax(data: CreateTaxInput): Promise<Tax> {
  return await api.post('/taxes', data);
}

export async function updateTax(id: number | string, data: UpdateTaxInput): Promise<Tax> {
  return await api.put(`/taxes/${id}`, data);
}

export async function deleteTax(id: number | string): Promise<{ success: boolean; message: string }> {
  return await api.delete(`/taxes/${id}`);
}

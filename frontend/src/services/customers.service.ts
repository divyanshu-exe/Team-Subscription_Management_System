// OWNER: FE-1
// PURPOSE: Typed API client for customer management (ADMIN and STAFF)

import api from '../lib/api';
import { Customer, Paginated } from '../types';

export interface CreateCustomerInput {
  name: string;
  email: string;
  phone?: string | null;
  company?: string | null;
  address?: string | null;
}

export interface UpdateCustomerInput extends Partial<CreateCustomerInput> {}

export async function listCustomers(params?: {
  page?: number;
  limit?: number;
  search?: string;
}): Promise<Paginated<Customer>> {
  return await api.get('/customers', { params });
}

export async function getCustomer(id: number | string): Promise<Customer> {
  return await api.get(`/customers/${id}`);
}

export async function createCustomer(data: CreateCustomerInput): Promise<Customer> {
  return await api.post('/customers', data);
}

export async function updateCustomer(id: number | string, data: UpdateCustomerInput): Promise<Customer> {
  return await api.patch(`/customers/${id}`, data);
}

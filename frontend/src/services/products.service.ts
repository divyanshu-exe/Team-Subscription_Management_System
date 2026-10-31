// OWNER: FE-1
// PURPOSE: Typed API client for products and variants

import api from '../lib/api';
import { Product, Paginated } from '../types';

export interface CreateProductInput {
  name: string;
  type: string;
  salesPrice: number;
  costPrice: number;
  notes?: string | null;
  variants?: {
    attribute: string;
    value: string;
    extraPrice: number;
  }[];
}

export interface UpdateProductInput extends Partial<CreateProductInput> {
  isActive?: boolean;
}

export async function listProducts(params?: {
  page?: number;
  limit?: number;
  search?: string;
  type?: string;
}): Promise<Paginated<Product>> {
  return await api.get('/products', { params });
}

export async function getProduct(id: number | string): Promise<Product> {
  return await api.get(`/products/${id}`);
}

export async function createProduct(data: CreateProductInput): Promise<Product> {
  return await api.post('/products', data);
}

export async function updateProduct(id: number | string, data: UpdateProductInput): Promise<Product> {
  return await api.put(`/products/${id}`, data);
}

export async function deleteProduct(id: number | string): Promise<{ success: boolean; message: string }> {
  return await api.delete(`/products/${id}`);
}

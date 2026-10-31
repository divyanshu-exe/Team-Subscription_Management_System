// OWNER: FE-2
// PURPOSE: Typed API client for quotation templates

import api from '../lib/api';
import { QuotationTemplate } from '../types';

export interface CreateQuotationTemplateInput {
  name: string;
  planId: number;
  validityDays: number;
  lines: Array<{
    productId: number;
    variantId?: number | null;
    quantity: number;
  }>;
}

export async function listQuotationTemplates(): Promise<QuotationTemplate[]> {
  return await api.get('/quotation-templates');
}

export async function getQuotationTemplate(id: number | string): Promise<QuotationTemplate> {
  return await api.get(`/quotation-templates/${id}`);
}

export async function createQuotationTemplate(
  data: CreateQuotationTemplateInput
): Promise<QuotationTemplate> {
  return await api.post('/quotation-templates', data);
}

export async function updateQuotationTemplate(
  id: number | string,
  data: CreateQuotationTemplateInput
): Promise<QuotationTemplate> {
  return await api.put(`/quotation-templates/${id}`, data);
}

export async function deleteQuotationTemplate(id: number | string): Promise<void> {
  return await api.delete(`/quotation-templates/${id}`);
}

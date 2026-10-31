// OWNER: BE-2
// PURPOSE: Zod validation schemas for quotation templates

const { z } = require('zod');

const lineItemSchema = z.object({
  id: z.number().optional(),
  productId: z.coerce.number().int().min(1, 'Product is required'),
  variantId: z.coerce.number().int().optional().nullable(),
  quantity: z.coerce.number().int().min(1, 'Quantity must be at least 1').default(1),
});

const createQuotationTemplateSchema = z.object({
  name: z.string().min(1, 'Template name is required'),
  planId: z.coerce.number().int().min(1, 'Plan is required'),
  validityDays: z.coerce.number().int().min(1, 'Validity in days must be at least 1'),
  lines: z.array(lineItemSchema).min(1, 'At least one line item is required'),
});

const updateQuotationTemplateSchema = z.object({
  name: z.string().min(1).optional(),
  planId: z.coerce.number().int().min(1).optional(),
  validityDays: z.coerce.number().int().min(1).optional(),
  lines: z.array(lineItemSchema).optional(),
});

module.exports = {
  createQuotationTemplateSchema,
  updateQuotationTemplateSchema,
};

// OWNER: BE-1
// PURPOSE: Zod validation schemas for products and variants

const { z } = require('zod');

const variantSchema = z.object({
  id: z.number().optional(),
  attribute: z.string().min(1, 'Attribute name is required (e.g. Brand)'),
  value: z.string().min(1, 'Attribute value is required (e.g. Odoo)'),
  extraPrice: z.coerce.number().min(0, 'Extra price must be 0 or greater').default(0),
});

const createProductSchema = z.object({
  name: z.string().min(1, 'Product name is required'),
  type: z.string().min(1, 'Product type is required'),
  salesPrice: z.coerce.number().min(0, 'Sales price must be 0 or greater'),
  costPrice: z.coerce.number().min(0, 'Cost price must be 0 or greater'),
  notes: z.string().optional().nullable(),
  variants: z.array(variantSchema).optional().default([]),
});

const updateProductSchema = z.object({
  name: z.string().min(1).optional(),
  type: z.string().min(1).optional(),
  salesPrice: z.coerce.number().min(0).optional(),
  costPrice: z.coerce.number().min(0).optional(),
  notes: z.string().optional().nullable(),
  isActive: z.boolean().optional(),
  variants: z.array(variantSchema).optional(),
});

module.exports = {
  createProductSchema,
  updateProductSchema,
};

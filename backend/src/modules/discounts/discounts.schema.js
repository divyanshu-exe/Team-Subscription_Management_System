// OWNER: BE-1
// PURPOSE: Zod validation schemas for discounts

const { z } = require('zod');

const discountTypeEnum = z.enum(['FIXED', 'PERCENT']);
const appliesToEnum = z.enum(['PRODUCTS', 'SUBSCRIPTION']);

const createDiscountSchema = z
  .object({
    name: z.string().min(1, 'Discount name is required'),
    type: discountTypeEnum,
    value: z.coerce.number().min(0, 'Value must be greater than 0'),
    minPurchase: z.coerce.number().min(0).optional().nullable(),
    minQuantity: z.coerce.number().int().min(1).optional().nullable(),
    startDate: z.string().or(z.date()),
    endDate: z.string().or(z.date()),
    usageLimit: z.coerce.number().int().min(1, 'Usage limit must be at least 1'),
    appliesTo: appliesToEnum,
    productIds: z.array(z.coerce.number()).optional().default([]),
    isActive: z.boolean().optional().default(true),
  })
  .refine(
    (data) => {
      if (data.type === 'PERCENT') {
        return data.value >= 0 && data.value <= 100;
      }
      return data.value > 0;
    },
    {
      message: 'Percentage must be between 0 and 100, Fixed value must be greater than 0',
      path: ['value'],
    }
  )
  .refine(
    (data) => new Date(data.endDate) >= new Date(data.startDate),
    {
      message: 'endDate must be greater than or equal to startDate',
      path: ['endDate'],
    }
  )
  .refine(
    (data) => {
      if (data.appliesTo === 'PRODUCTS') {
        return Array.isArray(data.productIds) && data.productIds.length > 0;
      }
      return true;
    },
    {
      message: 'productIds are required when appliesTo is PRODUCTS',
      path: ['productIds'],
    }
  );

const updateDiscountSchema = z
  .object({
    name: z.string().min(1).optional(),
    type: discountTypeEnum.optional(),
    value: z.coerce.number().min(0).optional(),
    minPurchase: z.coerce.number().min(0).optional().nullable(),
    minQuantity: z.coerce.number().int().min(1).optional().nullable(),
    startDate: z.string().or(z.date()).optional(),
    endDate: z.string().or(z.date()).optional(),
    usageLimit: z.coerce.number().int().min(1).optional(),
    appliesTo: appliesToEnum.optional(),
    productIds: z.array(z.coerce.number()).optional(),
    isActive: z.boolean().optional(),
  })
  .refine(
    (data) => {
      if (data.type === 'PERCENT' && data.value !== undefined) {
        return data.value >= 0 && data.value <= 100;
      }
      if (data.type === 'FIXED' && data.value !== undefined) {
        return data.value > 0;
      }
      return true;
    },
    {
      message: 'Percentage must be between 0 and 100, Fixed value must be greater than 0',
      path: ['value'],
    }
  )
  .refine(
    (data) => {
      if (data.startDate && data.endDate) {
        return new Date(data.endDate) >= new Date(data.startDate);
      }
      return true;
    },
    {
      message: 'endDate must be greater than or equal to startDate',
      path: ['endDate'],
    }
  );

module.exports = {
  createDiscountSchema,
  updateDiscountSchema,
};

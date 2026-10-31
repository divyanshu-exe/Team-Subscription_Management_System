// OWNER: BE-1
// PURPOSE: Zod validation schemas for taxes

const { z } = require('zod');

const taxTypeEnum = z.enum(['PERCENT', 'FIXED']);

const createTaxSchema = z
  .object({
    name: z.string().min(1, 'Tax name is required'),
    type: taxTypeEnum,
    value: z.coerce.number().min(0, 'Tax value must be 0 or greater'),
    isActive: z.boolean().optional().default(true),
  })
  .refine(
    (data) => {
      if (data.type === 'PERCENT') {
        return data.value <= 100;
      }
      return true;
    },
    {
      message: 'Percentage tax value must be between 0 and 100',
      path: ['value'],
    }
  );

const updateTaxSchema = z
  .object({
    name: z.string().min(1).optional(),
    type: taxTypeEnum.optional(),
    value: z.coerce.number().min(0).optional(),
    isActive: z.boolean().optional(),
  })
  .refine(
    (data) => {
      if (data.type === 'PERCENT' && data.value !== undefined) {
        return data.value <= 100;
      }
      return true;
    },
    {
      message: 'Percentage tax value must be between 0 and 100',
      path: ['value'],
    }
  );

module.exports = {
  createTaxSchema,
  updateTaxSchema,
};

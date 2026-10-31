// OWNER: BE-1
// PURPOSE: Zod validation schemas for subscription plans

const { z } = require('zod');

const periodEnum = z.enum(['DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY']);

const createPlanSchema = z
  .object({
    name: z.string().min(1, 'Plan name is required'),
    price: z.coerce.number().min(0, 'Price must be 0 or greater'),
    period: periodEnum,
    minQuantity: z.coerce.number().int().min(1, 'Minimum quantity must be at least 1').default(1),
    availableFrom: z.string().or(z.date()),
    availableTo: z.string().or(z.date()),
    autoCloseAtEnd: z.boolean().optional().default(false),
    closableEarly: z.boolean().optional().default(false),
    pausable: z.boolean().optional().default(false),
    renewable: z.boolean().optional().default(false),
    isActive: z.boolean().optional().default(true),
  })
  .refine(
    (data) => new Date(data.availableTo) >= new Date(data.availableFrom),
    {
      message: 'availableTo must be greater than or equal to availableFrom',
      path: ['availableTo'],
    }
  );

const updatePlanSchema = z
  .object({
    name: z.string().min(1).optional(),
    price: z.coerce.number().min(0).optional(),
    period: periodEnum.optional(),
    minQuantity: z.coerce.number().int().min(1).optional(),
    availableFrom: z.string().or(z.date()).optional(),
    availableTo: z.string().or(z.date()).optional(),
    autoCloseAtEnd: z.boolean().optional(),
    closableEarly: z.boolean().optional(),
    pausable: z.boolean().optional(),
    renewable: z.boolean().optional(),
    isActive: z.boolean().optional(),
  })
  .refine(
    (data) => {
      if (data.availableFrom && data.availableTo) {
        return new Date(data.availableTo) >= new Date(data.availableFrom);
      }
      return true;
    },
    {
      message: 'availableTo must be greater than or equal to availableFrom',
      path: ['availableTo'],
    }
  );

module.exports = {
  createPlanSchema,
  updatePlanSchema,
};

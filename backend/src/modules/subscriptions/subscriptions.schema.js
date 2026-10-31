// OWNER: BE-2
// PURPOSE: Zod validation schemas for subscriptions

const { z } = require('zod');

const subscriptionLineSchema = z.object({
  id: z.number().optional(),
  productId: z.coerce.number().int().min(1, 'Product is required'),
  variantId: z.coerce.number().int().optional().nullable(),
  quantity: z.coerce.number().int().min(1, 'Quantity must be at least 1').default(1),
  taxId: z.coerce.number().int().optional().nullable(),
});

const createSubscriptionSchema = z
  .object({
    customerId: z.coerce.number().int().min(1, 'Customer is required'),
    planId: z.coerce.number().int().min(1, 'Plan is required'),
    templateId: z.coerce.number().int().optional().nullable(),
    startDate: z.string().or(z.date()),
    expiryDate: z.string().or(z.date()),
    paymentTerms: z.string().min(1, 'Payment terms is required'), // e.g. "Net 15" or "Immediate"
    paymentTermsDays: z.coerce.number().int().min(0).optional().default(15),
    lines: z.array(subscriptionLineSchema).optional(),
  })
  .refine(
    (data) => new Date(data.expiryDate) > new Date(data.startDate),
    {
      message: 'expiryDate must be strictly after startDate',
      path: ['expiryDate'],
    }
  );

const updateSubscriptionSchema = z.object({
  startDate: z.string().or(z.date()).optional(),
  expiryDate: z.string().or(z.date()).optional(),
  paymentTerms: z.string().optional(),
  paymentTermsDays: z.coerce.number().int().min(0).optional(),
  lines: z.array(subscriptionLineSchema).optional(),
});

const transitionSubscriptionSchema = z.object({
  to: z.enum(['QUOTATION', 'CONFIRMED', 'ACTIVE', 'CLOSED']),
});

module.exports = {
  createSubscriptionSchema,
  updateSubscriptionSchema,
  transitionSubscriptionSchema,
};

// OWNER: BE-2
// PURPOSE: [Invoice management, PDF, confirmation and cancellation] Zod validation schemas for request bodies/queries

const { z } = require('zod');

const listInvoicesQuerySchema = z.object({
  status: z.enum(['DRAFT', 'CONFIRMED', 'PAID', 'CANCELLED']).optional(),
  customerId: z.string().optional(),
  overdue: z.enum(['true', 'false']).optional(),
  from: z.string().optional(),
  to: z.string().optional(),
  page: z.string().optional(),
  limit: z.string().optional(),
});

module.exports = {
  listInvoicesQuerySchema,
};

// OWNER: BE-2
// PURPOSE: [Dashboard summary and overdue invoices] Zod schemas for query parameters

const { z } = require('zod');

const dashboardSummaryQuerySchema = z.object({
  from: z.string().optional(),
  to: z.string().optional(),
  customerId: z.string().optional(),
  planId: z.string().optional(),
});

const dashboardOverdueQuerySchema = z.object({
  customerId: z.string().optional(),
  page: z.string().optional(),
  limit: z.string().optional(),
});

module.exports = {
  dashboardSummaryQuerySchema,
  dashboardOverdueQuerySchema,
};

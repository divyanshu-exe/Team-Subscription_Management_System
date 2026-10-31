// OWNER: BE-2
// PURPOSE: [Payment recording, invoice balance update and settlement] Zod schemas

const { z } = require('zod');

const createPaymentSchema = z.object({
  invoiceId: z.number().int().positive(),
  method: z.enum(['CASH', 'CARD', 'BANK_TRANSFER', 'UPI', 'CHEQUE']),
  amount: z.number().positive(),
  paymentDate: z.string().optional(),
  note: z.string().max(500).optional(),
});

const listPaymentsQuerySchema = z.object({
  invoiceId: z.string().optional(),
  method: z.enum(['CASH', 'CARD', 'BANK_TRANSFER', 'UPI', 'CHEQUE']).optional(),
  from: z.string().optional(),
  to: z.string().optional(),
  page: z.string().optional(),
  limit: z.string().optional(),
});

module.exports = {
  createPaymentSchema,
  listPaymentsQuerySchema,
};

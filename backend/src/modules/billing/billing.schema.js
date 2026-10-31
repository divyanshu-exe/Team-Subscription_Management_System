// OWNER: BE-2
// PURPOSE: [Billing run endpoint and engine] Zod validation schemas for request bodies/queries

const { z } = require('zod');

const runBillingSchema = z.object({
  asOfDate: z.string().optional(),
});

module.exports = {
  runBillingSchema,
};

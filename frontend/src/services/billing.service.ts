// OWNER: FE-2
// PURPOSE: Typed API client for triggering the recurring billing engine (ADMIN only)

import api from '../lib/api';
import { BillingRunResult } from '../types';

export async function runBilling(asOfDate?: string): Promise<BillingRunResult> {
  return await api.post('/billing/run', { asOfDate });
}

// OWNER: FE-2
// PURPOSE: Guard against manual invoice creation (invoices only originate from automated recurring billing)

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '../../../../components/ui/Toast';

export default function NewInvoicePage() {
  const router = useRouter();
  const { addToast } = useToast();

  useEffect(() => {
    addToast('Invoices are created automatically by the recurring billing engine', 'info');
    router.replace('/invoices');
  }, [router, addToast]);

  return null;
}

// OWNER: FE-1
// PURPOSE: New tax rule creation screen (ADMIN only)

'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createTax } from '../../../../services/taxes.service';
import { TaxForm } from '../../../../components/forms/TaxForm';
import { useToast } from '../../../../components/ui/Toast';
import { RoleGuard } from '../../../../components/layout/RoleGuard';

export default function NewTaxPage() {
  const router = useRouter();
  const { success, error } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (data: any) => {
    setIsLoading(true);
    try {
      await createTax(data);
      success('Tax rule created successfully');
      router.push('/taxes');
    } catch (err: any) {
      error(err.message || 'Failed to create tax rule');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <RoleGuard roles={['ADMIN']}>
      <div className="space-y-6 max-w-2xl">
        <div className="flex items-center gap-3">
          <Link href="/taxes" className="text-sm font-medium text-slate-500 hover:text-slate-800">
            &larr; Back to Taxes
          </Link>
          <span className="text-slate-300">/</span>
          <h1 className="text-xl font-bold text-slate-900">New Tax Rule</h1>
        </div>

        <TaxForm onSubmit={handleSubmit} isLoading={isLoading} />
      </div>
    </RoleGuard>
  );
}

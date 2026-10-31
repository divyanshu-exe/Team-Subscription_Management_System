// OWNER: FE-1
// PURPOSE: Create discount page (ADMIN only)

'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { RoleGuard } from '../../../../components/layout/RoleGuard';
import { DiscountForm } from '../../../../components/forms/DiscountForm';
import { createDiscount } from '../../../../services/discounts.service';
import { useToast } from '../../../../components/ui/Toast';

export default function NewDiscountPage() {
  const router = useRouter();
  const { addToast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (data: any) => {
    setLoading(true);
    try {
      await createDiscount(data);
      addToast('Discount created successfully', 'success');
      router.push('/discounts');
    } catch (err: any) {
      addToast(err.message || 'Failed to create discount', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <RoleGuard roles={['ADMIN']}>
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">New Discount Rule</h1>
          <p className="text-sm text-slate-500">Create a promotional campaign or volume discount</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <DiscountForm onSubmit={handleSubmit} isLoading={loading} />
        </div>
      </div>
    </RoleGuard>
  );
}
